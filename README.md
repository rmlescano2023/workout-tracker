# Workout Tracker

## What's here so far

- `prisma/schema.prisma` - the entire data model (exercises, workout templates,
  weekly schedule, run types, logs). This is the most important file to
  understand - everything else is built on top of it.
- `app/page.tsx` - "Today" page, shows what's scheduled for today.
- `app/api/today/route.ts` - a backend API endpoint at `/api/today`.
- `prisma/seed.ts` - fills the database with sample data matching your
  routine, so you have something to look at right away.

## Running it locally

1. **Install dependencies**
   ```
   npm install
   ```

2. **Get a free Postgres database** - go to https://neon.tech, sign up,
   create a project, and copy the connection string it gives you.

3. **Set up your environment file**
   ```
   cp .env.example .env
   ```
   Paste your Neon connection string in as `DATABASE_URL`.

4. **Create the actual database tables from the schema**
   ```
   npx prisma migrate dev --name init
   ```

5. **Load sample data**
   ```
   npm run seed
   ```

6. **Run the app**
   ```
   npm run dev
   ```
   Open http://localhost:3000 - you should see today's training.

## Deploying so you can access it anywhere

1. Push this project to a GitHub repo.
2. Go to https://vercel.com, sign in with GitHub, "Import Project", pick
   this repo.
3. Add an environment variable `DATABASE_URL` in Vercel's project settings
   (same Neon connection string from step 2 above).
4. Deploy. You'll get a URL like `workout-tracker.vercel.app` that works
   from your phone, anywhere, anytime - no laptop required.

Every time you `git push` after this, Vercel automatically redeploys.

## What's next (not built yet)

- Calendar month view
- Logging actual sets/weights during a workout
- Progressive overload suggestions
- Running plan phases (base building -> tempo/interval/LSD)
- Push notifications
