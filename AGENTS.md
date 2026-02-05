# AGENTS.md - Coding Guidelines for JOLAGREEN23 Site

## Project Overview

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 website for French rap artist JOLAGREEN23.

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000

# Production
npm run build        # Build for production (outputs to .next/)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint with Next.js config

# Note: No test runner configured. To add tests, install jest or vitest.
```

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS v4 + custom CSS
- **Animations**: Framer Motion, CSS animations
- **Linting**: ESLint 9 with eslint-config-next

## Code Style Guidelines

### File Organization

```
/app/                    # App Router (main application code)
  /components/           # React components
  layout.tsx            # Root layout (fonts, metadata)
  page.tsx              # Home page
  globals.css           # Global styles, Tailwind imports
/src/                   # Legacy/old files (not actively used)
/public/                # Static assets
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Hero.tsx`, `NavBar.tsx`)
- **Functions**: camelCase (e.g., `useImageToAscii`, `calculateOptimalSize`)
- **Interfaces/Types**: PascalCase (e.g., `AsciiConfig`, `Props`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ASCII_CHARS`, `GLITCH_CHARS`)
- **Files**: kebab-case or PascalCase for components

### Import Order

```typescript
// 1. React/Next imports
import { useState, useEffect } from "react";
import type { Metadata } from "next";

// 2. Third-party libraries
import { motion } from "framer-motion";

// 3. Absolute imports (path aliases)
import { SomeUtil } from "@/lib/utils";

// 4. Relative imports
import Hero from "./components/Hero";

// 5. CSS imports (last)
import "./globals.css";
```

### TypeScript Guidelines

- Use `type` keyword for type-only imports: `import type { Metadata }`
- Props interfaces should use `Readonly<>`: 
  ```typescript
  export default function Component({ children }: Readonly<{ children: React.ReactNode }>)
  ```
- Use explicit return types on exported functions when complex
- Enable strict mode (already configured in tsconfig.json)

### React Patterns

- **Client Components**: Add `"use client"` directive at top for components using:
  - `useState`, `useEffect`, `useRef`, etc.
  - Browser APIs (window, document, localStorage)
  - Event handlers that need JS
- **Server Components**: Default - no directive needed
- **Custom Hooks**: Define in same file if single-use, or in `/hooks` directory
- **Refs**: Always type them: `const ref = useRef<HTMLDivElement>(null)`

### Styling Guidelines

- **Tailwind first**: Use Tailwind utility classes as primary styling method
- **Custom CSS**: Use `globals.css` for:
  - CSS custom properties (design tokens)
  - Complex animations (`@keyframes`)
  - Global effects (scrollbars, selections)
  - Component patterns that need raw CSS
- **Inline styles**: OK for dynamic values (calculated sizes, transforms)

### CSS Custom Properties (Design Tokens)

```css
:root {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --accent: #00ff66;      /* Brand green */
}
```

Access in Tailwind: `bg-background`, `text-accent`

### Error Handling

- Use `try/catch` for async operations
- Handle image loading errors:
  ```typescript
  img.onerror = () => {
    console.error("Failed to load image");
    setIsLoading(false);
  };
  ```
- Type-safe optional chaining: `const ctx = canvas.getContext("2d"); if (!ctx) return;`

### Animation Guidelines

- Use CSS animations for simple, infinite loops (performance)
- Use Framer Motion for:
  - Entry/exit animations
  - Gesture-based interactions
  - Complex sequences
- Always clean up:
  ```typescript
  useEffect(() => {
    const id = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(id);
  }, []);
  ```

### Git Ignore Patterns

```
.next/
out/
build/
node_modules/
*.log
.env*.local
```

## Important Notes

- **App Router Location**: Main code is in `/app/` (not `/src/app/`)
- **Path Alias**: `@/*` maps to `./src/*` but currently unused
- **Images**: Remote patterns configured for Spotify, Instagram, YouTube, i-P RMCDN
- **TypeScript**: `ignoreBuildErrors: true` in next.config.ts (remove for production)
- **Custom Cursor**: `cursor: none` is set globally in CSS

## VS Code Extensions (Recommended)

- ESLint
- Tailwind CSS IntelliSense
- TypeScript Hero
- Next.js snippets
