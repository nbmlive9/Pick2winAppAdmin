# Admin authentication foundation

Angular 16 NgModule application with lazy-loaded auth and admin features.

```
src/app/core/
  core.module.ts
  models/auth.models.ts
  services/{auth,token,admin}.service.ts
  guards/{auth,guest}.guard.ts
  interceptors/auth.interceptor.ts
src/app/auth/login/
src/app/admin/{layout,dashboard,profile}/
src/environments/environment.ts
src/environments/environment.production.ts
```

Login posts email/password to `/api/auth/admin/login` using the environment API URL. The response must contain `success`, a JWT with an unexpired numeric `exp` and `role`, and an active account in `data`. Only `super_admin` and `admin` are currently allowed. Both roles can open dashboard and profile; set route `data.roles` to `['super_admin']` for future restricted pages. Never include passwords or tokens in environment files.

Tokens and selected account fields live only in memory. Refreshing or closing the app requires signing in again. Expiry clears the session and returns an open admin page to login. Protected API requests receive a bearer header only for the configured API origin and path. A 401 clears the matching session; a 403 opens the permission page. No automatic login retries or invented refresh-token endpoint are included.

Client guards and decoded JWT roles are navigation controls, not a security boundary. The API must verify signatures, expiry, active account status, and permissions for every protected operation. Persistent sessions require a backend-supported HttpOnly, Secure cookie/refresh design and appropriate CSRF protection. Configure CORS for the deployed frontend origin, HTTPS, CSP and other response headers on hosting. Configure SPA fallback to index.html for direct route navigation.

Profile currently displays login response fields. Dashboard has account information only; no synthetic business metrics. Add real dashboard/profile API operations to AdminService when endpoint contracts are available. Logout UI and server revocation are deferred as requested; clearSession is the shared local cleanup primitive.

Production uses environment.production.ts through Angular file replacements. Both URLs currently point at the supplied backend; change development URL if a separate backend is provided.

Commands: `npm start`, `npm run build`, `npm test -- --watch=false --browsers=ChromeHeadless`.
