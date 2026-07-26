/**
 * CodeChallenge.tsx
 * -------------------
 * Shared layout for the "Bug-Fix" and "Code-Writing" question types.
 * Since the app's main bottom tab bar stays visible during the interview,
 * this uses a small internal segmented control (Problem / Code / Result)
 * instead of a second bottom bar.
 */
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SwitchContext';
import { Vibration } from 'react-native';
import { SoundManager } from '@/hooks/SoundManager';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { BugFixChallenge, CodeWritingChallenge, TestCase } from './interview_data';
import type { PyodideRunnerHandle, RunTestResult } from './PyodideRunner';
import PythonCodeEditor from './PythonCodeEditor';

type SubTab = 'problem' | 'code' | 'result';

interface Props {
    challenge: BugFixChallenge | CodeWritingChallenge;
    pyodideRef: React.RefObject<PyodideRunnerHandle | null>;
    pyodideReady: boolean;
    /** Called whenever a run finishes, so the parent can enable "Next" once allPassed is true */
    onResult: (allPassed: boolean, results: RunTestResult[]) => void;
}

export default function CodeChallenge({ challenge, pyodideRef, pyodideReady, onResult }: Props) {
    const { width, height } = useWindowDimensions();
    const wp = (p: number) => width * (p / 100);
    const hp = (p: number) => height * (p / 100);
    const initialCode = challenge.type === 'bug' ? challenge.buggyCode : challenge.starterCode;

    const [subTab, setSubTab] = useState<SubTab>('problem');
    const [code, setCode] = useState(initialCode);
    const { vibrationEnabled } = useSettings()
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<RunTestResult[] | null>(null);
    const [runError, setRunError] = useState<string | null>(null);

    // Reset everything when a new question comes in
    useEffect(() => {
        setCode(initialCode);
        setSubTab('problem');
        setResults(null);
        setRunError(null);
        setRunning(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [challenge.id]);

    const handleRun = useCallback(async () => {
        await SoundManager.play('click')
        if (vibrationEnabled) Vibration.vibrate(200)
        if (!pyodideRef.current || running) return;
        setRunning(true);
        setRunError(null);
        try {
            const outcome = await pyodideRef.current.runTests(code, challenge.tests as TestCase[]);
            setResults(outcome.results);
            setSubTab('result');
            onResult(outcome.results.every((r: any) => r.passed), outcome.results);
        } catch (err: any) {
            setRunError(err?.message ?? 'Something went wrong while running your code.');
            setSubTab('result');
        } finally {
            setRunning(false);
        }
    }, [code, challenge.tests, pyodideRef, running, onResult]);

    const styles = useMemo(() => {
        const wp = (p: number) => width * (p / 100);
        const hp = (p: number) => height * (p / 100);

        return StyleSheet.create({
            flex: { flex: 1 },
            tabBar: {
                flexDirection: 'row',
                marginHorizontal: wp(4),
                marginTop: hp(1.2),
                backgroundColor: '#111',
                borderRadius: 12,
                padding: 4,
            },
            tabItem: { flex: 1, paddingVertical: hp(1), borderRadius: 9, alignItems: 'center' },
            tabItemActive: { backgroundColor: '#1f1f1f' },
            tabText: { color: '#71717a', fontSize: wp(3.3), fontWeight: '600' },
            tabTextActive: { color: '#eeeeee' },

            problemBody: {
                padding: wp(5),
                paddingBottom: hp(4),
                backgroundColor: '#0A0A0A', // Main Dark Background
            },

            // Kicker Badge Tag
            kickerBadge: {
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: wp(1.5),
                backgroundColor: '#171717',
                borderWidth: 1,
                borderColor: '#262626',
                paddingHorizontal: wp(3),
                paddingVertical: hp(0.6),
                borderRadius: 8,
                marginBottom: hp(1.5),
            },
            kickerText: {
                color: '#FFFFFF',
                fontSize: wp(3),
                fontWeight: '700',
                letterSpacing: 1,
                textTransform: 'uppercase'
            },

            // Main Title & Description
            title: {
                color: '#FFFFFF',
                fontSize: wp(5.5),
                fontWeight: '800',
                lineHeight: wp(7),
            },
            prompt: {
                color: '#D4D4D8',
                fontSize: wp(3.8),
                lineHeight: wp(5.6),
                marginTop: hp(1.2)
            },

            // Structured Test Cases Card
            testCard: {
                marginTop: hp(3),
                backgroundColor: '#121212', // Subtle Dark Card
                borderWidth: 1,
                borderColor: '#262626',
                borderRadius: 16,
                padding: wp(4),
            },
            sectionHeader: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: wp(2),
                paddingBottom: hp(1.2),
                borderBottomWidth: 1,
                borderBottomColor: '#1F1F1F',
                marginBottom: hp(1.5),
            },
            sectionLabel: {
                color: '#A1A1AA',
                fontSize: wp(3.2),
                marginLeft: wp(2),
                marginBottom: wp(5),
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
            },
            testList: {
                gap: hp(1.2),
            },
            testRow: {
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: wp(2.5),
            },
            bulletDot: {
                width: wp(1.8),
                height: wp(1.8),
                borderRadius: wp(0.9),
                backgroundColor: '#FFFFFF', // High Contrast Bullet
                marginTop: hp(0.8),
            },
            testDesc: {
                color: '#E4E4E7',
                fontSize: wp(3.5),
                lineHeight: wp(5),
                flex: 1
            },

            // Editor Wrapper styling matching the theme
            editorWrap: {
                flex: 1,
                margin: wp(4),
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#121212',
                borderWidth: 1,
                borderColor: '#262626',
            },
            runBtn: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: wp(2),
                backgroundColor: '#e9e9e9',
                marginHorizontal: wp(4),
                marginBottom: hp(1.5),
                paddingVertical: hp(1.5),
                borderRadius: 12,
            },
            runBtnDisabled: { backgroundColor: '#525252' },
            runText: { color: '#dddddd', fontSize: wp(3.8), fontWeight: '800' },

            emptyText: { color: '#71717a', fontSize: wp(3.6), marginTop: hp(2) },
            errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: wp(4), marginBottom: hp(2) },
            errorText: { color: '#f87171', fontSize: wp(3.5) },

            resultCard: { borderRadius: 12, padding: wp(3.5), marginBottom: hp(1), borderWidth: 1 },
            resultPass: { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' },
            resultFail: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' },
            resultHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(2) },
            resultId: { color: '#e2e8f0', fontSize: wp(3.5), fontWeight: '600' },
            resultDetail: { color: '#94a3b8', fontSize: wp(3.2), marginTop: hp(0.6), marginLeft: wp(6.5) },
        });
    }, [width, height]);

    return (
        <View style={styles.flex}>
            <View style={styles.tabBar}>
                {(['problem', 'code', 'result'] as SubTab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={async () => {
                            await SoundManager.play('click')
                            if (vibrationEnabled) Vibration.vibrate(200)
                            setSubTab(tab)
                        }}
                        style={[styles.tabItem, subTab === tab && styles.tabItemActive]}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.tabText, subTab === tab && styles.tabTextActive]}>
                            {tab === 'problem' ? 'Problem' : tab === 'code' ? 'Code' : 'Result'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {subTab === 'problem' && (
                <ScrollView contentContainerStyle={styles.problemBody} showsVerticalScrollIndicator={false}>
                    {/* Type Badge (Bug Fix / Code Writing) */}
                    <View style={styles.kickerBadge}>
                        <Ionicons
                            name={challenge.type === 'bug' ? 'bug-outline' : 'code-slash-outline'}
                            size={wp(3.6)}
                            color="#FFFFFF"
                        />
                        <Text style={styles.kickerText}>
                            {challenge.type === 'bug' ? 'Fix the Bug' : 'Code Writing'}
                        </Text>
                    </View>

                    {/* Problem Title */}
                    <Text style={styles.title}>{challenge.title}</Text>

                    {/* Problem Description / Prompt */}
                    <Text style={styles.prompt}>{challenge.prompt}</Text>

                    {/* Test Cases Card Container */}
                    <View style={styles.testCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="checkmark-done-circle-outline" size={wp(4.5)} color="#A1A1AA" />
                            <Text style={styles.sectionLabel}>Tests you need to pass</Text>
                        </View>

                        <View style={styles.testList}>
                            {challenge.tests.map((t: any, index: number) => (
                                <View key={t.id || index} style={styles.testRow}>
                                    <View style={styles.bulletDot} />
                                    <Text style={styles.testDesc}>{t.description}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}

            {subTab === 'code' && (
                <View style={styles.flex}>
                    <View style={styles.editorWrap}>
                        <PythonCodeEditor value={code} onChangeText={setCode} />
                    </View>
                    <TouchableOpacity
                        onPress={handleRun}
                        disabled={!pyodideReady || running}
                        style={[styles.runBtn, (!pyodideReady || running) && styles.runBtnDisabled]}
                        activeOpacity={0.85}
                    >
                        {running ? (
                            <ActivityIndicator color="#050505" size="small" />
                        ) : (
                            <Ionicons name="play" size={wp(4.2)} color="#050505" />
                        )}
                        <Text style={styles.runText}>
                            {!pyodideReady ? 'Loading Python…' : running ? 'Running…' : 'Run'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {subTab === 'result' && (
                <ScrollView contentContainerStyle={styles.problemBody} showsVerticalScrollIndicator={false}>
                    {runError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{runError}</Text>
                        </View>
                    )}

                    {!runError && !results && (
                        <Text style={styles.emptyText}>Run your code from the Code tab to see results here.</Text>
                    )}

                    {results && (
                        <>
                            <Text style={styles.sectionLabel}>
                                {results.filter((r) => r.passed).length} / {results.length} tests passed
                            </Text>
                            {results.map((r) => (
                                <View key={r.id} style={[styles.resultCard, r.passed ? styles.resultPass : styles.resultFail]}>
                                    <View style={styles.resultHeader}>
                                        <Ionicons
                                            name={r.passed ? 'checkmark-circle' : 'close-circle'}
                                            size={wp(4.5)}
                                            color={r.passed ? '#22c55e' : '#ef4444'}
                                        />
                                        <Text style={styles.resultId}>{r.id}</Text>
                                    </View>
                                    {!r.passed && (
                                        <Text style={styles.resultDetail}>
                                            {r.error ? r.error : `Expected ${r.expected}, got ${r.actual}`}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
}