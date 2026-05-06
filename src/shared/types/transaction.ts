import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  item: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  genre: z.string().min(1),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  item: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionRequest = z.infer<typeof updateTransactionSchema>;

export interface TransactionResponse {
  id: number;
  amount: number;
  description: string;
  date: string;
  genre: string;
  created_at: string;
}
