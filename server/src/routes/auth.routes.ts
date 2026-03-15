import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ensureAuth } from "../middlewares/ensure-auth.js";
import type {
  AuthRequest,
  AuthTokenPayload,
  RefreshTokenPayload,
} from "../types/auth.js";

const authRoutes = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.email("Email inválido").toLowerCase(),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(
      /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Senha deve conter pelo menos 1 número ou símbolo",
    ),
});

const loginSchema = z.object({
  email: z.email("Email inválido").toLowerCase(),
  password: z.string().min(1, "Senha obrigatória"),
  deviceName: z.string().trim().min(1).max(100).optional(),
});


const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const isProduction = process.env.NODE_ENV === "production";
const refreshCookiePath = process.env.REFRESH_COOKIE_PATH ?? "/auth/refresh";

const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshTokenValue: string,
) => {
  response.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  response.cookie("refresh_token", refreshTokenValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: refreshCookiePath,
  });
};

const getTokenExpirationDate = (token: string): Date => {
  const decoded = jwt.decode(token) as { exp?: number } | null;

  if (!decoded?.exp) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(decoded.exp * 1000);
};

const extractRequestMetadata = (request: Request) => {
  const rawDeviceName = request.headers["x-device-name"];
  const deviceName =
    typeof rawDeviceName === "string"
      ? rawDeviceName
      : Array.isArray(rawDeviceName)
        ? rawDeviceName[0]
        : undefined;

  const ipAddress =
    request.ip ??
    (typeof request.headers["x-forwarded-for"] === "string"
      ? request.headers["x-forwarded-for"].split(",")[0]?.trim()
      : undefined);

  return {
    deviceName,
    userAgent:
      typeof request.headers["user-agent"] === "string"
        ? request.headers["user-agent"]
        : null,
    ipAddress: ipAddress ?? null,
  };
};

const createSessionRefreshToken = async (
  userId: string,
  metadata: {
    deviceName?: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  },
) => {
  const refreshSession = await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: "",
      deviceName: metadata.deviceName ?? null,
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
      expiresAt: new Date(),
    },
  });

  const jwtOptions: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };

  const payload: RefreshTokenPayload = {
    sub: userId,
    sid: refreshSession.id,
    tokenType: "refresh",
  };

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, jwtOptions);

  await prisma.refreshSession.update({
    where: { id: refreshSession.id },
    data: {
      tokenHash: hashToken(refreshToken),
      expiresAt: getTokenExpirationDate(refreshToken),
      lastUsedAt: new Date(),
    },
  });

  return refreshToken;
};

const buildAccessToken = (payload: AuthTokenPayload) => {
  const jwtOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, jwtOptions);
};

authRoutes.post("/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return response.status(409).json({ message: "Email já cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return response.status(201).json({ user });
});

authRoutes.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: parsed.error.flatten() });
  }

  const { email, password, deviceName } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return response.status(401).json({ message: "Credenciais inválidas." });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return response.status(401).json({ message: "Credenciais inválidas." });
  }

  const tokenPayload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };

  const token = buildAccessToken(tokenPayload);
  const requestMetadata = extractRequestMetadata(request);
  const refreshToken = await createSessionRefreshToken(user.id, {
    ...requestMetadata,
    deviceName: deviceName ?? requestMetadata.deviceName,
  });

  setAuthCookies(response, token, refreshToken);

  return response.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

authRoutes.post("/refresh", async (request, response) => {
  const refreshToken =
    (request.cookies as Record<string, string | undefined>).refresh_token;

  if (!refreshToken) {
    return response.status(401).json({ message: "Refresh token não encontrado." });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as RefreshTokenPayload;

    if (payload.tokenType !== "refresh") {
      return response.status(401).json({ message: "Refresh token inválido." });
    }

    const refreshSession = await prisma.refreshSession.findUnique({
      where: { id: payload.sid },
    });

    if (
      !refreshSession ||
      refreshSession.userId !== payload.sub ||
      refreshSession.revokedAt ||
      refreshSession.expiresAt <= new Date() ||
      refreshSession.tokenHash !== hashToken(refreshToken)
    ) {
      return response.status(401).json({ message: "Sessão inválida." });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return response.status(401).json({ message: "Usuário inválido." });
    }

    const tokenPayload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const newAccessToken = buildAccessToken(tokenPayload);

    // Revoke current session and issue a fresh one (true token rotation)
    await prisma.refreshSession.update({
      where: { id: refreshSession.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = await createSessionRefreshToken(user.id, {
      deviceName: refreshSession.deviceName ?? undefined,
      userAgent: refreshSession.userAgent,
      ipAddress: refreshSession.ipAddress,
    });

    setAuthCookies(response, newAccessToken, newRefreshToken);

    return response.status(200).json({ user });
  } catch {
    return response
      .status(401)
      .json({ message: "Refresh token expirado ou inválido." });
  }
});

authRoutes.post("/logout", async (request, response) => {
  const refreshToken =
    (request.cookies as Record<string, string | undefined>).refresh_token;

  const clearCookies = () => {
    response.clearCookie("access_token");
    response.clearCookie("refresh_token", { path: refreshCookiePath });
  };

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET,
      ) as RefreshTokenPayload;

      if (payload.tokenType === "refresh") {
        await prisma.refreshSession.updateMany({
          where: {
            id: payload.sid,
            userId: payload.sub,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Token already invalid — just clear cookies
    }
  }

  clearCookies();
  return response.status(200).json({ message: "Logout concluído." });
});

authRoutes.post(
  "/logout-all",
  ensureAuth,
  async (request: AuthRequest, response) => {
    const userId = request.user?.sub;

    if (!userId) {
      return response.status(401).json({ message: "Não autenticado." });
    }

    await prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return response.status(200).json({ message: "Logout global concluído." });
  },
);

authRoutes.get("/me", ensureAuth, async (request: AuthRequest, response) => {
  const userId = request.user?.sub;

  if (!userId) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    return response.status(404).json({ message: "Usuário não encontrado." });
  }

  return response.status(200).json({ user });
});

export { authRoutes };
