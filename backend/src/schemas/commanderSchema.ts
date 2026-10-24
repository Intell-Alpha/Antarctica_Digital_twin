import { z } from "zod";

export const commanderPayloadSchema = z.preprocess((data: any) => {
  if (data && typeof data === "object") {
    // Gracefully accept 'stationId' as an alias for 'station'
    if (!data.station && data.stationId) {
      return { ...data, station: data.stationId };
    }
  }
  return data;
}, z.object({
  query: z
    .string({
      required_error: "query is required",
      invalid_type_error: "query must be a string",
    })
    .trim()
    .min(1, "query cannot be empty"),
  station: z
    .string({
      invalid_type_error: "station must be a string",
    })
    .transform((val) => val.toUpperCase())
    .pipe(
      z.enum(["BHARATI", "MAITRI"], {
        errorMap: () => ({ message: "station must be either 'BHARATI' or 'MAITRI'" }),
      })
    )
    .optional()
    .default("BHARATI"),
}));

export type CommanderPayload = z.infer<typeof commanderPayloadSchema>;
export const commanderSchema = commanderPayloadSchema;
