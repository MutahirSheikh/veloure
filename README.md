Veloure
=======

Veloure is a production-oriented luxury ecommerce application for a fashion and lifestyle brand. It includes a public storefront, Clerk authentication, Supabase-backed catalog/order data, persistent carts, cash-on-delivery checkout, transactional emails, customer account pages, and a complete admin panel.

Stack
-----

- Next.js App Router with TypeScript
- Clerk for authentication and sessions
- Supabase Postgres and Supabase Storage
- Tailwind CSS and shadcn/ui-style components
- Zod and React Hook Form
- Resend with React Email templates
- Server actions for trusted mutations
- Route handlers for health checks and Clerk webhooks

Install
-------

```bash
npm install
cp .env.example .env.local
npm run dev
```

Environment
-----------

Fill `.env.local` with:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM="Veloure <orders@yourdomain.com>"
ADMIN_EMAILS=owner@example.com,ops@example.com
```

Clerk Setup
-----------

1. Create a Clerk application.
2. Add the publishable and secret keys to `.env.local`.
3. Configure sign-in and sign-up URLs as `/sign-in` and `/sign-up`.
4. Create a webhook endpoint pointing to `/api/webhooks/clerk`.
5. Subscribe to `user.created`, `user.updated`, and `user.deleted`.
6. Copy the webhook signing secret into `CLERK_WEBHOOK_SECRET`.

Admin Bootstrapping
-------------------

`profiles.role` in Supabase is the source of truth. On first login or webhook sync, any Clerk user whose primary email is listed in `ADMIN_EMAILS` is created or upgraded as `admin`. Everyone else defaults to `customer`. Client-provided role data is never trusted.

Supabase Setup
--------------

1. Create a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply migrations:

```bash
supabase db push
```

The migrations create all tables, enums, indexes, triggers, full-text search support, default settings, seed categories, the `product-media` storage bucket, storage policies, and the transactional `place_cod_order` RPC.

Storage
-------

The migration creates a public Supabase Storage bucket named `product-media`. Product and variant images are uploaded through trusted server actions using the service role key, validated for type and size, and saved with safe storage paths.

Resend Setup
------------

1. Create a Resend API key.
2. Verify your sending domain.
3. Set `RESEND_API_KEY` and `EMAIL_FROM`.
4. Add admin notification recipients in `/admin/settings` or `ADMIN_EMAILS`.

Emails are logged in `email_logs` for sent, failed, and skipped sends. Cart-add alerts are throttled to prevent repeated rapid sends.

Run Locally
-----------

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful scripts:

```bash
npm run typecheck
npm run lint
npm run build
```

Deploy
------

1. Deploy the Next.js app to Vercel or another Node-compatible host.
2. Set the same environment variables in the hosting dashboard.
3. Update `NEXT_PUBLIC_APP_URL` to the production URL.
4. Configure the production Clerk webhook URL.
5. Apply Supabase migrations to the production database.
6. Verify the `product-media` bucket exists and is public.
7. Verify Resend domain and `EMAIL_FROM`.

Operational Notes
-----------------

- Clerk is the only authentication provider.
- Supabase service role is used only in server-only modules.
- Public catalog pages use tagged cache invalidation.
- Admin product/category/settings mutations revalidate catalog tags.
- Checkout uses a database RPC for stock validation, order creation, inventory movements, status history, cart clearing, and idempotency.
- Payment method is cash on delivery only, but the order model keeps payment status and method fields ready for future online providers.
# veloure
