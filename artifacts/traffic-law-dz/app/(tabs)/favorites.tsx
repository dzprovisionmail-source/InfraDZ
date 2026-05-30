import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ViolationCard } from "@/components/ViolationCard";
import { VIOLATIONS, Violation } from "@/data/violations";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites } = useApp();

  const favoriteViolations = useMemo<Violation[]>(
    () => VIOLATIONS.filter((v) => favorites.includes(v.id)),
    [favorites]
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    countBadge: {
      backgroundColor: colors.primary + "15",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    countText: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.primary,
    },
    listContent: {
      padding: 16,
      paddingBottom: insets.bottom + 100,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 80,
      gap: 16,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptySub: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      paddingHorizontal: 40,
      writingDirection: "rtl",
    },
    goBtn: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    goBtnText: {
      color: "#FFFFFF",
      fontWeight: "700" as const,
      fontSize: 15,
    },
    summaryCard: {
      backgroundColor: colors.primary + "08",
      borderRadius: colors.radius,
      padding: 14,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      flexDirection: "row-reverse",
      justifyContent: "space-around",
      borderWidth: 1,
      borderColor: colors.primary + "20",
    },
    summaryBlock: {
      alignItems: "center",
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: "800" as const,
      color: colors.primary,
    },
    summaryLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
    },
  });

  const totalFines = useMemo(
    () => favoriteViolations.reduce((sum, v) => sum + v.fine, 0),
    [favoriteViolations]
  );
  const totalPoints = useMemo(
    () => favoriteViolations.reduce((sum, v) => sum + v.points, 0),
    [favoriteViolations]
  );

  if (favoriteViolations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>المفضلة</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="heart" size={36} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>لا توجد مخالفات محفوظة</Text>
          <Text style={styles.emptySub}>
            أضف المخالفات إلى المفضلة للوصول إليها بسرعة عند الحاجة
          </Text>
          <TouchableOpacity
            style={styles.goBtn}
            onPress={() => router.push("/(tabs)/violations")}
          >
            <Text style={styles.goBtnText}>تصفح المخالفات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favoriteViolations.length}</Text>
          </View>
          <Text style={styles.headerTitle}>المفضلة</Text>
        </View>
      </View>

      {favoriteViolations.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>{favoriteViolations.length}</Text>
            <Text style={styles.summaryLabel}>مخالفة محفوظة</Text>
          </View>
          <View style={[{ width: 1, backgroundColor: colors.border }]} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>
              {totalFines.toLocaleString("ar-DZ")}
            </Text>
            <Text style={styles.summaryLabel}>إجمالي الغرامات (دج)</Text>
          </View>
          <View style={[{ width: 1, backgroundColor: colors.border }]} />
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>
              -{totalPoints}
            </Text>
            <Text style={styles.summaryLabel}>إجمالي النقاط</Text>
          </View>
        </View>
      )}

      <FlatList
        data={favoriteViolations}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
            <ViolationCard violation={item} />
          </Animated.View>
        )}
      />
    </View>
  );
}
