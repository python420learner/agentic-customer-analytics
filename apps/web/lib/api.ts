const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardSummary() {
  const res = await fetch(`${API_URL}/dashboard/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  const json = await res.json();

  return json.data;
}

export async function getAgentActions() {
  const res = await fetch(`${API_URL}/agents/actions`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch agent actions");
  }

  const json = await res.json();
  return json.data;
}

export async function runCartAbandonmentAgent() {
  const res = await fetch(`${API_URL}/agents/cart-abandonment/run`, {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to run cart abandonment agent");
  }

  const json = await res.json();
  return json.data;
}

export async function updateAgentActionStatus(
  actionId: string,
  status: "pending" | "approved" | "executed" | "dismissed",
) {
  const res = await fetch(`${API_URL}/agents/actions/${actionId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update agent action status");
  }

  const json = await res.json();
  return json.data;
}
