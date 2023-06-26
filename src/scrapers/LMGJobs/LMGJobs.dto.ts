import { z } from "zod";

export type LMGJobsDTO = z.infer<typeof LMGJobsDTOSchema>;

export const LMGJobsDTOSchema = z.object({
  title: z.string(),
  content: z.object({
    location: z.string(),
    employment: z.string(),
    description: z.string(),
    jobRequirements: z.array(z.string()),
  }),
  applyUrl: z.string().url(),
});
