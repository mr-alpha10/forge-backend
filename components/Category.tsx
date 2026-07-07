"use client";
import { useEffect, useState } from "react";
import { api, type Exercise } from "@/lib/api";
import { groupById } from "@/lib/groups";
import { cap } from "@/lib/format";
import { SearchIcon, BackIcon } from "./icons";
import ExerciseRow from "./ExerciseRow";

type Sections = { warmup: Exercise[]; main: Exercise[]; cooldown: Exercise[] };

export default function Category({
  groupId,
  onBack,
  onOpen,
}: {
  groupId: string;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const g = groupById(groupId)!;
  const [secs, setSecs] = useState<Sections | null>(null);
  const [q, setQ] = useState("");
  const [eq, setEq] = useState("all");

  useEffect(() => {
    let on = true;
    (async () => {
      const [warmup, main, cooldown] = await Promise.all([
        api.exercises({ group: groupId, section: "warmup" }),
        api.exercises({ group: groupId, section: "main" }),
        api.exercises({ group: groupId, section: "cooldown" }),
      ]);
      if (on) setSecs({ warmup, main, cooldown });
    })().catch(() => on && setSecs({ warmup: [], main: [], cooldown: [] }));
    return () => {
      on = false;
    };
  }, [groupId]);

  if (!secs) return <div className="loading">Loading {g.name}…</div>;

  const equips = ["all", ...Array.from(new Set([...secs.main, ...secs.cooldown].map((e) => e.equipment || "other"))).sort()];
  const match = (e: Exercise) =>
    (!q || e.name.toLowerCase().includes(q.toLowerCase())) && (eq === "all" || (e.equipment || "other") === eq);

  const section = (n: string, title: string, arr: Exercise[]) => {
    const f = arr.filter(match);
    if (!f.length) return null;
    return (
      <div key={n}>
        <div className="section-head">
          <span className="sn">{n}</span>
          <span className="st">{title}</span>
          <span className="sd">{f.length}</span>
        </div>
        {f.map((e) => (
          <ExerciseRow key={e.id} ex={e} onClick={() => onOpen(e.id)} />
        ))}
      </div>
    );
  };

  const anyMatch = [secs.warmup, secs.main, secs.cooldown].some((a) => a.some(match));

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={onBack}>
          <BackIcon s={15} /> Library
        </button>
      </div>
      <div className="eyebrow">{g.n} · muscle group</div>
      <h2 className="scr-title">{g.name}</h2>
      <div className="pillrow">
        <span className="pill primary">{g.primaryLabel}</span>
        {g.sec.map((s) => (
          <span key={s} className="pill">
            also: {s}
          </span>
        ))}
      </div>

      <div className="search" style={{ margin: "18px 0 12px" }}>
        <SearchIcon s={15} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${g.name.toLowerCase()}…`} />
      </div>
      <div className="chips">
        {equips.map((e) => (
          <button key={e} className={`chip${eq === e ? " on" : ""}`} onClick={() => setEq(e)}>
            {e === "all" ? "All" : cap(e)}
          </button>
        ))}
      </div>

      {anyMatch ? (
        <>
          {section("01", "Warm-up", secs.warmup)}
          {section("02", "Main lifts", secs.main)}
          {section("03", "Cool-down", secs.cooldown)}
        </>
      ) : (
        <div className="empty-state">No exercises match. Try another term or clear the equipment filter.</div>
      )}
    </>
  );
}
