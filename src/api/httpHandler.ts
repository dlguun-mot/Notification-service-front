const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/local";
interface RequestOptions extends RequestInit {
  bodyData?: any;
}

/**
 * Centralized HTTP Client handler to make fetch requests simple and uniform
 */
export const httpHandler = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { bodyData, headers, ...customConfig } = options;

  // Format full destination URL safely
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (bodyData) {
    config.body = JSON.stringify(bodyData);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    // Return json typed layout parsed directly from server payload
    return (await response.json()) as T;
  } catch (error) {
    console.error(`API execution error on target destination [${url}]:`, error);
    throw error;
  }
};
