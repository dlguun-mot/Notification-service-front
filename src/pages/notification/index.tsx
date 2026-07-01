import { useState } from "react";
import { Button, Card, Typography, Layout, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import NotificationCreateModal from "./components/NotificationCreateModal";
import NotificationDetailsModal from "./components/NotificationDetailsModal";
import type { NotificationItem } from "../../types/notification.types";
import { useNotifications } from "../../hooks/useNotification";

const { Header, Content } = Layout;
const { Title, Link, Text } = Typography;

export default function NotificationPage() {
  // 1. Establish state configurations tracking pagination position
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 2. Feed parameters continuously down into the active hook pipeline
  const { notifications, loading, createNotification, isCreating } = useNotifications({
    page: currentPage,
    limit: pageSize,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const truncateBody = (text: string) => {
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        let color = "processing";
        const normalizedStatus = (status || "").toLowerCase();
        if (normalizedStatus === "success") color = "success";
        if (normalizedStatus === "fail") color = "error";
        return <Tag color={color}>{(status || "PENDING").toUpperCase()}</Tag>;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text: string, record: NotificationItem) => (
        <Link onClick={() => setSelectedNotification(record)} style={{ fontWeight: 600 }}>
          {text}
        </Link>
      ),
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      render: (text: string) => <Text type="secondary">{truncateBody(text || "")}</Text>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleString() : "-"),
    },
  ];

  const tableData = notifications?.items || [];
  const paginationMeta = notifications?.pagination;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Notification Service Management
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)}>
          Create Notification
        </Button>
      </Header>

      <Content style={{ padding: "24px" }}>
        <Card title="Notifications Panel" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              position: ["bottomRight"],
              // Deriving total backend rows matching paginationMeta layout definitions
              total: paginationMeta ? paginationMeta.pageCount * paginationMeta.limit : 0,
            }}
            // 3. Capture page transitions from Ant Design and apply updates safely
            onChange={(pagination) => {
              if (pagination.current) setCurrentPage(pagination.current);
              if (pagination.pageSize) setPageSize(pagination.pageSize);
            }}
          />
        </Card>
      </Content>

      <NotificationCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createNotification}
        isPending={isCreating}
      />

      <NotificationDetailsModal
        open={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </Layout>
  );
}
