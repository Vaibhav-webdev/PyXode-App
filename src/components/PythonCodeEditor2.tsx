import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Platform, LayoutChangeEvent } from "react-native";
import CodeEditor, { CodeEditorSyntaxStyles } from "@rivascva/react-native-code-editor";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  minHeight?: number;
  placeholder?: string;
  fill?: boolean; // grow to fill all available vertical space (playground mode)
  // Bump this from the parent whenever you need the visible text forced
  // back in sync with `value` — e.g. Reset / Clear buttons. The library
  // manages its own TextInput internally (uncontrolled), so a plain
  // `value` change while the user is typing is intentionally IGNORED —
  // that's what stops the "type here, text lands there" bug. Only a
  // resetToken bump forces a clean remount.
  resetToken?: number;
};

// Keeping fontSize / both line-heights identical (and an explicit mono
// font on both platforms) is what fixes the classic cursor-drift issue
// with this library — see github.com/RivasCVA/react-native-code-editor
// issue #1. Do not let these three values diverge.
const FONT_SIZE = 14;
const LINE_HEIGHT = 21;
const MONO_FONT = Platform.select({
  ios: "Menlo-Regular",
  android: "monospace",
  default: "monospace",
});

export default function PythonCodeEditor({
  value,
  onChangeText,
  editable = true,
  minHeight = 90,
  placeholder = "# Write your Python code here",
  fill = false,
  resetToken = 0,
}: Props) {
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setMeasuredHeight(h);
  }, []);

  // Editable (playground) screens: only remount on an explicit resetToken
  // bump, never on keystrokes — this is what keeps typing/cursor stable.
  // Read-only (quiz/theory snippet) screens: remount whenever the snippet
  // itself changes, since those are swapped wholesale, not typed into.
  const editorKey = editable ? `edit-${resetToken}` : `view-${value}`;

  const boxHeight = fill ? measuredHeight ?? minHeight : minHeight;
  const showPlaceholder = editable && value.length === 0;

  return (
    <View style={fill ? styles.fillWrapper : undefined} onLayout={fill ? onLayout : undefined}>
      {showPlaceholder && <Text style={styles.placeholder}>{placeholder}</Text>}

      <View
        style={[
          styles.editorBox,
          { height: boxHeight },
          fill && styles.editorBoxFill,
          !editable && styles.locked,
        ]}
      >
        <CodeEditor
          key={editorKey}
          initialValue={value}
          onChange={onChangeText}
          language="python"
          syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
          showLineNumbers
          readOnly={!editable}
          style={{
            fontSize: FONT_SIZE,
            fontFamily: MONO_FONT,
            inputLineHeight: LINE_HEIGHT,
            highlighterLineHeight: LINE_HEIGHT,
            padding: 14,
            backgroundColor: "#0D0D0D",
            height: boxHeight,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWrapper: { flex: 1 },

  placeholder: {
    color: "#5C5C60",
    fontSize: 13,
    marginBottom: 6,
    fontFamily: MONO_FONT,
  },

  editorBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
    backgroundColor: "#0D0D0D",
  },
  editorBoxFill: { flex: 1 },

  locked: { opacity: 0.6 },
});