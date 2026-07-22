import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CodeEditor, { CodeEditorSyntaxStyles } from "@rivascva/react-native-code-editor";
import {
  Play,
  X,
  RotateCcw,
  Trash2,
  MoreVertical,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
} from "lucide-react-native";

import PythonRunner, { PythonRunnerHandle, RunResult } from "@/components/PythonRunner";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

const COLORS = {
  bg: "#000000",
  card: "#131313",
  cardBorder: "#262626",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  textTertiary: "#5C5C60",
  correct: "#2ECC71",
  wrong: "#E74C3C",
  sheetBg: "#161616",
  consoleBg: "#0D0D0D",
};

const DRAFT_KEY = "@code_editor_draft";

const DEFAULT_CODE = `# Python Program
def greet(name):
    """Return a greeting message."""
    if not name:
        return "Hello, Stranger!"
    return f"Hello {name}!"

def add(a, b):
    """Return the sum of two numbers."""
    return a + b

if __name__ == "__main__":
    user = input("Enter your name: ")
    message = greet(user)
    print(message)
    print("2 + 3 =", add(2, 3))
`;

export default function CodeEditorScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const runnerRef = useRef<PythonRunnerHandle>(null);
  const outputScrollRef = useRef<ScrollView>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialCode, setInitialCode] = useState(DEFAULT_CODE);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const [runnerReady, setRunnerReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [liveOutput, setLiveOutput] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);

  const [outputVisible, setOutputVisible] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "terminal">("output");
  const [menuVisible, setMenuVisible] = useState(false);

  // Load any previously saved draft once, on first mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(DRAFT_KEY);
        if (stored !== null) {
          setInitialCode(stored);
          setCode(stored);
          setEditorKey((k) => k + 1);
        }
      } catch {
        // ignore — fall back to default code
      }
    })();
  }, []);

  const scheduleSave = (text: string) => {
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(DRAFT_KEY, text);
      } catch {
        // ignore persistence errors
      }
      setSaveStatus("saved");
    }, 600);
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    scheduleSave(text);
  };

  const handleReset = () => {
    setMenuVisible(false);
    setInitialCode(DEFAULT_CODE);
    setCode(DEFAULT_CODE);
    setEditorKey((k) => k + 1);
    scheduleSave(DEFAULT_CODE);
  };

  const handleClearCode = () => {
    setMenuVisible(false);
    setInitialCode("");
    setCode("");
    setEditorKey((k) => k + 1);
    scheduleSave("");
  };

  const handleRun = () => {
    if (!code.trim() || running || !runnerReady) return;
    setRunning(true);
    setResult(null);
    setLiveOutput("");
    setPendingPrompt(null);
    setActiveTab("output");
    setOutputVisible(true);
    runnerRef.current?.run(code);
  };

  const handleStream = (output: string) => setLiveOutput(output);

  const handleWaitingForInput = (prompt: string, output: string) => {
    setLiveOutput(output);
    setPendingPrompt(prompt);
    setPromptInput("");
  };

  const handleResult = (data: RunResult) => {
    setRunning(false);
    setPendingPrompt(null);
    setResult(data);
    setLiveOutput(data.output);
  };

  const handleSubmitPromptInput = () => {
    if (pendingPrompt === null) return;
    runnerRef.current?.provideInput(promptInput);
    setLiveOutput((prev) => prev + promptInput + "\n");
    setPendingPrompt(null);
    setPromptInput("");
  };

  const handleClearOutput = () => {
    setLiveOutput("");
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Invisible — the sandboxed engine that actually runs the code */}
      <PythonRunner
        ref={runnerRef}
        onStream={handleStream}
        onWaitingForInput={handleWaitingForInput}
        onResult={handleResult}
        onReadyChange={setRunnerReady}
      />

      {/* Header — file icon, name, save status, overflow menu */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FileText color={COLORS.textSecondary} size={18} />
          <View>
            <Text style={styles.fileName}>main.py</Text>
            <View style={styles.savedRow}>
              <View style={[styles.savedDot, saveStatus === "saving" && styles.savingDot]} />
              <Text style={styles.savedText}>{saveStatus === "saving" ? "Saving..." : "Saved"}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => setMenuVisible((v) => !v)} hitSlop={10}>
          <MoreVertical color={COLORS.white} size={20} />
        </Pressable>
      </View>

      {menuVisible && (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.menuCard}>
            <Pressable style={styles.menuItem} onPress={handleReset}>
              <RotateCcw color={COLORS.white} size={16} />
              <Text style={styles.menuItemText}>Reset to Default</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleClearCode}>
              <Trash2 color={COLORS.white} size={16} />
              <Text style={styles.menuItemText}>Clear All</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Editor fills the rest of the screen */}
      <View style={styles.editorArea}>
        <CodeEditor
          key={editorKey}
          style={{
            fontSize: 14,
            inputLineHeight: 21,
            highlighterLineHeight: 21,
            padding: 16,
            ...(keyboardHeight > 0 ? { marginBottom: Math.max(keyboardHeight - insets.bottom, 0) } : {}),
          }}
          language="python"
          syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
          showLineNumbers
          initialValue={initialCode}
          onChange={handleCodeChange}
        />
      </View>

      {/* Floating Run pill */}
      <Pressable
        style={[styles.runFab, (!runnerReady || running) && styles.runFabDisabled]}
        onPress={handleRun}
        disabled={!runnerReady || running}
      >
        {running && pendingPrompt === null ? (
          <ActivityIndicator color={COLORS.bg} />
        ) : (
          <Play color={COLORS.bg} size={18} fill={COLORS.bg} />
        )}
        <Text style={styles.runFabText}>Run</Text>
      </Pressable>

      {/* Output — slides up like a bottom sheet, Output/Terminal tabs */}
      <Modal
        visible={outputVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOutputVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOutputVisible(false)} />
        <View style={[styles.outputSheet, outputExpanded && styles.outputSheetExpanded]}>
          <View style={styles.sheetHandle} />

          <View style={styles.tabRow}>
            <View style={styles.tabsLeft}>
              <Pressable onPress={() => setActiveTab("output")}>
                <Text style={[styles.tabText, activeTab === "output" && styles.tabTextActive]}>Output</Text>
              </Pressable>
              <Pressable onPress={() => setActiveTab("terminal")} style={{ marginLeft: 22 }}>
                <Text style={[styles.tabText, activeTab === "terminal" && styles.tabTextActive]}>Terminal</Text>
              </Pressable>
            </View>
            <View style={styles.tabsRight}>
              <Pressable onPress={handleClearOutput} hitSlop={8}>
                <Trash2 color={COLORS.textSecondary} size={16} />
              </Pressable>
              <Pressable onPress={() => setOutputExpanded((v) => !v)} hitSlop={8} style={{ marginLeft: 18 }}>
                {outputExpanded ? (
                  <Minimize2 color={COLORS.textSecondary} size={16} />
                ) : (
                  <Maximize2 color={COLORS.textSecondary} size={16} />
                )}
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={outputScrollRef}
            style={styles.outputScroll}
            onContentSizeChange={() => outputScrollRef.current?.scrollToEnd({ animated: true })}
          >
            <Text style={styles.consoleText}>{liveOutput}</Text>

            {pendingPrompt !== null && (
              <View style={styles.inputRow}>
                <TextInput
                  autoFocus
                  value={promptInput}
                  onChangeText={setPromptInput}
                  onSubmitEditing={handleSubmitPromptInput}
                  style={styles.inlineInput}
                  placeholder="Type your answer..."
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                />
                <Pressable onPress={handleSubmitPromptInput} style={styles.sendBtn}>
                  <ArrowRight color={COLORS.bg} size={16} />
                </Pressable>
              </View>
            )}

            {result && !result.success && (
              <Text style={styles.errorText}>{result.error}</Text>
            )}
          </ScrollView>

          {result && (
            <View style={styles.footerRow}>
              {result.success ? (
                <CheckCircle2 color={COLORS.correct} size={15} />
              ) : (
                <XCircle color={COLORS.wrong} size={15} />
              )}
              <Text style={[styles.footerText, { color: result.success ? COLORS.correct : COLORS.wrong }]}>
                {result.success ? `Executed in ${result.seconds} sec` : `Failed after ${result.seconds} sec`}
              </Text>
            </View>
          )}
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
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  fileName: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  savedDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.correct },
  savingDot: { backgroundColor: COLORS.textTertiary },
  savedText: { color: COLORS.textSecondary, fontSize: 11 },
  menuBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },
  menuCard: {
    position: "absolute",
    top: 52,
    right: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingVertical: 6,
    zIndex: 6,
    minWidth: 180,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  menuItemText: { color: COLORS.white, fontSize: 13, fontWeight: "500" },
  editorArea: { flex: 1 },
  runFab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  runFabDisabled: { opacity: 0.4 },
  runFabText: { color: COLORS.bg, fontWeight: "700", fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  outputSheet: {
    height: "42%",
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  outputSheetExpanded: { height: "85%" },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cardBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  tabRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tabsLeft: { flexDirection: "row", alignItems: "center" },
  tabsRight: { flexDirection: "row", alignItems: "center" },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: COLORS.white, borderBottomWidth: 2, borderBottomColor: COLORS.white, paddingBottom: 4 },
  outputScroll: {
    flex: 1,
    backgroundColor: COLORS.consoleBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
  },
  consoleText: { color: COLORS.white, fontFamily: "monospace", fontSize: 14, lineHeight: 22 },
  errorText: { color: COLORS.wrong, fontFamily: "monospace", fontSize: 13, lineHeight: 20, marginTop: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
  inlineInput: {
    flex: 1,
    color: COLORS.white,
    fontFamily: "monospace",
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  footerText: { fontSize: 12, fontWeight: "600" },
});