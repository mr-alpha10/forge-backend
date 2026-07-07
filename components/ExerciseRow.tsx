import { type Exercise, imgUrl } from "@/lib/api";
import { cap } from "@/lib/format";
import { PhotoIcon, ChevIcon } from "./icons";

export default function ExerciseRow({ ex, onClick }: { ex: Exercise; onClick: () => void }) {
  const meta = `${cap(ex.primaryMuscles[0]) || "—"}${ex.equipment ? " — " + cap(ex.equipment) : ""}`;
  return (
    <div className="ex" onClick={onClick}>
      <div className="thumb">
        {ex.images?.length ? <img src={imgUrl(ex.images[0])} alt="" loading="lazy" /> : <PhotoIcon s={22} />}
      </div>
      <div className="body">
        <div className="exn">{ex.name}</div>
        <div className="exm">{meta}</div>
      </div>
      <span className="chev">
        <ChevIcon s={17} />
      </span>
    </div>
  );
}
