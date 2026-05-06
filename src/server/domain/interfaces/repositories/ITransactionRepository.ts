import { Transaction, Genre } from "@/server/domain/entities/transaction";
import { Amount } from "@/server/domain/value-objects/amount";
import { TransactionId } from "@/server/types";

export interface CreateTransactionInput {
  amount: Amount;
  description: string;
  date: Date;
  genre: Genre;
}

export interface UpdateTransactionInput {
  amount?: Amount;
  description?: string;
  genre?: Genre;
}

export interface MonthlyExpense {
  month: number;
  genreAmounts: Record<string, number>;
  total: number;
}

export interface ITransactionRepository {
  findById(id: TransactionId): Promise<Transaction | null>;
  findByMonth(year: number, month: number): Promise<Transaction[]>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(
    id: TransactionId,
    input: UpdateTransactionInput
  ): Promise<Transaction>;
  delete(id: TransactionId): Promise<void>;
  getMonthlyExpensesByYear(year: number): Promise<MonthlyExpense[]>;
}
