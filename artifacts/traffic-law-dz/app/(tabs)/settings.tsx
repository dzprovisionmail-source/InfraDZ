import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Image,
  Share,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AboutModal } from "@/components/AboutModal";

const LOGO = require("@/assets/images/infradz-logo.png");

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

function SettingRow({ icon, iconColor, label, subtitle, rightElement, onPress, isLast }: SettingRowProps) {
  const colors = useColors();
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      padding: 14,
      gap: 12,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.border,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: iconColor + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      flex: 1,
      alignItems: "flex-end",
    },
    label: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    subtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 2,
    },
    chevron: {
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !rightElement}>
      {onPress && <Feather name="chevron-left" size={16} color={colors.mutedForeground} style={styles.chevron} />}
      {rightElement}
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.iconBox}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 12,
        fontWeight: "700" as const,
        color: colors.mutedForeground,
        textAlign: "right",
        paddingHorizontal: 16,
        paddingBottom: 8,
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useApp();
  const [aboutVisible, setAboutVisible] = useState(false);

  const showAbout = () => setAboutVisible(true);

  const showDisclaimer = () => {
    Alert.alert(
      "تنبيه قانوني",
      "المعلومات الواردة في هذا التطبيق ذات طابع إرشادي فقط، ولا تُعدّ استشارة قانونية رسمية. للحصول على استشارة قانونية، يُرجى التواصل مع محامٍ مختص.",
      [{ text: "حسناً، فهمت" }]
    );
  };

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
    headerTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    content: {
      paddingTop: 20,
      paddingBottom: insets.bottom + 100,
    },
    appCard: {
      marginHorizontal: 16,
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      alignItems: "flex-end",
    },
    appCardRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    appCardIcon: {
      width: 52,
      height: 52,
      backgroundColor: "#FFFFFF20",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    appCardTitle: {
      fontSize: 18,
      fontWeight: "800" as const,
      color: "#FFFFFF",
      textAlign: "right",
    },
    appCardSub: {
      fontSize: 13,
      color: "#FFFFFF99",
      textAlign: "right",
    },
    versionBadge: {
      backgroundColor: "#FFFFFF20",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignSelf: "flex-end",
      marginTop: 6,
    },
    versionText: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "600" as const,
    },
  });

  return (
    <View style={styles.container}>
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.appCard}>
            <View style={styles.appCardRow}>
              <Image source={LOGO} style={{ width: 56, height: 56, borderRadius: 14 }} resizeMode="cover" />
              <View style={{ alignItems: "flex-end" }}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={styles.appCardTitle}>Infra</Text>
                  <Text style={[styles.appCardTitle, { color: "#DC143C" }]}>DZ</Text>
                </View>
                <Text style={styles.appCardSub}>Code de route Algérien 2026</Text>
                <Text style={[styles.appCardSub, { fontSize: 10, marginTop: 2 }]}>by DZ Pro Vision</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 8 }}>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v1.0.0 — قانون 09-26</Text>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: "#006233" + "30" }]}>
                <Text style={[styles.versionText, { color: "#30D158" }]}>🇩🇿 جزائري 100%</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Section title="المظهر">
            <SettingRow
              icon={isDarkMode ? "moon" : "sun"}
              iconColor={isDarkMode ? "#7C3AED" : "#F59E0B"}
              label="الوضع الليلي"
              subtitle={isDarkMode ? "مفعّل" : "معطّل"}
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Section title="التطبيق">
            <SettingRow
              icon="book-open"
              iconColor={colors.primary}
              label="قانون المرور 09-26"
              subtitle="الجريدة الرسمية — مايو 2026"
              onPress={showAbout}
            />
            <SettingRow
              icon="refresh-cw"
              iconColor={colors.info}
              label="آخر تحديث للبيانات"
              subtitle="17 مايو 2026"
            />
            <SettingRow
              icon="globe"
              iconColor={colors.success}
              label="اللغة"
              subtitle="العربية فقط حالياً"
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Section title="معلومات قانونية">
            <SettingRow
              icon="alert-circle"
              iconColor={colors.warning}
              label="تنبيه قانوني"
              subtitle="اقرأ قبل الاستخدام"
              onPress={showDisclaimer}
            />
            <SettingRow
              icon="file-text"
              iconColor={colors.primary}
              label="مصدر المعلومات"
              subtitle="الجريدة الرسمية الجزائرية"
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Section title="نظام النقاط">
            <SettingRow
              icon="award"
              iconColor={colors.warning}
              label="مجموع نقاط الرخصة"
              subtitle="12 نقطة عند البداية"
            />
            <SettingRow
              icon="trending-down"
              iconColor={colors.destructive}
              label="عند وصول النقاط للصفر"
              subtitle="يُسحب الترخيص فوراً"
            />
            <SettingRow
              icon="trending-up"
              iconColor={colors.success}
              label="استرداد النقاط"
              subtitle="بعد دورات السلامة المرورية"
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Section title="إحصائيات الاستخدام">
            <SettingRow
              icon="bar-chart-2"
              iconColor={colors.info}
              label="المخالفات في قاعدة البيانات"
              subtitle="80 مخالفة مصنفة — قانون 09-26"
            />
            <SettingRow
              icon="grid"
              iconColor={colors.success}
              label="الفئات"
              subtitle="8 فئات رئيسية"
            />
            <SettingRow
              icon="edit-3"
              iconColor="#1D4ED8"
              label="اختبار رخصة القيادة"
              subtitle="94 سؤال • 10 فئات • تصحيح فوري"
            />
            <SettingRow
              icon="message-circle"
              iconColor="#7C3AED"
              label="المساعد القانوني"
              subtitle="بدون إنترنت • مرجع 20+ قانون"
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).duration(400)}>
          <Section title="الخصوصية والأمان">
            <SettingRow
              icon="shield"
              iconColor="#006233"
              label="الخصوصية"
              subtitle="لا نجمع أي بيانات شخصية"
              onPress={() => Alert.alert("الخصوصية", "تطبيق InfraDZ لا يجمع أي بيانات شخصية. جميع البيانات محفوظة محلياً على جهازك فقط.", [{ text: "حسناً" }])}
            />
            <SettingRow
              icon="lock"
              iconColor="#DC143C"
              label="الأمان"
              subtitle="تخزين محلي آمن • بدون إنترنت"
              isLast
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(410).duration(400)}>
          <Section title="تطوير التطبيق">
            <SettingRow
              icon="share-2"
              iconColor="#2563EB"
              label="مشاركة التطبيق"
              subtitle="شارك InfraDZ مع أصدقائك"
              onPress={async () => {
                try {
                  await Share.share({ message: "حمّل تطبيق InfraDZ — قانون المرور الجزائري 2026 by DZ Pro Vision" });
                } catch {}
              }}
            />
            <SettingRow
              icon="star"
              iconColor="#F59E0B"
              label="تقييم التطبيق"
              subtitle="ساعدنا بتقييمك على المتجر"
            />
            <SettingRow
              icon="info"
              iconColor="#0891B2"
              label="حول التطبيق"
              subtitle="InfraDZ v1.0.0 by DZ Pro Vision"
              onPress={showAbout}
              isLast
            />
          </Section>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(440).duration(400)}>
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={{ fontSize: 14, fontWeight: "900", color: colors.foreground }}>Infra</Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#DC143C" }}>DZ</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
              Code de route Algérien 2026
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>
              by <Text style={{ color: "#DC143C", fontWeight: "700" }}>DZ</Text> Pro Vision
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View style={{ width: 20, height: 3, borderRadius: 1.5, backgroundColor: "#006233" }} />
              <View style={{ width: 20, height: 3, borderRadius: 1.5, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border }} />
              <View style={{ width: 20, height: 3, borderRadius: 1.5, backgroundColor: "#DC143C" }} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
