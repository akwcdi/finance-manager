import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTransactionUseCase } from "@/server/applications/usecases/transaction/CreateTransactionUseCase";
import type { ITransactionRepository } from "@/server/domain/interfaces/repositories/ITransactionRepository";
import { Transaction } from "@/server/domain/entities/transaction";
import { Amount } from "@/server/domain/value-objects/amount";
import { toTransactionId } from "@/server/types";

const mockRepository: ITransactionRepository = {
  findById: vi.fn(),
  findByMonth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getMonthlyExpensesByYear: vi.fn(),
};

function makeTransaction(): Transaction {
  return Transaction.create({
    transactionId: toTransactionId(1),
    amount: Amount.from(1000),
    description: "ランチ",
    date: new Date("2024-01-15"),
    genre: "food",
    createdAt: new Date("2024-01-15"),
  });
}

describe("CreateTransactionUseCase", () => {
  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateTransactionUseCase(mockRepository);
  });

  it("正常な入力でトランザクションを作成できる", async () => {
    const expected = makeTransaction();
    vi.mocked(mockRepository.create).mockResolvedValue(expected);

    const result = await useCase.execute({
      amount: 1000,
      item: "ランチ",
      date: "2024-01-15",
      genre: "food",
    });

    expect(result).toBe(expected);
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  describe("バリデーション", () => {
    it("amountが0のときValidationErrorをスローする", async () => {
      await expect(
        useCase.execute({ amount: 0, item: "ランチ", date: "2024-01-15", genre: "food" })
      ).rejects.toThrow("Missing required fields");
    });

    it("itemが空文字のときValidationErrorをスローする", async () => {
      await expect(
        useCase.execute({ amount: 1000, item: "", date: "2024-01-15", genre: "food" })
      ).rejects.toThrow("Missing required fields");
    });

    it("dateが空文字のときValidationErrorをスローする", async () => {
      await expect(
        useCase.execute({ amount: 1000, item: "ランチ", date: "", genre: "food" })
      ).rejects.toThrow("Missing required fields");
    });

    it("genreが空文字のときValidationErrorをスローする", async () => {
      await expect(
        useCase.execute({ amount: 1000, item: "ランチ", date: "2024-01-15", genre: "" })
      ).rejects.toThrow("Missing required fields");
    });

    it("バリデーションエラー時はリポジトリを呼ばない", async () => {
      await expect(
        useCase.execute({ amount: 0, item: "", date: "", genre: "" })
      ).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("リポジトリへの引数", () => {
    it("Amountオブジェクトに変換して渡す", async () => {
      vi.mocked(mockRepository.create).mockResolvedValue(makeTransaction());

      await useCase.execute({ amount: 1500, item: "夕食", date: "2024-01-15", genre: "food" });

      const callArg = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(callArg.amount.toNumber()).toBe(1500);
      expect(callArg.description).toBe("夕食");
      expect(callArg.genre).toBe("food");
    });

    it("dateをDateオブジェクトに変換して渡す", async () => {
      vi.mocked(mockRepository.create).mockResolvedValue(makeTransaction());

      await useCase.execute({ amount: 1000, item: "ランチ", date: "2024-03-20", genre: "food" });

      const callArg = vi.mocked(mockRepository.create).mock.calls[0][0];
      expect(callArg.date).toBeInstanceOf(Date);
      expect(callArg.date.toISOString()).toContain("2024-03-20");
    });
  });
});
