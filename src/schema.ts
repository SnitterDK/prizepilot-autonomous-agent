import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const opportunitySchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  sponsor: nonEmpty,
  deadline: nonEmpty,
  prize: nonEmpty,
  requirements: z.array(nonEmpty).min(1),
  judgingCriteria: z.array(nonEmpty).min(1),
  sourceUrl: z.string().url(),
});

export const projectSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  summary: nonEmpty,
  capabilities: z.array(nonEmpty),
  evidence: z.array(nonEmpty),
  constraints: z.array(nonEmpty),
  links: z.array(z.string().url()),
});

export const createRunSchema = z.object({
  opportunity: opportunitySchema,
  projects: z.array(projectSchema).min(1).max(30),
});

export const applicationPackSchema = z.object({
  opportunityId: nonEmpty,
  projectId: nonEmpty,
  fitScore: z.number().int().min(0).max(100),
  eligibility: z.enum(["eligible", "blocked", "needs_review"]),
  eligibilityReasons: z.array(nonEmpty),
  elevatorPitch: nonEmpty,
  projectStory: nonEmpty,
  fieldAnswers: z.array(z.object({
    field: nonEmpty,
    answer: nonEmpty,
    evidence: z.array(nonEmpty),
  })),
  missingEvidence: z.array(nonEmpty),
  requiredHumanActions: z.array(nonEmpty),
  sourceUrls: z.array(z.string().url()),
});

