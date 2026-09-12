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

## Deploy to Vercel

Import this repository into Vercel. The repository includes the Vercel build configuration.

Add these environment variables in the Vercel project settings:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
