"use client";

import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";
import Link from "next/link";
import Chart from "../../components/Chart";
import DashboardLayout from "../../components/DashboardLayout";
import { Bot, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
};

export default function AnalyticsPage() {
    const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        avgDistance: 0,
        avgPH: 0,
        minDistance: 0,
        maxDistance: 0,
        criticalEvents: 0,
        uptime: 100,
    });

    useEffect(() => {
        const sensorsRef = ref(database, "sensors");

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHistoricalData((prev) => {
                    const newData = [...prev, { ...data, timestamp: Date.now() }];
                    return newData.slice(-100);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (historicalData.length === 0) return;

        const distances = historicalData.map((d) => d.distance);
        const pHs = historicalData.map((d) => d.ph);

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const avgPH = pHs.reduce((a, b) => a + b, 0) / pHs.length;
        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);
        const criticalEvents = distances.filter((d) => d < 5).length;

        setAnalytics({
            avgDistance,
            avgPH,
            minDistance,
            maxDistance,
            criticalEvents,
            uptime: 99.8,
        });
    }, [historicalData]);

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Analisis mendalam performa sistem dan prediksi
                    </p>
                </header>

                <section className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <AnalyticsCard
                        title="Avg Water Level"
                        value={analytics.avgDistance.toFixed(1)}
                        unit="cm"
                        trend="+2.3%"
                    />
                    <AnalyticsCard
                        title="Avg pH"
                        value={analytics.avgPH.toFixed(2)}
                        unit="pH"
                        trend="-0.5%"
                    />
                    <AnalyticsCard
                        title="Critical Events"
                        value={analytics.criticalEvents.toString()}
                        unit="events"
                        trend="-15%"
                        trendColor="text-primary"
                    />
                    <AnalyticsCard
                        title="System Uptime"
                        value={analytics.uptime.toFixed(1)}
                        unit="%"
                        trend="+0.2%"
                        trendColor="text-primary"
                    />
                </section>

                <section className="mb-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Water Level Distribution</h2>
                        <Chart data={historicalData} dataKey="distance" color="#10b981" />
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                                <p className="text-muted-foreground">Min</p>
                                <p className="font-bold text-foreground">{analytics.minDistance.toFixed(1)} cm</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Avg</p>
                                <p className="font-bold text-foreground">{analytics.avgDistance.toFixed(1)} cm</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Max</p>
                                <p className="font-bold text-foreground">{analytics.maxDistance.toFixed(1)} cm</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">pH Level Analysis</h2>
                        <Chart data={historicalData} dataKey="ph" color="#3b82f6" />
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Acidic (&lt;6.5)</span>
                                <span className="font-bold text-orange-500">
                                    {historicalData.filter((d) => d.ph < 6.5).length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Neutral (6.5-7.5)</span>
                                <span className="font-bold text-primary">
                                    {historicalData.filter((d) => d.ph >= 6.5 && d.ph <= 7.5).length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Alkaline (&gt;7.5)</span>
                                <span className="font-bold text-blue-500">
                                    {historicalData.filter((d) => d.ph > 7.5).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Predictions (Coming Soon)
                    </h2>
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-6 text-center">
                        <Bot className="h-10 w-10 text-primary mx-auto mb-4" />
                        <p className="text-sm text-foreground">
                            Machine learning model untuk prediksi level air sedang dalam pengembangan. Fitur ini
                            akan membantu antisipasi overflow dan optimasi kontrol otomatis.
                        </p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

function AnalyticsCard({
    title,
    value,
    unit,
    trend,
    trendColor = "text-muted-foreground",
}: {
    title: string;
    value: string;
    unit: string;
    trend: string;
    trendColor?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-xs font-medium text-muted-foreground uppercase">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{unit}</span>
                <span className={`text-xs font-semibold ${trendColor}`}>{trend}</span>
            </div>
        </div>
    );
}