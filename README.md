## Vision: Cricket Face ID 2.0

A **privacy‑first, browser‑based cricket player recognizer** that:

- Detects faces and matches them against a **curated roster of Indian cricketers**
- Runs **entirely in the browser** for detection/recognition (no image upload required)
- Uses Supabase for **player metadata, embeddings, and admin tooling**
- Feels like a pro sports app: fast, accurate, with clear confidence and fallback behavior

***

## Core Architecture Upgrades

### 1. Face Recognition Pipeline (More Accurate & Robust)

You’re already using `face-api.js` / TensorFlow.js. Improve quality and reliability:

- **Model choice:**
  - Use `face-api.js`’s **TinyFaceDetector** for speed + **ResNet‑50 / MobileNet** face descriptor model for better embeddings.
  - Provide a “Quality mode” toggle:
    - Fast: Tiny detector + smaller descriptor
    - Accurate: Larger detector + higher‑res descriptor (slower, more battery)
- **Multi‑face handling:**
  - Detect all faces in the image / video frame.
  - For each face:
    - Show a bounding box + player name + confidence.
    - Allow tapping a face to “focus” and see a larger card.
- **Preprocessing:**
  - Normalize face crop size (e.g., 150×150) before descriptor extraction.
  - Apply basic lighting normalization if possible (via canvas filters).
- **Confidence calibration:**
  - Convert Euclidean distance between embeddings into a **0–100% confidence**.
  - Define thresholds:
    - High: ≥ 80%
    - Medium: 60–79%
    - Low: 40–59%
    - Unknown: < 40% → “No confident match”

***

### 2. Player Embedding Library (Scalable & Versioned)

Instead of ad‑hoc signatures, treat player embeddings as a **managed dataset**:

- **Supabase schema (simplified):**

  ```sql
  players (
    id uuid primary key,
    name text,
    short_name text,
    role text, -- batter, bowler, all-rounder, wk
    teams text[], -- ["IND", "MI", "CSK"]
    image_url text,
    active boolean,
    created_at timestamptz,
    updated_at timestamptz
  )

  player_embeddings (
    id uuid primary key,
    player_id uuid references players(id),
    model_version text, -- e.g. "resnet50-v1"
    embedding vector(512), -- or float[] if no pgvector
    source_image_url text,
    created_at timestamptz
  )
  ```

- **Multiple embeddings per player:**
  - Different angles, lighting, with/without helmet, cap, sunglasses.
  - At inference, compare against **all embeddings** and take the best match (or average top‑k).
- **Versioning:**
  - `model_version` lets you re‑compute embeddings later without losing old ones.
  - Admin UI can show “Embeddings for Virat Kohli (v1.2)”.

You can precompute embeddings in a small Node/Python script and upload to Supabase; the browser just fetches JSON + float arrays.

***

### 3. Matching Logic & Fallback Behavior

Make the matching smarter and more honest:

- **Nearest‑neighbor search:**
  - For each detected face embedding:
    - Compute distances to all player embeddings (or a filtered subset, e.g., active players).
    - Pick the **minimum distance** → candidate player.
- **Thresholding & “Unknown” handling:**
  - If best distance > threshold → “Unknown player / Not in database”.
  - Show:
    - “We couldn’t confidently identify this player.”
    - “Top guess: Shubman Gill (low confidence)”
- **Top‑N suggestions:**
  - Show top 3 candidates with their confidences.
  - Useful when the image is ambiguous (side profile, poor lighting).
- **Roster filters:**
  - Let users filter by:
    - “Current Indian squad”
    - “IPL 2026”
    - “Batters only”, “Bowlers only”
  - This reduces false positives from retired or irrelevant players.

***

### 4. UX: From Demo to Real App

Upgrade the interface to feel like a polished sports product:

- **Camera + Upload modes:**
  - Live camera feed with continuous detection (throttled to ~5–10 FPS).
  - Image upload (drag‑and‑drop, file picker, paste from clipboard).
- **Result cards:**
  - Player photo, name, role, teams.
  - Confidence meter (colored: green/yellow/red).
  - “Other possible matches” accordion for top‑N.
- **History & favorites:**
  - Local `localStorage` history of last N recognitions.
  - “Favorite players” list to quickly see their profiles.
- **Explainability:**
  - “Why this match?” section:
    - “Closest to 3 reference images of Jasprit Bumrah (front, side, bowling action).”
- **Shareable results:**
  - Generate a link like `https://cricketface.id/result?player=kohli-virat&confidence=87`.
  - Page shows a static result card (read‑only) for sharing.

***

### 5. Privacy & Offline Behavior

Lean into the “in‑browser” advantage:

- **No image upload by default:**
  - All detection & recognition happens client‑side.
  - Supabase is used only for:
    - Player metadata
    - Embedding vectors
- **Optional server mode (future):**
  - If you later want to support low‑end devices, you can add an opt‑in “Server assist” mode where images are uploaded for heavier models. Keep it off by default.
- **PWA & caching:**
  - Cache:
    - App shell
    - Player list + embeddings (or a compressed subset)
  - Allow “Offline mode” with a smaller local roster (e.g., top 20 players).
  - Show a clear indicator: “Running offline – limited player set”.

***

### 6. Admin & Content Management

You’ll need an easy way to grow and maintain the player library:

- **Admin UI (protected route):**
  - Add/edit players:
    - Name, role, teams, images
  - Upload reference images:
    - Auto‑compute embeddings in the browser or via a small server script.
    - Tag images (front, side, helmet, cap).
  - Manage rosters:
    - “India T20 WC 2026 squad”
    - “IPL 2026 teams”
- **Bulk import:**
  - CSV/JSON import for players.
  - Script to generate embeddings from a folder of images.
- **Analytics (privacy‑friendly):**
  - Most recognized players
  - Common “unknown” cases (to know which players to add)
  - Average confidence per player

All of this can live in the same TanStack Start app under `/admin`, protected by Supabase auth or a simple token.

***

### 7. Performance & Model Loading UX

Face models are heavy; make loading and runtime smooth:

- **Model preloading & progress:**
  - Show a loading screen with:
    - “Loading face detection model…”
    - “Loading player embeddings…”
  - Cache models in IndexedDB or via service worker so subsequent loads are faster.
- **Lazy loading:**
  - Load detection model first; embeddings in the background.
  - Allow “Try demo” with a small subset of players while full roster loads.
- **Frame throttling:**
  - For live camera:
    - Run detection every N frames or every X ms.
    - Skip processing if the previous result is still “high confidence” and the frame hasn’t changed much.

***

### 8. Accessibility, Theming, and Branding

Make it feel like a real product:

- **Theming:**
  - Cricket‑themed color palette (e.g., BCCI blue/orange, or IPL‑style).
  - Light/dark mode.
- **Accessibility:**
  - Keyboard navigation for player cards.
  - ARIA labels on controls and results.
  - Clear text alternatives for visual confidence meters.
- **Branding:**
  - Logo + tagline: “Point your camera. Know the player.”
  - About page explaining:
    - How it works
    - Privacy guarantees
    - Limitations (e.g., poor lighting, heavy occlusion)

***

### 9. Deployment & Env Hardening

Your Vercel setup is good; refine it:

- **Environment variables:**
  - Keep `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Vercel.
  - Avoid using `SUPABASE_SERVICE_ROLE_KEY` in the client; reserve it for:
    - Serverless functions (if you add any)
    - Admin scripts
- **Row Level Security (RLS):**
  - In Supabase:
    - Public read access to `players` and `player_embeddings`.
    - Write access only for admin role/service key.
- **CORS & CSP:**
  - Configure Supabase CORS for your domain.
  - Add a Content Security Policy that allows:
    - TensorFlow.js / face-api.js CDN (if used)
    - Your Vercel domain

***

### 10. Future Extensions (Optional but Powerful)

Once the core is solid:

- **Team mode:**
  - Upload a team photo → detect multiple players → generate a labeled “XI” card.
- **Stats overlay:**
  - On recognizing a player, show:
    - Recent form (last 5 innings / matches)
    - Key stats (strike rate, economy, etc.) from a static dataset or API.
- **Commentary integration:**
  - For recognized players, show a famous commentary line or nickname.
- **Mobile app wrapper:**
  - Wrap the PWA in Capacitor / Tauri for Android/iOS.
  - Use native camera with better control.

***
