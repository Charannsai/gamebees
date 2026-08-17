# GameBees Supabase setup

The cart and promo-code features require the database migration in:

`supabase/001_coupons_and_cart_orders.sql`

Run the entire file in the SQL Editor of the Supabase project used by GameBees.

After it succeeds, refresh/restart the local Next.js admin and website. The migration creates `public.coupons` and adds the booking fields needed by grouped checkout and promo codes.

If the admin shows `Could not find the table 'public.coupons' in the schema cache`, the migration has not been applied to that Supabase project yet. Run the SQL file first; it also requests a PostgREST schema-cache reload.

Do not put your Supabase service-role key in frontend code or commit `.env.local`.
