import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Image } from 'expo-image'
import { ArrowLeft, User, Mail, Lock, Eye, Home, Check } from 'lucide-react-native'
import { StatusBar } from 'react-native'
import { useSignInWithGoogle } from '@clerk/expo/google'
import { ScrollView } from 'react-native'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AuthModal from '../../components/AuthModal'

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
    paddingHorizontal: 28,
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
    marginBottom: 24,
    marginTop: 40,
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
    width: 48,
    height: 48,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#888888",
    fontStyle: "italic",
    textAlign: "center",
  },

  // --- Texts ---
  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 22,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#A0A0A0",
    textAlign: "center",
    lineHeight: 22,
  },

  // --- Inputs ---
  formWrapper: {
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  passwordWrapper: {
    marginBottom: 16,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
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
    fontSize: 15,
  },
  inputWithTrailingIcon: {
    paddingRight: 6,
  },
  trailingIcon: {
    padding: 6,
  },
  errorText: {
    color: "#FF4D4D",
    marginTop: 6,
    fontSize: 13,
  },

  // --- Password Checklist ---
  checklistContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#555555",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementCheckMet: {
    backgroundColor: "#4ADE80",
    borderColor: "#4ADE80",
  },
  requirementText: {
    color: "#888888",
    fontSize: 13,
  },
  requirementTextMet: {
    color: "#CCCCCC",
  },

  // --- Buttons ---
  primaryButton: {
    width: "100%",
    paddingVertical: 14,
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
    fontSize: 16,
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
    fontSize: 12,
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
    marginBottom: 24,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
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
    marginBottom: 30,
  },
  codeInputWrapper: {
    marginBottom: 20,
  },
  codeInput: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    color: "#FFFFFF",
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  centerItem: {
    alignItems: "center",
    marginVertical: 10,
  },
  linkText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  changeEmailButton: {
    alignItems: "center",
    marginTop: 10,
  },
  changeEmailText: {
    color: "#FFFFFF",
    backgroundColor: "#2D2D2D",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
});