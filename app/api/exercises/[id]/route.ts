import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH  /api/exercises/:id  -> update name/muscleGroup/equipmentType
// DELETE /api/exercises/:id  -> remove the exercise

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { name, muscleGroup, equipmentType } = body;

  const exercise = await prisma.exercise.update({
    where: { id: params.id },
    data: {
      name,
      muscleGroup: muscleGroup || null,
      equipmentType: equipmentType || null,
    },
  });

  return NextResponse.json({ exercise });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.exercise.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    // This happens if the exercise is still used in a workout template or
    // has logged history - the database refuses to delete it to avoid
    // leaving broken references behind. That's a safety feature, not a bug.
    return NextResponse.json(
      { error: "Can't delete - this exercise is used in a workout template or has logged history." },
      { status: 409 }
    );
  }
}