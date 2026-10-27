import { z } from "zod";

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name cannot be empty")
    .max(255, "Account name must be at most 255 characters"),
});

export const listAccountsSchema = z.object({
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
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsSchema>;
