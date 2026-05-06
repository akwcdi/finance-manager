import { NextResponse } from "next/server";
import { db } from "@/server/infrastructure/db/database";
import { DIContainer } from "@/server/infrastructure/di-container";
import { handleApiError } from "@/server/infrastructure/handleApiError";
import { updateTransactionSchema } from "@/shared/types/transaction";
import { toTransactionId } from "@/server/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const container = new DIContainer(db);
    const { id } = await params;
    const transactionId = toTransactionId(parseInt(id, 10));

    const body = await request.json();
    const parsed = updateTransactionSchema.parse(body);

    const transaction = await container.UpdateTransactionUseCase.execute(
      transactionId,
      parsed
    );

    return NextResponse.json({
      message: "Transaction updated successfully",
      id: transaction.transactionId as number,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const container = new DIContainer(db);
    const { id } = await params;
    const transactionId = toTransactionId(parseInt(id, 10));

    await container.DeleteTransactionUseCase.execute(transactionId);

    return NextResponse.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
