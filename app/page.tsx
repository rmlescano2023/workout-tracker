import Link from "next/link";
import { prisma } from "@/lib/prisma";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TodayPage() {
  const dayOfWeek = new Date().getDay();

  const schedule = await prisma.weeklySchedule.findMany({
    where: { dayOfWeek },
    include: {
      workoutTemplate: { include: { items: { include: { exercise: true }, orderBy: { order: "asc" } } } },
      runType: true,
    },
    orderBy: { slot: "asc" },
  });

  const cardAccent = { GYM: "card-gym", RUN: "card-run", REST: "card-rest" } as const;
  const badgeAccent = { GYM: "badge-gym", RUN: "badge-run", REST: "badge-rest" } as const;

  return (
    <main>
      <p className="eyebrow mb-1">{DAY_NAMES[dayOfWeek]}</p>
      <h1>Today</h1>

      {schedule.length === 0 && (
        <p className="empty-note">Nothing scheduled today. Rest day, or the schedule hasn&apos;t been set up yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {schedule.map((entry) => (
          <section key={entry.id} className={`card ${cardAccent[entry.type]}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow">{entry.slot === "DAY" ? "☀ Day" : "🌙 Night"}</span>
              <span className={`badge ${badgeAccent[entry.type]}`}>{entry.type}</span>
            </div>

            {entry.type === "RUN" && entry.runType && (
              <p className="text-ink">
                <span className="font-display text-lg">{entry.runType.name}</span>
                {entry.runType.description && (
                  <span className="text-ink-dim"> — {entry.runType.description}</span>
                )}
              </p>
            )}

            {entry.type === "GYM" && entry.workoutTemplate && (
              <div>
                <p className="font-display text-lg mb-2">{entry.workoutTemplate.name}</p>
                <ul className="flex flex-col gap-1 mb-4">
                  {entry.workoutTemplate.items.map((item) => (
                    <li key={item.id} className="text-sm text-ink-dim flex justify-between border-b border-line py-1.5 last:border-0">
                      <span className="text-ink">{item.exercise.name}</span>
                      <span className="tabular-nums">
                        {item.targetSets} × {item.repsMin}
                        {item.repsMax ? `-${item.repsMax}` : ""}
                        {item.toFailure ? " (failure)" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/log">
                  <button className="btn btn-primary w-full sm:w-auto">Log this workout</button>
                </Link>
              </div>
            )}

            {entry.type === "REST" && <p className="text-ink-dim">Recovery day. Nothing logged here.</p>}
          </section>
        ))}
      </div>
    </main>
  );
}