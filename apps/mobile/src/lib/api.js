// CHANGE this to your LAN IP from earlier (192.168.1.9)
export const BASE_URL = "http://192.168.1.9:4000";

export async function getReceipts() {
  const res = await fetch(`${BASE_URL}/receipts`);
  if (!res.ok) throw new Error("Failed to fetch receipts");
  return res.json();
}

export async function createReceipt(payload) {
  const res = await fetch(`${BASE_URL}/receipts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
