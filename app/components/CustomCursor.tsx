"use client";

import { useEffect, useState, useCallback } from "react";

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isPressed: boolean;
  isVisible: boolean;
}

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [cursor, setCursor] = useState<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    isPressed: false,
    isVisible: false,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursor((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
      isVisible: true,
    }));
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursor((prev) => ({ ...prev, isVisible: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setCursor((prev) => ({ ...prev, isPressed: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setCursor((prev) => ({ ...prev, isPressed: false }));
  }, []);

  useEffect(() => {
    // Check for touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setMounted(true);

    // Track hover state on interactive elements
    const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';
    
    const handleElementEnter = () => {
      setCursor((prev) => ({ ...prev, isHovering: true }));
    };
    
    const handleElementLeave = () => {
      setCursor((prev) => ({ ...prev, isHovering: false }));
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Add hover listeners to interactive elements
    const addHoverListeners = () => {
      const elements = document.querySelectorAll(interactiveSelectors);
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleElementEnter);
        el.addEventListener("mouseleave", handleElementLeave);
      });
    };

    // Initial setup
    addHoverListeners();

    // Observer for dynamically added elements
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();

      const elements = document.querySelectorAll(interactiveSelectors);
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleElementEnter);
        el.removeEventListener("mouseleave", handleElementLeave);
      });
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  // Don't render until mounted (avoids hydration mismatch)
  if (!mounted) return null;

  return (
    <>
      {/* Main dot */}
      <div
        className="cursor-dot"
        style={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.isVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${cursor.isPressed ? 0.8 : cursor.isHovering ? 1.5 : 1})`,
        }}
      />
      
      {/* Glow ring (appears on hover) */}
      <div
        className="cursor-glow"
        style={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.isHovering && cursor.isVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${cursor.isPressed ? 0.9 : 1})`,
        }}
      />
    </>
  );
}
