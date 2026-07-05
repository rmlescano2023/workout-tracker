import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: params.id },
    include: { items: { include: { exercise: true }, orderBy: { order: "asc" } } },
  });

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { name } = await request.json();
  const template = await prisma.workoutTemplate.update({
    where: { id: params.id },
    data: { name },
  });
  return NextResponse.json({ template });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // items are deleted automatically (onDelete: Cascade in the schema)
    await prisma.workoutTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Can't delete - this template is used in the weekly schedule." },
      { status: 409 }
    );
  }
}