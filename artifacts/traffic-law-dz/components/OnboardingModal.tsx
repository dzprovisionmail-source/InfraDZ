import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "@infradz_onboarded_v1";

const STEPS = [
  {
    icon: "alert-octagon" as const,
    color: "#DC143C",
    bg: "#FFF0F0",
    title: "تعلّم المخالفات",
    desc: "80 مخالفة مرورية مع الغرامات والنقاط المخصومة — مرتبة حسب الخطورة",
  },
  {
    icon: "award" as const,
    color: "#2563EB",
    bg: "#EFF6FF",
    title: "اختبر نفسك",
    desc: "94 سؤال تدريبي مطابق للاختبار الجزائري الرسمي — نسبة النجاح 75%",
  },
  {
    icon: "clipboard" as const,
    color: "#16A34A",
    bg: "#F0FDF4",
    title: "تتبع نقاط رخصتك",
    desc: "سجّل مخالفاتك وراقب نقاطك الـ12 — عند الصفر تُسحب الرخصة فوراً",
  },
];

export function OnboardingModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const dismiss = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const s = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "#00000080",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: insets.bottom + 24,
      gap: 20,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 4,
    },
    titleRow: {
      alignItems: "flex-end",
      gap: 4,
    },
    greeting: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.foreground,
      textAlign: "right",
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "right",
    },
    steps: {
      gap: 10,
    },
    step: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 14,
      borderRadius: 16,
      padding: 14,
    },
    stepIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    stepText: {
      flex: 1,
      gap: 3,
      alignItems: "flex-end",
    },
    stepTitle: {
      fontSize: 15,
      fontWeight: "800",
      textAlign: "right",
    },
    stepDesc: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 18,
    },
    notice: {
      flexDirection: "row-reverse",
      gap: 8,
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 12,
    },
    noticeText: {
      flex: 1,
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
    },
    btn: {
      backgroundColor: "#DC143C",
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 8,
    },
    btnText: {
      fontSize: 17,
      fontWeight: "900",
      color: "#FFF",
    },
  });

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.handle} />

          <View style={s.titleRow}>
            <Text style={s.greeting}>مرحباً بك في InfraDZ 👋</Text>
            <Text style={s.subtitle}>دليلك الشامل لقانون المرور الجزائري 2026</Text>
          </View>

          <View style={s.steps}>
            {STEPS.map((step, i) => (
              <View key={i} style={[s.step, { backgroundColor: step.bg }]}>
                <View style={[s.stepIconBox, { backgroundColor: step.color + "20" }]}>
                  <Feather name={step.icon} size={22} color={step.color} />
                </View>
                <View style={s.stepText}>
                  <Text style={[s.stepTitle, { color: step.color }]}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={s.notice}>
            <Feather name="wifi-off" size={14} color={colors.mutedForeground} />
            <Text style={s.noticeText}>
              التطبيق يعمل بالكامل بدون إنترنت — جميع البيانات محفوظة على جهازك
            </Text>
          </View>

          <TouchableOpacity style={s.btn} onPress={dismiss} activeOpacity={0.85}>
            <Feather name="arrow-left" size={20} color="#FFF" />
            <Text style={s.btnText}>ابدأ الآن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
