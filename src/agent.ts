import { GoogleGenAI } from "@google/genai";
import { applicationPackSchema } from "./schema.js";
import { buildAgentPrompt } from "./policy.js";
import type { ApplicationPack, Opportunity, ProjectProfile } from "./types.js";

export interface ApplicationAgent {
  createPack(opportunity: Opportunity, projects: ProjectProfile[]): Promise<ApplicationPack>;
}

export class GeminiApplicationAgent implements ApplicationAgent {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor() {
    this.client = new GoogleGenAI({
      vertexai: true,
      project: requiredEnv("GOOGLE_CLOUD_PROJECT"),
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    });
    this.model = process.env.GEMINI_MODEL ?? "gemini-3.5-pro";
  }

  async createPack(opportunity: Opportunity, projects: ProjectProfile[]): Promise<ApplicationPack> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: buildAgentPrompt(opportunity, projects),
      config: {
        responseMimeType: "application/json",
        temperature: 0.15,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty application pack");
    return applicationPackSchema.parse(JSON.parse(text));
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

