"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

const SYMBOLS = [
    "</>", "{ }", "[]", "()", ";", "0", "1", "if", "for", "var",
    "npm", "git", "div", "#", "&&", "||", "=>", "return", "true", "false"
];

function FloatingSymbol({ text, position, color }: { text: string, position: [number, number, number], color: string }) {
    // Randomize float properties slightly
    const floatSpeed = useMemo(() => 1 + Math.random(), []);
    const rotationIntensity = useMemo(() => 0.5 + Math.random(), []);
    const floatIntensity = useMemo(() => 0.5 + Math.random(), []);

    return (
        <Float
            speed={floatSpeed} // Animation speed
            rotationIntensity={rotationIntensity} // XYZ rotation intensity
            floatIntensity={floatIntensity} // Up/down float intensity
        >
            <Text
                fontSize={0.3 + Math.random() * 0.4} // Smaller size as requested
                color={color}
                position={position}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]} // Random initial rotation
                anchorX="center"
                anchorY="middle"
                characters={SYMBOLS.join("")} // Preload characters
            >
                {text}
            </Text>
        </Float>
    );
}

function Scene({ count = 30 }) {
    const { theme } = useTheme();

    // Theme-aware colors
    // Dark mode: Cyan/Green/Blue accents
    // Light mode: Dark Gray/Blue accents
    const colors = theme === "dark"
        ? ["#2dd4bf", "#3b82f6", "#10b981", "#6366f1"]
        : ["#334155", "#475569", "#2563eb", "#059669"];

    const items = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const text = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            const x = (Math.random() - 0.5) * 20; // Spread across X
            const y = (Math.random() - 0.5) * 20; // Spread across Y
            const z = (Math.random() - 0.5) * 10; // Depth
            const color = colors[Math.floor(Math.random() * colors.length)];
            temp.push({ id: i, text, position: [x, y, z] as [number, number, number], color });
        }
        return temp;
    }, [count, theme]); // Re-generate/color on theme change

    // Force re-render of items when theme changes to update color logic properly
    // Actually, we can just pass the current theme's palette to the component.
    // The useMemo above depends on 'theme', so 'items' will regenerate with new colors.

    return (
        <group>
            {items.map((item) => (
                <FloatingSymbol
                    key={item.id + theme!} // Key change forces re-mount of text with new color
                    text={item.text}
                    position={item.position}
                    color={item.color}
                />
            ))}
        </group>
    );
}

export default function DeveloperParticles() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                {/* Lights */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Scene count={40} />
            </Canvas>
        </div>
    );
}
