"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import * as THREE from "three";

function Particles({ count = 100 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { theme } = useTheme();

    const lightColor = new THREE.Color("#3b82f6"); // Blue-500
    const darkColor = new THREE.Color("#2dd4bf");  // Teal-400

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random initial positions and speeds
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        // Update color based on theme
        const targetColor = theme === "dark" ? darkColor : lightColor;
        // We can't easily animate color per-frame on instance without custom shader or iterating instance colors
        // For simplicity, we'll set the material color
        (mesh.current.material as THREE.MeshBasicMaterial).color.lerp(targetColor, 0.05);

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Move particles upwards (like bubbles) or downwards (rain)
            // Let's go for rising bubbles/particles
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Update position
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // Scale based on "distance" (fake depth)
            const scale = (Math.cos(t) + 2) / 2; // Oscillate size
            dummy.scale.set(scale, scale, scale);

            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial transparent opacity={0.6} />
        </instancedMesh>
    );
}

export default function WaterParticles() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 0, 70], fov: 75 }}>
                <Particles count={150} />
            </Canvas>
        </div>
    );
}
