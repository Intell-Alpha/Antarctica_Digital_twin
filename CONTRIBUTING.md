# Contributing to Antarctica Digital Twin

Thank you for contributing to the Antarctica Digital Twin project. This document provides guidelines for branch naming, commit conventions, pull request workflows, local development setup, CI checks, and code style.

---

## 1. Branch Naming

All branches must be created from the latest `main` branch:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-desc>
```

Use the following branch prefixes depending on the nature of your work:

- `feat/<short-desc>` — new features (e.g., `feat/mobile-sidebar`)
- `fix/<short-desc>` — bug fixes (e.g., `fix/telemetry-overflow`)
- `chore/<short-desc>` — tooling, dependencies, and cleanup (e.g., `chore/update-readme`)
- `docs/<short-desc>` — documentation changes (e.g., `docs/contributing-guidelines`)
- `refactor/<short-desc>` — code restructuring without behavioral changes (e.g., `refactor/station-nav`)

Keep `<short-desc>` brief, hyphen-separated, and descriptive.

---

## 2. Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Supported Types

- `feat:` — Introduces a new feature
- `fix:` — Patches a bug
- `chore:` — Changes to build tasks, package managers, configs, or maintenance
- `docs:` — Documentation additions or edits
- `refactor:` — Code restructuring that neither fixes a bug nor adds a feature
- `test:` — Adding or correcting tests
- `style:` — Code style and formatting adjustments (white-space, formatting, etc.)

### Format

```text
<type>: <subject>
```

- **Subject line:** Write in lowercase, imperative mood ("add", not "added" or "adds"), without a trailing period, and no longer than 72 characters.

### Example

```text
feat: add mobile drawer to dashboard sidebar
```

---

## 3. Pull Request Workflow

1. **Branch from `main`**: Ensure your feature or fix branch is branched off the latest `main`.
2. **Open PR against `main`**: All pull requests must target the `main` branch.
3. **Complete the PR Template**: Use the repository's pull request template ([`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)). Preserve all required sections and fill out the checklist completely:
   - `## 📌 Description`
   - `## 🔗 Related Issue` (include `Closes #<issue_number>` or `Fixes #<issue_number>`)
   - `## 🎯 Type of Change`
   - `## 🧪 How Has This Been Tested?` (including environment details and numbered test steps)
   - `## 📷 Screenshots / Demos (If Applicable)`
   - `## ✅ Checklist`
4. **Review & Approval**: One review approval is expected before merging. For solo development or assigned solo contributions as specified by the issue, self-review is appropriate.
5. **Merge Strategy**: Squash merging (`Squash and merge`) is preferred to maintain a clean linear commit history on `main`.

---

## 4. Local Setup

Refer to the [Getting Started guide in README.md](README.md#getting-started) for general information. Below are the verified setup commands for this repository.

### Prerequisites

- **Node.js**: Requires Node `>=20.0.0 <21.0.0` (as defined in `package.json` engines and `.nvmrc`).
  ```bash
  nvm use
  ```

### Frontend Setup (Root)

1. **Install dependencies**:
   ```bash
   npm ci
   # or npm install
   ```
2. **Configure environment variables**:
   Copy `.env.example` to create your local environment file:
   ```bash
   cp .env.example .env.local
   ```
   Default variable in `.env.example`:
   - `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
3. **Start frontend development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Setup (`backend/`)

The simulation backend is an Express and TypeScript service. Detailed documentation is available in [`backend/README.md`](backend/README.md).

1. **Install backend dependencies**:
   ```bash
   npm --prefix backend install
   ```
2. **Configure environment variables**:
   Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. **Start backend development server**:
   From the repository root:
   ```bash
   npm run backend:dev
   ```
   Or from the `backend/` directory:
   ```bash
   cd backend
   npm run dev
   ```
   The backend service runs on port `5000` (`http://localhost:5000`).

---

## 5. CI Checks & Verification

Frontend pull requests and pushes to `main` trigger the GitHub Actions workflow defined in [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml).

### Workflow Steps

The CI workflow executes the following commands:

1. **Install Dependencies**: `npm ci`
2. **Run Linter**: `npm run lint`
3. **Run Tests**: `npm test --if-present || echo "No test runner configured yet. Skipping."`
4. **Build Next.js Application**: `npm run build` (with `NEXT_TELEMETRY_DISABLED=1`)

### Important Workflow Limitations

- **Path Filters (Markdown-only PRs do not trigger CI)**: The workflow is configured with path filters (`src/**`, `public/**`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `.github/workflows/frontend-ci.yml`). Pull requests containing only Markdown changes (such as `CONTRIBUTING.md` or `README.md`) will **not** trigger the CI workflow.
- **Lint Non-blocking (`continue-on-error: true`)**: The linter step in `frontend-ci.yml` is configured with `continue-on-error: true`. Lint warnings or errors will be logged in CI output but will not currently fail the build. Contributors are nonetheless required to ensure clean linting locally.
- **Test Runner**: Currently, no automated test runner (such as Jest or Vitest) is configured in `package.json`. Running `npm test --if-present` skips tests without error.
- **Backend CI**: There is currently no automated CI workflow configured for the `backend/` directory.

Before submitting a PR that modifies application code, verify your changes locally:
```bash
npm run lint
npm run build
```

---

## 6. Code Style & TypeScript

- **ESLint**: Configured via [`eslint.config.mjs`](eslint.config.mjs) (ESLint 9 Flat Config) extending Next.js Core Web Vitals and TypeScript configurations (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`). Run `npm run lint` to verify adherence.
- **TypeScript Strict Mode**: Strict mode (`"strict": true`) is enforced in both:
  - Root frontend: [`tsconfig.json`](tsconfig.json)
  - Simulation backend: [`backend/tsconfig.json`](backend/tsconfig.json)
  All new code and type declarations must compile without errors under strict checking.
