import { Router } from "express";
import { validate } from "../middleware/validate";
import { transferSchema } from "../validators/transfer.validator";
import { transfer } from "../controllers/transfer.controller";

const router = Router();

// POST /api/transfers
router.post("/", validate(transferSchema), transfer);

export default router;
