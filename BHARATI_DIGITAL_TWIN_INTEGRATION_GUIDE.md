# Bharati Antarctic Station — 3D Digital Twin Web Integration Guide

This guide provides the complete architectural, mathematical, and implementation reference for integrating the **Bharati Station 3D Digital Twin** into a Three.js / React / Next.js web application.

---

## Table of Contents
1. [Asset Manifest & Deployment Paths](#1-asset-manifest--deployment-paths)
2. [Coordinate Space & Coordinate Transformation](#2-coordinate-space--coordinate-transformation)
3. [Draco & GLTF Loader Architecture](#3-draco--gltf-loader-architecture)
4. [Lighting & Polar Color Calibration](#4-lighting--polar-color-calibration)
5. [The Smooth Roof Cutaway Engine](#5-the-smooth-roof-cutaway-engine)
6. [Complete 29-Facility Room Registry](#6-complete-29-facility-room-registry)
7. [Room Navigation & GSAP Camera Transitions](#7-room-navigation--gsap-camera-transitions)
8. [Elevated Lifeline Tours & Flow Animations](#8-elevated-lifeline-tours--flow-animations)
9. [Full Production React / Next.js Component Wiring](#9-full-production-react--nextjs-component-wiring)
10. [WebGL Performance & Optimization Best Practices](#10-webgl-performance--optimization-best-practices)

---

## 1. Asset Manifest & Deployment Paths

The 3D assets have been exported from Blender and optimized with `@gltf-transform` to deliver 60 FPS performance in browser environments.

| Asset File | Size | Encoding | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `bharati_digital_twin_compressed.glb` | **5.43 MB** | Draco Geometry Compression | **Primary Web Asset** (low bandwidth, fast load) |
| `bharati_digital_twin.glb` | **11.03 MB** | Standard glTF 2.0 Binary | **Universal Fallback** (non-Draco devices) |
| `draco_decoder.wasm` + `.js` | ~1.1 MB | Google Draco WASM Decoder | Placed in `/public/draco/gltf/` |

### Synchronized Repository Locations
```
c:\antarctica_digital_twin\public\assets\bharati_digital_twin_compressed.glb
c:\antarctica_digital_twin\public\assets\bharati_digital_twin.glb
c:\antarctica_digital_twin\public\draco\gltf\
c:\twin\bharati_campus_digital_twin.glb
c:\twin\maitri_assets\bharati_campus_digital_twin.blend
```

---

## 2. Coordinate Space & Coordinate Transformation

Blender and Three.js use different 3D coordinate conventions:
* **Blender**: Right-Handed, **$+Z$ is UP**, $+Y$ is FORWARD (North), $+X$ is RIGHT (East).
* **Three.js / glTF 2.0**: Right-Handed, **$+Y$ is UP**, $-Z$ is FORWARD (North), $+X$ is RIGHT (East).

### Transformation Formulas
When reading coordinates from Blender into Three.js:
$$\begin{aligned}
X_{\text{Three}} &= X_{\text{Blender}} \\
Y_{\text{Three}} &= Z_{\text{Blender}} \\
Z_{\text{Three}} &= -Y_{\text{Blender}}
\end{aligned}$$

Conversely, when converting from Three.js back to Blender:
$$\begin{aligned}
X_{\text{Blender}} &= X_{\text{Three}} \\
Y_{\text{Blender}} &= -Z_{\text{Three}} \\
Z_{\text{Blender}} &= Y_{\text{Three}}
\end{aligned}$$

### Station Axis Orientations in Scene
* **East–West Axis ($X$)**: The main station building extends along $X \in [-24.0\text{ m}, +24.0\text{ m}]$.
  * West Wing ($X < 0$): Observation Lounge, RO Desalination, CHPP Generators, Fuel Day Tank.
  * East Wing ($X > 0$): Galley, Dining Mess Hall, Sauna, Hospital Clinic, Labs.
* **North–South Axis ($Y_{\text{Blender}}$ / $Z_{\text{Three}}$)**:
  * North ($+Y_{\text{Blender}}$ / $-Z_{\text{Three}}$): Living Cabins 01–07, RO Water Plant, Science Labs.
  * South ($-Y_{\text{Blender}}$ / $+Z_{\text{Three}}$): Living Cabins 08–14, CHPP Generators, MLVD Panel, UPS Racks.
* **Vertical Floor Levels ($Z_{\text{Blender}}$ / $Y_{\text{Three}}$)**:
  * **Level 01** ($Z \in [0.0\text{ m}, 3.65\text{ m}]$): Vehicle Maintenance, Scissor Lift, Workshop, Mudroom Boot Wash.
  * **Level 02** ($Z \in [3.65\text{ m}, 7.50\text{ m}]$): CHPP Generators, Fuel Storage, RO Desalination, MLVD, Labs.
  * **Level 03** ($Z \in [7.50\text{ m}, 11.20\text{ m}]$): Main Lounge, Galley, Dining Mess, 14 Cabins, Command Center, Hospital.
  * **Level 04** ($Z \in [11.20\text{ m}, 16.50\text{ m}]$): Penthouse Service Enclosure, Satellite Radomes, Observation Deck.

---

## 3. Draco & GLTF Loader Architecture

To guarantee fast loading across all networks and devices, use a dual-tier loading strategy: attempt Draco compressed load first; if decoding fails or WASM is blocked, fall back immediately to the uncompressed asset.

```typescript
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export function loadBharatiModel(
  onSuccess: (gltf: any) => void,
  onProgress: (percent: number) => void,
  onError: (err: any) => void
) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/gltf/");
  dracoLoader.preload();

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const compressedUrl = "/assets/bharati_digital_twin_compressed.glb";
  const uncompressedUrl = "/assets/bharati_digital_twin.glb";

  gltfLoader.load(
    compressedUrl,
    (gltf) => {
      dracoLoader.dispose();
      onSuccess(gltf);
    },
    (event) => {
      if (event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
    (err) => {
      console.warn("[Bharati] Draco load failed, falling back to uncompressed:", err);
      const fallbackLoader = new GLTFLoader();
      fallbackLoader.load(
        uncompressedUrl,
        (gltf) => onSuccess(gltf),
        undefined,
        (fallbackErr) => onError(fallbackErr)
      );
    }
  );
}
```

---

## 4. Lighting & Polar Color Calibration

### The Problem: Blown-Out Whites & Punctual Light Lag
In raw Blender scenes, embedded punctual point lights can have intensities exceeding 6,500 candela. When exported to glTF, WebGL re-evaluates 30+ lights per pixel, causing severe GPU stutter and washing out textures into stark white.

### The Solution: PBR Environment + Soft Polar Sun
1. **Disable Embedded Blender Lights**: When traversing `root`, turn off any lights attached to the glTF hierarchy.
2. **Setup Three.js Scene Lights**: Use an HDR/PMREM environment or a soft polar 3-point lighting setup:

```typescript
// 1. Polar Ambient Light (Cool blue tint reflecting polar ice)
const ambientLight = new THREE.AmbientLight(0x8eb5d0, 1.25);
scene.add(ambientLight);

// 2. Polar Sun (Warm, low-angle Antarctic sun)
const polarSun = new THREE.DirectionalLight(0xfff7e6, 2.2);
polarSun.position.set(120, 95, 140);
polarSun.castShadow = true;
polarSun.shadow.mapSize.width = 2048;
polarSun.shadow.mapSize.height = 2048;
polarSun.shadow.camera.near = 10;
polarSun.shadow.camera.far = 400;
polarSun.shadow.camera.left = -90;
polarSun.shadow.camera.right = 90;
polarSun.shadow.camera.top = 90;
polarSun.shadow.camera.bottom = -90;
polarSun.shadow.bias = -0.0005;
scene.add(polarSun);

// 3. Polar Sea Fill Light (Bounce light from Quilty Bay)
const seaFillLight = new THREE.DirectionalLight(0xa5d5ea, 0.9);
seaFillLight.position.set(-140, 40, -100);
scene.add(seaFillLight);

// 4. Renderer Tone Mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

---

## 5. The Smooth Roof Cutaway Engine

The roof cutaway system provides an unobstructed top-down view into the interior rooms, corridor circulation, and utility piping without awkward geometric wall clipping.

### Cutaway Meshes Identified in Asset
When the model loads, identify and collect references to these specific nodes:
* `Aerodynamic_Outer_Skin_Roof` — Standing-seam roof cap covering Level 03.
* `Roof_Central_Service_Enclosure` — Rooftop penthouse and AHU mechanical room.
* `Interior_Ceiling_Slab_Top` — Level 03 interior acoustic ceiling panels.
* `Lounge_Ceiling_Grid` — Structural ceiling grid over the observation lounge.
* `Lounge_Ceiling_Light_Panels` — Recessed light diffusers.

### Cutaway Material Setup
In order to fade opacity smoothly, clone the materials on these nodes and flag them as `transparent = true`:

```typescript
const CUTAWAY_MESH_NAMES = [
  "Aerodynamic_Outer_Skin_Roof",
  "Roof_Central_Service_Enclosure",
  "Interior_Ceiling_Slab_Top",
  "Lounge_Ceiling_Grid",
  "Lounge_Ceiling_Light_Panels",
];

const cutawayMeshes: THREE.Mesh[] = [];

root.traverse((node: any) => {
  if (node.isMesh && CUTAWAY_MESH_NAMES.some((name) => node.name.includes(name))) {
    const mats = Array.isArray(node.material) ? node.material : [node.material];
    const cloned = mats.map((m: THREE.Material) => {
      const clone = m.clone();
      clone.transparent = true;
      clone.opacity = 1.0;
      return clone;
    });
    node.material = Array.isArray(node.material) ? cloned : cloned[0];
    cutawayMeshes.push(node);
  }
});
```

### Frame-Rate Independent Lerp Loop
In the `requestAnimationFrame` loop, lerp `currentOpacity` toward `targetOpacity` ($1.0$ for closed roof, $0.0$ for open cutaway). Toggle `depthWrite` to prevent sorting artifacts:

```typescript
const cutawayState = {
  isCutaway: false,
  targetOpacity: 1.0,
  currentOpacity: 1.0,
};

function onCutawayToggle(active: boolean) {
  cutawayState.isCutaway = active;
  cutawayState.targetOpacity = active ? 0.0 : 1.0;
}

// Inside render loop:
function animate(delta: number) {
  if (Math.abs(cutawayState.currentOpacity - cutawayState.targetOpacity) > 0.005) {
    cutawayState.currentOpacity = THREE.MathUtils.lerp(
      cutawayState.currentOpacity,
      cutawayState.targetOpacity,
      delta * 6.0
    );

    for (const mesh of cutawayMeshes) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        mat.opacity = cutawayState.currentOpacity;
        mat.depthWrite = cutawayState.currentOpacity > 0.5;
      }
      mesh.visible = cutawayState.currentOpacity > 0.02;
    }
  }

  renderer.render(scene, camera);
}
```

---

## 6. Complete 29-Facility Room Registry

Every entry has been calibrated using raycast collision testing so that OrbitControls targets the true room equipment with zero geometry clipping.

```typescript
export interface BharatiRoomEntry {
  id: string;
  name: string;
  level: "L1" | "L2" | "L3" | "L4" | "EXT";
  category: "Living" | "Command" | "LifeSupport" | "Power" | "Science" | "Logistics" | "External";
  position: [number, number, number]; // [X, Y, Z] in Three.js coordinates
  target: [number, number, number];   // [targetX, targetY, targetZ]
  center: [number, number, number];
  fov: number;
  minDistance: number;
  maxDistance: number;
  cutawayRoofRequired: boolean;
  description: string;
}

export const BHARATI_ROOM_REGISTRY: { [id: string]: BharatiRoomEntry } = {
  // ── LEVEL 03: LIVING, CONTROL & COMMAND ──
  lounge: {
    id: "lounge",
    name: "Main Observation Lounge",
    level: "L3",
    category: "Living",
    position: [-18.5, 8.8, 0.0],
    target: [-23.5, 8.2, 0.0],
    center: [-21.25, 8.4, -0.1],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "Panoramic west-facing observation bay overlooking Quilty Bay and Larsemann Hills icebergs.",
  },
  command_center: {
    id: "command_center",
    name: "Command & Radio Room",
    level: "L3",
    category: "Command",
    position: [7.8, 9.2, -6.0],
    target: [12.0, 8.6, -6.0],
    center: [10.0, 8.8, -6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Primary station operations console, satellite telecom, and emergency VHF communications.",
  },
  bms_server_room: {
    id: "bms_server_room",
    name: "BMS & SCADA NOC",
    level: "L3",
    category: "Command",
    position: [12.2, 9.2, -6.0],
    target: [15.5, 8.7, -6.0],
    center: [14.0, 8.8, -6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Central Building Management System, redundant telemetry servers, and optical networks.",
  },
  hospital: {
    id: "hospital",
    name: "Medical Clinic & OT",
    level: "L3",
    category: "LifeSupport",
    position: [15.8, 9.2, -5.0],
    target: [19.5, 8.6, -5.0],
    center: [18.0, 8.8, -5.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Station hospital, surgical operation theatre, and tele-medicine critical care bay.",
  },
  galley: {
    id: "galley",
    name: "Galley Kitchen",
    level: "L3",
    category: "Living",
    position: [7.8, 9.2, 6.0],
    target: [11.8, 8.5, 6.0],
    center: [10.0, 8.6, 6.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Commercial induction cooking line, dry storage access, and expedition nutrition prep.",
  },
  dining_mess: {
    id: "dining_mess",
    name: "Dining Mess Hall",
    level: "L3",
    category: "Living",
    position: [13.8, 9.3, 6.0],
    target: [19.0, 8.2, 6.0],
    center: [17.0, 8.6, 6.0],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "Main expedition dining mess hall with seating for 47 overwintering scientists and crew.",
  },
  sauna: {
    id: "sauna",
    name: "Finnish Sauna & Recovery",
    level: "L3",
    category: "Living",
    position: [20.8, 9.1, 6.0],
    target: [23.8, 8.7, 6.0],
    center: [22.5, 8.8, 6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.0,
    cutawayRoofRequired: true,
    description: "Electric cedar wood sauna, thermal shower, and polar physiological recovery bay.",
  },
  cabin_01: {
    id: "cabin_01",
    name: "Living Cabin 01 (North)",
    level: "L3",
    category: "Living",
    position: [-14.0, 9.0, -6.0],
    target: [-14.0, 8.6, -8.8],
    center: [-14.0, 8.8, -7.5],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Expedition accommodation module (insulated double-glazed window, desk, and warm berth).",
  },
  cabin_07: {
    id: "cabin_07",
    name: "Living Cabin 07 (North)",
    level: "L3",
    category: "Living",
    position: [5.2, 9.0, -6.0],
    target: [5.2, 8.6, -8.8],
    center: [5.2, 8.8, -7.5],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
  },
  cabin_08: {
    id: "cabin_08",
    name: "Living Cabin 08 (South)",
    level: "L3",
    category: "Living",
    position: [-14.0, 9.0, 6.0],
    target: [-14.0, 8.6, 8.8],
    center: [-14.0, 8.8, 7.5],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Expedition accommodation module (South Residential Corridor).",
  },
  cabin_14: {
    id: "cabin_14",
    name: "Living Cabin 14 (South)",
    level: "L3",
    category: "Living",
    position: [5.2, 9.0, 6.0],
    target: [5.2, 8.6, 8.8],
    center: [5.2, 8.8, 7.5],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Expedition accommodation module (South Residential Corridor).",
  },

  // ── LEVEL 02: CHPP POWER, WATER PLANT & LABS ──
  chpp_generators: {
    id: "chpp_generators",
    name: "CHPP Generator Hall",
    level: "L2",
    category: "Power",
    position: [-8.5, 6.0, 4.0],
    target: [-16.0, 5.0, 4.0],
    center: [-12.0, 5.2, 4.0],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "3x Combined Heat & Power Plant (Volvo Penta 280kVA GenSets) with hydronic heat recovery.",
  },
  fuel_day_tank: {
    id: "fuel_day_tank",
    name: "CHPP Fuel Day Tank Room",
    level: "L2",
    category: "Power",
    position: [-19.5, 5.8, 4.0],
    target: [-23.5, 4.8, 4.0],
    center: [-22.0, 5.0, 4.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "470L dual-wall day tank with auto-transfer fuel boost pumps and secondary bund containment.",
  },
  ro_water_plant: {
    id: "ro_water_plant",
    name: "RO Desalination Plant",
    level: "L2",
    category: "LifeSupport",
    position: [-17.2, 5.9, -4.0],
    target: [-22.5, 4.8, -4.0],
    center: [-20.0, 5.2, -4.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.5,
    cutawayRoofRequired: true,
    description: "Dual-train Reverse Osmosis plant converting Quilty Bay polar seawater into potable water.",
  },
  uv_disinfection: {
    id: "uv_disinfection",
    name: "Potable Water UV Disinfection",
    level: "L2",
    category: "LifeSupport",
    position: [-12.5, 5.6, -4.0],
    target: [-16.5, 4.8, -4.0],
    center: [-15.0, 5.0, -4.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Potable water pressurization skid, micron filtration, and continuous UV sterilization.",
  },
  mlvd_panel: {
    id: "mlvd_panel",
    name: "Main Low Voltage Switchgear",
    level: "L2",
    category: "Power",
    position: [-0.5, 5.6, 4.0],
    target: [3.8, 4.8, 4.0],
    center: [2.0, 5.0, 4.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "415V Main Low Voltage Distribution Switchgear with bus couplers and harmonic filters.",
  },
  ups_batteries: {
    id: "ups_batteries",
    name: "Emergency UPS Battery Room",
    level: "L2",
    category: "Power",
    position: [5.5, 5.6, 4.0],
    target: [9.8, 4.6, 4.0],
    center: [8.0, 5.0, 4.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Redundant LiFePO4 battery banks providing zero-transfer uninterruptible power supply.",
  },
  lab_bio: {
    id: "lab_bio",
    name: "Environmental & Biology Lab",
    level: "L2",
    category: "Science",
    position: [11.5, 5.6, -4.0],
    target: [16.0, 4.6, -4.0],
    center: [14.0, 5.0, -4.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Laminar airflow cabinets, cryogenic sample storage, and polar extremophile incubation.",
  },
  lab_geo: {
    id: "lab_geo",
    name: "Geoscience & Petrography Lab",
    level: "L2",
    category: "Science",
    position: [17.5, 5.6, -4.0],
    target: [22.0, 4.6, -4.0],
    center: [20.0, 5.0, -4.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Rock coring analyzers, petrographic microscopes, and Antarctic ice-drill analytics benches.",
  },

  // ── LEVEL 01: VEHICLE GARAGE & WORKSHOP ──
  garage_lift: {
    id: "garage_lift",
    name: "PistenBully Maintenance Bay",
    level: "L1",
    category: "Logistics",
    position: [-4.5, 2.4, 4.5],
    target: [-10.5, 1.5, 4.5],
    center: [-8.0, 1.8, 4.5],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "Heavy hydraulic scissor lift servicing tracked PistenBully snow groomers and snowmobiles.",
  },
  workshop_bench: {
    id: "workshop_bench",
    name: "Mechanical & Tool Workshop",
    level: "L1",
    category: "Logistics",
    position: [-10.0, 2.2, 8.0],
    target: [-14.5, 1.0, 8.0],
    center: [-13.0, 1.5, 8.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Heavy lathe, drill presses, TIG/MIG welding station, and precision pneumatic tooling.",
  },
  boot_wash: {
    id: "boot_wash",
    name: "Airlock & Mudroom Boot Wash",
    level: "L1",
    category: "Logistics",
    position: [3.8, 1.8, 7.0],
    target: [7.5, 0.8, 7.0],
    center: [6.0, 1.2, 7.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Thermal airlock barrier, heavy outdoor boot wash trough, and drying lockers.",
  },
  waste_baler: {
    id: "waste_baler",
    name: "Environmental Waste Compactor",
    level: "L1",
    category: "Logistics",
    position: [11.2, 2.2, 6.0],
    target: [15.5, 1.2, 6.0],
    center: [14.0, 1.6, 6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Hydraulic solid waste baler certified compliant with Madrid Environmental Protocol.",
  },

  // ── LEVEL 04: AHU & ROOFTOP TERRACE ──
  roof_terrace: {
    id: "roof_terrace",
    name: "Observation Roof Terrace",
    level: "L4",
    category: "Command",
    position: [-12.0, 21.0, 8.0],
    target: [6.11, 15.0, 0.0],
    center: [6.11, 15.7, 0.0],
    fov: 55,
    minDistance: 1.0,
    maxDistance: 40.0,
    cutawayRoofRequired: false,
    description: "Service penthouse enclosure, solar panel arrays, telemetry mast, and radome deck.",
  },
  radome_deck: {
    id: "radome_deck",
    name: "Satellite Radome Radials",
    level: "L4",
    category: "Command",
    position: [-6.0, 19.5, 10.0],
    target: [2.0, 15.0, 4.0],
    center: [2.0, 15.2, 4.0],
    fov: 55,
    minDistance: 1.0,
    maxDistance: 35.0,
    cutawayRoofRequired: false,
    description: "Dual C-band / Ku-band tracking radomes for round-the-clock Indian Space research comms.",
  },

  // ── EXTERIOR CAMPUS INFRASTRUCTURE ──
  seawater_pumphouse: {
    id: "seawater_pumphouse",
    name: "Seawater Intake Pumphouse",
    level: "EXT",
    category: "External",
    position: [-255.0, -22.0, -50.0],
    target: [-285.0, -32.0, -25.0],
    center: [-285.0, -32.21, -25.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Submerged suction intake in Quilty Bay with electric heat tracing protected down to -40°C.",
  },
  fuel_farm: {
    id: "fuel_farm",
    name: "Bulk Fuel Tank Farm",
    level: "EXT",
    category: "External",
    position: [-270.0, -18.0, 110.0],
    target: [-316.0, -32.0, 145.0],
    center: [-310.0, -32.25, 140.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 140.0,
    cutawayRoofRequired: false,
    description: "Aviation Turbine Fuel (ATF-50) bund containment storage for winter station survival.",
  },
  helipads: {
    id: "helipads",
    name: "Logistics Helipads (H1 & H2)",
    level: "EXT",
    category: "External",
    position: [80.0, 15.0, 120.0],
    target: [102.5, 0.5, 75.0],
    center: [102.5, 0.87, 75.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Dual Kamov Ka-32 / Bell 412 certified polar helipads with edge perimeter lighting.",
  },
  emergency_shelter: {
    id: "emergency_shelter",
    name: "Emergency Life Support Shelter",
    level: "EXT",
    category: "External",
    position: [-5.0, -4.0, -270.0],
    target: [-30.0, -14.0, -300.0],
    center: [-30.0, -14.0, -300.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Autonomous emergency survival refuge located 300m North of main complex.",
  },
};
```

---

## 7. Room Navigation & GSAP Camera Transitions

When the user selects any room from a menu or clickable HUD tag, the camera smoothly animates to that room's interior while managing OrbitControls and cutaway states.

```typescript
import gsap from "gsap";

export function navigateToRoom(
  room: BharatiRoomEntry,
  camera: THREE.PerspectiveCamera,
  controls: any,
  setCutaway: (active: boolean) => void
) {
  // 1. Toggle Roof Cutaway based on room requirement
  setCutaway(room.cutawayRoofRequired);

  // 2. Temporarily disable user controls to avoid tween fighting
  controls.enabled = false;
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);

  // 3. Smooth Camera Flight to Room Viewpoint
  gsap.to(camera.position, {
    x: room.position[0],
    y: room.position[1],
    z: room.position[2],
    duration: 1.6,
    ease: "power3.inOut",
  });

  // 4. Smooth Target Tracking to Room Equipment Center
  gsap.to(controls.target, {
    x: room.target[0],
    y: room.target[1],
    z: room.target[2],
    duration: 1.6,
    ease: "power3.inOut",
    onComplete: () => {
      // Re-enable controls with room-specific orbit constraints
      controls.enabled = true;
      controls.minDistance = room.minDistance;
      controls.maxDistance = room.maxDistance;
      controls.minPolarAngle = 0.1;
      controls.maxPolarAngle = Math.PI - 0.1;
      controls.enablePan = true;
    },
  });

  // 5. Smooth FOV Transition
  gsap.to(camera, {
    fov: room.fov,
    duration: 1.4,
    ease: "power2.inOut",
    onUpdate: () => camera.updateProjectionMatrix(),
  });
}
```

---

## 8. Elevated Lifeline Tours & Flow Animations

Bharati station's five vital life-support lifelines are animated via glTF Action clips. Instead of cutting through interior walls, each lifeline follows its authentic physical route from the exterior source into the building's utility inlets.

### The 5 Lifeline Systems
1. **Seawater Supply (`Loop_Water_Pulse`)**:
   * Quilty Bay Pumphouse `(-285, 25, -33.2)` overland along saddle pilings into `BHA-MEP-INLET-BOX-SEAWATER` on Level 02, feeding the RO plant and UV reactor.
2. **Bulk Fuel Pipeline (`Loop_Fuel_Pulse`)**:
   * Grovnes Fuel Farm `(-290, -140, -33.2)` overland along saddle pilings into `BHA-MEP-INLET-BOX-FUEL` on Level 02, feeding the 470L Day Tank and 3× GenSets.
3. **Power Grid (`Loop_Power_Pulse`)**:
   * CHPP GenSets -> Level 02 overhead ceiling cable trays -> MLVD panel -> South cable bridge down to the Helipads.
4. **Sewage Line (`Loop_Sewage_Pulse`)**:
   * Level 03 service riser -> MEP central vertical shaft -> Level 01 discharge.
5. **Heat-Trace Line (`Loop_HeatTrace_Pulse`)**:
   * Electric heat-trace cables paired alongside water and fuel pipes for continuous freeze protection down to $-40^\circ\text{C}$.

### Controlling Animations with Three.js AnimationMixer

```typescript
const mixer = new THREE.AnimationMixer(scene);
const actions: { [name: string]: THREE.AnimationAction } = {};

gltf.animations.forEach((clip) => {
  actions[clip.name] = mixer.clipAction(clip);
});

// Activate specific flow pulses during a tour stage:
export function setLifelineFlow(
  activeFlow: "water" | "fuel" | "power" | "sewage" | "all" | null
) {
  // Stop running clips
  Object.values(actions).forEach((act) => act.fadeOut(0.3));

  if (!activeFlow) return;

  const clipMap: { [key: string]: string[] } = {
    water: ["Loop_Water_Pulse"],
    fuel: ["Loop_Fuel_Pulse"],
    power: ["Loop_Power_Pulse"],
    sewage: ["Loop_Sewage_Pulse"],
    all: ["Loop_Water_Pulse", "Loop_Fuel_Pulse", "Loop_Power_Pulse", "Loop_Sewage_Pulse"],
  };

  const toPlay = clipMap[activeFlow] || [];
  toPlay.forEach((clipName) => {
    const act = actions[clipName];
    if (act) {
      act.reset().fadeIn(0.2).play();
    }
  });
}
```

---

## 9. Full Production React / Next.js Component Wiring

Below is the production component architecture used in `BharatiStationTwin.tsx`:

```tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
import { BHARATI_ROOM_REGISTRY, BharatiRoomEntry } from "@/components/BharatiStationTwin";

export function BharatiStationTwinViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRoom, setActiveRoom] = useState<BharatiRoomEntry | null>(null);
  const [isCutaway, setIsCutaway] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const cutawayStateRef = useRef({ targetOpacity: 1.0, currentOpacity: 1.0 });
  const cutawayMeshesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Toggle Cutaway Callback
  const handleCutawayToggle = useCallback((active: boolean) => {
    cutawayStateRef.current.targetOpacity = active ? 0.0 : 1.0;
    setIsCutaway(active);
  }, []);

  // Room Select Callback
  const handleRoomClick = useCallback((room: BharatiRoomEntry) => {
    setActiveRoom(room);
    handleCutawayToggle(room.cutawayRoofRequired);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    controls.enabled = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
      x: room.position[0],
      y: room.position[1],
      z: room.position[2],
      duration: 1.6,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: room.target[0],
      y: room.target[1],
      z: room.target[2],
      duration: 1.6,
      ease: "power3.inOut",
      onComplete: () => {
        controls.enabled = true;
        controls.minDistance = room.minDistance;
        controls.maxDistance = room.maxDistance;
      },
    });

    gsap.to(camera, {
      fov: room.fov,
      duration: 1.4,
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  }, [handleCutawayToggle]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a141e);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      2500
    );
    camera.position.set(-65, 38, 75);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 7.5, 0);
    controlsRef.current = controls;

    // 4. Polar Sun & Ambient
    scene.add(new THREE.AmbientLight(0x8eb5d0, 1.25));
    const sun = new THREE.DirectionalLight(0xfff7e6, 2.2);
    sun.position.set(120, 95, 140);
    sun.castShadow = true;
    scene.add(sun);

    // 5. Load Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const cutawayNames = [
      "Aerodynamic_Outer_Skin_Roof",
      "Roof_Central_Service_Enclosure",
      "Interior_Ceiling_Slab_Top",
      "Lounge_Ceiling_Grid",
      "Lounge_Ceiling_Light_Panels",
    ];

    gltfLoader.load(
      "/assets/bharati_digital_twin_compressed.glb",
      (gltf) => {
        setIsLoading(false);
        const root = gltf.scene;

        root.traverse((node: any) => {
          // Disable harsh embedded lights
          if (node.isLight) {
            node.visible = false;
            node.intensity = 0;
          }

          // Prepare cutaway transparent materials
          if (node.isMesh && cutawayNames.some((n) => node.name.includes(n))) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            const cloned = mats.map((m: any) => {
              const c = m.clone();
              c.transparent = true;
              c.opacity = 1.0;
              return c;
            });
            node.material = Array.isArray(node.material) ? cloned : cloned[0];
            cutawayMeshesRef.current.push(node);
          }
        });

        scene.add(root);

        // Setup Animation Mixer
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(root);
          mixerRef.current = mixer;
        }
      },
      (xhr) => {
        if (xhr.total > 0) setLoadPercent(Math.round((xhr.loaded / xhr.total) * 100));
      }
    );

    // 6. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    function renderLoop() {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();

      if (controlsRef.current?.enabled) controlsRef.current.update();
      if (mixerRef.current) mixerRef.current.update(delta);

      // Lerp Cutaway Opacity
      const state = cutawayStateRef.current;
      if (Math.abs(state.currentOpacity - state.targetOpacity) > 0.005) {
        state.currentOpacity = THREE.MathUtils.lerp(state.currentOpacity, state.targetOpacity, delta * 6.0);
        for (const mesh of cutawayMeshesRef.current) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            mat.opacity = state.currentOpacity;
            mat.depthWrite = state.currentOpacity > 0.5;
          }
          mesh.visible = state.currentOpacity > 0.02;
        }
      }

      renderer.render(scene, camera);
    }
    renderLoop();

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      dracoLoader.dispose();
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative w-full h-[750px] bg-[#0A141E] rounded-xl overflow-hidden border border-[#1E3A52]">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070D14]/90 backdrop-blur-md z-30">
          <div className="text-[#38BDF8] text-sm font-mono tracking-widest uppercase mb-3">
            Loading Bharati 3D Twin ({loadPercent}%)
          </div>
          <div className="w-64 h-1.5 bg-[#142638] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#00F0FF] transition-all" style={{ width: `${loadPercent}%` }} />
          </div>
        </div>
      )}

      {/* Top HUD Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <button
          onClick={() => handleCutawayToggle(!isCutaway)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
            isCutaway
              ? "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/50"
              : "bg-[#0D1B2A]/80 text-white/80 border-[#1E3A52] hover:bg-[#142638]"
          }`}
        >
          {isCutaway ? "Cutaway: ON" : "Cutaway: OFF"}
        </button>
      </div>

      {/* Room Selection Drawer (Bottom HUD) */}
      <div className="absolute bottom-4 inset-x-4 bg-[#070D14]/90 backdrop-blur-md p-3 rounded-xl border border-[#1E3A52] z-10 flex items-center gap-2 overflow-x-auto">
        {Object.values(BHARATI_ROOM_REGISTRY).map((room) => (
          <button
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
              activeRoom?.id === room.id
                ? "bg-[#00D4FF] text-[#050B14] font-semibold"
                : "bg-[#142638]/70 text-white/70 hover:text-white hover:bg-[#1E3A52]"
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. WebGL Performance & Optimization Best Practices

1. **Avoid High Device Pixel Ratios**:
   * Always clamp renderer pixel ratio using `Math.min(window.devicePixelRatio, 2.0)` to avoid rendering 9 million pixels on high-DPI (Retina/4K) screens.
2. **Never Add Punctual Point Lights Inside Rooms**:
   * Punctual point lights trigger multiple lighting passes in WebGL shaders. In Three.js, directional lights and ambient skylight provide clean PBR reflections at a fraction of the GPU draw cost.
3. **Handle Depth-Writing during Transparency**:
   * When fading cutaway meshes, disable `depthWrite` when `opacity < 0.5` (`mat.depthWrite = opacity > 0.5`). This avoids sorting glitches where interior furniture appears invisible behind transparent glass/roofing.
4. **Dispose Geometries and Textures on Unmount**:
   * Clean up WebGL resources when components unmount using `renderer.dispose()`, `dracoLoader.dispose()`, and recursively disposing mesh geometries and materials.
