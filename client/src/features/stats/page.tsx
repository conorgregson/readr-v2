import { useEffect, useMemo } from "react";
import { LoadingState } from "../../shared/ui/states/LoadingState";
import { ErrorState } from "../../shared/ui/states/ErrorState";
import { Button } from "../../shared/ui/Button";
import { useStatsStore } from "./store/stats.store";
import type { ReadingTrendMetric } from "../../../../shared/types/v2.4";
import { useEngagementStore } from "../engagement/store/engagement.store";
import { EngagementPanel } from "../engagement/components/EngagementPanel";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatMetricLabel(metric: ReadingTrendMetric) {
  switch (metric) {
    case "pages":
      return "Pages";
    case "sessions":
      return "Sessions";
    case "booksFinished":
      return "Books Finished";
  }
}

function StatCard(props: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">
        {props.value}
      </div>
      {props.helper ? (
        <div className="mt-1 text-xs text-slate-500">{props.helper}</div>
      ) : null}
    </div>
  );
}

function SimpleTrendChart(props: {
  labels: string[];
  values: number[];
  metric: ReadingTrendMetric;
}) {
  const width = 960;
  const height = 320;

  const margin = {
    top: 20,
    right: 24,
    bottom: 42,
    left: 44,
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(1, ...props.values);
  const barCount = props.values.length;
  const gap = 6;
  const xStep = innerWidth / barCount;
  const barWidth = Math.max(6, innerWidth / barCount - gap);

  const yTicks = Array.from(
    new Set([0, Math.ceil(maxValue / 2), maxValue]),
  ).sort((a, b) => a - b);

  const showLabelIndexes = new Set([
    0,
    Math.floor((barCount - 1) * 0.25),
    Math.floor((barCount - 1) * 0.5),
    Math.floor((barCount - 1) * 0.75),
    barCount - 1,
  ]);

  function yScale(value: number) {
    return margin.top + innerHeight - (value / maxValue) * innerHeight;
  }

  function formatShortDate(label: string) {
    return label.slice(5); // MM-DD
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-50">
          {formatMetricLabel(props.metric)} — last 30 days
        </h2>
        <div className="text-xs text-slate-400">Server-derived trend</div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[320px] w-full min-w-[720px]"
          role="img"
          aria-label={`${formatMetricLabel(props.metric)} bar chart for the last 30 days`}
        >
          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = yScale(tick);

            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.14)"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={margin.top + innerHeight}
            stroke="rgba(148, 163, 184, 0.28)"
            strokeWidth="1"
          />
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={margin.top + innerHeight}
            y2={margin.top + innerHeight}
            stroke="rgba(148, 163, 184, 0.28)"
            strokeWidth="1"
          />

          {/* Bars */}
          {props.values.map((value, index) => {
            if (value <= 0) return null;

            const x = margin.left + index * xStep + (xStep - barWidth) / 2;
            const y = yScale(value);
            const barHeight = (value / maxValue) * innerHeight;

            return (
              <g key={`${props.labels[index]}-${index}`}>
                <title>{`${props.labels[index]}: ${value}`}</title>

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  fill="#14b8a6"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {props.labels.map((label, index) => {
            if (!showLabelIndexes.has(index)) return null;

            const x = margin.left + index * xStep + xStep / 2;

            return (
              <text
                key={`x-${label}-${index}`}
                x={x}
                y={height - 12}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === barCount - 1
                      ? "end"
                      : "middle"
                }
                fontSize="11"
                fill="#94a3b8"
              >
                {formatShortDate(label)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function StatsPage() {
  const page = useStatsStore((s) => s.page);
  const isBootstrapped = useStatsStore((s) => s.isBootstrapped);
  const isLoadingSummary = useStatsStore((s) => s.isLoadingSummary);
  const isLoadingTrend = useStatsStore((s) => s.isLoadingTrend);
  const engagementPage = useEngagementStore((s) => s.page);
  const engagementSnapshot = useEngagementStore((s) => s.snapshot);
  const isEngagementBootstrapped = useEngagementStore((s) => s.isBootstrapped);
  const isLoadingEngagement = useEngagementStore((s) => s.isLoading);
  const loadEngagement = useEngagementStore((s) => s.loadEngagement);
  const setEngagementError = useEngagementStore((s) => s.setError);
  const summary = useStatsStore((s) => s.summary);
  const trend = useStatsStore((s) => s.trend);
  const selectedMetric = useStatsStore((s) => s.selectedMetric);
  const loadStats = useStatsStore((s) => s.loadStats);
  const setSelectedMetric = useStatsStore((s) => s.setSelectedMetric);
  const setError = useStatsStore((s) => s.setError);

  useEffect(() => {
    if (isBootstrapped) return;
    void loadStats();
  }, [isBootstrapped, loadStats]);

  useEffect(() => {
    if (isEngagementBootstrapped) return;
    void loadEngagement();
  }, [isEngagementBootstrapped, loadEngagement]);

  const trendLabels = useMemo(
    () => trend?.points.map((point) => point.date) ?? [],
    [trend],
  );

  const trendValues = useMemo(
    () => trend?.points.map((point) => point.value) ?? [],
    [trend],
  );

  if (
    (!isBootstrapped &&
      (isLoadingSummary || isLoadingTrend || !summary || !trend)) ||
    (!isEngagementBootstrapped && (isLoadingEngagement || !engagementSnapshot))
  ) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (page.error || engagementPage.error) {
    return (
      <ErrorState
        message={
          page.error?.message ??
          engagementPage.error?.message ??
          "Unknown error"
        }
        action={
          <Button
            onClick={() => {
              setError(undefined);
              setEngagementError(undefined);
            }}
          >
            Dismiss
          </Button>
        }
      />
    );
  }

  if (!summary || !trend || !engagementSnapshot) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const metrics: ReadingTrendMetric[] = ["pages", "sessions", "booksFinished"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Server-derived reading stats and recent activity.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Books"
          value={formatNumber(summary.totals.books)}
        />
        <StatCard
          label="Finished Books"
          value={formatNumber(summary.totals.finishedBooks)}
        />
        <StatCard
          label="Pages Read"
          value={formatNumber(summary.totals.pagesRead)}
        />
        <StatCard
          label="Sessions Logged"
          value={formatNumber(summary.totals.sessionsLogged)}
        />
        <StatCard
          label="Avg Session Minutes"
          value={summary.totals.avgSessionMinutes.toFixed(1)}
        />
        <StatCard
          label="Books Finished This Month"
          value={formatNumber(summary.currentPeriod.booksFinishedThisMonth)}
          helper={`Pages this month: ${formatNumber(summary.currentPeriod.pagesReadThisMonth)}`}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {metrics.map((metric) => {
            const isActive = metric === selectedMetric;

            return (
              <button
                key={metric}
                type="button"
                onClick={() => void setSelectedMetric(metric)}
                className={[
                  "rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-slate-700 text-slate-50"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                ].join(" ")}
                aria-pressed={isActive}
                disabled={isLoadingTrend}
              >
                {formatMetricLabel(metric)}
              </button>
            );
          })}
        </div>

        {isLoadingTrend ? (
          <LoadingState label="Loading trend..." />
        ) : (
          <SimpleTrendChart
            labels={trendLabels}
            values={trendValues}
            metric={selectedMetric}
          />
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Engagement</h2>
          <p className="text-sm text-slate-400">
            Goals, streaks, and badge progress derived from your reading
            activity.
          </p>
        </div>

        <EngagementPanel snapshot={engagementSnapshot} />
      </section>
    </div>
  );
}
