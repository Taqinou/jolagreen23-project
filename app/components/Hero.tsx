"use client";

import { useEffect, useState, useRef } from "react";

const ASCII_CHARS = "@#W$9876543210?!abc;:+=-,._ ";
const GLITCH_CHARS = "@#$%&*!?<>[]{}|/\\~^";

interface AsciiConfig {
  width: number;
  chars: string;
}

function useImageToAscii(imageSrc: string, config: AsciiConfig) {
  const [asciiLines, setAsciiLines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const aspectRatio = img.height / img.width;
      const width = config.width;
      const height = Math.floor(width * aspectRatio * 0.5);

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      const lines: string[] = [];
      const chars = config.chars;

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
        lines.push(line);
      }

      setAsciiLines(lines);
      setIsLoading(false);
    };

    img.onerror = () => {
      console.error("Failed to load image for ASCII conversion");
      setIsLoading(false);
    };

    img.src = imageSrc;
  }, [imageSrc, config.width, config.chars]);

  return { asciiLines, isLoading };
}

function calculateOptimalSize() {
  if (typeof window === "undefined") {
    return { width: 120, fontSize: 10 };
  }
  const vw = window.innerWidth;
  const targetWidth = vw * 0.98;
  // HIGH RESOLUTION: 160 chars for detail
  const targetChars = Math.min(160, Math.floor(vw / 6));
  const bestWidth = Math.max(140, targetChars);
  const bestFontSize = targetWidth / bestWidth;
  return { width: bestWidth, fontSize: bestFontSize };
}

export default function Hero() {
  const initialSize = calculateOptimalSize();
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [asciiWidth, setAsciiWidth] = useState(initialSize.width);
  const [fontSize, setFontSize] = useState(initialSize.fontSize);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const size = calculateOptimalSize();
      setAsciiWidth(size.width);
      setFontSize(size.fontSize);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { asciiLines, isLoading } = useImageToAscii("/images/images.png", {
    width: asciiWidth,
    chars: ASCII_CHARS,
  });

  // Continuous animation loop
  useEffect(() => {
    if (asciiLines.length === 0 || isLoading) return;

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      const elapsed = timestamp - timeRef.current;

      if (elapsed > 250) {
        timeRef.current = timestamp;

        setDisplayLines(() => {
          return asciiLines.map((line, lineIdx) => {
            return line
              .split("")
              .map((char, charIdx) => {
                if (char === " " || char === "_" || char === "." || char === ",") {
                  return char;
                }

                const waveX = Math.sin((charIdx * 0.1) + (timestamp * 0.002)) * 0.5 + 0.5;
                const waveY = Math.cos((lineIdx * 0.2) + (timestamp * 0.001)) * 0.5 + 0.5;
                const noise = Math.sin((charIdx + lineIdx) * 0.5 + timestamp * 0.003) * 0.5 + 0.5;

                const glitchProbability = (waveX * waveY * noise) * 0.15;

                if (Math.random() < glitchProbability) {
                  if (Math.random() < 0.7) {
                    const currentIdx = ASCII_CHARS.indexOf(char);
                    if (currentIdx !== -1) {
                      const offset = Math.floor(Math.random() * 5) - 2;
                      const newIdx = Math.max(0, Math.min(ASCII_CHARS.length - 1, currentIdx + offset));
                      return ASCII_CHARS[newIdx];
                    }
                  }
                  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }

                return char;
              })
              .join("");
          });
        });
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [asciiLines, isLoading]);

  return (
    <section className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 102, 0.1) 2px, rgba(0, 255, 102, 0.1) 4px)",
          }}
        />
      </div>

      {/* ASCII Art Container */}
      <div 
        ref={containerRef}
        className="relative z-20 flex items-center justify-center w-full h-full"
      >
        {!isLoading && (
          <pre
            className="font-mono text-accent leading-[1] select-none text-center"
            style={{
              fontSize: `${fontSize * 1.8}px`,
              textShadow:
                "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5), 0 0 40px rgba(0, 255, 102, 0.3)",
              letterSpacing: "0",
            }}
          >
            {displayLines.map((line, lineIdx) => (
              <div key={lineIdx} className="whitespace-pre">
                {line}
              </div>
            ))}
          </pre>
        )}
      </div>
    </section>
  );
}
