import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification/notification.service";
import { message } from "antd";
import type { NotificationItem } from "../types/notification.types";

export interface FetchNotificationsResponse {
  items: NotificationItem[];
  pagination: {
    limit: number;
    page: number;
    pageCount: number;
  };
}

// Accept params such as page and limit
export function useNotifications(params: { page: number; limit: number }) {
  const queryClient = useQueryClient();
  const { page, limit } = params;

  const { data, isLoading, error } = useQuery<FetchNotificationsResponse>({
    // CRITICAL: include 'page' and 'limit' here so query automatically refetches on change
    queryKey: ["notifications", { page, limit }],
    queryFn: () => notificationService.getNotifications({ page, limit }),

    refetchInterval: (query) => {
      const stateData = query?.state?.data as FetchNotificationsResponse | undefined;
      const items = stateData?.items || [];
      const hasPendingItems = items.some((item) => (item.status || "").toLowerCase() === "pending");
      return hasPendingItems ? 5000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const createMutation = useMutation({
    mutationFn: (newNotif: Omit<NotificationItem, "id" | "createdAt" | "status">) =>
      notificationService.createNotification(newNotif),
    onSuccess: () => {
      // Invalidate all notifications cache blocks upon create
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      message.success("Notification successfully saved to backend!");
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
      message.error("Failed to persist notification on the server endpoint.");
    },
  });

  return {
    notifications: data || {
      items: [],
      pagination: { limit: 10, page: 1, pageCount: 0 },
    },
    loading: isLoading,
    error,
    createNotification: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
