# StyleSense AI

**Context-aware AI wardrobe assistant** — plan outfits from your digital closet using weather, location, and style preferences. Includes a marketing site and a full web app (dashboard, wardrobe, memories, travel planner, style match, analytics).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)

---

## Features

| Area | Description |
|------|-------------|
| **Marketing site** | Landing page with features, showcase, how it works, testimonials, pricing, CTA |
| **Dashboard** | Today’s weather, AI outfit suggestion, quick stats, recent memories |
| **Digital wardrobe** | Add, filter, sort, and favorite clothing items (persisted locally) |
| **Outfit memory** | Timeline of past outfits with location and weather context |
| **Travel planner** | Destination + dates, forecast-based daily outfit ideas, saved trips |
| **Style match** | Inspiration cards and tag-based matching against your wardrobe |
| **Analytics** | Charts for categories, colors, styles, seasons, and wear frequency |
| **Profile** | Preferences and wardrobe summary |

Data is stored in the browser via **Zustand** + `localStorage` (demo-friendly; production would use a backend).

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **UI:** React 19, [Tailwind CSS](https://tailwindcss.com/) 4
- **State:** [Zustand](https://github.com/pmndrs/zustand) with persistence
- **Charts:** [Recharts](https://recharts.org/)
- **Motion:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm** (or pnpm / yarn)

---

## Getting started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/stylesense-app.git
cd stylesense-app

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — marketing site at `/`, app at `/app`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |

---

## Environment variables

Create a `.env.local` file in the project root (never commit secrets):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | No | [OpenWeather](https://openweathermap.org/api) API key. If omitted, the app uses **mock weather** so everything still works. |

Example:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
```

For **Vercel**: Project → **Settings** → **Environment Variables** → add the same name/value for Production (and Preview if needed), then redeploy.

> **Note:** Keys prefixed with `NEXT_PUBLIC_` are exposed to the browser. For production hardening, move weather requests to a [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) and use a server-only secret.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Marketing landing
│   ├── layout.tsx            # Root layout & metadata
│   ├── globals.css           # Design tokens & utilities
│   └── app/                  # Authenticated-style app shell
│       ├── layout.tsx        # Sidebar + header
│       ├── page.tsx          # Dashboard
│       ├── wardrobe/
│       ├── memories/
│       ├── planner/
│       ├── style-match/
│       ├── analytics/
│       └── profile/
├── components/
│   ├── landing/              # Navbar, Hero, Features, etc.
│   └── app/                  # Sidebar, AppHeader
└── lib/
    ├── types.ts              # Shared TypeScript types
    ├── store.ts              # Zustand store
    ├── data.ts               # Sample seed data
    ├── utils.ts              # Outfit logic & helpers
    └── weather.ts            # OpenWeather + mock fallback
```

---

## Deployment

This app is a static-friendly Next.js build and deploys well on **[Vercel](https://vercel.com)**:

1. Push this repo to GitHub.
2. Import the repo in Vercel (framework: Next.js).
3. Add environment variables if using real weather.
4. Deploy — production URL will be assigned (e.g. `*.vercel.app`).

You can also deploy with the Vercel CLI: `vercel` / `vercel --prod`.

---

## Design & product docs

Higher-level specs and research (if kept alongside the repo in the monorepo):

- `StyleSense_Design.md` — UI/UX theme and principles  
- `StyleSense_MVP.md` — MVP scope and stack notes  
- `deep-research-report (1).md` — roadmap, APIs, architecture ideas  

---

## Roadmap (ideas)

- User authentication and cloud sync  
- Server-side API + database  
- Real image upload and storage  
- Historical weather for outfit memories  
- Garment detection (ML / third-party API)  
- React Native mobile app  

---

## License

This project is private unless you add an explicit license. If you open-source it, replace this section with e.g. [MIT License](https://opensource.org/licenses/MIT).

---

## Contributing

1. Fork / branch from `main`  
2. Make changes and run `npm run build`  
3. Open a pull request with a short description  

---

<p align="center">
  <strong>StyleSense AI</strong> — dress smarter with context-aware outfit intelligence.
</p>
