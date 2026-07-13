// HomeScreen.tsx
// Post-signup Home screen — dark theme, snake-path Python learning roadmap,
// Clerk-driven first name, and a tappable avatar with an SVG avatar picker.
//
// Required packages:
//   npx expo install react-native-svg
//   npm install lucide-react-native @react-native-async-storage/async-storage
//   (Clerk already set up in your project: @clerk/clerk-expo)
//
// Drop this in app/(tabs)/index.tsx or wherever your Home route lives.

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  SafeAreaView,
  Modal,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import {
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Terminal,
  Code2,
  Box,
  List,
  Braces,
  AlertTriangle,
  Component,
  Lock,
  Calendar,
  Star,
  Home as HomeIcon,
  User,
  X,
  Check,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 20;
const CARD_GAP = 14;
const CARD_W = (SCREEN_W - H_PADDING * 2 - CARD_GAP * 2) / 3;
const CARD_H = CARD_W * 1.3;
const AVATAR_STORAGE_KEY = "@home_selected_avatar";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Custom icons not available in lucide
// ---------------------------------------------------------------------------
const PythonIcon = ({ size = 28, color = COLORS.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M15.9 3.2c-1.5 0-2.9.13-4.1.36-3.6.63-4.3 1.96-4.3 4.4v3.23h8.6v1.08H4.6c-2.46 0-4.6 1.48-5.28 4.3-.77 3.24-.8 5.27 0 8.65.6 2.52 2.03 4.3 4.5 4.3h2.9v-3.86c0-2.8 2.43-5.28 5.28-5.28h8.6c2.36 0 4.24-1.94 4.24-4.32V7.96c0-2.3-1.94-4.03-4.24-4.4a25 25 0 0 0-4.7-.36ZM11.4 6c.9 0 1.62.74 1.62 1.65 0 .9-.73 1.64-1.62 1.64-.9 0-1.62-.73-1.62-1.64C9.78 6.74 10.5 6 11.4 6Z"
      fill={color}
    />
    <Path
      d="M16.1 28.8c1.5 0 2.9-.13 4.1-.36 3.6-.63 4.3-1.96 4.3-4.4v-3.23h-8.6v-1.08h11.5c2.46 0 4.6-1.48 5.28-4.3.77-3.24.8-5.27 0-8.65-.6-2.52-2.03-4.3-4.5-4.3h-2.9v3.86c0 2.8-2.43 5.28-5.28 5.28h-8.6c-2.36 0-4.24 1.94-4.24 4.32v7.28c0 2.3 1.94 4.03 4.24 4.4a25 25 0 0 0 4.7.36ZM20.6 26c-.9 0-1.62-.74-1.62-1.65 0-.9.73-1.64 1.62-1.64.9 0 1.62.73 1.62 1.64 0 .91-.72 1.65-1.62 1.65Z"
      fill={color}
    />
  </Svg>
);

const ControlFlowIcon = ({ size = 28, color = COLORS.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M16 3 L24 11 L16 19 L8 11 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M16 19 V22 M16 22 H8 M16 22 H24 M8 22 V25 M24 22 V25" stroke={color} strokeWidth={1.8} />
    <Rect x={4.5} y={25} width={7} height={4} rx={1} stroke={color} strokeWidth={1.6} />
    <Rect x={20.5} y={25} width={7} height={4} rx={1} stroke={color} strokeWidth={1.6} />
  </Svg>
);

// ---------------------------------------------------------------------------
// Avatar SVGs — 3 boy / 3 girl flat-vector styles, tuned to the app's palette
// ---------------------------------------------------------------------------
type AvatarId = "boy1" | "boy2" | "boy3" | "girl1" | "girl2" | "girl3";

const AVATAR_OPTIONS: { id: AvatarId; label: string }[] = [
  { id: "girl1", label: "Ponytail" },
  { id: "girl2", label: "Bob" },
  { id: "girl3", label: "Curly" },
  { id: "boy1", label: "Buzz Cut" },
  { id: "boy2", label: "Curly" },
  { id: "boy3", label: "Beanie" },
];

const AvatarSVG = ({ id, size = 68 }: { id: AvatarId; size?: number }) => {
  const skin = "#E4C9A8";
  const hair = "#1E1E1E";
  const cloth = "#2E2E2E";
  const bg = "#242424";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={50} fill={bg} />
      {/* shoulders / clothing */}
      <Path d="M18 98 C18 76 32 66 50 66 C68 66 82 76 82 98 Z" fill={cloth} />
      {/* neck */}
      <Rect x={42} y={58} width={16} height={14} rx={6} fill={skin} />
      {/* face */}
      <Circle cx={50} cy={44} r={22} fill={skin} />
      {/* eyes */}
      <Circle cx={42} cy={45} r={2.2} fill={hair} />
      <Circle cx={58} cy={45} r={2.2} fill={hair} />
      {/* smile */}
      <Path d="M43 53 Q50 58 57 53" stroke={hair} strokeWidth={2} fill="none" strokeLinecap="round" />

      {id === "girl1" && (
        <>
          <Path d="M27 40 C27 20 73 20 73 40 C73 30 64 24 50 24 C36 24 27 30 27 40 Z" fill={hair} />
          <Path d="M69 34 C78 38 80 54 74 66 C71 60 69 50 69 34 Z" fill={hair} />
          <Circle cx={26} cy={44} r={5} fill={hair} />
          <Circle cx={74} cy={44} r={5} fill={hair} />
        </>
      )}
      {id === "girl2" && (
        <>
          <Path
            d="M26 46 C24 24 76 24 74 46 C74 34 65 26 50 26 C35 26 26 34 26 46 Z"
            fill={hair}
          />
          <Path d="M25 40 C24 50 25 58 29 64 L25 64 C22 56 22 46 25 40 Z" fill={hair} />
          <Path d="M75 40 C76 50 75 58 71 64 L75 64 C78 56 78 46 75 40 Z" fill={hair} />
        </>
      )}
      {id === "girl3" && (
        <>
          <Circle cx={31} cy={34} r={8} fill={hair} />
          <Circle cx={40} cy={24} r={9} fill={hair} />
          <Circle cx={50} cy={21} r={9.5} fill={hair} />
          <Circle cx={60} cy={24} r={9} fill={hair} />
          <Circle cx={69} cy={34} r={8} fill={hair} />
          <Circle cx={26} cy={44} r={7} fill={hair} />
          <Circle cx={74} cy={44} r={7} fill={hair} />
        </>
      )}
      {id === "boy1" && (
        <Path d="M28 34 C28 20 72 20 72 34 C72 26 63 22 50 22 C37 22 28 26 28 34 Z" fill={hair} />
      )}
      {id === "boy2" && (
        <>
          <Circle cx={33} cy={30} r={7} fill={hair} />
          <Circle cx={43} cy={22} r={8} fill={hair} />
          <Circle cx={57} cy={22} r={8} fill={hair} />
          <Circle cx={67} cy={30} r={7} fill={hair} />
          <Circle cx={50} cy={20} r={8} fill={hair} />
        </>
      )}
      {id === "boy3" && (
        <>
          <Path d="M26 36 C26 18 74 18 74 36 L74 30 C74 30 62 24 50 24 C38 24 26 30 26 30 Z" fill="#3B82F6" />
          <Rect x={26} y={30} width={48} height={6} fill="#2563EB" />
        </>
      )}
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// Lesson data
// ---------------------------------------------------------------------------
type Lesson = {
  number: string;
  title: string;
  icon: React.ReactNode;
  progress: number;
  locked?: boolean;
};

const LESSONS: Lesson[] = [
  { number: "01", title: "Introduction\nto Python", icon: <PythonIcon />, progress: 0.65 },
  { number: "02", title: "Variables &\nData Types", icon: <Terminal color={COLORS.white} size={26} />, progress: 0.4 },
  { number: "03", title: "Operators", icon: <Code2 color={COLORS.white} size={26} />, progress: 0.2 },
  { number: "04", title: "Control\nFlow", icon: <ControlFlowIcon />, progress: 0.1 },
  { number: "05", title: "Functions", icon: <List color={COLORS.white} size={26} />, progress: 0 },
  { number: "06", title: "Modules &\nPackages", icon: <Box color={COLORS.white} size={26} />, progress: 0 },
  { number: "07", title: "Lists &\nTuples", icon: <List color={COLORS.white} size={26} />, progress: 0 },
  { number: "08", title: "Dictionaries", icon: <Braces color={COLORS.white} size={26} />, progress: 0 },
  { number: "09", title: "Exception\nHandling", icon: <AlertTriangle color={COLORS.white} size={26} />, progress: 0 },
  { number: "10", title: "OOP\nBasics", icon: <Component color={COLORS.white} size={26} />, progress: 0, locked: true },
  { number: "11", title: "Coming\nSoon", icon: <Lock color={COLORS.textTertiary} size={24} />, progress: 0, locked: true },
  { number: "12", title: "Coming\nSoon", icon: <Lock color={COLORS.textTertiary} size={24} />, progress: 0, locked: true },
];

// ---------------------------------------------------------------------------
// Snake grid building blocks
// ---------------------------------------------------------------------------
const LessonCard = ({ lesson }: { lesson: Lesson }) => (
  <View style={[styles.card, lesson.locked && styles.cardLocked]}>
    <View style={styles.cardTopRow}>
      <Text style={[styles.cardNumber, lesson.locked && { color: COLORS.textTertiary }]}>
        {lesson.number}
      </Text>
      {lesson.locked && <Lock color={COLORS.textTertiary} size={12} />}
    </View>
    <View style={styles.cardIconWrap}>{lesson.icon}</View>
    {!lesson.locked ? (
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${lesson.progress * 100}%` }]} />
      </View>
    ) : (
      <View style={{ height: 4, marginBottom: 8 }} />
    )}
    <Text style={[styles.cardTitle, lesson.locked && { color: COLORS.textTertiary }]}>
      {lesson.title}
    </Text>
  </View>
);

const HorizontalConnector = () => (
  <View style={styles.hConnector}>
    <View style={styles.hLine} />
    <View style={styles.dotOuter}>
      <View style={styles.dotInner} />
    </View>
    <View style={styles.hLine} />
  </View>
);

// Smooth vertical "S" loop linking the last card of one row to the first
// card of the next, on whichever side the snake turns.
const VerticalLoopConnector = ({ side }: { side: "left" | "right" }) => {
  const w = 34;
  const h = CARD_GAP + 6;
  const path =
    side === "right"
      ? `M4,0 C4,${h * 0.45} ${w - 6},${h * 0.2} ${w - 6},${h * 0.5} C${w - 6},${h * 0.8} 4,${h * 0.55} 4,${h}`
      : `M${w - 4},0 C${w - 4},${h * 0.45} 6,${h * 0.2} 6,${h * 0.5} C6,${h * 0.8} ${w - 4},${h * 0.55} ${w - 4},${h}`;
  return (
    <View style={[styles.verticalLoopWrap, side === "right" ? { right: -18 } : { left: -18 }]}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Path d={path} stroke={COLORS.line} strokeWidth={2} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

const TrailingDots = ({ side }: { side: "left" | "right" }) => (
  <View style={[styles.trailingDots, side === "left" ? { left: -30 } : { right: -30 }]}>
    <View style={[styles.leadDot, { width: 4, height: 4 }]} />
    <View style={[styles.leadDot, { width: 5, height: 5 }]} />
    <View style={[styles.leadDot, { width: 6, height: 6 }]} />
  </View>
);

// Renders one row of up to 3 lessons in the given direction, with a
// vertical loop connector positioned at the correct edge.
const SnakeRow = ({
  lessons,
  reversed,
  connectorSide,
  showConnectorBelow,
  trailingDotsSide,
}: {
  lessons: Lesson[];
  reversed: boolean;
  connectorSide?: "left" | "right";
  showConnectorBelow?: boolean;
  trailingDotsSide?: "left" | "right";
}) => {
  const ordered = reversed ? [...lessons].reverse() : lessons;
  return (
    <View style={styles.rowWrap}>
      <View style={styles.row}>
        {ordered.map((lesson, idx) => (
          <React.Fragment key={lesson.number}>
            <LessonCard lesson={lesson} />
            {idx < ordered.length - 1 && <HorizontalConnector />}
          </React.Fragment>
        ))}
      </View>
      {trailingDotsSide && <TrailingDots side={trailingDotsSide} />}
      {showConnectorBelow && connectorSide && <VerticalLoopConnector side={connectorSide} />}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Avatar picker bottom sheet
// ---------------------------------------------------------------------------
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
          <X color={COLORS.white} size={18} />
        </Pressable>
      </View>

      <View style={styles.avatarGrid}>
        {AVATAR_OPTIONS.map((opt) => {
          const isSelected = opt.id === selected;
          return (
            <Pressable key={opt.id} style={styles.avatarOption} onPress={() => onSelect(opt.id)}>
              <View style={[styles.avatarOptionRing, isSelected && styles.avatarOptionRingActive]}>
                <AvatarSVG id={opt.id} size={64} />
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check color={COLORS.bg} size={13} strokeWidth={3} />
                  </View>
                )}
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
  const firstName = user?.firstName ?? "there";

  const [avatarId, setAvatarId] = useState<AvatarId>("girl1");
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
        if (stored) setAvatarId(stored as AvatarId);
      } catch {
        // ignore — fall back to default avatar
      }
    })();
  }, []);

  const handleSelectAvatar = async (id: AvatarId) => {
    setAvatarId(id);
    try {
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, id);
    } catch {
      // ignore persistence failure, UI already updated
    }
  };

  const rows = useMemo(() => {
    const chunks: Lesson[][] = [];
    for (let i = 0; i < LESSONS.length; i += 3) chunks.push(LESSONS.slice(i, i + 3));
    return chunks;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={10}>
            <LayoutGrid color={COLORS.white} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Python</Text>
          <Pressable hitSlop={10}>
            <Search color={COLORS.white} size={24} />
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

        {/* Segmented pill tabs */}
        <View style={styles.segmentRow}>
          <View style={[styles.segmentPill, styles.segmentPillActive]}>
            <Text style={styles.segmentTextActive}>Lessons</Text>
          </View>
          <View style={styles.segmentPill}>
            <Text style={styles.segmentText}>Books</Text>
          </View>
          <View style={styles.segmentPill}>
            <Text style={styles.segmentText}>Chat</Text>
          </View>
        </View>

        {/* Learnings header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Learnings</Text>
          <Pressable style={styles.filterButton} hitSlop={8}>
            <SlidersHorizontal color={COLORS.white} size={18} />
          </Pressable>
        </View>

        {/* Snake path grid */}
        <View style={styles.snakeWrap}>
          {rows.map((rowLessons, rowIdx) => {
            const reversed = rowIdx % 2 === 1;
            const isLastRow = rowIdx === rows.length - 1;
            const connectorSide = reversed ? "left" : "right";
            return (
              <SnakeRow
                key={rowIdx}
                lessons={rowLessons}
                reversed={reversed}
                connectorSide={connectorSide}
                showConnectorBelow={!isLastRow}
                trailingDotsSide={isLastRow ? (reversed ? "right" : "left") : undefined}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Floating bottom nav */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} hitSlop={10}>
            <Calendar color={COLORS.textSecondary} size={22} />
          </Pressable>
          <Pressable style={styles.navItem} hitSlop={10}>
            <Star color={COLORS.textSecondary} size={22} />
          </Pressable>
          <View style={styles.navItemActive}>
            <HomeIcon color={COLORS.white} size={22} />
          </View>
          <Pressable style={styles.navItem} hitSlop={10}>
            <User color={COLORS.textSecondary} size={22} />
          </Pressable>
        </View>
      </View>

      <AvatarPickerSheet
        visible={pickerVisible}
        selected={avatarId}
        onSelect={handleSelectAvatar}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: H_PADDING },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "700" },

  greetingRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 28 },
  greetingTitle: { color: COLORS.white, fontSize: 30, fontWeight: "800", marginBottom: 8 },
  greetingSubtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  avatarPressable: {
    marginLeft: 12,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },

  segmentRow: { flexDirection: "row", marginTop: 28, gap: 10 },
  segmentPill: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  segmentPillActive: { backgroundColor: COLORS.pill, borderColor: COLORS.pill },
  segmentText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
  segmentTextActive: { color: COLORS.white, fontWeight: "700", fontSize: 14 },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 22,
  },
  sectionHeaderTitle: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  snakeWrap: { width: "100%" },
  rowWrap: { position: "relative" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
    padding: 12,
    justifyContent: "space-between",
  },
  cardLocked: { backgroundColor: COLORS.cardLocked, borderStyle: "dashed" },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardNumber: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  cardIconWrap: { alignItems: "center", justifyContent: "center", flex: 1 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.track,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: COLORS.fillBar, borderRadius: 2 },
  cardTitle: { color: COLORS.white, fontSize: 13, fontWeight: "600", lineHeight: 17 },

  hConnector: { width: CARD_GAP, alignItems: "center", justifyContent: "center" },
  hLine: { width: CARD_GAP / 2 - 2, height: 1.5, backgroundColor: COLORS.line },
  dotOuter: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },

  verticalLoopWrap: { position: "absolute", top: CARD_H - 2 },

  trailingDots: {
    position: "absolute",
    top: CARD_H / 2 - 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  leadDot: { borderRadius: 6, backgroundColor: COLORS.textTertiary },

  bottomNavWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 20,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_W - H_PADDING * 2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 32,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  navItem: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  navItemActive: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2A2A2C",
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar picker sheet
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.pillBorder,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.pillBorder,
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { color: COLORS.white, fontSize: 19, fontWeight: "800" },
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
    rowGap: 20,
  },
  avatarOption: { width: "31%", alignItems: "center" },
  avatarOptionRing: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionRingActive: { borderColor: COLORS.white },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.sheetBg,
  },
  avatarOptionLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 8, fontWeight: "600" },
  sheetDoneBtn: {
    marginTop: 26,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  sheetDoneText: { color: COLORS.bg, fontSize: 15, fontWeight: "800" },
});