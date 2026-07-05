import { prisma } from "@/lib/prisma";
import WorkoutTemplateEditor from "@/components/WorkoutTemplateEditor";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditWorkoutTemplatePage({ params }: { params: { id: string } }) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: params.id },
    include: { items: { include: { exercise: true }, orderBy: { order: "asc" } } },
  });

  if (!template) notFound();

  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });

  return (
    <main>
      <Link href="/manage/workouts" className="eyebrow no-underline hover:underline">
        ← Workouts
      </Link>
      <h1 className="mt-1">{template.name}</h1>
      <WorkoutTemplateEditor templateId={template.id} initialItems={template.items} exerciseOptions={exercises} />
    </main>
  );
}