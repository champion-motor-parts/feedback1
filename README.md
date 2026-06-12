# Champion Motor QR Feedback MVP

QR web app for customer feedback and staff service data collection.

Customers scan a QR code and submit feedback from a mobile browser. Staff can log in to handle only their own assigned cases. Admin users can review all feedback, filter records, view objective charts, manage staff/branches, generate QR codes, and export CSV files.

This system shows raw data, counts, distributions, and exports only. It does not label staff quality, rank staff, or make reward/punishment suggestions.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS
- Recharts
- Prisma ORM
- PostgreSQL
- QR PNG generation with `qrcode`
- Simple signed-cookie email/password login
- Uploaded feedback photos are stored in the database as data URLs for MVP deployment simplicity

## Runtime

Use Node.js 22. Railway/Nixpacks will read this from `package.json` and `.node-version`.

## Local Setup

Use PostgreSQL locally, or deploy directly to Railway with Railway PostgreSQL.

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open:

- Customer form: `http://localhost:3000/feedback`
- Admin login: `http://localhost:3000/admin/login`
- Staff login: `http://localhost:3000/staff/login`

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/champion_feedback"
AUTH_SECRET="change-this-to-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
COMPANY_WHATSAPP_URL="https://wa.me/60123456789"
```

For Railway, set:

```env
DATABASE_URL="${{ Postgres.DATABASE_URL }}"
AUTH_SECRET="your-long-random-secret"
NEXT_PUBLIC_APP_URL="https://your-public-railway-domain"
COMPANY_WHATSAPP_URL="https://wa.me/60123456789"
```

## Railway Deployment

This project includes `railway.json`.

Railway will:

1. Install dependencies.
2. Run `npm run build`.
3. Run `npm run db:deploy` before deployment.
4. Start the app with `npm start`.

`npm run db:deploy` runs:

```bash
prisma db push && prisma db seed
```

The seed script is safe for repeated deploys. It only creates demo data if the database is empty. To intentionally recreate demo data, run:

```bash
npm run db:seed:reset
```

## Default Logins

Admin:

```text
admin@championmotor.test
Admin123!
```

Staff:

```text
akak@championmotor.test
Staff123!
```

Other demo staff:

- `suha@championmotor.test`
- `nana@championmotor.test`
- `yy@championmotor.test`

All demo staff use `Staff123!`.

## QR Code Links

Staff QR:

```text
/feedback?staffId=<id>
```

Branch QR:

```text
/feedback?branchId=<id>
```

Set `NEXT_PUBLIC_APP_URL` to your final Railway public URL before generating real QR codes.

## Staff Photos

The customer feedback form shows staff as photo cards. Demo staff photos are stored in:

```text
public/staff
```

Admin can also edit a staff record and set a custom photo URL.

## Export Data

Admin can export:

- Filtered feedback CSV
- Staff raw summary CSV

Exports contain raw fields only.

## Notes For Production

For a larger production system, move uploaded photos from database data URLs to Supabase Storage, Cloudinary, or S3. The current approach is simple and works for MVP deployment without adding another external service.
