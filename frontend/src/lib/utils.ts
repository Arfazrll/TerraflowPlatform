export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function calculateTrend(data: number[]): "rising" | "falling" | "stable" {
    if (data.length < 2) return "stable";
    const recent = data.slice(-5);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const last = recent[recent.length - 1];

    if (last > avg + 2) return "rising";
    if (last < avg - 2) return "falling";
    return "stable";
}

export function cn(...classes: Array<string | boolean | undefined | null>): string {
    return classes.filter(Boolean).join(" ");
}