import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

// Icon for the bottom tab bar.
// The tab bar hands us a ColorValue, but Ionicons only accepts a plain colour,
// so we pass it through only when it is a string (which it always is for our tabs).
type TabIconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  color: ColorValue;
  size: number;
};

export function TabIcon({ name, color, size }: TabIconProps) {
  const iconColor = typeof color === "string" ? color : undefined;
  return <Ionicons name={name} size={size} color={iconColor} />;
}
