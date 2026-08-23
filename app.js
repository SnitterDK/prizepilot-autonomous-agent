const runButton = document.querySelector("#run");
const result = document.querySelector("#result");
const mode = document.querySelector("#mode");
const steps = [...document.querySelectorAll(".step")];

const apiBase = location.hostname.endsWith("github.io") ? null : "";
const health = apiBase === null
  ? { mode: "static-fixture" }
  : await fetch("/healthz").then(r => r.json()).catch(() => ({ mode: "static-fixture" }));
mode.textContent = health.mode === "vertex-ai"
  ? "Vertex AI + Cloud Tasks + Firestore"
  : "Safe fixture mode — no external action";

runButton.addEventListener("click", async () => {
  runButton.disabled = true;
  setStep(1);
  result.className = "result";
  result.innerHTML = "<h2>Application pack</h2><p>Queued…</p>";
  if (apiBase === null || health.mode === "static-fixture") {
    await new Promise(resolve => setTimeout(resolve, 450));
    setStep(2);
    await new Promise(resolve => setTimeout(resolve, 450));
    setStep(3);
    render({ status: "review_required", pack: fixturePack });
    runButton.disabled = false;
    return;
  }
  const sample = await fetch("/sample.json").then(r => r.json());
  const created = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sample) }).then(r => r.json());
  setStep(2);
  const run = await poll(created.id);
  setStep(3);
  render(run);
  runButton.disabled = false;
});

async function poll(id) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const run = await fetch(`/api/runs/${id}`).then(r => r.json());
    if (["review_required", "approved", "failed"].includes(run.status)) return run;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("Evaluation timed out");
}

function setStep(index) { steps.forEach((step, i) => step.classList.toggle("active", i <= index)); }

function render(run) {
  if (run.status === "failed") return result.innerHTML = `<h2>Evaluation failed</h2><p>${escapeHtml(run.error)}</p>`;
  const pack = run.pack;
  result.innerHTML = `
    <div class="score"><span>${pack.fitScore}</span><small>fit / 100</small></div>
    <div><p class="eyebrow">${escapeHtml(pack.eligibility.replace("_", " "))}</p><h2>${escapeHtml(pack.elevatorPitch)}</h2></div>
    <article><h3>Why this result</h3><ul>${pack.eligibilityReasons.map(li).join("")}</ul></article>
    <article><h3>Missing evidence</h3><ul>${pack.missingEvidence.map(li).join("") || "<li>None</li>"}</ul></article>
    <article><h3>Human actions</h3><ul>${pack.requiredHumanActions.map(li).join("") || "<li>None</li>"}</ul></article>`;
}

function li(value) { return `<li>${escapeHtml(value)}</li>`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[c]); }

const fixturePack = {
  fitScore: 72,
  eligibility: "needs_review",
  elevatorPitch: "A truthful application draft with every unsupported claim exposed before approval.",
  eligibilityReasons: [
    "The project aligns with agentic productivity workflows.",
    "Contest-period implementation is disclosed separately from the earlier tracker concept.",
  ],
  missingEvidence: [
    "Live Vertex AI, Cloud Tasks and Firestore deployment evidence.",
    "Public demo video showing the Google Cloud backend.",
  ],
  requiredHumanActions: [
    "Review eligibility and accept the official rules before submission.",
  ],
};
