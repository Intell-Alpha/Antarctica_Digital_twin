import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = isDevelopment
  ? pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  })
  : pino();
