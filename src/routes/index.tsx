import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";

import { getPlayers } from "@/lib/players.functions";
import {
  describeFace,
  loadFaceEngine,
  matchPlayers,
  type MatchCandidate,
} from "@/lib/face-recognition";
import { UploadPanel } from "@/components/UploadPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { PlayerRoster } from "@/components/PlayerRoster";
import logo from "@/assets/logo.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cricket Face ID — Identify Indian Cricket Players from a Photo" },
      {
        name: "description",
        content:
          "Upload a photo and instantly identify Indian cricket players with a confidence score. Face recognition runs privately in your browser.",
      },
      {
        property: "og:title",
        content: "Cricket Face ID — Identify Indian Cricket Players from a Photo",
      },
      {
        property: "og:description",
        content:
          "Upload a photo and instantly identify Indian cricket players with a confidence score. Runs privately in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Stage = "idle" | "detecting" | "done" | "error";

function Home() {
  const fetchPlayers = useServerFn(getPlayers);
  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => fetchPlayers(),
    staleTime: 5 * 60 * 1000,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceCount, setFaceCount] = useState(0);
  const objectUrlRef = useRef<string | null>(null);

  // Warm the model up so the first identification is fast.
  useEffect(() => {
    loadFaceEngine().catch(() => {
      /* surfaced when the user actually runs a match */
    });
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setCandidates([]);
    setFacePreview(null);
    setFaceCount(0);
    setMessage(null);
    setStage("idle");
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setCandidates([]);
      setFacePreview(null);
      setFaceCount(0);
      setMessage(null);
      setStage("detecting");

      try {
        const players = playersQuery.data ?? (await playersQuery.refetch()).data ?? [];
        const detection = await describeFace(url);

        if (!detection) {
          setStage("error");
          setMessage(
            "No face could be detected in that image. Try a photo where the face is clearly visible.",
          );
          return;
        }

        setFacePreview(detection.facePreview);
        setFaceCount(detection.faceCount);
        setCandidates(matchPlayers(detection.descriptor, players));
        setStage("done");
      } catch (error) {
        console.error(error);
        setStage("error");
        setMessage(
          "Something went wrong while analysing that image. Check your connection and try again.",
        );
      }
    },
    [playersQuery],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <img
          src={logo}
          alt="Cricket Face ID logo"
          width={1024}
          height={1024}
          className="mx-auto mb-4 h-16 w-16"
        />
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Face recognition</p>

        <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">
          Who&apos;s that <span className="text-gradient-gold">cricketer</span>?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Upload a photo of an Indian cricket player. The face is matched against our player
          library and you get a name with a confidence score — in seconds, right in your browser.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <UploadPanel
          previewUrl={previewUrl}
          busy={stage === "detecting"}
          onFileSelected={handleFile}
          onError={(text) => {
            setStage("error");
            setMessage(text);
          }}
        />

        <div>
          {stage === "detecting" && (
            <div className="panel flex h-full min-h-56 flex-col items-center justify-center gap-4 p-7 text-center">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="font-display text-2xl">Analysing the face…</p>
              <p className="text-sm text-muted-foreground">
                Detecting the face and comparing it with the player library.
              </p>
            </div>
          )}

          {stage === "error" && (
            <div className="panel flex h-full min-h-56 flex-col items-center justify-center gap-4 p-7 text-center">
              <p className="font-display text-2xl">That didn&apos;t work</p>
              <p className="text-sm text-muted-foreground">{message}</p>
              <button type="button" className="btn-ghost-line" onClick={reset}>
                Try another image
              </button>
            </div>
          )}

          {stage === "done" && (
            <ResultPanel
              candidates={candidates}
              facePreview={facePreview}
              faceCount={faceCount}
              onReset={reset}
            />
          )}

          {stage === "idle" && (
            <div className="panel flex h-full min-h-56 flex-col justify-center gap-3 p-7">
              <h2 className="font-display text-2xl">How it works</h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Pick or drag in a photo of a player.</li>
                <li>2. The face is found and measured on your device.</li>
                <li>3. You get the closest player, plus alternatives and a confidence score.</li>
              </ol>
              {playersQuery.isError && (
                <p className="text-sm text-destructive">
                  The player library couldn&apos;t be loaded. Please refresh the page.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <PlayerRoster players={playersQuery.data ?? []} />

      <footer className="mt-14 text-center text-xs text-muted-foreground">
        Reference photos come from Wikipedia / Wikimedia Commons. Results are a statistical
        estimate, not an official identification.
      </footer>
    </main>
  );
}
