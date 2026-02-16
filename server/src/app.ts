import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { hoursRoutes } from "./routes/hours.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  return response.status(200).json({ online: true, app: "wmeter" });
});

app.get("/health", (_request, response) => {
  return response.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/hours", hoursRoutes);
