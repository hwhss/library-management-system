# Project Foundation and Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a runnable Vue 3 library-management frontend with persistent initial mock data, a local Axios adapter, and a Pinia authentication store.

**Architecture:** The `mock` module owns immutable seed data. The storage utility deep-clones and persists a single `library_mock_data` object. Axios requests use a custom adapter that dispatches local `/api` requests to focused API modules, while Pinia owns the authenticated session separately in localStorage.

**Tech Stack:** Vue 3, Vite, JavaScript, Element Plus, Pinia, Vue Router 4, Axios, ECharts, Vitest.

**Spec:** User-approved module design in this task conversation.

## Global Constraints

- Use JavaScript, not TypeScript.
- Do not use a backend or mockjs.
- Persist business data only under `library_mock_data`.
- Seed at least 20 books, 15 readers, and 30 borrowing records.
- Keep all four borrowing states represented: `borrowing`, `overdue`, `returned`, and `overdue_returned`.
- Do not implement login, route guards, or business pages in this module.

---

### Task 1: Create the Vite application foundation

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`, `src/assets/base.css`
- Create: empty module directories under `src/`

**Interfaces:**
- Produces: an application that mounts `App.vue` at `#app`.

- [x] Add runtime dependencies: Vue, Element Plus, Pinia, Vue Router, Axios, and ECharts.
- [x] Add Vite and Vitest development tooling.
- [x] Configure Vite and the `npm run dev`, `npm run build`, and `npm run test` scripts.
- [x] Mount Vue with Pinia and Element Plus.
- [x] Verify the production build completes.

### Task 2: Define and validate immutable seed data

**Files:**
- Create: `src/mock/initialData.js`
- Test: `src/mock/initialData.test.js`

**Interfaces:**
- Produces: `initialLibraryData`, containing `books`, `users`, and `borrowRecords` arrays.

- [x] Write tests for minimum record counts, identifiers, uniqueness, represented statuses, and stock consistency.
- [x] Add seed records satisfying those tests.
- [x] Run the unit tests.

### Task 3: Implement persistent library-data storage

**Files:**
- Create: `src/utils/libraryStorage.js`
- Test: `src/utils/libraryStorage.test.js`

**Interfaces:**
- Produces: `getLibraryData()`, `saveLibraryData(data)`, `resetLibraryData()`, and `initializeLibraryData()`.

- [x] Write tests using mocked localStorage for initialization, save/reload, defensive cloning, and reset.
- [x] Implement the smallest storage API that passes the tests.
- [x] Run the storage tests.

### Task 4: Add the local Axios adapter and API modules

**Files:**
- Create: `src/utils/request.js`, `src/api/book.js`, `src/api/user.js`, `src/api/borrow.js`
- Test: `src/utils/request.test.js`

**Interfaces:**
- Produces: Axios methods accepting local `/api` paths and returning `{ code, message, data }` payloads.

- [x] Write tests for token header injection, book listing through the adapter, and unsupported-path errors.
- [x] Implement request interception, adapter routing, response normalization, and focused read APIs.
- [x] Run adapter tests.

### Task 5: Add persistent Pinia authentication state

**Files:**
- Create: `src/stores/user.js`
- Test: `src/stores/user.test.js`

**Interfaces:**
- Produces: `useUserStore()` with `token`, `userInfo`, `isLoggedIn`, `login`, `logout`, and `restoreSession`.

- [x] Write tests for approved test accounts, failed credentials, persistence, restore, and logout.
- [x] Implement the store without routing side effects.
- [x] Run the store tests and full test suite.

### Task 6: Verify the module and document startup

**Files:**
- Create: `README.md`

- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [x] Document setup, scripts, mock storage keys, and the scope boundary for this module.
