"use client";

import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref, onValue, set } from "firebase/database";
import Link from "next/link";
import Chart from "../../components/Chart";

type SensorData = {
    distance: number;
    ph: number;
    phVolt: number;
    servo: number;
    servo2: number;
    pump: number;
    waterDetected: number;
    timestamp: number;
};

type DeviceStatus = {
    status: number;
    mode: string;
};

type HistoricalDataPoint = {
    timestamp: number;
    distance: number;
    ph: number;
};

function cn(...cls: Array<string | false | null | undefined>) {
    return cls.filter(Boolean).join(" ");
}

export default function Dashboard() {
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "controls">("overview");

    useEffect(() => {
        const sensorsRef = ref(database, "sensors");
        const deviceRef = ref(database, "device");

        const unsubscribeSensors = onValue(
            sensorsRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setSensorData(data);
                    setConnected(true);
                    setLastUpdate(new Date());

                    setHistoricalData((prev) => {
                        const newPoint = {
                            timestamp: Date.now(),
                            distance: data.distance,
                            ph: data.ph,
                        };
                        const updated = [...prev, newPoint];
                        return updated.slice(-30);
                    });
                }
            },
            (error) => {
                console.error("Firebase error:", error);
                setConnected(false);
            }
        );

        const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setDeviceStatus(data);
            }
        });

        const connectionCheck = setInterval(() => {
            if (lastUpdate && Date.now() - lastUpdate.getTime() > 10000) {
                setConnected(false);
            }
        }, 5000);

        return () => {
            unsubscribeSensors();
            unsubscribeDevice();
            clearInterval(connectionCheck);
        };
    }, [lastUpdate]);

    const handleModeToggle = async () => {
        const newMode = deviceStatus?.mode === "auto" ? "manual" : "auto";
        try {
            await set(ref(database, "device/mode"), newMode);
        } catch (error) {
            console.error("Failed to toggle mode:", error);
        }
    };

    const handleServoControl = async (angle: number) => {
        try {
            await set(ref(database, "commands/servo"), angle);
        } catch (error) {
            console.error("Failed to control servo:", error);
        }
    };

    const handlePumpControl = async (state: number) => {
        try {
            await set(ref(database, "commands/pump"), state);
        } catch (error) {
            console.error("Failed to control pump:", error);
        }
    };

    const getWaterLevelStatus = () => {
        if (!sensorData) return { label: "N/A", color: "bg-gray-500" };
        if (sensorData.distance < 5) return { label: "CRITICAL", color: "bg-red-500" };
        if (sensorData.distance < 15) return { label: "LOW", color: "bg-yellow-500" };
        return { label: "NORMAL", color: "bg-green-500" };
    };

    const getPhStatus = () => {
        if (!sensorData) return { label: "N/A", color: "bg-gray-500" };
        if (sensorData.ph < 6.5) return { label: "ACIDIC", color: "bg-orange-500" };
        if (sensorData.ph > 7.5) return { label: "ALKALINE", color: "bg-blue-500" };
        return { label: "NEUTRAL", color: "bg-green-500" };
    };

    const waterStatus = getWaterLevelStatus();
    const phStatus = getPhStatus();

    const getTimeSinceUpdate = () => {
        if (!lastUpdate) return "Never";
        const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    };

    const getWaterTrend = () => {
        if (historicalData.length < 2) return "stable";
        const recent = historicalData.slice(-5);
        const avg = recent.reduce((sum, d) => sum + d.distance, 0) / recent.length;
        const last = recent[recent.length - 1].distance;

        if (last > avg + 2) return "rising";
        if (last < avg - 2) return "falling";
        return "stable";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 opacity-40">
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-[120px]" />
                <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-sky-500 blur-[140px]" />
                <div className="absolute -bottom-30 -left-30 h-80 w-80 rounded-full bg-fuchsia-500 blur-[160px]" />
            </div>

            <nav className="relative border-b border-white/10 backdrop-blur">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
                            <span className="text-xl font-bold">Terraflow</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="text-sm text-emerald-400">
                                Dashboard
                            </Link>
                            <Link href="/analytics" className="text-sm hover:text-emerald-400 transition">
                                Analytics
                            </Link>
                            <Link href="/history" className="text-sm hover:text-emerald-400 transition">
                                History
                            </Link>
                            <Link href="/settings" className="text-sm hover:text-emerald-400 transition">
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                                    )}
                                />
                                {connected ? "Connected" : "Disconnected"} • Realtime
                            </div>
                            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                            <p className="mt-2 text-sm text-white/70">
                                Real-time monitoring sistem ketinggian air dan pH
                            </p>
                        </div>
                        <button
                            onClick={handleModeToggle}
                            disabled={!connected}
                            className={cn(
                                "rounded-lg px-6 py-3 text-sm font-semibold transition",
                                deviceStatus?.mode === "auto"
                                    ? "bg-emerald-500/90 text-slate-950 hover:bg-emerald-400"
                                    : "bg-amber-500/90 text-slate-950 hover:bg-amber-400",
                                !connected && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {deviceStatus?.mode === "auto" ? "AUTO MODE" : "MANUAL MODE"}
                        </button>
                    </div>
                </header>

                <div className="mb-6 flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={cn(
                            "border-b-2 px-4 py-2 text-sm font-medium transition",
                            activeTab === "overview"
                                ? "border-emerald-500 text-emerald-400"
                                : "border-transparent text-white/60 hover:text-white/80"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("controls")}
                        className={cn(
                            "border-b-2 px-4 py-2 text-sm font-medium transition",
                            activeTab === "controls"
                                ? "border-emerald-500 text-emerald-400"
                                : "border-transparent text-white/60 hover:text-white/80"
                        )}
                    >
                        Controls
                    </button>
                </div>

                {activeTab === "overview" && (
                    <>
                        <section className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                title="Water Level"
                                value={sensorData?.distance.toFixed(1) ?? "—"}
                                unit="cm"
                                status={waterStatus.label}
                                statusColor={waterStatus.color}
                                trend={getWaterTrend()}
                            />
                            <MetricCard
                                title="pH Level"
                                value={sensorData?.ph.toFixed(2) ?? "—"}
                                unit={`${sensorData?.phVolt.toFixed(3) ?? "—"}V`}
                                status={phStatus.label}
                                statusColor={phStatus.color}
                            />
                            <MetricCard
                                title="Servo Main"
                                value={`${sensorData?.servo ?? "—"}°`}
                                unit={sensorData?.servo === 90 ? "OPEN" : "CLOSE"}
                                icon="🎛️"
                            />
                            <MetricCard
                                title="Water Pump"
                                value={sensorData?.pump ? "ON" : "OFF"}
                                unit={sensorData?.pump ? "ACTIVE" : "IDLE"}
                                icon="💧"
                                statusColor={sensorData?.pump ? "bg-blue-500" : "bg-gray-500"}
                            />
                        </section>

                        <section className="mb-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                                <h2 className="mb-4 text-lg font-semibold">Water Level Trend</h2>
                                <Chart data={historicalData} dataKey="distance" color="#10b981" />
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                                <h2 className="mb-4 text-lg font-semibold">pH Level Trend</h2>
                                <Chart data={historicalData} dataKey="ph" color="#3b82f6" />
                            </div>
                        </section>

                        <section className="grid gap-6 md:grid-cols-2">
                            <SystemStatus
                                deviceStatus={deviceStatus}
                                sensorData={sensorData}
                                lastUpdate={getTimeSinceUpdate()}
                            />
                            <AutomationRules />
                        </section>
                    </>
                )}

                {activeTab === "controls" && (
                    <ControlPanel
                        connected={connected}
                        manualMode={deviceStatus?.mode === "manual"}
                        sensorData={sensorData}
                        onServoControl={handleServoControl}
                        onPumpControl={handlePumpControl}
                    />
                )}
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    unit,
    status,
    statusColor,
    icon,
    trend,
}: {
    title: string;
    value: string;
    unit: string;
    status?: string;
    statusColor?: string;
    icon?: string;
    trend?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-xs text-white/60">{title}</h3>
                    <p className="mt-2 text-3xl font-bold">{value}</p>
                    <p className="text-sm text-white/50">{unit}</p>
                </div>
                {icon && <span className="text-2xl">{icon}</span>}
                {statusColor && <span className={cn("h-3 w-3 rounded-full", statusColor)} />}
            </div>
            {status && (
                <div className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                    {status}
                </div>
            )}
            {trend && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                    {trend === "rising" && <span className="text-green-400">↗ Rising</span>}
                    {trend === "falling" && <span className="text-red-400">↘ Falling</span>}
                    {trend === "stable" && <span className="text-gray-400">→ Stable</span>}
                </div>
            )}
        </div>
    );
}

function SystemStatus({
    deviceStatus,
    sensorData,
    lastUpdate,
}: {
    deviceStatus: DeviceStatus | null;
    sensorData: SensorData | null;
    lastUpdate: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">System Status</h2>
            <div className="space-y-3">
                <StatusRow label="Device Online" value={deviceStatus?.status === 1 ? "Yes" : "No"} />
                <StatusRow
                    label="Water Detected"
                    value={sensorData?.waterDetected === 1 ? "Yes" : "No"}
                />
                <StatusRow label="Servo 2 (No Water)" value={`${sensorData?.servo2 ?? "—"}°`} />
                <StatusRow label="Last Update" value={lastUpdate} />
                <StatusRow label="Mode" value={deviceStatus?.mode || "—"} />
            </div>
        </div>
    );
}

function AutomationRules() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">Automation Rules</h2>
            <div className="space-y-3 text-sm text-white/70">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    ✓ Distance ≥ 15cm → Servo OPEN (90°)
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    ✓ Distance &lt; 5cm → Servo CLOSE (0°) + Pump ON 2s
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    ✓ No Water Detected → Servo2 ON (90°)
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    ✓ Buzzer Alert: &lt;5cm (3kHz) / &lt;15cm (2kHz)
                </div>
            </div>
        </div>
    );
}

function ControlPanel({
    connected,
    manualMode,
    sensorData,
    onServoControl,
    onPumpControl,
}: {
    connected: boolean;
    manualMode: boolean;
    sensorData: SensorData | null;
    onServoControl: (angle: number) => void;
    onPumpControl: (state: number) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 text-lg font-semibold">Servo Main Control</h2>
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Current Position</span>
                        <span className="font-bold">{sensorData?.servo ?? "—"}°</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                            style={{ width: `${((sensorData?.servo ?? 0) / 180) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onServoControl(0)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-red-500/20 px-4 py-3 font-semibold text-red-300 hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        CLOSE (0°)
                    </button>
                    <button
                        onClick={() => onServoControl(45)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-yellow-500/20 px-4 py-3 font-semibold text-yellow-300 hover:bg-yellow-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        HALF (45°)
                    </button>
                    <button
                        onClick={() => onServoControl(90)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-green-500/20 px-4 py-3 font-semibold text-green-300 hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        OPEN (90°)
                    </button>
                </div>
                {!manualMode && (
                    <p className="mt-3 text-center text-xs text-amber-400">
                        Switch to MANUAL mode to control servo
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="mb-4 text-lg font-semibold">Water Pump Control</h2>
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Status</span>
                        <span className={cn("font-bold", sensorData?.pump ? "text-blue-400" : "text-gray-400")}>
                            {sensorData?.pump ? "RUNNING" : "IDLE"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onPumpControl(1)}
                    disabled={!manualMode || sensorData?.pump === 1 || !connected}
                    className="w-full rounded-lg bg-blue-500/20 px-4 py-3 font-semibold text-blue-300 hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ACTIVATE PUMP (2s)
                </button>
                {!manualMode && (
                    <p className="mt-3 text-center text-xs text-amber-400">
                        Switch to MANUAL mode to control pump
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="mb-1 font-semibold text-amber-400">Manual Mode Warning</h3>
                        <p className="text-sm text-white/70">
                            When in manual mode, automated water level control is disabled. Ensure you monitor the
                            system carefully to prevent overflow or pump damage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs text-white/60">{label}</span>
            <span className="text-sm font-semibold text-white/90">{value}</span>
        </div>
    );
}