import https from "node:https";
import {
  StationId,
  ENVIRONMENT_DATA,
  NcporSeriesPoint
} from "../store/digitalTwinStore";
import { logger } from "../utils/logger";

// TLS Agent configured to tolerate certificate domain alias (e.g. *.ncpor.res.in vs data.ncaor.gov.in)
const tlsAgent = new https.Agent({
  rejectUnauthorized: false
});

export interface ParsedStationLiveResult {
  isLive: boolean;
  station: StationId;
  sourceUrl: string;
  observationDate: string;
  timestamp: string;
  kpi: {
    tempC: number;
    humidityPct: number;
    pressureHpa: number;
    windKnots: number;
    windMps: number;
    windKmh: number;
    windStatus: string;
  };
  stats?: {
    temperature: { avg: number | null; min: number | null; max: number | null };
    windSpeedMps: { avg: number | null; min: number | null; max: number | null };
    airPressureHpa: { avg: number | null; min: number | null; max: number | null };
    relativeHumidityPct: { avg: number | null; min: number | null; max: number | null };
  };
  series?: {
    temperature: NcporSeriesPoint[];
    windSpeed: NcporSeriesPoint[];
    airPressure: NcporSeriesPoint[];
    humidity: NcporSeriesPoint[];
  };
}

export function computeWindStatus(windKmh: number): string {
  if (windKmh >= 100) return "CLASS_3_CATASTROPHIC_BLIZZARD";
  if (windKmh >= 75) return "CLASS_2_SEVERE_BLIZZARD";
  if (windKmh >= 50) return "KATABATIC_GALE";
  if (windKmh >= 30) return "MODERATE_EASTERLY";
  return "LIGHT_POLAR_BREEZE";
}

// Single-flight map to deduplicate concurrent in-flight requests for the same station
const inFlightRequests = new Map<StationId, Promise<ParsedStationLiveResult>>();

/**
 * Fetch and parse real-time AWS data from NCPOR / NCAOR live feeds.
 * Implements single-flight deduplication to return the exact identical in-flight promise.
 */
export function fetchStationLiveTelemetry(
  station: StationId
): Promise<ParsedStationLiveResult> {
  const existing = inFlightRequests.get(station);
  if (existing) {
    return existing;
  }

  const fetchPromise = (async () => {
    const stationLower = station.toLowerCase();
    const urls = [
      `https://data.ncpor.res.in/${stationLower}/live`,
      `https://data.ncaor.gov.in/${stationLower}/live`
    ];

    let html: string | null = null;
    let usedUrl = "";
    let lastError: Error | null = null;

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          // @ts-ignore - native fetch supports node https agent via dispatcher or custom agent option
          agent: tlsAgent,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntarcticaDigitalTwinBackend/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          signal: AbortSignal.timeout(10000)
        });

        if (res.ok) {
          html = await res.text();
          usedUrl = url;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!html) {
      throw new Error(
        `[NCPOR Client] Failed to retrieve data for ${station} from endpoints: ${lastError?.message || "Unknown error"}`
      );
    }

    // Parse instantaneous KPIs
    const tempMatch = html.match(
      /id\s*=\s*["']?divtemp["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
    );
    const rhMatch = html.match(
      /id\s*=\s*["']?divrh["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
    );
    const apMatch = html.match(
      /id\s*=\s*["']?divap["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
    );
    const wMatch = html.match(
      /id\s*=\s*["']?divw["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
    );
    const dateMatch = html.match(/<td rowspan="2"[^>]*>([^<]+)<\/td>/i);

    const parsedTemp = tempMatch ? parseFloat(tempMatch[1]) : ENVIRONMENT_DATA[station].tempC;
    const parsedRh = rhMatch ? parseFloat(rhMatch[1]) : ENVIRONMENT_DATA[station].humidityPct;
    const parsedAp = apMatch ? parseFloat(apMatch[1]) : ENVIRONMENT_DATA[station].pressureHpa;
    const windKnots = wMatch ? parseFloat(wMatch[1]) : 20.0;
    const windMps = +(windKnots * 0.514444).toFixed(2);
    const windKmh = +(windKnots * 1.852).toFixed(1);
    const windStatus = computeWindStatus(windKmh);

    // Extract 24-hour hourly trend arrays
    const extractSeries = (seriesName: string): NcporSeriesPoint[] => {
      const regex = new RegExp(
        `name:\\s*["']${seriesName}["'][\\s\\S]*?dataPoints:\\s*\\[([\\s\\S]*?)\\]`,
        "i"
      );
      const m = html!.match(regex);
      if (!m) return [];
      return [
        ...m[1].matchAll(/\{\s*x:\s*(\d+),\s*y\s*:\s*([+-]?\d+(?:\.\d+)?)\s*\}/g)
      ].map((item) => ({
        timestamp: Number(item[1]),
        value: Number(item[2])
      }));
    };

    const tempSeries = extractSeries("Temperature");
    const windSeries = extractSeries("Wind Speed");
    const pressureSeries = extractSeries("Air Pressure");
    const humiditySeries = extractSeries("Relative Humidity");

    // Parse statistical summary tables
    const parseColumnStats = (tableHeader: string) => {
      const tableRegex = new RegExp(
        `<th>${tableHeader}<\\/th>[\\s\\S]*?<\\/table>`,
        "i"
      );
      const tableBlock = html!.match(tableRegex);
      if (!tableBlock) return null;
      const block = tableBlock[0];

      const getVal = (label: string) => {
        const rowRegex = new RegExp(
          `<td>${label}<\\/td>\\s*<td>\\s*([+-]?\d+(?:\\.\\d+)?)`,
          "i"
        );
        const rm = block.match(rowRegex);
        return rm ? parseFloat(rm[1]) : null;
      };

      return {
        tempC: getVal("Temperature"),
        windMps: getVal("Wind Speed"),
        pressureHpa: getVal("Air Pressure"),
        humidityPct: getVal("Rel\\. Humidity")
      };
    };

    const avgStats = parseColumnStats("Average");
    const minStats = parseColumnStats("Minimum");
    const maxStats = parseColumnStats("Maxmimum") || parseColumnStats("Maximum");

    const result: ParsedStationLiveResult = {
      isLive: true,
      station,
      sourceUrl: usedUrl,
      observationDate: dateMatch ? dateMatch[1].trim() : "Live Automatic Weather Station",
      timestamp: new Date().toISOString(),
      kpi: {
        tempC: parsedTemp,
        humidityPct: parsedRh,
        pressureHpa: parsedAp,
        windKnots,
        windMps,
        windKmh,
        windStatus
      },
      stats: {
        temperature: {
          avg: avgStats?.tempC ?? null,
          min: minStats?.tempC ?? null,
          max: maxStats?.tempC ?? null
        },
        windSpeedMps: {
          avg: avgStats?.windMps ?? null,
          min: minStats?.windMps ?? null,
          max: maxStats?.windMps ?? null
        },
        airPressureHpa: {
          avg: avgStats?.pressureHpa ?? null,
          min: minStats?.pressureHpa ?? null,
          max: maxStats?.pressureHpa ?? null
        },
        relativeHumidityPct: {
          avg: avgStats?.humidityPct ?? null,
          min: minStats?.humidityPct ?? null,
          max: maxStats?.humidityPct ?? null
        }
      },
      series: {
        temperature: tempSeries,
        windSpeed: windSeries,
        airPressure: pressureSeries,
        humidity: humiditySeries
      }
    };

    return result;
  })();

  inFlightRequests.set(station, fetchPromise);
  fetchPromise.finally(() => {
    inFlightRequests.delete(station);
  });

  return fetchPromise;
}
