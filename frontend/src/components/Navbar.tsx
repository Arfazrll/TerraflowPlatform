"use client";

import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const [isNavbarVisible, setIsNavbarVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsNavbarVisible(false);
            } else {
                setIsNavbarVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-transform duration-300 ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="flex items-center justify-center relative">
                    {/* Centered Links */}
                    <div className="flex items-center gap-16">
                        <Link
                            href="/"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            How It Works
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Right-aligned Theme Toggle (Absolute to keep links centered) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
