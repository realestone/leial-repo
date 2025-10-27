import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { createReceipt } from "../lib/receipts";
import { getOrCreateUserId } from "../lib/session";

export default function Add() {
  const [merchant, setMerchant] = useState("");
  const [totalNok, setTotalNok] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    try {
      setSaving(true);
      await getOrCreateUserId("Lukas"); // ensure user exists
      await createReceipt({
        merchant_name: merchant || undefined,
        total_nok: totalNok,
      });
      setMerchant("");
      setTotalNok("");
      Alert.alert("Saved", "Receipt added.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Add Receipt</Text>

      <Text>Merchant (optional)</Text>
      <TextInput
        placeholder="Cafe Java"
        value={merchant}
        onChangeText={setMerchant}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 }}
      />

      <Text>Total (e.g., 99.00)</Text>
      <TextInput
        placeholder="99"
        keyboardType="decimal-pad"
        value={totalNok}
        onChangeText={setTotalNok}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 }}
      />

      <Button title={saving ? "Saving..." : "Save"} onPress={onSave} disabled={saving || !totalNok} />
    </View>
  );
}
