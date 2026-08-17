# Testing Strategy, Deployment & Final Folder Structure

## 1. Testing Strategy

No test framework is installed today. Recommend adding **Vitest** (fast, works well with Next.js/TypeScript, minimal config) for unit/integration tests of `services/` and `validators/`, plus **Playwright** for the permission/end-to-end tests below (these matter more than unit tests for this project, since the highest-risk bugs are cross-role data leaks, not pure-function logic).

```bash
npm install -D vitest @testing-library/react playwright @playwright/test
```

### Authentication
- [ ] Correct login redirects each role to the right dashboard
- [ ] Wrong password shows the generic "Invalid email or password" message (never "wrong password" specifically — don't reveal which field was wrong)
- [ ] Disabled account (`profiles.is_active = false`) cannot log in even with correct credentials
- [ ] Logged-out user hitting `/dashboard`, `/teacher`, or `/parent` directly is redirected to `/`
- [ ] Logout clears the session (subsequent protected-page load redirects again)
- [ ] Session persists across a page refresh (middleware refresh working, per file 03)

### Students
- [ ] Add student with valid data succeeds, appears in the correct class's list
- [ ] Add student with a duplicate admission number fails with a friendly message, not a raw DB error
- [ ] Edit student updates correctly and doesn't affect their enrollment history
- [ ] Archive hides the student from the default list but their fee/attendance/result history remains intact and queryable
- [ ] Search by name/admission no/father name returns correct results
- [ ] Class filter returns only that class's current-session students

### Attendance
- [ ] Teacher can mark attendance for their own assigned class
- [ ] Teacher cannot mark attendance for a class they are not assigned to (RLS denial)
- [ ] Marking the same student twice on the same day updates the existing record, never creates a duplicate row
- [ ] Principal can correct a teacher's attendance entry after the fact
- [ ] Attendance percentage calculation matches manual arithmetic on a known test dataset

### Fees
- [ ] Recording a payment updates `paid_amount`/`status` correctly, including partial payments
- [ ] A month with `paid_amount < fee_amount` correctly shows as Pending or Partial (not silently Paid)
- [ ] **The brief's exact promotion scenario**: student with 2 unpaid months in Class 4 is promoted to Class 5 — both unpaid months are still visible, correctly labeled Class 4, unaffected; new Class 5 fee records are separately generated
- [ ] Receipt number is unique and server-generated, never client-supplied
- [ ] Teacher role cannot access any fee-related read or write (RLS denial)

### Results
- [ ] Teacher can enter marks only for their assigned subject/class, only before the exam is published
- [ ] Teacher cannot edit marks after the principal publishes the exam
- [ ] Principal can still edit after publish, and the edit is written to `activity_logs`
- [ ] Parent cannot see results for an unpublished exam, even by guessing the URL
- [ ] Percentage/grade/pass-fail calculations match a known test dataset

### Permission tests (the most important category per the brief)
- [ ] Teacher cannot access any principal-only page or Server Action (fees, promotion, teacher creation, settings) — test both UI navigation and direct action invocation
- [ ] Teacher cannot see another teacher's assigned classes/students/marks
- [ ] Parent cannot access another parent's child's data by changing an ID in the URL
- [ ] Parent cannot access any write action anywhere in the system (UI has no buttons for it, and RLS independently blocks it if attempted directly)
- [ ] A logged-in principal cannot be redirected into `/teacher` or `/parent` and vice versa

## 2. Deployment

**Stack** (matches the brief and what's already in place): GitHub → Vercel (frontend/hosting) → Supabase (database + auth), matching the existing `.env.local` setup.

### Process
1. **Supabase production project**: create a separate project from whatever dev/staging project the current `.env.local` points at (never develop against a shared prod database — if the current project *is* already meant to be prod, at minimum create a second project for local dev going forward).
2. **Migrations**: every table in file 02 should be created via versioned SQL files in `supabase/migrations/`, applied via `supabase db push` (or the Supabase CLI's migration workflow) — not hand-clicked in the dashboard, so the schema is reproducible and reviewable in PRs. Currently there is no `supabase/` directory in the repo at all — this should be created in Phase 1/2.
3. **Environment variables in Vercel**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (safe to expose, already the pattern used), and `SUPABASE_SERVICE_ROLE_KEY` (server-only — in Vercel, add it as a standard env var *without* the `NEXT_PUBLIC_` prefix, and double-check it's never referenced from a `"use client"` file before deploying).
4. **Production RLS**: must be independently verified in the production project, not assumed to carry over correctly from dev — re-run the permission test matrix (§1 above) against production or a production-like staging environment before going live.
5. **Domain**: connect a custom domain in Vercel once ready; not needed for initial internal testing (a `*.vercel.app` URL is fine to start).
6. **Error monitoring**: add a lightweight error-tracking service (e.g. Sentry) at least for server-side errors, so failed Server Actions/queries in production are visible without relying on users to report them. Not urgent for a first internal release, but should be in place before parents/teachers are using it daily.
7. **Backups**: Supabase's built-in daily backups (available even on the free/pro tier depending on plan) should be confirmed enabled — this is a school's official record of attendance, fees, and results; losing it is not an acceptable failure mode. Also worth periodically exporting a manual SQL dump for the school's own records outside of Supabase.

## 3. Final Recommended Folder Structure

```
src/
  app/
    page.tsx                       login (AuthCard)
    reset-password/page.tsx        NEW
    unauthorized/page.tsx          NEW
    dashboard/                     principal — existing tree, extended per file 05/07
      layout.tsx                   existing guard, keep
      error.tsx                    NEW
      students/
        page.tsx  add/page.tsx  promote/page.tsx
        [id]/page.tsx             NEW — detail (tabs)
        [id]/edit/page.tsx        NEW
      teachers/
        page.tsx  add/page.tsx
        [id]/page.tsx             NEW — detail (assignments tab)
      classes/
        page.tsx  [classId]/page.tsx     (param renamed from className)
      subjects/page.tsx            NEW
      attendance/page.tsx
      fees/
        page.tsx                  (also serves as "Pending Fees" via ?status=)
        structure/page.tsx        NEW
      exams/  page.tsx  add/page.tsx  [id]/page.tsx (NEW, subject config)
      results/
        page.tsx
        [examId]/[studentId]/card/page.tsx   NEW — print layout
      timetable/  page.tsx  edit/page.tsx
      notices/  page.tsx  add/page.tsx
      homework/page.tsx            (v1.5)
      reports/page.tsx
      settings/  page.tsx  timing/page.tsx
    teacher/                      NEW — entire tree
      layout.tsx  page.tsx  attendance/page.tsx
      exams/[examId]/[subjectId]/marks/page.tsx
      timetable/page.tsx  classes/page.tsx  profile/page.tsx
      homework/page.tsx            (v1.5)
    parent/                       NEW — entire tree
      layout.tsx  page.tsx  attendance/page.tsx  fees/page.tsx
      results/page.tsx  timetable/page.tsx  notifications/page.tsx
    api/                          only if a webhook/export endpoint is ever needed

  actions/                        NEW — "use server", one file per domain (file 04 §2)
  services/                       NEW — pure business logic (file 04 §2)
  validators/                     NEW — Zod schemas (file 04 §2)
  types/                          NEW — database.types.ts (generated) + domain.ts

  components/
    ui/                           NEW — Button, Input, Select, Modal, ConfirmDialog, Toast, Skeleton
    dashboard/                    existing — Sidebar, Topbar, PageHeader, StatCard, DonutChart, MonthFilter, SessionBadge
    students/                     NEW — shared StudentsTable, StudentForm
    teachers/  attendance/  fees/  timetable/  results/    NEW — domain components as each phase builds them

  lib/
    supabase/  client.ts  server.ts     existing, unchanged
    school-calendar.ts             existing, unchanged
    classes-data.ts                rewritten as a live query in Phase 2
    toast.ts                       NEW

supabase/
  migrations/                      NEW — versioned SQL, one file per schema change
```

**What each top-level folder is for, in one line:**
- `app/` — routes only; a page file should mostly compose components and call a data-fetch or a Server Action, not contain business logic inline (a light version of today's pattern, kept, with the heavy lifting moved into `actions/`/`services/` as those grow).
- `actions/` — server-only mutations, callable from forms.
- `services/` — pure, testable business rules (fee-due math, grade calculation, promotion planning).
- `validators/` — Zod schemas shared by client forms and server actions.
- `types/` — the single source of truth for what the data looks like.
- `components/ui/` — generic, no domain knowledge, reusable anywhere.
- `components/<domain>/` — composed, domain-aware (knows what a "student" or "fee record" is).
- `lib/` — small stateless utilities and the Supabase client factories (unchanged).
- `supabase/migrations/` — the database schema as version-controlled code, not dashboard clicks.
