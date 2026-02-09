# Scope Sentry - Contract Risk Scanner

## Overview

Scope Sentry is a "Contract Risk Scanner" web application that analyzes freelance Scope of Work (SOW) text for vague language, scope creep triggers, and contractual risk. Users paste contract clauses into a text area, and the app returns a risk score (0-100), identified red flags, and suggested fixes for problematic clauses.

The app follows a "Boardroom Quality" dark-mode-only design aesthetic with an obsidian/charcoal color palette, gold accents for actions, green for safe indicators, and red for risk indicators. Typography uses Inter for UI and JetBrains Mono for data display.

The contract analysis endpoint uses Google Gemini 2.0 Flash to perform real AI-powered analysis of contract text, returning risk scores and detailed red flags with suggested fixes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Structure
The project uses a monorepo layout with three main directories:
- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API + static serving)
- **`shared/`** — Shared types and database schema used by both client and server

### Frontend Architecture
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack React Query for server state management
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming, dark mode only (class-based)
- **Animations:** Framer Motion for UI transitions (risk gauge animation, panel reveals)
- **Build Tool:** Vite with React plugin
- **Path Aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework:** Express 5 on Node.js
- **Language:** TypeScript, executed via `tsx` in development
- **API Pattern:** RESTful JSON API under `/api/` prefix
- **Key Endpoint:** `POST /api/analyze` — accepts contract text, sends it to Gemini 2.0 Flash for analysis, returns risk score and flags
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`) with structured JSON output
- **Request Validation:** Zod schemas for input validation
- **Build:** esbuild bundles server to `dist/index.cjs` for production; Vite builds client to `dist/public/`

### Development Setup
- In development, Vite dev server runs as middleware inside Express (HMR via `server/vite.ts`)
- In production, Express serves the pre-built static files from `dist/public/`
- Dev command: `npm run dev` — runs the Express server with Vite middleware
- Build command: `npm run build` — builds both client and server
- Start command: `npm start` — runs the production bundle

### Database
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts`
- **Current Schema:** A single `users` table with `id` (UUID), `username`, and `password` fields
- **Migration:** `npm run db:push` uses drizzle-kit to push schema to the database
- **Storage Layer:** `server/storage.ts` defines an `IStorage` interface with a `MemStorage` in-memory implementation currently in use. The database schema exists but the app doesn't actively use Postgres for the main feature yet.
- **Connection:** Requires `DATABASE_URL` environment variable for PostgreSQL

### Data Flow
1. User pastes contract text in the left panel textarea
2. Click "Analyze Risk" triggers a `POST /api/analyze` with the text
3. Server validates input with Zod, sends text to Gemini 2.0 Flash with a Legal Risk Analyst prompt, validates the AI response with Zod
4. Frontend displays risk gauge (0-100 score), red flags list with severity badges, and fix suggestions in the right panel with animated transitions

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required by drizzle config)
- `GEMINI_API_KEY` — Google Gemini API key for contract analysis

### Key Third-Party Libraries
- **@tanstack/react-query** — Server state management and caching
- **drizzle-orm / drizzle-kit** — Database ORM and migration tooling for PostgreSQL
- **drizzle-zod** — Generates Zod schemas from Drizzle table definitions
- **zod** — Runtime schema validation (used in both client and server)
- **framer-motion** — Animation library for UI transitions
- **wouter** — Lightweight client-side routing
- **shadcn/ui + Radix UI** — Component library (many Radix primitives installed)
- **connect-pg-simple** — PostgreSQL session store (available but not actively used)
- **lucide-react** — Icon library

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Runtime error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (conditional, dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (conditional, dev only)

### Fonts (External)
- Google Fonts: Inter, JetBrains Mono, DM Sans, Fira Code, Geist Mono, Architects Daughter (loaded via CDN in `index.html`)

### Active Integrations
- **Google Generative AI (Gemini 2.0 Flash)** — Powers real-time contract risk analysis via `@google/generative-ai` SDK

### External Links
- HoneyBook (`https://www.honeybook.com/`) — Contract template affiliate link
- Udaller Command Center (`https://udaller.one`) — Project tracking upsell link