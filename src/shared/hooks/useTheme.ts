import { useColorScheme } from "react-native";

// The app's colours for light and dark mode, in one place.
// Screens call useTheme() so they follow the phone's dark-mode setting.
export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  danger: string;
};

const lightColors: ThemeColors = {
  background: "#f7f7f8",
  card: "#ffffff",
  text: "#1c1c1e",
  mutedText: "#6b6b70",
  border: "#dcdce0",
  primary: "#c2410c",
  danger: "#b91c1c",
};

const darkColors: ThemeColors = {
  background: "#121214",
  card: "#1e1e21",
  text: "#f2f2f5",
  mutedText: "#a0a0a8",
  border: "#333338",
  primary: "#fb923c",
  danger: "#f87171",
};

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  if (scheme === "dark") {
    return darkColors;
  }
  return lightColors;
}
