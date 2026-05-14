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
    <section className="border border-black/10 bg-[#171411] p-6 text-white lg:p-7">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Agent Control
          </p>
          <h2 className="mt-2 font-serif text-3xl">Cart Abandonment Agent</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Scan recent cart intent, suppress customers who already purchased,
            and create recovery offers for human review.
          </p>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading}
          className="border border-white/20 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Running Agent..." : "Run Agent"}
        </button>
      </div>

      {result && (
        <div className="mt-6 grid gap-3 border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <p className="font-medium text-white">Run complete</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <span>Checked {result.checkedCartEvents} cart events</span>
            <span>Created {result.createdActions} actions</span>
            <span>Skipped {result.skippedExisting ?? 0} existing</span>
            <span>Skipped {result.skippedPurchased ?? 0} purchased</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 border border-red-300/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {error}
        </div>
      )}
    </section>
  );
}
