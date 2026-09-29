"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
import {
  Compass,
  Waves,
  GasPump,
  Lightning,
  Cube,
  ArrowsClockwise,
  Eye,
  Camera,
  Sun,
  Moon,
  ArrowsIn,
  ArrowsOut,
  Play,
  Pause,
  CaretRight,
  CaretLeft,
  X,
  Gear,
  Cpu,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { StationHeaderBar } from "./StationHeaderBar";
import { RoomTelemetryCard } from "./RoomTelemetryCard";
import { TwinWhatIfSimulator, SimulationResultPayload } from "./TwinWhatIfSimulator";
import { StationSystemDock, SystemFacilityItem } from "./StationSystemDock";
import { PolarAtmosphereSystem } from "./PolarAtmosphereSystem";
import { StationOperationalPosture } from "./StationOperationalPostureBar";
import { polarAudio } from "@/lib/polarAudioEngine";
import { PolarOrbitalGlobeView } from "./PolarOrbitalGlobeView";
import { CinematicDroneDirector, CinematicDroneDirectorHandle } from "./CinematicDroneDirector";
import { MissionReportModal } from "./MissionReportModal";
import { StationAICommander } from "./StationAICommander";
import { FileText } from "@phosphor-icons/react";

export interface RoomEntry {
  id: string;
  name: string;
  category: "Science Labs" | "Operations" | "Medical & Living" | string;
  camera_name?: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  minDistance?: number;
  maxDistance?: number;
  description?: string;
}

export const MAITRI_MASTER_FACILITIES: Record<string, RoomEntry> = {
  room_powerhouse: {
    id: "room_powerhouse",
    name: "Powerhouse Generation Hall",
    category: "Operations",
    position: [15.00, -50.00, 3.5],
    target: [15.00, -53.20, 1.8],
    fov: 65,
    description: "3x Kirloskar-Cummins diesel generator sets (62.5 kVA each) supplying 415V 3-phase microgrid.",
  },
  lab_imd_meteo: {
    id: "lab_imd_meteo",
    name: "IMD Meteorological Observatory",
    category: "Science Labs",
    position: [6.95, 4.50, 4.15],
    target: [6.95, 5.66, 4.05],
    fov: 68,
    description: "AWS weather instrumentation recording katabatic winds, barometric pressure, and polar radiation.",
  },
  lab_comms_telemetry: {
    id: "lab_comms_telemetry",
    name: "Communications & Telemetry Center",
    category: "Science Labs",
    position: [3.35, 4.60, 4.15],
    target: [3.35, 5.86, 4.12],
    fov: 68,
    description: "High-latitude HF/VHF radios, satellite transceivers, and store-and-forward telemetry buffer.",
  },
  room_boiler: {
    id: "room_boiler",
    name: "Industrial Boiler & Heating Plant",
    category: "Operations",
    position: [12.20, 4.20, 4.25],
    target: [11.00, 5.80, 3.50],
    fov: 70,
    description: "Freshwater intake arrival, 500L DHW calorifiers, and Riello burner hydronic distribution.",
  },
  fuel_farm: {
    id: "fuel_farm",
    name: "Bulk Fuel Tank Farm",
    category: "Operations",
    position: [85.0, -35.0, 3.5],
    target: [85.0, -42.0, 1.5],
    fov: 62,
    description: "ISO tank containers and 50kL bulk fuel tanks holding Arctic ATF-50 diesel.",
  },
  lab_kamet_geomag: {
    id: "lab_kamet_geomag",
    name: "IIG Kamet Geomagnetic Observatory",
    category: "Science Labs",
    position: [-16.66, 114.70, 2.5],
    target: [-16.80, 115.86, 1.9],
    fov: 68,
    description: "Magnetic variometers recording Earth's 3-axis geomagnetic field and auroral currents.",
  },
  lab_ncpor_physics: {
    id: "lab_ncpor_physics",
    name: "NCPOR Atmospheric Physics Lab",
    category: "Science Labs",
    position: [-124.60, -34.40, 3.0],
    target: [-124.60, -33.00, 2.5],
    fov: 70,
    description: "Aerosol particle sizers, solar radiation flux monitors, and greenhouse gas analyzers.",
  },
  room_hospital: {
    id: "room_hospital",
    name: "Hospital & Surgical Suite",
    category: "Medical & Living",
    position: [-16.90, 3.00, 4.25],
    target: [-17.90, 6.80, 3.80],
    fov: 70,
    description: "Autonomous surgical operating theatre, telemedicine terminal, and critical care berths.",
  },
  room_stp: {
    id: "room_stp",
    name: "Central Sewage Treatment Facility",
    category: "Operations",
    position: [-75.00, -139.00, 3.5],
    target: [-75.00, -144.50, 2.2],
    fov: 68,
    description: "MBBR biological digestion, ultra-filtration, and UV sterilization adhering to Madrid Protocol.",
  },
  room_powerhouse_ravi: {
    id: "room_powerhouse_ravi",
    name: "Ravi Complex (4x 150 kVA Gensets)",
    category: "Operations",
    position: [12.00, -50.00, 3.5],
    target: [12.00, -53.20, 1.8],
    fov: 65,
    description: "Ravi Generator Complex housing 4x 150 kVA Kirloskar-Cummins heavy diesel sets supplying primary lead microgrid.",
  },
  room_powerhouse_surya: {
    id: "room_powerhouse_surya",
    name: "Surya Complex (4x 62.5 kVA Gensets)",
    category: "Operations",
    position: [18.00, -50.00, 3.5],
    target: [18.00, -53.20, 1.8],
    fov: 65,
    description: "Surya Generator Complex housing 4x 62.5 kVA diesel generator sets supplying mid-load microgrid circuits.",
  },
  room_powerhouse_aditya: {
    id: "room_powerhouse_aditya",
    name: "Aditya Complex (4x 62.5 kVA Gensets)",
    category: "Operations",
    position: [24.00, -50.00, 3.5],
    target: [24.00, -53.20, 1.8],
    fov: 65,
    description: "Aditya Generator Complex housing 4x 62.5 kVA auxiliary and emergency standby generators with cold-start preheaters.",
  },
  room_carpentry_waste: {
    id: "room_carpentry_waste",
    name: "Carpentry & Waste Management Room",
    category: "Operations",
    position: [-22.00, 4.20, 4.25],
    target: [-22.00, 5.80, 3.80],
    fov: 68,
    description: "Woodwork & carpentry shop, solid waste segregation bays, timber crating for backload, and hydraulic baler compliant with Madrid Protocol.",
  },
  room_dry_food: {
    id: "room_dry_food",
    name: "Dry Food Storage (9 Rations Bays)",
    category: "Operations",
    position: [-12.00, 4.20, 4.25],
    target: [-12.00, 5.80, 3.80],
    fov: 65,
    description: "9 segregated dry rations storage bays holding pulses, grains, canned food, and overwinter survival reserves for 540 days.",
  },
  room_cold_storage: {
    id: "room_cold_storage",
    name: "Dual -4°C Walk-In Deep Freezers",
    category: "Operations",
    position: [-7.50, 4.20, 4.25],
    target: [-7.50, 5.80, 3.80],
    fov: 65,
    description: "Dual redundant -4°C walk-in deep freezers (Freezer Unit 01 & 02) holding perishable cold-store expedition rations.",
  },
};

export interface TourStage {
  id: string;
  stageNumber: number;
  totalStages: number;
  title: string;
  badge: string;
  narrative: string;
  telemetry: { label: string; value: string; color?: string }[];
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  fov?: number;
}

export interface UtilityTour {
  id: string;
  index: number;
  label: string;
  clipName: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
  stages: TourStage[];
}

const UTILITY_TOURS: UtilityTour[] = [
  {
    id: "water",
    index: 0,
    label: "Freshwater Lifeline",
    clipName: "Water_Pulse_Flow",
    icon: Waves,
    color: "#00E5FF",
    badge: "LAKE TO BOILER",
    description: "280m insulated pipeline from Priyadarshini Lake intake pumphouse to boiler calorifier.",
    stages: [
      {
        id: "water_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "Priyadarshini Lake Sub-Ice Extraction",
        badge: "STAGE 1 · SUB-ICE INTAKE",
        narrative: "Potable water is drawn from 6 meters beneath the permanent surface ice sheet of Lake Priyadarshini. Submerged duplex suction strainers and 30 W/m self-regulating heat trace prevent frazil ice crystals from seeding into the impeller manifold.",
        telemetry: [
          { label: "Intake Temp", value: "+1.6°C", color: "#00E5FF" },
          { label: "Sub-Ice Depth", value: "6.2 m" },
          { label: "Trace Power", value: "30 W/m OK", color: "#00D4A0" },
        ],
        cameraPos: [-110, 32, -165],
        targetPos: [-80, 0, -125],
        fov: 60,
      },
      {
        id: "water_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "280m Overland Moraine Gantry",
        badge: "STAGE 2 · PERMAFROST BRIDGE",
        narrative: "Water travels 280 meters along an elevated steel gantry spanning uneven rocky moraine. A continuous 100mm closed-cell polyurethane thermal jacket and dual parallel heat-trace circuits maintain positive core velocity at -40°C blizzard ambient.",
        telemetry: [
          { label: "Flow Velocity", value: "1.65 m/s", color: "#00E5FF" },
          { label: "Thermal Drop", value: "< 0.8°C" },
          { label: "Freeze Risk", value: "0.0% SAFE", color: "#00D4A0" },
        ],
        cameraPos: [-45, 34, -90],
        targetPos: [-25, 2, -50],
        fov: 58,
      },
      {
        id: "water_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "Sliced Boiler Hall & Hot Calorifiers",
        badge: "STAGE 3 · SLICED MECHANICAL CORE",
        narrative: "With the station roof removed in X-Ray mode: incoming freshwater enters the mechanical wing into dual 1,000L hot water calorifiers. Secondary plate heat exchangers draw waste heat from the active diesel gensets and the central Riello fuel burner.",
        telemetry: [
          { label: "Calorifier Core", value: "+64.5°C", color: "#FFB703" },
          { label: "Thermal Reserve", value: "2,000 L" },
          { label: "System Pressure", value: "3.8 Bar" },
        ],
        cameraPos: [28, 26, 20],
        targetPos: [12, 4, -4],
        fov: 55,
      },
      {
        id: "water_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "Internal Corridor Distribution Grid",
        badge: "STAGE 4 · SLICED HABITAT LOOP",
        narrative: "The sliced cross-section exposes the central container corridor. Pressurized potable and domestic hot water recirculates 24/7 through under-floor utility trenches to the surgical clinic, galley mess, hygiene berths, and external science huts.",
        telemetry: [
          { label: "Daily Supply", value: "3,480 L/d", color: "#00E5FF" },
          { label: "Recirculation", value: "24/7 Loop" },
          { label: "Water Quality", value: "WHO Potable", color: "#00D4A0" },
        ],
        cameraPos: [-5, 38, -30],
        targetPos: [0, 4, -36],
        fov: 62,
      },
    ],
  },
  {
    id: "fuel",
    index: 1,
    label: "Fuel Supply Network",
    clipName: "Fuel_Pulse_Flow",
    icon: GasPump,
    color: "#FFB703",
    badge: "TANK FARM TO GENSET",
    description: "Double-walled amber fuel line from Bulk Tank Farm to Powerhouse gensets and Riello burner.",
    stages: [
      {
        id: "fuel_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "Bulk Tank Farm Storage",
        badge: "STAGE 1 · BULK CONTAINMENT",
        narrative: "Aviation-grade Arctic Diesel (ATF-50 with a -50°C pour point) is stored in double-walled bulk tanks on the southern pad. Interstitial vacuum monitoring ensures zero hydro-carbon escape into the fragile Antarctic permafrost.",
        telemetry: [
          { label: "Bulk Stock", value: "114,200 L", color: "#FFB703" },
          { label: "Fuel Grade", value: "ATF-50 (-50°C)" },
          { label: "Containment", value: "VACUUM OK", color: "#00D4A0" },
        ],
        cameraPos: [190, 32, 185],
        targetPos: [155, 1, 150],
        fov: 58,
      },
      {
        id: "fuel_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "Double-Walled Overland Transfer Line",
        badge: "STAGE 2 · PRESSURE TRANSFER",
        narrative: "Redundant explosion-proof transfer pumps propel fuel along an elevated gantry bridge. Continuous pressure-decay sensors detect micro-punctures within milliseconds, triggering automatic pneumatic isolation valves.",
        telemetry: [
          { label: "Pump Flow", value: "28 L/min", color: "#FFB703" },
          { label: "Line Pressure", value: "2.4 Bar" },
          { label: "Line Integrity", value: "100.0%", color: "#00D4A0" },
        ],
        cameraPos: [70, 28, 120],
        targetPos: [40, 2, 90],
        fov: 58,
      },
      {
        id: "fuel_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "Powerhouse Genset Day Tanks",
        badge: "STAGE 3 · POWERHOUSE INJECTION",
        narrative: "Fuel enters the powerhouse into 900-liter day tanks feeding 3x 62.5 kVA Kirloskar diesel generators. Dual coalescing centrifugal separators strip microscopic condensation to prevent injector freeze-up.",
        telemetry: [
          { label: "Day Tank Level", value: "93.4%", color: "#00D4A0" },
          { label: "Burn Rate", value: "18.2 L/h" },
          { label: "Genset Status", value: "N+1 READY" },
        ],
        cameraPos: [-40, 26, 105],
        targetPos: [-60, 2, 83],
        fov: 55,
      },
      {
        id: "fuel_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "Sliced Boiler Room Burner Injection",
        badge: "STAGE 4 · SLICED HYDRONIC HEATING",
        narrative: "Sliced cross-section into the heating wing: an amber branch line feeds the Riello dual-fuel burner, firing the primary hydronic boiler to circulate closed-loop glycol heat through perimeter radiators across the entire complex.",
        telemetry: [
          { label: "Thermal Output", value: "85 kW", color: "#FFB703" },
          { label: "Burner Eff.", value: "94.2%", color: "#00D4A0" },
          { label: "Glycol Supply", value: "+72.0°C" },
        ],
        cameraPos: [26, 25, 15],
        targetPos: [11, 4, -4],
        fov: 52,
      },
    ],
  },
  {
    id: "power",
    index: 3,
    label: "Electrical Power Grid",
    clipName: "Power_Pulse_Flow",
    icon: Lightning,
    color: "#F97316",
    badge: "415V 3-PHASE GRID",
    description: "Elevated gantry cable trays distributing power from 3x 62.5 kVA gensets to all science huts.",
    stages: [
      {
        id: "power_stage_1",
        stageNumber: 1,
        totalStages: 3,
        title: "Powerhouse 415V 3-Phase Generation",
        badge: "STAGE 1 · COGENERATION ALTERNATORS",
        narrative: "Three 62.5 kVA diesel alternators generate 415V 50Hz 3-phase electricity. An automated synchronizing switchboard handles active load balancing and bumpless transfer during generator maintenance rotations.",
        telemetry: [
          { label: "Grid Freq", value: "50.02 Hz", color: "#00D4A0" },
          { label: "Active Power", value: "112 kW", color: "#F97316" },
          { label: "Power Factor", value: "0.92" },
        ],
        cameraPos: [-40, 26, 105],
        targetPos: [-60, 2, 83],
        fov: 55,
      },
      {
        id: "power_stage_2",
        stageNumber: 2,
        totalStages: 3,
        title: "Elevated Cable Ladder Tray Bridge",
        badge: "STAGE 2 · ELEVATED CABLE TRAY",
        narrative: "Armored 4-core XLPE distribution feeders span from the powerhouse to the main complex across an elevated hot-dip galvanized ladder tray raised 1.5m above ground to eliminate snow drift encasement.",
        telemetry: [
          { label: "Feeder Cable", value: "4C-120mm²" },
          { label: "Voltage Drop", value: "< 1.2%", color: "#00D4A0" },
          { label: "Clearance", value: "1.5m Above Snow" },
        ],
        cameraPos: [-20, 28, 55],
        targetPos: [-10, 2, 30],
        fov: 56,
      },
      {
        id: "power_stage_3",
        stageNumber: 3,
        totalStages: 3,
        title: "Sliced Main Distribution Board (MDB)",
        badge: "STAGE 3 · SLICED CRITICAL RISER",
        narrative: "Looking down into the sliced electrical control room: the Main Distribution Board segments critical life support (heat-trace circuits, boiler hydronic pumps, surgical life support) onto uninterruptible battery-backed buses.",
        telemetry: [
          { label: "Critical Bus", value: "ENERGIZED", color: "#00D4A0" },
          { label: "Battery UPS", value: "45 min Reserve" },
          { label: "Isolation", value: "100 MΩ OK" },
        ],
        cameraPos: [26, 26, 14],
        targetPos: [14, 4, -3.6],
        fov: 52,
      },
    ],
  },
  {
    id: "sewage",
    index: 2,
    label: "Wastewater / STP Run",
    clipName: "Sewage_Pulse_Flow",
    icon: Gear,
    color: "#00D4A0",
    badge: "MADRID PROTOCOL",
    description: "180m insulated sewer line descending moraine slopes to Central Sewage Treatment Facility.",
    stages: [
      {
        id: "sewage_stage_1",
        stageNumber: 1,
        totalStages: 3,
        title: "Internal Gravity Waste Drainage",
        badge: "STAGE 1 · SLICED GRAVITY RISERS",
        narrative: "Interior view into the sliced living quarters: greywater from showers and galley plus blackwater drop through insulated vertical stacks inside the internal service core, jacketed by self-regulating trace heaters.",
        telemetry: [
          { label: "Daily Discharge", value: "3,200 L/d" },
          { label: "Drain Slope", value: "1:40 Gravity" },
          { label: "Stack Temp", value: "+19.2°C", color: "#00D4A0" },
        ],
        cameraPos: [-5, 34, -20],
        targetPos: [0, 4, -25],
        fov: 58,
      },
      {
        id: "sewage_stage_2",
        stageNumber: 2,
        totalStages: 3,
        title: "180m Moraine Slope Outfall Descent",
        badge: "STAGE 2 · HEATED MORAINE DESCENT",
        narrative: "The 4-inch insulated Schedule 40 HDPE sewer pipeline descends rocky moraine slopes at a uniform 4.5% gravity grade. Continuous 40 W/m heavy-duty heat tracing eliminates freeze blockage along the slope.",
        telemetry: [
          { label: "Slope Grade", value: "4.5% Gravity" },
          { label: "Run Length", value: "180 m" },
          { label: "Heat-Trace", value: "40 W/m OK", color: "#00D4A0" },
        ],
        cameraPos: [-10, 30, 75],
        targetPos: [-30, 2, 85],
        fov: 58,
      },
      {
        id: "sewage_stage_3",
        stageNumber: 3,
        totalStages: 3,
        title: "Central Biological STP (MBBR Facility)",
        badge: "STAGE 3 · BIO-REACTOR TREATMENT",
        narrative: "Moving Bed Biofilm Reactor (MBBR) biological digestion tanks break down organic material. Effluent undergoes secondary ultrafiltration and high-intensity UV disinfection before discharge in 100% compliance with Madrid Environmental Protocol.",
        telemetry: [
          { label: "BOD Reduction", value: "98.4%", color: "#00D4A0" },
          { label: "UV Sterilization", value: "40 mJ/cm²" },
          { label: "Protocol", value: "MADRID COMPLIANT", color: "#00D4A0" },
        ],
        cameraPos: [-65, 24, 125],
        targetPos: [-75, 1, 140],
        fov: 54,
      },
    ],
  },
  {
    id: "all_pulse",
    index: 4,
    label: "All Lifeline Flows",
    clipName: "Maitri_All_Systems_Pulse_Loop",
    icon: ArrowsClockwise,
    color: "#0DB9D0",
    badge: "ACTIVE SIMULATION",
    description: "Real-time fluid and electrical energy transmission running through all physical pipelines.",
    stages: [
      {
        id: "all_stage_1",
        stageNumber: 1,
        totalStages: 2,
        title: "All Lifeline Networks (Macro X-Ray View)",
        badge: "STAGE 1 · MACRO SYNCHRONY",
        narrative: "High elevated overview with the station roof removed in X-Ray mode: all 5 lifelines (Freshwater, Fuel, Power, Sewage, Heat-Tracing) pulsate simultaneously in real-time coordination, simulating complete station thermodynamic and fluid dynamics.",
        telemetry: [
          { label: "Simulated Lines", value: "5 / 5 Active", color: "#0DB9D0" },
          { label: "Roof State", value: "Removed" },
          { label: "System Health", value: "NOMINAL", color: "#00D4A0" },
        ],
        cameraPos: [-65, 46, 65],
        targetPos: [0, 4, -20],
        fov: 62,
      },
      {
        id: "all_stage_2",
        stageNumber: 2,
        totalStages: 2,
        title: "Integrated CHP & Thermal Energy Loop",
        badge: "STAGE 2 · HEAT RECOVERY COUPLING",
        narrative: "Elevated close-in view of the mechanical intersection: hot engine jacket water from the generators couples with the central boiler calorifiers, pre-heating the incoming lake freshwater and supplying heat-trace circuits.",
        telemetry: [
          { label: "Heat Recovery", value: "48 kW Thermal", color: "#FFB703" },
          { label: "Thermal Loop", value: "+68.0°C" },
          { label: "Fuel Saved", value: "22% Annually", color: "#00D4A0" },
        ],
        cameraPos: [25, 32, 10],
        targetPos: [8, 4, 0],
        fov: 55,
      },
    ],
  },
];

// Helper to convert Blender (X, Y, Z_height) to Three.js glTF (X, Z_height, -Y)
function blenderToThreeCoords(coords: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(coords[0], coords[2], -coords[1]);
}

interface MaitriStationTwinProps {
  className?: string;
  initialMode?: "overview" | "flows" | "rooms";
  selectedRoomId?: string;
  enableFullscreenButton?: boolean;
  onRoomSelect?: (roomId: string) => void;
}

export function MaitriStationTwin({
  className = "w-full h-full min-h-[680px]",
  enableFullscreenButton = true,
  onRoomSelect,
}: MaitriStationTwinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [name: string]: THREE.AnimationAction }>({});
  const clipsRef = useRef<THREE.AnimationClip[]>([]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const roomRegistryRef = useRef<{ [id: string]: RoomEntry }>({});
  const interiorLightsRef = useRef<{ [id: string]: THREE.PointLight }>({});
  const lakeMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const mainRoofRef = useRef<THREE.Object3D | null>(null);
  const lastFovRef = useRef<number>(65);

  // Lighting References for Dynamic Transitions
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const atmosphereRef = useRef<PolarAtmosphereSystem | null>(null);

  // Active Tour Camera Tracking State (Disabled for smooth elevated view)
  const activeTourCameraNodeRef = useRef<THREE.Object3D | null>(null);

  // Flow Shader Category Uniforms (Isolated per Lifeline)
  const flowTimeUniformRef = useRef<{ value: number }>({ value: 0 });
  const flowCategoryUniformsRef = useRef<{
    water: { value: number };
    fuel: { value: number };
    power: { value: number };
    sewage: { value: number };
    heattrace: { value: number };
  }>({
    water: { value: 0.0 },
    fuel: { value: 0.0 },
    power: { value: 0.0 },
    sewage: { value: 0.0 },
    heattrace: { value: 0.0 },
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeMode, setActiveMode] = useState<"overview" | "flows" | "rooms">("overview");
  const [activeTourIndex, setActiveTourIndex] = useState<number | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [autoPlayTour, setAutoPlayTour] = useState<boolean>(true);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [isStoryCardVisible, setIsStoryCardVisible] = useState<boolean>(true);
  const [isStoryCardCollapsed, setIsStoryCardCollapsed] = useState<boolean>(false);
  const [activeRoom, setActiveRoom] = useState<RoomEntry | null>(null);
  const [roomCategory, setRoomCategory] = useState<"All" | "Science Labs" | "Operations" | "Medical & Living">("All");
  const [roofLifted, setRoofLifted] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightingMode, setLightingMode] = useState<"SUN" | "AURORA" | "NIGHT">("SUN");
  const [activeSimulation, setActiveSimulation] = useState<SimulationResultPayload | null>(null);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  const [isOrbitalViewOpen, setIsOrbitalViewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAICommanderOpen, setIsAICommanderOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBoilerHeatingActive, setIsBoilerHeatingActive] = useState(false);
  const [currentPosture, setCurrentPosture] = useState<StationOperationalPosture>("NOMINAL");
  const heatingPipesGroupRef = useRef<THREE.Group | null>(null);
  const heatingShaderUniformsRef = useRef<{ uTime: { value: number }; uActive: { value: number } }>({
    uTime: { value: 0 },
    uActive: { value: 0 },
  });
  const droneDirectorRef = useRef<CinematicDroneDirectorHandle | null>(null);

  // ── DYNAMIC 3D SCENE & ATMOSPHERE REACTION TO OPERATIONAL POSTURE DIRECTIVES ──
  const handleSelectPosture = useCallback((posture: StationOperationalPosture) => {
    setCurrentPosture(posture);
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    switch (posture) {
      case "BLIZZARD_LOCKDOWN": {
        if (atmosphereRef.current) {
          atmosphereRef.current.setBlizzard(true);
          atmosphereRef.current.setWindSpeed(115);
        }
        polarAudio.setBlizzard(true);
        heatingShaderUniformsRef.current.uActive.value = 1.0;
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 0.55;
          sunLightRef.current.color.set(0x80a8c8);
        }
        scene.fog = new THREE.FogExp2(0x0e1b2e, 0.005);
        break;
      }
      case "ENERGY_CONSERVATION": {
        if (atmosphereRef.current) {
          atmosphereRef.current.setBlizzard(false);
          atmosphereRef.current.setWindSpeed(25);
        }
        polarAudio.setBlizzard(false);
        heatingShaderUniformsRef.current.uActive.value = 0.45;
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 1.1;
          sunLightRef.current.color.set(0xffeedd);
        }
        scene.fog = new THREE.FogExp2(0x7db4db, 0.0012);
        Object.values(interiorLightsRef.current).forEach((light) => {
          light.intensity = 0.8;
        });
        break;
      }
      case "DEEP_SCIENCE": {
        if (atmosphereRef.current) {
          atmosphereRef.current.setBlizzard(false);
          atmosphereRef.current.setWindSpeed(20);
        }
        polarAudio.setBlizzard(false);
        heatingShaderUniformsRef.current.uActive.value = 0.8;
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 1.35;
          sunLightRef.current.color.set(0xfff7ee);
        }
        scene.fog = new THREE.FogExp2(0x7db4db, 0.001);
        break;
      }
      case "BLACK_START": {
        if (atmosphereRef.current) {
          atmosphereRef.current.setBlizzard(false);
          atmosphereRef.current.setWindSpeed(30);
        }
        polarAudio.setBlizzard(false);
        heatingShaderUniformsRef.current.uActive.value = 0.3;
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 0.25;
          sunLightRef.current.color.set(0xff6622);
        }
        scene.fog = new THREE.FogExp2(0x050810, 0.006);
        Object.values(interiorLightsRef.current).forEach((light) => {
          light.color.setHex(0xff5500);
          light.intensity = 0.5;
        });
        break;
      }
      case "NOMINAL":
      default: {
        if (atmosphereRef.current) {
          atmosphereRef.current.setBlizzard(false);
          atmosphereRef.current.setWindSpeed(28);
        }
        polarAudio.setBlizzard(false);
        heatingShaderUniformsRef.current.uActive.value = isBoilerHeatingActive ? 1.0 : 0.0;
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 1.35;
          sunLightRef.current.color.set(0xfff7ee);
        }
        scene.fog = new THREE.FogExp2(0x7db4db, 0.0012);
        Object.values(interiorLightsRef.current).forEach((light) => {
          light.color.setHex(0xffe8d6);
          light.intensity = 1.5;
        });
        break;
      }
    }
  }, [isBoilerHeatingActive]);

  // ── PHYSICAL THREE.JS SCENE REACTIONS TO WHAT-IF SIMULATION CRISES ──
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (!activeSimulation) {
      if (lightingMode === "SUN") {
        scene.background = new THREE.Color("#7db4db");
        scene.fog = new THREE.FogExp2(0x7db4db, 0.0012);
        if (sunLightRef.current) {
          sunLightRef.current.intensity = 1.35;
          sunLightRef.current.color.set(0xfff7ee);
        }
      }
      flowCategoryUniformsRef.current.heattrace.value = 0.0;
      return;
    }

    if (activeSimulation.scenarioId === "EXTREME_WEATHER") {
      // Katabatic Blizzard (-40°C): Dense ice fog, howling dim storm lighting, boosted heat-trace line
      scene.background = new THREE.Color("#081220");
      scene.fog = new THREE.FogExp2(0x0e1b2e, 0.0045);
      if (sunLightRef.current) {
        sunLightRef.current.intensity = 0.7;
        sunLightRef.current.color.set(0x88b0d0);
      }
      flowCategoryUniformsRef.current.heattrace.value = 2.5;
    } else if (activeSimulation.scenarioId === "GENERATOR_FAILURE") {
      // GenSet Failure: Remove roof to reveal station interior
      if (!roofLifted && mainRoofRef.current) {
        mainRoofRef.current.visible = false;
        mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
        setRoofLifted(true);
      }
      if (sunLightRef.current) {
        sunLightRef.current.intensity = 0.9;
      }
    }
  }, [activeSimulation, lightingMode, roofLifted]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // 1. Scene with Natural Polar Atmosphere
    const scene = new THREE.Scene();
    const polarSkyColor = new THREE.Color("#7db4db");
    scene.background = polarSkyColor;
    scene.fog = new THREE.FogExp2(0x7db4db, 0.0012);
    sceneRef.current = scene;

    // 2. Camera with 0.05m near plane
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.05, 2500);
    camera.position.set(-90, 60, 120);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmic Tone Mapping and High-Performance Configuration
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Natural Polar Environment Map (PMREM) for PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const envScene = new THREE.Scene();
    const envHemi = new THREE.HemisphereLight(0xd0e6fa, 0x90a8bd, 0.5);
    envScene.add(envHemi);
    const envSun = new THREE.DirectionalLight(0xfffaee, 0.7);
    envSun.position.set(1, 0.8, 1);
    envScene.add(envSun);
    const envRT = pmremGenerator.fromScene(envScene);
    scene.environment = envRT.texture;

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 3, 0);
    controls.minDistance = 2.0;
    controls.maxDistance = 500.0;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controlsRef.current = controls;

    // 6. Natural Polar Outdoor Lighting
    const hemiLight = new THREE.HemisphereLight(0xdcf0ff, 0x8ea6ba, 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ee, 1.35);
    sunLight.position.set(130, 75, 95);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 450;
    sunLight.shadow.camera.left = -160;
    sunLight.shadow.camera.right = 160;
    sunLight.shadow.camera.top = 160;
    sunLight.shadow.camera.bottom = -160;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.04;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6.2 Hydronic Boiler Room Heating Pipeline Network (Animated Orange Flow)
    const heatingPipesGroup = new THREE.Group();
    heatingPipesGroup.name = "Maitri_Boiler_Hydronic_Heating_Network";
    heatingPipesGroup.visible = false;

    const heatingMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: heatingShaderUniformsRef.current.uTime,
        uActive: heatingShaderUniformsRef.current.uActive,
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uActive;
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          if (uActive < 0.01) discard;
          float wave = sin(vUv.x * 24.0 - uTime * 6.5);
          float pulse = smoothstep(0.1, 0.9, wave);
          vec3 baseOrange = vec3(1.0, 0.40, 0.0); // Vibrant Neon Orange
          vec3 glowHot = vec3(1.0, 0.92, 0.28);   // Molten Gold/Yellow
          vec3 col = mix(baseOrange, glowHot, pulse);
          float alpha = (0.85 + pulse * 0.15) * uActive;
          gl_FragColor = vec4(col * (1.2 + pulse * 1.8), alpha);
        }
      `,
      side: THREE.DoubleSide,
    });

    const segments: [number, number, number][][] = [
      // 1. Central Connecting Cross-Corridor Header (spans full width between wings at Z = -5.5)
      [
        [-24.0, 4.35, -5.5],
        [-12.0, 4.35, -5.5],
        [0.0, 4.35, -5.5],
        [12.2, 4.35, -5.5],
        [24.0, 4.35, -5.5],
      ],
      // 2. West Wing Main Hydronic Supply Trunk (Hospital, Kitchen, Food Storage, Cabins to Z = -68)
      [
        [-24.0, 4.35, -5.5],
        [-24.0, 4.35, -20.0],
        [-24.0, 4.35, -38.0],
        [-24.0, 4.35, -54.0],
        [-24.0, 4.35, -68.0],
      ],
      // 3. East Wing Main Hydronic Supply Trunk (Boiler Core, Science Labs, Geophysics to Z = -68)
      [
        [24.0, 4.35, -5.5],
        [24.0, 4.35, -20.0],
        [24.0, 4.35, -38.0],
        [24.0, 4.35, -54.0],
        [24.0, 4.35, -68.0],
      ],
      // 4. North Wing Rear Interconnect (connects rear of both wings at Z = -68)
      [
        [-24.0, 4.35, -68.0],
        [-12.0, 4.35, -68.0],
        [0.0, 4.35, -68.0],
        [12.0, 4.35, -68.0],
        [24.0, 4.35, -68.0],
      ],
      // 5. Central Habitation Block Radiator Spine
      [
        [0.0, 4.35, -5.5],
        [0.0, 4.35, -22.0],
        [0.0, 4.35, -38.0],
        [0.0, 4.35, -54.0],
        [0.0, 4.35, -68.0],
      ],
      // 6. Central Boiler Room Calorifiers & Riello Burner Manifold
      [
        [12.2, 4.35, -4.2],
        [12.2, 4.35, -5.5],
        [20.0, 4.35, -5.5],
        [20.0, 4.35, -7.5],
      ],
      // 7. IMD Meteorological Observatory Radiator Branch
      [
        [6.95, 4.35, -5.5],
        [6.95, 4.35, -4.2],
        [6.95, 4.35, -3.2],
      ],
      // 8. Communications & Telemetry NOC Radiator Branch
      [
        [3.35, 4.35, -5.5],
        [3.35, 4.35, -4.2],
        [3.35, 4.35, -3.2],
      ],
      // 9. Hospital & Surgical OT Sterile Radiators Loop
      [
        [-16.9, 4.35, -5.5],
        [-16.9, 4.35, -4.2],
        [-18.5, 4.35, -4.2],
        [-18.5, 4.35, -3.0],
      ],
      // 10. Galley Kitchen & Dining Mess Heating Loop
      [
        [-23.6, 4.35, -5.5],
        [-23.6, 4.35, -4.2],
        [-23.6, 4.35, -3.0],
      ],
      // 11. Dual -4°C Cold Storage & Dry Food Frost Protection
      [
        [-24.0, 4.35, -20.0],
        [-18.0, 4.35, -20.0],
        [-18.0, 4.35, -26.0],
        [-24.0, 4.35, -26.0],
      ],
      // 12. East Wing Science Labs & Geophysics Wing Branches
      [
        [24.0, 4.35, -25.0],
        [18.0, 4.35, -25.0],
      ],
      [
        [24.0, 4.35, -45.0],
        [18.0, 4.35, -45.0],
      ],
      // 13. Combined Heat & Power (CHP) Waste Heat Coupling to Powerhouse
      [
        [12.2, 4.35, -5.5],
        [14.0, 3.8, 5.0],
        [14.5, 3.0, 25.0],
        [15.0, 2.2, 50.0],
      ],
      // 14. Lake Priyadarshini Heated Gantry Ingress Line
      [
        [-84.1, 1.2, -127.1],
        [-57.4, 2.0, -107.6],
        [-24.0, 3.8, -71.4],
        [12.2, 4.35, -5.5],
      ],
    ];

    segments.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
      const geom = new THREE.TubeGeometry(curve, 64, 0.28, 8, false);
      const mesh = new THREE.Mesh(geom, heatingMaterial);
      mesh.renderOrder = 60;
      heatingPipesGroup.add(mesh);
    });

    scene.add(heatingPipesGroup);
    heatingPipesGroupRef.current = heatingPipesGroup;

    // 7. Pipeline Flow Shader (High-Performance Isolated Single-Compile Shader)
    const applyPipelineFlowShader = (
      material: THREE.Material,
      colorHex: string,
      direction: THREE.Vector3,
      category: "water" | "fuel" | "power" | "sewage" | "heattrace",
      speed: number = 4.0,
      frequency: number = 0.25,
      pulseIntensity: number = 2.2
    ) => {
      if ((material as any).userData?.flowCompiled) return;
      (material as any).userData.flowCompiled = true;

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = flowTimeUniformRef.current;
        shader.uniforms.uFlowActive = flowCategoryUniformsRef.current[category];
        shader.uniforms.uHeatingActive = heatingShaderUniformsRef.current.uActive;
        shader.uniforms.uFlowColor = { value: new THREE.Color(colorHex) };
        shader.uniforms.uFlowDir = { value: direction.clone().normalize() };
        shader.uniforms.uFlowSpeed = { value: speed };
        shader.uniforms.uFlowFreq = { value: frequency };
        shader.uniforms.uPulseIntensity = { value: pulseIntensity };

        shader.vertexShader = `
          varying vec3 vFlowWorldPos;
          ${shader.vertexShader}
        `.replace(
          "#include <worldpos_vertex>",
          `
          #include <worldpos_vertex>
          vFlowWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `
        );

        shader.fragmentShader = `
          uniform float uTime;
          uniform float uFlowActive;
          uniform float uHeatingActive;
          uniform vec3 uFlowColor;
          uniform vec3 uFlowDir;
          uniform float uFlowSpeed;
          uniform float uFlowFreq;
          uniform float uPulseIntensity;
          varying vec3 vFlowWorldPos;
          ${shader.fragmentShader}
        `.replace(
          "#include <dithering_fragment>",
          `
          #include <dithering_fragment>
          if (uFlowActive > 0.01) {
            float flowDist = dot(vFlowWorldPos, uFlowDir);
            float wave = sin(flowDist * uFlowFreq - uTime * uFlowSpeed);
            float pulse = smoothstep(0.35, 0.95, wave) * uFlowActive;
            vec3 fluidGlow = uFlowColor * (0.08 * uFlowActive + pulse * uPulseIntensity);
            gl_FragColor.rgb += fluidGlow;
          }
          if (uHeatingActive > 0.01) {
            // Radiant Hydronic Heating Pulse through all connected station pipes
            float heatDist = vFlowWorldPos.x * 0.7 + vFlowWorldPos.z * 0.7;
            float heatWave = sin(heatDist * 0.5 - uTime * 6.5);
            float heatPulse = smoothstep(0.12, 0.9, heatWave);
            vec3 neonOrange = vec3(1.0, 0.40, 0.0);
            vec3 moltenGold = vec3(1.0, 0.92, 0.28);
            vec3 heatCol = mix(neonOrange, moltenGold, heatPulse);
            gl_FragColor.rgb += heatCol * (0.55 * uHeatingActive + heatPulse * 4.2);
          }
          `
        );
      };
    };

    // 8. Load GLTF Digital Twin Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const glbUrl = "/assets/maitri_digital_twin_compressed.glb";

    gltfLoader.load(
      glbUrl,
      (gltf) => {
        const root = gltf.scene;
        scene.add(root);

        mainRoofRef.current = root.getObjectByName("Maitri_Building_Main_Roof") || null;
        if (mainRoofRef.current) {
          mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
          mainRoofRef.current.visible = true;
        }

        // Hide standalone floating spheres
        const standaloneSpheres = [
          "Maitri_Water_Flow_Pulse",
          "Maitri_Fuel_Flow_Pulse",
          "Maitri_Sewage_Flow_Pulse",
          "Maitri_Power_Flow_Pulse",
          "Maitri_HeatTrace_Flow_Pulse",
        ];
        standaloneSpheres.forEach((sphereName) => {
          const sphereNode = root.getObjectByName(sphereName);
          if (sphereNode) sphereNode.visible = false;
        });

        // Traverse scene and calibrate materials & lights
        root.traverse((node: any) => {
          // Disable rogue Blender default light
          if (node.isLight) {
            if (node.name === "Light" || node.intensity > 10000) {
              node.visible = false;
              node.intensity = 0.0;
            }
          }

          if (node.isMesh) {
            const meshName = node.name || "";
            const mat = node.material;

            // Selective Shadow Optimization
            if (meshName.includes("Terrain")) {
              node.castShadow = false;
              node.receiveShadow = true;
            } else if (
              meshName.includes("Building") ||
              meshName.includes("Tank") ||
              meshName.includes("Hut") ||
              meshName.includes("Powerhouse") ||
              meshName.includes("STP") ||
              meshName.includes("Boiler")
            ) {
              node.castShadow = true;
              node.receiveShadow = true;
            } else {
              node.castShadow = false;
              node.receiveShadow = true;
            }

            if (mat) {
              const mats = Array.isArray(mat) ? mat : [mat];
              mats.forEach((m: any) => {
                const matName = m.name || "";

                if (
                  matName.includes("Screen") ||
                  matName.includes("Display") ||
                  matName.includes("TexRack") ||
                  matName.includes("TexAllSky") ||
                  matName.includes("Data_Logger") ||
                  matName.includes("Waveforms") ||
                  matName.includes("Radar") ||
                  matName.includes("ECGMonitor")
                ) {
                  m.emissiveIntensity = 0.35;
                  m.roughness = 0.35;
                  m.needsUpdate = true;
                }

                if (
                  matName.includes("Corridor_Wall") ||
                  matName.includes("Roof_White") ||
                  matName.includes("Wall_Trim") ||
                  matName.includes("Ceiling") ||
                  matName.includes("Cabin_Wall") ||
                  matName.includes("Hospital_ClinicalWall") ||
                  matName.includes("Kitchen_TiledWall")
                ) {
                  m.roughness = 0.8;
                  m.metalness = 0.02;
                  m.needsUpdate = true;
                }
              });
            }

            // Pristine Antarctic Snow Terrain
            if (meshName.includes("Terrain") || meshName.includes("Snow") || (mat && mat.name && mat.name.includes("Snow"))) {
              if (mat && !Array.isArray(mat)) {
                mat.color = new THREE.Color("#ffffff");
                mat.roughness = 0.9;
                mat.metalness = 0.0;
                mat.needsUpdate = true;
              }
            }

            // Lake Priyadarshini Glacial Turquoise Water
            if (meshName.includes("Lake") || meshName.includes("Priyadarshini")) {
              node.castShadow = false;
              node.receiveShadow = false;
              if (mat && !Array.isArray(mat)) {
                mat.color = new THREE.Color("#086888");
                mat.roughness = 0.05;
                mat.metalness = 0.15;
                if ((mat as any).clearcoat !== undefined) {
                  (mat as any).clearcoat = 1.0;
                  (mat as any).clearcoatRoughness = 0.04;
                }
                if (mat.normalMap) {
                  mat.normalMap.wrapS = THREE.RepeatWrapping;
                  mat.normalMap.wrapT = THREE.RepeatWrapping;
                  mat.normalMap.repeat.set(4, 4);
                }
                lakeMaterialRef.current = mat;
              }
            }

            // Pipeline Flow Shaders (Connected Physical Utility Networks + Hydronic Heating)
            const lowerMesh = meshName.toLowerCase();
            const mats = Array.isArray(mat) ? mat : [mat];
            const hasMat = (kw: string) => mats.some((m: any) => (m?.name || "").toLowerCase().includes(kw));

            // Water, Boiler Hydronic Heating & HeatTrace Lines (Lake intake gantry, distribution grid, boiler headers, DHW calorifiers)
            if (
              lowerMesh.includes("pipe") ||
              lowerMesh.includes("water") ||
              lowerMesh.includes("boiler") ||
              lowerMesh.includes("heating") ||
              lowerMesh.includes("dhw") ||
              lowerMesh.includes("header") ||
              lowerMesh.includes("calorifier") ||
              lowerMesh.includes("heattrace") ||
              hasMat("water") ||
              hasMat("heating") ||
              hasMat("boiler") ||
              hasMat("dhw") ||
              hasMat("heattrace") ||
              hasMat("hot_water") ||
              hasMat("cold_water") ||
              hasMat("jacket")
            ) {
              const waterDir = new THREE.Vector3(106, 5, 119).normalize();
              mats.forEach((m: any) => {
                if (m) applyPipelineFlowShader(m, "#00E5FF", waterDir, "water", 4.5, 0.25, 2.2);
              });
            }

            // Bulk Fuel Piping
            if (
              lowerMesh.includes("fuel") ||
              hasMat("fuel")
            ) {
              const fuelDir = new THREE.Vector3(-145, 0.8, -100).normalize();
              mats.forEach((m: any) => {
                if (m) applyPipelineFlowShader(m, "#FFB703", fuelDir, "fuel", 4.0, 0.25, 2.2);
              });
            }

            // Sewage & Greywater Drainage
            if (
              lowerMesh.includes("sewage") ||
              lowerMesh.includes("greywater") ||
              lowerMesh.includes("waste") ||
              hasMat("greywater") ||
              hasMat("sewage")
            ) {
              const sewageDir = new THREE.Vector3(-93, -0.5, 143).normalize();
              mats.forEach((m: any) => {
                if (m) applyPipelineFlowShader(m, "#00D4A0", sewageDir, "sewage", 4.0, 0.22, 2.0);
              });
            }

            // Electrical Power Trays & Cabling
            if (
              lowerMesh.includes("power") ||
              lowerMesh.includes("cable") ||
              lowerMesh.includes("ladder") ||
              lowerMesh.includes("tray") ||
              hasMat("wire") ||
              hasMat("cable")
            ) {
              const powerDir = new THREE.Vector3(1, 0, 0).normalize();
              mats.forEach((m: any) => {
                if (m) applyPipelineFlowShader(m, "#F97316", powerDir, "power", 5.0, 0.3, 2.4);
              });
            }
          }
        });

        // Setup Animation Mixer (Strip roof animation tracks so mixer never moves roof)
        clipsRef.current = gltf.animations || [];
        if (clipsRef.current.length > 0) {
          clipsRef.current.forEach((clip) => {
            clip.tracks = clip.tracks.filter(
              (t) => !t.name.includes("Maitri_Building_Main_Roof") && !t.name.toLowerCase().includes("roof")
            );
          });
          const mixer = new THREE.AnimationMixer(root);
          mixerRef.current = mixer;

          clipsRef.current.forEach((clip) => {
            actionsRef.current[clip.name] = mixer.clipAction(clip);
          });

          // Default all systems pulse simulation
          const defaultClip = clipsRef.current[4] || clipsRef.current[0];
          if (defaultClip) {
            const act = mixer.clipAction(defaultClip);
            act.play();
            currentActionRef.current = act;
          }
        }

        // Read embedded Room Registry directly from GLB extras
        const registry = (gltf.parser.json?.extras?.room_registry || {}) as { [id: string]: RoomEntry };
        roomRegistryRef.current = registry;

        // Configure interior lighting for all 16 rooms
        const interiorLightsMap: { [id: string]: THREE.PointLight } = {};
        Object.values(registry).forEach((room) => {
          const lightSuffix = (room.camera_name || room.id).replace("Cam_Person_", "");
          const lightName = "Light_Interior_" + lightSuffix;
          const lightObj = root.getObjectByName(lightName);

          let pointLight: THREE.PointLight | null = null;
          if (lightObj) {
            pointLight = (lightObj as any).isLight ? (lightObj as any) : lightObj.children?.find((c: any) => c.isLight);
          }

          if (pointLight) {
            pointLight.visible = false;
            pointLight.intensity = 0.0;
            pointLight.color.set(0xffeedd);
            pointLight.distance = 10.0;
            pointLight.decay = 2.0;
            interiorLightsMap[room.id] = pointLight;
          } else {
            const pos = blenderToThreeCoords(room.position);
            const fallbackLight = new THREE.PointLight(0xffeedd, 0.0, 10.0, 2.0);
            fallbackLight.position.set(pos.x, pos.y + 0.8, pos.z);
            scene.add(fallbackLight);
            interiorLightsMap[room.id] = fallbackLight;
          }
        });
        interiorLightsRef.current = interiorLightsMap;

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(pct);
        }
      },
      (error) => {
        console.warn("[Maitri 3D Twin] Error loading compressed GLB, trying uncompressed:", error);
        gltfLoader.load("/assets/maitri_digital_twin.glb", (gltf) => {
          scene.add(gltf.scene);
          setLoading(false);
        });
      }
    );

    // 9. High-Performance Render Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update flow time uniform
      flowTimeUniformRef.current.value = elapsed;
      if (heatingShaderUniformsRef.current) {
        heatingShaderUniformsRef.current.uTime.value = elapsed;
      }

      // Update Polar Atmosphere & Blizzard Engine
      if (atmosphereRef.current) {
        atmosphereRef.current.update(delta);
      }

      // Animate Lake water surface normal scrolling
      if (lakeMaterialRef.current && lakeMaterialRef.current.normalMap) {
        lakeMaterialRef.current.normalMap.offset.x = (elapsed * 0.015) % 1.0;
        lakeMaterialRef.current.normalMap.offset.y = (elapsed * 0.008) % 1.0;
      }

      // Update Animation Mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Update OrbitControls smoothly
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (atmosphereRef.current) atmosphereRef.current.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  // ── ACTIVATE ONLY THE SPECIFIC FLOW SYSTEM ──
  const setFlowsActivation = useCallback((tourId: string | null) => {
    const uniforms = flowCategoryUniformsRef.current;
    if (!uniforms) return;

    // Reset all flows to inactive
    uniforms.water.value = 0.0;
    uniforms.fuel.value = 0.0;
    uniforms.power.value = 0.0;
    uniforms.sewage.value = 0.0;
    uniforms.heattrace.value = 0.0;

    if (tourId === "water") {
      uniforms.water.value = 1.0;
    } else if (tourId === "fuel") {
      uniforms.fuel.value = 1.0;
    } else if (tourId === "power") {
      uniforms.power.value = 1.0;
    } else if (tourId === "sewage") {
      uniforms.sewage.value = 1.0;
    } else if (tourId === "all_pulse") {
      uniforms.water.value = 1.0;
      uniforms.fuel.value = 1.0;
      uniforms.power.value = 1.0;
      uniforms.sewage.value = 1.0;
      uniforms.heattrace.value = 1.0;
    }
  }, []);

  // ── TRIGGER ELEVATED LIFELINE TOUR STAGE WITH SLICED BUILDING ──
  const goToStage = useCallback((tourIndex: number, stageIndex: number) => {
    const tour = UTILITY_TOURS.find((t) => t.index === tourIndex);
    if (!tour || !cameraRef.current || !controlsRef.current || !sceneRef.current) return;

    setActiveTourIndex(tourIndex);
    setActiveStageIndex(stageIndex);
    setStageProgress(0);
    setActiveRoom(null);
    setIsStoryCardVisible(true);
    setActiveMode("flows");

    // 0. ACTIVATE ONLY THIS SPECIFIC LIFELINE SHADER (Deactivates other pipes):
    setFlowsActivation(tour.id);

    const stage = tour.stages[stageIndex] || tour.stages[0];
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // 1. REVEAL INTERNAL MACHINERY FROM ABOVE:
    // Remove roof completely (no floating in mid-air)
    if (mainRoofRef.current) {
      mainRoofRef.current.visible = false;
      mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
      setRoofLifted(true);
    }

    // 2. Extinguish interior spotlights to avoid spot artifacts, keep outdoor sunlight balanced
    Object.values(interiorLightsRef.current).forEach((l) => {
      l.visible = false;
      l.intensity = 0.0;
    });
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 1.35;
      sunLightRef.current.color.set(0xfff7ee);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.75;
      hemiLightRef.current.color.set(0xdcf0ff);
      hemiLightRef.current.groundColor.set(0x8ea6ba);
    }
    if (sceneRef.current) {
      (sceneRef.current as any).environmentIntensity = 0.75;
    }

    // 3. Play continuous pulse animation loop FOR THIS LIFELINE ONLY:
    if (mixerRef.current) {
      // Stop all active mixer actions
      Object.values(actionsRef.current).forEach((act) => act.stop());

      // Only play the specific clip for this tour
      const clip =
        clipsRef.current.find((c) => c.name === tour.clipName) ||
        (tour.id === "all_pulse" ? clipsRef.current.find((c) => c.name === "Maitri_All_Systems_Pulse_Loop") : null);
      if (clip) {
        const act = mixerRef.current.clipAction(clip);
        act.reset().fadeIn(0.2).play();
        currentActionRef.current = act;
      }
    }

    // 4. Smooth elevated camera animation:
    activeTourCameraNodeRef.current = null;
    controls.enabled = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
      x: stage.cameraPos[0],
      y: stage.cameraPos[1],
      z: stage.cameraPos[2],
      duration: 2.2,
      ease: "power2.inOut",
    });

    gsap.to(controls.target, {
      x: stage.targetPos[0],
      y: stage.targetPos[1],
      z: stage.targetPos[2],
      duration: 2.2,
      ease: "power2.inOut",
      onComplete: () => {
        controls.enabled = true;
        controls.minDistance = 3.0;
        controls.maxDistance = 500.0;
        controls.minPolarAngle = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.01;
      },
    });

    if (stage.fov) {
      gsap.to(camera, {
        fov: stage.fov,
        duration: 1.5,
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    }
  }, []);

  // ── TRIGGER LIFELINE TOUR (STARTS AT STAGE 0) ──
  const playTour = useCallback(
    (tourIndex: number) => {
      goToStage(tourIndex, 0);
    },
    [goToStage]
  );

  // ── AUTO-ADVANCE LIFELINE STORY TIMER (8 SECONDS PER STAGE) ──
  useEffect(() => {
    if (activeTourIndex === null || activeMode !== "flows" || !autoPlayTour || activeRoom) {
      setStageProgress(0);
      return;
    }

    const currentTour = UTILITY_TOURS.find((t) => t.index === activeTourIndex);
    if (!currentTour || currentTour.stages.length <= 1) return;

    const intervalMs = 100;
    const totalDurationMs = 8000;
    const stepIncrement = (intervalMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          const nextIdx = (activeStageIndex + 1) % currentTour.stages.length;
          goToStage(activeTourIndex, nextIdx);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeTourIndex, activeStageIndex, autoPlayTour, activeMode, activeRoom, goToStage]);

  // Toggle Roof Complete Removal (X-Ray Interior)
  const toggleRoofLift = useCallback(() => {
    if (mainRoofRef.current) {
      const nextLift = !roofLifted;
      mainRoofRef.current.visible = !nextLift;
      mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
      setRoofLifted(nextLift);
    }
  }, [roofLifted]);

  // ── LOCK INSIDE ROOM (PERSON SITTING VIEW) ──
  const lockInsideRoom = useCallback(
    (room: RoomEntry) => {
      if (!cameraRef.current || !controlsRef.current || !sceneRef.current) return;

      activeTourCameraNodeRef.current = null;
      setActiveTourIndex(null);
      setAutoPlayTour(false);
      setFlowsActivation(null); // Turn off flow pulse animations inside rooms
      setActiveMode("rooms"); // Keep room exploration mode active so user can switch rooms

      setActiveRoom(room);
      if (onRoomSelect) onRoomSelect(room.id);
      polarAudio.setLocationState(true, room.id.includes("powerhouse") || room.id.includes("generator"));

      const camera = cameraRef.current;
      const controls = controlsRef.current;

      const sittingEyePos = blenderToThreeCoords(room.position);
      const lookTargetPos = blenderToThreeCoords(room.target);

      // Smoothly transition lighting to cozy indoor room atmosphere:
      if (sunLightRef.current) sunLightRef.current.intensity = 0.25;
      if (hemiLightRef.current) {
        hemiLightRef.current.intensity = 0.45;
        hemiLightRef.current.color.set(0xffeedd);
      }
      if (sceneRef.current) {
        (sceneRef.current as any).environmentIntensity = 0.3;
      }

      // Extinguish all other room lights
      Object.values(interiorLightsRef.current).forEach((l) => {
        l.visible = false;
        l.intensity = 0.0;
      });

      // Activate ONLY the selected room's warm fixture
      const roomLight = interiorLightsRef.current[room.id];
      if (roomLight) {
        roomLight.visible = true;
        roomLight.intensity = 35.0;
        roomLight.color.set(0xffeedd);
        roomLight.distance = 15.0;
        roomLight.decay = 2.0;
      }

      controls.enabled = false;
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);

      gsap.to(camera.position, {
        x: sittingEyePos.x,
        y: sittingEyePos.y,
        z: sittingEyePos.z,
        duration: 1.6,
        ease: "power3.inOut",
      });

      gsap.to(controls.target, {
        x: lookTargetPos.x,
        y: lookTargetPos.y,
        z: lookTargetPos.z,
        duration: 1.6,
        ease: "power3.inOut",
        onComplete: () => {
          controls.enabled = true;
          controls.minDistance = room.minDistance || 0.05;
          controls.maxDistance = room.maxDistance || 1.8;
          controls.minPolarAngle = 0.15;
          controls.maxPolarAngle = Math.PI - 0.15;
          controls.enablePan = false;
        },
      });

      gsap.to(camera, {
        fov: room.fov || 72,
        duration: 1.4,
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    },
    [onRoomSelect, setFlowsActivation]
  );

  // ── TOGGLE BOILER ROOM HEATING & ORANGE FLOW (TOP-DOWN OVERHEAD VIEW) ──
  const toggleBoilerHeating = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    setIsBoilerHeatingActive((prev) => {
      const nextState = !prev;

      if (heatingShaderUniformsRef.current) {
        heatingShaderUniformsRef.current.uActive.value = nextState ? 1.0 : 0.0;
      }
      if (flowCategoryUniformsRef.current) {
        flowCategoryUniformsRef.current.heattrace.value = nextState ? 1.0 : 0.0;
        flowCategoryUniformsRef.current.water.value = nextState ? 1.0 : 0.0;
      }
      if (heatingPipesGroupRef.current) {
        heatingPipesGroupRef.current.visible = nextState;
      }

      if (nextState) {
        setActiveTourIndex(null);
        setActiveRoom(null);
        setActiveMode("flows");

        // Completely remove roof so all internal heating pipes are fully exposed (never float in air)
        if (mainRoofRef.current) {
          mainRoofRef.current.visible = false;
          mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
          setRoofLifted(true);
        }

        // DIRECT TOP-DOWN / OVERHEAD VIEW (Directly above full Maitri building complex at X=-4.5, Z=-35.0)
        controls.enabled = false;
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(controls.target);

        gsap.to(camera.position, {
          x: -4.5,
          y: 88.0,
          z: -35.0,
          duration: 1.8,
          ease: "power3.inOut",
        });

        gsap.to(controls.target, {
          x: -4.5,
          y: 4.2,
          z: -35.0,
          duration: 1.8,
          ease: "power3.inOut",
          onComplete: () => {
            controls.enabled = true;
            controls.minDistance = 10.0;
            controls.maxDistance = 250.0;
            controls.enablePan = true;
          },
        });

        gsap.to(camera, {
          fov: 55,
          duration: 1.5,
          onUpdate: () => camera.updateProjectionMatrix(),
        });
      } else {
        // Completely restore roof back onto building in its exact rest position
        if (mainRoofRef.current) {
          mainRoofRef.current.visible = true;
          mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
          setRoofLifted(false);
        }
      }

      return nextState;
    });
  }, []);

  // ── SELECT FACILITY SYSTEM FROM HARDWARE DOCK & FLY CAMERA ──
  const handleSelectSystem = useCallback(
    (system: SystemFacilityItem) => {
      setActiveSystemId(system.id);
      if (system.id === "maitri_boiler_heating" || system.id.includes("heating")) {
        toggleBoilerHeating();
        return;
      }
      const room = roomRegistryRef.current[system.targetRoomId] || MAITRI_MASTER_FACILITIES[system.targetRoomId];
      if (room) {
        if (
          room.id.includes("boiler") ||
          room.id.includes("hospital") ||
          room.id.includes("comms") ||
          room.id.includes("meteo") ||
          room.id.includes("food") ||
          room.id.includes("cold") ||
          room.id.includes("carpentry") ||
          room.id.includes("waste")
        ) {
          if (!roofLifted && mainRoofRef.current) {
            mainRoofRef.current.visible = false;
            mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
            setRoofLifted(true);
          }
        }
        lockInsideRoom(room);
      }
    },
    [lockInsideRoom, roofLifted, toggleBoilerHeating]
  );

  // ── QUICK PREV / NEXT ROOM NAVIGATION ──
  const goToPrevRoom = useCallback(() => {
    const allRooms = Object.values(roomRegistryRef.current);
    if (allRooms.length === 0) return;
    const currentIdx = activeRoom ? allRooms.findIndex((r) => r.id === activeRoom.id) : 0;
    const prevIdx = (currentIdx - 1 + allRooms.length) % allRooms.length;
    lockInsideRoom(allRooms[prevIdx]);
  }, [activeRoom, lockInsideRoom]);

  const goToNextRoom = useCallback(() => {
    const allRooms = Object.values(roomRegistryRef.current);
    if (allRooms.length === 0) return;
    const currentIdx = activeRoom ? allRooms.findIndex((r) => r.id === activeRoom.id) : 0;
    const nextIdx = (currentIdx + 1) % allRooms.length;
    lockInsideRoom(allRooms[nextIdx]);
  }, [activeRoom, lockInsideRoom]);

  // ── RESET TO STATION EXTERIOR OVERVIEW ──
  const resetToOverview = useCallback(() => {
    setActiveSystemId(null);
    if (!cameraRef.current || !controlsRef.current) return;
    activeTourCameraNodeRef.current = null;
    setActiveRoom(null);
    setActiveTourIndex(null);
    setActiveStageIndex(0);
    setAutoPlayTour(false);
    setActiveMode("overview");
    setFlowsActivation(null); // Turn off all flow pulses
    setIsBoilerHeatingActive(false);
    if (heatingShaderUniformsRef.current) {
      heatingShaderUniformsRef.current.uActive.value = 0.0;
    }
    if (heatingPipesGroupRef.current) {
      heatingPipesGroupRef.current.visible = false;
    }

    // Stop all running mixer clips
    if (mixerRef.current) {
      Object.values(actionsRef.current).forEach((act) => act.stop());
    }

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Reset soundscape to outdoor polar ambiance
    polarAudio.setLocationState(false, false);

    // Completely restore roof back onto building in its exact rest position
    if (mainRoofRef.current) {
      mainRoofRef.current.visible = true;
      mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
      setRoofLifted(false);
    }

    // Restore natural outdoor polar sunlight
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 1.35;
      sunLightRef.current.color.set(0xfff7ee);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.7;
      hemiLightRef.current.color.set(0xdcf0ff);
      hemiLightRef.current.groundColor.set(0x8ea6ba);
    }
    if (sceneRef.current) {
      (sceneRef.current as any).environmentIntensity = 0.7;
    }
    Object.values(interiorLightsRef.current).forEach((l) => {
      l.visible = false;
      l.intensity = 0.0;
    });

    controls.enabled = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
      x: -90,
      y: 60,
      z: 120,
      duration: 2.0,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: 0,
      y: 3,
      z: 0,
      duration: 2.0,
      ease: "power3.inOut",
      onComplete: () => {
        controls.enabled = true;
        controls.minDistance = 3.0;
        controls.maxDistance = 500.0;
        controls.minPolarAngle = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.01;
        controls.enablePan = true;
      },
    });

    gsap.to(camera, {
      fov: 65,
      duration: 1.5,
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  }, [setFlowsActivation]);

  // Toggle Auto-Orbit
  const toggleAutoRotate = () => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = !isRotating;
    controlsRef.current.autoRotateSpeed = 0.8;
    setIsRotating(!isRotating);
  };

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Toggle Lighting Mode
  const cycleLighting = () => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (lightingMode === "SUN") {
      scene.background = new THREE.Color("#020814");
      scene.fog = new THREE.FogExp2(0x020814, 0.002);
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0x00d4a0);
        hemiLightRef.current.groundColor.set(0x020814);
        hemiLightRef.current.intensity = 0.4;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0x0db9d0);
        sunLightRef.current.intensity = 0.45;
      }
      setLightingMode("AURORA");
    } else if (lightingMode === "AURORA") {
      scene.background = new THREE.Color("#010308");
      scene.fog = new THREE.FogExp2(0x010308, 0.0025);
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0x182436);
        hemiLightRef.current.groundColor.set(0x010308);
        hemiLightRef.current.intensity = 0.2;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0x224466);
        sunLightRef.current.intensity = 0.2;
      }
      setLightingMode("NIGHT");
    } else {
      scene.background = new THREE.Color("#7db4db");
      scene.fog = new THREE.FogExp2(0x7db4db, 0.0012);
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0xdcf0ff);
        hemiLightRef.current.groundColor.set(0x8ea6ba);
        hemiLightRef.current.intensity = 0.7;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xfff7ee);
        sunLightRef.current.intensity = 1.35;
      }
      setLightingMode("SUN");
    }
  };

  // Filtered room list
  const rooms = Object.values(roomRegistryRef.current);
  const filteredRooms = roomCategory === "All" ? rooms : rooms.filter((r) => r.category === roomCategory);
  const currentTour = UTILITY_TOURS.find((t) => t.index === activeTourIndex);
  const currentStage = currentTour ? currentTour.stages[activeStageIndex] : null;

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#03060E] ${className}`}>
      {/* ── 3D WEBGL CANVAS ── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── HIGH-TECH MINIMAL LOADING OVERLAY ── */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-[#03060E]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 p-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-[#0DB9D0]/20 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-t-[#0DB9D0] border-r-transparent border-b-[#00D4A0] border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-[#0DB9D0]">
              {loadProgress}%
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#EBF5FC] font-semibold">
              Loading Maitri 3D Digital Twin
            </h3>
            <p className="font-mono text-[10px] text-[#4A7A8E]">
              Calibrating natural polar atmosphere, PBR materials, and physical utility pipeline flows...
            </p>
          </div>
        </div>
      )}

      {/* ── UNIFIED AEROSPACE STATION COMMAND HEADER ── */}
      <StationHeaderBar
        station="MAITRI"
        activeRoom={activeRoom ? { id: activeRoom.id, name: activeRoom.name, category: activeRoom.category } : null}
        onPrevRoom={goToPrevRoom}
        onNextRoom={goToNextRoom}
        onExitRoom={resetToOverview}
        roofLifted={roofLifted}
        onToggleRoofLift={toggleRoofLift}
        isRotating={isRotating}
        onToggleRotate={toggleAutoRotate}
        atmosphereSystem={atmosphereRef.current}
        onOpenOrbitalView={() => setIsOrbitalViewOpen(true)}
        onOpenDossier={() => setIsReportOpen(true)}
        onOpenAICommander={() => setIsAICommanderOpen(true)}
        onOpenSimulation={() => setIsSimulatorOpen(true)}
        onResetOverview={resetToOverview}
        enableFullscreenButton={enableFullscreenButton}
        onStartDroneTour={() => droneDirectorRef.current?.startDroneTour()}
        isBoilerHeatingActive={isBoilerHeatingActive}
        onToggleBoilerHeating={toggleBoilerHeating}
        currentPosture={currentPosture}
        onSelectPosture={handleSelectPosture}
      />

      {/* ── FLOATING TOP-DOWN BOILER ROOM HEATING HUD ── */}
      {isBoilerHeatingActive && !activeRoom && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-[94%] max-w-xl animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="p-3.5 rounded-2xl bg-[#050B16]/95 border border-amber-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFAA00] animate-pulse" />
                <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  Maitri Hydronic Heating · Top-Down Overhead View
                </span>
              </div>
              <button
                onClick={toggleBoilerHeating}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                title="Exit Overhead Heating View"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
                <span className="text-[9px] text-[#FFAA00] uppercase font-semibold">Supply Loop</span>
                <span className="text-sm font-bold text-white mt-0.5">+82.4°C</span>
                <span className="text-[8px] text-[#FFAA00]/80">Orange Arterial Pipe</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col">
                <span className="text-[9px] text-white/60 uppercase font-semibold">Return Loop</span>
                <span className="text-sm font-bold text-white mt-0.5">+68.1°C</span>
                <span className="text-[8px] text-white/50">ΔT: 14.3°C</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col">
                <span className="text-[9px] text-white/60 uppercase font-semibold">Heat Source</span>
                <span className="text-sm font-bold text-white mt-0.5">Riello + CHP</span>
                <span className="text-[8px] text-emerald-400">94.2% Efficiency</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col">
                <span className="text-[9px] text-white/60 uppercase font-semibold">Circulation</span>
                <span className="text-sm font-bold text-white mt-0.5">3.4 m³/h</span>
                <span className="text-[8px] text-emerald-400">Radiators Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#7ABBD4] pt-1 border-t border-white/[0.08]">
              <span>Flow: Boiler Room ➔ IMD ➔ Comms ➔ Quarters ➔ Hospital ➔ Carpentry & Waste</span>
              <button
                onClick={resetToOverview}
                className="text-white/60 hover:text-white underline underline-offset-2"
              >
                Reset Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTEXTUAL ROOM SCADA TELEMETRY & BI-DIRECTIONAL REMOTE ACTUATION ── */}
      {activeRoom && (
        <div className="absolute top-16 left-4 sm:left-6 z-40 pointer-events-auto">
          <RoomTelemetryCard
            room={activeRoom}
            stationId="MAITRI"
            onClose={() => {
              setActiveRoom(null);
              setActiveSystemId(null);
            }}
            onTriggerAction={(actionId, label) => {
              console.log(`[MAITRI SCADA ACTUATION] Executed ${label} (${actionId}) in ${activeRoom.name}`);
              if (actionId === "ACTIVATE_BOILER_HEATING") {
                toggleBoilerHeating();
              }
            }}
          />
        </div>
      )}

      {/* ── WHAT-IF CRISIS SIMULATION DRAWER (Controlled) ── */}
      <TwinWhatIfSimulator
        station="MAITRI"
        isOpen={isSimulatorOpen}
        onOpenChange={setIsSimulatorOpen}
        hideTrigger={true}
        onSimulationChange={setActiveSimulation}
      />

      {/* ── AUTONOMOUS 4K DRONE AERIAL SURVEY DIRECTOR ── */}
      <CinematicDroneDirector
        ref={droneDirectorRef}
        camera={cameraRef.current}
        controls={controlsRef.current}
        station="MAITRI"
        hideTrigger={true}
        onExitCallback={resetToOverview}
      />

      {/* ── INTERACTIVE STORYTELLING CARD (SLICED BUILDING LIFELINE TOUR) ── */}
      {currentTour && currentStage && activeTourIndex !== null && !activeRoom && isStoryCardVisible && (
        <div className="absolute top-24 sm:top-28 left-4 sm:left-6 z-30 pointer-events-auto w-[calc(100%-2rem)] sm:w-[440px] max-w-md animate-in fade-in slide-in-from-left-3 duration-300">
          {isStoryCardCollapsed ? (
            /* Minimized Capsule State */
            <div
              className="p-3 rounded-2xl bg-[#040D1A]/95 border backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-3"
              style={{ borderColor: `${currentTour.color}50` }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: currentTour.color }}
                />
                <span className="font-mono text-xs font-bold truncate text-white">
                  {currentTour.label}
                </span>
                <span className="font-mono text-[10px] text-[#7ABBD4] shrink-0">
                  {activeStageIndex + 1}/{currentTour.stages.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const nextIdx = (activeStageIndex + 1) % currentTour.stages.length;
                    goToStage(activeTourIndex, nextIdx);
                  }}
                  className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Next &rarr;
                </button>
                <button
                  onClick={() => setIsStoryCardCollapsed(false)}
                  className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-semibold text-[#0DB9D0] bg-[#0DB9D0]/15 hover:bg-[#0DB9D0]/25 transition-colors"
                >
                  Expand
                </button>
              </div>
            </div>
          ) : (
            /* Full Storytelling Card */
            <div
              className="p-4 sm:p-5 rounded-3xl bg-[#040D1A]/96 border backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.92)] flex flex-col gap-3 relative overflow-hidden"
              style={{ borderColor: `${currentTour.color}45` }}
            >
              {/* Auto-Advance Countdown Line */}
              {autoPlayTour && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className="h-full transition-all duration-100 ease-linear shadow-[0_0_8px]"
                    style={{
                      width: `${stageProgress}%`,
                      backgroundColor: currentTour.color,
                      boxShadow: `0 0 10px ${currentTour.color}`,
                    }}
                  />
                </div>
              )}

              {/* Header: Lifeline Badge, Stage Counter, Controls */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px] shrink-0"
                    style={{ backgroundColor: currentTour.color }}
                  />
                  <span
                    className="font-mono text-[10px] uppercase font-bold tracking-wider truncate"
                    style={{ color: currentTour.color }}
                  >
                    {currentTour.label}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[9px] bg-white/10 text-white font-semibold uppercase tracking-wider shrink-0">
                    Stage {activeStageIndex + 1} of {currentTour.stages.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setAutoPlayTour(!autoPlayTour)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      autoPlayTour
                        ? "bg-[#00D4A0]/20 text-[#00D4A0] border border-[#00D4A0]/30 font-semibold"
                        : "bg-white/5 text-[#7ABBD4] hover:text-white"
                    }`}
                    title={autoPlayTour ? "Pause Auto-Tour (8s stay)" : "Resume Auto-Tour (8s stay)"}
                  >
                    {autoPlayTour ? <Pause size={10} weight="fill" /> : <Play size={10} weight="fill" />}
                    <span>{autoPlayTour ? "Auto" : "Paused"}</span>
                  </button>

                  <button
                    onClick={() => setIsStoryCardCollapsed(true)}
                    className="p-1 rounded-lg text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
                    title="Minimize Card"
                  >
                    <ArrowsIn size={13} />
                  </button>

                  <button
                    onClick={resetToOverview}
                    className="p-1 rounded-lg text-[#4A7A8E] hover:text-white transition-colors"
                    title="Close Story Card & Return to Overview"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Stage Title */}
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#7ABBD4] font-medium mb-1">
                  {currentStage.badge}
                </div>
                <h3 className="font-sans text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  {currentStage.title}
                </h3>
              </div>

              {/* Narrative Story */}
              <p className="font-sans text-[11px] sm:text-[12px] text-[#A6C4D6] leading-relaxed font-light">
                {currentStage.narrative}
              </p>

              {/* Live Telemetry Parameters Grid */}
              <div className="grid grid-cols-3 gap-2 pt-0.5 pb-0.5">
                {currentStage.telemetry.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-[#4A7A8E] truncate">
                      {t.label}
                    </span>
                    <span
                      className="font-mono text-xs font-bold mt-0.5 truncate"
                      style={{ color: t.color || "#EBF5FC" }}
                    >
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sliced Building Indicator Banner */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[10px] text-[#7ABBD4]">
                <div className="flex items-center gap-1.5">
                  <Cube size={13} weight="duotone" className="text-[#0DB9D0]" />
                  <span className="text-white/80">Station Top Sliced (+16.5m X-Ray)</span>
                </div>
                <span className="text-[#00D4A0] text-[9px] font-semibold uppercase">Smooth Aerial View</span>
              </div>

              {/* Navigation Bar: Prev, Stage Dots, Next */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
                <button
                  disabled={activeStageIndex === 0}
                  onClick={() => goToStage(activeTourIndex, Math.max(0, activeStageIndex - 1))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeStageIndex === 0
                      ? "opacity-30 cursor-not-allowed text-[#4A7A8E]"
                      : "text-[#7ABBD4] hover:text-white bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <CaretLeft size={12} weight="bold" />
                  <span>Prev</span>
                </button>

                {/* Stage Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {currentTour.stages.map((st, sIdx) => (
                    <button
                      key={st.id}
                      onClick={() => goToStage(activeTourIndex, sIdx)}
                      className={`h-2 rounded-full transition-all ${
                        sIdx === activeStageIndex
                          ? "w-6 shadow-[0_0_8px]"
                          : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                      style={
                        sIdx === activeStageIndex
                          ? { backgroundColor: currentTour.color, boxShadow: `0 0 8px ${currentTour.color}` }
                          : {}
                      }
                      title={`Stage ${sIdx + 1}: ${st.title}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    const nextIdx = (activeStageIndex + 1) % currentTour.stages.length;
                    goToStage(activeTourIndex, nextIdx);
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all text-white shadow-lg hover:brightness-110 active:scale-95"
                  style={{
                    backgroundColor: `${currentTour.color}35`,
                    border: `1px solid ${currentTour.color}70`,
                    color: currentTour.color,
                  }}
                >
                  <span>{activeStageIndex + 1 === currentTour.stages.length ? "Replay \u21ba" : "Next \u2192"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FLOATING ISLAND CONTROLS (BOTTOM CENTER DOCK) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-3 w-[92%] sm:w-auto max-w-2xl">
        {/* SUBMENU 1: LIFELINE FLOWS SELECTOR */}
        {activeMode === "flows" && !activeRoom && (
          <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-x-auto no-scrollbar">
            {UTILITY_TOURS.map((tour) => {
              const Icon = tour.icon;
              const isActive = activeTourIndex === tour.index;
              return (
                <button
                  key={tour.id}
                  onClick={() => playTour(tour.index)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "text-white shadow-lg"
                      : "text-[#7ABBD4] hover:text-white bg-white/[0.03] border-white/5 hover:border-white/15"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${tour.color}25`,
                          borderColor: `${tour.color}70`,
                          color: tour.color,
                        }
                      : {}
                  }
                >
                  <Icon size={14} weight="duotone" />
                  <span>{tour.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* SUBMENU 2: FACILITIES SELECTOR (Always Accessible & Multi-Room Switcher) */}
        {activeMode === "rooms" && (
          <div className="w-full max-w-xl flex flex-col gap-2.5 p-3 rounded-3xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Category Filter Pills & Drawer Close */}
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-white/[0.08]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(["All", "Science Labs", "Operations", "Medical & Living"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRoomCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                      roomCategory === cat
                        ? "bg-[#0DB9D0]/20 text-[#0DB9D0] border border-[#0DB9D0]/40 font-semibold"
                        : "text-[#4A7A8E] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (activeRoom) {
                    setActiveMode("overview");
                  } else {
                    resetToOverview();
                  }
                }}
                className="p-1 rounded-lg text-[#4A7A8E] hover:text-white transition-colors"
                title="Close Facilities Drawer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Room Buttons Grid with Active Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredRooms.map((room) => {
                const isSelected = activeRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => lockInsideRoom(room)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left transition-all group ${
                      isSelected
                        ? "bg-[#0DB9D0]/20 border border-[#0DB9D0] shadow-[0_0_12px_rgba(13,185,208,0.3)] text-white"
                        : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#0DB9D0]/30 text-[#EBF5FC]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isSelected
                            ? "bg-[#00D4A0] animate-pulse shadow-[0_0_6px_#00D4A0]"
                            : "bg-white/20 group-hover:bg-[#0DB9D0]"
                        }`}
                      />
                      <span className="font-sans text-xs truncate font-medium">
                        {room.name}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#7ABBD4] group-hover:text-white shrink-0 ml-1">
                      {isSelected ? "Active" : "Inspect"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATION SYSTEMS HARDWARE DOCK (DIRECT FACILITY FLY & CARD LAUNCHER) ── */}
        <StationSystemDock
          station="MAITRI"
          activeSystemId={activeRoom?.id || activeSystemId}
          onSelectSystem={handleSelectSystem}
          onResetOverview={() => {
            setActiveSystemId(null);
            resetToOverview();
          }}
        />
      </div>

      {/* ── MINIMAL VIEWPORT HINT (BOTTOM RIGHT) ── */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/80 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#4A7A8E]">
        <span>Drag to Orbit</span>
        <span>·</span>
        <span>Scroll to Zoom</span>
      </div>

      {/* ── AGENTIC AI STATION COMMANDER (HIMADRI COPILOT WITH 3D ACTUATION) ── */}
      <StationAICommander
        station="MAITRI"
        isOpen={isAICommanderOpen}
        onOpenChange={setIsAICommanderOpen}
        hideFloatingTrigger={true}
        onFlyToRoom={(roomId) => {
          const room = roomRegistryRef.current[roomId] || MAITRI_MASTER_FACILITIES[roomId];
          if (room) {
            if (room.id.includes("boiler") || room.id.includes("hospital") || room.id.includes("comms") || room.id.includes("meteo")) {
              if (!roofLifted && mainRoofRef.current) {
                mainRoofRef.current.visible = false;
                mainRoofRef.current.position.set(-0.75, 4.1, 0.06);
                setRoofLifted(true);
              }
            }
            lockInsideRoom(room);
          }
        }}
        onToggleBlizzard={(isBlizz) => {
          if (atmosphereRef.current) {
            atmosphereRef.current.setBlizzard(isBlizz);
            atmosphereRef.current.setWindSpeed(isBlizz ? 105 : 28);
          }
          polarAudio.setBlizzard(isBlizz);
        }}
        onTriggerSimulation={(scId) => {
          setActiveSimulation({ scenarioId: scId } as any);
        }}
        onResetOverview={resetToOverview}
      />

      {/* ── ISRO GSAT POLAR ORBITAL GLOBE VIEW ── */}
      <PolarOrbitalGlobeView
        isOpen={isOrbitalViewOpen}
        onClose={() => setIsOrbitalViewOpen(false)}
        currentStation="MAITRI"
      />

      {/* ── NCPOR & ATCM MISSION READINESS BRIEFING DOSSIER ── */}
      <MissionReportModal
        station="MAITRI"
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
