import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthRequest, AuthTokenPayload } from "../types/auth.js";

export function ensureAuth(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
) {
  const cookieToken = (request.cookies as Record<string, string | undefined>)
    .access_token;

  // Fallback to Authorization header (for API clients / backwards compat)
  const authHeader = request.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const token = cookieToken ?? headerToken;

  if (!token) {
    return response.status(401).json({ message: "Token não informado." });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    request.user = payload;
    next();
  } catch {
    return response
      .status(401)
      .json({ message: "Token expirado ou inválido." });
  }
}
