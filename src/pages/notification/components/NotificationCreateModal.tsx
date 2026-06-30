import { Drawer, Form, Input, Button, Space } from "antd";
import type { NotificationItem } from "../../../types/notification.types";

interface NotificationCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (notification: Omit<NotificationItem, "id" | "createdAt" | "status">) => Promise<NotificationItem>;
  isPending?: boolean;
}

export default function NotificationCreateModal({
  open,
  onClose,
  onCreate,
  isPending = false,
}: NotificationCreateModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: { title: string; body: string }) => {
    try {
      await onCreate(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Submission failed inside modal context:", error);
    }
  };

  return (
    <Drawer
      title="Create New Notification"
      size="default" // Replaced strict pixel width with responsive sizing
      onClose={onClose}
      open={open}
      maskClosable={!isPending}
      footer={
        <Space>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            Submit
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical" // Keeps inputs perfectly stacked and bounded
        onFinish={handleSubmit}
        disabled={isPending}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a notification title" }]}
        >
          <Input placeholder="e.g., Welcome onboard!" />
        </Form.Item>

        <Form.Item
          name="body"
          label="Body Message"
          rules={[{ required: true, message: "Please enter the notification message" }]}
        >
          <Input.TextArea
            rows={8} // Sized appropriately for standard viewports
            placeholder="e.g., Your account layout has been initialized successfully."
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
