"use client";

import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";
import Link from "next/link";
import Chart from "../../components/Chart";
import DashboardLayout from "../../components/DashboardLayout";
import { Bot, Activity, AlertTriangle, Clock, TrendingUp, TrendingDown, Percent, Droplets, Zap } from "lucide-react";

type SensorData = {
    distance: number;
    ph: number;
    phVolt: number;
    timestamp: number;
};

type AnalyticsData = {
    avgDistance: number;
    avgPH: number;
    minDistance: number;
    maxDistance: number;
    criticalEvents: number;
    uptime: number;
    stabilityScore: number; // 0-100
    phStability: "Stable" | "Fluctuating" | "Volatile";
    waterTrend: number; // cm/hour
    healthScore: number; // 0-100
    lastCriticalEvent: string | null;
};

type EventLog = {
    id: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    message: string;
    timestamp: number;
};

export default function AnalyticsPage() {
    const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        avgDistance: 0,
        avgPH: 0,
        minDistance: 0,
        maxDistance: 0,
        criticalEvents: 0,
        uptime: 99.9,
        stabilityScore: 100,
        phStability: "Stable",
        waterTrend: 0,
        healthScore: 100,
        lastCriticalEvent: null,
    });

    useEffect(() => {
        const sensorsRef = ref(database, "sensors");

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHistoricalData((prev) => {
                    const newData = [...prev, { ...data, timestamp: Date.now() }];
                    // Limit to last 200 points for better trend analysis
                    return newData.slice(-200);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (historicalData.length < 2) return;

        const distances = historicalData.map((d) => d.distance);
        const pHs = historicalData.map((d) => d.ph);

        // Basic Stats
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const avgPH = pHs.reduce((a, b) => a + b, 0) / pHs.length;
        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);

        // Critical Events (e.g. Water Level < 5cm or pH < 4)
        const criticals = historicalData.filter((d) => d.distance < 5 || d.ph < 4 || d.ph > 10);
        const criticalEventsCount = criticals.length;
        const lastCritical = criticals.length > 0 ? new Date(criticals[criticals.length - 1].timestamp).toLocaleTimeString() : null;

        // --- Advanced Calculations ---

        // 1. Stability (Standard Deviation of pH)
        const phVariance = pHs.reduce((sum, val) => sum + Math.pow(val - avgPH, 2), 0) / pHs.length;
        const phStdDev = Math.sqrt(phVariance);
        let phStability: "Stable" | "Fluctuating" | "Volatile" = "Stable";
        if (phStdDev > 0.5) phStability = "Fluctuating";
        if (phStdDev > 1.0) phStability = "Volatile";

        // 2. Water Trend (cm per hour)
        // Take first and last point of the visibly loaded data
        const firstPoint = historicalData[0];
        const lastPoint = historicalData[historicalData.length - 1];
        const timeDiffHours = (lastPoint.timestamp - firstPoint.timestamp) / (1000 * 60 * 60);

        let waterTrend = 0;
        if (timeDiffHours > 0) {
            waterTrend = (lastPoint.distance - firstPoint.distance) / timeDiffHours;
        }

        // 3. System Health Score (0-100)
        // Deduct points for Warning/Critical zones
        let healthDeduction = 0;
        if (lastPoint.distance < 10) healthDeduction += 20; // Low water warning
        if (lastPoint.ph < 5 || lastPoint.ph > 9) healthDeduction += 30; // Bad pH
        if (phStability === "Volatile") healthDeduction += 10;

        const healthScore = Math.max(0, 100 - healthDeduction);

        setAnalytics({
            avgDistance,
            avgPH,
            minDistance,
            maxDistance,
            criticalEvents: criticalEventsCount,
            uptime: 99.9,
            stabilityScore: Math.max(0, 100 - (phStdDev * 20)), // Rough score based on deviation
            phStability,
            waterTrend,
            healthScore,
            lastCriticalEvent: lastCritical,
        });

        // Generate Event Log based on recent data changes
        // This is a simplified simulation for the UI
        const newEvents: EventLog[] = [];
        if (lastPoint.distance < 5) newEvents.push({ id: Date.now() + '1', type: "CRITICAL", message: "Water Level Critical (< 5cm)", timestamp: lastPoint.timestamp });
        else if (lastPoint.distance < 15) newEvents.push({ id: Date.now() + '2', type: "WARNING", message: "Water Level Low", timestamp: lastPoint.timestamp });

        if (lastPoint.ph > 8) newEvents.push({ id: Date.now() + '3', type: "WARNING", message: "pH High (Alkaline)", timestamp: lastPoint.timestamp });

        // Keep unique events only (simplified)
        setEvents(newEvents.reverse().slice(0, 5));

    }, [historicalData]);

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Deep analysis of system performance, trends, and health.
                        </p>
                    </div>
                    {/* Health Assessment Badge */}
                    <div className={`px-4 py-2 rounded-full border ${analytics.healthScore > 80 ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'} flex items-center gap-2`}>
                        <Activity className="w-5 h-5" />
                        <span className="font-bold">System Health: {analytics.healthScore.toFixed(0)}%</span>
                    </div>
                </header>

                {/* Primary Metrics */}
                <section className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <AnalyticsCard
                        title="Avg Water Level"
                        value={analytics.avgDistance.toFixed(1)}
                        unit="cm"
                        icon={<Droplets className="w-4 h-4 text-blue-500" />}
                        subtext={`Min: ${analytics.minDistance.toFixed(1)} | Max: ${analytics.maxDistance.toFixed(1)}`}
                    />
                    <AnalyticsCard
                        title="Avg pH Level"
                        value={analytics.avgPH.toFixed(2)}
                        unit="pH"
                        icon={<Zap className="w-4 h-4 text-purple-500" />}
                        subtext={`Stability: ${analytics.phStability}`}
                    />
                    <AnalyticsCard
                        title="Water Trend"
                        value={analytics.waterTrend > 0 ? `+${analytics.waterTrend.toFixed(1)}` : analytics.waterTrend.toFixed(1)}
                        unit="cm/hr"
                        icon={analytics.waterTrend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-orange-500" />}
                        subtext={analytics.waterTrend > 0 ? "Filling Up" : "Draining"}
                    />
                    <AnalyticsCard
                        title="Critical Events"
                        value={analytics.criticalEvents.toString()}
                        unit="events"
                        icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                        subtext={analytics.lastCriticalEvent ? `Last: ${analytics.lastCriticalEvent}` : "No recent events"}
                        trendColor="text-red-500"
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                    {/* Usage/Trend Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">Water Level Trend</h2>
                                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Real-time</span>
                            </div>
                            <Chart data={historicalData} dataKey="distance" color="#10b981" unit="cm" label="Distance" />
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">pH Stability Analysis</h2>
                                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Real-time</span>
                            </div>
                            <Chart data={historicalData} dataKey="ph" color="#3b82f6" unit=" pH" label="pH" />
                        </div>
                    </div>

                    {/* Side Panel: Insights & Logs */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                AI Insights
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        <span className="font-semibold text-primary block mb-1">Water Efficiency</span>
                                        Based on current trend ({Math.abs(analytics.waterTrend).toFixed(1)} cm/hr), the system is operating within expected parameters. Water retention is {analytics.waterTrend > -2 ? "Optimal" : "Below Average"}.
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        <span className="font-semibold text-blue-500 block mb-1">pH Balance</span>
                                        pH levels are <strong>{analytics.phStability}</strong>.
                                        {analytics.avgPH < 6.5 ? " Slightly acidic conditions detected. Consider adding buffer solution." : ""}
                                        {analytics.avgPH > 7.5 ? " Slightly alkaline conditions detected." : ""}
                                        {analytics.avgPH >= 6.5 && analytics.avgPH <= 7.5 ? " Conditions are ideal for plant nutrient uptake." : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {events.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity logged.</p>
                                ) : (
                                    events.map((e, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${e.type === 'CRITICAL' ? 'bg-red-500' : e.type === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{e.message}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AnalyticsCard({
    title,
    value,
    unit,
    icon,
    subtext,
    trendColor = "text-muted-foreground",
}: {
    title: string;
    value: string;
    unit: string;
    icon?: React.ReactNode;
    subtext?: string;
    trendColor?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
                {icon}
            </div>

            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <span className="text-sm text-muted-foreground font-medium">{unit}</span>
            </div>

            {subtext && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <p className={`text-xs ${trendColor} font-medium`}>{subtext}</p>
                </div>
            )}
        </div>
    );
}
