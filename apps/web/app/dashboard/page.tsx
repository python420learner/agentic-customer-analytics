import Link from "next/link";
import { getAgentActions, getDashboardSummary } from "@/lib/api";
import AgentControlPanel from "./AgentControlPanel";
import AgentActionControls from "./AgentActionControls";

type CustomerEvent = {
  id: string;
  eventName: string;
  anonymousId: string;
  productId?: string | null;
  category?: string | null;
  value?: number | null;
  createdAt: string;
};

type AgentAction = {
  id: string;
  agentName: string;
  actionType: string;
  anonymousId: string;
  reason: string;
  status: string;
  createdAt: string;
};

const eventLabels: Record<string, string> = {
  page_view: "Page View",
  product_view: "Product View",
  search: "Search / Filter",
  add_to_cart: "Add to Cart",
  checkout_started: "Checkout Started",
  purchase: "Purchase",
};

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  executed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  dismissed: "border-rose-200 bg-rose-50 text-rose-800",
};

export default async function DashboardPage() {
  const [summaryResult, actionsResult] = await Promise.allSettled([
    getDashboardSummary(),
    getAgentActions(),
  ]);
  const data =
    summaryResult.status === "fulfilled"
      ? summaryResult.value
      : {
          totalEvents: 0,
          totalCustomers: 0,
          cartAdds: 0,
          purchases: 0,
          revenue: 0,
          recentEvents: [],
        };
  const agentActions =
    actionsResult.status === "fulfilled" ? actionsResult.value : [];
  const dataUnavailable =
    summaryResult.status === "rejected" || actionsResult.status === "rejected";
  const recentEvents = data.recentEvents as CustomerEvent[];
  const actions = agentActions as AgentAction[];
  const conversionRate = getRate(data.purchases, data.totalCustomers);
  const cartToPurchaseRate = getRate(data.purchases, data.cartAdds);
  const averageOrderValue =
    data.purchases > 0 ? Math.round(data.revenue / data.purchases) : 0;
  const pendingActions = actions.filter(
    (action) => action.status === "pending",
  ).length;
  const executedActions = actions.filter(
    (action) => action.status === "executed",
  ).length;
  const eventBreakdown = buildEventBreakdown(recentEvents);
  const latestEvent = recentEvents[0];

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#171411]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
              Agentic Customer Analytics
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none tracking-normal md:text-6xl">
              Behavior Command Center
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
              Monitor storefront intent, revenue movement, and agent-generated
              recovery decisions from one operational workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo-store"
              className="border border-black/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black/70 hover:border-black hover:text-black"
            >
              Open Storefront
            </Link>
            <a
              href="#agent-actions"
              className="bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-black/80"
            >
              Review Actions
            </a>
          </div>
        </header>

        {dataUnavailable && (
          <section className="mt-6 border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Live analytics data is temporarily unavailable. The dashboard shell
            is still available, and metrics will populate when the API and
            database are reachable.
          </section>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Tracked Events"
            value={formatNumber(data.totalEvents)}
            detail={`${recentEvents.length} visible in the live feed`}
          />
          <MetricCard
            title="Known Customers"
            value={formatNumber(data.totalCustomers)}
            detail={`${conversionRate}% customer-to-purchase conversion`}
          />
          <MetricCard
            title="Cart Adds"
            value={formatNumber(data.cartAdds)}
            detail={`${cartToPurchaseRate}% carts converted to purchase`}
          />
          <MetricCard
            title="Revenue"
            value={formatCurrency(data.revenue)}
            detail={`${formatCurrency(averageOrderValue)} average order value`}
            emphasized
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <InsightPanel
            revenue={data.revenue}
            purchases={data.purchases}
            cartAdds={data.cartAdds}
            totalEvents={data.totalEvents}
            pendingActions={pendingActions}
            latestEvent={latestEvent}
          />
          <AgentControlPanel />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
          <EventMixCard breakdown={eventBreakdown} total={recentEvents.length} />
          <RecentEventsCard events={recentEvents} />
        </section>

        <section id="agent-actions" className="mt-6">
          <AgentActionsCard actions={actions} executedActions={executedActions} />
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  detail,
  emphasized,
}: {
  title: string;
  value: string;
  detail: string;
  emphasized?: boolean;
}) {
  return (
    <article
      className={`border p-6 ${
        emphasized
          ? "border-black bg-[#171411] text-white"
          : "border-black/10 bg-white text-[#171411]"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.16em] ${
          emphasized ? "text-white/55" : "text-black/45"
        }`}
      >
        {title}
      </p>
      <h2 className="mt-4 text-4xl font-light tracking-normal">{value}</h2>
      <p
        className={`mt-4 text-sm leading-6 ${
          emphasized ? "text-white/65" : "text-black/55"
        }`}
      >
        {detail}
      </p>
    </article>
  );
}

function InsightPanel({
  revenue,
  purchases,
  cartAdds,
  totalEvents,
  pendingActions,
  latestEvent,
}: {
  revenue: number;
  purchases: number;
  cartAdds: number;
  totalEvents: number;
  pendingActions: number;
  latestEvent?: CustomerEvent;
}) {
  return (
    <section className="border border-black/10 bg-white p-6 lg:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">
            Executive Snapshot
          </p>
          <h2 className="mt-2 font-serif text-3xl">Storefront Signal Health</h2>
        </div>
        <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
          Live
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <SignalBlock
          label="Purchase Intent"
          value={cartAdds > 0 ? "Active" : "Warming"}
          detail={`${formatNumber(cartAdds)} cart signals captured`}
        />
        <SignalBlock
          label="Revenue Motion"
          value={revenue > 0 ? "Monetized" : "Pre-revenue"}
          detail={`${formatCurrency(revenue)} across ${purchases} purchases`}
        />
        <SignalBlock
          label="Agent Queue"
          value={pendingActions > 0 ? `${pendingActions} pending` : "Clear"}
          detail="Human review loop for recovery actions"
        />
      </div>

      <div className="mt-8 grid gap-5 border-t border-black/10 pt-6 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">
            Latest Activity
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            {latestEvent ? eventLabels[latestEvent.eventName] : "No events yet"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/55">
            {latestEvent
              ? `${latestEvent.productId ?? "Unknown product"} from ${
                  latestEvent.category ?? "uncategorized"
                } at ${formatDate(latestEvent.createdAt)}`
              : "Start interacting with the demo store to populate this stream."}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">
            Data Density
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            {formatNumber(totalEvents)} total signals
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Events are aggregated into customer profiles and agent decisions,
            giving the dashboard enough context to move beyond raw clicks.
          </p>
        </div>
      </div>
    </section>
  );
}

function SignalBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-black/10 bg-[#fbfaf7] p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-black/40">
        {label}
      </p>
      <p className="mt-3 text-2xl font-light">{value}</p>
      <p className="mt-2 text-sm leading-6 text-black/55">{detail}</p>
    </div>
  );
}

function EventMixCard({
  breakdown,
  total,
}: {
  breakdown: Array<{ eventName: string; count: number }>;
  total: number;
}) {
  return (
    <section className="border border-black/10 bg-white p-6 lg:p-7">
      <p className="text-xs uppercase tracking-[0.18em] text-black/45">
        Event Mix
      </p>
      <h2 className="mt-2 font-serif text-3xl">Recent Signal Composition</h2>

      <div className="mt-8 space-y-5">
        {breakdown.length === 0 ? (
          <p className="text-sm text-black/55">No events captured yet.</p>
        ) : (
          breakdown.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.eventName}>
                <div className="flex items-center justify-between text-sm">
                  <span>{eventLabels[item.eventName] ?? item.eventName}</span>
                  <span className="text-black/45">
                    {item.count} · {percentage}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-black/5">
                  <div
                    className="h-full bg-black"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function RecentEventsCard({ events }: { events: CustomerEvent[] }) {
  return (
    <section className="border border-black/10 bg-white p-6 lg:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">
            Activity Feed
          </p>
          <h2 className="mt-2 font-serif text-3xl">Recent Customer Events</h2>
        </div>
        <span className="text-sm text-black/45">{events.length} visible</span>
      </div>

      <div className="mt-6 divide-y divide-black/10">
        {events.length === 0 ? (
          <p className="py-8 text-sm text-black/55">
            No customer activity yet. Open the storefront and interact with
            products to generate events.
          </p>
        ) : (
          events.slice(0, 10).map((event) => (
            <article
              key={event.id}
              className="grid gap-4 py-4 md:grid-cols-[180px_1fr_120px]"
            >
              <div>
                <span className="border border-black/10 px-2 py-1 text-xs uppercase tracking-[0.12em] text-black/55">
                  {eventLabels[event.eventName] ?? event.eventName}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {event.productId ?? "No product attached"}
                </p>
                <p className="mt-1 truncate text-xs text-black/45">
                  {event.anonymousId}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm">{formatOptionalCurrency(event.value)}</p>
                <p className="mt-1 text-xs text-black/45">
                  {formatDate(event.createdAt)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function AgentActionsCard({
  actions,
  executedActions,
}: {
  actions: AgentAction[];
  executedActions: number;
}) {
  return (
    <section className="border border-black/10 bg-white p-6 lg:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">
            Agent Decisions
          </p>
          <h2 className="mt-2 font-serif text-3xl">Recovery Action Queue</h2>
        </div>
        <div className="flex gap-3 text-xs uppercase tracking-[0.12em]">
          <span className="border border-black/10 px-3 py-2 text-black/50">
            {actions.length} total
          </span>
          <span className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            {executedActions} executed
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-black/10 text-left text-xs uppercase tracking-[0.12em] text-black/40">
              <th className="py-4 pr-4 font-medium">Agent</th>
              <th className="px-4 py-4 font-medium">Customer</th>
              <th className="px-4 py-4 font-medium">Decision Rationale</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Time</th>
              <th className="py-4 pl-4 font-medium">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {actions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-black/50">
                  No agent actions yet. Run the cart abandonment agent to
                  generate recovery decisions.
                </td>
              </tr>
            ) : (
              actions.map((action) => (
                <tr key={action.id} className="align-top">
                  <td className="py-5 pr-4">
                    <p className="font-medium">{formatIdentifier(action.agentName)}</p>
                    <p className="mt-1 text-xs text-black/45">
                      {formatIdentifier(action.actionType)}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-black/60">
                    <span className="line-clamp-1">{action.anonymousId}</span>
                  </td>
                  <td className="px-4 py-5">
                    <p className="max-w-md leading-6 text-black/65">
                      {action.reason}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        statusStyles[action.status] ??
                        "border-black/10 bg-black/5 text-black/60"
                      }`}
                    >
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-black/50">
                    {formatDate(action.createdAt)}
                  </td>
                  <td className="py-5 pl-4">
                    <AgentActionControls
                      actionId={action.id}
                      currentStatus={action.status}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function buildEventBreakdown(events: CustomerEvent[]) {
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.eventName] = (acc[event.eventName] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);
}

function getRate(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOptionalCurrency(value?: number | null) {
  return typeof value === "number" ? formatCurrency(value) : "-";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatIdentifier(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
