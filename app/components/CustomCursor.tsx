"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const ASCII_CHARS = "█▓▒░@#W$9876543210?!abc;:+=-,._ ";

interface AsciiConfig {
  width: number;
  chars: string;
}

function trimAsciiLines(lines: string[]): string[] {
  const nonEmptyRows = lines.filter((line) => line.trim().length > 0);
  if (nonEmptyRows.length === 0) return [];

  let left = Number.POSITIVE_INFINITY;
  let right = 0;

  nonEmptyRows.forEach((line) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== " ") {
        left = Math.min(left, i);
        right = Math.max(right, i);
      }
    }
  });

  if (!Number.isFinite(left)) return [];

  return nonEmptyRows.map((line) => line.slice(left, right + 1));
}

function useTextToAscii(text: string, config: AsciiConfig): string[] {
  const [asciiLines, setAsciiLines] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizedText = text.trim();
    if (!normalizedText) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 180;
    ctx.font = `bold ${fontSize}px Arial`;

    const textWidth = Math.ceil(ctx.measureText(normalizedText).width);
    canvas.width = Math.max(textWidth + 100, 420);
    canvas.height = Math.max(Math.ceil(fontSize * 1.6), 220);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(normalizedText, canvas.width / 2, canvas.height / 2);

    const noisyData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const noiseFactor = 24;
    for (let i = 0; i < noisyData.data.length; i += 4) {
      if (noisyData.data[i] < 250) {
        const noise = (Math.random() - 0.5) * noiseFactor;
        let value = noisyData.data[i] + noise;
        value = Math.max(0, Math.min(255, value));
        noisyData.data[i] = value;
        noisyData.data[i + 1] = value;
        noisyData.data[i + 2] = value;
      }
    }
    ctx.putImageData(noisyData, 0, 0);

    const width = config.width;
    const height = Math.max(6, Math.floor(width * (canvas.height / canvas.width) * 0.55));
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(canvas, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const asciiResult: string[] = [];

    for (let y = 0; y < height; y++) {
      let line = "";
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIndex = Math.floor(luminance * (config.chars.length - 1));
        line += config.chars[charIndex];
      }
      asciiResult.push(line);
    }

    const nextAsciiLines = trimAsciiLines(asciiResult);
    const frameId = window.requestAnimationFrame(() => {
      setAsciiLines(nextAsciiLines);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [text, config.width, config.chars]);

  return asciiLines;
}

export default function CustomCursor(): JSX.Element {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rootActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const isVisibleRef = useRef(false);
  const isPressedRef = useRef(false);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const asciiLines = useTextToAscii("23", {
    width: 46,
    chars: ASCII_CHARS,
  });
  const maxAsciiLineLength = useMemo<number>(() => (
    asciiLines.reduce((maxLen, line) => Math.max(maxLen, line.length), 1)
  ), [asciiLines]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    const renderCursor = (): void => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      const scale = isPressedRef.current ? 0.95 : 1;
      cursor.style.transform = `translate3d(${xRef.current}px, ${yRef.current}px, 0) translate3d(-50%, -50%, 0) scale(${scale})`;
      cursor.style.opacity = hasMovedRef.current && isVisibleRef.current ? "1" : "0";
    };

    const setRootActive = (active: boolean): void => {
      if (rootActiveRef.current === active) return;
      rootActiveRef.current = active;
      if (active) {
        root.classList.add("custom-cursor-active");
        return;
      }
      root.classList.remove("custom-cursor-active");
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const coalesced = event.getCoalescedEvents?.() ?? [];
      const latestEvent =
        coalesced.length > 0 ? coalesced[coalesced.length - 1] : event;

      xRef.current = latestEvent.clientX;
      yRef.current = latestEvent.clientY;
      isVisibleRef.current = true;
      hasMovedRef.current = true;
      setRootActive(true);
      renderCursor();
    };

    const handlePointerDown = (): void => {
      isPressedRef.current = true;
      renderCursor();
    };

    const handlePointerUp = (): void => {
      isPressedRef.current = false;
      renderCursor();
    };

    const hideCursor = (): void => {
      isVisibleRef.current = false;
      isPressedRef.current = false;
      setRootActive(false);
      renderCursor();
    };

    window.addEventListener("pointerrawupdate", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);

    return () => {
      root.classList.remove("custom-cursor-active");
      rootActiveRef.current = false;
      window.removeEventListener("pointerrawupdate", handlePointerMove);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, []);

  const cursorStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 99999,
      pointerEvents: "none",
      opacity: 0,
      transform: "translate3d(-9999px, -9999px, 0) scale(1)",
      transition: "opacity 100ms ease",
      willChange: "transform, opacity",
    }),
    []
  );

  const textStyle = useMemo<CSSProperties>(
    () => ({
      color: "var(--accent)",
      fontSize: `${Math.min(5.5, Math.max(2.2, 52 / maxAsciiLineLength))}px`,
      fontWeight: 700,
      lineHeight: 0.8,
      letterSpacing: "0",
      textShadow:
        "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5)",
      userSelect: "none",
      display: "inline-block",
      margin: 0,
      textAlign: "center",
      whiteSpace: "pre",
      transform: "skewX(10deg)",
    }),
    [maxAsciiLineLength]
  );

  return (
    <div ref={cursorRef} style={cursorStyle}>
      {asciiLines.length > 0 ? (
        <pre className="font-ascii" style={textStyle}>
          {asciiLines.map((line, lineIdx) => (
            <div key={lineIdx}>{line}</div>
          ))}
        </pre>
      ) : (
        <span className="font-ascii" style={textStyle}>23</span>
      )}
    </div>
  );
}
