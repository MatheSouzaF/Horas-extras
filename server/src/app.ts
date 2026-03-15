import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth.routes.js";
import { hoursRoutes } from "./modules/hours/hours.routes.js";

export const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL ?? "http://localhost:5173"
        : "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (_request, response) => {
  return response.status(200).json({ online: true, app: "wmeter" });
});

app.get("/health", (_request, response) => {
  return response.status(200).json({ status: "ok" });
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
app.use("/auth", authRoutes);
app.use("/hours", hoursRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON inválido no corpo da requisição." });
  }
  console.error(err);
  return res.status(500).json({ message: "Erro interno do servidor." });
});
