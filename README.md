# Folio

Visual book tracker & TBR web app (Next.js 15, TypeScript, Tailwind 4, Prisma + Postgres). Feature scope and parallel work packages: [FEATURES.md](FEATURES.md).

## Run locally
```bash
cp .env.example .env          # set AUTH_SECRET (openssl rand -base64 32)
docker compose up -d db       # or any Postgres
npm install
npx prisma migrate dev
npm run dev                   # http://localhost:3000
```

## Deploy
- **Railway:** add a Postgres service, set `DATABASE_URL` (reference variable) and `AUTH_SECRET` on the web service. Build: `npm run build`. Start command: `npx prisma migrate deploy && npm start`.
- **Vercel:** use an external Postgres (Neon/Supabase/Railway), set `DATABASE_URL` and `AUTH_SECRET`, and run `npm run db:deploy` against it once (or as a build step).

Open Library needs no key; `GOOGLE_BOOKS_API_KEY` is optional.
