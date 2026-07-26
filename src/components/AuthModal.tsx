import { AlertTriangle, CheckCircle2, Info } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { hp, wp } from "@/utils/wp_hp";

export type AuthModalType = "error" | "success" | "info";

type AuthModalProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: AuthModalType;
  buttonText?: string;
  onClose: () => void;
};

// Ek hi Modal component jo sign-in aur sign-up dono screens use karengi.
// Isse har error ke liye alag-alag UI nahi likhna padega.
export default function AuthModal({
  visible,
  title,
  message,
  type = "error",
  buttonText = "OK",
  onClose,
}: AuthModalProps) {
  const accentColor =
    type === "success" ? "#4ADE80" : type === "info" ? "#60A5FA" : "#FF4D4D";

  const Icon = type === "success" ? CheckCircle2 : type === "info" ? Info : AlertTriangle;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { borderColor: accentColor }]}>
            <Icon size={28} color={accentColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: accentColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Clerk se aane wale error object se ek clean, user-friendly message nikalta hai.
// Clerk Core 3 me error.errors[0] me { code, message, longMessage } hota hai.
export function getClerkErrorMessage(error: any): string {
  if (!error) return "Kuch galat ho gaya, dubara try karein.";

  const first = error?.errors?.[0];
  const message = first?.longMessage || first?.message || error?.message;

  return message || "Kuch galat ho gaya, dubara try karein.";
}

const styles = StyleSheet.create({
 backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: wp(7),        // 28 -> ~7%
    },
    card: {
      width: "100%",                   // String % original hi best hai
      backgroundColor: "#1A1A1A",
      borderRadius: wp(4.5),           // 18 -> ~4.5%
      borderWidth: 1,                  // Fixed (Border width responsive nahi karni)
      borderColor: "#2A2A2A",
      paddingVertical: hp(3.2),        // 26 -> ~3.2%
      paddingHorizontal: wp(5.5),      // 22 -> ~5.5%
      alignItems: "center",
    },
    iconWrap: {
      width: wp(14),                   // 56 -> ~14% (Circle)
      height: wp(14),                  // 56 -> ~14%
      borderRadius: wp(7),             // 28 -> Half of width for perfect circle
      borderWidth: 1.5,                // Fixed
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(2),             // 16 -> ~2%
      backgroundColor: "#0e0e0e",
    },
    title: {
      color: "#FFFFFF",
      fontSize: wp(4.2),               // 17 -> ~4.2%
      fontWeight: "bold",
      marginBottom: hp(1),             // 8 -> ~1%
      textAlign: "center",
    },
    message: {
      color: "#A0A0A0",
      fontSize: wp(3.2),               // 13 -> ~3.2%
      textAlign: "center",
      lineHeight: wp(5),               // 20 -> ~5%
      marginBottom: hp(2.7),           // 22 -> ~2.7%
    },
    button: {
      width: "100%",                   // String % original hi best hai
      paddingVertical: hp(1.7),        // 14 -> ~1.7%
      borderRadius: wp(3.5),           // 14 -> ~3.5%
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.85,
    },
    buttonText: {
      color: "#000000",
      fontWeight: "bold",
      fontSize: wp(3.5),               // 14 -> ~3.5%
    },
});