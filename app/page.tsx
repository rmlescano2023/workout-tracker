import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Notice this component is NOT marked "use client" - that makes it a
// "Server Component" by default in Next.js. It runs only on the server,
// so it can query the database directly, right here, with no API call
// needed. The HTML it produces is what gets sent to the browser.
//
// Later, when we build interactive bits (checking off a set, a button
// that logs weight), THOSE specific small components will need
// "use client" at the top, because they need to run in the browser to
// respond to clicks. But this page itself doesn't need that.

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

  return (
    <main>
      <h1>Today - {DAY_NAMES[dayOfWeek]}</h1>

      {schedule.length === 0 && <p>Nothing scheduled today. Rest day, or the schedule hasn&apos;t been set up yet.</p>}

      {schedule.map((entry) => (
        <section key={entry.id} style={{ marginBottom: "2rem" }}>
          <h2>{entry.slot === "DAY" ? "☀️ Day" : "🌙 Night"}</h2>

          {entry.type === "RUN" && entry.runType && (
            <p>
              🏃 <strong>{entry.runType.name}</strong>
              {entry.runType.description && <> - {entry.runType.description}</>}
            </p>
          )}

          {entry.type === "GYM" && entry.workoutTemplate && (
            <div>
              <p>
                🏋️ <strong>{entry.workoutTemplate.name}</strong>
              </p>
              <ul>
                {entry.workoutTemplate.items.map((item) => (
                  <li key={item.id}>
                    {item.exercise.name} - {item.targetSets} sets x {item.repsMin}
                    {item.repsMax ? `-${item.repsMax}` : ""} reps
                    {item.toFailure ? " (to failure)" : ""}
                  </li>
                ))}
              </ul>
              <Link href="/log">
                <button>Log this workout</button>
              </Link>
            </div>
          )}

          {entry.type === "REST" && <p>💤 Rest</p>}
        </section>
      ))}
    </main>
  );
}