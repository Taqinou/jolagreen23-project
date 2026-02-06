"use client";

import { useEffect, useState } from "react";

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

// Hook pour convertir TEXTE en ASCII - créer image du texte puis convertir
function useTextToAscii(text: string, config: AsciiConfig) {
  const [asciiLines, setAsciiLines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Créer un canvas avec le texte
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 200;
    const lineHeight = fontSize * 1.1;
    ctx.font = `bold ${fontSize}px Arial`;

    // Gestion du retour à la ligne (Word Wrap)
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    // Canvas temporaire pour mesurer
    const maxWidth = 1000;

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

    const finalLines = text.length > 8 && text.includes(" ") ? text.split(" ") : lines;

    // Dimensionner le canvas final
    let maxLineWidth = 0;
    finalLines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
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
    const startY = (canvas.height - (finalLines.length * lineHeight)) / 2 + (lineHeight / 2);

    finalLines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
    });

    // Appliquer un bruit pour varier les caractères
    const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const noiseFactor = 80;
    
    for (let i = 0; i < rawData.data.length; i += 4) {
      if (rawData.data[i] < 250) {
        const noise = (Math.random() - 0.5) * noiseFactor;
        let val = rawData.data[i] + noise;
        val = Math.max(0, Math.min(255, val));
        
        rawData.data[i] = val;
        rawData.data[i+1] = val;
        rawData.data[i+2] = val;
      }
    }
    ctx.putImageData(rawData, 0, 0);

    // Conversion ASCII
    const aspectRatio = canvas.height / canvas.width;
    const width = config.width;
    const height = Math.floor(width * aspectRatio * 0.55);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.drawImage(canvas, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const asciiResult: string[] = [];
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
      asciiResult.push(line);
    }

    setAsciiLines(asciiResult);
    setIsLoading(false);
  }, [text, config.width, config.chars]);

  return { asciiLines, isLoading };
}

const RELEASES: Release[] = [
  {
    id: 1,
    title: "MÉTAL",
    year: "2024",
    type: "Album",
    cover: "/images/hero.jpg",
    tracks: ["INTRO", "333", "DRILL", "VVS", "MÉTAL", "GOTY"],
  },
  {
    id: 2,
    title: "GOTY EDITION",
    year: "2023",
    type: "EP",
    cover: "/images/gallery/portrait.png",
    tracks: ["GOTY", "PLATINE", "DIAMANT", "OR"],
  },
  {
    id: 3,
    title: "333",
    year: "2022",
    type: "Single",
    cover: "/images/hero.jpg",
    tracks: ["333", "333 (Remix)"],
  },
];

function DiagonalRelease({ release, index }: { release: Release; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const isEven = index % 2 === 0;

  const asciiWidth = Math.min(250, Math.max(120, release.title.length * 20));
  
  const { asciiLines, isLoading } = useTextToAscii(release.title, {
    width: asciiWidth,
    chars: ASCII_CHARS,
  });

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
                className="font-ascii text-accent leading-[0.8] select-none text-center mb-8"
                style={{
                  fontSize: `min(1.2vw, ${45 / asciiLines.length}vw)`,
                  textShadow: "0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.5)",
                  transform: isEven ? "skewX(10deg)" : "skewX(-10deg)"
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
            className={`flex items-center gap-4 h-full py-12 ${!isEven ? 'rotate-180' : ''}`}
          >
            {/* Vertical Title */}
            <h2 
              className="font-display text-7xl md:text-8xl lg:text-[10rem] text-black leading-[0.75] uppercase"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              {release.title}
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
