# ProjectFlow — Frontend

A React single-page application for the ProjectFlow Project Management System — a Jira/Linear-style workspace for managing projects, tasks, teams, and a lightweight analytics dashboard. This app is the client for the FastAPI backend documented in [`../Backend/README.md`](../Backend/README.md).

> This document describes the **actual, current state of the code** — including a few components that exist in the repo but are not currently wired up (called out explicitly in the relevant sections) — so nothing here should surprise you when you open the source.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Setup](#environment-setup)
7. [Available Scripts](#available-scripts)
8. [Routing Structure](#routing-structure)
9. [State Management](#state-management)
10. [API Integration Flow](#api-integration-flow)
11. [Authentication Flow](#authentication-flow)
12. [PBAC Integration](#pbac-integration)
13. [Feature Modules](#feature-modules)
    - [Dashboard](#dashboard)
    - [Projects](#projects)
    - [Tasks](#tasks)
    - [Search](#search)
    - [Analytics](#analytics)
    - [Notifications](#notifications)
14. [Build & Deployment](#build--deployment)
15. [Troubleshooting](#troubleshooting)
16. [Future Improvements](#future-improvements)

---

## Project Overview

ProjectFlow's frontend is a React 19 + Vite single-page application that lets an authenticated user:

- Sign up / log in and manage their profile and password.
- Create and manage **projects**, each with a category, priority, type, status, and planned/actual dates.
- Add and remove **project members** from a workspace-wide user list.
- Create, assign, edit, and track **tasks** in either a Kanban board or a searchable/filterable table.
- View a **dashboard** with pending tasks, a project task-distribution donut chart, and time-based completion analytics.
- Run a global **search** across projects and tasks.
- Have UI actions (edit/delete project, edit/delete/update task) gated by a lightweight, client-side **Policy-Based Access Control (PBAC)** layer that mirrors the rules enforced server-side.

The app talks to the backend exclusively over a single REST API base URL (`VITE_API_URL`) using `axios`, with a JWT bearer token attached to every request.

---

## Features

- Email/password authentication with JWT stored client-side, plus a 3-step forgot-password flow (email → 6-digit code → new password).
- Real-time password-strength checklist on signup and password change (8+ chars, upper/lowercase, digit, special character).
- Project CRUD with category/priority/type/status pickers backed by backend "list of values" (LOV) data.
- Project membership management (add existing users, remove members — owner only).
- Task CRUD with assignee, priority, status, task type, and due date.
- Kanban board view (3 columns: To Do / In Progress / Done) with inline status changes.
- Sortable/filterable/paginated task table view.
- Dashboard with pending-tasks list, task-distribution donut chart, and a 7/30/90-day completion analytics panel.
- Debounced global search across projects and tasks.
- Client-side PBAC (`authorize()`) that disables/hides buttons the current user isn't allowed to use, in addition to the backend's own 403 responses being surfaced as dedicated "Access Denied" pages.

---

## Tech Stack

| Category | Technology | Notes |
| --- | --- | --- |
| UI library | **React 19** | Function components + hooks only, no class components |
| Build tool / dev server | **Vite 8** (`@vitejs/plugin-react`) | HMR dev server, ESM (`"type": "module"`) |
| Routing | **React Router v7** (`react-router-dom`) | `BrowserRouter`, nested `Routes` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite` plugin) | No `tailwind.config.js`/`postcss.config.js` needed — theme lives in `src/index.css` |
| Component design system | **shadcn/ui** (`components.json`, style `new-york`) | Plain JS/JSX, not TypeScript (`tsx: false`) |
| Headless primitives | `@radix-ui/react-label`, `@radix-ui/react-slot` | Used by a subset of `components/ui/*` |
| HTTP client | **axios** | One shared instance in `src/services/api.js` |
| Icons | **lucide-react** | |
| Utility helpers | `clsx`, `tailwind-merge`, `class-variance-authority` | Power the `cn()` helper and shadcn variant styling |
| Linting | **oxlint** | `npm run lint`, config in `.oxlintrc.json` |

**Notable absences** (so you don't go looking for them): no Redux/Zustand/Jotai, no chart library (all charts are hand-rolled inline SVG), no form library (React Hook Form/Formik/Zod), no date-picker library, and no test runner/framework is configured for the frontend.

---

## Folder Structure

```
Frontend/
├── index.html                     # Vite HTML entry point
├── vite.config.js                 # Vite + Tailwind plugin + "@" path alias -> ./src
├── jsconfig.json                  # Mirrors the "@" alias for editor IntelliSense
├── components.json                # shadcn/ui generator config
├── .oxlintrc.json                 # Linter rules (react hooks rules, etc.)
├── vercel.json                    # SPA rewrite rule for Vercel static hosting
├── nginx.conf                     # SPA rewrite rule for the Docker/Nginx image
├── Dockerfile                     # Multi-stage build: Node -> static Nginx image
├── .env.example                   # Documented frontend environment variables
├── public/                        # Static files served as-is (favicon, icons)
└── src/
    ├── main.jsx                   # ReactDOM root, mounts <App/>
    ├── App.jsx                    # Route table, ProjectProvider, ProtectedRoute guard
    ├── App.css / index.css        # Tailwind import + design tokens (OKLCH theme)
    │
    ├── context/
    │   └── ProjectContext.jsx     # Auth state, projects state, PBAC authorize() — see "State Management"
    │
    ├── services/
    │   └── api.js                 # Configured axios instance (baseURL, auth header, 401 handling)
    │
    ├── lib/
    │   └── utils.js                # cn() classname merge helper
    │
    ├── components/
    │   ├── Navbar.jsx              # Top nav bar (public + authenticated), hosts GlobalSearch
    │   ├── ScrollToTop.jsx         # Resets scroll position on route change
    │   │
    │   ├── layout/
    │   │   ├── AppLayout.jsx       # Authenticated shell: Navbar + <main> (no sidebar — see note below)
    │   │   ├── Sidebar.jsx         # Built but currently unused/not rendered anywhere
    │   │   └── NotificationDropdown.jsx  # Built but currently unused — mock data only, no API
    │   │
    │   ├── common/
    │   │   ├── PermissionButton.jsx # PBAC-aware <Button> wrapper (see "PBAC Integration")
    │   │   ├── GlobalSearch.jsx     # Debounced global search box (see "Search")
    │   │   ├── StatusBadge.jsx      # Status pill (Todo / In Progress / Done)
    │   │   ├── PriorityBadge.jsx    # Priority pill (Low / Medium / High)
    │   │   └── EmptyState.jsx       # Reusable "nothing here yet" placeholder
    │   │
    │   ├── dashboard/
    │   │   ├── PendingTasksList.jsx      # Used — pending tasks widget on the Dashboard
    │   │   ├── ProjectTaskPieChart.jsx   # Used — task distribution donut (SVG)
    │   │   ├── TimebasedAnalytics.jsx    # Used — 7/30/90-day completion analytics
    │   │   ├── RecentTasksList.jsx       # Used — recently created/updated tasks feed
    │   │   ├── ProjectCard.jsx           # Used on the Projects grid page
    │   │   ├── StatsCard.jsx             # Built but currently unused
    │   │   ├── TaskCard.jsx              # Built but currently unused
    │   │   ├── ProductivityInsights.jsx  # Built but currently unused — hardcoded sample data
    │   │   └── MonthDetailsView.jsx      # Built but currently unused — hardcoded sample data
    │   │
    │   ├── charts/
    │   │   ├── StatusPieChart.jsx        # Built but currently unused (standalone SVG donut)
    │   │   └── TaskProgressBarChart.jsx  # Built but currently unused (standalone SVG bars)
    │   │
    │   ├── auth/
    │   │   └── ForgotPasswordModal.jsx   # 3-step forgot-password flow (see "Authentication Flow")
    │   │
    │   ├── project/
    │   │   ├── ProjectHeader.jsx     # Project title/meta bar + edit/delete/add-task actions
    │   │   ├── ProjectOverview.jsx   # Overview tab: status/priority donut + team card
    │   │   ├── BoardView.jsx         # Kanban board tab
    │   │   ├── TaskTable.jsx         # Tasks tab: searchable/filterable/paginated table
    │   │   ├── ProjectForm.jsx       # Shared create/edit project form (used by both modals & pages)
    │   │   ├── TaskForm.jsx          # Shared create/edit task form
    │   │   ├── CreateProjectModal.jsx / EditProjectModal.jsx
    │   │   ├── CreateTaskModal.jsx / EditTaskModal.jsx
    │   │   └── AddMemberModal.jsx    # Manage project members (add/remove)
    │   │
    │   └── ui/                      # shadcn/ui primitives (button, card, input, table, tabs, ...)
    │       ├── custom-select.jsx     # Hand-built dropdown (not a Radix Select)
    │       ├── custom-date-picker.jsx# Hand-built date picker (wraps a native <input type="date">)
    │       └── alert-dialog.jsx      # Hand-built confirm dialog
    │
    └── pages/
        ├── Home.jsx                # Public marketing/landing page
        ├── Login.jsx                # Login form
        ├── Signup.jsx                # Registration form w/ live password checklist
        ├── Dashboard.jsx             # Authenticated home — see "Dashboard"
        ├── Projects.jsx              # Project grid with search/status/category filters
        ├── CreateProject.jsx         # Full-page project creation form
        ├── ProjectDetails.jsx        # Overview / Board / Tasks tabs for one project
        ├── TaskDetails.jsx           # Single task detail page
        ├── Profile.jsx               # View/edit the logged-in user's profile
        └── Settings.jsx              # Update profile fields and/or password
```

> **Note on `AppLayout`**: despite `Sidebar.jsx` existing in the codebase, the authenticated shell (`AppLayout.jsx`) currently renders **only the top `Navbar` and page content** — there is no left-hand sidebar in the running app. See [Future Improvements](#future-improvements).

---

## Installation

### Prerequisites

- **Node.js** 18+ (Vite 8 requires a current Node LTS)
- **npm** 9+
- A running instance of the [backend API](../Backend/README.md) (or a deployed URL to point at)

### Steps

```bash
# 1. Move into the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Copy the example environment file and fill in your values
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default (Vite's default port) and expects the backend to be reachable at whatever `VITE_API_URL` points to.

---

## Environment Setup

All frontend configuration is done through Vite environment variables, which **must** be prefixed with `VITE_` to be exposed to client code (`import.meta.env.VITE_*`). See [`.env.example`](./.env.example):

| Variable | Required | Default (if unset) | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | No (has a fallback) | `http://localhost:8000` | Base URL of the backend API. Every axios request in `src/services/api.js` is made relative to this. |

**Important:** Vite bakes `VITE_*` variables into the JS bundle **at build time**. If you deploy a static build (Vercel, Docker/Nginx), you must set `VITE_API_URL` correctly *before* running `npm run build` — changing it after the build requires a rebuild, since there is no runtime environment injection in this app.

---

## Available Scripts

Defined in `package.json`:

| Script | Command | Purpose |
| --- | --- | --- |
| `npm run dev` | `vite` | Start the local dev server with HMR |
| `npm run build` | `vite build` | Produce an optimized production build in `dist/` |
| `npm run preview` | `vite preview` | Serve the production build locally for a final check |
| `npm run lint` | `oxlint` | Lint the codebase (React hooks rules, etc.) |

There is currently no `test` script configured.

---

## Routing Structure

Routing is defined in `src/App.jsx` using `react-router-dom` v7. The whole tree is wrapped in `<ProjectProvider>` (global state) → `<BrowserRouter>` → `<ScrollToTop/>`.

| Path | Access | Component | Notes |
| --- | --- | --- | --- |
| `/` | Public | `Home` | Landing page |
| `/login` | Public | `Login` | |
| `/signup` | Public | `Signup` | |
| `/dashboard` | Protected | `Dashboard` | |
| `/projects` | Protected | `Projects` | |
| `/create-project` | Protected | `CreateProject` | |
| `/projects/create` | Protected | `CreateProject` | Duplicate route to the same page (both paths work) |
| `/projects/:projectId` | Protected | `ProjectDetails` | Defaults to the "overview" tab |
| `/projects/:projectId/:tab` | Protected | `ProjectDetails` | `:tab` is one of `overview`, `board`, `tasks` |
| `/tasks/:taskId` | Protected | `TaskDetails` | |
| `/profile` | Protected | `Profile` | |
| `/settings` | Protected | `Settings` | |

Protected routes are gated by a local `ProtectedRoute` component:

```jsx
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("pf_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

This only checks that a token **exists** in `localStorage` — it does not verify the token's validity or expiry client-side (an expired/invalid token is instead caught the first time an API call returns `401`, see [Authentication Flow](#authentication-flow)). There is currently no catch-all/404 route.

Protected pages are wrapped in `AppLayout` (Navbar + page content); public pages are wrapped directly in `Navbar`.

---

## State Management

There is no Redux/Zustand/MobX. Global state is handled by a single React Context: **`ProjectContext`** (`src/context/ProjectContext.jsx`), consumed everywhere via the `useProject()` hook.

**What it holds and exposes:**

| Value | Description |
| --- | --- |
| `user` / `setUser` | The logged-in user object, hydrated from and persisted to `localStorage["pf_user"]` |
| `loginUser(userData)` | Normalizes the login/register response into `{id, fullName, email, username, token}`, stores the token, and clears any stale cached project list so a fresh workspace is fetched |
| `logoutUser()` | Calls `POST /auth/logout` (best-effort) then always clears `pf_token`, `pf_user`, `pf_projects` |
| `projects` / `setProjects` | The current list of projects, hydrated from and persisted to `localStorage["pf_projects"]` |
| `fetchProjects()` | `GET /projects`, then normalizes snake_case API fields into the camelCase shape used by the UI |
| `addProject(projectData)` | Optimistically prepends a project to local state (actual creation still goes through the API; callers typically call `fetchProjects()` afterwards for canonical data) |
| `clearProjects()` | Resets the projects list to empty |
| `authorize(user, action, resource, resourceData)` | The client-side PBAC evaluator — see [PBAC Integration](#pbac-integration) |

`user` and `projects` are automatically re-synced to `localStorage` via `useEffect` on every change, and projects are automatically re-fetched whenever `user` changes (as long as a token is present). This gives the app basic persistence across page reloads without a dedicated state library.

Beyond this context, individual pages/components use local `useState`/`useEffect` for their own view-local state (form fields, filters, pagination, modal open/close, etc.).

---

## API Integration Flow

All HTTP calls go through a single pre-configured axios instance in `src/services/api.js`:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401 (outside of auth endpoints), force a logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // clears pf_token / pf_user / pf_projects and redirects to /login
    }
    return Promise.reject(error);
  }
);
```

**Key points:**

- There is **no separate API service module per domain** (no `authApi.js`, `projectsApi.js`, etc.) — pages and components call `api.get/post/delete` directly with literal endpoint strings.
- There is **no refresh-token flow**. A `401` response (other than from `/login`, `/signup`, `/register`) immediately clears local auth state and hard-redirects to `/login` via `window.location.href`.
- Several task/project mutation calls include a **fallback to a secondary endpoint** (`/api/manage/task/{id}` or `/api/manage/project/{id}`) if the primary REST-ish endpoint (`/tasks/{id}`, `/projects/{id}`) fails — both are implemented on the backend (see the Backend README's unified "manage" routes).

**Endpoints in active use**, grouped by domain (method + path — see the [Backend README](../Backend/README.md#api-documentation-overview) for full request/response contracts):

| Domain | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/settings`, `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password` |
| Projects | `GET /projects`, `POST /projects`, `GET /projects/{id}`, `POST /projects/{id}` (update), `DELETE /projects/{id}`, `GET /projects/lov` (dropdown data: categories, priorities, project types, statuses, task types) |
| Tasks | `GET /tasks?project_id=...`, `GET /tasks/{id}`, `POST /tasks`, `POST /tasks/{id}` (update), `DELETE /tasks/{id}` |
| Members | `GET /api/members/{project_id}`, `GET /api/members/users?exclude_project_members=true&project_id=...`, `POST /api/members`, `DELETE /api/members/{project_member_id}` |
| Dashboard | `GET /api/dashboard` (falls back to `GET /dashboard`) |
| Search | `GET /api/search?q=...` |

---

## Authentication Flow

1. **Login** (`Login.jsx`) — `POST /auth/login` with `{email, password}`. On success, `loginUser()` stores the returned token (`pf_token`) and a normalized user object (`pf_user`) in `localStorage`, then navigates to `/dashboard`.
2. **Signup** (`Signup.jsx`) — `POST /auth/register` with `{full_name, email, password}`. A real-time checklist enforces the same password rules the backend validates (min 8 characters, one uppercase, one lowercase, one number, one special character) before the submit button is enabled.
3. **Token storage & usage** — the JWT is kept in `localStorage["pf_token"]` (no cookies) and attached as `Authorization: Bearer <token>` by the axios request interceptor on every call.
4. **Logout** — `logoutUser()` calls `POST /auth/logout` (failure is ignored) and unconditionally clears `pf_token`, `pf_user`, and `pf_projects`.
5. **Session expiry / invalid token** — handled reactively: the first API call that comes back `401` triggers the response interceptor to clear storage and redirect to `/login`.
6. **Forgot password** (`ForgotPasswordModal.jsx`) — a 3-step modal:
   - **Step 1 — Request a code**: `POST /auth/forgot-password {email}`. Always shows a generic success message (the backend doesn't reveal whether the email exists) and starts a 30-second UI countdown before "Resend Code" becomes available again.
   - **Step 2 — Verify the code**: user enters the 6-digit numeric code emailed to them; `POST /auth/verify-reset-code {email, code}` returns a short-lived `reset_token` used in the next step. The 6-digit code is a **stateless TOTP-derived one-time code** (see the Backend README's [TOTP flow](../Backend/README.md#totp-password-reset-flow)) — nothing is persisted server-side until it's verified.
   - **Step 3 — Set a new password**: `POST /auth/reset-password {email, reset_token, new_password}`, enforcing the same password-strength rules, then auto-closes on success.
7. **Profile & settings** — `Profile.jsx` and `Settings.jsx` both call `GET /auth/me` on load; `Settings.jsx` submits combined profile/password changes via `PUT /auth/settings` (requires `current_password` to also change `new_password`).

---

## PBAC Integration

The frontend implements a **client-side mirror** of the backend's Policy-Based Access Control rules, purely for UX (disabling/hiding buttons a user can't use) — the backend independently re-enforces every rule and is the actual source of truth. There is no `/permissions` endpoint; the frontend re-derives allow/deny from data it already has (project `created_by`, task `assignee_id`, etc.).

The evaluator lives in `ProjectContext.jsx`:

```js
authorize(currentUser, action, resource, resourceData)
```

Rules implemented (mirroring the backend's `Action` enum — see the [Backend PBAC docs](../Backend/README.md#pbac-implementation)):

- **Projects**: anyone can view; only the project's creator (`created_by`) can `update`/`delete`.
- **Tasks**: anyone can view; only the task's assignee or the parent project's owner can `update`/`delete`/`complete`/`reassign`.
- Anything not explicitly matched defaults to **allowed**, so newly added actions aren't silently blocked until a rule is written for them.

Consumed via the `<PermissionButton>` wrapper (`src/components/common/PermissionButton.jsx`):

```jsx
<PermissionButton
  action="delete"
  resource="task"
  resourceData={task}
  variant="destructive"
  onClick={handleDelete}
>
  Delete Task
</PermissionButton>
```

If `authorize()` denies the action, `PermissionButton` renders a disabled button (with a tooltip explaining why) instead of calling `onClick` — or, if `hideIfDenied` is passed, renders nothing (or a `fallback`) at all. `BoardView.jsx` and `TaskTable.jsx` also call `authorize()` directly (outside of `PermissionButton`) to gate the inline status-change dropdowns.

Separately, when the **backend** denies a request with `403` (e.g. `GET /projects/{id}` or `GET /tasks/{id}` for a project the user isn't part of), `ProjectDetails.jsx` and `TaskDetails.jsx` render a dedicated full-page "403 — Access Denied" card rather than relying on the client-side heuristic.

---

## Feature Modules

### Dashboard

`pages/Dashboard.jsx` fetches `GET /api/dashboard` (falling back to `GET /dashboard`) on load and whenever the logged-in user changes, and renders:

- **`PendingTasksList`** — non-completed tasks with quick filters (All / In Progress / To Do / High Priority) and a one-click "mark complete" toggle.
- **`ProjectTaskPieChart`** — an SVG donut chart of task counts grouped by project, with a hoverable legend.
- **`TimebasedAnalytics`** — a 7/30/90-day toggle showing completed-task totals, throughput, average resolution time, and a created-vs-completed bar chart per period.
- **`RecentTasksList`** — a feed of recently created/updated tasks with its own client-side search box.

An empty state ("Create New Project") is shown if there are no projects and no tasks at all.

### Projects

- **`Projects.jsx`** — grid of `ProjectCard`s with client-side search (name/key/category), status pills (All/Active/Completed, also settable via a `?status=` query param), and a category filter.
- **`CreateProject.jsx`** / **`EditProjectModal.jsx`** — both wrap the shared **`ProjectForm.jsx`**, which loads dropdown data from `GET /projects/lov` and auto-computes `estimated_duration` from the planned start/end dates.
- **`ProjectDetails.jsx`** — fetches the project, its tasks (`GET /tasks?project_id=...`), and its members (`GET /api/members/{id}`), then renders three tabs, selected via the `:tab` URL segment: **Overview** (`ProjectOverview` — status/priority donut, completion bar, team member card), **Board** (`BoardView` — Kanban), and **Tasks** (`TaskTable`). Distinct error states are shown for `403` (access denied) and `404` (not found).
- **`AddMemberModal.jsx`** — lets the project owner add members from a searchable list of users not already on the project, and remove existing (non-owner) members.

### Tasks

- **`BoardView.jsx`** — a 3-column Kanban board (To Do / In Progress / Done). Status changes are made via a dropdown on each card (not drag-and-drop); the dropdown is disabled if `authorize()` denies the update.
- **`TaskTable.jsx`** — a searchable, filterable (status/priority), paginated (5/10/20/50 rows) table with inline status changes and `PermissionButton`-gated view/edit/delete row actions (delete requires confirming an `AlertDialog`).
- **`CreateTaskModal.jsx`** / **`EditTaskModal.jsx`** — both wrap the shared **`TaskForm.jsx`**, which loads status/priority/task-type/project options and the assignable member list for the selected project.
- **`TaskDetails.jsx`** — single-task view with edit/delete actions gated by `PermissionButton`, and a dedicated `403`/`404` error state.

### Search

**`GlobalSearch.jsx`** (rendered inside `Navbar.jsx`, visible to authenticated users at the `md` breakpoint and up):

- Debounces input by 300ms before calling `GET /api/search?q=<query>`.
- Renders grouped results ("Projects (n)" / "Tasks (n)") with the matched substring highlighted.
- Closes on click-outside or `Escape`; selecting a result navigates to `/projects/{id}` or `/tasks/{id}`.

### Analytics

Analytics visuals are **hand-built inline SVG** — there is no charting library dependency. The two components actually wired into the running app are `ProjectTaskPieChart` and `TimebasedAnalytics` (both described under [Dashboard](#dashboard) above). A few additional analytics components exist in the codebase but are **not currently rendered anywhere** and use hardcoded sample data rather than live API data: `ProductivityInsights.jsx`, `MonthDetailsView.jsx`, `charts/StatusPieChart.jsx`, and `charts/TaskProgressBarChart.jsx`. They're safe building blocks for future dashboard work but shouldn't be assumed to reflect real data today.

### Notifications

**`NotificationDropdown.jsx`** exists in `src/components/layout/` but is **not currently imported or rendered anywhere** in the app (there's no bell icon in the live `Navbar`). Its internal state is a hardcoded array of 3 sample notifications with no backend call — there is no notifications API on the backend today. Treat this as a scaffold for a future feature rather than a working one.

---

## Build & Deployment

### Production build

```bash
npm run build      # outputs static assets to dist/
npm run preview    # optional: serve dist/ locally to sanity-check the build
```

Because `VITE_API_URL` is compiled into the bundle at build time, **set it correctly before running `npm run build`** for whichever backend the build should point at.

### Deployment target 1 — Vercel

`vercel.json` configures a SPA rewrite so client-side routes resolve correctly on refresh:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Set `VITE_API_URL` as a Vercel project environment variable, then deploy as a standard Vite/static site (build command `npm run build`, output directory `dist`).

### Deployment target 2 — Docker / Nginx

The included `Dockerfile` is a two-stage build:

1. **Builder stage** (`node:20-alpine`) — `npm ci`, accepts `VITE_API_URL` as a build `ARG`/`ENV`, then `npm run build`.
2. **Serve stage** (`nginx:alpine`) — copies `dist/` into `/usr/share/nginx/html` and `nginx.conf` (SPA fallback: `try_files $uri $uri/ /index.html;`) into the Nginx config, exposing port 80.

```bash
docker build --build-arg VITE_API_URL=https://api.example.com -t projectflow-frontend .
docker run -p 8080:80 projectflow-frontend
```

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| App loads but every API call fails / redirects to `/login` immediately | `VITE_API_URL` isn't pointing at a reachable backend, or the backend's CORS policy is rejecting the frontend's origin. Confirm the backend is up and check the browser console/network tab. |
| Stuck in a login redirect loop | A stale/invalid `pf_token` in `localStorage` is triggering repeated `401`s. Clear `localStorage` (`pf_token`, `pf_user`, `pf_projects`) and log in again. |
| Changing `.env` has no effect | Restart `npm run dev` — Vite only reads `VITE_*` vars at server/build start. For a deployed static build, you must rebuild (see [Build & Deployment](#build--deployment)). |
| 404 on refreshing a deep link (e.g. `/projects/123`) in production | The SPA rewrite isn't configured on your host. Use the provided `vercel.json` for Vercel, or `nginx.conf` for a Docker/Nginx deployment. |
| Dropdowns (category/priority/status) are empty on the project/task form | `GET /projects/lov` failed or the backend's seeders haven't populated LOV tables — check the backend logs. |
| Sidebar/notifications don't appear even though the components exist in the repo | Expected — see [Feature Modules](#feature-modules). `Sidebar.jsx` and `NotificationDropdown.jsx` are not currently mounted in the app. |

---

## Future Improvements

The following are natural next steps based on scaffolding already present in the codebase but not yet wired up:

- Wire `NotificationDropdown.jsx` to a real backend notifications endpoint (none exists yet).
- Decide whether to reinstate `Sidebar.jsx` as the primary navigation (currently `AppLayout` is Navbar-only) or remove the dead file.
- Connect `ProductivityInsights.jsx` and `MonthDetailsView.jsx` to real dashboard data, or remove them if they're superseded by `TimebasedAnalytics`.
- Consolidate the duplicate `/create-project` and `/projects/create` routes.
- Add a 404/catch-all route.
- Add a frontend test runner (e.g. Vitest) — none is configured today.
- Consider centralizing API calls into per-domain service modules instead of inline `api.get/post` calls scattered across pages, and adding a token-refresh flow instead of a hard redirect on `401`.
