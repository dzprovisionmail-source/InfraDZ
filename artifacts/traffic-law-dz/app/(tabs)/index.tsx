import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { StatCard } from "@/components/StatCard";
import { UpdateCard } from "@/components/UpdateCard";
import { ViolationCard } from "@/components/ViolationCard";
import { OnboardingModal } from "@/components/OnboardingModal";
import { VIOLATIONS, LEGAL_UPDATES, CATEGORIES, STATS } from "@/data/violations";

const LOGO = require("@/assets/images/infradz-logo.png");

const CATEGORY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  speed:     { icon: "navigation",     color: "#DC143C", bg: "#FFF0F0" },
  alcohol:   { icon: "coffee",         color: "#7C3AED", bg: "#F5F0FF" },
  safety:    { icon: "shield",         color: "#006233", bg: "#E6F2EC" },
  priority:  { icon: "git-merge",      color: "#EA580C", bg: "#FFF3ED" },
  parking:   { icon: "map-pin",        color: "#2563EB", bg: "#EFF6FF" },
  lights:    { icon: "zap",            color: "#CA8A04", bg: "#FEFCE8" },
  documents: { icon: "file-text",      color: "#0891B2", bg: "#ECFEFF" },
  behavior:  { icon: "alert-octagon",  color: "#DC2626", bg: "#FEF2F2" },
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topViolations = VIOLATIONS.filter((v) => v.severity === "critical").slice(0, 3);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: "#0D0D0D",
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
      paddingBottom: 0,
    },
    headerInner: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    logoRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    logoImg: {
      width: 40,
      height: 40,
      borderRadius: 10,
    },
    brandText: {
      alignItems: "flex-end",
    },
    brandName: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    brandInfra: {
      fontSize: 20,
      fontWeight: "900" as const,
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    brandDZ: {
      fontSize: 20,
      fontWeight: "900" as const,
      color: "#DC143C",
      letterSpacing: -0.5,
    },
    brandSub: {
      fontSize: 10,
      color: "#FFFFFF66",
      letterSpacing: 0.3,
    },
    notifBtn: {
      width: 38,
      height: 38,
      backgroundColor: "#FFFFFF15",
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },

    /* Hero card */
    heroCard: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      overflow: "hidden",
    },
    heroGradient: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "#DC143C40",
      backgroundColor: "#DC143C18",
    },
    heroRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    heroBadge: {
      backgroundColor: "#DC143C",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroBadgeText: {
      fontSize: 10,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    heroTitle: {
      fontSize: 15,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      textAlign: "right",
      flex: 1,
    },
    heroDesc: {
      fontSize: 12,
      color: "#FFFFFF99",
      textAlign: "right",
      lineHeight: 18,
    },
    heroDivider: {
      height: 1,
      backgroundColor: "#FFFFFF15",
      marginVertical: 10,
    },
    heroStats: {
      flexDirection: "row-reverse",
      justifyContent: "space-around",
    },
    heroStat: { alignItems: "center" },
    heroStatVal: { fontSize: 16, fontWeight: "900" as const, color: "#DC143C" },
    heroStatLabel: { fontSize: 9, color: "#FFFFFF66", marginTop: 1 },

    /* Wave divider */
    waveDivider: {
      height: 20,
      backgroundColor: "#0D0D0D",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    /* Sections */
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    sectionTitleRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    sectionDot: {
      width: 4,
      height: 18,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    seeAll: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
    },

    /* Stats */
    statsRow: { flexDirection: "row-reverse", gap: 10 },

    /* Categories */
    catScroll: { marginTop: 0 },
    catContent: { paddingHorizontal: 16, gap: 10, flexDirection: "row-reverse" },
    catChip: {
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      width: 88,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    catIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    catName: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "center",
    },

    /* AI Banner */
    aiBanner: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      backgroundColor: "#0D0D0D",
      overflow: "hidden",
    },
    aiIconBox: {
      width: 46,
      height: 46,
      backgroundColor: "#DC143C",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    aiBannerText: { flex: 1 },
    aiBannerTitle: {
      fontSize: 14,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      textAlign: "right",
    },
    aiBannerSub: {
      fontSize: 11,
      color: "#FFFFFF66",
      textAlign: "right",
      marginTop: 2,
    },

    /* Quiz Banner */
    quizBanner: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row-reverse" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: "#1D4ED8",
      overflow: "hidden" as const,
    },
    quizIconBox: {
      width: 46,
      height: 46,
      backgroundColor: "#FFFFFF20",
      borderRadius: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    quizBannerTitle: {
      fontSize: 14,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      textAlign: "right" as const,
    },
    quizBannerSub: {
      fontSize: 11,
      color: "#FFFFFF99",
      textAlign: "right" as const,
      marginTop: 2,
    },

    /* Calculator Banner */
    calcBanner: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    calcIconBox: {
      width: 46,
      height: 46,
      backgroundColor: "#006233",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    calcBannerTitle: {
      fontSize: 14,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    calcBannerSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 2,
    },

    /* By DZ Pro Vision footer in header */
    byTagRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      paddingVertical: 8,
      backgroundColor: "#FFFFFF08",
    },
    byTag: { fontSize: 10, color: "#FFFFFF44" },
    byTagBrand: { fontSize: 10, fontWeight: "700", color: "#DC143C" },
  });

  return (
    <View style={s.container}>
      <OnboardingModal />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Dark header ── */}
        <View style={s.header}>
          <View style={s.headerInner}>
            <View style={s.headerTop}>
              {/* Notification */}
              <TouchableOpacity
                style={s.notifBtn}
                onPress={() =>
                  Alert.alert(
                    "آخر المستجدات القانونية",
                    "📋 قانون المرور 09-26\n\nصدر في 12 مايو 2026 ويتضمن:\n\n• رفع قيمة الغرامات المرورية\n• نظام نقاط جديد (12 نقطة للرخصة)\n• عقوبات أشد للمخالفات الجسيمة\n• قواعد صارمة للمركبات الثقيلة\n• حظر استخدام الهاتف أثناء القيادة",
                    [{ text: "حسناً، شكراً" }]
                  )
                }
              >
                <Feather name="bell" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* InfraDZ Logo */}
              <View style={s.logoRow}>
                <View style={s.brandText}>
                  <View style={s.brandName}>
                    <Text style={s.brandInfra}>Infra</Text>
                    <Text style={s.brandDZ}>DZ</Text>
                  </View>
                  <Text style={s.brandSub}>Code de route Algérien 2026</Text>
                </View>
                <Image source={LOGO} style={s.logoImg} resizeMode="cover" />
              </View>
            </View>

            {/* Hero card */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.heroCard}>
              <View style={s.heroGradient}>
                <View style={s.heroRow}>
                  <View style={s.heroBadge}>
                    <Text style={s.heroBadgeText}>جديد • 2026</Text>
                  </View>
                  <Text style={s.heroTitle}>قانون المرور 09-26</Text>
                </View>
                <Text style={s.heroDesc}>
                  صدر في 12 مايو 2026 — أحدث تعديلات الغرامات والعقوبات ونظام النقاط
                </Text>
                <View style={s.heroDivider} />
                <View style={s.heroStats}>
                  <View style={s.heroStat}>
                    <Text style={s.heroStatVal}>{STATS.totalViolations}</Text>
                    <Text style={s.heroStatLabel}>نوع مخالفة</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#FFFFFF15" }} />
                  <View style={s.heroStat}>
                    <Text style={s.heroStatVal}>{STATS.totalCategories}</Text>
                    <Text style={s.heroStatLabel}>فئة</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: "#FFFFFF15" }} />
                  <View style={s.heroStat}>
                    <Text style={s.heroStatVal}>800K</Text>
                    <Text style={s.heroStatLabel}>أعلى غرامة دج</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* By DZ Pro Vision */}
          <View style={s.byTagRow}>
            <Text style={s.byTag}>by</Text>
            <Text style={s.byTagBrand}>DZ</Text>
            <Text style={s.byTag}>Pro Vision</Text>
          </View>

          {/* Bottom curve */}
          <View style={s.waveDivider} />
        </View>

        {/* ── Stats ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>إحصائيات</Text>
            </View>
          </View>
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.statsRow}>
            <StatCard icon="alert-octagon" iconColor="#DC143C"  label="مخالفة مرورية" value={String(STATS.totalViolations)} sublabel="قانون 09-26" />
            <StatCard icon="grid"          iconColor="#2563EB"  label="فئة رئيسية"    value={String(STATS.totalCategories)} sublabel="مصنفة" />
            <StatCard icon="edit-3"        iconColor="#1D4ED8"  label="سؤال اختبار"   value="94"    sublabel="رخصة القيادة" />
          </Animated.View>
        </View>

        {/* ── Categories ── */}
        <View style={[s.section, { paddingHorizontal: 0 }]}>
          <View style={[s.sectionHeader, { paddingHorizontal: 16 }]}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/violations")}>
              <Text style={s.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>الفئات</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catContent}>
            {CATEGORIES.map((cat, i) => {
              const cfg = CATEGORY_ICONS[cat.id] ?? { icon: cat.icon, color: colors.primary, bg: colors.accent };
              return (
                <Animated.View key={cat.id} entering={FadeInRight.delay(180 + i * 40).duration(350)}>
                  <TouchableOpacity
                    style={s.catChip}
                    onPress={() => router.push({ pathname: "/(tabs)/violations", params: { cat: cat.id } })}
                  >
                    <View style={[s.catIcon, { backgroundColor: cfg.bg }]}>
                      <Feather name={cfg.icon as any} size={19} color={cfg.color} />
                    </View>
                    <Text style={s.catName}>{cat.nameAr}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        {/* ── AI Banner ── */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: 20 }}>
          <TouchableOpacity style={s.aiBanner} onPress={() => router.push("/(tabs)/assistant")}>
            <Feather name="chevron-left" size={16} color="#FFFFFF44" />
            <View style={s.aiBannerText}>
              <Text style={s.aiBannerTitle}>المساعد القانوني الذكي</Text>
              <Text style={s.aiBannerSub}>اسأل عن أي مخالفة أو قانون مرور • مرجع المواد فوري</Text>
            </View>
            <View style={s.aiIconBox}>
              <Feather name="message-circle" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Quiz Banner ── */}
        <Animated.View entering={FadeInDown.delay(265).duration(400)}>
          <TouchableOpacity style={s.quizBanner} onPress={() => router.push("/(tabs)/quiz")}>
            <Feather name="chevron-left" size={16} color="#FFFFFF44" />
            <View style={s.aiBannerText}>
              <Text style={s.quizBannerTitle}>اختبار رخصة القيادة</Text>
              <Text style={s.quizBannerSub}>94 سؤال • 10 فئات • تصحيح وشرح فوري</Text>
            </View>
            <View style={s.quizIconBox}>
              <Feather name="edit-3" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Calculator Banner ── */}
        <Animated.View entering={FadeInDown.delay(280).duration(400)}>
          <TouchableOpacity style={s.calcBanner} onPress={() => router.push("/(tabs)/calculator")}>
            <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
            <View style={s.aiBannerText}>
              <Text style={s.calcBannerTitle}>حاسبة المخالفات</Text>
              <Text style={s.calcBannerSub}>أدخل سرعتك ونوع الطريق لحساب الغرامة</Text>
            </View>
            <View style={s.calcIconBox}>
              <Feather name="sliders" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Critical Violations ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
              <View style={[s.sectionDot, { backgroundColor: "#006233" }]} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: "600" }}>قانون 09-26</Text>
            </View>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>المخالفات الخطيرة</Text>
            </View>
          </View>
          {topViolations.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(300 + i * 80).duration(400)}>
              <ViolationCard violation={v} compact />
            </Animated.View>
          ))}
        </View>

        {/* ── Legal Updates ── */}
        <View style={[s.section, { paddingTop: 0 }]}>
          <View style={s.sectionHeader}>
            <Text style={s.seeAll}>الكل</Text>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>آخر التعديلات</Text>
            </View>
          </View>
          {LEGAL_UPDATES.slice(0, 3).map((u, i) => (
            <Animated.View key={u.id} entering={FadeInDown.delay(400 + i * 80).duration(400)}>
              <UpdateCard update={u} />
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
