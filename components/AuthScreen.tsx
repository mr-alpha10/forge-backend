"use client";
import { useState } from "react";
import { api, setToken, type User } from "@/lib/api";

export default function AuthScreen({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = email.trim() && password.length >= (mode === "register" ? 8 : 1);

  async function submit() {
    if (!canSubmit || busy) return;
    setErr(null);
    setBusy(true);
    try {
      const res =
        mode === "login"
          ? await api.login({ email: email.trim(), password })
          : await api.register({ email: email.trim(), password, name: name.trim() || undefined });
      setToken(res.token);
      onAuthed(res.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center">
      <div className="eyebrow">Forge</div>
      <h1 style={{ marginBottom: 24 }}>
        {mode === "login" ? (
          <>Welcome<br />back</>
        ) : (
          <>Make an<br />account</>
        )}
      </h1>

      {mode === "register" && (
        <div className="field">
          <label>Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aryan" />
        </div>
      )}
      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </div>
      <div className="field">
        <label>Password{mode === "register" ? " (8+ characters)" : ""}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••••••"
        />
      </div>

      {err && <div className="error">{err}</div>}

      <button className="btn primary" disabled={!canSubmit || busy} onClick={submit} style={{ marginTop: 8 }}>
        {busy ? "…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--txt-3)" }}>
        {mode === "login" ? "No account yet?" : "Already have one?"}{" "}
        <button className="linkbtn" onClick={() => { setErr(null); setMode(mode === "login" ? "register" : "login"); }}>
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
