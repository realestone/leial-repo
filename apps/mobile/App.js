import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import VaultScreen from "./src/screens/Vault";
import AddScreen from "./src/screens/Add";
import Rewards from "./src/screens/Rewards";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Tab.Screen name="Vault" component={VaultScreen} />
        <Tab.Screen name="Add" component={AddScreen} />
        <Tab.Screen name="Rewards" component={Rewards} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

