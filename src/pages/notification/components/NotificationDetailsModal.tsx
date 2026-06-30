import { Drawer, Descriptions, Tag } from "antd";
import type { NotificationItem } from "../../../types/notification.types";

interface NotificationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
}

export default function NotificationDetailsModal({ open, onClose, notification }: NotificationDetailsModalProps) {
  if (!notification) return null;

  let tagColor = "processing";
  if (notification.status === "success") tagColor = "success";
  if (notification.status === "fail") tagColor = "error";

  return (
    <Drawer
      title="Notification Details"
      size="default" // Uses standard responsive layout dimensions
      onClose={onClose}
      open={open}
    >
      <Descriptions
        column={1}
        bordered
        layout="vertical" // Stack labels on top of content to prevent horizontal overflow
      >
        <Descriptions.Item label="Title">
          <strong>{notification.title}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={tagColor}>{(notification.status || "PENDING").toUpperCase()}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">{notification.createdAt}</Descriptions.Item>

        <Descriptions.Item label="Full Message">
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{notification.body}</div>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
}
