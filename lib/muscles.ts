// Maps each browse category to the dataset muscle names it covers.
// Used by the exercises API to assemble cool-down stretches that target a
// group via primary OR secondary muscles.
export const GROUP_MUSCLES: Record<string, string[]> = {
  chest: ["chest"],
  shoulders: ["shoulders"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  forearms: ["forearms"],
  back: ["lats", "middle back", "lower back", "traps"],
  core: ["abdominals"],
  legs: ["quadriceps", "hamstrings", "glutes", "calves", "adductors", "abductors"],
  neck: ["neck"],
};

export const GROUPS = Object.keys(GROUP_MUSCLES);
