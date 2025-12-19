"use client";

import { useEffect, useMemo, useState } from "react";

type HealthResponse = {
  status?: string;
  app?: string;
  time?: string;
  version?: string;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function Home() {
  const [msg, setMsg] = useState("Menghubungkan ke backend...");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const statusMeta = useMemo(() => {
    const s = (health?.status || "").toLowerCase();
    if (!health) return { label: "UNKNOWN", badge: "bg-gray-100 text-gray-700 border-gray-200" };

    if (s.includes("ok") || s.includes("healthy") || s.includes("up")) {
      return { label: "HEALTHY", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (s.includes("warn") || s.includes("degrad")) {
      return { label: "DEGRADED", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: "DOWN", badge: "bg-rose-50 text-rose-700 border-rose-200" };
  }, [health]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!apiBase) {
          throw new Error("NEXT_PUBLIC_API_URL belum diset");
        }
        const r = await fetch(`${apiBase}/health`, { cache: "no-store" });
        const d: HealthResponse = await r.json();

        if (cancelled) return;

        setHealth(d);
        setMsg(`Backend: ${d.status ?? "unknown"} (${d.app ?? "app"})`);
      } catch {
        if (cancelled) return;
        setHealth(null);
        setMsg("Backend: ERROR (cek backend running & NEXT_PUBLIC_API_URL)");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top glow */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500 blur-[120px]" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-sky-500 blur-[140px]" />
        <div className="absolute -bottom-30 -left-30 h-80 w-80 rounded-full bg-fuchsia-500 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Realtime Monitoring • Single Device
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Terraflow Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Pantau ketinggian air (ultrasonic), pH air, kontrol servo, dan pompa pupuk — dengan update realtime.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="text-xs text-white/60">API Base</div>
            <div className="max-w-105 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85">
              {apiBase ?? "BELUM DISET (NEXT_PUBLIC_API_URL)"}
            </div>
          </div>
        </header>

        {/* Cards */}
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Health Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-white/80">Backend Health</h2>
                <p className="mt-1 text-xs text-white/60">Status koneksi layanan backend</p>
              </div>

              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                  statusMeta.badge
                )}
              >
                {loading ? "CHECKING..." : statusMeta.label}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm">{msg}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/65">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-white/50">App</div>
                  <div className="mt-1 font-medium text-white/85">{health?.app ?? "-"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-white/50">Version</div>
                  <div className="mt-1 font-medium text-white/85">{health?.version ?? "-"}</div>
                </div>
                <div className="col-span-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-white/50">Server Time</div>
                  <div className="mt-1 font-medium text-white/85">{health?.time ?? "-"}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                Refresh
              </button>

              <a
                href={apiBase ? `${apiBase}/health` : "#"}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition",
                  !apiBase && "pointer-events-none opacity-50"
                )}
              >
                Open /health
              </a>
            </div>
          </div>

          {/* Placeholder Sensors */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h2 className="text-sm font-medium text-white/80">Sensors</h2>
            <p className="mt-1 text-xs text-white/60">Preview tampilan sensor (dummy)</p>

            <div className="mt-5 space-y-4">
              <MetricCard title="Ketinggian Air" value="— cm" hint="Ultrasonic" />
              <MetricCard title="pH Air" value="—" hint="pH Sensor" />
            </div>

            <div className="mt-5 text-xs text-white/55">
              Nanti nilai ini bisa kamu isi dari WebSocket realtime.
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
            <h2 className="text-sm font-medium text-white/80">Controls</h2>
            <p className="mt-1 text-xs text-white/60">Tombol kontrol (dummy)</p>

            <div className="mt-5 grid gap-3">
              <ActionButton title="Buka Servo" desc="Mulai isi air otomatis" />
              <ActionButton title="Stop Servo" desc="Hentikan pengisian air" />
              <ActionButton title="Pompa Pupuk" desc="Keluarkan pupuk sesuai durasi" />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/65">
              Tips: Saat backend ready, tombol ini tinggal panggil endpoint:
              <span className="ml-2 rounded bg-white/10 px-2 py-0.5">POST /actuators</span>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/45">
          © {new Date().getFullYear()} Terraflow • Next.js Dashboard
        </footer>
      </div>
    </main>
  );
}

function MetricCard(props: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-white/55">{props.title}</div>
          <div className="mt-1 text-xl font-semibold">{props.value}</div>
        </div>
        {props.hint ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            {props.hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActionButton(props: { title: string; desc: string }) {
  return (
    <button className="group rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/90">{props.title}</div>
          <div className="mt-1 text-xs text-white/60">{props.desc}</div>
        </div>
        <span className="text-white/50 group-hover:text-white/80 transition">→</span>
      </div>
    </button>
  );
}
