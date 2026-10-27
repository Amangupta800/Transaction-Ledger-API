import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createAccountSchema,
  listAccountsSchema,
} from "../validators/account.validator";
import {
  createAccount,
  getAccount,
  listAccounts,
} from "../controllers/account.controller";
import { listTransactionsSchema } from "../validators/transaction.validator";
import { listTransactions } from "../controllers/transaction.controller";

const router = Router();

// POST /api/accounts
router.post("/", validate(createAccountSchema), createAccount);

// GET /api/accounts
router.get("/", validate(listAccountsSchema, "query"), listAccounts);

// GET /api/accounts/:id
router.get("/:id", getAccount);

// GET /api/accounts/:accountId/transactions
router.get(
  "/:accountId/transactions",
  validate(listTransactionsSchema, "query"),
  listTransactions
);

export default router;
