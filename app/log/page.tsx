import { prisma } from "@/lib/prisma";
import LogWorkoutForm, { ExerciseForLog } from "@/components/LogWorkoutForm";

export default async function LogPage() {
  const dayOfWeek = new Date().getDay();

  const gymSchedule = await prisma.weeklySchedule.findFirst({
    where: { dayOfWeek, type: "GYM" },
    include: {
      workoutTemplate: {
        include: { items: { include: { exercise: true }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!gymSchedule?.workoutTemplate) {
    return (
      <main>
        <h1>Log Workout</h1>
        <p className="empty-note">No gym workout scheduled for today.</p>
      </main>
    );
  }

  const exercises: ExerciseForLog[] = await Promise.all(
    gymSchedule.workoutTemplate.items.map(async (item) => {
      const lastLog = await prisma.exerciseLog.findFirst({
        where: { exerciseId: item.exerciseId, weightKg: { not: null } },
        orderBy: { date: "desc" },
      });

      return {
        id: item.exerciseId,
        name: item.exercise.name,
        targetSets: item.targetSets,
        repsMin: item.repsMin,
        repsMax: item.repsMax,
        toFailure: item.toFailure,
        lastWeightKg: lastLog?.weightKg ?? null,
      };
    })
  );

  return (
    <main>
      <p className="eyebrow mb-1">{gymSchedule.workoutTemplate.name}</p>
      <h1>Log Workout</h1>
      <LogWorkoutForm exercises={exercises} />
    </main>
  );
}