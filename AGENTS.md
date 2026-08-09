# Frontend Agent Instructions

## Repository Scope

This repository contains the frontend application.

## Project Documentation

Repository documentation is available in the `docs/` directory.

Before changing code or configuration:

1. Identify the feature and areas related to the task.
2. Search for and read the relevant documentation in `docs/`. Do not read every document unless the task requires it.
3. Inspect the related implementation, configuration, dependencies, and tests to verify that the documentation still reflects the current codebase.
4. Follow the architecture, patterns, and coding style already used in this repository.
5. Preserve the existing writing and coding style, including whitespace and formatting. Do not reformat or change style unless the task explicitly requests it or the change is required for correctness.
6. Update the relevant documentation when a change affects behavior, API integration, configuration, the build process, or the developer workflow.

Review the relevant documentation before modifying components, routing, state management, API integration, build configuration, or the developer workflow.

Use four spaces for every indentation level in all Vue and JavaScript source,
including Vue `<template>`, `<script>`, and `<style>` blocks and repository-level
JavaScript configuration. Keep indentation consistent throughout each file and
do not mix tabs, two-space indentation, and four-space indentation. Treat the
repository Prettier and EditorConfig configuration as authoritative.

When adding, removing, renumbering, or otherwise changing checklist rows in
`docs/qa/`, review the complete checklist and reorder its IDs numerically before
finishing. Preserve meaningful section headings, but ensure the row sequence
across the document does not leave lower-numbered IDs after higher-numbered IDs.

## Related Repositories

The project may include separate backend and deployment repositories. If a task affects another repository and that repository is available in the workspace, inspect its code and documentation as well. Do not assume that related repositories are always available or located at a specific path.

## Task Branch And Release Safety

Every frontend implementation change must be associated with a clear Jira task
and a branch that follows the shared release flow in
`../deploy/docs/release-flow.md`.

- Before editing code, verify the Jira work type, responsible initials, issue
  key, and expected branch name.
- If any of those details are unclear, stop before editing, creating a branch,
  committing, pushing, or opening a pull request. Tell the user the expected
  branch format and ask for the missing Jira information.
- Never invent a Jira issue key or work-specific branch name.
- Do not implement application work directly on `main` or `staging`.
- Create a new task branch from the latest `main`, after checking local and
  remote branches for an existing branch for the same Jira task.
- The main task branch must exist and be checked out before the first code
  change. Verify the active branch before implementation and after every
  branch switch.
- If the active branch is `main`, `staging`, or unrelated to the Jira task,
  stop and create or check out the correct task branch before editing code.
- Use the main task branch as the production source. Use the matching
  `*-staging` branch only to integrate with `staging`.
- Never merge `staging` or a `*-staging` task branch into `main`, and never
  merge a regular task branch directly into `staging`.

## Code Documentation and Comments

Every existing, added, or changed named function and method must have a JSDoc block that explains its purpose and contract. This requirement applies to Vue lifecycle hooks, data factories, computed properties, watchers, getters and setters, Vue script methods, composables, store actions, API services, helpers, exported functions, and named event handlers.

Write JSDoc, `step start/end` descriptions, and contextual source-code comments in clear Indonesian. English technical terms may remain when they are established project or framework terminology, but the explanatory sentence itself must use Indonesian. Commit messages remain in English as defined by the Git workflow below.

Documentation must be proportional to the function's complexity and, when relevant, explain:

- the data and context being processed
- parameters and returned values
- important state changes or side effects
- business rules, invariants, constraints, and edge cases
- relationships with API contracts, Vue state, routing, or other application flows

Do not use comments that merely restate the function name or translate the syntax. Anonymous functions, closures, arrow callbacks, and simple framework callbacks do not require JSDoc unless they contain important behavior or a non-obvious contract.

Keep documentation synchronized with the implementation whenever parameters, return values, behavior, side effects, or responsibilities change. Preserve existing comments that remain accurate and update or remove comments that have become stale.

### Multi-step Logic

Named functions with multiple distinct stages must use paired `step start/end` comments inside JavaScript logic. Number steps consistently and describe the responsibility of each stage in concise, specific Indonesian so the format and language remain aligned with the backend repository.

```javascript
/**
 * Memvalidasi state checkout dan mengirim pesanan yang telah dikonfirmasi.
 *
 * @returns {Promise<void>} Promise diselesaikan setelah response checkout diproses.
 */
const submitCheckout = async () => {
    // --- step 1 - start - validasi state checkout saat ini
    // ...
    // --- step 1 - end - validasi state checkout saat ini

    // --- step 2 - start - kirim dan proses request checkout
    // ...
    // --- step 2 - end - kirim dan proses request checkout
};
```

Use this format in `<script>` blocks and JavaScript modules only. Do not add `step start/end` comments to Vue templates or markup. Do not force step comments into a simple function that has no meaningful internal stages.

Add contextual comments when they clarify why logic exists, how state synchronization works, which regression is being prevented, or why an implementation choice is required. Avoid comments on every line and prefer comments that explain intent rather than mechanics.

## Git and Commit Workflow

Before proposing or creating a commit:

1. Confirm that Git operations are being performed in this repository.
2. Inspect `git status` and use the staged diff as the primary source when files are staged. Review `git diff --cached --stat` and `git diff --cached`, not only the changed file names.
3. If nothing is staged and the requested scope is the working tree, inspect the explicitly scoped actual diff and relevant untracked content. State when the prospective commit scope cannot yet be determined precisely.
4. Understand the user-visible behavior, Vue state changes, API integration, build impact, browser behavior, documentation, and validation represented by that diff.
5. Keep unrelated changes out of the commit and never include changes from another repository. Recommend splitting the scope when the diff contains independently reviewable purposes.
6. Do not switch branches, create branches, commit, push, or open a pull request unless the user explicitly requests that action.

When staging a commit, add only the explicitly reviewed files with exact paths.
Use `git add -- <file>` for each intended file, or list several exact paths in
one command. Never use `git add -A`, `git add .`, `git add --all`, or broad
globs. After staging, inspect `git diff --cached --name-status`,
`git diff --cached --stat`, and `git diff --cached` so the approval clearly
shows which files will be committed.

### Commit Scope and Atomicity

A branch does not define a single commit scope. If a branch or working tree contains changes for multiple tasks, tickets, or independently reviewable purposes, inspect and stage each scope separately and generate one commit message from that scope's staged diff. Changes for one task must not absorb an unrelated feature, fix, refactor, configuration update, test, or documentation change merely because they exist on the same branch.

A detailed commit message is not a substitute for an atomic commit. Recommend separate commits when the available changes do not form one cohesive purpose. Keep changes together only when they implement one inseparable behavior or when splitting them would create an invalid or materially misleading intermediate state; describe that dependency when it is not obvious.

The commit message must describe only content included in its verified scope. Exclude unstaged changes outside that scope, changes from another repository, unfinished implementation, future plans, and claims inferred only from task names, documentation, or earlier conversation.

Use English with correct grammar for commit messages. Follow the Conventional Commits style already used by this repository, including an appropriate type and scope when applicable. Inspect recent Git history when the established type, scope, or wording convention is unclear.

The summary must describe the actual high-level behavior change and remain specific enough for code review, Git history, debugging, and revert operations. Choose the type and scope from the purpose of the change rather than a directory name. Do not derive the summary only from file names, branch names, task labels, or earlier conversation.

Use imperative mood for the summary when it matches the repository convention. For a complex change, follow the summary with a concise context or motivation paragraph that explains the problem, purpose, or high-level approach without repeating the summary.

Match commit-message detail to the staged scope:

- A small, single-purpose change may use only a precise summary.
- A medium change should normally include a short context paragraph and the main related behaviors.
- A complex or cross-cutting change must include a summary, concise context, and a body grouped by behavior or subsystem. Represent every major area included in the commit instead of compressing several UI, state, integration, or configuration changes into a generic bullet.

For complex frontend commits, group details using headings derived from the actual diff, such as UI behavior, state management, API integration, browser recovery, build configuration, compatibility, or documentation. Explain state transitions, loading and error recovery, routing effects, request or response contract dependencies, responsive/browser behavior, and build-time variables when relevant. Group by behavior rather than listing every component, method, or file.

Mention a file name only when its identity has operational or reviewer significance, such as a specific build configuration, workflow, environment template, or generated contract. Never include secret or credential values in a commit message.

### Commit Message Structure

Use this structure as an adaptive framework for medium and complex commits:

```text
<type>(<scope>): <summary>

<optional context or motivation paragraph>

<frontend behavior or subsystem group>:
- <major behavior change>
- <major behavior change>

<another relevant behavior or subsystem group>:
- <major behavior change>

<optional technical or impact sections>

Validation:
- <actual automated test or manual verification>

Limitations:
- <verified limitation or unvalidated area>

<optional breaking-change and issue footers>

<optional attribution trailers>
```

Do not apply this framework rigidly. Omit empty or irrelevant sections, derive group names from the actual diff, and allow a small single-purpose commit to contain only a precise summary.

Use conditional sections such as `Technical details:`, `API:`, `Configuration:`, `Deployment:`, `Compatibility:`, `Security:`, `Documentation:`, `Validation:`, and `Limitations:` only when the staged change supports them. Do not add empty or ceremonial sections. Include a limitation when an important browser path, external service, credential-dependent flow, or manual scenario remains unverified.

Add a `Validation:` section only when the listed checks were actually executed. State the exact relevant commands or checks, do not claim that a full suite passed when only part of it ran, and report limitations honestly.

Distinguish automated tests from manual browser verification. Do not present a failed command, an unavailable check, or an inferred result as successful validation. Add `Limitations:` when an important browser path, external service, credential-dependent flow, environment, risk, assumption, or intentionally excluded scope remains unverified; do not add the section ceremonially.

Use a `BREAKING CHANGE:` footer only when the commit introduces a genuinely non-backward-compatible contract or behavior. Explain the previous contract, the new contract, and any action consumers must take; do not use the footer merely to emphasize a large change.

Add exactly one Codex co-author trailer only when Codex materially analyzed, wrote, or changed content included in the commit. Do not add it merely because Codex generated or refined the commit message. When the active model and reasoning effort are verified by authoritative session metadata, use `Co-authored-by: Codex (<model>, <reasoning effort>) <noreply@openai.com>`; when only the model is verified, omit the reasoning effort. Never infer or guess either value. If the metadata is unavailable or ambiguous, use `Co-authored-by: Codex <noreply@openai.com>`.

Preserve other valid trailers and do not add a duplicate Codex trailer. Separate trailers from preceding content with a blank line, do not format them as bullets, and place the Codex trailer at the end of the commit message after the body, conditional sections, `BREAKING CHANGE:` footer, and issue references.

Before presenting or creating the commit message, verify that the repository and staged scope are correct, every major UI or subsystem behavior in scope is represented, each claim is supported by the diff or executed validation, English grammar is sound, no empty section remains, relevant limitations are disclosed, and footers and trailers are correctly ordered.

For multi-line commit messages, use real newline characters. Do not place literal `\n` sequences inside `git commit -m` arguments. Prefer `git commit -F -` with a heredoc or another method that preserves the intended line breaks.

Hard-wrap commit-message prose at 72 characters per line. Keep the subject at
72 characters or fewer. Do not wrap commands, URLs, paths, hashes, code
identifiers, or trailers because their exact text must remain easy to copy.

After creating a commit, run:

```bash
git log -1 --format=full
```

Verify that the commit is in the correct repository, the summary and body are accurate, sections and bullet points have the intended line breaks, no literal `\n` text was stored, and validation claims match checks that were actually run. If the message is malformed and the commit has not been pushed, correct it when doing so is safe.

## GitHub Tool Selection

Before performing any GitHub operation, identify the repository and whether the
requested operation concerns a pull request or GitHub Actions. Tool selection is
mandatory and must follow the rules below; do not choose a different tool merely
because it is available.

### GitHub Pull Requests

When the user asks to inspect, create, open, update, review, merge, or otherwise
operate a pull request, use the GitHub API through the connected GitHub
integration only. Do not use `gh`, Chrome, browser automation, or the GitHub web
UI for frontend pull request operations.

If the connected GitHub integration is unavailable, stop and report the
limitation. Use another tool only when the user explicitly authorizes that
fallback.

### GitHub Actions

When the user explicitly asks to inspect, run, dispatch, monitor, rerun, or
otherwise operate a GitHub Actions workflow, use the GitHub CLI (`gh`) only. Do
not use the connected GitHub integration, Chrome, browser automation, or the
GitHub web UI for frontend GitHub Actions operations unless the user explicitly
requests browser-based work.

Before an Actions operation that changes remote state, verify that `gh` is
authenticated with the correct GitHub account and has the required repository
and workflow permissions. If `gh` is unavailable or authentication fails, stop
and report the limitation; do not silently switch to another tool.
