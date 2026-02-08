"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface MousePosition {
  x: number;
  y: number;
  isInSection: boolean;
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
  const [asciiSrc, setAsciiSrc] = useState<string | null>(null);
  const lastMousePosRef = useRef<MousePosition>({ x: 0, y: 0, isInSection: false });

  // Extraire le nom du fichier pour trouver l'image ASCII correspondante
  useEffect(() => {
    const filename = src.split('/').pop();
    if (filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      setAsciiSrc(`/images/gallery/ascii/${nameWithoutExt}.png`);
    }
  }, [src]);

  // Intersection Observer pour lazy loading
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

  // Sauvegarder la dernière position connue
  useEffect(() => {
    if (globalMousePos.isInSection) {
      lastMousePosRef.current = globalMousePos;
    }
  }, [globalMousePos]);

  // Calculer la position relative du curseur par rapport à cette tuile
  // Utilise getBoundingClientRect() qui donne toujours la position viewport (mise à jour au scroll)
  const getRelativeMousePos = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    
    // Position de la souris en viewport coordinates
    const mouseX = globalMousePos.isInSection ? globalMousePos.x : lastMousePosRef.current.x;
    const mouseY = globalMousePos.isInSection ? globalMousePos.y : lastMousePosRef.current.y;

    // Position relative par rapport à cette tuile
    const relativeX = mouseX - rect.left;
    const relativeY = mouseY - rect.top;

    // Vérifier si la souris est dans cette tuile
    const isInTile = relativeX >= 0 && relativeX <= rect.width && relativeY >= 0 && relativeY <= rect.height;

    return { 
      x: relativeX, 
      y: relativeY, 
      isInSection: globalMousePos.isInSection || lastMousePosRef.current.isInSection,
      isInTile
    };
  }, [globalMousePos]);

  // Generate the mask style for the reveal effect
  const getMaskStyle = (): React.CSSProperties => {
    const relPos = getRelativeMousePos();
    
    if (!relPos || !relPos.isInSection) {
      return { opacity: 0 };
    }

    const maskImage = `radial-gradient(
      circle ${revealRadius}px at ${relPos.x}px ${relPos.y}px,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.9) 25%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0) 100%
    )`;

    return {
      opacity: 1,
      WebkitMaskImage: maskImage,
      maskImage: maskImage,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
    >
      {/* Original image layer */}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        className="object-cover [will-change:transform]"
        style={{
          transform: parallaxTransform,
        }}
      />

      {/* ASCII image layer - only render when in view */}
      {isInView && asciiSrc && (
        <Image
          src={asciiSrc}
          alt={`${alt} - ASCII`}
          fill
          unoptimized
          sizes={sizes}
          className="absolute inset-0 w-full h-full pointer-events-none [will-change:mask-image] object-cover"
          style={{
            transform: parallaxTransform,
            ...getMaskStyle(),
          }}
        />
      )}
    </div>
  );
}
