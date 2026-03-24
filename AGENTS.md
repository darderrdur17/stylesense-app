<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project context

- **Setup, env split (`.env` vs `.env.local`), Vercel, and every external API** are documented in `README.md` and `.env.example`.
- **Prisma:** Put **`DATABASE_URL`** and **`DIRECT_URL`** in `.env` (see `.env.example`). **Supabase:** transaction pooler `6543` for `DATABASE_URL`, session pooler `5432` for `DIRECT_URL`. **Neon/local:** same URI for both.
- **Demo user:** `npm run db:seed` after `db:push` — see `src/lib/demo-account.ts` and README § Demo account.
- **Auth parity:** Demo and self-registered users share the same `User` model, `/api/me`, and credentials flow — no demo-only API paths.
- **Mobile / responsive:** `viewport` includes `interactiveWidget: resizes-content`; `html` uses `overflow-x-clip`; body and app shell use `min-h-[100dvh]` + safe-area padding; form fields use `text-base sm:text-sm` where needed to avoid iOS input zoom; landing nav + app sidebar drawers respect safe areas; `.card-hover` lift only applies on `(hover: hover)` fine pointers.
- **Style Match creators:** `src/lib/creator-curated.ts` — hand-curated URLs per style (no IG/TikTok scraping). Edit there or swap for CMS / official APIs later.
