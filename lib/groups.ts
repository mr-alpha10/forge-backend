// Presentational metadata for the nine browse categories. Static — the muscle
// labels and descriptions don't change, so there's no need for an API call.
export type Group = {
  id: string;
  n: string;
  name: string;
  trains: string;
  primaryLabel: string;
  sec: string[];
};

export const GROUPS: Group[] = [
  { id: "chest", n: "01", name: "Chest", trains: "Pectorals · pressing power", primaryLabel: "Pectoralis major", sec: ["front delts", "triceps"] },
  { id: "shoulders", n: "02", name: "Shoulders", trains: "Deltoids · overhead & lateral", primaryLabel: "Deltoids", sec: ["traps", "triceps"] },
  { id: "biceps", n: "03", name: "Biceps", trains: "Arm flexors · curls & pulls", primaryLabel: "Biceps brachii", sec: ["forearms"] },
  { id: "triceps", n: "04", name: "Triceps", trains: "Arm extensors · lockout", primaryLabel: "Triceps brachii", sec: ["shoulders"] },
  { id: "forearms", n: "05", name: "Forearms", trains: "Grip & wrist strength", primaryLabel: "Forearm flexors", sec: ["biceps"] },
  { id: "back", n: "06", name: "Back", trains: "Lats & traps · pulling", primaryLabel: "Latissimus dorsi", sec: ["biceps", "traps"] },
  { id: "core", n: "07", name: "Core", trains: "Abs, obliques & trunk", primaryLabel: "Abdominals", sec: ["lower back"] },
  { id: "legs", n: "08", name: "Legs", trains: "Quads, hams, glutes & calves", primaryLabel: "Quadriceps", sec: ["glutes", "hamstrings"] },
  { id: "neck", n: "09", name: "Neck", trains: "Cervical strength", primaryLabel: "Neck", sec: [] },
];

export const groupById = (id: string) => GROUPS.find((g) => g.id === id);
