// logger.js
import winston from "winston";
const { format } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ timestamp, level, message, ...metadata }) => {
  let meta = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
  return `${timestamp} [${level}]: ${message} ${meta}`;
});

// Create and configure the Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
    // File transport for production logs
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add more methods for convenience
logger.stream = {
  // @ts-ignore
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
