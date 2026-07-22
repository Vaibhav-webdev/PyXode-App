import ControlFlowIcon from "@/components/icons/ControlFlowIcon";
import PythonIcon from "@/components/icons/PythonIcon";
import {
  AlertTriangle,
  BadgeAlert,
  BookOpen,
  Box,
  Boxes,
  BrainCircuit,
  TrendingUp,
  GitFork,
  Group,
  Filter,
  Gauge,
  Braces,
  Calculator,
  CodeXml,
  Flame,
  Briefcase,
  Rocket,
  Network,
  KeyRound,
  Server,
  Code,
  Code2,
  Database,
  EyeOff,
  FileBoxIcon,
  FileCode,
  FileJson,
  FileText,
  FolderTree,
  Gift,
  GitBranch,
  GitCompare,
  GitMerge, // 'Infinity' is a reserved word, so aliased it
  Grid3x3,
  Hammer,
  Infinity as InfinityIcon,
  Keyboard,
  Layers,
  Library,
  List,
  ListTree,
  Lock,
  MoveRight,
  Package,
  Repeat,
  Settings,
  CircleDot,
  Shapes,
  Shield,
  SlidersHorizontal,
  Sparkles,
  SquareFunction,
  Terminal,
  Trash2,
  Type,
  Wand2,
  Wrench,
  Monitor,
  Globe,
  Sheet,
  Mail,
  Bot
} from "lucide-react-native";
import { IconKey } from "./types";

const COLOR = "#FFFFFF";
const SIZE = 26;

// Data files only store an `iconKey` string (JSON/TS-serializable).
// This map is the single place that turns that key into real JSX.
export const getTopicIcon = (key: IconKey) => {
  switch (key) {
    // Custom Icons
    case "python":
      return <PythonIcon />;
    case "controlFlow":
      return <ControlFlowIcon />;

    // Existing Icons
    case "terminal":
      return <Terminal color={COLOR} size={SIZE} />;
    case "code2":
      return <Code2 color={COLOR} size={SIZE} />;
    case "list":
      return <List color={COLOR} size={SIZE} />;
    case "box":
      return <Box color={COLOR} size={SIZE} />;
    case "braces":
      return <Braces color={COLOR} size={SIZE} />;
    case "alertTriangle":
    case "alert-triangle": // Added for Topic 24
      return <AlertTriangle color={COLOR} size={SIZE} />;
    case "sparkles":
      return <Sparkles color={COLOR} size={SIZE} />;
        case "code-xml":
      return <CodeXml color={COLOR} size={SIZE} />;
    case "flame":
      return <Flame color={COLOR} size={SIZE} />;
    case "briefcase":
      return <Briefcase color={COLOR} size={SIZE} />;
    case "rocket":
      return <Rocket color={COLOR} size={SIZE} />;
    case "network":
      return <Network color={COLOR} size={SIZE} />;
    case "key-round":
      return <KeyRound color={COLOR} size={SIZE} />;
    case "server":
      return <Server color={COLOR} size={SIZE} />;
    case "layers":
      return <Layers color={COLOR} size={SIZE} />;

    // New Icons Added for Python Topics
    case "wrench":
      return <Wrench color={COLOR} size={SIZE} />;
    case "code":
      return <Code color={COLOR} size={SIZE} />;
    case "repeat":
      return <Repeat color={COLOR} size={SIZE} />;
    case "calculator":
      return <Calculator color={COLOR} size={SIZE} />;
    case "keyboard":
      return <Keyboard color={COLOR} size={SIZE} />;
    case "git-branch":
      return <GitBranch color={COLOR} size={SIZE} />;
    case "infinity":
      return <InfinityIcon color={COLOR} size={SIZE} />;
        case "monitor":
      return <Monitor color={COLOR} size={SIZE} />;
      case "globe":
      return <Globe color={COLOR} size={SIZE} />;
    case "sheet":
      return <Sheet color={COLOR} size={SIZE} />;
    case "mail":
      return <Mail color={COLOR} size={SIZE} />;
    case "bot":
      return <Bot color={COLOR} size={SIZE} />;
      case "grid-3x3":
      return <Grid3x3 color={COLOR} size={SIZE} />;
    case "type":
      return <Type color={COLOR} size={SIZE} />;
    case "lock":
      return <Lock color={COLOR} size={SIZE} />;
    case "circle-dot":
      return <CircleDot color={COLOR} size={SIZE} />;
    case "book-open":
      return <BookOpen color={COLOR} size={SIZE} />;
    case "square-function":
      return <SquareFunction color={COLOR} size={SIZE} />;
    case "sliders-horizontal":
      return <SlidersHorizontal color={COLOR} size={SIZE} />;
    case "git-merge":
      return <GitMerge color={COLOR} size={SIZE} />;
    case "file-text":
      return <FileText color={COLOR} size={SIZE} />;
    case "file-json":
      return <FileJson color={COLOR} size={SIZE} />;
    case "file-binary":
      return <FileBoxIcon color={COLOR} size={SIZE} />;
    case "badge-alert":
      return <BadgeAlert color={COLOR} size={SIZE} />;
    case "package":
      return <Package color={COLOR} size={SIZE} />;
    case "library":
      return <Library color={COLOR} size={SIZE} />;
    case "file-code":
      return <FileCode color={COLOR} size={SIZE} />;
    case "boxes":
      return <Boxes color={COLOR} size={SIZE} />;
    case "hammer":
      return <Hammer color={COLOR} size={SIZE} />;
    case "shapes":
      return <Shapes color={COLOR} size={SIZE} />;
    case "shield":
      return <Shield color={COLOR} size={SIZE} />;
    case "eye-off":
      return <EyeOff color={COLOR} size={SIZE} />;
    case "wand-2":
      return <Wand2 color={COLOR} size={SIZE} />;
    case "settings":
      return <Settings color={COLOR} size={SIZE} />;
    case "gift":
      return <Gift color={COLOR} size={SIZE} />;
    case "folder-tree":
      return <FolderTree color={COLOR} size={SIZE} />;
    case "list-tree":
      return <ListTree color={COLOR} size={SIZE} />;
    case "git-compare":
      return <GitCompare color={COLOR} size={SIZE} />;
    case "move-right":
      return <MoveRight color={COLOR} size={SIZE} />;
    case "database":
      return <Database color={COLOR} size={SIZE} />;
    case "brain-circuit":
      return <BrainCircuit color={COLOR} size={SIZE} />;
    case "trending-up":
      return <TrendingUp color={COLOR} size={SIZE} />;
    case "git-fork":
      return <GitFork color={COLOR} size={SIZE} />;
    case "group":
      return <Group color={COLOR} size={SIZE} />;
    case "filter":
      return <Filter color={COLOR} size={SIZE} />;
    case "gauge":
      return <Gauge color={COLOR} size={SIZE} />;
      case "trash-2":
      return <Trash2 color={COLOR} size={SIZE} />;
      
    default:
      return <Code2 color={COLOR} size={SIZE} />;
  }
};