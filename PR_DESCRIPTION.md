# Pull Request: Bharati 3D Digital Twin & Maitri Sliced-Roof Storytelling Flows

## Summary

This PR introduces the interactive 3D Digital Twin for **Bharati Station (Larsemann Hills, 69°S)** and completely overhauls the lifeline flow visualizations for **Maitri Station (Schirmacher Oasis, 70°S)**. 

It addresses wall-clipping and erratic motion during Maitri utility flows by introducing **architectural roof slicing** and **elevated isometric camera glides**, accompanied by interactive **engineering storytelling cards** with live telemetry.

---

## Key Features & Changes

### 1. Bharati Station 3D Digital Twin (`/twin/bharati`, `/bharati`, `/twin?station=bharati`)
* **Interactive 3D Environment**:
  * Implemented using Three.js with Draco compression (`DRACOLoader` with Google decoders) and fallback loader for optimal initial load time (~0.96 MB Draco vs 25 MB uncompressed).
  * Accurate Larsemann Hills rocky coastal terrain, cold ocean horizon, iceberg clusters, and polar lighting.
* **16 Interior Facilities & Person-Lock**:
  * Integrated full room registry matching GLTF nodes: Medical ICU, Hydroponics Lab, Main Galley, Server Room, Satellite Ground Control, Sauna, Fitness Center, and more.
  * Click-to-focus smooth camera glides with ambient sound triggers and facility status telemetry.
* **11 Polar Animations**:
  * Track and radar sweeps, anemometer rotation, wind turbines, HVAC exhaust fans, snowmobile patrol paths, and power generator cycles.
* **5 Lifeline Flow Shaders**:
  * Dynamic UV-animated pulse shaders for:
    1. Lake Priyadarshini / Sea-ice Reverse Osmosis Water Supply
    2. Bulk Fuel Storage to Day Tank Feed
    3. HVAC Conditioned Air Recirculation Loop
    4. Main Generator to Science Module Power Distribution
    5. Greywater Recycling & Treatment Pipeline

---

### 2. Maitri Station Sliced-Roof Flow Redesign & Storytelling
* **Architectural Roof Slicing**:
  * When entering any flow mode (Water, Fuel, Heating, Greywater), `Maitri_Building_Main_Roof` lifts $+16.5\text{m}$ smoothly via GSAP, exposing the interior calorifiers, hot-water boilers, and day tanks in clean architectural cross-section.
  * Restores smoothly back to $Y = 0$ when switching back to full station exterior view.
* **Elevated Smooth Isometric Camera**:
  * Replaced the erratic Blender interior tour camera (which clipped through walls in tight 2.4m container modules) with elevated aerial flyovers ($Y = 25\text{m} - 38\text{m}$, tilted down at $35^\circ - 45^\circ$).
  * Orbit controls remain responsive and intuitive at all times.
* **Interactive Storytelling Cards**:
  * Added floating glassmorphic engineering cards explaining each stage of the flow instead of unguided random movement.
  * Includes:
    * Stage headline & engineering narrative (e.g., Sub-ice extraction, moraine trace heating, calorifier heating).
    * Live telemetry badges: Fluid Temperature, Flow Velocity, Freeze Margin, and Trace Heat status.
    * Interactive stage progression dots (`● ● ○ ○`) allowing direct jumping between stages.
    * `Prev` / `Next` controls and an 8-second auto-tour countdown timer bar.

---

### 3. Dual-Station Navigation & Application Routing
* **Unified Dual-Station Selector (`/twin`)**:
  * Switch seamlessly between **Maitri (70°S)** and **Bharati (69°S)** with query param support (`/twin?station=maitri` & `/twin?station=bharati`), wrapped in a React `Suspense` boundary for Next.js App Router compliance.
* **Dedicated Routes**:
  * `/twin/bharati` and `/bharati` for direct linking and dashboard embedding.
* **Navigation Updates**:
  * `Navigation.tsx`: Added **Maitri 3D** and **Bharati 3D** navigation links with location coordinates.
  * `app/page.tsx`: Updated landing page hero with interactive station toggle pills.
  * `app/dashboard/layout.tsx`: Added dual-station links in the primary sidebar.

---

## Technical Details

| Metric / Feature | Specification |
| :--- | :--- |
| **3D Engine** | Three.js `^0.170.0` with `DRACOLoader` & `OrbitControls` |
| **Animation Library** | GSAP `^3.12.0` |
| **Draco Decoders** | Served from `/draco/` static directory |
| **Maitri GLB** | `public/assets/maitri_digital_twin.glb` (~25.2 MB) |
| **Bharati GLB** | `public/assets/bharati_digital_twin_compressed.glb` (~0.96 MB) |
| **Type Safety** | Fully typed TypeScript components with zero compiler errors (`tsc --noEmit` exit 0) |

---

## Verification & Screenshots

- [x] **Bharati 3D Station**: Verified model rendering, lighting, materials, ocean surface, and 16-facility interior lock.
- [x] **Maitri Sliced Roof**: Verified roof elevation animation and zero camera wall-clipping.
- [x] **Storytelling Cards**: Verified stage navigation, telemetry badge updates, and auto-tour cycle.
- [x] **Build & Lint**: Passed Next.js build and TypeScript type-check.

---

## How to Test

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Navigate to:
   - `http://localhost:3000/twin` (toggle between Maitri and Bharati at the top)
   - `http://localhost:3000/twin/bharati` (direct Bharati station twin)
   - `http://localhost:3000/twin?station=maitri` (select any flow mode, e.g. "Water Flow", to view sliced-roof elevated storytelling)
