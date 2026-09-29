# Antarctic Digital Twin: Remote Management & 3D Telemetry Framework

## Executive Summary
In alignment with your statement:
> *"Develop a Digital Twin framework for Maitri and Bharati stations integrating infrastructure, energy, logistics, and environmental monitoring for efficient remote management."*

All features are now fully integrated and operational across both **Bharati Station** and **Maitri Station**:
1. **Contextual Room-Anchored Telemetry Cards** with authentic SCADA metrics and bi-directional supervisory tele-commands.
2. **What-If Counterfactual Crisis Simulation Engine** with real-time Three.js physical scene reactions (katabatic blizzard fog, GenSet trip cutaways, red flash indicators).
3. **Live Polar Vitals Bar & ISRO Store-and-Forward Buffer Visualizer** displaying real-time edge queue priority packets (P0–P4) and blackout failover.

---

## 1. Components Overview

| Component | File Path | Key Responsibilities |
| :--- | :--- | :--- |
| **`RoomTelemetryCard`** | [`src/components/RoomTelemetryCard.tsx`](file:///c:/Antarctica_Digital_twin/src/components/RoomTelemetryCard.tsx) | Displays 6 authentic SCADA parameters tailored to CHPP Generators, Fuel Day Tanks, RO Desalination, Medical Clinic/OT, SCADA NOC, Airlocks, and Garages with remote actuation triggers. |
| **`TwinWhatIfSimulator`** | [`src/components/TwinWhatIfSimulator.tsx`](file:///c:/Antarctica_Digital_twin/src/components/TwinWhatIfSimulator.tsx) | Runs 5 crisis scenarios (`EXTREME_WEATHER`, `GENERATOR_FAILURE`, `INCREASED_ENERGY_DEMAND`, `SUPPLY_DELAY`, `COMMUNICATION_OUTAGE`) against the backend (`POST /api/simulation`) and yields KPI deltas, risk alerts, and mitigation recommendations. |
| **`TwinVitalsBar`** | [`src/components/TwinVitalsBar.tsx`](file:///c:/Antarctica_Digital_twin/src/components/TwinVitalsBar.tsx) | Real-time polar telemetry ticker (ambient temp, wind speed, power load, fuel reserves, sat status) with expandable ISRO Store-and-Forward packet buffer drawer. |
| **`BharatiStationTwin`** | [`src/components/BharatiStationTwin.tsx`](file:///c:/Antarctica_Digital_twin/src/components/BharatiStationTwin.tsx) | Integrated Bharati 3D twin with multi-floor GPU clipping, pipeline pulse shaders, room navigation, and 3D simulation scene reactions. |
| **`MaitriStationTwin`** | [`src/components/MaitriStationTwin.tsx`](file:///c:/Antarctica_Digital_twin/src/components/MaitriStationTwin.tsx) | Integrated Maitri 3D twin with Priyadarshini water lifeline tracking, roof X-ray lift, powerhouse SCADA, and What-If reaction. |

---

## 2. Remote Management Differentiators

### A. Contextual SCADA Cards vs. Random Floating Numbers
Instead of displaying disconnected metrics, every card is contextually tied to the station's physical BIM and MEP zones:
- **CHPP GenSet Hall**: Active load (147 kW), individual GenSet thermal readings (84°C), frequency stability (50.01 Hz), and waste-heat recovery yield (+78.2°C).
- **RO Desalination Plant**: Feed TDS, permeate conductivity, dual-train flow velocity, and membrane differential pressure.
- **Bi-Directional Supervisory Control**: Buttons with two-key confirmation (`Remote Spin-Up Standby GenSet`, `Toggle Eco-Thermal Heat Loop`, `Membrane Backwash Cycle`).

### B. What-If Physical Scene Reactions in Three.js
Simulations do not just calculate numbers in tables—they physically drive the 3D twin:
- **Katabatic Blizzard**: Increases atmospheric fog density to `0.0048`, shifts sky color to icy slate blue `#081220`, dims sun lighting to `0.75`, and boosts the electric heat-trace line uniform.
- **Generator Trip**: Automatically cuts camera to the Level 02 Power Deck (or lifts Maitri's roof) and flashes the tripped GenSet mesh emissive red (`#FF0033`).

### C. Store-and-Forward Satellite Buffer Visualizer
Models the real polar communication constraint (intermittent ISRO C-band / Ku-band links):
- Categorizes telemetry into priority tiers:
  - **P0 Critical Life Support**: Zero-latency burst transmission.
  - **P1 SCADA Telemetry**: Real-time streaming.
  - **P2 Environmental Sensors**: Store-and-forward edge buffer (45s queue).
  - **P3 Science Batch Data**: Deferred bulk transfer (12 min queue).
- Includes an interactive **Simulate Blackout** toggle demonstrating edge storage and automatic sync upon link restoration.
