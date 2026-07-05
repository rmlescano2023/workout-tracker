import { prisma } from "@/lib/prisma";
import WorkoutTemplatesList from "@/components/WorkoutTemplatesList";

export default async function ManageWorkoutsPage() {
  const templates = await prisma.workoutTemplate.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>Manage Workout Templates</h1>
      <WorkoutTemplatesList initialTemplates={templates} />
    </main>
  );
}