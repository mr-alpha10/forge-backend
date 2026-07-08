"use client";
import { useEffect, useState } from "react";
import { api, clearToken, getToken, type User, type Exercise } from "@/lib/api";
import { groupById } from "@/lib/groups";
import AuthScreen from "./AuthScreen";
import Library from "./Library";
import Category from "./Category";
import ExerciseDetail from "./ExerciseDetail";
import LogSession from "./LogSession";
import Calendar from "./Calendar";
import Routines from "./Routines";

type Screen =
  | { name: "library" }
  | { name: "category"; group: string }
  | { name: "detail"; exId: string; group?: string }
  | { name: "log"; exId: string; exName: string; group?: string }
  | { name: "calendar" }
  | { name: "routines" };

export default function ForgeApp() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: "library" });

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setReady(true));
  }, []);

  function logout() {
    clearToken();
    setUser(null);
    setScreen({ name: "library" });
  }

  function render() {
    switch (screen.name) {
      case "library":
        return (
          <Library
            onOpenGroup={(group) => setScreen({ name: "category", group })}
            onOpenExercise={(id, group) => setScreen({ name: "detail", exId: id, group })}
            onOpenCalendar={() => setScreen({ name: "calendar" })}
            onOpenRoutines={() => setScreen({ name: "routines" })}
            onLogout={logout}
          />
        );
      case "category":
        return (
          <Category
            groupId={screen.group}
            onBack={() => setScreen({ name: "library" })}
            onOpen={(id) => setScreen({ name: "detail", exId: id, group: screen.group })}
          />
        );
      case "detail":
        return (
          <ExerciseDetail
            exId={screen.exId}
            groupName={screen.group ? groupById(screen.group)?.name : undefined}
            onBack={() => setScreen(screen.group ? { name: "category", group: screen.group } : { name: "library" })}
            onLog={(ex: Exercise) => setScreen({ name: "log", exId: ex.id, exName: ex.name, group: screen.group })}
          />
        );
      case "log":
        return (
          <LogSession
            exId={screen.exId}
            exName={screen.exName}
            onBack={() => setScreen({ name: "detail", exId: screen.exId, group: screen.group })}
            onSaved={() => setScreen({ name: "detail", exId: screen.exId, group: screen.group })}
          />
        );
      case "calendar":
        return <Calendar onBack={() => setScreen({ name: "library" })} />;
      case "routines":
        return <Routines onBack={() => setScreen({ name: "library" })} onOpen={(id, group) => setScreen({ name: "detail", exId: id, group })} />;
    }
  }

  return (
    <>
      <svg className="grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
      <div className="phone">
        <div className="viewport">
          {!ready ? (
            <div className="loading">Forge</div>
          ) : !user ? (
            <AuthScreen onAuthed={setUser} />
          ) : (
            <div className="screen" key={JSON.stringify(screen)}>
              {render()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
