# Kipnuni Website - Technical Specification

## Project Overview

A modern full-stack web application built with industry-standard technologies and best practices, targeting a cloud-native architecture on Microsoft Azure.

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
└── spec-new.md               # This file
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

### 5. Frontend State & Data Fetching

**TanStack Query** (React Query) manages server state.

- **Cost Protection**: To prevent aggressive polling from generating massive Azure Functions per-execution costs, default QueryClient settings are strictly tuned: `refetchOnWindowFocus: false`, `retry: 1`, and `staleTime: 60000` (1 minute). This ensures the SPA relies on cache rather than spamming backend REST APIs.

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
| PUT    | `/api/users/:id`  | Update user (Protected)    |
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
| Responsive Design    | Mobile-first approach                         | Planned |
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
  "nav": { "home": "...", "about": "...", ... },
  "header": { "toggleTheme": "...", "selectLanguage": "..." },
  "home": { "welcome": "...", "subtitle": "...", ... },
  "counter": { "count": "Count: {{count}}", ... },
  "about": { ... },
  "contact": { ... },
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
