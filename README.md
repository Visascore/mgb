# Magic Body

Luxury non-invasive body contouring & skincare studio — public website, customer portal, and admin dashboard.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, Edge Functions, Row-Level Security)
- WhatsApp finalization for bookings & shop checkout (no online payment collected — receipt + WhatsApp handoff)
- Deployed on Vercel

---

## Supabase Project

This app is connected to the Supabase project:

- **Name:** `magic-body`
- **Project ref:** `pdnsrvlubfkbihndqhiq`
- **Organization:** Salt City Property
- **Region:** eu-west-2 (London)
- **Dashboard:** https://supabase.com/dashboard/project/pdnsrvlubfkbihndqhiq

The project URL and anon/publishable key are already baked into `lib/supabase/config.ts` (the anon key is safe to expose client-side — everything is protected by row-level security). You can override them with env vars instead if you prefer:

```
NEXT_PUBLIC_SUPABASE_URL=https://pdnsrvlubfkbihndqhiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## What's New in This Update

- **Hero image**: Admin → Website Settings now has an uploader for the homepage hero image (right-hand side of the hero section). Uploads go to the `site-images` bucket and update instantly.
- **Before/after gallery**: Gallery entries now take two separate uploads — a "before" photo and an "after" photo — grouped and displayed together as one result on the public Results Gallery page.
- **Admin can create users directly**: Admin → Customers → **+ Add User** lets an administrator create a brand-new account with an email, a password they set, and a role (Client / Staff / Admin) — no signup flow or email confirmation needed, the account is ready to sign in immediately. This is powered by a second Supabase Edge Function, `admin-create-user`, which uses the service role key server-side and independently re-checks that the caller is really an admin before creating anything.
- **Grant/revoke admin from existing customers**: Admin → Customers now has both "Make/Remove Staff" and "Make/Remove Admin" per row.
- **Fixed a real bug**: an earlier security lockdown accidentally broke every admin-only permission check across the whole app (see below). This is fixed and verified directly against the database.

### ⚠️ You must redeploy to Vercel for frontend changes to take effect
Everything described above that lives in **application code** (success pages, Paystack UI, hero image display, before/after gallery layout, the Create User form) only exists in this codebase — redeploy this project to Vercel to see it live. Anything that lives in **Supabase** (database schema, RLS policies, the two Edge Functions, the admin email allowlist) is already live in your project right now and needs no redeploy.

---

## Admin Access



- The only administrator entry point is **/admin** — it is not linked anywhere on the public site.
- `bennyreal10@gmail.com` and `contact@blackhabit.co.uk` are hardwired at the database level to receive the admin role the instant either email signs up.
- To get in: go to `/signup`, create an account with one of those emails, confirm it (see Email Confirmation below), then sign in at `/admin`.

---

## Email Confirmation Setup (required manual step)

The app includes a branded confirmation-success page at `/auth/success` (and `/auth/error` for expired/invalid links), served by a route handler at `/auth/confirm`. For Supabase to actually send people there, you need to update two things in the Supabase Dashboard (**Authentication → URL Configuration** and **Authentication → Email Templates**) — this can't be done via API/migration:

1. **URL Configuration**
   - **Site URL:** set to your deployed domain, e.g. `https://your-domain.com`
   - **Redirect URLs:** add `https://your-domain.com/auth/confirm` (and `http://localhost:3000/auth/confirm` for local dev)

2. **Email Templates → Confirm signup**
   Replace the default body's link:
   ```
   {{ .ConfirmationURL }}
   ```
   with:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
   ```
   This routes the click through your own `/auth/confirm` handler (which calls `verifyOtp` and redirects to `/auth/success`) instead of Supabase's hosted verify page.

   Do the same for the **Magic Link** and **Reset Password** templates if/when you use those flows, swapping `type=signup` for `type=magiclink` or `type=recovery` respectively.

---

## Payment Methods — Admin-Controlled

Admin → Website Settings → **Payment Methods** has an on/off toggle for each way customers can finalise a booking or order:

- **WhatsApp Receipt** — works immediately, no setup. Customer gets a receipt and a button that opens WhatsApp with everything pre-filled, sent to your default WhatsApp number.
- **Paystack** — card/bank payments, popular for Nigerian customers. Needs API keys (below).
- **Stripe** — international card payments via Stripe Checkout. Needs an API key (below).

**If exactly one method is on**, customers go straight into that flow after reserving. **If more than one is on**, they're shown a simple chooser ("How would you like to finalise?") after reserving, and pick one. Toggling takes effect immediately — no redeploy needed, since it's read from the database.

### Paystack setup
**1. Frontend (Vercel) environment variable — public key:**
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxx
```
**2. Supabase Edge Function secret — secret key:**
```
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxxxxxx --project-ref pdnsrvlubfkbihndqhiq
```
Get both from Paystack Dashboard → Settings → API Keys & Webhooks. Payment is verified server-side by the `paystack-verify` Edge Function before anything is marked paid.

### Stripe setup
Only one secret is needed — Stripe Checkout is hosted, so there's no publishable key required in the frontend:
```
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxxxxx --project-ref pdnsrvlubfkbihndqhiq
```
Get it from the Stripe Dashboard → Developers → API Keys. Two Edge Functions handle this:
- `stripe-create-checkout-session` — creates a hosted Stripe Checkout session and returns its URL; the browser redirects there.
- `stripe-verify` — called when Stripe redirects back, independently confirms the session is `paid` with Stripe's API, checks the amount matches, and only then marks the order/booking paid using the service role key.

Until a method's keys are configured, its toggle can still be switched on, but the payment step will show a clear inline error rather than failing silently — so switch it on only once the keys are in place.

---

## Admin User Creation

Admin → Customers → **+ Add User** calls a second Edge Function, `admin-create-user`. Unlike Paystack, this needs **no extra secrets from you** — it uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, which Supabase injects into every Edge Function automatically. The function:
1. Verifies the caller's own session token is valid.
2. Independently checks (server-side, against the database) that the caller actually holds the `admin` role — a non-admin calling this function directly gets rejected with a 403, regardless of what the frontend shows.
3. Creates the new user with `email_confirm: true` (no confirmation email needed) and applies the chosen role.

---

## WhatsApp Finalization (Bookings & Shop Checkout)

This is the default, always-available method (see Payment Methods above for how it interacts with Paystack/Stripe when those are also switched on):
1. The customer completes the booking or checkout form — a `pending` booking/order is created (slot reserved, order recorded).
2. They immediately get a receipt on-screen and a **"Complete Booking/Order on WhatsApp"** button.
3. That button opens WhatsApp with a pre-filled message (customer details, treatment or items, totals, delivery address where relevant) addressed to your **default WhatsApp number**.
4. You finalise payment and confirm with the customer directly in WhatsApp, then update the status in Admin → Bookings or Admin → Orders.

**Set this up:** Admin → Website Settings → **WhatsApp Numbers** — add one or more numbers with labels (e.g. "Bookings", "General Enquiries"), and mark one as **Default**. The default is the number used for both the booking and checkout receipt buttons. If no number is set yet, customers see a message asking them to contact the studio directly instead of a broken button.

---

## Site Content — Admin-Editable

Admin → **Content** is a single page covering nearly every piece of static text on the public site: homepage hero, feature strip, "Our Promise" section, testimonials heading, bottom CTA banner, About page, FAQ (including adding/removing questions), Contact page, page headers for Treatments/Shop/Gallery/Book, both WhatsApp finalization screens (heading, body, button label, chooser heading, and the fallback message shown if no WhatsApp number is set), and the footer tagline. Everything is grouped into collapsible sections with one "Save All Changes" button per page load.

**Not covered here (by design — they have their own dedicated admin screens already):** treatment names/prices/descriptions (Admin → Services), product details (Admin → Products), reviews (Admin → Reviews), and gallery captions (Admin → Gallery). Keeping those separate avoids duplicating what's already a proper CRUD interface for structured records.

If a field has never been customized, the site falls back to sensible built-in defaults — nothing breaks from an empty database row.

## Environment Variables Summary


| Variable | Where | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | No (defaults baked in) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | No (defaults baked in) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Vercel | Only if Paystack toggle is on |
| `PAYSTACK_SECRET_KEY` | Supabase Edge Function secret (not Vercel) | Only if Paystack toggle is on |
| `STRIPE_SECRET_KEY` | Supabase Edge Function secret (not Vercel) | Only if Stripe toggle is on |

---

## Notes for going further
- **Currency:** Multi-currency display uses static indicative conversion rates in `lib/currency.ts`. Swap in a live FX API for production accuracy — Paystack charges use whatever rate is set there at the time of payment.
- **Imagery:** Product, gallery, and review images use a real Supabase Storage upload flow in the admin dashboard (buckets: `product-images`, `gallery-images`, `review-photos`).
- **Staff role:** Admins can promote a customer to `staff` from **Admin → Customers**. Staff currently have the same read access as admins on bookings/services but cannot manage roles or delete records — extend `is_staff_or_admin` policies in the database if you want staff to do more.
