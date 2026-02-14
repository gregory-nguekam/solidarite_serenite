# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React + TypeScript application code.
- `src/api/` contains API clients and data access helpers.
- `src/auth/` contains auth context, guards, and related utilities.
- `src/pages/` contains route-level screens.
- `src/ui/` contains shared UI components and layouts.
- `src/assets/` contains images and other static assets used by the app.
- `public/` contains static files copied as-is by Vite.
- `index.html`, `vite.config.ts`, and `tsconfig*.json` define the app shell and tooling.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server with HMR.
- `npm run build` runs TypeScript build mode and produces the production bundle.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint on the codebase.

## Coding Style & Naming Conventions
- Use 2-space indentation, double quotes, and semicolons (match existing files).
- React components live in `.tsx` files and use PascalCase names (example: `RegisterPage.tsx`).
- Hooks use the `useX` pattern; variables and functions use camelCase.
- Prefer MUI `sx` or Emotion `styled` for styling; keep theme tokens centralized.

## Testing Guidelines
- No test runner is configured yet (there is no `npm run test`).
- If adding tests, place them under `src/**/__tests__/*.test.tsx` and add the script to `package.json`.

## Commit & Pull Request Guidelines
- Commit history uses short, plain summaries (example: "Images edit"). Keep messages concise and present tense.
- PRs should include a summary, verification steps (`npm run dev` / `npm run build`), and screenshots for UI changes.
- Link related issues when applicable.

## Security & Configuration Tips
- Environment values live in `.env` and must use the `VITE_` prefix (example: `VITE_API_URL=http://localhost:8080`).
- Do not commit secrets; use local `.env` overrides for developer-specific settings.
