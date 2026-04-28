import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

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
      status: "ok",
      service: "aca-api",
    });
  });

  app.post("/events", async (req, res) => {
    try {
      const {
        anonymousId,
        userId,
        sessionId,
        eventName,
        pageUrl,
        productId,
        category,
        value,
        metadata,
      } = req.body;

      if (!anonymousId || !eventName) {
        return res.status(400).json({
          success: false,
          error: "anonymousId and eventName are required",
        });
      }

      const event = await prisma.customerEvent.create({
        data: {
          anonymousId,
          userId,
          sessionId,
          eventName,
          pageUrl,
          productId,
          category,
          value,
          metadata,
        },
      });

      await prisma.customerProfile.upsert({
        where: {
          anonymousId,
        },
        update: {
          userId,
          lastSeenAt: new Date(),
          totalEvents: {
            increment: 1,
          },
          totalCartAdds:
            eventName === "add_to_cart"
              ? {
                  increment: 1,
                }
              : undefined,
          totalPurchases:
            eventName === "purchase"
              ? {
                  increment: 1,
                }
              : undefined,
          totalRevenue:
            eventName === "purchase" && typeof value === "number"
              ? {
                  increment: value,
                }
              : undefined,
        },
        create: {
          anonymousId,
          userId,
          totalEvents: 1,
          totalCartAdds: eventName === "add_to_cart" ? 1 : 0,
          totalPurchases: eventName === "purchase" ? 1 : 0,
          totalRevenue:
            eventName === "purchase" && typeof value === "number" ? value : 0,
        },
      });

      return res.status(201).json({
        success: true,
        eventId: event.id,
      });
    } catch (error) {
      console.error("Event ingestion failed:", error);

      return res.status(500).json({
        success: false,
        error: "Event ingestion failed",
      });
    }
  });

  app.get("/dashboard/summary", async (_req, res) => {
    try {
      const [
        totalEvents,
        totalCustomers,
        cartAdds,
        purchases,
        revenue,
        recentEvents,
      ] = await Promise.all([
        prisma.customerEvent.count(),
        prisma.customerProfile.count(),
        prisma.customerEvent.count({
          where: { eventName: "add_to_cart" },
        }),
        prisma.customerEvent.count({
          where: { eventName: "purchase" },
        }),
        prisma.customerProfile.aggregate({
          _sum: {
            totalRevenue: true,
          },
        }),
        prisma.customerEvent.findMany({
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        }),
      ]);

      return res.json({
        totalEvents,
        totalCustomers,
        cartAdds,
        purchases,
        revenue: revenue._sum.totalRevenue ?? 0,
        recentEvents,
      });
    } catch (error) {
      console.error("Dashboard summary failed:", error);

      return res.status(500).json({
        success: false,
        error: "Dashboard summary failed",
      });
    }
  });

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("API startup failed:", error);
  process.exit(1);
});
