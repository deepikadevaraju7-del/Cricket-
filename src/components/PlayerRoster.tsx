import { PlayerPhoto } from "@/components/PlayerPhoto";
import type { PlayerRecord } from "@/lib/players.functions";

export function PlayerRoster({ players }: { players: PlayerRecord[] }) {
  if (!players.length) return null;

  return (
    <section className="mt-14" aria-labelledby="roster-heading">
      <h2 id="roster-heading" className="font-display text-3xl">
        Players in the library
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {players.length} Indian internationals are currently recognised.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {players.map((player) => (
          <li key={player.id} className="panel overflow-hidden">
            <PlayerPhoto
              src={player.image_url}
              alt={player.name}
              className="aspect-square w-full object-cover"
            />
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{player.name}</p>
              <p className="truncate text-xs text-muted-foreground">{player.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
