import { wp } from '@/utils/wp_hp';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

const OfflineNotice = () => {
  const netInfo = useNetInfo();

  // Initial load par jab status null ho toh render mat karo
  if (netInfo.isConnected === null) {
    return null;
  }

  // Internet connectivity check
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  return (
    <Modal visible={isOffline} animationType="fade" transparent={false}>
      <View style={styles.container}>
        {/* Icon Container */}
        <View style={styles.iconWrapper}>
          <WifiOff size={42} color="#FFFFFF" strokeWidth={1.75} />
        </View>

        {/* Text Content */}
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>
          An active internet connection is required to run this application. Please check your Internet Connection.
        </Text>

        {/* Live Reconnecting Status Indicator */}
        <View style={styles.statusBadge}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.statusText}>Connecting to network...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Primary Black Background
    paddingHorizontal: wp(7),
  },
  iconWrapper: {
    width: wp(20),
    height: wp(20),
    borderRadius: 40,
    backgroundColor: '#111111', // Subtle dark card background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(6),
    borderWidth: 1,
    borderColor: '#222222', // Subtle white-shade border
  },
  title: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: '#FFFFFF', // Pure White text
    marginBottom: wp(2.5),
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: wp(3.5),
    color: '#A1A1AA', // Secondary White/Gray shade
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(4),
    borderRadius: 24,
    marginTop: wp(9),
    borderWidth: 1,
    borderColor: '#222222',
    gap: 10,
  },
  statusText: {
    fontSize: wp(3.25),
    color: '#E4E4E7', // Light Gray text
    fontWeight: '500',
  },
});

export default OfflineNotice;