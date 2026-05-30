import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LegalUpdate } from "@/data/violations";

const TYPE_CONFIG = {
  law: { icon: "book" as const, label: "قانون", color: "#DC143C" },
  decree: { icon: "file-text" as const, label: "مرسوم", color: "#7C3AED" },
  circular: { icon: "info" as const, label: "منشور", color: "#2563EB" },
};

interface UpdateCardProps {
  update: LegalUpdate;
}

export function UpdateCard({ update }: UpdateCardProps) {
  const colors = useColors();
  const config = TYPE_CONFIG[update.type];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
      borderRightWidth: 4,
      borderRightColor: config.color,
    },
    header: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    badge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      backgroundColor: config.color + "15",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      color: config.color,
      fontWeight: "700" as const,
    },
    date: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
    title: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      marginBottom: 6,
    },
    summary: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 19,
    },
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(update.date)}</Text>
        <View style={styles.badge}>
          <Feather name={config.icon} size={11} color={config.color} />
          <Text style={styles.badgeText}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.title}>{update.titleAr}</Text>
      <Text style={styles.summary} numberOfLines={2}>{update.summaryAr}</Text>
    </View>
  );
}
