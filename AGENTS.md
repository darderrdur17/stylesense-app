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

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
