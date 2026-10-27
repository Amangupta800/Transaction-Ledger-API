import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "../errors/AppError";
import { CreateAccountInput, ListAccountsQuery } from "../validators/account.validator";
import { PaginatedResponse, PaginationMeta } from "../types";

export type AccountRecord = {
  id: string;
  name: string;
  balance: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
};

export async function createAccount(input: CreateAccountInput): Promise<AccountRecord> {
  return prisma.account.create({
    data: { name: input.name },
  }) as Promise<AccountRecord>;
}

export async function getAccountById(id: string): Promise<AccountRecord> {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) throw new NotFoundError("Account", id);
  return account as AccountRecord;
}

export async function listAccounts(
  query: ListAccountsQuery
): Promise<PaginatedResponse<AccountRecord>> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [total, items] = await prisma.$transaction([
    prisma.account.count(),
    prisma.account.findMany({
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

  return { items: items as AccountRecord[], pagination };
}
