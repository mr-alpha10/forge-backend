"use client";
import { useEffect, useState } from "react";
import { api, type Session } from "@/lib/api";
import { daysAgo } from "@/lib/format";
import { BackIcon, PlusIcon, TrashIcon, CheckIcon } from "./icons";

type Row = { w: string; r: string };

export default function LogSession({
  exId,
  exName,
  onBack,
  onSaved,
}: {
  exId: string;
  exName: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [last, setLast] = useState<Session | null | undefined>(undefined); // undefined = loading
  const [rows, setRows] = useState<Row[]>([]);
  const [toast, setToast] = useState<{ msg: string; delta?: string } | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    api
      .exercise(exId)
      .then((e) => {
        if (!on) return;
        const ls = e.lastSession || null;
        setLast(ls);
        setRows(
          ls && ls.sets.length
            ? ls.sets.map((s) => ({ w: s.weightKg?.toString() ?? "", r: s.reps?.toString() ?? "" }))
            : [{ w: "", r: "" }, { w: "", r: "" }, { w: "", r: "" }]
        );
      })
      .catch(() => {
        if (on) {
          setLast(null);
          setRows([{ w: "", r: "" }]);
        }
      });
    return () => {
      on = false;
    };
  }, [exId]);

  function fireToast(msg: string, delta?: string) {
    setToast({ msg, delta });
    setShow(true);
    setTimeout(() => setShow(false), 2400);
  }

  function setRow(i: number, k: keyof Row, v: string) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, { w: rs[rs.length - 1]?.w ?? "", r: "" }]);
  }
  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, j) => j !== i));
  }

  async function save() {
    if (busy) return;
    const sets = rows
      .map((r) => ({ weightKg: parseFloat(r.w), reps: parseInt(r.r, 10) }))
      .filter((s) => (!isNaN(s.weightKg) && s.weightKg > 0) || (!isNaN(s.reps) && s.reps > 0))
      .map((s) => ({ weightKg: isNaN(s.weightKg) ? null : s.weightKg, reps: isNaN(s.reps) ? null : s.reps }));
    if (!sets.length) return fireToast("Add at least one set with weight and reps");

    setBusy(true);
    try {
      await api.logSession({ exerciseId: exId, sets });
      let delta: string | undefined;
      if (last?.sets.length) {
        const top = Math.max(...sets.map((s) => s.weightKg ?? 0));
        const prevTop = Math.max(...last.sets.map((s) => s.weightKg ?? 0));
        const d = Math.round((top - prevTop) * 10) / 10;
        delta = d > 0 ? `+${d} kg top set` : d < 0 ? `${d} kg` : "matched";
      }
      fireToast("Session saved", delta);
      setTimeout(onSaved, 1100);
    } catch (e) {
      fireToast(e instanceof Error ? e.message : "Could not save");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          <BackIcon s={15} /> {exName}
        </button>
      </div>
      <div className="eyebrow">Log session</div>
      <h2 className="scr-title">{exName}</h2>

      {last === undefined ? (
        <div className="loading" style={{ padding: "30px 0" }}>
          Loading history…
        </div>
      ) : last ? (
        <div className="recall">
          <div className="rhead">
            <span className="rt">Last session — beat this</span>
            <span className="rd">{daysAgo(last.performedAt)}</span>
          </div>
          <div className="rsets">
            {last.sets.map((s, i) => (
              <span className="set" key={i}>
                <b>{s.weightKg ?? "–"}</b> kg × <b>{s.reps ?? "–"}</b>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="recall">
          <div className="rhead">
            <span className="rt">First time</span>
          </div>
          <div className="empty">
            No previous sessions for this lift. Log today&apos;s work and it&apos;ll be remembered for next time.
          </div>
        </div>
      )}

      <div className="field-label">Today&apos;s sets {last ? "· pre-filled from last time" : ""}</div>
      <div className="logrows">
        {rows.map((row, i) => (
          <div className="lr" key={i}>
            <span className="sn">Set {i + 1}</span>
            <div className="fld">
              <input type="number" inputMode="decimal" value={row.w} placeholder="0" onChange={(e) => setRow(i, "w", e.target.value)} />
              <span className="unit">kg</span>
            </div>
            <span className="x">×</span>
            <div className="fld">
              <input type="number" inputMode="numeric" value={row.r} placeholder="0" onChange={(e) => setRow(i, "r", e.target.value)} />
              <span className="unit">reps</span>
            </div>
            <button className="rm" onClick={() => removeRow(i)}>
              <TrashIcon s={15} />
            </button>
          </div>
        ))}
      </div>
      <button className="addset" onClick={addRow}>
        <PlusIcon s={14} /> Add set
      </button>

      <div className="cta">
        <button className="btn primary" disabled={busy} onClick={save}>
          <CheckIcon s={16} /> {busy ? "Saving…" : "Save session"}
        </button>
      </div>

      {toast && (
        <div className={`toast${show ? " show" : ""}`}>
          <CheckIcon s={16} />
          <span>{toast.msg}</span>
          {toast.delta && <span className="delta">{toast.delta}</span>}
        </div>
      )}
    </>
  );
}
