# GVS / RPB Inspection App — Wizard Starter
This matches the Replit flow: Dashboard cards, 5‑step wizard (Customer → Distributor → Preliminary Notes → Areas → Review), Summary with hazard counts, and a branded PDF export.

## Setup
1. Create a Supabase project.
2. Run SQL in `supabase/schema.sql` (SQL editor).
3. Create Storage bucket `inspection-photos` (public for MVP).
4. On Vercel → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy. Open `/login` to sign up and sign in.

## Notes
- Reps see only their own data (RLS).
- PWA installable; offline shell. Submissions need network.
