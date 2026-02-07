"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GridConfig {
  cols: number;
  rows: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface PackedTile extends GalleryImage {
  id: number;
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

interface VisualsClientProps {
  images: GalleryImage[];
}

const SPAN_PATTERN: Array<[number, number]> = [
  [2, 2],
  [4, 2],
  [2, 4],
  [4, 4],
  [6, 2],
  [2, 6],
  [4, 2],
  [2, 2],
  [2, 4],
  [4, 2],
  [2, 2],
];

const FIT_FALLBACKS: Array<[number, number]> = [
  [2, 2],
  [4, 2],
  [2, 4],
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getParallaxFactor(tileId: number): number {
  const factors = [-1.45, -1.05, -0.7, 0.7, 1.05, 1.45];
  return factors[tileId % factors.length];
}

function getParallaxSpeed(tileId: number): number {
  const speeds = [0.68, 0.82, 0.96, 1.08, 1.2, 1.34, 1.46];
  return speeds[tileId % speeds.length];
}

function getGridConfig(width: number): GridConfig {
  if (width < 768) {
    return { cols: 4, rows: 12 };
  }

  if (width < 1280) {
    return { cols: 6, rows: 12 };
  }

  return { cols: 8, rows: 10 };
}

function createMatrix(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
}

function findFirstEmpty(matrix: boolean[][]): { row: number; col: number } | null {
  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        return { row, col };
      }
    }
  }

  return null;
}

function fits(matrix: boolean[][], row: number, col: number, width: number, height: number): boolean {
  const totalRows = matrix.length;
  const totalCols = matrix[0]?.length ?? 0;

  if (row + height > totalRows || col + width > totalCols) {
    return false;
  }

  for (let y = row; y < row + height; y += 1) {
    for (let x = col; x < col + width; x += 1) {
      if (matrix[y][x]) {
        return false;
      }
    }
  }

  return true;
}

function occupy(matrix: boolean[][], row: number, col: number, width: number, height: number): void {
  for (let y = row; y < row + height; y += 1) {
    for (let x = col; x < col + width; x += 1) {
      matrix[y][x] = true;
    }
  }
}

function pickSpan(tileId: number, grid: GridConfig): [number, number] {
  const pattern = SPAN_PATTERN[tileId % SPAN_PATTERN.length];
  return [Math.min(pattern[0], grid.cols), Math.min(pattern[1], grid.rows)];
}

function generatePackedTiles(grid: GridConfig, images: GalleryImage[]): PackedTile[] {
  if (images.length === 0) {
    return [];
  }

  const matrix = createMatrix(grid.rows, grid.cols);
  const tiles: PackedTile[] = [];

  let tileId = 0;

  while (true) {
    const cursor = findFirstEmpty(matrix);
    if (!cursor) {
      break;
    }

    const { row, col } = cursor;
    const [candidateWidth, candidateHeight] = pickSpan(tileId, grid);

    let width = candidateWidth;
    let height = candidateHeight;

    if (!fits(matrix, row, col, width, height)) {
      const fallback = FIT_FALLBACKS.find(([w, h]) => fits(matrix, row, col, w, h));
      if (fallback) {
        width = fallback[0];
        height = fallback[1];
      } else {
        break;
      }
    }

    occupy(matrix, row, col, width, height);

    const image = images[tileId % images.length];
    tiles.push({
      id: tileId,
      src: image.src,
      alt: image.alt,
      colStart: col + 1,
      rowStart: row + 1,
      colSpan: width,
      rowSpan: height,
    });

    tileId += 1;
  }

  return tiles;
}

export default function VisualsClient({ images }: VisualsClientProps) {
  const [viewport, setViewport] = useState<ViewportSize>({ width: 1280, height: 900 });
  const [parallaxOffset, setParallaxOffset] = useState<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateViewport = (): void => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();

    const onResize = (): void => {
      updateViewport();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const grid = useMemo(() => getGridConfig(viewport.width), [viewport.width]);
  const tiles = useMemo(() => generatePackedTiles(grid, images), [grid, images]);

  const imageSizes = useMemo(() => {
    if (viewport.width < 768) {
      return "70vw";
    }
    if (viewport.width < 1280) {
      return "48vw";
    }
    return "34vw";
  }, [viewport.width]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId: number | null = null;
    let previousOffset = Number.NaN;

    const updateParallax = (): void => {
      rafId = null;

      const target = sectionRef.current;
      if (!target) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const denominator = Math.max(window.innerHeight + rect.height, 1);
      const normalized = (window.innerHeight - rect.top) / denominator;
      const progress = clamp(normalized * 2 - 1, -1, 1);

      const baseAmplitude = window.innerWidth < 768 ? 56 : 92;
      const amplitude = prefersReducedMotion ? baseAmplitude * 0.7 : baseAmplitude;
      const offset = progress * amplitude;

      if (Math.abs(offset - previousOffset) < 0.08) {
        return;
      }

      previousOffset = offset;
      setParallaxOffset(offset);
    };

    const onFrameRequest = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(updateParallax);
    };

    onFrameRequest();
    window.addEventListener("scroll", onFrameRequest, { passive: true });
    window.addEventListener("resize", onFrameRequest);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onFrameRequest);
      window.removeEventListener("resize", onFrameRequest);
    };
  }, []);

  return (
    <section
      id="visuals"
      ref={sectionRef}
      className="relative h-[140vh] w-full overflow-hidden bg-black md:h-[165vh]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-black/55 to-transparent"
      />

      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((tile) => (
          <figure
            key={tile.id}
            className="relative m-0 overflow-hidden"
            style={{
              gridColumn: `${tile.colStart} / span ${tile.colSpan}`,
              gridRow: `${tile.rowStart} / span ${tile.rowSpan}`,
            }}
          >
            <div className="absolute -inset-[18%]">
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                unoptimized
                sizes={imageSizes}
                className="object-cover [will-change:transform]"
                style={{
                  transform: `translate3d(0, ${(parallaxOffset * getParallaxFactor(tile.id) * getParallaxSpeed(tile.id)).toFixed(2)}px, 0)`,
                }}
              />
            </div>
          </figure>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-black/55 to-transparent"
      />
    </section>
  );
}
