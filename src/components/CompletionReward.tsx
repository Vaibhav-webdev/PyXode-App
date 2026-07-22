import { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Trophy, Star, RotateCcw } from "lucide-react-native";

const { width: SW, height: SH } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════
//  STRICTLY BLACK & WHITE PALETTE
// ═══════════════════════════════════════════════════════════
const C = {
  bg: "#000000",
  card: "#0F0F0F",
  border: "#1E1E1E",
  white: "#FFFFFF",
  offWhite: "#E0E0E0",
  gray: "#888888",
  darkGray: "#333333",
  muted: "#666666",
  track: "#1A1A1A",
  success: "#FFFFFF",
  fail: "#555555",
  glowLight: "rgba(255,255,255,0.15)",
  glowDim: "rgba(255,255,255,0.05)",
};

// ═══════════════════════════════════════════════════════════
//  BOKEH ORB — Soft pulsing grayscale ambient light
// ═══════════════════════════════════════════════════════════
const BokehOrb = ({
  color,
  size,
  x,
  y,
  delay,
}: {
  color: string;
  size: number;
  x: number;
  y: number;
  delay: number;
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = 3000 + Math.random() * 2000;
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.02, 0.06], // Very subtle white light
        }),
        transform: [
          {
            scale: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1.3],
            }),
          },
        ],
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
//  BURST PARTICLE — Shoots outward in grayscale
// ═══════════════════════════════════════════════════════════
const BurstParticle = ({
  angle,
  color,
  distance,
  delay,
}: {
  angle: number;
  color: string;
  distance: number;
  delay: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        opacity: anim.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [1, 0.8, 0],
        }),
        transform: [
          {
            translateX: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, dx],
            }),
          },
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, dy],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.1],
            }),
          },
        ],
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
//  MAIN — RESULT SCREEN
// ═══════════════════════════════════════════════════════════
const ResultScreen = ({
  scorePercent,
  xpReward,
  onRetry,
  onGoHome,
}: {
  scorePercent: number;
  xpReward: number;
  onRetry: () => void;
  onGoHome: () => void;
}) => {
  const passed = scorePercent >= 60;
  const perfect = scorePercent >= 90;

  // ── Animation refs ──────────────────────────────────
  const trophyScale = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const titleScale = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(30)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const stat1Y = useRef(new Animated.Value(20)).current;
  const stat1Op = useRef(new Animated.Value(0)).current;
  const stat2Y = useRef(new Animated.Value(20)).current;
  const stat2Op = useRef(new Animated.Value(0)).current;
  const btn1Scale = useRef(new Animated.Value(1)).current;
  const btn2Scale = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // ── Display state for counting numbers ──────────────
  const [displayScore, setDisplayScore] = useState(0);
  const [displayXp, setDisplayXp] = useState(0);

  // ── Burst particles (Black & White) ─────────────────
  const bursts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        key: i,
        angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
        color: i % 2 === 0 ? C.white : C.gray, // Alternate white and gray
        distance: 55 + Math.random() * 50,
        delay: 200,
      })),
    []
  );

  // ── Bokeh data ──────────────────────────────────────
  const bokehData = useMemo(
    () => [
      { color: C.white, size: 150, x: SW * 0.1, y: SH * 0.1, delay: 0 },
      { color: C.offWhite, size: 110, x: SW * 0.88, y: SH * 0.07, delay: 500 },
      { color: C.white, size: 130, x: SW * 0.12, y: SH * 0.82, delay: 1000 },
      { color: C.gray, size: 95, x: SW * 0.82, y: SH * 0.78, delay: 1500 },
      { color: C.offWhite, size: 140, x: SW * 0.5, y: SH * 0.38, delay: 700 },
      { color: C.white, size: 85, x: SW * 0.92, y: SH * 0.48, delay: 1200 },
    ],
    []
  );

  // ── Score / XP counter listener ─────────────────────
  useEffect(() => {
    const id1 = scoreAnim.addListener(({ value }) =>
      setDisplayScore(Math.round(value))
    );
    const id2 = xpAnim.addListener(({ value }) =>
      setDisplayXp(Math.round(value))
    );
    return () => {
      scoreAnim.removeListener(id1);
      xpAnim.removeListener(id2);
    };
  }, []);

  // ── Entrance animation sequence ─────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 2.8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse — continuous
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.25,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Expanding ring bursts
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(ring1, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(ring2, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Stars pop in
    Animated.sequence([
      Animated.delay(500),
      Animated.stagger(
        150,
        starAnims.map((s) =>
          Animated.spring(s, {
            toValue: 1,
            friction: 3,
            tension: 55,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    // Title bounce
    Animated.sequence([
      Animated.delay(700),
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Score count up
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(scoreAnim, {
        toValue: scorePercent,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Progress bar fill
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(progressWidth, {
        toValue: scorePercent,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // XP count up
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(xpAnim, {
        toValue: xpReward,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Content slide up
    Animated.sequence([
      Animated.delay(850),
      Animated.parallel([
        Animated.spring(contentY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(contentOp, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Stat cards staggered
    Animated.sequence([
      Animated.delay(1100),
      Animated.parallel([
        Animated.spring(stat1Y, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(stat1Op, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    Animated.sequence([
      Animated.delay(1250),
      Animated.parallel([
        Animated.spring(stat2Y, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(stat2Op, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ── Button press handlers ───────────────────────────
  const pressIn = (ref: Animated.Value) =>
    Animated.spring(ref, {
      toValue: 0.94,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();

  const pressOut = (ref: Animated.Value) =>
    Animated.spring(ref, {
      toValue: 1,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();

  // ── Star fill logic ─────────────────────────────────
  const filledStars =
    scorePercent >= 90 ? 3 : scorePercent >= 60 ? 2 : scorePercent >= 30 ? 1 : 0;

  return (
    <View style={s.wrap}>
      {/* ── Ambient Bokeh (Grayscale) ── */}
      {bokehData.map((b, i) => (
        <BokehOrb key={i} {...b} />
      ))}

      {/* ── Trophy Section ── */}
      <View style={s.trophySection}>
        {/* Pulsing glow */}
        <Animated.View
          style={[
            s.glow,
            {
              backgroundColor: passed ? C.glowLight : C.glowDim,
              opacity: glowPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.9],
              }),
              transform: [
                {
                  scale: glowPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.25],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Ring bursts */}
        {[ring1, ring2].map((r, i) => (
          <Animated.View
            key={i}
            style={[
              s.ringBurst,
              {
                borderColor: passed ? C.white : C.fail,
                opacity: r.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0],
                }),
                transform: [
                  {
                    scale: r.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 3],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Burst particles (pass only) */}
        {passed &&
          bursts.map((b) => <BurstParticle key={b.key} {...b} />)}

        {/* Trophy icon */}
        <Animated.View
          style={{
            transform: [{ scale: trophyScale }],
          }}
        >
          <View
            style={[
              s.trophyCircle,
              {
                borderColor: passed
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.05)",
                shadowColor: C.white,
              },
            ]}
          >
            <Trophy color={passed ? C.white : C.fail} size={44} />
          </View>
        </Animated.View>
      </View>

      {/* ── Stars ── */}
      <View style={s.starsRow}>
        {starAnims.map((anim, i) => {
          const isFilled = i < filledStars;
          const isCenter = i === 1;
          return (
            <Animated.View
              key={i}
              style={{
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, isCenter ? 1.2 : 1],
                    }),
                  },
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-45deg", "0deg"],
                    }),
                  },
                ],
              }}
            >
              <View
                style={[
                  s.starContainer,
                  isFilled &&
                  passed && {
                    shadowColor: C.white,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                  },
                ]}
              >
                <Star
                  color={isFilled ? C.white : C.darkGray}
                  fill={isFilled ? C.white : "transparent"}
                  size={isCenter ? 34 : 27}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Title ── */}
      <Animated.View
        style={{
          transform: [{ scale: titleScale }],
          alignItems: "center",
        }}
      >
        <Text style={[s.title, { color: passed ? C.white : C.gray }]}>
          {perfect ? "Perfect Score!" : passed ? "Topic Completed!" : "Nice Try!"}
        </Text>
      </Animated.View>

      {/* ── Content ── */}
      <Animated.View
        style={[
          s.content,
          {
            transform: [{ translateY: contentY }],
            opacity: contentOp,
          },
        ]}
      >
        <Text style={s.subtitle}>
          {perfect
            ? "Absolutely flawless! You've mastered this topic."
            : passed
              ? "You've unlocked the next topic. Keep the streak going!"
              : "Review the theory and give it another shot. You've got this!"}
        </Text>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <Animated.View
            style={[
              s.statCard,
              {
                transform: [{ translateY: stat1Y }],
                opacity: stat1Op,
              },
            ]}
          >
            <Text style={[s.statValue, { color: passed ? C.white : C.gray }]}>
              {displayScore}%
            </Text>
            <Text style={s.statLabel}>Score</Text>
            <View
              style={[
                s.progressBarBg,
                {
                  backgroundColor: passed
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.02)",
                },
              ]}
            >
              <Animated.View
                style={[
                  s.progressFill,
                  {
                    width: progressWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: passed ? C.white : C.fail,
                  },
                ]}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              s.statCard,
              {
                transform: [{ translateY: stat2Y }],
                opacity: stat2Op,
              },
            ]}
          >
            <Text style={[s.statValue, { color: C.white }]}>+{displayXp}</Text>
            <View style={s.xpRow}>
              <Star color={C.white} fill={C.white} size={12} />
              <Text style={s.xpLabel}>Experience Points</Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Buttons ── */}
        <Animated.View
          style={{ width: "100%", transform: [{ scale: btn1Scale }] }}
        >
          <Pressable
            style={[s.primaryBtn, { backgroundColor: C.white }]}
            onPress={onGoHome}
            onPressIn={() => pressIn(btn1Scale)}
            onPressOut={() => pressOut(btn1Scale)}
          >
            <Text style={[s.primaryBtnText, { color: C.bg }]}>Continue</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={{ width: "100%", transform: [{ scale: btn2Scale }] }}
        >
          <Pressable
            style={s.retryBtn}
            onPress={onRetry}
            onPressIn={() => pressIn(btn2Scale)}
            onPressOut={() => pressOut(btn2Scale)}
          >
            <RotateCcw color={C.muted} size={15} />
            <Text style={s.retryBtnText}>Retry Topic</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  // ── Trophy ──
  trophySection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  ringBurst: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },

  // ── Stars ──
  starsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
    alignItems: "center",
  },
  starContainer: {
    padding: 2,
  },

  // ── Content ──
  content: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 12,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  statLabel: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  progressBarBg: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  xpLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Buttons ──
  primaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontWeight: "700",
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ResultScreen;