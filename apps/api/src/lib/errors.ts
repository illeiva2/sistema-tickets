import { Request, Response } from "express";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }
}

export const errorHandler = (error: Error, req: Request, res: Response) => {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  if (error instanceof ApiError) {
    logger.warn({
      requestId,
      error: error.code,
      message: error.message,
      statusCode: error.statusCode,
      url: req.url,
      method: req.method,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    });
  }

  // Log unexpected errors with more context
  logger.error({
    requestId,
    error: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.method !== "GET" ? req.body : undefined,
    query: req.query,
    params: req.params,
    headers: {
      "content-type": req.get("Content-Type"),
      authorization: req.get("Authorization") ? "Bearer ***" : undefined,
    },
  });

  // En producción, no exponer detalles del error
  const isProduction = process.env.NODE_ENV === "production";

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction ? "Error interno del servidor" : error.message,
      requestId,
      ...(isProduction ? {} : { stack: error.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  logger.warn({
    requestId,
    error: "NOT_FOUND",
    url: req.url,
    method: req.method,
  });

  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint no encontrado",
      requestId,
    },
  });
};
