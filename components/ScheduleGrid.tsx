"use client";

import { useState } from "react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOTS = ["DAY", "NIGHT"] as const;

type Template = { id: string; name: string };
type RunType = { id: string; name: string };

type CellData = {
  type: "REST" | "GYM" | "RUN";
  workoutTemplateId: string | null;
  runTypeId: string | null;
};

type ScheduleEntry = {
  dayOfWeek: number;
  slot: "DAY" | "NIGHT";
  type: "REST" | "GYM" | "RUN";
  workoutTemplateId: string | null;
  runTypeId: string | null;
};

function cellKey(dayOfWeek: number, slot: string) {
  return `${dayOfWeek}-${slot}`;
}

export default function ScheduleGrid({
  initialSchedule,
  templates,
  initialRunTypes,
}: {
  initialSchedule: ScheduleEntry[];
  templates: Template[];
  initialRunTypes: RunType[];
}) {
  const [runTypes, setRunTypes] = useState(initialRunTypes);
  const [newRunTypeName, setNewRunTypeName] = useState("");

  const [cells, setCells] = useState<Record<string, CellData>>(() => {
    const initial: Record<string, CellData> = {};
    for (let d = 0; d < 7; d++) {
      for (const slot of SLOTS) {
        const key = cellKey(d, slot);
        const existing = initialSchedule.find((e) => e.dayOfWeek === d && e.slot === slot);
        initial[key] = existing
          ? { type: existing.type, workoutTemplateId: existing.workoutTemplateId, runTypeId: existing.runTypeId }
          : { type: "REST", workoutTemplateId: null, runTypeId: null };
      }
    }
    return initial;
  });

  async function saveCell(dayOfWeek: number, slot: string, data: CellData) {
    const key = cellKey(dayOfWeek, slot);
    setCells((prev) => ({ ...prev, [key]: data }));
    await fetch("/api/weekly-schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek, slot, ...data }),
    });
  }

  async function handleAddRunType() {
    if (!newRunTypeName.trim()) return;
    const res = await fetch("/api/run-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRunTypeName }),
    });
    const { runType } = await res.json();
    setRunTypes((prev) => [...prev, runType]);
    setNewRunTypeName("");
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <input
          placeholder="Add a run type (e.g. Tempo Run)"
          value={newRunTypeName}
          onChange={(e) => setNewRunTypeName(e.target.value)}
        />
        <button onClick={handleAddRunType}>Add run type</button>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th></th>
            {DAY_NAMES.map((name) => (
              <th key={name} style={{ padding: "0.4rem", textAlign: "center", fontSize: "0.85rem" }}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((slot) => (
            <tr key={slot}>
              <td style={{ fontWeight: "bold", paddingRight: "0.5rem" }}>{slot === "DAY" ? "☀️ Day" : "🌙 Night"}</td>
              {DAY_NAMES.map((_, d) => {
                const key = cellKey(d, slot);
                const cell = cells[key];
                return (
                  <td key={key} style={{ border: "1px solid #333", padding: "0.4rem", verticalAlign: "top" }}>
                    <select
                      value={cell.type}
                      onChange={(e) =>
                        saveCell(d, slot, { type: e.target.value as CellData["type"], workoutTemplateId: null, runTypeId: null })
                      }
                      style={{ width: "100%", marginBottom: "0.3rem" }}
                    >
                      <option value="REST">Rest</option>
                      <option value="GYM">Gym</option>
                      <option value="RUN">Run</option>
                    </select>

                    {cell.type === "GYM" && (
                      <select
                        value={cell.workoutTemplateId ?? ""}
                        onChange={(e) => saveCell(d, slot, { ...cell, workoutTemplateId: e.target.value || null })}
                        style={{ width: "100%" }}
                      >
                        <option value="">- choose -</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {cell.type === "RUN" && (
                      <select
                        value={cell.runTypeId ?? ""}
                        onChange={(e) => saveCell(d, slot, { ...cell, runTypeId: e.target.value || null })}
                        style={{ width: "100%" }}
                      >
                        <option value="">- choose -</option>
                        {runTypes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ color: "#888", marginTop: "1rem", fontSize: "0.9rem" }}>
        Changes save automatically as soon as you pick something - no separate save button.
      </p>
    </div>
  );
}