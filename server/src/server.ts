import { env } from "./config/env.js";
import { app } from "./app.js";
import { ensureHoursSchema } from "./lib/prisma.js";

const startServer = async () => {
  try {
    await ensureHoursSchema();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao sincronizar schema do banco:", error);
    process.exit(1);
  }
};

void startServer();
