import { NextResponse } from "next/server";
import { NotFoundError, ValidationError } from "@/server/domain/errors";

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ message }, { status: 500 });
}
