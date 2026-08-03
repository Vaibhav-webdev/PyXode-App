import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- Import AsyncStorage
import { useRouter } from 'expo-router';
import { ArrowRight, User } from 'lucide-react-native';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.85;

export default function NameInput() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleContinue = async () => {
        setLoading(true)
        // Check if name is empty
        if (name.trim() === '') {
            setError('This field must be filled'); // Set error message
            return;
        }

        try {
            // Current time generate karna (string format mein)
            const currentTime = new Date().toISOString();

            // Values ko AsyncStorage mein save karna
            await AsyncStorage.setItem('userName', name);
            await AsyncStorage.setItem('isNew', 'false');
            await AsyncStorage.setItem('currentTime', currentTime); // Nayi key add ho gayi

            setLoading(false)
            router.replace('/(tabs)/home');
        } catch (e) {
            // null ki jagah console.log use karna better practice hai debugging ke liye
            console.error("Error saving to AsyncStorage:", e);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        {/* Top section with logo + dots */}
                        <View style={styles.logoSection}>
                            {/* Decorative dotted grids */}
                            <View style={[styles.dotsGrid, styles.dotsLeft]}>
                                {Array.from({ length: 5 }).map((_, row) => (
                                    <View key={row} style={styles.dotRow}>
                                        {Array.from({ length: 5 }).map((__, col) => (
                                            <View key={col} style={styles.dotSmall} />
                                        ))}
                                    </View>
                                ))}
                            </View>
                            <View style={[styles.dotsGrid, styles.dotsRight]}>
                                {Array.from({ length: 5 }).map((_, row) => (
                                    <View key={row} style={styles.dotRow}>
                                        {Array.from({ length: 5 }).map((__, col) => (
                                            <View key={col} style={styles.dotSmall} />
                                        ))}
                                    </View>
                                ))}
                            </View>

                            {/* Circular python logo */}
                            <View style={styles.logoCircle}>
                                <Image
                                    source={require('../../../assets/images/onboarding_screen.png')}
                                    style={styles.logoImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>

                        {/* Text content */}
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Let's personalize your</Text>
                            <Text style={styles.title}>experience</Text>

                            <Text style={styles.subtitle}>
                                Enter your name to get started on your Python learning
                                journey.
                            </Text>
                        </View>

                        {/* Name input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>What should we call you?</Text>

                            {/* Input wrapper mein error aane par red border dikhane ke liye condition */}
                            <View style={[styles.inputWrapper, error ? styles.inputErrorBorder : null]}>
                                <User size={20} color={error ? "#FF3B30" : "#8A8A8A"} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#6B6B6B"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (error) setError(''); // Jaise hi user type kare, error clear ho jaye
                                    }}
                                    autoCapitalize="words"
                                    returnKeyType="done"
                                />
                            </View>

                            {/* Error Message UI */}
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        </View>

                        <View style={{ flex: 1 }} />

                        {/* Continue button */}
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.85}
                            onPress={handleContinue}
                        >
                            {loading ? <ActivityIndicator color={'#000000'} /> : <View style={styles.button1}>
                                <Text style={styles.buttonText}>Continue</Text>
                                <ArrowRight size={18} color="#000000" style={{ marginLeft: 8 }}/>
                            </View>}
                        </TouchableOpacity>

                        <View style={styles.homeIndicator} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Ensure your styles object includes these newly added/used styles:
const styles = StyleSheet.create({
    // ... aapke purane styles yahan rahenge

    // New styles for error handling (Isko apne StyleSheet me add kar lena)
    errorText: {
        color: '#FF3B30', // Red color
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
        fontWeight: '500',
    },
    inputErrorBorder: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },

    safeArea: { flex: 1, backgroundColor: '#000' },
    container: { flex: 1, padding: 10 },
    logoSection: { alignItems: 'center', marginVertical: 20 },
    dotsGrid: { position: 'absolute' },
    dotsLeft: { left: 0 },
    dotsRight: { right: 0 },
    dotRow: { flexDirection: 'row' },
    dotSmall: { width: 6, height: 6, borderRadius: 2, backgroundColor: '#333', margin: 4 },
    logoCircle: { width: LOGO_SIZE, height: LOGO_SIZE, overflow: 'hidden' },
    logoImage: { width: '100%', height: '100%' },
    textContainer: { marginBottom: 30 },
    title: { fontSize: 32, color: '#FFF', fontWeight: 'bold' },
    subtitle: { fontSize: 16, color: '#A0A0A0', marginTop: 10 },
    inputSection: { marginBottom: 20 },
    inputLabel: { color: '#FFF', marginBottom: 10, fontSize: 16 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 15, height: 55 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#FFF', fontSize: 16 },
    button: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    button1: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', },
    buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    homeIndicator: { height: 5, backgroundColor: '#333', borderRadius: 3, width: 134, alignSelf: 'center', marginBottom: 10 },
});