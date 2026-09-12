# Cricket Face ID

Identify Indian cricket players from a photo. A face is detected in the browser,
matched against a library of player signatures, and returned with a confidence score.

## Tech stack

- React 19 + TypeScript with TanStack Start (Vite)
- Tailwind CSS v4
- face-api.js / TensorFlow.js for in-browser face detection and recognition
- Supabase (PostgreSQL) for player profiles and embeddings

## Development

```sh
bun install
bun run dev
```

The app runs at http://localhost:8080.
