"use client";

import { useEffect, useState } from "react";
import { database } from "../lib/firebase";
import { ref, onValue, set } from "firebase/database";

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

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sensorsRef = ref(database, "sensors");
    const deviceRef = ref(database, "device");

    const unsubscribeSensors = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
        setConnected(true);
      }
    });

    const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceStatus(data);
      }
    });

    return () => {
      unsubscribeSensors();
      unsubscribeDevice();
    };
  }, []);

  const handleModeToggle = async () => {
    const newMode = deviceStatus?.mode === "auto" ? "manual" : "auto";
    await set(ref(database, "device/mode"), newMode);
  };

  const handleServoControl = async (angle: number) => {
    await set(ref(database, "commands/servo"), angle);
  };

  const handlePumpControl = async (state: number) => {
    await set(ref(database, "commands/pump"), state);
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

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-[120px]" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-sky-500 blur-[140px]" />
        <div className="absolute -bottom-30 -left-30 h-80 w-80 rounded-full bg-fuchsia-500 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-400" : "bg-red-400")} />
              {connected ? "Connected" : "Disconnected"} • Realtime
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Terraflow Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Monitoring real-time ketinggian air, pH, dan kontrol sistem otomatis
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs text-white/60">Device Mode</div>
            <button
              onClick={handleModeToggle}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                deviceStatus?.mode === "auto"
                  ? "bg-emerald-500/90 text-slate-950 hover:bg-emerald-400"
                  : "bg-amber-500/90 text-slate-950 hover:bg-amber-400"
              )}
            >
              {deviceStatus?.mode === "auto" ? "AUTO MODE" : "MANUAL MODE"}
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs text-white/60">Water Level</h3>
                <p className="mt-2 text-3xl font-bold">{sensorData?.distance.toFixed(1) ?? "—"}</p>
                <p className="text-sm text-white/50">cm</p>
              </div>
              <span className={cn("h-3 w-3 rounded-full", waterStatus.color)} />
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              {waterStatus.label}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs text-white/60">pH Level</h3>
                <p className="mt-2 text-3xl font-bold">{sensorData?.ph.toFixed(2) ?? "—"}</p>
                <p className="text-sm text-white/50">{sensorData?.phVolt.toFixed(3) ?? "—"}V</p>
              </div>
              <span className={cn("h-3 w-3 rounded-full", phStatus.color)} />
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              {phStatus.label}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h3 className="text-xs text-white/60">Servo Main</h3>
            <p className="mt-2 text-3xl font-bold">{sensorData?.servo ?? "—"}°</p>
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleServoControl(0)}
                  disabled={deviceStatus?.mode === "auto"}
                  className="flex-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CLOSE
                </button>
                <button
                  onClick={() => handleServoControl(90)}
                  disabled={deviceStatus?.mode === "auto"}
                  className="flex-1 rounded-lg bg-green-500/20 px-3 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  OPEN
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h3 className="text-xs text-white/60">Water Pump</h3>
            <p className="mt-2 text-3xl font-bold">{sensorData?.pump ? "ON" : "OFF"}</p>
            <div className="mt-4">
              <button
                onClick={() => handlePumpControl(1)}
                disabled={deviceStatus?.mode === "auto" || sensorData?.pump === 1}
                className="w-full rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ACTIVATE 2s
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h2 className="text-sm font-medium text-white/80">System Status</h2>
            <div className="mt-4 space-y-3">
              <StatusRow label="Device Online" value={deviceStatus?.status === 1 ? "Yes" : "No"} />
              <StatusRow label="Water Detected" value={sensorData?.waterDetected === 1 ? "Yes" : "No"} />
              <StatusRow label="Servo 2 (No Water)" value={`${sensorData?.servo2 ?? "—"}°`} />
              <StatusRow label="Last Update" value={sensorData?.timestamp ? `${((Date.now() - sensorData.timestamp) / 1000).toFixed(0)}s ago` : "—"} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h2 className="text-sm font-medium text-white/80">Automation Rules</h2>
            <div className="mt-4 space-y-3 text-xs text-white/70">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                Distance ≥ 15cm → Servo OPEN (90°)
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                Distance &lt; 5cm → Servo CLOSE (0°) + Pump ON 2s
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                No Water Detected → Servo2 ON (90°)
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/45">
          © {new Date().getFullYear()} Terraflow • Real-time IoT Monitoring
        </footer>
      </div>
    </main>
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