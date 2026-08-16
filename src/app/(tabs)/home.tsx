import AvatarSVG from "@/components/AvatarSVG";
import { TabKey, TABS, TopicContent, TOPICS_BY_TAB } from "@/data/topics";
import { getTopicIcon } from "@/data/topics/iconMap";
import { SoundManager } from "@/hooks/SoundManager";
import { getAllProgress, TopicProgress } from "@/utils/progressStorage";
import { useSettings } from "@/context/SwitchContext";
import { hp, wp } from "@/utils/wp_hp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { LayoutGrid, Lock, Settings } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import BannerAdComponent_Home from "@/components/ads/BannerAdsComponents_2";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text, Vibration, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const rewardedAdUnitId: string = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-2990397099587279/5695993424';

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

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
  onPress,
}: {
  topic: TopicContent;
  progress: number;
  onPress: () => void;
}) => (
  <Pressable
    style={[styles.card]}
    onPress={onPress}
  >
    <View style={styles.cardTopRow}>
      <Text style={[styles.cardNumber]}>
        {topic.number}
      </Text>
    </View>
    <View style={styles.cardIconWrap}>{getTopicIcon(topic.iconKey)}</View>
    <Text style={[styles.cardTitle]}>
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
  vibrationEnabled,
  connectorSide,
  showConnectorBelow,
  progressMap,
  onOpenTopic,
}: {
  topics: TopicContent[];
  reversed: boolean;
  vibrationEnabled: any;
  connectorSide?: "left" | "right";
  showConnectorBelow?: boolean;
  progressMap: Record<string, TopicProgress>;
  onOpenTopic: (topic: TopicContent) => void;
}) => {
  const ordered = reversed ? [...topics].reverse() : topics;
  return (
    <View style={styles.rowWrap}>
      <View style={styles.row}>
        {ordered.map((topic, idx) => {
          const globalIndex = topics.indexOf(topic);
          const prevTopic = globalIndex > 0 ? topics[globalIndex - 1] : null;
          const progress = progressMap[topic.id]?.progress ?? 0;
          return (
            <React.Fragment key={topic.id}>
              <LessonCard
                topic={topic}
                progress={progress}
                onPress={async () => {
                  if (vibrationEnabled) {
                    Vibration.vibrate(200)
                  }
                  await SoundManager.play('click');
                  onOpenTopic(topic)
                }}
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
  const router = useRouter();
  const [avatarId, setAvatarId] = useState<AvatarId>("girl1");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');

        if (storedName !== null) {
          setName(storedName);
        }
      } catch (error) {
        null
      }
    };

    fetchUserName();
  }, []);

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
  }, []);

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

  const [loaded, setLoaded] = useState<boolean>(false);

  // Dynamic data aur state tracking ke liye Refs
  const pendingTopicRef = useRef<TopicContent | null>(null);
  const isRewardedRef = useRef<boolean>(false);

  const navigateToTopic = (topic: TopicContent): void => {
    router.push(`/topic/${topic.id}` as any);
  };

  // 2. Rewarded Ad Event Listeners Setup
  useEffect(() => {
    // Ad Load Event
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    // User ne poora ad dekh liya (Reward earn ho gaya)
    const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      isRewardedRef.current = true;
    });

    // Ad Screen se Dismiss/Close hone par
    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);

      // Agar reward mila hai aur target topic available hai
      if (isRewardedRef.current && pendingTopicRef.current) {
        navigateToTopic(pendingTopicRef.current);
      }

      // Cleanup and preload next ad
      isRewardedRef.current = false;
      pendingTopicRef.current = null;
      rewarded.load();
    });

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  // 3. Main Topic Click Handler
  const handleOpenTopic = (topic: TopicContent): void => {
    if (loaded) {
      pendingTopicRef.current = topic;
      isRewardedRef.current = false;
      rewarded.show();
    } else {
      rewarded.load();
    }
  };

  const { vibrationEnabled } = useSettings();

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
          <Pressable onPress={async () => {
            if (vibrationEnabled) {
              Vibration.vibrate(200)
            };
            await SoundManager.play('click');;
            router.push("/(tabs)/settings")
          }} hitSlop={10}>
            <Settings color={COLORS.white} size={24} />
          </Pressable>
        </View>

        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Hi, {name}!</Text>
            <Text style={styles.greetingSubtitle}>
              Let's continue your learning{"\n"}journey in Python.
            </Text>
          </View>
          <Pressable onPress={async () => {
            if (vibrationEnabled) {
              Vibration.vibrate(200)
            }; if (vibrationEnabled) {
              Vibration.vibrate(200)
            }; if (vibrationEnabled) {
              Vibration.vibrate(200)
            }
            await SoundManager.play('click');;
            setPickerVisible(true)
          }} style={styles.avatarPressable}>
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
                onPress={async () => {
                  if (vibrationEnabled) {
                    Vibration.vibrate(200)
                  }
                  await SoundManager.play('click');;
                  setActiveTab(tab.key)
                }}
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
                vibrationEnabled={vibrationEnabled}
                onOpenTopic={handleOpenTopic}
              />
            );
          })}
        </View>
        <BannerAdComponent_Home />
      </ScrollView>
      <AvatarPickerSheet
        visible={pickerVisible}
        selected={avatarId}
        onSelect={handleSelectAvatar}
        onClose={() => {
          if (vibrationEnabled) Vibration.vibrate(200)
          SoundManager.play('click')
          setPickerVisible(false)
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: wp(5) }, // Assuming H_PADDING was around 5% of width
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp(1),
    paddingBottom: hp(0.5),
  },
  headerTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: "600" },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(3),
    marginBottom: hp(2.8),
  },
  greetingTitle: { color: COLORS.white, fontSize: wp(6.5), fontWeight: "700" },
  greetingSubtitle: { color: COLORS.textSecondary, fontSize: wp(3.5), marginTop: hp(1), lineHeight: wp(4.5) },
  avatarPressable: {
    borderWidth: 2, // Border width fixed rakho
    borderColor: "#d8d8d891",
    backgroundColor: "#232323",
    width: wp(18),
    height: wp(18), // Square hai, isliye wp use kiya height mein bhi
    borderRadius: wp(3.5),
    alignItems: "center",
    justifyContent: "center",
  },
  segmentRow: { gap: wp(2), paddingBottom: hp(2) },
  segmentPill: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.1),
    borderRadius: wp(5),
    backgroundColor: COLORS.pill,
    borderWidth: 1, // Fixed
    borderColor: COLORS.pillBorder,
  },
  segmentPillActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  segmentText: { color: COLORS.textSecondary, fontSize: wp(3.2), fontWeight: "500" },
  segmentTextActive: { color: COLORS.bg, fontSize: wp(3.2), fontWeight: "700" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.7),
  },
  sectionHeaderTitle: { color: COLORS.white, fontSize: wp(5), fontWeight: "700" },
  // snakeWrap: { paddingBottom: hp(3) },
  rowWrap: { position: "relative" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: hp(1.5) },
  hConnector: { marginHorizontal: wp(-0.5) }, // Negative values bhi work karti hain
  verticalLoopWrap: { position: "absolute", bottom: -(CARD_GAP + hp(1.2)) }, // -10 ko hp(1.2) mein convert kiya
  card: {
    width: CARD_W, // Aap CARD_W ko bhi wp(x) se define karein component mein
    height: CARD_H, // Aap CARD_H ko bhi hp(x) se define karein component mein
    backgroundColor: COLORS.card,
    borderRadius: wp(4.5),
    borderWidth: 1, // Fixed
    borderColor: COLORS.cardBorder,
    padding: wp(2.5),
    justifyContent: "space-between",
  },
  cardLocked: { backgroundColor: COLORS.cardLocked },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { color: COLORS.textSecondary, fontSize: wp(2.7), fontWeight: "600" },
  cardIconWrap: { alignItems: "center", justifyContent: "center", flex: 1 },
  cardTitle: { color: COLORS.white, fontSize: wp(2.7), fontWeight: "600", lineHeight: wp(3.5) },
  progressTrack: {
    height: hp(0.5),
    borderRadius: wp(0.5),
    backgroundColor: COLORS.track,
    marginTop: hp(0.7),
    overflow: "hidden",
  },
  progressFill: { height: hp(0.5), backgroundColor: COLORS.fillBar, borderRadius: wp(0.5) },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    padding: wp(5),
    paddingBottom: hp(4),
  },
  sheetHandle: {
    width: wp(10),
    height: hp(0.5),
    borderRadius: wp(0.5),
    backgroundColor: COLORS.pillBorder,
    alignSelf: "center",
    marginBottom: hp(2),
  },
  sheetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sheetTitle: { color: COLORS.white, fontSize: wp(4.5), fontWeight: "700" },
  sheetSubtitle: { color: COLORS.textSecondary, fontSize: wp(3.2), marginTop: hp(0.5) },
  sheetCloseBtn: {
    width: wp(8),
    height: wp(8), // Circle hai isliye width ke hisaab se
    borderRadius: wp(4), // Half of width for perfect circle
    backgroundColor: COLORS.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: hp(3),
  },
  avatarOption: { width: "30%", alignItems: "center", marginBottom: hp(2.5) }, // width "30%" string format mein better hai
  avatarOptionRing: {
    width: wp(19),
    height: wp(19), // Circle/Square
    borderRadius: wp(9.5), // Half of width
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2, // Fixed
    borderColor: "transparent",
  },
  avatarOptionRingActive: { borderColor: COLORS.white },
  avatarOptionLabel: { color: COLORS.textSecondary, fontSize: wp(2.7), marginTop: hp(1), textAlign: "center" },
  sheetDoneBtn: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3.5),
    paddingVertical: hp(1.7),
    alignItems: "center",
    marginTop: hp(1),
  },
  sheetDoneText: { color: COLORS.bg, fontWeight: "700", fontSize: wp(3.7) },
});