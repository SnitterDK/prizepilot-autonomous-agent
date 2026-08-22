import { Firestore } from "@google-cloud/firestore";
import type { RunRecord } from "./types.js";

export interface RunRepository {
  create(run: RunRecord): Promise<void>;
  get(id: string): Promise<RunRecord | null>;
  update(id: string, patch: Partial<RunRecord>): Promise<void>;
}

export class FirestoreRunRepository implements RunRepository {
  private readonly collection;
  constructor() {
    this.collection = new Firestore().collection("prizepilot_runs");
  }
  async create(run: RunRecord): Promise<void> { await this.collection.doc(run.id).create(run); }
  async get(id: string): Promise<RunRecord | null> {
    const snapshot = await this.collection.doc(id).get();
    return snapshot.exists ? snapshot.data() as RunRecord : null;
  }
  async update(id: string, patch: Partial<RunRecord>): Promise<void> { await this.collection.doc(id).update(patch); }
}

export class MemoryRunRepository implements RunRepository {
  private readonly runs = new Map<string, RunRecord>();
  async create(run: RunRecord): Promise<void> { this.runs.set(run.id, structuredClone(run)); }
  async get(id: string): Promise<RunRecord | null> { return structuredClone(this.runs.get(id) ?? null); }
  async update(id: string, patch: Partial<RunRecord>): Promise<void> {
    const current = this.runs.get(id);
    if (!current) throw new Error("Run not found");
    this.runs.set(id, { ...current, ...structuredClone(patch) });
  }
}

