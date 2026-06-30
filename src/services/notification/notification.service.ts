import { NOTIFICATION_PATHS } from "./notification.paths";
import type { NotificationItem } from "../../types/notification.types";
import { httpHandler } from "../../api/httpHandler";

export interface FetchNotificationsParams {
  limit?: number;
  page?: number;
  title?: string;
}

export interface FetchNotificationsResponse {
  items: NotificationItem[];
  hasMore: boolean;
}

/**
 * Shared structural data adapter mapper utility
 */
const mapToFrontendModel = (item: any): NotificationItem => {
  let resolvedStatus: NotificationItem["status"] = "pending";
  const backendStatus = item.status?.toLowerCase();

  if (backendStatus === "success") resolvedStatus = "success";
  else if (backendStatus === "pending") resolvedStatus = "pending";
  else if (backendStatus === "fail") resolvedStatus = "fail";

  const rawDate = item.createdAt || item.updatedAt || new Date().toISOString();
  const formattedDate = rawDate.replace("T", " ").substring(0, 19);

  return {
    id: item.id,
    title: item.title || `Status Alert (${item.status})`,
    body: item.body || `The transaction state shifted to ${item.status}.`,
    status: resolvedStatus,
    createdAt: formattedDate,
  };
};

export const notificationService = {
  /**
   * Fetches paginated notifications list using the centralized httpHandler
   */
  getNotifications: async (params: FetchNotificationsParams = {}): Promise<FetchNotificationsResponse> => {
    const { limit = 10, page = 1, title } = params;

    const urlParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });

    if (title) {
      urlParams.append("title", title);
    }

    // Execute typed target payload lookup request cleanly
    const data = await httpHandler<any>(`${NOTIFICATION_PATHS.BASE}?${urlParams.toString()}`);

    return {
      items: (data.items || []).map(mapToFrontendModel),
      hasMore: data.pagination?.hasMore || false,
    };
  },

  /**
   * Dispatches and saves a new notification item record using the httpHandler
   */
  //  Updated signature omitting "status" entirely
  createNotification: async (
    payload: Omit<NotificationItem, "id" | "createdAt" | "status">,
  ): Promise<NotificationItem> => {
    const data = await httpHandler<any>(NOTIFICATION_PATHS.BASE, {
      method: "POST",
      bodyData: {
        title: payload.title,
        body: payload.body,
        // No status passed here because, as shown in your curl test,
        // the backend sets it to "Pending" automatically.
      },
    });

    return mapToFrontendModel(data);
  },
};
