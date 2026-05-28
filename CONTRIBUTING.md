# Contributing

This repository uses a simple branch and pull request workflow. The goal is to make every future contribution traceable, reviewable, and explainable by the person responsible for that domain.

## Branches

- `main`: stable capstone/demo branch
- `develop`: integration branch
- `chore/*`: setup, consolidation, tooling, configuration
- `docs/*`: documentation
- `feature/*`: new functionality
- `fix/*`: bug fixes
- `refactor/*`: internal cleanup without behavior changes
- `test/*`: tests and verification

Examples:

```text
chore/baseline-repo-setup
chore/baseline-frontend
docs/auth-flow
fix/functions-api-key-error
refactor/frontend-match-card
test/leaderboard-edge-cases
```

## Commits

Use conventional commit style:

```text
chore(repo): initialize formal submission repository
docs(project): add ownership and contribution workflow
chore(baseline): consolidate frontend application files
docs(auth): document firebase auth and firestore data model
fix(functions): handle missing api football key clearly
refactor(frontend): extract match card component
test(leaderboard): add scoring edge case checklist
```

## Pull Requests

Open pull requests into `develop` unless the team is preparing a release from `develop` into `main`.

Each PR should include:

- Summary of changes
- Owner/domain
- Files studied or changed
- How the change was tested
- What the author can now explain
- Screenshots for UI changes

## Review Rules

- At least one teammate should review each PR.
- The domain owner should review changes in their area.
- Bakr reviews workflow, deployment, documentation, and release PRs.
- Do not merge broken builds or unclear changes.
- Prefer squash merge for a readable project history.

## Integrity Rule

Do not fabricate commits, backdate work, or pretend old code was newly written. Baseline work should be described as consolidated local project work. Future work should be documented through real issues, branches, commits, reviews, and PRs.
