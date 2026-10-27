import { Request, Response, NextFunction } from "express";
import * as accountService from "../services/account.service";
import { CreateAccountInput, ListAccountsQuery } from "../validators/account.validator";

export async function createAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const account = await accountService.createAccount(req.body as CreateAccountInput);
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function getAccount(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const account = await accountService.getAccountById(req.params.id);
    res.status(200).json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export async function listAccounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await accountService.listAccounts((req.parsedQuery ?? req.query) as unknown as ListAccountsQuery);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
