# Pick2Win Admin Project Guide

This is the practical developer guide for running and extending the Pick2Win Admin frontend. For module boundaries and code relationships, see [PROJECT-ARCHITECTURE.md](PROJECT-ARCHITECTURE.md).

## What this project does

Pick2Win Admin is an Angular web app for admin operations. It provides authenticated screens for user records, responsible gaming, compliance, wallet and funds, dashboard, profile, support, football operations, subscriptions, reports, bonuses, and audit logs.

The app is a frontend client. Business data and privileged operations are expected to come from the admin API; the frontend does not replace server authorization or validation.

## Requirements

- Node.js and npm installed.
- Dependencies installed from `package-lock.json`.
- Access to the configured backend API for live data and authentication.

Install dependencies from the project root:

```powershell
npm install
```

## Run locally

Start the Angular development server:

```powershell
npm start
```

Open `http://localhost:4200/`. The root route redirects to the admin dashboard; an unauthenticated session is redirected to login. The development server refreshes the app when source files change.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm start` | Run the local development server. |
| `npm run build` | Compile the application for the configured build target. |
| `npm run watch` | Rebuild when source files change. |
| `npm test` | Run the configured Jasmine/Karma unit tests. |

Build output is written to `dist/`. Do not edit generated files there.

## Signing in and session behavior

1. Navigate to `/login` and submit an admin email and password.
2. `AuthService` sends the credentials to `${environment.apiUrl}/auth/admin/login`.
3. A valid response must include an active admin user and a JWT whose role matches the user role and is allowed by `ADMIN_ROLES`.
4. `TokenService` keeps the token in `sessionStorage`; `AuthService` stores the current admin summary and publishes it through `user$`.
5. Protected `/admin/**` routes use `AuthGuard`. Guests cannot open admin routes; authenticated users cannot open login. A 401 clears the session and redirects to login. A 403 redirects to `/forbidden`.

Logging out or clearing the session removes the token and saved admin summary. JWT claim decoding in the client is for client-side session/navigation behavior; the API must validate the token itself.

## Main screens

The full URL/component map is in the architecture guide. The top level navigation includes:

- Dashboard and admin profile.
- Users: all users, student users, subscription users, consent logs, deleted accounts, and individual user profiles.
- Responsible gaming: high risk users, deposit limits, limit changes, monthly loss users, self exclusions, and alerts.
- Compliance: cases, KYC0, KYC1, AML, source of funds, PEP/sanctions, and suspicious activity.
- Finance and wallet: operator wallet, deposits, transactions, user funds, inactive funds, and withdrawal review.
- Bonuses, subscription analytics, football operations, reports, support, and audit/security.

Some screens are API backed and some may still contain locally defined demo content or placeholder actions. Verify the feature component's service calls before assuming an action is connected to the backend.

## API configuration and requests

The environment files currently set `environment.apiUrl` to:

```text
https://adminapp-clc9.onrender.com/api
```

Login uses this configured value. `AdminService` currently declares its feature API base separately as:

```text
https://adminapp-clc9.onrender.com/api/adminpop
```

When changing backend environments, update both locations or consolidate them into one environment setting. Admin service methods create query parameters and return `Observable<any>` responses. Many add an Authorization header explicitly; the HTTP interceptor also attaches a Bearer token to matching API requests. Backend permissions and validation remain authoritative.

### Add an API operation

1. Confirm the endpoint path, HTTP method, query parameters/body, authentication requirement, and response shape with the backend contract.
2. Add a named method to `src/app/core/services/admin.service.ts`; keep URL construction and HTTP parameters in the service.
3. In the feature component, call the service from the relevant view's loading or submit handler.
4. Map the response to the component's view model. Validate required arrays/objects before rendering and keep loading, empty, success, and error states explicit.
5. For writes, prevent duplicate submissions while the request is in flight, show the API message or an actionable error, and refresh or update the displayed data after success.
6. Add or extend component tests when the change requires test coverage.

For example, user notes are read by `getUserNotes(userId, page, limit)` and written by `addUserNote(userId, note)`. The profile route supplies the dynamic user ID.

### AdminService organization (screen-wise)

`AdminService` (`src/app/core/services/admin.service.ts`) is the single shared HTTP service for all admin API calls. Methods are grouped by admin screen for maintainability. Each section is marked with a comment header:

| Section (comment header) | Screen(s) served | Example methods |
|--------------------------|------------------|-----------------|
| `PRIVATE HELPERS` | Internal | `complianceGet`, `compliancePost`, `compliancePut` |
| `DASHBOARD / HOME SCREEN` | Dashboard, RG Overview | `getDashboardHome`, `getRgOverview`, `getOperatorWallet`, `getBonusOverview`, `getSubscriptionOverview`, `getSeriesOverview`, `getMatchesOverview`, `getAuditOverview`, `getComplianceOverview` |
| `TRANSACTIONS SCREEN` | Wallet → Deposits, Transactions | `getDeposits`, `getTransactions` |
| `USER FUNDS SCREEN` | Wallet → User Funds, Inactive Funds | `getBonusTransactions`, `getUserFunds`, `getInactiveFunds`, `sendInactiveReminders` |
| `WITHDRAWALS SCREEN` | Wallet → Withdrawal Review | `getWithdrawalQueue`, `getWithdrawalReview`, `holdWithdrawal`, `releaseWithdrawal`, `addWithdrawalNote`, `requestWithdrawalVerification` |
| `USER MANAGEMENT SCREEN` | Users → All, Students, Subscriptions, Consent, Profile, Deleted | `getStudentUsers`, `getSubscriptionUsers`, `getConsentLogs`, `getUserProfile`, `getUserNotes`, `addUserNote`, `suspendUser`, `unsuspendUser`, `deleteUser`, `markAccountErased`, `getDeletedAccounts` |
| `DEPOSITS & LIMITS SCREEN` | RG → Deposit Limits, Limit Changes | `getDepositLimits`, `getLimitChanges`, `updateDepositLimit`, `applyDueLimitChanges`, `applyLimitChange`, `rejectLimitChange` |
| `RESPONSIBLE GAMING (RG) SCREEN` | RG → High Risk, Self Exclusions, Alerts | `getHighRiskUsers`, `getMonthlyLossUsers`, `getSelfExclusions`, `getRgAlerts`, `createIntervention`, `createBulkIntervention`, `createSelfExclusion`, `updateSelfExclusion`, `scanRgAlerts`, `markAllRgAlertsRead`, `updateRgAlert`, `createBulkAlertIntervention` |
| `KYC / AML / COMPLIANCE SCREEN` | Compliance → KYC0, KYC1, AML, SOF, PEP, Suspicious | `getKyc0`, `getKyc1`, `getAml`, `getSof`, `getSofCandidates`, `getPep`, `getSuspicious`, `updateKyc1`, `chaseOverdueSof`, `updateSof` |
| `CASES SCREEN` | Compliance → Cases | `getCases`, `getCaseById`, `createCase`, `updateCase`, `addCaseNote`, `caseAction` |
| `MATCH / CONTESTS SCREEN` | Football → Contests | `getMatchContests` |
| `SUBSCRIPTION TRACKING SCREEN` | Subscriptions → Tracking | `getSubscriptionTracking` |
| `SUPPORT TICKETS SCREEN` | Support → Tickets | `getSupportTickets`, `getSupportTicketById`, `createSupportTicket`, `replySupportTicket`, `updateSupportTicket`, `escalateSupportTicket` |
| `NOTIFICATIONS SCREEN` | Admin notifications | `notifyUsers` |
| `AUDIT & REPORTS SCREEN` | Audit → Logs, Reports | `getAuditLogs`, `getReports`, `getReport` |

When adding a new API method, place it in the section that matches its screen. If a screen does not yet have a section, add one following the existing pattern.

### Add a page or route

1. Add the component files under the relevant feature folder (`.ts`, `.html`, `.css`).
2. Declare the component in `src/app/admin/admin.module.ts`.
3. Add its child route in `src/app/admin/admin-routing.module.ts`, typically with `title`, `breadcrumbs`, and a `view` key when sharing a component across related views.
4. Connect the page to a service method where a backend endpoint exists.
5. Ensure loading, failure, empty data, and pagination states are presented appropriately.
6. Add the navigation link in the admin layout if the page should be reachable from the sidebar.

## Code map

| Location | Contents |
| --- | --- |
| `src/app/core/services/` | Authentication/session and admin HTTP services. |
| `src/app/core/interceptors/` | Shared HTTP request/response behavior. |
| `src/app/core/guards/` | Route access checks. |
| `src/app/core/models/` | Shared authentication and role types. |
| `src/app/admin/layout/` | Authenticated navigation shell and page header. |
| `src/app/admin/users/` | User list views and individual user profile. |
| `src/app/admin/responsible-gaming/` | Responsible gaming monitor and record views. |
| `src/app/admin/compliance/` | Compliance page, models, and view definitions. |
| `src/app/admin/wallet/` | Wallet, funds, and withdrawal review. |
| `src/app/admin/football/`, `reports/`, `subscriptions/`, `support/`, `audit/`, `bonuses/` | Screen-specific operations features and their templates/styles. |
| `src/app/admin/shared/` | Shared admin components, including the operations metric card. |
| `src/environments/` | Development and production API configuration. |
| `src/styles.css` | Global styles. |

## Troubleshooting

### Login returns an error

- Confirm the API URL and that the backend is reachable.
- Confirm the login response has `success`, `token`, and `data` with an active user and supported role.
- Check the browser Network panel for the login response and the Console for client errors.

### Admin page redirects to login

- The token may be missing, expired, invalid, or have a role that does not match the stored admin user.
- Sign in again and check the login response and browser storage if the issue repeats.

### Admin page redirects to forbidden

- The API or client detected a role/access mismatch. Confirm that the logged-in user's role is listed in `ADMIN_ROLES` and that backend access is configured.

### A table shows an API error or no records

- Check the browser Network panel for the request URL, query parameters, status code, and response body.
- Confirm the response matches the component's expected shape, especially `data` and `pagination` fields.
- Confirm the API service method and the selected route `view` key match the intended screen.
- An empty array can be a valid API response; distinguish it from a failed request in the UI.

### A backend request fails before returning a response

- A browser network error can indicate server availability, TLS, or CORS configuration. Confirm the server allows requests from the local development origin.
- A 401 generally indicates a missing or invalid session. A 403 indicates denied access.

## Existing project notes

Feature-specific integration notes are available in the repository, including:

- [AUTH-ARCHITECTURE.md](AUTH-ARCHITECTURE.md)
- [USER-PROFILE-API-CHANGES.md](USER-PROFILE-API-CHANGES.md)
- [USER-NOTES-DELETED-ACCOUNTS-CHANGES.md](USER-NOTES-DELETED-ACCOUNTS-CHANGES.md)
- [RESPONSIBLE-GAMING-OVERVIEW-CHANGES.md](RESPONSIBLE-GAMING-OVERVIEW-CHANGES.md)
- [CONSENT-SCREEN-CHANGES.md](CONSENT-SCREEN-CHANGES.md)
- [SUBSCRIPTION-SCREEN-CHANGES.md](SUBSCRIPTION-SCREEN-CHANGES.md)
- [FOOTBALL-API-FLOW.md](FOOTBALL-API-FLOW.md)
- [SUPPORT-API-FLOW.md](SUPPORT-API-FLOW.md)
- [AUDIT-API-FLOW.md](AUDIT-API-FLOW.md)
- [REPORTS-API-FLOW.md](REPORTS-API-FLOW.md)
- [FINANCE-WALLET-API-CHANGES.md](FINANCE-WALLET-API-CHANGES.md)
- [PROJECT-ARCHITECTURE.md](PROJECT-ARCHITECTURE.md)
- [ADMIN-SCREEN-STRUCTURE-AND-ROUTING.md](ADMIN-SCREEN-STRUCTURE-AND-ROUTING.md)

These files describe particular integrations and changes. The source code and current backend API contract remain the definitive references for runtime behavior.

## Screen action to API and template guide

For a quick source trace, start at the screen's HTML: an element's `(click)`, `(input)`, or `(submit)` binding names the component method. Follow that method in the adjacent `.component.ts`, then follow the named `AdminService` method in `src/app/core/services/admin.service.ts` to see the HTTP method, URL and query/body. The template then renders the component's mapped state. Existing per-screen change guides are appended with these action maps:

- `RESPONSIBLE-GAMING-OVERVIEW-CHANGES.md`: Responsible Gaming and Compliance; route loads, retry, filters, paging, case selection, and local-only actions.
- `FINANCE-WALLET-API-CHANGES.md`: Wallet routes, filters/search, paging and row actions.
- `BONUS-SCREEN-API-FLOW.md`: Bonus overview/transactions API calls, filters, paging, payload fields and rendered elements.
- `UNIVERSAL-API-SCREEN-INTEGRATION-PROMPT.md`: reusable instructions for providing and integrating one or more API/payload pairs.
- `BONUS-SCREEN-IMPLEMENTATION-RESPONSE.md`: saved Bonus integration response summary and verification note.
- `WITHDRAWAL-REVIEW-API-CHANGES.md`: Withdrawal queue/detail row selection, paging and actions without a write API.
- `CONSENT-SCREEN-CHANGES.md` and `SUBSCRIPTION-SCREEN-CHANGES.md`: User list screens, filters/search, pagination and profile links.
- `USER-PROFILE-API-CHANGES.md` and `USER-NOTES-DELETED-ACCOUNTS-CHANGES.md`: Profile, notes, note submission, and Deleted Accounts.
- `AUTH-ARCHITECTURE.md`: Login form submission and the authentication request.

The Dashboard loads `GET /getdashboard` automatically when `DashboardComponent` opens (`ngOnInit()` → `AdminService.getDashboardHome()`); its output is rendered by `src/app/admin/dashboard/dashboard.component.html`. The Admin Profile screen currently displays `AuthService.user$` data through `AdminService.profile$`; it does not call a profile API. Other Operations routes are currently presentation components without a backend call in `AdminService`, so their buttons should not be interpreted as API operations unless their component handler explicitly calls a service method.
