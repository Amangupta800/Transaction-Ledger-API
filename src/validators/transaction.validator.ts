import { z } from "zod";

export const createTransactionSchema = z.object({
  account_id: z
    .string()
    .uuid("account_id must be a valid UUID"),
  type: z.enum(["credit", "debit"] as const, {
    error: "type must be either 'credit' or 'debit'",
  }),
  amount: z
    .number({ error: "amount must be a positive number" })
    .positive("amount must be greater than 0"),
  reference_id: z
    .string()
    .trim()
    .min(1, "reference_id cannot be empty")
    .max(255, "reference_id must be at most 255 characters"),
  description: z.string().trim().max(500).optional(),
});

export const listTransactionsSchema = z.object({
  page: z.coerce
    .number()
    .int("page must be an integer")
    .positive("page must be greater than 0")
    .default(1),
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(100, "limit must be at most 100")
    .default(20),
  type: z
    .enum(["credit", "debit"] as const, { error: "type must be 'credit' or 'debit'" })
    .optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema>;
