# Subscription Users screen changes

The Subscription Users page now loads its summary, records, search results, and pagination from `GET /getsubscriptionusers`.

- `src/app/core/services/admin.service.ts` adds `getSubscriptionUsers()` with the `page`, `limit`, `filter`, and `search` query parameters.
- `src/app/admin/users/user-records.component.ts` loads the API response, maps its summary and subscription fields into the page, and handles filters, search, pagination, and load errors.
- `src/app/admin/users/user-records.component.html` shows the subscription search box and shared server pagination controls.

The UI uses the response fields `summary`, `data`, and `pagination`. Each row displays the subscriber, plan, start and expiry dates, auto-renew setting, lifetime spend, contest count, engagement, and status.
