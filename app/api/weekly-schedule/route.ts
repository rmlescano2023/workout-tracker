import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/weekly-schedule -> every configured cell (day+slot), with linked
// workout template / run type names included for display.

export async function GET() {
  const schedule = await prisma.weeklySchedule.findMany({
    include: { workoutTemplate: true, runType: true },
  });
  return NextResponse.json({ schedule });
}

// PUT /api/weekly-schedule
// Body: { dayOfWeek, slot, type, workoutTemplateId?, runTypeId? }
// Upserts the one cell for that day+slot - creates it if it doesn't exist
// yet, or overwrites it if it does. This is what makes the schedule grid
// work: each dropdown change calls this for just its own cell.

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { dayOfWeek, slot, type, workoutTemplateId, runTypeId } = body;

  if (dayOfWeek === undefined || !slot || !type) {
    return NextResponse.json({ error: "dayOfWeek, slot, and type are required" }, { status: 400 });
  }

  const data = {
    dayOfWeek,
    slot,
    type,
    workoutTemplateId: type === "GYM" ? workoutTemplateId ?? null : null,
    runTypeId: type === "RUN" ? runTypeId ?? null : null,
  };

  const entry = await prisma.weeklySchedule.upsert({
    where: { dayOfWeek_slot: { dayOfWeek, slot } },
    update: data,
    create: data,
    include: { workoutTemplate: true, runType: true },
  });

  return NextResponse.json({ entry });
}