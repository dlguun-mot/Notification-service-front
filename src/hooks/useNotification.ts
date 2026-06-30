import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification/notification.service";
import { message } from "antd";
import type { NotificationItem } from "../types/notification.types";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationService.getNotifications({ limit: 10 }),
  });

  // Change Omit<NotificationItem, "id" | "createdAt">
  // To include | "status" inside the variables definition argument:
  const createMutation = useMutation({
    mutationFn: (newNotif: Omit<NotificationItem, "id" | "createdAt" | "status">) =>
      notificationService.createNotification(newNotif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      message.success("Notification successfully saved to backend!");
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
      message.error("Failed to persist notification on the server endpoint.");
    },
  });

  return {
    notifications: data?.items || [],
    loading: isLoading,
    error,
    createNotification: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
