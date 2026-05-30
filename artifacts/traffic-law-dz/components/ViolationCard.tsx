import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Violation, CATEGORIES } from "@/data/violations";

interface ViolationCardProps {
  violation: Violation;
  onPress?: () => void;
  compact?: boolean;
}

const SEVERITY_CONFIG: Record<
  string,
  { color: string; bg: string; label: string; icon: keyof typeof Feather.glyphMap }
> = {
  low:      { color: "#16A34A", bg: "#DCFCE7", label: "خفيفة",          icon: "info" },
  medium:   { color: "#D97706", bg: "#FEF3C7", label: "متوسطة",         icon: "alert-circle" },
  high:     { color: "#DC2626", bg: "#FEE2E2", label: "خطيرة",           icon: "alert-triangle" },
  critical: { color: "#DC143C", bg: "#FFE4E6", label: "بالغة الخطورة",  icon: "alert-octagon" },
};

const CATEGORY_ICONS: Record<string, string> = {
  speed:     "navigation",
  alcohol:   "coffee",
  safety:    "shield",
  priority:  "git-merge",
  parking:   "map-pin",
  lights:    "zap",
  documents: "file-text",
  behavior:  "alert-octagon",
};

export function ViolationCard({ violation, onPress, compact = false }: ViolationCardProps) {
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useApp();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const category = CATEGORIES.find((c) => c.id === violation.category);
  const sev = SEVERITY_CONFIG[violation.severity] ?? SEVERITY_CONFIG.low;
  const favorite = isFavorite(violation.id);
  const catIcon = (CATEGORY_ICONS[violation.category] ?? "circle") as keyof typeof Feather.glyphMap;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.975, { damping: 15 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15 });
  }, [scale]);

  const handleFavorite = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    heartScale.value = withSpring(1.5, { damping: 8 }, () => {
      heartScale.value = withSpring(1, { damping: 8 });
    });
    toggleFavorite(violation.id);
  }, [toggleFavorite, violation.id, heartScale]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRightWidth: 4,
      borderRightColor: sev.color,
      overflow: "hidden",
    },
    inner: {
      padding: compact ? 12 : 16,
    },

    /* ── Header ── */
    header: {
      flexDirection: "row-reverse",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: compact ? 6 : 8,
    },
    titleArea: {
      flex: 1,
      alignItems: "flex-end",
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: compact ? 20 : 24,
    },
    categoryChip: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      marginTop: 5,
      alignSelf: "flex-end",
      backgroundColor: (category?.color ?? colors.primary) + "15",
    },
    categoryText: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: category?.color ?? colors.primary,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    severityBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: sev.bg,
    },
    severityText: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: sev.color,
    },
    heartBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: favorite ? "#DC143C12" : colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },

    /* ── Description ── */
    description: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 20,
      marginBottom: 10,
    },

    /* ── Stats row ── */
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: compact ? 8 : 12,
      marginTop: compact ? 6 : 0,
    },
    statsRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statBlock: {
      alignItems: "flex-end",
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      marginBottom: 3,
    },
    statValueRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
    },
    fineValue: {
      fontSize: compact ? 17 : 22,
      fontWeight: "900" as const,
      color: "#DC143C",
    },
    fineCurrency: {
      fontSize: compact ? 11 : 13,
      fontWeight: "700" as const,
      color: "#DC143C",
    },
    pointsValue: {
      fontSize: compact ? 17 : 22,
      fontWeight: "900" as const,
      color: "#D97706",
    },
    pointsUnit: {
      fontSize: compact ? 11 : 13,
      fontWeight: "700" as const,
      color: "#D97706",
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    statBlockCenter: {
      alignItems: "center",
      flex: 1,
    },

    /* ── Article ── */
    articleRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    articleText: {
      fontSize: 11,
      color: "#2563EB",
      textAlign: "right",
      flex: 1,
    },
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.card}>
          <View style={styles.inner}>

            {/* ── Header: title + actions ── */}
            <View style={styles.header}>
              {/* Left side: severity badge + heart */}
              <View style={styles.actions}>
                <Animated.View style={heartStyle}>
                  <TouchableOpacity style={styles.heartBtn} onPress={handleFavorite} hitSlop={8}>
                    <Feather
                      name={favorite ? "heart" : "heart"}
                      size={18}
                      color={favorite ? "#DC143C" : colors.mutedForeground}
                      style={{ opacity: favorite ? 1 : 0.45 }}
                    />
                  </TouchableOpacity>
                </Animated.View>
                {!compact && (
                  <View style={styles.severityBadge}>
                    <Feather name={sev.icon} size={11} color={sev.color} />
                    <Text style={styles.severityText}>{sev.label}</Text>
                  </View>
                )}
              </View>

              {/* Right side: title + category */}
              <View style={styles.titleArea}>
                <Text style={styles.title}>{violation.nameAr}</Text>
                {category && (
                  <View style={styles.categoryChip}>
                    <Feather name={catIcon} size={10} color={category.color} />
                    <Text style={styles.categoryText}>{category.nameAr}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Description ── */}
            {!compact && (
              <Text style={styles.description} numberOfLines={2}>
                {violation.descriptionAr}
              </Text>
            )}

            {/* ── Fine / Points ── */}
            <View style={styles.divider} />
            <View style={styles.statsRow}>
              {/* Points (right in RTL = first visually) */}
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>النقاط المخصومة</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.pointsUnit}>نقطة</Text>
                  <Text style={styles.pointsValue}>-{violation.points}</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              {/* Fine (left in RTL = second visually) */}
              <View style={[styles.statBlock, { alignItems: "flex-start" }]}>
                <Text style={[styles.statLabel, { textAlign: "left" }]}>الغرامة المالية</Text>
                <View style={[styles.statValueRow, { flexDirection: "row" }]}>
                  <Text style={styles.fineCurrency}>دج</Text>
                  <Text style={styles.fineValue}>
                    {" "}{violation.fine.toLocaleString("ar-DZ")}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Article reference ── */}
            {!compact && (
              <View style={styles.articleRow}>
                <Feather name="book-open" size={12} color="#2563EB" />
                <Text style={styles.articleText}>{violation.article}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
