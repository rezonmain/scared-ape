import rateLimit from "express-rate-limit";
import type { Options } from "express-rate-limit";

const sharedConfig: Partial<Options> = {
  legacyHeaders: false,
  standardHeaders: true,
  message: { error: "Too many requests" },
};
const general = rateLimit({
  ...sharedConfig,
  windowMs: 30 * 60 * 1000, // 30 hour window
  max: 100,
});

const accessRequest = rateLimit({
  ...sharedConfig,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2,
});

const dev = rateLimit({
  ...sharedConfig,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: Infinity,
});

const generalLimiter = process.env.NODE_ENV === "dev" ? dev : general;
const accessRequestLimiter =
  process.env.NODE_ENV === "dev" ? dev : accessRequest;

export { generalLimiter, accessRequestLimiter };
