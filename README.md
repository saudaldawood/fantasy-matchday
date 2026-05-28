# Fantasy Matchday

Fantasy Matchday is a live football fantasy and prediction web application built for the capstone project. The application includes match browsing, lineup submission, points calculation, leaderboards, leagues, credits, notifications, authentication, and Firebase deployment.

This repository is the formal team-owned submission repository. The team consolidated existing local project work here so future development can happen through branches, pull requests, review, documentation, and role-based ownership.

## Stack

- Frontend: Next.js 14, React 18, TypeScript
- Styling: CSS Modules and global CSS
- Internationalization: next-intl with English and Arabic messages
- Authentication: Firebase Authentication
- Database: Cloud Firestore
- Storage: Firebase Storage
- Backend jobs and server logic: Firebase Cloud Functions, TypeScript, Node.js 20
- Payments: Stripe
- Football data: API-Football / API-Sports
- Deployment: Firebase Hosting / Firebase App Hosting and Firebase Functions

## Team Ownership

| Member | Primary Area | Secondary Area |
| --- | --- | --- |
| Bakr Jamjoom | Git/project management | Deployment, testing, documentation |
| Khalid Aleissa | Frontend/UI | Assets and design consistency |
| Saud Dawood | Cloud Functions/backend | API integration and function testing |
| Fahad Alhomaidhi | Authentication/database | Firestore rules and security |
| Abdulmohsen Binkhamis | Leaderboard/business logic | Scoring and lineup logic |

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the Firebase/API values.

3. Run the frontend:

```bash
npm run dev
```

4. Install Cloud Functions dependencies when working on backend functions:

```bash
cd functions
npm install
npm run build
```

## Git Workflow

- `main` is the stable demo/submission branch.
- `develop` is the integration branch.
- All work should happen in role-based branches and pull requests.
- Do not commit secrets, generated builds, `node_modules`, `.next`, `out`, or local runtime config.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/github-workflow.md](docs/github-workflow.md).
