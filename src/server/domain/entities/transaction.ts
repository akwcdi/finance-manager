import { TransactionId } from "@/server/types";
import { Amount } from "@/server/domain/value-objects/amount";

export type Genre =
  | "food"
  | "transportation"
  | "entertainment"
  | "utilities"
  | "consumables"
  | "pets"
  | "other";

export interface CreateTransactionParams {
  transactionId: TransactionId;
  amount: Amount;
  description: string;
  date: Date;
  genre: Genre;
  createdAt: Date;
}

export class Transaction {
  private constructor(
    public readonly transactionId: TransactionId,
    public readonly amount: Amount,
    public readonly description: string,
    public readonly date: Date,
    public readonly genre: Genre,
    public readonly createdAt: Date
  ) {}

  static create(params: CreateTransactionParams): Transaction {
    return new Transaction(
      params.transactionId,
      params.amount,
      params.description,
      params.date,
      params.genre,
      params.createdAt
    );
  }
}
