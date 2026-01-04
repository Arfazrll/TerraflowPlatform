"use client";

import Link from "next/link";
import * as React from "react";
import { Droplets, Gauge, BarChart3, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import WaterParticles from "../components/WaterParticles";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <WaterParticles />
      {/* Navbar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px] opacity-50" />
            <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px] opacity-50" />
          </div>

          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Real Time Monitoring</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Smart Water Management <br /> for the Future
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
              Monitor water levels, pH quality, and control pumps automatically with our
              IoT-powered dashboard. Real-time data for smarter decisions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/dashboard"
                className="flex items-center justify-center rounded-xl bg-primary px-12 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 min-w-[240px]"
              >
                Dashboard
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-card/50 p-2 shadow-2xl backdrop-blur-xl">
              <div className="rounded-xl overflow-hidden bg-background border border-border aspect-video relative group">
                <img
                  src="/dashboardPreview.png"
                  alt="Terraflow Dashboard Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <p className="text-foreground font-medium bg-background/80 px-4 py-2 rounded-full backdrop-blur-md border border-border">Interactive Real-time Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage your water systems efficiently and effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Gauge className="h-6 w-6" />}
                title="Real-time Monitoring"
                description="Track water levels and pH values instantly with live updates from ESP32 sensors."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Automated Control"
                description="Smart logic automatically manages pumps and servos based on sensor thresholds."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Data Analytics"
                description="Visualize historical trends and get insights to optimize your water usage."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
                <div className="space-y-6">
                  <StepItem number="1" title="Sensors Collect Data" description="Ultrasonic and pH sensors continuously monitor the water tank state." />
                  <StepItem number="2" title="ESP32 Processing" description="The microcontroller processes data and sends it to Firebase in real-time." />
                  <StepItem number="3" title="Visual Dashboard" description="You view live stats and control devices directly from this web app." />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative rounded-2xl border border-border bg-card p-12 shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Droplets className="h-64 w-64 rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border">
                      <Gauge className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-bold">Sensor Node</h4>
                        <p className="text-xs text-muted-foreground">Active • Sending Data</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border">
                      <Zap className="h-8 w-8 text-yellow-500" />
                      <div>
                        <h4 className="font-bold">Cloud Database</h4>
                        <p className="text-xs text-muted-foreground">Firebase Realtime DB</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-bold">Web Dashboard</h4>
                        <p className="text-xs text-muted-foreground">User Interface</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold">Terraflow</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Advanced water management solutions for home and industry.
                Built with passion for efficiency and sustainability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                <li><Link href="/analytics" className="hover:text-primary">Analytics</Link></li>
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/developers" className="hover:text-primary">Developers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">GitHub</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="mailto:contact@terraflow.id" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-6 mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2025 Terraflow. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}