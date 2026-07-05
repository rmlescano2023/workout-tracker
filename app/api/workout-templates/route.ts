import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  /api/workout-templates  -> list all templates (name + item count)
// POST /api/workout-templates  -> create a new empty template, just a name

export async function GET() {
  const templates = await prisma.workoutTemplate.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const template = await prisma.workoutTemplate.create({ data: { name } });
  return NextResponse.json({ template });
}