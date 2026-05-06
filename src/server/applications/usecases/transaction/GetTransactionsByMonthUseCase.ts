import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { Transaction } from "@/server/domain/entities/transaction";
import { ValidationError } from "@/server/domain/errors";

export class GetTransactionsByMonthUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(yearMonth: string): Promise<Transaction[]> {
    const match = yearMonth.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new ValidationError("Invalid month format. Expected YYYY-MM");
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    return this.transactionRepository.findByMonth(year, month);
  }
}
