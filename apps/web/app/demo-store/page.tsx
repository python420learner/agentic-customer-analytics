"use client";

import { useEffect, useMemo, useState } from "react";
import { createTracker } from "@aca/events";
import {
  getOrCreateAnonymousId,
  getOrCreateSessionId,
} from "@/lib/browserIdentity";

const products = [
  {
    id: "sku-shoes-001",
    name: "Urban Runner Shoes",
    category: "Shoes",
    price: 2499,
    description: "Comfortable running shoes for daily wear.",
  },
  {
    id: "sku-watch-001",
    name: "Smart Fitness Watch",
    category: "Electronics",
    price: 3999,
    description: "Track steps, heart rate, and workouts.",
  },
  {
    id: "sku-bag-001",
    name: "Minimal Travel Backpack",
    category: "Bags",
    price: 1799,
    description: "Lightweight backpack for work and travel.",
  },
];

export default function DemoStorePage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [message, setMessage] = useState("");

  const tracker = useMemo(() => {
    return createTracker({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    });
  }, []);

  async function trackProductView(product: (typeof products)[number]) {
    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "product_view",
      pageUrl: "/demo-store",
      productId: product.id,
      category: product.category,
      value: product.price,
      metadata: {
        productName: product.name,
      },
    });
  }

  useEffect(() => {
    tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "page_view",
      pageUrl: "/demo-store",
      metadata: {
        pageName: "Demo Store",
      },
    });

    trackProductView(selectedProduct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectProduct(product: (typeof products)[number]) {
    setSelectedProduct(product);
    setMessage(`Viewed ${product.name}`);
    await trackProductView(product);
  }

  async function handleAddToCart() {
    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "add_to_cart",
      pageUrl: "/demo-store",
      productId: selectedProduct.id,
      category: selectedProduct.category,
      value: selectedProduct.price,
      metadata: {
        productName: selectedProduct.name,
      },
    });

    setMessage(`${selectedProduct.name} added to cart`);
  }

  async function handleCheckoutStarted() {
    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "checkout_started",
      pageUrl: "/demo-store/checkout",
      productId: selectedProduct.id,
      category: selectedProduct.category,
      value: selectedProduct.price,
      metadata: {
        productName: selectedProduct.name,
      },
    });

    setMessage(`Checkout started for ${selectedProduct.name}`);
  }

  async function handlePurchase() {
    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "purchase",
      pageUrl: "/demo-store/success",
      productId: selectedProduct.id,
      category: selectedProduct.category,
      value: selectedProduct.price,
      metadata: {
        productName: selectedProduct.name,
        paymentMethod: "demo",
      },
    });

    setMessage(`Purchase completed for ${selectedProduct.name}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-8 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <p className="mb-2 text-sm font-bold text-blue-600">
          Demo E-commerce Storefront
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Customer Event Tracking Demo
        </h1>

        <p className="mt-4 max-w-3xl text-slate-600">
          Use this page to simulate product views, cart additions, checkout
          starts, and purchases.
        </p>

        {message && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Products</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`rounded-3xl border p-5 text-left transition hover:border-blue-400 hover:bg-blue-50 ${
                    selectedProduct.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-sm text-slate-500">{product.category}</p>
                  <h3 className="mt-2 font-semibold">{product.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {product.description}
                  </p>
                  <p className="mt-4 text-lg font-bold">₹{product.price}</p>
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Selected Product</p>
            <h2 className="mt-2 text-2xl font-bold">{selectedProduct.name}</h2>
            <p className="mt-2 text-slate-600">
              {selectedProduct.description}
            </p>
            <p className="mt-5 text-3xl font-bold">₹{selectedProduct.price}</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Add to Cart
              </button>

              <button
                onClick={handleCheckoutStarted}
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50"
              >
                Start Checkout
              </button>

              <button
                onClick={handlePurchase}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Complete Purchase
              </button>
            </div>
          </aside>
        </div>

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50"
        >
          View Dashboard
        </a>
      </section>
    </main>
  );
}
