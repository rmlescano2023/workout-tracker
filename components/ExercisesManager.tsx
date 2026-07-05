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

  // --- Add form state ---
  const [newName, setNewName] = useState("");
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [newEquipmentType, setNewEquipmentType] = useState("");
  const [adding, setAdding] = useState(false);

  // --- Edit form state (only used for whichever row is being edited) ---
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
      <h2 style={{ fontSize: "1.1rem" }}>Add a new exercise</h2>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input placeholder="Name (required)" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input
          placeholder="Muscle group"
          value={newMuscleGroup}
          onChange={(e) => setNewMuscleGroup(e.target.value)}
        />
        <input
          placeholder="Equipment type (e.g. dumbbell, machine_stack)"
          value={newEquipmentType}
          onChange={(e) => setNewEquipmentType(e.target.value)}
        />
        <button onClick={handleAdd} disabled={adding || !newName.trim()}>
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th style={{ padding: "0.4rem 0" }}>Name</th>
            <th>Muscle group</th>
            <th>Equipment type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex) => (
            <tr key={ex.id} style={{ borderBottom: "1px solid #333" }}>
              {editingId === ex.id ? (
                <>
                  <td style={{ padding: "0.4rem 0" }}>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input value={editMuscleGroup} onChange={(e) => setEditMuscleGroup(e.target.value)} />
                  </td>
                  <td>
                    <input value={editEquipmentType} onChange={(e) => setEditEquipmentType(e.target.value)} />
                  </td>
                  <td>
                    <button onClick={() => saveEdit(ex.id)}>Save</button>{" "}
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: "0.4rem 0" }}>{ex.name}</td>
                  <td>{ex.muscleGroup ?? "-"}</td>
                  <td>{ex.equipmentType ?? "-"}</td>
                  <td>
                    <button onClick={() => startEdit(ex)}>Edit</button>{" "}
                    <button onClick={() => handleDelete(ex.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {exercises.length === 0 && <p style={{ color: "#888" }}>No exercises yet - add your first one above.</p>}
    </div>
  );
}