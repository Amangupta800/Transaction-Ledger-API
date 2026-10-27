# API Documentation

Base URL (Production): `https://transaction-ledger-api-9ras.onrender.com`

Base URL (Local): `http://localhost:3000`

All responses follow a consistent envelope:

```json
{
  "success": true | false,
  "data": { ... },        // present on success
  "error": "string",      // present on failure
  "code": "ERROR_CODE"    // present on failure
}
```

Monetary amounts are represented as strings in responses (to preserve decimal precision) and as numbers in request bodies.

---

## Health Check

### GET /health

Returns server status.

**Response 200**
```json
{
  "success": true,
  "message": "Banking API is running",
  "timestamp": "2026-10-27T10:00:00.000Z"
}
```

---

## Accounts

### POST /api/accounts

Create a new bank account. Initial balance is 0.

**Request Body**
```json
{
  "name": "Alice Johnson"
}
```

| Field | Type   | Required | Description                      |
|-------|--------|----------|----------------------------------|
| name  | string | Yes      | Account holder name (1–255 chars)|

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Alice Johnson",
    "balance": "0",
    "createdAt": "2026-10-27T10:00:00.000Z",
    "updatedAt": "2026-10-27T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Code              | Cause                         |
|--------|-------------------|-------------------------------|
| 422    | VALIDATION_ERROR  | name is missing or empty      |

---

### GET /api/accounts

List all accounts with pagination.

**Query Parameters**

| Parameter | Type    | Default | Description                     |
|-----------|---------|---------|---------------------------------|
| page      | integer | 1       | Page number (must be ≥ 1)       |
| limit     | integer | 20      | Results per page (1–100)        |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Alice Johnson",
        "balance": "1000",
        "createdAt": "2026-10-27T10:00:00.000Z",
        "updatedAt": "2026-10-27T10:05:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Errors**

| Status | Code             | Cause                           |
|--------|------------------|---------------------------------|
| 422    | VALIDATION_ERROR | Invalid page or limit values    |

---

### GET /api/accounts/:id

Get a single account by ID.

**Path Parameters**

| Parameter | Type   | Description    |
|-----------|--------|----------------|
| id        | UUID   | Account ID     |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Alice Johnson",
    "balance": "970",
    "createdAt": "2026-10-27T10:00:00.000Z",
    "updatedAt": "2026-10-27T10:10:00.000Z"
  }
}
```

**Errors**

| Status | Code      | Cause                  |
|--------|-----------|------------------------|
| 404    | NOT_FOUND | Account does not exist |

---

### GET /api/accounts/:accountId/transactions

List all transactions for an account with optional filtering and pagination.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| accountId | UUID | Account ID  |

**Query Parameters**

| Parameter | Type    | Default | Description                          |
|-----------|---------|---------|--------------------------------------|
| page      | integer | 1       | Page number                          |
| limit     | integer | 20      | Results per page (1–100)             |
| type      | string  | —       | Filter by type: `credit` or `debit`  |

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "a1b2c3d4-...",
        "accountId": "3fa85f64-...",
        "type": "credit",
        "amount": "500",
        "referenceId": "INV-2026-001",
        "description": "Salary payment",
        "balanceBefore": "0",
        "balanceAfter": "500",
        "createdAt": "2026-10-27T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Errors**

| Status | Code             | Cause                           |
|--------|------------------|---------------------------------|
| 404    | NOT_FOUND        | Account does not exist          |
| 422    | VALIDATION_ERROR | Invalid query parameters        |

---

## Transactions

### POST /api/transactions

Create a new transaction (credit or debit) on an account. This operation is **atomic** — the transaction record and the account balance update either both succeed or both fail.

**Request Body**
```json
{
  "account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "credit",
  "amount": 250.00,
  "reference_id": "INV-2026-001",
  "description": "Salary payment"
}
```

| Field        | Type   | Required | Description                                          |
|--------------|--------|----------|------------------------------------------------------|
| account_id   | UUID   | Yes      | ID of the account to transact on                     |
| type         | string | Yes      | `credit` or `debit`                                  |
| amount       | number | Yes      | Positive number, greater than 0                      |
| reference_id | string | Yes      | Unique identifier for this transaction (per account) |
| description  | string | No       | Optional memo (max 500 chars)                        |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-...",
    "accountId": "3fa85f64-5717-...",
    "type": "credit",
    "amount": "250",
    "referenceId": "INV-2026-001",
    "description": "Salary payment",
    "balanceBefore": "0",
    "balanceAfter": "250",
    "createdAt": "2026-10-27T10:00:00.000Z"
  }
}
```

**Errors**

| Status | Code               | Cause                                             |
|--------|--------------------|---------------------------------------------------|
| 404    | NOT_FOUND          | account_id does not exist                         |
| 409    | CONFLICT           | reference_id already used for this account        |
| 422    | VALIDATION_ERROR   | Missing/invalid fields                            |
| 422    | INSUFFICIENT_FUNDS | Debit amount exceeds current balance              |

---

## Transfers

### POST /api/transfers

Transfer funds between two accounts. Both the debit from the source and credit to the destination happen atomically. If either fails, the entire transfer is rolled back.

**Request Body**
```json
{
  "from_account_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "to_account_id": "7cb94f21-1234-4321-a1b2-3c4d5e6f7a8b",
  "amount": 30.00,
  "reference_id": "TRF-2026-001",
  "description": "Rent payment"
}
```

| Field           | Type   | Required | Description                                         |
|-----------------|--------|----------|-----------------------------------------------------|
| from_account_id | UUID   | Yes      | Source account ID                                   |
| to_account_id   | UUID   | Yes      | Destination account ID (must differ from source)    |
| amount          | number | Yes      | Positive number, greater than 0                     |
| reference_id    | string | Yes      | Unique identifier for this transfer                 |
| description     | string | No       | Optional memo (max 500 chars)                       |

**Response 200**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "debit": {
      "id": "debit-txn-uuid",
      "accountId": "3fa85f64-...",
      "type": "debit",
      "amount": "30",
      "referenceId": "TRF-2026-001-debit",
      "description": "Rent payment",
      "balanceBefore": "100",
      "balanceAfter": "70",
      "createdAt": "2026-10-27T10:00:00.000Z"
    },
    "credit": {
      "id": "credit-txn-uuid",
      "accountId": "7cb94f21-...",
      "type": "credit",
      "amount": "30",
      "referenceId": "TRF-2026-001-credit",
      "description": "Rent payment",
      "balanceBefore": "50",
      "balanceAfter": "80",
      "createdAt": "2026-10-27T10:00:00.000Z"
    },
    "from_account": {
      "id": "3fa85f64-...",
      "name": "Alice Johnson",
      "balance": "70"
    },
    "to_account": {
      "id": "7cb94f21-...",
      "name": "Bob Smith",
      "balance": "80"
    }
  }
}
```

**Errors**

| Status | Code               | Cause                                           |
|--------|--------------------|-------------------------------------------------|
| 404    | NOT_FOUND          | Either account does not exist                   |
| 409    | CONFLICT           | reference_id already used for this transfer     |
| 422    | VALIDATION_ERROR   | Missing/invalid fields or same account transfer |
| 422    | INSUFFICIENT_FUNDS | Source account has insufficient balance         |

---

## Error Response Shape

All error responses follow this shape:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

Validation errors include a `details` array:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "amount", "message": "amount must be greater than 0" },
    { "field": "type", "message": "type must be either 'credit' or 'debit'" }
  ]
}
```

### Error Codes

| Code                  | HTTP Status | Description                                  |
|-----------------------|-------------|----------------------------------------------|
| VALIDATION_ERROR      | 422         | Request body/query failed validation         |
| NOT_FOUND             | 404         | Requested resource does not exist            |
| CONFLICT              | 409         | Duplicate reference_id or unique constraint  |
| INSUFFICIENT_FUNDS    | 422         | Debit/transfer exceeds account balance       |
| FOREIGN_KEY_VIOLATION | 422         | Referenced entity does not exist             |
| INTERNAL_SERVER_ERROR | 500         | Unexpected server-side error                 |
