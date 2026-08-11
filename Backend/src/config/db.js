import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== "production",
  });

  return mongoose.connection;
}

export function registerDatabaseEvents() {
  mongoose.connection.on("connected", () => {
    console.log("[mongo] connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[mongo] connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] disconnected");
  });
}
