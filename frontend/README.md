# Stream — Video Streaming Platform (Frontend)

Next.js 14 app with App Router, TypeScript, and Tailwind CSS. Set up for a video streaming platform with a clean structure and no business logic yet.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **ESLint**

## Project Structure

Routes are grouped with [App Router route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups). Group names in parentheses do not affect URLs.

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── globals.css
│   ├── STRUCTURE.md         # Purpose of each route group
│   ├── (public)/            # Public routes: /, /browse, /watch/[id]
│   │   ├── layout.tsx       # Header + Footer
│   │   ├── page.tsx         # Home
│   │   ├── browse/page.tsx
│   │   └── watch/[id]/page.tsx
│   ├── (auth)/              # Auth routes: /login, /signup
│   │   ├── layout.tsx       # Centered card layout
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/         # User dashboard: /dashboard, /dashboard/...
│   │   ├── layout.tsx       # Sidebar + main
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── library/page.tsx
│   │       └── settings/page.tsx
│   └── (admin)/             # Admin: /admin, /admin/...
│       ├── layout.tsx       # Admin sidebar
│       └── admin/
│           ├── page.tsx
│           ├── content/page.tsx
│           └── users/page.tsx
├── components/
│   ├── layout/              # Header, Footer
│   └── ui/                  # Reusable UI components
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
└── hooks/
    └── index.ts
```

See `src/app/STRUCTURE.md` for a short explanation of each route group.

## Getting Started

Install dependencies (if needed):

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
