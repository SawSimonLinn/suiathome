# Sui at Home

Sui at Home is a recipe and cooking community built with Next.js. It includes public recipe browsing, recipe detail pages, user authentication, profiles, community posts, recipe interactions, admin recipe management, moderation, analytics, and AI-assisted recipe writing tools.

## Features

- Public recipe homepage with popular recipes and community "Tried It" posts
- Recipe listing, filtering, search, and detail pages
- Email/password and Google authentication through Supabase
- User profiles with bio, avatar, social links, saved recipes, favorites, and posts
- Recipe likes, saves, favorites, comments, threaded replies, and view tracking
- Community posts with images, comments, likes, profile links, and post detail pages
- Admin dashboard for recipes, categories, users, comments, analytics, and food requests
- AI-assisted ingredient and instruction generation for recipe creation
- Food request workflow with optional photo upload and admin email notification
- Supabase-backed database, auth, storage, and row level security

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Supabase Auth, Postgres, Storage, and RLS
- OpenAI API for admin recipe generation
- Genkit flows for local AI experimentation
- Nodemailer for food request notification emails
- Vercel Analytics
- Firebase App Hosting configuration

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` with the variables below.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# NEXT_PUBLIC_SUPABASE_ANON_KEY= # Optional fallback if no publishable key is used.

OPENAI_API_KEY=

# Optional: enables food request admin email notifications.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAIL=
```

Run the local development server:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:9002
```

## Supabase Setup

This app expects a Supabase project with Auth, Postgres, and Storage enabled.

1. Create or configure a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
3. Configure Supabase Auth redirect URLs for local development and production:

```text
http://localhost:9002/auth/callback
https://suiathome.com/auth/callback
```

4. Apply the database schema in `docs/supabase-data-schema.sql`.
5. Apply the admin upgrade script in `docs/supabase-admin-upgrade.sql`.
6. Apply the migration files in `supabase/migrations`.
7. Promote the first admin user after that user has signed up:

```sql
update public.profiles
set role = 'admin'
where id = '<supabase-auth-user-id>';
```

The SQL creates or updates the app tables, RLS policies, and storage buckets used by the app, including:

- `recipe-images`
- `community-images`
- `food-request-photos`

Note: the recipe and community schema references a `public.profiles` table keyed by Supabase auth user IDs. Make sure your Supabase project has that table and any related auth trigger before applying schema that depends on it.

## Available Scripts

```bash
npm run dev
```

Starts Next.js with Turbopack on port `9002`.

```bash
npm run build
```

Builds the production app.

```bash
npm run start
```

Starts the production Next.js server after a build.

```bash
npm run typecheck
```

Runs TypeScript without emitting files.

```bash
npm run lint
```

Runs the configured lint command.

```bash
npm run genkit:dev
npm run genkit:watch
```

Starts local Genkit flows from `src/ai/dev.ts`.

## Project Structure

```text
src/app                 Next.js routes, layouts, pages, and API routes
src/components          Shared UI, layout, recipe, community, and feature components
src/components/ui       Reusable Radix/Tailwind UI primitives
src/lib                 Data access, Supabase clients, site constants, utilities, and types
src/lib/supabase        Supabase auth, client, server, middleware, public, and admin helpers
src/hooks               Client hooks for toast, mobile state, and recipe interactions
src/ai                  Genkit configuration and AI flows
docs                    Supabase schema and project blueprint
supabase/migrations     Incremental database and storage migrations
```

## Main Routes

- `/` - Homepage
- `/recipes` - Recipe browser
- `/recipes/[slug]` - Recipe detail page
- `/community` - Community posts
- `/community/[postId]` - Community post detail page
- `/profile` and `/profile/[userId]` - User profile pages
- `/login`, `/signup`, `/forgot-password`, `/reset-password` - Auth pages
- `/settings` - User settings
- `/admin` - Admin dashboard
- `/admin/recipes` - Recipe management
- `/admin/categories` - Category management
- `/admin/comments` - Comment moderation
- `/admin/analytics` - Analytics dashboard
- `/admin/food-requests` - Food request management

## AI Tools

The recipe form can call `/api/ai/generate-recipe` to generate formatted ingredients and instructions from rough notes. This endpoint requires:

```bash
OPENAI_API_KEY=
```

The repository also includes Genkit flows for generating recipe intros and cooking tips. Use the `genkit:*` scripts for local flow development.

## Email Notifications

Food requests are stored in Supabase. If SMTP variables are configured, the app also sends an admin notification email when a request is submitted.

Required SMTP variables:

```bash
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Optional SMTP variables:

```bash
SMTP_FROM=
ADMIN_EMAIL=
```

If SMTP is not configured, food requests still save to the database and email sending is skipped.

## Deployment

The repository includes `apphosting.yaml` for Firebase App Hosting. It can also be deployed to any host that supports Next.js.

Before deploying, configure production environment variables for:

- Supabase URL and public key
- OpenAI API key, if recipe generation should work in production
- SMTP settings, if food request notification emails should work
- Supabase Auth redirect URL for the production domain

## Notes

- Image loading is configured in `next.config.ts` for Supabase storage, Unsplash, Placehold, and Picsum sources.
- Middleware in `middleware.ts` keeps Supabase sessions in sync.
- The app can render helpful setup messages when Supabase public environment variables are missing, but database-backed pages require real Supabase configuration.
