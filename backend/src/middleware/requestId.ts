import { Request, Response, NextFunction } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.id = req.id || crypto.randomUUID();
  next();
}
