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