import { BASE_URL, USER_ID } from "./config";

export async function createReceipt({ merchant_name, total_nok }) {
  const payload = {
    user_id: USER_ID,
    merchant_name,
    total_cents: Math.round(Number(total_nok) * 100) // "99" NOK -> 9900 cents
  };
  const res = await fetch(`${BASE_URL}/receipts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}


