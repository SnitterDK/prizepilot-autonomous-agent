import { FixtureApplicationAgent } from "./fixture-agent.js";
import { ImmediateQueue } from "./queue.js";
import { MemoryRunRepository } from "./repository.js";
import { PrizePilotService } from "./service.js";
import sample from "../public/sample.json" with { type: "json" };

const repository = new MemoryRunRepository();
const service = new PrizePilotService(repository, new FixtureApplicationAgent());
service.setQueue(new ImmediateQueue(id => service.evaluate(id)));
const run = await service.createRun(sample.opportunity, sample.projects);
await new Promise(resolve => setTimeout(resolve, 25));
console.log(JSON.stringify(await service.getRun(run.id), null, 2));

