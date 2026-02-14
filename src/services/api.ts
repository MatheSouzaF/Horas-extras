const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  token?: string;
  body?: unknown;
};

type RefreshResponse<TUser> = {
  token: string;
  refreshToken: string;
  user: TUser;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(data.message ?? "Erro na requisição", response.status);
  }

  return data as T;
}

export async function refreshSession<TUser>(
  refreshToken: string,
): Promise<RefreshResponse<TUser>> {
  return apiRequest<RefreshResponse<TUser>>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}
