import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();

    const handlePress = async () => {
        try {
            await AsyncStorage.setItem('isNew', 'false');
            router.replace('/(auth)/PersonalizeScreen')
        } catch (error) {
            null
        }
    };
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.container}>
                {/* Top graphic section */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('../../../assets/images/onboarding_screen.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Pagination dots */}
                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>

                {/* Text content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome to</Text>
                    <Text style={styles.title}>Python Learning</Text>

                    <Text style={styles.subtitle}>
                        Learn Python in the most interactive and effective way. From
                        basics to advanced concepts — all in one place.
                    </Text>
                </View>

                {/* Continue button */}
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={handlePress}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>

                {/* Bottom home indicator bar */}
                <View style={styles.homeIndicator} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    imageWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: width * 0.95,
        height: width * 0.95,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3A3A3A',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
        width: 8,
        height: 8,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 16,
        fontSize: 15,
        lineHeight: 22,
        color: '#9A9A9A',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    button: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: '#000000',
        fontSize: 17,
        fontWeight: '600',
    },
    homeIndicator: {
        width: 134,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#4A4A4A',
        marginTop: 8,
    },
});