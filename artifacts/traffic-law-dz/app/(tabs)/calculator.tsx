import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface RoadType {
  id: string;
  nameAr: string;
  limit: number;
  icon: string;
  descAr: string;
}

const ROAD_TYPES: RoadType[] = [
  { id: "urban", nameAr: "داخل التجمع", limit: 50, icon: "home", descAr: "المناطق العمرانية" },
  { id: "suburban", nameAr: "خارج التجمع", limit: 80, icon: "map", descAr: "الطرق الخارجية" },
  { id: "national", nameAr: "طريق وطني", limit: 100, icon: "navigation", descAr: "الطرق الوطنية والجهوية" },
  { id: "express", nameAr: "طريق سريع", limit: 120, icon: "zap", descAr: "الطريق السريع" },
  { id: "highway", nameAr: "أوتوستراد", limit: 130, icon: "trending-up", descAr: "الطريق السيار" },
];

interface CalcResult {
  level: "safe" | "degree2" | "degree3" | "degree4" | "criminal";
  labelAr: string;
  fine: number;
  fineMax?: number;
  points: number;
  article: string;
  degree: string;
  licenseRisk: string;
  overPercent: number;
  overKmh: number;
  bgColor: string;
  textColor: string;
  iconName: string;
  advice: string;
}

function calculate(speed: number, road: RoadType): CalcResult | null {
  if (isNaN(speed) || speed <= 0) return null;

  const limit = road.limit;
  const overKmh = speed - limit;
  const overPercent = ((speed - limit) / limit) * 100;

  if (speed <= limit) {
    return {
      level: "safe",
      labelAr: "لا توجد مخالفة",
      fine: 0,
      points: 0,
      article: "أنت ملتزم بالقانون",
      degree: "—",
      licenseRisk: "لا يوجد",
      overPercent: 0,
      overKmh: 0,
      bgColor: "#16A34A",
      textColor: "#FFFFFF",
      iconName: "check-circle",
      advice: "أحسنت! سرعتك مناسبة للطريق. استمر في القيادة الآمنة.",
    };
  }

  if (overPercent <= 10) {
    return {
      level: "degree2",
      labelAr: "مخالفة من الدرجة الثانية",
      fine: 4000,
      points: 2,
      article: "المادة 121 (ب) من قانون المرور 09-26",
      degree: "الدرجة الثانية",
      licenseRisk: "لا سحب للرخصة",
      overPercent: Math.round(overPercent * 10) / 10,
      overKmh: Math.round(overKmh),
      bgColor: "#EAB308",
      textColor: "#000000",
      iconName: "alert-circle",
      advice: "خفف سرعتك فوراً. التجاوز الطفيف قد يصل إلى درجات أعلى مع استمرار السرعة.",
    };
  }

  if (overPercent <= 20) {
    return {
      level: "degree3",
      labelAr: "مخالفة من الدرجة الثالثة",
      fine: 6000,
      points: 3,
      article: "المادة 121 (ج) من قانون المرور 09-26",
      degree: "الدرجة الثالثة - الفئة الأولى",
      licenseRisk: "خطر منخفض",
      overPercent: Math.round(overPercent * 10) / 10,
      overKmh: Math.round(overKmh),
      bgColor: "#EA580C",
      textColor: "#FFFFFF",
      iconName: "alert-triangle",
      advice: "تجاوز خطير. خفف السرعة فوراً. تجنب المزيد من التجاوز لتفادي سحب الرخصة.",
    };
  }

  if (overPercent <= 30) {
    return {
      level: "degree4",
      labelAr: "مخالفة من الدرجة الرابعة",
      fine: 10000,
      points: 4,
      article: "المادة 121 (د) من قانون المرور 09-26",
      degree: "الدرجة الرابعة",
      licenseRisk: "خطر سحب الرخصة",
      overPercent: Math.round(overPercent * 10) / 10,
      overKmh: Math.round(overKmh),
      bgColor: "#DC2626",
      textColor: "#FFFFFF",
      iconName: "x-circle",
      advice: "مخالفة خطيرة جداً! سرعتك تعرّضك لسحب الرخصة مؤقتاً. توقف وخفف السرعة.",
    };
  }

  return {
    level: "criminal",
    labelAr: "جريمة مرورية جسيمة",
    fine: 25000,
    fineMax: 80000,
    points: 6,
    article: "المادة 139 من قانون المرور 09-26",
    degree: "جنحة مرورية",
    licenseRisk: "سحب الرخصة فوري",
    overPercent: Math.round(overPercent * 10) / 10,
    overKmh: Math.round(overKmh),
    bgColor: "#1A0000",
    textColor: "#FF4444",
    iconName: "alert-octagon",
    advice: "خطر مميت! هذا التجاوز يُعرّضك للملاحقة الجنائية وغرامة تصل إلى 80,000 دج وسحب الرخصة فوراً.",
  };
}

const SpeedGauge = ({ speed, limit }: { speed: number; limit: number }) => {
  const safeMax = limit * 2;
  const pct = Math.min((speed / safeMax) * 100, 100);
  const limitPct = (limit / safeMax) * 100;

  const getBarColor = () => {
    if (speed <= limit) return "#16A34A";
    const over = ((speed - limit) / limit) * 100;
    if (over <= 10) return "#EAB308";
    if (over <= 20) return "#EA580C";
    if (over <= 30) return "#DC2626";
    return "#991B1B";
  };

  return (
    <View style={{ marginTop: 8, marginBottom: 4 }}>
      <View style={{ height: 12, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden", position: "relative" }}>
        <Animated.View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: getBarColor(),
            borderRadius: 6,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: `${limitPct}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: "#111827",
          }}
        />
      </View>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: "#6B7280" }}>0</Text>
        <Text style={{ fontSize: 10, color: "#374151", fontWeight: "700" }}>
          الحد: {limit} كم/س
        </Text>
        <Text style={{ fontSize: 10, color: "#6B7280" }}>{safeMax}+</Text>
      </View>
    </View>
  );
};

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [speedText, setSpeedText] = useState("");
  const [selectedRoad, setSelectedRoad] = useState<RoadType>(ROAD_TYPES[0]);

  const speed = parseFloat(speedText);
  const result = useMemo(() => calculate(speed, selectedRoad), [speed, selectedRoad]);

  const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

  const handleNumpad = (val: string) => {
    if (val === "⌫") {
      setSpeedText((prev) => prev.slice(0, -1));
    } else if (val === "✓") {
      // no-op, result already shown
    } else {
      if (speedText.length >= 3) return;
      setSpeedText((prev) => prev + val);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: "800" as const, color: "#FFF", textAlign: "right" },
    headerSub: { fontSize: 13, color: "#FFFFFF99", textAlign: "right", marginTop: 2 },
    scroll: { flex: 1 },
    section: { paddingHorizontal: 16, paddingTop: 16 },
    sectionTitle: { fontSize: 14, fontWeight: "700" as const, color: colors.mutedForeground, textAlign: "right", marginBottom: 10 },

    speedBox: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    speedDisplay: {
      flexDirection: "row-reverse",
      alignItems: "baseline",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
    },
    speedNumber: {
      fontSize: 72,
      fontWeight: "900" as const,
      color: colors.foreground,
      textAlign: "center",
      letterSpacing: -2,
    },
    speedUnit: {
      fontSize: 18,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },
    speedPlaceholder: {
      fontSize: 72,
      fontWeight: "900" as const,
      color: colors.border,
      textAlign: "center",
    },

    numpad: {
      marginTop: 8,
    },
    numpadRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 8,
    },
    numBtn: {
      flex: 1,
      height: 52,
      backgroundColor: colors.background,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    numBtnText: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    numBtnDelete: {
      backgroundColor: "#FEE2E2",
      borderColor: "#FECACA",
    },
    numBtnDeleteText: {
      color: "#DC2626",
    },
    numBtnConfirm: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    numBtnConfirmText: {
      color: "#FFFFFF",
    },

    roadGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    roadBtn: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "flex-end",
    },
    roadBtnSelected: {
      borderColor: colors.primary,
      backgroundColor: "#DC143C10",
    },
    roadBtnTop: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    roadBtnName: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    roadBtnNameSel: { color: colors.primary },
    roadBtnLimit: {
      fontSize: 11,
      color: colors.mutedForeground,
    },
    roadBtnLimitBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 99,
      alignSelf: "flex-end",
      marginTop: 4,
    },
    roadBtnLimitBadgeText: {
      fontSize: 12,
      fontWeight: "800" as const,
      color: "#FFF",
    },

    resultCard: {
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    resultTop: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    resultIconBox: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#FFFFFF20",
      alignItems: "center",
      justifyContent: "center",
    },
    resultLabel: {
      flex: 1,
      fontSize: 17,
      fontWeight: "800" as const,
      textAlign: "right",
    },
    resultDivider: {
      height: 1,
      backgroundColor: "#FFFFFF30",
      marginBottom: 14,
    },
    resultRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    resultRowLabel: {
      fontSize: 13,
      opacity: 0.75,
    },
    resultRowValue: {
      fontSize: 14,
      fontWeight: "700" as const,
    },
    resultFineBox: {
      borderRadius: 12,
      backgroundColor: "#FFFFFF25",
      padding: 14,
      alignItems: "center",
      marginTop: 4,
      marginBottom: 12,
    },
    resultFineAmount: {
      fontSize: 36,
      fontWeight: "900" as const,
    },
    resultFineLabel: {
      fontSize: 12,
      opacity: 0.8,
      marginTop: 2,
    },
    resultAdvice: {
      borderRadius: 10,
      backgroundColor: "#FFFFFF20",
      padding: 12,
      flexDirection: "row-reverse",
      gap: 8,
      alignItems: "flex-start",
    },
    resultAdviceText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      textAlign: "right",
    },

    safeCard: {
      backgroundColor: "#F0FDF4",
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#BBF7D0",
    },
    safeIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#16A34A20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    safeTitle: {
      fontSize: 20,
      fontWeight: "800" as const,
      color: "#15803D",
      marginBottom: 4,
    },
    safeDesc: {
      fontSize: 14,
      color: "#16A34A",
      textAlign: "center",
      lineHeight: 20,
    },

    emptyCard: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 6,
      textAlign: "center",
    },
    emptyDesc: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
    articleBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#FFFFFF20",
      borderRadius: 8,
      padding: 8,
      marginTop: 10,
    },
    articleText: {
      fontSize: 11,
      opacity: 0.85,
      textAlign: "right",
      flex: 1,
    },
    speedOverRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 12,
    },
    speedOverChip: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: "#FFFFFF20",
      padding: 10,
      alignItems: "center",
    },
    speedOverValue: {
      fontSize: 22,
      fontWeight: "900" as const,
    },
    speedOverLabel: {
      fontSize: 10,
      opacity: 0.75,
      marginTop: 2,
    },
  });

  const renderResult = () => {
    if (!result) {
      return (
        <Animated.View entering={FadeIn.duration(300)} style={s.emptyCard}>
          <View style={s.emptyIcon}>
            <Feather name="activity" size={30} color={colors.primary} />
          </View>
          <Text style={s.emptyTitle}>أدخل سرعتك</Text>
          <Text style={s.emptyDesc}>
            اكتب سرعتك الحالية باستخدام لوحة الأرقام وحدد نوع الطريق لمعرفة وضعك القانوني
          </Text>
        </Animated.View>
      );
    }

    if (result.level === "safe") {
      return (
        <Animated.View entering={FadeInDown.duration(350)} style={s.safeCard}>
          <View style={s.safeIcon}>
            <Feather name="check-circle" size={34} color="#16A34A" />
          </View>
          <Text style={s.safeTitle}>أنت في أمان</Text>
          <Text style={s.safeDesc}>
            سرعتك ({Math.round(speed)} كم/س) أقل من الحد المسموح به ({selectedRoad.limit} كم/س).{"\n"}
            {result.advice}
          </Text>
          <SpeedGauge speed={speed} limit={selectedRoad.limit} />
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.duration(350)} style={[s.resultCard, { backgroundColor: result.bgColor }]}>
        <View style={s.resultTop}>
          <View style={s.resultIconBox}>
            <Feather name={result.iconName as any} size={26} color={result.textColor} />
          </View>
          <Text style={[s.resultLabel, { color: result.textColor }]}>{result.labelAr}</Text>
        </View>

        <View style={s.speedOverRow}>
          <View style={s.speedOverChip}>
            <Text style={[s.speedOverValue, { color: result.textColor }]}>+{result.overKmh}</Text>
            <Text style={[s.speedOverLabel, { color: result.textColor }]}>كم/س فوق الحد</Text>
          </View>
          <View style={s.speedOverChip}>
            <Text style={[s.speedOverValue, { color: result.textColor }]}>+{result.overPercent}%</Text>
            <Text style={[s.speedOverLabel, { color: result.textColor }]}>نسبة التجاوز</Text>
          </View>
          <View style={s.speedOverChip}>
            <Text style={[s.speedOverValue, { color: result.textColor }]}>{result.points}</Text>
            <Text style={[s.speedOverLabel, { color: result.textColor }]}>نقاط مخصومة</Text>
          </View>
        </View>

        <View style={s.resultDivider} />

        <View style={s.resultFineBox}>
          {result.fineMax ? (
            <>
              <Text style={[s.resultFineAmount, { color: result.textColor }]}>
                {result.fine.toLocaleString("ar-DZ")} - {result.fineMax.toLocaleString("ar-DZ")}
              </Text>
              <Text style={[s.resultFineLabel, { color: result.textColor }]}>دينار جزائري (الغرامة)</Text>
            </>
          ) : (
            <>
              <Text style={[s.resultFineAmount, { color: result.textColor }]}>
                {result.fine.toLocaleString("ar-DZ")}
              </Text>
              <Text style={[s.resultFineLabel, { color: result.textColor }]}>دينار جزائري (غرامة جزافية)</Text>
            </>
          )}
        </View>

        <View style={s.resultRow}>
          <Text style={[s.resultRowValue, { color: result.textColor }]}>{result.degree}</Text>
          <Text style={[s.resultRowLabel, { color: result.textColor }]}>تصنيف المخالفة</Text>
        </View>

        <View style={s.resultRow}>
          <Text style={[s.resultRowValue, { color: result.textColor }]}>{result.licenseRisk}</Text>
          <Text style={[s.resultRowLabel, { color: result.textColor }]}>خطر الرخصة</Text>
        </View>

        <View style={s.resultRow}>
          <Text style={[s.resultRowValue, { color: result.textColor }]}>{selectedRoad.limit} كم/س</Text>
          <Text style={[s.resultRowLabel, { color: result.textColor }]}>الحد المسموح به</Text>
        </View>

        <View style={s.articleBadge}>
          <Feather name="book-open" size={12} color={result.textColor} style={{ opacity: 0.8 }} />
          <Text style={[s.articleText, { color: result.textColor }]}>{result.article}</Text>
        </View>

        <View style={[s.resultAdvice, { marginTop: 12 }]}>
          <Feather name="info" size={14} color={result.textColor} style={{ marginTop: 2 }} />
          <Text style={[s.resultAdviceText, { color: result.textColor }]}>{result.advice}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>حاسبة المخالفات</Text>
        <Text style={s.headerSub}>احسب غرامتك حسب قانون المرور 09-26</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.section}>
          <Text style={s.sectionTitle}>نوع الطريق</Text>
          <View style={s.roadGrid}>
            {ROAD_TYPES.map((road) => {
              const isSelected = selectedRoad.id === road.id;
              return (
                <TouchableOpacity
                  key={road.id}
                  style={[s.roadBtn, isSelected && s.roadBtnSelected]}
                  onPress={() => setSelectedRoad(road)}
                  activeOpacity={0.7}
                >
                  <View style={s.roadBtnTop}>
                    <Feather name={road.icon as any} size={14} color={isSelected ? colors.primary : colors.mutedForeground} />
                    <Text style={[s.roadBtnName, isSelected && s.roadBtnNameSel]}>{road.nameAr}</Text>
                  </View>
                  <Text style={s.roadBtnLimit}>{road.descAr}</Text>
                  <View style={s.roadBtnLimitBadge}>
                    <Text style={s.roadBtnLimitBadgeText}>{road.limit} كم/س</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>سرعتك الحالية</Text>
          <View style={s.speedBox}>
            <View style={s.speedDisplay}>
              {speedText ? (
                <Text style={s.speedNumber}>{speedText}</Text>
              ) : (
                <Text style={s.speedPlaceholder}>---</Text>
              )}
              <Text style={s.speedUnit}>كم/س</Text>
            </View>

            {!!speedText && !isNaN(speed) && (
              <SpeedGauge speed={speed} limit={selectedRoad.limit} />
            )}

            <View style={s.numpad}>
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                ["⌫", "0", "✓"],
              ].map((row, ri) => (
                <View key={ri} style={s.numpadRow}>
                  {row.map((key) => {
                    const isDel = key === "⌫";
                    const isOk = key === "✓";
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          s.numBtn,
                          isDel && s.numBtnDelete,
                          isOk && s.numBtnConfirm,
                        ]}
                        onPress={() => handleNumpad(key)}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            s.numBtnText,
                            isDel && s.numBtnDeleteText,
                            isOk && s.numBtnConfirmText,
                          ]}
                        >
                          {key}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>النتيجة القانونية</Text>
        </View>

        {renderResult()}

        <View style={{ height: insets.bottom + (Platform.OS === "web" ? 100 : 24) }} />
      </ScrollView>
    </View>
  );
}
