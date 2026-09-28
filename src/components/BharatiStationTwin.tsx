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
  Camera,
  Sun,
  Moon,
  ArrowsIn,
  ArrowsOut,
  Play,
  Pause,
  CaretRight,
  X,
  Gear,
  Cpu,
} from "@phosphor-icons/react";

export interface BharatiRoomEntry {
  id: string;
  name: string;
  category: "Science Labs" | "Operations" | "Living & Medical";
  camera_name?: string;
  position: [number, number, number];
  target: [number, number, number];
  light_pos?: [number, number, number];
  fov?: number;
  minDistance?: number;
  maxDistance?: number;
  description?: string;
}

const BHARATI_ROOM_REGISTRY: { [id: string]: BharatiRoomEntry } = {
  lab_panoramic_lounge: {
    id: "lab_panoramic_lounge",
    name: "Panoramic Observation Lounge & Iceberg View",
    category: "Science Labs",
    position: [-21.5, 0, 8.42],
    target: [-25.5, 0, 8.2],
    light_pos: [-21.5, 0, 10.2],
    fov: 75,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Sitting in front lounge recliners looking through triple-glazed polar glass towards the icebergs of Prydz Bay.",
  },
  lab_isro_ttc_satellite: {
    id: "lab_isro_ttc_satellite",
    name: "ISRO TTC Satellite Ground Station & Polar Downlink",
    category: "Science Labs",
    position: [-15.8, 9.5, 8.5],
    target: [-15.8, 12.5, 8.2],
    light_pos: [-15.8, 9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Facing ISRO satellite tracking telemetry consoles, polar downlink receiver arrays (Cartosat, Oceansat, RISAT).",
  },
  lab_atmospheric_meteo: {
    id: "lab_atmospheric_meteo",
    name: "Atmospheric Sciences & Meteorology Lab",
    category: "Science Labs",
    position: [-15.8, -9.5, 8.5],
    target: [-15.8, -12.5, 8.2],
    light_pos: [-15.8, -9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Sonic anemometers, spectrophotometers, boundary layer SODAR, radiometers, and AWS meteorological servers.",
  },
  lab_geomag_space: {
    id: "lab_geomag_space",
    name: "Geomagnetism & Space Weather Research Lab",
    category: "Science Labs",
    position: [-10.8, -9.5, 8.5],
    target: [-10.8, -12.5, 8.2],
    light_pos: [-10.8, -9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Fluxgate magnetometers, pulsation sensors, and ionospheric GPS scintillation monitoring equipment.",
  },
  lab_seismology_geophys: {
    id: "lab_seismology_geophys",
    name: "Seismology & Solid Earth Geophysics Lab",
    category: "Science Labs",
    position: [-3.8, -9.5, 8.5],
    target: [-3.8, -12.5, 8.2],
    light_pos: [-3.8, -9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Broadband seismograph telemetry, geodetic GNSS baseline continuous receivers, and crustal deformation analyzers.",
  },
  lab_glaciology_ice: {
    id: "lab_glaciology_ice",
    name: "Glaciology & Ice Core Analytics Lab",
    category: "Science Labs",
    position: [-10.8, 9.5, 8.5],
    target: [-10.8, 12.5, 8.2],
    light_pos: [-10.8, 9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Sub-zero ice-core core sample storage, dielectric profiling, ice-shelf velocity telemetry, and cryospheric mapping.",
  },
  lab_biology_microbio: {
    id: "lab_biology_microbio",
    name: "Polar Biology & Environmental Microbiology Lab",
    category: "Science Labs",
    position: [-3.8, 9.5, 8.5],
    target: [-3.8, 12.5, 8.2],
    light_pos: [-3.8, 9.5, 10.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Precision microbiological incubators, laminar airflow cabinets, and extremophile bacterial culture stations.",
  },
  lab_comms_noc: {
    id: "lab_comms_noc",
    name: "Communications Center & Station NOC",
    category: "Science Labs",
    position: [3.5, 9.5, 8.5],
    target: [3.5, 12.5, 8.2],
    light_pos: [3.5, 9.5, 10.2],
    fov: 70,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Polar HF transceivers, Inmarsat/Iridium redundant satellite uplinks, microwave point-to-point links, and station VoIP.",
  },
  lab_conference_hall: {
    id: "lab_conference_hall",
    name: "Scientific Briefing Auditorium & Conference Hall",
    category: "Science Labs",
    position: [-8.5, 0, 8.5],
    target: [-4.5, 0, 8.2],
    light_pos: [-8.5, 0, 10.2],
    fov: 75,
    minDistance: 0.05,
    maxDistance: 2.5,
    description: "Tiered seating auditorium for expedition mission briefings, scientific symposiums, and winterover communications.",
  },
  room_chp_powerhouse: {
    id: "room_chp_powerhouse",
    name: "Combined Heat & Power (CHP) Generation Hall",
    category: "Operations",
    position: [18, -3.5, 1.8],
    target: [18, -5.5, 1.3],
    light_pos: [18, -3.5, 3.2],
    fov: 75,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "3x Kirloskar/Scania CHP diesel cogeneration gensets delivering 415V 50Hz grid power and hydronic heat recovery.",
  },
  room_boiler_hvac: {
    id: "room_boiler_hvac",
    name: "Boiler & Central Hydronic Heating Plant",
    category: "Operations",
    position: [18, -0.5, 1.8],
    target: [18, -1.8, 1.4],
    light_pos: [18, -0.5, 3.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Dual-fuel backup boiler, primary plate heat exchangers, glycol loops, and circulating hydronic pump stations.",
  },
  room_ro_water_plant: {
    id: "room_ro_water_plant",
    name: "Reverse Osmosis (RO) Desalination & Water Plant",
    category: "Operations",
    position: [8.5, -2.5, 1.8],
    target: [8.5, -5, 1.3],
    light_pos: [8.5, -2.5, 3.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "High-pressure seawater Reverse Osmosis membrane racks, UV disinfection, mineralization filters, and 1000L DHW calorifier.",
  },
  room_stp_treatment: {
    id: "room_stp_treatment",
    name: "Central Wastewater & Sewage Facility (MBBR)",
    category: "Operations",
    position: [10, 2, 1.8],
    target: [10, 4, 1.4],
    light_pos: [10, 2, 3.2],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Moving Bed Biofilm Reactor (MBBR) biological digestion, ultrafiltration, and UV sterilization complying with Madrid Protocol.",
  },
  room_dining_mess: {
    id: "room_dining_mess",
    name: "Station Dining Mess Hall & Social Hub",
    category: "Living & Medical",
    position: [17, 6, 4.7],
    target: [17, 8.5, 4.5],
    light_pos: [17, 6, 6.5],
    fov: 75,
    minDistance: 0.05,
    maxDistance: 2.5,
    description: "Sitting at communal dining tables facing the galley serving counter, recreation space, library, and espresso bar.",
  },
  room_medical_ward: {
    id: "room_medical_ward",
    name: "Medical Clinic & Surgical Operating Ward",
    category: "Living & Medical",
    position: [20.5, -6, 4.7],
    target: [20.5, -8.5, 4.4],
    light_pos: [20.5, -6, 6.5],
    fov: 72,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Fully-equipped polar medical clinic with surgical operating bed, patient monitors, defibrillator, and telemedicine station.",
  },
  room_station_leader: {
    id: "room_station_leader",
    name: "Station Commander & Operations Office",
    category: "Operations",
    position: [15.8, 8, 8.5],
    target: [15.8, 10.5, 8.3],
    light_pos: [15.8, 8, 10.2],
    fov: 70,
    minDistance: 0.05,
    maxDistance: 2.2,
    description: "Station expedition leader command office, logistics coordination desks, weather radars, and emergency dispatch console.",
  },
};

const BHARATI_UTILITY_TOURS = [
  {
    id: "water",
    index: 0,
    label: "Freshwater Lifeline",
    cameraName: "Bharati_Waterflow_Tour_Camera",
    clipName: "Bharati_Waterflow_Tour",
    icon: Waves,
    color: "#00A8FF",
    badge: "DESAL & RO TO DHW",
    description: "Intake from lake/desalination to central RO plant, DHW calorifiers, and elevated science labs with roof lift.",
  },
  {
    id: "fuel",
    index: 1,
    label: "Fuel Supply Network",
    cameraName: "Bharati_Fuel_Tour_Camera",
    clipName: "Bharati_Fuel_Tour",
    icon: GasPump,
    color: "#FFAA00",
    badge: "BULK PAD TO CHP & BOILER",
    description: "Double-walled amber fuel containment line from Bulk Fuel Pad to internal day-tanks, 3x CHP gensets & boiler.",
  },
  {
    id: "power",
    index: 3,
    label: "Electrical Power Grid",
    cameraName: "Bharati_Power_Tour_Camera",
    clipName: "Bharati_Power_Tour",
    icon: Lightning,
    color: "#F97316",
    badge: "415V 3-PHASE GRID",
    description: "Elevated cable tray ladder routing 415V 50Hz 3-phase power from CHP alternators into ISRO TTC downlink & labs.",
  },
  {
    id: "sewage",
    index: 2,
    label: "Wastewater / MBBR STP",
    cameraName: "Bharati_Sewage_Tour_Camera",
    clipName: "Bharati_Sewage_Tour",
    icon: Gear,
    color: "#00D4A0",
    badge: "LEVEL 2/1 TO CENTRAL MBBR",
    description: "Insulated gravity & vacuum sewer line descending from Level 2 & 1 berths down to the MBBR bioreactor hall.",
  },
  {
    id: "all_pulse",
    index: 4,
    label: "All Lifeline Flows",
    cameraName: null,
    clipName: "Bharati_All_Systems_Pulse_Loop",
    icon: ArrowsClockwise,
    color: "#0DB9D0",
    badge: "SIMULTANEOUS MULTI-UTILITY",
    description: "Real-time fluid and electrical energy transmission running concurrently across all 5 physical pipeline systems.",
  },
];

// Helper to convert Blender (X, Y, Z_height) to Three.js glTF (X, Z_height, -Y)
function blenderToThreeCoords(coords: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(coords[0], coords[2], -coords[1]);
}

interface BharatiStationTwinProps {
  className?: string;
  initialMode?: "overview" | "flows" | "rooms";
  selectedRoomId?: string;
  enableFullscreenButton?: boolean;
  onRoomSelect?: (roomId: string) => void;
}

export function BharatiStationTwin({
  className = "w-full h-full min-h-[680px]",
  enableFullscreenButton = true,
  onRoomSelect,
}: BharatiStationTwinProps) {
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
  const roomRegistryRef = useRef<{ [id: string]: BharatiRoomEntry }>(BHARATI_ROOM_REGISTRY);
  const interiorLightsRef = useRef<{ [id: string]: THREE.PointLight }>({});
  const mainRoofRef = useRef<THREE.Object3D | null>(null);
  const lastFovRef = useRef<number>(65);

  // Lighting References for Dynamic Interior/Exterior Transitions
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Active Tour Camera Tracking State
  const activeTourCameraNodeRef = useRef<THREE.Object3D | null>(null);
  const tourActionRef = useRef<THREE.AnimationAction | null>(null);

  // Flow Shader Uniforms
  const flowTimeUniformRef = useRef<{ value: number }>({ value: 0 });

  // UI State
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeMode, setActiveMode] = useState<"overview" | "flows" | "rooms">("overview");
  const [activeTourIndex, setActiveTourIndex] = useState<number | null>(4);
  const [tourPlaying, setTourPlaying] = useState(true);
  const [activeRoom, setActiveRoom] = useState<BharatiRoomEntry | null>(null);
  const [roomCategory, setRoomCategory] = useState<"All" | "Science Labs" | "Operations" | "Living & Medical">("All");
  const [roofLifted, setRoofLifted] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightingMode, setLightingMode] = useState<"SUN" | "AURORA" | "NIGHT">("SUN");

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 700;

    // 1. Scene with Larsemann Hills Atmosphere
    const scene = new THREE.Scene();
    const polarSkyColor = new THREE.Color("#6b9bc3");
    scene.background = polarSkyColor;
    scene.fog = new THREE.FogExp2(0x6b9bc3, 0.0014);
    sceneRef.current = scene;

    // 2. Camera with 0.05m near plane to prevent near-plane wall slicing
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.05, 2500);
    camera.position.set(-65, 34, 70);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmic Tone Mapping and High-Performance Configuration
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Natural Polar Environment Map (PMREM) for PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();

    const envScene = new THREE.Scene();
    const envHemi = new THREE.HemisphereLight(0xd2e8fa, 0x829bb0, 0.6);
    envScene.add(envHemi);
    const envSun = new THREE.DirectionalLight(0xfffaed, 0.8);
    envSun.position.set(1, 0.8, 1);
    envScene.add(envSun);
    const envRT = pmremGenerator.fromScene(envScene);
    scene.environment = envRT.texture;

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 5, 0);
    controls.minDistance = 2.0;
    controls.maxDistance = 500.0;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controlsRef.current = controls;

    // 6. Natural Polar Outdoor Lighting
    const hemiLight = new THREE.HemisphereLight(0xdcefff, 0x8ba2b5, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.35);
    sunLight.position.set(110, 75, 80);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -140;
    sunLight.shadow.camera.right = 140;
    sunLight.shadow.camera.top = 140;
    sunLight.shadow.camera.bottom = -140;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.04;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 7. Pipeline Flow Shader (Single Compile Shader)
    const applyPipelineFlowShader = (
      material: THREE.Material,
      colorHex: string,
      direction: THREE.Vector3,
      speed: number = 4.0,
      frequency: number = 0.25,
      pulseIntensity: number = 2.2
    ) => {
      if ((material as any).userData?.flowCompiled) return;
      (material as any).userData.flowCompiled = true;

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = flowTimeUniformRef.current;
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
          float flowDist = dot(vFlowWorldPos, uFlowDir);
          float wave = sin(flowDist * uFlowFreq - uTime * uFlowSpeed);
          float pulse = smoothstep(0.35, 0.95, wave);
          vec3 fluidGlow = uFlowColor * (0.35 + pulse * uPulseIntensity);
          gl_FragColor.rgb += fluidGlow;
          `
        );
      };
    };

    // 8. Load GLTF Digital Twin Model for Bharati
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const compressedGlbUrl = "/assets/bharati_digital_twin_compressed.glb";
    const uncompressedGlbUrl = "/assets/bharati_digital_twin.glb";

    const onModelLoaded = (gltf: any) => {
      const root = gltf.scene;
      scene.add(root);

      mainRoofRef.current = root.getObjectByName("Bharati_Building_Main_Roof") || null;

      // Traverse scene and calibrate materials & lights
      root.traverse((node: any) => {
        // Disable rogue Blender default light intensity (which can reach 6,522+ candela)
        if (node.isLight) {
          if (
            node.name === "Light" ||
            node.intensity > 5000 ||
            node.name.includes("Antarctic_Polar_Sun") ||
            node.name.includes("Sky_Fill") ||
            node.name.includes("Lounge_Light")
          ) {
            node.visible = false;
            node.intensity = 0.0;
          }
        }

        if (node.isMesh) {
          const meshName = node.name || "";
          const mat = node.material;

          // Selective Shadow Optimization
          if (meshName.includes("Terrain") || meshName.includes("Rocky") || meshName.includes("Ground")) {
            node.castShadow = false;
            node.receiveShadow = true;
          } else if (
            meshName.includes("Hull") ||
            meshName.includes("Building") ||
            meshName.includes("Roof") ||
            meshName.includes("Girder") ||
            meshName.includes("Frame") ||
            meshName.includes("Structure") ||
            meshName.includes("Plant")
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

              // Double-sided geometry to ensure 360-degree viewing inside rooms without backface clipping
              m.side = THREE.DoubleSide;

              // Telemetry Screen Glow without over-saturation
              if (
                matName.includes("Screen") ||
                matName.includes("Display") ||
                matName.includes("Cyan")
              ) {
                m.emissive = new THREE.Color("#00f0ff");
                m.emissiveIntensity = 0.5;
                m.roughness = 0.25;
                m.needsUpdate = true;
              }

              // Triple-Glazed Polar Glass & Ribbon Windows (Transparent & Reflective)
              if (
                matName.includes("Glass") ||
                matName.includes("Glazing") ||
                matName.includes("Polar_Glass")
              ) {
                m.transparent = true;
                m.opacity = 0.38;
                m.roughness = 0.05;
                m.metalness = 0.9;
                m.depthWrite = true;
                m.needsUpdate = true;
              }

              // Aerodynamic metal skin
              if (matName.includes("Aerodynamic") || matName.includes("Metal_Skin")) {
                m.roughness = 0.35;
                m.metalness = 0.75;
                m.needsUpdate = true;
              }

              // Ashoka Chakra & Indian National Flag
              if (matName.includes("Ashoka_Chakra") || matName.includes("Flag")) {
                m.roughness = 0.7;
                m.metalness = 0.05;
                m.side = THREE.DoubleSide;
                m.needsUpdate = true;
              }

              // Lounge interior finishes
              if (matName.includes("Lounge_Cream_Leather") || matName.includes("Lounge_Navy_Carpet")) {
                m.roughness = 0.75;
                m.metalness = 0.05;
                m.needsUpdate = true;
              }

              // Pulse Materials (glow highlights for the 5 pipeline channels)
              if (matName === "Bharati_Water_Pulse_Mat") {
                m.color = new THREE.Color("#00a8ff");
                m.emissive = new THREE.Color("#00a8ff");
                m.emissiveIntensity = 1.6;
                m.roughness = 0.15;
                m.needsUpdate = true;
              } else if (matName === "Bharati_Fuel_Pulse_Mat") {
                m.color = new THREE.Color("#ffaa00");
                m.emissive = new THREE.Color("#ffaa00");
                m.emissiveIntensity = 1.6;
                m.roughness = 0.15;
                m.needsUpdate = true;
              } else if (matName === "Bharati_Sewage_Pulse_Mat") {
                m.color = new THREE.Color("#00d4a0");
                m.emissive = new THREE.Color("#00d4a0");
                m.emissiveIntensity = 1.5;
                m.roughness = 0.15;
                m.needsUpdate = true;
              } else if (matName === "Bharati_Power_Pulse_Mat") {
                m.color = new THREE.Color("#f97316");
                m.emissive = new THREE.Color("#f97316");
                m.emissiveIntensity = 1.8;
                m.roughness = 0.15;
                m.needsUpdate = true;
              } else if (matName === "Bharati_HeatTrace_Pulse_Mat") {
                m.color = new THREE.Color("#e11d48");
                m.emissive = new THREE.Color("#e11d48");
                m.emissiveIntensity = 2.0;
                m.roughness = 0.15;
                m.needsUpdate = true;
              }
            });
          }

          // Apply high-performance procedural flow shader to insulated pipelines
          if (meshName === "Pipeline_Water_Insulated" || meshName === "Pipeline_Water_Pulse_Core") {
            const waterDir = new THREE.Vector3(1, 0.2, 0).normalize();
            const pipeMat = Array.isArray(mat) ? mat[0] : mat;
            if (pipeMat) applyPipelineFlowShader(pipeMat, "#00A8FF", waterDir, 4.0, 0.3, 2.2);
          }

          if (meshName === "Pipeline_Fuel_DoubleWall" || meshName === "Pipeline_Fuel_Pulse_Core") {
            const fuelDir = new THREE.Vector3(0, 0, 1).normalize();
            const pipeMat = Array.isArray(mat) ? mat[0] : mat;
            if (pipeMat) applyPipelineFlowShader(pipeMat, "#FFAA00", fuelDir, 3.8, 0.28, 2.2);
          }

          if (meshName === "Pipeline_Sewage_Insulated" || meshName === "Pipeline_Sewage_Pulse_Core") {
            const sewageDir = new THREE.Vector3(-1, -0.3, 0).normalize();
            const pipeMat = Array.isArray(mat) ? mat[0] : mat;
            if (pipeMat) applyPipelineFlowShader(pipeMat, "#00D4A0", sewageDir, 3.5, 0.25, 2.0);
          }

          if (meshName === "Powerline_Tray_Grid" || meshName === "Powerline_Pulse_Core") {
            const powerDir = new THREE.Vector3(0, 1, 0).normalize();
            const pipeMat = Array.isArray(mat) ? mat[0] : mat;
            if (pipeMat) applyPipelineFlowShader(pipeMat, "#F97316", powerDir, 5.0, 0.35, 2.4);
          }

          if (meshName === "Pipeline_HeatTrace_Lines" || meshName === "Pipeline_HeatTrace_Pulse_Core") {
            const heatDir = new THREE.Vector3(1, 0, 1).normalize();
            const pipeMat = Array.isArray(mat) ? mat[0] : mat;
            if (pipeMat) applyPipelineFlowShader(pipeMat, "#E11D48", heatDir, 5.2, 0.35, 2.5);
          }
        }
      });

      // Setup Animation Mixer
      clipsRef.current = gltf.animations || [];
      if (clipsRef.current.length > 0) {
        const mixer = new THREE.AnimationMixer(root);
        mixerRef.current = mixer;

        clipsRef.current.forEach((clip) => {
          actionsRef.current[clip.name] = mixer.clipAction(clip);
        });

        // Default to live all-systems pulse loop (Index 4)
        const defaultClip =
          clipsRef.current.find((c) => c.name === "Bharati_All_Systems_Pulse_Loop") ||
          clipsRef.current[4] ||
          clipsRef.current[0];

        if (defaultClip) {
          const act = mixer.clipAction(defaultClip);
          act.play();
          currentActionRef.current = act;
        }
      }

      // Read embedded Room Registry directly from GLB extras, or use fallback
      const parsedRegistry = gltf.parser.json?.extras?.room_registry;
      const finalRegistry: { [id: string]: BharatiRoomEntry } = parsedRegistry
        ? { ...BHARATI_ROOM_REGISTRY, ...parsedRegistry }
        : BHARATI_ROOM_REGISTRY;
      roomRegistryRef.current = finalRegistry;

      // Configure interior lighting for all 16 rooms
      const interiorLightsMap: { [id: string]: THREE.PointLight } = {};
      Object.values(finalRegistry).forEach((room) => {
        const lightName = "Light_Interior_" + room.id;
        const lightObj = root.getObjectByName(lightName);

        let pointLight: THREE.PointLight | null = null;
        if (lightObj) {
          pointLight = (lightObj as any).isLight
            ? (lightObj as any)
            : lightObj.children?.find((c: any) => c.isLight);
        }

        if (pointLight) {
          pointLight.visible = false;
          pointLight.intensity = 0.0;
          pointLight.color.set(0xffeedd);
          pointLight.distance = 12.0;
          pointLight.decay = 2.0;
          interiorLightsMap[room.id] = pointLight;
        } else {
          const pos = room.light_pos
            ? blenderToThreeCoords(room.light_pos)
            : blenderToThreeCoords(room.position);
          const fallbackLight = new THREE.PointLight(0xffeedd, 0.0, 12.0, 2.0);
          fallbackLight.position.set(pos.x, pos.y + 0.5, pos.z);
          scene.add(fallbackLight);
          interiorLightsMap[room.id] = fallbackLight;
        }
      });
      interiorLightsRef.current = interiorLightsMap;

      setLoading(false);
    };

    gltfLoader.load(
      compressedGlbUrl,
      onModelLoaded,
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(pct);
        }
      },
      (error) => {
        console.warn("[Bharati 3D Twin] Error loading compressed GLB, trying uncompressed:", error);
        gltfLoader.load(
          uncompressedGlbUrl,
          onModelLoaded,
          (xhr) => {
            if (xhr.total > 0) {
              const pct = Math.round((xhr.loaded / xhr.total) * 100);
              setLoadProgress(pct);
            }
          },
          (err) => {
            console.error("[Bharati 3D Twin] Failed to load both GLB files:", err);
            setLoading(false);
          }
        );
      }
    );

    // 9. High-Performance Render Loop
    const clock = new THREE.Clock();
    const tempCamPos = new THREE.Vector3();
    const tempCamQuat = new THREE.Quaternion();
    const tempForward = new THREE.Vector3();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update pipeline shader time
      flowTimeUniformRef.current.value = elapsed;

      // Update Animation Mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Synchronized Tour Camera Tracking
      const tourCamNode = activeTourCameraNodeRef.current;
      if (tourCamNode && controlsRef.current && cameraRef.current) {
        controlsRef.current.enabled = false;

        tourCamNode.getWorldPosition(tempCamPos);
        tourCamNode.getWorldQuaternion(tempCamQuat);

        cameraRef.current.position.copy(tempCamPos);
        cameraRef.current.quaternion.copy(tempCamQuat);

        const childCam = (tourCamNode as any).isCamera
          ? (tourCamNode as any)
          : tourCamNode.children?.find((c: any) => c.isCamera);

        if (childCam && childCam.fov && childCam.fov !== lastFovRef.current) {
          lastFovRef.current = childCam.fov;
          cameraRef.current.fov = childCam.fov;
          cameraRef.current.updateProjectionMatrix();
        }

        tempForward.set(0, 0, -1).applyQuaternion(tempCamQuat);
        controlsRef.current.target.copy(tempCamPos).addScaledVector(tempForward, 5.0);
      } else if (controlsRef.current) {
        controlsRef.current.enabled = true;
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
      dracoLoader.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  // ── TRIGGER PIPELINE TOUR WITH SYNCHRONIZED CAMERA TRACKING ──
  const playTour = useCallback((tourIndex: number) => {
    if (!mixerRef.current || !sceneRef.current || !cameraRef.current) return;
    const tour = BHARATI_UTILITY_TOURS.find((t) => t.index === tourIndex);
    if (!tour) return;

    setActiveTourIndex(tourIndex);
    setActiveRoom(null);

    // Restore natural outdoor daylight & extinguish interior lights
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 1.35;
      sunLightRef.current.color.set(0xfff8ee);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.75;
      hemiLightRef.current.color.set(0xdcefff);
      hemiLightRef.current.groundColor.set(0x8ba2b5);
    }
    if (sceneRef.current) {
      (sceneRef.current as any).environmentIntensity = 0.7;
    }
    Object.values(interiorLightsRef.current).forEach((l) => {
      l.visible = false;
      l.intensity = 0.0;
    });

    // Free orbit all-systems pulse loop
    if (tour.cameraName === null) {
      activeTourCameraNodeRef.current = null;
      tourActionRef.current = null;

      if (currentActionRef.current) currentActionRef.current.fadeOut(0.35);
      const clip =
        clipsRef.current.find((c) => c.name === tour.clipName) ||
        clipsRef.current[4] ||
        clipsRef.current[0];
      if (clip) {
        const act = mixerRef.current.clipAction(clip);
        act.reset().fadeIn(0.35).play();
        currentActionRef.current = act;
      }

      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.minDistance = 3.0;
        controlsRef.current.maxDistance = 500.0;
      }
      return;
    }

    // Camera-tracked tour (Freshwater, Fuel, Sewage, Power)
    const tourCameraNode = sceneRef.current.getObjectByName(tour.cameraName);
    activeTourCameraNodeRef.current = tourCameraNode || null;

    const clip = clipsRef.current.find((c) => c.name === tour.clipName);
    if (clip) {
      if (currentActionRef.current) currentActionRef.current.fadeOut(0.25);
      const action = mixerRef.current.clipAction(clip);
      action.reset();
      action.paused = false;
      action.loop = THREE.LoopRepeat;
      action.fadeIn(0.25).play();
      currentActionRef.current = action;
      tourActionRef.current = action;
      setTourPlaying(true);
    }
  }, []);

  // Toggle Tour Play/Pause
  const toggleTourPlayback = useCallback(() => {
    if (!tourActionRef.current) return;
    if (tourPlaying) {
      tourActionRef.current.paused = true;
      setTourPlaying(false);
    } else {
      tourActionRef.current.paused = false;
      setTourPlaying(true);
    }
  }, [tourPlaying]);

  // Toggle Roof X-Ray Lift (+18m elevation)
  const toggleRoofLift = useCallback(() => {
    if (mixerRef.current) {
      const roofClip = clipsRef.current.find((c) => c.name === "Roof_XRay_Lift" || c.name.includes("Roof"));
      if (roofClip) {
        const action = mixerRef.current.clipAction(roofClip);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;

        if (!roofLifted) {
          action.timeScale = 1;
          action.paused = false;
          action.reset().play();
          setRoofLifted(true);
          return;
        } else {
          action.timeScale = -1;
          action.paused = false;
          action.play();
          setRoofLifted(false);
          return;
        }
      }
    }

    // Fallback: translate roof mesh directly
    if (mainRoofRef.current) {
      gsap.to(mainRoofRef.current.position, {
        y: roofLifted ? 0 : 18.0,
        duration: 1.2,
        ease: "power2.inOut",
      });
      setRoofLifted(!roofLifted);
    }
  }, [roofLifted]);

  // ── LOCK INSIDE ROOM (PERSON SITTING VIEW) ──
  const lockInsideRoom = useCallback(
    (room: BharatiRoomEntry) => {
      if (!cameraRef.current || !controlsRef.current || !sceneRef.current) return;

      activeTourCameraNodeRef.current = null;
      tourActionRef.current = null;

      setActiveRoom(room);
      if (onRoomSelect) onRoomSelect(room.id);

      const camera = cameraRef.current;
      const controls = controlsRef.current;

      const sittingEyePos = blenderToThreeCoords(room.position);
      const lookTargetPos = blenderToThreeCoords(room.target);

      // Transition lighting to cozy indoor room atmosphere:
      // Keep soft ambient fill and warm ceiling fixture so interior is clear and inviting
      if (sunLightRef.current) sunLightRef.current.intensity = 0.3;
      if (hemiLightRef.current) {
        hemiLightRef.current.intensity = 0.48;
        hemiLightRef.current.color.set(0xffeedd);
      }
      if (sceneRef.current) {
        (sceneRef.current as any).environmentIntensity = 0.35;
      }

      // Extinguish all other 15 room lights
      Object.values(interiorLightsRef.current).forEach((l) => {
        l.visible = false;
        l.intensity = 0.0;
      });

      // Activate ONLY selected room's warm ceiling fixture
      const roomLight = interiorLightsRef.current[room.id];
      if (roomLight) {
        roomLight.visible = true;
        roomLight.intensity = 55.0;
        roomLight.color.set(0xffeedd);
        roomLight.distance = 25.0;
        roomLight.decay = 2.0;
      }

      controls.enabled = false;
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);

      gsap.to(camera.position, {
        x: sittingEyePos.x,
        y: sittingEyePos.y,
        z: sittingEyePos.z,
        duration: 1.8,
        ease: "power3.inOut",
      });

      gsap.to(controls.target, {
        x: lookTargetPos.x,
        y: lookTargetPos.y,
        z: lookTargetPos.z,
        duration: 1.8,
        ease: "power3.inOut",
        onComplete: () => {
          controls.enabled = true;
          controls.minDistance = room.minDistance || 0.05;
          controls.maxDistance = room.maxDistance || 2.2;
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
    [onRoomSelect]
  );

  // ── RESET TO STATION EXTERIOR OVERVIEW ──
  const resetToOverview = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    activeTourCameraNodeRef.current = null;
    tourActionRef.current = null;
    setActiveRoom(null);
    setActiveTourIndex(4);
    setActiveMode("overview");

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Restore natural outdoor polar sunlight
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 1.35;
      sunLightRef.current.color.set(0xfff8ee);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.75;
      hemiLightRef.current.color.set(0xdcefff);
      hemiLightRef.current.groundColor.set(0x8ba2b5);
    }
    if (sceneRef.current) {
      (sceneRef.current as any).environmentIntensity = 0.7;
    }
    // Extinguish interior room lights
    Object.values(interiorLightsRef.current).forEach((l) => {
      l.visible = false;
      l.intensity = 0.0;
    });

    controls.enabled = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
      x: -65,
      y: 34,
      z: 70,
      duration: 2.0,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: 0,
      y: 5,
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

    // Play all-systems flow loop
    const pulseClip =
      clipsRef.current.find((c) => c.name === "Bharati_All_Systems_Pulse_Loop") ||
      clipsRef.current[4];
    if (mixerRef.current && pulseClip) {
      if (currentActionRef.current) currentActionRef.current.fadeOut(0.3);
      const act = mixerRef.current.clipAction(pulseClip);
      act.reset().fadeIn(0.3).play();
      currentActionRef.current = act;
    }
  }, []);

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
      scene.background = new THREE.Color("#6b9bc3");
      scene.fog = new THREE.FogExp2(0x6b9bc3, 0.0014);
      if (hemiLightRef.current) {
        hemiLightRef.current.color.set(0xdcefff);
        hemiLightRef.current.groundColor.set(0x8ba2b5);
        hemiLightRef.current.intensity = 0.75;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xfff8ee);
        sunLightRef.current.intensity = 1.35;
      }
      setLightingMode("SUN");
    }
  };

  // Filtered room list
  const rooms = Object.values(roomRegistryRef.current);
  const filteredRooms = roomCategory === "All" ? rooms : rooms.filter((r) => r.category === roomCategory);
  const activeTour = BHARATI_UTILITY_TOURS.find((t) => t.index === activeTourIndex);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#03060E] ${className}`}>
      {/* ── 3D WEBGL CANVAS ── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── HIGH-TECH MINIMAL LOADING OVERLAY ── */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-[#03060E]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 p-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-[#00A8FF]/20 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-t-[#00A8FF] border-r-transparent border-b-[#FFAA00] border-l-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-[#00A8FF]">
              {loadProgress}%
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#EBF5FC] font-semibold">
              Loading Bharati 3D Digital Twin
            </h3>
            <p className="font-mono text-[10px] text-[#4A7A8E]">
              Calibrating Larsemann Hills terrain, 134 modular container assemblies, and 5 utility pulse lifelines...
            </p>
          </div>
        </div>
      )}

      {/* ── TOP-LEFT STATION IDENTITY BADGE & SWITCHER ── */}
      <div className="absolute top-20 left-4 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#040D1A]/85 border border-white/10 backdrop-blur-2xl shadow-xl">
          <span className="w-2 h-2 rounded-full bg-[#00A8FF] animate-pulse shadow-[0_0_8px_#00A8FF]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#EBF5FC] font-semibold">
            Bharati Station 3D Twin
          </span>
          <span className="text-white/20">·</span>
          <span className="font-mono text-[10px] text-[#00A8FF] font-medium">69°24′S, 76°11′E</span>
        </div>

        {/* Quick Station Switcher */}
        <div className="hidden sm:flex items-center p-0.5 rounded-full bg-[#040D1A]/85 border border-white/10 backdrop-blur-2xl shadow-xl font-mono text-[10px]">
          <a
            href="/twin"
            className="px-2.5 py-1 rounded-full text-[#7ABBD4] hover:text-white uppercase tracking-wider transition-colors"
          >
            Maitri
          </a>
          <span className="px-2.5 py-1 rounded-full bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 font-semibold uppercase tracking-wider shadow-[0_0_8px_rgba(0,168,255,0.3)]">
            Bharati
          </span>
        </div>
      </div>

      {/* ── TOP-RIGHT QUICK ACTION CLUSTER ── */}
      <div className="absolute top-20 right-4 sm:right-6 z-30 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 bg-[#040D1A]/85 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-xl">
          <button
            onClick={resetToOverview}
            className={`p-2 rounded-xl transition-all ${
              activeMode === "overview" && !activeRoom
                ? "bg-[#00A8FF]/20 text-[#00A8FF]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
            title="Reset to Station Overview"
          >
            <Compass size={16} weight="duotone" />
          </button>

          <button
            onClick={toggleRoofLift}
            className={`p-2 rounded-xl transition-all ${
              roofLifted
                ? "bg-[#e11d48]/25 text-[#ff4d6d] border border-[#e11d48]/40 shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
            title="Toggle Roof X-Ray Lift (+18m)"
          >
            <Cube size={16} weight="duotone" />
          </button>

          <button
            onClick={toggleAutoRotate}
            className={`p-2 rounded-xl transition-colors ${
              isRotating ? "bg-[#00A8FF]/20 text-[#00A8FF]" : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
            title="Toggle Auto-Orbit"
          >
            <ArrowsClockwise size={16} className={isRotating ? "animate-spin" : ""} />
          </button>

          <button
            onClick={cycleLighting}
            className="p-2 rounded-xl text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
            title={`Cycle Lighting (${lightingMode})`}
          >
            {lightingMode === "SUN" ? <Sun size={16} weight="duotone" /> : <Moon size={16} weight="duotone" />}
          </button>

          {enableFullscreenButton && (
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ── ACTIVE PERSON VIEW CALLOUT (TOP CENTER) ── */}
      {activeRoom && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#040D1A]/90 border border-[#00A8FF]/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-3 duration-300">
            <Camera size={16} className="text-[#00A8FF]" weight="duotone" />
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold text-white tracking-wide">
                {activeRoom.name}
              </span>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-[#00D4A0]/20 text-[#00D4A0] border border-[#00D4A0]/30 font-semibold uppercase">
                Sitting Perspective
              </span>
            </div>
            <button
              onClick={resetToOverview}
              className="ml-2 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#EBF5FC] font-mono text-[10px] uppercase font-semibold transition-colors"
            >
              Exit View
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVE TOUR PLAY/PAUSE STATUS BADGE ── */}
      {activeTourCameraNodeRef.current && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/85 border border-[#00A8FF]/30 backdrop-blur-md shadow-lg font-mono text-[10px] text-[#7ABBD4]">
            <button
              onClick={toggleTourPlayback}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {tourPlaying ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
            </button>
            <span className="uppercase tracking-wider text-[#00A8FF] font-semibold">
              {activeTour?.label}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[#94A3B8]">{activeTour?.badge}</span>
          </div>
        </div>
      )}

      {/* ── FLOATING ISLAND CONTROLS (BOTTOM CENTER DOCK) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-3 w-[92%] sm:w-auto max-w-2xl">
        {/* SUBMENU 1: LIFELINE FLOWS SELECTOR */}
        {activeMode === "flows" && !activeRoom && (
          <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-x-auto no-scrollbar">
            {BHARATI_UTILITY_TOURS.map((tour) => {
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

        {/* SUBMENU 2: FACILITIES SELECTOR */}
        {activeMode === "rooms" && !activeRoom && (
          <div className="w-full max-w-xl flex flex-col gap-2.5 p-3 rounded-3xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-white/[0.08]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(["All", "Science Labs", "Operations", "Living & Medical"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRoomCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                      roomCategory === cat
                        ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 font-semibold"
                        : "text-[#4A7A8E] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveMode("overview")}
                className="p-1 rounded-lg text-[#4A7A8E] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Room Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => lockInsideRoom(room)}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#00A8FF]/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Camera size={13} className="text-[#4A7A8E] group-hover:text-[#00A8FF] shrink-0" />
                    <span className="font-sans text-xs text-[#EBF5FC] truncate">{room.name}</span>
                  </div>
                  <CaretRight size={12} className="text-[#4A7A8E] group-hover:text-white shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN DOCK BAR */}
        <div className="flex items-center p-1.5 rounded-full bg-[#040D1A]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] gap-1">
          <button
            onClick={resetToOverview}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              activeMode === "overview" && !activeRoom
                ? "bg-[#00A8FF] text-[#03060E] shadow-[0_0_20px_rgba(0,168,255,0.4)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass size={15} weight="duotone" />
            <span>Station View</span>
          </button>

          <button
            onClick={() => {
              if (activeMode === "flows") {
                setActiveMode("overview");
              } else {
                setActiveMode("flows");
                playTour(activeTourIndex ?? 4);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              activeMode === "flows"
                ? "bg-[#00A8FF] text-[#03060E] shadow-[0_0_20px_rgba(0,168,255,0.4)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
          >
            <Lightning size={15} weight="duotone" />
            <span>Lifeline Flows</span>
          </button>

          <button
            onClick={() => setActiveMode(activeMode === "rooms" ? "overview" : "rooms")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              activeMode === "rooms" || activeRoom
                ? "bg-[#00A8FF] text-[#03060E] shadow-[0_0_20px_rgba(0,168,255,0.4)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
          >
            <Cpu size={15} weight="duotone" />
            <span>Explore Rooms ({rooms.length})</span>
          </button>
        </div>
      </div>

      {/* ── MINIMAL VIEWPORT HINT (BOTTOM RIGHT) ── */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/80 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#4A7A8E]">
        <span>Drag to Orbit</span>
        <span>·</span>
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
}
