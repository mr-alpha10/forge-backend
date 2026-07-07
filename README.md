# Forge — backend

The persistence layer for the workout tracker: accounts, the full exercise
library in Postgres, routines, and saved workout history (the "beat last time"
recall, backed by the database instead of browser memory).

Stack: Next.js (App Router) · Prisma · Neon Postgres · JWT auth.

## What's here

```
prisma/
  schema.prisma          User, Exercise, Routine/Day/Exercise, WorkoutSession, SetLog
  exercises.seed.json    891 rows (873 from free-exercise-db + 18 curated warm-ups)
  seed.mjs               loads the seed file into Postgres
lib/
  prisma.ts              Prisma client singleton
  auth.ts                hashing + JWT + getUserId(req)
  muscles.ts             browse-group -> muscle mapping (shared by seed + API)
app/api/
  auth/register          POST  -> { token, user }
  auth/login             POST  -> { token, user }
  me                     GET   (auth) current user
  exercises              GET   ?group=&section=&q=&equipment=
  exercises/[id]         GET   one exercise (+ lastSession when authed = recall)
  exercises/[id]/history GET   (auth) every logged session, newest first
  sessions               POST  (auth) log a workout
  routines               GET/POST (auth)
```

## Setup

This is the backend layer — drop it into a fresh Next.js app (or merge into your
existing one). From the project root:

1. Install deps
   ```
   npm install
   ```
2. Create `.env` from the example and fill in your Neon URL + a JWT secret
   ```
   cp .env.example .env
   ```
3. Create the tables in Neon
   ```
   npm run db:push        # or: npx prisma migrate dev --name init
   ```
4. Seed the 891 exercises
   ```
   npm run db:seed
   ```
5. Run it
   ```
   npm run dev
   ```

`npm run db:studio` opens Prisma Studio if you want to eyeball the data.

## How the front end talks to it

- On register/login you get a JWT. Send it as `Authorization: Bearer <token>`
  on authed requests (or set it as a `token` cookie — `getUserId` reads either).
- The category screen calls `/api/exercises?group=chest&section=main` (and
  `section=cooldown`, `section=warmup`) plus optional `q` and `equipment`.
- The exercise screen calls `/api/exercises/:id`. When authed, the response
  includes `lastSession` — pre-fill the log form from `lastSession.sets`.
- Saving a workout is `POST /api/sessions` with
  `{ exerciseId, sets: [{ weightKg, reps, rpe? }], notes? }`.

## Images

The seed stores image paths as they appear in free-exercise-db
(e.g. `Barbell_Bench_Press_-_Medium_Grip/0.jpg`). Prefix them with
`NEXT_PUBLIC_IMAGE_BASE`. For production, copy the (resized) images to your own
R2 / Vercel Blob bucket and point the base there rather than hotlinking GitHub.

## Notes

- Route handlers set `runtime = "nodejs"` because bcrypt and jsonwebtoken need
  Node, not the Edge runtime.
- `bcryptjs` (pure JS) is used so there's no native build step on Vercel.
- Routine day/exercise editing isn't fully fleshed out — `POST /api/routines`
  shows the create shape; further edits are the same pattern against
  `prisma.routineDay` and `prisma.routineExercise`.

## Front end (included)

The UI is built and wired to the API — it's the demo's screens rebuilt as React
components that fetch live data and persist logs per user.

```
app/
  layout.tsx             fonts + globals
  globals.css            the dark cinematic design system
  page.tsx               renders <ForgeApp/>
components/
  ForgeApp.tsx           auth gate, phone frame, screen navigation
  AuthScreen.tsx         login / register
  Library.tsx            muscle grid + global search
  Category.tsx           warm-up / main / cool-down + search + equipment filter
  ExerciseDetail.tsx     start/finish photos, steps, target muscles, "last trained"
  LogSession.tsx         recall + editable sets -> POST /api/sessions
  ExerciseRow.tsx        shared list row
  icons.tsx              inline SVG icons
lib/
  api.ts                 typed client + JWT (localStorage) + IMAGE_BASE
  groups.ts              static metadata for the 9 browse categories
  format.ts              cap() + daysAgo()
```

Run `npm run dev`, open http://localhost:3000, register an account, and the full
loop works against the database: browse by muscle, search/filter, open an
exercise, log sets — refresh and your last session is still there, because it's
in Postgres now, not memory.

Auth note: the JWT is kept in `localStorage` and sent as a Bearer header. Fine
for a personal/shared app; if you later want stricter security, switch to an
httpOnly cookie (the `getUserId` helper already reads a `token` cookie too).

Not yet built (next step): the routine-builder screen + its day/exercise
endpoints.

## Calendar goals + routines (added)

**Calendar goals.** Set a note/goal on any date; when that date is today, it
surfaces at the top of the home screen as "Today's goal" with a checkbox.
- `GET /api/goals?date=YYYY-MM-DD` (a day) or `?from=&to=` (a month range)
- `POST /api/goals` `{ date, text }` · `PATCH /api/goals/:id` `{ done?, text? }` · `DELETE /api/goals/:id`
- UI: `components/Calendar.tsx` (month grid, dots on days with goals) and the
  banner in `components/Library.tsx`.

**Routines.** Build named routines, add days (Push / Pull / Legs…), and add
exercises to each day from the library.
- `GET/POST /api/routines` · `GET/PATCH/DELETE /api/routines/:id`
- `POST /api/routines/:id/days` · `DELETE /api/routines/days/:dayId`
- `POST /api/routines/days/:dayId/exercises` · `DELETE /api/routines/exercises/:itemId`
- UI: `components/Routines.tsx` (list, create, day + exercise editing with an
  inline search picker; tap an exercise to jump to its detail).

Remember to re-run `npm run db:push` after pulling this — the schema gained a
`Goal` table.

## Getting the database URLs (no Vercel needed)

You don't need to deploy to Vercel to get a Neon connection string.

1. Sign up at https://neon.tech (free), create a project.
2. Open the project → **Connection Details**. Copy two strings into `.env`:
   - **`DATABASE_URL`** — the pooled one (host contains `-pooler`). App runtime.
   - **`DIRECT_URL`** — the direct one (no `-pooler`). Used by `db push` / `seed`.
   (Toggle "Connection pooling" in the Neon UI to reveal each form.)
3. `npm run db:push` then `npm run db:seed`.

For production on Vercel: either add the Neon integration (it injects these vars
automatically — note Vercel names the direct one `DATABASE_URL_UNPOOLED`, so map
`DIRECT_URL` to that), or just paste the same two strings into Vercel → Settings
→ Environment Variables. To copy a deployment's env vars to your machine:
`vercel env pull .env.local`.
