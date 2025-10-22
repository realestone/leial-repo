import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { getReceipts } from "../lib/api";

export default function VaultScreen() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text style={{ fontWeight: "600" }}>{item.merchant_name || "—"}</Text>
      <Text>{(item.total_cents / 100).toFixed(2)} {item.currency}</Text>
      <Text style={{ color: "#666" }}>{new Date(item.purchased_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: "#fff" }}>
      {error ? <Text style={{ color: "red", marginTop: 12 }}>{error}</Text> : null}
      <FlatList
        data={receipts}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <View style={{ paddingVertical: 24 }}>
            <Text style={{ color: "#666" }}>
              No receipts yet. Add one in the “Add” tab →
            </Text>
          </View>
        }
      />
    </View>
  );
}
