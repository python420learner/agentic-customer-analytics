import { z } from "zod";

export const customerEventSchema = z.object({
  anonymousId: z.string().min(1),
  userId: z.string().optional(),
  sessionId: z.string().optional(),

  eventName: z.enum([
    "page_view",
    "product_view",
    "search",
    "add_to_cart",
    "checkout_started",
    "purchase",
  ]),

  pageUrl: z.string().optional(),
  productId: z.string().optional(),
  category: z.string().optional(),
  value: z.number().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});