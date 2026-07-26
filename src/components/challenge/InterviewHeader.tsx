/**
 * InterviewHeader.tsx
 * --------------------
 * Sits at the top of the interview screen: shows progress dots for the
 * 3 questions, the combined countdown timer, a Skip button, and a
 * Next/Finish button that only appears once the current question is cleared.
 */
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface Props {
  currentIndex: number;
  total: number;
  timeLeft: number;
  totalTime: number;
  canAdvance: boolean;
  isLastQuestion: boolean;
  onSkip: () => void;
  onNext: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function InterviewHeader({
  currentIndex,
  total,
  timeLeft,
  totalTime,
  canAdvance,
  isLastQuestion,
  onSkip,
  onNext,
}: Props) {
  const { width, height } = useWindowDimensions();
  const wp = (p: number) => width * (p / 100);
  const hp = (p: number) => height * (p / 100);

  const styles = useMemo(() => {
    const wp = (p: number) => width * (p / 100);
    const hp = (p: number) => height * (p / 100);

    return StyleSheet.create({
      container: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        backgroundColor: '#0A0A0A', // Deep Black Background
        borderBottomWidth: 1,
        borderBottomColor: '#1F1F1F', // Subtle Divider
      },
      singleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Dots - Left | Timer - Center | Actions - Right
      },

      // 1. Dots Styling
      dots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.2),
      },
      dot: {
        width: wp(1.8),
        height: wp(1.8),
        borderRadius: wp(0.9),
        backgroundColor: '#27272A', // Dark Gray Inactive
      },
      dotDone: {
        backgroundColor: '#71717A', // Silver Completed
      },
      dotActive: {
        backgroundColor: '#FFFFFF', // White Active Indicator
        width: wp(3.8), // Smooth Pill Effect
      },

      // 2. Timer Badge Styling
      timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.2),
        backgroundColor: '#171717',
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#262626',
      },
      timerPillLow: {
        backgroundColor: '#262626',
        borderColor: '#FFFFFF', // Low time warning highlight
      },
      timerText: {
        color: '#D4D4D8',
        fontSize: wp(3.2),
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
      },
      timerTextLow: {
        color: '#FFFFFF',
        fontWeight: '800',
      },

      // 3. Right Action Buttons Group
      actionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
      },
      skipBtn: {
        paddingVertical: hp(0.5),
        paddingHorizontal: wp(2),
      },
      skipText: {
        color: '#A1A1AA',
        fontSize: wp(3.4),
        fontWeight: '500',
      },
      nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        backgroundColor: '#FFFFFF', // Solid White Accent
        paddingVertical: hp(0.6),
        paddingHorizontal: wp(3.2),
        borderRadius: 999,
      },
      nextText: {
        color: '#000000', // Crisp Black Text
        fontSize: wp(3.4),
        fontWeight: '700',
      },
    });
  }, [width, height]);
  const lowTime = timeLeft <= totalTime * 0.2;

  return (
    <View style={styles.container}>
      <View style={styles.singleRow}>
        {/* 1. Left: Progress Dots */}
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < currentIndex && styles.dotDone,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* 2. Center: Timer */}
        <View style={[styles.timerPill, lowTime && styles.timerPillLow]}>
          <Ionicons
            name="time-outline"
            size={wp(3.8)}
            color={lowTime ? '#FFFFFF' : '#A1A1AA'}
          />
          <Text style={[styles.timerText, lowTime && styles.timerTextLow]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        {/* 3. Right: Action Buttons (Skip & Next) */}
        <View style={styles.actionGroup}>
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {canAdvance && (
            <TouchableOpacity onPress={onNext} style={styles.nextBtn} activeOpacity={0.85}>
              <Text style={styles.nextText}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
              <Ionicons name="arrow-forward" size={wp(3.5)} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}