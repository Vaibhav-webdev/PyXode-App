import { useSettings } from '@/context/SwitchContext';
import { SoundManager } from '@/hooks/SoundManager';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LogOut } from "lucide-react-native";
import { hp, wp } from '@/utils/wp_hp';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const { user }: any = useUser();
  const { vibrationEnabled, setVibrationEnabled, notificationsEnabled, setNotificationsEnabled, soundEnabled, setSoundEnabled } = useSettings();
  const { signOut } = useAuth();
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Load Settings from AsyncStorage on Mount
  useEffect(() => {
    loadSettings();
  }, []);

  const openLogoutModal = async () => {
    if (vibrationEnabled) {
        
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

  // Format Clerk Date to "12 May 2024"
  const formatJoinDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleLogout = async () => {
    closeLogoutModal();

    setTimeout(async () => {
      try {
        await signOut();
        router.replace("/(auth)/sign-in");
      } catch (error) {
        console.log(error);
      }
    }, 220);
  };
  // Edit Profile Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState('success'); // 'success' ya 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. Gallery se image pick karke Clerk par upload karne ka function
  const pickAndUploadImage = async () => {
    if (vibrationEnabled) {
                Vibration.vibrate(200)
              }
              await SoundManager.play('click');;
    try {
      // Permission maango (agar pehle se na di ho)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry', 'We need camera roll permissions to upload images!');
        return;
      }

      // Gallery open karo
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Clerk ke liye base64 chahiye
      });

      if (!result.canceled) {
        setIsUploadingImage(true);
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        // Clerk me image update karo
        await user.setProfileImage({ file: base64Image });
        await user.reload(); // Clerk user data refresh karo

        setIsUploadingImage(false);
        showStatusModal('success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      setIsUploadingImage(false);
      showStatusModal('error', 'Failed to upload image. Please try again.');
    }
  };

  const showStatusModal = (type: any, message: any) => {
    setStatusType(type);
    setStatusMessage(message);
    setIsStatusModalVisible(true);
  };

  // 2. Profile Name update karne ka function
  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      await user.update({ firstName, lastName });
      await user.reload(); // Data refresh
      setIsUpdating(false);
      setIsEditModalVisible(false); // Modal close
      showStatusModal('success', 'Profile updated successfully!');
    } catch (error) {
      setIsUpdating(false);
      showStatusModal('error', 'Failed to update profile.');
    }
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

        {/* PROFILE SECTION */}
        <View style={styles.profileCard}>

          {/* Top Right Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={async () => {
              if (vibrationEnabled) {
                Vibration.vibrate(200)
              }
              if (vibrationEnabled) {
                Vibration.vibrate(200)
              }
              await SoundManager.play('click');;
              setIsEditModalVisible(true)
            }}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.profileHeader}>
            {/* Image with Camera Icon Overlay */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.imageUrl || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraIconContainer}
                onPress={pickAndUploadImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Name'}
              </Text>
              <Text style={styles.userRole}>Python Learner</Text>
              <Text style={styles.userEmail}>
                {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
              </Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText1}>Joined {formatJoinDate(user?.createdAt)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color={COLORS.white} />
              <Text style={styles.statText}>30+ Experience</Text>
            </View>
          </View>
        </View>

        {/* EDIT PROFILE MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => {
            setIsEditModalVisible(false)
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textTertiary}
              />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textTertiary}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={COLORS.bg} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

        {/* STATUS MODAL (Success / Error) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isStatusModalVisible}
          onRequestClose={() => setIsStatusModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.statusModalContent}>

              {/* Icon */}
              <View style={[
                styles.statusIconCircle,
                { backgroundColor: statusType === 'success' ? '#1C1C1E' : '#1C1C1E' } // Same bg, color se differentiate karenge
              ]}>
                <Ionicons
                  name={statusType === 'success' ? 'checkmark' : 'close'}
                  size={32}
                  color={statusType === 'success' ? '#34C759' : '#FF453A'} // Green for success, Red for error
                />
              </View>

              <Text style={styles.statusTitle}>
                {statusType === 'success' ? 'Success!' : 'Oops!'}
              </Text>

              <Text style={styles.statusMessage}>
                {statusMessage}
              </Text>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: statusType === 'success' ? COLORS.white : '#FF453A' }
                ]}
                onPress={() => setIsStatusModalVisible(false)}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: statusType === 'success' ? COLORS.bg : COLORS.white }
                ]}>
                  {statusType === 'success' ? 'Done' : 'Try Again'}
                </Text>
              </TouchableOpacity>

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

        <View style={styles.sectionCard1}>
          <TouchableOpacity onPress={openLogoutModal} style={[styles.listItem, styles.noBorder]}>
            <View style={styles.leftItem}>
              <Ionicons name="log-out-outline" size={22} color={"#0000"} />
              <Text style={styles.itemText1}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

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
    // Profile Card
    profileCard: {
      backgroundColor: COLORS.card,
      borderRadius: wp(4),          // 16 -> ~4%
      padding: wp(5),               // 20 -> ~5%
      marginBottom: hp(3),          // 25 -> ~3%
      borderWidth: 1,               // Fixed
      borderColor: COLORS.cardBorder,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2.5),        // 20 -> ~2.5%
    },
    avatar: {
      width: wp(17.5),              // 70 -> ~17.5% (Square/Circle ke liye width use karo)
      height: wp(17.5),             // 70 -> ~17.5%
      borderRadius: wp(8.75),       // 35 -> half of width for perfect circle
      backgroundColor: COLORS.track,
    },
    profileInfo: {
      marginLeft: wp(3.7),          // 15 -> ~3.7%
      flex: 1,
    },
    userName: {
      fontSize: wp(5),              // 20 -> ~5%
      fontWeight: 'bold',
      color: COLORS.white,
      marginBottom: hp(0.5),        // 4 -> ~0.5%
    },
    userRole: {
      fontSize: wp(3.5),            // 14 -> ~3.5%
      color: COLORS.textSecondary,
      fontWeight: '600',
      marginBottom: hp(0.5),        // 4 -> ~0.5%
    },
    userEmail: {
      fontSize: wp(3.2),            // 13 -> ~3.2%
      color: COLORS.textTertiary,
    },
    profileStats: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.pill,
      borderWidth: 1,               // Fixed
      borderColor: COLORS.pillBorder,
      padding: wp(3),               // 12 -> ~3%
      borderRadius: wp(2.5),        // 10 -> ~2.5%
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statText: {
      fontSize: wp(3),              // 12 -> ~3%
      color: COLORS.textSecondary,
      marginLeft: wp(1.5),          // 6 -> ~1.5%
      fontWeight: '500',
    },
    statText1: {
      fontSize: wp(3),              // 12 -> ~3%
      color: COLORS.textSecondary,
      marginRight: wp(1.5),         // 6 -> ~1.5%
      marginLeft: wp(1),            // 4 -> ~1%
      fontWeight: '500',
    },
    statDivider: {
      width: 1,                     // Fixed (border width jaisa)
      height: hp(2.5),              // 20 -> ~2.5%
      backgroundColor: COLORS.line,
      marginHorizontal: wp(2.5),    // 10 -> ~2.5%
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
      paddingHorizontal: wp(5),     // 20 -> ~5%
      marginBottom: hp(3),          // 25 -> ~3%
      borderWidth: 1,               // Fixed
      borderColor: "#ffffff34",
    },
    // Status Modal Styles
    statusModalContent: {
      width: '80%',                 // % string rehne do, RN khud handle karta hai
      backgroundColor: COLORS.card,
      borderRadius: wp(5),          // 20 -> ~5%
      padding: wp(6.2),             // 25 -> ~6.2%
      alignItems: 'center',
      borderWidth: 1,               // Fixed
      borderColor: COLORS.cardBorder,
    },
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