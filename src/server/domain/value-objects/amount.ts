export class Amount {
  private constructor(private readonly value: number) {}

  static from(value: number): Amount {
    if (isNaN(value)) {
      throw new Error("Amount must be a valid number");
    }
    return new Amount(value);
  }

  static zero(): Amount {
    return new Amount(0);
  }

  static sum(amounts: Amount[]): Amount {
    return amounts.reduce((acc, a) => acc.add(a), Amount.zero());
  }

  add(other: Amount): Amount {
    return new Amount(this.value + other.value);
  }

  subtract(other: Amount): Amount {
    return new Amount(this.value - other.value);
  }

  multiply(factor: number): Amount {
    return new Amount(this.value * factor);
  }

  round(): Amount {
    return new Amount(Math.round(this.value));
  }

  equals(other: Amount): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: Amount): boolean {
    return this.value > other.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  toNumber(): number {
    return this.value;
  }

  toDecimalString(): string {
    return this.value.toFixed(2);
  }

  toLocaleString(): string {
    return this.value.toLocaleString("ja-JP");
  }

  toString(): string {
    return this.value.toString();
  }
}
