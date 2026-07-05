"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  _count: { items: number };
};

export default function WorkoutTemplatesList({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/workout-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const { template } = await res.json();
    setCreating(false);
    // Jump straight into editing the new template so you can add exercises right away
    router.push(`/manage/workouts/${template.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this workout template? This can't be undone.")) return;
    const res = await fetch(`/api/workout-templates/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error ?? "Couldn't delete that template.");
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          placeholder="New workout name (e.g. Back & Triceps)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ width: "20rem" }}
        />
        <button onClick={handleCreate} disabled={creating || !newName.trim()}>
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {templates.map((t) => (
          <li
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.6rem 0",
              borderBottom: "1px solid #333",
            }}
          >
            <Link href={`/manage/workouts/${t.id}`}>
              {t.name} <span style={{ color: "#888" }}>({t._count.items} exercises)</span>
            </Link>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {templates.length === 0 && <p style={{ color: "#888" }}>No workout templates yet - create your first one above.</p>}
    </div>
  );
}