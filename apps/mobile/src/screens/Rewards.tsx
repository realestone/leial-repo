import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button } from "react-native";
import { getTotalPoints, createReceipt } from "../lib/receipts";
import { getOrCreateUserId } from "../lib/session";

export default function Rewards() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      await getOrCreateUserId("Lukas");
      const { total_points } = await getTotalPoints();
      setPoints(total_points);
    } catch (e: any) {
      Alert.alert("Error", e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={{ fontSize: 16, color: "#666" }}>Total Points</Text>
          <Text style={{ fontSize: 48, fontWeight: "800" }}>{points ?? 0}</Text>
          <Button title="Refresh" onPress={load} />
          {/* demo helper to verify flow */}
          <Button
            title="Add demo receipt"
            onPress={async () => {
              await createReceipt({ merchant_name: "Cafe Java", total_nok: 159 });
              load();
            }}
          />
        </>
      )}
    </View>
  );
}
