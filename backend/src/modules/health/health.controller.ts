import { Request, Response } from "express";
import { name, version, description } from "../../../package.json";
import { HealthResponse } from "./health.types";

/**
 * Returns current server health info.
 * Useful for load balancer probes and monitoring.
 */
export const getHealth = (_req: Request, res: Response): void => {
  const health: HealthResponse = {
    status: "ok",
    name,
    version,
    description,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  res.json(health);
};
