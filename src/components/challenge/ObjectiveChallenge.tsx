/**
 * ObjectiveChallenge.tsx
 * ------------------------
 * Layout for the "Objective" (multiple choice) question type.
 * Selecting an option just locks it in — correctness is revealed on the
 * final Results screen, not immediately, to keep the interview feel.
 */
import { use, useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/context/SwitchContext';
import { Vibration } from 'react-native';
import { SoundManager } from '@/hooks/SoundManager';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { ObjectiveChallenge as ObjectiveChallengeType } from './interview_data';

interface Props {
    challenge: ObjectiveChallengeType;
    /** Called every time the selection changes so the parent can enable "Next" */
    onAnswered: (selectedIndex: number) => void;
}

export default function ObjectiveChallenge({ challenge, onAnswered }: Props) {
    const { width, height } = useWindowDimensions();
    const wp = (p: number) => width * (p / 100);
    const hp = (p: number) => height * (p / 100);
    const { vibrationEnabled } = useSettings()

    const styles = useMemo(() => {
        const wp = (p: number) => width * (p / 100);
        const hp = (p: number) => height * (p / 100);

        return StyleSheet.create({
            container: { padding: wp(5), paddingBottom: hp(4) },
            kicker: { color: '#facc15', fontSize: wp(3), fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
            title: { color: '#f5f5f5', fontSize: wp(5.2), fontWeight: '800', marginTop: hp(1) },
            prompt: { color: '#cbd5e1', fontSize: wp(3.9), lineHeight: wp(5.6), marginTop: hp(1.5) },
            options: { marginTop: hp(3), gap: hp(1.4) },
            option: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: wp(3),
                borderWidth: 1,
                borderColor: 'rgba(148,163,184,0.25)',
                borderRadius: 14,
                paddingVertical: hp(1.6),
                paddingHorizontal: wp(4),
                backgroundColor: '#0e0e0e',
            },
            optionSelected: { borderColor: '#e4e3e0', backgroundColor: 'rgba(230, 228, 224, 0.08)' },
            radio: {
                width: wp(5),
                height: wp(5),
                borderRadius: wp(2.5),
                borderWidth: 2,
                borderColor: '#64748b',
                alignItems: 'center',
                justifyContent: 'center',
            },
            radioSelected: { borderColor: '#e6e4e0' },
            radioDot: { width: wp(2.4), height: wp(2.4), borderRadius: wp(1.2), backgroundColor: '#ebe9e5' },
            optionText: { color: '#e2e8f0', fontSize: wp(3.7), flex: 1 },
            optionTextSelected: { color: '#fff', fontWeight: '600' },
        });
    }, [width, height]);
    const [selected, setSelected] = useState<number | null>(null);

    // Reset selection whenever we move to a new question
    useEffect(() => {
        setSelected(null);
    }, [challenge.id]);

    const choose = (index: number) => {
        setSelected(index);
        onAnswered(index);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>Objective</Text>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.prompt}>{challenge.prompt}</Text>

            <View style={styles.options}>
                {challenge.options.map((option: any, index: any) => {
                    const isSelected = selected === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={async () => {
                                await SoundManager.play('click')
                                if (vibrationEnabled) Vibration.vibrate(200)
                                choose(index)
                            }}
                            activeOpacity={0.8}
                            style={[styles.option, isSelected && styles.optionSelected]}
                        >
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}
