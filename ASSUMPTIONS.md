# Assumptions & Design Decisions

## Currency & Precision

- All monetary amounts are stored as `DECIMAL(18, 2)` in PostgreSQL, giving 2 decimal places (cent-level precision).
- Amounts in request bodies must be numbers greater than 0.
- Amounts in API responses are serialized as strings to prevent floating-point loss in JSON parsers.
- No currency field is present; it is assumed all accounts operate in a single currency.

## Atomicity

- Transaction creation and balance update are wrapped in a single PostgreSQL transaction.
- The account row is locked with `SELECT ... FOR UPDATE` before reading the balance, preventing lost updates from concurrent requests.
- The isolation level is set to `SERIALIZABLE` for both transaction creation and transfers, providing the strongest consistency guarantee.

## Duplicate reference_id Handling

- `reference_id` uniqueness is enforced per account (not globally). The same `reference_id` can be used on different accounts.
- This is modeled as a composite unique constraint: `(account_id, reference_id)`.
- For transfers, the system appends `-debit` and `-credit` suffixes to the provided `reference_id` to create two scoped transaction records without collisions.
- A duplicate `reference_id` returns `409 Conflict`, not `200 OK`, so callers can distinguish idempotency from success.

## Transfer Design

- A transfer creates exactly two transaction records: one debit on the source and one credit on the destination.
- Both happen inside a single serializable database transaction. If either write fails, neither is committed.
- Account rows are locked in a deterministic order (sorted by UUID) to prevent deadlocks when concurrent transfers involve the same pair of accounts in opposite directions.
- The transfer `reference_id` becomes `<reference_id>-debit` and `<reference_id>-credit` on the respective transaction records. This keeps both records traceable back to a single transfer event.

## Validation

- UUIDs are validated at the API layer (Zod). Invalid UUID formats return 422 before hitting the database.
- Negative and zero amounts are rejected. The validation layer enforces `amount > 0`.
- Pagination defaults are `page=1, limit=20` with a maximum `limit` of 100 to prevent oversized queries.
- Unknown fields in request bodies are silently stripped by Zod (not rejected).

## Balance

- Initial account balance is `0.00`.
- The `balance` field on the account is always the authoritative current balance. It is updated atomically with each transaction.
- `balance_before` and `balance_after` fields on each transaction record provide a full audit trail.
- Accounts can reach a balance of exactly `0.00` (debit equal to balance is allowed).

## Error Handling

- The global error handler catches all unhandled errors and maps them to appropriate HTTP status codes.
- Prisma-level errors (P2002 unique, P2025 not found, P2003 foreign key) are intercepted and translated into user-friendly messages.
- Stack traces are never exposed to clients. They are only logged server-side.
- 5xx errors return a generic message to avoid leaking implementation details.

## Not Implemented (Out of Scope)

- Authentication / authorization — no JWT, API keys, or session management.
- Multi-currency support.
- Transaction reversal / refund.
- Soft delete for accounts.
- Rate limiting.
- Request ID / correlation ID tracing headers.
- OpenAPI / Swagger UI (covered by API_DOCS.md instead).
