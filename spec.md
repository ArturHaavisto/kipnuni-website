# Kipnuni Website - Technical Specification

## Project Overview

A modern full-stack web application built with industry-standard technologies and best practices.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI library for building component-based interfaces |
| TypeScript | 5.x | Static typing for JavaScript |
| Vite | 7.x | Fast build tool and dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| PostCSS | 8.x | CSS processing with autoprefixer |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | JavaScript runtime |
| Express | 5.x | Web framework for API |
| TypeScript | 5.x | Static typing |
| Mongoose | 9.x | MongoDB ODM |
| express-validator | 7.x | Request validation |
| Helmet | 8.x | Security headers |
| Morgan | 1.x | HTTP request logging |
| CORS | 2.x | Cross-origin resource sharing |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 7.x | NoSQL document database |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | Unit/integration test runner |
| React Testing Library | React component testing |
| Supertest | HTTP API testing |
| mongodb-memory-server | In-memory MongoDB for tests |
| Cypress | End-to-end testing |

### DevOps & Tooling
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| docker-compose | Multi-container orchestration |
| GitHub Actions | CI/CD pipeline |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Pre-commit linting |

---

## Project Structure

```
kipnuni-website/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (to be added)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── test/            # Test setup and mocks
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles with Tailwind
│   ├── jest.config.ts       # Jest configuration
│   ├── tsconfig.json        # TypeScript config
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── eslint.config.js     # ESLint configuration
│   └── package.json
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── config/          # Configuration management
│   │   ├── controllers/     # Route handlers
│   │   ├── db/              # Database connection
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── test/            # Test files
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── jest.config.ts       # Jest configuration
│   ├── tsconfig.json        # TypeScript config
│   ├── eslint.config.js     # ESLint configuration
│   └── package.json
│
├── e2e/                      # End-to-end tests
│   ├── cypress/
│   │   ├── e2e/             # Test specs
│   │   └── support/         # Cypress support files
│   ├── cypress.config.ts    # Cypress configuration
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
│
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
├── .gitignore               # Git ignore rules
└── spec.md                  # This file
```

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (optional, for containerized development)
- MongoDB (local or Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kipnuni-website
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   ```

4. **Install E2E test dependencies**
   ```bash
   cd ../e2e
   npm install
   ```

### Running the Application

#### Option 1: Using Docker (Recommended)

```bash
# Start MongoDB for development
docker compose -f docker-compose.dev.yml up -d

# Start frontend (in frontend folder)
npm run dev

# Start backend (in backend folder)
npm run dev
```

#### Option 2: Full Docker stack

```bash
docker compose up --build
```

### Running Tests

```bash
# Frontend unit tests
cd frontend && npm test

# Backend unit tests
cd backend && npm test

# E2E tests (requires frontend and backend running)
cd e2e && npm run cypress:open   # Interactive mode
cd e2e && npm test               # Headless mode
```

---

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

---

## Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kipnuni
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## Manual Setup Instructions

The following items require manual setup as they cannot be automated:

### 1. VS Code Extensions

Install the following VS Code extensions for the best development experience:

| Extension ID | Name | Purpose |
|--------------|------|---------|
| `dbaeumer.vscode-eslint` | ESLint | JavaScript/TypeScript linting |
| `esbenp.prettier-vscode` | Prettier | Code formatting |
| `bradlc.vscode-tailwindcss` | Tailwind CSS IntelliSense | CSS class autocomplete |
| `ms-vscode.vscode-typescript-next` | TypeScript Nightly | Latest TypeScript features |
| `mongodb.mongodb-vscode` | MongoDB for VS Code | Database management |
| `Orta.vscode-jest` | Jest | Test runner integration |
| `ms-azuretools.vscode-docker` | Docker | Container management |

**Installation command (run in VS Code terminal):**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension mongodb.mongodb-vscode
code --install-extension Orta.vscode-jest
code --install-extension ms-azuretools.vscode-docker
```

### 2. VS Code Settings

Create `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"]([^'\"]*)['\"]", "([^'\"]+)"]
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### 3. Git Hooks Setup (Husky)

After installing dependencies, initialize Husky:

```bash
cd frontend
npx husky install
npx husky add .husky/pre-commit "cd frontend && npx lint-staged"
```

Create `frontend/.lintstagedrc.json`:
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

### 4. MongoDB Setup

**Option A: Local Installation**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Verify connection: `mongosh --eval "db.adminCommand('ping')"`

**Option B: Docker (Recommended)**
```bash
docker compose -f docker-compose.dev.yml up -d mongo
```

**Option C: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. First-time Project Setup

```bash
# 1. Copy environment file
cd backend
cp .env.example .env

# 2. Edit .env with your settings
# Update MONGODB_URI if using Atlas

# 3. Start development servers
# Terminal 1 - MongoDB (if using Docker)
docker compose -f docker-compose.dev.yml up -d

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - Frontend
cd frontend && npm run dev

# 4. Verify setup
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001/api/health
```

---

## Website Specifications Template

### Business Requirements

| Requirement | Description | Status |
|-------------|-------------|--------|
| User Authentication | Login/Register functionality | Planned |
| User Management | CRUD operations for users | Implemented |
| Responsive Design | Mobile-first approach | Implemented |
| SEO Optimization | Meta tags, sitemap | Planned |

### Pages

| Page | Route | Description | Status |
|------|-------|-------------|--------|
| Home | `/` | Landing page with hero section | Implemented |
| About | `/about` | Company information | Planned |
| Contact | `/contact` | Contact form | Planned |

### Features Roadmap

- [ ] User authentication (JWT)
- [ ] Protected routes
- [ ] Dark mode toggle
- [ ] Multi-language support (i18n)
- [ ] Form validation with react-hook-form
- [ ] State management (Zustand or Redux Toolkit)
- [ ] API caching (TanStack Query)
- [ ] Error boundary and error pages
- [ ] SEO meta tags
- [ ] PWA support

---

## Deployment

### Production Checklist

- [ ] Update environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure CDN for static assets

### Deployment Options

1. **Docker** - Use `docker-compose.yml` for full-stack deployment
2. **Vercel** - Frontend (configure Vite for production)
3. **Railway/Render** - Backend API with managed MongoDB
4. **AWS/GCP/Azure** - Full infrastructure control

---

## Contributing

1. Create feature branch from `develop`
2. Write tests for new features
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Submit PR to `develop`

---

## License

ISC
