# LabReport Studio

Act as a senior full-stack engineer. Build a responsive, clean web application titled "Automated Technical Lab Report & Evaluation Workspace".

Design System & Layout:

- Use shadcn/ui components with Tailwind CSS for clean spacing, card borders, and modern typography.

- Use a neutral dark slate / clean modern theme with subtle accents (e.g., emerald for success, rose for errors).

- Implement a two-column desktop layout (responsive single-column on mobile): 

  - Left panel: Multi-field parameter input form with validation.

  - Right panel: Dynamic workspace displaying empty state, processing skeletons, or completed evaluation cards.

Core Features & Views:

1. Input Panel: Fields for Project Title, Target Platform/Architecture, Raw Lab Data/Observations, and Source Code Snippet. Include a "Run Evaluation" button.

2. Execution State: While analyzing, display an animated multi-step progress skeleton (e.g., "Parsing syntax...", "Validating against criteria...", "Compiling summary...").

3. Results Viewer: Render structured results inside tabs:

   - "Executive Summary": Formatted Markdown output with key takeaways.

   - "Metrics Breakdown": A responsive comparison table highlighting test thresholds vs. observed values.

   - "Export": Actions to copy raw Markdown or export as a file.

State & Error Handling:

- Enforce client-side validation (flag empty fields or invalid text limits before triggering runs).

- Provide dismissible toast alerts for validation errors or successful exports.

- Use local mock processing logic with structured JSON data to ensure deterministic UI rendering before wiring external APIs.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://report-eval-forge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e44bcbf8-1d82-4c06-9d2e-4ca9aff221c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
