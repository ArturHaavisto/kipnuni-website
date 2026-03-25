# Kipnuni Website - Technical Specification

## Project Overview

A modern full-stack web application built with industry-standard technologies and best practices, targeting a cloud-native architecture on Microsoft Azure.

## Navigation Architecture

The application supports a **Dual Navigation System**, allowing users to toggle between two distinct layout modes. To provide a robust experience, the architecture enforces the following rules:

1. **Persistence:** The user's mode preference is persisted via `localStorage` using the `usehooks-ts` library's `useLocalStorage` hook. For authenticated users, the preference is additionally synced to the user's document in MongoDB (via the existing `/api/users/:id` endpoint) so it can be restored on new devices.
2. **Transition:** Switching modes triggers a hard reload (`window.location.reload()`) to ensure clean component unmounting and a full CSS reset between the two fundamentally different layouts. See [Mode Transition Behavior](#mode-transition-behavior) for details.
3. **Mobile Override:** On mobile devices (viewport width `< 768px`), **Traditional Mode is always the default** regardless of the stored preference. This is because the spatial down-arrow navigation conflicts with browser chrome and mobile gesture zones. When a mobile user explicitly toggles to Experimental Mode, the app requests the **Fullscreen API** (`document.documentElement.requestFullscreen()`) to reclaim the full viewport before rendering the spatial canvas.
4. **Global CSS Strategy:** The viewport lock styles (`100dvh`, `overflow: hidden`, `overscroll-behavior: none`) required by Experimental Mode are applied **conditionally** via a `data-nav-mode="experimental"` attribute on the `<html>` element, rather than as unconditional global CSS. Traditional mode uses standard `min-h-screen` block flow.

### 1. Traditional Mode (Desktop Default)
Standard horizontal web navigation layout.

#### Header
A fixed (`sticky top-0`) horizontal bar spanning the full viewport width.
- **Left region:** Application logo/wordmark linking to `/` (Now).
- **Center region:** Primary navigation links — `Now`, `Me`, `Link`, `My History`, `My Future`.
- **Right region:** Auth/Profile button (login/avatar), Language Switcher dropdown, and the **Navigation Toggle Button** (see [Navigation Toggle](#navigation-toggle)).
- **Mobile (< 768px):** The center navigation links collapse into a hamburger menu (slide-out drawer from the left). The right region retains the Auth button and Toggle button; the Language Switcher moves into the drawer.

#### Content Area
- Standard `min-h-screen` block flow layout, content scrolls naturally.
- Each page (`Now`, `Me`, `Link`, `My History`, `My Future`) renders as a full-width content section below the header.
- Scrolling is unrestricted; no viewport lock is applied.

#### Footer
- A simple footer at the bottom of the content flow containing copyright information, language attribution, and secondary links.

### 2. Experimental Mode (Spatial Canvas)
A fixed-viewport, 2D spatial navigation concept where pages relate to one another via fixed 2D coordinates.

#### Spatial Coordinate Mapping
Pages are plotted on a virtual 2D grid `[X, Y]`:
- **Now** `[0,0]` (Center Hub)
- **My Future** `[0,1]` (Top)
- **My History** `[0,-1]` (Bottom)
- **Link** `[1,0]` (Right)
- **Me** `[-1,0]` (Left)

#### Layout Structure (`100dvh` Fixed Viewport)
- **The Application Shell:** The outer rim of the display is a continuous dark frame. Its height is strictly locked to `100dvh` with `overscroll-behavior: none` to prevent native browser bounce.
- **Arrow Navigation:** Boundary "slots" surrounding the frame containing arrow buttons pointing toward adjacent coordinates. 
  - *Example:* When on the "Me" page `[-1,0]`, arrows appear at the Top-Right (pointing to `[0,1]`), Center-Right (pointing to `[0,0]`), and Bottom-Right (pointing to `[0,-1]`).
- **Toggle Button:** The toggle to revert to Traditional mode is located on the right side of the frame, vertically positioned at 25% (`1/4`) of the screen height (see [Navigation Toggle](#navigation-toggle)).
- **Inner Preview Container:** An absolute-positioned, white content container heavily inset (e.g., `inset-12`) from the screen edges, holding the active page content. Content inside is vertically scrollable (`overscroll-y-contain`), ensuring scrolling never overlaps the outer shell.

#### Screen-Size Behavior (Experimental Mode)

| Viewport | Preview Container | Expand/Collapse | Arrow Visibility |
|---|---|---|---|
| **Desktop / Tablet (≥ 768px)** | Always in "preview" state (`inset-12` / `inset-16` / `inset-20`). Content is fully readable within the inset area. | No expand/collapse interaction. The container never goes full-screen. | Always visible in the outer frame slots. |
| **Mobile (< 768px, fullscreen)** | Starts in "preview" state with heavy borders showing limited content. | Tapping the container expands it to near-fullscreen (`inset-1 z-50`). A pill-shaped "Close" button at the bottom-center collapses it back. | Hidden while expanded; visible when collapsed. |

#### Page Transition Animation
Navigating between pages triggers a direction-aware slide animation:
- **Engine:** `motion` (Framer Motion) `AnimatePresence` with `mode="wait"`.
- **Direction logic:** The slide direction is computed from the delta between the current and previous spatial coordinates. E.g., navigating from `Now [0,0]` to `Link [1,0]` slides content **left** (new page enters from right).
- **Duration:** ~300ms.
- **Easing:** `ease-in-out`.
- The outgoing page exits in the opposite direction simultaneously.

#### Spatial Swiping Navigation
Users can navigate the spatial grid via touch-and-drag gestures originating on the outer border frame (avoiding the inner content container). The system uses "natural scrolling" semantics — for example, touching the border and swiping down pulls the "Top" page into view.
- **Sensitivity:** The gesture system (`motion`) uses a minimum pixel threshold to differentiate between a short "tap" (triggering a standard arrow click) and a continuous directional "swipe".
- **Visual Feedback:** Dragging past the initial threshold before releasing displays a directional visual cue (e.g., a glow or border indicator) highlighting which direction the navigation will occur upon release.
- **System Conflicts:** OS-level edge gestures (such as iOS's edge-swipe-to-go-back) are strictly respected and not forcefully prevented by the app. If a device interprets a gesture as an OS-level back action rather than an app swipe, the browser naturally handles it. Users can simply rely on the visible arrow buttons if their swiping surface is restricted by OS gestures.

#### 3D Minigame Navigator
To provide a highly interactive alternative way to traverse the spatial grid, Experimental Mode includes a 3D minigame overlay.
- **Trigger & Layout:** A "Map" or "3D" toggle button is placed on the side frame. Pressing it opens an absolute-positioned, full-screen transparent modal containing a WebGL 3D canvas. Clicking anywhere on the modal outside of the main control button instantly closes the game without navigating.
- **The 3D Scene:** The scene displays a flat structural "floor" separated into distinct zones perfectly mirroring the 2D spatial coordinate map (e.g., the center is `Now [0,0]`).
- **The Player Object:** A controllable 3D object (initially a basic physics ball) represents the user's current navigational intent. A prominent 2D text box is overlaid at the top of the screen, dynamically displaying the name of the exact page/zone the ball is currently occupying.
- **Zone Signage:** Each zone that the ball is *not* currently residing in features a visible 3D sign or floating text indicating which page it represents, ensuring the map orientation is constantly clear.
- **Control Mechanism (Virtual Joystick):** A single 2D virtual joystick button acts as the sole controller. Pressing and dragging this button applies physical force to the ball, making it roll or slide across the 3D floor in the corresponding direction. 
- **Navigation Execution:** Releasing (lifting the mouse/finger from) the joystick commits the action. The system calculates the ball's final coordinates on the floor; if it finishes in a new page's zone, the 3D overlay closes and the app natively triggers a spatial slide transition to that corresponding route.
- **Lazy Loading (Performance):** The 3D engine libraries (`three`, `@react-three/fiber`, `@react-three/drei`) are highly heavy compared to a standard SPA payload (~600KB+ gzipped). To protect the core site's initial load time, these libraries and the Minigame component must be lazily loaded (`React.lazy()`) and dynamically imported *only* when the user clicks the "3D" trigger button for the first time.

### Navigation Toggle
The toggle is the bridge between the two modes and appears in both layouts with a consistent identity.

| Context | Placement | Appearance |
|---|---|---|
| **Traditional Mode** | Header, right region, next to the Language Switcher | A labeled icon button (e.g., grid/compass icon + "Spatial" label). On mobile, the label is hidden and only the icon is shown. |
| **Experimental Mode** | Right side of the outer frame, vertically at 25% screen height | A small icon button (e.g., horizontal bars icon) with a tooltip "Switch to Traditional". |

- **Keyboard shortcut:** `Ctrl+Shift+E` (Windows/Linux) / `Cmd+Shift+E` (macOS) toggles the mode from either layout.
- **Behavior:** Clicking the toggle writes the new mode to `localStorage`, then calls `window.location.reload()`. On mobile, switching **to** Experimental additionally requests the Fullscreen API.

### Mode Transition Behavior
When the user switches navigation modes:
1. **Route preservation:** The current URL path (e.g., `/history`) is preserved across the reload. The receiving mode maps the URL to its own layout context (Traditional renders it as a standard page; Experimental maps it to the corresponding spatial coordinate `[0,-1]`).
2. **Scroll state:** Destroyed by the hard reload. This is acceptable — both modes start at the top of their respective layouts.
3. **Transition screen:** A brief branded splash/loading screen is shown during the reload to mask the white flash. This is implemented as an inline `<style>` + `<div>` in `index.html` (outside React) that is removed by the app's `useEffect` on mount.
4. **Query cache:** TanStack Query's in-memory cache is destroyed by the reload. Previously fetched data will be re-fetched on the next page load subject to `staleTime` rules.

---

## Tech Stack

### Frontend

| Technology                       | Version | Purpose                                            |
| -------------------------------- | ------- | -------------------------------------------------- |
| React                            | 19.x    | UI library for building component-based interfaces |
| TypeScript                       | 5.x     | Static typing for JavaScript                       |
| Vite                             | 7.x     | Fast build tool and dev server                     |
| Tailwind CSS                     | 4.x     | Utility-first CSS framework                        |
| TanStack Query (React Query)     | 5.x     | Server state management and data fetching          |
| Auth0 React SDK                  | 2.x     | Identity and authentication frontend management    |
| i18next                          | 24.x    | Internationalization framework                     |
| react-i18next                    | 15.x    | React bindings for i18next                         |
| i18next-browser-languagedetector | 8.x     | Auto-detect user language                          |
| i18next-parser                   | 9.x     | Auto-extract translation keys                      |
| motion (Framer Motion)           | 12.x    | Direction-aware page transition animations         |
| usehooks-ts                      | 3.x     | Type-safe React hooks (`useLocalStorage`, `useMediaQuery`) for mode persistence and responsive detection |
| three                            | 0.16x.x | Core WebGL 3D rendering engine for minigame nav    |
| @react-three/fiber               | 8.x     | React renderer for Three.js (3D Minigame canvas)   |
| @react-three/drei                | 9.x     | Abstracted helpers/components for React Three Fiber|

### Backend

| Technology             | Version   | Purpose                                |
| ---------------------- | --------- | -------------------------------------- |
| Node.js                | 20.x LTS  | JavaScript runtime                     |
| Azure Functions        | v4        | Serverless backend processing          |
| TypeScript             | 5.x       | Static typing                          |
| MongoDB Atlas Data API | V1 (REST) | Stateless, HTTPS-based database driver |
| Auth0 Node/JWT         | -         | JWT validation for endpoints           |
| jwks-rsa               | 3.x       | Retrieve RSA signing keys              |

### Database

| Technology    | Version | Purpose                                     |
| ------------- | ------- | ------------------------------------------- |
| MongoDB Atlas | 7.x     | Managed Cloud NoSQL database (REST trigger) |

### Testing

| Technology                 | Purpose                      |
| -------------------------- | ---------------------------- |
| Jest                       | Unit/integration test runner |
| React Testing Library      | React component testing      |
| Azure Functions Core Tools | Backend function testing     |
| mongodb-memory-server      | In-memory MongoDB for tests  |
| Playwright                 | End-to-end testing           |

### DevOps & Tooling

| Technology            | Purpose                        |
| --------------------- | ------------------------------ |
| NPM Workspaces        | Monorepo package management    |
| Azure Static Web Apps | Frontend hosting + API routing |
| GitHub Actions        | Built-in SWA CI/CD pipeline    |
| ESLint                | Code linting                   |
| Prettier              | Code formatting                |
| Husky                 | Git hooks                      |
| lint-staged           | Pre-commit linting             |

---

## Project Structure

This repository utilizes NPM Workspaces to separate the frontend, backend (API), and end-to-end testing dependencies while sharing tooling at the root. (Note: Tailwind v4 utilizes CSS imports exclusively, so `tailwind.config.js` and `postcss.config.js` are explicitly removed).

```text
kipnuni-website/
├── frontend/                 # React frontend application
│   ├── src/                  # Source code (components, hooks, i18n, pages)
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite config
│   └── eslint.config.js      # Frontend linting
├── api/                      # Azure Functions backend API (v4 Node Model)
│   ├── src/
│   │   ├── functions/        # Route Handlers (e.g., health.ts, users.ts)
│   │   └── shared/           # Shared logic (db_client.ts for Data API, auth.ts for JWT)
│   ├── host.json             # Function app configuration
│   ├── local.settings.json   # Local environment variables
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # Backend TypeScript config
├── e2e/                      # Playwright End-to-end tests
│   ├── test-env.json         # Playwright-specific test environment
│   └── playwright.config.ts
├── package.json              # Root workspace definition
├── staticwebapp.config.json  # SWA routing and configuration
├── .vscode/                  # Editor configs
│   └── launch.json           # Debugger configurations for Azure Functions
└── spec.md                   # This file
```

---

## Architecture Details

### 1. Routing Strategy

Since this is a Single Page Application (SPA), we rely on client-side routing. We configure `staticwebapp.config.json` at the root level to catch all non-API 404 routes and redirect them to `index.html`.

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

### 2. Authentication (Auth0)

Authentication is handled entirely by **Auth0** to provide robust security out of the box, supporting email/password, magic links, and social sign-ins (Google, GitHub).

- **Frontend**: Uses `@auth0/auth0-react` to manage login modals, sessions, and automatically append Bearer tokens to API requests.
- **Backend Protection**: Azure Functions endpoints validate the incoming Auth0 JWT using a custom middleware wrapper (`api/src/shared/auth.ts`) incorporating the `jwks-rsa` library to securely fetch signing keys from the Auth0 Tenant.
- **Database Sync**: A dedicated endpoint (e.g., `POST /api/users/sync`) is called immediately after a successful Auth0 login to upsert the user record via the Atlas Data API into Node, ensuring application-specific user properties and relations can be linked to the Auth0 `sub` ID.

### 3. Database Execution (Stateless MongoDB Atlas Data API)

Because Azure Functions Consumption plans scale rapidly across dynamic IP addresses, strict network IP whitelisting for standard MongoDB TCP connections is impossible without opening the database to the entire internet (`0.0.0.0/0`).

- **Solution**: We removed Mongoose and standard TCP database drivers. Instead, we use the **MongoDB Atlas Data API**, which provides stateless, HTTPS-based endpoints to execute queries securely utilizing short-lived REST boundaries.
- **Implementation**: Database interaction logic lives in `api/src/shared/db_client.ts` via standard Javascript Fetch payloads interacting with the Atlas Data URL boundary and API Key.
- **Cold-Start Mitigation**: To reduce latency penalties from Azure Functions and Atlas Data API TLS handshakes, the fetching utility uses a custom NodeJS `https.Agent` with `keepAlive: true` to reuse TCP connections across subsequent rapid warm invocations.

### 4. Testing Strategy & Isolation

- **Frontend**: Unit testing via Jest & React Testing Library (Utilizing mock Auth0 contexts).
- **Backend API**: Unit/integration testing uses **Azure Functions Core Tools** to locally mock true event triggers.
- **E2E Integration & Data Isolation**: Migrated to **Playwright**. To prevent Playwright from corrupting development data, we utilize a strictly scoped test database cluster.
- **E2E Authentication (Playwright)**: To avoid Auth0 bot protections (CAPTCHA) and rate limits, Playwright uses **Session State Injection (`storageState`)**. A global setup script performs a single programmatic UI login (or uses a backend-issued test token), saves the browser cookies and localStorage to `playwright/.auth/user.json`, and reuses that authenticated state across all tests instead of logging in repeatedly.
- **Dual Navigation E2E**: Playwright tests must cover both navigation modes independently and the transition between them:
  1. **Traditional Mode:** Verify header renders, all 5 page links navigate correctly, footer is visible, hamburger menu works on mobile viewport.
  2. **Experimental Mode:** Verify spatial canvas renders, arrow navigation between all 5 coordinates works, slide animations complete, preview container scrolls.
  3. **Mode Toggle:** Verify switching from Traditional → Experimental preserves the current route, the transition splash appears briefly, and the spatial canvas loads at the correct coordinate. Verify the reverse direction.
  4. **Mobile Override:** Verify that on a mobile viewport, the app always starts in Traditional mode. Verify that toggling to Experimental triggers fullscreen. Verify that exiting fullscreen reverts to Traditional.

### 5. Frontend State & Data Fetching

**TanStack Query** (React Query) manages server state.

- **Cost Protection**: To prevent aggressive polling from generating massive Azure Functions per-execution costs, default QueryClient settings are strictly tuned: `refetchOnWindowFocus: false`, `retry: 1`, and `staleTime: 60000` (1 minute). This ensures the SPA relies on cache rather than spamming backend REST APIs.
- **Navigation Mode Awareness**: The query cache is destroyed on every mode switch (hard reload). This is by design — the cache rebuilds naturally as the user navigates pages in the new mode.

### 6. Local Development Experience

The local development environment uses standard emulators to mirror production behavior:

- **Database**: Because the Atlas Data API lacks local emulation capabilities, local development strictly connects to a **dedicated Cloud Development Atlas Cluster**.
- **App & API Emulator**: Run `swa start http://localhost:5173 --api-location ./api`. This executes the SWA CLI which seamlessly serves both the Vite dev server and the Azure Functions endpoints locally behind a unified proxy gateway.
- **Debugging**: The workspace includes a `.vscode/launch.json` setup allowing attachment of the VS Code debugger to the `swa` emulator and Azure Functions process, ensuring you can step through backend code line-by-line.

### 7. Environment Variables

Environment variables are strictly categorized to avoid leaks across the workspace boundaries:

- **Frontend**: Defined in `frontend/.env`. Variables accessed by the client must be prefixed with `VITE_` (e.g., `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`).
- **Backend API**: Defined in `api/local.settings.json` (e.g., `ATLAS_DATA_API_URL`, `ATLAS_DATA_API_KEY`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_BASE_URL`). This file must be in `.gitignore`.

---

## Development Environment

### Workstation Setup

- **OS**: Windows 11 Pro
- **Subsystem**: WSL2 (Ubuntu)
- **Editor**: VS Code (running in WSL mode)
- **Extensions**: See `.vscode/extensions.json`

### Mobile Testing (Android via USB)

To access the local development server from an Android device connected via USB:

1. **Enable USB Debugging** on your Android device (Settings > Developer Options).
2. **Connect via USB** to your PC.
3. **Chrome Port Forwarding**:
   - Open Chrome on your PC.
   - Go to `chrome://inspect/#devices`.
   - Check "Port forwarding".
   - Click "Configure..." and add:
     - `4280` -> `localhost:4280` (SWA Default Port)
4. **Access on Phone**:
   - Open Chrome on Android.
   - Navigate to `http://localhost:4280`.

---

## Setting Up

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Azure Static Web Apps CLI
- Azure Functions Core Tools v4

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kipnuni-website
   ```

2. **Install workspace dependencies**

   ```bash
   # Utilizing NPM Workspaces
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp api/local.settings.example.json api/local.settings.json
   cp frontend/.env.example frontend/.env
   ```

4. **Install E2E test dependencies**

   ```bash
   cd e2e
   npm install
   npx playwright install
   ```

### Running the Application Locally

```bash
# 1. Ensure you have the Cloud Dev Atlas Data API URL & Key in api/local.settings.json

# 2. Start frontend server
cd frontend && npm run dev

# 3. Start SWA Emulator and Backend (in another terminal at the project root)
swa start http://localhost:5173 --api-location ./api
```

### Running Tests

```bash
# Run Frontend Unit Tests (Jest / React Testing Library)
npm run test -w frontend

# Run Backend Unit Tests (Core Tools / Jest)
npm run test -w api

# Run E2E Tests (Playwright)
cd e2e && npx playwright test
```

---

## API Endpoints (Azure Functions v4)

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/health`     | Server health status       |
| POST   | `/api/users/sync` | Sync Auth0 user to MongoDB |
| GET    | `/api/users`      | Get all users (Protected)  |
| GET    | `/api/users/:id`  | Get user by ID (Protected) |
| PUT    | `/api/users/:id`  | Update user (Protected). Also used to persist the user's `navMode` preference (`"traditional"` \| `"experimental"`) in the user document. |
| DELETE | `/api/users/:id`  | Delete user (Protected)    |

---

## Configuration

### Environment Variables example (api/local.settings.json)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "~20",
    "ATLAS_DATA_API_URL": "https://data.mongodb-api.com/app/.../endpoint/data/v1",
    "ATLAS_DATA_API_KEY": "YOUR_SECRET_KEY",
    "AUTH0_AUDIENCE": "https://api.kipnuni.com",
    "AUTH0_ISSUER_BASE_URL": "https://your-tenant.auth0.com/"
  }
}
```

---

## Manual Setup Instructions

### 1. VS Code Extensions

Install the following VS Code extensions for the best development experience:

| Extension ID                              | Name                      | Purpose                       |
| ----------------------------------------- | ------------------------- | ----------------------------- |
| `dbaeumer.vscode-eslint`                  | ESLint                    | JavaScript/TypeScript linting |
| `esbenp.prettier-vscode`                  | Prettier                  | Code formatting               |
| `bradlc.vscode-tailwindcss`               | Tailwind CSS IntelliSense | CSS class autocomplete        |
| `ms-azuretools.vscode-azurefunctions`     | Azure Functions           | Functions setup & execution   |
| `ms-azuretools.vscode-azurestaticwebapps` | Azure Static Web Apps     | SWA Deployment                |
| `mongodb.mongodb-vscode`                  | MongoDB for VS Code       | Database management           |
| `Orta.vscode-jest`                        | Jest                      | Test runner integration       |
| `ms-vscode.vscode-typescript-next`        | TypeScript Nightly        | TS features (Optional/Dev)    |

### 2. Git Hooks Setup (Husky)

After installing dependencies, initialize Husky:

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Create `.lintstagedrc.json` at project root:

```json
{
  "frontend/**/*.{ts,tsx}": ["npm run lint --workspace=frontend"],
  "api/**/*.{ts,tsx}": ["npm run lint --workspace=api"],
  "*.{json,md,css}": ["prettier --write"]
}
```

---

## Website Specifications Template

### Business Requirements

| Requirement          | Description                                   | Status  |
| -------------------- | --------------------------------------------- | ------- |
| User Authentication  | Auth0 Integration (Email/Pwd, Social, Magic)  | Planned |
| User Management      | CRUD operations for users via Azure Functions | Planned |
| Responsive Design    | Mobile-first approach with dual navigation    | Planned |
| Dual Navigation      | Traditional + Experimental spatial canvas     | Planned |
| SEO Optimization     | Meta tags, sitemap                            | Planned |
| Internationalization | Multi-language support (en/fi/zh/ar)          | Planned |
| RTL Support          | Arabic right-to-left layout                   | Planned |

---

## Internationalization (i18n) Architecture

### Supported Languages

| Code | Language | Native Name | Direction | Status  |
| ---- | -------- | ----------- | --------- | ------- |
| en   | English  | English     | LTR       | Planned |
| fi   | Finnish  | Suomi       | LTR       | Planned |
| zh   | Chinese  | 中文        | LTR       | Planned |
| ar   | Arabic   | العربية     | RTL       | Planned |

### Translation File Structure

Translations are stored in `frontend/src/i18n/locales/{lang}.json`:

```json
{
  "common": { "appName": "...", "loading": "...", ... },
  "nav": { "now": "...", "me": "...", "link": "...", "history": "...", "future": "...", "toggleMode": "..." },
  "header": { "toggleTheme": "...", "selectLanguage": "..." },
  "now": { "welcome": "...", "subtitle": "...", ... },
  "me": { ... },
  "link": { ... },
  "history": { ... },
  "future": { ... },
  "footer": { ... },
  "errors": { ... }
}
```

### RTL/LTR Handling

- **Automatic direction switching**: The `useDirection` hook sets `dir` and `lang` attributes on `<html>`.
- **CSS utilities**: RTL-specific classes (`.rtl`, `.flip-rtl`, `space-x-reverse`) in `index.css`.
- **Component adaptations**: Header and navigation automatically adjust spacing for RTL.
- **Arabic font**: Uses Noto Sans Arabic when RTL is active.

### Chinese Vertical Text (Optional)

Use the `.vertical-text-zh` class for traditional vertical Chinese text layout:

```html
<div class="vertical-text-zh">縱向文字</div>
```

### Adding New Translations

1. Run the i18next-parser to auto-generate missing keys contextually from `.tsx` components:
   ```bash
   npm run extract:i18n -w frontend
   ```
2. Update the extracted keys in `frontend/src/i18n/locales/{lang}.json`
3. Register new languages securely in `supportedLanguages` in `frontend/src/i18n/config.ts`

---

## Deployment

### Production Checklist

- [ ] Ensure root `package.json` build scripts properly map Workspaces (e.g. `npm run build -w frontend`).
- [ ] Configure CI/CD YAML to map SWA bindings: `app_location="frontend"`, `api_location="api"`, and `output_location="dist"`.
- [ ] Update `.env` variables for frontend SWA Configuration (Auth0 client IDs)
- [ ] Configure production MongoDB Atlas Cluster Data API App Endpoint.
- [ ] Update Function App Settings with MongoDB Data API Key, URL, and Auth0 Audience variables.
- [ ] Configure Auth0 callbacks (`/callback`, `/logout`) for production domain
- [ ] Secure API paths in `staticwebapp.config.json` via roles
- [ ] Map custom domain and SSL in Azure SWA
