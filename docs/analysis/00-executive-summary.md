# Executive Summary — Al-Emaan Model School Management System

This is a full technical + product audit of the codebase as it exists today (13 Aug 2026, commit `fbffa3c` plus uncommitted working-tree changes). Every claim below was verified by reading the actual source files — nothing here is guessed from the UI alone. Where a page *looks* finished but has no backend behind it, that is called out explicitly.

Read this file first. The other files in this folder go deep on each area.

## A. Current Project Status

| Layer | Completion | Why |
|---|---|---|
| **Frontend (UI/markup)** | ~55% | Every Principal page in the spec exists visually (Dashboard, Students, Classes, Teachers, Attendance, Fees, Exams, Results, Timetable, Notices, Homework, Reports, Settings). Styling is consistent and polished. But most pages are static mockups, not data-driven screens. Teacher and Parent UIs **do not exist at all** — zero files under a `teacher/` or `parent/` route. |
| **Backend (server logic)** | ~8% | Real Supabase reads/writes exist in exactly 4 places: login, add-student, students list, classes list/detail (incl. delete-student in the class table). Everything else — teachers, attendance, fees, exams, results, timetable, notices, homework, reports, settings, promotion — is hardcoded arrays with no read or write to the database. |
| **Database** | ~5% | Only two tables are confirmed to exist and be in use: `students` and `profiles`. No `teachers`, `classes`, `attendance`, `fees`, `exams`, `results`, `subjects`, `timetable`, `sessions`, `parents`, or `notices` tables exist yet (none are queried anywhere in the code). Class identity is a free-text string (`class_name`), not a foreign key. |
| **Authentication** | ~40% | Login is real (Supabase `signInWithPassword` + role lookup + redirect) and route protection for `/dashboard` is real (server-side check in `dashboard/layout.tsx`). But: Sign Up is fake (just navigates to `/dashboard` without creating a user), there is no middleware/session-refresh layer, `/teacher` and `/parent` routes the login redirects to **don't exist** (404 today), and "Forgot password" / "Change Password" are dead links. |
| **Security** | ~30% | What exists is done correctly (no service-role key in the browser bundle, server-side role check, parameterized Supabase queries). But nothing has been verified because there are effectively no RLS policies to audit yet (no evidence of them in code, and most tables don't exist), and there's no confirmation the `students` table's insert/delete policies are scoped to `principal` only. |
| **Overall MVP completion** | **~15–20%** | The project has a good visual skeleton and one correctly-wired vertical slice (Students). Everything else needs to be built from the database up. |

## B. Critical Problems (fix before adding more features)

1. **No `teacher` or `parent` app routes exist.** The login page redirects to `/teacher` and `/parent` for those roles — today that's a hard 404 for any non-principal user. See [01-audit-existing-code.md](01-audit-existing-code.md).
2. **Class identity is a raw string, not a table.** `class_name` on `students` is free text matched against a hardcoded array (`lib/classes-data.ts`). Two different pages already disagree on naming (`"Class 1"` vs `"Grade 1"`) — a real, present-day bug, not a hypothetical. See [01-audit-existing-code.md](01-audit-existing-code.md) §Bad Architecture and [02-database-schema.md](02-database-schema.md).
3. **No RLS policies confirmed.** Nothing in the repo defines them (no `supabase/` migrations directory, no SQL files). Until these exist, any authenticated user can potentially read/write the `students` table with no role restriction. This must be fixed before any real student data goes in. See [03-security-rls-auth.md](03-security-rls-auth.md).
4. **Sign Up is fake and dangerous to leave as-is.** It creates no Supabase Auth user and no profile row, then silently sends the visitor to `/dashboard` (which will immediately bounce them back out via the layout guard). It should be removed from the public login page entirely — principal/teacher/parent accounts should only be created *by* a principal, not self-service. See [03-security-rls-auth.md](03-security-rls-auth.md).
5. **No academic-session / class-history model.** Nothing in the schema (or the UI's data model) ties a fee record, attendance record, or result to a specific session or class-at-that-time. Promotion today (mock UI) has no real backing table, so "don't destroy history when promoting" — the single most emphasized requirement in the brief — is not yet possible to satisfy. See [06-sessions-promotion-notifications-reports.md](06-sessions-promotion-notifications-reports.md).
6. **No middleware for Supabase session refresh.** Auth relies solely on `dashboard/layout.tsx` re-checking `getUser()` per request, which works for gating, but the standard Supabase SSR pattern also refreshes the session cookie in middleware — skipping this risks users being silently logged out mid-session. See [03-security-rls-auth.md](03-security-rls-auth.md).

## C. Missing Features (headline list — full detail in file 07)

- Teacher and Parent dashboards/routes (100% missing)
- Student detail page (`/dashboard/students/[id]`) — table "View" buttons are dead
- Edit-student, edit-teacher functionality — every "Edit" button in the UI is inert
- All of: `classes`, `sections`, `subjects`, `class_subjects`, `teacher_assignments`, `timetable_periods`, `timetable_entries`, `attendance`, `fee_structures`, `student_fee_records`, `fee_payments`, `exams`, `exam_subjects`, `results`, `academic_sessions`, `student_enrollments`, `parents`, `student_parents`, `notifications`, `activity_logs` tables
- Any server actions / API routes / validation layer (`actions/`, `services/`, `validators/` folders don't exist)
- Loading states, error boundaries, empty-state consistency (`loading.tsx` / `error.tsx` exist nowhere)
- Toast/notification system (currently raw `alert()` / `window.confirm()`)
- Search and filtering (every search box and filter dropdown in the UI is decorative — no `onChange`, no query params, except `MonthFilter` on the Fees page which is real)
- Pagination (all "Showing 1 to X of Y" + page-number buttons are static, non-functional)

## H. Recommended Next Task (do this one thing before anything else)

**Build the database foundation: `academic_sessions`, `classes`, `subjects`, and `student_enrollments`, then migrate `students.class_name` to `students` + `student_enrollments` with a proper `class_id` foreign key — and write the RLS policies for all of it before writing another page.**

Why this and not something more visible like "finish the Teachers page": every other module (attendance, fees, exams, timetable, promotion) needs a real `classes` table and a session-aware enrollment record to be built correctly. If you build Fees or Attendance against today's free-text `class_name`, you will have to re-migrate that data the moment `classes`/`academic_sessions` exist — which is exactly the "overwriting history" failure mode the brief explicitly warns against. Concretely:

1. Create `academic_sessions`, `classes`, `subjects` tables (see [02-database-schema.md](02-database-schema.md)).
2. Create `student_enrollments` (student × session × class, with `roll_number` and `status`) and stop relying on `students.class_name` as the source of truth for "what class is this student in right now" — derive it from the *current session's* enrollment row instead.
3. Write RLS policies for `students`, `student_enrollments`, `classes`, `academic_sessions` scoped to `principal` (full access) only, for now — teacher/parent policies come in Phase 4 once those roles have accounts.
4. Update the two pages that already touch `students`/`class_name` (Students list, Classes list/detail, Add Student form) to read/write through `student_enrollments` instead of the flat column.
5. Only after that is done and tested, move on to Phase 6 (Teachers) in [07-roadmap-and-checklist.md](07-roadmap-and-checklist.md).

Full phase-by-phase roadmap, dependency map, and a complete per-phase checklist are in [07-roadmap-and-checklist.md](07-roadmap-and-checklist.md).
