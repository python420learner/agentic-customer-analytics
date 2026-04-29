import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { customerEventSchema } from "../schemas/event.schema";

export function createEventsRouter(prisma: PrismaClient) {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      const data = customerEventSchema.parse(req.body);

      const event = await prisma.customerEvent.create({
        data: {
          anonymousId: data.anonymousId,
          userId: data.userId,
          sessionId: data.sessionId,
          eventName: data.eventName,
          pageUrl: data.pageUrl,
          productId: data.productId,
          category: data.category,
          value: data.value,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      await prisma.customerProfile.upsert({
        where: {
          anonymousId: data.anonymousId,
        },
        update: {
          userId: data.userId,
          lastSeenAt: new Date(),
          totalEvents: { increment: 1 },
          totalCartAdds:
            data.eventName === "add_to_cart" ? { increment: 1 } : undefined,
          totalPurchases:
            data.eventName === "purchase" ? { increment: 1 } : undefined,
          totalRevenue:
            data.eventName === "purchase" && typeof data.value === "number"
              ? { increment: data.value }
              : undefined,
        },
        create: {
          anonymousId: data.anonymousId,
          userId: data.userId,
          totalEvents: 1,
          totalCartAdds: data.eventName === "add_to_cart" ? 1 : 0,
          totalPurchases: data.eventName === "purchase" ? 1 : 0,
          totalRevenue:
            data.eventName === "purchase" && typeof data.value === "number"
              ? data.value
              : 0,
        },
      });

      return res.status(201).json({
        success: true,
        eventId: event.id,
      });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          issues: error.issues,
        });
      }

      console.error("Event ingestion failed:", error);

      return res.status(500).json({
        success: false,
        error: "Event ingestion failed",
      });
    }
  });

  return router;
}
