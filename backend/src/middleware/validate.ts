import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  error: string;
  details: ValidationErrorDetail[];
}

/**
 * Generic Express middleware to validate incoming request bodies against a Zod schema.
 * Rejects invalid, malformed, or missing parameters with a clean 400 Bad Request and field-level details.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const issues = result.error.issues || (result.error as any).errors || [];
        const details: ValidationErrorDetail[] = issues.map((issue: any) => ({
          field: issue.path && issue.path.length > 0 ? issue.path.join(".") : "body",
          message: issue.message,
        }));

        return res.status(400).json({
          error: "Validation failed",
          details,
        });
      }

      req.body = result.data;
      return next();
    } catch (err: any) {
      return res.status(400).json({
        error: "Validation failed",
        details: [
          {
            field: "body",
            message: err?.message || "Invalid request payload",
          },
        ],
      });
    }
  };
};

export default validate;
