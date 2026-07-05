import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const runTypes = await prisma.runType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ runTypes });
}

export async function POST(request: NextRequest) {
  const { name, description } = await request.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const runType = await prisma.runType.create({ data: { name, description: description || null } });
  return NextResponse.json({ runType });
}