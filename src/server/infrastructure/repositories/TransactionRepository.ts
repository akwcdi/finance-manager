import { eq, sql } from "drizzle-orm";
import { Transaction, Genre } from "@/server/domain/entities/transaction";
import { Amount } from "@/server/domain/value-objects/amount";
import {
  ITransactionRepository,
  CreateTransactionInput,
  UpdateTransactionInput,
  MonthlyExpense,
} from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { TransactionId, toTransactionId } from "@/server/types";
import { NotFoundError } from "@/server/domain/errors";
import { transactions } from "@/server/infrastructure/db/schema";
import type { DB } from "@/server/infrastructure/db/database";

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly db: DB) {}

  private toEntity(
    record: typeof transactions.$inferSelect
  ): Transaction {
    return Transaction.create({
      transactionId: toTransactionId(record.id),
      amount: Amount.from(parseFloat(record.amount)),
      description: record.description,
      date: new Date(record.date),
      genre: record.genre as Genre,
      createdAt: record.createdAt ?? new Date(),
    });
  }

  async findById(id: TransactionId): Promise<Transaction | null> {
    const results = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id as number));

    if (results.length === 0) return null;
    return this.toEntity(results[0]);
  }

  async findByMonth(year: number, month: number): Promise<Transaction[]> {
    const monthStr = String(month).padStart(2, "0");
    const yearMonth = `${year}-${monthStr}`;

    const results = await this.db
      .select()
      .from(transactions)
      .where(
        sql`DATE_FORMAT(${transactions.date}, '%Y-%m') = ${yearMonth}`
      );

    return results.map((r) => this.toEntity(r));
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const result = await this.db.insert(transactions).values({
      amount: input.amount.toDecimalString(),
      description: input.description,
      date: input.date,
      genre: input.genre,
    });

    const insertId = result[0].insertId;

    const created = await this.findById(toTransactionId(insertId));
    if (!created) {
      throw new Error("Failed to retrieve created transaction");
    }
    return created;
  }

  async update(
    id: TransactionId,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }

    const updateValues: Record<string, unknown> = {};
    if (input.amount !== undefined) {
      updateValues.amount = input.amount.toDecimalString();
    }
    if (input.description !== undefined) {
      updateValues.description = input.description;
    }
    if (input.genre !== undefined) {
      updateValues.genre = input.genre;
    }

    if (Object.keys(updateValues).length > 0) {
      await this.db
        .update(transactions)
        .set(updateValues)
        .where(eq(transactions.id, id as number));
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Failed to retrieve updated transaction");
    }
    return updated;
  }

  async delete(id: TransactionId): Promise<void> {
    await this.db
      .delete(transactions)
      .where(eq(transactions.id, id as number));
  }

  async getMonthlyExpensesByYear(year: number): Promise<MonthlyExpense[]> {
    const results = await this.db
      .select({
        month: sql<number>`MONTH(${transactions.date})`,
        genre: transactions.genre,
        total: sql<string>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(sql`YEAR(${transactions.date}) = ${year}`)
      .groupBy(sql`MONTH(${transactions.date})`, transactions.genre);

    const monthlyMap = new Map<number, MonthlyExpense>();
    for (let m = 1; m <= 12; m++) {
      monthlyMap.set(m, { month: m, genreAmounts: {}, total: 0 });
    }

    for (const row of results) {
      const expense = monthlyMap.get(row.month)!;
      const amount = parseFloat(row.total);
      expense.genreAmounts[row.genre] = amount;
      expense.total += amount;
    }

    return Array.from(monthlyMap.values());
  }
}
