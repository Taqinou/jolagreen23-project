"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";

interface MousePosition {
  x: number;
  y: number;
  isInSection: boolean;
}

interface TileRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AsciiRevealTileProps {
  src: string;
  alt: string;
  sizes: string;
  parallaxTransform: string;
  globalMousePos: MousePosition;
  revealRadius?: number;
}

export default function AsciiRevealTile({
  src,
  alt,
  sizes,
  parallaxTransform,
  globalMousePos,
  revealRadius = 280,
}: AsciiRevealTileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [tileRect, setTileRect] = useState<TileRect | null>(null);

  const asciiSrc = useMemo(() => {
    const filename = src.split("/").pop();
    if (!filename) {
      return null;
    }

    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    return `/images/gallery/ascii/${nameWithoutExt}.png`;
  }, [src]);

  const shouldRenderAsciiLayer = isInView && asciiSrc !== null;

  const maskStyle = useMemo<React.CSSProperties>(() => {
    if (!globalMousePos.isInSection || !tileRect) {
      return { opacity: 0 };
    }

    const relativeX = globalMousePos.x - tileRect.left;
    const relativeY = globalMousePos.y - tileRect.top;
    const outsideX = relativeX < -revealRadius || relativeX > tileRect.width + revealRadius;
    const outsideY = relativeY < -revealRadius || relativeY > tileRect.height + revealRadius;

    if (outsideX || outsideY) {
      return { opacity: 0 };
    }

    const maskImage = `radial-gradient(
      circle ${revealRadius}px at ${relativeX}px ${relativeY}px,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.9) 25%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0) 100%
    )`;

    return {
      opacity: 1,
      WebkitMaskImage: maskImage,
      maskImage,
    };
  }, [globalMousePos, revealRadius, tileRect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateRect = (): void => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      setTileRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    let rafId: number | null = null;
    const requestRectUpdate = (): void => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateRect();
      });
    };

    updateRect();
    window.addEventListener("resize", requestRectUpdate);
    window.addEventListener("scroll", requestRectUpdate, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", requestRectUpdate);
      window.removeEventListener("scroll", requestRectUpdate);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Original image layer */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading="lazy"
        quality={72}
        className="object-cover [will-change:transform]"
        style={{
          transform: parallaxTransform,
        }}
      />

      {/* ASCII image layer - only render when in view */}
      {shouldRenderAsciiLayer && asciiSrc && (
        <Image
          src={asciiSrc}
          alt={`${alt} - ASCII`}
          fill
          sizes={sizes}
          loading="lazy"
          quality={55}
          className="absolute inset-0 w-full h-full pointer-events-none [will-change:mask-image] object-cover"
          style={{
            transform: parallaxTransform,
            ...maskStyle,
          }}
        />
      )}
    </div>
  );
}
