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
    return (
      <span className="text-xs text-slate-400">
        No action available
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus === "pending" && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={!!loadingStatus}
          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
        >
          {loadingStatus === "approved" ? "Approving..." : "Approve"}
        </button>
      )}

      {currentStatus === "approved" && (
        <button
          onClick={() => updateStatus("executed")}
          disabled={!!loadingStatus}
          className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
        >
          {loadingStatus === "executed" ? "Executing..." : "Mark Executed"}
        </button>
      )}

      <button
        onClick={() => updateStatus("dismissed")}
        disabled={!!loadingStatus}
        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {loadingStatus === "dismissed" ? "Dismissing..." : "Dismiss"}
      </button>
    </div>
  );
}