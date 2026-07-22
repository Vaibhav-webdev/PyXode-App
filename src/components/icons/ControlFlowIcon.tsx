import Svg, { Path, Rect } from "react-native-svg";

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

const ControlFlowIcon = ({ size = 28, color = COLORS.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M16 3 L24 11 L16 19 L8 11 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M16 19 V22 M16 22 H8 M16 22 H24 M8 22 V25 M24 22 V25" stroke={color} strokeWidth={1.8} />
    <Rect x={4.5} y={25} width={7} height={4} rx={1} stroke={color} strokeWidth={1.6} />
    <Rect x={20.5} y={25} width={7} height={4} rx={1} stroke={color} strokeWidth={1.6} />
  </Svg>
);

export default ControlFlowIcon;