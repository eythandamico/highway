import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react";

/** Missing or zero baselines never produce a fabricated percentage. */
export function MetricTrend({ current, previous, period, lowerIsBetter = false }: {
  current: number; previous: number; period: string; lowerIsBetter?: boolean;
}) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  const percent = ((current - previous) / previous) * 100;
  const unchanged = Math.abs(percent) < 0.05;
  const improving = lowerIsBetter ? percent < 0 : percent > 0;
  const Icon = unchanged ? Minus : percent > 0 ? ArrowUpRight : ArrowDownLeft;
  const amount = Math.abs(percent).toLocaleString("en-CA", { maximumFractionDigits: 1 });
  const direction = unchanged ? "Unchanged" : `${amount}% ${percent > 0 ? "higher" : "lower"}`;
  return (
    <span className="yw-metric-trend" role="img" aria-label={`${direction} ${period}`} title={`${direction} ${period}`}>
      <span className="yw-metric-trend-value" data-tone={unchanged ? "neutral" : improving ? "positive" : "negative"} aria-hidden="true">
        <span className="yw-metric-trend-icon"><Icon size={12} strokeWidth={2.5} /></span>
        {unchanged ? "0" : amount}%
      </span>
    </span>
  );
}
