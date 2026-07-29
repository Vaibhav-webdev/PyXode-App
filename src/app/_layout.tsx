import { Stack } from "expo-router";
import OfflineNotice from "@/components/OfflineNotive";
import { SettingsProvider } from "../context/SwitchContext";

export default function RootLayout() {
  return (
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <OfflineNotice />
      </SettingsProvider>
  );
}