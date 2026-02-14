import type { Request } from "express";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  tokenType: "refresh";
};

export type AuthRequest = Request & {
  user?: AuthTokenPayload;
};
