# Antarctica Digital Twin - Frontend Issue Tracker

## Project Overview
- **Project Name:** Antarctica Digital Twin
- **Frontend Technology/Stack:** Next.js 16 (App Router), React 19, Framer Motion, Tailwind CSS, Phosphor Icons, Web Audio API, Three.js
- **Overall Frontend Status:** The core UI, theming system, and routing architecture are well-established. The design system is highly polished, utilizing advanced glassmorphism and atmospheric themes (Polar Night, Aurora, SCADA). However, there are critical architectural flaws regarding duplicated routes, a lack of standard Next.js error/loading boundaries, missing mobile responsiveness on the dashboard layout, and heavy reliance on hardcoded mock data in production-facing components.
- **Total Issues Identified:** 12
- **Critical Issues:** 2
- **High-Priority Issues:** 4
- **Medium-Priority Issues:** 4
- **Low-Priority Issues:** 2
- **Major Frontend Areas Affected:** Routing Architecture, Error Handling, Dashboard Navigation, Domain Pages, API Integration, Accessibility.

---

## 1. Routing & Project Structure

### Duplicate Route Folders for Domain Pages
**Category:** Routing
**Priority:** Critical
**Location:** `src/app/` and `src/app/dashboard/`

**Description:**
The primary domain pages (`energy`, `environment`, `infrastructure`, `logistics`, `simulations`, `network`/`communications`) are currently duplicated in the file system. They exist directly under `src/app/` (e.g., `src/app/energy/page.tsx`) and also under the dashboard layout directory `src/app/dashboard/` (e.g., `src/app/dashboard/energy/page.tsx`). The `DashboardSidebar` correctly links to the `/dashboard/*` paths, making the root-level directories obsolete and a severe maintenance liability (changes made to one will not reflect in the other).

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Delete the duplicate domain directories located directly in the `src/app/` root (`energy`, `environment`, `infrastructure`, `logistics`, `simulations`, etc.).
- [ ] Verify that the application continues to build successfully.
- [ ] Verify all sidebar navigation links correctly resolve to the `src/app/dashboard/[domain]` routes.

---

## 2. Error / Loading / Empty States

### Missing Global and Route-Level Error Boundaries
**Category:** Error / Loading / Empty States
**Priority:** High
**Location:** `src/app/`

**Description:**
The Next.js App Router relies heavily on `error.tsx`, `not-found.tsx`, and `global-error.tsx` to intercept crashes and handle 404s gracefully. Currently, none of these files exist in the project. If an API call fails fatally or a user navigates to an invalid URL, they will be presented with the default, unstyled Next.js error screen, which breaks the immersive, premium "Digital Twin" user experience.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Create a `not-found.tsx` page at the root that matches the atmospheric design system, providing a button to return to the dashboard.
- [ ] Create an `error.tsx` file at `src/app/` to catch runtime errors, providing a stylized "System Fault" UI with a "Reset Telemetry" (retry) button.
- [ ] Create a `global-error.tsx` for fatal root layout crashes.

### Missing Loading Skeletons for Telemetry Data
**Category:** Error / Loading / Empty States
**Priority:** High
**Location:** `src/app/dashboard/` (all domain pages)

**Description:**
Pages such as `Environment` fetch live telemetry data on mount (`fetchEnv()`). There are no `loading.tsx` files or skeleton loaders in place while these promises resolve. The UI either blocks rendering or the data pops in abruptly, resulting in a jarring user experience.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Create a `loading.tsx` file inside `src/app/dashboard/` to handle route transition loading.
- [ ] Implement a reusable `<TelemetrySkeleton />` component that mimics the shape and glowing borders of the `HudPanel`.
- [ ] Display the skeleton loaders while initial data fetches are in progress.

### Silent Failures on API Timeout
**Category:** API Integration
**Priority:** Medium
**Location:** `src/app/environment/page.tsx`, `src/lib/api.ts`

**Description:**
In `src/app/environment/page.tsx`, the `fetchEnv` catch block silently logs `console.warn("Error fetching environment telemetry:", err);` without updating the UI state. The user remains completely unaware that the displayed data is stale, hardcoded, or that the backend connection was lost.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Add an `isError` or `connectionStatus` state variable to the component.
- [ ] Display a visual warning indicator (e.g., a flashing red "CONNECTION LOST" or "STALE DATA" badge) near the telemetry readouts when the API request fails.
- [ ] Integrate a toast notification library (or use a custom component) to alert the user of the network failure.

---

## 3. Responsive Design

### Dashboard Sidebar is Not Mobile Responsive
**Category:** Responsive Design
**Priority:** Critical
**Location:** `src/components/dashboard/DashboardSidebar.tsx`, `src/app/dashboard/layout.tsx`

**Description:**
The `DashboardSidebar` is configured with a fixed width (`w-64`) and lacks responsive breakpoints. On mobile and tablet devices, this sidebar remains fully visible, either crushing the main content area into an unusable sliver or causing severe horizontal overflow. There is no hamburger menu or mobile drawer toggle implemented.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Hide the sidebar by default on mobile screens (e.g., `hidden md:flex`).
- [ ] Add a hamburger menu toggle button to the `DashboardHeader` visible only on mobile screens.
- [ ] Implement state logic to open the sidebar as an off-canvas overlay or drawer when the menu button is tapped.
- [ ] Ensure the main dashboard content area expands to `w-full` on mobile.

---

## 4. API Integration & Hardcoded Data

### Remove Hardcoded Arrays and Integrate with API
**Category:** API Integration
**Priority:** High
**Location:** `src/app/energy/page.tsx`, `src/app/logistics/page.tsx`, `src/app/network/page.tsx`

**Description:**
To ensure the application functions as a true Digital Twin, the heavy reliance on hardcoded mock data must be eliminated. Currently, `GENERATORS_DATA` and `LOAD_TIERS` in Energy, `TANKS` in Logistics, and `SATELLITE_PASSES` in Network are defined as static arrays inside the component files.

**Dependencies:**
Backend/API endpoints for energy, logistics, and network telemetry must be functional.

**Acceptance Criteria:**
- [ ] Remove the static array definitions from the component files.
- [ ] Create corresponding fetch methods (e.g., `getEnergyTelemetry`, `getLogisticsTelemetry`) in `src/lib/api.ts`.
- [ ] Use React `useEffect` (or React 19 `use` hook/Server Components) to fetch and render the dynamic data.
- [ ] The existing hardcoded data should be moved to a mock file and used strictly as a resilient fallback if the API is explicitly unreachable.

---

## 5. Global UI / Design System

### Flash of Unstyled Content (FOUC) on Theme Load
**Category:** Global UI / Design System
**Priority:** Medium
**Location:** `src/context/ThemeContext.tsx`, `src/app/layout.tsx`

**Description:**
The `ThemeContext` relies on a `useEffect` hook to read the user's preferred theme from `localStorage` and apply the `data-theme` attribute to the `document.documentElement`. Because `useEffect` only executes on the client after the initial HTML render, users will experience a jarring flash of the default theme before their saved theme (e.g., SCADA or Aurora) is applied.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Add an inline, blocking `<script>` tag inside the `<head>` of `src/app/layout.tsx`.
- [ ] The script must synchronously read `localStorage` and set the `data-theme` attribute before the browser paints the DOM.
- [ ] Ensure this solution does not trigger Next.js hydration mismatch warnings.

---

## 6. Accessibility (a11y)

### Missing ARIA Attributes on Interactive Elements
**Category:** Accessibility
**Priority:** Medium
**Location:** `src/components/HudPanel.tsx`, `src/components/ThemeSwitcher.tsx`, `src/components/dashboard/DashboardSidebar.tsx`

**Description:**
While visual aesthetics are high, semantic accessibility is lacking. Custom interactive elements like the `ThemeSwitcher` dropdown and clickable `HudPanel` components lack necessary ARIA attributes, making them difficult to navigate using screen readers.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] `ThemeSwitcher` button must utilize the `aria-expanded` attribute tied to the `isOpen` state.
- [ ] Custom interactive cards (like `HudPanel` when functioning as a button) must use `role="button"` or `role="link"` and include `tabIndex={0}`.
- [ ] Custom buttons must handle keyboard `Enter` and `Space` events.
- [ ] Purely decorative Phosphor icons should be explicitly hidden from screen readers (e.g., `aria-hidden="true"`).

### Lack of Keyboard Navigation in 3D Views
**Category:** Accessibility
**Priority:** Low
**Location:** `src/app/twin/page.tsx`

**Description:**
The 3D spatial visualization (Three.js/WebGL) requires mouse or touch dragging to orbit and zoom. Users who rely strictly on keyboard navigation cannot explore the spatial twin.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Implement basic keyboard event listeners (WASD or Arrow keys) to pan and zoom the Three.js camera.
- [ ] Ensure focus can be securely moved into the canvas wrapper element.
- [ ] Provide an on-screen (or visually hidden) text block explaining the keyboard shortcuts.

---

## 7. Performance & Optimization

### Respect "Prefers Reduced Motion" for Heavy Animations
**Category:** Performance / Accessibility
**Priority:** Medium
**Location:** `src/app/globals.css`, Framer Motion configurations

**Description:**
The application utilizes complex, continuous CSS animations (such as the `.polar-snow` and aurora keyframes) and extensive Framer Motion transitions. Users with vestibular disorders or older hardware may experience motion sickness or severe framerate drops.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Wrap continuous CSS animations (`globals.css`) in `@media (prefers-reduced-motion: reduce)` queries to disable or heavily simplify them.
- [ ] Update Framer Motion global configurations to respect reduced motion preferences (e.g., replacing sliding spring animations with simple crossfades).

### Optimize Large Photographic Assets
**Category:** Performance
**Priority:** Low
**Location:** `src/components/landing/HeroSection.tsx`

**Description:**
The landing page hero section loads a massive background image (`/backgrounds/antarctic-bg.jpg`) using a standard HTML `<img>` tag. This bypasses Next.js image optimization, resulting in larger payloads, missing WebP conversion, and slower LCP (Largest Contentful Paint) metrics.

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Replace the standard `<img>` tag with the `next/image` (`<Image />`) component.
- [ ] Use the `fill` property and `object-cover` for styling.
- [ ] Add `priority={true}` to ensure the hero image is preloaded immediately.

---

## 8. Components

### Telemetry Value Component Lacks Unit Flexibility & Formatting
**Category:** Components
**Priority:** Low
**Location:** `src/components/TelemetryValue.tsx`

**Description:**
The `TelemetryValue` component displays raw numeric data. It lacks the ability to format large numbers (e.g., `25000` instead of `25,000`) and does not automatically react to dangerous threshold breaches (e.g., turning red when a temperature exceeds a maximum safe limit).

**Dependencies:**
None.

**Acceptance Criteria:**
- [ ] Implement a `formatLocale` or `useSeparators` boolean prop to format large numbers with commas.
- [ ] Add optional `warningThreshold` and `criticalThreshold` numeric props.
- [ ] Update the component's internal logic to automatically switch text colors (e.g., to red or amber) when the value crosses these thresholds.
