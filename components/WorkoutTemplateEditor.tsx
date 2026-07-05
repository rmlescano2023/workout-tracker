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

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }

  return (
    <div>
      <h2>Exercises in this workout</h2>

      <div className="table-wrap mb-6">
        <table>
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>To failure</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id}>
                <td className="text-ink">{item.exercise.name}</td>
                <td className="text-ink-dim tabular-nums">{item.targetSets}</td>
                <td className="text-ink-dim tabular-nums">
                  {item.repsMin}
                  {item.repsMax ? `-${item.repsMax}` : ""}
                </td>
                <td className="text-ink-dim">{item.toFailure ? "Yes" : "No"}</td>
                <td>
                  <div className="flex gap-1 justify-end">
                    <button className="btn btn-ghost btn-icon" onClick={() => handleMove(i, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleMove(i, 1)}
                      disabled={i === items.length - 1}
                    >
                      ↓
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && <p className="empty-note mb-4">No exercises added yet.</p>}

      <div className="card">
        <h2>Add an exercise</h2>
        {exerciseOptions.length === 0 ? (
          <p className="empty-note">You haven&apos;t created any exercises yet - go to Manage Exercises first.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <label className="field-label">Exercise</label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="input"
              >
                {exerciseOptions.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Sets</label>
              <input
                type="number"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value, 10) || 1)}
                className="input w-16"
              />
            </div>
            <div>
              <label className="field-label">Reps min</label>
              <input
                type="number"
                value={repsMin}
                onChange={(e) => setRepsMin(parseInt(e.target.value, 10) || 1)}
                className="input w-16"
              />
            </div>
            <div>
              <label className="field-label">Reps max</label>
              <input
                type="number"
                value={repsMax}
                onChange={(e) => setRepsMax(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="input w-16"
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-ink-dim pb-2.5 whitespace-nowrap">
              <input type="checkbox" checked={toFailure} onChange={(e) => setToFailure(e.target.checked)} className="checkbox" />
              to failure
            </label>
            <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}