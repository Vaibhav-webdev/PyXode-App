/**
 * PythonCodeEditor.tsx
 * ----------------------
 * No external library — same technique as your existing CodeEditorScreen:
 * an invisible TextInput layered under a syntax-highlighted <Text> overlay.
 * Adapted into a plain controlled component: value + onChangeText.
 *
 * NOTE: I don't have your original `styles` object (you only pasted the
 * logic/JSX), so the styles below are reasonable placeholders using the
 * SAME style keys your existing screen used (textInputLayer, highlightLayer,
 * lineNumberGutter, etc.). If you already have those styled and working
 * elsewhere in your app, just paste your existing StyleSheet.create block
 * in at the bottom — the keys already line up, nothing else needs to change.
 */
import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const TOOLBAR_SYMBOLS = ['Tab', ':', '(', ')', '[', ']', '"', "'", '=', '#', 'def ', 'return '];

const HIGHLIGHT_REGEX =
  /(\n|#.*|""".*?"""|'''.*?'''|".*?"|'.*?'|\b(?:def|return|if|else|elif|for|in|while|import|from|as|try|except|finally|raise|class|pass|break|continue|is|not|and|or|True|False|None|lambda|with|yield|assert)\b|\b(?:print|input|len|range|str|int|float|list|dict|set|tuple|type|open|sum|min|max|abs)\b|\b\d+(?:\.\d+)?\b)/g;

function renderHighlightedPython(text: string) {
  const parts = text.split(HIGHLIGHT_REGEX);
  return parts.map((token, index) => {
    if (!token) return null;
    if (token === '\n') return '\n';
    if (token.startsWith('#')) {
      return (
        <Text key={index} style={styles.synComment}>
          {token}
        </Text>
      );
    }
    if (token.startsWith('"') || token.startsWith("'")) {
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
    if (/^(print|input|len|range|str|int|float|list|dict|set|tuple|type|open|sum|min|max|abs)$/.test(token)) {
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
}

export default function PythonCodeEditor({ value, onChangeText }: Props) {
  const lineNumbers = Array.from({ length: value.split('\n').length }, (_, i) => i + 1);

  const insertSymbol = (symbol: string) => {
    onChangeText(value + (symbol === 'Tab' ? '    ' : symbol));
  };

  // Same auto-indent / auto-pair / smart-backspace logic as your CodeEditorScreen,
  // just diffing against the `value` prop instead of local state.
  const handleChange = (newText: string) => {
    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };

    if (newText.length === value.length + 1) {
      let diffIdx = -1;
      for (let i = 0; i < newText.length; i++) {
        if (newText[i] !== value[i]) {
          diffIdx = i;
          break;
        }
      }
      if (diffIdx !== -1) {
        const typedChar = newText[diffIdx];

        if (typedChar === '\n') {
          const textBefore = newText.slice(0, diffIdx);
          const textAfter = newText.slice(diffIdx + 1);
          const currentLine = textBefore.split('\n').pop() ?? '';
          const indentMatch = currentLine.match(/^(\s*)/);
          let indent = indentMatch ? indentMatch[1] : '';
          if (currentLine.trim().endsWith(':')) indent += '    ';
          onChangeText(textBefore + '\n' + indent + textAfter);
          return;
        }

        if (pairs[typedChar]) {
          const textBefore = newText.slice(0, diffIdx + 1);
          const textAfter = newText.slice(diffIdx + 1);
          onChangeText(textBefore + pairs[typedChar] + textAfter);
          return;
        }
      }
    }

    if (newText.length === value.length - 1) {
      let removedIdx = -1;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== newText[i]) {
          removedIdx = i;
          break;
        }
      }
      if (removedIdx >= 3 && value.slice(removedIdx - 3, removedIdx + 1) === '    ') {
        onChangeText(value.slice(0, removedIdx - 3) + value.slice(removedIdx + 1));
        return;
      }
    }

    onChangeText(newText);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.toolbarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
          {TOOLBAR_SYMBOLS.map((symbol, idx) => (
            <TouchableOpacity key={idx} style={styles.toolbarButton} onPress={() => insertSymbol(symbol)}>
              <Text style={styles.toolbarText}>{symbol}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.editorScroll} bounces={false}>
        <View style={styles.editorRow}>
          <View style={styles.lineNumberGutter}>
            {lineNumbers.map((num) => (
              <Text key={num} style={styles.lineNumberText}>
                {num}
              </Text>
            ))}
          </View>

          <ScrollView horizontal style={styles.horizontalCodeScroll}>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.textInputLayer}
                multiline
                value={value}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                selectionColor="rgba(255,255,255,0.3)"
                underlineColorAndroid="transparent"
              />
              <Text style={styles.highlightLayer} pointerEvents="none">
                {renderHighlightedPython(value)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const FONT_SIZE = wp('3.6%');
const LINE_HEIGHT = hp('2.6%');

// ⚠️ Placeholder styles — swap this whole block for your existing one if you have it.
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0d1117' },

  toolbarContainer: { borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.15)' },
  toolbarScroll: { paddingHorizontal: wp('2%'), paddingVertical: hp('0.8%'), alignItems: 'center', gap: wp('1.5%') },
  toolbarButton: { paddingHorizontal: wp('2.5%'), paddingVertical: hp('0.6%'), backgroundColor: '#161b22', borderRadius: 6 },
  toolbarText: { color: '#e2e8f0', fontSize: wp('3.2%'), fontFamily: 'monospace' },

  editorScroll: { flex: 1 },
  editorRow: { flexDirection: 'row', minHeight: '100%' },

  lineNumberGutter: { paddingVertical: hp('1.2%'), paddingHorizontal: wp('2%'), alignItems: 'flex-end' },
  lineNumberText: { color: '#4b5563', fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT, fontFamily: 'monospace' },

  horizontalCodeScroll: { flex: 1 },
  codeContainer: { minWidth: wp('90%'), paddingVertical: hp('1.2%'), paddingHorizontal: wp('2%') },

  textInputLayer: {
    position: 'absolute',
    top: hp('1.2%'),
    left: wp('2%'),
    right: 0,
    color: 'transparent',
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    fontFamily: 'monospace',
    padding: 0,
  },
  highlightLayer: { fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT, fontFamily: 'monospace' },

  synComment: { color: '#6a9955' },
  synString: { color: '#ce9178' },
  synKeyword: { color: '#569cd6', fontWeight: '700' },
  synBuiltin: { color: '#4ec9b0' },
  synNumber: { color: '#b5cea8' },
  synDefault: { color: '#e2e8f0' },
});