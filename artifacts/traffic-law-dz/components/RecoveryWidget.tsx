import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, withDelay } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import {
  RecoverySummary,
  RecoveryItem,
  formatRecoveryDate,
  formatDaysRemaining,
  RECOVERY_YEARS,
} from "@/hooks/usePointsRecovery";

// ─── Animated progress bar ─────────────────────────────────────────────────────
function ProgressBar({
  progress,
  color,
  height = 8,
  delay = 0,
}: {
  progress: number;
  color: string;
  height?: number;
  delay?: number;
}) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(progress, { duration: 900 }));
  }, [progress]);
  const aStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` as unknown as number }));
  const colors = useColors();
  return (
    <View
      style={{
        height,
        backgroundColor: colors.border,
        borderRadius: height / 2,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <Animated.View
        style={[{ height, borderRadius: height / 2, backgroundColor: color }, aStyle]}
      />
    </View>
  );
}

// ─── Countdown ring ────────────────────────────────────────────────────────────
function MiniRing({
  progress,
  color,
  size = 56,
  label,
  sub,
}: {
  progress: number;
  color: string;
  size?: number;
  label: string;
  sub: string;
}) {
  const colors = useColors();
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(progress, 1) * circ;
  const cx = size / 2;
  const Svg = require("react-native-svg").default;
  const { Circle, G } = require("react-native-svg");
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: size, height: size, position: "relative" }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${cx},${cx}`}>
            <Circle cx={cx} cy={cx} r={r} stroke={colors.border} strokeWidth={6} fill="none" />
            <Circle
              cx={cx}
              cy={cx}
              r={r}
              stroke={color}
              strokeWidth={6}
              fill="none"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 11, fontWeight: "900", color }}>{label}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 9, color: colors.mutedForeground, textAlign: "center" }}>{sub}</Text>
    </View>
  );
}

// ─── Notification helper ───────────────────────────────────────────────────────
async function scheduleNotification(item: RecoveryItem) {
  const dateStr = formatRecoveryDate(item.recoveryDate);
  const msg = `ستُسترد ${item.entry.points} نقاط من مخالفة "${item.entry.violationName}" بتاريخ ${dateStr}`;

  if (Platform.OS === "web") {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        const msUntil = item.recoveryDate.getTime() - Date.now() - 30 * 86_400_000;
        if (msUntil > 0 && msUntil < 2_147_483_647) {
          setTimeout(() => {
            new Notification("استرداد نقاط رخصة القيادة", { body: msg, icon: "/icon.png" });
          }, msUntil);
        }
        new Notification("تم تسجيل التذكير", {
          body: `سيتم تذكيرك قبل 30 يوماً من ${dateStr}`,
        });
        return true;
      }
    }
    alert(`التذكير: ${msg}\nتاريخ الاسترداد: ${dateStr}`);
    return false;
  } else {
    Alert.alert(
      "تذكير مضبوط ✓",
      `ستُسترد ${item.entry.points} نقاط بتاريخ:\n${dateStr}\n\nيمكنك مراجعة السجل قبل هذا التاريخ.`,
      [{ text: "حسناً", style: "default" }]
    );
    return true;
  }
}

// ─── Single recovery card ──────────────────────────────────────────────────────
function RecoveryCard({
  item,
  index,
  colors,
}: {
  item: RecoveryItem;
  index: number;
  colors: ReturnType<typeof useColors>;
}) {
  const [reminded, setReminded] = useState(false);

  const progressColor =
    item.progress < 0.33
      ? "#DC2626"
      : item.progress < 0.66
      ? "#EA580C"
      : item.progress < 0.9
      ? "#EAB308"
      : "#16A34A";

  const handleRemind = async () => {
    const ok = await scheduleNotification(item);
    if (ok) setReminded(true);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(320)}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: colors.foreground, textAlign: "right", marginBottom: 3 }}
              numberOfLines={2}
            >
              {item.entry.violationName}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "right" }}>
              تاريخ المخالفة:{" "}
              {item.startDate.toLocaleDateString("ar-DZ", { year: "numeric", month: "short", day: "numeric" })}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: progressColor + "18",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              marginRight: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "900", color: progressColor }}>
              +{item.entry.points}
            </Text>
            <Text style={{ fontSize: 9, color: progressColor }}>نقطة</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 10, color: colors.mutedForeground, width: 34, textAlign: "center" }}>
            {Math.round(item.progress * 100)}%
          </Text>
          <ProgressBar progress={item.progress} color={progressColor} delay={index * 80} />
          <Text style={{ fontSize: 10, color: colors.mutedForeground, width: 34, textAlign: "center" }}>
            {item.daysElapsed}ي
          </Text>
        </View>

        {/* Recovery date row */}
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
              {formatRecoveryDate(item.recoveryDate)}
            </Text>
          </View>

          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: progressColor + "15",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: progressColor }}>
                {formatDaysRemaining(item.daysRemaining)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleRemind}
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 4,
                backgroundColor: reminded ? "#DCFCE7" : colors.primary + "12",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Feather
                name={reminded ? "check" : "bell"}
                size={11}
                color={reminded ? "#16A34A" : colors.primary}
              />
              <Text style={{ fontSize: 11, fontWeight: "600", color: reminded ? "#16A34A" : colors.primary }}>
                {reminded ? "مُذكَّر" : "ذكّرني"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main widget ───────────────────────────────────────────────────────────────
interface Props {
  summary: RecoverySummary;
  totalDeducted: number;
  maxPoints: number;
}

export function RecoveryWidget({ summary, totalDeducted, maxPoints }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const visiblePending = expanded ? summary.pending : summary.pending.slice(0, 2);

  if (summary.items.length === 0) return null;

  const nextItem = summary.nextRecovery;

  const s = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 16,
    },
    sectionRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 15, fontWeight: "800" as const, color: colors.foreground },
    articleBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary + "12",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    articleText: { fontSize: 10, color: colors.primary, fontWeight: "600" as const },

    summaryRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryVal: { fontSize: 20, fontWeight: "900" as const, marginBottom: 2 },
    summaryLabel: { fontSize: 10, color: colors.mutedForeground, textAlign: "center" as const },

    nextCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      borderTopWidth: 3,
      borderTopColor: colors.primary,
    },
    nextHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    nextBadge: {
      backgroundColor: colors.primary + "15",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    nextBadgeText: { fontSize: 11, fontWeight: "700" as const, color: colors.primary },
    nextTitle: { fontSize: 13, fontWeight: "700" as const, color: colors.foreground, flex: 1, textAlign: "right" as const },
    nextCountdown: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    countdownVal: { fontSize: 28, fontWeight: "900" as const },
    countdownLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    nextDateRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    noticeCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row-reverse",
      gap: 10,
      alignItems: "flex-start",
    },
    noticeIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#FEF3C7",
      alignItems: "center",
      justifyContent: "center",
    },
    noticeText: {
      flex: 1,
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right" as const,
      lineHeight: 19,
    },

    showMore: {
      alignItems: "center",
      paddingVertical: 10,
    },
    showMoreText: { fontSize: 13, color: colors.primary, fontWeight: "600" as const },
  });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>استرداد النقاط</Text>
        <View style={s.articleBadge}>
          <Feather name="book-open" size={10} color={colors.primary} />
          <Text style={s.articleText}>المواد 86-92 ق.م.ج</Text>
        </View>
      </View>

      {/* Summary stats */}
      <Animated.View entering={FadeInDown.duration(350)}>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: "#16A34A" }]}>
              +{summary.pointsAlreadyRecovered}
            </Text>
            <Text style={s.summaryLabel}>نقاط مُستردة</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: "#EAB308" }]}>
              +{summary.pointsRecoverableIn6Months}
            </Text>
            <Text style={s.summaryLabel}>قريباً (6 أشهر)</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: "#6B7280" }]}>
              +{summary.pointsPendingRecovery}
            </Text>
            <Text style={s.summaryLabel}>إجمالي قيد الانتظار</Text>
          </View>
        </View>
      </Animated.View>

      {/* Next recovery countdown */}
      {nextItem && (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <View style={s.nextCard}>
            <View style={s.nextHeader}>
              <View style={s.nextBadge}>
                <Text style={s.nextBadgeText}>الاسترداد التالي</Text>
              </View>
              <Text style={s.nextTitle} numberOfLines={1}>{nextItem.entry.violationName}</Text>
            </View>

            <View style={s.nextCountdown}>
              <View>
                <Text style={[s.countdownVal, { color: colors.primary }]}>
                  {nextItem.daysRemaining.toLocaleString("ar-DZ")}
                </Text>
                <Text style={s.countdownLabel}>يوماً متبقياً</Text>
              </View>

              <View style={{ flexDirection: "row-reverse", gap: 12 }}>
                <MiniRing
                  progress={nextItem.progress}
                  color={colors.primary}
                  size={56}
                  label={`${Math.round(nextItem.progress * 100)}%`}
                  sub="مكتمل"
                />
                <View style={{ alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "#DCFCE7",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#16A34A" }}>
                      +{nextItem.entry.points}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9, color: colors.mutedForeground }}>نقاط ستُسترد</Text>
                </View>
              </View>
            </View>

            <ProgressBar progress={nextItem.progress} color={colors.primary} height={10} />

            <View style={s.nextDateRow}>
              <Feather name="calendar" size={13} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                تاريخ الاسترداد: {formatRecoveryDate(nextItem.recoveryDate)}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Legal notice */}
      <Animated.View entering={FadeInDown.delay(120).duration(350)}>
        <View style={s.noticeCard}>
          <View style={s.noticeIcon}>
            <Feather name="info" size={16} color="#92400E" />
          </View>
          <Text style={s.noticeText}>
            وفقاً للمادة 86 من قانون المرور الجزائري 09-26، تُسترد نقاط رخصة القيادة تلقائياً بعد مرور{" "}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>3 سنوات</Text> دون ارتكاب أي مخالفة تُوجب الخصم. الاسترداد تدريجي ويتوقف على السجل النظيف.
          </Text>
        </View>
      </Animated.View>

      {/* Pending list */}
      {summary.pending.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.foreground,
              textAlign: "right",
              marginBottom: 10,
            }}
          >
            جدول الاسترداد ({summary.pending.length} مخالفة)
          </Text>

          {visiblePending.map((item, i) => (
            <RecoveryCard key={item.entry.id} item={item} index={i} colors={colors} />
          ))}

          {summary.pending.length > 2 && (
            <TouchableOpacity style={s.showMore} onPress={() => setExpanded(!expanded)}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
                <Feather
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={colors.primary}
                />
                <Text style={s.showMoreText}>
                  {expanded
                    ? "عرض أقل"
                    : `عرض ${summary.pending.length - 2} مخالفات أخرى`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Recovered section */}
      {summary.recovered.length > 0 && (
        <Animated.View entering={FadeInDown.delay(160).duration(350)}>
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row-reverse",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Feather name="check-circle" size={20} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803D", textAlign: "right" }}>
                تم استرداد {summary.pointsAlreadyRecovered} نقطة
              </Text>
              <Text style={{ fontSize: 11, color: "#166534", textAlign: "right", marginTop: 2 }}>
                من {summary.recovered.length} مخالفة انقضت مدة الـ3 سنوات
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
