import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { TextInput } from 'react-native';
import { Modal, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@clerk/expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SoundManager } from '@/hooks/SoundManager';

// Aapka diya hua Color Schema
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
  const { signOut } = useAuth();
  const router = useRouter();
  // Local States for Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load Settings from AsyncStorage on Mount
  useEffect(() => {
    loadSettings();
  }, []);

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
      await AsyncStorage.setItem(key, JSON.stringify(value));
      if (key === 'soundEnabled') setSoundEnabled(value);
      if (key === 'vibrationEnabled') setVibrationEnabled(value);
      if (key === 'notificationsEnabled') setNotificationsEnabled(value);
    } catch (e) {
      console.log('Failed to save settings', e);
    }
  };

  // Format Clerk Date to "12 May 2024"
  const formatJoinDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleLogout = async () => {
    await SoundManager.play('click');
    try {
      await signOut();
      router.push("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
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
    await SoundManager.play('click');
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
              await SoundManager.play('click');
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
          onRequestClose={() => setIsEditModalVisible(false)}
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
                await SoundManager.play('click');
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
                await SoundManager.play('click');
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
                await SoundManager.play('click');
                toggleSwitch('vibrationEnabled', value)
              }}
              value={vibrationEnabled}
            />
          </View>
        </View>

        <View style={styles.sectionCard1}>
          <TouchableOpacity onPress={handleLogout} style={[styles.listItem, styles.noBorder]}>
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
    backgroundColor: COLORS.bg, // Pure Black BG
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Profile Card
  profileCard: {
    backgroundColor: COLORS.card, // #131313
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.cardBorder, // #262626
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.track, // Dark gray placeholder
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary, // #9A9A9E
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textTertiary, // #5C5C60
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pill, // #08081b
    borderWidth: 1,
    borderColor: COLORS.pillBorder, // #2A2A2A
    padding: 12,
    borderRadius: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  statText1: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.line, // #3A3A3A
    marginHorizontal: 10,
  },
  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionCard1: {
    display: "flex",
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ffffff34",
  },
  // Status Modal Styles
  statusModalContent: {
    width: '80%',
    backgroundColor: COLORS.card, // #131313
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder, // #262626
  },
  statusIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  statusButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line, // #3A3A3A
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  leftItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 15,
  },
  itemText1: {
    fontSize: 16,
    fontWeight: 'black',
    color: "#000000",
    marginLeft: 10,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  // Profile Card ke naye styles
  avatarContainer: {
    position: 'relative',
    width: 70,
    height: 70,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.cardBorder, // Dark gray (#262626)
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card, // Taaki image se blend ho jaye
  },
  editButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.pill, // #1C1C1E
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
    borderColor: COLORS.cardBorder, // #262626
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.sheetBg, // #161616
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: COLORS.bg, // Pure black input field
    color: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.pill,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.white, // White button for contrast
  },
  saveButtonText: {
    color: COLORS.bg, // Black text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;