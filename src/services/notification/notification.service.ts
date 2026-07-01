import { NOTIFICATION_PATHS } from "./notification.paths";
import type { NotificationItem } from "../../types/notification.types";
import { httpHandler } from "../../api/httpHandler";

export interface FetchNotificationsParams {
  limit?: number;
  page?: number;
  title?: string;
}

// FIXED: Aligned perfectly with your backend's exact curl payload metadata structure
export interface FetchNotificationsResponse {
  items: NotificationItem[];
  pagination: {
    limit: number;
    page: number;
    pageCount: number;
  };
}

/**
 * Shared structural data adapter mapper utility
 */
const mapToFrontendModel = (item: any): NotificationItem => {
  // FIXED: Standardized fallback using the actual backend casing style ("Success", "Fail", "Pending")
  let resolvedStatus: NotificationItem["status"] = "Pending";
  const backendStatus = (item.status || "").toLowerCase();

  if (backendStatus === "success") resolvedStatus = "Success";
  else if (backendStatus === "pending") resolvedStatus = "Pending";
  else if (backendStatus === "fail") resolvedStatus = "Fail";

  const rawDate = item.createdAt || item.updatedAt || new Date().toISOString();
  const formattedDate = rawDate.replace("T", " ").substring(0, 19);

  return {
    id: item.id,
    title: item.title || `Status Alert (${resolvedStatus})`,
    body: item.body || `The transaction state shifted to ${resolvedStatus}.`,
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

    // FIXED: Correctly pass down the original pagination block to feed TanStack Query and AntD components
    return {
      items: (data?.items || []).map(mapToFrontendModel),
      pagination: data?.pagination || {
        limit: Number(limit),
        page: Number(page),
        pageCount: 1,
      },
    };
  },

  /**
   * Dispatches and saves a new notification item record using the httpHandler
   */
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
