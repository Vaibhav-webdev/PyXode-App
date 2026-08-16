import { SoundManager } from "@/hooks/SoundManager";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileCode2,
  MoreVertical,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react-native";
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { wp, hp } from "@/utils/wp_hp";
import { useSettings } from '@/context/SwitchContext';
import { Vibration } from 'react-native';
import BannerAdComponent_CodeRunner from "@/components/ads/BannerAdsComponents_4";

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2990397099587279/1426213951';
const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, { requestNonPersonalizedAdsOnly: true, });

const INITIAL_PYTHON_CODE = `# Python Program

def greet(name):
    """Return a greeting message."""
    if not name:
        return "Hello, Stranger!"
    return f"Hello {name}!"


def add(a, b):
    """Return the sum of two numbers."""
    return a + b


if __name__ == "__main__":
    user = "Admin"
    message = greet(user)
    print(message)
    print("2 + 3 =", add(2, 3))`;

// 🎨 Python Syntax Highlighting Tokenizer
const renderHighlightedPython = (text: string) => {
  const regex =
    /(\n|#.*|".*?"|'.*?'|""".*?"""|'''.*?'''|\b(?:def|return|if|else|elif|for|in|while|import|from|as|try|except|finally|raise|class|pass|break|continue|is|not|and|or|True|False|None|lambda|with|yield|assert)\b|\b(?:print|input|len|range|str|int|float|list|dict|set|tuple|type|open|sum|min|max|abs)\b|\b\d+(?:\.\d+)?\b)/g;

  const parts = text.split(regex);

  return parts.map((token, index) => {
    if (!token) return null;
    if (token === "\n") return "\n";

    if (token.startsWith("#")) {
      return (
        <Text key={index} style={styles.synComment}>
          {token}
        </Text>
      );
    }
    if (
      token.startsWith('"') ||
      token.startsWith("'") ||
      token.startsWith('"""') ||
      token.startsWith("'''")
    ) {
      return (
        <Text key={index} style={styles.synString}>
          {token}
        </Text>
      );
    }
    if (
      /^(def|return|if|else|elif|for|in|while|import|from|as|try|except|finally|raise|class|pass|break|continue|is|not|and|or|True|False|None|lambda|with|yield|assert)$/.test(
        token
      )
    ) {
      return (
        <Text key={index} style={styles.synKeyword}>
          {token}
        </Text>
      );
    }
    if (
      /^(print|input|len|range|str|int|float|list|dict|set|tuple|type|open|sum|min|max|abs)$/.test(
        token
      )
    ) {
      return (
        <Text key={index} style={styles.synBuiltin}>
          {token}
        </Text>
      );
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <Text key={index} style={styles.synNumber}>
          {token}
        </Text>
      );
    }
    return (
      <Text key={index} style={styles.synDefault}>
        {token}
      </Text>
    );
  });
};

export default function CodeEditorScreen() {
  const [code, setCode] = useState(INITIAL_PYTHON_CODE);
  const [output, setOutput] = useState("");
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"Output" | "Terminal">("Output");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);
  const { vibrationEnabled } = useSettings()
  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter()

  const handleResetCode = async () => {
    await SoundManager.play('click')
    if (vibrationEnabled) Vibration.vibrate(200)
    setCode(INITIAL_PYTHON_CODE);
    setOutput("");
    setExecutionTime(null);
    setIsMenuVisible(false);
  };

  // Clear handler
  const handleClearCode = async () => {
    await SoundManager.play('click')
    if (vibrationEnabled) Vibration.vibrate(200)
    setCode("");
    setOutput("");
    setExecutionTime(null);
    setIsMenuVisible(false);
  };

  const lineNumbers = Array.from(
    { length: code.split("\n").length },
    (_, i) => i + 1
  );

  // ⚡ Smart Auto-Indent & Auto-Tab logic for `:`
  // Symbol Insertion Helper
  const insertSymbol = (symbol: string) => {
    setCode((prev) => prev + symbol);
  };

  // ⚡ Smart Auto-Indent, Auto-Pair & Smart Backspace
  const handleCodeChange = (newText: string) => {
    // Feature 1: Auto-Closing Pairs
    const pairs: { [key: string]: string } = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    };

    // Jab character TYPE ho raha ho
    if (newText.length === code.length + 1) {
      let diffIdx = -1;
      for (let i = 0; i < newText.length; i++) {
        if (newText[i] !== code[i]) {
          diffIdx = i;
          break;
        }
      }

      if (diffIdx !== -1) {
        const typedChar = newText[diffIdx];

        // Enter Key Pressed (Auto Indent)
        if (typedChar === "\n") {
          const textBefore = newText.slice(0, diffIdx);
          const textAfter = newText.slice(diffIdx + 1);
          const linesBefore = textBefore.split("\n");
          const currentLine = linesBefore[linesBefore.length - 1];

          const indentMatch = currentLine.match(/^(\s*)/);
          let indent = indentMatch ? indentMatch[1] : "";

          if (currentLine.trim().endsWith(":")) {
            indent += "    ";
          }

          setCode(textBefore + "\n" + indent + textAfter);
          return;
        }

        // Auto Closing Brackets & Quotes
        if (pairs[typedChar]) {
          const textBefore = newText.slice(0, diffIdx + 1);
          const textAfter = newText.slice(diffIdx + 1);
          setCode(textBefore + pairs[typedChar] + textAfter);
          return;
        }
      }
    }

    // Feature 2: Smart Backspace (Delete 4-space Tab at once)
    if (newText.length === code.length - 1) {
      let removedIdx = -1;
      for (let i = 0; i < code.length; i++) {
        if (code[i] !== newText[i]) {
          removedIdx = i;
          break;
        }
      }
      if (removedIdx >= 3) {
        const targetFour = code.slice(removedIdx - 3, removedIdx + 1);
        if (targetFour === "    ") {
          const before = code.slice(0, removedIdx - 3);
          const after = code.slice(removedIdx + 1);
          setCode(before + after);
          return;
        }
      }
    }

    setCode(newText);
  };

  const pyodideHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
      </head>
      <body>
        <script>
          var pyodide = null;

          async function initPyodideEngine() {
            try {
              pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
              });

              pyodide.setStdin({
                readline: () => {
                  var res = prompt("Python Input:");
                  return res !== null ? res : "";
                }
              });

              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            } catch (err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                error: 'Pyodide Load Error: ' + err.message
              }));
            }
          }

          initPyodideEngine();
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (!data.type) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (data.type === "READY") {
        setIsEngineReady(true);
      } else if (data.type === "OUTPUT") {
        setOutput(data.output);
        setExecutionTime(data.execTime);
        setIsRunning(false);
      } else if (data.type === "ERROR") {
        setOutput("Error:\n" + data.error);
        setExecutionTime(data.execTime || null);
        setIsRunning(false);
      }
    } catch (e) {
      return;
    }
  };

  const [loaded, setLoaded] = useState<boolean>(false);
  const executeCodeRef = useRef<(() => Promise<void>) | null>(null);

  const executeCode = async (): Promise<void> => {
    await SoundManager.play('correct');
    if (vibrationEnabled) Vibration.vibrate(300);
    if (!isEngineReady || isRunning) return;

    setIsConsoleVisible(true);
    setIsRunning(true);
    setExecutionTime(null);

    timeoutRef.current = setTimeout(() => {
      setIsRunning(false);
      setOutput("Execution timed out (30s limit).");
      timeoutRef.current = null;
    }, 30000);

    const jsonCode: string = JSON.stringify(code);

    const js: string = `
    (async function() {
      if (!pyodide) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          error: 'Python engine not loaded yet.'
        }));
        return;
      }

      var partialOut = '';
      var startTime = performance.now();
      try {
        pyodide.runPython('import sys, io; sys.stdout = io.StringIO()');
        await pyodide.runPythonAsync(${jsonCode});
        var stdout = pyodide.runPython('sys.stdout.getvalue()');
        pyodide.runPython('sys.stdout = sys.__stdout__');
        
        var endTime = performance.now();
        var execTime = ((endTime - startTime) / 1000).toFixed(3);

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'OUTPUT',
          output: stdout || 'Code executed successfully (No output).',
          execTime: execTime
        }));
      } catch (err) {
        try { partialOut = pyodide.runPython('sys.stdout.getvalue()'); } catch(e) {}
        try { pyodide.runPython('sys.stdout = sys.__stdout__'); } catch(e) {}
        
        var endTime = performance.now();
        var execTime = ((endTime - startTime) / 1000).toFixed(3);

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          error: (partialOut ? partialOut + '\\n' : '') + (err as Error).message,
          execTime: execTime
        }));
      }
    })();
    true;
  `;

    webViewRef.current?.injectJavaScript(js);
  };

  // Ref ke andar function instance sync karein
  executeCodeRef.current = executeCode;

  // 2. Ad Event Listeners
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      // Optional chaining ke saath safe execution
      executeCodeRef.current?.();
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  // 3. Button Handler
  const handleRunCode = (): void => {
    if (loaded) {
      interstitial.show();
    } else {
      executeCode();
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={async () => {
          await SoundManager.play('click')
          if (vibrationEnabled) Vibration.vibrate(200)
          router.push('/(tabs)/home')
        }} style={styles.iconButton}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.fileTitleRow}>
            <FileCode2 color="#8E8E93" size={16} />
            <Text style={styles.headerTitle}>main.py</Text>
          </View>
          <View style={styles.savedStatusRow}>
            <View style={styles.savedDot} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        </View>

        <TouchableOpacity onPress={async () => {
          await SoundManager.play('click')
          if (vibrationEnabled) Vibration.vibrate(200)
          setIsMenuVisible(!isMenuVisible)
        }} style={styles.iconButton}>
          <MoreVertical color="#FFFFFF" size={20} />
        </TouchableOpacity>

        {isMenuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleResetCode}>
              <RotateCcw color="#FFFFFF" size={15} />
              <Text style={styles.menuItemText}>Reset</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleClearCode}>
              <Trash2 color="#FF453A" size={15} />
              <Text style={[styles.menuItemText, { color: "#FF453A" }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BannerAdComponent_CodeRunner />
      {/* Custom Editor Area */}
      <View style={styles.editorWrapper}>
        {/* Mobile Quick Action Symbol Bar */}
        <View style={styles.toolbarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
            {["Tab", ":", "(", ")", "[", "]", '"', "'", "=", "#", "def ", "return "].map((symbol, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.toolbarButton}
                onPress={() => insertSymbol(symbol === "Tab" ? "    " : symbol)}
              >
                <Text style={styles.toolbarText}>{symbol}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView style={styles.editorScroll} bounces={false}>
          <View style={styles.editorRow}>
            {/* Left Line Numbers */}
            <View style={styles.lineNumberGutter}>
              {lineNumbers.map((num) => (
                <Text key={num} style={styles.lineNumberText}>
                  {num}
                </Text>
              ))}
            </View>

            {/* Code Input & Highlighting Stack */}
            <ScrollView horizontal style={styles.horizontalCodeScroll}>
              <View style={styles.codeContainer}>
                {/* 1. Underlying Input (Catches Typing) */}
                <TextInput
                  style={styles.textInputLayer}
                  multiline
                  value={code}
                  onChangeText={handleCodeChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  selectionColor="rgba(255, 255, 255, 0.3)"
                  underlineColorAndroid="transparent"
                />

                {/* 2. Top Highlighted Layer (Visible Colors) */}
                <Text style={styles.highlightLayer} pointerEvents="none">
                  {renderHighlightedPython(code)}
                </Text>
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Floating Run Button */}
        <TouchableOpacity
          style={[
            styles.floatingRunButton,
            (!isEngineReady || isRunning) && styles.disabledRunButton,
          ]}
          onPress={handleRunCode}
          disabled={!isEngineReady || isRunning}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <View style={styles.runButtonContent}>
              <Play color="#000000" size={14} fill="#000000" />
              <Text style={styles.runButtonText}>
                {isEngineReady ? "Run" : "Loading..."}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Hidden Pyodide Engine */}
      <View style={styles.hiddenWebView}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{
            html: pyodideHtml,
            baseUrl: "https://cdn.jsdelivr.net",
          }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          cacheEnabled={true}
        />
      </View>

      {/* Output Bottom Sheet Console */}
      {isConsoleVisible && (
        <View style={styles.outputSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab("Output")}
                style={[styles.tab, activeTab === "Output" && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Output" && styles.activeTabText,
                  ]}
                >
                  Output
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("Terminal")}
                style={[
                  styles.tab,
                  activeTab === "Terminal" && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Terminal" && styles.activeTabText,
                  ]}
                >
                  Terminal
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                onPress={async () => {
                  await SoundManager.play('click')
                  if (vibrationEnabled) Vibration.vibrate(200)
                  setOutput("");
                  setExecutionTime(null);
                }}
                style={styles.sheetActionButton}
              >
                <Trash2 color="#8E8E93" size={18} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  await SoundManager.play('click')
                  if (vibrationEnabled) Vibration.vibrate(200)
                  setIsConsoleVisible(false)
                }}
                style={styles.sheetActionButton}
              >
                <ChevronDown color="#8E8E93" size={22} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.consoleContainer}>
            <ScrollView style={styles.terminalBox}>
              <Text style={styles.outputText}>
                {activeTab === "Output"
                  ? output || "Running python code..."
                  : "$ terminal active"}
              </Text>
            </ScrollView>

            {executionTime && (
              <View style={styles.statusFooter}>
                <CheckCircle2 color="#8E8E93" size={14} />
                <Text style={styles.statusText}>
                  Executed in {executionTime} sec
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const FONT_FAMILY = Platform.OS === "ios" ? "Menlo" : "monospace";
const LINE_HEIGHT = wp(5.5);
const FONT_SIZE = wp(3.5);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  // Header Styles
  header: {
    height: hp(7),                // 56 -> ~7%
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),     // 16 -> ~4%
    backgroundColor: "#000000",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  fileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.5),                 // 6 -> ~1.5%
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: wp(4),              // 16 -> ~4%
    fontWeight: "600",
  },
  savedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.25),          // 2 -> ~0.25%
    gap: wp(1),                   // 4 -> ~1%
  },

  // Dropdown Menu Styles
  dropdownMenu: {
    zIndex: 1,
    position: "absolute",
    top: hp(4.5),                 // 36 -> ~4.5%
    right: 0,
    backgroundColor: "#1C1C1E",
    borderRadius: wp(2),          // 8 -> ~2%
    paddingVertical: hp(0.75),    // 6 -> ~0.75%
    width: wp(30),                // 120 -> ~30%
    borderWidth: 1,               // Fixed
    borderColor: "#2C2C2E",
    elevation: 10,                // Fixed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Fixed
    shadowOpacity: 0.3,           // Fixed
    shadowRadius: 4,              // Fixed
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),                 // 10 -> ~2.5%
    paddingHorizontal: wp(3),     // 12 -> ~3%
    paddingVertical: hp(1),       // 8 -> ~1%
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: wp(3.5),            // 14 -> ~3.5%
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,                    // Fixed (divider line)
    backgroundColor: "#2C2C2E",
    marginVertical: hp(0.25),     // 2 -> ~0.25%
  },

  // Mobile Quick Action Toolbar Styles
  toolbarContainer: {
    height: hp(5),                // 40 -> ~5%
    backgroundColor: "#121212",
    borderBottomWidth: 1,         // Fixed
    borderBottomColor: "#1C1C1E",
  },
  toolbarScroll: {
    alignItems: "center",
    paddingHorizontal: wp(2),     // 8 -> ~2%
    gap: wp(2),                   // 8 -> ~2%
  },
  toolbarButton: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: wp(3),     // 12 -> ~3%
    paddingVertical: hp(0.5),     // 4 -> ~0.5%
    borderRadius: wp(1.5),        // 6 -> ~1.5%
    borderWidth: 1,               // Fixed
    borderColor: "#2C2C2E",
  },
  toolbarText: {
    color: "#E5E5EA",
    fontSize: wp(3.2),            // 13 -> ~3.2%
    fontFamily: FONT_FAMILY,      // Ensure FONT_FAMILY is defined
    fontWeight: "600",
  },
  savedDot: {
    width: wp(1.5),               // 6 -> ~1.5% (Circle)
    height: wp(1.5),              // 6 -> ~1.5%
    borderRadius: wp(0.75),       // Half of width
    backgroundColor: "#8E8E93",
  },
  savedText: {
    color: "#8E8E93",
    fontSize: wp(3),              // 12 -> ~3%
  },
  iconButton: {
    padding: wp(1.5),             // 6 -> ~1.5%
  },

  // Editor Wrapper
  editorWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000000",
  },
  editorScroll: {
    flex: 1,
  },
  editorRow: {
    flexDirection: "row",
    paddingTop: hp(1.2),          // 10 -> ~1.2%
  },

  // Line Numbers Gutter
  lineNumberGutter: {
    width: wp(11),                // 44 -> ~11%
    alignItems: "flex-end",
    paddingRight: wp(3),          // 12 -> ~3%
    borderRightWidth: 1,          // Fixed
    borderRightColor: "#1C1C1E",
  },
  lineNumberText: {
    color: "#48484A",
    fontSize: FONT_SIZE,          // Responsive Variable
    fontFamily: FONT_FAMILY,
    lineHeight: LINE_HEIGHT,      // Responsive Variable
  },

  // Dual Overlay Code Container
  horizontalCodeScroll: {
    flex: 1,
    paddingLeft: wp(2.5),         // 10 -> ~2.5%
  },
  codeContainer: {
    position: "relative",
    minWidth: wp(105),            // 420 -> ~105% (Intentionally wider than screen to allow horizontal scroll for long code lines)
  },
  textInputLayer: {
    fontSize: FONT_SIZE,          // Responsive Variable
    fontFamily: FONT_FAMILY,
    lineHeight: LINE_HEIGHT,      // Responsive Variable
    color: "transparent",
    textAlignVertical: "top",
    padding: 0,                   // Fixed (0 padding is necessary for code overlay alignment)
    margin: 0,                    // Fixed
    includeFontPadding: false,
    zIndex: 1,
  },
  highlightLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: FONT_SIZE,          // Responsive Variable
    fontFamily: FONT_FAMILY,
    lineHeight: LINE_HEIGHT,      // Responsive Variable
    color: "#D4D4D4",
    textAlignVertical: "top",
    padding: 0,                   // Fixed
    margin: 0,                    // Fixed
    includeFontPadding: false,
    zIndex: 2,
  },

  // Syntax Highlighting Colors
  synComment: { color: "#6A9955", fontStyle: "italic" },
  synString: { color: "#CE9178" },
  synKeyword: { color: "#C586C0", fontWeight: "bold" },
  synBuiltin: { color: "#4EC9B0" },
  synNumber: { color: "#B5CEA8" },
  synDefault: { color: "#D4D4D4" },

  // Floating Run Button
  floatingRunButton: {
    position: "absolute",
    bottom: hp(3),                // 24 -> ~3%
    right: wp(5),                 // 20 -> ~5%
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp(5),     // 20 -> ~5%
    paddingVertical: hp(1.5),     // 12 -> ~1.5%
    borderRadius: wp(7),          // 28 -> ~7%
    elevation: 5,                 // Fixed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  disabledRunButton: {
    backgroundColor: "#8E8E93",
  },
  runButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),                   // 8 -> ~2%
  },
  runButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: wp(3.7),            // 15 -> ~3.7%
  },

  // Hidden WebView
  hiddenWebView: {
    height: 0,                    // Fixed (Hidden element)
    width: 0,                     // Fixed
    position: "absolute",
  },

  // Console Output Bottom Sheet
  outputSheet: {
    height: "38%",                // String % best for bottom sheets
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: wp(4),   // 16 -> ~4%
    borderTopRightRadius: wp(4),  // 16 -> ~4%
    paddingHorizontal: wp(4),     // 16 -> ~4%
    paddingTop: hp(1),            // 8 -> ~1%
    paddingBottom: hp(2),         // 16 -> ~2%
    borderTopWidth: 1,            // Fixed
    borderTopColor: "#1A1A1A",
  },
  dragHandle: {
    width: wp(9),                 // 36 -> ~9%
    height: wp(1),                // 4 -> ~1% (Using wp to keep it proportional)
    backgroundColor: "#3A3A3C",
    borderRadius: wp(0.5),        // 2 -> ~0.5%
    alignSelf: "center",
    marginBottom: hp(1.2),        // 10 -> ~1.2%
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,         // Fixed
    borderBottomColor: "#1A1A1A",
    paddingBottom: hp(1),         // 8 -> ~1%
  },
  tabContainer: {
    flexDirection: "row",
    gap: wp(4),                   // 16 -> ~4%
  },
  tab: {
    paddingVertical: hp(0.5),     // 4 -> ~0.5%
  },
  activeTab: {
    borderBottomWidth: 2,         // Fixed
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#6C6C70",
    fontSize: wp(3.5),            // 14 -> ~3.5%
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),                   // 16 -> ~4%
  },
  sheetActionButton: {
    padding: wp(0.5),             // 2 -> ~0.5%
  },
  consoleContainer: {
    flex: 1,
    marginTop: hp(1.5),           // 12 -> ~1.5%
  },
  terminalBox: {
    flex: 1,
  },
  outputText: {
    color: "#E5E5EA",
    fontFamily: FONT_FAMILY,
    fontSize: wp(3.5),            // 14 -> ~3.5%
    lineHeight: wp(5.5),          // 22 -> ~5.5%
  },
  statusFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),                   // 8 -> ~2%
    marginTop: hp(1),             // 8 -> ~1%
    paddingTop: hp(1),            // 8 -> ~1%
    borderTopWidth: 1,            // Fixed
    borderTopColor: "#1C1C1E",
  },
  statusText: {
    color: "#8E8E93",
    fontSize: wp(3),              // 12 -> ~3%
    fontFamily: FONT_FAMILY,
  },
});