import { useState } from "react";
import { Button, Card, Typography, Layout, Table, Tag, Input, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import NotificationCreateModal from "./components/NotificationCreateModal";
import NotificationDetailsModal from "./components/NotificationDetailsModal";
import type { NotificationItem } from "../../types/notification.types";
import { useNotifications } from "../../hooks/useNotification";

const { Header, Content } = Layout;
const { Title, Link, Text } = Typography;

export default function NotificationPage() {
  const { notifications, loading, createNotification, isCreating } = useNotifications();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleCreateNotification = async (newNotif: Omit<NotificationItem, "id" | "createdAt">) => {
    await createNotification(newNotif);
  };

  const truncateBody = (text: string) => {
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: NotificationItem["status"]) => {
        let color = "processing";
        if (status === "success") color = "success";
        if (status === "fail") color = "error";
        return <Tag color={color}>{(status || "PENDING").toUpperCase()}</Tag>;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder="Search title..."
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
      onFilter: (value, record) => record.title.toLowerCase().includes((value as string).toLowerCase()),
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
    },
  ];

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
            dataSource={notifications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              position: ["bottomRight"],
            }}
          />
        </Card>
      </Content>

      <NotificationCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createNotification}
        isPending={isCreating} // Wire up tracking flag
      />

      <NotificationDetailsModal
        open={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </Layout>
  );
}
