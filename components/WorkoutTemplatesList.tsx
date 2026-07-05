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
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          placeholder="New workout name (e.g. Back & Triceps)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input sm:max-w-xs"
        />
        <button className="btn btn-primary shrink-0" onClick={handleCreate} disabled={creating || !newName.trim()}>
          {creating ? "Creating…" : "Create"}
        </button>
      </div>

      <ul className="flex flex-col">
        {templates.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3 border-b border-line last:border-0">
            <Link href={`/manage/workouts/${t.id}`} className="no-underline hover:underline">
              <span className="text-ink">{t.name}</span>{" "}
              <span className="text-ink-faint text-sm">({t._count.items} exercises)</span>
            </Link>
            <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {templates.length === 0 && <p className="empty-note">No workout templates yet - create your first one above.</p>}
    </div>
  );
}