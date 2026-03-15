// In dev, Vite proxies /auth and /hours to localhost:3333.
// In production, set VITE_API_URL if the API is on a different origin.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

export async function refreshSession<TUser>(): Promise<{ user: TUser }> {
  return apiRequest<{ user: TUser }>("/auth/refresh", { method: "POST" });
}
