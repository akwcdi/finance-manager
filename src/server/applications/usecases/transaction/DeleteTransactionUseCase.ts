import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { TransactionId } from "@/server/types";
import { NotFoundError } from "@/server/domain/errors";

export class DeleteTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(id: TransactionId): Promise<void> {
    const existing = await this.transactionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }

    await this.transactionRepository.delete(id);
  }
}
