"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

const ASCII_CHARS = "@#W$9876543210?!abc;:+=-,._ ";
const GLITCH_CHARS = "@#$%&*!?/\\|[]{}()<>~^+=";
const ASH_CHARS = ".,:;*";

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

interface PointerState {
  x: number;
  y: number;
  active: boolean;
  isTouch: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pseudoNoise(lineIdx: number, charIdx: number, seed: number): number {
  const value =
    Math.sin(lineIdx * 12.9898 + charIdx * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
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
      if (!ctx) {
        setIsLoading(false);
        return;
      }

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

function useGlitchEffect(
  asciiLines: string[],
  isLoading: boolean,
  intensity: number = 0.015
) {
  const [glitchMap, setGlitchMap] = useState<Map<string, GlitchPosition>>(
    new Map()
  );

  const getRandomGlitchChar = useCallback(() => {
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }, []);

  const posKey = useCallback(
    (lineIdx: number, charIdx: number) => `${lineIdx}-${charIdx}`,
    []
  );

  useEffect(() => {
    if (isLoading || asciiLines.length === 0) return;

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

        for (const [key, value] of newMap) {
          if (now > value.expiry) {
            newMap.delete(key);
          }
        }

        for (let i = 0; i < numGlitches; i++) {
          const pos =
            validPositions[Math.floor(Math.random() * validPositions.length)];
          const key = posKey(pos.lineIdx, pos.charIdx);

          if (!newMap.has(key)) {
            newMap.set(key, {
              lineIdx: pos.lineIdx,
              charIdx: pos.charIdx,
              glitchChar: getRandomGlitchChar(),
              expiry: now + 80 + Math.random() * 120,
            });
          }
        }

        return newMap;
      });
    }, 60);

    return () => clearInterval(glitchInterval);
  }, [asciiLines, isLoading, intensity, getRandomGlitchChar, posKey]);

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointerState, setPointerState] = useState<PointerState>({
    x: 0.5,
    y: 0.5,
    active: false,
    isTouch: false,
  });
  const [hoverTick, setHoverTick] = useState(0);
  const [dustTick, setDustTick] = useState(0);
  const preRef = useRef<HTMLPreElement | null>(null);

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

  const glitchedLines = useGlitchEffect(asciiLines, isLoading);

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      const start = viewportHeight * 0.18;
      const end = viewportHeight * 0.8;
      const rawProgress = (window.scrollY - start) / (end - start);
      setScrollProgress(clamp(rawProgress, 0, 1));
      rafId = null;
    };

    const handleScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const displayLines = useMemo(() => {
    if (glitchedLines.length === 0) return glitchedLines;

    const totalLines = glitchedLines.length;
    const representativeWidth = glitchedLines[0]?.length ?? 0;
    const pointerLine = Math.floor(pointerState.y * Math.max(1, totalLines - 1));
    const pointerChar = Math.floor(
      pointerState.x * Math.max(1, representativeWidth - 1)
    );
    const pointerRadius = pointerState.isTouch ? 16 : 10;
    const dustStartLine = Math.floor(totalLines * 0.2);

    return glitchedLines.map((line, lineIdx) => {
      if (!line) return line;

      const chars = line.split("");
      const lineWidth = chars.length;
      const normalizedPointerChar =
        representativeWidth > 1
          ? Math.floor(
              (pointerChar / Math.max(1, representativeWidth - 1)) *
                Math.max(1, lineWidth - 1)
            )
          : 0;

      for (let charIdx = 0; charIdx < lineWidth; charIdx++) {
        if (chars[charIdx] === " ") continue;

        if (scrollProgress > 0.02 && lineIdx >= dustStartLine) {
          const depth =
            (lineIdx - dustStartLine) / Math.max(1, totalLines - dustStartLine);
          const lineTrigger = 0.08 + (1 - depth) * 0.44;
          const dustPhase = clamp((scrollProgress - lineTrigger) * 2.5, 0, 1);
          const dustChance = clamp(0.46 * dustPhase + 0.34 * dustPhase * dustPhase, 0, 1);
          const vanishChance = clamp(
            (dustPhase - 0.32) * (0.62 + depth * 0.42),
            0,
            1
          );
          const dustNoise = pseudoNoise(lineIdx, charIdx, dustTick + 37);

          if (dustNoise < vanishChance) {
            chars[charIdx] = " ";
            continue;
          }

          if (dustNoise < dustChance) {
            const ashIdx = Math.floor(
              pseudoNoise(lineIdx, charIdx, dustTick + 811) * ASH_CHARS.length
            );
            chars[charIdx] = ASH_CHARS[ashIdx] ?? ".";
            continue;
          }
        }

        if (!pointerState.active) continue;

        const distance = Math.hypot(charIdx - normalizedPointerChar, lineIdx - pointerLine);

        if (distance > pointerRadius) continue;

        const influence = 1 - distance / pointerRadius;
        const noise = pseudoNoise(lineIdx, charIdx, hoverTick + 113);

        if (noise < influence * 0.34) {
          const replacementIdx = Math.floor(
            pseudoNoise(lineIdx, charIdx, hoverTick + 701) * GLITCH_CHARS.length
          );
          chars[charIdx] = GLITCH_CHARS[replacementIdx];
        }
      }

      return chars.join("");
    });
  }, [dustTick, glitchedLines, hoverTick, pointerState, scrollProgress]);

  useEffect(() => {
    if (!pointerState.active) return;
    const hoverInterval = window.setInterval(() => {
      setHoverTick((prev) => prev + 1);
    }, 75);
    return () => window.clearInterval(hoverInterval);
  }, [pointerState.active]);

  useEffect(() => {
    if (scrollProgress <= 0.02) return;
    const dustInterval = window.setInterval(() => {
      setDustTick((prev) => prev + 1);
    }, 70);
    return () => window.clearInterval(dustInterval);
  }, [scrollProgress]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>): void => {
      const preElement = preRef.current;
      if (!preElement) return;

      const rect = preElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) {
        setPointerState((previous) =>
          previous.active ? { ...previous, active: false } : previous
        );
        return;
      }

      setPointerState({
        x: clamp(x, 0, 1),
        y: clamp(y, 0, 1),
        active: true,
        isTouch: event.pointerType === "touch",
      });
    },
    []
  );

  const handlePointerLeave = useCallback((): void => {
    setPointerState((previous) =>
      previous.active ? { ...previous, active: false } : previous
    );
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>): void => {
      if (event.pointerType !== "touch") return;
      handlePointerLeave();
    },
    [handlePointerLeave]
  );

  const maskOpaqueStop = 100 - scrollProgress * 34;
  const maskFadeStart = Math.max(0, maskOpaqueStop - 10);

  return (
    <section
      className="relative h-screen w-full bg-background flex items-center justify-center overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        {!isLoading && (
          <pre
            ref={preRef}
            className="font-ascii text-accent leading-[1] select-none text-center"
            style={{
              fontSize: `${fontSize * 1.8}px`,
              textShadow:
                "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5), 0 0 40px rgba(0, 255, 102, 0.3)",
              letterSpacing: "0",
              opacity: Math.max(0.3, 1 - scrollProgress * 0.45),
              transform: `translate3d(0, ${-scrollProgress * 12}px, 0)`,
              filter: `blur(${(scrollProgress * 0.35).toFixed(2)}px)`,
              transition:
                "opacity 120ms linear, transform 120ms linear, filter 120ms linear",
              WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${maskFadeStart}%, rgba(0,0,0,0) ${maskOpaqueStop}%, rgba(0,0,0,0) 100%)`,
              maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${maskFadeStart}%, rgba(0,0,0,0) ${maskOpaqueStop}%, rgba(0,0,0,0) 100%)`,
              willChange: "transform, opacity, filter",
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
