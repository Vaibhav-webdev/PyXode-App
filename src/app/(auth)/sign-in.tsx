import { useSignIn } from "@clerk/expo";
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useSignInWithGoogle } from "@clerk/expo/google";
import { Link, useRouter } from "expo-router";
import {
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showEmailCode, setShowEmailCode] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl("/") as any);
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
          setShowEmailCode(true);
        }
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl("/") as any);
          },
        });
      }
    } catch (err) {
      setError("Invalid verification code");
    }

    setLoading(false);
  };

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();
      
      if (createdSessionId && setActive) {
        // Session active set karo - iska matlab login successful ho gaya
        await setActive({ session: createdSessionId });
        alert("Google Login Successful!");
        
        // Yahan par navigation add kar sakte ho 
        // Example: router.replace('/home');
      } else {
        // Agar MFA ya koi aur step pending ho
        alert("Additional step required");
      }
    } catch (err) {
      alert("Google Auth Failed:", err);
    }
  }, [startGoogleAuthenticationFlow]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* ScrollView added to make the screen scrollable */}
            <ScrollView
              showsVerticalScrollIndicator={false} // Yeh scroll bar hide karega
              contentContainerStyle={styles.scrollContent} // Neeche styles mein isko define karenge
              keyboardShouldPersistTaps="handled" // Yeh input field par tap karne par keyboard dismiss karega
            >
      {!showEmailCode ? (
        <>

          {/* Logo & Branding Area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder1}>
              <View style={styles.logoPlaceholder}>
                <Image
                  source={require("../../../assets/images/logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
               </View>
              </View>
            <Text style={styles.brandName}>Python</Text>
            <Text style={styles.tagline}>Learn. Code. Build the future.</Text>
          </View>

          {/* Title Area */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Login to continue your learning journey.
            </Text>
          </View>

          {/* Inputs Area */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#888888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666666"
                autoCapitalize="none"
                keyboardType="email-address"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
            </View>
          </View>

          <View style={styles.passwordContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={18} color="#888888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithTrailingIcon]}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.trailingIcon}
                hitSlop={10}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#888888" />
                ) : (
                  <Eye size={18} color="#888888" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Login Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading || !emailAddress || !password}
            style={({ pressed }) => [
              styles.primaryButton,
              (loading || !emailAddress || !password) && styles.primaryButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <Pressable onPress={handleGoogleSignIn} style={styles.googleButton}>
            <Home size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/sign-up">
              <Text style={styles.footerLink}>Sign up</Text>
            </Link>
          </View>
        </>
      ) : (
        /* VERIFY EMAIL SCREEN */
        <>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.backButton}
          >
            <ArrowLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.verifyTitleContainer}>
            <Text style={styles.mainTitle}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the code sent to your email</Text>
          </View>

          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="123456"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleVerify}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify</Text>
              )}
          </Pressable>
        </>
      )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 30,
  },
   scrollContent: {
    flexGrow: 1, // Is se content apni height according le sakta hai
    paddingBottom: 20, // Neeche thoda space rakhne ke liye jab tak scroll karte end par
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 10,
  },

  // --- Logo & Branding ---
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoPlaceholder1: {
    width: 110,
    height: 110,
    borderRadius: 50,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0e0e0e",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: "#888888",
    fontStyle: "italic",
  },

  // --- Texts ---
  titleContainer: {
    marginBottom: 30,
  },
  verifyTitleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#A0A0A0",
    lineHeight: 22,
  },

  // --- Inputs ---
  inputContainer: {
    marginBottom: 20,
  },
  passwordContainer: {
    marginBottom: 20,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  forgotText: {
    color: "#A0A0A0",
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: "#FFFFFF",
    fontSize: 13,
  },
  inputWithTrailingIcon: {
    paddingRight: 6,
  },
  trailingIcon: {
    padding: 6,
  },
  errorText: {
    color: "#FF4D4D",
    marginBottom: 12,
    fontSize: 11,
  },

  // --- Buttons ---
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    backgroundColor: "#3D3D3D",
  },
  pressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A2A2A",
  },
  dividerText: {
    color: "#666666",
    fontSize: 10,
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333333",
    marginBottom: 30,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#888888",
  },
  footerLink: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // --- Verification Code Input ---
  codeInputContainer: {
    marginBottom: 20,
  },
  codeInput: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    color: "#FFFFFF",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
});