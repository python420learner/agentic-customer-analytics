type TrackEventInput = {
  anonymousId: string;
  userId?: string;
  sessionId?: string;
  eventName:
    | "page_view"
    | "product_view"
    | "search"
    | "add_to_cart"
    | "checkout_started"
    | "purchase";
  pageUrl?: string;
  productId?: string;
  category?: string;
  value?: number;
  metadata?: Record<string, unknown>;
};

type TrackerConfig = {
  apiUrl: string;
};

export function createTracker(config: TrackerConfig) {
  async function track(event: TrackEventInput) {
    try {
      const res = await fetch(`${config.apiUrl}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        console.error("Tracking failed:", error);
        return {
          success: false,
          error,
        };
      }

      return res.json();
    } catch (error) {
      console.error("Tracking request failed:", error);
      return {
        success: false,
        error,
      };
    }
  }

  return {
    track,
  };
}
