"use client";

import { useState } from "react";

// "use client" at the top makes this run in the browser, not just the
// server. We need that here because the person will be clicking checkboxes
// and typing numbers - the server can't respond to that, only the browser can.

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
  weightKg: string; // kept as string while typing, converted to number on submit
  reps: string;
  toFailure: boolean;
  completed: boolean;
};

export default function LogWorkoutForm({ exercises }: { exercises: ExerciseForLog[] }) {
  // One array of set-entries per exercise, pre-filled with sensible defaults
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
    <div>
      {exercises.map((ex) => (
        <div key={ex.id} style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #333" }}>
          <h3 style={{ marginBottom: "0.25rem" }}>{ex.name}</h3>
          <p style={{ margin: "0 0 0.5rem", color: "#888", fontSize: "0.9rem" }}>
            Target: {ex.targetSets} sets x {ex.repsMin}
            {ex.repsMax ? `-${ex.repsMax}` : ""} reps{ex.toFailure ? " (to failure)" : ""}
            {ex.lastWeightKg != null && <> · last time: {ex.lastWeightKg}kg</>}
          </p>

          {entries[ex.id].map((set, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ width: "3.5rem", color: "#888" }}>Set {i + 1}</span>
              <input
                type="number"
                placeholder="kg"
                value={set.weightKg}
                onChange={(e) => updateSet(ex.id, i, "weightKg", e.target.value)}
                style={{ width: "5rem" }}
              />
              <input
                type="number"
                placeholder="reps"
                value={set.reps}
                onChange={(e) => updateSet(ex.id, i, "reps", e.target.value)}
                style={{ width: "5rem" }}
              />
              <label style={{ fontSize: "0.85rem" }}>
                <input
                  type="checkbox"
                  checked={set.toFailure}
                  onChange={(e) => updateSet(ex.id, i, "toFailure", e.target.checked)}
                />{" "}
                to failure
              </label>
              <label style={{ fontSize: "0.85rem", marginLeft: "auto" }}>
                <input
                  type="checkbox"
                  checked={set.completed}
                  onChange={(e) => updateSet(ex.id, i, "completed", e.target.checked)}
                />{" "}
                done
              </label>
            </div>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit} disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save Workout"}
      </button>

      {status === "saved" && <p style={{ color: "green" }}>Saved! Great work.</p>}
      {status === "error" && <p style={{ color: "red" }}>Something went wrong saving - try again.</p>}
    </div>
  );
}