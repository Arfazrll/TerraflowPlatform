"use client";

import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref, onValue, set } from "firebase/database";
import Link from "next/link";
import Chart from "../../components/Chart";
import DashboardLayout from "../../components/DashboardLayout";

type SensorData = {
    distance: number;
    ph: number;
    phVolt: number;
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

    const handleServo2Control = async (angle: number) => {
        try {
            await set(ref(database, "commands/servo2"), angle);
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
        if (!sensorData) return { label: "N/A", color: "bg-muted" };
        if (sensorData.distance < 5) return { label: "CRITICAL", color: "bg-destructive" };
        if (sensorData.distance < 15) return { label: "LOW", color: "bg-yellow-500" };
        return { label: "NORMAL", color: "bg-primary" };
    };

    const getPhStatus = () => {
        if (!sensorData) return { label: "N/A", color: "bg-muted" };
        if (sensorData.ph < 6.5) return { label: "ACIDIC", color: "bg-orange-500" };
        if (sensorData.ph > 7.5) return { label: "ALKALINE", color: "bg-blue-500" };
        return { label: "NEUTRAL", color: "bg-primary" };
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
        <DashboardLayout>
            <div className="mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        connected ? "bg-primary animate-pulse" : "bg-destructive"
                                    )}
                                />
                                {connected ? "Connected" : "Disconnected"}
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Real-time monitoring sistem ketinggian air dan pH
                            </p>
                        </div>
                        <button
                            onClick={handleModeToggle}
                            disabled={!connected}
                            className={cn(
                                "rounded-lg px-6 py-3 text-sm font-semibold transition shadow-sm",
                                deviceStatus?.mode === "auto"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-yellow-500 text-white hover:bg-yellow-600",
                                !connected && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {deviceStatus?.mode === "auto" ? "AUTO MODE" : "MANUAL MODE"}
                        </button>
                    </div>
                </header>

                <div className="mb-6 flex gap-4 border-b border-border">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={cn(
                            "border-b-2 px-4 py-2 text-sm font-medium transition",
                            activeTab === "overview"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("controls")}
                        className={cn(
                            "border-b-2 px-4 py-2 text-sm font-medium transition",
                            activeTab === "controls"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
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
                                value={`${sensorData?.servo2 ?? "—"}°`}
                                unit={sensorData?.servo2 === 90 ? "OPEN" : "CLOSE"}
                            />
                            <MetricCard
                                title="Water Pump"
                                value={sensorData?.pump ? "ON" : "OFF"}
                                unit={sensorData?.pump ? "ACTIVE" : "IDLE"}
                                statusColor={sensorData?.pump ? "bg-blue-500" : "bg-muted"}
                            />
                        </section>

                        <section className="mb-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">Water Level Trend</h2>
                                <Chart data={historicalData} dataKey="distance" color="#10b981" />
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-foreground">pH Level Trend</h2>
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
                        onServo2Control={handleServo2Control}
                        onPumpControl={handlePumpControl}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}

function MetricCard({
    title,
    value,
    unit,
    status,
    statusColor,
    trend,
}: {
    title: string;
    value: string;
    unit: string;
    status?: string;
    statusColor?: string;
    trend?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-xs text-muted-foreground uppercase">{title}</h3>
                    <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground">{unit}</p>
                </div>
                {statusColor && <span className={cn("h-3 w-3 rounded-full", statusColor)} />}
            </div>
            {status && (
                <div className="mt-4 inline-block rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                    {status}
                </div>
            )}
            {trend && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                    {trend === "rising" && <span className="text-red-500">Rising</span>}
                    {trend === "falling" && <span className="text-green-500">Falling</span>}
                    {trend === "stable" && <span className="text-muted-foreground">Stable</span>}
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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">System Status</h2>
            <div className="space-y-3">
                <StatusRow label="Device Online" value={deviceStatus?.status === 1 ? "Yes" : "No"} />
                <StatusRow
                    label="Water Detected"
                    value={sensorData?.waterDetected === 1 ? "Yes" : "No"}
                />
                <StatusRow label="Servo Position" value={`${sensorData?.servo2 ?? "—"}°`} />
                <StatusRow label="Last Update" value={lastUpdate} />
                <StatusRow label="Mode" value={deviceStatus?.mode || "—"} />
            </div>
        </div>
    );
}

function AutomationRules() {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Automation Rules</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                    Distance &gt;= 15cm - Servo OPEN (90 degrees)
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                    Distance &lt; 5cm - Servo CLOSE (0 degrees) + Pump ON 2s
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                    Buzzer Alert: &lt;5cm (Danger) / &lt;15cm (Warning)
                </div>
            </div>
        </div>
    );
}

function ControlPanel({
    connected,
    manualMode,
    sensorData,
    onServo2Control,
    onPumpControl,
}: {
    connected: boolean;
    manualMode: boolean;
    sensorData: SensorData | null;
    onServo2Control: (angle: number) => void;
    onPumpControl: (state: number) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Servo Control</h2>
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Position</span>
                        <span className="font-bold text-foreground">{sensorData?.servo2 ?? "—"} degrees</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${((sensorData?.servo2 ?? 0) / 180) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onServo2Control(0)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-red-500/10 px-4 py-3 font-semibold text-red-500 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20"
                    >
                        CLOSE (0)
                    </button>
                    <button
                        onClick={() => onServo2Control(45)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-yellow-500/10 px-4 py-3 font-semibold text-yellow-500 hover:bg-yellow-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-500/20"
                    >
                        HALF (45)
                    </button>
                    <button
                        onClick={() => onServo2Control(90)}
                        disabled={!manualMode || !connected}
                        className="rounded-lg bg-green-500/10 px-4 py-3 font-semibold text-green-500 hover:bg-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/20"
                    >
                        OPEN (90)
                    </button>
                </div>
                {!manualMode && (
                    <p className="mt-3 text-center text-xs text-yellow-500">
                        Switch to MANUAL mode to control servo
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Water Pump Control</h2>
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className={cn("font-bold", sensorData?.pump ? "text-blue-500" : "text-muted-foreground")}>
                            {sensorData?.pump ? "RUNNING" : "IDLE"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onPumpControl(1)}
                    disabled={!manualMode || sensorData?.pump === 1 || !connected}
                    className="w-full rounded-lg bg-blue-500/10 px-4 py-3 font-semibold text-blue-500 hover:bg-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/20"
                >
                    ACTIVATE PUMP (2s)
                </button>
                {!manualMode && (
                    <p className="mt-3 text-center text-xs text-yellow-500">
                        Switch to MANUAL mode to control pump
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                    <span className="text-2xl text-yellow-500">!</span>
                    <div>
                        <h3 className="mb-1 font-semibold text-yellow-600 dark:text-yellow-500">Manual Mode Warning</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
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
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    );
}