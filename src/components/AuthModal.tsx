import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react-native";

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
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#0e0e0e",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#A0A0A0",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
});