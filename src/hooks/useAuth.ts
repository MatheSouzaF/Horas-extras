import { useEffect, useState } from "react";
import { ApiError, apiRequest, refreshSession } from "../services/api";
import type { AuthUser } from "../types";

const SESSION_STORAGE_KEY = "controle-mensal-horas-extras:session";

export type AuthSession = {
  user: AuthUser;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
};

const loadSession = (): AuthSession | null => {
  const saved = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown>;
    // Old format included token/refreshToken in localStorage — clear and force re-login
    // so the user gets proper httpOnly cookies on next login.
    if ("token" in parsed || "refreshToken" in parsed) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed as AuthSession;
  } catch {
    return null;
  }
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadSession(),
  );
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const requestWithRefresh = async <T,>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    if (!session) {
      throw new ApiError("Sessão inválida.", 401);
    }

    try {
      return await apiRequest<T>(path, options);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      try {
        const refreshed = await refreshSession<AuthUser>();
        const newSession: AuthSession = { user: refreshed.user };
        setSession(newSession);
        return apiRequest<T>(path, options);
      } catch {
        setSession(null);
        setAuthError("Sessão expirada. Faça login novamente.");
        throw new ApiError("Sessão expirada.", 401);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          deviceName: `Web-${navigator.platform || "unknown"}`,
        },
      });
      setSession({ user: response.user });
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erro ao entrar.");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    if (!name || !email || !password) {
      setAuthError("Preencha nome, email e senha.");
      return;
    }
    if (password.length < 8) {
      setAuthError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setAuthError("A senha deve conter pelo menos 1 número ou símbolo.");
      return;
    }
    try {
      await apiRequest<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      const loginResponse = await apiRequest<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setSession({ user: loginResponse.user });
      setAuthError("");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Erro ao cadastrar.",
      );
    }
  };

  const logout = async () => {
    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Best-effort — clear local session regardless
    }
    setSession(null);
  };

  return {
    session,
    setSession,
    authError,
    setAuthError,
    login,
    logout,
    register,
    requestWithRefresh,
  };
}
