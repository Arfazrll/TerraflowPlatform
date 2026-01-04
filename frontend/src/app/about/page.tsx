"use client";

import Link from "next/link";
import Image from "next/image";
import { Droplets, Rocket, Database, Cpu, Palette, ExternalLink } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-16 pt-32">
                {/* Hero Section */}
                <section className="text-center mb-24 relative">
                    <div className="pointer-events-none absolute inset-0 opacity-30 flex justify-center dark:opacity-20">
                        <div className="h-96 w-96 rounded-full bg-primary/20 blur-[100px]"></div>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold mb-6 tracking-tight">Innovating Water Management</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Terraflow provides intelligent solutions for real-time water monitoring and automated control systems.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 mb-24 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Our goal is to revolutionize how water systems are monitored and managed. By leveraging the power of IoT and real-time data analytics, we empower users to maintain optimal water levels, ensure quality through pH monitoring, and automate specific tasks to prevent critical failures like overflows or pump dry-running.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-border bg-card">
                                <h3 className="text-2xl font-bold mb-1">99.9%</h3>
                                <p className="text-sm text-muted-foreground">System Uptime</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border bg-card">
                                <h3 className="text-2xl font-bold mb-1">24/7</h3>
                                <p className="text-sm text-muted-foreground">Monitoring</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-80 rounded-2xl border border-border overflow-hidden group shadow-xl">
                        <Image
                            src="/agriculture.jpg"
                            alt="Smart Agriculture"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                            <Rocket className="h-8 w-8 mb-2 text-primary" />
                            <p className="text-lg font-semibold">Future-Ready Agriculture</p>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Built With Modern Tech</h2>
                        <p className="text-muted-foreground">Powered by the latest technologies for reliability and speed.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <TechCard name="Next.js" icon={<Cpu className="h-8 w-8" />} description="High-performance React Framework" />
                        <TechCard name="Firebase" icon={<Database className="h-8 w-8" />} description="Real-time Database" />
                        <TechCard name="ESP32" icon={<Cpu className="h-8 w-8" />} description="Powerful IoT Microcontroller" />
                        <TechCard name="Backend Golang" icon={<Database className="h-8 w-8 text-blue-400" />} description="Robust and efficient server-side processing." />
                    </div>
                </section>

                {/* Team/Contact Section */}
                <section className="rounded-2xl bg-primary/5 border border-primary/10 p-12 text-center">
                    <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Have questions about the system or want to collaborate? We'd love to hear from you.
                    </p>
                    <a
                        href="mailto:contact@terraflow.id"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Contact Us <ExternalLink className="h-4 w-4" />
                    </a>
                </section>
            </main>

            <footer className="border-t border-border py-12 text-center text-muted-foreground text-sm bg-muted/30">
                <p>© 2025 Terraflow. All rights reserved.</p>
            </footer>
        </div>
    );
}

function TechCard({ name, icon, description }: { name: string; icon: React.ReactNode; description: string }) {
    return (
        <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-center group">
            <div className="mb-4 text-muted-foreground group-hover:text-primary transition-colors flex justify-center">{icon}</div>
            <h3 className="font-bold text-lg mb-2">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
