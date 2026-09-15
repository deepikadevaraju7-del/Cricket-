# Cricket Face ID 🏏

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

An AI-powered web application that detects and identifies Indian cricket players from uploaded or captured images directly in the browser. Using client-side neural networks and vector embeddings, the app extracts facial signatures and matches them against a pre-indexed database of professional player profiles with confidence scoring.

---

## Key Features

* **In-Browser Inference:** Performs real-time face detection and feature extraction using WebGL-accelerated TensorFlow.js models without streaming raw video/images to a server.
* **Vector Matching:** Compares client-side facial embeddings against stored player signatures in Supabase using vector similarity.
* **Confidence Scoring:** Returns top matching candidates alongside similarity confidence percentages and player profile metadata.
* **Responsive Dashboard:** Built with React 19 and Tailwind CSS v4 for a seamless mobile and desktop experience.

---

## Tech Stack

* **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [TanStack Start](https://tanstack.com/start)
* **Build System:** [Vite](https://vitejs.dev/), [Bun](https://bun.sh/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Machine Learning:** `face-api.js` / `TensorFlow.js`
* **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL with `pgvector` for embeddings)

---

## System Architecture

```text
[ User Image / WebCam ]
         │
         ▼
[ Client (Browser) ] ──( face-api.js / TensorFlow.js )──► [ Extract 128D Embedding ]
         │                                                            │
         └───────────────────────── Query ────────────────────────────┘
                                   │
                                   ▼
                         [ Supabase Postgres ]
                     ( Vector Similarity Match )
                                   │
                                   ▼
                        [ Ranked Player Profiles ]

```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

* [Bun](https://bun.sh/) (v1.0 or higher)
* [Node.js](https://nodejs.org/) (v18 or higher)

### Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project REST endpoint API URL |
| `SUPABASE_PUBLISHABLE_KEY` | Public API key for client-side operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service key (used for server tasks/indexing) |

### Local Installation

1. **Clone the repository:**
```sh
git clone [https://github.com/deepikadevaraju7-del/Cricket-.git](https://github.com/deepikadevaraju7-del/Cricket-.git)
cd Cricket-

```


2. **Install dependencies:**
```sh
bun install

```


3. **Start the development server:**
```sh
bun run dev

```


4. Open `http://localhost:8080` in your browser.

---

## Deployment

### Vercel Deployment

This project is configured for one-click deployment via [Vercel](https://vercel.com/):

1. Import your repository into the Vercel Dashboard.
2. Ensure the framework preset is set to **Vite** / **TanStack Start**.
3. Add the required environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) under **Settings > Environment Variables**.
4. Click **Deploy**.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue to report bugs and suggest new features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

```

```
