import { useSettings } from '@/context/SwitchContext';
import { SoundManager } from '@/hooks/SoundManager';
import { hp, wp } from '@/utils/wp_hp';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LogOut } from "lucide-react-native";
import { useEffect, useState } from 'react';
import BannerAdComponent from '@/components/ads/BannerAdsComponents';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity, Vibration, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: "#000000",
  card: "#131313",
  cardBorder: "#262626",
  cardLocked: "#0D0D0D",
  pill: "#1C1C1E",
  pillBorder: "#2A2A2A",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  textTertiary: "#5C5C60",
  track: "#2E2E2E",
  fillBar: "#FFFFFF",
  line: "#3A3A3A",
  sheetBg: "#161616",
};

const SettingsScreen = () => {
  const { vibrationEnabled, setVibrationEnabled, notificationsEnabled, setNotificationsEnabled, soundEnabled, setSoundEnabled } = useSettings();
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Load Settings from AsyncStorage on Mount
  useEffect(() => {
    loadSettings();
  }, []);

  const openLogoutModal = async () => {
    if (vibrationEnabled) {
      Vibration.vibrate(200)
    }
    await SoundManager.play("click");

    setLogoutModalVisible(true);
  };

  const closeLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  const loadSettings = async () => {
    try {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const vibration = await AsyncStorage.getItem('vibrationEnabled');
      const notifications = await AsyncStorage.getItem('notificationsEnabled');

      if (sound !== null) setSoundEnabled(JSON.parse(sound));
      if (vibration !== null) setVibrationEnabled(JSON.parse(vibration));
      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
    } catch (e) {
      console.log('Failed to load settings', e);
    }
  };

  // Save Settings to AsyncStorage
  const toggleSwitch = async (key: any, value: any) => {
    try {
      if (vibrationEnabled) {
        Vibration.vibrate(200)
      }
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (key === 'soundEnabled') setSoundEnabled(!value);
      if (key === 'vibrationEnabled') setVibrationEnabled(!value);
      if (key === 'notificationsEnabled') setNotificationsEnabled(!value);
    }
  };

  const handleLogout = async () => {
    closeLogoutModal();

    setTimeout(async () => {
      try {
        await AsyncStorage.removeItem('isNew');
        await AsyncStorage.removeItem('userName');

        router.replace('/(auth)/onboarding');
      } catch (error) {
        null
      }
    }, 220);
  };

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.container}>
      {/* Dark Mode ke liye StatusBar ko light karna padega */}
      <StatusBar backgroundColor={COLORS.bg} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Modal
          transparent
          visible={logoutModalVisible}
          animationType="none"
        >
          <View
            style={[
              styles.logoutOverlay,
            ]}
          >
            <View
              style={[
                styles.logoutCard,
              ]}
            >
              <View style={styles.iconCircle}>
                <LogOut
                  size={34}
                  color="#000"
                  strokeWidth={2.2}
                />
              </View>

              <Text style={styles.logoutTitle}>
                Sign out?
              </Text>

              <Text style={styles.logoutSubtitle}>
                You'll need to sign in again to access your account.
              </Text>

              <View style={styles.logoutButtons}>
                <TouchableOpacity
                  style={styles.cancelButton1}
                  onPress={closeLogoutModal}
                >
                  <Text style={styles.cancelText}>
                    Stay
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutText}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* PREFERENCES SECTION */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.sectionCard}>
          {/* Notifications */}
          <View style={styles.listItem}>
            <View style={styles.leftItem}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.itemText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.track, true: COLORS.fillBar }}
              thumbColor={COLORS.bg}
              ios_backgroundColor={COLORS.track}
              onValueChange={async (value) => {
                if (vibrationEnabled) {
                  Vibration.vibrate(200)
                }
                await SoundManager.play('click');;
                setNotificationsEnabled(value)
                toggleSwitch('notificationsEnabled', value)
              }}
              value={notificationsEnabled}
            />
          </View>

          {/* Sound */}
          <View style={styles.listItem}>
            <View style={styles.leftItem}>
              <Ionicons name="volume-high-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.itemText}>Sound</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.track, true: COLORS.fillBar }}
              thumbColor={COLORS.bg}
              ios_backgroundColor={COLORS.track}
              onValueChange={async (value) => {
                if (vibrationEnabled) {
                  Vibration.vibrate(200)
                }
                await SoundManager.play('click');;
                setSoundEnabled(value)
                toggleSwitch('soundEnabled', value)
              }}
              value={soundEnabled}
            />
          </View>

          {/* Vibration */}
          <View style={styles.listItem}>
            <View style={styles.leftItem}>
              <Ionicons name="phone-portrait-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.itemText}>Vibration</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.track, true: COLORS.fillBar }}
              thumbColor={COLORS.bg}
              ios_backgroundColor={COLORS.track}
              onValueChange={async (value) => {
                if (vibrationEnabled) {
                  Vibration.vibrate(200)
                }
                await SoundManager.play('click');;
                setVibrationEnabled(value)
                toggleSwitch('vibrationEnabled', value)
              }}
              value={vibrationEnabled}
            />
          </View>
        </View>

        <View >
          <TouchableOpacity onPress={openLogoutModal} style={styles.sectionCard1}>
            <View style={styles.leftItem}>
              <Ionicons name="log-out-outline" size={22} color={"#0000"} />
              <Text style={styles.itemText1}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <BannerAdComponent />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),     // 20 -> ~5%
    paddingVertical: hp(1.8),     // 15 -> ~1.8%
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: wp(7),              // 28 -> ~7%
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp(5),     // 20 -> ~5%
  },
  // Sections
  sectionTitle: {
    fontSize: wp(3.2),            // 13 -> ~3.2%
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: hp(1.2),        // 10 -> ~1.2%
    marginLeft: wp(1),            // 4 -> ~1%
    letterSpacing: wp(0.12),      // 0.5 -> ~0.12%
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: wp(4),          // 16 -> ~4%
    paddingHorizontal: wp(5),     // 20 -> ~5%
    marginBottom: hp(3),          // 25 -> ~3%
    borderWidth: 1,               // Fixed
    borderColor: COLORS.cardBorder,
  },
  sectionCard1: {
    display: "flex",
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: wp(4),          // 16 -> ~4%
    paddingHorizontal: wp(5),   
    paddingVertical: wp(3.9),  // 20 -> ~5%
    marginBottom: hp(3),          // 25 -> ~3%
    borderWidth: 1,               // Fixed
    borderColor: "#ffffff34",
  },
  // Status Modal Styles
  
  statusIconCircle: {
    width: wp(15),                // 60 -> ~15% (Circle)
    height: wp(15),               // 60 -> ~15%
    borderRadius: wp(7.5),        // 30 -> half of width
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.8),        // 15 -> ~1.8%
    borderWidth: 1,               // Fixed
    borderColor: COLORS.line,
  },
  logoutOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(6),               // 24 -> ~6%
  },
  logoutCard: {
    width: "100%",
    backgroundColor: "#131313",
    borderRadius: wp(7),          // 28 -> ~7%
    paddingHorizontal: wp(6),     // 24 -> ~6%
    paddingVertical: hp(3.5),     // 28 -> ~3.5%
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOpacity: 0.18,
    shadowRadius: 20,             // Shadows ko fixed rehne do
    shadowOffset: {
      width: 0,
      height: 10,                 // Shadows ko fixed rehne do
    },
    elevation: 12,                // Fixed
  },
  iconCircle: {
    width: wp(19.5),              // 78 -> ~19.5% (Circle)
    height: wp(19.5),             // 78 -> ~19.5%
    borderRadius: wp(9.75),       // 39 -> half of width
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2.5),        // 20 -> ~2.5%
  },
  logoutTitle: {
    fontSize: wp(6),              // 24 -> ~6%
    fontWeight: "700",
    color: "#ffffff",
  },
  logoutSubtitle: {
    marginTop: hp(1.2),           // 10 -> ~1.2%
    textAlign: "center",
    color: "#666",
    fontSize: wp(3.7),            // 15 -> ~3.7%
    lineHeight: wp(5.5),          // 22 -> ~5.5%
    paddingHorizontal: wp(2),     // 8 -> ~2%
  },
  logoutButtons: {
    flexDirection: "row",
    marginTop: hp(3.5),           // 28 -> ~3.5%
    width: "100%",
  },
  cancelButton1: {
    flex: 1,
    height: hp(6.5),              // 52 -> ~6.5%
    borderRadius: wp(3.5),        // 14 -> ~3.5%
    borderWidth: 1,               // Fixed
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2.5),         // 10 -> ~2.5%
  },
  logoutButton: {
    flex: 1,
    height: hp(6.5),              // 52 -> ~6.5%
    borderRadius: wp(3.5),        // 14 -> ~3.5%
    borderWidth: 1,               // Fixed
    borderColor: "#c4c4c4",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
    fontSize: wp(4),              // 16 -> ~4%
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(4),              // 16 -> ~4%
  },
  statusTitle: {
    fontSize: wp(5),              // 20 -> ~5%
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: hp(1),          // 8 -> ~1%
  },
  statusMessage: {
    fontSize: wp(3.7),            // 15 -> ~3.7%
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: hp(3),          // 25 -> ~3%
    lineHeight: wp(5.5),          // 22 -> ~5.5%
  },
  statusButton: {
    width: '100%',
    paddingVertical: hp(1.7),     // 14 -> ~1.7%
    borderRadius: wp(3),          // 12 -> ~3%
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: wp(4),              // 16 -> ~4%
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.8),     // 15 -> ~1.8%
    borderBottomWidth: 1,         // Fixed
    borderBottomColor: COLORS.line,
  },
  noBorder: {
    borderBottomWidth: 0,         // Fixed
  },
  leftItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: wp(4),              // 16 -> ~4%
    color: COLORS.white,
    marginLeft: wp(3.7),          // 15 -> ~3.7%
  },
  itemText1: {
    fontSize: wp(4),              // 16 -> ~4%
    fontWeight: 'black',
    color: "#000000",
    marginLeft: wp(2.5),          // 10 -> ~2.5%
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: wp(3.5),            // 14 -> ~3.5%
    color: COLORS.textSecondary,
    marginRight: wp(2),           // 8 -> ~2%
  },
  // Profile Card ke naye styles
  avatarContainer: {
    position: 'relative',
    width: wp(17.5),              // 70 -> ~17.5% (Square)
    height: wp(17.5),             // 70 -> ~17.5%
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.cardBorder,
    borderRadius: wp(3),          // 12 -> ~3% (Small square/circle)
    width: wp(6),                 // 24 -> ~6%
    height: wp(6),                // 24 -> ~6%
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,               // Fixed
    borderColor: COLORS.card,
  },
  editButton: {
    position: 'absolute',
    top: hp(1.8),                 // 15 -> ~1.8%
    right: wp(3.7),               // 15 -> ~3.7%
    backgroundColor: COLORS.pill,
    padding: wp(2),               // 8 -> ~2%
    borderRadius: wp(2),          // 8 -> ~2%
    borderWidth: 1,               // Fixed
    zIndex: 10,
    borderColor: COLORS.cardBorder,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),               // 20 -> ~5%
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.sheetBg,
    borderRadius: wp(4),          // 16 -> ~4%
    padding: wp(5),               // 20 -> ~5%
    borderWidth: 1,               // Fixed
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: wp(5.5),            // 22 -> ~5.5%
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: hp(2.5),        // 20 -> ~2.5%
    textAlign: 'center',
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: wp(3.5),            // 14 -> ~3.5%
    marginBottom: hp(1),          // 8 -> ~1%
    marginTop: hp(1.2),           // 10 -> ~1.2%
  },
  textInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.white,
    paddingVertical: hp(1.5),     // 12 -> ~1.5%
    paddingHorizontal: wp(3.7),   // 15 -> ~3.7%
    borderRadius: wp(2.5),        // 10 -> ~2.5%
    fontSize: wp(4),              // 16 -> ~4%
    borderWidth: 1,               // Fixed
    borderColor: COLORS.line,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(3),             // 25 -> ~3%
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.7),     // 14 -> ~1.7%
    borderRadius: wp(2.5),        // 10 -> ~2.5%
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.pill,
    marginRight: wp(2.5),         // 10 -> ~2.5%
    borderWidth: 1,               // Fixed
    borderColor: COLORS.line,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: wp(4),              // 16 -> ~4%
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.white,
  },
  saveButtonText: {
    color: COLORS.bg,
    fontSize: wp(4),              // 16 -> ~4%
    fontWeight: 'bold',
  },
});

export default SettingsScreen;