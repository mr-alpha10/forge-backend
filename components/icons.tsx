// Minimal inline icons (outline style), sized via the `s` prop.
type P = { s?: number; className?: string };
const svg = (path: React.ReactNode, fill = false) =>
  function Icon({ s = 18, className }: P) {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill={fill ? "currentColor" : "none"}
        stroke={fill ? "none" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

export const BackIcon = svg(<path d="M15 18l-6-6 6-6" />);
export const ChevIcon = svg(<path d="M9 18l6-6-6-6" />);
export const SearchIcon = svg(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </>
);
export const PhotoIcon = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </>
);
export const PlusIcon = svg(<path d="M12 5v14M5 12h14" />);
export const TrashIcon = svg(<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />);
export const CheckIcon = svg(<path d="M20 6L9 17l-5-5" />);
export const LogoutIcon = svg(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />);
export const CalendarIcon = svg(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>
);
export const RoutineIcon = svg(<path d="M4 6h16M4 12h16M4 18h10" />);
