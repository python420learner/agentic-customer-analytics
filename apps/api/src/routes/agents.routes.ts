import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export function createAgentsRouter(prisma: PrismaClient) {
  const router = Router();

  router.post("/cart-abandonment/run", async (_req, res) => {
    try {
      const cartEvents = await prisma.customerEvent.findMany({
        where: {
          eventName: "add_to_cart",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });

      let createdActions = 0;
      let skippedPurchased = 0;
      let skippedExisting = 0;

      for (const cartEvent of cartEvents) {
        const purchaseAfterCart = await prisma.customerEvent.findFirst({
          where: {
            anonymousId: cartEvent.anonymousId,
            eventName: "purchase",
            createdAt: {
              gt: cartEvent.createdAt,
            },
          },
        });

        if (purchaseAfterCart) {
          skippedPurchased++;
          continue;
        }

        const existingActions = await prisma.agentAction.findMany({
          where: {
            agentName: "cart_abandonment_agent",
            actionType: "send_recovery_offer",
            anonymousId: cartEvent.anonymousId,
          },
        });

        const existingActionForCartEvent = existingActions.some((action) => {
          if (
            !action.metadata ||
            typeof action.metadata !== "object" ||
            Array.isArray(action.metadata)
          ) {
            return false;
          }

          return action.metadata.cartEventId === cartEvent.id;
        });

        if (existingActionForCartEvent) {
          skippedExisting++;
          continue;
        }

        await prisma.agentAction.create({
          data: {
            agentName: "cart_abandonment_agent",
            actionType: "send_recovery_offer",
            anonymousId: cartEvent.anonymousId,
            userId: cartEvent.userId,
            reason:
              "Customer added product to cart but has not completed purchase.",
            status: "pending",
            metadata: {
              cartEventId: cartEvent.id,
              productId: cartEvent.productId,
              category: cartEvent.category,
              cartValue: cartEvent.value,
              cartTime: cartEvent.createdAt,
              inferredIntent: "cart_abandonment",
            },
          },
        });

        createdActions++;
      }

      return res.json({
        success: true,
        data: {
          checkedCartEvents: cartEvents.length,
          createdActions,
          skippedExisting,
          skippedPurchased,
        },
      });
    } catch (error) {
      console.error("Cart abandonment agent failed:", error);

      return res.status(500).json({
        success: false,
        error: "Cart abandonment agent failed",
      });
    }
  });

  router.get("/actions", async (_req, res) => {
    try {
      const actions = await prisma.agentAction.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

      return res.json({
        success: true,
        data: actions,
      });
    } catch (error) {
      console.error("Agent actions fetch failed:", error);

      return res.status(500).json({
        success: false,
        error: "Agent actions fetch failed",
      });
    }
  });

  router.patch("/actions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ["pending", "approved", "executed", "dismissed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status",
        });
      }

      const action = await prisma.agentAction.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        data: action,
      });
    } catch (error) {
      console.error("Agent action status update failed:", error);

      return res.status(500).json({
        success: false,
        error: "Agent action status update failed",
      });
    }
  });

  return router;
}
