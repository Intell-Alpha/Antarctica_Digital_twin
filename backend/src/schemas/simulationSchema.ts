import { z } from "zod";

export const StationIdEnum = z.enum(["BHARATI", "MAITRI"], {
  errorMap: () => ({ message: "Station ID must be either 'BHARATI' or 'MAITRI'" }),
});

export const simulationPayloadSchema = z.preprocess((data: any) => {
  if (data && typeof data === "object") {
    // Gracefully accept 'station' as an alias for 'stationId'
    if (!data.stationId && data.station) {
      return { ...data, stationId: data.station };
    }
  }
  return data;
}, z.object({
  stationId: z
    .string({
      required_error: "stationId is required",
      invalid_type_error: "stationId must be a string",
    })
    .transform((val) => val.toUpperCase())
    .pipe(StationIdEnum),
  scenarioId: z
    .string({
      required_error: "scenarioId is required",
      invalid_type_error: "scenarioId must be a string",
    })
    .trim()
    .min(1, "scenarioId cannot be empty"),
  parameters: z
    .record(z.any())
    .optional()
    .default({}),
}));

export type SimulationPayload = z.infer<typeof simulationPayloadSchema>;
export const simulationSchema = simulationPayloadSchema;
