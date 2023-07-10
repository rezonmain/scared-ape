import { z } from "zod";

export type MXvsUSDDTO = z.infer<typeof MXvsUSDDTOSchema>;

export const MXvsUSDDTOSchema = z.object({
  usdToMx: z.number(),
  mxToUsd: z.number(),
});
