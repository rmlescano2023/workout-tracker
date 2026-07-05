import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This file is an "API route". Because it's named route.ts inside
// app/api/today/, Next.js automatically makes it respond to
// requests at:  GET  /api/today
//
// This is your backend. There's no separate Express server - this
// function runs on Vercel's servers when a browser (or your own
// frontend code) requests /api/today.

export async function GET() {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday ... 6 = Saturday

  const schedule = await prisma.weeklySchedule.findMany({
    where: { dayOfWeek },
    include: { workoutTemplate: { include: { items: { include: { exercise: true } } } }, runType: true },
    orderBy: { slot: "asc" }, // DAY before NIGHT
  });

  return NextResponse.json({ dayOfWeek, schedule });
}
