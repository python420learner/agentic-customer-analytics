"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createTracker } from "@aca/events";
import {
  getOrCreateAnonymousId,
  getOrCreateSessionId,
} from "@/lib/browserIdentity";

const featuredWatchImage =
  "https://www.figma.com/api/mcp/asset/70187bde-7fc2-4203-b1c9-20638769fa2e";
const gSteelImage =
  "https://www.figma.com/api/mcp/asset/d1a5a434-84c6-4f79-8b54-95d471781247";
const edificeImage =
  "https://www.figma.com/api/mcp/asset/9609f2f6-d0ee-4598-a1a7-a2f14ac74c43";
const proTrekImage =
  "https://www.figma.com/api/mcp/asset/a2c26f0b-a6c4-442d-8d92-03a269d04790";
const cartStorageKey = "kasio_demo_cart";

type Product = {
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  image: string;
  sale?: boolean;
  outOfStock?: boolean;
  description: string;
  story: string;
  specs: Array<[string, string]>;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const products: Product[] = [
  {
    id: "kasio-gsteel-classic",
    name: "G-Steel Classic",
    collection: "G-Steel",
    category: "Luxury",
    price: 299,
    compareAt: 399,
    rating: 4.8,
    image: gSteelImage,
    sale: true,
    description:
      "A refined steel chronograph built for daily precision, quiet confidence, and a sharp evening profile.",
    story:
      "The G-Steel Classic pairs a brushed stainless body with a deep blue dial, giving the piece a clean architectural presence without losing sport utility.",
    specs: [
      ["Case", "Stainless steel"],
      ["Crystal", "Mineral glass"],
      ["Water resistance", "100 meters"],
      ["Movement", "Quartz chronograph"],
    ],
  },
  {
    id: "kasio-edifice-premium",
    name: "Edifice Premium",
    collection: "Edifice",
    category: "Luxury",
    price: 449,
    rating: 4.9,
    image: edificeImage,
    description:
      "A polished chronograph with motorsport-inspired timing details and a slim dress profile.",
    story:
      "Edifice Premium is made for customers who want technical cues without visual noise, balancing layered dial details with a restrained case.",
    specs: [
      ["Case", "Ion-plated steel"],
      ["Crystal", "Sapphire coated"],
      ["Water resistance", "100 meters"],
      ["Movement", "Solar quartz"],
    ],
  },
  {
    id: "kasio-pro-trek-outdoor",
    name: "Pro Trek Outdoor",
    collection: "Pro Trek",
    category: "Outdoor",
    price: 359,
    rating: 4.7,
    image: proTrekImage,
    description:
      "A field-ready outdoor watch with bold contrast, durable finishing, and trail-first legibility.",
    story:
      "Pro Trek Outdoor keeps the interface clear in fast conditions, with a practical build for travel, hikes, and changing weather.",
    specs: [
      ["Case", "Resin and steel"],
      ["Crystal", "Mineral glass"],
      ["Water resistance", "200 meters"],
      ["Movement", "Digital quartz"],
    ],
  },
  {
    id: "kasio-classic-digital",
    name: "Classic Digital",
    collection: "Classic",
    category: "Digital",
    price: 89,
    compareAt: 129,
    rating: 4.6,
    image: gSteelImage,
    sale: true,
    description:
      "A compact digital everyday watch with nostalgic proportions and a modern finish.",
    story:
      "Classic Digital keeps the silhouette light and familiar, designed for customers who value utility and low-profile styling.",
    specs: [
      ["Case", "Resin"],
      ["Display", "Digital LCD"],
      ["Water resistance", "50 meters"],
      ["Functions", "Alarm, timer, stopwatch"],
    ],
  },
  {
    id: "kasio-gshock-mudmaster",
    name: "G-Shock Mudmaster",
    collection: "G-Shock",
    category: "Sports",
    price: 549,
    rating: 5,
    image: proTrekImage,
    description:
      "A rugged sports watch designed for impact resistance, outdoor abuse, and oversized readability.",
    story:
      "Mudmaster brings the strongest Kasio visual language to the page, built for customers who want a serious tool watch.",
    specs: [
      ["Case", "Shock-resistant resin"],
      ["Crystal", "Mineral glass"],
      ["Water resistance", "200 meters"],
      ["Functions", "Compass, timer, world time"],
    ],
  },
  {
    id: "kasio-sheen-elegant",
    name: "Sheen Elegant",
    collection: "Sheen",
    category: "Luxury",
    price: 229,
    rating: 4.8,
    image: edificeImage,
    description:
      "A slim elegant timepiece with a softer profile, balanced markers, and a polished finish.",
    story:
      "Sheen Elegant is designed as a jewelry-adjacent watch, with enough precision to feel serious and enough softness for daily wear.",
    specs: [
      ["Case", "Polished steel"],
      ["Crystal", "Mineral glass"],
      ["Water resistance", "50 meters"],
      ["Movement", "Analog quartz"],
    ],
  },
  {
    id: "kasio-oceanus-titanium",
    name: "Oceanus Titanium",
    collection: "Oceanus",
    category: "Luxury",
    price: 799,
    rating: 4.9,
    image: featuredWatchImage,
    outOfStock: true,
    description:
      "A light titanium flagship with a clean blue dial and elevated finishing.",
    story:
      "Oceanus Titanium is the quiet pinnacle of the collection, made for customers who want premium materials without a heavy wrist feel.",
    specs: [
      ["Case", "Titanium"],
      ["Crystal", "Sapphire"],
      ["Water resistance", "100 meters"],
      ["Movement", "Radio solar"],
    ],
  },
];

export default function ProductDetailsPage() {
  const params = useParams<{ productId: string }>();
  const product = products.find((item) => item.id === params.productId);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const tracker = useMemo(() => {
    return createTracker({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    });
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem(cartStorageKey);

    if (savedCart) {
      try {
        const items = JSON.parse(savedCart) as CartItem[];
        const nextCartCount = items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        queueMicrotask(() => setCartCount(nextCartCount));
      } catch {
        localStorage.removeItem(cartStorageKey);
      }
    }
  }, []);

  useEffect(() => {
    if (!product) return;

    tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "product_view",
      pageUrl: `/demo-store/products/${product.id}`,
      productId: product.id,
      category: product.category,
      value: product.price,
      metadata: {
        productName: product.name,
        collection: product.collection,
        source: "product_description_page",
        figmaNode: "16:2",
      },
    });
  }, [product, tracker]);

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-[#0a0a0a]">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">
            Product not found
          </p>
          <h1 className="mt-3 font-serif text-5xl">Timepiece unavailable</h1>
          <Link
            href="/demo-store"
            className="mt-8 inline-flex border-b-2 border-black pb-2 text-xs uppercase tracking-[0.16em]"
          >
            Back to Collection
          </Link>
        </div>
      </main>
    );
  }

  async function handleAddToCart() {
    if (!product || product.outOfStock) {
      setMessage("This timepiece is currently out of stock");
      return;
    }

    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      sessionId: getOrCreateSessionId(),
      eventName: "add_to_cart",
      pageUrl: `/demo-store/products/${product.id}`,
      productId: product.id,
      category: product.category,
      value: product.price * quantity,
      metadata: {
        productName: product.name,
        collection: product.collection,
        quantity,
        source: "product_description_page",
      },
    });

    const savedCart = localStorage.getItem(cartStorageKey);
    let items: CartItem[] = [];

    if (savedCart) {
      try {
        items = JSON.parse(savedCart) as CartItem[];
      } catch {
        items = [];
      }
    }

    const existingItem = items.find((item) => item.product.id === product.id);
    const nextItems = existingItem
      ? items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...items, { product, quantity }];

    localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
    setCartCount(nextItems.reduce((total, item) => total + item.quantity, 0));
    setMessage(`${quantity} ${product.name} added to bag`);
  }

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <Link
            href="/demo-store"
            className="text-3xl font-medium tracking-[0.14em]"
          >
            KASIO
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-xs uppercase tracking-[0.16em] text-black/50 hover:text-black"
            >
              Dashboard
            </Link>
            <Link
              href="/demo-store#collections"
              className="border-b border-black/30 pb-1 text-xs uppercase tracking-[0.16em] text-black/60 hover:border-black hover:text-black"
            >
              Collection
            </Link>
            <Link
              href="/demo-store?cart=open"
              className="relative grid size-9 place-items-center border border-black/10 text-sm hover:border-black"
              title="Return to bag"
            >
              Bag
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center bg-black text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="grid gap-5 md:grid-cols-[96px_1fr]">
          <div className="hidden flex-col gap-4 md:flex">
            {[product.image, product.image, product.image].map((image, index) => (
              <button
                key={`${product.id}-${index}`}
                className="aspect-[3/4] overflow-hidden border border-black/10 bg-black/5"
              >
                <Image
                  src={image}
                  alt=""
                  width={96}
                  height={128}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="relative bg-black/[0.04]">
            {product.sale && (
              <span className="absolute left-6 top-6 z-10 bg-black px-3 py-1 text-xs uppercase tracking-[0.12em] text-white">
                Sale
              </span>
            )}
            {product.outOfStock && (
              <span className="absolute inset-0 z-10 grid place-items-center bg-white/70 text-sm uppercase tracking-[0.16em] text-black/70">
                Out of Stock
              </span>
            )}
            <Image
              src={product.image}
              alt={product.name}
              width={720}
              height={920}
              className="aspect-[4/5] w-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="lg:pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-black/50">
            {product.collection} Collection
          </p>
          <h1 className="mt-6 font-serif text-6xl leading-none md:text-7xl">
            {product.name}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-black/60">
            <span>{product.category}</span>
            <span aria-hidden="true">/</span>
            <span>{product.rating} rating</span>
            <span aria-hidden="true">/</span>
            <span>Limited release</span>
          </div>

          <p className="mt-8 max-w-xl text-lg font-light leading-8 text-black/70">
            {product.description}
          </p>

          <div className="mt-8 flex items-end gap-4">
            <span className="text-4xl font-light">${product.price}</span>
            {product.compareAt && (
              <span className="pb-1 text-base text-black/40 line-through">
                ${product.compareAt}
              </span>
            )}
          </div>

          <div className="mt-10 border-y border-black/10 py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-black/50">
                  Quantity
                </p>
                <div className="mt-3 flex h-11 w-36 items-center border border-black/10">
                  <button
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="grid size-11 place-items-center text-lg hover:bg-black hover:text-white"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="grid h-11 flex-1 place-items-center text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((value) => value + 1)}
                    className="grid size-11 place-items-center text-lg hover:bg-black hover:text-white"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.outOfStock}
                className="bg-black px-8 py-4 text-sm uppercase tracking-[0.14em] text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/20"
              >
                Add to Bag
              </button>
            </div>
            {message && (
              <p className="mt-5 border border-black/10 px-4 py-3 text-sm text-black/60">
                {message}
              </p>
            )}
          </div>

          <section className="mt-10">
            <h2 className="font-serif text-3xl">Description</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
              {product.story}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-serif text-3xl">Details</h2>
            <dl className="mt-5 divide-y divide-black/10 border-y border-black/10">
              {product.specs.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[140px_1fr] gap-6 py-4 text-sm"
                >
                  <dt className="text-black/40">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/50">
                You may also like
              </p>
              <h2 className="mt-2 font-serif text-4xl">Related Timepieces</h2>
            </div>
            <Link
              href="/demo-store#collections"
              className="hidden border-b border-black/30 pb-1 text-xs uppercase tracking-[0.16em] text-black/60 hover:border-black hover:text-black sm:inline-flex"
            >
              View All
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((item) => item.id !== product.id)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/demo-store/products/${item.id}`}
                  className="group"
                >
                  <div className="overflow-hidden bg-black/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={360}
                      height={480}
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.12em] text-black/40">
                    {item.collection}
                  </p>
                  <h3 className="mt-1 font-serif text-xl">{item.name}</h3>
                  <p className="mt-1 text-lg font-light">${item.price}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
