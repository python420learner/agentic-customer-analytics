export const CUSTOMER_EVENTS = {
  PRODUCT_VIEW: "product_view",
  ADD_TO_CART: "add_to_cart",
  CHECKOUT_STARTED: "checkout_started",
  PURCHASE: "purchase",
  SEARCH: "search",
  PAGE_VIEW: "page_view",
} as const;

export type CustomerEventName =
  (typeof CUSTOMER_EVENTS)[keyof typeof CUSTOMER_EVENTS];