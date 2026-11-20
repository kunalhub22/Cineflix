# CineFlix

A dark-themed starter movie/video streaming platform for content you own or are licensed to distribute. Includes a public catalogue, watch page, Supabase authentication, admin publishing dashboard, ad placement placeholders, and a Stripe Checkout starter.

## Before launch

This is an implementation starter, not a production-certified streaming service. The admin upload currently uses browser-to-Supabase uploads and public media URLs for a simple MVP. For large files and paid/private videos, implement resumable uploads, private storage, signed playback URLs, server-side entitlement checks, transcoding/HLS, rate limits, moderation, and monitoring before public launch.

Only upload content you own or have permission to distribute. Confirm applicable copyright, privacy, consumer-protection, tax, and advertising requirements in your operating region.

## 1. Requirements

- Node.js 20+
- A Supabase project
- A Stripe account (test mode is fine for development)

## 2. Install

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase URL and anon key. Keep the service-role key and Stripe secret key server-side only; never prefix them with `NEXT_PUBLIC_`.

## 3. Configure Supabase

1. Open your Supabase project and go to SQL Editor.
2. Run `supabase/schema.sql`.
3. In Storage, create buckets:
   - `media` — for the starter, set public only for videos that are intended to be publicly accessible.
   - `posters` — public is suitable for public artwork.
4. For production, create Storage policies that allow only admins to upload and use private media buckets plus signed URLs for premium videos.
5. Create an account at `/login`.
6. In SQL Editor, promote your account:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

The SQL trigger creates a user profile after signup. Supabase email confirmation settings may require confirming your email before signing in.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000. Sign in at `/login`, then open `/admin` to upload an authorized video and optional poster.

## 5. Configure Stripe Premium

1. In Stripe test mode, create a recurring product and price.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_PREMIUM_PRICE_ID`, and `NEXT_PUBLIC_SITE_URL` to `.env.local`.
3. Configure a Stripe webhook endpoint pointing to `https://YOUR_DOMAIN/api/stripe-webhook` and subscribe to `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
4. Add its signing secret as `STRIPE_WEBHOOK_SECRET`.

Important: checkout is scaffolded, but this starter does not yet map Stripe customers to CineFlix users or enforce paid membership on playback. Do not sell subscriptions or label content as protected until customer-to-user mapping, webhook persistence, cancellation handling, and server-side playback authorization are completed.

## 6. Advertising

The ad boxes are placeholders only. Apply to a reputable ad provider, follow its content and traffic policies, then insert its approved ad tag in a dedicated component. Do not use deceptive download buttons, forced redirects, or ads that imitate player controls. Disclose advertising and follow applicable privacy/consent rules.

## 7. Recommended production upgrades

- Private video storage and short-lived signed playback URLs
- HLS transcoding (e.g. a managed video platform) and adaptive bitrate playback
- Resumable/chunked uploads with file-size limits
- Admin-only Storage policies and server-side validation
- Stripe customer mapping and subscription entitlement checks
- Search, genres, pagination, watch history, favourites
- Content moderation, reporting/takedown workflow, backups and audit logs
- Privacy notice, terms, cookie consent, and accessible player controls
