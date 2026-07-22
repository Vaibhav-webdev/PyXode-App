import AvatarSVG from "@/components/AvatarSVG";
import { useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LayoutGrid, Lock, Settings } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { TabKey, TABS, TopicContent, TOPICS_BY_TAB } from "@/data/topics";
import { getTopicIcon } from "@/data/topics/iconMap";
import { getAllProgress, TopicProgress } from "@/utils/progressStorage";

const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 20;
const CARD_GAP = 14;
const CARD_W = (SCREEN_W - H_PADDING * 2 - CARD_GAP * 2) / 3;
const CARD_H = CARD_W * 1.3;
const AVATAR_STORAGE_KEY = "@home_selected_avatar";

const COLORS = {
  bg: "#000000",
  card: "#131313",
  cardBorder: "#262626",
  cardLocked: "#0D0D0D",
  pill: "#1C1C1E",
  pillBorder: "#2A2A2A",
  white: "#FFFFFF",
  textSecondary: "#9A9A9E",
  textTertiary: "#5C5C60",
  track: "#2E2E2E",
  fillBar: "#FFFFFF",
  line: "#3A3A3A",
  sheetBg: "#161616",
};

type AvatarId = "boy1" | "boy2" | "boy3" | "girl1" | "girl2" | "girl3";

const AVATAR_OPTIONS: { id: AvatarId; label: string }[] = [
  { id: "girl1", label: "Sleek Ponytail" },
  { id: "girl2", label: "Classic Bob" },
  { id: "girl3", label: "Voluminous Curls" },
  { id: "boy1", label: "Clean Buzz" },
  { id: "boy2", label: "Textured" },
  { id: "boy3", label: "Rural Beanie" },
];

// ---------------------------------------------------------------------------
// Lesson card — now driven by real topic + progress data
// ---------------------------------------------------------------------------
const LessonCard = ({
  topic,
  progress,
  locked,
  onPress,
}: {
  topic: TopicContent;
  progress: number;
  locked: boolean;
  onPress: () => void;
}) => (
  <Pressable
    style={[styles.card, locked && styles.cardLocked]}
    onPress={onPress}
    disabled={locked}
  >
    <View style={styles.cardTopRow}>
      <Text style={[styles.cardNumber, locked && { color: COLORS.textTertiary }]}>
        {topic.number}
      </Text>
      {locked && <Lock color={COLORS.textTertiary} size={14} />}
    </View>
    <View style={styles.cardIconWrap}>{getTopicIcon(topic.iconKey)}</View>
    <Text style={[styles.cardTitle, locked && { color: COLORS.textTertiary }]}>
      {topic.title}
    </Text>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  </Pressable>
);

const HorizontalConnector = () => (
  <View style={[styles.hConnector, { flex: 1, height: 20, justifyContent: "center" }]}>
    <Svg height="100%" width="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
      <Path
        d="M0,10 C25,20 75,0 100,10"
        stroke="#3A3A3A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const VerticalLoopConnector = ({ side }: { side: "left" | "right" }) => {
  const w = 28;
  const h = CARD_GAP + 20;

  // Base curve (right side)
  const path = "M14,0 Q34,20 11,40";

  return (
    <View
      style={[
        styles.verticalLoopWrap,
        side === "right" ? { right: -12 } : { left: -12 },
        { top: 115 },
      ]}
    >
      <Svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={
          side === "left"
            ? {
              transform: [{ scaleX: -1 }],
            }
            : undefined
        }
      >
        <Path
          d={path}
          stroke={COLORS.line}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const SnakeRow = ({
  topics,
  reversed,
  connectorSide,
  showConnectorBelow,
  progressMap,
  onOpenTopic,
}: {
  topics: TopicContent[];
  reversed: boolean;
  connectorSide?: "left" | "right";
  showConnectorBelow?: boolean;
  progressMap: Record<string, TopicProgress>;
  onOpenTopic: (topic: TopicContent, locked: boolean) => void;
}) => {
  const ordered = reversed ? [...topics].reverse() : topics;
  return (
    <View style={styles.rowWrap}>
      <View style={styles.row}>
        {ordered.map((topic, idx) => {
          const globalIndex = topics.indexOf(topic);
          const prevTopic = globalIndex > 0 ? topics[globalIndex - 1] : null;
          const locked = false;
          const progress = progressMap[topic.id]?.progress ?? 0;
          return (
            <React.Fragment key={topic.id}>
              <LessonCard
                topic={topic}
                progress={progress}
                locked={locked}
                onPress={() => onOpenTopic(topic, locked)}
              />
              {idx < ordered.length - 1 && <HorizontalConnector />}
            </React.Fragment>
          );
        })}
      </View>
      {showConnectorBelow && connectorSide && <VerticalLoopConnector side={connectorSide} />}
    </View>
  );
};

const AvatarPickerSheet = ({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: AvatarId;
  onSelect: (id: AvatarId) => void;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.sheetBackdrop} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeaderRow}>
        <View>
          <Text style={styles.sheetTitle}>Choose your avatar</Text>
          <Text style={styles.sheetSubtitle}>Pick a look that feels like you</Text>
        </View>
        <Pressable style={styles.sheetCloseBtn} onPress={onClose} hitSlop={10}>
          <Text style={{ color: COLORS.white, fontSize: 16 }}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.avatarGrid}>
        {AVATAR_OPTIONS.map((opt) => {
          const isSelected = opt.id === selected;
          return (
            <Pressable key={opt.id} style={styles.avatarOption} onPress={() => onSelect(opt.id)}>
              <View style={[styles.avatarOptionRing, isSelected && styles.avatarOptionRingActive]}>
                <AvatarSVG id={opt.id} size={64} />
              </View>
              <Text style={styles.avatarOptionLabel}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.sheetDoneBtn} onPress={onClose}>
        <Text style={styles.sheetDoneText}>Done</Text>
      </Pressable>
    </View>
  </Modal>
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const firstName = user?.firstName ?? "there";

  const [avatarId, setAvatarId] = useState<AvatarId>("girl1");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});

  // Reload progress every time the screen regains focus (e.g. after finishing a topic)
  useEffect(() => {
    const loadData = async () => {
      const all = await getAllProgress();
      setProgressMap(all);
      try {
        const stored = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
        if (stored) setAvatarId(stored as AvatarId); // TypeScript me 'as AvatarId' laga lena agar zaruart ho
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []); // Empty array ka matlab hai ye sirf ek baar chalega jab screen load hogi

  const handleSelectAvatar = async (id: AvatarId) => {
    setAvatarId(id);
    try {
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, id);
    } catch { }
  };

  const activeTopics = TOPICS_BY_TAB[activeTab];

  const rows = useMemo(() => {
    const chunks: TopicContent[][] = [];
    for (let i = 0; i < activeTopics.length; i += 3) chunks.push(activeTopics.slice(i, i + 3));
    return chunks;
  }, [activeTopics]);

  const handleOpenTopic = (topic: TopicContent, locked: boolean) => {
    if (locked) return;
    router.push(`/topic/${topic.id}` as any);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={10}>
            <LayoutGrid color={COLORS.white} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Python</Text>
          <Pressable onPress={() => {
            router.push("/(tabs)/settings")
          }} hitSlop={10}>
            <Settings color={COLORS.white} size={24} />
          </Pressable>
        </View>

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Hi, {firstName}!</Text>
            <Text style={styles.greetingSubtitle}>
              Let's continue your learning{"\n"}journey in Python.
            </Text>
          </View>
          <Pressable onPress={() => setPickerVisible(true)} style={styles.avatarPressable}>
            <AvatarSVG id={avatarId} size={68} />
          </Pressable>
        </View>

        {/* Functional segmented tab pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segmentRow}
        >
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                style={[styles.segmentPill, isActive && styles.segmentPillActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={isActive ? styles.segmentTextActive : styles.segmentText}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Learnings header — filter button removed, tabs already do the job */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Learnings</Text>
        </View>

        {/* Snake path grid, now built from the active tab's topics */}
        <View>
          {rows.map((rowTopics, rowIdx) => {
            const reversed = rowIdx % 2 === 1;
            const isLastRow = rowIdx === rows.length - 1;
            const connectorSide = reversed ? "left" : "right";
            return (
              <SnakeRow
                key={`${activeTab}-${rowIdx}`}
                topics={rowTopics}
                reversed={reversed}
                connectorSide={connectorSide}
                showConnectorBelow={!isLastRow}
                progressMap={progressMap}
                onOpenTopic={handleOpenTopic}
              />
            );
          })}
        </View>
      </ScrollView>
      <AvatarPickerSheet
        visible={pickerVisible}
        selected={avatarId}
        onSelect={handleSelectAvatar}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: H_PADDING },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "600" },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 23,
  },
  greetingTitle: { color: COLORS.white, fontSize: 26, fontWeight: "700" },
  greetingSubtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 18 },
  avatarPressable: {
    borderWidth: 2,
    borderColor: "#d8d8d891",
    backgroundColor: "#232323",
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentRow: { gap: 8, paddingBottom: 16 },
  segmentPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  segmentPillActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  segmentText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "500" },
  segmentTextActive: { color: COLORS.bg, fontSize: 13, fontWeight: "700" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionHeaderTitle: { color: COLORS.white, fontSize: 20, fontWeight: "700" },
  // snakeWrap: { paddingBottom: 24 },
  rowWrap: { position: "relative" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  hConnector: { marginHorizontal: -2 },
  verticalLoopWrap: { position: "absolute", bottom: -CARD_GAP - 10 },
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 10,
    justifyContent: "space-between",
  },
  cardLocked: { backgroundColor: COLORS.cardLocked },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "600" },
  cardIconWrap: { alignItems: "center", justifyContent: "center", flex: 1 },
  cardTitle: { color: COLORS.white, fontSize: 11, fontWeight: "600", lineHeight: 14 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.track,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: COLORS.fillBar, borderRadius: 2 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
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
    backgroundColor: COLORS.pillBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sheetTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  sheetSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 24,
  },
  avatarOption: { width: "30%", alignItems: "center", marginBottom: 20 },
  avatarOptionRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionRingActive: { borderColor: COLORS.white },
  avatarOptionLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 8, textAlign: "center" },
  sheetDoneBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  sheetDoneText: { color: COLORS.bg, fontWeight: "700", fontSize: 15 },
});