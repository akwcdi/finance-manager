import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { Transaction, Genre } from "@/server/domain/entities/transaction";
import { Amount } from "@/server/domain/value-objects/amount";
import { ValidationError } from "@/server/domain/errors";

export interface CreateTransactionInput {
  amount: number;
  item: string;
  date: string;
  genre: string;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    if (!input.amount || !input.item || !input.date || !input.genre) {
      throw new ValidationError("Missing required fields");
    }

    return this.transactionRepository.create({
      amount: Amount.from(input.amount),
      description: input.item,
      date: new Date(input.date),
      genre: input.genre as Genre,
    });
  }
}
