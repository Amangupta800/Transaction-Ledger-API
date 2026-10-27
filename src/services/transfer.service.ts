import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  InsufficientFundsError,
  ConflictError,
} from "../errors/AppError";
import { TransferInput } from "../validators/transfer.validator";
import { TransactionRecord } from "./transaction.service";

export interface TransferResult {
  debit: TransactionRecord;
  credit: TransactionRecord;
  from_account: { id: string; name: string; balance: Prisma.Decimal };
  to_account: { id: string; name: string; balance: Prisma.Decimal };
}

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function transferFunds(input: TransferInput): Promise<TransferResult> {
  return prisma.$transaction(
    async (tx: TxClient) => {
      // Lock both accounts in consistent order (by id) to prevent deadlocks
      const [firstId, secondId] = [input.from_account_id, input.to_account_id].sort();

      const locked = await tx.$queryRaw<
        Array<{ id: string; name: string; balance: string }>
      >`
        SELECT id, name, balance::text
        FROM accounts
        WHERE id = ${firstId} OR id = ${secondId}
        ORDER BY id
        FOR UPDATE
      `;

      const fromRaw = locked.find((a) => a.id === input.from_account_id);
      const toRaw = locked.find((a) => a.id === input.to_account_id);

      if (!fromRaw) throw new NotFoundError("Source account", input.from_account_id);
      if (!toRaw) throw new NotFoundError("Destination account", input.to_account_id);

      const amount = new Prisma.Decimal(input.amount);
      const fromBalance = new Prisma.Decimal(fromRaw.balance);
      const toBalance = new Prisma.Decimal(toRaw.balance);

      // Check sufficient funds
      if (fromBalance.lessThan(amount)) {
        throw new InsufficientFundsError();
      }

      // Check for duplicate reference_id (scoped per account)
      const debitRefId = `${input.reference_id}-debit`;
      const creditRefId = `${input.reference_id}-credit`;

      const [existingDebit, existingCredit] = await Promise.all([
        tx.transaction.findUnique({
          where: {
            accountId_referenceId: {
              accountId: input.from_account_id,
              referenceId: debitRefId,
            },
          },
        }),
        tx.transaction.findUnique({
          where: {
            accountId_referenceId: {
              accountId: input.to_account_id,
              referenceId: creditRefId,
            },
          },
        }),
      ]);

      if (existingDebit || existingCredit) {
        throw new ConflictError(
          `Transfer with reference_id '${input.reference_id}' has already been processed`
        );
      }

      const newFromBalance = fromBalance.minus(amount);
      const newToBalance = toBalance.plus(amount);

      const debitDescription =
        input.description ?? `Transfer to account ${input.to_account_id}`;
      const creditDescription =
        input.description ?? `Transfer from account ${input.from_account_id}`;

      // Atomically create both transaction records and update both balances
      const [debit, credit] = await Promise.all([
        tx.transaction.create({
          data: {
            accountId: input.from_account_id,
            type: "debit",
            amount,
            referenceId: debitRefId,
            description: debitDescription,
            balanceBefore: fromBalance,
            balanceAfter: newFromBalance,
          },
        }),
        tx.transaction.create({
          data: {
            accountId: input.to_account_id,
            type: "credit",
            amount,
            referenceId: creditRefId,
            description: creditDescription,
            balanceBefore: toBalance,
            balanceAfter: newToBalance,
          },
        }),
        tx.account.update({
          where: { id: input.from_account_id },
          data: { balance: newFromBalance },
        }),
        tx.account.update({
          where: { id: input.to_account_id },
          data: { balance: newToBalance },
        }),
      ]);

      return {
        debit: debit as TransactionRecord,
        credit: credit as TransactionRecord,
        from_account: {
          id: fromRaw.id,
          name: fromRaw.name,
          balance: newFromBalance,
        },
        to_account: {
          id: toRaw.id,
          name: toRaw.name,
          balance: newToBalance,
        },
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
