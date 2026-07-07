export const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export function daysAgo(iso: string) {
  const n = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return n <= 0 ? "today" : n === 1 ? "yesterday" : `${n} days ago`;
}

// Local calendar date as YYYY-MM-DD (en-CA formats exactly that way).
export const todayStr = () => new Date().toLocaleDateString("en-CA");
export const dateKey = (iso: string) => iso.slice(0, 10);
export function prettyDate(ymd: string) {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
