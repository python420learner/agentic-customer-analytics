"use client";

import { useState } from "react";
import { updateAgentActionStatus } from "@/lib/api";

type Props = {
  actionId: string;
  currentStatus: string;
};

export default function AgentActionControls({
  actionId,
  currentStatus,
}: Props) {
  const [loadingStatus, setLoadingStatus] = useState("");

  async function updateStatus(status: "approved" | "executed" | "dismissed") {
    try {
      setLoadingStatus(status);
      await updateAgentActionStatus(actionId, status);
      window.location.reload();
    } finally {
      setLoadingStatus("");
    }
  }

  if (currentStatus === "executed" || currentStatus === "dismissed") {
    return <span className="text-xs text-black/35">No action available</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus === "pending" && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={!!loadingStatus}
          className="border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-blue-800 hover:bg-blue-100 disabled:opacity-60"
        >
          {loadingStatus === "approved" ? "Approving..." : "Approve"}
        </button>
      )}

      {currentStatus === "approved" && (
        <button
          onClick={() => updateStatus("executed")}
          disabled={!!loadingStatus}
          className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
        >
          {loadingStatus === "executed" ? "Executing..." : "Mark Executed"}
        </button>
      )}

      <button
      onClick={() => updateStatus("dismissed")}
      disabled={!!loadingStatus}
      className="border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-rose-800 hover:bg-rose-100 disabled:opacity-60"
    >
        {loadingStatus === "dismissed" ? "Dismissing..." : "Dismiss"}
      </button>
    </div>
  );
}
