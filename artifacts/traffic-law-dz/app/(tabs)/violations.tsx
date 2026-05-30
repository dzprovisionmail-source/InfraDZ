import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { SearchBar } from "@/components/SearchBar";
import { ViolationCard } from "@/components/ViolationCard";
import { VIOLATIONS, CATEGORIES, Violation, ViolationCategory } from "@/data/violations";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ViolationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cat: catParam } = useLocalSearchParams<{ cat?: string }>();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<ViolationCategory | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [sortBy, setSortBy] = useState<"severity" | "fine" | "points">("severity");

  useEffect(() => {
    if (catParam) setSelectedCat(catParam as ViolationCategory);
  }, [catParam]);

  const filtered = useMemo(() => {
    let list = VIOLATIONS;
    if (selectedCat) list = list.filter((v) => v.category === selectedCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.nameAr.includes(q) ||
          v.descriptionAr.includes(q) ||
          v.article.toLowerCase().includes(q)
      );
    }
    if (sortBy === "severity") list = [...list].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    if (sortBy === "fine") list = [...list].sort((a, b) => b.fine - a.fine);
    if (sortBy === "points") list = [...list].sort((a, b) => b.points - a.points);
    return list;
  }, [search, selectedCat, sortBy]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.headerBg,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 12,
    },
    catsScroll: { marginTop: 10 },
    catsContent: {
      flexDirection: "row-reverse",
      gap: 8,
      paddingBottom: 4,
    },
    catChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    catChipText: {
      fontSize: 13,
      fontWeight: "600" as const,
    },
    sortRow: {
      flexDirection: "row-reverse",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    sortLabel: {
      fontSize: 13,
      color: colors.mutedForeground,
      alignSelf: "center",
    },
    sortBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    sortBtnText: {
      fontSize: 12,
      fontWeight: "600" as const,
    },
    listContent: {
      padding: 16,
      paddingBottom: insets.bottom + 100,
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 60,
      gap: 14,
      paddingHorizontal: 24,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 17,
      color: colors.foreground,
      fontWeight: "700" as const,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      writingDirection: "rtl" as const,
      lineHeight: 20,
    },
    countRow: {
      flexDirection: "row-reverse" as const,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 6,
    },
    countText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "right",
      fontWeight: "600" as const,
    },
    countBadge: {
      backgroundColor: "#DC143C15",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    countBadgeText: {
      fontSize: 12,
      color: "#DC143C",
      fontWeight: "700" as const,
    },
    modal: {
      flex: 1,
      backgroundColor: "#00000080",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    modalHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: colors.foreground,
      flex: 1,
      textAlign: "right",
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    modalBody: {
      padding: 20,
    },
    detailRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailBlock: {
      alignItems: "flex-end",
    },
    detailLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 18,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 10,
      marginTop: 4,
    },
    descText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 22,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipRow: {
      flexDirection: "row-reverse",
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 8,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 20,
    },
    actionBox: {
      backgroundColor: colors.primary + "10",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      marginBottom: 16,
    },
    actionLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      marginBottom: 4,
    },
    actionValue: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.primary,
      textAlign: "right",
    },
    articleBox: {
      backgroundColor: colors.info + "10",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.info + "30",
      marginBottom: 20,
    },
    articleText: {
      fontSize: 13,
      color: colors.info,
      textAlign: "right",
      fontStyle: "italic",
    },
  });

  const renderViolation = useCallback(({ item, index }: { item: Violation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <ViolationCard
        violation={item}
        onPress={() => setSelectedViolation(item)}
      />
    </Animated.View>
  ), []);

  const SORT_OPTS = [
    { key: "severity" as const, label: "الخطورة" },
    { key: "fine" as const, label: "الغرامة" },
    { key: "points" as const, label: "النقاط" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المخالفات المرورية</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catsScroll}
          contentContainerStyle={styles.catsContent}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              {
                backgroundColor: !selectedCat ? colors.primary : "transparent",
                borderColor: !selectedCat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCat(null)}
          >
            <Text style={[styles.catChipText, { color: !selectedCat ? "#FFFFFF" : colors.mutedForeground }]}>
              الكل
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                {
                  backgroundColor: selectedCat === cat.id ? cat.color : "transparent",
                  borderColor: selectedCat === cat.id ? cat.color : colors.border,
                },
              ]}
              onPress={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            >
              <Text style={[styles.catChipText, { color: selectedCat === cat.id ? "#FFFFFF" : colors.mutedForeground }]}>
                {cat.nameAr}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 12-point system context */}
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#DC143C0E",
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderBottomWidth: 1,
          borderBottomColor: "#DC143C18",
        }}
      >
        <Feather name="alert-circle" size={13} color="#DC143C" />
        <Text
          style={{
            flex: 1,
            fontSize: 12,
            color: "#DC143C",
            textAlign: "right",
            writingDirection: "rtl",
            fontWeight: "600",
          }}
        >
          رخصة القيادة تبدأ بـ 12 نقطة — كل مخالفة تُخصم نقاطاً — عند الصفر تُسحب الرخصة فوراً
        </Text>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>ترتيب حسب:</Text>
        {SORT_OPTS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.sortBtn,
              {
                backgroundColor: sortBy === opt.key ? colors.primary + "15" : "transparent",
                borderColor: sortBy === opt.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === opt.key ? colors.primary : colors.mutedForeground }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.countRow}>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{filtered.length}</Text>
        </View>
        <Text style={styles.countText}>المخالفات المعروضة</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        renderItem={renderViolation}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Feather name="search" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={styles.emptyText}>لا توجد نتائج</Text>
            <Text style={styles.emptySubText}>
              جرب كلمة بحث مختلفة أو غيّر الفئة المحددة
            </Text>
          </View>
        }
      />

      {selectedViolation && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedViolation(null)}
        >
          <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setSelectedViolation(null)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedViolation(null)} style={styles.closeBtn}>
                  <Feather name="x" size={16} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.modalTitle} numberOfLines={2}>{selectedViolation.nameAr}</Text>
              </View>
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
                <View style={styles.detailRow}>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>النقاط المخصومة</Text>
                    <Text style={[styles.detailValue, { color: colors.warning }]}>
                      -{selectedViolation.points} نقاط
                    </Text>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>الغرامة المالية</Text>
                    <Text style={[styles.detailValue, { color: colors.primary }]}>
                      {selectedViolation.fine.toLocaleString("ar-DZ")} دج
                    </Text>
                  </View>
                </View>

                <View style={styles.actionBox}>
                  <Text style={styles.actionLabel}>الإجراء القانوني</Text>
                  <Text style={styles.actionValue}>{selectedViolation.licenseAction}</Text>
                </View>

                <View style={styles.articleBox}>
                  <Text style={styles.articleText}>{selectedViolation.article}</Text>
                </View>

                <Text style={styles.sectionLabel}>وصف المخالفة</Text>
                <Text style={styles.descText}>{selectedViolation.descriptionAr}</Text>

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>نصائح الوقاية</Text>
                {selectedViolation.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Feather name="check-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
