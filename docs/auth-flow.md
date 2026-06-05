# Firebase Auth Flow

Owner: Fahad Alhomaidhi - Authentication, database, and security.

This baseline consolidates the existing local Firebase Auth, Firestore user profile, Firebase config, and protected route data flow into the formal team repository. It is a role-based migration of existing work, not a claim that the code was newly written from scratch in this branch.

## Firebase Auth setup

Firebase is initialized in `src/lib/firebase.ts`. The app reads browser-safe Firebase client configuration from environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

The module exports `auth`, `db`, `storage`, and `functions` so the rest of the app uses one shared Firebase app instance. `src/lib/firebase/config.ts` is kept for compatibility and also reads from the same `NEXT_PUBLIC_FIREBASE_*` values.

Firebase browser config can appear in client code, but private server secrets, service account files, runtime config, and real `.env` files must not be committed.

## Registration

Email/password registration is implemented in `src/services/auth.ts` through `registerWithEmail(email, password, displayName)`.

The flow is:

1. Create the Firebase Auth user with `createUserWithEmailAndPassword`.
2. Update the Firebase Auth display name with `updateProfile`.
3. Create the matching Firestore profile at `users/{uid}`.

The Firestore user profile is initialized with identity fields, notification settings, gameplay stats, credit balance, level state, login timestamps, and account status.

Initial profile fields include:

- `id`
- `email`
- `displayName`
- `language`
- `notificationSettings`
- `totalPoints`
- `matchesPlayed`
- `averagePointsPerMatch`
- `bestMatchScore`
- `worstMatchScore`
- `credits`
- `isPremium`
- `level`
- `achievements`
- `badges`
- `loginStreak`
- `lastLoginDate`
- `friends`
- `leagues`
- `createdAt`
- `updatedAt`
- `lastActiveAt`
- `isActive`
- `isBanned`

## Email/password login

Email/password login is handled by `signInWithEmail(email, password)` in `src/services/auth.ts`.

The flow is:

1. Sign in through Firebase Auth with `signInWithEmailAndPassword`.
2. Update the Firestore profile login activity fields with `serverTimestamp()`.
3. Let `AuthProvider` receive the new Firebase user from `onAuthStateChanged`.
4. Load the matching `users/{uid}` profile for app state.

## Google login

Google login is handled by `signInWithGoogle()`.

The service creates a `GoogleAuthProvider` and asks Google to show account selection. On desktop it uses `signInWithPopup`. On mobile it uses `signInWithRedirect` because popup blockers and mobile browser constraints are common.

After a Google sign-in completes, the app checks whether `users/{uid}` exists. If it does not exist, the service creates the Firestore profile using the Google display name when available. If the profile already exists, the service updates the last login activity fields.

## Mobile redirect handling

Mobile Google sign-in redirects away from the current page. The app completes that flow with `handleGoogleRedirectResult()` in `src/services/auth.ts`.

That function calls `getRedirectResult(auth)`, then creates a missing Firestore user profile or updates login timestamps for an existing profile.

## Logout

Logout is handled by `signOut()` in `src/services/auth.ts`, which calls Firebase Auth `signOut`. Once Firebase clears the session, `AuthProvider` receives `null` from `onAuthStateChanged` and clears the local user profile state.

## Password reset

Password reset is handled by `resetPassword(email)`, which calls Firebase Auth `sendPasswordResetEmail`. The reset page under `src/app/[locale]/reset-password/` provides the user-facing flow.

## Firebase Auth user vs Firestore profile

The Firebase Auth user is the source of authentication identity. It contains data such as:

- `uid`
- `email`
- provider information
- Firebase session state
- display name from Auth

The Firestore profile at `users/{uid}` is the app-specific user record. It contains gameplay, account, preference, and authorization fields such as:

- points and match stats
- credits
- premium state
- admin flag
- notification settings
- language
- bans and account status
- achievements and badges
- league and friend references

The app should treat Firebase Auth as proof of who the user is, and `users/{uid}` as the app profile that explains what the user can see and do.

## AuthProvider

`src/providers/AuthProvider.tsx` wraps the app with shared auth state.

It exposes:

- `user`: the Firebase Auth user or `null`
- `profile`: the Firestore `UserProfile` or `null`
- `loading`: whether the initial auth/profile check is still running
- `error`: profile loading errors
- `refreshProfile()`: manual profile reload

`AuthProvider` listens to Firebase Auth with `onAuthStateChanged(auth, callback)`. When a Firebase user exists, it calls `getUserProfile(firebaseUser.uid)` and stores the result in React state. When there is no Firebase user, it clears the profile.

`src/hooks/useAuth.tsx` and the provider export make that state available to protected UI and route components.

## Protected and admin areas

Protected areas use the current Firebase user and Firestore profile to decide whether the user can continue. Admin pages under `src/app/[locale]/admin/` are shared with frontend ownership because they include UI, but they are part of this auth/database/security baseline because they rely on Firebase Auth, Firestore admin checks, and protected data access.

Admin access is also protected at the Firestore rules layer. `firestore.rules` defines `isAdmin()` by reading `users/{request.auth.uid}.isAdmin == true`.

Users cannot directly edit protected fields such as `credits`, `totalPoints`, `isPremium`, or `isAdmin` in their own profile. Firestore rules reject owner updates that change those fields. Those values should be changed only through trusted server/admin flows.

## Shared ownership

These files overlap with Khalid's frontend/UI ownership because they include pages and styles:

- `src/app/[locale]/(auth)/login/`
- `src/app/[locale]/(auth)/register/`
- `src/app/[locale]/reset-password/`
- `src/app/[locale]/profile/`
- `src/app/[locale]/admin/`

These files overlap with Saud's backend/cloud-function ownership because they depend on trusted writes, admin operations, notifications, and server-controlled fields:

- `src/services/admin.ts`
- `src/services/notifications.ts`
- `src/services/push-notifications.ts`
- `firestore.rules`
- `firestore.indexes.json`

## Ownership checklist

- Can explain Firebase Auth vs Firestore user profile.
- Can explain registration and login flow.
- Can explain how `AuthProvider` works.
- Can explain each major Firestore collection.
- Can explain why users cannot directly edit points, credits, premium, or admin fields.
- Can explain why secrets and runtime config are not committed.
- Can explain which files are shared with frontend/backend owners.
