import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { ScrollView } from "react-native";
import React, { useState } from "react";
import { Mail, Lock, Eye, Home } from "lucide-react-native";
import {
  Pressable,
  TextInput,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthModal from "../../components/AuthModal"
import GoogleSignInButton from "../../components/GoogleSignInButton"

export default function Page() {
  const { signIn } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("")
  const [showEmailCode, setShowEmailCode] = useState(false)

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {

      setLoading(true)
      setError("")

      const { error } = await signIn.password({
        emailAddress,
        password,
      })

      if (error) {
        setError(error.errors[0].message)
        setLoading(false)
        return
      }

      if (signIn.status === "complete") {

        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl("/(tabs)/home"))
          },
        })

      } else if (signIn.status === "needs_second_factor") {

        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code"
        )

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode()
          setShowEmailCode(true)
        }
      }

    } catch (err) {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  const handleVerify = async () => {
    try {

      setLoading(true)

      await signIn.mfa.verifyEmailCode({ code })

      if (signIn.status === "complete") {

        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl("/(tabs)/home"))
          },
        })
      }

    } catch (err) {
      setError("Invalid verification code")
    }

    setLoading(false)
  }
  return (

    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            <GoogleSignInButton />

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
      <AuthModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
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