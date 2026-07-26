import { useSignInWithGoogle } from '@clerk/expo/google'
import { useRouter } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { hp, wp } from '@/utils/wp_hp';

interface GoogleSignInButtonProps {
  onSignInComplete?: () => void
  showDivider?: boolean
}

export default function GoogleSignInButton({
  onSignInComplete,
  showDivider = true,
}: GoogleSignInButtonProps) {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle()
  const router = useRouter()

  // Only render on iOS and Android
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null
  }

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow()

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })

        if (onSignInComplete) {
          onSignInComplete()
        } else {
          router.replace('/(tabs)/home')
        }
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
        return
      }

      Alert.alert('Error', err.message || 'An error occurred during Google sign-in')
      console.error('Sign in with Google error:', JSON.stringify(err, null, 2))
    }
  }

  return (
    <>
      <TouchableOpacity onPress={() => handleGoogleSignIn()} style={styles.googleButton}>
        <FontAwesome name="google" size={20} color="#ffffff" />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(2.5),           // 20 -> ~2.5%
    },
    googleButton: {
      flexDirection: "row",
      width: "100%",                     // String % best hai
      paddingVertical: hp(2),            // 16 -> ~2%
      borderRadius: wp(3.5),             // 14 -> ~3.5%
      gap: wp(2.25),                     // 9 -> ~2.25% (Horizontal gap between icon & text)
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,                    // Fixed (1px border responsive nahi karni)
      borderColor: "#333333",
      marginBottom: hp(3.7),             // 30 -> ~3.7%
    },
    googleButtonText: {
      color: "#FFFFFF",
      fontSize: wp(3.2),                 // 13 -> ~3.2%
      fontWeight: "500",
    },
    dividerLine: {
      flex: 1,
      height: 1,                         // Fixed (Thin divider lines ko scale nahi karna chahiye)
      backgroundColor: '#ccc',
    },
    dividerText: {
      marginHorizontal: wp(2.5),         // 10 -> ~2.5%
      color: '#666',
      // Agar isme fontSize bhi hai (e.g., 12), toh usko bhi wp(3) karna padega
    },
})