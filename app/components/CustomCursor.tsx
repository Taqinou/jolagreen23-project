"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rootActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const isVisibleRef = useRef(false);
  const isPressedRef = useRef(false);
  const xRef = useRef(0);
  const yRef = useRef(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    const renderCursor = (): void => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      const scale = isPressedRef.current ? 0.95 : 1;
      cursor.style.transform = `translate3d(${xRef.current + 10}px, ${yRef.current + 10}px, 0) scale(${scale})`;
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
      const coalesced = event.getCoalescedEvents();
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
      fontFamily: "var(--font-space), var(--font-display), sans-serif",
      fontSize: "28px",
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      textShadow:
        "0 0 6px rgba(var(--accent-rgb), 0.58), 0 0 14px rgba(var(--accent-rgb), 0.3)",
      userSelect: "none",
      display: "inline-block",
    }),
    []
  );

  return (
    <div ref={cursorRef} style={cursorStyle}>
      <span style={textStyle}>23</span>
    </div>
  );
}
