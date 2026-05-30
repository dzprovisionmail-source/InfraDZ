import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Share,
  FlatList,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeInRight, SlideInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useViolationLog, LogEntry } from "@/hooks/useViolationLog";
import { usePointsRecovery } from "@/hooks/usePointsRecovery";
import { RecoveryWidget } from "@/components/RecoveryWidget";
import { VIOLATIONS } from "@/data/violations";

// ─── Ring gauge ──────────────────────────────────────────────────────────────
function RingGauge({
  value,
  max,
  color,
  size = 110,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value / max, 1));
  const dash = pct * circ;
  const cx = size / 2;
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${cx},${cx}`}>
        <Circle cx={cx} cy={cx} r={r} stroke="#E5E7EB" strokeWidth={10} fill="none" />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

// ─── Severity label ───────────────────────────────────────────────────────────
const SEV_COLORS: Record<string, string> = {
  low: "#16A34A",
  medium: "#EA580C",
  high: "#DC2626",
  critical: "#7F1D1D",
};

// ─── Suspense risk config ─────────────────────────────────────────────────────
const RISK_CFG = {
  safe: { color: "#16A34A", label: "آمن", icon: "check-circle" as const },
  medium: { color: "#EAB308", label: "تنبيه", icon: "alert-circle" as const },
  high: { color: "#DC2626", label: "خطر", icon: "alert-triangle" as const },
  critical: { color: "#7F1D1D", label: "رخصة مسحوبة!", icon: "x-circle" as const },
};

// ─── Export helper ────────────────────────────────────────────────────────────
function buildExportText(entries: LogEntry[], totalFines: number, totalPoints: number, remaining: number) {
  const header = `سجل المخالفات المرورية - قانون 09-26\n${"=".repeat(40)}\n`;
  const summary = `إجمالي المخالفات: ${entries.length}\nإجمالي الغرامات: ${totalFines.toLocaleString("ar-DZ")} دج\nالنقاط المخصومة: ${totalPoints}\nالنقاط المتبقية: ${remaining}/12\n${"─".repeat(40)}\n`;
  const lines = entries.map((e, i) => {
    const d = new Date(e.date).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
    return `${i + 1}. ${e.violationName}\n   التاريخ: ${d}\n   الغرامة: ${e.fine.toLocaleString("ar-DZ")} دج\n   النقاط: ${e.points}\n   ${e.article}\n   ${e.notes ? "ملاحظات: " + e.notes : ""}`;
  });
  return header + summary + lines.join("\n\n");
}

function buildExportHtml(entries: LogEntry[], totalFines: number, totalPoints: number, remaining: number) {
  const rows = entries
    .map((e) => {
      const d = new Date(e.date).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
      return `<tr>
        <td>${d}</td>
        <td>${e.violationName}</td>
        <td>${e.fine.toLocaleString("ar-DZ")} دج</td>
        <td>${e.points}</td>
        <td>${e.article}</td>
        <td>${e.notes ?? ""}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>سجل المخالفات المرورية</title>
<style>
  body { font-family: Arial, sans-serif; direction: rtl; padding: 24px; color: #111; }
  h1 { color: #DC143C; border-bottom: 2px solid #DC143C; padding-bottom: 8px; }
  .summary { display: flex; gap: 24px; margin: 16px 0; flex-wrap: wrap; }
  .stat { background: #f4f4f4; border-radius: 8px; padding: 12px 20px; text-align: center; }
  .stat .value { font-size: 24px; font-weight: 900; color: #DC143C; }
  .stat .label { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #DC143C; color: white; padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) td { background: #fafafa; }
  .footer { margin-top: 24px; color: #888; font-size: 12px; text-align: center; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>سجل المخالفات المرورية</h1>
<p>استناداً إلى قانون المرور الجزائري رقم 09-26 — تاريخ الطباعة: ${new Date().toLocaleDateString("ar-DZ")}</p>
<div class="summary">
  <div class="stat"><div class="value">${entries.length}</div><div class="label">عدد المخالفات</div></div>
  <div class="stat"><div class="value">${totalFines.toLocaleString("ar-DZ")} دج</div><div class="label">إجمالي الغرامات</div></div>
  <div class="stat"><div class="value">${totalPoints}</div><div class="label">نقاط مخصومة</div></div>
  <div class="stat"><div class="value">${remaining}/12</div><div class="label">نقاط متبقية</div></div>
</div>
<table>
  <thead><tr><th>التاريخ</th><th>المخالفة</th><th>الغرامة</th><th>النقاط</th><th>المادة</th><th>ملاحظات</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">تم إنشاء هذا التقرير بواسطة تطبيق قانون المرور الجزائري</div>
</body>
</html>`;
}

// ─── Add Violation Modal ──────────────────────────────────────────────────────
interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LogEntry, "id">) => void;
  colors: ReturnType<typeof useColors>;
}

function AddModal({ visible, onClose, onSave, colors }: AddModalProps) {
  const [step, setStep] = useState<"pick" | "details">("pick");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<(typeof VIOLATIONS)[0] | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return VIOLATIONS;
    return VIOLATIONS.filter(
      (v) => v.nameAr.includes(q) || v.descriptionAr.includes(q) || v.article.includes(q)
    );
  }, [search]);

  const reset = () => {
    setStep("pick");
    setSearch("");
    setPicked(null);
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePick = (v: (typeof VIOLATIONS)[0]) => {
    setPicked(v);
    setStep("details");
  };

  const handleSave = () => {
    if (!picked) return;
    onSave({
      date,
      violationName: picked.nameAr,
      fine: picked.fine,
      points: picked.points,
      article: picked.article,
      category: picked.category,
      severity: picked.severity,
      notes: notes.trim() || undefined,
    });
    handleClose();
  };

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "#00000066",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "88%",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 4,
    },
    sheetHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: "800" as const,
      color: colors.foreground,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    search: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.foreground,
      textAlign: "right",
      borderWidth: 1,
      borderColor: colors.border,
    },
    vItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    vName: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    vMeta: {
      flexDirection: "row-reverse",
      gap: 8,
      marginTop: 4,
    },
    vFine: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
    },
    vPoints: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    detailsBody: {
      padding: 20,
      gap: 16,
    },
    pickedCard: {
      backgroundColor: colors.primary + "12",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    pickedName: {
      fontSize: 15,
      fontWeight: "800" as const,
      color: colors.primary,
      textAlign: "right",
    },
    pickedMeta: {
      flexDirection: "row-reverse",
      gap: 12,
      marginTop: 6,
    },
    pickedFine: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600" as const,
    },
    label: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textAlign: "right",
      marginBottom: 6,
    },
    dateInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      textAlign: "right",
      borderWidth: 1,
      borderColor: colors.border,
    },
    notesInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.foreground,
      textAlign: "right",
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 72,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    saveBtnText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "800" as const,
    },
    backBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    backText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600" as const,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={s.overlay} onPress={handleClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>
                {step === "pick" ? "اختر المخالفة" : "تفاصيل المخالفة"}
              </Text>
              <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
                <Feather name="x" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {step === "pick" ? (
              <>
                <TextInput
                  style={s.search}
                  placeholder="ابحث عن مخالفة..."
                  placeholderTextColor={colors.mutedForeground}
                  value={search}
                  onChangeText={setSearch}
                  textAlign="right"
                />
                <FlatList
                  data={filtered}
                  keyExtractor={(v) => v.id}
                  style={{ maxHeight: 420 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.vItem} onPress={() => handlePick(item)}>
                      <Text style={s.vName}>{item.nameAr}</Text>
                      <View style={s.vMeta}>
                        <Text style={s.vFine}>{item.fine.toLocaleString("ar-DZ")} دج</Text>
                        <Text style={s.vPoints}>نقاط: {item.points}</Text>
                        <View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: SEV_COLORS[item.severity], alignSelf: "center" }]} />
                      </View>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              </>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={s.backBtn} onPress={() => setStep("pick")}>
                  <Text style={s.backText}>تغيير المخالفة</Text>
                  <Feather name="chevron-right" size={16} color={colors.primary} />
                </TouchableOpacity>
                <View style={s.detailsBody}>
                  {picked && (
                    <View style={s.pickedCard}>
                      <Text style={s.pickedName}>{picked.nameAr}</Text>
                      <View style={s.pickedMeta}>
                        <Text style={s.pickedFine}>{picked.fine.toLocaleString("ar-DZ")} دج</Text>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                          {picked.points} نقطة
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "right", marginTop: 4 }}>
                        {picked.article}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text style={s.label}>تاريخ المخالفة</Text>
                    <TextInput
                      style={s.dateInput}
                      value={date}
                      onChangeText={setDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                    />
                  </View>

                  <View>
                    <Text style={s.label}>ملاحظات (اختياري)</Text>
                    <TextInput
                      style={s.notesInput}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="أضف أي ملاحظات..."
                      placeholderTextColor={colors.mutedForeground}
                      multiline
                      textAlignVertical="top"
                      textAlign="right"
                    />
                  </View>

                  <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                    <Text style={s.saveBtnText}>حفظ المخالفة</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({
  entry,
  onDelete,
  colors,
}: {
  entry: LogEntry;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const d = new Date(entry.date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const sColor = SEV_COLORS[entry.severity] ?? "#6B7280";

  return (
    <Animated.View entering={FadeInDown.duration(280)}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          borderRightWidth: 4,
          borderRightColor: sColor,
        }}
      >
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, textAlign: "right", marginBottom: 4 }}
              numberOfLines={2}
            >
              {entry.violationName}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "right" }}>
              {d}
            </Text>
            {entry.notes ? (
              <Text
                style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "right", marginTop: 2, fontStyle: "italic" }}
                numberOfLines={1}
              >
                {entry.notes}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "web") {
                if (window.confirm("حذف هذه المخالفة؟")) onDelete();
              } else {
                Alert.alert("حذف المخالفة", "هل تريد حذف هذه المخالفة من السجل؟", [
                  { text: "إلغاء", style: "cancel" },
                  { text: "حذف", style: "destructive", onPress: onDelete },
                ]);
              }
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#FEE2E2",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Feather name="trash-2" size={13} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row-reverse",
            marginTop: 10,
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.primary + "10",
              borderRadius: 8,
              padding: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: colors.primary }}>
              {entry.fine.toLocaleString("ar-DZ")}
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>دج</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: sColor + "18",
              borderRadius: 8,
              padding: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: sColor }}>-{entry.points}</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>نقطة</Text>
          </View>
          <View
            style={{
              flex: 2,
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 8,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 10, color: colors.mutedForeground, textAlign: "right" }} numberOfLines={2}>
              {entry.article}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const log = useViolationLog();
  const recovery = usePointsRecovery(log.entries);
  const [addVisible, setAddVisible] = useState(false);
  const [tab, setTab] = useState<"all" | "month" | "year">("all");

  const handleExport = async () => {
    if (log.entries.length === 0) {
      if (Platform.OS === "web") {
        window.alert("لا توجد مخالفات لتصديرها.");
      } else {
        Alert.alert("لا توجد مخالفات", "أضف مخالفات أولاً ثم صدّرها.");
      }
      return;
    }

    if (Platform.OS === "web") {
      const html = buildExportHtml(log.entries, log.totalFines, log.totalPoints, log.remainingPoints);
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.print();
      }
    } else {
      const text = buildExportText(log.entries, log.totalFines, log.totalPoints, log.remainingPoints);
      try {
        await Share.share({ message: text, title: "سجل المخالفات المرورية" });
      } catch {}
    }
  };

  const handleClearAll = () => {
    if (Platform.OS === "web") {
      if (window.confirm("مسح كل المخالفات نهائياً؟")) log.clearAll();
    } else {
      Alert.alert("مسح الكل", "هل تريد حذف جميع المخالفات؟ لا يمكن التراجع.", [
        { text: "إلغاء", style: "cancel" },
        { text: "مسح الكل", style: "destructive", onPress: () => log.clearAll() },
      ]);
    }
  };

  const visibleEntries = useMemo(() => {
    if (tab === "month") return log.getThisYearEntries().filter((e) => {
      const now = new Date();
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    if (tab === "year") return log.getThisYearEntries();
    return log.entries;
  }, [tab, log.entries]);

  const risk = RISK_CFG[log.suspensionRisk as keyof typeof RISK_CFG];
  const monthStats = log.getThisMonthStats();
  const monthlyAll = log.getMonthlyStats();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      paddingHorizontal: 16,
      paddingBottom: 18,
    },
    headerRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "800" as const, color: "#FFF" },
    headerSub: { fontSize: 12, color: "#FFFFFF99", marginTop: 2 },
    headerActions: { flexDirection: "row-reverse", gap: 8 },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#FFFFFF25",
      alignItems: "center",
      justifyContent: "center",
    },
    addBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    addBtnText: { fontSize: 13, fontWeight: "800" as const, color: colors.primary },

    dashboard: {
      marginHorizontal: 16,
      marginTop: -1,
      borderRadius: 20,
      backgroundColor: colors.card,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    dashRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
    },
    dashRingLabel: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    dashRingNum: { fontSize: 22, fontWeight: "900" as const },
    dashRingSmall: { fontSize: 11 },
    dashStats: { flex: 1, gap: 8 },
    dashStatRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    dashStatLabel: { fontSize: 12, color: colors.mutedForeground },
    dashStatValue: { fontSize: 16, fontWeight: "800" as const, color: colors.foreground },
    riskBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 12,
    },
    riskText: { fontSize: 13, fontWeight: "700" as const },

    warningBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    warningText: { flex: 1, fontSize: 13, fontWeight: "600" as const, textAlign: "right", lineHeight: 20 },

    section: { paddingHorizontal: 16, marginTop: 16 },
    sectionRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionTitle: { fontSize: 15, fontWeight: "800" as const, color: colors.foreground },
    sectionAction: { fontSize: 12, color: colors.primary, fontWeight: "600" as const },

    tabRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 12,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.card,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabBtnText: { fontSize: 12, fontWeight: "600" as const, color: colors.mutedForeground },
    tabBtnTextActive: { color: "#FFF" },

    monthCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    monthLabel: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "right",
      marginBottom: 8,
    },
    monthRow: { flexDirection: "row-reverse", gap: 8 },
    monthStat: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      alignItems: "center",
    },
    monthStatVal: { fontSize: 16, fontWeight: "900" as const, color: colors.primary },
    monthStatLabel: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },

    emptyBox: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    emptyTitle: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground, marginBottom: 6 },
    emptyDesc: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
    emptyBtn: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 11,
    },
    emptyBtnText: { color: "#FFF", fontWeight: "700" as const, fontSize: 14 },
  });

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>مخالفاتي</Text>
            <Text style={s.headerSub}>{log.entries.length} مخالفة مسجلة • من 12 نقطة</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn} onPress={handleExport}>
              <Feather name="download" size={17} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={s.addBtn} onPress={() => setAddVisible(true)}>
              <Feather name="plus" size={15} color={colors.primary} />
              <Text style={s.addBtnText}>إضافة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Dashboard ── */}
        <Animated.View entering={FadeIn.duration(400)} style={[s.dashboard, { marginTop: 16 }]}>
          <View style={s.dashRow}>
            <View style={{ width: 110, height: 110, position: "relative" }}>
              <RingGauge
                value={log.remainingPoints}
                max={log.MAX_LICENSE_POINTS}
                color={risk.color}
                size={110}
              />
              <View style={s.dashRingLabel}>
                <Text style={[s.dashRingNum, { color: risk.color }]}>{log.remainingPoints}</Text>
                <Text style={[s.dashRingSmall, { color: colors.mutedForeground }]}>/ {log.MAX_LICENSE_POINTS}</Text>
              </View>
            </View>
            <View style={s.dashStats}>
              <View style={s.dashStatRow}>
                <Text style={[s.dashStatValue, { color: colors.primary }]}>
                  {log.totalFines.toLocaleString("ar-DZ")} دج
                </Text>
                <Text style={s.dashStatLabel}>إجمالي الغرامات</Text>
              </View>
              <View style={s.dashStatRow}>
                <Text style={[s.dashStatValue, { color: "#DC2626" }]}>-{log.totalPoints}</Text>
                <Text style={s.dashStatLabel}>النقاط المخصومة</Text>
              </View>
              <View style={s.dashStatRow}>
                <Text style={[s.dashStatValue]}>{log.entries.length}</Text>
                <Text style={s.dashStatLabel}>عدد المخالفات</Text>
              </View>
            </View>
          </View>

          <View style={[s.riskBadge, { backgroundColor: risk.color + "18" }]}>
            <Feather name={risk.icon} size={16} color={risk.color} />
            <Text style={[s.riskText, { color: risk.color, flex: 1 }]}>
              حالة الرخصة:
            </Text>
            <Text style={[s.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </Animated.View>

        {/* ── Warning banner ── */}
        {(log.suspensionRisk === "high" || log.suspensionRisk === "critical") && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[
              s.warningBanner,
              {
                backgroundColor:
                  log.suspensionRisk === "critical" ? "#7F1D1D" : "#FEF3C7",
              },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={20}
              color={log.suspensionRisk === "critical" ? "#FF6B6B" : "#92400E"}
            />
            <Text
              style={[
                s.warningText,
                {
                  color: log.suspensionRisk === "critical" ? "#FF6B6B" : "#92400E",
                },
              ]}
            >
              {log.suspensionRisk === "critical"
                ? "تحذير: لقد استُنفدت نقاط رخصتك بالكامل! رخصتك معرضة للسحب الفوري."
                : `تحذير: لم يتبق لك سوى ${log.remainingPoints} نقاط. تجنب أي مخالفة إضافية!`}
            </Text>
          </Animated.View>
        )}

        {/* ── Recovery widget ── */}
        {log.entries.length > 0 && (
          <RecoveryWidget
            summary={recovery}
            totalDeducted={log.totalPoints}
            maxPoints={log.MAX_LICENSE_POINTS}
          />
        )}

        {/* ── Monthly stats ── */}
        {monthlyAll.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>الإحصائيات الشهرية</Text>
            </View>
            {monthlyAll.slice(0, 3).map((m, i) => (
              <Animated.View key={m.month} entering={FadeInRight.delay(i * 60).duration(300)}>
                <View style={s.monthCard}>
                  <Text style={s.monthLabel}>{m.label}</Text>
                  <View style={s.monthRow}>
                    <View style={s.monthStat}>
                      <Text style={s.monthStatVal}>{m.count}</Text>
                      <Text style={s.monthStatLabel}>مخالفة</Text>
                    </View>
                    <View style={s.monthStat}>
                      <Text style={s.monthStatVal}>{m.totalFine.toLocaleString("ar-DZ")}</Text>
                      <Text style={s.monthStatLabel}>دج</Text>
                    </View>
                    <View style={s.monthStat}>
                      <Text style={[s.monthStatVal, { color: "#DC2626" }]}>-{m.totalPoints}</Text>
                      <Text style={s.monthStatLabel}>نقطة</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* ── Timeline ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>السجل الزمني</Text>
            {log.entries.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={[s.sectionAction, { color: "#DC2626" }]}>مسح الكل</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.tabRow}>
            {(["all", "month", "year"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && s.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>
                  {t === "all" ? "الكل" : t === "month" ? "هذا الشهر" : "هذه السنة"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {visibleEntries.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIcon}>
                <Feather name="clipboard" size={30} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>
                {tab === "all"
                  ? "ابدأ بتتبع مخالفاتك"
                  : tab === "month"
                  ? "لا مخالفات هذا الشهر"
                  : "لا مخالفات هذه السنة"}
              </Text>
              <Text style={s.emptyDesc}>
                {tab === "all"
                  ? "سجّل مخالفاتك هنا لمتابعة نقاط رخصتك (12 نقطة) وإجمالي الغرامات. عند الوصول للصفر تُسحب الرخصة."
                  : tab === "month"
                  ? "لم تُسجَّل أي مخالفة خلال الشهر الجاري"
                  : "لم تُسجَّل أي مخالفة خلال هذه السنة"}
              </Text>
              {tab === "all" && (
                <TouchableOpacity style={s.emptyBtn} onPress={() => setAddVisible(true)}>
                  <Text style={s.emptyBtnText}>+ إضافة مخالفة</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            visibleEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => log.removeEntry(entry.id)}
                colors={colors}
              />
            ))
          )}
        </View>

        <View style={{ height: insets.bottom + (Platform.OS === "web" ? 100 : 32) }} />
      </ScrollView>

      <AddModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSave={log.addEntry}
        colors={colors}
      />
    </View>
  );
}
