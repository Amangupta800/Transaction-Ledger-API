import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  InsufficientFundsError,
  ConflictError,
} from "../errors/AppError";
import { CreateTransactionInput, ListTransactionsQuery } from "../validators/transaction.validator";
import { PaginatedResponse, PaginationMeta } from "../types";

export type TransactionRecord = {
  id: string;
  accountId: string;
  type: "credit" | "debit";
  amount: Prisma.Decimal;
  referenceId: string;
  description: string | null;
  balanceBefore: Prisma.Decimal;
  balanceAfter: Prisma.Decimal;
  createdAt: Date;
};

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function createTransaction(
  input: CreateTransactionInput
): Promise<TransactionRecord> {
  return prisma.$transaction(
    async (tx: TxClient) => {
      // 1. Lock the account row for update to prevent concurrent balance races
      const accounts = await tx.$queryRaw<
        Array<{ id: string; balance: string }>
      >`
        SELECT id, balance::text
        FROM accounts
        WHERE id = ${input.account_id}
        FOR UPDATE
      `;

      if (accounts.length === 0) {
        throw new NotFoundError("Account", input.account_id);
      }

      const currentBalance = new Prisma.Decimal(accounts[0].balance);
      const amount = new Prisma.Decimal(input.amount);

      // 2. Check for duplicate reference_id on this account
      const existing = await tx.transaction.findUnique({
        where: {
          accountId_referenceId: {
            accountId: input.account_id,
            referenceId: input.reference_id,
          },
        },
      });

      if (existing) {
        throw new ConflictError(
          `Transaction with reference_id '${input.reference_id}' already exists for this account`
        );
      }

      // 3. Calculate new balance
      let newBalance: Prisma.Decimal;
      if (input.type === "credit") {
        newBalance = currentBalance.plus(amount);
      } else {
        if (currentBalance.lessThan(amount)) {
          throw new InsufficientFundsError();
        }
        newBalance = currentBalance.minus(amount);
      }

      // 4. Create transaction and update account balance atomically
      const [transaction] = await Promise.all([
        tx.transaction.create({
          data: {
            accountId: input.account_id,
            type: input.type,
            amount,
            referenceId: input.reference_id,
            description: input.description,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
          },
        }),
        tx.account.update({
          where: { id: input.account_id },
          data: { balance: newBalance },
        }),
      ]);

      return transaction as TransactionRecord;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function listTransactions(
  accountId: string,
  query: ListTransactionsQuery
): Promise<PaginatedResponse<TransactionRecord>> {
  // Verify account exists
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new NotFoundError("Account", accountId);

  const { page, limit, type } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    accountId,
    ...(type ? { type } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return { items: items as TransactionRecord[], pagination };
}
