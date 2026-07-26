import { useSignIn } from "@clerk/expo";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Eye, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthModal from "../../components/AuthModal";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { hp, wp } from '../../utils/wp_hp';

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
      paddingHorizontal: wp(7),     // 28 -> ~7%
      paddingTop: hp(3.7),          // 30 -> ~3.7%
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: hp(5),         // 40 -> ~5%
    },
    backButton: {
      marginBottom: hp(2.5),       // 20 -> ~2.5%
      alignSelf: 'flex-start',
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: hp(3.7),       // 30 -> ~3.7%
    },
    logoPlaceholder1: {
      width: wp(27.5),             // 110 -> ~27.5% (Circle)
      height: wp(27.5),            // 110 -> ~27.5%
      borderRadius: wp(13.75),     // 50 -> ~half of width for circle shape
      backgroundColor: "#1A1A1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(1.5),       // 12 -> ~1.5%
    },
    logoPlaceholder: {
      width: wp(22.5),             // 90 -> ~22.5% (Circle)
      height: wp(22.5),            // 90 -> ~22.5%
      borderRadius: wp(11.25),     // 45 -> ~half of width
      backgroundColor: "#0e0e0e",
      justifyContent: "center",
      alignItems: "center",
    },
    logoImage: {
      width: wp(14),               // 56 -> ~14% (Square)
      height: wp(14),              // 56 -> ~14%
    },
    brandName: {
      fontSize: wp(6),             // 20 -> ~5%
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: hp(0.5),       // 4 -> ~0.5%
    },
    tagline: {
      fontSize: wp(4),             // 12 -> ~3%
      color: "#888888",
      fontStyle: "italic",
    },
    titleContainer: {
      marginBottom: hp(3.7),       // 30 -> ~3.7%
    },
    verifyTitleContainer: {
      alignItems: "center",
      marginBottom: hp(3.7),       // 30 -> ~3.7%
    },
    mainTitle: {
      fontSize: wp(7.5),           // 22 -> ~5.5%
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: hp(0.5),         // 8 -> ~1%
    },
    subtitle: {
      fontSize: wp(4),           // 13 -> ~3.2%
      color: "#A0A0A0",
      lineHeight: wp(5.5),         // 22 -> ~5.5%
    },
    inputContainer: {
      marginBottom: hp(2.5),       // 20 -> ~2.5%
    },
    passwordContainer: {
      marginBottom: hp(2.5),       // 20 -> ~2.5%
    },
    passwordHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: hp(1),         // 8 -> ~1%
    },
    label: {
      color: "#CCCCCC",
      fontSize: wp(3),             // 12 -> ~3%
      fontWeight: "500",
      marginBottom: hp(1),         // 8 -> ~1%
    },
    forgotText: {
      color: "#A0A0A0",
      fontSize: wp(3),             // 12 -> ~3%
      fontWeight: "600",
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",               // % string original hi best hai
      backgroundColor: "#1A1A1A",
      borderRadius: wp(3.5),       // 14 -> ~3.5%
      borderWidth: 1,              // Fixed
      borderColor: "#2A2A2A",
      paddingHorizontal: wp(3.5),  // 14 -> ~3.5%
    },
    inputIcon: {
      marginRight: wp(2.5),        // 10 -> ~2.5%
    },
    input: {
      flex: 1,
      paddingVertical: hp(2),      // 16 -> ~2%
      color: "#FFFFFF",
      fontSize: wp(3.2),           // 13 -> ~3.2%
    },
    inputWithTrailingIcon: {
      paddingRight: wp(1.5),       // 6 -> ~1.5%
    },
    trailingIcon: {
      padding: wp(1.5),            // 6 -> ~1.5%
    },
    primaryButton: {
      width: "100%",               // % string original hi best hai
      paddingVertical: hp(2),      // 16 -> ~2%
      borderRadius: wp(3.5),       // 14 -> ~3.5%
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      marginBottom: hp(2.5),       // 20 -> ~2.5%
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
      fontSize: wp(3.5),           // 14 -> ~3.5%
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2.5),       // 20 -> ~2.5%
    },
    dividerLine: {
      flex: 1,
      height: 1,                   // Fixed (Divider lines ko responsive nahi karna chahiye)
      backgroundColor: "#2A2A2A",
    },
    dividerText: {
      color: "#666666",
      fontSize: wp(2.5),           // 10 -> ~2.5%
      marginHorizontal: wp(3),     // 12 -> ~3%
    },
    googleButton: {
      flexDirection: "row",
      width: "100%",
      paddingVertical: hp(2),      // 16 -> ~2%
      borderRadius: wp(3.5),       // 14 -> ~3.5%
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,              // Fixed
      borderColor: "#333333",
      marginBottom: hp(3.7),       // 30 -> ~3.7%
    },
    googleButtonText: {
      color: "#FFFFFF",
      fontSize: wp(3.2),           // 13 -> ~3.2%
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
      marginBottom: hp(2.5),       // 20 -> ~2.5%
    },
    codeInput: {
      width: "100%",
      backgroundColor: "#1A1A1A",
      padding: wp(4),              // 16 -> ~4%
      borderRadius: wp(3.5),       // 14 -> ~3.5%
      color: "#FFFFFF",
      fontSize: wp(5.5),           // 22 -> ~5.5% (OTP text thoda bada hota hai)
      textAlign: "center",
      letterSpacing: wp(2),        // 8 -> ~2% (OTP ke letters ke beech ki space)
      borderWidth: 1,              // Fixed
      borderColor: "#2A2A2A",
    },
});