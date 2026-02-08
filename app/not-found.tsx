"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ASCII_CHARS = "█▓▒░@#W$9876543210?!abc;:+=-,._ ";

interface AsciiConfig {
  width: number;
  chars: string;
}

function useStaticTextToAscii(text: string, config: AsciiConfig) {
  const [asciiLines, setAsciiLines] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const buildAsciiLines = (): string[] => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];

      const fontSize = 200;
      ctx.font = `bold ${fontSize}px Arial`;

      const textMetrics = ctx.measureText(text);
      const textWidth = Math.ceil(textMetrics.width);
      const textHeight = Math.ceil(fontSize * 1.2);

      canvas.width = Math.max(textWidth + 100, 800);
      canvas.height = Math.max(textHeight + 100, 400);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#000000";
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const noiseFactor = 60;

      for (let i = 0; i < rawData.data.length; i += 4) {
        if (rawData.data[i] < 250) {
          const noise = (Math.random() - 0.5) * noiseFactor;
          let value = rawData.data[i] + noise;
          value = Math.max(0, Math.min(255, value));

          rawData.data[i] = value;
          rawData.data[i + 1] = value;
          rawData.data[i + 2] = value;
        }
      }
      ctx.putImageData(rawData, 0, 0);

      const aspectRatio = canvas.height / canvas.width;
      const width = config.width;
      const height = Math.floor(width * aspectRatio * 0.55);

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return [];

      tempCanvas.width = width;
      tempCanvas.height = height;

      tempCtx.drawImage(canvas, 0, 0, width, height);

      const imageData = tempCtx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const chars = config.chars;
      const asciiResult: string[] = [];

      for (let y = 0; y < height; y++) {
        let line = "";
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const charIndex = Math.floor(luminance * (chars.length - 1));
          line += chars[charIndex];
        }
        asciiResult.push(line);
      }

      return asciiResult;
    };

    const nextAsciiLines = buildAsciiLines();
    const frameId = window.requestAnimationFrame(() => {
      setAsciiLines(nextAsciiLines);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [text, config.width, config.chars]);

  return asciiLines;
}

export default function NotFound() {
  const router = useRouter();
  
  const asciiLines = useStaticTextToAscii("NOT FOUND", {
    width: 140,
    chars: ASCII_CHARS,
  });

  return (
    <section 
      onClick={() => router.push('/')}
      className="relative h-screen w-full bg-black flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      <div className="relative z-10 p-12 mix-blend-screen">
        <pre
          className="font-ascii text-accent leading-[0.8] text-center whitespace-pre"
          style={{
            fontSize: "clamp(4px, 1.2vw, 12px)",
            textShadow: "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5)",
            transform: "skewX(-10deg)",
          }}
        >
          {asciiLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </pre>
      </div>
    </section>
  );
}
