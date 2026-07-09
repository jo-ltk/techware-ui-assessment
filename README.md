# Techware

Production-quality frontend application scaffold for a UI Developer interview project.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- Lucide React

## Project Structure

```
├── app/           # Next.js routes and layouts
├── components/    # Reusable UI primitives
├── sections/      # Page-level vertical slices
├── hooks/         # Custom React hooks
├── lib/           # Animation orchestration and integrations
├── utils/         # Pure utility functions
├── constants/     # Static configuration values
├── types/         # Shared TypeScript definitions
└── styles/        # Global CSS and design tokens
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Conventions

- **Absolute imports** via `@/` alias (configured in `tsconfig.json`)
- **Barrel exports** (`index.ts`) at module boundaries
- **One component per folder** with co-located `index.ts`
- **Sections compose components** — never the reverse

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm run start` | Start production server |
| `npm run lint`  | Run ESLint             |
