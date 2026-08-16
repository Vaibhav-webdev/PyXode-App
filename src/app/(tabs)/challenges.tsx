import BannerAdComponent_Challenge from '@/components/ads/BannerAdsComponents_3';
import ResultScreen from '@/components/CompletionReward';
import { useSettings } from '@/context/SwitchContext';
import { SoundManager } from '@/hooks/SoundManager';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CodeChallenge from '../../components/challenge/CodeChallenge';
import { generateInterviewPack, INTERVIEW_META, type Challenge } from '../../components/challenge/interview_data';
import InterviewHeader from '../../components/challenge/InterviewHeader';
import ObjectiveChallenge from '../../components/challenge/ObjectiveChallenge';
import PyodideRunner, { PyodideRunnerHandle, RunTestResult } from '../../components/challenge/PyodideRunner';

type Phase = 'intro' | 'interview' | 'result';
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2990397099587279/8479661754';
const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, { requestNonPersonalizedAdsOnly: true, });

interface QuestionStatus {
  scoreFraction: number;
  cleared: boolean;
}

export default function ChallengesScreen() {
  const { width, height } = useWindowDimensions();
  const wp = (p: number) => width * (p / 100);
  const hp = (p: number) => height * (p / 100);

  const styles = useMemo(() => {
    const wp = (p: number) => width * (p / 100);
    const hp = (p: number) => height * (p / 100);

    return StyleSheet.create({
      root: { flex: 1, backgroundColor: '#050505' },
      flex: { flex: 1 },
      introContainer: {
        flex: 1,
        padding: wp(6),
        paddingTop: wp(10),
        justifyContent: 'center',
        backgroundColor: '#0A0A0A', // Dark Black Theme Background
      },

      // Centering Header items without breaking full width layout
      headerBox: {
        alignItems: 'center',
        marginBottom: hp(1),
      },
      introBadge: {
        width: wp(19),
        height: wp(19),
        borderRadius: wp(7),
        backgroundColor: '#171717', // Dark Gray Shade
        borderWidth: 1,
        borderColor: '#262626', // Subtle Gray Border
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
      },
      introTitle: {
        color: '#FFFFFF',
        fontSize: wp(7.5),
        fontWeight: '800',
        textAlign: 'center',
      },
      introSubtitle: {
        color: '#A1A1AA', // Off-white / Soft Gray
        fontSize: wp(3.9),
        lineHeight: wp(5.6),
        marginTop: hp(1.2),
        textAlign: 'center',
      },

      // Rules Box (Sleek Dark Card style)
      rulesBox: {
        marginTop: hp(3.5),
        gap: hp(1.8),
        backgroundColor: '#121212',
        padding: wp(4.5),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#262626',
      },
      ruleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: wp(3),
      },
      ruleBullet: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        backgroundColor: '#FFFFFF', // Pure White Bullet
        marginTop: hp(0.8),
      },
      ruleText: {
        color: '#D4D4D8',
        fontSize: wp(3.6),
        lineHeight: wp(5.2),
        flex: 1,
      },

      // Primary Action Button
      startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2.5),
        backgroundColor: '#FFFFFF', // High-contrast Solid White
        paddingVertical: hp(2),
        borderRadius: 16,
        marginTop: hp(4),
      },
      startBtnText: {
        color: '#000000', // Black text on White Button
        fontSize: wp(4.2),
        fontWeight: '800',
      },
    });
  }, [width, height]); // Triggers refresh automatically if dimensions change

  const { vibrationEnabled } = useSettings()
  const [phase, setPhase] = useState<Phase>('intro');
  const [pack, setPack] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState<QuestionStatus[]>([]);
  const [canAdvance, setCanAdvance] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef<PyodideRunnerHandle>(null);
  const currentChallenge = pack[currentIndex];
  const [loaded, setLoaded] = useState<boolean>(false);
  const startInterviewRef = useRef<(() => Promise<void>) | null>(null);

  // ── Combined countdown timer ──
  useEffect(() => {
    if (phase !== 'interview') return;
    if (timeLeft <= 0) {
      finishInterview(statuses);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const executeStartInterview = useCallback(async (): Promise<void> => {
    if (vibrationEnabled) Vibration.vibrate(200);
    await SoundManager.play('click');
    const newPack = generateInterviewPack();
    const total = newPack.reduce((sum: number, q: { timeLimit: number }) => sum + q.timeLimit, 0);
    setPack(newPack);
    setStatuses(newPack.map(() => ({ scoreFraction: 0, cleared: false })));
    setCurrentIndex(0);
    setCanAdvance(false);
    setTotalTime(total);
    setTimeLeft(total);
    setPhase('interview');
  }, [vibrationEnabled]); // Yahan apne required dependencies add karein

  // Sync ref with latest function reference
  startInterviewRef.current = executeStartInterview;

  // 2. Ad Listeners
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      // Ad close hone par interview trigger hoga
      startInterviewRef.current?.();
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  // 3. Button Click Handler (Isse UI Button ke onPress me dein)
  const startInterview = (): void => {
    if (loaded) {
      interstitial.show();
    } else {
      executeStartInterview();
    }
  };

  const updateStatus = useCallback((index: number, scoreFraction: number) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = { scoreFraction, cleared: true };
      return next;
    });
  }, []);

  const goToNext = useCallback(async () => {
    await SoundManager.play('click')
    if (vibrationEnabled) Vibration.vibrate(200)
    setCanAdvance(false);
    if (currentIndex + 1 >= pack.length) {
      finishInterview(statuses);
    } else {
      setCurrentIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, pack.length, statuses]);

  const handleSkip = useCallback(async () => {
    await SoundManager.play('click')
    if (vibrationEnabled) Vibration.vibrate(200)
    updateStatus(currentIndex, 0);
    goToNext();
  }, [currentIndex, updateStatus, goToNext]);

  const handleObjectiveAnswered = useCallback(
    (selectedIndex: number) => {
      const challenge = pack[currentIndex];
      if (challenge?.type !== 'objective') return;
      const correct = selectedIndex === challenge.correctIndex;
      updateStatus(currentIndex, correct ? 1 : 0);
      setCanAdvance(true);
    },
    [pack, currentIndex, updateStatus]
  );

  const handleCodeResult = useCallback(
    (allPassed: boolean, results: RunTestResult[]) => {
      const fraction = results.length ? results.filter((r) => r.passed).length / results.length : 0;
      updateStatus(currentIndex, fraction);
      setCanAdvance(allPassed);
    },
    [currentIndex, updateStatus]
  );

  // Called on timeout OR after the last question — computes the final score
  const finishInterview = useCallback(
    (finalStatuses: QuestionStatus[]) => {
      setPhase('result');
    },
    []
  );

  const handleRetry = useCallback(async () => {
    await SoundManager.play('click')
    if (vibrationEnabled) Vibration.vibrate(200)
    startInterview();
  }, [startInterview]);

  const handleGoHome = useCallback(async () => {
    await SoundManager.play('celebrate')
    if (vibrationEnabled) Vibration.vibrate(300)
    setPhase('intro');
  }, []);

  // ── Derived score for the Result screen ──
  const scorePercent =
    statuses.length > 0
      ? Math.round((statuses.reduce((sum, s) => sum + s.scoreFraction, 0) / statuses.length) * 100)
      : 0;
  const xpReward = pack.reduce((sum, q, i) => sum + Math.round(q.xp * (statuses[i]?.scoreFraction ?? 0)), 0);

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'top']}>
      <PyodideRunner ref={pyodideRef} onReadyChange={setPyodideReady} />

      {phase === 'intro' && (
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <View style={styles.introContainer}>
            <View style={styles.headerBox}>
              <View style={styles.introBadge}>
                <Ionicons name="terminal-outline" size={wp(8.5)} color="#FFFFFF" />
              </View>
              <Text style={styles.introTitle}>{INTERVIEW_META.title}</Text>
              <Text style={styles.introSubtitle}>{INTERVIEW_META.subtitle}</Text>
            </View>

            <View style={styles.rulesBox}>
              {INTERVIEW_META.rules.map((rule: any, i: any) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={styles.ruleBullet} />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startInterview} activeOpacity={0.85}>
              <Text style={styles.startBtnText}>Start the Interview</Text>
              <Ionicons name="arrow-forward" size={wp(4.5)} color="#050505" />
            </TouchableOpacity>
            <BannerAdComponent_Challenge />
          </View>
        </ScrollView>
      )}

      {phase === 'interview' && currentChallenge && (
        <View style={styles.flex}>
          <InterviewHeader
            currentIndex={currentIndex}
            total={pack.length}
            timeLeft={timeLeft}
            totalTime={totalTime}
            canAdvance={canAdvance}
            isLastQuestion={currentIndex === pack.length - 1}
            onSkip={handleSkip}
            onNext={goToNext}
          />

          {currentChallenge.type === 'objective' ? (
            <ObjectiveChallenge challenge={currentChallenge} onAnswered={handleObjectiveAnswered} />
          ) : (
            <CodeChallenge
              challenge={currentChallenge}
              pyodideRef={pyodideRef}
              pyodideReady={pyodideReady}
              onResult={handleCodeResult}
            />
          )}
        </View>
      )}

      {phase === 'result' && (
        <ResultScreen scorePercent={scorePercent} xpReward={xpReward} onRetry={handleRetry} onGoHome={handleGoHome} />
      )}
    </SafeAreaView>
  );
}