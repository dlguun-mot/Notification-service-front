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
    // Smart Polling Logic: check if any item in current state is 'pending'
    refetchInterval: (query) => {
      const items: NotificationItem[] = query?.state?.data?.items || [];
      const hasPendingItems = items.some((item) => item.status === "pending");

      // Poll every 3 seconds if items are pending; otherwise, turn polling off (false)
      return hasPendingItems ? 5000 : false;
    },
    // Keep pulling in background smoothly without re-triggering visual table loading spinners
    refetchIntervalInBackground: true,
  });

  const createMutation = useMutation({
    mutationFn: (newNotif: Omit<NotificationItem, "id" | "createdAt" | "status">) =>
      notificationService.createNotification(newNotif),
    onSuccess: () => {
      // Immediately pull fresh table data upon completing creation mutation
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
