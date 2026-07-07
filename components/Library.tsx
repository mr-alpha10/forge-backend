"use client";
import { useEffect, useState } from "react";
import { GROUPS } from "@/lib/groups";
import { api, type Exercise, type Goal } from "@/lib/api";
import { todayStr } from "@/lib/format";
import { SearchIcon, LogoutIcon, CalendarIcon, RoutineIcon } from "./icons";
import ExerciseRow from "./ExerciseRow";
import GoalItem from "./GoalItem";

export default function Library({
  onOpenGroup,
  onOpenExercise,
  onOpenCalendar,
  onOpenRoutines,
  onLogout,
}: {
  onOpenGroup: (group: string) => void;
  onOpenExercise: (id: string, group: string) => void;
  onOpenCalendar: () => void;
  onOpenRoutines: () => void;
  onLogout: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Exercise[] | null>(null);
  const [today, setToday] = useState<Goal[]>([]);

  useEffect(() => {
    api.goals({ date: todayStr() }).then(setToday).catch(() => {});
  }, []);

  async function search(v: string) {
    setQ(v);
    const term = v.trim();
    if (term.length < 2) return setResults(null);
    try {
      setResults(await api.exercises({ q: term }));
    } catch {
      /* ignore transient errors while typing */
    }
  }
  async function toggle(g: Goal) {
    try {
      const u = await api.updateGoal(g.id, { done: !g.done });
      setToday((ts) => ts.map((x) => (x.id === g.id ? u : x)));
    } catch {
      /* noop */
    }
  }
  async function del(g: Goal) {
    try {
      await api.deleteGoal(g.id);
      setToday((ts) => ts.filter((x) => x.id !== g.id));
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <div className="topbar">
        <span />
        <button className="iconbtn" onClick={onLogout} title="Sign out">
          <LogoutIcon s={18} />
        </button>
      </div>
      <div className="eyebrow">Forge · library</div>
      <h1>
        Train by
        <br />
        muscle
      </h1>

      {today.length > 0 && (
        <div className="today">
          <div className="tlabel">Today&apos;s goal</div>
          {today.map((g) => (
            <GoalItem key={g.id} goal={g} onToggle={() => toggle(g)} onDelete={() => del(g)} />
          ))}
        </div>
      )}

      <div className="search">
        <SearchIcon s={15} />
        <input value={q} onChange={(e) => search(e.target.value)} placeholder="Search all exercises…" />
      </div>

      {results ? (
        <>
          <div className="field-label">
            {results.length ? `${results.length} result${results.length > 1 ? "s" : ""}` : "No matches"}
          </div>
          {results.slice(0, 60).map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} onClick={() => onOpenExercise(ex.id, ex.muscleGroup)} />
          ))}
        </>
      ) : (
        <>
          <div className="navrow">
            <button className="navbtn" onClick={onOpenRoutines}>
              <RoutineIcon s={18} /> Routines
            </button>
            <button className="navbtn" onClick={onOpenCalendar}>
              <CalendarIcon s={18} /> Calendar
            </button>
          </div>
          <div className="grid">
            {GROUPS.map((g) => (
              <div key={g.id} className="tile" onClick={() => onOpenGroup(g.id)}>
                <span className="onum">{g.n}</span>
                <div className="name">{g.name}</div>
                <div className="trains">{g.trains}</div>
              </div>
            ))}
          </div>
          <div className="footer">
            Exercise data · free-exercise-db
            <br />
            public domain · Unlicense
          </div>
        </>
      )}
    </>
  );
}
