import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// This script writes sample data into your database so you have something
// to look at immediately. Run it with: npm run seed
// You can re-run it any time - it clears old data first.

async function main() {
  // Clear existing data (order matters - children before parents)
  await prisma.weeklySchedule.deleteMany();
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.runType.deleteMany();
  await prisma.exercise.deleteMany();

  // --- Run types ---
  const lsd = await prisma.runType.create({
    data: { name: "LSD Run", description: "Long Slow Distance - base endurance" },
  });
  const tenK = await prisma.runType.create({
    data: { name: "10k Run", description: "Steady 10km run" },
  });

  // --- Exercises for "Chest, Shoulders & Triceps" ---
  const exercises = await Promise.all(
    [
      "Inclined Dumbbell Press",
      "Machine Chest Press",
      "Dumbbell Shoulder Press",
      "Chest Flyes",
      "Single-Arm Side Laterals",
      "Single-Arm Tricep Pushdowns",
      "Single-Arm Face Pulls",
    ].map((name) => prisma.exercise.create({ data: { name, muscleGroup: "Chest/Shoulders/Triceps" } }))
  );

  const chestDay = await prisma.workoutTemplate.create({
    data: {
      name: "Chest, Shoulders & Triceps",
      items: {
        create: [
          { order: 1, targetSets: 2, repsMin: 8, toFailure: true, exerciseId: exercises[0].id },
          { order: 2, targetSets: 2, repsMin: 8, toFailure: true, exerciseId: exercises[1].id },
          { order: 3, targetSets: 2, repsMin: 8, toFailure: true, exerciseId: exercises[2].id },
          { order: 4, targetSets: 2, repsMin: 8, toFailure: true, exerciseId: exercises[3].id },
          { order: 5, targetSets: 3, repsMin: 10, exerciseId: exercises[4].id },
          { order: 6, targetSets: 3, repsMin: 10, exerciseId: exercises[5].id },
          { order: 7, targetSets: 3, repsMin: 10, exerciseId: exercises[6].id },
        ],
      },
    },
  });

  // --- Weekly schedule matching your sample table ---
  // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  await prisma.weeklySchedule.createMany({
    data: [
      { dayOfWeek: 0, slot: "DAY", type: "RUN", runTypeId: lsd.id },
      { dayOfWeek: 2, slot: "DAY", type: "RUN", runTypeId: tenK.id },
      { dayOfWeek: 4, slot: "DAY", type: "RUN", runTypeId: tenK.id },
      { dayOfWeek: 6, slot: "DAY", type: "RUN", runTypeId: tenK.id },
      { dayOfWeek: 1, slot: "NIGHT", type: "GYM", workoutTemplateId: chestDay.id },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
