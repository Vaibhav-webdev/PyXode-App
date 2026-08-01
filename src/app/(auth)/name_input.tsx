import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { User, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.55;

export default function PersonalizeScreen() {
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <Text style={styles.title}>Let's personalize</Text>
            <Text style={styles.title}>your experience</Text>

            <Text style={styles.subtitle}>
              Enter your name to get started{'\n'}on your Python learning
              journey.
            </Text>
          </View>

          {/* Name input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#8A8A8A" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#6B6B6B"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {/* Continue button */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight
              size={18}
              color="#000000"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <View style={styles.homeIndicator} />
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  logoSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  dotsGrid: {
    position: 'absolute',
    top: '15%',
  },
  dotsLeft: {
    left: 0,
  },
  dotsRight: {
    right: 0,
  },
  dotRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dotSmall: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: '#9A9A9A',
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0D0D0D',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  button: {
    flexDirection: 'row',
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