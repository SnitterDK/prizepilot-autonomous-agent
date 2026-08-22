import type { ApplicationAgent } from "./agent.js";
import type { ApplicationPack, Opportunity, ProjectProfile } from "./types.js";

export class FixtureApplicationAgent implements ApplicationAgent {
  async createPack(opportunity: Opportunity, projects: ProjectProfile[]): Promise<ApplicationPack> {
    const project = projects[0];
    if (!project) throw new Error("At least one project is required");
    return {
      opportunityId: opportunity.id,
      projectId: project.id,
      fitScore: 72,
      eligibility: "needs_review",
      eligibilityReasons: ["Fixture output demonstrates the review contract; live Gemini evaluation is disabled."],
      elevatorPitch: `${project.name} is evaluated against ${opportunity.title} with evidence separated from assumptions.`,
      projectStory: "Local fixture mode demonstrates queue, evidence, and approval states without making external submissions.",
      fieldAnswers: [{ field: "Project summary", answer: project.summary, evidence: project.evidence }],
      missingEvidence: ["Run with Vertex AI on Google Cloud for a competition-valid evaluation."],
      requiredHumanActions: ["Review eligibility and approve only after all blockers are resolved."],
      sourceUrls: [opportunity.sourceUrl, ...project.links],
    };
  }
}

