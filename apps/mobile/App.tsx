import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Vault from "./src/screens/Vault";
import Add from "./src/screens/Add";
import Rewards from "./src/screens/Rewards";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "Vault") iconName = "folder";
            else if (route.name === "Add") iconName = "add-circle";
            else if (route.name === "Rewards") iconName = "gift";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Vault" component={Vault} />
        <Tab.Screen name="Add" component={Add} />
        <Tab.Screen name="Rewards" component={Rewards} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
