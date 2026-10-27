# Banking API

A RESTful banking API built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL. Supports account management, transactions (credit/debit), and atomic fund transfers.

**Live URL:** https://transaction-ledger-api-9ras.onrender.com

**Repository:** https://github.com/Amangupta800/Transaction-Ledger-API

---

## Tech Stack

| Layer      | Technology      |
|------------|----------------|
| Runtime    | Node.js 18+     |
| Language   | TypeScript      |
| Framework  | Express 5       |
| ORM        | Prisma 5        |
| Database   | PostgreSQL 14+  |
| Validation | Zod v4          |

---

## Prerequisites

- Node.js 18 or higher (tested on Node.js 24)
- PostgreSQL 14 or higher running locally (or Docker)
- npm

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Amangupta800/Transaction-Ledger-API.git
cd Transaction-Ledger-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set your database connection:

```env
# Replace <user> with your PostgreSQL username (on Mac with Homebrew this is usually your system username)
DATABASE_URL="postgresql://<user>@localhost:5432/banking_db"
PORT=3000
NODE_ENV=development
```

### 4. Create the database

**Mac (Homebrew PostgreSQL):**
```bash
psql postgres -c "CREATE DATABASE banking_db;"
```

**Linux / with a postgres user:**
```bash
psql -U postgres -c "CREATE DATABASE banking_db;"
```

**Docker (no local PostgreSQL needed):**
```bash
docker run --name banking-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=banking_db \
  -p 5432:5432 \
  -d postgres:16
```
Then set `DATABASE_URL="postgresql://postgres:password@localhost:5432/banking_db"` in `.env`.

### 5. Run database migrations

```bash
npm run db:migrate:prod
```

This applies all existing migrations to your local database.

### 6. (Optional) Seed sample data

```bash
npm run db:seed
```

Creates two accounts — Alice (balance: 1000) and Bob (balance: 500) — so you can test immediately.

### 7. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

Verify it's running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{ "success": true, "message": "Banking API is running" }
```

---

## Running in Production (compiled)

```bash
npm run build
npm start
```

---

## Available Scripts

| Script                    | Description                                    |
|---------------------------|------------------------------------------------|
| `npm run dev`             | Start dev server with hot reload               |
| `npm run build`           | Compile TypeScript to `dist/`                  |
| `npm start`               | Run compiled production build                  |
| `npm run db:migrate`      | Create and apply a new migration (dev only)    |
| `npm run db:migrate:prod` | Apply existing migrations (use this locally)   |
| `npm run db:seed`         | Seed two sample accounts with balances         |
| `npm run db:generate`     | Regenerate Prisma client after schema changes  |
| `npm run db:studio`       | Open Prisma Studio GUI to browse data          |

---

## Project Structure

```
Transaction-Ledger-API/
├── prisma/
│   ├── schema.prisma          # Database schema and models
│   ├── migrations/            # Migration history (committed)
│   └── seed.ts                # Seed script
├── src/
│   ├── controllers/           # Route handlers (thin layer, delegates to services)
│   │   ├── account.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── transfer.controller.ts
│   ├── services/              # All business logic lives here
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   └── transfer.service.ts
│   ├── validators/            # Zod request validation schemas
│   │   ├── account.validator.ts
│   │   ├── transaction.validator.ts
│   │   └── transfer.validator.ts
│   ├── middleware/
│   │   ├── validate.ts        # Validation middleware
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/                # Express route definitions
│   │   ├── account.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── transfer.routes.ts
│   │   └── index.ts
│   ├── errors/
│   │   └── AppError.ts        # Custom error classes
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variable template
├── package.json
└── tsconfig.json
```

---

## API Endpoints

| Method | Path                                  | Description                   |
|--------|---------------------------------------|-------------------------------|
| GET    | /health                               | Health check                  |
| POST   | /api/accounts                         | Create an account             |
| GET    | /api/accounts                         | List all accounts (paginated) |
| GET    | /api/accounts/:id                     | Get account by ID             |
| GET    | /api/accounts/:accountId/transactions | List transactions for account |
| POST   | /api/transactions                     | Create a transaction          |
| POST   | /api/transfers                        | Transfer funds between accounts |

See [API_DOCS.md](./API_DOCS.md) for full request/response documentation.

---

## Design Decisions & Assumptions

See [ASSUMPTIONS.md](./ASSUMPTIONS.md).
