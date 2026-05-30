import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useQuizHistory } from "@/hooks/useQuizHistory";
import {
  QUIZ_QUESTIONS,
  QUIZ_CATEGORIES,
  QUIZ_CONFIG,
  QuizCategory,
  QuizQuestion,
} from "@/data/quizQuestions";

type Screen = "home" | "playing" | "results";
type QuizMode = "quick" | "full";

interface AnswerState {
  selected: number | null;
  revealed: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getQuestions(category: QuizCategory, mode: QuizMode): QuizQuestion[] {
  const pool =
    category === "all"
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.category === category);
  const shuffled = shuffleArray(pool);
  const count = mode === "quick" ? QUIZ_CONFIG.questionsQuick : QUIZ_CONFIG.questionsPerExam;
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function pct(n: number): string {
  return Math.round(n * 100) + "%";
}

// ─── Timer Bar ────────────────────────────────────────────────
function TimerBar({
  seconds,
  total,
  colors,
}: {
  seconds: number;
  total: number;
  colors: ReturnType<typeof useColors>;
}) {
  const progress = seconds / total;
  const barColor =
    progress > 0.5 ? colors.success : progress > 0.25 ? colors.warning : colors.primary;

  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
      <View
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.muted,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: barColor,
            borderRadius: 3,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: barColor,
          minWidth: 24,
          textAlign: "center",
        }}
      >
        {seconds}
      </Text>
    </View>
  );
}

// ─── Option Button ─────────────────────────────────────────────
function OptionButton({
  text,
  index,
  answerState,
  correctIndex,
  onPress,
  colors,
}: {
  text: string;
  index: number;
  answerState: AnswerState;
  correctIndex: number;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const { selected, revealed } = answerState;
  const isSelected = selected === index;
  const isCorrect = index === correctIndex;

  let bgColor = colors.card;
  let borderColor = colors.border;
  let textColor = colors.foreground;

  if (revealed) {
    if (isCorrect) {
      bgColor = colors.successLight;
      borderColor = colors.success;
      textColor = colors.success;
    } else if (isSelected && !isCorrect) {
      bgColor = colors.redLight;
      borderColor = colors.primary;
      textColor = colors.primary;
    }
  } else if (isSelected) {
    bgColor = colors.primary + "15";
    borderColor = colors.primary;
    textColor = colors.primary;
  }

  const letters = ["أ", "ب", "ج", "د"];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={revealed}
      activeOpacity={0.75}
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 12,
        backgroundColor: bgColor,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: revealed && isCorrect ? colors.success : revealed && isSelected ? colors.primary : borderColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {revealed && isCorrect ? (
          <Feather name="check" size={16} color="#fff" />
        ) : revealed && isSelected && !isCorrect ? (
          <Feather name="x" size={16} color="#fff" />
        ) : (
          <Text style={{ color: revealed ? textColor : colors.mutedForeground, fontWeight: "700", fontSize: 14 }}>
            {letters[index]}
          </Text>
        )}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: textColor,
          fontWeight: isSelected || (revealed && isCorrect) ? "600" : "400",
          textAlign: "right",
          writingDirection: "rtl",
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Home Screen ───────────────────────────────────────────────
function HomeScreen({
  colors,
  insets,
  onStart,
  history,
}: {
  colors: ReturnType<typeof useColors>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onStart: (cat: QuizCategory, mode: QuizMode) => void;
  history: ReturnType<typeof useQuizHistory>;
}) {
  const [selectedCat, setSelectedCat] = useState<QuizCategory>("all");
  const [selectedMode, setSelectedMode] = useState<QuizMode>("full");
  const stats = history.getOverallStats();
  const best = history.getBestByCategory();

  const catBest = best[selectedCat];
  const catQCount =
    selectedCat === "all"
      ? QUIZ_QUESTIONS.length
      : QUIZ_QUESTIONS.filter((q) => q.category === selectedCat).length;
  const modeCount =
    selectedMode === "quick"
      ? Math.min(QUIZ_CONFIG.questionsQuick, catQCount)
      : Math.min(QUIZ_CONFIG.questionsPerExam, catQCount);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
          paddingBottom: 28,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right" }}>
          اختبار رخصة القيادة
        </Text>
        <Text style={{ fontSize: 14, color: "#ffffff99", textAlign: "right", marginTop: 4 }}>
          استعد لاجتياز امتحان الكود الجزائري 2026
        </Text>

        {stats.totalAttempts > 0 && (
          <View
            style={{
              flexDirection: "row-reverse",
              gap: 12,
              marginTop: 20,
              backgroundColor: "#ffffff20",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
                {stats.totalAttempts}
              </Text>
              <Text style={{ fontSize: 11, color: "#ffffff99", marginTop: 2 }}>محاولة</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#ffffff30" }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
                {pct(stats.bestScore)}
              </Text>
              <Text style={{ fontSize: 11, color: "#ffffff99", marginTop: 2 }}>أفضل نتيجة</Text>
            </View>
            <View style={{ width: 1, backgroundColor: "#ffffff30" }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
                {pct(stats.passRate)}
              </Text>
              <Text style={{ fontSize: 11, color: "#ffffff99", marginTop: 2 }}>معدل النجاح</Text>
            </View>
          </View>
        )}
      </View>

      {/* Exam info banner */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "#2563EB12",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "#2563EB28",
          flexDirection: "row-reverse",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Feather name="info" size={17} color="#2563EB" style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#2563EB", textAlign: "right" }}>
            مطابق للاختبار الجزائري الرسمي
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.foreground,
              textAlign: "right",
              writingDirection: "rtl",
              lineHeight: 19,
              opacity: 0.85,
            }}
          >
            الامتحان الكامل: 40 سؤال  •  الاختبار السريع: 20 سؤال{"\n"}نسبة النجاح المطلوبة: 75%  •  30 ثانية لكل سؤال
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* Mode Selection */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: colors.foreground,
            textAlign: "right",
            marginBottom: 10,
          }}
        >
          نوع الاختبار
        </Text>
        <View style={{ flexDirection: "row-reverse", gap: 10, marginBottom: 20 }}>
          {(
            [
              { id: "full" as QuizMode, label: "امتحان كامل", sub: `${QUIZ_CONFIG.questionsPerExam} سؤال`, icon: "award" },
              { id: "quick" as QuizMode, label: "اختبار سريع", sub: `${QUIZ_CONFIG.questionsQuick} سؤال`, icon: "zap" },
            ] as { id: QuizMode; label: string; sub: string; icon: string }[]
          ).map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMode(m.id)}
              style={{
                flex: 1,
                backgroundColor:
                  selectedMode === m.id ? colors.primary : colors.card,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor:
                  selectedMode === m.id ? colors.primary : colors.border,
                padding: 14,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Feather
                name={m.icon as "award" | "zap"}
                size={22}
                color={selectedMode === m.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  color: selectedMode === m.id ? "#fff" : colors.foreground,
                }}
              >
                {m.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: selectedMode === m.id ? "#ffffff99" : colors.mutedForeground,
                }}
              >
                {m.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Selection */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: colors.foreground,
            textAlign: "right",
            marginBottom: 10,
          }}
        >
          اختر الموضوع
        </Text>
        <View style={{ gap: 8, marginBottom: 24 }}>
          {QUIZ_CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            const catCount =
              cat.id === "all"
                ? QUIZ_QUESTIONS.length
                : QUIZ_QUESTIONS.filter((q) => q.category === cat.id).length;
            const catBestEntry = best[cat.id];
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: isSelected ? cat.color + "15" : colors.card,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: isSelected ? cat.color : colors.border,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: cat.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name={cat.icon as "grid"} size={20} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: isSelected ? cat.color : colors.foreground,
                      textAlign: "right",
                    }}
                  >
                    {cat.nameAr}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: "right" }}>
                    {catCount} سؤال
                    {catBestEntry
                      ? ` · أفضل: ${pct(catBestEntry.bestPercentage)}`
                      : ""}
                  </Text>
                </View>
                {isSelected && (
                  <Feather name="check-circle" size={20} color={cat.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info card */}
        <View
          style={{
            backgroundColor: colors.infoLight,
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            flexDirection: "row-reverse",
            gap: 10,
            borderWidth: 1,
            borderColor: colors.info + "30",
          }}
        >
          <Feather name="info" size={18} color={colors.info} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.info, textAlign: "right", lineHeight: 20 }}>
              الاختبار يشمل {modeCount} سؤالاً · وقت كل سؤال {QUIZ_CONFIG.timePerQuestion} ثانية · نسبة النجاح {pct(QUIZ_CONFIG.passThreshold)}
            </Text>
            {catBest && (
              <Text
                style={{
                  fontSize: 13,
                  color: catBest.bestPercentage >= QUIZ_CONFIG.passThreshold ? colors.success : colors.warning,
                  textAlign: "right",
                  marginTop: 4,
                  fontWeight: "600",
                }}
              >
                {catBest.bestPercentage >= QUIZ_CONFIG.passThreshold ? "✓ نجحت سابقاً في هذا الموضوع" : `آخر نتيجة: ${pct(catBest.bestPercentage)}`}
              </Text>
            )}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={() => onStart(selectedCat, selectedMode)}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 18,
            paddingVertical: 18,
            alignItems: "center",
            flexDirection: "row-reverse",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Feather name="play-circle" size={22} color="#fff" />
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>ابدأ الاختبار</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Playing Screen ─────────────────────────────────────────────
function PlayingScreen({
  colors,
  insets,
  questions,
  onFinish,
  onAbort,
}: {
  colors: ReturnType<typeof useColors>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  questions: QuizQuestion[];
  onFinish: (score: number, wrongIds: string[], timeSpent: number) => void;
  onAbort: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>({ selected: null, revealed: false });
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_CONFIG.timePerQuestion);
  const [startTime] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const revealAnswer = useCallback(
    (selected: number | null) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const correct = selected === question.correctIndex;
      if (correct) {
        setScore((s) => s + 1);
      } else {
        setWrongIds((ids) => [...ids, question.id]);
      }
      setAnswerState({ selected: selected ?? -1, revealed: true });
    },
    [question]
  );

  // Start countdown timer
  useEffect(() => {
    setTimeLeft(QUIZ_CONFIG.timePerQuestion);
    setAnswerState({ selected: null, revealed: false });

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          revealAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const finalScore = answerState.selected === question.correctIndex ? score : score;
      onFinish(finalScore, wrongIds, timeSpent);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast, score, wrongIds, startTime, onFinish, answerState, question]);

  const handleAbort = () => {
    Alert.alert(
      "إنهاء الاختبار",
      "هل تريد إنهاء الاختبار؟ لن تُحسب هذه الجلسة.",
      [
        { text: "متابعة", style: "cancel" },
        {
          text: "إنهاء",
          style: "destructive",
          onPress: onAbort,
        },
      ]
    );
  };

  const catInfo = QUIZ_CATEGORIES.find((c) => c.id === question.category);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.headerBg,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
          paddingHorizontal: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <View
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.muted,
              marginHorizontal: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }}
            />
          </View>
          <TouchableOpacity onPress={handleAbort}>
            <Feather name="x-circle" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TimerBar seconds={timeLeft} total={QUIZ_CONFIG.timePerQuestion} colors={colors} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Badge */}
        {catInfo && (
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              gap: 6,
              backgroundColor: catInfo.color + "15",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              alignSelf: "flex-start",
              marginBottom: 14,
            }}
          >
            <Feather name={catInfo.icon as "grid"} size={13} color={catInfo.color} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: catInfo.color }}>
              {catInfo.nameAr}
            </Text>
          </View>
        )}

        {/* Question */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.foreground,
            textAlign: "right",
            writingDirection: "rtl",
            lineHeight: 28,
            marginBottom: 20,
          }}
        >
          {question.questionAr}
        </Text>

        {/* Options */}
        {question.options.map((opt, idx) => (
          <OptionButton
            key={idx}
            text={opt}
            index={idx}
            answerState={answerState}
            correctIndex={question.correctIndex}
            onPress={() => !answerState.revealed && revealAnswer(idx)}
            colors={colors}
          />
        ))}

        {/* Explanation (after reveal) */}
        {answerState.revealed && (
          <View
            style={{
              backgroundColor:
                answerState.selected === question.correctIndex
                  ? colors.successLight
                  : colors.redLight,
              borderRadius: 14,
              padding: 14,
              marginTop: 6,
              borderWidth: 1,
              borderColor:
                answerState.selected === question.correctIndex
                  ? colors.success + "40"
                  : colors.primary + "30",
              gap: 8,
            }}
          >
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <Feather
                name={answerState.selected === question.correctIndex ? "check-circle" : "x-circle"}
                size={18}
                color={
                  answerState.selected === question.correctIndex
                    ? colors.success
                    : colors.primary
                }
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color:
                    answerState.selected === question.correctIndex
                      ? colors.success
                      : colors.primary,
                }}
              >
                {answerState.selected === question.correctIndex
                  ? "إجابة صحيحة!"
                  : answerState.selected === null || answerState.selected === -1
                  ? "انتهى الوقت!"
                  : "إجابة خاطئة"}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: colors.foreground,
                textAlign: "right",
                writingDirection: "rtl",
                lineHeight: 22,
              }}
            >
              {question.explanationAr}
            </Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
              <Feather name="book-open" size={13} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                {question.articleRef}
              </Text>
            </View>
          </View>
        )}

        {/* Next/Finish Button */}
        {answerState.revealed && (
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 16,
              alignItems: "center",
              flexDirection: "row-reverse",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Feather name={isLast ? "award" : "arrow-left"} size={20} color="#fff" />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
              {isLast ? "عرض النتائج" : "السؤال التالي"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Score indicator */}
      <View
        style={{
          position: "absolute",
          top: insets.top + (Platform.OS === "web" ? 67 : 12) + 8,
          left: 16,
        }}
      >
        <View
          style={{
            backgroundColor: colors.success + "20",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "800", color: colors.success }}>
            {score} ✓
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Results Screen ─────────────────────────────────────────────
function ResultsScreen({
  colors,
  insets,
  questions,
  score,
  wrongIds,
  timeSpent,
  category,
  onRestart,
  onHome,
}: {
  colors: ReturnType<typeof useColors>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  questions: QuizQuestion[];
  score: number;
  wrongIds: string[];
  timeSpent: number;
  category: QuizCategory;
  onRestart: () => void;
  onHome: () => void;
}) {
  const total = questions.length;
  const percentage = total > 0 ? score / total : 0;
  const passed = percentage >= QUIZ_CONFIG.passThreshold;

  const catBreakdown = useMemo(() => {
    const map: Record<string, { correct: number; total: number; name: string; color: string }> = {};
    for (const q of questions) {
      if (!map[q.category]) {
        const info = QUIZ_CATEGORIES.find((c) => c.id === q.category);
        map[q.category] = { correct: 0, total: 0, name: info?.nameAr ?? q.category, color: info?.color ?? "#888" };
      }
      map[q.category].total++;
      if (!wrongIds.includes(q.id)) map[q.category].correct++;
    }
    return Object.values(map);
  }, [questions, wrongIds]);

  const wrongQuestions = questions.filter((q) => wrongIds.includes(q.id));

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}د ${sec}ث` : `${sec}ث`;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Result Hero */}
      <View
        style={{
          backgroundColor: passed ? colors.success : colors.primary,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24),
          paddingBottom: 32,
          paddingHorizontal: 20,
          alignItems: "center",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#ffffff25",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={passed ? "award" : "refresh-cw"} size={38} color="#fff" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 4 }}>
          {passed ? "مبروك! نجحت" : "لم تنجح هذه المرة"}
        </Text>
        <Text style={{ fontSize: 52, fontWeight: "900", color: "#fff" }}>
          {pct(percentage)}
        </Text>
        <Text style={{ fontSize: 16, color: "#ffffff99" }}>
          {score} / {total} إجابة صحيحة
        </Text>
        <View
          style={{
            flexDirection: "row-reverse",
            gap: 20,
            backgroundColor: "#ffffff15",
            borderRadius: 14,
            padding: 14,
            marginTop: 8,
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", flex: 1 }}>
            <Feather name="clock" size={16} color="#ffffff99" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 4 }}>
              {formatTime(timeSpent)}
            </Text>
            <Text style={{ color: "#ffffff99", fontSize: 11 }}>المدة</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#ffffff30" }} />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Feather name="check" size={16} color="#ffffff99" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 4 }}>
              {score}
            </Text>
            <Text style={{ color: "#ffffff99", fontSize: 11 }}>صحيح</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#ffffff30" }} />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Feather name="x" size={16} color="#ffffff99" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 4 }}>
              {wrongIds.length}
            </Text>
            <Text style={{ color: "#ffffff99", fontSize: 11 }}>خطأ</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#ffffff30" }} />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Feather name="minus-circle" size={16} color="#ffffff99" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 4 }}>
              {total - score - wrongIds.filter((id) => questions.some((q) => q.id === id)).length >= 0
                ? total - score - wrongIds.length
                : 0}
            </Text>
            <Text style={{ color: "#ffffff99", fontSize: 11 }}>بدون إجابة</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {/* Pass threshold reminder */}
        <View
          style={{
            backgroundColor: passed ? colors.successLight : colors.warningLight,
            borderRadius: 14,
            padding: 14,
            flexDirection: "row-reverse",
            gap: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: passed ? colors.success + "30" : colors.warning + "30",
          }}
        >
          <Feather
            name={passed ? "check-circle" : "alert-circle"}
            size={20}
            color={passed ? colors.success : colors.warning}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              color: passed ? colors.success : colors.warning,
              textAlign: "right",
              writingDirection: "rtl",
              fontWeight: "600",
            }}
          >
            {passed
              ? `نجحت بنسبة ${pct(percentage)} — الحد الأدنى للنجاح هو ${pct(QUIZ_CONFIG.passThreshold)}`
              : `نسبة النجاح المطلوبة ${pct(QUIZ_CONFIG.passThreshold)} — نتيجتك ${pct(percentage)} · أعد المحاولة`}
          </Text>
        </View>

        {/* Category breakdown */}
        {catBreakdown.length > 1 && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: colors.foreground,
                textAlign: "right",
              }}
            >
              النتائج حسب الموضوع
            </Text>
            <View style={{ gap: 8 }}>
              {catBreakdown.map((cat) => {
                const catPct = cat.total > 0 ? cat.correct / cat.total : 0;
                return (
                  <View
                    key={cat.name}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}
                      >
                        {cat.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color:
                            catPct >= QUIZ_CONFIG.passThreshold ? colors.success : colors.primary,
                        }}
                      >
                        {cat.correct}/{cat.total} ({pct(catPct)})
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: colors.muted,
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${catPct * 100}%`,
                          backgroundColor:
                            catPct >= QUIZ_CONFIG.passThreshold ? colors.success : colors.primary,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Wrong questions review */}
        {wrongQuestions.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: colors.foreground,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              مراجعة الأسئلة الخاطئة ({wrongQuestions.length})
            </Text>
            <View style={{ gap: 12 }}>
              {wrongQuestions.map((q, idx) => (
                <View
                  key={q.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.foreground,
                      textAlign: "right",
                      writingDirection: "rtl",
                    }}
                  >
                    {idx + 1}. {q.questionAr}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.successLight,
                      borderRadius: 8,
                      padding: 10,
                      flexDirection: "row-reverse",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <Feather name="check-circle" size={14} color={colors.success} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.success,
                          fontWeight: "700",
                          textAlign: "right",
                        }}
                      >
                        الإجابة الصحيحة:
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.foreground,
                          textAlign: "right",
                          writingDirection: "rtl",
                          marginTop: 2,
                        }}
                      >
                        {q.options[q.correctIndex]}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.mutedForeground,
                      textAlign: "right",
                      writingDirection: "rtl",
                      lineHeight: 18,
                    }}
                  >
                    {q.explanationAr}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "right" }}>
                    📖 {q.articleRef}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 10, marginTop: 8 }}>
          <TouchableOpacity
            onPress={onRestart}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row-reverse",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Feather name="refresh-cw" size={20} color="#fff" />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>إعادة الاختبار</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onHome}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: colors.border,
              flexDirection: "row-reverse",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Feather name="home" size={20} color={colors.foreground} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              الصفحة الرئيسية
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Main Quiz Tab ──────────────────────────────────────────────
export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const history = useQuizHistory();

  const [screen, setScreen] = useState<Screen>("home");
  const [activeCategory, setActiveCategory] = useState<QuizCategory>("all");
  const [activeMode, setActiveMode] = useState<QuizMode>("full");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [resultScore, setResultScore] = useState(0);
  const [resultWrongIds, setResultWrongIds] = useState<string[]>([]);
  const [resultTime, setResultTime] = useState(0);

  const handleStart = useCallback((cat: QuizCategory, mode: QuizMode) => {
    const qs = getQuestions(cat, mode);
    if (qs.length === 0) {
      Alert.alert("لا توجد أسئلة", "لا تتوفر أسئلة كافية لهذا الموضوع.");
      return;
    }
    setActiveCategory(cat);
    setActiveMode(mode);
    setQuestions(qs);
    setScreen("playing");
  }, []);

  const handleFinish = useCallback(
    async (score: number, wrongIds: string[], timeSpent: number) => {
      setResultScore(score);
      setResultWrongIds(wrongIds);
      setResultTime(timeSpent);
      await history.saveSession({
        category: activeCategory,
        score,
        total: questions.length,
        timeSpentSeconds: timeSpent,
        wrongQuestionIds: wrongIds,
      });
      setScreen("results");
    },
    [activeCategory, questions, history]
  );

  const handleRestart = useCallback(() => {
    handleStart(activeCategory, activeMode);
  }, [activeCategory, activeMode, handleStart]);

  if (screen === "playing") {
    return (
      <PlayingScreen
        colors={colors}
        insets={insets}
        questions={questions}
        onFinish={handleFinish}
        onAbort={() => setScreen("home")}
      />
    );
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        colors={colors}
        insets={insets}
        questions={questions}
        score={resultScore}
        wrongIds={resultWrongIds}
        timeSpent={resultTime}
        category={activeCategory}
        onRestart={handleRestart}
        onHome={() => setScreen("home")}
      />
    );
  }

  return (
    <HomeScreen
      colors={colors}
      insets={insets}
      onStart={handleStart}
      history={history}
    />
  );
}
