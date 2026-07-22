import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { tokenizePython, TOKEN_COLORS } from "@/utils/pythonHighlighter";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  minHeight?: number;
  placeholder?: string;
  fill?: boolean; // grow to fill all available vertical space (playground mode)
};

export default function PythonCodeEditor({
  value,
  onChangeText,
  editable = true,
  minHeight = 90,
  placeholder = "# Write your Python code here",
  fill = false,
}: Props) {
  const tokens = tokenizePython(value);

  // When long content makes the TextInput scroll internally, we apply
  // the same vertical offset to the highlight layer so both stay in sync.
  const [scrollY, setScrollY] = useState(0);

  return (
    <View style={fill ? styles.fillWrapper : undefined}>
      {/*
        ┌──────────────────────────────────────────┐
        │  Two-layer stack inside one rounded box   │
        │                                           │
        │  zIndex 0 ─ coloured <Text> (behind)      │
        │  zIndex 1 ─ transparent <TextInput>       │
        │            (on top — touch + cursor)      │
        │                                           │
        │  Learner sees ONLY the coloured tokens.   │
        │  Native black text is invisible because   │
        │  TextInput.color = transparent.           │
        └──────────────────────────────────────────┘
      */}
      <View
        style={[
          styles.editorBox,
          fill ? styles.editorBoxFill : { minHeight },
          !editable && styles.locked,
        ]}
      >
        {/* ── Layer 0: Syntax-highlighted tokens (BEHIND) ── */}
        <View
          style={[
            styles.highlightLayer,
            { transform: [{ translateY: -scrollY }] },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.mono}>
            {value.length === 0
              ? null
              : tokens.map((tok, i) => (
                  <Text
                    key={i}
                    style={{ color: TOKEN_COLORS[tok.type] || "#FFFFFF" }}
                  >
                    {tok.text}
                  </Text>
                ))}
            {/* Extra newline matches TextInput's trailing blank line
                so both layers have the same total height. */}
            {"\n"}
          </Text>
        </View>

        {/* ── Layer 1: Transparent TextInput (ON TOP) ── */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          // ASCII keyboard on iOS prevents smart/curly quotes that
          // silently break exact-match comparisons.
          keyboardType={Platform.OS === "ios" ? "ascii-capable" : "default"}
          placeholder={placeholder}
          placeholderTextColor="#5C5C60"
          selectionColor="rgba(86,182,194,0.5)"
          textAlignVertical="top"
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          style={[
            styles.mono,
            styles.transparentInput,
            fill && styles.inputFill,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mono: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 14,
    lineHeight: 21,
  },

  /* ── Outer containers ── */

  fillWrapper: { flex: 1 },

  // The box provides background, border, padding — both inner layers
  // inherit the same content area so their text aligns pixel-perfect.
  editorBox: {
    position: "relative",
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 14,
    overflow: "hidden", // clips highlight layer when scrolled
  },
  editorBoxFill: { flex: 1 },

  locked: { opacity: 0.6 },

  /* ── Layer 0: Highlight ── */

  // absoluteFillObject positions inside the parent's padding-box
  // (inside the border). Adding padding:14 here means the token text
  // starts at exactly the same offset as the TextInput's text (which
  // is also inset 14px by the parent's padding).
  highlightLayer: {
    padding: 14,
    zIndex: 0,
  },

  /* ── Layer 1: Transparent Input ── */

  // Sits on top (zIndex 1) so the cursor, selection handles, and
  // all touch/tap events work normally. The editorBox already
  // provides background + border + padding, so the TextInput itself
  // sets all of those to zero to avoid doubling up.
  transparentInput: {
    position: "relative",
    zIndex: 1,
    color: Platform.select({
      ios: "transparent",
      // rgba(0,0,0,0) is more reliable than the keyword "transparent"
      // on some older Android RN builds where the keyword leaked
      // visible black text through.
      android: "rgba(0,0,0,0)",
      default: "transparent",
    }),
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    padding: 0,
    borderRadius: 0,
  },
  inputFill: { flex: 1 },
});