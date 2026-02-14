import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthRequest, AuthTokenPayload } from "../types/auth.js";

export function ensureAuth(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "Token não informado." });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return response.status(401).json({ message: "Token inválido." });
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
