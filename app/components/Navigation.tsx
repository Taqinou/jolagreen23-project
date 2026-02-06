"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "RELEASES", href: "#releases" },
  { label: "VISUALS", href: "#visuals" },
  { label: "LIVE", href: "#live" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateNavHeight = () => {
      document.documentElement.style.setProperty("--nav-height", `${header.offsetHeight}px`);
    };

    updateNavHeight();

    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(header);
    window.addEventListener("resize", updateNavHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateNavHeight);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 mix-blend-difference ${
        scrolled ? "py-4" : "py-6 md:py-8"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12">
        {/* Logo - Left */}
        <a
          href="#"
          className="font-display text-white text-xs md:text-sm tracking-[0.2em] font-normal uppercase"
        >
          JOLAGREEN23
        </a>

        {/* Navigation Links - Right */}
        <nav className="flex items-center gap-8 md:gap-12">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-display text-white text-xs md:text-sm tracking-[0.15em] uppercase opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
