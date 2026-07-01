export type NotificationType = "success" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  status: "Success" | "Fail" | "Pending";
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  limit: number;
  page: number;
  pageCount: number;
}

// Ensure this matches what your backend returns!
export interface FetchNotificationsResponse {
  items: NotificationItem[];
  pagination: PaginationMeta;
}
