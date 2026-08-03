import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SettingsContextType = {
  loading: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;

  setSoundEnabled: (value: boolean) => Promise<void>;
  setVibrationEnabled: (value: boolean) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const [soundEnabled, setSound] = useState(true);
  const [vibrationEnabled, setVibration] = useState(true);
  const [notificationsEnabled, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const sound = await AsyncStorage.getItem("soundEnabled");
      const vibration = await AsyncStorage.getItem("vibrationEnabled");
      const notification = await AsyncStorage.getItem("notificationsEnabled");

      if (sound === null) {
        await AsyncStorage.setItem("soundEnabled", "true");
        setSound(true);
      } else {
        setSound(sound === "true");
      }

      if (vibration === null) {
        await AsyncStorage.setItem("vibrationEnabled", "true");
        setVibration(true);
      } else {
        setVibration(vibration === "true");
      }

      if (notification !== null) {
        setNotifications(notification === "true");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const setSoundEnabled = async (value: boolean) => {
    setSound(value);
    await AsyncStorage.setItem("soundEnabled", value.toString());
  };

  const setVibrationEnabled = async (value: boolean) => {
    setVibration(value);
    await AsyncStorage.setItem(
      "vibrationEnabled",
      value.toString()
    );
  };

  const setNotificationsEnabled = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem(
      "notificationsEnabled",
      value.toString()
    );
  };
  return (
    <SettingsContext.Provider
      value={{
        loading,
        soundEnabled,
        vibrationEnabled,
        notificationsEnabled,

        setSoundEnabled,
        setVibrationEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}