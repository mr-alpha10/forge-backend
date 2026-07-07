"use client";
import { useEffect, useState } from "react";
import { api, imgUrl, type Routine, type Exercise } from "@/lib/api";
import { BackIcon, PlusIcon, TrashIcon } from "./icons";

export default function Routines({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (id: string, group: string) => void;
}) {
  const [list, setList] = useState<Routine[] | null>(null);
  const [open, setOpen] = useState<Routine | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [pq, setPq] = useState("");
  const [pres, setPres] = useState<Exercise[]>([]);

  async function loadList() {
    try {
      setList(await api.routines());
    } catch {
      setList([]);
    }
  }
  useEffect(() => {
    loadList();
  }, []);

  async function refresh() {
    if (open) setOpen(await api.getRoutine(open.id));
  }
  async function openRoutine(id: string) {
    try {
      setOpen(await api.getRoutine(id));
    } catch {
      /* noop */
    }
  }
  async function createRoutine() {
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    try {
      const r = await api.createRoutine({ name: n });
      setName("");
      await loadList();
      setOpen(await api.getRoutine(r.id));
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }
  async function addDay() {
    if (!open) return;
    try {
      await api.addDay(open.id, {});
      await refresh();
    } catch {
      /* noop */
    }
  }
  async function delDay(dayId: string) {
    try {
      await api.deleteDay(dayId);
      await refresh();
    } catch {
      /* noop */
    }
  }
  async function delRoutine() {
    if (!open) return;
    try {
      await api.deleteRoutine(open.id);
      setOpen(null);
      await loadList();
    } catch {
      /* noop */
    }
  }
  async function removeItem(itemId: string) {
    try {
      await api.removeRoutineExercise(itemId);
      await refresh();
    } catch {
      /* noop */
    }
  }
  async function search(v: string) {
    setPq(v);
    const t = v.trim();
    if (t.length < 2) return setPres([]);
    try {
      setPres(await api.exercises({ q: t }));
    } catch {
      /* noop */
    }
  }
  async function pick(dayId: string, ex: Exercise) {
    try {
      await api.addRoutineExercise(dayId, { exerciseId: ex.id });
      setPickerDay(null);
      setPq("");
      setPres([]);
      await refresh();
    } catch {
      /* noop */
    }
  }

  if (open) {
    return (
      <>
        <div className="topbar">
          <button className="back" onClick={() => setOpen(null)}>
            <BackIcon s={15} /> Routines
          </button>
          <button className="danger" onClick={delRoutine}>
            Delete
          </button>
        </div>
        <div className="eyebrow">Routine</div>
        <h2 className="scr-title">{open.name}</h2>

        <div style={{ marginTop: 18 }}>
          {open.days.map((day) => (
            <div className="rday" key={day.id}>
              <div className="rdhdr">
                <span className="rdlabel">{day.label}</span>
                <button className="gdel" onClick={() => delDay(day.id)} aria-label="delete day">
                  <TrashIcon s={14} />
                </button>
              </div>
              {day.exercises.map((it) => (
                <div className="ritem" key={it.id}>
                  <div className="rthumb">
                    {it.exercise.images?.length ? <img src={imgUrl(it.exercise.images[0])} alt="" /> : null}
                  </div>
                  <span className="rname2" onClick={() => onOpen(it.exercise.id, it.exercise.muscleGroup)}>
                    {it.exercise.name}
                  </span>
                  <button className="gdel" onClick={() => removeItem(it.id)} aria-label="remove">
                    <TrashIcon s={14} />
                  </button>
                </div>
              ))}
              {pickerDay === day.id ? (
                <div className="picker">
                  <div className="addrow">
                    <input autoFocus value={pq} onChange={(e) => search(e.target.value)} placeholder="Search exercises to add…" />
                    <button
                      onClick={() => {
                        setPickerDay(null);
                        setPq("");
                        setPres([]);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {pres.slice(0, 8).map((ex) => (
                    <div className="presult" key={ex.id} onClick={() => pick(day.id, ex)}>
                      {ex.name}
                    </div>
                  ))}
                </div>
              ) : (
                <button className="miniadd" onClick={() => { setPickerDay(day.id); setPq(""); setPres([]); }}>
                  + add exercise
                </button>
              )}
            </div>
          ))}
          <button className="ghost-btn" onClick={addDay}>
            <PlusIcon s={14} /> Add day
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          <BackIcon s={15} /> Library
        </button>
      </div>
      <div className="eyebrow">Plan</div>
      <h2 className="scr-title">Routines</h2>

      <div style={{ marginTop: 18 }}>
        {list === null ? (
          <div className="loading">Loading…</div>
        ) : list.length ? (
          list.map((r) => (
            <div className="rcard" key={r.id} onClick={() => openRoutine(r.id)}>
              <div>
                <div className="rn">{r.name}</div>
                <div className="rm">
                  {r.days.length} day{r.days.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="sub">No routines yet. Create your first below.</p>
        )}
      </div>

      <div className="addrow" style={{ marginTop: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createRoutine()}
          placeholder="New routine (e.g. Push / Pull / Legs)"
        />
        <button onClick={createRoutine} disabled={!name.trim() || busy}>
          Create
        </button>
      </div>
    </>
  );
}
