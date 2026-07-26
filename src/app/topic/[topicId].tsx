import ResultScreen from "@/components/CompletionReward";
import PythonCodeEditor from "@/components/PythonCodeEditor";
import { useSettings } from "@/context/SwitchContext";
import { getTopicById } from "@/data/topics";
import { SoundManager } from "@/hooks/SoundManager";
import { isCodeAnswerCorrect } from "@/utils/normalizeCode";
import { saveTopicResult } from "@/utils/progressStorage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text, Vibration, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, wp } from "@/utils/wp_hp";
const { width: SCREEN_W } = Dimensions.get("window");

const COLORS = {
  bg: "#000000",
  card: "#131313",
  correctCard: "#1de0682a",
  incorrectCard: "#ff01012c",
  correctBorder: "#23cc6746",
  incorrectBorder: "#ff01013b",
  cardBorder: "#262626",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  track: "#2E2E2E",
  fill: "#FFFFFF",
  correct: "#2ECC71",
  wrong: "#E74C3C",
  codeBg: "#0D0D0D",
  gold: "#F5C518",
};

type ScreenStage = "theory" | "quiz" | "result";

export default function TopicScreen() {
  const { vibrationEnabled } = useSettings()
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const topic = getTopicById(String(topicId));

  const [stage, setStage] = useState<ScreenStage>("theory");
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [saved, setSaved] = useState(false);

  if (!topic) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Topic not found.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalSlides = topic.theorySlides.length;
  const totalQuestions = topic.quiz.length;
  const currentSlide = topic.theorySlides[slideIndex];
  const currentQuestion = topic.quiz[quizIndex];
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Persist result exactly once, when the result screen first appears
  useEffect(() => {
    if (stage === "result" && !saved) {
      setSaved(true);
      saveTopicResult(topic.id, scorePercent);
    }
  }, [stage]);

  // Pre-fill the editor with starter code whenever a new code_writing question appears
  useEffect(() => {
    if (stage === "quiz" && currentQuestion?.type === "code_writing") {
      setCodeValue(currentQuestion.starterCode ?? "");
    }
  }, [stage, quizIndex]);

  const handleNextSlide = async () => {
    if (vibrationEnabled) Vibration.vibrate(200)
    await SoundManager.play('next');
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      setStage("quiz");
    }
  };

  const handleSelectOption = async (option: string) => {
    if (answeredCorrectly !== null) return; // lock after first answer, like most learning apps
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      if (vibrationEnabled) Vibration.vibrate(300)
      await SoundManager.play('correct');
      setCorrectCount((c) => c + 1)
    } else {
      if (vibrationEnabled) Vibration.vibrate(200)
      await SoundManager.play('wrong');
    }
  };

  const handleCheckCode = async () => {
    if (answeredCorrectly !== null) return; // lock after first check
    const isCorrect = isCodeAnswerCorrect(codeValue, currentQuestion.acceptedAnswers ?? []);
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      if (vibrationEnabled) Vibration.vibrate(300)
      await SoundManager.play('correct');
      setCorrectCount((c) => c + 1)
    } else {
      if (vibrationEnabled) Vibration.vibrate(200)
      await SoundManager.play('wrong');
    }
  };

  const handleNextQuestion = async () => {
    if (vibrationEnabled) Vibration.vibrate(200)
    await SoundManager.play('next');
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    if (quizIndex < totalQuestions - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setStage("result");
      if (vibrationEnabled) Vibration.vibrate(400)
      await SoundManager.play('celebrate');
    }
  };

  const handleRetry = async () => {
    if (vibrationEnabled) Vibration.vibrate(200)
    await SoundManager.play('click');
    setStage("theory");
    setSlideIndex(0);
    setQuizIndex(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setCodeValue("");
    setCorrectCount(0);
    setSaved(false);
  };

  const handleExit = async () => {
    if (vibrationEnabled) Vibration.vibrate(200)
    await SoundManager.play('next');
    router.back()
  };
  const handleGoHome = async () => {
    if (vibrationEnabled) Vibration.vibrate(200)
    await SoundManager.play('correct');
    router.replace("/(tabs)/home")
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar with progress + close */}
      <View style={styles.topBar}>
        <Pressable onPress={handleExit} hitSlop={10}>
          <X color={COLORS.white} size={22} />
        </Pressable>
        {stage !== "result" && (
          <View style={styles.topProgressTrack}>
            <View
              style={[
                styles.topProgressFill,
                {
                  width:
                    stage === "theory"
                      ? `${((slideIndex + 1) / totalSlides) * 50}%`
                      : `${50 + ((quizIndex + 1) / totalQuestions) * 50}%`,
                },
              ]}
            />
          </View>
        )}
        <View style={{ width: 22 }} />
      </View>

      {stage === "theory" && (
        <View style={styles.body}>
          <Text style={styles.topicLabel}>
            {topic.number} · {topic.title.replace("\n", " ")}
          </Text>
          <Text style={styles.slideHeading}>{currentSlide.heading}</Text>
          <Text style={styles.slideBody}>{currentSlide.body}</Text>
          {currentSlide.codeExample && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{currentSlide.codeExample}</Text>
            </View>
          )}
          <View style={styles.dotsRow}>
            {topic.theorySlides.map((_, i) => (
              <View key={i} style={[styles.dot, i === slideIndex && styles.dotActive]} />
            ))}
          </View>
          <Pressable style={styles.primaryBtn} onPress={handleNextSlide}>
            <Text style={styles.primaryBtnText}>
              {slideIndex < totalSlides - 1 ? "Next" : "Start Practice"}
            </Text>
            <ArrowRight color={COLORS.bg} size={18} />
          </Pressable>
        </View>
      )}

      {stage === "quiz" && (
        <View style={styles.body} key={currentQuestion.id}>
          <Text style={styles.questionCounter}>
            Question {quizIndex + 1} / {totalQuestions}
          </Text>
          <Text style={styles.slideHeading}>{currentQuestion.question}</Text>

          {currentQuestion.type !== "code_writing" && currentQuestion.codeSnippet && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{currentQuestion.codeSnippet}</Text>
            </View>
          )}

          {currentQuestion.type === "code_writing" ? (
            <>
              <Text style={styles.editorHint}>Type your Python code below:</Text>
              <PythonCodeEditor
                value={codeValue}
                onChangeText={setCodeValue}
                editable={answeredCorrectly === null}
              />
              {answeredCorrectly === null && (
                <Pressable
                  style={[styles.checkBtn, !codeValue.trim() && styles.primaryBtnDisabled]}
                  onPress={handleCheckCode}
                  disabled={!codeValue.trim()}
                >
                  <Text style={styles.checkBtnText}>Check My Code</Text>
                </Pressable>
              )}
              {answeredCorrectly === true && currentQuestion.expectedOutput && (
                <View style={styles.outputBlock}>
                  <Text style={styles.outputLabel}>Output</Text>
                  <Text style={styles.outputText}>{currentQuestion.expectedOutput}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.optionsWrap}>
              {currentQuestion.options.map((option) => {
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const isSelected = option === selectedOption;
                let optionStyle = styles.optionBtn;
                if (answeredCorrectly !== null) {
                  if (isCorrectOption) optionStyle = { ...styles.optionBtn, ...styles.optionCorrect };
                  else if (isSelected) optionStyle = { ...styles.optionBtn, ...styles.optionWrong };
                }
                return (
                  <Pressable key={option} style={optionStyle} onPress={() => handleSelectOption(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {answeredCorrectly !== null && (
            <View style={answeredCorrectly ? styles.explanationBox : styles.explanationBox2}>
              <Text style={styles.explanationLabel}>{answeredCorrectly ? "Correct!" : "Not quite"}</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              {!answeredCorrectly && currentQuestion.type === "code_writing" && (
                <View style={styles.solutionBlock}>
                  <Text style={styles.outputLabel}>Correct answer</Text>
                  <Text style={styles.codeText}>{currentQuestion.correctAnswer}</Text>
                </View>
              )}
            </View>
          )}

          <Pressable
            style={[styles.primaryBtn, answeredCorrectly === null && styles.primaryBtnDisabled]}
            onPress={handleNextQuestion}
            disabled={answeredCorrectly === null}
          >
            <Text style={styles.primaryBtnText}>
              {quizIndex < totalQuestions - 1 ? "Next Question" : "Finish"}
            </Text>
            <ArrowRight color={COLORS.bg} size={18} />
          </Pressable>
        </View>
      )}

      {stage === "result" && (
        <ResultScreen
          scorePercent={scorePercent}
          xpReward={topic.xpReward}
          onRetry={handleRetry}
          onGoHome={handleGoHome}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: wp(4) }, // 16 -> ~4%
    notFoundText: { color: COLORS.white, fontSize: wp(4) }, // 16 -> ~4%
    
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: wp(3),                     // 12 -> ~3%
      paddingHorizontal: wp(5),       // 20 -> ~5%
      paddingTop: hp(1),              // 8 -> ~1%
      paddingBottom: hp(2),           // 16 -> ~2%
    },
    topProgressTrack: {
      flex: 1,
      height: wp(1.5),                // 6 -> ~1.5% (Thin bars ko wp se karna safe hai)
      borderRadius: wp(0.75),         // 3 -> Half of height for perfect rounded ends
      backgroundColor: COLORS.track,
      overflow: "hidden",
    },
    topProgressFill: { 
      height: wp(1.5),                // 6 -> ~1.5%
      backgroundColor: COLORS.fill, 
      borderRadius: wp(0.75)          // 3 -> ~0.75%
    },
    
    body: { flex: 1, paddingHorizontal: wp(5) }, // 20 -> ~5%
    topicLabel: { color: COLORS.textSecondary, fontSize: wp(3), fontWeight: "600", marginBottom: hp(1.25) }, // 12 -> 3%, 10 -> 1.25%
    questionCounter: { color: COLORS.textSecondary, fontSize: wp(3), fontWeight: "600", marginBottom: hp(1.25) },
    slideHeading: { color: COLORS.white, fontSize: wp(5.5), fontWeight: "700", marginBottom: hp(1.5) }, // 22 -> 5.5%, 12 -> 1.5%
    slideBody: { color: COLORS.textSecondary, fontSize: wp(3.5), lineHeight: wp(5.25) }, // 14 -> 3.5%, 21 -> 5.25%
    
    codeBlock: {
      backgroundColor: COLORS.codeBg,
      borderRadius: wp(3),            // 12 -> ~3%
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.cardBorder,
      padding: wp(3.5),               // 14 -> ~3.5%
      marginTop: hp(2),               // 16 -> ~2%
    },
    codeText: { color: "#8FE388", fontFamily: "monospace", fontSize: wp(3.25), lineHeight: wp(4.75) }, // 13 -> 3.25%, 19 -> 4.75%
    
    dotsRow: { flexDirection: "row", justifyContent: "center", gap: wp(1.5), marginTop: "auto", marginBottom: hp(2.5) }, // 6 -> 1.5%, 20 -> 2.5%
    dot: { width: wp(1.5), height: wp(1.5), borderRadius: wp(0.75), backgroundColor: COLORS.track }, // Circle: 6 -> 1.5%, radius half of width
    dotActive: { backgroundColor: COLORS.white, width: wp(4.5) }, // Capsule: 18 -> 4.5% (Height aur radius inherited from 'dot' style, perfect pill shape banega)
    
    editorHint: { color: COLORS.textSecondary, fontSize: wp(3), marginTop: hp(2), marginBottom: hp(1) }, // 12 -> 3%
    checkBtn: {
      marginTop: hp(1.5),            // 12 -> ~1.5%
      backgroundColor: COLORS.card,
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.cardBorder,
      borderRadius: wp(3.5),          // 14 -> ~3.5%
      paddingVertical: hp(1.6),       // 13 -> ~1.6%
      alignItems: "center",
    },
    checkBtnText: { color: COLORS.white, fontWeight: "700", fontSize: wp(3.5) }, // 14 -> 3.5%
    
    outputBlock: {
      marginTop: hp(1.75),            // 14 -> ~1.75%
      backgroundColor: "#0F1F14",
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.correct,
      borderRadius: wp(3),            // 12 -> ~3%
      padding: wp(3.5),               // 14 -> ~3.5%
    },
    outputLabel: { color: COLORS.textSecondary, fontSize: wp(2.75), fontWeight: "700", marginBottom: hp(0.5) }, // 11 -> 2.75%, 4 -> 0.5%
    outputText: { color: COLORS.correct, fontFamily: "monospace", fontSize: wp(3.5) }, // 14 -> 3.5%
    
    solutionBlock: {
      marginTop: hp(1.5),             // 12 -> ~1.5%
      backgroundColor: COLORS.codeBg,
      borderRadius: wp(2.5),          // 10 -> ~2.5%
      padding: wp(2.5),               // 10 -> ~2.5%
    },
    
    optionsWrap: { marginTop: hp(2.5), gap: wp(2.5) }, // 20 -> 2.5%, 10 -> 2.5%
    optionBtn: {
      backgroundColor: COLORS.card,
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.cardBorder,
      borderRadius: wp(3.5),          // 14 -> ~3.5%
      paddingVertical: hp(1.75),      // 14 -> ~1.75%
      paddingHorizontal: wp(4),       // 16 -> ~4%
    },
    optionCorrect: { borderColor: COLORS.correct, backgroundColor: "#0F1F14" },
    optionWrong: { borderColor: COLORS.wrong, backgroundColor: "#210E0E" },
    optionText: { color: COLORS.white, fontSize: wp(3.5), fontWeight: "500" }, // 14 -> 3.5%
    
    explanationBox: {
      marginTop: hp(2),               // 16 -> ~2%
      padding: wp(3.5),               // 14 -> ~3.5%
      borderRadius: wp(3.5),          // 14 -> ~3.5%
      backgroundColor: COLORS.correctCard,
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.correctBorder,
    },
    explanationBox2: {
      marginTop: hp(2),
      padding: wp(3.5),
      borderRadius: wp(3.5),
      backgroundColor: COLORS.incorrectCard,
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.incorrectBorder,
    },
    explanationLabel: { color: COLORS.white, fontWeight: "700", marginBottom: hp(0.5) }, // 4 -> 0.5%
    explanationText: { color: COLORS.textSecondary, fontSize: wp(3.25), lineHeight: wp(4.75) }, // 13 -> 3.25%, 19 -> 4.75%
    
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: wp(2),                     // 8 -> ~2%
      backgroundColor: COLORS.white,
      borderRadius: wp(3.5),          // 14 -> ~3.5%
      paddingVertical: hp(1.87),      // 15 -> ~1.87%
      marginBottom: hp(3),            // 24 -> ~3%
      marginTop: hp(1.87),            // 15 -> ~1.87%
    },
    primaryBtnDisabled: { opacity: 0.35 },
    primaryBtnText: { color: COLORS.bg, fontWeight: "700", fontSize: wp(3.75) }, // 15 -> 3.75%
    
    resultWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: wp(6) }, // 24 -> 6%
    trophyCircle: {
      width: wp(24),                  // 96 -> ~24% (Circle)
      height: wp(24),                 // 96 -> ~24%
      borderRadius: wp(12),           // 48 -> Half of width for perfect circle
      backgroundColor: "#1C1C1E",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: hp(2),            // 16 -> ~2%
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.cardBorder,
    },
    starsRow: { flexDirection: "row", gap: wp(3), marginBottom: hp(2.5) }, // 12 -> 3%, 20 -> 2.5%
    resultTitle: { color: COLORS.white, fontSize: wp(6), fontWeight: "800", marginBottom: hp(1) }, // 24 -> 6%, 8 -> 1%
    resultSubtitle: {
      color: COLORS.textSecondary,
      fontSize: wp(3.25),             // 13 -> ~3.25%
      textAlign: "center",
      lineHeight: wp(4.75),           // 19 -> ~4.75%
      marginBottom: hp(3),            // 24 -> ~3%
      paddingHorizontal: wp(3),       // 12 -> ~3%
    },
    statsRow: { flexDirection: "row", gap: wp(3), marginBottom: hp(3.5), width: "100%" }, // 12 -> 3%, 28 -> 3.5%
    statCard: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderRadius: wp(3.5),          // 14 -> ~3.5%
      borderWidth: 1,                 // Fixed
      borderColor: COLORS.cardBorder,
      paddingVertical: hp(2),         // 16 -> ~2%
      alignItems: "center",
    },
    statValue: { color: COLORS.white, fontSize: wp(5), fontWeight: "800" }, // 20 -> 5%
    statLabel: { color: COLORS.textSecondary, fontSize: wp(2.75), marginTop: hp(0.5) }, // 11 -> 2.75%, 4 -> 0.5%
    retryBtn: { flexDirection: "row", alignItems: "center", gap: wp(1.5), paddingVertical: hp(1) }, // 6 -> 1.5%, 8 -> 1%
    retryBtnText: { color: COLORS.white, fontSize: wp(3.25), fontWeight: "600" }, // 13 -> 3.25%
});