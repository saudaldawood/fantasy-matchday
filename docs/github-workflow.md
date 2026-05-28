# GitHub Workflow

## Repository Strategy

This repository is the formal team-owned submission repository. Existing local work was consolidated here as a baseline, and all future work should happen through branches, pull requests, reviews, and clear ownership.

## Branch Flow

```text
main
develop
feature/*
fix/*
docs/*
test/*
refactor/*
chore/*
```

## Standard Flow

```bash
git checkout develop
git pull
git checkout -b docs/example-change
```

After making changes:

```bash
git add .
git commit -m "docs(project): describe example change"
git push -u origin docs/example-change
```

Then open a pull request into `develop`.

## Review Guidance

- PRs should be small enough to review.
- Each member should explain their PR and files changed.
- Domain owners should review related changes.
- Use squash merge to keep history readable.

## Committee Explanation

The team can explain the repository this way:

> We created a clean formal submission repository, consolidated the current locally developed project baseline, assigned ownership by technical domain, and continued work through issues, branches, pull requests, reviews, and documentation.
