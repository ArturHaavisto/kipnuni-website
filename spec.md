# Kipnuni Website - Technical Specification

## Project Overview

A modern full-stack web application built with industry-standard technologies and best practices, targeting a cloud-native architecture on Microsoft Azure. The site title is **"Kipnuni - Helper of Humanity"**.

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

- **Left region:** Application logo image (`logo-website.png`) alongside wordmark, linking to `/` (Now). The logo is also set as the browser tab favicon.
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

- **The Application Shell:** The outer rim of the display is a continuous frame. Its background is theme-aware (`bg-gray-200` in light mode, `bg-gray-900` in dark mode). Its height is strictly locked to `100dvh` with `overscroll-behavior: none` to prevent native browser bounce.
- **Arrow Navigation:** Boundary "slots" surrounding the frame perfectly matching the exact border spaces left by the `PreviewContainer` (e.g., `h-8 md:h-16 lg:h-20` for top/bottom, `w-8 md:w-16 lg:w-20` for left/right). Arrows and texts are tightly bounded inside these slots.
  - _Top/Bottom slots:_ Use semantic flex row layout to keep arrows/text constrained inside limits.
  - _Left/Right slots:_ Use semantic flex col layout with text oriented vertically (`writingMode: vertical-rl`) to prevent width bleeding.
  - _Corner slots:_ Texts are absolutely positioned along the outer rim edges, avoiding the inner white center area.
  - _Sizing:_ Uses responsive `max-h-12 w-auto` / `max-w-12 h-auto` to flexibly fit the variable border thickness without arbitrary static dimensions.
- **Toggle Button:** The toggle to revert to Traditional mode is located on the right side of the frame, vertically positioned at 25% (`1/4`) of the screen height (see [Navigation Toggle](#navigation-toggle)).
- **Logo:** The application logo (`logo-website.png`) is displayed on the left side of the frame at 25% (`1/4`) of the screen height, contained within the border strip without crossing into the content area.
- **Language Switcher:** A globe icon button on the left side of the frame at 75% (`3/4`) of the screen height. Clicking it opens a dropdown selector for the supported languages.
- **Dark Mode Toggle:** A sun/moon icon button on the left side of the frame, positioned directly below the Language Switcher at 75% height. Toggling it switches the entire application between light and dark themes.
- **Game Nav Trigger:** A gamepad icon button on the right side of the frame at 75% (`3/4`) of the screen height. Implements a two-state preload/open lifecycle (see [3D Minigame Navigator](#3d-minigame-navigator)).
- **Inner Preview Container:** An absolute-positioned, white content container heavily inset (e.g., `inset-12`) from the screen edges, holding the active page content. Content inside is vertically scrollable (`overscroll-y-contain`), ensuring scrolling never overlaps the outer shell.

#### Screen-Size Behavior (Experimental Mode)

| Viewport                       | Preview Container                                                                                                 | Expand/Collapse                                                                                                                            | Arrow Visibility                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Desktop / Tablet (≥ 768px)** | Always in "preview" state (`inset-8` / `inset-16` / `inset-20`). Content is fully readable within the inset area. | No expand/collapse interaction. The container never goes full-screen.                                                                      | Always visible in the outer frame slots with contextual page labels. |
| **Mobile (< 768px)**           | Starts in "preview" state with heavy borders showing limited content (`inset-8`).                                 | Tapping the container expands it to near-fullscreen (`inset-1 z-50`). A pill-shaped "Close" button at the bottom-center collapses it back. | Hidden while expanded; visible when collapsed.                       |

_Note: For mobile testing on a desktop, a "Mock Fullscreen" is utilized (`ENABLE_REAL_FULLSCREEN = false` fallback to `100dvh` CSS lock instead of the Fullscreen API) so that native device full-screen modes do not interrupt the developer tools._

#### Page Transition Animation

Navigating between pages triggers a direction-aware slide animation:

- **Engine:** `motion` (Framer Motion) `AnimatePresence` with `mode="wait"`.
- **Direction logic:** The slide direction is computed from the delta between the current and previous spatial coordinates. E.g., navigating from `Now [0,0]` to `Link [1,0]` slides content **left** (new page enters from right).
- **Duration:** ~300ms.
- **Easing:** `ease-in-out`.
- The outgoing page exits in the opposite direction simultaneously.

#### Spatial Swiping Navigation

Users can navigate the spatial grid via touch-and-drag gestures originating on the outer border frame (avoiding the inner content container). Swipe gestures are only recognised when the initial touch point falls within a **60 px edge zone** from any side (left, right, top, or bottom) of the viewport; touches starting inside the content area are ignored. The system uses "natural scrolling" semantics — for example, touching the border and swiping down pulls the "Top" page into view.

- **8-Directional Navigation:** The gesture layout computes vectors across all 8 possible horizontal and vertical combinations (N, NE, E, SE, S, SW, W, NW). It utilizes a diagonal threshold parameter (tan 22.5° or a `0.414` ratio constraint) to distinguish corner swipes from strict cardinal directional pulls relying on total `[x,y]` deltas.
- **Visual Feedback Glow:** Dragging displays a glowing visual trace aligned perfectly with the inner container's border. This uses a dynamic `radial-gradient` that tracks the user's intent edge while hiding the background spill via a CSS `mask-composite: exclude` (or `xor`), keeping the gradient tightly bound to a specific pixel thickness without obstructing or underlaying standard layout code.
- **Contextual Spatial Arrows**: Surrounding directional arrows and localized page names are geometrically bound strictly to the exact perimeter dark rim calculated dynamically from the inset of the core `PreviewContainer`. This prevents any visual bleed into the center layout workspace. Flex structures dynamically stack horizontally/vertically mapping to logical boundaries (e.g. side edge labels rotate functionally leveraging `writing-mode: vertical-rl`), strictly conforming to the negative bounds to keep components visibly large but highly compliant to edge-margin restrictions.

#### 3D Minigame Navigator

To provide a highly interactive alternative way to traverse the spatial grid, Experimental Mode includes a 3D minigame **popup overlay**.

- **Trigger Button & Preloading (Two-State):** A gamepad icon button is placed on the **right side** of the outer frame at **75% (`3/4`) of the screen height**. Because the 3D libraries are large (~600KB+ gzipped), the button implements a two-state lifecycle to keep the initial site lightweight:
  1. **Idle state:** Dim/outlined icon. Clicking it triggers a dynamic `import()` that fetches all code-split chunks (Three.js, Rapier WASM, R3F, Drei, game components). The icon transitions to a loading spinner. The game does **not** open yet — this only preloads the module.
  2. **Ready state:** Solid, colored (blue) icon. The chunks are cached in memory for the session. Clicking now opens the game popup instantly with no loading delay.
  3. **Error state:** Red-tinted icon. Clicking retries the preload.
  - The preload state is stored in a module-scope variable (persists across page navigations within the session, resets on hard reload).
- **Popup Layout (~65% viewport):** The game opens as a centered popup (`65vw × 65vh`) with rounded corners, subtle shadow, and a semi-transparent dimmed backdrop (no blur) — the website remains visible around the popup. Clicking the backdrop closes the popup without navigating.
- **The 3D Scene:** The scene displays a flat structural "floor" in a plus/cross shape, separated into distinct zones perfectly mirroring the 2D spatial coordinate map (e.g., the center is `Now [0,0]`). Each zone is color-coded and bounded by invisible physics walls. The physics simulation uses **zero gravity** so the ball cannot fall off the floor.
- **Camera & Perspective:** The camera follows the ball with smooth interpolation (lerp), keeping the ball visually centered in the popup at all times. From the user's perspective, **the ball stays at the center while the floor scrolls beneath it**. This design scales to arbitrary numbers of zones — only the nearby zones need to be visible on screen at any time. The camera maintains a fixed isometric angle (looking down from Y=14, offset Z=10).
- **The Player Object:** A controllable 3D physics ball represents the user's current navigational intent. It spawns at the zone matching the current page. The ball uses a dynamic rigid body with **locked Y-axis translation** (prevented from vertical movement), **locked rotations**, and high linear damping for responsive stopping. A prominent 2D text box (HUD) is overlaid at the top of the popup, dynamically displaying the localized name of the zone the ball is currently occupying.
- **Zone Signage:** Each zone that the ball is _not_ currently residing in features a visible 3D floating text label indicating which page it represents, ensuring the map orientation is constantly clear.
- **Control Mechanism (Virtual Joystick):** A single 2D virtual joystick (HTML overlay at the bottom-center of the popup) acts as the sole controller. The joystick writes normalized input ([-1, 1]) directly to a mutable ref, avoiding React state re-renders during drag. This input is read every animation frame and applied as **force** (not impulse) to the ball. A **velocity cap** (MAX_SPEED = 7 units/sec, ~0.7s per zone crossing) prevents excessive speed. When the joystick is released, the ball's velocity is zeroed instantly — there is no residual rolling or momentum; the ball only moves under direct user input.
- **Navigation Execution:** Releasing (lifting the mouse/finger from) the joystick commits the action. After a ~150ms settlement delay, the system reads the ball's final zone; if it finishes in a new page's zone, the popup closes and the app triggers a spatial slide transition to the corresponding route.
- **Lazy Loading (Performance):** The 3D engine libraries (`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`) are heavy compared to a standard SPA payload. To protect the core site's initial load time, these libraries and the game-nav module are code-split by Vite and dynamically imported _only_ when the user clicks the trigger button for the first time. No backend is needed — the preload is purely a frontend chunk fetch.

### Navigation Toggle

The toggle is the bridge between the two modes and appears in both layouts with a consistent identity.

| Context               | Placement                                                      | Appearance                                                                                                                    |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Traditional Mode**  | Header, right region, next to the Language Switcher            | A labeled icon button (e.g., grid/compass icon + "Spatial" label). On mobile, the label is hidden and only the icon is shown. |
| **Experimental Mode** | Right side of the outer frame, vertically at 25% screen height | A small icon button (e.g., horizontal bars icon) with a tooltip "Switch to Traditional".                                      |

- **Keyboard shortcut:** `Ctrl+Shift+E` (Windows/Linux) / `Cmd+Shift+E` (macOS) toggles the mode from either layout.
- **Behavior:** Clicking the toggle writes the new mode to `localStorage`, then calls `window.location.reload()`. On mobile, switching **to** Experimental additionally requests the Fullscreen API.

### Mode Transition Behavior

When the user switches navigation modes:

1. **Route preservation:** The current URL path (e.g., `/history`) is preserved across the reload. The receiving mode maps the URL to its own layout context (Traditional renders it as a standard page; Experimental maps it to the corresponding spatial coordinate `[0,-1]`).
2. **Scroll state:** Destroyed by the hard reload. This is acceptable — both modes start at the top of their respective layouts.
3. **Transition screen:** A brief branded splash/loading screen is shown during the reload to mask the white flash. This is implemented as an inline `<style>` + `<div>` in `index.html` (outside React) that is removed by the app's `useEffect` on mount.
4. **Query cache:** TanStack Query's in-memory cache is destroyed by the reload. Previously fetched data will be re-fetched on the next page load subject to `staleTime` rules.

### Dark Mode

| Aspect           | Detail                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence      | `localStorage` via `usehooks-ts` `useLocalStorage('darkMode', <systemDefault>)`                                                                           |
| Mechanism        | Toggles the `dark` class on `<html>`; Tailwind CSS v4 is configured with `@custom-variant dark (&:where(.dark, .dark *))` to enable class-based dark mode |
| Default          | System preference (`prefers-color-scheme: dark`), then persisted user choice                                                                              |
| Toggle Placement | **Traditional:** Header actions bar (sun/moon icon) · **Experimental:** Left frame edge at 3/4 height, below Language Switcher (sun/moon icon via lucide) |
| Hook             | `useDarkMode()` — returns `{ isDark, toggleDark }`                                                                                                        |

- The `useDarkMode` hook is initialized in `App.tsx` to ensure the dark class is always synced on mount, regardless of navigation mode.
- All components use Tailwind `dark:` utility classes for dark-aware styling (e.g., `bg-white dark:bg-gray-950`).
- The Experimental mode frame, arrow navigation labels, language switcher, and dark mode toggle all respond to the active theme.

---

## Content Strategy

The application uses a **hybrid content system** to separate short UI strings from long-form page content:

### Layer 1: JSON (UI Strings)

Short, structural text (button labels, nav items, error messages, page titles, link labels) lives in the existing `react-i18next` JSON locale files at `frontend/src/i18n/locales/{en,fi,zh,ar}.json`. These are loaded synchronously by `i18next`.

### Layer 2: Markdown (Long-form Page Content)

Rich multi-paragraph text (e.g., the "Me" page biography) is authored as Markdown files inside `frontend/src/content/<lang>/<page>.md`. A custom `useMarkdownContent(page)` hook dynamically imports the correct file based on the active `i18n.language`, falling back to `en` if a translation is missing. Files are rendered via `react-markdown`.

### Layer 3: YAML (Structured Data)

Structured repeatable data (e.g., the social/external links list on the "Link" page) is stored in YAML files inside `frontend/src/content/`. The Vite build processes YAML natively via `@rollup/plugin-yaml`. Link display labels are resolved from the JSON locale files (`link.items.<id>`), keeping URL data and presentation text cleanly separated.

### Content Directory Structure

```text
frontend/src/content/
├── en/
│   └── me.md             # English Me page content
├── fi/
│   └── me.md             # Finnish Me page content
├── zh/
│   └── me.md             # Chinese Me page content
├── ar/
│   └── me.md             # Arabic Me page content
└── links.yaml            # Social/external links data (language-independent)
```

### Page Content Status

| Page           | Content Source        | Status      |
| -------------- | --------------------- | ----------- |
| **Now**        | JSON (i18n)           | Implemented |
| **Me**         | Markdown + JSON title | Implemented |
| **Link**       | YAML + JSON labels    | Implemented |
| **My History** | JSON (placeholder)    | Planned     |
| **My Future**  | JSON (placeholder)    | Planned     |

---

## Tech Stack

### Frontend

| Technology                       | Version | Purpose                                                                                                  |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| React                            | 19.x    | UI library for building component-based interfaces                                                       |
| TypeScript                       | 5.x     | Static typing for JavaScript                                                                             |
| Vite                             | 7.x     | Fast build tool and dev server                                                                           |
| Tailwind CSS                     | 4.x     | Utility-first CSS framework                                                                              |
| TanStack Query (React Query)     | 5.x     | Server state management and data fetching                                                                |
| Auth0 React SDK                  | 2.x     | Identity and authentication frontend management                                                          |
| i18next                          | 24.x    | Internationalization framework                                                                           |
| react-i18next                    | 15.x    | React bindings for i18next                                                                               |
| i18next-browser-languagedetector | 8.x     | Auto-detect user language                                                                                |
| i18next-parser                   | 9.x     | Auto-extract translation keys                                                                            |
| motion (Framer Motion)           | 12.x    | Direction-aware page transition animations                                                               |
| usehooks-ts                      | 3.x     | Type-safe React hooks (`useLocalStorage`, `useMediaQuery`) for mode persistence and responsive detection |
| react-markdown                   | 9.x     | Render Markdown content as React components for long-form page text                                      |
| @rollup/plugin-yaml              | 4.x     | Vite/Rollup plugin to import YAML files as JavaScript objects                                            |
| react-icons                      | 5.x     | Brand/platform SVG icons (Simple Icons for YouTube/GitHub/etc., FontAwesome for LinkedIn)                |
| lucide-react                     | 0.x     | Utility SVG icons (Globe, Mail) used in spatial language switcher and link page                          |
| three                            | 0.16x.x | Core WebGL 3D rendering engine for minigame nav                                                          |
| @react-three/fiber               | 8.x     | React renderer for Three.js (3D Minigame canvas)                                                         |
| @react-three/drei                | 9.x     | Abstracted helpers/components for React Three Fiber                                                      |
| @react-three/rapier              | 1.x     | WASM-based physics engine (Rapier) integration for React Three Fiber                                     |

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
│   ├── public/               # Static assets served as-is
│   │   ├── logo-website.png  # Favicon & branding logo
│   │   ├── robots.txt        # Search engine crawler rules
│   │   └── sitemap.xml       # Sitemap for search engines
│   ├── src/                  # Source code (components, hooks, i18n, pages)
│   │   ├── content/          # Long-form content (Markdown & YAML)
│   │   │   ├── en/           # English markdown content
│   │   │   ├── fi/           # Finnish markdown content
│   │   │   ├── zh/           # Chinese markdown content
│   │   │   ├── ar/           # Arabic markdown content
│   │   │   └── links.yaml    # Structured link data
│   │   ├── game-nav/         # 3D Minigame Navigator (lazy-loaded, self-contained)
│   │   │   ├── GameNavOverlay.tsx  # Popup overlay with Canvas + Physics
│   │   │   ├── Floor.tsx           # 3D zoned floor (cross shape)
│   │   │   ├── PlayerBall.tsx      # Physics rigid-body ball
│   │   │   ├── CameraRig.tsx       # Camera that follows ball position
│   │   │   ├── ZoneSignage.tsx     # Floating 3D text labels per zone
│   │   │   ├── HUD.tsx             # 2D HTML overlay (current zone name)
│   │   │   ├── VirtualJoystick.tsx # Draggable 2D joystick controller
│   │   │   ├── constants.ts        # Shared physics/layout constants
│   │   │   ├── useGameNavPreload.ts # Two-state preload lifecycle hook
│   │   │   └── index.ts           # Barrel export
│   │   ├── hooks/            # Custom React hooks
│   │   └── i18n/locales/     # JSON translation files (UI strings)
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite config (includes YAML plugin)
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

| Method | Endpoint          | Description                                                                                                                               |
| ------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`     | Server health status                                                                                                                      |
| POST   | `/api/users/sync` | Sync Auth0 user to MongoDB                                                                                                                |
| GET    | `/api/users`      | Get all users (Protected)                                                                                                                 |
| GET    | `/api/users/:id`  | Get user by ID (Protected)                                                                                                                |
| PUT    | `/api/users/:id`  | Update user (Protected). Also used to persist the user's `navMode` preference (`"traditional"` \| `"experimental"`) in the user document. |
| DELETE | `/api/users/:id`  | Delete user (Protected)                                                                                                                   |

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

| Requirement          | Description                                   | Status      |
| -------------------- | --------------------------------------------- | ----------- |
| User Authentication  | Auth0 Integration (Email/Pwd, Social, Magic)  | Planned     |
| User Management      | CRUD operations for users via Azure Functions | Planned     |
| Responsive Design    | Mobile-first approach with dual navigation    | Implemented |
| Dual Navigation      | Traditional + Experimental spatial canvas     | Implemented |
| SEO Optimization     | Meta tags, sitemap                            | Planned     |
| Internationalization | Multi-language support (en/fi/zh/ar)          | Implemented |
| RTL Support          | Arabic right-to-left layout                   | Implemented |

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

## SEO & Metadata

The application includes foundational SEO configuration in `frontend/index.html`:

| Tag / File         | Value / Purpose                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| `<title>`          | "Kipnuni - Helper of Humanity"                                                  |
| `meta description` | Personal portal and philosophy of Artur Haavisto (Kipnuni)                      |
| `meta theme-color` | `#111827` (matches dark splash screen)                                          |
| `link canonical`   | `https://www.kipnuni.com/`                                                      |
| `og:*` tags        | Title, description, image, type=website, site_name, locale                      |
| `twitter:*` tags   | Summary card with title, description, image                                     |
| `apple-touch-icon` | `/logo-website.png`                                                             |
| `robots.txt`       | Allows all crawlers; references `sitemap.xml`                                   |
| `sitemap.xml`      | Lists all 5 routes (`/`, `/me`, `/link`, `/history`, `/future`) with priorities |
| `<noscript>`       | Fallback message for users without JavaScript                                   |

---

## Deployment

### Hosting

Azure Static Web Apps with the following CI/CD configuration:

| Setting           | Value      |
| ----------------- | ---------- |
| `app_location`    | `frontend` |
| `output_location` | `dist`     |
| `api_location`    | `api`      |

### `staticwebapp.config.json`

- **SPA Fallback:** All routes rewrite to `/index.html` (except static assets and `robots.txt`).
- **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### Production Checklist (Current Release)

- [x] Frontend builds cleanly (`tsc -b && vite build`)
- [x] SPA navigation fallback configured in `staticwebapp.config.json`
- [x] SEO meta tags, Open Graph, and Twitter cards in `index.html`
- [x] `robots.txt` and `sitemap.xml` in `public/`
- [x] Favicon and apple-touch-icon set to `logo-website.png`
- [x] Security headers configured
- [x] All social link URLs populated in `links.yaml`
- [x] i18n translations present for all 4 languages (en, fi, zh, ar)

### Future Release Checklist

- [ ] Configure CI/CD YAML to map SWA bindings
- [ ] Update `.env` variables for Auth0 client IDs
- [ ] Configure production MongoDB Atlas Cluster Data API
- [ ] Configure Auth0 callbacks (`/callback`, `/logout`) for production domain
- [ ] Secure API paths in `staticwebapp.config.json` via roles
- [ ] Map custom domain and SSL in Azure SWA
