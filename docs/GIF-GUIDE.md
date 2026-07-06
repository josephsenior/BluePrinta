# Blueprinta — Visual Usage Guide

> This guide walks you through Blueprinta's core workflow with step-by-step visuals. Add your own GIFs/screenshots to each section below.

---

## 🎬 How to Record GIFs

Use one of these free tools to record your screen:

- **[ScreenToGif](https://www.screentogif.com/)** (Windows, recommended) — Record, edit, and export as `.gif`
- **[LICEcap](https://www.cockos.com/licecap/)** (Windows/Mac) — Lightweight, captures directly to `.gif`
- **[Kap](https://getkap.co/)** (Mac) — Clean interface, exports to `.gif` or `.mp4`

**Tips for high-quality GIFs:**

- Record at **1280×720** or **1920×1080**, then resize to **800px wide** max
- Keep each GIF under **30 seconds** (shorter = better)
- Use a **dark browser theme** (looks better on GitHub dark mode)
- Add a **1-2 second pause** at the start and end

Save all GIFs to `docs/images/` and reference them as `./images/filename.gif` in this file.

---

## 1. 🏠 Dashboard

> **What to show:** The main dashboard after login, displaying your existing diagrams.

<!-- Replace with your recorded GIF -->
<!-- ![Dashboard Overview](./images/01-dashboard.gif) -->

**What you see:**ards with previously generated

- Each card shows the project title, creation date, and agent count
- Click any card to view its full artifacts

---

## 2. ✨ Creating a New Project

> **What to show:** Clicking "Create", typing a prompt, configuring options, and starting generation.

<!-- Replace with your recorded GIF -->
<!-- ![Creating a Project](./images/02-create-project.gif) -->

**Steps to record:**

1. Click the **"Create"** or **"New Diagram"** button on the dashboard
2. In the prompt field, type something like:
   > "Build a task management app with user authentication, project boards, and real-time notifications"
3. Toggle any options (APIs, database, state management)
4. Click **"Generate"** to start the orchestration

---

## 3. ⚡ Real-Time Generation (SSE Progress)

> **What to show:** The live progress as each agent completes its work.

<!-- Replace with your recorded GIF -->
<!-- ![Generation Progress](./images/03-generation-progress.gif) -->

**What you see:**

- A progress indicator showing which agent is active
- Agents complete in sequence: **PM → Architect → DevOps → Security → UI → Engineer → QA**
- Each step updates in real-time via Server-Sent Events
- Total generation takes ~30-90 seconds depending on complexity

---

## 4. 📊 Viewing Artifacts

> **What to show:** Browsing through the generated artifacts (tabs for PM, Architect, Engineer, etc.)

<!-- Replace with your recorded GIF -->
<!-- ![Viewing Artifacts](./images/04-view-artifacts.gif) -->

**What you see:**

- **Flow Tab** — React Flow visualization of the system architecture
- **Steps Tab** — Orchestration steps with status (completed, pending)
- **Artifacts Tab** — Raw structured output from each agent:
  - **PM** → User stories, acceptance criteria, success metrics
  - **Architect** → API contracts, database schemas, ADRs
  - **DevOps** → CI/CD pipelines, infrastructure-as-code
  - **Security** → Threat model, security controls, OWASP mapping
  - **UI Designer** → Design tokens, component hierarchy
  - **Engineer** → File structure, implementation phases
  - **QA** → Test strategy, test cases, coverage plan

---

## 5. ✏️ Editing Artifacts (Tool-Based Refinement)

> **What to show:** Using the Edit Artifacts API to modify generated output without re-running agents.

<!-- Replace with your recorded GIF or code example -->
<!-- ![Editing Artifacts](./images/05-edit-artifacts.gif) -->

**Example: Add a new API endpoint to the Architect output**

```bash
curl -X POST http://localhost:3000/api/diagrams/artifacts/edit \
  -H "Content-Type: application/json" \
  -d '{
    "diagramId": "your-diagram-id",
    "edits": [
      {
        "op": "add_array_item",
        "path": "arch_design.api_contracts",
        "value": {
          "method": "POST",
          "path": "/api/notifications/subscribe",
          "description": "Subscribe to push notifications"
        }
      }
    ]
  }'
```

---

## 6. 📤 Exporting Documentation

> **What to show:** Exporting the generated artifacts as Markdown, PDF, HTML, or PPTX.

<!-- Replace with your recorded GIF -->
<!-- ![Exporting Docs](./images/06-export.gif) -->

**Export formats:**

| Format | Best For |
|--------|----------|
| **Markdown** | GitHub wikis, developer handoffs |
| **PDF** | Client presentations, stakeholder reviews |
| **HTML** | Hosting on internal docs sites |
| **PPTX** | Executive summaries, sprint planning |

---

## 🎯 Full Workflow (End-to-End)

> **What to show:** The complete flow from prompt → generation → artifacts → export in one continuous GIF (aim for 45-60 seconds).

<!-- Replace with your recorded GIF -->
<!-- ![Full Workflow](./images/07-full-workflow.gif) -->

---

## Adding Your GIFs

1. Record using ScreenToGif or similar tool
2. Save files to `docs/images/` with the naming convention above
3. Uncomment the `![...]()` image lines in this file
4. Commit and push:

```bash
git add docs/images/ docs/GIF-GUIDE.md
git commit -m "docs: add visual usage guide with GIF demos"
git push
```

> **Pro tip:** You can also embed the "Full Workflow" GIF directly in `README.md` below the description for maximum impact on GitHub visitors.
