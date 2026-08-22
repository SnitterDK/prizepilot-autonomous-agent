import { randomUUID } from "node:crypto";
import { assertApprovalReady } from "./policy.js";
import type { ApplicationAgent } from "./agent.js";
import type { RunQueue } from "./queue.js";
import type { RunRepository } from "./repository.js";
import type { Opportunity, ProjectProfile, RunRecord } from "./types.js";

export class PrizePilotService {
  constructor(
    private readonly repository: RunRepository,
    private readonly agent: ApplicationAgent,
    private queue?: RunQueue,
  ) {}

  setQueue(queue: RunQueue): void { this.queue = queue; }

  async createRun(opportunity: Opportunity, projects: ProjectProfile[]): Promise<RunRecord> {
    if (!this.queue) throw new Error("Queue not configured");
    const now = new Date().toISOString();
    const run: RunRecord = { id: randomUUID(), status: "queued", createdAt: now, updatedAt: now, opportunity, projects };
    await this.repository.create(run);
    await this.queue.enqueue(run.id);
    return run;
  }

  async evaluate(runId: string): Promise<void> {
    const run = await this.requireRun(runId);
    if (run.status !== "queued") return;
    await this.repository.update(runId, { status: "running", updatedAt: new Date().toISOString() });
    try {
      const pack = await this.agent.createPack(run.opportunity, run.projects);
      await this.repository.update(runId, { status: "review_required", pack, updatedAt: new Date().toISOString() });
    } catch (error) {
      await this.repository.update(runId, { status: "failed", error: error instanceof Error ? error.message : String(error), updatedAt: new Date().toISOString() });
      throw error;
    }
  }

  async approve(runId: string): Promise<RunRecord> {
    const run = await this.requireRun(runId);
    if (!run.pack) throw new Error("Application pack is not ready");
    assertApprovalReady(run.pack);
    const approvedAt = new Date().toISOString();
    await this.repository.update(runId, { status: "approved", approvedAt, updatedAt: approvedAt });
    return this.requireRun(runId);
  }

  async getRun(runId: string): Promise<RunRecord> { return this.requireRun(runId); }

  private async requireRun(runId: string): Promise<RunRecord> {
    const run = await this.repository.get(runId);
    if (!run) throw new Error("Run not found");
    return run;
  }
}

