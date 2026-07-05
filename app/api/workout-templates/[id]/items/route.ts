import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/workout-templates/:id/items
// Body: { exerciseId, targetSets, repsMin, repsMax, toFailure }
// Automatically appends to the end of the template's order.

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { exerciseId, targetSets, repsMin, repsMax, toFailure } = body;

  if (!exerciseId) {
    return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
  }

  const lastItem = await prisma.templateExercise.findFirst({
    where: { templateId: params.id },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastItem?.order ?? 0) + 1;

  const item = await prisma.templateExercise.create({
    data: {
      templateId: params.id,
      exerciseId,
      order: nextOrder,
      targetSets: targetSets ?? 3,
      repsMin: repsMin ?? 10,
      repsMax: repsMax || null,
      toFailure: !!toFailure,
    },
    include: { exercise: true },
  });

  return NextResponse.json({ item });
}