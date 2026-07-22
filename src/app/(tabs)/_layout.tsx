import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: 'gray',
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                },
            }}
        >
            {/* 1. HOME TAB */}
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
                    ),
                }}
            />

            {/* 2. CHALLENGES TAB */}
            <Tabs.Screen
                name="challenges"
                options={{
                    title: 'Challenges',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'trophy' : 'trophy-outline'} color={color} size={size} />
                    ),
                }}
            />

            {/* 3. CODE EDITOR TAB */}
            <Tabs.Screen
                name="codeEditor"
                options={{
                    title: 'Code Editor',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'code-slash' : 'code-slash-outline'} color={color} size={size} />
                    ),
                }}
            />

            {/* 4. SETTINGS TAB */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}