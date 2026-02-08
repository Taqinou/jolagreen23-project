# AGENTS.md - jolagreen23-site

## Project Overview

Next.js 16 artist portfolio website for JOLAGREEN23 with interactive ASCII art effects, custom cursor, and smooth animations.

**Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion

---

## Commands

```bash
# Development (runs opencode agent then Next.js dev server)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Run ESLint on specific file
npx eslint app/components/Hero.tsx

# Install dependencies
npm install
```

**Note**: No test framework is configured. Add Vitest or Jest if testing is needed.

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - always define types explicitly
- Use `type` for object shapes, `interface` for extensible contracts
- Prefix React event handler props with `on` (e.g., `onPointerMove`)
- Use explicit return types for complex functions

### Imports

```typescript
// 1. React imports first
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// 2. Next.js imports
import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";

// 3. Third-party libraries
import { motion } from "framer-motion";

// 4. Local components (relative paths)
import CustomCursor from "./components/CustomCursor";

// 5. Styles last
import "./globals.css";
```

### Component Structure

```typescript
"use client"; // If using hooks/browser APIs

// 1. Constants
const ASCII_CHARS = "@#W$9876543210?!abc;:+=-,._ ";

// 2. Types/Interfaces
interface GlitchPosition {
  lineIdx: number;
  charIdx: number;
}

// 3. Helper functions
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// 4. Custom hooks
function useImageToAscii(imageSrc: string) { ... }

// 5. Main component
export default function Hero() {
  // hooks at top
  const [state, setState] = useState(0);
  
  // effects
  useEffect(() => { ... }, []);
  
  // handlers
  const handleClick = useCallback(() => { ... }, []);
  
  // render
  return (...);
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Hero.tsx`, `CustomCursor.tsx`)
- **Functions**: camelCase (e.g., `calculateOptimalSize`, `useGlitchEffect`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ASCII_CHARS`, `NAV_LINKS`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `GlitchPosition`, `AsciiConfig`)
- **Files**: Match default export name (e.g., `Navigation.tsx` exports `Navigation`)

### CSS/Styling

- Use Tailwind CSS utility classes as primary styling method
- Custom CSS in `globals.css` with CSS variables for theming
- Font families via CSS variables: `--font-display`, `--font-body`, `--font-mono`
- Colors: `--background`, `--foreground`, `--accent` (#00ff66)
- Use `@theme inline` for Tailwind v4 theme configuration

### Hooks Best Practices

- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations
- Clean up effects properly (remove listeners, cancel animation frames)
- Use `useRef` for mutable values that don't trigger re-renders

```typescript
useEffect(() => {
  const handleScroll = () => { ... };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### Error Handling

- Use console.error for debugging, but handle gracefully in UI
- Check for null/undefined before accessing DOM elements
- Validate image loading with onerror handlers

### Performance

- Use `will-change` CSS property sparingly for animated elements
- Prefer `transform` and `opacity` for animations
- Use passive event listeners for scroll/resize handlers
- Implement requestAnimationFrame for smooth animations

### Accessibility

- Include `aria-hidden="true"` for decorative elements
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`)
- Maintain keyboard navigation support

---

## Project Structure

```
app/
├── components/          # React components (PascalCase)
│   ├── Hero.tsx
│   ├── Navigation.tsx
│   └── CustomCursor.tsx
├── page.tsx            # Home page
├── layout.tsx          # Root layout with fonts/metadata
└── globals.css         # Global styles, Tailwind, fonts

public/
├── fonts/              # Custom font files
├── images/             # Image assets
└── favicon/            # Favicon files
```

---

## Important Notes

- **Path alias**: `@/*` is configured but there's no `src/` directory - use relative imports
- **Images**: Configured with remotePatterns in `next.config.ts`, unoptimized mode enabled
- **TypeScript**: Build errors are ignored in production (`ignoreBuildErrors: true`)
- **Turbopack**: Enabled with root resolution
- **Development**: Includes react-grab/opencode for visual editing
