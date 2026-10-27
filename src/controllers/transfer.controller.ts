import { Request, Response, NextFunction } from "express";
import * as transferService from "../services/transfer.service";
import { TransferInput } from "../validators/transfer.validator";

export async function transfer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await transferService.transferFunds(req.body as TransferInput);
    res.status(200).json({
      success: true,
      data: result,
      message: "Transfer completed successfully",
    });
  } catch (err) {
    next(err);
  }
}
