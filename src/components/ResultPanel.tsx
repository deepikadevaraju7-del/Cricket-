import { MATCH_CONFIDENCE_THRESHOLD, isReliableMatch, type MatchCandidate } from "@/lib/face-recognition";
import { PlayerPhoto } from "@/components/PlayerPhoto";

type Props = {
  candidates: MatchCandidate[];
  facePreview: string | null;
  faceCount: number;
  onReset: () => void;
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.max(3, value)}%` }}
      />
    </div>
  );
}

export function ResultPanel({ candidates, facePreview, faceCount, onReset }: Props) {
  const best = candidates[0];
  const alternatives = candidates.slice(1, 4);
  const recognized = isReliableMatch(candidates);

  return (
    <div className="panel p-5 sm:p-7">
      {faceCount > 1 && (
        <p className="mb-4 rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
          {faceCount} faces found — the largest, most prominent face was analysed.
        </p>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {facePreview && (
          <img
            src={facePreview}
            alt="The face detected in your photo"
            className="h-28 w-28 shrink-0 rounded-2xl border border-border object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          {recognized && best ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Identified player
              </p>
              <h2 className="mt-1 font-display text-4xl break-words text-gradient-gold sm:text-5xl">
                {best.player.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {[best.player.role, best.player.era].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <ConfidenceBar value={best.confidence} />
                <span className="shrink-0 font-display text-2xl">{best.confidence}%</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                No confident match
              </p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl">Player not recognised</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Confidence stayed below the {MATCH_CONFIDENCE_THRESHOLD}% threshold
                {best ? ` (closest guess: ${best.player.name} at ${best.confidence}%)` : ""}. Try a
                clearer, front-facing photo.
              </p>
            </>
          )}
        </div>

        {recognized && best && (
          <PlayerPhoto
            src={best.player.image_url}
            alt={`Reference photo of ${best.player.name}`}
            className="h-28 w-28 shrink-0 rounded-2xl border border-border object-cover"
          />
        )}
      </div>

      {recognized && best?.player.bio && (
        <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
          {best.player.bio}
        </p>
      )}

      {alternatives.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
            Other close matches
          </h3>
          <ul className="mt-3 space-y-2">
            {alternatives.map((candidate) => (
              <li
                key={candidate.player.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2"
              >
                <PlayerPhoto
                  src={candidate.player.image_url}
                  alt={candidate.player.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {candidate.player.name}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {candidate.confidence}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="btn-ghost-line mt-6 w-full" onClick={onReset}>
        Try another image
      </button>
    </div>
  );
}
