import type { ApplicationPack, Opportunity, ProjectProfile } from "./types.js";

export function compactProject(project: ProjectProfile): string {
  return [
    `Project: ${project.name}`,
    `Summary: ${project.summary}`,
    `Capabilities: ${project.capabilities.join("; ") || "none recorded"}`,
    `Evidence: ${project.evidence.join("; ") || "none recorded"}`,
    `Constraints: ${project.constraints.join("; ") || "none recorded"}`,
    `Links: ${project.links.join("; ") || "none recorded"}`,
  ].join("\n");
}

export function buildAgentPrompt(opportunity: Opportunity, projects: ProjectProfile[]): string {
  return `You are PrizePilot, an evidence-bound application operations agent.

Select the strongest truthful project for the opportunity and create a review-ready application pack.

Hard rules:
- Never invent eligibility, integrations, metrics, users, revenue, partnerships, credentials, deployment, or submission status.
- A requirement without direct evidence is a blocker or required human action, never an implied capability.
- Prefer a lower fit score over an unsupported claim.
- Cite only URLs supplied in the input.
- The pack is a draft for human approval. Never claim it was submitted.

Opportunity:
${JSON.stringify(opportunity, null, 2)}

Candidate projects:
${projects.map(compactProject).join("\n\n---\n\n")}

Return JSON only with this exact shape:
{
  "opportunityId": string,
  "projectId": string,
  "fitScore": integer 0-100,
  "eligibility": "eligible" | "blocked" | "needs_review",
  "eligibilityReasons": string[],
  "elevatorPitch": string,
  "projectStory": string,
  "fieldAnswers": [{"field": string, "answer": string, "evidence": string[]}],
  "missingEvidence": string[],
  "requiredHumanActions": string[],
  "sourceUrls": string[]
}`;
}

export function assertApprovalReady(pack: ApplicationPack): void {
  if (pack.eligibility !== "eligible") throw new Error("Only eligible packs can be approved");
  if (pack.missingEvidence.length > 0) throw new Error("Missing evidence must be resolved before approval");
  if (pack.requiredHumanActions.length > 0) throw new Error("Human actions must be resolved before approval");
}

