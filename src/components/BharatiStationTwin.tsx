"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  Sun,
  Moon,
  ArrowsIn,
  ArrowsOut,
  Play,
  Pause,
  CaretRight,
  CaretLeft,
  X,
  Cpu,
  Drop,
  Stack,
  StackSimple,
  Eye,
  Wrench,
  Gear,
} from "@phosphor-icons/react";

export interface BharatiRoomEntry {
  id: string;
  name: string;
  level: "L1" | "L2" | "L3" | "L4" | "EXT";
  category: "Living" | "Command" | "Power" | "LifeSupport" | "Science" | "Logistics" | "External";
  position: [number, number, number]; // Three.js Coordinates (X, Y_up, Z_depth)
  target: [number, number, number];   // Look-at Target (X, Y_up, Z_depth)
  center?: [number, number, number];
  fov?: number;
  minDistance?: number;
  maxDistance?: number;
  cutawayRoofRequired: boolean;
  description: string;
  meshKeywords?: string[]; // Keywords to match meshes for click & hover raycasting
}

// ── CALIBRATED 34-FACILITY REGISTRY DIRECT FROM BHARATI GLB ASSET ──
export const BHARATI_ROOM_REGISTRY: { [id: string]: BharatiRoomEntry } = {
  // ── LEVEL 03: LIVING, CONTROL & COMMAND (Z ≈ 7.5m - 10.5m) ──
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
    meshKeywords: ["Lounge_", "Recliner_", "Ottoman_", "Coffee_Table", "Couch_"],
  },
  command_center: {
    id: "command_center",
    name: "Command & Radio Room",
    level: "L3",
    category: "Command",
    position: [7.8, 9.2, -6.0],
    target: [11.5, 8.4, -6.0],
    center: [9.83, 8.4, -6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Primary station operations console, satellite telecom, and emergency VHF communications.",
    meshKeywords: ["BHA-CMD-CONSOLE-01"],
  },
  bms_server_room: {
    id: "bms_server_room",
    name: "BMS & SCADA NOC",
    level: "L3",
    category: "Command",
    position: [12.5, 9.2, -6.0],
    target: [15.8, 8.6, -6.0],
    center: [15.79, 8.53, -6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Central Building Management System, redundant telemetry servers, and optical networks.",
    meshKeywords: ["BHA-BMS-SERVER-RACK"],
  },
  hospital: {
    id: "hospital",
    name: "Medical Clinic & OT",
    level: "L3",
    category: "LifeSupport",
    position: [15.5, 9.2, -5.0],
    target: [18.5, 8.8, -5.68],
    center: [17.95, 9.2, -5.68],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Station hospital, surgical operation theatre, and tele-medicine critical care bay.",
    meshKeywords: ["BHA-MED-CLINIC-01"],
  },
  galley: {
    id: "galley",
    name: "Galley Kitchen",
    level: "L3",
    category: "Living",
    position: [7.8, 9.2, 6.0],
    target: [10.5, 8.6, 6.0],
    center: [9.95, 8.7, 6.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Commercial induction cooking line, dry storage access, and expedition nutrition prep.",
    meshKeywords: ["BHA-GALLEY-ISLAND"],
  },
  dining_mess: {
    id: "dining_mess",
    name: "Dining Mess Hall",
    level: "L3",
    category: "Living",
    position: [13.5, 9.3, 6.0],
    target: [17.5, 8.2, 6.0],
    center: [16.25, 7.88, 6.0],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "Main expedition dining mess hall with seating for 47 overwintering scientists and crew.",
    meshKeywords: ["BHA-MESS-TABLE-01", "BHA-MESS-TABLE-02"],
  },
  sauna: {
    id: "sauna",
    name: "Finnish Sauna & Recovery",
    level: "L3",
    category: "Living",
    position: [20.5, 9.1, 6.0],
    target: [23.0, 8.4, 6.0],
    center: [22.8, 7.95, 6.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.0,
    cutawayRoofRequired: true,
    description: "Electric cedar wood sauna, thermal shower, and polar physiological recovery bay.",
    meshKeywords: ["BHA-SAUNA-CABIN"],
  },

  // ── CABINS 01 TO 07 (NORTH RESIDENTIAL CORRIDOR) ──
  cabin_01: {
    id: "cabin_01",
    name: "Living Cabin 01 (North)",
    level: "L3",
    category: "Living",
    position: [-14.0, 9.0, -5.8],
    target: [-14.0, 8.45, -8.15],
    center: [-14.0, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Expedition accommodation module (insulated double-glazed window, desk, and warm berth).",
    meshKeywords: ["BHA-CABIN-01"],
  },
  cabin_02: {
    id: "cabin_02",
    name: "Living Cabin 02 (North)",
    level: "L3",
    category: "Living",
    position: [-10.8, 9.0, -5.8],
    target: [-10.8, 8.45, -8.15],
    center: [-10.8, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-02"],
  },
  cabin_03: {
    id: "cabin_03",
    name: "Living Cabin 03 (North)",
    level: "L3",
    category: "Living",
    position: [-7.6, 9.0, -5.8],
    target: [-7.6, 8.45, -8.15],
    center: [-7.6, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-03"],
  },
  cabin_04: {
    id: "cabin_04",
    name: "Living Cabin 04 (North)",
    level: "L3",
    category: "Living",
    position: [-4.4, 9.0, -5.8],
    target: [-4.4, 8.45, -8.15],
    center: [-4.4, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-04"],
  },
  cabin_05: {
    id: "cabin_05",
    name: "Living Cabin 05 (North)",
    level: "L3",
    category: "Living",
    position: [-1.2, 9.0, -5.8],
    target: [-1.2, 8.45, -8.15],
    center: [-1.2, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-05"],
  },
  cabin_06: {
    id: "cabin_06",
    name: "Living Cabin 06 (North)",
    level: "L3",
    category: "Living",
    position: [2.0, 9.0, -5.8],
    target: [2.0, 8.45, -8.15],
    center: [2.0, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-06"],
  },
  cabin_07: {
    id: "cabin_07",
    name: "Living Cabin 07 (North)",
    level: "L3",
    category: "Living",
    position: [5.2, 9.0, -5.8],
    target: [5.2, 8.45, -8.15],
    center: [5.2, 8.45, -8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (North Residential Corridor).",
    meshKeywords: ["BHA-CABIN-07"],
  },

  // ── CABINS 08 TO 14 (SOUTH RESIDENTIAL CORRIDOR) ──
  cabin_08: {
    id: "cabin_08",
    name: "Living Cabin 08 (South)",
    level: "L3",
    category: "Living",
    position: [-14.0, 9.0, 5.8],
    target: [-14.0, 8.45, 8.15],
    center: [-14.0, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-08"],
  },
  cabin_09: {
    id: "cabin_09",
    name: "Living Cabin 09 (South)",
    level: "L3",
    category: "Living",
    position: [-10.8, 9.0, 5.8],
    target: [-10.8, 8.45, 8.15],
    center: [-10.8, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-09"],
  },
  cabin_10: {
    id: "cabin_10",
    name: "Living Cabin 10 (South)",
    level: "L3",
    category: "Living",
    position: [-7.6, 9.0, 5.8],
    target: [-7.6, 8.45, 8.15],
    center: [-7.6, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-10"],
  },
  cabin_11: {
    id: "cabin_11",
    name: "Living Cabin 11 (South)",
    level: "L3",
    category: "Living",
    position: [-4.4, 9.0, 5.8],
    target: [-4.4, 8.45, 8.15],
    center: [-4.4, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-11"],
  },
  cabin_12: {
    id: "cabin_12",
    name: "Living Cabin 12 (South)",
    level: "L3",
    category: "Living",
    position: [-1.2, 9.0, 5.8],
    target: [-1.2, 8.45, 8.15],
    center: [-1.2, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-12"],
  },
  cabin_13: {
    id: "cabin_13",
    name: "Living Cabin 13 (South)",
    level: "L3",
    category: "Living",
    position: [2.0, 9.0, 5.8],
    target: [2.0, 8.45, 8.15],
    center: [2.0, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-13"],
  },
  cabin_14: {
    id: "cabin_14",
    name: "Living Cabin 14 (South)",
    level: "L3",
    category: "Living",
    position: [5.2, 9.0, 5.8],
    target: [5.2, 8.45, 8.15],
    center: [5.2, 8.45, 8.15],
    fov: 58,
    minDistance: 0.1,
    maxDistance: 3.5,
    cutawayRoofRequired: true,
    description: "Single expedition accommodation module (South Residential Corridor).",
    meshKeywords: ["BHA-CABIN-14"],
  },

  // ── LEVEL 02: CHPP POWER, WATER PLANT & LABS (Z ≈ 3.8m - 6.5m) ──
  chpp_generators: {
    id: "chpp_generators",
    name: "CHPP Generator Hall",
    level: "L2",
    category: "Power",
    position: [-8.5, 6.0, 4.0],
    target: [-14.0, 5.0, 4.0],
    center: [-12.0, 5.2, 4.0],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "3x Combined Heat & Power Plant (Volvo Penta 280kVA GenSets) with hydronic heat recovery.",
    meshKeywords: ["BHA-CHPP-GEN-01", "BHA-CHPP-GEN-02", "BHA-CHPP-GEN-03"],
  },
  fuel_day_tank: {
    id: "fuel_day_tank",
    name: "CHPP Fuel Day Tank Room",
    level: "L2",
    category: "Power",
    position: [-19.5, 5.8, 4.0],
    target: [-22.5, 4.8, 4.0],
    center: [-21.97, 4.78, 4.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "470L dual-wall day tank with auto-transfer fuel boost pumps and secondary bund containment.",
    meshKeywords: ["BHA-CHPP-DAYTANK-470L"],
  },
  ro_water_plant: {
    id: "ro_water_plant",
    name: "RO Desalination Plant",
    level: "L2",
    category: "LifeSupport",
    position: [-17.2, 5.9, -4.0],
    target: [-21.0, 4.6, -4.0],
    center: [-20.0, 4.55, -3.99],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.5,
    cutawayRoofRequired: true,
    description: "Dual-train Reverse Osmosis plant converting Quilty Bay polar seawater into potable water.",
    meshKeywords: ["BHA-WTR-RO-PLANT-01"],
  },
  uv_disinfection: {
    id: "uv_disinfection",
    name: "Potable Water UV Disinfection",
    level: "L2",
    category: "LifeSupport",
    position: [-12.5, 5.6, -4.0],
    target: [-15.5, 4.7, -4.8],
    center: [-15.0, 4.7, -4.8],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Potable water pressurization skid, micron filtration, and continuous UV sterilization.",
    meshKeywords: ["BHA-WTR-UV-DISINFECT"],
  },
  mlvd_panel: {
    id: "mlvd_panel",
    name: "Main Low Voltage Switchgear",
    level: "L2",
    category: "Power",
    position: [-0.5, 5.6, 4.0],
    target: [3.0, 4.8, 4.88],
    center: [2.95, 4.9, 4.88],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "415V Main Low Voltage Distribution Switchgear with bus couplers and harmonic filters.",
    meshKeywords: ["BHA-ELE-MLVD-PANEL"],
  },
  ups_batteries: {
    id: "ups_batteries",
    name: "Emergency UPS Battery Room",
    level: "L2",
    category: "Power",
    position: [5.5, 5.6, 4.0],
    target: [8.5, 4.6, 4.9],
    center: [8.5, 4.63, 4.9],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Redundant LiFePO4 battery banks providing zero-transfer uninterruptible power supply.",
    meshKeywords: ["BHA-ELE-UPS-BATTERY-RACK"],
  },
  lab_bio: {
    id: "lab_bio",
    name: "Environmental & Biology Lab",
    level: "L2",
    category: "Science",
    position: [11.5, 5.6, -4.0],
    target: [14.5, 4.4, -3.74],
    center: [14.0, 4.38, -3.74],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Laminar airflow cabinets, cryogenic sample storage, and polar extremophile incubation.",
    meshKeywords: ["BHA-LAB-BIO-BENCH"],
  },
  lab_geo: {
    id: "lab_geo",
    name: "Geoscience & Petrography Lab",
    level: "L2",
    category: "Science",
    position: [17.5, 5.6, -4.0],
    target: [20.5, 4.4, -3.74],
    center: [20.0, 4.38, -3.74],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Rock coring analyzers, petrographic microscopes, and Antarctic ice-drill analytics benches.",
    meshKeywords: ["BHA-LAB-GEO-BENCH"],
  },

  // ── LEVEL 01: VEHICLE GARAGE & WORKSHOP (Z ≈ 0.0m - 3.2m) ──
  garage_lift: {
    id: "garage_lift",
    name: "PistenBully Maintenance Bay",
    level: "L1",
    category: "Logistics",
    position: [-4.5, 2.4, 4.5],
    target: [-8.5, 0.8, 4.7],
    center: [-8.1, 0.6, 4.7],
    fov: 65,
    minDistance: 0.1,
    maxDistance: 6.0,
    cutawayRoofRequired: true,
    description: "Heavy hydraulic scissor lift servicing tracked PistenBully snow groomers and snowmobiles.",
    meshKeywords: ["BHA-L1-VEH-LIFT-01", "BHA-L1-ROLLER-DOOR-01", "BHA-L1-ROLLER-DOOR-02"],
  },
  workshop_bench: {
    id: "workshop_bench",
    name: "Mechanical & Tool Workshop",
    level: "L1",
    category: "Logistics",
    position: [-10.0, 2.2, 8.0],
    target: [-13.5, 1.0, 8.0],
    center: [-13.0, 0.97, 8.0],
    fov: 62,
    minDistance: 0.1,
    maxDistance: 5.0,
    cutawayRoofRequired: true,
    description: "Heavy lathe, drill presses, TIG/MIG welding station, and precision pneumatic tooling.",
    meshKeywords: ["BHA-L1-WORKSHOP-BENCH"],
  },
  boot_wash: {
    id: "boot_wash",
    name: "Airlock & Mudroom Boot Wash",
    level: "L1",
    category: "Logistics",
    position: [3.8, 1.8, 7.0],
    target: [6.5, 0.6, 7.0],
    center: [6.0, 0.58, 7.0],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Thermal airlock barrier, heavy outdoor boots wash trough, and expedition parka drying lockers.",
    meshKeywords: ["BHA-L1-BOOT-WASH"],
  },
  waste_baler: {
    id: "waste_baler",
    name: "Environmental Waste Compactor",
    level: "L1",
    category: "Logistics",
    position: [11.2, 2.2, 6.0],
    target: [14.5, 1.2, 6.03],
    center: [14.0, 1.23, 6.03],
    fov: 60,
    minDistance: 0.1,
    maxDistance: 4.5,
    cutawayRoofRequired: true,
    description: "Hydraulic solid waste baler certified compliant with Madrid Environmental Protocol.",
    meshKeywords: ["BHA-L1-WASTE-BALER-01"],
  },

  // ── LEVEL 04: AHU & ROOFTOP TERRACE (Z ≈ 12.0m - 16.5m) ──
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
    meshKeywords: ["Roof_Central_Service_Enclosure", "BHA-ROOF-WALKWAY-01", "BHA-HVAC-AHU"],
  },
  radome_deck: {
    id: "radome_deck",
    name: "Satellite Radome Radials",
    level: "L4",
    category: "Command",
    position: [-6.0, 19.5, 10.0],
    target: [2.0, 15.02, 4.0],
    center: [2.0, 15.02, 4.0],
    fov: 55,
    minDistance: 1.0,
    maxDistance: 35.0,
    cutawayRoofRequired: false,
    description: "Dual C-band / Ku-band tracking radomes for round-the-clock Indian Space research comms.",
    meshKeywords: ["BHA-COM-RADOME-01", "BHA-COM-RADOME-02"],
  },

  // ── EXTERIOR CAMPUS INFRASTRUCTURE (EXT) ──
  seawater_pumphouse: {
    id: "seawater_pumphouse",
    name: "Seawater Intake Pumphouse",
    level: "EXT",
    category: "External",
    position: [-255.0, -22.0, -50.0],
    target: [-285.0, -32.21, -25.0],
    center: [-285.0, -32.21, -25.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Submerged suction intake in Quilty Bay with electric heat tracing protected down to -40°C.",
    meshKeywords: ["BHA-SWI-PUMPHOUSE", "BHA-SWI-INTAKE-PIPE"],
  },
  fuel_farm: {
    id: "fuel_farm",
    name: "Bulk Fuel Tank Farm",
    level: "EXT",
    category: "External",
    position: [-270.0, -18.0, 110.0],
    target: [-310.0, -32.25, 140.0],
    center: [-310.0, -32.25, 140.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 140.0,
    cutawayRoofRequired: false,
    description: "Aviation Turbine Fuel (ATF-50) bund containment storage for winter station survival.",
    meshKeywords: ["BHA-FUEL-FARM-TANK", "BHA-FUEL-PUMP-STATION", "BHA_Fuel_Farm_Containment_Bund"],
  },
  helipads: {
    id: "helipads",
    name: "Logistics Helipads (H1, H2 & H3)",
    level: "EXT",
    category: "External",
    position: [80.0, 15.0, 120.0],
    target: [102.5, 0.87, 75.0],
    center: [102.5, 0.87, 75.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Dual Kamov Ka-32 / Bell 412 certified polar helipads with edge perimeter lighting.",
    meshKeywords: ["BHA-HELIPAD", "BHA-HELI-FUEL", "BHA-HELI-WINDSOCK"],
  },
  emergency_shelter: {
    id: "emergency_shelter",
    name: "Emergency Life Support Refuge",
    level: "EXT",
    category: "External",
    position: [-5.0, -4.0, -270.0],
    target: [-30.0, -14.0, -295.0],
    center: [-30.0, -14.0, -295.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 120.0,
    cutawayRoofRequired: false,
    description: "Autonomous emergency survival refuge complex located 300m North of main station.",
    meshKeywords: ["BHA-EMG-CONTAINER", "BHA-EMG-GEN-25KVA", "BHA-EMG-PLATFORM"],
  },
  lab_atmo: {
    id: "lab_atmo",
    name: "Atmospheric Research Pod",
    level: "EXT",
    category: "External",
    position: [55.0, 8.0, -90.0],
    target: [45.0, 1.79, -110.0],
    center: [45.0, 1.79, -110.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 90.0,
    cutawayRoofRequired: false,
    description: "External atmospheric physics container monitoring aerosol optical depth and ozone column profile.",
    meshKeywords: ["BHA-LAB-ATMO-01"],
  },
  lab_geomag: {
    id: "lab_geomag",
    name: "Geomagnetic Observatory",
    level: "EXT",
    category: "External",
    position: [-105.0, 2.0, -160.0],
    target: [-120.0, -6.5, -180.0],
    center: [-120.0, -6.5, -180.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 100.0,
    cutawayRoofRequired: false,
    description: "Non-magnetic optical hut measuring Earth geomagnetic field variations and auroral electrojets.",
    meshKeywords: ["BHA-LAB-GEOMAG-01"],
  },
  met_mast: {
    id: "met_mast",
    name: "10m Meteorological Mast Tower",
    level: "EXT",
    category: "External",
    position: [85.0, 14.0, -40.0],
    target: [70.0, 5.5, -60.0],
    center: [70.0, 5.5, -60.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 90.0,
    cutawayRoofRequired: false,
    description: "10-meter guyed lattice mast with ultrasonic anemometers, solar radiation flux pyranometers, and barometer.",
    meshKeywords: ["BHA-MET-MAST-10M"],
  },
  cargo_depot: {
    id: "cargo_depot",
    name: "Logistics Cargo Container Depot",
    level: "EXT",
    category: "External",
    position: [45.0, 10.0, 60.0],
    target: [30.0, 2.0, 44.0],
    center: [30.0, 2.0, 44.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 90.0,
    cutawayRoofRequired: false,
    description: "Heavy 20ft and 40ft ISO container staging area for overwinter rations, spare components, and science gear.",
    meshKeywords: ["BHA-CARGO-CNT-"],
  },
  snow_fleet: {
    id: "snow_fleet",
    name: "PistenBully & Snowmobile Staging",
    level: "EXT",
    category: "External",
    position: [25.0, 6.0, 32.0],
    target: [15.0, 1.4, 20.0],
    center: [15.0, 1.4, 20.0],
    fov: 55,
    minDistance: 2.0,
    maxDistance: 80.0,
    cutawayRoofRequired: false,
    description: "Tracked PistenBully 300 snow groomers, cargo haul sleds, and high-flotation snowmobiles.",
    meshKeywords: ["BHA-VEH-PISTENBULLY", "BHA-VEH-SNOWMOBILE", "BHA-VEH-CARGO-SLED"],
  },
};

export interface BharatiTourStage {
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

export interface BharatiUtilityTour {
  id: "water" | "fuel" | "power" | "sewage" | "heattrace" | "all_pulse";
  index: number;
  label: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
  stages: BharatiTourStage[];
}

export const BHARATI_UTILITY_TOURS: BharatiUtilityTour[] = [
  {
    id: "water",
    index: 0,
    label: "Freshwater Lifeline",
    icon: Waves,
    color: "#00A8FF",
    badge: "DESAL & RO TO DHW",
    description: "Seawater intake from Quilty Bay, RO membrane desalination, UV sterilization, and modular science distribution.",
    stages: [
      {
        id: "bharati_water_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "Quilty Bay Shoreline Suction Pumphouse",
        badge: "STAGE 1 · SUB-ICE SEAWATER INTAKE",
        narrative: "Sub-ice suction pipes pull polar seawater from Quilty Bay. Continuous trace heating prevents freezing at -40°C while high-head booster pumps push water 300m overland.",
        telemetry: [
          { label: "Intake Depth", value: "8.5 m", color: "#00A8FF" },
          { label: "Raw Salinity", value: "35,000 ppm" },
          { label: "Heat-Trace", value: "ACTIVE OK", color: "#00D4A0" },
        ],
        cameraPos: [-240, -15, -45],
        targetPos: [-285, -32, -25],
        fov: 56,
      },
      {
        id: "bharati_water_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "300m Overland Gantry Tracking to Station",
        badge: "STAGE 2 · OVERLAND SADDLE PIPELINE",
        narrative: "Smooth camera flight tracking alongside the 300-meter insulated seawater line across permafrost hills, watching the bright cyan fluid pulse journey towards the station.",
        telemetry: [
          { label: "Pipeline Run", value: "300.0 m", color: "#00A8FF" },
          { label: "Flow Velocity", value: "1.85 m/s", color: "#00D4A0" },
          { label: "Intake Temp", value: "-1.8°C" },
        ],
        cameraPos: [-150, 14, -28],
        targetPos: [-195, -8, -18],
        fov: 55,
      },
      {
        id: "bharati_water_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "North Foundation Utility Gantry & Riser Penetration",
        badge: "STAGE 3 · FOUNDATION PILOTI ASCENT",
        narrative: "Following the pipeline as it climbs the north structural piloti columns and penetrates through the foundation header into the building envelope.",
        telemetry: [
          { label: "Elevation Gain", value: "+37.2 m", color: "#00A8FF" },
          { label: "Inlet Pressure", value: "4.8 bar", color: "#00D4A0" },
          { label: "Header Status", value: "ISOLATED OK" },
        ],
        cameraPos: [-60, 15, -16],
        targetPos: [-25, 5.5, -6],
        fov: 55,
      },
      {
        id: "bharati_water_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "Dual RO Desalination & UV Reactor (Level 02)",
        badge: "STAGE 4 · MECHANICAL HALL PENETRATION",
        narrative: "All above structures removed: direct cutaway view into Level 02. The seawater line enters BHA-MEP-INLET-BOX-SEAWATER, feeding dual spiral RO membrane trains at 55 bar and UV disinfection reactors.",
        telemetry: [
          { label: "RO Recovery", value: "45.2%", color: "#00A8FF" },
          { label: "Product Salinity", value: "38 ppm", color: "#00D4A0" },
          { label: "DHW Calorifier", value: "+65.2°C" },
        ],
        cameraPos: [-28, 12, -12],
        targetPos: [-18, 5.0, -4],
        fov: 52,
      },
    ],
  },
  {
    id: "fuel",
    index: 1,
    label: "Bulk Fuel Line",
    icon: GasPump,
    color: "#FFAA00",
    badge: "BULK TANK FARM TO CHPP",
    description: "Double-walled fuel transfer pipeline from Grovnes Peninsula bund tanks to the Level 02 internal day tank & generators.",
    stages: [
      {
        id: "bharati_fuel_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "Grovnes Peninsula Bulk Tank Containment",
        badge: "STAGE 1 · JET A-1 CRYO STORAGE",
        narrative: "Aviation Turbine Fuel (ATF-50, pour point -50°C) is bunkered in heavy stainless bund containment tanks on the elevated south foundation pad with interstitial vacuum monitoring.",
        telemetry: [
          { label: "Bulk Reserve", value: "84,600 L", color: "#FFAA00" },
          { label: "Fuel Grade", value: "ATF-50" },
          { label: "Containment", value: "PRESSURE OK", color: "#00D4A0" },
        ],
        cameraPos: [-260, -10, 110],
        targetPos: [-310, -32, 140],
        fov: 56,
      },
      {
        id: "bharati_fuel_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "350m Elevated Overland Pipeline Gantry",
        badge: "STAGE 2 · DUAL-CONTAINMENT OVERLAND SADDLES",
        narrative: "Cinematic camera flight tracing the 350-meter overland pipeline: double-walled insulated stainless pipes mounted on rock saddle pilings bridge the harsh permafrost terrain into the station base.",
        telemetry: [
          { label: "Transfer Rate", value: "65 L/min", color: "#FFAA00" },
          { label: "Pipeline Trace", value: "+12.0°C" },
          { label: "Leak Sensor", value: "ZERO LEAK", color: "#00D4A0" },
        ],
        cameraPos: [-160, 16, 80],
        targetPos: [-205, -8, 90],
        fov: 55,
      },
      {
        id: "bharati_fuel_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "West Structural Piloti Foundation Penetration",
        badge: "STAGE 3 · WEST FOUNDATION ENTRY",
        narrative: "Tracking the fuel line as it approaches the elevated west building frame, following heat-trace circuits through the building boundary into the MEP core.",
        telemetry: [
          { label: "Pipeline Run", value: "350.0 m", color: "#FFAA00" },
          { label: "Delivery Pressure", value: "3.2 bar" },
          { label: "Thermal Delta", value: "+22.5°C", color: "#00D4A0" },
        ],
        cameraPos: [-65, 16, 32],
        targetPos: [-24, 5.5, 10],
        fov: 55,
      },
      {
        id: "bharati_fuel_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "470L Certified Day Tank & 3x Volvo CHPP GenSets",
        badge: "STAGE 4 · LEVEL 02 DIESEL GENERATION",
        narrative: "All above structures removed: direct cutaway view into the CHPP hall. The fuel line enters BHA-MEP-INLET-BOX-FUEL, dosing the 470L Day Tank and three 280kVA prime power generators.",
        telemetry: [
          { label: "Day Tank Vol", value: "470 L (100%)", color: "#FFAA00" },
          { label: "Active Fuel Flow", value: "32 L/hr" },
          { label: "Fire Damping", value: "FM-200 READY", color: "#00D4A0" },
        ],
        cameraPos: [-26, 12, 16],
        targetPos: [-14, 5.2, 4],
        fov: 52,
      },
    ],
  },
  {
    id: "power",
    index: 2,
    label: "415V Power Grid",
    icon: Lightning,
    color: "#38BDF8",
    badge: "CHPP TO MLVD & UPS",
    description: "415V 50Hz 3-phase microgrid distribution from CHPP generator bus to MLVD switchgear, battery banks, and helipads.",
    stages: [
      {
        id: "bharati_power_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "3x Combined Heat & Power Diesel Cogeneration",
        badge: "STAGE 1 · PRIME GENERATION & HEAT RECOVERY",
        narrative: "Three heavy-duty diesel gensets provide continuous 415V 3-phase microgrid power while exhaust heat exchangers capture 310 kW of thermal energy to warm the living modules.",
        telemetry: [
          { label: "Station Grid", value: "415V / 50.0 Hz", color: "#38BDF8" },
          { label: "Running Units", value: "2 / 3 GenSets" },
          { label: "Thermal Cogeneration", value: "310 kW", color: "#00D4A0" },
        ],
        cameraPos: [-8, 12, 14],
        targetPos: [0, 5.0, 4.5],
        fov: 54,
      },
      {
        id: "bharati_power_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "MLVD Switchgear & LiFePO4 Battery Bank",
        badge: "STAGE 2 · BUS COUPLERS & DISTRIBUTION",
        narrative: "The Main Low Voltage Switchgear automatically synchronizes generators and floats the emergency LiFePO4 battery bank, routing heavy sub-arctic power feeders down the piloti matrix.",
        telemetry: [
          { label: "Bus Frequency", value: "50.01 Hz", color: "#38BDF8" },
          { label: "UPS Float State", value: "100% ONLINE", color: "#00D4A0" },
          { label: "Feeder Load", value: "145 A" },
        ],
        cameraPos: [8, 11, 10],
        targetPos: [4, 5.0, 4.0],
        fov: 54,
      },
      {
        id: "bharati_power_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "Piloti Cable Bridge South Exit",
        badge: "STAGE 3 · SUB-ARCTIC CABLE DESCENT",
        narrative: "Camera tracks heavy armored electrical feeders descending through the elevated south building columns onto the ground cable tray gantry.",
        telemetry: [
          { label: "Feeder Voltage", value: "415 V 3-Phase", color: "#38BDF8" },
          { label: "Cable Rating", value: "XLPE Arctic -50°C" },
          { label: "Gantry Status", value: "ENERGIZED NOMINAL", color: "#00D4A0" },
        ],
        cameraPos: [24, 13, 26],
        targetPos: [38, 3.5, 36],
        fov: 56,
      },
      {
        id: "bharati_power_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "120m Gantry Flight to Helipads H1, H2 & H3",
        badge: "STAGE 4 · EXTERNAL INFRASTRUCTURE FEEDERS",
        narrative: "Flying along the overland cable tray across rock saddles to power logistics Helipads H1/H2 perimeter lighting, aviation navigation aids, and satellite tracking radomes.",
        telemetry: [
          { label: "Helipad Load", value: "18.4 kW", color: "#38BDF8" },
          { label: "Beacon State", value: "100% NOMINAL", color: "#00D4A0" },
          { label: "Feeder Loss", value: "< 0.8%" },
        ],
        cameraPos: [65, 16, 95],
        targetPos: [102, 1.0, 75],
        fov: 55,
      },
    ],
  },
  {
    id: "sewage",
    index: 3,
    label: "Wastewater STP",
    icon: Drop,
    color: "#14B8A6",
    badge: "MBBR BIO-TREATMENT & UV",
    description: "Zero-discharge biological Moving Bed Biofilm Reactor (MBBR) and ultrafiltration satisfying Madrid Protocol.",
    stages: [
      {
        id: "bharati_sewage_stage_1",
        stageNumber: 1,
        totalStages: 4,
        title: "Station Sanitary Gravity Collection",
        badge: "STAGE 1 · GREYWATER & SEWAGE GATHERING",
        narrative: "Electrically traced drainage lines route blackwater and greywater from the galley, hospital, laundry, and modular living cabins directly down the central service riser.",
        telemetry: [
          { label: "Inflow Velocity", value: "18.5 L/min", color: "#14B8A6" },
          { label: "Grease Trap", value: "PASS OK", color: "#00D4A0" },
          { label: "Core Temp", value: "+14.2°C" },
        ],
        cameraPos: [16, 17, 14],
        targetPos: [12, 7.5, 6],
        fov: 55,
      },
      {
        id: "bharati_sewage_stage_2",
        stageNumber: 2,
        totalStages: 4,
        title: "Central MEP Vertical Riser Shaft",
        badge: "STAGE 2 · MULTI-DECK VERTICAL DRAINAGE",
        narrative: "Tracing the teal flow downward through the insulated vertical utility riser connecting Level 03 cabins to Level 02 and Level 01 water processing.",
        telemetry: [
          { label: "Vertical Run", value: "8.5 m", color: "#14B8A6" },
          { label: "Vacuum Assist", value: "-0.45 bar" },
          { label: "Anti-Freeze Trace", value: "ACTIVE OK", color: "#00D4A0" },
        ],
        cameraPos: [-6, 12, 6],
        targetPos: [0, 4.5, 1],
        fov: 54,
      },
      {
        id: "bharati_sewage_stage_3",
        stageNumber: 3,
        totalStages: 4,
        title: "Moving Bed Biofilm Reactor (MBBR) Digestion (Level 02)",
        badge: "STAGE 3 · BIOLOGICAL AEROBIC BREAKDOWN",
        narrative: "Fluidized high-surface biofilm carriers decompose organic waste with aerobic micro-bubble diffusers in the Level 02 mechanical hall, producing crystal-clear pre-filtered water.",
        telemetry: [
          { label: "Dissolved O2", value: "4.2 mg/L", color: "#14B8A6" },
          { label: "Biological COD", value: "< 15 mg/L", color: "#00D4A0" },
          { label: "Madrid Protocol", value: "100% PASS" },
        ],
        cameraPos: [8, 12, 8],
        targetPos: [10, 4.0, 4],
        fov: 54,
      },
      {
        id: "bharati_sewage_stage_4",
        stageNumber: 4,
        totalStages: 4,
        title: "Ultrafiltration & UV Discharge Compliance (Level 01)",
        badge: "STAGE 4 · LEVEL 01 STERILE DISCHARGE",
        narrative: "Treated water passes through 0.04-micron hollow-fiber membranes and high-intensity ultraviolet radiation, rendering it bacteriologically sterile before return.",
        telemetry: [
          { label: "Turbidity", value: "< 0.2 NTU", color: "#14B8A6" },
          { label: "UV Fluence", value: "45 mJ/cm²", color: "#00D4A0" },
          { label: "E. Coli CFU", value: "ZERO (STERILE)" },
        ],
        cameraPos: [-12, 7, 16],
        targetPos: [0, 1.5, 6],
        fov: 54,
      },
    ],
  },
  {
    id: "heattrace",
    index: 4,
    label: "Heat-Trace Line",
    icon: Sun,
    color: "#F97316",
    badge: "FREEZE DEFENSE AT -40°C",
    description: "Self-regulating electric trace heating paired along water, fuel, and sewage pipelines to prevent catastrophic cryo-freezing.",
    stages: [
      {
        id: "bharati_heat_stage_1",
        stageNumber: 1,
        totalStages: 3,
        title: "Quilty Bay Seawater Heat-Trace Protection",
        badge: "STAGE 1 · SUB-ICE INTAKE HEAT ENVELOPE",
        narrative: "Parallel self-regulating electric heat-trace cables encased inside thermal insulation jackets maintain seawater flow temperature at +8°C despite -40°C ambient blizzards.",
        telemetry: [
          { label: "Trace Circuit", value: "HT-SWI-01 ONLINE", color: "#F97316" },
          { label: "Cable Heat", value: "35 W/m" },
          { label: "Ambient Margin", value: "48°C DELTA", color: "#00D4A0" },
        ],
        cameraPos: [-240, -15, -45],
        targetPos: [-285, -32, -25],
        fov: 56,
      },
      {
        id: "bharati_heat_stage_2",
        stageNumber: 2,
        totalStages: 3,
        title: "350m Elevated Fuel Gantry Continuous Heating Flight",
        badge: "STAGE 2 · OVERLAND SADDLE CONTINUOUS HEATING",
        narrative: "Dual redundant heat-trace runs accompany the double-walled fuel pipeline along overland rock saddles, preventing ATF-50 paraffin crystallization.",
        telemetry: [
          { label: "Circuit A", value: "ACTIVE 230V", color: "#F97316" },
          { label: "Circuit B", value: "STANDBY READY" },
          { label: "Pipeline Temp", value: "+14.5°C", color: "#00D4A0" },
        ],
        cameraPos: [-150, 16, 80],
        targetPos: [-195, -8, 85],
        fov: 56,
      },
      {
        id: "bharati_heat_stage_3",
        stageNumber: 3,
        totalStages: 3,
        title: "Building Utility Riser Freeze-Protection Skid",
        badge: "STAGE 3 · INTERNAL RISER INTEGRITY",
        narrative: "Internal mechanical manifold and vertical riser freeze protection keeps greywater and RO distribution loops insulated at 100% operational reliability.",
        telemetry: [
          { label: "Manifold Temp", value: "+18.2°C", color: "#F97316" },
          { label: "Safety Status", value: "ALL NOMINAL", color: "#00D4A0" },
          { label: "Total Trace Load", value: "14.2 kW" },
        ],
        cameraPos: [-26, 12, 14],
        targetPos: [-16, 5.0, 0],
        fov: 54,
      },
    ],
  },
  {
    id: "all_pulse",
    index: 5,
    label: "All Systems Synchrony",
    icon: Cube,
    color: "#EBF5FC",
    badge: "FULL MULTI-UTILITY BALANCE",
    description: "Holistic macro view of all 5 utility networks functioning concurrently across the Larsemann Hills landscape.",
    stages: [
      {
        id: "bharati_all_stage_1",
        stageNumber: 1,
        totalStages: 1,
        title: "Quilty Bay to Station Core Energy Balance",
        badge: "STAGE 1 · INTEGRATED INFRASTRUCTURE",
        narrative: "Holistic synchrony: Water, fuel, electricity, sewage treatment, and heat-trace lifelines operating concurrently across the Larsemann Hills landscape with X-ray ghost shell active.",
        telemetry: [
          { label: "Total Grid Load", value: "340 kW", color: "#38BDF8" },
          { label: "Thermal Cogeneration", value: "285 kW", color: "#FFAA00" },
          { label: "Expedition Crew", value: "47 Overwinter", color: "#00D4A0" },
        ],
        cameraPos: [-65, 34, 70],
        targetPos: [0, 5, 0],
        fov: 62,
      },
    ],
  },
];

export type CutawayViewMode =
  | "exterior"
  | "l4_terrace"
  | "roof_l3"
  | "l2_power"
  | "l1_garage"
  | "xray";

interface BharatiStationTwinProps {
  className?: string;
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
  const animFrameRef = useRef<number | null>(null);

  // Lighting References for Dynamic Polar Sun Transitions
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const seaFillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Mesh Groups for Precise Multi-Floor Cutaways & Pipe Flow Unobstructed Views
  const roofMeshesRef = useRef<THREE.Mesh[]>([]);       // Level 04: Roof skin, penthouse, radomes, AHUs, walkways, ceiling top
  const hullMeshesRef = useRef<THREE.Mesh[]>([]);       // Aerodynamic Outer Skin, Seams, Glazing, Mullions, Curtains
  const l3InteriorMeshesRef = useRef<THREE.Mesh[]>([]); // Level 03: 14 Cabins, Command, BMS, Clinic, Galley, Mess, Sauna, Lounge
  const l2InteriorMeshesRef = useRef<THREE.Mesh[]>([]); // Level 02: 3x GenSets, Day Tank, RO Plant, UV, MLVD, UPS, Labs, Inlet Boxes
  const l1InteriorMeshesRef = useRef<THREE.Mesh[]>([]); // Level 01: Scissor lift, workshop bench, boot wash, waste baler, doors
  const slabsMeshRef = useRef<THREE.Mesh | null>(null); // Interior_Rooms_Slabs_Walls_And_Stairs
  const mepInletMeshesRef = useRef<THREE.Mesh[]>([]);   // BHA-MEP-INLET-BOX-FUEL & BHA-MEP-INLET-BOX-SEAWATER

  // Hardware GPU Material Clipping Plane for Clean Architectural Multi-Floor Cutaways
  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 25.0));
  const [cutPlaneHeight, setCutPlaneHeight] = useState<number>(25.0);
  const [isGhostHull, setIsGhostHull] = useState<boolean>(true);

  const cutawayStateRef = useRef<{
    roofTargetOpacity: number;
    roofCurrentOpacity: number;
    hullTargetOpacity: number;
    hullCurrentOpacity: number;
    l3TargetOpacity: number;
    l3CurrentOpacity: number;
    l2TargetOpacity: number;
    l2CurrentOpacity: number;
    l1TargetOpacity: number;
    l1CurrentOpacity: number;
  }>({
    roofTargetOpacity: 1.0,
    roofCurrentOpacity: 1.0,
    hullTargetOpacity: 1.0,
    hullCurrentOpacity: 1.0,
    l3TargetOpacity: 1.0,
    l3CurrentOpacity: 1.0,
    l2TargetOpacity: 1.0,
    l2CurrentOpacity: 1.0,
    l1TargetOpacity: 1.0,
    l1CurrentOpacity: 1.0,
  });

  // Flow Shader Category Uniforms (Directly on existing physical pipes)
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

  // Interactive Raycasting & Hover State
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mousePosRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const interactiveMeshesRef = useRef<{ mesh: THREE.Mesh; room: BharatiRoomEntry }[]>([]);
  const [hoveredFacility, setHoveredFacility] = useState<{ room: BharatiRoomEntry; x: number; y: number } | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeMode, setActiveMode] = useState<"overview" | "flows" | "rooms" | "cutaways">("overview");
  const [cutawayViewMode, setCutawayViewMode] = useState<CutawayViewMode>("exterior");
  const [activeTourIndex, setActiveTourIndex] = useState<number | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [autoPlayTour, setAutoPlayTour] = useState<boolean>(true);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [isStoryCardVisible, setIsStoryCardVisible] = useState<boolean>(true);
  const [isStoryCardCollapsed, setIsStoryCardCollapsed] = useState<boolean>(false);
  const [activeRoom, setActiveRoom] = useState<BharatiRoomEntry | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<"All" | "L3" | "L2" | "L1" | "L4" | "EXT">("All");
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightingMode, setLightingMode] = useState<"SUN" | "AURORA" | "NIGHT">("SUN");

  // ── CUTAWAY / FLOOR DECK CONTROLLER (REMOVES ALL ABOVE STRUCTURES SMOOTHLY VIA GPU HARDWARE CLIPPING) ──
  const setCutawayMode = useCallback(
    (mode: CutawayViewMode, animateCamera = true) => {
      setCutawayViewMode(mode);
      const state = cutawayStateRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      let targetCutHeight = 25.0;

      if (mode === "exterior") {
        targetCutHeight = 25.0;
        state.roofTargetOpacity = 1.0;
        state.hullTargetOpacity = 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -65, y: 34, z: 70, duration: 2.0, ease: "power3.inOut" });
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
            },
          });
          gsap.to(camera, { fov: 65, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      } else if (mode === "l4_terrace") {
        // Level 04 Terrace, Radomes & Central Penthouse Enclosure (Cuts highest roof penthouse)
        targetCutHeight = 14.5;
        state.roofTargetOpacity = 1.0;
        state.hullTargetOpacity = isGhostHull ? 0.35 : 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -14, y: 24, z: 18, duration: 1.8, ease: "power3.inOut" });
          gsap.to(controls.target, {
            x: 2,
            y: 15,
            z: 2,
            duration: 1.8,
            ease: "power3.inOut",
            onComplete: () => {
              controls.enabled = true;
              controls.minDistance = 1.0;
              controls.maxDistance = 60.0;
            },
          });
          gsap.to(camera, { fov: 54, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      } else if (mode === "roof_l3") {
        // Level 03 Living Deck (Cuts roof & top ceiling slab at 11.2m; exposes 14 Cabins, Lounge, Clinic, Mess, Galley, Sauna)
        targetCutHeight = 10.4;
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.16 : 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -35, y: 28, z: 38, duration: 1.8, ease: "power3.inOut" });
          gsap.to(controls.target, {
            x: 0,
            y: 8.5,
            z: 0,
            duration: 1.8,
            ease: "power3.inOut",
            onComplete: () => {
              controls.enabled = true;
              controls.minDistance = 2.0;
              controls.maxDistance = 150.0;
            },
          });
          gsap.to(camera, { fov: 58, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      } else if (mode === "l2_power") {
        // Level 02 Power & Water Deck (Cuts Level 03 and its floor slab; exposes 3x GenSets, 470L Day Tank, RO Desalination, Labs)
        targetCutHeight = 7.35;
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.14 : 1.0;
        state.l3TargetOpacity = 0.0; // Level 03 completely removed!
        state.l2TargetOpacity = 1.0; // Level 02 fully visible!
        state.l1TargetOpacity = 1.0;
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -28, y: 17, z: 22, duration: 1.8, ease: "power3.inOut" });
          gsap.to(controls.target, {
            x: -6,
            y: 5.2,
            z: 1,
            duration: 1.8,
            ease: "power3.inOut",
            onComplete: () => {
              controls.enabled = true;
              controls.minDistance = 2.0;
              controls.maxDistance = 150.0;
            },
          });
          gsap.to(camera, { fov: 55, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      } else if (mode === "l1_garage") {
        // Level 01 Logistics & Workshop Deck (Cuts Level 02 and Level 03; exposes Scissor Lift, Workshop Bench, Boot Wash, Baler)
        targetCutHeight = 3.65;
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.12 : 1.0;
        state.l3TargetOpacity = 0.0; // Level 03 removed!
        state.l2TargetOpacity = 0.0; // Level 02 removed!
        state.l1TargetOpacity = 1.0; // Level 01 fully visible!
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -20, y: 10, z: 24, duration: 1.8, ease: "power3.inOut" });
          gsap.to(controls.target, {
            x: -2,
            y: 1.8,
            z: 6,
            duration: 1.8,
            ease: "power3.inOut",
            onComplete: () => {
              controls.enabled = true;
              controls.minDistance = 2.0;
              controls.maxDistance = 150.0;
            },
          });
          gsap.to(camera, { fov: 55, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      } else if (mode === "xray") {
        // X-Ray Ghost Shell for Lifeline Flows (Removes roof/penthouse, ghost hull, exposes pipes and plant rooms)
        targetCutHeight = 10.4;
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = 0.08;
        state.l3TargetOpacity = 0.15; // faint ghost
        state.l2TargetOpacity = 0.9;
        state.l1TargetOpacity = 0.9;
        if (animateCamera && camera && controls) {
          controls.enabled = false;
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(controls.target);
          gsap.to(camera.position, { x: -55, y: 28, z: 55, duration: 1.8, ease: "power3.inOut" });
          gsap.to(controls.target, {
            x: 0,
            y: 5,
            z: 0,
            duration: 1.8,
            ease: "power3.inOut",
            onComplete: () => {
              controls.enabled = true;
              controls.minDistance = 2.0;
              controls.maxDistance = 250.0;
            },
          });
          gsap.to(camera, { fov: 60, duration: 1.5, ease: "power2.inOut", onUpdate: () => camera.updateProjectionMatrix() });
        }
      }

      // Smoothly animate GPU clipping plane height
      gsap.killTweensOf(clipPlaneRef.current);
      gsap.to(clipPlaneRef.current, {
        constant: targetCutHeight,
        duration: 1.8,
        ease: "power3.inOut",
        onUpdate: () => {
          setCutPlaneHeight(clipPlaneRef.current.constant);
        },
      });
    },
    [isGhostHull]
  );

  // ── CONTINUOUS BIM CUTAWAY SLIDER (MANUAL ELEVATION SCRUBBING) ──
  const setManualCutHeight = useCallback(
    (height: number) => {
      setCutPlaneHeight(height);
      gsap.killTweensOf(clipPlaneRef.current);
      clipPlaneRef.current.constant = height;

      const state = cutawayStateRef.current;
      if (height >= 18.0) {
        setCutawayViewMode("exterior");
        state.roofTargetOpacity = 1.0;
        state.hullTargetOpacity = 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
      } else if (height >= 13.0) {
        setCutawayViewMode("l4_terrace");
        state.roofTargetOpacity = 1.0;
        state.hullTargetOpacity = isGhostHull ? 0.35 : 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
      } else if (height >= 8.5) {
        setCutawayViewMode("roof_l3");
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.16 : 1.0;
        state.l3TargetOpacity = 1.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
      } else if (height >= 4.5) {
        setCutawayViewMode("l2_power");
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.14 : 1.0;
        state.l3TargetOpacity = 0.0;
        state.l2TargetOpacity = 1.0;
        state.l1TargetOpacity = 1.0;
      } else {
        setCutawayViewMode("l1_garage");
        state.roofTargetOpacity = 0.0;
        state.hullTargetOpacity = isGhostHull ? 0.12 : 1.0;
        state.l3TargetOpacity = 0.0;
        state.l2TargetOpacity = 0.0;
        state.l1TargetOpacity = 1.0;
      }
    },
    [isGhostHull]
  );

  // ── TOGGLE GHOST HULL (HOLOGRAPHIC GLASS VS SOLID CUT) ──
  const toggleGhostHull = useCallback(() => {
    setIsGhostHull((prev) => {
      const nextVal = !prev;
      const state = cutawayStateRef.current;
      if (cutawayViewMode !== "exterior") {
        state.hullTargetOpacity = nextVal ? 0.14 : 1.0;
      }
      return nextVal;
    });
  }, [cutawayViewMode]);

  // ── LIFELINE FLOW ISOLATION DISPATCHER (ON EXISTING PIPES) ──
  const setFlowsActivation = useCallback((tourId: string | null) => {
    const uniforms = flowCategoryUniformsRef.current;
    if (!uniforms) return;

    // 1. Reset all flow category uniforms
    uniforms.water.value = 0.0;
    uniforms.fuel.value = 0.0;
    uniforms.power.value = 0.0;
    uniforms.sewage.value = 0.0;
    uniforms.heattrace.value = 0.0;

    // 2. Activate ONLY the selected utility pipeline (travels smoothly along existing physical pipes)
    if (tourId === "water") {
      uniforms.water.value = 1.0;
    } else if (tourId === "fuel") {
      uniforms.fuel.value = 1.0;
    } else if (tourId === "power") {
      uniforms.power.value = 1.0;
    } else if (tourId === "sewage") {
      uniforms.sewage.value = 1.0;
    } else if (tourId === "heattrace") {
      uniforms.heattrace.value = 1.0;
    } else if (tourId === "all_pulse") {
      uniforms.water.value = 1.0;
      uniforms.fuel.value = 1.0;
      uniforms.power.value = 1.0;
      uniforms.sewage.value = 1.0;
      uniforms.heattrace.value = 1.0;
    }
  }, []);

  // ── LOCK INSIDE ROOM (EYE-LEVEL 360° INSPECTION WITH AUTO FLOOR CUTAWAY) ──
  const lockInsideRoom = useCallback(
    (room: BharatiRoomEntry) => {
      if (!cameraRef.current || !controlsRef.current || !sceneRef.current) return;

      setActiveTourIndex(null);
      setAutoPlayTour(false);
      setFlowsActivation(null); // Turn off flow pulses inside rooms
      setActiveMode("rooms");   // Keep facility drawer accessible

      setActiveRoom(room);
      if (onRoomSelect) onRoomSelect(room.id);

      // Automatic floor cutaway: Remove structures above this room's floor!
      if (room.level === "L1") {
        setCutawayMode("l1_garage", false);
      } else if (room.level === "L2") {
        setCutawayMode("l2_power", false);
      } else if (room.level === "L3") {
        setCutawayMode("roof_l3", false);
      } else if (room.level === "L4") {
        setCutawayMode("l4_terrace", false);
      } else {
        setCutawayMode("exterior", false);
      }

      const camera = cameraRef.current;
      const controls = controlsRef.current;

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
          controls.minDistance = room.minDistance || 0.1;
          controls.maxDistance = room.maxDistance || 5.0;
          controls.minPolarAngle = 0.05;
          controls.maxPolarAngle = Math.PI - 0.05;
          controls.enablePan = true;
        },
      });

      gsap.to(camera, {
        fov: room.fov || 62,
        duration: 1.4,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    },
    [onRoomSelect, setFlowsActivation, setCutawayMode]
  );


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

    // 3. Renderer with ACESFilmic Tone Mapping and Color Space Calibration
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.localClippingEnabled = true; // Enables per-material GPU hardware clipping planes
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
    controls.minDistance = 1.0;
    controls.maxDistance = 500.0;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controlsRef.current = controls;

    // 6. Calibrated Polar 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0x8eb5d0, 1.25);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

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
    polarSun.shadow.normalBias = 0.03;
    scene.add(polarSun);
    sunLightRef.current = polarSun;

    const seaFillLight = new THREE.DirectionalLight(0xa5d5ea, 0.9);
    seaFillLight.position.set(-140, 40, -100);
    scene.add(seaFillLight);
    seaFillLightRef.current = seaFillLight;

    // 7. Pipeline Flow Shader (Directly on Authentic Existing Physical Pipes)
    const applyPipelineFlowShader = (
      material: THREE.Material,
      config: {
        category: "water" | "fuel" | "power" | "sewage";
        colorHex: string;
        direction: THREE.Vector3;
        speed?: number;
        frequency?: number;
        pulseIntensity?: number;
        hasHeatTrace?: boolean;
      }
    ) => {
      if ((material as any).userData?.flowCompiled) return;
      (material as any).userData.flowCompiled = true;

      const {
        category,
        colorHex,
        direction,
        speed = 4.5,
        frequency = 0.12,
        pulseIntensity = 2.8,
        hasHeatTrace = false,
      } = config;

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = flowTimeUniformRef.current;
        shader.uniforms.uFlowActive = flowCategoryUniformsRef.current[category];
        shader.uniforms.uFlowColor = { value: new THREE.Color(colorHex) };
        shader.uniforms.uFlowDir = { value: direction.clone().normalize() };
        shader.uniforms.uFlowSpeed = { value: speed };
        shader.uniforms.uFlowFreq = { value: frequency };
        shader.uniforms.uPulseIntensity = { value: pulseIntensity };

        if (hasHeatTrace) {
          shader.uniforms.uHeatTraceActive = flowCategoryUniformsRef.current.heattrace;
          shader.uniforms.uHeatTraceColor = { value: new THREE.Color("#FF6B00") };
        }

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

        const heatTraceCode = hasHeatTrace
          ? `
          if (uHeatTraceActive > 0.001) {
            float hDist = dot(vFlowWorldPos, uFlowDir);
            float hWave = sin(hDist * (uFlowFreq * 0.9) - uTime * (uFlowSpeed * 0.65));
            float hPulse = smoothstep(0.1, 0.9, hWave) * uHeatTraceActive;
            vec3 hGlow = uHeatTraceColor * (0.28 * uHeatTraceActive + hPulse * 2.6);
            gl_FragColor.rgb += hGlow;
          }
          `
          : "";

        shader.fragmentShader = `
          uniform float uTime;
          uniform float uFlowActive;
          uniform vec3 uFlowColor;
          uniform vec3 uFlowDir;
          uniform float uFlowSpeed;
          uniform float uFlowFreq;
          uniform float uPulseIntensity;
          ${hasHeatTrace ? "uniform float uHeatTraceActive;\nuniform vec3 uHeatTraceColor;" : ""}
          varying vec3 vFlowWorldPos;
          ${shader.fragmentShader}
        `.replace(
          "#include <dithering_fragment>",
          `
          #include <dithering_fragment>
          if (uFlowActive > 0.001) {
            float flowDist = dot(vFlowWorldPos, uFlowDir);
            float wave = sin(flowDist * uFlowFreq - uTime * uFlowSpeed);
            float pulse = smoothstep(0.18, 0.95, wave) * uFlowActive;
            float ripple = sin(flowDist * (uFlowFreq * 3.8) - uTime * (uFlowSpeed * 1.8));
            float spark = max(0.0, ripple) * 0.35 * uFlowActive;
            vec3 fluidGlow = uFlowColor * (0.2 * uFlowActive + pulse * uPulseIntensity + spark);
            gl_FragColor.rgb += fluidGlow;
          }
          ${heatTraceCode}
          `
        );
      };
    };

    // 8. Load GLTF Digital Twin Model with Draco & Fallback Strategy
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");
    dracoLoader.preload();

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const compressedGlbUrl = "/assets/bharati_digital_twin_compressed.glb";
    const uncompressedGlbUrl = "/assets/bharati_digital_twin.glb";

    // Redundant duplicate proxy meshes that were incorrectly floating and shaking from origin
    const REDUNDANT_PIPE_MESHES = [
      "Pipeline_Fuel_DoubleWall",
      "Pipeline_Fuel_Pulse_Core",
      "Pipeline_Water_Insulated",
      "Pipeline_Water_Pulse_Core",
      "Powerline_Tray_Grid",
      "Powerline_Pulse_Core",
      "Pipeline_HeatTrace_Lines",
      "Pipeline_HeatTrace_Pulse_Core",
      "Pipeline_Sewage_Pulse_Core",
    ];

    const onModelLoaded = (gltf: any) => {
      const root = gltf.scene;
      scene.add(root);

      roofMeshesRef.current = [];
      hullMeshesRef.current = [];
      l3InteriorMeshesRef.current = [];
      l2InteriorMeshesRef.current = [];
      l1InteriorMeshesRef.current = [];
      mepInletMeshesRef.current = [];
      interactiveMeshesRef.current = [];

      const roomList = Object.values(BHARATI_ROOM_REGISTRY);

      // Traverse scene graph to calibrate materials, cutaways, and attach flow shaders to authentic existing pipes
      root.traverse((node: any) => {
        // Disable harsh embedded Blender lights (>6500 candela)
        if (node.isLight) {
          node.visible = false;
          node.intensity = 0.0;
        }

        if (node.isMesh) {
          const meshName = node.name || "";
          const mat = node.material;

          // PERMANENTLY HIDE REDUNDANT PROXY MESHES (prevents "new pipe coming and shaking")
          if (REDUNDANT_PIPE_MESHES.some((rName) => meshName.includes(rName))) {
            node.visible = false;
            return;
          }

          // Register for interactive click & hover raycasting
          for (const room of roomList) {
            if (room.meshKeywords && room.meshKeywords.some((kw) => meshName.includes(kw))) {
              interactiveMeshesRef.current.push({ mesh: node, room });
              break;
            }
          }

          // 1. Collect Level 04 / Roof & Ceiling Top meshes (Removed in cutaway to see interior)
          if (
            meshName === "Aerodynamic_Outer_Skin_Roof" ||
            meshName.includes("Roof_Central_Service_Enclosure") ||
            meshName.includes("BHA-ROOF-WALKWAY-") ||
            meshName.includes("BHA-COM-RADOME-") ||
            meshName.includes("BHA-HVAC-AHU-") ||
            meshName.includes("BHA-HVAC-GEN-STACK-") ||
            meshName.includes("Interior_Ceiling_Slab_Top") ||
            meshName.includes("Lounge_Ceiling_Grid") ||
            meshName.includes("Lounge_Ceiling_Light_Panels")
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.transparent = true;
              clone.opacity = 1.0;
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            roofMeshesRef.current.push(node);
          }

          // 2. Collect Outer Hull, Steel Girder Frame & Glazing meshes (Ghosted for X-ray / floor inspections)
          else if (
            meshName === "Aerodynamic_Outer_Skin" ||
            meshName.includes("Enveloping_Steel_Girder_Frame") ||
            meshName.includes("Steel_Girder_Frame_Mesh") ||
            meshName.includes("Hull_Panel_Seams") ||
            meshName.includes("Continuous_Glazing_And_Curtain_Wall") ||
            meshName.includes("Lounge_Angled_Mullions") ||
            meshName.includes("Lounge_Curtains") ||
            meshName.includes("Lounge_Window_Sill") ||
            meshName.includes("Lounge_Window_XBraces")
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.transparent = true;
              clone.opacity = 1.0;
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            hullMeshesRef.current.push(node);
          }

          // 3. Collect Level 03 Interior meshes (Living Cabins, Command, Hospital, Mess, Galley, Sauna, Lounge)
          else if (
            meshName.startsWith("BHA-CABIN-") ||
            meshName.includes("BHA-CMD-CONSOLE-") ||
            meshName.includes("BHA-BMS-SERVER-") ||
            meshName.includes("BHA-MED-CLINIC-") ||
            meshName.includes("BHA-GALLEY-") ||
            meshName.includes("BHA-MESS-TABLE-") ||
            meshName.includes("BHA-SAUNA-CABIN") ||
            meshName.includes("Couch_Cream_") ||
            meshName.includes("Center_Table_") ||
            meshName.includes("Coffee_Table_") ||
            meshName.includes("Ottoman_") ||
            meshName.includes("Recliner_") ||
            meshName.includes("Lounge_Navy_Carpet") ||
            meshName.includes("Lounge_Wood_Walls") ||
            meshName.includes("Lounge_Baseboard") ||
            meshName.includes("Lounge_Exit_Sign") ||
            meshName.includes("Lounge_HVAC_Register") ||
            meshName.includes("Lounge_Speaker")
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.transparent = true;
              clone.opacity = 1.0;
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            l3InteriorMeshesRef.current.push(node);
          }

          // 4. Collect Level 02 Interior meshes (GenSets, Day Tank, RO Desal, UV, MLVD, UPS, Labs, Inlets)
          else if (
            meshName.includes("BHA-CHPP-DAYTANK-") ||
            meshName.includes("BHA-CHPP-GEN-") ||
            meshName.includes("BHA-WTR-RO-PLANT-") ||
            meshName.includes("BHA-WTR-UV-") ||
            meshName.includes("BHA-ELE-MLVD-") ||
            meshName.includes("BHA-ELE-UPS-") ||
            meshName.includes("BHA-LAB-BIO-") ||
            meshName.includes("BHA-LAB-GEO-") ||
            meshName.includes("BHA-MEP-INLET-BOX-") ||
            meshName.includes("BHA-EMG-CONTAINER-L2-")
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.transparent = true;
              clone.opacity = 1.0;
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            l2InteriorMeshesRef.current.push(node);

            if (meshName.includes("BHA-MEP-INLET-BOX-")) {
              mepInletMeshesRef.current.push(node);
            }
          }

          // 5. Collect Level 01 Interior meshes (Scissor Lift, Workshop Bench, Boot Wash, Baler, Roller Doors)
          else if (
            meshName.includes("BHA-L1-BOOT-WASH") ||
            meshName.includes("BHA-L1-ROLLER-DOOR-") ||
            meshName.includes("BHA-L1-VEH-LIFT-") ||
            meshName.includes("BHA-L1-WASTE-BALER-") ||
            meshName.includes("BHA-L1-WORKSHOP-") ||
            meshName.includes("BHA-EMG-CONTAINER-L1-")
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.transparent = true;
              clone.opacity = 1.0;
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            l1InteriorMeshesRef.current.push(node);
          }

          // 6. Shared Interior Slabs, Walls & Stairs (Multi-primitive architecture)
          else if (
            meshName.includes("Interior_Rooms_Slabs_Walls_And_Stairs") ||
            meshName.includes("Interior_Architectural_Structure_Mesh") ||
            (node.parent && node.parent.name && node.parent.name.includes("Interior_Rooms_Slabs_Walls_And_Stairs"))
          ) {
            const mats = Array.isArray(mat) ? mat : [mat];
            const clonedMats = mats.map((m: any) => {
              const clone = m.clone();
              clone.clippingPlanes = [clipPlaneRef.current];
              clone.clipShadows = true;
              clone.side = THREE.DoubleSide;
              return clone;
            });
            node.material = Array.isArray(mat) ? clonedMats : clonedMats[0];
            slabsMeshRef.current = node;
          }

          // Shadow and Material Calibration
          if (meshName.includes("Terrain") || meshName.includes("Ground") || meshName.includes("Rocky")) {
            node.castShadow = false;
            node.receiveShadow = true;
          } else if (
            meshName.includes("Hull") ||
            meshName.includes("Building") ||
            meshName.includes("Roof") ||
            meshName.includes("Structure") ||
            meshName.includes("Plant") ||
            meshName.startsWith("BHA-")
          ) {
            node.castShadow = true;
            node.receiveShadow = true;
          }

          if (mat) {
            const mats = Array.isArray(mat) ? mat : [mat];
            mats.forEach((m: any) => {
              const matName = m.name || "";
              m.side = THREE.DoubleSide;

              // Telemetry Displays
              if (matName.includes("Screen") || matName.includes("Display") || matName.includes("Cyan")) {
                m.emissive = new THREE.Color("#00f0ff");
                m.emissiveIntensity = 0.5;
                m.roughness = 0.25;
                m.needsUpdate = true;
              }

              // Triple-Glazed Polar Glass & Windows
              if (matName.includes("Glass") || matName.includes("Glazing") || matName.includes("Polar_Glass")) {
                m.transparent = true;
                m.opacity = 0.38;
                m.roughness = 0.05;
                m.metalness = 0.9;
                m.depthWrite = true;
                m.needsUpdate = true;
              }

              // Aerodynamic metal outer skin
              if (matName.includes("Aerodynamic") || matName.includes("Metal_Skin")) {
                m.roughness = 0.35;
                m.metalness = 0.75;
                m.needsUpdate = true;
              }

              // Indian National Flag & Ashoka Chakra
              if (matName.includes("Ashoka_Chakra") || matName.includes("Flag")) {
                m.roughness = 0.7;
                m.metalness = 0.05;
                m.side = THREE.DoubleSide;
                m.needsUpdate = true;
              }
            });
          }

          // Universal GPU Material Clipping Assignment:
          // Attach clipPlaneRef to ALL building meshes (slabs, columns, doors, walls, ceilings, equipment)
          // EXCLUDE terrain and pipelines so landscape and animated fluid pulses remain 100% intact!
          const TERRAIN_KEYWORDS = [
            "Topography",
            "Granite",
            "Bedrock",
            "Bathymetry",
            "Terrain",
            "Ground",
            "Ocean",
            "Sea_Surface",
            "Water_Plane",
            "Antarctic_Rocky_Ground",
            "Site_Extended_Terrain",
          ];
          const PIPELINE_KEYWORDS = [
            "BHA-PIPE-",
            "BHA-TRAY-",
            "BHA-SWI-INTAKE",
            "BHA-SWI-PUMPHOUSE",
            "Pipeline_",
            "Powerline_",
            "BHA-MEP-INLET-",
          ];
          const isTerrain = TERRAIN_KEYWORDS.some((kw) => meshName.includes(kw));
          const isPipeline = PIPELINE_KEYWORDS.some((kw) => meshName.includes(kw));

          if (!isTerrain && !isPipeline && node.material) {
            const currentMats = Array.isArray(node.material) ? node.material : [node.material];
            currentMats.forEach((m: any) => {
              if (m && (!m.clippingPlanes || m.clippingPlanes.length === 0)) {
                m.clippingPlanes = [clipPlaneRef.current];
                m.clipShadows = true;
                m.needsUpdate = true;
              }
            });
          }

          // ── ATTACH FLOW SHADERS DIRECTLY TO AUTHENTIC EXISTING PHYSICAL PIPELINES ──

          // 1. Bulk Fuel Pipeline: Authentic 350m overland pipeline on saddles (Fuel Farm to Station inlet)
          if (meshName.includes("BHA-PIPE-BULK-FUEL-350M")) {
            const fuelDir = new THREE.Vector3(292, 37.45, -136).normalize();
            const pipeMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [pipeMat] : pipeMat;
            applyPipelineFlowShader(pipeMat, {
              category: "fuel",
              colorHex: "#FFAA00",
              direction: fuelDir,
              speed: 4.8,
              frequency: 0.12,
              pulseIntensity: 3.5,
              hasHeatTrace: true,
            });
          }

          // 2. Seawater Supply Pipeline: Authentic 300m overland pipeline on saddles (Quilty Bay Pumphouse to Station inlet)
          if (meshName.includes("BHA-PIPE-SEAWATER-300M")) {
            const waterDir = new THREE.Vector3(267, 37.21, 21).normalize();
            const pipeMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [pipeMat] : pipeMat;
            applyPipelineFlowShader(pipeMat, {
              category: "water",
              colorHex: "#00A8FF",
              direction: waterDir,
              speed: 4.8,
              frequency: 0.12,
              pulseIntensity: 3.5,
              hasHeatTrace: true,
            });
          }

          // 3. Quilty Bay Submersible Suction Intake Pipe
          if (meshName.includes("BHA-SWI-INTAKE-PIPE")) {
            const intakeDir = new THREE.Vector3(0, 1, 0).normalize();
            const pipeMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [pipeMat] : pipeMat;
            applyPipelineFlowShader(pipeMat, {
              category: "water",
              colorHex: "#00A8FF",
              direction: intakeDir,
              speed: 4.2,
              frequency: 0.25,
              pulseIntensity: 3.0,
            });
          }

          // 4. Power Cable Tray: Authentic overland tray on saddles leading to logistics Helipads
          if (meshName.includes("BHA-TRAY-POWER-415V-HELI")) {
            const powerDir = new THREE.Vector3(108.5, -4.33, 73).normalize();
            const trayMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [trayMat] : trayMat;
            applyPipelineFlowShader(trayMat, {
              category: "power",
              colorHex: "#38BDF8",
              direction: powerDir,
              speed: 5.5,
              frequency: 0.2,
              pulseIntensity: 3.5,
            });
          }

          // 5. Sanitary Sewage Line: Authentic internal vertical drainage riser
          if (meshName.includes("Pipeline_Sewage_Insulated")) {
            const sewageDir = new THREE.Vector3(0, -1, 0).normalize();
            const pipeMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [pipeMat] : pipeMat;
            applyPipelineFlowShader(pipeMat, {
              category: "sewage",
              colorHex: "#14B8A6",
              direction: sewageDir,
              speed: 4.0,
              frequency: 0.25,
              pulseIntensity: 3.0,
            });
          }

          // 6. Ground Utility Connectors & Building Risers
          if (
            meshName.includes("Ground_Utility_Pipeline") ||
            meshName.includes("BHA-MEP-NORTH-PIPE-RISERS") ||
            meshName.includes("BHA-MEP-PIPE-HEADER-BOX")
          ) {
            const utilDir = new THREE.Vector3(0, 1, 0).normalize();
            const pipeMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [pipeMat] : pipeMat;
            applyPipelineFlowShader(pipeMat, {
              category: "water",
              colorHex: "#00A8FF",
              direction: utilDir,
              speed: 4.0,
              frequency: 0.2,
              pulseIntensity: 2.8,
            });
          }

          // 7. Mechanical Inlet Boxes (Fuel & Seawater Foundation Entry)
          if (meshName.includes("BHA-MEP-INLET-BOX-FUEL")) {
            const fuelInletDir = new THREE.Vector3(1, 0, 0).normalize();
            const boxMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [boxMat] : boxMat;
            applyPipelineFlowShader(boxMat, {
              category: "fuel",
              colorHex: "#FFAA00",
              direction: fuelInletDir,
              speed: 4.0,
              frequency: 0.3,
              pulseIntensity: 3.2,
            });
          }

          if (meshName.includes("BHA-MEP-INLET-BOX-SEAWATER")) {
            const waterInletDir = new THREE.Vector3(1, 0, 0).normalize();
            const boxMat = (Array.isArray(mat) ? mat[0] : mat).clone();
            node.material = Array.isArray(mat) ? [boxMat] : boxMat;
            applyPipelineFlowShader(boxMat, {
              category: "water",
              colorHex: "#00A8FF",
              direction: waterInletDir,
              speed: 4.0,
              frequency: 0.3,
              pulseIntensity: 3.2,
            });
          }
        }
      });

      setLoading(false);
    };

    // Load with Draco first, fall back to uncompressed on decoding error
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
        console.warn("[Bharati 3D Twin] Draco load failed, falling back to uncompressed asset:", error);
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
            console.error("[Bharati 3D Twin] Failed to load GLB fallback:", err);
            setLoading(false);
          }
        );
      }
    );

    // 9. Interactive Raycasting Mouse Events
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!cameraRef.current || interactiveMeshesRef.current.length === 0) return;

      raycasterRef.current.setFromCamera(mousePosRef.current, cameraRef.current);
      const meshesToTest = interactiveMeshesRef.current.map((item) => item.mesh);
      const intersects = raycasterRef.current.intersectObjects(meshesToTest, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const entry = interactiveMeshesRef.current.find((item) => item.mesh === hitMesh);
        if (entry) {
          container.style.cursor = "pointer";
          setHoveredFacility({
            room: entry.room,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          return;
        }
      }

      container.style.cursor = "grab";
      setHoveredFacility(null);
    };

    const handlePointerDown = () => {
      container.style.cursor = "grabbing";
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!cameraRef.current || interactiveMeshesRef.current.length === 0) return;

      raycasterRef.current.setFromCamera(mousePosRef.current, cameraRef.current);
      const meshesToTest = interactiveMeshesRef.current.map((item) => item.mesh);
      const intersects = raycasterRef.current.intersectObjects(meshesToTest, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const entry = interactiveMeshesRef.current.find((item) => item.mesh === hitMesh);
        if (entry) {
          lockInsideRoom(entry.room);
        }
      }
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mousedown", handlePointerDown);
    container.addEventListener("click", handleClick);

    // 10. High-Performance Render Loop with Dual Opacity Lerp (Roof & Hull)
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update flow shader time uniform
      flowTimeUniformRef.current.value = elapsed;

      // Smooth Frame-Rate Independent Lerp of all Floor & Cutaway Layers
      const state = cutawayStateRef.current;

      const updateMeshesOpacity = (
        meshes: THREE.Mesh[],
        current: number,
        target: number
      ): number => {
        if (Math.abs(current - target) > 0.005) {
          const next = THREE.MathUtils.lerp(current, target, delta * 6.0);
          for (const mesh of meshes) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const mat of mats) {
              if (mat) {
                mat.opacity = next;
                mat.depthWrite = next > 0.5;
              }
            }
            mesh.visible = next > 0.02;
          }
          return next;
        }
        return current;
      };

      state.roofCurrentOpacity = updateMeshesOpacity(
        roofMeshesRef.current,
        state.roofCurrentOpacity,
        state.roofTargetOpacity
      );
      state.hullCurrentOpacity = updateMeshesOpacity(
        hullMeshesRef.current,
        state.hullCurrentOpacity,
        state.hullTargetOpacity
      );
      state.l3CurrentOpacity = updateMeshesOpacity(
        l3InteriorMeshesRef.current,
        state.l3CurrentOpacity,
        state.l3TargetOpacity
      );
      state.l2CurrentOpacity = updateMeshesOpacity(
        l2InteriorMeshesRef.current,
        state.l2CurrentOpacity,
        state.l2TargetOpacity
      );
      state.l1CurrentOpacity = updateMeshesOpacity(
        l1InteriorMeshesRef.current,
        state.l1CurrentOpacity,
        state.l1TargetOpacity
      );

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || 700;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mousedown", handlePointerDown);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      pmremGenerator.dispose();
      dracoLoader.dispose();
    };
  }, [lockInsideRoom]);

  // ── TRIGGER ELEVATED LIFELINE TOUR STAGE WITH CINEMATIC X-RAY GHOST CUTAWAY ──
  const goToStage = useCallback(
    (tourIndex: number, stageIndex: number) => {
      const tour = BHARATI_UTILITY_TOURS.find((t) => t.index === tourIndex);
      if (!tour || !cameraRef.current || !controlsRef.current || !sceneRef.current) return;

      setActiveTourIndex(tourIndex);
      setActiveStageIndex(stageIndex);
      setStageProgress(0);
      setActiveRoom(null);
      setIsStoryCardVisible(true);
      setActiveMode("flows");

      // 0. ACTIVATE ONLY THIS SPECIFIC LIFELINE (along existing physical pipes):
      setFlowsActivation(tour.id);

      // 1. OPEN ROOF & GHOST HULL (removes above structures so pipe flows are pakka visible):
      setCutawayMode("xray", false);

      // Slices off higher floors depending on whether inspecting Level 02 mechanical hall
      const isLevel02Inspection = stageIndex >= 2;
      const targetCut = isLevel02Inspection ? 7.35 : 10.4;
      gsap.killTweensOf(clipPlaneRef.current);
      gsap.to(clipPlaneRef.current, {
        constant: targetCut,
        duration: 2.0,
        ease: "power3.inOut",
        onUpdate: () => setCutPlaneHeight(clipPlaneRef.current.constant),
      });

      const stage = tour.stages[stageIndex] || tour.stages[0];
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      // 2. Outdoor Lighting for Aerial Inspection:
      if (sunLightRef.current) {
        sunLightRef.current.intensity = 2.2;
        sunLightRef.current.color.set(0xfff7e6);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.intensity = 1.25;
        ambientLightRef.current.color.set(0x8eb5d0);
      }
      if (seaFillLightRef.current) {
        seaFillLightRef.current.intensity = 0.9;
        seaFillLightRef.current.color.set(0xa5d5ea);
      }

      // 3. Smooth Cinematic Elevated Flight following the 3D pipeline path:
      controls.enabled = false;
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);

      gsap.to(camera.position, {
        x: stage.cameraPos[0],
        y: stage.cameraPos[1],
        z: stage.cameraPos[2],
        duration: 2.2,
        ease: "power3.inOut",
      });

      gsap.to(controls.target, {
        x: stage.targetPos[0],
        y: stage.targetPos[1],
        z: stage.targetPos[2],
        duration: 2.2,
        ease: "power3.inOut",
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
          ease: "power2.inOut",
          onUpdate: () => camera.updateProjectionMatrix(),
        });
      }
    },
    [setFlowsActivation, setCutawayMode]
  );

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

    const currentTour = BHARATI_UTILITY_TOURS.find((t) => t.index === activeTourIndex);
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

  // ── QUICK PREV / NEXT ROOM NAVIGATION ──
  const goToPrevRoom = useCallback(() => {
    const allRooms = Object.values(BHARATI_ROOM_REGISTRY);
    if (allRooms.length === 0) return;
    const currentIdx = activeRoom ? allRooms.findIndex((r) => r.id === activeRoom.id) : 0;
    const prevIdx = (currentIdx - 1 + allRooms.length) % allRooms.length;
    lockInsideRoom(allRooms[prevIdx]);
  }, [activeRoom, lockInsideRoom]);

  const goToNextRoom = useCallback(() => {
    const allRooms = Object.values(BHARATI_ROOM_REGISTRY);
    if (allRooms.length === 0) return;
    const currentIdx = activeRoom ? allRooms.findIndex((r) => r.id === activeRoom.id) : 0;
    const nextIdx = (currentIdx + 1) % allRooms.length;
    lockInsideRoom(allRooms[nextIdx]);
  }, [activeRoom, lockInsideRoom]);

  // ── RESET TO STATION EXTERIOR OVERVIEW ──
  const resetToOverview = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveRoom(null);
    setActiveTourIndex(null);
    setActiveStageIndex(0);
    setAutoPlayTour(false);
    setActiveMode("overview");
    setFlowsActivation(null); // Turn off all flow pulses
    setCutawayMode("exterior", false); // Restore full exterior envelope

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Restore natural outdoor polar sunlight
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 2.2;
      sunLightRef.current.color.set(0xfff7e6);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 1.25;
      ambientLightRef.current.color.set(0x8eb5d0);
    }
    if (seaFillLightRef.current) {
      seaFillLightRef.current.intensity = 0.9;
      seaFillLightRef.current.color.set(0xa5d5ea);
    }

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
      ease: "power2.inOut",
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  }, [setFlowsActivation, setCutawayMode]);

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
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set(0x00d4a0);
        ambientLightRef.current.intensity = 0.5;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0x0db9d0);
        sunLightRef.current.intensity = 0.6;
      }
      if (seaFillLightRef.current) {
        seaFillLightRef.current.color.set(0x00ffaa);
        seaFillLightRef.current.intensity = 0.4;
      }
      setLightingMode("AURORA");
    } else if (lightingMode === "AURORA") {
      scene.background = new THREE.Color("#010308");
      scene.fog = new THREE.FogExp2(0x010308, 0.0025);
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set(0x182436);
        ambientLightRef.current.intensity = 0.3;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0x224466);
        sunLightRef.current.intensity = 0.3;
      }
      if (seaFillLightRef.current) {
        seaFillLightRef.current.color.set(0x112233);
        seaFillLightRef.current.intensity = 0.2;
      }
      setLightingMode("NIGHT");
    } else {
      scene.background = new THREE.Color("#6b9bc3");
      scene.fog = new THREE.FogExp2(0x6b9bc3, 0.0014);
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set(0x8eb5d0);
        ambientLightRef.current.intensity = 1.25;
      }
      if (sunLightRef.current) {
        sunLightRef.current.color.set(0xfff7e6);
        sunLightRef.current.intensity = 2.2;
      }
      if (seaFillLightRef.current) {
        seaFillLightRef.current.color.set(0xa5d5ea);
        seaFillLightRef.current.intensity = 0.9;
      }
      setLightingMode("SUN");
    }
  };

  // Filtered room list by level and search query
  const rooms = useMemo(() => Object.values(BHARATI_ROOM_REGISTRY), []);
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesLevel = selectedLevel === "All" || r.level === selectedLevel;
      const matchesSearch =
        !roomSearchQuery.trim() ||
        r.name.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(roomSearchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [rooms, selectedLevel, roomSearchQuery]);

  const currentTour = BHARATI_UTILITY_TOURS.find((t) => t.index === activeTourIndex);
  const currentStage = currentTour ? currentTour.stages[activeStageIndex] : null;

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#03060E] ${className}`}>
      {/* ── 3D WEBGL CANVAS ── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

      {/* ── RAYCAST HOVER FLOATING TOOLTIP ── */}
      {hoveredFacility && !activeRoom && (
        <div
          className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-xl bg-[#040D1A]/95 border border-[#00A8FF]/50 backdrop-blur-md shadow-[0_10px_25px_rgba(0,168,255,0.3)] transition-all animate-in fade-in zoom-in-95 duration-150"
          style={{ left: hoveredFacility.x, top: hoveredFacility.y }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] animate-pulse" />
            <span className="font-sans text-xs font-bold text-white whitespace-nowrap">
              {hoveredFacility.room.name}
            </span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-[#00A8FF]/20 text-[#00A8FF] font-semibold">
              {hoveredFacility.room.level}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5 font-mono text-[9px] text-[#7ABBD4]">
            <span>{hoveredFacility.room.category}</span>
            <span className="text-[#00D4A0] font-semibold">Click to enter &rarr;</span>
          </div>
        </div>
      )}

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
              Calibrating Larsemann Hills terrain, 134 modular container assemblies, and 5 utility lifelines...
            </p>
          </div>
        </div>
      )}

      {/* ── TOP-LEFT STATION IDENTITY BADGE & CUTAWAY VIEW SELECTOR ── */}
      <div className="absolute top-20 left-4 sm:left-6 z-30 pointer-events-auto flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Station Identity Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A8FF] animate-pulse shadow-[0_0_8px_#00A8FF]" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                  Bharati Station
                </span>
                <span className="px-1.5 py-0.2 rounded font-mono text-[8px] bg-[#00A8FF]/20 text-[#00A8FF] font-semibold">
                  69°S
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#7ABBD4] block">
                {activeRoom
                  ? `${activeRoom.name} · ${activeRoom.level}`
                  : activeTourIndex !== null
                  ? `${currentTour?.label || "Flow Tour"} Active`
                  : cutawayViewMode !== "exterior"
                  ? `Cutaway: ${
                      cutawayViewMode === "l4_terrace"
                        ? "L4 Roof Terrace & Radomes"
                        : cutawayViewMode === "roof_l3"
                        ? "L3 Living Deck"
                        : cutawayViewMode === "l2_power"
                        ? "L2 Power & Water"
                        : cutawayViewMode === "l1_garage"
                        ? "L1 Logistics & Garage"
                        : "X-Ray Ghost Shell"
                    }`
                  : "Grovnes Peninsula, Larsemann Hills"}
              </span>
            </div>
          </div>

          {/* Quick Cutaway Mode Toggle Pill */}
          <button
            onClick={() => setActiveMode(activeMode === "cutaways" ? "overview" : "cutaways")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-mono text-[11px] uppercase tracking-wider font-semibold border backdrop-blur-2xl shadow-xl transition-all ${
              cutawayViewMode !== "exterior"
                ? "bg-[#FFAA00]/20 text-[#FFAA00] border-[#FFAA00]/40 shadow-[0_0_15px_rgba(255,170,0,0.3)]"
                : "bg-[#040D1A]/90 text-[#7ABBD4] hover:text-white border-white/10 hover:border-white/25"
            }`}
            title="Open Floor Deck Cutaways & X-Ray Menu"
          >
            <Stack size={14} weight={cutawayViewMode !== "exterior" ? "fill" : "regular"} />
            <span className="hidden sm:inline">
              {cutawayViewMode === "exterior" ? "Cutaways" : "Cutaway ON"}
            </span>
          </button>
        </div>

        {/* ── EXPANDABLE FLOOR CUTAWAY SELECTOR POPOVER ── */}
        {activeMode === "cutaways" && (
          <div className="flex flex-col gap-1 p-2.5 rounded-2xl bg-[#040D1A]/95 border border-[#FFAA00]/30 backdrop-blur-3xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-top-2 duration-200 w-[290px]">
            <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 font-mono text-[10px] uppercase font-bold tracking-wider">
              <span className="text-[#FFAA00]">Deck Cutaways & BIM Slice</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFAA00]/20 text-[#FFAA00] font-semibold border border-[#FFAA00]/40">
                  {cutPlaneHeight >= 20 ? "Full Building" : `EL +${cutPlaneHeight.toFixed(1)}m`}
                </span>
                <button
                  onClick={() => setActiveMode("overview")}
                  className="text-[#4A7A8E] hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Quick Deck Presets */}
            <div className="flex flex-col gap-1 mt-1">
              {(
                [
                  { id: "exterior", label: "Full Station Exterior", desc: "Solid aerodynamic hull · EL +25m", icon: Cube },
                  { id: "l4_terrace", label: "Level 04 Terrace Deck", desc: "Radomes & AHUs · EL +14.5m", icon: StackSimple },
                  { id: "roof_l3", label: "Level 03 Living Deck", desc: "Cabins, Mess, Clinic, Lounge · EL +10.4m", icon: Stack },
                  { id: "l2_power", label: "Level 02 Power & Science", desc: "GenSets, Day Tank, RO, Labs · EL +7.35m", icon: Gear },
                  { id: "l1_garage", label: "Level 01 Garage & Workshop", desc: "Vehicle Lift, Mudroom · EL +3.65m", icon: Wrench },
                  { id: "xray", label: "X-Ray Ghost Shell (Pipes)", desc: "Translucent hull for all flows", icon: Eye },
                ] as const
              ).map((item) => {
                const isSelected = cutawayViewMode === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCutawayMode(item.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-[#FFAA00]/20 border border-[#FFAA00]/50 text-white"
                        : "bg-white/[0.02] hover:bg-white/[0.08] text-[#A6C4D6]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComp size={14} className={isSelected ? "text-[#FFAA00]" : "text-[#7ABBD4]"} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans text-xs font-semibold truncate leading-tight">
                          {item.label}
                        </span>
                        <span className="font-mono text-[9px] text-[#4A7A8E] truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFAA00] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Continuous Elevation BIM Slice Slider */}
            <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-1 px-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#7ABBD4] uppercase font-semibold">Slice Height</span>
                <span className="text-[#FFAA00] font-bold">
                  {cutPlaneHeight >= 20 ? "Full Building (25m)" : `${cutPlaneHeight.toFixed(1)} m`}
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="16.0"
                step="0.1"
                value={Math.min(cutPlaneHeight, 16.0)}
                onChange={(e) => setManualCutHeight(parseFloat(e.target.value))}
                className="w-full accent-[#FFAA00] cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#4A7A8E] px-0.5">
                <span>L1 (3.6m)</span>
                <span>L2 (7.4m)</span>
                <span>L3 (10.4m)</span>
                <span>L4 (14.5m)</span>
              </div>

              {/* Ghost Hull Glass Toggle */}
              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#A6C4D6]">Ghost Hull (Glass)</span>
                <button
                  onClick={toggleGhostHull}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold transition-all ${
                    isGhostHull
                      ? "bg-[#00D4A0]/20 text-[#00D4A0] border border-[#00D4A0]/40"
                      : "bg-white/10 text-[#7ABBD4] border border-white/10"
                  }`}
                  title="Toggle outer hull transparency between translucent glass and solid cutaway"
                >
                  {isGhostHull ? "TRANSLUCENT" : "SOLID"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TOP-RIGHT QUICK ACTIONS (LIGHTING, ROTATE, FULLSCREEN) ── */}
      <div className="absolute top-20 right-4 sm:right-6 z-30 pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={cycleLighting}
          className="p-2 rounded-2xl bg-[#040D1A]/90 hover:bg-white/10 border border-white/10 text-[#7ABBD4] hover:text-white backdrop-blur-2xl transition-all shadow-xl"
          title={`Lighting Mode: ${lightingMode} (Click to switch)`}
        >
          {lightingMode === "SUN" ? (
            <Sun size={15} weight="duotone" className="text-[#FFAA00]" />
          ) : lightingMode === "AURORA" ? (
            <Sun size={15} weight="duotone" className="text-[#00D4A0]" />
          ) : (
            <Moon size={15} weight="duotone" className="text-[#38BDF8]" />
          )}
        </button>

        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-2xl border backdrop-blur-2xl transition-all shadow-xl ${
            isRotating
              ? "bg-[#00A8FF]/20 border-[#00A8FF]/40 text-[#00A8FF]"
              : "bg-[#040D1A]/90 hover:bg-white/10 border-white/10 text-[#7ABBD4] hover:text-white"
          }`}
          title={isRotating ? "Stop Orbit Auto-Rotation" : "Start Orbit Auto-Rotation"}
        >
          <ArrowsClockwise size={15} className={isRotating ? "animate-spin" : ""} />
        </button>

        {enableFullscreenButton && (
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-2xl bg-[#040D1A]/90 hover:bg-white/10 border border-white/10 text-[#7ABBD4] hover:text-white backdrop-blur-2xl transition-all shadow-xl"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <ArrowsIn size={15} /> : <ArrowsOut size={15} />}
          </button>
        )}
      </div>

      {/* ── TOP-CENTER PERSPECTIVE HUD (ROOM SWITCHER & PREV / NEXT NAVIGATOR) ── */}
      {activeRoom && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/95 border border-[#00A8FF]/40 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,168,255,0.25)]">
            {/* Step to Previous Room */}
            <button
              onClick={goToPrevRoom}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-[#7ABBD4] hover:text-white font-mono text-[10px] uppercase font-semibold transition-colors"
              title="Step to Previous Room"
            >
              <CaretLeft size={11} weight="bold" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Active Room Title and Deck Pill */}
            <div className="flex items-center gap-1.5 px-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
              <span className="font-sans text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {activeRoom.name}
              </span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-[#00A8FF]/20 text-[#00A8FF] font-semibold">
                {activeRoom.level}
              </span>
            </div>

            {/* Step to Next Room */}
            <button
              onClick={goToNextRoom}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-[#7ABBD4] hover:text-white font-mono text-[10px] uppercase font-semibold transition-colors"
              title="Step to Next Room"
            >
              <span className="hidden sm:inline">Next</span>
              <CaretRight size={11} weight="bold" />
            </button>

            {/* Toggle Rooms Drawer */}
            <button
              onClick={() => setActiveMode(activeMode === "rooms" ? "overview" : "rooms")}
              className="px-2.5 py-0.5 rounded-full bg-[#00A8FF]/15 hover:bg-[#00A8FF]/25 text-[#00A8FF] font-mono text-[10px] uppercase font-semibold transition-colors"
              title="Browse all 34 station facilities"
            >
              {activeMode === "rooms" ? "Hide List" : "All Facilities"}
            </button>

            {/* Exit Room Perspective */}
            <button
              onClick={resetToOverview}
              className="px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-mono text-[10px] uppercase font-semibold transition-colors"
              title="Return to Station Overview"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE STORYTELLING CARD (BHARATI SLICED LIFELINE TOUR) ── */}
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
                  className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-semibold text-[#00A8FF] bg-[#00A8FF]/15 hover:bg-[#00A8FF]/25 transition-colors"
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
                  <Eye size={13} weight="duotone" className="text-[#00A8FF]" />
                  <span className="text-white/80">All Above Structures Removed</span>
                </div>
                <span className="text-[#00D4A0] text-[9px] font-semibold uppercase">Pipes & Plant Rooms Fully Exposed</span>
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2 max-w-[94vw] sm:max-w-2xl">
        {/* SUBMENU 1: LIFELINE TOURS SELECTOR (All 5 Lifelines + All-Systems) */}
        {activeMode === "flows" && (
          <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 p-2 rounded-2xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-200">
            {BHARATI_UTILITY_TOURS.map((tour) => {
              const isSelected = activeTourIndex === tour.index;
              const IconComp = tour.icon;
              return (
                <button
                  key={tour.id}
                  onClick={() => playTour(tour.index)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "text-black shadow-lg"
                      : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
                  }`}
                  style={isSelected ? { backgroundColor: tour.color } : {}}
                >
                  <IconComp size={14} weight={isSelected ? "bold" : "regular"} />
                  <span>{tour.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* SUBMENU 2: FACILITIES SELECTOR (Deck Filters + Search + 34 Facilities) */}
        {activeMode === "rooms" && (
          <div className="w-full max-w-xl flex flex-col gap-2.5 p-3.5 rounded-3xl bg-[#040D1A]/95 border border-white/15 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header: Level Filter Tabs & Search & Close */}
            <div className="flex flex-col gap-2 pb-2 border-b border-white/[0.08]">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: "All", label: "All Decks" },
                      { id: "L3", label: "L3 Living" },
                      { id: "L2", label: "L2 Power/Labs" },
                      { id: "L1", label: "L1 Workshop" },
                      { id: "L4", label: "L4 Roof" },
                      { id: "EXT", label: "Campus Ext" },
                    ] as const
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                        selectedLevel === lvl.id
                          ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 font-semibold"
                          : "text-[#4A7A8E] hover:text-white"
                      }`}
                    >
                      {lvl.label}
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

              {/* Search Filter Input */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Filter facilities by name or function..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#4A7A8E] focus:outline-none focus:border-[#00A8FF]/60 font-sans transition-colors"
                />
                {roomSearchQuery && (
                  <button
                    onClick={() => setRoomSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
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
                        ? "bg-[#00A8FF]/20 border border-[#00A8FF] shadow-[0_0_12px_rgba(0,168,255,0.3)] text-white"
                        : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#00A8FF]/30 text-[#EBF5FC]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isSelected
                            ? "bg-[#00D4A0] animate-pulse shadow-[0_0_6px_#00D4A0]"
                            : "bg-white/20 group-hover:bg-[#00A8FF]"
                        }`}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans text-xs truncate font-medium">{room.name}</span>
                        <span className="font-mono text-[9px] text-[#4A7A8E] truncate">{room.category}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#7ABBD4] group-hover:text-white shrink-0 ml-1">
                      {isSelected ? "Active" : room.level}
                    </span>
                  </button>
                );
              })}
              {filteredRooms.length === 0 && (
                <div className="col-span-2 py-6 text-center font-mono text-xs text-[#4A7A8E]">
                  No facilities found matching &quot;{roomSearchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN DOCK BAR */}
        <div className="flex items-center p-1.5 rounded-full bg-[#040D1A]/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] gap-1">
          <button
            onClick={resetToOverview}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              activeMode === "overview" && !activeRoom && cutawayViewMode === "exterior"
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
                playTour(activeTourIndex ?? 0);
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
            onClick={() => setActiveMode(activeMode === "cutaways" ? "overview" : "cutaways")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              activeMode === "cutaways" || cutawayViewMode !== "exterior"
                ? "bg-[#FFAA00] text-[#03060E] shadow-[0_0_20px_rgba(255,170,0,0.4)]"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/10"
            }`}
          >
            <Stack size={15} weight="duotone" />
            <span>Decks ({cutawayViewMode === "exterior" ? "Exterior" : cutawayViewMode.toUpperCase()})</span>
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
            <span>Facilities ({rooms.length})</span>
          </button>
        </div>
      </div>

      {/* ── MINIMAL VIEWPORT HINT (BOTTOM RIGHT) ── */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040D1A]/80 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#4A7A8E]">
        <span>Click 3D Mesh to Inspect</span>
        <span>·</span>
        <span>Drag to Orbit</span>
        <span>·</span>
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
}
