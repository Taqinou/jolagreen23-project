"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

const ASCII_CHARS = "@#W$9876543210?!abc;:+=-,._ ";
const GLITCH_CHARS = "@#$%&*!?/\\|[]{}()<>~^+=";

interface GlitchPosition {
  lineIdx: number;
  charIdx: number;
  glitchChar: string;
  expiry: number;
}

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
    return { width: 200, fontSize: 8 };
  }
  const vw = window.innerWidth;
  const targetWidth = vw * 0.98;
  const targetChars = Math.min(280, Math.floor(vw / 4));
  const bestWidth = Math.max(220, targetChars);
  const bestFontSize = targetWidth / bestWidth;
  return { width: bestWidth, fontSize: bestFontSize };
}

// Custom hook for glitch effect
function useGlitchEffect(
  asciiLines: string[],
  isLoading: boolean,
  intensity: number = 0.015 // 1.5% of characters
) {
  const [glitchMap, setGlitchMap] = useState<Map<string, GlitchPosition>>(
    new Map()
  );

  // Get random glitch character
  const getRandomGlitchChar = useCallback(() => {
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }, []);

  // Generate position key
  const posKey = useCallback(
    (lineIdx: number, charIdx: number) => `${lineIdx}-${charIdx}`,
    []
  );

  useEffect(() => {
    if (isLoading || asciiLines.length === 0) return;

    // Calculate total non-space characters
    const validPositions: { lineIdx: number; charIdx: number }[] = [];
    asciiLines.forEach((line, lineIdx) => {
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        if (line[charIdx] !== " ") {
          validPositions.push({ lineIdx, charIdx });
        }
      }
    });

    const glitchInterval = setInterval(() => {
      const now = Date.now();
      const numGlitches = Math.max(
        1,
        Math.floor(validPositions.length * intensity)
      );

      setGlitchMap((prev) => {
        const newMap = new Map(prev);

        // Remove expired glitches
        for (const [key, value] of newMap) {
          if (now > value.expiry) {
            newMap.delete(key);
          }
        }

        // Add new glitches
        for (let i = 0; i < numGlitches; i++) {
          const pos =
            validPositions[Math.floor(Math.random() * validPositions.length)];
          const key = posKey(pos.lineIdx, pos.charIdx);

          // Don't re-glitch already glitched positions
          if (!newMap.has(key)) {
            newMap.set(key, {
              lineIdx: pos.lineIdx,
              charIdx: pos.charIdx,
              glitchChar: getRandomGlitchChar(),
              expiry: now + 80 + Math.random() * 120, // 80-200ms duration
            });
          }
        }

        return newMap;
      });
    }, 60); // Check every 60ms

    return () => clearInterval(glitchInterval);
  }, [asciiLines, isLoading, intensity, getRandomGlitchChar, posKey]);

  // Generate glitched lines
  const glitchedLines = useMemo(() => {
    if (glitchMap.size === 0) return asciiLines;

    return asciiLines.map((line, lineIdx) => {
      let glitchedLine = "";
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const key = `${lineIdx}-${charIdx}`;
        const glitch = glitchMap.get(key);
        glitchedLine += glitch ? glitch.glitchChar : line[charIdx];
      }
      return glitchedLine;
    });
  }, [asciiLines, glitchMap]);

  return glitchedLines;
}

export default function Hero() {
  const initialSize = calculateOptimalSize();
  const [asciiWidth, setAsciiWidth] = useState(initialSize.width);
  const [fontSize, setFontSize] = useState(initialSize.fontSize);

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

  // Apply glitch effect to ASCII lines
  const glitchedLines = useGlitchEffect(asciiLines, isLoading);

  return (
    <section className="relative h-screen w-full bg-background flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ASCII Art Container */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        {!isLoading && (
          <pre
            className="font-ascii text-accent leading-[1] select-none text-center"
            style={{
              fontSize: `${fontSize * 1.8}px`,
              textShadow:
                "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5), 0 0 40px rgba(0, 255, 102, 0.3)",
              letterSpacing: "0",
            }}
          >
            {glitchedLines.map((line, lineIdx) => (
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
