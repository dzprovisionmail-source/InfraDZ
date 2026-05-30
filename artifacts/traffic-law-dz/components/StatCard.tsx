import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  sublabel?: string;
}

export function StatCard({ icon, iconColor, label, value, sublabel }: StatCardProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 3,
    },
    accent: {
      height: 3,
      backgroundColor: iconColor,
    },
    body: {
      padding: 14,
      alignItems: "flex-end",
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: iconColor + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    value: {
      fontSize: 24,
      fontWeight: "900" as const,
      color: iconColor,
      textAlign: "right",
      lineHeight: 28,
    },
    label: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 3,
      fontWeight: "600" as const,
    },
    sublabel: {
      fontSize: 10,
      color: iconColor,
      textAlign: "right",
      marginTop: 2,
      fontWeight: "700" as const,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={19} color={iconColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}
