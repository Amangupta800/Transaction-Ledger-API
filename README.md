# Banking API

A RESTful banking API built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL. Supports account management, transactions (credit/debit), and atomic fund transfers.

**Live URL:** https://transaction-ledger-api-9ras.onrender.com

**Repository:** https://github.com/Amangupta800/Transaction-Ledger-API

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Runtime    | Node.js 18+                   |
| Language   | TypeScript                    |
| Framework  | Express 5                     |
| ORM        | Prisma 5                      |
| Database   | PostgreSQL 14+                |
| Validation | Zod v4                        |

---

## Prerequisites

- Node.js 18 or higher (tested on Node.js 24)
- PostgreSQL 14 or higher (running locally or via Docker)
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

Copy the example env file and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/banking_db"
PORT=3000
NODE_ENV=development
```

### 4. Create the database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE banking_db;"
```

Or with Docker:

```bash
docker run --name banking-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=banking_db \
  -p 5432:5432 \
  -d postgres:16
```

### 5. Run database migrations

```bash
npm run db:migrate
```

When prompted, give the migration a name (e.g. `init`).

### 6. (Optional) Seed sample data

```bash
npm run db:seed
```

This creates two accounts (Alice and Bob) with initial balances of 1000 and 500 respectively.

### 7. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Running in Production

```bash
npm run build
npm start
```

---

## Available Scripts

| Script               | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start dev server with hot reload         |
| `npm run build`      | Compile TypeScript to `dist/`            |
| `npm start`          | Run compiled production build            |
| `npm run db:generate`| Regenerate Prisma client                 |
| `npm run db:migrate` | Create and apply a new migration         |
| `npm run db:migrate:prod` | Apply pending migrations (production) |
| `npm run db:push`    | Push schema to DB without migration file |
| `npm run db:studio`  | Open Prisma Studio GUI                   |
| `npm run db:seed`    | Seed sample data                         |

---

## Project Structure

```
banking-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed script
├── src/
│   ├── controllers/           # Route handlers (thin layer)
│   │   ├── account.controller.ts
│   │   ├── transaction.controller.ts
│   │   └── transfer.controller.ts
│   ├── services/              # Business logic
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   └── transfer.service.ts
│   ├── validators/            # Zod schemas
│   │   ├── account.validator.ts
│   │   ├── transaction.validator.ts
│   │   └── transfer.validator.ts
│   ├── middleware/
│   │   ├── validate.ts        # Zod validation middleware
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/                # Express routers
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
├── .env.example
├── package.json
└── tsconfig.json
```

---

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for full endpoint reference.

### Quick Reference

| Method | Path                                    | Description                     |
|--------|-----------------------------------------|---------------------------------|
| POST   | /api/accounts                           | Create an account               |
| GET    | /api/accounts                           | List all accounts (paginated)   |
| GET    | /api/accounts/:id                       | Get account by ID               |
| GET    | /api/accounts/:accountId/transactions   | List transactions for account   |
| POST   | /api/transactions                       | Create a transaction            |
| POST   | /api/transfers                          | Transfer funds between accounts |
| GET    | /health                                 | Health check                    |

---

## Key Design Decisions

See [ASSUMPTIONS.md](./ASSUMPTIONS.md) for full assumptions and trade-off documentation.
