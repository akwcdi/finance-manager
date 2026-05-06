declare const brand: unique symbol;

type Brand<T, B extends string> = T & { [brand]: B };

export type TransactionId = Brand<number, "TransactionId">;

export const toTransactionId = (id: number): TransactionId => id as TransactionId;
