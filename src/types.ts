export type RunStatus = "queued" | "running" | "review_required" | "approved" | "failed";

export interface Opportunity {
  id: string;
  title: string;
  sponsor: string;
  deadline: string;
  prize: string;
  requirements: string[];
  judgingCriteria: string[];
  sourceUrl: string;
}

export interface ProjectProfile {
  id: string;
  name: string;
  summary: string;
  capabilities: string[];
  evidence: string[];
  constraints: string[];
  links: string[];
}

export interface FieldAnswer {
  field: string;
  answer: string;
  evidence: string[];
}

export interface ApplicationPack {
  opportunityId: string;
  projectId: string;
  fitScore: number;
  eligibility: "eligible" | "blocked" | "needs_review";
  eligibilityReasons: string[];
  elevatorPitch: string;
  projectStory: string;
  fieldAnswers: FieldAnswer[];
  missingEvidence: string[];
  requiredHumanActions: string[];
  sourceUrls: string[];
}

export interface RunRecord {
  id: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  opportunity: Opportunity;
  projects: ProjectProfile[];
  pack?: ApplicationPack;
  approvedAt?: string;
  error?: string;
}

