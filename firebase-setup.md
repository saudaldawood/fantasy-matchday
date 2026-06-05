# Firebase Functions Setup Guide

## Prerequisites
- Firebase CLI installed globally
- Firebase project created

## Installation Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Functions
```bash
firebase init functions
```

**Select options:**
- Language: **TypeScript**
- ESLint: **Yes**
- Install dependencies: **Yes**

### 4. Install Additional Dependencies
```bash
cd functions
npm install axios stripe
npm install --save-dev @types/node
cd ..
```

### 5. Configure Environment Variables
```bash
# Set API-Football key
firebase functions:config:set api.football_key="e582ab92f4740ba22f4659d138fcca74"

# Set Stripe keys (get from Stripe dashboard)
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
firebase functions:config:set stripe.webhook_secret="YOUR_WEBHOOK_SECRET"
```

### 6. Deploy Firestore Rules & Indexes
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 7. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

## Verification

### Check deployed functions:
```bash
firebase functions:list
```

### View function logs:
```bash
firebase functions:log
```

### Test a specific function:
```bash
firebase functions:log --only syncMatches
```

## Local Testing

### Run functions locally:
```bash
cd functions
npm run serve
```

### Run emulator suite:
```bash
firebase emulators:start
```

## Firebase Project Configuration

Make sure your `.firebaserc` file contains:
```json
{
  "projects": {
    "default": "matchday-e447b"
  }
}
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `api.football_key` | API-Football API key | `e582ab92f4740ba22f4659d138fcca74` |
| `stripe.secret_key` | Stripe secret key | `sk_test_...` |
| `stripe.webhook_secret` | Stripe webhook secret | `whsec_...` |

## Troubleshooting

### Function deployment fails:
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest
```

### Permission errors:
```bash
# Re-authenticate
firebase login --reauth
```

### Environment config not working:
```bash
# View current config
firebase functions:config:get

# Delete a config
firebase functions:config:unset api.football_key
```

## Next Steps

After setup:
1. ✅ Deploy security rules
2. ✅ Deploy indexes
3. ✅ Set environment variables
4. ✅ Deploy functions
5. ✅ Test match syncing
6. ✅ Verify points calculation
