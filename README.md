# Nexus IITB

The startup network for IIT Bombay — post your idea, find co-founders, and join early-stage ventures. Built with Next.js (App Router) + Supabase.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS** for styling (purple design system)
- **Supabase** for Postgres, Auth (magic link, IITB-email only), and Row Level Security
- **lucide-react** for icons

## Getting started

### 1. Create a Supabase project
Go to https://supabase.com, create a new project, and wait for it to provision.

### 2. Run the database schema
In the Supabase dashboard: **SQL Editor → New query**, paste the contents of
`supabase/schema.sql`, and click **Run**. This creates the tables, enums,
triggers (auto-profile on signup, IITB-email enforcement) and all RLS policies.

### 3. Configure environment variables
Copy the example file and fill in your keys from **Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Allow the auth redirect
In **Authentication → URL Configuration**, add `http://localhost:3000/auth/confirm`
to the **Redirect URLs** list (and your production URL later).

### 5. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How auth works
- Sign-in is **magic-link only**, restricted to `@iitb.ac.in` (enforced both in the
  app and by a database trigger on `auth.users`).
- On first sign-in a blank profile row is created automatically. Middleware then
  forces you through `/profile/setup` until your profile is complete — this is the
  "profile gate."

## Project structure

```
src/
  app/
    login/                 sign-in page (magic link)
    auth/confirm/          verifies the email link
    (app)/                 authenticated shell (sidebar + topbar)
      feed/                home feed of all ventures
      ventures/new/        post a venture
      ventures/[id]/       venture detail (+ /edit)
      profile/             my profile, /setup gate, profile form
      people/              student directory
  components/              sidebar, cards, badges, forms, UI primitives
  actions/                 server actions (auth, profile, ventures)
  lib/supabase/            client / server / middleware Supabase factories
  lib/                     constants + utils
  types/                   database + domain types
supabase/schema.sql        run this in Supabase
middleware.ts              session refresh + route + profile gating
```

## What's built (MVP)
- Auth (IITB email, magic link), profile setup gate
- Home feed with colour-coded stage badges and empty/error states
- Full venture CRUD: create, read, edit, delete (with confirm)
- Profile (view + edit, skills chips) and a people directory

## Next up (from the product plan)
Search & filters, bookmarks, the "interested" connection request flow,
in-app messaging (Supabase Realtime), public profile pages, and dark mode.
