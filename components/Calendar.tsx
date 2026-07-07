"use client";
import { useEffect, useMemo, useState } from "react";
import { api, type Goal } from "@/lib/api";
import { todayStr, dateKey, prettyDate } from "@/lib/format";
import { BackIcon, ChevIcon } from "./icons";
import GoalItem from "./GoalItem";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendar({ onBack }: { onBack: () => void }) {
  const today = todayStr();
  const [y, setY] = useState(() => new Date().getFullYear());
  const [m, setM] = useState(() => new Date().getMonth());
  const [selected, setSelected] = useState(today);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDow = new Date(y, m, 1).getDay();

  useEffect(() => {
    const from = `${y}-${pad(m + 1)}-01`;
    const to = `${y}-${pad(m + 1)}-${pad(daysInMonth)}`;
    let on = true;
    api.goals({ from, to }).then((g) => on && setGoals(g)).catch(() => on && setGoals([]));
    return () => {
      on = false;
    };
  }, [y, m, daysInMonth]);

  const dots = useMemo(() => new Set(goals.map((g) => dateKey(g.date))), [goals]);
  const dayGoals = goals.filter((g) => dateKey(g.date) === selected);

  const prevMonth = () => (m === 0 ? (setM(11), setY(y - 1)) : setM(m - 1));
  const nextMonth = () => (m === 11 ? (setM(0), setY(y + 1)) : setM(m + 1));

  async function add() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const g = await api.createGoal({ date: selected, text: t });
      setGoals((gs) => [...gs, g]);
      setText("");
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }
  async function toggle(g: Goal) {
    try {
      const u = await api.updateGoal(g.id, { done: !g.done });
      setGoals((gs) => gs.map((x) => (x.id === g.id ? u : x)));
    } catch {
      /* noop */
    }
  }
  async function del(g: Goal) {
    try {
      await api.deleteGoal(g.id);
      setGoals((gs) => gs.filter((x) => x.id !== g.id));
    } catch {
      /* noop */
    }
  }

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(<div key={"p" + i} className="cell pad" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${y}-${pad(m + 1)}-${pad(d)}`;
    const cls = ["cell"];
    if (ymd === today) cls.push("today");
    if (ymd === selected) cls.push("sel");
    cells.push(
      <div key={ymd} className={cls.join(" ")} onClick={() => setSelected(ymd)}>
        {d}
        {dots.has(ymd) && <span className="dot" />}
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          <BackIcon s={15} /> Library
        </button>
      </div>
      <div className="eyebrow">Goals</div>
      <h2 className="scr-title">Calendar</h2>

      <div className="cal">
        <div className="calhead">
          <div className="mname">
            {MONTHS[m]} {y}
          </div>
          <div className="calnav">
            <button onClick={prevMonth} aria-label="previous month">
              <BackIcon s={15} />
            </button>
            <button onClick={nextMonth} aria-label="next month">
              <ChevIcon s={15} />
            </button>
          </div>
        </div>
        <div className="calgrid">
          {DOW.map((d, i) => (
            <div key={i} className="dow">
              {d}
            </div>
          ))}
          {cells}
        </div>
      </div>

      <div className="dayhdr">{selected === today ? "Today" : prettyDate(selected)}</div>
      {dayGoals.length ? (
        dayGoals.map((g) => <GoalItem key={g.id} goal={g} onToggle={() => toggle(g)} onDelete={() => del(g)} />)
      ) : (
        <p className="sub" style={{ marginTop: 4 }}>
          No goals set for this day yet.
        </p>
      )}

      <div className="addrow">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a goal or note…"
        />
        <button onClick={add} disabled={!text.trim() || busy}>
          Add
        </button>
      </div>
    </>
  );
}
