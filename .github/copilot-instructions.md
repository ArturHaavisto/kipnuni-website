# GitHub Copilot Instructions: Kipnuni Website

## Project Maintenance & Specifications
- **Update spec.md**: Whenever you implement a feature, change the architecture, or modify the tech stack, you MUST review `spec.md` and update it to reflect the current state.
  - Update the "Status" column in feature tables (e.g., change "Planned" to "Implemented").
  - Add new utilized libraries to the Tech Stack tables.
  - Update the Project Structure tree if folders/files change significantly.
- **User Intent Updates**: If the user's prompt implies a change to the website plan, requirements, or features, update `spec.md` first to reflect these new requirements before implementation.

## Architecture & Monorepo Constraints
- **NPM Workspaces**: This is a monorepo partitioned into `frontend`, `api`, and `e2e`. Never mix frontend UI dependencies into the backend, or vice versa. Always run commands using workspace flags (e.g., `npm install <pkg> -w frontend`).
- **Data Fetching**: The frontend uses TanStack Query (React Query) to fetch data. Never use plain `useEffect` for data fetching. Respect the strict query defaults (e.g., `staleTime: 60000`) to prevent backend billing spikes.
- **Backend Constraints**: The backend runs on Azure Functions v4 (Node Model). Use `app.http` for route registration.
- **Database Rules**: Do NOT use `mongoose` or traditional MongoDB TCP drivers. The app uses the stateless **MongoDB Atlas Data API** via REST/fetch. Always utilize the existing `api/src/shared/db_client.ts` layer.

## Code Style & Standards
- **TypeScript**:
  - Use `interface` for object definitions and `type` for unions/intersections.
  - Use strict type checking (no implicit `any`, use `unknown` if necessary).
  - Avoid `enums`; prefer string literal unions instead.
- **React 19 & Frontend**:
  - Rely on React functional components and hooks.
  - Export pages using `export default function...` (required for certain routers/lazy loading) and utility components using named exports (`export function...`).
  - Use `react-i18next` (`const { t } = useTranslation()`) for strictly all user-facing text. Never hardcode English strings in the TSX files.
- **Styling**:
  - Use Tailwind CSS v4 utility classes exclusively. Avoid writing custom CSS unless absolutely necessary for the spatial viewport lock.
  - Support RTL (Right-to-Left) gracefully. If using direction-dependent margins/paddings, prefer logical properties (e.g., `ms-4` instead of `ml-4`) or rely on Tailwind's RTL support.

## Testing & Validation
- **Requirement**: Write unit tests for new utilities and complex logic.
- **Frontend**: Use Jest and React Testing Library (`npm run test -w frontend`). Prefer `screen.getByRole` queries for accessibility.
- **Backend API**: Test handlers locally using Azure Functions Core tools or unit testing standard Function contexts.
- **E2E Integration**: Migrated to Playwright (`e2e/`). Do not attempt to use Selenium or Cypress. All E2E authentications should bypass the Auth0 UI using `storageState` injection.
- **Validation**: After modifying code, ALWAYS verify test health.

## General Behavior
- **Conciseness**: Give short, direct answers. Avoid lengthy preambles.
- **Security**: Never suggest committing secrets, API keys, or Auth0 credentials. Ensure `.env` and `local.settings.json` remain out of version control.
- **Self-Correction**: If you make an assumption that turns out to be wrong regarding the tech stack (e.g., trying to write Express middleware instead of Azure Function hooks), immediately correct yourself.
- **Agentic Tooling**: If you have access to terminal tools, immediately run `npm run lint` or `npx tsc --noEmit` after generating significant code to ensure you did not introduce type errors before concluding your turn.