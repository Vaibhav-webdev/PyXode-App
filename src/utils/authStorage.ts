import * as SecureStore from 'expo-secure-store';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// 1. Session Save Karein (Login ke waqt)
export const saveSession = async (token: string, user: UserProfile) => {
  try {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// 2. Session Fetch Karein (App Startup par)
export const getSession = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    const userDataStr = await SecureStore.getItemAsync('userData');
    const user: UserProfile | null = userDataStr ? JSON.parse(userDataStr) : null;

    return { token, user };
  } catch (error) {
    console.error('Error reading session:', error);
    return { token: null, user: null };
  }
};

// 3. Session Clear Karein (Logout ke waqt)
export const clearSession = async () => {
  try {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};