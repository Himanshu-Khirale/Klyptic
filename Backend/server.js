import { createApp } from "./app.js";
import { env } from "./src/config/env.js";
import { connectDatabase, registerDatabaseEvents } from "./src/config/db.js";

async function bootstrap() {
  registerDatabaseEvents();
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[klyptic] Express listening on http://localhost:${env.PORT}`);
    console.log(`[klyptic] env=${env.NODE_ENV} cors=${env.CORS_ORIGIN}`);
    console.log(`[klyptic] ai-engine=${env.AI_ENGINE_URL}`);
  });

  const shutdown = (signal) => {
    console.log(`[klyptic] ${signal} received — shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[klyptic] failed to start:", err);
  process.exit(1);
});
