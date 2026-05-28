# Frontend Structure

Owner / Domain: Khalid Aleissa - Frontend/UI

This document describes the frontend/UI baseline migrated from the existing local Fantasy Matchday project into the formal team repository. It documents the current page structure and integration points without claiming the files were newly authored in this branch.

## Main Routes And Pages

The frontend uses the Next.js App Router with locale-scoped routes under `src/app/[locale]`.

- `src/app/[locale]/page.tsx` is the home page. It composes the landing sections and match previews.
- `src/app/[locale]/matches/page.tsx` lists live and upcoming matches with filters.
- `src/app/[locale]/matches/[matchId]/page.tsx` shows match details, live status, events, user lineup status, and a match leaderboard panel.
- `src/app/[locale]/lineup/page.tsx` lets users select a match, draft players, choose a captain, save a draft, submit a lineup, and view submitted lineup state.
- `src/app/[locale]/players/page.tsx` is the player discovery/statistics entry point.
- `src/app/[locale]/profile/page.tsx` shows user profile details, account stats, editable profile fields, and quick links.
- `src/app/[locale]/help/page.tsx` provides support and FAQ-style help content.
- `src/app/[locale]/contact/page.tsx`, `privacy/page.tsx`, and `terms/page.tsx` provide static informational pages.
- `src/app/[locale]/layout.tsx` wraps localized pages with the shared navbar, footer, auth provider, and `next-intl` client provider.

The copied navigation also references additional UI entry points that were visible in the existing frontend, including `/leaderboard`, `/credits`, `/achievements`, `/friends`, `/login`, and `/register`. Those route implementations are outside this frontend baseline copy unless separately added by their owning domain.

## Reusable Component Structure

Reusable components are split into two main groups under `src/components`.

- `src/components/ui` contains general UI building blocks such as `Button`, `Card`, `Input`, `Navbar`, `Footer`, `LanguageSwitcher`, and `LoadingSkeleton`.
- `src/components/features` contains product-specific UI sections and widgets such as `Hero`, `GameChanger`, `WhyChoose`, `AmazingPrizes`, `ReadyToWin`, `MatchCard`, `LeaderboardTable`, `DraggableLineup`, `ProfileDashboard`, `NotificationCenter`, `PaymentModal`, and `LevelDisplay`.

The home page composes feature sections including `Hero`, `GameChanger`, `WhyChoose`, `AmazingPrizes`, `ReadyToWin`, and `MatchCard`. Shared layout elements come from `Navbar` and `Footer`.

## CSS Modules

Styling is organized with CSS Modules beside the component or page that owns the styles.

- Route-level styles use files such as `page.module.css`, `profile.module.css`, `players.module.css`, and `help.module.css`.
- Component-level styles use files such as `Navbar.module.css`, `Button.module.css`, `Hero.module.css`, and `DraggableLineup.module.css`.
- Global variables, base styles, and shared design tokens live in `src/app/globals.css`.

This keeps page-specific layout rules close to each route while preserving reusable component styles inside each component folder.

## Internationalization

Internationalization is based on `next-intl`.

- Localized routes are scoped under `src/app/[locale]`.
- Supported locales are defined in `src/navigation.ts` with `en` and `ar`; `en` is the default locale.
- `src/i18n.ts` loads messages from `messages/{locale}.json` for each request.
- `src/middleware.ts` applies locale routing behavior.
- UI components and pages use `useTranslations` or `getTranslations` to read localized labels.
- `LanguageSwitcher` uses the shared localized navigation helpers from `src/navigation.ts`.

The copied message catalogs are `messages/en.json` and `messages/ar.json`.

## Service Function Calls

Frontend pages and hooks call service-layer functions through imports such as `@/services/api-football`, `@/services/players`, `@/services/lineups`, `@/services/auth`, `@/services/credits`, `@/services/notifications`, and `@/services/profile-stats`.

Examples:

- The home page and matches page read match data through API football query helpers.
- The match details page subscribes to match, event, lineup, and leaderboard data.
- The lineup page calls player, fixture, lineup, validation, and credit/power-up functions.
- The profile page reads auth state and updates profile fields through auth/profile services.
- Shared components such as `Navbar`, `NotificationCenter`, `PaymentModal`, `LevelDisplay`, and `ProfileDashboard` call auth, notification, payment, level, and profile-stat services.

Those service/provider/type modules were not included in this frontend/UI copy because this PR is scoped to Khalid Aleissa's frontend baseline files. Backend, Firebase runtime configuration, and cloud-function code remain outside this role-based baseline.

## Important UI Flows

Home page:
The localized root page presents the main marketing/product sections, shows live or upcoming match cards, and links users toward matches, lineup creation, auth pages, and other gameplay entry points.

Matches page:
Users can switch between all, live, and upcoming matches. The page supports date and team filters, then links each match card to `/matches/[matchId]`.

Match details page:
Users can inspect match teams, score/status, event feed, their submitted lineup state, and a match leaderboard. Upcoming matches link into `/lineup` with match and team query parameters.

Lineup page:
Users can select a match, load available players, choose a limited lineup, assign a captain, save a draft, submit the lineup, and return to leaderboard-style competition flows after submission.

Leaderboard entry points:
The global navbar links to `/leaderboard`. Match details also show match-specific leaderboard data. `LeaderboardTable` is available as a reusable feature component.

Profile page:
Authenticated users can view stats, credits, level details, quick actions, and editable profile fields. Quick links point to lineup, leagues, credits, transactions, and players.

Auth page links:
The navbar links unauthenticated users to `/login` and `/register`. Protected flows such as profile and lineup redirect or rely on auth state through `useAuth`.

## Known Frontend Follow-Up Improvements

- Add the missing service/provider/type modules or coordinate with the relevant owners so copied UI routes compile in the formal repository.
- Add or confirm route implementations for navbar links that are visible but not part of this scoped copy, such as leaderboard, credits, achievements, friends, leagues, transactions, login, and register.
- Replace remaining hard-coded English UI strings with `next-intl` message keys.
- Review emoji-based status icons and replace with consistent icon components where appropriate.
- Add focused UI tests for route rendering, locale switching, match filtering, lineup validation states, and profile edit flows.
- Confirm Firebase messaging service worker configuration injection in the deployment environment before enabling push notifications.
