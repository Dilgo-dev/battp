export interface HttpRequest {
  id: number;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  params: Record<string, string>;
  favorite: boolean;
  createdAt: string;
}

export interface HttpResponse {
  status: number;
  status_text: string;
  headers: Record<string, string>;
  body: string;
  time_ms: number;
  size: number;
}

export interface HttpError {
  error: string;
  details?: string;
  message?: string;
}

export interface RequestFormData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  params: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type TabType = 'headers' | 'body' | 'params';

export type ResponseTabType = 'body' | 'headers';

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  syncPath?: string;
}

export interface WorkspaceData {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  requestsByWorkspace: Record<string, HttpRequest[]>;
  selectedRequestIdByWorkspace: Record<string, number | null>;
}

export interface WorkspaceFile {
  name: string;
  requests: HttpRequest[];
  selectedRequestId: number | null;
  createdAt: string;
  version: string;
}