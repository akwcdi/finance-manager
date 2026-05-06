import type {
  ITransactionRepository,
  MonthlyExpense,
} from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { ValidationError } from "@/server/domain/errors";

export class GetMonthlyExpensesUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(year: number): Promise<MonthlyExpense[]> {
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new ValidationError("Invalid year");
    }

    return this.transactionRepository.getMonthlyExpensesByYear(year);
  }
}
