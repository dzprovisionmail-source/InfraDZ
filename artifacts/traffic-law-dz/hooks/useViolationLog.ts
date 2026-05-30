import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LogEntry {
  id: string;
  date: string;
  violationName: string;
  fine: number;
  points: number;
  article: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  roadType?: string;
  speed?: number;
  limitSpeed?: number;
  notes?: string;
}

export interface MonthlyStats {
  month: string;
  label: string;
  count: number;
  totalFine: number;
  totalPoints: number;
}

const STORAGE_KEY = "@traffic_law_violation_log";
const MAX_LICENSE_POINTS = 12;

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useViolationLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: LogEntry[]) => {
    setEntries(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addEntry = useCallback(
    async (data: Omit<LogEntry, "id">) => {
      const entry: LogEntry = { ...data, id: genId() };
      const next = [entry, ...entries];
      await persist(next);
      return entry;
    },
    [entries, persist]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      await persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const totalFines = entries.reduce((s, e) => s + e.fine, 0);
  const totalPoints = entries.reduce((s, e) => s + e.points, 0);
  const remainingPoints = Math.max(0, MAX_LICENSE_POINTS - totalPoints);
  const suspensionRisk =
    remainingPoints <= 0
      ? "critical"
      : remainingPoints <= 3
      ? "high"
      : remainingPoints <= 6
      ? "medium"
      : "safe";

  const getMonthlyStats = (): MonthlyStats[] => {
    const map: Record<string, MonthlyStats> = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("ar-DZ", { month: "long", year: "numeric" });
      if (!map[key]) map[key] = { month: key, label, count: 0, totalFine: 0, totalPoints: 0 };
      map[key].count++;
      map[key].totalFine += e.fine;
      map[key].totalPoints += e.points;
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  };

  const getThisMonthStats = () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const m = getMonthlyStats().find((s) => s.month === key);
    return m ?? { month: key, label: "", count: 0, totalFine: 0, totalPoints: 0 };
  };

  const getThisYearEntries = () => {
    const year = new Date().getFullYear().toString();
    return entries.filter((e) => e.date.startsWith(year));
  };

  return {
    entries,
    loading,
    totalFines,
    totalPoints,
    remainingPoints,
    suspensionRisk,
    MAX_LICENSE_POINTS,
    addEntry,
    removeEntry,
    clearAll,
    getMonthlyStats,
    getThisMonthStats,
    getThisYearEntries,
  };
}
