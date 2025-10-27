import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { listReceipts, type Receipt } from "../lib/receipts";
import { getOrCreateUserId } from "../lib/session";

export default function Vault() {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      await getOrCreateUserId("Lukas");
      const rows = await listReceipts();
      setReceipts(rows);
    } catch (e: any) {
      Alert.alert("Error", e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={receipts}
        keyExtractor={(r) => r.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderColor: "#ddd" }}>
            <Text style={{ fontWeight: "600" }}>{item.merchant_name || "—"}</Text>
            <Text>
              {(item.total_cents / 100).toFixed(2)} {item.currency} · {new Date(item.purchased_at).toLocaleString()}
            </Text>
            {typeof item.points === "number" && <Text>Points: {item.points}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text>No receipts yet.</Text>}
      />
    </View>
  );
}
