# Local Development Setup

## Prerequisites

- Node.js 20 recommended
- npm
- Firebase CLI for deployment and emulators
- Access to the Firebase project
- Access to required API keys for local development

## Frontend Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs locally through Next.js.

## Cloud Functions Setup

```bash
cd functions
npm install
npm run build
```

Use Firebase CLI commands for functions emulation and deployment after credentials are configured.

## Do Not Commit

- `.env.local`
- `functions/.runtimeconfig.json`
- `node_modules`
- `.next`
- `out`
- Firebase service account files
- private API/payment secrets
