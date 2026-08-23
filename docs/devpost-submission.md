# Devpost submission draft

## Project name

PrizePilot Autonomous Application Agent

## Elevator pitch

An evidence-bound Gemini agent that asynchronously matches real projects to opportunities, drafts review-ready application packs, and exposes every blocker before human approval.

## Category

Taskmaster

## About the project

### Inspiration

Founders repeatedly enter the same verified facts into funding and hackathon forms. Applying broadly is useful, but speed creates a dangerous failure mode: uncertainty can quietly become an unsupported claim. PrizePilot automates the reusable work while keeping eligibility, legal attestations, spending, travel, and final submission under human control.

### What it does

PrizePilot accepts one opportunity and a portfolio of real projects, queues an asynchronous evaluation, and asks Gemini to select the strongest truthful match. It returns a structured application pack with a fit score, eligibility assessment, evidence pointers, missing proof, and required human actions. A strict policy blocks approval until the opportunity is eligible and both blocker lists are empty. Approval only changes PrizePilot state; it never transmits a third-party application.

### How we built it

The TypeScript service uses the Google GenAI SDK with Gemini 3.5 on Vertex AI. Cloud Tasks provides durable asynchronous work, Firestore stores the full run ledger, and Cloud Run hosts the API, worker endpoint, and review UI. Zod validates the model output and the service state machine. The public static demo is intentionally labelled as fixture mode; it demonstrates the contract without pretending that a cloud run occurred.

### Challenges

The core challenge was making autonomy useful without hiding uncertainty. We separated drafting from approval, required evidence for capabilities, kept legal attestations as explicit human actions, and made missing proof a first-class result instead of something the model could smooth over. We also disclosed that the earlier PrizePilot tracker concept pre-dates the contest: this repository and its autonomous Google runtime are new contest-period work, and no old source code was copied.

### Accomplishments

- A real asynchronous agent lifecycle with queued, running, review-required, approved, and failed states.
- An evidence contract that prevents unsupported claims from reaching approval.
- A transparent static fixture demo plus a separate competition-valid Google runtime.
- Four automated policy and workflow tests.
- Reproducible Cloud Run, Cloud Tasks, Firestore, and Vertex AI deployment instructions.

### What we learned

Reliable agents need an explicit authority boundary, durable state, observable evidence, and deterministic blockers. A high-quality draft is not the same as permission to submit it.

### What's next

After the contest deployment is verified, the next step is reusable organization profiles, source-level evidence verification, and connectors that prepare third-party drafts while preserving the same human approval boundary.

## Built with

Gemini 3.5, Google GenAI SDK, Vertex AI, Cloud Run, Cloud Tasks, Firestore, TypeScript, Node.js, Express, Zod, Docker

## Links

- Source: https://github.com/SnitterDK/prizepilot-autonomous-agent
- Static review demo: https://snitterdk.github.io/prizepilot-autonomous-agent/
- Architecture: https://github.com/SnitterDK/prizepilot-autonomous-agent/blob/main/docs/architecture.svg

## Still required before final submission

- Verified live Google Cloud deployment URL and run evidence.
- Public demo video showing the Google Cloud backend.
- Final review and acceptance of the official rules and Devpost terms by Kasper Mathiesen.
