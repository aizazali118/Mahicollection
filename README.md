# Mahi Collection — Next.js Women’s Clothing Store

A complete full-stack Pakistani women’s clothing store with a responsive customer storefront and a protected administration panel.

## Included

### Customer storefront

- Marquee announcement bar
- Top contact bar with Facebook, TikTok, and Instagram links
- Three-column responsive navigation with logo, dynamic collection menu, AJAX search, cart, and customer account
- Smooth mobile-responsive hero slider with a maximum of five admin-managed slides and navigation dots
- Automatic collection section:
  - First four featured collections display as a grid
  - More than four automatically display in a horizontal slider
  - Collection links update automatically in the main menu
- New Arrivals and Best Selling sections
- Product cards with hover image, quick view, and quick add
- Single and variable products
- Colour circles, size buttons, variant-specific stock, prices, SKU, and images
- Product image gallery, arrows, thumbnails, hover zoom, and full-screen zoom
- Related products, maximum eight
- Responsive shop page with search, collection filtering, and sorting
- Dynamic local-storage cart
- Coupon validation
- Checkout fields for name, email, phone, city, address, and order note
- Cash-on-delivery order creation
- Order success page with a pre-filled WhatsApp order message
- Customer registration and login
- Customer order history
- Product reviews restricted to logged-in accounts and moderated by admin
- About, Contact, Privacy Policy, Terms & Conditions, and Shipping Policy pages

### Admin panel

- Protected admin login and role checks
- Dashboard totals and recent orders
- Product CRUD
- Single/variable product toggle
- Colour, colour hex, size, price, stock, SKU, and variant image management
- Main image and gallery management
- Optional Vercel Blob image upload
- Collection CRUD and automatic storefront/menu updates
- Hero slide CRUD with a hard limit of five
- Coupon CRUD with:
  - Percentage or fixed discounts
  - Minimum order
  - Maximum discount
  - Start/end dates
  - Usage limits and usage count
- Order list, searching, filtering, full details, WhatsApp customer link, and status updates
- Review approval/unpublish/delete
- Contact message inbox
- Store settings for announcement, contact details, social links, WhatsApp, shipping, free-shipping threshold, and brand description

## Stack

- Next.js App Router
- React and TypeScript
- PostgreSQL
- Prisma ORM
- JWT session cookie authentication using `jose`
- `bcryptjs` password hashing
- Vercel Blob upload support
- Custom responsive CSS
- No paid theme or UI framework

## Demo admin login

- Username: `mahiadmin`
- Password: `mahi@1217`
- Seed email: `admin@mahicollection.pk`

These credentials are created by the seed script. Change `SEED_ADMIN_PASSWORD` before running the seed for a real production store. The password is stored as a bcrypt hash in PostgreSQL, not as plain text in the database.

## Local setup

### 1. Install packages

```bash
npm install
```

### 2. Create the environment file

In Windows PowerShell, copy `.env.example` only when `.env` does not already exist:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Set a real PostgreSQL connection and a long random authentication secret:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="a-long-random-secret"
BLOB_READ_WRITE_TOKEN=""
SEED_ADMIN_USERNAME="mahiadmin"
SEED_ADMIN_EMAIL="admin@mahicollection.pk"
SEED_ADMIN_PASSWORD="mahi@1217"
```

`BLOB_READ_WRITE_TOKEN` is optional and is needed only for admin image uploads
to Vercel Blob. No secret should use a `NEXT_PUBLIC_` prefix.

To generate a secret in PowerShell:

```powershell
$bytes = New-Object byte[] 48
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)
```

### 3. PostgreSQL

Use a PostgreSQL database from Neon, Supabase, Vercel Postgres, Prisma
Postgres, or a local PostgreSQL installation. This repository intentionally
uses PostgreSQL and should not be converted to SQLite.

If Docker is installed, a PostgreSQL container can be used. Set its database
to `mahi_collection`, user to `mahi`, password to `mahi_local_password`, expose
port `5432`, and use:

```env
DATABASE_URL="postgresql://mahi:mahi_local_password@localhost:5432/mahi_collection?schema=public"
```

Start an existing Docker setup with:

```powershell
docker compose up -d
```

### 4. Generate Prisma Client and create tables

```powershell
npm run db:generate
npm run db:push
```

The project uses `prisma db push` for local development rather than migrations.

### 5. Add demo store data

```powershell
npm run db:seed
```

The seed is safe to run repeatedly. It creates the admin account, store
settings, four collections, products and variants, and hero slides.

### 6. Check and start the application

```powershell
npm run lint
npm run typecheck
npm run build
npm run dev
```

Open:

- Storefront: `http://localhost:3000`
- Shop: `http://localhost:3000/shop`
- Admin: `http://localhost:3000/admin/login`
- Cart: `http://localhost:3000/cart`
- Customer login: `http://localhost:3000/login`

Admin credentials:

- Username: `mahiadmin`
- Password: `mahi@1217`

When using Docker, the normal restart commands are:

```powershell
docker compose up -d
npm run dev
```

### Troubleshooting

```powershell
npm run db:generate
npm run typecheck
npm run build
```

Confirm PostgreSQL is listening:

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
```

If the schema needs to be re-applied without deleting data, run
`npm run db:push`. As a last resort, `npx prisma db push --force-reset` resets
the database and **deletes all local data**; back up anything important before
using it, then rerun `npm run db:seed`.

## Vercel deployment

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Add a PostgreSQL database from Vercel Marketplace. Prisma Postgres or Neon work well.
4. Confirm that `DATABASE_URL` is available in Project Settings → Environment Variables.
5. Add `AUTH_SECRET`.
6. Optional: add Vercel Blob and confirm `BLOB_READ_WRITE_TOKEN`.
7. Locally connect to the production database URL and run:

```bash
npm run db:push
npm run db:seed
```

8. Deploy or redeploy the Vercel project.

The included `postinstall` and build scripts generate Prisma Client automatically.

## Image handling

The seeded catalogue uses local demo images created from the supplied Mahi Collection references.

The admin product, collection, and slide forms support:

- Local public paths such as `/demo/product-lawn.jpg`
- Any public HTTPS image URL
- Vercel Blob upload when `BLOB_READ_WRITE_TOKEN` is configured

## WhatsApp order flow

After checkout:

1. The order and all customer/item details are saved in PostgreSQL.
2. Stock and coupon usage are updated in a database transaction.
3. The customer sees an order confirmation page.
4. The “Send Order on WhatsApp” button opens a pre-filled message containing the order details.

A browser cannot silently send a WhatsApp message on the customer’s behalf. The customer confirms sending it in WhatsApp. A fully automatic server-to-server WhatsApp message would require Meta’s WhatsApp Business Cloud API credentials and approved templates.

## Important production steps

- Change the seeded admin password before public launch.
- Replace placeholder phone, WhatsApp, social links, email, and address in Admin → Store Settings.
- Connect a real courier/payment flow if needed.
- Add legal text reviewed for the business and target jurisdiction.
- Create backups for the PostgreSQL database.
- For large catalogues, add pagination and image transformations/CDN rules.
