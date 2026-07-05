import { prisma } from "@/lib/prisma";
import ScheduleGrid from "@/components/ScheduleGrid";

export default async function ManageSchedulePage() {
  const [schedule, templates, runTypes] = await Promise.all([
    prisma.weeklySchedule.findMany(),
    prisma.workoutTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.runType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main>
      <h1>Manage Weekly Schedule</h1>
      <ScheduleGrid initialSchedule={schedule} templates={templates} initialRunTypes={runTypes} />
    </main>
  );
}