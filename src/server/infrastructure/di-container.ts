import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { TransactionRepository } from "@/server/infrastructure/repositories/TransactionRepository";
import { CreateTransactionUseCase } from "@/server/applications/usecases/transaction/CreateTransactionUseCase";
import { UpdateTransactionUseCase } from "@/server/applications/usecases/transaction/UpdateTransactionUseCase";
import { DeleteTransactionUseCase } from "@/server/applications/usecases/transaction/DeleteTransactionUseCase";
import { GetTransactionsByMonthUseCase } from "@/server/applications/usecases/transaction/GetTransactionsByMonthUseCase";
import { GetMonthlyExpensesUseCase } from "@/server/applications/usecases/transaction/GetMonthlyExpensesUseCase";
import type { DB } from "@/server/infrastructure/db/database";

export class DIContainer {
  private instances = new Map<string, unknown>();

  constructor(private readonly db: DB) {}

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  // Repositories

  get TransactionRepository(): ITransactionRepository {
    return this.getOrCreate(
      "TransactionRepository",
      () => new TransactionRepository(this.db)
    );
  }

  // UseCases

  get CreateTransactionUseCase() {
    return this.getOrCreate(
      "CreateTransactionUseCase",
      () => new CreateTransactionUseCase(this.TransactionRepository)
    );
  }

  get UpdateTransactionUseCase() {
    return this.getOrCreate(
      "UpdateTransactionUseCase",
      () => new UpdateTransactionUseCase(this.TransactionRepository)
    );
  }

  get DeleteTransactionUseCase() {
    return this.getOrCreate(
      "DeleteTransactionUseCase",
      () => new DeleteTransactionUseCase(this.TransactionRepository)
    );
  }

  get GetTransactionsByMonthUseCase() {
    return this.getOrCreate(
      "GetTransactionsByMonthUseCase",
      () => new GetTransactionsByMonthUseCase(this.TransactionRepository)
    );
  }

  get GetMonthlyExpensesUseCase() {
    return this.getOrCreate(
      "GetMonthlyExpensesUseCase",
      () => new GetMonthlyExpensesUseCase(this.TransactionRepository)
    );
  }
}
