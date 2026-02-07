"use client";

import { useEffect, useRef, useState } from "react";

const ASCII_CHARS = "█▓▒░@#W$9876543210?!abc;:+=-,._ ";

interface Release {
  id: number;
  title: string;
  year: string;
  type: string;
  cover: string;
  tracks: string[];
}

interface AsciiConfig {
  width: number;
  chars: string;
}

function formatAsciiHoverTitle(title: string): string {
  if (title.includes("&")) {
    const [left, right] = title.split("&");
    if (left && right) return `${left}\n&\n${right}`;
  }

  return title;
}

function formatVerticalTitle(title: string): string {
  if (title.includes("&")) {
    const parts = title.split("&");
    return parts.join("\n&\n");
  }
  if (title.includes(" ")) return title;
  if (title.includes("-")) return title.replace(/-/g, "-\n");
  if (title.length > 14) {
    const mid = Math.ceil(title.length / 2);
    return `${title.slice(0, mid)}\n${title.slice(mid)}`;
  }
  return title;
}

// Hook pour convertir TEXTE en ASCII - créer image du texte puis convertir
function useTextToAscii(text: string, config: AsciiConfig) {
  const [asciiLines, setAsciiLines] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const buildAsciiLines = (): string[] => {
      // Créer un canvas avec le texte
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];

      const fontSize = 200;
      const lineHeight = fontSize * 1.1;
      ctx.font = `bold ${fontSize}px Arial`;

      // Gestion des retours à la ligne explicites puis fallback word-wrap.
      const normalizedText = text.trim();
      if (!normalizedText) {
        return [];
      }

      const explicitLines = normalizedText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      let finalLines: string[] = explicitLines;

      if (explicitLines.length <= 1) {
        const words = normalizedText.split(/\s+/).filter((word) => word.length > 0);
        const lines: string[] = [];
        const maxWidth = 1000;

        if (words.length === 0) {
          return [];
        }

        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);

        finalLines =
          normalizedText.length > 8 && normalizedText.includes(" ")
            ? normalizedText.split(" ")
            : lines;
      }

      // Dimensionner le canvas final
      let maxLineWidth = 0;
      finalLines.forEach((line) => {
        const width = ctx.measureText(line).width;
        if (width > maxLineWidth) maxLineWidth = width;
      });

      canvas.width = Math.max(maxLineWidth + 100, 800);
      canvas.height = Math.max(finalLines.length * lineHeight + 100, 800);

      // Fond blanc
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner le texte en noir
      ctx.fillStyle = "#000000";
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Centrer verticalement
      const startY =
        (canvas.height - finalLines.length * lineHeight) / 2 + lineHeight / 2;

      finalLines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });

      // Appliquer un bruit pour varier les caractères
      const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const noiseFactor = 80;

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

      // Conversion ASCII
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

  const isLoading = text.trim().length > 0 && asciiLines.length === 0;
  return { asciiLines, isLoading };
}

const RELEASES: Release[] = [
  {
    id: 1,
    title: "GOTY EDITION",
    year: "18.07.2025",
    type: "EP",
    cover: "/images/releases/goty-edition-2025.jpg",
    tracks: [
      "CR7 MAN UTD",
      "ÉNERGIE (KI/CHAKRA)",
      "FUMER LE VERT",
      "KABUTO (RDA)",
      "KINO DER TOTEN",
      "JOINT DE SEUM",
    ],
  },
  {
    id: 2,
    title: "+99XP",
    year: "08.11.2024",
    type: "Album",
    cover: "/images/releases/99xp-2024.jpg",
    tracks: [
      "JOLLY ROGER",
      "LONGLIFE NICKY LARSON (feat. Green Montana)",
      "ESSKE ?",
      "1.2.3 (2023VERSION) (feat. Adèle Castillon)",
      "STALINGRAD",
      "CRASH BANDICOOT",
    ],
  },
  {
    id: 3,
    title: "RECHERCHE&DESTRUCTION",
    year: "15.12.2023",
    type: "Album",
    cover: "/images/releases/recherche-destruction-2023.jpg",
    tracks: [
      "12HEURES MINUIT",
      "JOUR J (feat. Wallace Cleaver)",
      "GANGTAKA",
      "JE CONNAIS LA PATIENCE",
      "0.92",
      "C17",
    ],
  },
];

function DiagonalRelease({ release, index }: { release: Release; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const isEven = index % 2 === 0;
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const asciiTitle = formatAsciiHoverTitle(release.title);
  const maxAsciiTitleLineLength = asciiTitle.split("\n").reduce((maxLen, line) => (
    Math.max(maxLen, line.length)
  ), 1);
  const asciiWidth = Math.min(250, Math.max(120, maxAsciiTitleLineLength * 18));
  const formattedTitle = formatVerticalTitle(release.title);
  const isMultilineTitle = formattedTitle.includes("\n");
  
  const { asciiLines, isLoading } = useTextToAscii(asciiTitle, {
    width: asciiWidth,
    chars: ASCII_CHARS,
  });
  const maxAsciiLineLength = asciiLines.reduce((maxLen, line) => Math.max(maxLen, line.length), 1);

  useEffect(() => {
    const wrapperEl = titleWrapperRef.current;
    const titleEl = titleRef.current;
    if (!wrapperEl || !titleEl) return;

    const fitTitle = () => {
      // Reset before measuring.
      titleEl.style.transform = "";
      titleEl.style.transformOrigin = "";
      titleEl.style.lineHeight = "";
      titleEl.style.fontSize = "";

      if (!isMultilineTitle) return;

      const safetyPx = 26;
      const availableHeight = Math.max(0, wrapperEl.clientHeight - safetyPx);
      const titleHeight = titleEl.getBoundingClientRect().height;
      if (!availableHeight || !titleHeight) return;

      const computedFontSize = Number.parseFloat(window.getComputedStyle(titleEl).fontSize);
      if (!Number.isFinite(computedFontSize) || computedFontSize <= 0) return;

      if (titleHeight <= availableHeight) return;

      // First pass: proportional font-size fit.
      const firstRatio = (availableHeight / titleHeight) * 0.995;
      const minFontPx = computedFontSize * 0.45;
      const nextFontPx = Math.max(minFontPx, computedFontSize * firstRatio);
      titleEl.style.fontSize = `${nextFontPx}px`;

      // If still too tall, tighten line-height slightly and refit.
      let currentHeight = titleEl.getBoundingClientRect().height;
      if (currentHeight > availableHeight) {
        titleEl.style.lineHeight = "0.68";
        currentHeight = titleEl.getBoundingClientRect().height;
      }

      // Final iterative guard to remove last pixels of overflow.
      let attempts = 0;
      while (currentHeight > availableHeight && attempts < 8) {
        const currentFontPx = Number.parseFloat(titleEl.style.fontSize) || computedFontSize;
        const correction = (availableHeight / currentHeight) * 0.995;
        const adjustedFontPx = Math.max(minFontPx, currentFontPx * correction);
        titleEl.style.fontSize = `${adjustedFontPx}px`;
        currentHeight = titleEl.getBoundingClientRect().height;
        attempts += 1;
      }
    };

    const rafId = requestAnimationFrame(fitTitle);
    window.addEventListener("resize", fitTitle);

    if (document.fonts?.ready) {
      void document.fonts.ready.then(fitTitle);
    }

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        fitTitle();
      });
      observer.observe(wrapperEl);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", fitTitle);
      observer?.disconnect();
    };
  }, [formattedTitle, isMultilineTitle]);

  return (
    <div className="relative w-full h-[80vh] flex items-center overflow-hidden">
      {/* Content Container */}
      <div className={`relative z-10 w-full h-full flex ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* IMAGE SIDE (Diagonal Clip) */}
        <div 
          className={`relative h-full shrink-0 cursor-pointer group transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isHovered ? 'w-full' : 'w-[55%]'
          }`}
          style={{
            clipPath: isEven 
              ? (isHovered ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" : "polygon(0 0, 100% 0, 85% 100%, 0% 100%)")
              : (isHovered ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" : "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)")
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image */}
          <div className="absolute inset-0 bg-black">
             <img
              src={release.cover}
              alt={release.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? "opacity-20" : "opacity-100"
              }`}
            />
          </div>

          {/* ASCII Overlay (On Hover) */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 p-12 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            {/* Top Metadata */}
            <div className="flex gap-8 mb-8">
              <span className="font-mono text-accent text-sm tracking-[0.3em] uppercase glow-text">
                {release.type}
              </span>
              <span className="font-mono text-accent text-sm tracking-[0.3em] uppercase glow-text">
                {release.year}
              </span>
            </div>

            {/* ASCII Title */}
            {!isLoading && (
              <pre
                className="font-ascii text-accent leading-[0.8] select-none text-center mb-8 w-full max-w-full overflow-hidden"
                style={{
                  fontSize: `min(1.35vw, ${49 / asciiLines.length}vw, ${105 / maxAsciiLineLength}vw)`,
                  textShadow: "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5)",
                  transform: isEven ? "skewX(10deg)" : "skewX(-10deg)",
                  transformOrigin: "center center",
                }}
              >
                {asciiLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="whitespace-pre">{line}</div>
                ))}
              </pre>
            )}
          </div>
        </div>

        {/* TEXT SIDE - Vertical Title */}
        <div 
          className={`flex-1 min-w-0 flex items-center transition-opacity duration-300 ${
            isHovered ? 'opacity-0 delay-0' : 'opacity-100 delay-100'
          } ${isEven ? 'justify-start pl-8' : 'justify-end pr-8'}`}
        >
          <div 
            ref={titleWrapperRef}
            className={`flex items-center gap-4 h-full py-12 ${!isEven ? 'rotate-180' : ''}`}
          >
            {/* Vertical Title */}
            <h2 
              ref={titleRef}
              className="font-display text-7xl md:text-8xl lg:text-[10rem] text-black leading-[0.75] uppercase"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                whiteSpace: "pre-line",
                textAlign: isMultilineTitle ? "center" : undefined,
              }}
            >
              {formattedTitle}
            </h2>
            
            {/* Metadata - Vertical */}
            <div className="flex flex-col justify-end gap-3 pb-2">
              <span 
                className="font-mono text-accent text-xs tracking-[0.15em] uppercase"
                style={{ writingMode: 'vertical-rl' }}
              >
                {release.type}
              </span>
              <span 
                className="font-mono text-black/60 text-xs tracking-[0.15em]"
                style={{ writingMode: 'vertical-rl' }}
              >
                {release.year}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Releases() {
  return (
    <section
      id="releases"
      className="w-full bg-white"
    >
      {RELEASES.map((release, index) => (
        <DiagonalRelease key={release.id} release={release} index={index} />
      ))}
    </section>
  );
}
