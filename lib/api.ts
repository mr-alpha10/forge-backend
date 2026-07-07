// Front-end API client. Stores the JWT in localStorage and attaches it as a
// Bearer header. Same-origin calls to the route handlers in app/api.

export type SetLog = { id?: string; order: number; weightKg: number | null; reps: number | null; rpe?: number | null };
export type Session = { id: string; performedAt: string; notes?: string | null; sets: SetLog[] };
export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  section: "warmup" | "main" | "cooldown";
  type: string;
  equipment?: string | null;
  level?: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
  videoUrl?: string | null;
  lastSession?: Session | null;
};
export type User = { id: string; email: string; name?: string | null };
export type Goal = { id: string; date: string; text: string; done: boolean };
export type RoutineItem = { id: string; order: number; exercise: { id: string; name: string; images: string[]; muscleGroup: string } };
export type RoutineDay = { id: string; label: string; order: number; exercises: RoutineItem[] };
export type Routine = { id: string; name: string; createdAt: string; days: RoutineDay[] };

const TOKEN_KEY = "forge_token";
export const getToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => window.localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => window.localStorage.removeItem(TOKEN_KEY);

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as object) };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? (null as T) : res.json();
}

export const api = {
  register: (b: { email: string; password: string; name?: string }) =>
    req<{ token: string; user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    req<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(b) }),
  me: () => req<User>("/api/me"),
  exercises: (params: Record<string, string>) =>
    req<Exercise[]>("/api/exercises?" + new URLSearchParams(params).toString()),
  exercise: (id: string) => req<Exercise>("/api/exercises/" + encodeURIComponent(id)),
  history: (id: string) => req<Session[]>("/api/exercises/" + encodeURIComponent(id) + "/history"),
  logSession: (b: { exerciseId: string; sets: { weightKg: number | null; reps: number | null }[]; notes?: string }) =>
    req<Session>("/api/sessions", { method: "POST", body: JSON.stringify(b) }),

  goals: (params: Record<string, string>) => req<Goal[]>("/api/goals?" + new URLSearchParams(params).toString()),
  createGoal: (b: { date: string; text: string }) => req<Goal>("/api/goals", { method: "POST", body: JSON.stringify(b) }),
  updateGoal: (id: string, b: { done?: boolean; text?: string }) =>
    req<Goal>("/api/goals/" + id, { method: "PATCH", body: JSON.stringify(b) }),
  deleteGoal: (id: string) => req<{ ok: boolean }>("/api/goals/" + id, { method: "DELETE" }),

  routines: () => req<Routine[]>("/api/routines"),
  createRoutine: (b: { name: string }) => req<Routine>("/api/routines", { method: "POST", body: JSON.stringify(b) }),
  getRoutine: (id: string) => req<Routine>("/api/routines/" + id),
  deleteRoutine: (id: string) => req<{ ok: boolean }>("/api/routines/" + id, { method: "DELETE" }),
  addDay: (routineId: string, b: { label?: string }) =>
    req<RoutineDay>("/api/routines/" + routineId + "/days", { method: "POST", body: JSON.stringify(b) }),
  deleteDay: (dayId: string) => req<{ ok: boolean }>("/api/routines/days/" + dayId, { method: "DELETE" }),
  addRoutineExercise: (dayId: string, b: { exerciseId: string }) =>
    req<RoutineItem>("/api/routines/days/" + dayId + "/exercises", { method: "POST", body: JSON.stringify(b) }),
  removeRoutineExercise: (itemId: string) =>
    req<{ ok: boolean }>("/api/routines/exercises/" + itemId, { method: "DELETE" }),
};

export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE ||
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
export const imgUrl = (p: string) => IMAGE_BASE + p;
