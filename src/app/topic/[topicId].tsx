import React, { useEffect, useRef, useState } from "react";
import ResultScreen from "@/components/CompletionReward";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, ArrowRight, RotateCcw, Trophy, Star } from "lucide-react-native";

import { getTopicById } from "@/data/topics";
import { saveTopicResult } from "@/utils/progressStorage";
import { isCodeAnswerCorrect } from "@/utils/normalizeCode";
import PythonCodeEditor from "@/components/PythonCodeEditor";

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

  const handleNextSlide = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      setStage("quiz");
    }
  };

  const handleSelectOption = (option: string) => {
    if (answeredCorrectly !== null) return; // lock after first answer, like most learning apps
    setSelectedOption(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleCheckCode = () => {
    if (answeredCorrectly !== null) return; // lock after first check
    const isCorrect = isCodeAnswerCorrect(codeValue, currentQuestion.acceptedAnswers ?? []);
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    if (quizIndex < totalQuestions - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setStage("result");
    }
  };

  const handleRetry = () => {
    setStage("theory");
    setSlideIndex(0);
    setQuizIndex(0);
    setSelectedOption(null);
    setAnsweredCorrectly(null);
    setCodeValue("");
    setCorrectCount(0);
    setSaved(false);
  };

  const handleExit = () => router.back();
  const handleGoHome = () => router.replace("/(tabs)/home");

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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { color: COLORS.white, fontSize: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.track,
    overflow: "hidden",
  },
  topProgressFill: { height: 6, backgroundColor: COLORS.fill, borderRadius: 3 },
  body: { flex: 1, paddingHorizontal: 20 },
  topicLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 10 },
  questionCounter: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 10 },
  slideHeading: { color: COLORS.white, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  slideBody: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  codeBlock: {
    backgroundColor: COLORS.codeBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginTop: 16,
  },
  codeText: { color: "#8FE388", fontFamily: "monospace", fontSize: 13, lineHeight: 19 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: "auto", marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.track },
  dotActive: { backgroundColor: COLORS.white, width: 18 },
  editorHint: { color: COLORS.textSecondary, fontSize: 12, marginTop: 16, marginBottom: 8 },
  checkBtn: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  checkBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  outputBlock: {
    marginTop: 14,
    backgroundColor: "#0F1F14",
    borderWidth: 1,
    borderColor: COLORS.correct,
    borderRadius: 12,
    padding: 14,
  },
  outputLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "700", marginBottom: 4 },
  outputText: { color: COLORS.correct, fontFamily: "monospace", fontSize: 14 },
  solutionBlock: {
    marginTop: 12,
    backgroundColor: COLORS.codeBg,
    borderRadius: 10,
    padding: 10,
  },
  optionsWrap: { marginTop: 20, gap: 10 },
  optionBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionCorrect: { borderColor: COLORS.correct, backgroundColor: "#0F1F14" },
  optionWrong: { borderColor: COLORS.wrong, backgroundColor: "#210E0E" },
  optionText: { color: COLORS.white, fontSize: 14, fontWeight: "500" },
  explanationBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.correctCard,
    borderWidth: 1,
    borderColor: COLORS.correctBorder,
  },
  explanationBox2: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.incorrectCard,
    borderWidth: 1,
    borderColor: COLORS.incorrectBorder,
  },
  explanationLabel: { color: COLORS.white, fontWeight: "700", marginBottom: 4 },
  explanationText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 24,
    marginTop: 15,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: { color: COLORS.bg, fontWeight: "700", fontSize: 15 },
  resultWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  trophyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  starsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  resultTitle: { color: COLORS.white, fontSize: 24, fontWeight: "800", marginBottom: 8 },
  resultSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28, width: "100%" },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  retryBtnText: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
});