import { Request, Response, NextFunction } from "express";
import * as transactionService from "../services/transaction.service";
import {
  CreateTransactionInput,
  ListTransactionsQuery,
} from "../validators/transaction.validator";

export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const transaction = await transactionService.createTransaction(
      req.body as CreateTransactionInput
    );
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(
  req: Request<{ accountId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await transactionService.listTransactions(
      req.params.accountId,
      (req.parsedQuery ?? req.query) as unknown as ListTransactionsQuery
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
