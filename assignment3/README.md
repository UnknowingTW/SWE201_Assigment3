# Task Manager — SWE201 Assignment 3

A full-stack **Task Manager** built with **Expo (React Native)** and **Next.js**. Users can register/login, then create, read, update, and delete tasks organised by categories.

---

## Domain & Entities

| Entity | Fields |
|---|---|
| **Task** (primary) | id, title, description, status (todo / in-progress / done), categoryId, userId, createdAt, updatedAt |
| **Category** (secondary) | id, name, color |

---

## State Management

**Context API + useReducer** is used for global app state.

- `store/reducer.js` — pure reducer handling all action types (auth, tasks, categories, filter)
- `store/AppContext.js` — provider + selector helpers

Reasoning: Context API + useReducer is built into React, requires zero extra dependencies, and is perfectly suited for a small-to-medium app. It gives predictable, centralized state updates without Redux boilerplate.

**AsyncStorage** persists:
- JWT auth token (so the user stays logged in after closing the app)
- Auth user object
- Last active task filter (status, search, categoryId)

**Custom Hooks:**
- `useAuth` — login, register, logout logic
- `useFetchList` — reusable data fetching with loading/error states
- `useForm` — form field management, validation, and submit handling

---

## Backend

**Technology:** Next.js API routes (no separate framework needed)
**Storage:** JSON file (`backend/data/db.json`) — simple, no database setup required
**Auth:** JWT (jsonwebtoken) + bcrypt password hashing

### API Endpoints

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/tasks` | List user's tasks (supports `?search=`, `?status=`, `?categoryId=`) |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/categories` | List all categories (with task counts) |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

---

## Project Structure

```
assignment3/
├── backend/                    ← Next.js backend
│   ├── data/db.json            ← JSON file database (auto-created)
│   ├── lib/
│   │   ├── db.js               ← Read/write JSON database
│   │   └── auth.js             ← JWT sign/verify helpers
│   ├── pages/api/
│   │   ├── auth/login.js
│   │   ├── auth/register.js
│   │   ├── tasks/index.js      ← GET list, POST create
│   │   ├── tasks/[id].js       ← GET, PATCH, DELETE
│   │   ├── categories/index.js
│   │   └── categories/[id].js
│   ├── next.config.js          ← CORS headers
│   ├── .env.example
│   └── package.json
│
└── mobile/                     ← Expo React Native app
    ├── api/
    │   ├── client.js           ← Centralized Axios instance
    │   ├── auth.js
    │   ├── tasks.js
    │   └── categories.js
    ├── components/
    │   ├── TaskCard.js
    │   ├── CategoryBadge.js
    │   ├── LoadingSpinner.js
    │   ├── ErrorMessage.js
    │   ├── EmptyState.js
    │   └── ConfirmModal.js
    ├── hooks/
    │   ├── useAuth.js          ← Custom auth hook
    │   ├── useFetchList.js     ← Custom data-fetching hook
    │   └── useForm.js          ← Custom form hook
    ├── navigation/
    │   └── AppNavigator.js     ← Auth stack + Main stack + Bottom tabs
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── TaskListScreen.js   ← Search, filter chips, FAB
    │   ├── TaskDetailScreen.js
    │   ├── TaskFormScreen.js   ← Used for both create and edit
    │   └── CategoriesScreen.js
    ├── store/
    │   ├── reducer.js          ← Pure reducer
    │   └── AppContext.js       ← Context provider + selectors
    ├── utils/
    │   ├── constants.js        ← Colors, status labels, storage keys
    │   └── storage.js          ← AsyncStorage helpers
    ├── config.js               ← API base URL (edit this!)
    ├── App.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (Android/iOS)

---

### Step 1 — Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# (Optional) Edit JWT_SECRET in .env.local for production

# Start backend server on port 3001
npm run dev
```

The backend will run at: **http://localhost:3001**

The `data/db.json` file is created automatically on first run with seed categories.

---

### Step 2 — Configure Mobile API URL

Open `mobile/config.js`:

```js
const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
};
```

**If testing on a physical device (Expo Go):**
Your phone can't reach `localhost` — use your computer's LAN IP instead.

1. Find your IP: run `ipconfig` (Windows) or `ifconfig` / `hostname -I` (Mac/Linux)
2. Create `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:3001/api
   ```
   Replace `192.168.x.x` with your actual IP.

**If using Android Emulator:** `http://10.0.2.2:3001/api`

**If using iOS Simulator:** `http://localhost:3001/api` works fine.

---

### Step 3 — Start the Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start
```

Scan the QR code with the **Expo Go** app on your phone.

---

### Step 4 — Use the App

1. Open Expo Go → scan QR code
2. Register a new account on the Register screen
3. Start creating tasks! Use the **+** button on the Tasks tab
4. Manage categories from the **Categories** tab

---

## Known Limitations

- The JSON file database is for local development only — it does not support concurrent writes safely
- No pagination (all tasks are returned at once)
- Images/attachments are not supported
- The backend is not deployed (local only)

---

## Screenshots

> Add screenshots here after running the app.
> At minimum: List view, Form view (create/edit), Detail view.
