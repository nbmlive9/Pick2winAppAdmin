# Pick2Win Admin Project Architecture

This document describes how the current Angular application is organized and how a page request travels through routing, authentication, components, services, and the admin API.

## 1. Application at a glance

Pick2Win Admin is a browser based Angular single page application (SPA). Angular bootstraps one root module, then the router loads the login or admin feature area based on the URL. Admin pages share a navigation shell and call the backend through Angular `HttpClient` services.

```text
Browser
  └─ src/main.ts
      └─ AppModule
          ├─ CoreModule: authentication interceptor
          ├─ AppRoutingModule
          │   ├─ /login      → lazy loaded AuthModule
          │   ├─ /admin/**   → lazy loaded AdminModule, protected by AuthGuard
          │   └─ /forbidden  → forbidden feature module
          └─ AppComponent
              └─ Router outlet
                  └─ AdminLayoutComponent
                      ├─ side navigation / header / global search
                      └─ routed feature component
                          └─ AdminService or AuthService
                              └─ HttpClient → admin backend API
```

The project uses Angular 16, TypeScript, RxJS, Angular Router, and component scoped CSS. It uses the NgModule architecture rather than standalone components. There is no separate frontend state management library; feature components hold their page state and receive HTTP results through RxJS subscriptions.

## 2. Startup and application shell

| File | Responsibility |
| --- | --- |
| `src/main.ts` | Starts Angular by bootstrapping `AppModule`. |
| `src/app/app.module.ts` | Root module. Imports browser support, routing, HTTP, forms, `CoreModule`, and `AdminModule`; declares `AppComponent`. |
| `src/app/app.component.*` | Root view and styles, including the root router outlet. |
| `src/app/app-routing.module.ts` | Top level routes and lazy loading for authentication, admin, and forbidden pages. |
| `src/app/core/core.module.ts` | Registers the authentication HTTP interceptor once. Throws if imported a second time. |
| `src/styles.css` | Global styles shared by the application. |
| `src/environments/environment.ts` | Development environment settings. |
| `src/environments/environment.production.ts` | Production environment settings. |

The root route redirects to `/admin/dashboard`. The login route is restricted to signed out users by `GuestGuard`. The admin route uses `AuthGuard` at route match and activation, and the admin child routes also check authentication. A forbidden route handles authenticated users without an allowed admin role.

## 3. Routing and feature areas

`src/app/admin/admin-routing.module.ts` defines the admin URL tree. The parent `AdminLayoutComponent` wraps the child route content. Route metadata supplies page titles, breadcrumbs, view keys, and header actions. The layout reads this metadata on navigation and injects the global search term into supported page components.

| URL area | Feature component(s) | Main purpose |
| --- | --- | --- |
| `/admin/dashboard` | `DashboardComponent` | Admin dashboard. |
| `/admin/profile` | `ProfileComponent` | Signed in admin profile. |
| `/admin/users/**` | `UserRecordsComponent`, `UserProfileComponent` | All users, students, subscriptions, consent logs, deleted accounts, and an individual profile. |
| `/admin/responsible-gaming/**` | `RgMonitorComponent`, `RgRecordsComponent` | High risk monitor, deposit limits, limit changes, monthly loss, exclusions, and alerts. |
| `/admin/compliance/**` | `ComplianceComponent` | Cases, KYC0/KYC1, AML, source of funds, PEP/sanctions, and suspicious activity views. |
| `/admin/wallet/**` | `WalletComponent`, `WithdrawalReviewComponent` | Operator wallet, deposits, transactions, user/inactive funds, and withdrawal review. |
| `/admin/bonuses/**` | `BonusesComponent` | Bonuses and rewards. |
| `/admin/subscriptions/**` | `SubscriptionAnalyticsComponent` | Subscription analytics. |
| `/admin/football/**` | `FootballOperationsComponent`, `FootballContestManagerComponent` | Series, matches, and contests. |
| `/admin/reports/**` | `ReportsComponent` | Reports library. |
| `/admin/support/**` | `SupportTicketsComponent` | Support tickets and disputes. |
| `/admin/audit/**` | `AuditComponent` | Audit and security logs. |

The feature declarations are collected in `src/app/admin/admin.module.ts`; route definitions are kept in `src/app/admin/admin-routing.module.ts`. Multiple related URLs reuse a component and pass a `view` key in route data. For example, the compliance routes all use `ComplianceComponent`, which switches the data request and table configuration based on that key.

## 4. Shared admin layout

`AdminLayoutComponent` is the persistent shell for the authenticated area. It renders the navigation, page header, breadcrumbs, header actions, and global search around a router outlet. It listens to `NavigationEnd` to update title and breadcrumb data.

For routed feature components that implement search, the layout keeps a component reference and calls `setSearchTerm(...)` when the user types or when a new child route activates. The current integrations cover user records, responsible gaming, compliance, wallet, and withdrawal review.

## 5. Authentication and access control

### Login and session flow

1. `LoginComponent` collects the admin credentials and calls `AuthService.login(...)`.
2. `AuthService` posts to `${environment.apiUrl}/auth/admin/login`.
3. It checks the response, requires an active admin account with an allowed role, and checks that the JWT contains a matching role and an unexpired `exp` claim.
4. `TokenService` stores the JWT in `sessionStorage` and provides it to the app while valid.
5. `AuthService` stores the admin profile in session storage and publishes the current admin using a `BehaviorSubject` (`user$`).
6. `AuthGuard` checks the session and role before protected navigation. `GuestGuard` redirects an already authenticated admin away from `/login`.
7. `AuthInterceptor` attaches a Bearer token to matching API requests. A 401 clears the session and navigates to login; a 403 navigates to `/forbidden`.

The frontend decodes selected JWT claims for navigation and session checks; this is not signature verification. The backend remains responsible for authenticating and authorizing every API request.

### Authentication files

| File | Responsibility |
| --- | --- |
| `src/app/core/services/auth.service.ts` | Login, restore/clear session, current admin state, and role checks. |
| `src/app/core/services/token.service.ts` | Store, retrieve, clear, and decode the JWT. |
| `src/app/core/interceptors/auth.interceptor.ts` | Attach authorization headers and handle HTTP 401/403 routing. |
| `src/app/core/guards/auth.guard.ts` | Protect routes and enforce allowed admin roles. |
| `src/app/core/guards/guest.guard.ts` | Keep authenticated admins out of the login page. |
| `src/app/core/models/auth.models.ts` | Admin, role, login, response, and JWT claim TypeScript types. |

Allowed roles are declared as `super_admin` and `admin` in `ADMIN_ROLES`.

## 6. API and data flow

### Service ownership

`AdminService` (`src/app/core/services/admin.service.ts`) is the shared HTTP boundary for most admin data. Components call named methods such as `getStudentUsers(...)` or `getComplianceOverview(...)`; the service builds query parameters and makes the HTTP request. Components then map response fields into their page/table models and render loading, empty, success, or error states.

`AuthService` owns the login request and admin session. It is separate from `AdminService` because login and session state have different responsibilities from admin feature data.

```text
route/view selected
    ↓
feature component sets loading state and calls service method
    ↓
service builds URL, query parameters, body, and authorization options
    ↓
HttpClient → AuthInterceptor → backend
    ↓
component validates response and maps API data to page model
    ↓
Angular template renders rows, metrics, and feedback
```

For a write operation, the same path is used with an HTTP POST body. For example, the user profile calls `AdminService.addUserNote(userId, note)`, which posts `{ note }` to `/addusernote/{userId}`. After a successful save, the component refreshes user notes.

### API base URL configuration

`environment.apiUrl` is currently `https://adminapp-clc9.onrender.com/api` in both environment files. `AuthService` uses it for the login path. `AdminService` currently has its own `Base_URL` set to `https://adminapp-clc9.onrender.com/api/adminpop` for feature endpoints. This means the API root is duplicated in configuration and the admin service; if environments need different backend URLs, those values should be unified through environment configuration.

Admin service methods explicitly read the token and construct an Authorization header in many calls. The interceptor also adds a Bearer header to matching API requests (except login). The duplicate header assignment has the same value today, but token handling is maintained in two places and can be simplified as a future cleanup by consistently relying on the interceptor.

### Current named admin service operations

These service methods are present in `AdminService` and show the intended API grouping. See that file for the exact path, parameters, and response type used by each method.

| Feature | Service methods |
| --- | --- |
| Dashboard | `getDashboardHome` |
| Responsible gaming overview and records | `getRgOverview`, `getHighRiskUsers`, `getDepositLimits`, `getLimitChanges`, `getMonthlyLossUsers`, `getSelfExclusions`, `getRgAlerts` |
| Wallet and funds | `getOperatorWallet`, `getDeposits`, `getTransactions`, `getUserFunds`, `getInactiveFunds` |
| Compliance | `getComplianceOverview`, `getCases`, `getCaseById`, `getKyc0`, `getKyc1`, `getAml`, `getSof`, `getSofCandidates`, `getPep`, `getSuspicious` |
| User records and profile | `getStudentUsers`, `getSubscriptionUsers`, `getConsentLogs`, `getUserProfile`, `getUserNotes`, `addUserNote`, `getDeletedAccounts` |

Not every routed screen necessarily has a backend integration. Several feature components and route actions are UI shells or use local page definitions. Confirm the component's service call before treating a screen as API backed. For API backed pages, inspect the service method and the corresponding load/mapping function in the feature component.

## 7. Feature component patterns

### Users

- `UserRecordsComponent` handles several user-related views. It reads route data, invokes the matching `AdminService` request, builds shared `UserPage`/`UserRow` models, and handles search, filters, pagination, and table actions.
- `UserProfileComponent` gets the dynamic `userId` from the route, loads profile data, and separately loads paginated notes. Its “Add admin note” interaction uses the POST method and refreshes the notes list after success.
- Templates render those view models; component CSS styles the table and profile panels.

### Responsible gaming

- `RgMonitorComponent` supplies the high risk monitoring view.
- `RgRecordsComponent` handles several records views by route key, requests the selected dataset, then maps API data to `RgRecordsPage`/`RgRow` models.
- `rg.models.ts` contains shared data types; `rg-records.data.ts` contains the page definitions and labels used by the views.

### Compliance

- `ComplianceComponent` switches between compliance views using route data and `getCompliancePage(...)`.
- `compliance.data.ts` and `compliance.models.ts` define the page configuration and typed table/metric structures.
- API results are mapped into the same page structures so the template can render different compliance datasets consistently.

### Wallet

- `WalletComponent` handles the operator, deposits, transactions, user funds, and inactive funds pages by route key.
- `WithdrawalReviewComponent` owns the separate withdrawal review flow.
- `WalletMetricCardComponent` and `WalletCostAnalyticsComponent` provide reusable wallet UI pieces.

## 8. UI and styling structure

Most feature components follow Angular's three-file convention: `.ts` contains behavior and state, `.html` contains the template, and `.css` contains local styles. Shared primitive styles live in `src/styles.css`; component styles are scoped to their component by Angular's style encapsulation. Reusable metric cards exist under the operations, responsible gaming, and wallet feature folders.

## 9. Environments, build, and tests

- `angular.json` defines Angular CLI build and serve configuration, including environment replacement for production.
- `package.json` contains `start`, `build`, `watch`, and `test` scripts.
- `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.spec.json` control TypeScript compilation for app and tests.
- Unit tests use Jasmine/Karma and are located alongside selected source files as `*.spec.ts`.
- `dist/` contains generated build artifacts and is not application source.

Common local commands:

```powershell
npm start
npm run build
npm test
```

## 10. Where to make common changes

| Change | Start here |
| --- | --- |
| Add or edit a URL | `src/app/app-routing.module.ts` or `src/app/admin/admin-routing.module.ts` |
| Add an admin API request | `src/app/core/services/admin.service.ts` (methods grouped by screen — see [AdminService organization](#admin-service-organization)) |
| Add or change login/session behavior | `src/app/core/services/auth.service.ts`, `token.service.ts`, or `auth.interceptor.ts` |
| Change a user table or profile | `src/app/admin/users/` |
| Change a responsible gaming view | `src/app/admin/responsible-gaming/` |
| Change a compliance view | `src/app/admin/compliance/` |
| Change a wallet view | `src/app/admin/wallet/` |
| Change global admin navigation/header | `src/app/admin/layout/` |
| Change API host | `src/environments/` and, currently, `AdminService.Base_URL` |

### Admin Service organization

`AdminService` (`src/app/core/services/admin.service.ts`) is the single shared HTTP service for all admin API calls. Methods are grouped by admin screen with comment headers for maintainability:

- **Private Helpers** — `complianceGet`, `compliancePost`, `compliancePut`
- **Dashboard / Home Screen** — Dashboard, RG Overview
- **Transactions Screen** — Wallet → Deposits, Transactions
- **User Funds Screen** — Wallet → User Funds, Inactive Funds
- **Withdrawals Screen** — Wallet → Withdrawal Review
- **User Management Screen** — Users → All, Students, Subscriptions, Consent, Profile, Deleted
- **Deposits & Limits Screen** — RG → Deposit Limits, Limit Changes
- **Responsible Gaming (RG) Screen** — RG → High Risk, Self Exclusions, Alerts
- **KYC / AML / Compliance Screen** — Compliance → KYC0, KYC1, AML, SOF, PEP, Suspicious
- **Cases Screen** — Compliance → Cases
- **Match / Contests Screen** — Football → Contests
- **Subscription Tracking Screen** — Subscriptions → Tracking
- **Support Tickets Screen** — Support → Tickets
- **Notifications Screen** — Admin notifications
- **Audit & Reports Screen** — Audit → Logs, Reports

When adding a new API method, place it in the section that matches its screen.

## 11. Practical architecture notes

- Route-level lazy loading reduces the initial feature code loaded for login and admin areas.
- Admin route metadata is the shared source for titles, breadcrumbs, view selection, and some header actions.
- Most API-driven feature state is local to the page component; there is no global cache/store layer.
- API response mapping is performed inside feature components. When a response contract changes, update the service parameters if needed and the corresponding mapping/error handling together.
- The service currently returns `Observable<any>` for most endpoint methods. Adding typed request and response models would make API contract changes easier to validate during development.
- Some route components and button actions may still be presentational placeholders. The presence of a route does not by itself mean that its operations are connected to a backend endpoint.
