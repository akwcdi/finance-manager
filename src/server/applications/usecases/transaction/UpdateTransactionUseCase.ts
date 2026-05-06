import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { Transaction, Genre } from "@/server/domain/entities/transaction";
import { Amount } from "@/server/domain/value-objects/amount";
import { TransactionId } from "@/server/types";
import { NotFoundError } from "@/server/domain/errors";

export interface UpdateTransactionInput {
  amount?: number;
  item?: string;
  genre?: string;
}

export class UpdateTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(
    id: TransactionId,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const existing = await this.transactionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }

    return this.transactionRepository.update(id, {
      amount: input.amount !== undefined ? Amount.from(input.amount) : undefined,
      description: input.item,
      genre: input.genre as Genre | undefined,
    });
  }
}
