import React from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { tokenizePython, TOKEN_COLORS } from "@/utils/pythonHighlighter";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  minHeight?: number;
  placeholder?: string;
  showPreview?: boolean; // hide the highlighted preview panel (used in the full-screen playground)
  fill?: boolean; // let the input grow to fill all available vertical space
};

// Two simple, independent layers instead of a fragile transparent-text
// overlay (which rendered inconsistently across iOS/Android and let the
// device's own black input text show through). The learner types normally
// in a plain input, and a live "Preview" panel below shows the exact same
// text with Python syntax highlighting applied as they type.
export default function PythonCodeEditor({
  value,
  onChangeText,
  editable = true,
  minHeight = 90,
  placeholder = "# Write your Python code here",
  showPreview = true,
  fill = false,
}: Props) {
  const tokens = tokenizePython(value);

  return (
    <View style={fill ? styles.fillWrapper : undefined}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        // Forces a plain ASCII keyboard on iOS so smart/curly quotes don't
        // get auto-inserted and silently break exact-match comparisons.
        keyboardType={Platform.OS === "ios" ? "ascii-capable" : "default"}
        placeholder={placeholder}
        placeholderTextColor="#5C5C60"
        selectionColor="#FFFFFF"
        textAlignVertical="top"
        style={[
          styles.mono,
          styles.input,
          fill ? styles.inputFill : { minHeight },
          !editable && styles.inputLocked,
        ]}
      />

      {showPreview && (
        <View style={styles.previewWrapper}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.mono}>
            {value.length === 0 ? (
              <Text style={styles.previewPlaceholder}>Your highlighted code appears here as you type</Text>
            ) : (
              tokens.map((t, i) => (
                <Text key={i} style={{ color: TOKEN_COLORS[t.type] }}>
                  {t.text}
                </Text>
              ))
            )}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 14,
    color: "#FFFFFF",
  },
  inputLocked: { opacity: 0.6 },
  fillWrapper: { flex: 1 },
  inputFill: { flex: 1 },
  previewWrapper: {
    marginTop: 10,
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    padding: 14,
  },
  previewLabel: {
    color: "#5C5C60",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  previewPlaceholder: { color: "#5C5C60", fontFamily: "monospace" },
});