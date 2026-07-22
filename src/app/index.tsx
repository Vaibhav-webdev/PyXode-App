import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a'
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={"/(tabs)/home"} />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}