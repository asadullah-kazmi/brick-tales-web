# App Router structure

Route groups (folders in parentheses) do **not** affect the URL. They only organize routes and allow different layouts per group.

## Route groups

### `(public)`

**Purpose:** Unauthenticated, marketing-facing routes. No login required.

- **Use for:** Landing page, browse/catalog, watch page, marketing/legal pages.
- **URLs:** `/`, `/browse`, `/watch/[id]` (the `(public)` segment does not appear).
- **Layout:** Main site header + footer around all public pages.

---

### `(auth)`

**Purpose:** Authentication flows: sign-in, sign-up, password reset, verification.

- **Use for:** `/login`, `/signup`, `/forgot-password`, `/verify-email`, etc.
- **URLs:** `/login`, `/signup` (the `(auth)` segment does not appear).
- **Layout:** Centered card, no main header/footer; minimal chrome for focus on the form.

---

### `(dashboard)`

**Purpose:** Logged-in user area: library, history, settings, uploads.

- **Use for:** `/dashboard`, `/dashboard/library`, `/dashboard/settings`, `/dashboard/uploads`, etc.
- **URLs:** `/dashboard`, `/dashboard/library`, `/dashboard/settings`.
- **Layout:** Sidebar (or top nav) for dashboard sections. Protect all routes with auth.

---

### `(admin)`

**Purpose:** Platform management: content moderation, users, analytics, configuration.

- **Use for:** `/admin`, `/admin/content`, `/admin/users`, `/admin/analytics`, etc.
- **URLs:** `/admin`, `/admin/content`, `/admin/users`.
- **Layout:** Separate admin nav/layout; restrict to admin role only.

---

## File/folder purpose summary

| Folder                       | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `app/`                       | Root layout, fonts, globals. No route segment. |
| `app/(public)/`              | Public pages: home, browse, watch.             |
| `app/(auth)/`                | Auth pages: login, signup.                     |
| `app/(dashboard)/dashboard/` | User dashboard and sub-routes.                 |
| `app/(admin)/admin/`         | Admin panel and sub-routes.                    |
