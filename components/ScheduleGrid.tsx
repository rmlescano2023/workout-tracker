"use client";

import { useState } from "react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const CELL_ACCENT: Record<CellData["type"], string> = {
  GYM: "border-l-gym",
  RUN: "border-l-run",
  REST: "border-l-surface-3",
};

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
      <div className="flex gap-2 mb-5">
        <input
          placeholder="Add a run type (e.g. Tempo Run)"
          value={newRunTypeName}
          onChange={(e) => setNewRunTypeName(e.target.value)}
          className="input"
        />
        <button className="btn btn-primary shrink-0" onClick={handleAddRunType}>
          Add
        </button>
      </div>

      <div className="table-wrap">
        <table className="min-w-[640px]">
          <thead>
            <tr>
              <th></th>
              {DAY_NAMES.map((name, i) => (
                <th key={name} className="text-center px-1">
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">{DAY_SHORT[i]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot}>
                <td className="font-display uppercase text-xs text-ink-dim pr-2 whitespace-nowrap">
                  {slot === "DAY" ? "☀ Day" : "🌙 Night"}
                </td>
                {DAY_NAMES.map((_, d) => {
                  const key = cellKey(d, slot);
                  const cell = cells[key];
                  return (
                    <td key={key} className={`align-top border-l-[3px] ${CELL_ACCENT[cell.type]} !border-b-line`}>
                      <div className="flex flex-col gap-1 min-w-[7rem]">
                        <select
                          value={cell.type}
                          onChange={(e) =>
                            saveCell(d, slot, {
                              type: e.target.value as CellData["type"],
                              workoutTemplateId: null,
                              runTypeId: null,
                            })
                          }
                          className="input text-xs py-1.5"
                        >
                          <option value="REST">Rest</option>
                          <option value="GYM">Gym</option>
                          <option value="RUN">Run</option>
                        </select>

                        {cell.type === "GYM" && (
                          <select
                            value={cell.workoutTemplateId ?? ""}
                            onChange={(e) => saveCell(d, slot, { ...cell, workoutTemplateId: e.target.value || null })}
                            className="input text-xs py-1.5"
                          >
                            <option value="">— choose —</option>
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
                            className="input text-xs py-1.5"
                          >
                            <option value="">— choose —</option>
                            {runTypes.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-ink-faint text-xs mt-3">Changes save automatically as soon as you pick something.</p>
    </div>
  );
}