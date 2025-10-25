import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";

const USER_ID = "0bbc744d-2acc-4203-8025-62fd4dc5c8ad"; // replace with your real UUID
const BASE_URL = "http://localhost:4000";

export default function Rewards() {
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/receipts/rewards/${USER_ID}/total`);
      const data = await res.json();
      setPoints(data.total_points);
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      {loading ? <ActivityIndicator /> : (
        <>
          <Text style={{ fontSize: 16, color: "#666" }}>Total Points</Text>
          <Text style={{ fontSize: 48, fontWeight: "800" }}>{points ?? 0}</Text>
        </>
      )}
    </View>
  );
}
