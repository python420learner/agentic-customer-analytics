"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  category: "Sports" | "Luxury" | "Outdoor" | "Digital";
  price: number;
  compareAt?: number;
  rating: number;
  image: string;
  sale?: boolean;
  outOfStock?: boolean;
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
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
  },
  {
    id: "kasio-edifice-premium",
    name: "Edifice Premium",
    collection: "Edifice",
    category: "Luxury",
    price: 449,
    rating: 4.9,
    image: edificeImage,
  },
  {
    id: "kasio-pro-trek-outdoor",
    name: "Pro Trek Outdoor",
    collection: "Pro Trek",
    category: "Outdoor",
    price: 359,
    rating: 4.7,
    image: proTrekImage,
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
  },
  {
    id: "kasio-gshock-mudmaster",
    name: "G-Shock Mudmaster",
    collection: "G-Shock",
    category: "Sports",
    price: 549,
    rating: 5,
    image: proTrekImage,
  },
  {
    id: "kasio-sheen-elegant",
    name: "Sheen Elegant",
    collection: "Sheen",
    category: "Luxury",
    price: 229,
    rating: 4.8,
    image: edificeImage,
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
  },
  {
    id: "kasio-gshock-square",
    name: "G-Shock Square",
    collection: "G-Shock",
    category: "Digital",
    price: 149,
    rating: 4.7,
    image: gSteelImage,
  },
  {
    id: "kasio-edifice-chronograph",
    name: "Edifice Chronograph",
    collection: "Edifice",
    category: "Sports",
    price: 279,
    compareAt: 349,
    rating: 4.6,
    image: edificeImage,
    sale: true,
  },
  {
    id: "kasio-baby-g-ms",
    name: "Baby-G G-MS",
    collection: "Baby-G",
    category: "Digital",
    price: 179,
    rating: 4.6,
    image: gSteelImage,
  },
  {
    id: "kasio-vintage-black-gold",
    name: "Vintage Black & Gold",
    collection: "Vintage",
    category: "Digital",
    price: 129,
    rating: 4.5,
    image: edificeImage,
  },
  {
    id: "kasio-pro-trek-mountain",
    name: "Pro Trek Mountain",
    collection: "Pro Trek",
    category: "Outdoor",
    price: 309,
    compareAt: 379,
    rating: 4.7,
    image: proTrekImage,
    sale: true,
  },
];

const categories = ["All", "Sports", "Luxury", "Outdoor", "Digital"] as const;
const collections = [
  "All",
  "G-Shock",
  "Edifice",
  "Pro Trek",
  "Classic",
  "G-Steel",
  "Sheen",
  "Oceanus",
  "Baby-G",
  "Vintage",
] as const;
const prices = [
  "All Prices",
  "Under $100",
  "$100 - $300",
  "$300 - $500",
  "$500+",
] as const;

export default function DemoStorePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [collection, setCollection] =
    useState<(typeof collections)[number]>("All");
  const [priceRange, setPriceRange] =
    useState<(typeof prices)[number]>("All Prices");
  const [saleOnly, setSaleOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const tracker = useMemo(() => {
    return createTracker({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.collection}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesCollection =
        collection === "All" || product.collection === collection;
      const matchesSale = !saleOnly || product.sale;
      const matchesPrice =
        priceRange === "All Prices" ||
        (priceRange === "Under $100" && product.price < 100) ||
        (priceRange === "$100 - $300" &&
          product.price >= 100 &&
          product.price <= 300) ||
        (priceRange === "$300 - $500" &&
          product.price > 300 &&
          product.price <= 500) ||
        (priceRange === "$500+" && product.price > 500);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCollection &&
        matchesSale &&
        matchesPrice
      );
    });
  }, [category, collection, priceRange, query, saleOnly]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  async function trackProductView(product: Product, source = "product_grid") {
    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "product_view",
      pageUrl: "/demo-store",
      productId: product.id,
      category: product.category,
      value: product.price,
      metadata: {
        productName: product.name,
        collection: product.collection,
        source,
      },
    });
  }

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });

        if (!res.ok || !res.headers.get("content-type")?.includes("json")) {
          setAuthUser(null);
          return;
        }

        const data = await res.json();
        setAuthUser(data.user ?? null);
      } catch (error) {
        console.error("Failed to load auth user:", error);
      } finally {
        setAuthLoading(false);
      }
    }

    loadAuthUser();

    const savedCart = localStorage.getItem(cartStorageKey);

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        queueMicrotask(() => setCartItems(parsedCart));
      } catch {
        localStorage.removeItem(cartStorageKey);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const cartStatus = params.get("cart");

    if (authStatus === "success") {
      queueMicrotask(() => setMessage("Signed in with Google"));
      window.history.replaceState({}, "", window.location.pathname);
    } else if (authStatus) {
      queueMicrotask(() =>
        setMessage("Google sign in could not be completed"),
      );
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (cartStatus === "open") {
      queueMicrotask(() => setCartOpen(true));
      window.history.replaceState({}, "", window.location.pathname);
    }

    tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "page_view",
      pageUrl: "/demo-store",
      metadata: {
        pageName: "Kasio Demo Store",
        figmaNode: "1:1078",
      },
    });

    trackProductView(products[0], "hero");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  function handleGoogleSignIn() {
    window.location.href = "/api/auth/google/start";
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setAuthUser(null);
    setMessage("Signed out");
  }

  async function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setMessage(`Viewed ${product.name}`);
    await trackProductView(product);
  }

  async function handleFilterChange(
    type: "category" | "collection" | "price" | "sale",
    value: string | boolean,
  ) {
    if (type === "category") setCategory(value as (typeof categories)[number]);
    if (type === "collection") {
      setCollection(value as (typeof collections)[number]);
    }
    if (type === "price") setPriceRange(value as (typeof prices)[number]);
    if (type === "sale") setSaleOnly(Boolean(value));

    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "search",
      pageUrl: "/demo-store",
      metadata: {
        filterType: type,
        filterValue: value,
      },
    });
  }

  async function handleAddToCart(product = selectedProduct) {
    if (product.outOfStock) {
      setMessage(`${product.name} is currently out of stock`);
      return;
    }

    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "add_to_cart",
      pageUrl: "/demo-store",
      productId: product.id,
      category: product.category,
      value: product.price,
      metadata: {
        productName: product.name,
        collection: product.collection,
      },
    });

    setSelectedProduct(product);
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...items, { product, quantity: 1 }];
    });
    setCartOpen(true);
    setMessage(`${product.name} added to cart`);
  }

  function handleCartQuantityChange(productId: string, change: 1 | -1) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleRemoveCartItem(productId: string) {
    setCartItems((items) =>
      items.filter((item) => item.product.id !== productId),
    );
  }

  async function handleCheckoutStarted() {
    if (cartItems.length === 0) {
      setCartOpen(true);
      setMessage("Your cart is empty");
      return;
    }

    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "checkout_started",
      pageUrl: "/demo-store/checkout",
      productId: selectedProduct.id,
      category: selectedProduct.category,
      value: cartSubtotal,
      metadata: {
        productName: selectedProduct.name,
        collection: selectedProduct.collection,
        cartItems: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    });

    setCartOpen(false);
    setMessage(`Checkout started for ${cartCount} item${cartCount === 1 ? "" : "s"}`);
  }

  async function handlePurchase() {
    if (cartItems.length === 0) {
      setCartOpen(true);
      setMessage("Your cart is empty");
      return;
    }

    await tracker.track({
      anonymousId: getOrCreateAnonymousId(),
      userId: authUser?.email,
      sessionId: getOrCreateSessionId(),
      eventName: "purchase",
      pageUrl: "/demo-store/success",
      productId: selectedProduct.id,
      category: selectedProduct.category,
      value: cartSubtotal,
      metadata: {
        productName: selectedProduct.name,
        collection: selectedProduct.collection,
        paymentMethod: "demo",
        cartItems: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    });

    setCartItems([]);
    setCartOpen(false);
    setMessage(`Purchase completed for ${cartCount} item${cartCount === 1 ? "" : "s"}`);
  }

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <a
              href="/demo-store"
              className="text-3xl font-medium tracking-[0.14em]"
            >
              KASIO
            </a>
            <nav className="hidden items-center gap-10 text-sm text-black/70 md:flex">
              <a href="#new" className="hover:text-black">
                New
              </a>
              <a href="#collections" className="hover:text-black">
                Collections
              </a>
              <a href="#footer" className="hover:text-black">
                About
              </a>
            </nav>
          </div>

          <label className="hidden h-10 w-80 items-center border-b border-black/20 text-sm lg:flex">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-full flex-1 bg-transparent outline-none placeholder:text-black/40"
            />
            <span aria-hidden="true" className="text-lg text-black/40">
              +
            </span>
          </label>

          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm uppercase tracking-[0.12em] text-black/60 hover:text-black"
            >
              Dashboard
            </a>
            <ProfileMenu
              user={authUser}
              loading={authLoading}
              onSignIn={handleGoogleSignIn}
              onSignOut={handleLogout}
            />
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-9 place-items-center border border-black/10 text-sm hover:border-black"
              title="Open cart"
            >
              Bag
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center bg-black text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 lg:pb-32 lg:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                Spring 2026 Collection
              </p>
              <h1 className="mt-8 font-serif text-7xl leading-[0.95] tracking-normal md:text-8xl">
                Time,
                <br />
                <em className="font-light">Refined</em>
              </h1>
              <p className="mt-8 max-w-md text-lg font-light leading-8 text-black/70">
                Precision timepieces crafted for those who appreciate the subtle
                elegance of minimalist design.
              </p>
              <a
                href="#collections"
                onClick={() => trackProductView(products[0], "hero_cta")}
                className="mt-10 inline-flex border-b-2 border-black pb-2 text-xs font-medium uppercase tracking-[0.16em]"
              >
                Explore Collection <span className="ml-3">-&gt;</span>
              </a>
            </div>

            <article className="relative bg-black/5">
              <Image
                src={featuredWatchImage}
                alt="G-Steel Classic watch"
                width={576}
                height={720}
                className="aspect-[4/5] w-full object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 border-t border-black/10 bg-white/95 p-8">
                <p className="text-xs uppercase tracking-[0.12em] text-black/60">
                  Featured
                </p>
                <h2 className="mt-2 font-serif text-2xl">G-Steel Classic</h2>
                <p className="mt-1 text-sm text-black/60">Limited Edition</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-3xl font-light">$299</span>
                  <span className="pb-1 text-sm text-black/40 line-through">
                    $399
                  </span>
                </div>
              </div>
            </article>
          </div>

          <dl className="mt-20 grid border-t border-black/10 pt-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["50+", "Collections"],
              ["10K+", "Customers"],
              ["98%", "Satisfaction"],
              ["24/7", "Support"],
            ].map(([value, label]) => (
              <div key={label} className="py-6">
                <dt className="text-4xl font-light">{value}</dt>
                <dd className="mt-2 text-xs uppercase tracking-[0.12em] text-black/60">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="collections" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-4xl">All Timepieces</h2>
            <p className="mt-2 text-sm text-black/60">
              {filteredProducts.length} of 50 pieces
            </p>
          </div>
          {message && (
            <p className="border border-black/10 px-4 py-3 text-sm text-black/70">
              {message}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[256px_1fr]">
          <aside className="space-y-10">
            <FilterGroup title="Categories">
              {categories.map((item) => (
                <FilterButton
                  key={item}
                  active={category === item}
                  onClick={() => handleFilterChange("category", item)}
                >
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Collections">
              {collections.map((item) => (
                <FilterButton
                  key={item}
                  active={collection === item}
                  onClick={() => handleFilterChange("collection", item)}
                >
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Price Range">
              {prices.map((item) => (
                <FilterButton
                  key={item}
                  active={priceRange === item}
                  onClick={() => handleFilterChange("price", item)}
                >
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-black/70">
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(event) =>
                  handleFilterChange("sale", event.target.checked)
                }
                className="size-4 accent-black"
              />
              Sale Items Only
            </label>
          </aside>

          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedProduct.id === product.id}
                onSelect={() => handleSelectProduct(product)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              Selected Timepiece
            </p>
            <h2 className="mt-2 font-serif text-2xl">{selectedProduct.name}</h2>
            <p className="mt-1 text-sm text-black/60">
              {selectedProduct.collection} &middot; ${selectedProduct.price}
            </p>
          </div>
          <button
            onClick={() => handleCheckoutStarted()}
            className="border border-black px-6 py-3 text-sm uppercase tracking-[0.12em] hover:bg-black hover:text-white"
          >
            Start Checkout
          </button>
          <button
            onClick={() => handlePurchase()}
            className="bg-black px-6 py-3 text-sm uppercase tracking-[0.12em] text-white hover:bg-black/80"
          >
            Complete Purchase
          </button>
        </div>
      </section>

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        subtotal={cartSubtotal}
        onClose={() => setCartOpen(false)}
        onQuantityChange={handleCartQuantityChange}
        onRemove={handleRemoveCartItem}
        onCheckout={handleCheckoutStarted}
        onPurchase={handlePurchase}
      />

      <footer id="footer" className="border-t border-black/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-4">
          <div>
            <h2 className="text-3xl tracking-[0.14em]">KASIO</h2>
            <p className="mt-6 max-w-xs text-sm leading-7 text-black/60">
              Crafting precision timepieces that embody timeless design and
              modern engineering.
            </p>
            <div className="mt-6 flex gap-4 text-sm text-black/60">
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
            </div>
          </div>
          <FooterColumn
            title="Shop"
            links={["New Arrivals", "Best Sellers", "Collections", "Sale"]}
          />
          <FooterColumn
            title="Support"
            links={["Contact", "FAQs", "Shipping", "Returns", "Warranty"]}
          />
          <div>
            <h3 className="text-sm uppercase tracking-[0.12em]">Newsletter</h3>
            <p className="mt-6 text-sm leading-6 text-black/60">
              Subscribe for exclusive updates and offers.
            </p>
            <label className="mt-6 flex border-b border-black/20 py-2 text-sm">
              <input
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/40"
              />
              <span>-&gt;</span>
            </label>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-black/10 px-6 py-8 text-xs text-black/50 md:flex-row md:justify-between">
          <p>&copy; 2026 Kasio. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-[0.12em]">
        {title}
      </h3>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`block text-sm transition ${
        active ? "text-black" : "text-black/50 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function CartDrawer({
  open,
  items,
  subtotal,
  onClose,
  onQuantityChange,
  onRemove,
  onCheckout,
  onPurchase,
}: {
  open: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onQuantityChange: (productId: string, change: 1 | -1) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onPurchase: () => void;
}) {
  const shipping = items.length > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        aria-label="Close cart"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex h-24 items-center justify-between border-b border-black/10 px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              Active Cart
            </p>
            <h2 className="mt-1 font-serif text-3xl">Your Bag</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center border border-black/10 text-xl leading-none hover:border-black"
            aria-label="Close cart"
          >
            x
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              No timepieces yet
            </p>
            <h3 className="mt-3 font-serif text-3xl">Your bag is empty</h3>
            <p className="mt-4 max-w-xs text-sm leading-6 text-black/60">
              Add a watch from the collection to see the active cart state.
            </p>
            <button
              onClick={onClose}
              className="mt-8 border-b-2 border-black pb-2 text-xs uppercase tracking-[0.16em]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8">
              <div className="divide-y divide-black/10">
                {items.map((item) => (
                  <article
                    key={item.product.id}
                    className="grid grid-cols-[96px_1fr] gap-5 py-7"
                  >
                    <div className="relative bg-black/5">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={96}
                        height={128}
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-black/40">
                            {item.product.collection}
                          </p>
                          <h3 className="mt-1 font-serif text-xl">
                            {item.product.name}
                          </h3>
                        </div>
                        <p className="text-lg font-light">
                          ${item.product.price * item.quantity}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex h-9 items-center border border-black/10">
                          <button
                            onClick={() =>
                              onQuantityChange(item.product.id, -1)
                            }
                            className="grid size-9 place-items-center text-lg hover:bg-black hover:text-white"
                            aria-label={`Decrease ${item.product.name}`}
                          >
                            -
                          </button>
                          <span className="grid h-9 w-10 place-items-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onQuantityChange(item.product.id, 1)
                            }
                            className="grid size-9 place-items-center text-lg hover:bg-black hover:text-white"
                            aria-label={`Increase ${item.product.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="text-xs uppercase tracking-[0.12em] text-black/40 hover:text-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 px-8 py-7">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-black/60">
                  <span>Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-4 font-serif text-2xl">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className="mt-7 grid gap-3">
                <button
                  onClick={onCheckout}
                  className="border border-black px-6 py-4 text-sm uppercase tracking-[0.12em] hover:bg-black hover:text-white"
                >
                  Start Checkout
                </button>
                <button
                  onClick={onPurchase}
                  className="bg-black px-6 py-4 text-sm uppercase tracking-[0.12em] text-white hover:bg-black/80"
                >
                  Complete Purchase
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductCard({
  product,
  selected,
  onSelect,
  onAddToCart,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  onAddToCart: () => void;
}) {
  return (
    <article className="group">
      <button
        onClick={onSelect}
        className={`relative block w-full overflow-hidden bg-black/5 text-left ${
          selected ? "outline outline-1 outline-black" : ""
        }`}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={360}
          height={480}
          className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.sale && (
          <span className="absolute left-4 top-4 bg-black px-3 py-1 text-xs uppercase tracking-[0.12em] text-white">
            Sale
          </span>
        )}
        {product.outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm uppercase tracking-[0.12em] text-black/70">
            Out of Stock
          </span>
        )}
      </button>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <p className="uppercase tracking-[0.12em] text-black/40">
            {product.collection}
          </p>
          <p aria-label={`${product.rating} star rating`}>
            <span aria-hidden="true">*</span> {product.rating}
          </p>
        </div>
        <h3 className="font-serif text-xl">{product.name}</h3>
        <div className="flex items-end justify-between gap-3">
          <p>
            <span className="text-xl font-light">${product.price}</span>
            {product.compareAt && (
              <span className="ml-2 text-sm text-black/40 line-through">
                ${product.compareAt}
              </span>
            )}
          </p>
          <button
            onClick={onAddToCart}
            disabled={product.outOfStock}
            className="border-b border-black pb-1 text-xs uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:border-black/20 disabled:text-black/30"
          >
            Add
          </button>
        </div>
        <Link
          href={`/demo-store/products/${product.id}`}
          className="inline-flex border-b border-black/30 pb-1 text-xs uppercase tracking-[0.12em] text-black/50 hover:border-black hover:text-black"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

function ProfileMenu({
  user,
  loading,
  onSignIn,
  onSignOut,
}: {
  user: AuthUser | null;
  loading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  if (loading) {
    return (
      <span className="grid size-9 place-items-center border border-black/10 text-black/30">
        <ProfileIcon />
      </span>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="grid size-9 place-items-center border border-black/10 text-black/60 hover:border-black hover:text-black"
        title="Sign in with Google"
        aria-label="Sign in with Google"
      >
        <ProfileIcon />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center overflow-hidden border border-black/10 bg-black text-xs uppercase text-white">
        {user.picture ? (
          <Image
            src={user.picture}
            alt=""
            width={36}
            height={36}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          user.name.slice(0, 1)
        )}
      </div>
      <button
        onClick={onSignOut}
        className="hidden text-xs uppercase tracking-[0.12em] text-black/50 hover:text-black sm:block"
      >
        Sign out
      </button>
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.12em]">{title}</h3>
      <ul className="mt-6 space-y-4 text-sm text-black/60">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="hover:text-black">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
