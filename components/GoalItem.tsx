import { type Goal } from "@/lib/api";
import { CheckIcon, TrashIcon } from "./icons";

export default function GoalItem({
  goal,
  onToggle,
  onDelete,
}: {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`goal${goal.done ? " done" : ""}`}>
      <button className="gcheck" onClick={onToggle} aria-label="toggle done">
        <CheckIcon s={13} />
      </button>
      <span className="gtext">{goal.text}</span>
      <button className="gdel" onClick={onDelete} aria-label="delete goal">
        <TrashIcon s={14} />
      </button>
    </div>
  );
}
