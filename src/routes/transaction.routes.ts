import { Router } from "express";
import { validate } from "../middleware/validate";
import { createTransactionSchema } from "../validators/transaction.validator";
import { createTransaction } from "../controllers/transaction.controller";

const router = Router();

// POST /api/transactions
router.post("/", validate(createTransactionSchema), createTransaction);

export default router;
