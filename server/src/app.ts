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

app.post("/deploy", (request, response) => {
  const githubEvent = request.header("X-GitHub-Event");

  if (githubEvent !== "push") {
    return response.status(202).json({
      accepted: false,
      reason: "Evento ignorado",
      event: githubEvent ?? "unknown",
    });
  }

  const body = request.body as { ref?: string; after?: string };
  const ref = body?.ref;

  if (ref !== "refs/heads/main") {
    return response.status(202).json({
      accepted: false,
      reason: "Branch ignorada",
      ref: ref ?? "unknown",
    });
  }

  return response.status(200).json({
    accepted: true,
    event: "push",
    ref,
    commit: body?.after ?? "unknown",
  });
});
app.get("/health", (_request, response) => {
  return response.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/hours", hoursRoutes);
