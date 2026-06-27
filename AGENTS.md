# cursor-frontend

## Cursor Cloud specific instructions

### Project overview
This repo hosts a client-only **Investment Tracker** single-page app built with Vite 6 + React 19 + TypeScript + Tailwind CSS v4. All state (portfolio holdings) is persisted in the browser's `localStorage` under the key `investment-tracker-holdings` — there is no backend, database, or auth.

> Note: the `main` branch is currently just a placeholder `README.md`. The application source lives on feature branches (e.g. `cursor/investment-tracker-*`). If `main` has no `package.json`, you are on a branch without the app code — switch to / branch from the feature branch that contains it.

### Toolchain
- Node 22 / npm 10 (already installed). No `.nvmrc`; the default Node satisfies Vite 6 + React 19.
- The startup update script runs `npm install` only when a `package.json` is present, so it is a no-op on the placeholder `main` branch.

### Commands (only valid where `package.json` exists)
- Install: `npm install`
- Run dev server: `npm run dev` — serves on `http://localhost:5173/`.
- Build: `npm run build` — runs `tsc -b` then `vite build`.
- Preview production build: `npm run preview`.
- There are **no `lint` or `test` scripts** configured for this project; type-checking happens via `tsc -b` during `npm run build`.

### Notes
- The app needs no environment variables or secrets.
- Vite emits a "chunk larger than 500 kB" warning on build; this is expected and not an error.
