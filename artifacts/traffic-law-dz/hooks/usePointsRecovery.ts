import { useMemo } from "react";
import { LogEntry } from "./useViolationLog";

export const RECOVERY_YEARS = 3;

export interface RecoveryItem {
  entry: LogEntry;
  startDate: Date;
  recoveryDate: Date;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  progress: number;
  isRecovered: boolean;
  monthsRemaining: number;
}

export interface RecoverySummary {
  items: RecoveryItem[];
  pending: RecoveryItem[];
  recovered: RecoveryItem[];
  nextRecovery: RecoveryItem | null;
  pointsPendingRecovery: number;
  pointsAlreadyRecovered: number;
  pointsRecoverableIn6Months: number;
  pointsRecoverableIn1Year: number;
}

export function usePointsRecovery(entries: LogEntry[]): RecoverySummary {
  return useMemo(() => {
    const now = new Date();

    const items: RecoveryItem[] = entries.map((entry) => {
      const startDate = new Date(entry.date);
      const recoveryDate = new Date(startDate);
      recoveryDate.setFullYear(recoveryDate.getFullYear() + RECOVERY_YEARS);

      const totalMs = recoveryDate.getTime() - startDate.getTime();
      const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
      const remainingMs = Math.max(0, recoveryDate.getTime() - now.getTime());

      const daysElapsed = Math.floor(elapsedMs / 86_400_000);
      const daysRemaining = Math.ceil(remainingMs / 86_400_000);
      const totalDays = Math.ceil(totalMs / 86_400_000);
      const progress = Math.min(1, elapsedMs / totalMs);
      const isRecovered = now >= recoveryDate;
      const monthsRemaining = Math.ceil(daysRemaining / 30);

      return {
        entry,
        startDate,
        recoveryDate,
        daysElapsed,
        daysRemaining,
        totalDays,
        progress,
        isRecovered,
        monthsRemaining,
      };
    });

    const pending = items
      .filter((i) => !i.isRecovered)
      .sort((a, b) => a.recoveryDate.getTime() - b.recoveryDate.getTime());

    const recovered = items.filter((i) => i.isRecovered);

    const nextRecovery = pending[0] ?? null;

    const pointsPendingRecovery = pending.reduce((s, i) => s + i.entry.points, 0);
    const pointsAlreadyRecovered = recovered.reduce((s, i) => s + i.entry.points, 0);
    const pointsRecoverableIn6Months = pending
      .filter((i) => i.daysRemaining <= 180)
      .reduce((s, i) => s + i.entry.points, 0);
    const pointsRecoverableIn1Year = pending
      .filter((i) => i.daysRemaining <= 365)
      .reduce((s, i) => s + i.entry.points, 0);

    return {
      items,
      pending,
      recovered,
      nextRecovery,
      pointsPendingRecovery,
      pointsAlreadyRecovered,
      pointsRecoverableIn6Months,
      pointsRecoverableIn1Year,
    };
  }, [entries]);
}

export function formatRecoveryDate(date: Date): string {
  return date.toLocaleDateString("ar-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return "اليوم";
  if (days === 1) return "غداً";
  if (days <= 30) return `${days} يوماً`;
  const months = Math.floor(days / 30);
  const rem = days % 30;
  if (months < 12) {
    return rem > 0 ? `${months} شهراً و${rem} يوماً` : `${months} شهراً`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} سنة`;
  return `${years} سنة و${remMonths} شهراً`;
}
