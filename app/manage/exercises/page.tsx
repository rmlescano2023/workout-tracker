import { prisma } from "@/lib/prisma";
import ExercisesManager from "@/components/ExercisesManager";

export default async function ManageExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>Manage Exercises</h1>
      <ExercisesManager initialExercises={exercises} />
    </main>
  );
}