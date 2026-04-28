import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { createEventsRouter } from "./routes/events.routes";
import { createDashboardRouter } from "./routes/dashboard.routes";
import { createAgentsRouter } from "./routes/agents.routes";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

async function main() {
  const { prisma } = await import("@aca/database");

  const app = express();

  app.use(cors());
  app.use(express.json());
  
  const PORT = process.env.API_PORT || 4000;
  
  app.get("/health", (_req, res) => {
      res.json({
          success: true,
          status: "ok",
          service: "aca-api",
        });
    });
    
    app.use("/events", createEventsRouter(prisma));
    app.use("/dashboard", createDashboardRouter(prisma));
    app.use("/agents", createAgentsRouter(prisma));

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});