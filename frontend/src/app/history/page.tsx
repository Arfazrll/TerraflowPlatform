"use client";

import { useEffect, useState } from "react";
import { database } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";
import DashboardLayout from "../../components/DashboardLayout";
import {
    AlertTriangle, FileText, Download, ChevronDown, AlertCircle,
    Activity, Droplets, Zap, CheckCircle2, Waves
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type SensorData = {
    distance: number;
    ph: number;
    phVolt: number;
    timestamp: number;
};

type EventLog = {
    id: string;
    type: "CRITICAL" | "WARNING" | "INFO";
    title: string;
    message: string;
    timestamp: number;
    value?: string;
    category?: "WATER" | "PH" | "SYSTEM"; // Augmented for internal filtering
};

export default function HistoryPage() {
    const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [visibleEvents, setVisibleEvents] = useState(20);
    const [isSimulated, setIsSimulated] = useState(false);

    useEffect(() => {
        const sensorsRef = ref(database, "sensors");

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHistoricalData((prev) => {
                    const newData = [...prev, { ...data, timestamp: Date.now() }];
                    return newData.slice(-500);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (historicalData.length < 1) return;

        const lastPoint = historicalData[historicalData.length - 1];
        if (!lastPoint || typeof lastPoint.distance === 'undefined') return;

        const now = lastPoint.timestamp;
        const newEventBatch: EventLog[] = [];

        // --- Logic (Preserved & Categorized) ---

        // Water Level Logic
        if (lastPoint.distance < 5) {
            newEventBatch.push({
                id: `crit-d-${now}`,
                type: "CRITICAL",
                title: "Critical Water Level",
                message: `Level dropped to ${lastPoint.distance.toFixed(1)}cm. Pump activated.`,
                timestamp: now,
                value: `${lastPoint.distance.toFixed(1)} cm`,
                category: "WATER"
            });
        } else if (lastPoint.distance < 15) {
            newEventBatch.push({
                id: `warn-d-${now}`,
                type: "WARNING",
                title: "Low Water Level",
                message: `Water level at ${lastPoint.distance.toFixed(1)}cm (Below Goal).`,
                timestamp: now,
                value: `${lastPoint.distance.toFixed(1)} cm`,
                category: "WATER"
            });
        }

        // pH Logic
        if (lastPoint.ph < 5) {
            newEventBatch.push({
                id: `warn-ph-acid-${now}`,
                type: "WARNING",
                title: "High Acidity",
                message: `pH detected at ${lastPoint.ph.toFixed(2)} (Too Acidic).`,
                timestamp: now,
                value: `${lastPoint.ph.toFixed(2)} pH`,
                category: "PH"
            });
        } else if (lastPoint.ph > 8) {
            newEventBatch.push({
                id: `warn-ph-alk-${now}`,
                type: "WARNING",
                title: "High Alkalinity",
                message: `pH detected at ${lastPoint.ph.toFixed(2)} (Too Alkaline).`,
                timestamp: now,
                value: `${lastPoint.ph.toFixed(2)} pH`,
                category: "PH"
            });
        }

        // System Online
        if (events.length === 0 && !isSimulated) {
            newEventBatch.push({
                id: `info-sys-${now}`,
                type: "INFO",
                title: "System Online",
                message: "ESP32 Sensor Stream Connected.",
                timestamp: now,
                value: "Active",
                category: "SYSTEM"
            });
        }

        setEvents(prev => {
            const realLogs = isSimulated ? [] : prev;
            if (isSimulated) setIsSimulated(false);
            const combined = [...newEventBatch, ...realLogs];
            const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique.sort((a, b) => b.timestamp - a.timestamp);
        });

    }, [historicalData, isSimulated, events.length]);

    // Mock Data (Categorized)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (events.length === 0 && historicalData.length === 0) {
                setIsSimulated(true);
                setEvents([
                    {
                        id: 'sim-1',
                        type: 'CRITICAL',
                        title: 'Critical Water Level',
                        message: 'Level dropped below safe threshold to 3.2cm.',
                        timestamp: Date.now() - 120000,
                        value: '3.2 cm',
                        category: "WATER"
                    },
                    {
                        id: 'sim-2',
                        type: 'WARNING',
                        title: 'High Acidity',
                        message: 'Acidity spike detected during cycle.',
                        timestamp: Date.now() - 360000,
                        value: '6.2 pH',
                        category: "PH"
                    },
                    {
                        id: 'sim-3',
                        type: 'INFO',
                        title: 'Servo Valve Open',
                        message: 'Automatic regulation: Valve opened 90°.',
                        timestamp: Date.now() - 86400000,
                        value: '90°',
                        category: "SYSTEM"
                    },
                    {
                        id: 'sim-4',
                        type: 'INFO',
                        title: 'System Online',
                        message: 'Manual control takeover by user.',
                        timestamp: Date.now() - 90000000,
                        value: 'Manual',
                        category: "SYSTEM"
                    }
                ]);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [events.length, historicalData.length]);


    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("System Event History", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 28);
        doc.line(14, 32, 196, 32);

        const tableBody = events.map(e => [
            new Date(e.timestamp).toLocaleString(),
            e.type,
            e.category || 'GENERAL',
            e.title,
            e.message
        ]);

        autoTable(doc, {
            head: [['Time', 'Type', 'Category', 'Event', 'Details']],
            body: tableBody,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [6, 78, 59] },
        });

        doc.save("terraflow_history_export.pdf");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(events.map(e => ({
            Timestamp: new Date(e.timestamp).toLocaleString(),
            Severity: e.type,
            Category: e.category,
            Event: e.title,
            Details: e.message,
            Value: e.value || '-'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "System Logs");
        XLSX.writeFile(workbook, "terraflow_history_export.xlsx");
    };

    // Splitting Logic
    const phEvents = events.filter(e => e.category === "PH" || e.title.toLowerCase().includes("ph"));
    const waterEvents = events.filter(e => e.category === "WATER" || e.title.toLowerCase().includes("water"));
    const systemEvents = events.filter(e => e.category === "SYSTEM" || (!e.category && !e.title.toLowerCase().includes("ph") && !e.title.toLowerCase().includes("water")));

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
                {/* Header Section */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Activity className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">Event History</h1>
                        </div>
                        <p className="text-muted-foreground max-w-lg leading-relaxed">
                            Dual-stream monitoring log. pH and Water Level events are segregated for clarity.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted text-foreground rounded-lg text-sm font-medium border border-border transition-colors"
                        >
                            <FileText className="w-4 h-4 text-red-500" /> Export PDF
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </header>

                {/* System Status Ticker (If any system events) */}
                {systemEvents.length > 0 && (
                    <div className="mb-8 p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-sm flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">System Status</h3>
                                <p className="text-xs text-muted-foreground">Latest: {systemEvents[0].message}</p>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{new Date(systemEvents[0].timestamp).toLocaleTimeString()}</span>
                    </div>
                )}

                {/* Dual Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: pH History */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-500/20">
                            <Zap className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-bold text-foreground">pH Monitoring</h2>
                            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                                {phEvents.length} Events
                            </span>
                        </div>

                        {phEvents.length === 0 ? (
                            <EmptyState message="No pH anomalies detected." />
                        ) : (
                            phEvents.slice(0, visibleEvents).map((event) => (
                                <CompactEventCard key={event.id} event={event} category="PH" />
                            ))
                        )}
                    </div>

                    {/* Right Column: Water Level History */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyan-500/20">
                            <Waves className="w-5 h-5 text-cyan-500" />
                            <h2 className="text-lg font-bold text-foreground">Water Level</h2>
                            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500">
                                {waterEvents.length} Events
                            </span>
                        </div>

                        {waterEvents.length === 0 ? (
                            <EmptyState message="No water level alerts." />
                        ) : (
                            waterEvents.slice(0, visibleEvents).map((event) => (
                                <CompactEventCard key={event.id} event={event} category="WATER" />
                            ))
                        )}
                    </div>

                </div>

                {(phEvents.length > visibleEvents || waterEvents.length > visibleEvents) && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setVisibleEvents(prev => prev + 10)}
                            className="flex items-center gap-2 px-6 py-2 bg-card hover:bg-muted border border-border rounded-full shadow-sm text-sm font-medium transition-colors"
                        >
                            Load More <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-12 border-2 border-dashed border-muted rounded-xl bg-card/30 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">{message}</p>
        </div>
    );
}

function CompactEventCard({ event, category }: { event: EventLog, category: "PH" | "WATER" }) {
    const isCritical = event.type === 'CRITICAL';
    const isWarning = event.type === 'WARNING';

    // Theme Colors
    const isPh = category === "PH";

    // Base Colors (Dynamic based on Category + Severity)
    let borderColor = isPh ? "border-purple-500/30" : "border-cyan-500/30";
    let bgHover = isPh ? "hover:bg-purple-500/5 hover:border-purple-500/50" : "hover:bg-cyan-500/5 hover:border-cyan-500/50";
    let iconColor = isPh ? "text-purple-500" : "text-cyan-500";
    let Icon = isPh ? Zap : Droplets;

    // Severity Overrides
    if (isCritical) {
        borderColor = "border-red-500/50";
        bgHover = "hover:bg-red-500/5 hover:border-red-500/60";
        iconColor = "text-red-500";
        Icon = AlertTriangle;
    } else if (isWarning) {
        borderColor = "border-amber-500/50";
        bgHover = "hover:bg-amber-500/5 hover:border-amber-500/60";
        iconColor = "text-amber-500";
        Icon = AlertCircle;
    }

    return (
        <div className={`p-4 rounded-xl bg-card border ${borderColor} ${bgHover} transition-all duration-300 shadow-sm group`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md bg-background border border-border/50 ${iconColor} bg-opacity-10`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                {/* Value Badge */}
                {event.value && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-background ${isCritical ? 'text-red-500 border-red-500/20' : isWarning ? 'text-amber-500 border-amber-500/20' : 'text-muted-foreground border-border'}`}>
                        {event.value}
                    </span>
                )}
            </div>

            <h4 className={`text-sm font-bold mb-1 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                {event.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
                {event.message}
            </p>
        </div>
    );
}