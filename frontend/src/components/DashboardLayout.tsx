"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-muted/20">
                {children}
            </main>
        </div>
    );
}
