# Captain Culinary Kids — Developer Onboarding Guide

Welcome. This document is your complete introduction to the Captain Culinary Kids codebase. Read it from top to bottom before touching any code.

---

## Table of Contents

1. [Business Purpose](#1-business-purpose)
2. [User Personas](#2-user-personas)
3. [Project Goals](#3-project-goals)
4. [Architecture Overview](#4-architecture-overview)
5. [File Structure](#5-file-structure)
6. [Setup Instructions](#6-setup-instructions)
7. [Deployment Instructions](#7-deployment-instructions)
8. [Database Explanation](#8-database-explanation)
9. [Authentication Explanation](#9-authentication-explanation)
10. [API Explanation](#10-api-explanation)
11. [Coding Standards](#11-coding-standards)
12. [Common Workflows](#12-common-workflows)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Business Purpose

**Captain Culinary Kids (CCK)** is a guided, age-aware food-skills learning platform that helps children aged 7–19 develop real cooking confidence, kitchen safety habits, and practical life skills through structured, joyful lessons.

The platform is explicitly designed for:

- **Families** using it at home for after-school skill-building
- **Schools and youth programs** running cooking or life-skills curriculum
- **Churches and ministry partners** teaching responsibility, service, and stewardship through food
- **Community organizations** delivering workforce preparation to teens

What makes CCK distinct from a general cooking app is its **age-staged curriculum**, its **built-in safety guardrails**, and its optional **ministry/devotional layer**. Every lesson is structured to teach not just a cooking skill but a life habit — preparation, care for others, and gratitude.

The platform was built using the **Emergent.sh** AI agent development platform, which enables non-engineers to make content edits directly in the browser.

---

## 2. User Personas

### Primary Learners

| Persona | Age Range | Path Name | Focus |
|---------|-----------|-----------|-------|
| Junior Chef | 7–12 | Junior Chef Path | Kitchen safety, simple food skills, family service |
| Skill Builder | 13–16 | Skill Builder Path | Knife skills, healthy meals, global food awareness |
| Young Entrepreneur | 17–19 | Launch Path | Business concepts, hospitality, leadership |

### Supporting Adults

| Persona | Role |
|---------|------|
| Parent / Guardian | Supervises lessons, reviews progress, receives reminders |
| Teacher / Youth Leader | Runs group sessions, delivers lessons to multiple learners |
| Ministry Partner | Uses faith-layer content (devotional connections in each lesson) |

### Operators

| Persona | Role |
|---------|------|
| Developer | You — building and maintaining the platform |
| Program Coordinator | Manages curriculum content, may use Emergent visual editing |

---

## 3. Project Goals

### Core Learning Goals
- Children complete age-appropriate cooking lessons with measurable skill checkpoints (quiz)
- Children earn badges for completing lessons and challenges
- Children can participate in family challenges that extend learning beyond the screen
- Older teens can build business concepts (food truck, restaurant) as a career pathway

### Safety Goals
- Every dangerous topic (knives, heat, chemicals, injuries) triggers an **adult-required** flag
- All text input from children runs through a deterministic guardrail classifier before any response is generated — no open AI on child-facing inputs
- Emergency language immediately halts the session and surfaces emergency guidance

### Platform Goals
- Works offline: localStorage is the source of truth; backend sync is optional and fails silently
- Accessible: large-text mode, readable serif fonts, high-contrast design
- Printable: lessons are designed to work when printed for paper-based use
- Extendable: adding new lessons requires only data changes, not new routes

---

## 4. Architecture Overview

CCK is a **client-first web application** with an optional backend. The frontend can run as a standalone static site with no backend at all.

```
┌──────────────────────────────────────────────────────┐
│                     BROWSER                          │
│                                                      │
│   React 19 SPA (Create React App + Craco)            │
│   ├── React Router v7 (client-side routing)          │
│   ├── localStorage (primary data store)              │
│   ├── shadcn/ui + Tailwind CSS (design system)       │
│   ├── cckGuardrails.js (safety classifier, no AI)    │
│   └── api.js (optional backend sync via Axios)       │
│                                                      │
└───────────────────┬──────────────────────────────────┘
                    │ HTTP (optional)
                    ▼
┌──────────────────────────────────────────────────────┐
│                   BACKEND                            │
│                                                      │
│   FastAPI (Python 3.11)                              │
│   ├── Uvicorn ASGI server                            │
│   ├── SQLite database (culinary_chef.db)             │
│   └── REST API under /api prefix                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Client-first state.** All user progress, settings, and created concepts live in `localStorage`. The backend is a sync target, not a source of truth. This means the app is fully usable offline or if the backend is down.

**No traditional authentication.** Users are identified by a randomly generated session ID stored in `localStorage`. There are no passwords, accounts, or JWTs involved in normal use. This is a deliberate choice for the child-learner context — no barrier to entry, no personal data collected by default.

**Deterministic safety guardrails.** The guardrail system (`cckGuardrails.js`) uses keyword matching, not AI inference. This was intentional: the classification behavior can be audited, explained to parents, and does not change unexpectedly.

**Static-deployable frontend.** The React app builds to a `build/` folder of static files. It can be hosted on any CDN, Render static site, Vercel, Netlify, or S3.

**Hardcoded curriculum.** Lesson content lives in `frontend/src/data/lessons.js` (frontend) and as a `LESSONS` list in `backend/server.py`. There is no CMS or admin UI yet — content changes require a code commit.

---

## 5. File Structure

```
Captain-Culinary-Kids/
│
├── render.yaml                   # Render.com deployment blueprint
├── test_result.md                # Agent-based testing protocol & status tracker
├── DEVELOPER_ONBOARDING.md       # This file
│
├── frontend/                     # React application
│   ├── public/
│   │   ├── index.html            # SPA shell (PostHog analytics snippet included)
│   │   └── illustrations/        # Static image assets (.webp kid portraits)
│   │
│   ├── src/
│   │   ├── App.js                # Route definitions (React Router v7)
│   │   ├── App.css               # App shell layout
│   │   ├── index.js              # React 19 entry point
│   │   ├── index.css             # Global design tokens + custom utility classes
│   │   │
│   │   ├── pages/                # One file per route
│   │   │   ├── Welcome.jsx       # Landing/marketing page (1,056 lines)
│   │   │   ├── AgeSelection.jsx  # Age group selector (entry point for learners)
│   │   │   ├── Dashboard.jsx     # Main learning hub
│   │   │   ├── LessonLibrary.jsx # Browse all available lessons
│   │   │   ├── LiveTeachingPlate.jsx  # Lesson player
│   │   │   ├── Quiz.jsx          # Post-lesson quiz
│   │   │   ├── ProgressBadges.jsx     # Achievement tracker
│   │   │   ├── FamilyChallenge.jsx    # Family activity cards
│   │   │   ├── GlobalFoodMission.jsx  # Cultural food exploration
│   │   │   ├── FoodTruckBuilder.jsx   # 17-19 business concept tool
│   │   │   ├── RestaurantBuilder.jsx  # 17-19 hospitality concept tool
│   │   │   ├── ParentTeacherInfo.jsx  # Adult resources & curriculum overview
│   │   │   ├── Settings.jsx      # User preferences (sound, text size)
│   │   │   └── LiveTestMode.jsx  # Guardrail testing dashboard (31KB, dev tool)
│   │   │
│   │   ├── components/
│   │   │   ├── BottomNavigation.jsx   # Persistent bottom nav bar
│   │   │   ├── CaptainCulinary.jsx    # Captain avatar + mentor card
│   │   │   ├── OrnamentDivider.jsx    # Decorative section divider
│   │   │   └── teaching-plates/      # Illustrated lesson diagrams
│   │   │       ├── PlateKitchenSafety.jsx
│   │   │       ├── PlateMirepoix.jsx
│   │   │       ├── PlateKnifeCuts.jsx
│   │   │       ├── PlateSnackPlate.jsx
│   │   │       ├── PlateRiceWorld.jsx
│   │   │       ├── PlateFoodTruck.jsx
│   │   │       ├── PlateRestaurant.jsx
│   │   │       └── index.js           # Named exports for all plates
│   │   │
│   │   ├── ui/                   # shadcn/ui component library (~50 components)
│   │   │   └── *.jsx             # accordion, button, card, dialog, form, etc.
│   │   │
│   │   ├── services/
│   │   │   ├── api.js            # Axios wrapper for backend calls
│   │   │   ├── storage.js        # localStorage read/write (primary state layer)
│   │   │   ├── captainCulinaryCoach.js  # Teaching voice/response logic
│   │   │   └── cckGuardrails.js  # Safety classifier (228 lines, no AI)
│   │   │
│   │   ├── data/
│   │   │   └── lessons.js        # Full curriculum: lessons, badges, challenges
│   │   │
│   │   ├── hooks/
│   │   │   └── use-toast.js      # Toast notification hook
│   │   │
│   │   └── lib/
│   │       └── utils.js          # cn() Tailwind class merge utility
│   │
│   ├── package.json              # Yarn dependencies
│   ├── jsconfig.json             # Path aliases (@/* → src/*)
│   ├── tailwind.config.js        # Design tokens (colors, fonts, animations)
│   ├── craco.config.js           # CRA config override (ESLint, Webpack, Emergent)
│   ├── postcss.config.js         # PostCSS pipeline
│   └── components.json           # shadcn/ui configuration
│
└── backend/
    ├── server.py                 # Complete FastAPI app (198 lines)
    ├── requirements.txt          # Python dependencies
    ├── culinary_chef.db          # SQLite database (created at runtime)
    └── tests/
        ├── __init__.py
        └── test_captain_culinary_api.py
```

### Files You Will Touch Most Often

| File | Why |
|------|-----|
| `frontend/src/data/lessons.js` | Add or edit lesson content, badges, challenges |
| `frontend/src/pages/` | Build new pages or extend existing ones |
| `frontend/src/components/teaching-plates/` | Add illustrated lesson diagrams |
| `frontend/src/services/cckGuardrails.js` | Adjust safety keyword rules |
| `backend/server.py` | Add API endpoints or update the backend lesson list |

---

## 6. Setup Instructions

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 16+ | Frontend build |
| Yarn | 1.22.22 | Package manager |
| Python | 3.11.x | Backend runtime |
| pip | latest | Python package manager |

### Clone and Install

```bash
git clone https://github.com/cmooreculinary/captain-culinary-kids.git
cd captain-culinary-kids
```

### Frontend Setup

```bash
cd frontend
yarn install
```

Create a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Start the development server:

```bash
yarn start
# Opens http://localhost:3000
```

The app works fully without the backend running. The backend sync will fail silently and localStorage will be used instead.

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
DB_NAME=cck_development
CORS_ORIGINS=http://localhost:3000
# Optional — only needed if AI coaching features are enabled:
EMERGENT_LLM_KEY=your-key-here
```

Start the backend:

```bash
uvicorn server:app --reload --port 8000
# API available at http://localhost:8000/api/
```

The SQLite database (`culinary_chef.db`) is created automatically on first run in the `backend/` directory.

### Verify Setup

1. Open `http://localhost:3000` — you should see the Welcome page
2. Open `http://localhost:8000/api/` — you should see `{"status": "ok"}`
3. Navigate to `/age`, select an age group, and reach `/dashboard`

### Path Aliases

The frontend uses `@/` as an alias for `src/`. This is configured in `jsconfig.json` and respected by Craco/Webpack. Use it:

```javascript
import { storage } from "@/services/storage";
import { LESSONS } from "@/data/lessons";
```

---

## 7. Deployment Instructions

The project deploys to **Render.com** using a Blueprint (`render.yaml`) that defines both services.

### Automated Deploy (Render Blueprint)

1. Push to `main` branch — both services redeploy automatically
2. The backend builds first; its URL is injected into the frontend build as `REACT_APP_BACKEND_URL`

### Manual Deploy Steps

#### Backend

```bash
# On Render: Python runtime, rootDir=backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port $PORT
```

Required environment variables on Render:

| Variable | Value |
|----------|-------|
| `PYTHON_VERSION` | `3.11.9` |
| `DB_NAME` | `cck_production` |
| `CORS_ORIGINS` | `https://robot-chef-app.onrender.com` |
| `EMERGENT_LLM_KEY` | Set manually in Render dashboard |

#### Frontend

```bash
# On Render: Static site, rootDir=frontend
yarn install --frozen-lockfile
yarn build
# Publish directory: build/
```

Required environment variables on Render:

| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | Auto-injected from backend service |

The Render config also sets:
- SPA rewrite: all `/*` routes → `/index.html`
- Cache-Control headers for static assets and illustrations

#### Deploy to Other Platforms

**Vercel (frontend only):**
```bash
cd frontend
yarn build
vercel --prod
```

**Netlify (frontend only):**
```bash
cd frontend
yarn build
# Set publish directory to frontend/build
# Add _redirects file: /* /index.html 200
```

**Self-hosted backend:**
```bash
# Any Linux server with Python 3.11
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## 8. Database Explanation

The backend uses **SQLite** via Python's built-in `sqlite3` module. The database file is `backend/culinary_chef.db` and is created automatically when the server starts.

> **Note:** SQLite works for development and low-traffic deployments. For production scale, migrate to PostgreSQL (the schema is simple and the migration is straightforward).

### Tables

#### `progress`

Stores per-session learning progress. Each user session has one row.

| Column | Type | Description |
|--------|------|-------------|
| `sessionId` | TEXT (PK) | Client-generated session ID from localStorage |
| `ageGroup` | TEXT | `"7-12"`, `"13-16"`, `"17-19"`, or `"parent"` |
| `completedLessons` | TEXT | JSON array of lesson IDs |
| `earnedBadges` | TEXT | JSON array of badge IDs |
| `completedChallenges` | TEXT | JSON array of challenge IDs |
| `settings` | TEXT | JSON object `{soundOn, textSize, parentReminders}` |
| `updatedAt` | TEXT | ISO 8601 timestamp |

#### `food_trucks`

Stores food truck business concepts created by 17–19 learners.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | UUID generated by server |
| `sessionId` | TEXT | Foreign key to progress.sessionId |
| `truckName` | TEXT | Truck name |
| `foodIdea` | TEXT | Core food concept |
| `menu1/2/3` | TEXT | Three menu items |
| `targetCustomer` | TEXT | Intended customer description |
| `brandStyle` | TEXT | Visual/brand personality |
| `safetyNote` | TEXT | Safety awareness note |
| `costThought` | TEXT | Basic cost consideration |
| `serviceMission` | TEXT | Community service purpose |
| `createdAt` | TEXT | ISO 8601 timestamp |

#### `restaurants`

Stores restaurant hospitality concepts created by 17–19 learners.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | UUID generated by server |
| `sessionId` | TEXT | Foreign key to progress.sessionId |
| `restaurantName` | TEXT | Restaurant name |
| `concept` | TEXT | Core dining concept |
| `hospitalityPromise` | TEXT | Guest experience promise |
| `menuIdea1/2/3` | TEXT | Three menu concepts |
| `teamRoles` | TEXT | Team structure description |
| `cleanlinessPlan` | TEXT | Cleanliness approach |
| `guestExperience` | TEXT | Guest journey description |
| `communityPurpose` | TEXT | Community impact |
| `createdAt` | TEXT | ISO 8601 timestamp |

### Array/Object Storage

SQLite does not have native JSON columns. The backend serializes Python lists and dicts to JSON strings before writing, and deserializes after reading. See `server.py` lines 159–164 for the pattern.

---

## 9. Authentication Explanation

**CCK does not have traditional authentication.** This is intentional.

### How Identity Works

1. On first app load, `storage.js` checks localStorage for a `cck_session_id` key
2. If absent, it generates one: `cck-${Math.random().toString(36).slice(2)}-${Date.now()}`
3. This session ID is stored in localStorage and sent with every backend API call as a path parameter (e.g., `GET /api/progress/{session_id}`)
4. All state is scoped to this session ID

### What This Means in Practice

- No login screen, no passwords, no JWT tokens
- Clearing browser storage resets the user completely (new session ID = empty progress)
- The same user on two different devices has two separate sessions with no sync
- There is no admin panel, no user management, no personal data stored server-side beyond the progress arrays

### Safety Guardrails (Child Safety Layer)

This is separate from authentication but equally important. The file `frontend/src/services/cckGuardrails.js` contains a **deterministic keyword classifier** that routes any text input through one of six categories before generating any response.

**Classification priority order (first match wins):**

| Priority | Route | Risk | Adult Required |
|----------|-------|------|----------------|
| 1 | `EMERGENCY_STOP` | CRITICAL | YES — halts session |
| 2 | `DEVOTIONAL_LAYER` | MEDIUM | NO — approved corpus only |
| 3 | `KITCHEN_SAFETY` | HIGH | YES |
| 4 | `SANITATION` | LOW | NO |
| 5 | `FOOD_SKILLS` | MEDIUM | MAYBE |
| 6 | `RANDOM_BUT_SAFE` | LOW | NO — redirects to lesson |

The classifier uses no network calls and no AI. Every classification result is displayed verbatim in `LiveTestMode.jsx` so operators can audit the behavior.

To adjust safety rules, edit the `KEYWORDS` object in `cckGuardrails.js`. Add new keyword phrases to the appropriate array. The classifier does substring matching on lowercased text.

---

## 10. API Explanation

The backend exposes a REST API under the `/api` prefix. All endpoints return JSON.

Base URL (local): `http://localhost:8000/api`

### Endpoints

#### `GET /api/`
Health check. Returns `{"status": "ok"}`. Used by Render health checks.

---

#### `GET /api/lessons`
Returns all available lessons.

**Response:**
```json
{
  "items": [
    {
      "id": "kitchen-safety-basics",
      "title": "Kitchen Safety Basics",
      "ageGroup": "7-12",
      "path": "Kitchen Safety",
      "time": "8 minutes",
      "difficulty": "Beginner",
      "safetyLevel": "Adult Supervision",
      "badge": "safety-starter",
      "summary": "...",
      "plateKey": "kitchen-safety"
    }
  ]
}
```

> Note: The frontend does **not** use this endpoint. It reads from `src/data/lessons.js` directly. This endpoint exists for future integrations or a mobile client.

---

#### `GET /api/progress/{session_id}`
Returns progress for a session. Returns an empty progress object if the session is new.

**Response:**
```json
{
  "sessionId": "cck-abc123-1234567890",
  "ageGroup": "7-12",
  "completedLessons": ["kitchen-safety-basics"],
  "earnedBadges": ["safety-starter"],
  "completedChallenges": [],
  "settings": {"soundOn": true, "textSize": "regular"},
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

---

#### `POST /api/progress/{session_id}`
Saves or updates progress for a session. Uses SQLite `INSERT OR REPLACE` (upsert).

**Request body:** Same shape as the GET response.

**Response:** `{"ok": true}`

---

#### `POST /api/builders/food-truck`
Saves a food truck concept.

**Request body:**
```json
{
  "sessionId": "cck-abc123-...",
  "truckName": "Sunrise Tacos",
  "foodIdea": "Fresh breakfast tacos with local eggs",
  "menu1": "Egg and cheese taco",
  "menu2": "Avocado toast taco",
  "menu3": "Fruit cup",
  "targetCustomer": "Morning commuters and families",
  "brandStyle": "Warm, bright, welcoming",
  "safetyNote": "All hot items handled by adults",
  "costThought": "Keep ingredients simple to stay affordable",
  "serviceMission": "Give working families a healthy morning start"
}
```

**Response:** The saved concept object with an auto-generated `id` and `createdAt`.

---

#### `GET /api/builders/food-truck/{session_id}`
Lists food truck concepts for a session. Currently returns `{"items": []}` (not yet fully implemented — see roadmap).

---

#### `POST /api/builders/restaurant`
Saves a restaurant concept. Same pattern as food truck. Currently echoes the payload back (not yet persisted to DB — see roadmap).

---

#### `GET /api/builders/restaurant/{session_id}`
Lists restaurant concepts for a session. Currently returns `{"items": []}`.

---

### CORS

The backend allows all origins (`allow_origins=["*"]`). For production, tighten this to the frontend domain via the `CORS_ORIGINS` environment variable.

---

## 11. Coding Standards

### JavaScript / React

**Style:** No TypeScript — the project uses plain JavaScript (`.js`/`.jsx`). The JSX extension is used for files containing JSX.

**Components:** Functional components only. No class components.

**Imports:** Use path aliases (`@/` prefix) for all imports from `src/`:
```javascript
// Good
import { storage } from "@/services/storage";
import Button from "@/ui/button";

// Avoid
import { storage } from "../../services/storage";
```

**State management:** Use React `useState` and `useEffect`. Do not introduce Redux, Zustand, or a context provider unless the feature genuinely needs it.

**Forms:** Use `react-hook-form` with `zod` schema validation for any form with more than two fields.

**Styling:** Tailwind CSS utility classes, with `cn()` from `@/lib/utils` for conditional class composition:
```javascript
import { cn } from "@/lib/utils";
<div className={cn("rounded-lg p-4", isActive && "bg-teal-100")} />
```

**shadcn/ui components:** These are pre-built components living in `src/ui/`. Import them directly. Do not modify their source unless you are intentionally extending them. Add new shadcn components with:
```bash
npx shadcn-ui@latest add <component-name>
```

**No comments by default.** Only add a comment when the "why" is non-obvious — a hidden constraint, a safety invariant, a workaround for a specific bug.

### Python / FastAPI

**Formatting:** `black` (auto-formatter). Run `black .` before committing backend changes.

**Models:** Use Pydantic `BaseModel` for all request/response shapes. Use `ConfigDict(extra="ignore")` to silently drop unknown fields.

**Database access:** Direct `sqlite3` calls with parameterized queries (never string interpolation). Always close connections after use.

**Error handling:** Raise `HTTPException` for user-facing errors. Do not swallow exceptions silently in endpoints.

### Git Conventions

**Branch naming:** `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`

**Commit messages:** Imperative mood, present tense. Describe the why when non-obvious.
```
Add knife cuts lesson to 13-16 path
Fix progress upsert to include completedChallenges
```

---

## 12. Common Workflows

### Add a New Lesson

Lessons are defined in two places. Both must be updated.

**Step 1 — Create the Teaching Plate component**

Add `frontend/src/components/teaching-plates/PlateYourLesson.jsx`. This is a visual diagram component rendered during the lesson. Study an existing plate (e.g., `PlateKitchenSafety.jsx`) for the expected structure. Export it from `index.js`:

```javascript
// teaching-plates/index.js
export { default as PlateYourLesson } from "./PlateYourLesson";
```

**Step 2 — Add the lesson to the frontend data file**

Open `frontend/src/data/lessons.js` and add an entry to the `LESSONS` array:

```javascript
{
  id: "your-lesson-id",
  title: "Your Lesson Title",
  ageGroup: "7-12",          // "7-12" | "13-16" | "17-19"
  path: "Category Name",
  time: "10 minutes",
  difficulty: "Beginner",    // "Beginner" | "Intermediate" | "Advanced"
  safetyLevel: "Adult Supervision",
  badge: "badge-id",         // must match a badge in BADGES array
  plateKey: "your-lesson",   // must match the plate component key
  accent: "teal",            // "teal" | "coral" | "gold" | "navy"
  summary: "One-line description.",
  welcome: "Greeting text shown at lesson start.",
  steps: [
    { id: "today-skill", title: "Today's Skill", body: "..." },
    { id: "why-matters", title: "Why It Matters", body: "..." },
    { id: "safety-check", title: "Safety Check", body: "..." },
    { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "..." },
    { id: "practice", title: "Student Practice", body: "..." },
  ],
  quiz: [
    { q: "Question text?", choices: ["A", "B", "C"], answer: 1 },  // answer is 0-indexed
  ],
  biblical: "Optional faith connection sentence.",
  familyChallenge: "What the family does together after the lesson.",
}
```

**Step 3 — Add the lesson to the backend**

Open `backend/server.py` and add the same lesson (summary fields only) to the `LESSONS` list:

```python
{
  "id": "your-lesson-id",
  "title": "Your Lesson Title",
  "ageGroup": "7-12",
  "path": "Category Name",
  "time": "10 minutes",
  "difficulty": "Beginner",
  "safetyLevel": "Adult Supervision",
  "badge": "badge-id",
  "summary": "One-line description.",
  "plateKey": "your-lesson"
}
```

**Step 4 — Wire the plate key in LiveTeachingPlate.jsx**

Open `frontend/src/pages/LiveTeachingPlate.jsx` and add your `plateKey` to the plate-key-to-component map. Look for the existing mapping object and add:

```javascript
"your-lesson": PlateYourLesson,
```

**Step 5 — Test**
1. Navigate to `/lessons`
2. Find your new lesson in the library
3. Complete the full flow: lesson steps → quiz → badge
4. Confirm the badge appears on `/progress`

---

### Add a New Badge

Open `frontend/src/data/lessons.js` and add to the `BADGES` array:

```javascript
{ id: "your-badge-id", name: "Your Badge Name", icon: "LucideIconName", color: "teal" }
```

Icon names come from the [Lucide icon library](https://lucide.dev/icons/). Use PascalCase.

Also add to `backend/server.py` in the `BADGES` list:

```python
{"id": "your-badge-id", "name": "Your Badge Name", "icon": "icon-name"}
```

---

### Add a New Backend Endpoint

1. Define a Pydantic model for the request body if needed
2. Add the route function to `api_router` using `@api_router.get(...)` or `@api_router.post(...)`
3. Use parameterized SQLite queries — never f-strings with user input
4. Add a test in `backend/tests/test_captain_culinary_api.py`

---

### Adjust Safety Guardrails

Open `frontend/src/services/cckGuardrails.js`.

To add a keyword to an existing category:
```javascript
KITCHEN_SAFETY: [
  // ... existing keywords ...
  "pressure cooker",   // add your phrase here
],
```

Keyword matching is **substring-based** and **case-insensitive**. Shorter phrases match more broadly — prefer multi-word phrases for high-risk categories like `EMERGENCY_STOP` to avoid false positives.

Test your changes in the app by navigating to `/live-test` (the Live Test Mode page). Type test utterances and verify the route classification shown in the UI.

---

### Run Tests

**Frontend** — No automated test suite currently. Use `/live-test` route for manual guardrail testing.

**Backend:**
```bash
cd backend
source venv/bin/activate
pytest tests/
```

---

### Update Environment Variables

Frontend variables must be prefixed with `REACT_APP_` and require a server restart to take effect (CRA limitation). Backend variables are loaded at startup via `python-dotenv`.

---

## 13. Future Roadmap

These are known gaps and planned improvements. Reference these before building new features to avoid duplicating work.

### Near-Term

- **Complete builder persistence** — `POST /api/builders/restaurant` currently echoes the payload without writing to SQLite. The `GET` endpoints for both builders return empty arrays. Both need the full read/write path implemented.
- **Progress sync reliability** — Backend sync is fire-and-forget. Add retry logic and a sync status indicator so users know if their progress is backed up.
- **Lesson content expansion** — The curriculum has 7 lessons. The roadmap calls for 20+ covering more cooking techniques, global cuisines, and life skills.
- **Audio narration** — The `settings.soundOn` flag exists but no audio is wired. Planned: text-to-speech for each lesson step to support younger or pre-literate learners.

### Medium-Term

- **Parent dashboard** — A dedicated view for parents to see their child's progress, upcoming family challenges, and curriculum pacing. Currently `ParentTeacherInfo.jsx` is static content only.
- **Group/classroom mode** — Teachers need to track multiple learners. Requires real accounts or a class-code mechanism.
- **Printable lesson sheets** — Each lesson should export as a clean PDF for paper-based use (offline classrooms, church programs).
- **More teaching plates** — New lessons need new illustrated plate components. A design system for plates would speed this up.

### Long-Term

- **CMS for lesson content** — Remove hardcoded lesson arrays; allow ministry partners and educators to add content without code changes.
- **PostgreSQL migration** — Replace SQLite for production deployments with concurrent users.
- **Multi-language support** — Spanish is the first target language given the platform's audience.
- **AI coaching layer** — The `captainCulinaryCoach.js` service and `EMERGENT_LLM_KEY` env variable hint at a planned AI-assisted coaching mode. This would route food-skill questions to an LLM **after** passing the guardrail classifier, and only for non-sensitive categories (`FOOD_SKILLS`, `SANITATION`).
- **Mobile app** — The web app is mobile-responsive but a native app (React Native or Expo) would enable offline-first use without a browser and better device camera integration for scanning lesson QR codes.

---

## Quick Reference

### Local URLs
| Service | URL |
|---------|-----|
| Frontend dev server | `http://localhost:3000` |
| Backend API | `http://localhost:8000/api/` |
| Guardrail test tool | `http://localhost:3000/live-test` |

### Key Constants
| Constant | File | Purpose |
|----------|------|---------|
| `LESSONS` | `src/data/lessons.js` | Full curriculum definition |
| `BADGES` | `src/data/lessons.js` | All achievement badges |
| `AGE_PATHS` | `src/data/lessons.js` | Three learning paths |
| `KEYWORDS` | `src/services/cckGuardrails.js` | Safety classification rules |
| `ROUTE_META` | `src/services/cckGuardrails.js` | Route display metadata |

### Age Path Quick Reference
| Age Group | Path Name | Accent Color | Focus |
|-----------|-----------|-------------|-------|
| 7–12 | Junior Chef Path | Teal | Safety, simple skills |
| 13–16 | Skill Builder Path | Coral | Knife skills, global food |
| 17–19 | Launch Path | Gold | Business concepts |
| parent | Parent/Teacher Mode | Navy | Curriculum oversight |

### Design Color Tokens
| Name | Value | Use |
|------|-------|-----|
| Cream | `#FFF7EA` | Primary background |
| Navy | `#102A43` | Body text, deep surfaces |
| Teal | `#1C7C7D` | Junior path, sanitation |
| Coral | `#F26A5B` | Skill builder path, alerts |
| Gold | `#F2B84B` | Launch path, achievements |
