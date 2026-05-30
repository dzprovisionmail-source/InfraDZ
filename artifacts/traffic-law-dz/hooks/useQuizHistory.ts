import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuizCategory, QUIZ_CONFIG } from "@/data/quizQuestions";

export interface QuizSession {
  id: string;
  date: string;
  category: QuizCategory;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  wrongQuestionIds: string[];
}

export interface CategoryBestScore {
  category: QuizCategory;
  bestPercentage: number;
  totalAttempts: number;
  lastPlayed: string;
}

const STORAGE_KEY = "@infradz_quiz_history";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useQuizHistory() {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as QuizSession[];
          setSessions(parsed);
        }
      } catch {
        // silently ignore read errors — sessions will be empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: QuizSession[]) => {
    setSessions(next);
    try {
      const trimmed = next.slice(0, QUIZ_CONFIG.maxRecentSessions);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // silently ignore write errors
    }
  }, []);

  const saveSession = useCallback(
    async (data: Omit<QuizSession, "id" | "date" | "percentage" | "passed">) => {
      const percentage = data.total > 0 ? data.score / data.total : 0;
      const session: QuizSession = {
        ...data,
        id: genId(),
        date: new Date().toISOString(),
        percentage,
        passed: percentage >= QUIZ_CONFIG.passThreshold,
      };
      const next = [session, ...sessions].slice(0, QUIZ_CONFIG.maxRecentSessions);
      await persist(next);
      return session;
    },
    [sessions, persist]
  );

  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const getBestByCategory = useCallback((): Record<string, CategoryBestScore> => {
    const map: Record<string, CategoryBestScore> = {};
    for (const s of sessions) {
      const key = s.category;
      if (!map[key]) {
        map[key] = {
          category: s.category,
          bestPercentage: s.percentage,
          totalAttempts: 1,
          lastPlayed: s.date,
        };
      } else {
        map[key].totalAttempts++;
        if (s.percentage > map[key].bestPercentage) {
          map[key].bestPercentage = s.percentage;
        }
        if (s.date > map[key].lastPlayed) {
          map[key].lastPlayed = s.date;
        }
      }
    }
    return map;
  }, [sessions]);

  const getOverallStats = useCallback(() => {
    if (sessions.length === 0) {
      return { totalAttempts: 0, passRate: 0, avgScore: 0, bestScore: 0 };
    }
    const passed = sessions.filter((s) => s.passed).length;
    const avgScore = sessions.reduce((sum, s) => sum + s.percentage, 0) / sessions.length;
    const bestScore = Math.max(...sessions.map((s) => s.percentage));
    return {
      totalAttempts: sessions.length,
      passRate: passed / sessions.length,
      avgScore,
      bestScore,
    };
  }, [sessions]);

  const getRecentSessions = useCallback(
    (limit = 5): QuizSession[] => sessions.slice(0, limit),
    [sessions]
  );

  return {
    sessions,
    loading,
    saveSession,
    clearHistory,
    getBestByCategory,
    getOverallStats,
    getRecentSessions,
  };
}
