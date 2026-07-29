import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { Alert } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
interface BackendAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  };
  message?: string;
}

export default function Continue() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Step 1: App load hote hi Google SDK ko configure karo
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // .env file se client ID use karein
      offlineAccess: true,
    });
  }, []);

  const handleContinueWithGoogle = async (): Promise<void> => {
    setLoading(true);

    try {
      // Step 2: Check Google Play Services status
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Step 3: Account Chooser Modal Kholo
      const response = await GoogleSignin.signIn();

      // Step 3.1: Type Guard - TypeScript ko batao ki response Success hai
      if (!isSuccessResponse(response)) {
        // User ne cancel kar diya
        setLoading(false);
        return;
      }

      // Ab TypeScript response.data.idToken par koi error nahi dega
      const idToken = response.data.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Google Token praapt nahi ho saka.');
        setLoading(false);
        return;
      }

      // Step 4: ID Token ko Apne Node.js Backend par Bhejo
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data: BackendAuthResponse = await res.json();

      if (res.ok && data.success && data.token && data.user) {
        // Step 5: Session Token ko SecureStore me Save karo
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));

        // Step 6: Direct Home Page par Redirect Karo
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', data.message || 'Server authentication failed');
      }
    } catch (error: unknown) {
      console.error('Sign-In Error:', error);

      if (isErrorWithCode(error)) {
        // 1. DEVELOPER_ERROR ko direct string se check karo (Typescript type fix)
        if (error.code === 'DEVELOPER_ERROR') {
          Alert.alert(
            'Config Error',
            'SHA-1 key, Package name, ya Web Client ID Google Cloud Console me mismatch hai.'
          );
          return;
        }

        // 2. Baaki standard codes ke liye switch case
        switch (error.code) {
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services available nahi hain.');
            break;

          case statusCodes.SIGN_IN_CANCELLED:
            // User ne sign-in dialog cancel kar diya
            console.log('User cancelled sign-in flow');
            break;

          case statusCodes.IN_PROGRESS:
            // Flow pehle se active hai
            console.log('Sign-in is in progress');
            break;

          default:
            Alert.alert('Error', 'Google Sign-In complete nahi ho paaya.');
            break;
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.container}>
        {/* Top graphic section */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('@/assets/images/onboarding_screen.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.title}>Python Learning</Text>

          <Text style={styles.subtitle}>
            Learn Python in the most interactive and effective way. From
            basics to advanced concepts — all in one place.
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={handleContinueWithGoogle}
        >
          <FontAwesome name='google' size={25} style={{ marginRight: 10 }} />
          {loading ? <ActivityIndicator size={20} color={"#000000"} /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>

        {/* Bottom home indicator bar */}
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: width * 0.95,
    height: width * 0.95,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#9A9A9A',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 19,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4A4A4A',
    marginTop: 8,
  },
});