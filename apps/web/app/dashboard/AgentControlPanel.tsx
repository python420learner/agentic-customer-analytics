"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runCartAbandonmentAgent } from "@/lib/api";

export default function AgentControlPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    checkedCartEvents: number;
    createdActions: number;
    skippedExisting?: number;
    skippedPurchased?: number;
  }>(null);
  const [error, setError] = useState("");

  async function handleRunAgent() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await runCartAbandonmentAgent();
      setResult(data);

      router.refresh();
    } catch {
      setError("Failed to run agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-600">Agent Control</p>
          <h2 className="mt-1 text-xl font-semibold">
            Cart Abandonment Agent
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Detect users who added products to cart but did not complete purchase.
          </p>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Running Agent..." : "Run Agent"}
        </button>
      </div>

      {result && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          Checked {result.checkedCartEvents} cart events. Created{" "}
          {result.createdActions} new agent actions.
          {(result.skippedExisting || result.skippedPurchased) && (
            <span>
              {" "}
              Skipped {result.skippedExisting ?? 0} existing and{" "}
              {result.skippedPurchased ?? 0} purchased.
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}
