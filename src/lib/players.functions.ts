import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PlayerRecord = {
  id: string;
  name: string;
  slug: string;
  role: string | null;
  era: string | null;
  bio: string | null;
  image_url: string | null;
  embeddings: number[][];
};

function serverPublicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    },
  );
}

/** Public: player roster with the facial signatures used for matching. */
export const getPlayers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverPublicClient();
  const { data, error } = await supabase
    .from("players")
    .select("id, name, slug, role, era, bio, image_url, embeddings")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    embeddings: Array.isArray(row.embeddings) ? (row.embeddings as unknown as number[][]) : [],
  })) as PlayerRecord[];
});
