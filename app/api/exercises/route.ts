import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  /api/exercises      -> list every exercise, newest first
// POST /api/exercises      -> create a new exercise

export async function GET() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ exercises });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, muscleGroup, equipmentType } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name,
      muscleGroup: muscleGroup || null,
      equipmentType: equipmentType || null,
    },
  });

  return NextResponse.json({ exercise });
}