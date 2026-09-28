export interface HourlyTelemetryRecord {
  timestamp: string;
  stationId: "BHARATI" | "MAITRI";
  temperatureC: number;
  windSpeedKmh: number;
  pressureHpa: number;
  chpPowerKw: number;
  fuelLevelL: number;
  fuelConsumptionL: number;
  gammaRadiationNgyh: number;
  waterIntakeFlowLm: number;
  satelliteLatencyMs: number;
  status: "NORMAL" | "WATCH" | "CRITICAL";
}

export interface HistoricalYearSummary {
  year: number;
  tMaxC: number;
  tMinC: number;
  windSpeedMs: number;
  precipitationMm: number;
  blizzardHours: number;
}

// Official NCPOR & MoES Bharati Historical Meteorology Dataset (2015 - 2022) from Project Document
export const BHARATI_HISTORICAL_METEOROLOGY: HistoricalYearSummary[] = [
  { year: 2015, tMaxC: 7.2, tMinC: -38.9, windSpeedMs: 33.3, precipitationMm: 328.6, blizzardHours: 31.0 },
  { year: 2016, tMaxC: 8.9, tMinC: -40.3, windSpeedMs: 33.8, precipitationMm: 291.4, blizzardHours: 24.8 },
  { year: 2017, tMaxC: 6.9, tMinC: -38.3, windSpeedMs: 50.2, precipitationMm: 179.5, blizzardHours: 45.0 },
  { year: 2018, tMaxC: 9.9, tMinC: -29.8, windSpeedMs: 41.1, precipitationMm: 78.9, blizzardHours: 24.0 },
  { year: 2019, tMaxC: 8.1, tMinC: -35.8, windSpeedMs: 38.8, precipitationMm: 108.5, blizzardHours: 26.9 },
  { year: 2020, tMaxC: 7.1, tMinC: -32.1, windSpeedMs: 30.2, precipitationMm: 156.7, blizzardHours: 40.3 },
  { year: 2021, tMaxC: 8.9, tMinC: -34.5, windSpeedMs: 40.5, precipitationMm: 160.3, blizzardHours: 18.5 },
  { year: 2022, tMaxC: 7.6, tMinC: -37.6, windSpeedMs: 41.6, precipitationMm: 165.9, blizzardHours: 32.3 },
];

export const MAITRI_HISTORICAL_METEOROLOGY: HistoricalYearSummary[] = [
  { year: 2015, tMaxC: 8.1, tMinC: -41.2, windSpeedMs: 35.0, precipitationMm: 210.0, blizzardHours: 38.0 },
  { year: 2016, tMaxC: 9.2, tMinC: -42.0, windSpeedMs: 36.5, precipitationMm: 195.0, blizzardHours: 30.0 },
  { year: 2017, tMaxC: 7.5, tMinC: -39.8, windSpeedMs: 48.0, precipitationMm: 160.0, blizzardHours: 52.0 },
  { year: 2018, tMaxC: 10.1, tMinC: -31.5, windSpeedMs: 42.0, precipitationMm: 95.0, blizzardHours: 28.0 },
  { year: 2019, tMaxC: 8.5, tMinC: -37.0, windSpeedMs: 40.2, precipitationMm: 120.0, blizzardHours: 31.0 },
  { year: 2020, tMaxC: 7.8, tMinC: -34.0, windSpeedMs: 32.5, precipitationMm: 140.0, blizzardHours: 44.0 },
  { year: 2021, tMaxC: 9.1, tMinC: -36.2, windSpeedMs: 42.0, precipitationMm: 150.0, blizzardHours: 22.0 },
  { year: 2022, tMaxC: 8.0, tMinC: -39.0, windSpeedMs: 43.5, precipitationMm: 155.0, blizzardHours: 36.0 },
];

// Generator to produce a 24-hour realistic synthetic telemetry time-series dataset (24 hourly records)
export function generateSynthetic24hTimeSeries(stationId: "BHARATI" | "MAITRI"): HourlyTelemetryRecord[] {
  const records: HourlyTelemetryRecord[] = [];
  const now = new Date();

  const baseFuel = stationId === "BHARATI" ? 285000 : 195000;
  const baseTemp = stationId === "BHARATI" ? -22.4 : -24.8;
  const baseWind = stationId === "BHARATI" ? 38.5 : 42.0;

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const hour = time.getHours();

    // Diurnal temperature variation (-4°C dip at night)
    const tempVariation = Math.sin((hour - 6) * (Math.PI / 12)) * 3.5;
    const tempC = parseFloat((baseTemp + tempVariation + (Math.random() - 0.5)).toFixed(1));

    // Katabatic wind spikes
    const windKmh = parseFloat((baseWind + (hour >= 18 || hour <= 4 ? 12 : 0) + (Math.random() * 8)).toFixed(1));

    // Power demand increases when temperature drops
    const chpPowerKw = Math.round((stationId === "BHARATI" ? 147.5 : 142.0) + Math.abs(tempC + 20) * 1.8);

    // Hourly fuel consumption ~40L/hr
    const hourlyFuelL = Math.round(chpPowerKw * 0.28);
    const fuelRemainingL = baseFuel - (23 - i) * hourlyFuelL;

    // BARC IERMON Gamma Radiation (100 - 750 nGy/h range)
    const gammaNgyh = parseFloat((120.0 + Math.sin(i) * 15.0 + Math.random() * 5.0).toFixed(1));

    records.push({
      timestamp: time.toISOString(),
      stationId,
      temperatureC: tempC,
      windSpeedKmh: windKmh,
      pressureHpa: parseFloat((985 + Math.cos(i / 2) * 5 + Math.random()).toFixed(1)),
      chpPowerKw,
      fuelLevelL: fuelRemainingL,
      fuelConsumptionL: hourlyFuelL,
      gammaRadiationNgyh: gammaNgyh,
      waterIntakeFlowLm: stationId === "BHARATI" ? 42.5 : 38.0,
      satelliteLatencyMs: Math.round(42 + Math.random() * 8),
      status: windKmh > 50 ? "WATCH" : "NORMAL"
    });
  }

  return records;
}
