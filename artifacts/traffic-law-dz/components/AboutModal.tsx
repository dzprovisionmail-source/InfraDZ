import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Clipboard,
  Alert,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/images/infradz-logo.png");

const FEATURES = [
  { icon: "message-circle", label: "مساعد قانوني بدون إنترنت",   color: "#DC143C" },
  { icon: "file-text",      label: "قانون المرور PDF كامل",       color: "#2563EB" },
  { icon: "sliders",        label: "حاسبة المخالفات والغرامات",   color: "#006233" },
  { icon: "clipboard",      label: "تدريب على اختبار السياقة",    color: "#7C3AED" },
  { icon: "globe",          label: "واجهة عربية RTL بالكامل",    color: "#EA580C" },
  { icon: "search",         label: "بحث ذكي في القوانين",         color: "#0891B2" },
  { icon: "moon",           label: "دعم الوضع الليلي",            color: "#64748B" },
];

const BARIDIMOB = "00799999000524201107";
const EMAIL     = "DZProVision.Mail@gmail.com";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AboutModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const copyBaridi = () => {
    if (Clipboard?.setString) Clipboard.setString(BARIDIMOB);
    Alert.alert("تم النسخ ✓", `تم نسخ رقم BaridiMob:\n${BARIDIMOB}`, [{ text: "حسناً" }]);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${EMAIL}?subject=InfraDZ - استفسار`).catch(() =>
      Alert.alert("تعذّر فتح البريد", `يمكنك التواصل على:\n${EMAIL}`, [{ text: "حسناً" }])
    );
  };

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "#00000080",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: "96%",
      paddingBottom: insets.bottom + 12,
      overflow: "hidden",
    },

    /* Handle */
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 4,
    },

    /* Header hero */
    hero: {
      backgroundColor: "#0D0D0D",
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    logoRing: {
      width: 96,
      height: 96,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: "#DC143C40",
      marginBottom: 14,
    },
    logoImg: { width: "100%", height: "100%" },
    heroTitle: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 4,
    },
    heroInfra: { fontSize: 26, fontWeight: "900" as const, color: "#FFFFFF", letterSpacing: -0.5 },
    heroDZ:    { fontSize: 26, fontWeight: "900" as const, color: "#DC143C", letterSpacing: -0.5 },
    heroSub: {
      fontSize: 12,
      color: "#FFFFFF66",
      letterSpacing: 0.5,
      marginBottom: 14,
    },
    flagStrip: {
      flexDirection: "row",
      gap: 0,
      borderRadius: 4,
      overflow: "hidden",
    },
    flagSegment: { width: 28, height: 5 },
    vBadge: {
      marginTop: 14,
      backgroundColor: "#DC143C20",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: "#DC143C40",
    },
    vBadgeText: { fontSize: 11, color: "#DC143C", fontWeight: "700" as const, letterSpacing: 0.3 },

    /* Close button */
    closeBtn: {
      position: "absolute",
      top: 14,
      left: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#FFFFFF15",
      alignItems: "center",
      justifyContent: "center",
    },

    /* Body */
    body: { paddingHorizontal: 16, paddingTop: 20 },

    /* Developer card */
    devCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    devCardLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textAlign: "right",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    devRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#DC143C",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarInitials: { fontSize: 20, fontWeight: "900" as const, color: "#FFFFFF" },
    devInfo: { flex: 1, alignItems: "flex-end" },
    devName: {
      fontSize: 16,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    devRole: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 2,
    },
    companyBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#DC143C12",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-end",
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#DC143C25",
    },
    companyText: { fontSize: 12, color: "#DC143C", fontWeight: "700" as const },

    /* Description */
    descCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    descLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textAlign: "right",
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    descText: {
      fontSize: 13,
      color: colors.foreground,
      textAlign: "right",
      lineHeight: 22,
      writingDirection: "rtl",
    },

    /* Features */
    featCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    featLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textAlign: "right",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    featGrid: { gap: 8 },
    featRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    featIconBox: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    featText: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: "600" as const,
      textAlign: "right",
      flex: 1,
    },

    /* Contact */
    contactCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    contactLabel: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      textAlign: "right",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    contactBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    contactIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    contactBtnText: { flex: 1, alignItems: "flex-end" },
    contactTitle: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    contactValue: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 1,
    },

    /* Support */
    supportCard: {
      backgroundColor: "#DC143C",
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
    },
    supportHeader: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    supportIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "#FFFFFF20",
      alignItems: "center",
      justifyContent: "center",
    },
    supportTitle: { fontSize: 15, fontWeight: "800" as const, color: "#FFFFFF" },
    supportSub: { fontSize: 11, color: "#FFFFFF99" },
    supportMethods: { gap: 8 },
    supportMethod: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF15",
      borderRadius: 12,
      padding: 12,
    },
    supportMethodLeft: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    methodDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FFFFFF",
    },
    methodLabel: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" as const },
    methodValue: { fontSize: 11, color: "#FFFFFF99", fontFamily: "monospace" },
    copyBtn: {
      backgroundColor: "#FFFFFF25",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
    },
    copyBtnText: { fontSize: 10, color: "#FFFFFF", fontWeight: "700" as const },

    /* Footer */
    footer: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 6,
    },
    footerText: { fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
    footerMade: { fontSize: 12, color: colors.mutedForeground },
    footerStrip: { flexDirection: "row", gap: 6, marginTop: 8 },
    footerSegment: { width: 24, height: 3, borderRadius: 1.5 },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={s.sheet}>
            <View style={s.handleBar} />

            {/* Hero header */}
            <Animated.View entering={FadeInDown.duration(300)} style={s.hero}>
              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <Feather name="x" size={16} color="#FFFFFF99" />
              </TouchableOpacity>

              <Animated.View entering={ZoomIn.delay(100).duration(350)} style={s.logoRing}>
                <Image source={LOGO} style={s.logoImg} resizeMode="cover" />
              </Animated.View>

              <View style={s.heroTitle}>
                <Text style={s.heroDZ}>DZ</Text>
                <Text style={s.heroInfra}>Infra</Text>
              </View>
              <Text style={s.heroSub}>Code de route Algérien</Text>

              {/* Mini Algerian flag */}
              <View style={s.flagStrip}>
                <View style={[s.flagSegment, { backgroundColor: "#006233" }]} />
                <View style={[s.flagSegment, { backgroundColor: "#FFFFFF" }]} />
                <View style={[s.flagSegment, { backgroundColor: "#DC143C" }]} />
              </View>

              <View style={s.vBadge}>
                <Text style={s.vBadgeText}>الإصدار 1.0.0 • قانون 09-26</Text>
              </View>
            </Animated.View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.body}
              bounces={false}
            >
              {/* Developer */}
              <Animated.View entering={FadeInDown.delay(80).duration(350)}>
                <View style={s.devCard}>
                  <Text style={s.devCardLabel}>المطوّر</Text>
                  <View style={s.devRow}>
                    <View style={s.avatar}>
                      <Text style={s.avatarInitials}>ب م</Text>
                    </View>
                    <View style={s.devInfo}>
                      <Text style={s.devName}>Ben Salem Mohamed Ali</Text>
                      <Text style={s.devRole}>مطوّر تطبيقات • Mobile Developer</Text>
                      <TouchableOpacity
                        style={s.companyBadge}
                        onPress={() => Linking.openURL("mailto:" + EMAIL).catch(() => {})}
                      >
                        <Feather name="briefcase" size={11} color="#DC143C" />
                        <Text style={s.companyText}>DZ Pro Vision</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Description */}
              <Animated.View entering={FadeInDown.delay(130).duration(350)}>
                <View style={s.descCard}>
                  <Text style={s.descLabel}>عن التطبيق</Text>
                  <Text style={s.descText}>
                    InfraDZ هو تطبيق تعليمي جزائري متخصص في قانون المرور، مصمم لمساعدة المستخدمين على فهم قوانين الطريق وقواعد القيادة والمخالفات المرورية والتحضير لاختبار السياقة باللغة العربية، بتجربة حديثة تعمل دون الحاجة إلى إنترنت.
                  </Text>
                </View>
              </Animated.View>

              {/* Features */}
              <Animated.View entering={FadeInDown.delay(180).duration(350)}>
                <View style={s.featCard}>
                  <Text style={s.featLabel}>المميزات</Text>
                  <View style={s.featGrid}>
                    {FEATURES.map((f, i) => (
                      <View key={i} style={s.featRow}>
                        <View style={[s.featIconBox, { backgroundColor: f.color + "18" }]}>
                          <Feather name={f.icon as any} size={16} color={f.color} />
                        </View>
                        <Text style={s.featText}>{f.label}</Text>
                        <Feather name="check-circle" size={14} color="#006233" />
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Contact */}
              <Animated.View entering={FadeInDown.delay(230).duration(350)}>
                <View style={s.contactCard}>
                  <Text style={s.contactLabel}>التواصل</Text>

                  <TouchableOpacity style={s.contactBtn} onPress={openEmail}>
                    <View style={[s.contactIconBox, { backgroundColor: "#2563EB18" }]}>
                      <Feather name="mail" size={18} color="#2563EB" />
                    </View>
                    <View style={s.contactBtnText}>
                      <Text style={s.contactTitle}>البريد الإلكتروني</Text>
                      <Text style={s.contactValue}>{EMAIL}</Text>
                    </View>
                    <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Support */}
              <Animated.View entering={FadeInDown.delay(280).duration(350)}>
                <View style={s.supportCard}>
                  <View style={s.supportHeader}>
                    <View style={s.supportIconBox}>
                      <Feather name="heart" size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.supportTitle}>ادعم المطوّر ❤️</Text>
                      <Text style={s.supportSub}>مساهمتك تساعدنا في الاستمرار</Text>
                    </View>
                  </View>

                  <View style={s.supportMethods}>
                    {/* BaridiMob */}
                    <TouchableOpacity style={s.supportMethod} onPress={copyBaridi}>
                      <View style={s.supportMethodLeft}>
                        <View style={s.methodDot} />
                        <Text style={s.methodLabel}>BaridiMob / Rip</Text>
                      </View>
                      <Text style={s.methodValue}>{BARIDIMOB}</Text>
                      <TouchableOpacity style={s.copyBtn} onPress={copyBaridi}>
                        <Feather name="copy" size={11} color="#FFFFFF" />
                        <Text style={s.copyBtnText}>نسخ</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>

                  <Text style={{
                    fontSize: 10,
                    color: "#FFFFFF66",
                    textAlign: "center",
                    marginTop: 12,
                  }}>
                    كل مساهمة مهما كانت صغيرة تُقدَّر جداً 🙏
                  </Text>
                </View>
              </Animated.View>

              {/* Footer */}
              <Animated.View entering={FadeInDown.delay(330).duration(350)}>
                <View style={s.footer}>
                  <Text style={s.footerText}>
                    صُنع بـ <Text style={{ color: "#DC143C" }}>❤️</Text> في الجزائر
                  </Text>
                  <Text style={s.footerMade}>
                    by <Text style={{ color: "#DC143C", fontWeight: "700" }}>DZ</Text>{" "}
                    <Text style={{ color: colors.foreground, fontWeight: "700" }}>Pro Vision</Text>
                  </Text>
                  <View style={s.footerStrip}>
                    <View style={[s.footerSegment, { backgroundColor: "#006233" }]} />
                    <View style={[s.footerSegment, { backgroundColor: colors.border }]} />
                    <View style={[s.footerSegment, { backgroundColor: "#DC143C" }]} />
                  </View>
                  <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 6 }}>
                    © 2026 InfraDZ — جميع الحقوق محفوظة
                  </Text>
                </View>
              </Animated.View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
