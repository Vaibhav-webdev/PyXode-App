import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showEmailCode, setShowEmailCode] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        setError(error.errors[0].message);
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

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-7">
      {!showEmailCode ? (
        <>
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="absolute top-12 left-5 z-10"
          >
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-black mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-center">
              Sign in to continue
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-black font-medium mb-1">Email</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-xl text-black"
              placeholder="user@example.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          <View className="mb-6">
            <Text className="text-black font-medium mb-1">Password</Text>
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-xl text-black"
              placeholder="********"
              secureTextEntry
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />

            {error ? (
              <Text className="text-red-500 mt-2">{error}</Text>
            ) : null}
          </View>

          <Pressable
            className={`w-full py-4 rounded-full items-center mb-10 ${
              loading || !emailAddress || !password
                ? "bg-gray-300"
                : "bg-black"
            }`}
            onPress={handleSubmit}
            disabled={loading || !emailAddress || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/sign-up">
              <Text className="text-black font-bold">Sign up</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-black mb-2">
              Verify Email
            </Text>
            <Text className="text-gray-500 text-center">
              Enter the code sent to your email
            </Text>
          </View>

          <View className="mb-6">
            <TextInput
              className="w-full bg-gray-100 p-4 rounded-xl text-black text-center tracking-widest"
              placeholder="123456"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          </View>

          <Pressable
            className="w-full bg-black py-4 rounded-full items-center"
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify</Text>
            )}
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}