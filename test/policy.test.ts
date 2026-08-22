import assert from "node:assert/strict";
import test from "node:test";
import { assertApprovalReady, buildAgentPrompt } from "../src/policy.js";
import type { ApplicationPack, Opportunity, ProjectProfile } from "../src/types.js";

const opportunity: Opportunity = { id:"o1", title:"Contest", sponsor:"Sponsor", deadline:"2026-09-01", prize:"$1", requirements:["runtime evidence"], judgingCriteria:["impact"], sourceUrl:"https://example.com/rules" };
const project: ProjectProfile = { id:"p1", name:"Project", summary:"Summary", capabilities:[], evidence:[], constraints:["not deployed"], links:["https://example.com/project"] };

test("prompt binds the agent to evidence and human approval", () => {
  const prompt = buildAgentPrompt(opportunity, [project]);
  assert.match(prompt, /Never invent eligibility/);
  assert.match(prompt, /draft for human approval/);
  assert.match(prompt, /not deployed/);
});

test("approval refuses unresolved evidence", () => {
  const pack: ApplicationPack = { opportunityId:"o1", projectId:"p1", fitScore:80, eligibility:"eligible", eligibilityReasons:[], elevatorPitch:"Pitch", projectStory:"Story", fieldAnswers:[], missingEvidence:["deployment"], requiredHumanActions:[], sourceUrls:[] };
  assert.throws(() => assertApprovalReady(pack), /Missing evidence/);
});

test("approval allows a fully resolved eligible pack", () => {
  const pack: ApplicationPack = { opportunityId:"o1", projectId:"p1", fitScore:80, eligibility:"eligible", eligibilityReasons:["verified"], elevatorPitch:"Pitch", projectStory:"Story", fieldAnswers:[], missingEvidence:[], requiredHumanActions:[], sourceUrls:[] };
  assert.doesNotThrow(() => assertApprovalReady(pack));
});

