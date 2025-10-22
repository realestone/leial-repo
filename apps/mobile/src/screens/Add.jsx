import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { createReceipt } from "../lib/api";

export default function AddScreen({ navigation }) {
  const [merchant, setMerchant] = useState("");
  const [total, setTotal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSave() {
    const cents = Math.round(parseFloat((total || "").replace(",", ".")) * 100);
    if (!cents || Number.isNaN(cents) || cents <= 0) {
      Alert.alert("Invalid amount", "Enter a number like 99.00");
      return;
    }
    setSubmitting(true);
    try {
      await createReceipt({
        user_id: "00000000-0000-0000-0000-000000000001",
        merchant_name: merchant || null,
        total_cents: cents,
      });
      Alert.alert("Saved", "Receipt stored.");
      setMerchant("");
      setTotal("");
      navigation.navigate("Vault");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" }}>
        <Text style={{ fontWeight: "700", fontSize: 18 }}>Add Receipt</Text>

        <Text>Merchant (optional)</Text>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          placeholder="e.g., Cafe Java"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
        />

        <Text>Total (e.g., 99.00)</Text>
        <TextInput
          value={total}
          onChangeText={setTotal}
          placeholder="e.g., 99.00"
          keyboardType="decimal-pad"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 }}
        />

        <Button title={submitting ? "Saving..." : "Save"} onPress={onSave} disabled={submitting} />
      </View>
    </KeyboardAvoidingView>
  );
}
