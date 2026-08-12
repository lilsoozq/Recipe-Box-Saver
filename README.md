# Recipe Box V2 — Supabase Cloud Edition

This version keeps the Recipe Box URL clipper and replaces browser-only localStorage with Supabase Auth + Postgres cloud storage.

## 1. Create the database table

In your Supabase project, open **SQL Editor → New query**. Copy everything from `supabase/schema.sql`, paste it into the editor, and click **Run**.

The script creates the `recipes` table, turns on Row Level Security (RLS), and adds policies so signed-in users can only access their own recipes.

## 2. Connect your Supabase project

In Supabase, open your project and click **Connect**. Copy the Project URL and Publishable key.

Copy `.env.example` to a new file named `.env.local` and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Use the **Publishable key**, not a secret/service-role key.

## 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 4. Create your Recipe Box account

Choose **Create an account** on the login screen. Hosted Supabase projects normally require email confirmation by default, so check your email, confirm the address, then sign in.

## What V2 does

- Email/password sign-up and sign-in
- Cloud recipe storage in Supabase
- RLS so each account sees only its own recipes
- Clip a recipe URL and review before saving
- Search saved recipes and ingredients
- Favorites
- Delete recipes
- Ingredient checkboxes while cooking
- Original source attribution

## Important

The recipe clipper still runs through the Next.js server route and includes the URL-safety protections from V1. Some recipe websites may block automated retrieval.
