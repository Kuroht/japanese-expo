import { Tabs } from "expo-router";

import { TabIcon } from "@/shared/components/TabIcon";
import { useTheme } from "@/shared/hooks/useTheme";

// Bottom tab bar: Study, Dictionary and Settings.
export default function TabLayout() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => <TabIcon name="school" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: "Dictionary",
          tabBarIcon: ({ color, size }) => <TabIcon name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <TabIcon name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
