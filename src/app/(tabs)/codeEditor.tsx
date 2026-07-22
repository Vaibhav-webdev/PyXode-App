import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Play, X, RotateCcw, Trash2 } from "lucide-react-native";

import PythonCodeEditor from "@/components/PythonCodeEditor2";
import PythonRunner, { PythonRunnerHandle, RunResult } from "@/components/PythonRunner";

const COLORS = {
  bg: "#000000",
  card: "#131313",
  cardBorder: "#262626",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  correct: "#2ECC71",
  wrong: "#E74C3C",
  sheetBg: "#161616",
};

const DEFAULT_CODE = `# Write Python code here — 
name = "Coder"
print("Hello,", name + "!")

for i in range(3):
    print("Count:", i)
`;

export default function CodeEditorScreen() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [runnerReady, setRunnerReady] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [outputVisible, setOutputVisible] = useState(false);
  const runnerRef = useRef<PythonRunnerHandle>(null);

  const handleRun = () => {
    if (!code.trim() || running || !runnerReady) return;
    setRunning(true);
    setResult(null);
    runnerRef.current?.run(code);
  };

  const handleResult = (data: RunResult) => {
    setRunning(false);
    setResult(data);
    setOutputVisible(true);
  };

  const handleReset = () => setCode(DEFAULT_CODE);
  const handleClear = () => setCode("");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Invisible — this is the sandboxed engine that actually runs the code */}
      <PythonRunner ref={runnerRef} onResult={handleResult} onReadyChange={setRunnerReady} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Code Editor</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleClear} hitSlop={8} style={styles.headerIconBtn}>
            <Trash2 color={COLORS.textSecondary} size={18} />
          </Pressable>
          <Pressable onPress={handleReset} hitSlop={8} style={styles.headerIconBtn}>
            <RotateCcw color={COLORS.textSecondary} size={18} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.editorArea}>
          <PythonCodeEditor value={code} onChangeText={setCode} fill showPreview={false} />
        </View>
      </KeyboardAvoidingView>

      <Pressable
        style={[styles.runFab, (!runnerReady || running) && styles.runFabDisabled]}
        onPress={handleRun}
        disabled={!runnerReady || running}
      >
        {running ? (
          <ActivityIndicator color={COLORS.bg} />
        ) : (
          <Play color={COLORS.bg} size={22} fill={COLORS.bg} />
        )}
      </Pressable>

      {/* Output slides up from the bottom like a modal sheet */}
      <Modal
        visible={outputVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOutputVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOutputVisible(false)} />
        <View style={styles.outputSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>{result?.success ? "Output" : "Error"}</Text>
            <Pressable onPress={() => setOutputVisible(false)} hitSlop={10}>
              <X color={COLORS.white} size={20} />
            </Pressable>
          </View>
          <ScrollView style={styles.outputScroll}>
            <Text style={[styles.outputText, { color: result?.success ? COLORS.correct : COLORS.wrong }]}>
              {result?.success ? result.output : result?.error || "Something went wrong."}
            </Text>
            {!result?.success && result?.output ? (
              <>
                <Text style={styles.partialLabel}>Output before the error:</Text>
                <Text style={styles.outputTextMuted}>{result.output}</Text>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 14 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  editorArea: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  runFab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  runFabDisabled: { opacity: 0.4 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  outputSheet: {
    maxHeight: "60%",
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cardBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  outputScroll: {
    backgroundColor: "#0D0D0D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    maxHeight: 260,
  },
  outputText: { fontFamily: "monospace", fontSize: 14, lineHeight: 21 },
  partialLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 14, marginBottom: 4 },
  outputTextMuted: { fontFamily: "monospace", fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});