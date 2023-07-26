import rateLimit from "express-rate-limit";
import type { Options } from "express-rate-limit";

const sharedConfig: Partial<Options> = {
  legacyHeaders: false,
  standardHeaders: true,
  message: { error: "Too many requests" },
};
const generalLimiter = rateLimit({
  ...sharedConfig,
  windowMs: 30 * 60 * 1000, // 1 hour window
  max: 100,
});

const accessRequestLimiter = rateLimit({
  ...sharedConfig,
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2,
});

export { generalLimiter, accessRequestLimiter };
