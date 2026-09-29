# 🇦🇶 Himdrishti — Backend API & Simulation Engine

A production-ready, modular **Express + TypeScript** backend service built for the **Bharati Research Station** (commissioned March 2012) and **Maitri Research Station** (commissioned 1989) Digital Twin framework.

---

## 📌 1. System Overview

The Digital Twin backend is a **source-aware, cross-domain intelligence engine**. It acts as the central state server that bridges physical station infrastructure, power generation (Combined Heat and Power), logistics & resource inventory, environmental/scientific telemetry, satellite communications edge buffering, and counterfactual What-If risk simulation.

```
+-----------------------------------------------------------------------------------+
|                            REAL ANTARCTIC STATIONS                                |
|             Bharati (Larsemann Hills)  |  Maitri (Schirmacher Oasis)              |
+-----------------------------------------------------------------------------------+
                                         │
       ┌─────────────────────────┬───────┴─────────┬─────────────────────────┐
       ▼                         ▼                 ▼                         ▼
 Infrastructure               Energy           Logistics               Environment
 (CHP Engine Room,         (MAN CHP 1-3,     (Fuel Reserves,         (BARC Radiation,
 Sea Water Pump House,      Battery UPS,     Cold Storage,            Katabatic Winds,
 ISRO Antenna Field)        Generator Load)   Medical & Spares)        Magnetometers)
       │                         │                 │                         │
       └─────────────────────────┼─────────────────┴─────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ EDGE DATA COLLECTION  │
                     │ Store & Forward Queue │
                     └───────────┬───────────┘
                                 │  ISRO C-Band / DROMLAN Satellite Link
                                 ▼
                     ┌───────────────────────┐
                     │ EXPRESS BACKEND ENGINE│
                     │ (Node.js/TS @ Port 5000)│
                     └───────────┬───────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
     REST API Layer      Simulation Engine      Synthetic Data Engine
  (10 Active Endpoints) (Scenarios A through E)  (2015-2022 NCPOR Datasets)
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   NEXT.JS FRONTEND    │
                     │ (Dashboard & Console) │
                     └───────────────────────┘
```

---

## 📁 2. Directory & Module Map

```
backend/
├── .gitignore                      # Excludes node_modules, dist/ build output & environment files
├── package.json                    # Package manifest, dependencies & scripts
├── tsconfig.json                   # TypeScript ES2022 compiler configuration
├── README.md                       # Comprehensive system documentation
└── src/
    ├── index.ts                    # Server entry point, CORS, logging middleware & route mounts
    ├── config/
    │   └── env.ts                  # Environment variables, ports & CORS configuration
    ├── controllers/                # REST API Controllers (Request handling & response formatting)
    │   ├── stationController.ts    # Station identity, capacity & master plan zones
    │   ├── infrastructureController.ts # Building modules, water intake, effluent & labs
    │   ├── energyController.ts     # MAN CHP 1-3 & Ravi/Surya/Aditya generator telemetry
    │   ├── logisticsController.ts  # Inventory stocks, daily depletion rates & TTCF horizon
    │   ├── environmentController.ts # Climate, BARC radiation (IERMON) & magnetometers
    │   ├── networkController.ts    # ISRO C-Band orbital link & priority queues (P0–P4)
    │   ├── simulationController.ts # Counterfactual What-If risk calculation engine
    │   ├── telemetryController.ts # Real-time streaming log ticks & live status
    │   └── syntheticDataController.ts # 2015-2022 NCPOR climate tables & 24h synthetic data
    ├── routes/                     # Express Routers
    │   ├── stationRoutes.ts        # GET /api/stations, GET /api/stations/:id
    │   ├── infrastructureRoutes.ts # GET /api/infrastructure
    │   ├── energyRoutes.ts         # GET /api/energy
    │   ├── logisticsRoutes.ts      # GET /api/logistics
    │   ├── environmentRoutes.ts   # GET /api/environment
    │   ├── networkRoutes.ts        # GET /api/network
    │   ├── simulationRoutes.ts     # POST /api/simulation
    │   ├── telemetryRoutes.ts      # GET /api/telemetry
    │   └── syntheticDataRoutes.ts  # GET /api/synthetic-data
    ├── services/                   # Business Logic & Intelligence Engines
    │   ├── digitalTwinEngine.ts    # Cross-domain impact calculation & scenario simulation
    │   └── telemetryGenerator.ts   # Live telemetry stream & status snapshot generator
    └── store/                      # Data Stores & Seed Datasets
        ├── digitalTwinStore.ts     # Master asset ontology & provenance model
        └── syntheticData.ts        # NCPOR 2015-2022 historical baseline & 24h generator
```

---

## 📊 3. Source & Provenance Evidence Model

To ensure scientific and operational authenticity, every entity returned by the backend includes a `provenance` metadata object detailing the evidence behind it:

```json
{
  "sourceType": "OFFICIAL",
  "sourceName": "NCPOR / Antarctic Treaty Inspection Report",
  "sourceRef": "BMP-2012 / MoES Doc",
  "confidence": "HIGH",
  "verificationStatus": "VERIFIED"
}
```

### Supported Source Types:
- `OFFICIAL`: Verified Government/NCPOR/MoES Antarctic Treaty documentation.
- `DOCUMENTARY`: Extracted from station video footage and expedition logs.
- `PROJECT_ASSUMPTION`: Defined assumption for prototype simulation.
- `INFERENCE`: Derived cross-domain relationship calculation.
- `LIVE_SENSOR`: Real-time telemetry connection.
- `SIMULATED`: Artificial synthetic data stream.

---

## 🌐 4. Complete REST API Specifications

### Base Server URL: `http://localhost:5000`

---

### 4.1 Root Health Check — `GET /`
- **Description:** Verifies server status, active engine version, and available station models.
- **Sample Request:** `curl http://localhost:5000/`
- **Sample Response:**
```json
{
  "status": "ONLINE",
  "system": "Himdrishti Backend Core Engine",
  "stations": ["BHARATI", "MAITRI"],
  "timestamp": "2026-09-27T19:30:00.000Z",
  "version": "1.0.0"
}
```

---

### 4.2 Station Metadata — `GET /api/stations`
- **Description:** Returns metadata for all supported research stations (Bharati & Maitri).
- **Sample Request:** `curl http://localhost:5000/api/stations`
- **Key Response Fields:**
  - `commissioningYear`: `2012` for Bharati, `1989` for Maitri.
  - `capacity`: Twin-sharing accommodation capacity in main building + summer camps.
  - `zones`: Master Plan division (Zone 1 Infrastructure, Zone 2 Magnetic Silence, Zone 5 ISRO Antenna Field).

---

### 4.3 Infrastructure Twin — `GET /api/infrastructure?station=BHARATI`
- **Description:** Returns physical building modules, utility health, water intake, effluent treatment, and lab spaces.
- **Sample Request:** `curl "http://localhost:5000/api/infrastructure?station=BHARATI"`
- **Response Metrics:**
  - `overallConditionScore`: Aggregate station structural health index (0–100%).
  - `assets`:
    - `BH-INF-01`: Main Station Building (47-Bed Modular Block)
    - `BH-INF-02`: Sea Water Pump House (Trace heated coastal intake)
    - `BH-INF-03`: MAN Combined Heat & Power (CHP) Engine Room
    - `BH-INF-04`: ISRO Ground Station Antenna Complex (C, X & S Band)
    - `BH-INF-05`: Four Designated Laboratories (Electrical, Life, Chemical, Earth Sciences)
    - `BH-INF-06`: Wastewater Treatment & Incineration Module

---

### 4.4 Power & Energy Twin — `GET /api/energy?station=BHARATI`
- **Description:** Returns real-time generator telemetry, power generation output, fuel consumption rates, engine temperatures, battery/UPS status, and renewable share KPI.
- **Sample Request:** `curl "http://localhost:5000/api/energy?station=BHARATI"`
- **Key Parameters:**
  - `totalCapacityKw`: Rated capacity of connected generator group (e.g., `405 kW` for MAN CHP array).
  - `currentOutputKw`: Active load generation output.
  - `currentFuelConsumptionLh`: Total fuel flow in Liters/hour.
  - `generators`:
    - `BHARATI-CHP-01`: MAN CHP Unit 01 (Primary) — 135 kW, 84°C, 50.01 Hz
    - `BHARATI-CHP-02`: MAN CHP Unit 02 (Secondary) — 135 kW, 81°C, 50.02 Hz
    - `BHARATI-CHP-03`: MAN CHP Unit 03 (Standby) — 135 kW, 18°C, 0.00 Hz

---

### 4.5 Logistics & Inventory Twin — `GET /api/logistics?station=BHARATI`
- **Description:** Tracks resource inventories, daily depletion rates, fuel tank reserves, cold storage food, medical supplies, spare parts, and calculates **Time To Critical Failure (TTCF)**.
- **Sample Request:** `curl "http://localhost:5000/api/logistics?station=BHARATI"`
- **Key Response Fields:**
  - `fuelReservesL`: Total Jet A-1 / HSD fuel tank stock (e.g. `285,000 L`).
  - `dailyFuelConsumptionL`: Daily station burn rate (e.g. `980 L/day`).
  - `fuelAutonomyDays`: Predicted days of remaining power autonomy (e.g. `290 Days`).
  - `resupplyWindow`: Active supply corridor (Austral Summer Sea Route from Cape Town & DROMLAN Air Network).

---

### 4.6 Environmental & Science Twin — `GET /api/environment?station=BHARATI`
- **Description:** Serves weather telemetry, BARC Environmental Radiation Monitor (IERMON) gamma doses, ISRO ground station telemetry, and geomagnetic field scans.
- **Sample Request:** `curl "http://localhost:5000/api/environment?station=BHARATI"`
- **Key Parameters:**
  - `tempC`: Outside ambient temperature (`-22.4°C`).
  - `windSpeedKmh`: Katabatic wind speed (`38.5 km/h`).
  - `radiationGammaNgyh`: BARC IERMON gamma dose rate (`125.0 nGy/h`, baseline range 100–750 nGy/h).
  - `magneticFieldnT`: Geomagnetic field intensity (`54,210 nT`).
  - `scientificInstruments`: AWS, Proton Precession Magnetometer, Digital Fluxgate Magnetometer, ISRO C-Band Antenna.

---

### 4.7 Satellite & Network Twin — `GET /api/network?station=BHARATI`
- **Description:** Monitors ISRO C-Band & INSAT-3DR satellite uplink telemetry, latency, edge NVMe buffer utilization, and Store-and-Forward priority queues.
- **Sample Request:** `curl "http://localhost:5000/api/network?station=BHARATI"`
- **Store-and-Forward Priority Queues:**
  - `P0`: Emergency & Safety Alerts (Instantaneous priority)
  - `P1`: Critical Infrastructure Telemetry
  - `P2`: Operational State Logs
  - `P3`: Scientific Telemetry Stream (Buffered during outage)
  - `P4`: Bulk Imagery & Video Archives

---

### 4.8 What-If Scenario Calculation Engine — `POST /api/simulation`
- **Description:** Computes counterfactual risk impacts comparing **Baseline State vs Projected Impact** under extreme operational stress.
- **Sample Request:**
```bash
curl -X POST "http://localhost:5000/api/simulation" \
     -H "Content-Type: application/json" \
     -d '{"stationId": "BHARATI", "scenarioId": "EXTREME_WEATHER"}'
```
- **Supported Scenarios:**
  1. `EXTREME_WEATHER` (Scenario A): Extreme Katabatic storm & -40°C temperature drop -> recalculates heating demand (+39.6%), CHP load, fuel burn rate & resupply risk.
  2. `GENERATOR_FAILURE` (Scenario B): Primary generator trip -> lost generation calculation, load shedding, UPS engagement & standby failover.
  3. `INCREASED_ENERGY_DEMAND` (Scenario C): Peak scientific campaign (+40% load) -> generator utilization & fuel autonomy drop.
  4. `SUPPLY_DELAY` (Scenario D): Resupply vessel sea-ice blockade (60-day delay) -> projects fuel autonomy depletion horizon.
  5. `COMMUNICATION_OUTAGE` (Scenario E): Satellite link failure -> triggers edge gateway NVMe store-and-forward buffering.
- **Sample Response Payload:**
```json
{
  "success": true,
  "stationId": "BHARATI",
  "simulation": {
    "scenarioId": "EXTREME_WEATHER",
    "scenarioName": "Scenario A — Extreme Katabatic Storm & Temperature Drop (-40°C)",
    "baseline": {
      "powerDemandKw": 147,
      "fuelConsumptionDayL": 980,
      "fuelAutonomyDays": 290,
      "survivabilityScore": 94,
      "stationHealth": "OPTIMAL"
    },
    "simulated": {
      "powerDemandKw": 206,
      "fuelConsumptionDayL: 1368,
      "fuelAutonomyDays": 208,
      "survivabilityScore": 82,
      "stationHealth": "NORMAL",
      "criticalAlerts": [
        "Katabatic storm alert: Wind > 120 km/h detected in Sector East.",
        "Heating load increased by 39.6%. CHP thermal stress elevated."
      ],
      "recommendedActions": [
        "Engage secondary trace heating circuit on intake line.",
        "Restrict outdoor movements and enable Zone 1 storm shutters."
      ]
    }
  }
}
```

---

### 4.9 Real-Time Telemetry Feed — `GET /api/telemetry?station=BHARATI`
- **Description:** Streams live telemetry snapshots, latest system logs, and status ticks.
- **Sample Request:** `curl "http://localhost:5000/api/telemetry?station=BHARATI"`

---

### 4.10 Synthetic & Historical Datasets — `GET /api/synthetic-data?station=BHARATI`
- **Description:** Serves historical 2015–2022 NCPOR climate records and 24-hour generated synthetic telemetry time-series records.
- **Sample Request:** `curl "http://localhost:5000/api/synthetic-data?station=BHARATI"`
- **Includes:**
  - `historicalMeteorology2015_2022`: Year-by-year Tmax, Tmin, peak wind speed (m/s), precipitation (mm), and blizzard hours.
  - `synthetic24hTimeSeries`: 24 hourly synthetic records containing temperature, wind gusts, CHP power load, fuel reserves, and BARC radiation.

---

## 🔄 5. Cross-Domain Intelligence Formulas

The backend models complex real-world dependencies across station domains:

$$\text{Heating Load Increase (\%)} = \Delta T \times 2.2\%$$

$$\text{Simulated Power Load (kW)} = \text{Base Power} \times \left(1 + \frac{\text{Heating Increase \%}}{100}\right)$$

$$\text{Simulated Fuel Autonomy (Days)} = \frac{\text{Fuel Tank Reserves (L)}}{\text{Daily Fuel Burn Rate (L/day)}}$$

---

## 🛠️ 6. Build & Deployment Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build TypeScript source code to dist/
npm run build

# Start production Express server on port 5000
npm start
```
