"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="text-xl font-bold">Terraflow</span>
          </div>
          <div className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm hover:text-emerald-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm hover:text-emerald-400 transition">
              How It Works
            </a>
            <a href="#pricing" className="text-sm hover:text-emerald-400 transition">
              Pricing
            </a>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:shadow-lg hover:shadow-emerald-500/50 transition"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      <section className="relative px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500 blur-[150px]" />
          <div className="absolute top-60 right-0 h-96 w-96 rounded-full bg-cyan-500 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Real-time IoT Monitoring System
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Smart Water Level
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Monitor dan kontrol sistem ketinggian air secara real-time dengan teknologi IoT
            ESP32. Dilengkapi sensor pH, kontrol servo otomatis, dan analytics dashboard.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-slate-950 hover:shadow-xl hover:shadow-emerald-500/50 transition"
            >
              Launch Dashboard
            </Link>

            <a
              href="#how-it-works"
              className="rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </div>

          <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur">
            <img
              src="/api/placeholder/1200/600"
              alt="Dashboard Preview"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Fitur Unggulan</h2>
            <p className="text-slate-400">
              Platform IoT monitoring dengan fitur advanced yang jarang ditemukan
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Visualisasi data real-time dengan chart interaktif dan historical data analysis"
            />
            <FeatureCard
              icon="🤖"
              title="AI Predictions"
              description="Prediksi level air menggunakan machine learning untuk antisipasi overflow"
            />
            <FeatureCard
              icon="⚡"
              title="Instant Alerts"
              description="Notifikasi real-time via buzzer dan web notifications untuk kondisi kritis"
            />
            <FeatureCard
              icon="🎛️"
              title="Manual Override"
              description="Kontrol manual servo dan pump dari dashboard untuk testing dan maintenance"
            />
            <FeatureCard
              icon="📱"
              title="Mobile Responsive"
              description="Dashboard yang fully responsive, akses dari smartphone, tablet, atau desktop"
            />
            <FeatureCard
              icon="💾"
              title="Data Export"
              description="Export historical data dalam format CSV, JSON, atau PDF untuk reporting"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20 bg-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">Cara Kerja</h2>
            <p className="text-slate-400">
              Sistem monitoring air otomatis dengan IoT ESP32
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <StepCard
              number="1"
              title="Sensor Reading"
              description="ESP32 membaca data dari ultrasonic sensor (level air) dan pH sensor setiap 2 detik"
            />
            <StepCard
              number="2"
              title="Data Processing"
              description="Data diproses dan dikirim ke Firebase Realtime Database via HTTP"
            />
            <StepCard
              number="3"
              title="Automation"
              description="Servo motor membuka/tutup valve dan pump aktif otomatis berdasarkan threshold"
            />
            <StepCard
              number="4"
              title="Visualization"
              description="Dashboard menampilkan data real-time dengan chart dan analytics"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Monitor?</h2>
          <p className="mb-10 text-lg text-slate-400">
            Mulai monitoring sistem air Anda sekarang dengan dashboard real-time
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-4 text-lg font-semibold text-slate-950 hover:shadow-xl hover:shadow-emerald-500/50 transition"
          >
            Open Dashboard Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
          <p>© 2025 Terraflow. Built with ESP32, Next.js, and Firebase.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-xl font-bold text-slate-950">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}