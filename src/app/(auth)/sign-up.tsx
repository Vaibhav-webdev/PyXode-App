import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState<string>("");
  const [firstName, setFirstName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [code, setCode] = React.useState<string>("");

  const loading = fetchStatus === "fetching";

  const handleSubmit = async () => {
    const { error } = await signUp.create({
      emailAddress,
      password,
      firstName,
      lastName,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");

          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as any);
          }
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const pendingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  return (
    <SafeAreaView
      className="flex-1 bg-white justify-center"
      style={{ padding: 28 }}
    >
      {!pendingVerification ? (
        <>
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="absolute top-12 left-5 z-10"
          >
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">
              Create Account
            </Text>
            <Text className="text-secondary">Sign up to get started</Text>
          </View>

          <View className="mb-4">
            {/* First Name */}
            <View className="mb-4">
              <Text className="text-primary font-medium mb-2">
                First Name
              </Text>

              <TextInput
                className="w-full px-4 bg-gray-100 p-4 rounded-xl text-black"
                placeholder="John"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-primary font-medium mb-2">
                Last Name
              </Text>

              <TextInput
                className="w-full px-4 bg-gray-100 p-4 rounded-xl text-black"
                placeholder="Doe"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <Text className="text-primary font-medium mb-2">Email</Text>

            <TextInput
              className="w-full px-4 bg-gray-100 bg-surface p-4 rounded-xl text-black"
              placeholder="user@example.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />

            {errors.fields.emailAddress && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.fields.emailAddress.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-black font-medium mb-2">Password</Text>

            <TextInput
              className="w-full bg-gray-100 px-4 bg-surface p-4 rounded-xl text-black"
              placeholder="********"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {errors.fields.password && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.fields.password.message}
              </Text>
            )}
          </View>

          {/* Submit */}
          <Pressable
            className={`w-full py-4 rounded-full items-center mb-10 ${
              loading || !emailAddress || !password
                ? "bg-gray-300"
                : "bg-black"
            }`}
            onPress={handleSubmit}
            disabled={loading || !emailAddress || !password || !firstName}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </Pressable>

          {/* Footer */}
          <View className="flex-row justify-center">
            <Text className="text-secondary">Already have an account? </Text>

            <Link href="/sign-in">
              <Text className="text-primary font-bold">Login</Text>
            </Link>
          </View>
          {/* Clerk captcha */}
          <View nativeID="clerk-captcha" />
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="absolute top-12 left-5 z-10"
          >
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Verification */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary mb-2">
              Verify Email
            </Text>

            <Text className="text-secondary text-center">
              Enter the code sent to your email
            </Text>
          </View>

          <View className="mb-6">
            <TextInput
              className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
              placeholder="123456"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />

            {errors.fields.code && (
              <Text className="text-red-500 text-xs mt-1 text-center">
                {errors.fields.code.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`w-full ${
              loading || !code ? "bg-gray-300" : "bg-black"
            } py-4 rounded-full items-center mb-4`}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signUp.verifications.sendEmailCode()}
            className="items-center"
          >
            <Text className="text-primary font-semibold">
              I need a new code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await signUp.reset();
              setCode("");
              setEmailAddress("");
            }}
            className="items-center mt-4"
          >
            <Text className="text-white bg-gray-600 p-3 rounded-xl font-semibold">
              Change Email
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}