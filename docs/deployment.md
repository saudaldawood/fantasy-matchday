# Deployment Workflow

The project is designed for Firebase deployment.

## Deployment Targets

- Frontend: Firebase Hosting or Firebase App Hosting
- Backend/server jobs: Firebase Cloud Functions
- Database: Cloud Firestore
- Storage: Firebase Storage
- Authentication: Firebase Authentication

## Relevant Files

- `firebase.json`: Firebase Hosting, Functions, Firestore rules, and indexes configuration.
- `apphosting.yaml`: Firebase App Hosting runtime and environment variable configuration.
- `firestore.indexes.json`: Firestore composite indexes.
- `functions/package.json`: Cloud Functions scripts and runtime dependencies.

## Environment Variables

Local development uses `.env.local`. Production values should be configured in Firebase/App Hosting environment settings and Firebase Functions config/secrets.

Do not commit private API keys, Stripe secrets, service account JSON files, or local runtime config.

## Release Process

1. Merge role-based PRs into `develop`.
2. Run local checks.
3. Open a release PR from `develop` into `main`.
4. Review deployment-related changes.
5. Deploy from the stable branch when the team approves the release.
