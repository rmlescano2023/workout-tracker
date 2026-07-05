"use client";

import { useState } from "react";

type Item = {
  id: string;
  order: number;
  targetSets: number;
  repsMin: number;
  repsMax: number | null;
  toFailure: boolean;
  exercise: { id: string; name: string };
};

type ExerciseOption = { id: string; name: string };

export default function WorkoutTemplateEditor({
  templateId,
  initialItems,
  exerciseOptions,
}: {
  templateId: string;
  initialItems: Item[];
  exerciseOptions: ExerciseOption[];
}) {
  const [items, setItems] = useState<Item[]>(initialItems);

  // --- Add form state ---
  const [selectedExerciseId, setSelectedExerciseId] = useState(exerciseOptions[0]?.id ?? "");
  const [targetSets, setTargetSets] = useState(3);
  const [repsMin, setRepsMin] = useState(10);
  const [repsMax, setRepsMax] = useState<number | "">("");
  const [toFailure, setToFailure] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!selectedExerciseId) return;
    setAdding(true);
    const res = await fetch(`/api/workout-templates/${templateId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: selectedExerciseId,
        targetSets,
        repsMin,
        repsMax: repsMax === "" ? null : repsMax,
        toFailure,
      }),
    });
    const { item } = await res.json();
    setItems((prev) => [...prev, item]);
    setAdding(false);
  }

  async function handleDelete(itemId: string) {
    await fetch(`/api/workout-templates/${templateId}/items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const a = items[index];
    const b = items[target];

    // Swap their order values on the server...
    await Promise.all([
      fetch(`/api/workout-templates/${templateId}/items/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/workout-templates/${templateId}/items/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);

    // ...and reflect it locally so the UI updates immediately
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem" }}>Exercises in this workout</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th style={{ padding: "0.4rem 0" }}>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>To failure</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "0.4rem 0" }}>{item.exercise.name}</td>
              <td>{item.targetSets}</td>
              <td>
                {item.repsMin}
                {item.repsMax ? `-${item.repsMax}` : ""}
              </td>
              <td>{item.toFailure ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleMove(i, -1)} disabled={i === 0}>
                  ↑
                </button>{" "}
                <button onClick={() => handleMove(i, 1)} disabled={i === items.length - 1}>
                  ↓
                </button>{" "}
                <button onClick={() => handleDelete(item.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <p style={{ color: "#888" }}>No exercises added yet.</p>}

      <h2 style={{ fontSize: "1.1rem" }}>Add an exercise</h2>
      {exerciseOptions.length === 0 ? (
        <p style={{ color: "#888" }}>
          You haven&apos;t created any exercises yet - go to Manage Exercises first.
        </p>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)}>
            {exerciseOptions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <label>
            Sets{" "}
            <input
              type="number"
              value={targetSets}
              onChange={(e) => setTargetSets(parseInt(e.target.value, 10) || 1)}
              style={{ width: "3.5rem" }}
            />
          </label>
          <label>
            Reps min{" "}
            <input
              type="number"
              value={repsMin}
              onChange={(e) => setRepsMin(parseInt(e.target.value, 10) || 1)}
              style={{ width: "3.5rem" }}
            />
          </label>
          <label>
            Reps max{" "}
            <input
              type="number"
              value={repsMax}
              onChange={(e) => setRepsMax(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              style={{ width: "3.5rem" }}
            />
          </label>
          <label>
            <input type="checkbox" checked={toFailure} onChange={(e) => setToFailure(e.target.checked)} /> to failure
          </label>
          <button onClick={handleAdd} disabled={adding}>
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}