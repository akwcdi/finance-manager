import { describe, it, expect } from "vitest";
import { Amount } from "@/server/domain/value-objects/amount";

describe("Amount", () => {
  describe("from", () => {
    it("正常な数値からAmountを生成できる", () => {
      const amount = Amount.from(100);
      expect(amount.toNumber()).toBe(100);
    });

    it("NaNを渡すとエラーをスローする", () => {
      expect(() => Amount.from(NaN)).toThrow("Amount must be a valid number");
    });

    it("負の数も生成できる", () => {
      expect(Amount.from(-50).toNumber()).toBe(-50);
    });

    it("0を渡すと0のAmountを生成できる", () => {
      expect(Amount.from(0).toNumber()).toBe(0);
    });
  });

  describe("zero", () => {
    it("0のAmountを返す", () => {
      expect(Amount.zero().toNumber()).toBe(0);
    });

    it("isZeroがtrueになる", () => {
      expect(Amount.zero().isZero()).toBe(true);
    });
  });

  describe("add", () => {
    it("2つのAmountを加算できる", () => {
      const result = Amount.from(100).add(Amount.from(200));
      expect(result.toNumber()).toBe(300);
    });

    it("0を加算しても値が変わらない", () => {
      const result = Amount.from(100).add(Amount.zero());
      expect(result.toNumber()).toBe(100);
    });
  });

  describe("subtract", () => {
    it("AmountからAmountを減算できる", () => {
      const result = Amount.from(300).subtract(Amount.from(100));
      expect(result.toNumber()).toBe(200);
    });

    it("同じ値を引くと0になる", () => {
      const result = Amount.from(100).subtract(Amount.from(100));
      expect(result.isZero()).toBe(true);
    });
  });

  describe("multiply", () => {
    it("係数を掛けられる", () => {
      const result = Amount.from(100).multiply(3);
      expect(result.toNumber()).toBe(300);
    });

    it("0を掛けると0になる", () => {
      expect(Amount.from(100).multiply(0).isZero()).toBe(true);
    });
  });

  describe("round", () => {
    it("小数点以下を四捨五入する", () => {
      expect(Amount.from(100.5).round().toNumber()).toBe(101);
    });

    it("切り捨てケース", () => {
      expect(Amount.from(100.4).round().toNumber()).toBe(100);
    });
  });

  describe("equals", () => {
    it("同じ値のAmountは等しい", () => {
      expect(Amount.from(100).equals(Amount.from(100))).toBe(true);
    });

    it("異なる値のAmountは等しくない", () => {
      expect(Amount.from(100).equals(Amount.from(200))).toBe(false);
    });
  });

  describe("isGreaterThan", () => {
    it("大きい方がtrueを返す", () => {
      expect(Amount.from(200).isGreaterThan(Amount.from(100))).toBe(true);
    });

    it("小さい方はfalseを返す", () => {
      expect(Amount.from(100).isGreaterThan(Amount.from(200))).toBe(false);
    });

    it("同じ値はfalseを返す", () => {
      expect(Amount.from(100).isGreaterThan(Amount.from(100))).toBe(false);
    });
  });

  describe("sum", () => {
    it("配列のAmountを合計できる", () => {
      const result = Amount.sum([Amount.from(100), Amount.from(200), Amount.from(300)]);
      expect(result.toNumber()).toBe(600);
    });

    it("空配列は0を返す", () => {
      expect(Amount.sum([]).isZero()).toBe(true);
    });
  });

  describe("文字列変換", () => {
    it("toDecimalStringは小数点2桁で返す", () => {
      expect(Amount.from(1000).toDecimalString()).toBe("1000.00");
    });

    it("toLocaleStringは日本語フォーマットで返す", () => {
      expect(Amount.from(1000).toLocaleString()).toBe("1,000");
    });

    it("toStringは数値の文字列を返す", () => {
      expect(Amount.from(100).toString()).toBe("100");
    });
  });
});
