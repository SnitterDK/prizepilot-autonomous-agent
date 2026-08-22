import express from "express";
import { createRunSchema } from "./schema.js";
import { GeminiApplicationAgent } from "./agent.js";
import { FixtureApplicationAgent } from "./fixture-agent.js";
import { CloudRunTaskQueue, ImmediateQueue } from "./queue.js";
import { FirestoreRunRepository, MemoryRunRepository } from "./repository.js";
import { PrizePilotService } from "./service.js";

const local = process.env.LOCAL_DEMO === "1";
const repository = local ? new MemoryRunRepository() : new FirestoreRunRepository();
const agent = local ? new FixtureApplicationAgent() : new GeminiApplicationAgent();
const service = new PrizePilotService(repository, agent);
service.setQueue(local ? new ImmediateQueue(id => service.evaluate(id)) : new CloudRunTaskQueue());

const app = express();
app.use(express.json({ limit: "512kb" }));
app.use(express.static("public"));

app.get("/healthz", (_request, response) => response.json({ ok: true, mode: local ? "fixture" : "vertex-ai" }));

app.post("/api/runs", async (request, response, next) => {
  try {
    const input = createRunSchema.parse(request.body);
    const run = await service.createRun(input.opportunity, input.projects);
    response.status(202).json({ id: run.id, status: run.status });
  } catch (error) { next(error); }
});

app.get("/api/runs/:id", async (request, response, next) => {
  try { response.json(await service.getRun(request.params.id)); }
  catch (error) { next(error); }
});

app.post("/internal/runs/:id/evaluate", async (request, response, next) => {
  try { await service.evaluate(request.params.id); response.status(204).end(); }
  catch (error) { next(error); }
});

app.post("/api/runs/:id/approve", async (request, response, next) => {
  try {
    if (request.body?.confirmed !== true) return response.status(400).json({ error: "Explicit confirmed=true is required" });
    response.json(await service.approve(request.params.id));
  } catch (error) { next(error); }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  response.status(message === "Run not found" ? 404 : 400).json({ error: message });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`PrizePilot agent listening on ${port} (${local ? "fixture" : "vertex-ai"})`));

