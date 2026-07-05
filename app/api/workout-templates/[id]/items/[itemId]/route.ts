import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/workout-templates/:id/items/:itemId
// Accepts any subset of: targetSets, repsMin, repsMax, toFailure, order
// (order is used for reordering - the client swaps two items' order values)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const body = await request.json();
  const item = await prisma.templateExercise.update({
    where: { id: params.itemId },
    data: body,
    include: { exercise: true },
  });
  return NextResponse.json({ item });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  await prisma.templateExercise.delete({ where: { id: params.itemId } });
  return NextResponse.json({ ok: true });
}