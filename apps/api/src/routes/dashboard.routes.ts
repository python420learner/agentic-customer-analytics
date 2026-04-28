import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export function createDashboardRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/summary", async (_req, res) => {
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
        success: true,
        data: {
          totalEvents,
          totalCustomers,
          cartAdds,
          purchases,
          revenue: revenue._sum.totalRevenue ?? 0,
          recentEvents,
        },
      });
    } catch (error) {
      console.error("Dashboard summary failed:", error);

      return res.status(500).json({
        success: false,
        error: "Dashboard summary failed",
      });
    }
  });

  return router;
}