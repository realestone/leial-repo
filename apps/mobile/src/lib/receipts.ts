import { api } from "./api";
import { currentUserId } from "./session";

export type Receipt = {
  id: string;
  merchant_name: string | null;
  total_cents: number;
  currency: string;
  purchased_at: string;
  points?: number;
};

/** Create a receipt for the current user */
export async function createReceipt({
  merchant_name,
  total_nok,
}: { merchant_name?: string; total_nok: string | number }) {
  const user_id = await currentUserId();
  if (!user_id) throw new Error("No user");

  const payload = {
    user_id,
    merchant_name,
    total_cents: Math.round(Number(total_nok) * 100),
  };

  return api<Receipt>("/receipts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Fetch total points for the current user */
export async function getTotalPoints(): Promise<{ total_points: number }> {
  const user_id = await currentUserId();
  if (!user_id) throw new Error("No user");
  return api<{ total_points: number }>(`/receipts/rewards/${user_id}/total`);
}

/** List latest receipts (typed) */
export async function listReceipts(limit = 100): Promise<Receipt[]> {
  return api<Receipt[]>(`/receipts?limit=${limit}`);
}
