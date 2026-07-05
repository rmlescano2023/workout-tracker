import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/logs
// Body: { logs: [{ exerciseId, setNumber, weightKg, reps, toFailure, completed }, ...] }
//
// This saves everything from one workout session in a single request,
// rather than one network call per set - simpler and faster.

export async function POST(request: NextRequest) {
  const body = await request.json();
  const logs = body.logs as Array<{
    exerciseId: string;
    setNumber: number;
    weightKg: number | null;
    reps: number | null;
    toFailure: boolean;
    completed: boolean;
  }>;

  if (!Array.isArray(logs) || logs.length === 0) {
    return NextResponse.json({ error: "No logs provided" }, { status: 400 });
  }

  const created = await prisma.$transaction(
    logs.map((log) =>
      prisma.exerciseLog.create({
        data: {
          exerciseId: log.exerciseId,
          setNumber: log.setNumber,
          weightKg: log.weightKg ?? undefined,
          reps: log.reps ?? undefined,
          toFailure: log.toFailure,
          completed: log.completed,
        },
      })
    )
  );

  return NextResponse.json({ saved: created.length });
}