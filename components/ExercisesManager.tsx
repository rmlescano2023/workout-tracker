"use client";

import { useState } from "react";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipmentType: string | null;
};

export default function ExercisesManager({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [newEquipmentType, setNewEquipmentType] = useState("");
  const [adding, setAdding] = useState(false);

  const [editName, setEditName] = useState("");
  const [editMuscleGroup, setEditMuscleGroup] = useState("");
  const [editEquipmentType, setEditEquipmentType] = useState("");

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, muscleGroup: newMuscleGroup, equipmentType: newEquipmentType }),
      });
      if (!res.ok) throw new Error("Failed to add exercise");
      const { exercise } = await res.json();
      setExercises((prev) => [exercise, ...prev]);
      setNewName("");
      setNewMuscleGroup("");
      setNewEquipmentType("");
    } catch {
      setError("Couldn't add that exercise - try again.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(ex: Exercise) {
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditMuscleGroup(ex.muscleGroup ?? "");
    setEditEquipmentType(ex.equipmentType ?? "");
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, muscleGroup: editMuscleGroup, equipmentType: editEquipmentType }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const { exercise } = await res.json();
      setExercises((prev) => prev.map((e) => (e.id === id ? exercise : e)));
      setEditingId(null);
    } catch {
      setError("Couldn't save that change - try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exercise?")) return;
    setError(null);

    const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't delete that exercise.");
      return;
    }
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div className="card mb-5">
        <h2>Add a new exercise</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Name (required)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input"
          />
          <input
            placeholder="Muscle group"
            value={newMuscleGroup}
            onChange={(e) => setNewMuscleGroup(e.target.value)}
            className="input"
          />
          <input
            placeholder="Equipment (e.g. dumbbell)"
            value={newEquipmentType}
            onChange={(e) => setNewEquipmentType(e.target.value)}
            className="input"
          />
          <button className="btn btn-primary shrink-0" onClick={handleAdd} disabled={adding || !newName.trim()}>
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {error && <p className="error-note">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Muscle group</th>
              <th>Equipment type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.id}>
                {editingId === ex.id ? (
                  <>
                    <td>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input" />
                    </td>
                    <td>
                      <input
                        value={editMuscleGroup}
                        onChange={(e) => setEditMuscleGroup(e.target.value)}
                        className="input"
                      />
                    </td>
                    <td>
                      <input
                        value={editEquipmentType}
                        onChange={(e) => setEditEquipmentType(e.target.value)}
                        className="input"
                      />
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button className="btn" onClick={() => saveEdit(ex.id)}>
                          Save
                        </button>
                        <button className="btn btn-ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-ink">{ex.name}</td>
                    <td className="text-ink-dim">{ex.muscleGroup ?? "—"}</td>
                    <td className="text-ink-dim">{ex.equipmentType ?? "—"}</td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button className="btn btn-ghost" onClick={() => startEdit(ex)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(ex.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {exercises.length === 0 && <p className="empty-note">No exercises yet - add your first one above.</p>}
    </div>
  );
}