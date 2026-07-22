// components/FilterModal.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { X, RotateCcw, Check } from "lucide-react-native";
import {
  DIFFICULTY_OPTIONS,
  PROGRESS_FILTER_OPTIONS,
  type Difficulty,
} from "@/data/curriculum";

const COLORS = {
  bg: "#000000",
  sheetBg: "#161616",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  pill: "#1C1C1E",
  pillActive: "#2A2A2E",
  pillBorder: "#2A2A2A",
  pillActiveBorder: "#6C6CFF",
  accent: "#6C6CFF",
};

type FilterState = {
  difficulty: Difficulty | null;
  progress: "completed" | "in-progress" | "not-started" | null;
};

type Props = {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
};

export default function FilterModal({ visible, filters, onApply, onClose }: Props) {
  const [local, setLocal] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible, filters]);

  const toggleDifficulty = (d: Difficulty) => {
    setLocal((prev) => ({
      ...prev,
      difficulty: prev.difficulty === d ? null : d,
    }));
  };

  const toggleProgress = (
    p: "completed" | "in-progress" | "not-started"
  ) => {
    setLocal((prev) => ({
      ...prev,
      progress: prev.progress === p ? null : p,
    }));
  };

  const reset = () => setLocal({ difficulty: null, progress: null });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filter Topics</Text>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
            <X color={COLORS.white} size={18} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Difficulty */}
          <Text style={styles.sectionLabel}>Difficulty</Text>
          <View style={styles.pillRow}>
            {DIFFICULTY_OPTIONS.map((opt) => {
              const active = local.difficulty === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => toggleDifficulty(opt.value)}
                >
                  {active && <Check color={COLORS.accent} size={14} style={{ marginRight: 4 }} />}
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Progress */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Progress</Text>
          <View style={styles.pillRow}>
            {PROGRESS_FILTER_OPTIONS.map((opt) => {
              const active = local.progress === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => toggleProgress(opt.value)}
                >
                  {active && <Check color={COLORS.accent} size={14} style={{ marginRight: 4 }} />}
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.resetBtn} onPress={reset}>
            <RotateCcw color={COLORS.textSecondary} size={16} />
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <Pressable
            style={styles.applyBtn}
            onPress={() => {
              onApply(local);
              onClose();
            }}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  pillActive: {
    backgroundColor: COLORS.pillActive,
    borderColor: COLORS.pillActiveBorder,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  pillTextActive: {
    color: COLORS.accent,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.pill,
  },
  resetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  applyBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  applyText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});