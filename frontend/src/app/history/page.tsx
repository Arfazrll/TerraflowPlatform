"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { AlertCircle, AlertTriangle, Info, Download } from "lucide-react";

type HistoryRecord = {
    id: string;
    timestamp: Date;
    event: string;
    details: string;
    type: "info" | "warning" | "critical";
};

export default function HistoryPage() {
    const [records] = useState<HistoryRecord[]>([
        {
            id: "1",
            timestamp: new Date(Date.now() - 300000),
            event: "Water Level Critical",
            details: "Level dropped to 3.2cm, pump activated for 2s",
            type: "critical",
        },
        {
            id: "2",
            timestamp: new Date(Date.now() - 600000),
            event: "pH Level Acidic",
            details: "pH detected at 6.2, below normal range",
            type: "warning",
        },
        {
            id: "3",
            timestamp: new Date(Date.now() - 900000),
            event: "Servo Opened",
            details: "Water level reached 16cm, servo opened to 90°",
            type: "info",
        },
        {
            id: "4",
            timestamp: new Date(Date.now() - 1200000),
            event: "Manual Mode Activated",
            details: "User switched system to manual control",
            type: "info",
        },
        {
            id: "5",
            timestamp: new Date(Date.now() - 1500000),
            event: "System Online",
            details: "ESP32 device connected successfully",
            type: "info",
        },
    ]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "critical":
                return "border-destructive/30 bg-destructive/10";
            case "warning":
                return "border-yellow-500/30 bg-yellow-500/10";
            default:
                return "border-blue-500/30 bg-blue-500/10";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "critical":
                return <AlertTriangle className="h-6 w-6 text-destructive" />;
            case "warning":
                return <AlertCircle className="h-6 w-6 text-yellow-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const exportData = () => {
        const csv = [
            ["Timestamp", "Event", "Details", "Type"],
            ...records.map((r) => [
                r.timestamp.toISOString(),
                r.event,
                r.details,
                r.type,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `terraflow-history-${Date.now()}.csv`;
        a.click();
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Event History</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Riwayat event dan aktivitas sistem
                        </p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 rounded-lg bg-primary/10 px-6 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </header>

                <div className="space-y-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className={`rounded-2xl border p-6 shadow-sm ${getTypeColor(record.type)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <span className="mt-1">{getTypeIcon(record.type)}</span>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{record.event}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{record.details}</p>
                                        <p className="mt-2 text-xs text-muted-foreground/70">
                                            {record.timestamp.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${record.type === "critical"
                                            ? "bg-destructive/10 text-destructive"
                                            : record.type === "warning"
                                                ? "bg-yellow-500/10 text-yellow-500"
                                                : "bg-blue-500/10 text-blue-500"
                                        }`}
                                >
                                    {record.type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}