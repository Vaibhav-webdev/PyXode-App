import { useAuth, useSignUp } from '@clerk/expo'
import { useSignInWithGoogle } from '@clerk/expo/google'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { ArrowLeft, Check, Eye, Home, Lock, Mail, User } from 'lucide-react-native'
import React from 'react'
import {
  ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthModal from '../../components/AuthModal'
import { hp, wp } from '../../utils/wp_hp'

export default function Page() {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const loading = fetchStatus === "fetching";

  // --- Popup / Modal state ---
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalMessage, setModalMessage] = React.useState("");

  const showError = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumberOrSpecial =
    /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  const handleSubmit = async () => {
    const { error } = await signUp.create({
      emailAddress,
      password,
      firstName,
      lastName
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (!error) await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    })

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')

          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    } else {
      console.error('Sign-up attempt not complete:', signUp)
    }
  }

  if (signUp.status === 'complete' || isSignedIn) {
    return null
  }

  const pendingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const isSubmitDisabled =
    loading ||
    !emailAddress ||
    !password ||
    !firstName ||
    !hasMinLength ||
    !hasUpperAndLower ||
    !hasNumberOrSpecial ||
    !passwordsMatch;

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
        return;
      }
      console.log('Google sign-in error:', err);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      {/* ScrollView added to make the screen scrollable */}
      <ScrollView
        showsVerticalScrollIndicator={false} // Yeh scroll bar hide karega
        contentContainerStyle={styles.scrollContent} // Neeche styles mein isko define karenge
        keyboardShouldPersistTaps="handled" // Yeh input field par tap karne par keyboard dismiss karega
      >
        {!pendingVerification ? (
          <>
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.backButton}
            >
              <ArrowLeft size={26} color="#FFFFFF" />
            </TouchableOpacity>

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
              <Text style={styles.tagline}>
                Create your account and start your learning journey.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Create Account</Text>
            <Text style={styles.sectionSubtitle}>
              Sign up to continue your learning journey.
            </Text>

            <View style={styles.formWrapper}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#888888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    placeholderTextColor="#666666"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#888888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your last name"
                    placeholderTextColor="#666666"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
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
                {errors?.fields?.emailAddress && (
                  <Text style={styles.errorText}>
                    {errors.fields.emailAddress.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Password */}
            <View style={styles.passwordWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#888888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithTrailingIcon]}
                  placeholder="Create a password"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showPassword}
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
              {errors?.fields?.password && (
                <Text style={styles.errorText}>
                  {errors.fields.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.passwordWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#888888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithTrailingIcon]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.trailingIcon}
                  hitSlop={10}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color="#888888" />
                  ) : (
                    <Eye size={18} color="#888888" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* Live Password Requirement Checklist */}
            <View style={styles.checklistContainer}>
              <RequirementRow met={hasMinLength} label="At least 8 characters" />
              <RequirementRow
                met={hasUpperAndLower}
                label="Include uppercase and lowercase letters"
              />
              <RequirementRow
                met={hasNumberOrSpecial}
                label="Include a number or special character"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <Pressable onPress={() => handleGoogleSignIn()} style={styles.googleButton}>
              <Home size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/sign-in">
                <Text style={styles.footerLink}>Login</Text>
              </Link>
            </View>

            {/* Clerk captcha */}
            <View nativeID="clerk-captcha" />
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
              <Text style={styles.subtitle}>
                Enter the code sent to your email
              </Text>
            </View>

            <View style={styles.codeInputWrapper}>
              <TextInput
                style={styles.codeInput}
                placeholder="123456"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />

              {errors?.fields?.code && (
                <Text style={styles.errorText}>
                  {errors.fields.code.message}
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleVerify}
              disabled={loading || !code}
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

            <TouchableOpacity
              onPress={async () => {
                try {
                  await signUp.verifications.sendEmailCode();
                } catch (err) {
                  showError("Couldn't Resend Code", getClerkErrorMessage(err));
                }
              }}
              style={styles.centerItem}
            >
              <Text style={styles.linkText}>I need a new code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await signUp.reset();
                setCode("");
                setEmailAddress("");
              }}
              style={styles.changeEmailButton}
            >
              <Text style={styles.changeEmailText}>Change Email</Text>
            </TouchableOpacity>
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

function RequirementRow({ met, label }) {
  return (
    <View style={styles.requirementRow}>
      <View
        style={[
          styles.requirementCheck,
          met && styles.requirementCheckMet,
        ]}
      >
        {met && <Check size={12} color="#000000" strokeWidth={3} />}
      </View>
      <Text
        style={[styles.requirementText, met && styles.requirementTextMet]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#121212",
      paddingHorizontal: wp(7),         // 28 -> ~7%
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: hp(2.5),           // 20 -> ~2.5%
    },
    backButton: {
      position: "absolute",
      top: hp(6),                       // 48 -> ~6%
      left: wp(5),                      // 20 -> ~5%
      zIndex: 10,
    },

    // --- Logo & Branding ---
    logoContainer: {
      alignItems: "center",
      marginBottom: hp(3),              // 24 -> ~3%
      marginTop: hp(5),                 // 40 -> ~5%
    },
    logoPlaceholder1: {
      width: wp(27.5),                  // 110 -> ~27.5% (Circle)
      height: wp(27.5),                 // 110 -> ~27.5%
      borderRadius: wp(13.75),          // 50 -> Half of width for perfect circle
      backgroundColor: "#1A1A1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(1.5),            // 12 -> ~1.5%
    },
    logoPlaceholder: {
      width: wp(22.5),                  // 90 -> ~22.5% (Circle)
      height: wp(22.5),                 // 90 -> ~22.5%
      borderRadius: wp(11.25),          // 45 -> Half of width
      backgroundColor: "#0e0e0e",
      justifyContent: "center",
      alignItems: "center",
    },
    logoImage: {
      width: wp(12),                    // 48 -> ~12% (Square)
      height: wp(12),                   // 48 -> ~12%
    },
    brandName: {
      fontSize: wp(5.5),                // 22 -> ~5.5%
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: hp(0.5),            // 4 -> ~0.5%
    },
    tagline: {
      fontSize: wp(3.5),                // 14 -> ~3.5%
      color: "#888888",
      fontStyle: "italic",
      textAlign: "center",
    },

    // --- Texts ---
    sectionTitle: {
      fontSize: wp(6.5),                // 26 -> ~6.5%
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: hp(0.75),           // 6 -> ~0.75%
    },
    sectionSubtitle: {
      fontSize: wp(3.5),                // 14 -> ~3.5%
      color: "#A0A0A0",
      marginBottom: hp(2.7),            // 22 -> ~2.7%
    },
    mainTitle: {
      fontSize: wp(7),                  // 28 -> ~7%
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: hp(1),              // 8 -> ~1%
      textAlign: "center",
    },
    subtitle: {
      fontSize: wp(3.7),                // 15 -> ~3.7%
      color: "#A0A0A0",
      textAlign: "center",
      lineHeight: wp(5.5),              // 22 -> ~5.5%
    },

    // --- Inputs ---
    formWrapper: {
      marginBottom: hp(0.5),            // 4 -> ~0.5%
    },
    inputGroup: {
      marginBottom: hp(2),              // 16 -> ~2%
    },
    passwordWrapper: {
      marginBottom: hp(2),              // 16 -> ~2%
    },
    label: {
      color: "#CCCCCC",
      fontSize: wp(3.5),                // 14 -> ~3.5%
      fontWeight: "500",
      marginBottom: hp(1),              // 8 -> ~1%
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",                    // String % best hai
      backgroundColor: "#1A1A1A",
      borderRadius: wp(3.5),            // 14 -> ~3.5%
      borderWidth: 1,                   // Fixed
      borderColor: "#2A2A2A",
      paddingHorizontal: wp(3.5),       // 14 -> ~3.5%
    },
    inputIcon: {
      marginRight: wp(2.5),             // 10 -> ~2.5%
    },
    input: {
      flex: 1,
      paddingVertical: hp(2),           // 16 -> ~2%
      color: "#FFFFFF",
      fontSize: wp(3.7),                // 15 -> ~3.7%
    },
    inputWithTrailingIcon: {
      paddingRight: wp(1.5),            // 6 -> ~1.5%
    },
    trailingIcon: {
      padding: wp(1.5),                 // 6 -> ~1.5%
    },
    errorText: {
      color: "#FF4D4D",
      marginTop: hp(0.75),              // 6 -> ~0.75%
      fontSize: wp(3.2),                // 13 -> ~3.2%
    },

    // --- Password Checklist ---
    checklistContainer: {
      backgroundColor: "#1A1A1A",
      borderRadius: wp(3.5),            // 14 -> ~3.5%
      borderWidth: 1,                   // Fixed
      borderColor: "#2A2A2A",
      padding: wp(3.5),                 // 14 -> ~3.5%
      marginBottom: hp(2.5),            // 20 -> ~2.5%
      gap: wp(2),                       // 8 -> ~2% (Vertical gap in flex column)
    },
    requirementRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    requirementCheck: {
      width: wp(4.5),                   // 18 -> ~4.5% (Circle)
      height: wp(4.5),                  // 18 -> ~4.5%
      borderRadius: wp(2.25),           // 9 -> Half of width
      borderWidth: 1.5,                 // Fixed
      borderColor: "#555555",
      marginRight: wp(2.5),             // 10 -> ~2.5%
      alignItems: "center",
      justifyContent: "center",
    },
    requirementCheckMet: {
      backgroundColor: "#4ADE80",
      borderColor: "#4ADE80",
    },
    requirementText: {
      color: "#888888",
      fontSize: wp(3.2),                // 13 -> ~3.2%
    },
    requirementTextMet: {
      color: "#CCCCCC",
    },

    // --- Buttons ---
    primaryButton: {
      width: "100%",
      paddingVertical: hp(1.7),         // 14 -> ~1.7%
      borderRadius: wp(3.5),            // 14 -> ~3.5%
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      marginBottom: hp(2.5),            // 20 -> ~2.5%
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
      fontSize: wp(4),                  // 16 -> ~4%
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2.5),            // 20 -> ~2.5%
    },
    dividerLine: {
      flex: 1,
      height: 1,                        // Fixed (Divider line)
      backgroundColor: "#2A2A2A",
    },
    dividerText: {
      color: "#666666",
      fontSize: wp(3),                  // 12 -> ~3%
      marginHorizontal: wp(3),          // 12 -> ~3%
    },
    googleButton: {
      flexDirection: "row",
      width: "100%",
      paddingVertical: hp(2),           // 16 -> ~2%
      borderRadius: wp(3.5),            // 14 -> ~3.5%
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,                   // Fixed
      borderColor: "#333333",
      marginBottom: hp(3),              // 24 -> ~3%
    },
    googleButtonText: {
      color: "#FFFFFF",
      fontSize: wp(3.7),                // 15 -> ~3.7%
      fontWeight: "500",
    },

    // --- Footer ---
    footerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: hp(2.5),            // 20 -> ~2.5%
    },
    footerText: {
      color: "#888888",
    },
    footerLink: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },

    // --- Verification Screen ---
    verifyTitleContainer: {
      alignItems: "center",
      marginBottom: hp(3.7),            // 30 -> ~3.7%
    },
    codeInputWrapper: {
      marginBottom: hp(2.5),            // 20 -> ~2.5%
    },
    codeInput: {
      width: "100%",
      backgroundColor: "#1A1A1A",
      padding: wp(4),                   // 16 -> ~4%
      borderRadius: wp(3.5),            // 14 -> ~3.5%
      color: "#FFFFFF",
      fontSize: wp(6),                  // 24 -> ~6% (OTP texts bigger)
      textAlign: "center",
      letterSpacing: wp(2),             // 8 -> ~2% (Spaces between OTP numbers)
      borderWidth: 1,                   // Fixed
      borderColor: "#2A2A2A",
    },
    centerItem: {
      alignItems: "center",
      marginVertical: hp(1.2),          // 10 -> ~1.2%
    },
    linkText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    changeEmailButton: {
      alignItems: "center",
      marginTop: hp(1.2),               // 10 -> ~1.2%
    },
    changeEmailText: {
      color: "#FFFFFF",
      backgroundColor: "#2D2D2D",
      paddingVertical: hp(1.5),         // 12 -> ~1.5%
      paddingHorizontal: wp(6),         // 24 -> ~6%
      borderRadius: wp(3),              // 12 -> ~3%
      fontWeight: "600",
      overflow: "hidden",
    },
});