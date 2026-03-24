# StyleSense AI

**Context-aware AI wardrobe assistant** — plan outfits from your digital closet using weather, location, and style preferences. Includes a marketing site and a full web app (dashboard, wardrobe, memories, travel planner, style match, analytics).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)

---

## Features (MVP)

| Area | Description |
|------|-------------|
| **Auth** | Email + password (register at `/register`, sign in at `/login`) |
| **Marketing site** | Landing page with features, showcase, how it works, testimonials, pricing, CTA |
| **Dashboard** | Today’s weather, rule-based outfit suggestion, stats, recent memories |
| **Digital wardrobe** | Add items with optional photo upload; data stored per user in PostgreSQL |
| **Outfit memory** | Timeline with optional **historical weather** (Open-Meteo archive by place + date) |
| **Travel planner** | Destination + dates, **forecast** via Open-Meteo (server-side, no API key), saved trips |
| **Style match** | Inspiration cards and tag-based wardrobe scoring |
| **Analytics** | Charts for categories, colors, styles, seasons |
| **Profile** | Preferences synced to the database |
| **Suggestion feedback** | Dashboard “Love it” / “Not quite” saves feedback with item IDs + weather snapshot for tuning |
| **Photo EXIF + place** | Upload parses EXIF (date, GPS); reverse geocoding fills place; optional fields editable before save |
| **AI garment detection** | After upload, **Detect garment with AI** uses **Gemini** (`GEMINI_API_KEY`) when set, else **OpenAI** (`OPENAI_API_KEY`) |
| **Geocoding** | `GET /api/geocode/reverse?lat=&lng=` (Open-Meteo, auth required) |

Client state uses **Zustand**; all wardrobe and profile data is loaded and saved through **REST API routes** backed by **Prisma** + **PostgreSQL**.

After pulling schema changes, sync the database: `npx prisma db push` or `npx prisma migrate dev`.

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Auth:** [Auth.js / next-auth](https://authjs.dev/) v5 (credentials)
- **Database:** [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) ORM
- **UI:** React 19, [Tailwind CSS](https://tailwindcss.com/) 4
- **State:** [Zustand](https://github.com/pmndrs/zustand)
- **Charts:** [Recharts](https://recharts.org/)
- **Motion:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Optional uploads:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (falls back to inline data URLs for small images in dev)
- **EXIF:** [exifr](https://github.com/MikeKovarik/exifr) on the server during upload
- **Weather:** [Open-Meteo](https://open-meteo.com/) (forecast, geocoding, archive — no API key)
- **Garment AI:** [Google Gemini](https://ai.google.dev/) (primary) or [OpenAI](https://platform.openai.com/) vision

---

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm** (or pnpm / yarn)
- **PostgreSQL** database (local or hosted, e.g. [Supabase](https://supabase.com) or [Neon](https://neon.tech))

---

## Full setup (local)

For **database + auth in detail**, follow **[PostgreSQL and Auth.js setup](#postgresql-and-authjs-setup)** first, then continue here.

1. **Open a terminal in the app folder** (the directory that contains this `README` and `package.json`):

   ```bash
   cd stylesense-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a PostgreSQL database** (local `createdb`, or Neon/Supabase dashboard) and note the connection string.

4. **Environment files**

   - Create **`.env`** with **`DATABASE_URL`** and **`DIRECT_URL`** (Prisma CLI reads `.env` by default; see [§ A](#a-postgresql-recommended-supabase-or-neon)).
   - Create **`.env.local`** with **`AUTH_SECRET`** (`openssl rand -base64 32`) and any optional keys below.

   See **`.env.example`** for all variable names. Copy it and split into `.env` / `.env.local` as needed.

5. **Create tables**

   ```bash
   npx prisma db push
   ```

   Or, if you use migrations: `npx prisma migrate dev --name init`.

   Optional — **demo login** (see [Demo account](#e-demo-account-optional)):

   ```bash
   npm run db:seed
   ```

6. **Run the dev server**

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) (or the port shown if 3000 is busy) — marketing at `/`, register at `/register`, app at `/app` after sign-in.

---

## External APIs and services (complete list)

Everything the app can talk to outside your machine. Only **PostgreSQL** and **Auth** secrets are strictly required for core login + CRUD.

| # | Service | Used for | Key / configuration | Required? |
|---|---------|----------|---------------------|-----------|
| 1 | **PostgreSQL** | All app data (users, wardrobe, trips, …) | `DATABASE_URL`, `DIRECT_URL` | **Yes** |
| 2 | **Auth.js / NextAuth** | Sessions and JWT signing | `AUTH_SECRET` | **Yes** (prod) |
| 3 | **Auth.js** | Correct callbacks in production | `AUTH_URL` (e.g. `https://yoursite.vercel.app`) | **Yes** on Vercel |
| 4 | **[Open-Meteo](https://open-meteo.com/)** | **Current weather**, **multi-day forecast**, **city → coordinates**, **historical** memories, **reverse** geocode (EXIF) | *No API key* | Public API; falls back to **mock** data only if geocoding/network fails |
| 5 | **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** | Durable image URLs for wardrobe/uploads | `BLOB_READ_WRITE_TOKEN` | No — small images can fall back to **data URLs** (dev / limited) |
| 6 | **[Google Gemini](https://ai.google.dev/)** | **Detect garment with AI** (vision → fields) | `GEMINI_API_KEY`, optional `GEMINI_GARMENT_MODEL` | No — feature disabled without AI key |
| 7 | **[OpenAI](https://platform.openai.com/)** | Same garment feature **if Gemini is not configured** | `OPENAI_API_KEY`, optional `OPENAI_GARMENT_MODEL` | No |

**Garment AI:** configure **either** `GEMINI_API_KEY` **or** `OPENAI_API_KEY` (or both — Gemini wins if both are set).

**Weather:** no OpenWeather key — dashboard and planner use **Open-Meteo** only.

---

## Free tiers (optional APIs — good for development)

Use these so you stay on free or low-cost plans while building. Limits change over time — check each provider’s pricing page.

| Service | Free / low-cost option | Notes |
|---------|------------------------|--------|
| **PostgreSQL** | [Supabase](https://supabase.com) or [Neon](https://neon.tech) free tier | Supabase: **transaction** + **session** pooler URLs in § A. Neon: duplicate one URL for both vars. |
| **Open-Meteo** | Always free (non-commercial friendly) | No key; **current + forecast + geocoding + historical** weather in this app. |
| **Google Gemini** | [Google AI Studio](https://aistudio.google.com/apikey) | Free tier with **rate limits**; fine for testing garment detection. |
| **OpenAI** | Not permanently free | Optional fallback for garment AI; prefer **Gemini** if you want $0. |
| **Vercel Blob** | Included allowance on [Vercel Hobby](https://vercel.com/docs/storage/vercel-blob#pricing) | Optional; dev can skip and use small uploads / data URLs. |

---

## PostgreSQL and Auth.js setup

StyleSense uses **Prisma** + **PostgreSQL** for data and **Auth.js (NextAuth v5)** for email/password sessions. You only need a connection string and a signing secret locally; production also needs **`AUTH_URL`**.

**Data storage:** With `DATABASE_URL` pointing at your Postgres host (e.g. Supabase), **sign-up creates a `User` row**, and **wardrobe items, memories, trips, and profile changes** are saved through the `/api/*` routes into the same database—nothing is stored only in the browser for those features.

### A. PostgreSQL (recommended: Supabase or Neon)

**Supabase uses two URLs in `.env`:**

| Variable | Use | Typical Supabase source |
|----------|-----|-------------------------|
| **`DATABASE_URL`** | App runtime (Next.js / Prisma Client) | **Transaction pooler**, port **6543** + `?pgbouncer=true&connection_limit=1&sslmode=require` |
| **`DIRECT_URL`** | `prisma db push`, `migrate`, introspection | **Session pooler**, same pooler host, port **5432** + `?sslmode=require` |

**Why two?** The transaction pooler is not meant for schema DDL. If you run **`npm run db:push`** with only **`DATABASE_URL` (6543)**, the command can **hang** or fail. Prisma needs **`DIRECT_URL`** pointing at the **session** pooler (**5432**), per [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase).

Turn on **Use IPv4 connection (Shared Pooler)** in the dashboard if you need IPv4.

**If `db push` fails with `P1001` on port 5432:** your network may block that port — try **phone hotspot** or another Wi‑Fi for the one-time `npm run db:push`.

#### Option 1 — Supabase (recommended)

1. Go to **[supabase.com](https://supabase.com)** → **New project** (pick a region and set a database password).
2. Open **Project Settings → Database** → **Connect**.
3. With **Use IPv4 connection (Shared Pooler)** on if needed, copy **Transaction pooler** (6543) and **Session pooler** (5432).
4. In **`stylesense-app/.env`**:

   ```env
   DATABASE_URL="postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-....pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
   DIRECT_URL="postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-....pooler.supabase.com:5432/postgres?sslmode=require"
   ```

   URL-encode special characters in the password if needed.

5. From **`stylesense-app`**, create tables: `npm run db:push` (or `npx prisma db push`).

**If `db push` fails with `P1001` on port `5432`:** your network is probably blocking outbound PostgreSQL (session pooler). The app can still use port **`6543`** for normal queries. Either use **phone hotspot** / another network and run `npm run db:push` once, **or** bootstrap without Prisma reaching port 5432:

1. In Supabase: **SQL Editor** → **New query**.
2. Paste the contents of **`prisma/supabase-init-from-empty.sql`** (regenerate anytime with `npm run db:generate-sql` after schema changes).
3. Run the query. Tables are created; **`npm run dev`** uses **`DATABASE_URL`** (6543) and should work.

#### Option 2 — Neon

1. **[neon.tech](https://neon.tech)** → create a project → copy the **connection string** (URI, usually includes `sslmode=require`).
2. Set **`DATABASE_URL`** and **`DIRECT_URL`** to the **same** string.

3. Run `npm run db:push`.

**Alternative — local Postgres:** install Postgres, run `createdb stylesense`, then set **`DATABASE_URL`** and **`DIRECT_URL`** to the same URI, e.g.  
`postgresql://USER:PASSWORD@localhost:5432/stylesense`.

### B. Auth.js — `AUTH_SECRET`

Auth.js signs session tokens with **`AUTH_SECRET`**. Without it, auth is insecure or broken in production.

1. In a terminal, generate a random secret:

   ```bash
   openssl rand -base64 32
   ```

2. In **`stylesense-app/.env.local`** (create if needed; never commit this file), add:

   ```env
   AUTH_SECRET="paste-the-output-from-step-1"
   ```

3. Restart **`npm run dev`** after changing env files.

**Do not** reuse a secret from a tutorial or chat — generate your own.

### C. Auth.js — `AUTH_URL` (production / Vercel only)

For deployed apps, set the **canonical public URL** so cookies and redirects match your domain.

1. After first Vercel deploy, copy your URL, e.g. `https://stylesense-xxx.vercel.app`.
2. In Vercel → **Settings → Environment Variables**, add:

   ```text
   AUTH_URL = https://stylesense-xxx.vercel.app
   ```

   No trailing slash.

3. Redeploy. For a **custom domain**, set `AUTH_URL` to `https://yourdomain.com` instead.

Locally you can **omit** `AUTH_URL`; Next.js defaults to `http://localhost:3000` (or whatever port you use).

### D. Quick verification

1. `npm run dev` in **`stylesense-app`**.
2. Open **`/register`**, create an account.
3. Sign in at **`/login`**, then open **`/app`**.

If registration fails, check the terminal for errors and confirm **`DATABASE_URL`**, **`DIRECT_URL`**, and **`AUTH_SECRET`** are loaded (and that **`npm run db:push`** succeeded).

### E. Demo account (optional)

After **`npm run db:push`**, create a test user (same credentials as **`src/lib/demo-account.ts`**):

```bash
npm run db:seed
```

- **Email:** `demo@stylesense.app`  
- **Password:** `StyleSenseDemo!` (override with **`DEMO_SEED_PASSWORD`** when seeding if you want a different password)

On **`/login`**, use **Fill demo email & password** (shown in **development** automatically, or set **`NEXT_PUBLIC_SHOW_DEMO_LOGIN=true`** on Vercel so testers see it).

To **skip** seeding (e.g. CI): `SEED_DEMO_ACCOUNT=false npm run db:seed`.

**Production:** A shared demo password is weak for public apps — remove the demo user, change the password, or turn off **`NEXT_PUBLIC_SHOW_DEMO_LOGIN`** when you go live.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync Prisma schema to DB (`db push`) |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production (`migrate deploy`) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Create/update demo user (`demo@stylesense.app`) + inspirations + sample wardrobe when empty |

---

## Environment variables

Never commit real secrets. See **`.env.example`**.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | App queries: Supabase **transaction pooler** `6543` + Prisma params, or Neon/local URI. Put in **`.env`**. |
| `DIRECT_URL` | **Yes** | Prisma CLI (`db push`, migrate): Supabase **session pooler** `5432`, or **same as `DATABASE_URL`** for Neon/local. Put in **`.env`**. |
| `AUTH_SECRET` | **Yes** (prod) | JWT/session signing (`openssl rand -base64 32`). Typically **`.env.local`**. |
| `AUTH_URL` | **Yes** on Vercel | Canonical URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `BLOB_READ_WRITE_TOKEN` | No | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob); data URL fallback for small images without it. |
| `GEMINI_API_KEY` | No* | **Preferred** garment AI — [Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_GARMENT_MODEL` | No | Default `gemini-2.0-flash`; try `gemini-1.5-flash` if needed. |
| `OPENAI_API_KEY` | No* | Garment AI **only if** `GEMINI_API_KEY` is unset. |
| `OPENAI_GARMENT_MODEL` | No | Default `gpt-4o-mini`. |
| `NEXT_PUBLIC_SHOW_DEMO_LOGIN` | No | `true` = show demo “Fill email & password” on `/login` (prod). Dev shows it automatically. |
| `DEMO_SEED_PASSWORD` | No | Used only by **`npm run db:seed`** to set demo user password (default in code). |
| `SEED_DEMO_ACCOUNT` | No | `false` = **`db:seed`** skips creating the demo user. |

\*Garment detection needs **at least one** of `GEMINI_API_KEY` or `OPENAI_API_KEY`.

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. **Import** the repo in Vercel → framework **Next.js**.
3. Set **Root Directory** to **`stylesense-app`** if the repository root is the parent `StyleSense` folder.
4. Add **Environment Variables** for Production (and Preview if you use them): `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL` (use your real `.vercel.app` or custom domain URL), then optional keys from the table above.
5. **Deploy**, then sync the production database from your machine:

   ```bash
   DATABASE_URL="your-pooled-url" DIRECT_URL="your-session-or-same-url" npx prisma db push
   DATABASE_URL="your-pooled-url" DIRECT_URL="your-session-or-same-url" npm run db:seed
   ```

   Or `npx prisma migrate deploy` if you ship migration files.

6. **Redeploy** after changing env vars.

7. Optional: connect **Vercel Blob** in the project and add `BLOB_READ_WRITE_TOKEN`.

---

## Project structure (excerpt)

```
prisma/
  schema.prisma              # User, wardrobe, memories, trips, inspirations
  seed.ts                    # Demo user (`npm run db:seed`)
src/
  app/
    api/                     # REST: auth, me, wardrobe, memories, trips, weather, upload, analyze/garment
    login/                   # Sign in
    register/                # Sign up
    app/                     # Protected app routes
  auth.ts                    # NextAuth configuration
  middleware.ts              # Protects /app/*
  lib/
    store.ts                 # Zustand + API sync
    server-weather.ts        # Open-Meteo (forecast, geo, archive — server)
    garment-vision.ts        # Gemini / OpenAI vision → garment fields
    weather.ts               # Client fetch helpers → /api/weather/*
```

---

## Design & product docs

- `deep-research-report (1).md` (parent folder) — roadmap, APIs, architecture ideas

---

## Roadmap (next)

- OAuth providers (Google, Apple)
- React Native mobile app
- Rate limiting and stricter upload policies

---

## License

This project is private unless you add an explicit license. If you open-source it, replace this section with e.g. [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  <strong>StyleSense AI</strong> — dress smarter with context-aware outfit intelligence.
</p>
