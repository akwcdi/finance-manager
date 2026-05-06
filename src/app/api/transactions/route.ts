import { NextResponse } from "next/server";
import { db } from "@/server/infrastructure/db/database";
import { DIContainer } from "@/server/infrastructure/di-container";
import { handleApiError } from "@/server/infrastructure/handleApiError";
import { createTransactionSchema } from "@/shared/types/transaction";
import { Transaction } from "@/server/domain/entities/transaction";

function toResponse(entity: Transaction) {
  return {
    id: entity.transactionId as number,
    amount: entity.amount.toNumber(),
    description: entity.description,
    date: entity.date.toISOString().split("T")[0],
    genre: entity.genre,
    created_at: entity.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const container = new DIContainer(db);

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { message: "Month parameter is required" },
        { status: 400 }
      );
    }

    const transactions =
      await container.GetTransactionsByMonthUseCase.execute(month);

    return NextResponse.json(transactions.map(toResponse));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const container = new DIContainer(db);

    const body = await request.json();
    const parsed = createTransactionSchema.parse(body);

    const transaction =
      await container.CreateTransactionUseCase.execute(parsed);

    return NextResponse.json(toResponse(transaction), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
