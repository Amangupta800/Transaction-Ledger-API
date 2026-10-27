import { z } from "zod";

export const transferSchema = z
  .object({
    from_account_id: z
      .string()
      .uuid("from_account_id must be a valid UUID"),
    to_account_id: z
      .string()
      .uuid("to_account_id must be a valid UUID"),
    amount: z
      .number({ error: "amount must be a positive number" })
      .positive("amount must be greater than 0"),
    reference_id: z
      .string()
      .trim()
      .min(1, "reference_id cannot be empty")
      .max(255, "reference_id must be at most 255 characters"),
    description: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: "from_account_id and to_account_id must be different accounts",
    path: ["to_account_id"],
  });

export type TransferInput = z.infer<typeof transferSchema>;
