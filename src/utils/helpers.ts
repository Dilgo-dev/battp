import { HttpMethod } from '../types';

export const getMethodColor = (method: HttpMethod): string => {
  switch (method) {
    case "GET":
      return "text-green-500";
    case "POST":
      return "text-blue-500";
    case "PUT":
      return "text-yellow-500";
    case "DELETE":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warning";
  if (status >= 500) return "text-destructive";
  return "text-muted-foreground";
};

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const formatResponseBody = (body: string): string => {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

export const generateRequestId = (): number => {
  return Date.now();
};

export const createEmptyRequest = (id: number) => ({
  id,
  name: "Untitled Request",
  method: "GET" as HttpMethod,
  url: "",
  headers: { "Content-Type": "application/json" },
  body: "",
  params: {},
  favorite: false,
  createdAt: new Date().toISOString(),
});