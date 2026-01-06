"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

type ChartProps = {
  data: Array<{ timestamp: number; distance?: number; ph?: number }>;
  dataKey: "distance" | "ph";
  color: string;
  unit?: string;
  label?: string;
  domain?: [number | "auto", number | "auto"];
  isLoading?: boolean;
  syncId?: string;
  thresholds?: Array<{
    value: number;
    label: string;
    color: string;
  }>;
  zones?: Array<{
    y1: number;
    y2: number;
    color: string;
    opacity: number;
    label?: string;
  }>;
};

export default function Chart({
  data,
  dataKey,
  color,
  unit = "",
  label = "",
  domain = ["auto", "auto"],
  isLoading = false,
  thresholds = [],
  zones = [],
  syncId,
}: ChartProps) {
  // Smart domain calculation to prevent zooming in on noise
  // If the range (Max - Min) is too small, we force a wider range.
  const calculateDomain = ([dataMin, dataMax]: [number, number]) => {
    if (domain[0] !== "auto" && domain[1] !== "auto") return domain; // User forced domain

    const min = dataMin || 0;
    const max = dataMax || 10;
    const range = max - min;

    // Minimum visual range to avoid "noise magnification"
    const minRange = dataKey === 'ph' ? 1 : 5;

    if (range < minRange) {
      const padding = (minRange - range) / 2;
      return [Math.max(0, min - padding), max + padding];
    }

    // Default comfortable padding
    const padding = range * 0.1;
    return [Math.max(0, min - padding), max + padding];
  };

  // Format timestamp for X-axis
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = Number(payload[0].value);
      return (
        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl ring-1 ring-border/50">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-1 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">Value</span>
              <span className="text-xl font-bold text-foreground tabular-nums">
                {value.toFixed(2)}
                <span className="text-sm font-medium text-muted-foreground ml-1">{unit}</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-border bg-muted/10">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center rounded-lg border border-border bg-muted/10">
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <svg className="w-10 h-10 text-muted-foreground opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-muted-foreground font-medium">No Data Available</p>
          <p className="text-xs text-muted-foreground/70">Waiting for sensor readings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            syncId={syncId}
          >
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Subtle Zones */}
            {zones.map((z, i) => (
              <ReferenceArea
                key={`zone-${i}`}
                y1={z.y1}
                y2={z.y2}
                fill={z.color}
                fillOpacity={z.opacity * 0.5}
                ifOverflow="extendDomain"
              />
            ))}

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.1}
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={60}
              dy={10}
            />

            <YAxis
              // @ts-ignore
              domain={calculateDomain}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => Number(value).toFixed(1)}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
              isAnimationActive={true}
            />

            {thresholds.map((t, i) => (
              <ReferenceLine
                key={`thresh-${i}`}
                y={t.value}
                stroke={t.color}
                strokeDasharray="3 3"
                opacity={0.7}
                label={{
                  value: t.label,
                  fill: t.color,
                  fontSize: 9,
                  position: "insideBottomRight",
                  fontWeight: 600
                }}
              />
            ))}

            <Area
              name={label || dataKey}
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
              animationDuration={1000}
              animationEasing="linear"
              isAnimationActive={true}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)", fill: color }}
            />

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}