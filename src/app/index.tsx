import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [route, setRoute] = useState<any>(''); // Kahan redirect karna hai wo store karega

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const isNew = await AsyncStorage.getItem('isNew');

        if (isNew === 'false') {
          setRoute('/(tabs)/home');
        } else {
          setRoute('/(auth)/onboarding');
        }
      } catch (error) {
        setRoute('/(auth)/onboarding');
      } finally {
        setIsReady(true);
      }
    };

    checkUserStatus();
  }, []);

  // Jab tak AsyncStorage se data check ho raha hai, ek loading spinner dikhayenge
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Data milne ke baad correct route par redirect kar denge
  return <Redirect href={route} />;
}