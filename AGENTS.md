<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project context

- **Setup, env split (`.env` vs `.env.local`), Vercel, and every external API** are documented in `README.md` and `.env.example`.
- **Prisma:** `DATABASE_URL` belongs in `.env` so `npm run db:push` / CLI commands resolve the datasource.
