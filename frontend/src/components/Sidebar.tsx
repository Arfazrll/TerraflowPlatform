"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LineChart, History, Settings, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/analytics", icon: LineChart },
        { name: "History", href: "/history", icon: History },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside
            className={`relative flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="flex items-center justify-between p-4">
                <Link href="/" className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="h-8 w-8 min-w-[32px] rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white">
                        <Droplets className="h-5 w-5" />
                    </div>
                    {!isCollapsed && <span className="text-xl font-bold whitespace-nowrap">Terraflow</span>}
                </Link>
            </div>

            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <nav className="flex-1 space-y-2 p-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                } ${isCollapsed ? "justify-center" : ""}`}
                        >
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-2 flex justify-center">
                <ThemeToggle />
            </div>

            <div className={`p-4 border-t border-border ${isCollapsed ? "text-center" : ""}`}>
                {!isCollapsed ? (
                    <p className="text-xs text-muted-foreground">© 2025 Terraflow</p>
                ) : (
                    <span className="text-xs text-muted-foreground">©</span>
                )}
            </div>
        </aside>
    );
}
