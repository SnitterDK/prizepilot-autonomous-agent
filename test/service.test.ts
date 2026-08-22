import assert from "node:assert/strict";
import test from "node:test";
import { FixtureApplicationAgent } from "../src/fixture-agent.js";
import { ImmediateQueue } from "../src/queue.js";
import { MemoryRunRepository } from "../src/repository.js";
import { PrizePilotService } from "../src/service.js";
import sample from "../public/sample.json" with { type: "json" };

test("a queued run becomes review-required without external submission", async () => {
  const repository = new MemoryRunRepository();
  const service = new PrizePilotService(repository, new FixtureApplicationAgent());
  service.setQueue(new ImmediateQueue(id => service.evaluate(id)));
  const created = await service.createRun(sample.opportunity, sample.projects);
  await new Promise(resolve => setTimeout(resolve, 20));
  const finished = await service.getRun(created.id);
  assert.equal(finished.status, "review_required");
  assert.equal(finished.pack?.eligibility, "needs_review");
  await assert.rejects(service.approve(created.id), /Only eligible packs/);
});

