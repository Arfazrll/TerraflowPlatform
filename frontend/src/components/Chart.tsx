"use client";

import { useEffect, useRef } from "react";

type ChartProps = {
  data: Array<{ timestamp: number; distance?: number; ph?: number }>;
  dataKey: "distance" | "ph";
  color: string;
};

export default function Chart({ data, dataKey, color }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const values = data.map((d) => d[dataKey] || 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const xStep = (width - padding * 2) / (data.length - 1 || 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const value = point[dataKey] || 0;
      const x = padding + index * xStep;
      const y = height - padding - ((value - minValue) / range) * (height - padding * 2);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.fillStyle = `${color}33`;
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * (height - padding * 2)) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = maxValue - (i * range) / 4;
      const y = padding + (i * (height - padding * 2)) / 4;
      ctx.fillText(value.toFixed(1), padding - 10, y + 3);
    }
  }, [data, dataKey, color]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      className="w-full"
      style={{ maxHeight: "300px" }}
    />
  );
}