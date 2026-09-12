import type { PlayerRecord } from "./players.functions";

export const MATCH_CONFIDENCE_THRESHOLD = 70;

export type MatchCandidate = {
  player: PlayerRecord;
  confidence: number;
  distance: number;
};

export type DetectionResult = {
  descriptor: Float32Array;
  faceCount: number;
  detectionScore: number;
  /** Cropped face preview as a data URL. */
  facePreview: string | null;
};

type FaceApi = typeof import("@vladmandic/face-api");

let apiPromise: Promise<FaceApi> | null = null;

/** Loads face-api.js + weights once, lazily, in the browser only. */
export async function loadFaceEngine(): Promise<FaceApi> {
  if (!apiPromise) {
    apiPromise = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      // face-api bundles its own TFJS build; initialise that one (no second copy).
      await (faceapi.tf as unknown as { ready: () => Promise<void> }).ready();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      return faceapi;
    })().catch((error) => {
      apiPromise = null;
      throw error;
    });
  }
  return apiPromise;
}

function cropFace(
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
): string | null {
  try {
    const pad = box.width * 0.25;
    const size = Math.max(box.width, box.height) + pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const sx = Math.max(0, box.x + box.width / 2 - size / 2);
    const sy = Math.max(0, box.y + box.height / 2 - size / 2);
    ctx.drawImage(image, sx, sy, size, size, 0, 0, 220, 220);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}

/** Detects the primary (largest) face in an image and returns its embedding. */
export async function describeFace(imageUrl: string): Promise<DetectionResult | null> {
  const faceapi = await loadFaceEngine();
  const image = await faceapi.fetchImage(imageUrl);

  const results = await faceapi
    .detectAllFaces(
      image,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!results.length) return null;

  const primary = [...results].sort(
    (a, b) => b.detection.box.area - a.detection.box.area,
  )[0]!;

  return {
    descriptor: primary.descriptor,
    faceCount: results.length,
    detectionScore: primary.detection.score,
    facePreview: cropFace(image, primary.detection.box),
  };
}

function euclidean(a: Float32Array | number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < b.length; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Maps embedding distance to a 0-100 confidence score.
 * Calibrated on the enrolled signature set: distances up to ~0.46 are genuine
 * matches (70% confidence), while ~0.72 and above is effectively noise.
 */
function distanceToConfidence(distance: number) {
  const best = 0.35;
  const worst = 0.72;
  const raw = (worst - distance) / (worst - best);
  return Math.round(Math.min(1, Math.max(0, raw)) * 100);
}

/**
 * The winner must also be clearly ahead of the runner-up; near-ties are the main
 * source of false positives, so they are reported as "not recognised" instead.
 */
export const MATCH_MARGIN = 0.04;

export function isReliableMatch(candidates: MatchCandidate[]) {
  const best = candidates[0];
  if (!best || best.confidence < MATCH_CONFIDENCE_THRESHOLD) return false;
  const runnerUp = candidates[1];
  if (!runnerUp) return true;
  return runnerUp.distance - best.distance >= MATCH_MARGIN;
}

/** Ranks every player against the uploaded face embedding. */
export function matchPlayers(
  descriptor: Float32Array,
  players: PlayerRecord[],
): MatchCandidate[] {
  return players
    .map((player) => {
      let distance = Number.POSITIVE_INFINITY;
      for (const embedding of player.embeddings) {
        const d = euclidean(descriptor, embedding);
        if (d < distance) distance = d;
      }
      return { player, distance, confidence: distanceToConfidence(distance) };
    })
    .filter((candidate) => Number.isFinite(candidate.distance))
    .sort((a, b) => a.distance - b.distance);
}
