"use client";

import { useState } from "react";

export type ExerciseForLog = {
  id: string;
  name: string;
  targetSets: number;
  repsMin: number;
  repsMax: number | null;
  toFailure: boolean;
  lastWeightKg: number | null;
};

type SetEntry = {
  weightKg: string;
  reps: string;
  toFailure: boolean;
  completed: boolean;
};

export default function LogWorkoutForm({ exercises }: { exercises: ExerciseForLog[] }) {
  const [entries, setEntries] = useState<Record<string, SetEntry[]>>(() => {
    const initial: Record<string, SetEntry[]> = {};
    for (const ex of exercises) {
      initial[ex.id] = Array.from({ length: ex.targetSets }, () => ({
        weightKg: ex.lastWeightKg?.toString() ?? "",
        reps: "",
        toFailure: ex.toFailure,
        completed: false,
      }));
    }
    return initial;
  });

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function updateSet(exerciseId: string, setIndex: number, field: keyof SetEntry, value: string | boolean) {
    setEntries((prev) => {
      const next = { ...prev };
      const sets = [...next[exerciseId]];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      next[exerciseId] = sets;
      return next;
    });
  }

  async function handleSubmit() {
    setStatus("saving");

    const logs = exercises.flatMap((ex) =>
      entries[ex.id].map((set, i) => ({
        exerciseId: ex.id,
        setNumber: i + 1,
        weightKg: set.weightKg ? parseFloat(set.weightKg) : null,
        reps: set.reps ? parseInt(set.reps, 10) : null,
        toFailure: set.toFailure,
        completed: set.completed,
      }))
    );

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.map((ex) => (
        <div key={ex.id} className="card">
          <div className="flex items-baseline justify-between mb-3">
            <h3>{ex.name}</h3>
            {ex.lastWeightKg != null && (
              <span className="text-xs text-ink-dim tabular-nums">last: {ex.lastWeightKg}kg</span>
            )}
          </div>
          <p className="text-xs text-ink-dim mb-3">
            Target: {ex.targetSets} sets × {ex.repsMin}
            {ex.repsMax ? `-${ex.repsMax}` : ""} reps{ex.toFailure ? " (to failure)" : ""}
          </p>

          <div className="flex flex-col gap-2">
            {entries[ex.id].map((set, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  className="plate-chip"
                  data-done={set.completed}
                  aria-pressed={set.completed}
                  aria-label={`Set ${i + 1} ${set.completed ? "done" : "not done"}`}
                  onClick={() => updateSet(ex.id, i, "completed", !set.completed)}
                >
                  {i + 1}
                </button>
                <input
                  type="number"
                  placeholder="kg"
                  value={set.weightKg}
                  onChange={(e) => updateSet(ex.id, i, "weightKg", e.target.value)}
                  className="input w-20"
                />
                <input
                  type="number"
                  placeholder="reps"
                  value={set.reps}
                  onChange={(e) => updateSet(ex.id, i, "reps", e.target.value)}
                  className="input w-20"
                />
                <label className="flex items-center gap-1.5 text-xs text-ink-dim ml-auto whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={set.toFailure}
                    onChange={(e) => updateSet(ex.id, i, "toFailure", e.target.checked)}
                    className="checkbox"
                  />
                  to failure
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-primary" onClick={handleSubmit} disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save Workout"}
      </button>

      {status === "saved" && <p className="success-note">Saved! Great work.</p>}
      {status === "error" && <p className="error-note">Something went wrong saving — try again.</p>}
    </div>
  );
}