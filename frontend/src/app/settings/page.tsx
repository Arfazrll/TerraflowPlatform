"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        criticalThreshold: 5,
        warningThreshold: 15,
        pumpDuration: 2,
        samplingRate: 2,
        enableNotifications: true,
        enableBuzzer: true,
    });

    const handleSave = () => {
        alert("Settings saved! (Demo mode)");
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-4xl px-6 py-10">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Konfigurasi threshold, interval, dan preferensi sistem
                    </p>
                </header>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Water Level Thresholds</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Critical Level (cm)
                                </label>
                                <input
                                    type="number"
                                    value={settings.criticalThreshold}
                                    onChange={(e) =>
                                        setSettings({ ...settings, criticalThreshold: Number(e.target.value) })
                                    }
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Warning Level (cm)
                                </label>
                                <input
                                    type="number"
                                    value={settings.warningThreshold}
                                    onChange={(e) =>
                                        setSettings({ ...settings, warningThreshold: Number(e.target.value) })
                                    }
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Pump Configuration</h2>
                        <div>
                            <label className="mb-2 block text-sm text-muted-foreground">
                                Pump Duration (seconds)
                            </label>
                            <input
                                type="number"
                                value={settings.pumpDuration}
                                onChange={(e) =>
                                    setSettings({ ...settings, pumpDuration: Number(e.target.value) })
                                }
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Sampling Rate</h2>
                        <div>
                            <label className="mb-2 block text-sm text-muted-foreground">
                                Interval (seconds)
                            </label>
                            <input
                                type="number"
                                value={settings.samplingRate}
                                onChange={(e) =>
                                    setSettings({ ...settings, samplingRate: Number(e.target.value) })
                                }
                                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Notifications</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer hover:opacity-80">
                                <span className="text-sm text-foreground">Enable Web Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableNotifications}
                                    onChange={(e) =>
                                        setSettings({ ...settings, enableNotifications: e.target.checked })
                                    }
                                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-2 focus:ring-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer hover:opacity-80">
                                <span className="text-sm text-foreground">Enable Buzzer Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableBuzzer}
                                    onChange={(e) =>
                                        setSettings({ ...settings, enableBuzzer: e.target.checked })
                                    }
                                    className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-2 focus:ring-primary"
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}