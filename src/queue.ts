import { CloudTasksClient } from "@google-cloud/tasks";

export interface RunQueue { enqueue(runId: string): Promise<void>; }

export class CloudRunTaskQueue implements RunQueue {
  private readonly client = new CloudTasksClient();
  async enqueue(runId: string): Promise<void> {
    const project = requiredEnv("GOOGLE_CLOUD_PROJECT");
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
    const queue = process.env.TASK_QUEUE ?? "prizepilot-runs";
    const serviceUrl = requiredEnv("TASK_SERVICE_URL");
    const parent = this.client.queuePath(project, location, queue);
    await this.client.createTask({
      parent,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: `${serviceUrl}/internal/runs/${encodeURIComponent(runId)}/evaluate`,
          headers: { "Content-Type": "application/json" },
          body: Buffer.from("{}").toString("base64"),
        },
      },
    });
  }
}

export class ImmediateQueue implements RunQueue {
  constructor(private readonly work: (runId: string) => Promise<void>) {}
  async enqueue(runId: string): Promise<void> { setImmediate(() => void this.work(runId)); }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

