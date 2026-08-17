# Existing Project Audit

Verified by reading every file under `src/`. Classification key:

- ✅ **Fully implemented** — real UI + real DB read/write, works end-to-end
- 🟡 **Frontend only** — UI exists, no backend behind the buttons
- 🟠 **Partially implemented** — some real DB wiring, some fake parts on the same page
- 🔴 **Missing** — no route/file exists at all
- ⚠️ **Buggy / inconsistent** — works but contains a real defect
- 🔒 **Security risk** — needs attention before going further

## 1. Project Setup

| Item | Status | Notes |
|---|---|---|
| Next.js App Router | ✅ | Next 16.3.0, `src/app/` structure, all pages are Server Components by default with `"use client"` only where needed (forms, menus). Good baseline. |
| Supabase client (browser) | ✅ | `src/lib/supabase/client.ts` — correct `createBrowserClient` usage, only the publishable key. |
| Supabase client (server) | ✅ | `src/lib/supabase/server.ts` — correct `createServerClient` with cookie adapter, awaited `cookies()` (Next 16 pattern). |
| Environment variables | ✅ (safe) | `.env.local` has only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No service-role key present anywhere in the repo — good, this is the #1 mistake this kind of project usually makes, and it's avoided. `.env*` is correctly gitignored. |
| Middleware | 🔴 | No `middleware.ts` exists. Supabase's recommended SSR pattern uses middleware to refresh the auth cookie on every request; without it, sessions can go stale mid-visit even though the layout-level guard still works for gating access. |
| TypeScript types for DB | 🔴 | No generated `database.types.ts`. All Supabase queries are typed ad hoc with inline `type Student = {...}` and `.returns<T>()`. Works, but drifts from the real schema silently. |
| Validation library | 🔴 | Neither Zod nor React Hook Form is installed (`package.json` confirmed). All forms use plain `useState` + native `required` attributes only. |
| Testing | 🔴 | No test framework installed, no test files anywhere. |

## 2. Page-by-Page Audit

### Login / Signup — `src/app/page.tsx` → `AuthCard.tsx`

- **Login**: ✅ Real. `signInWithPassword` → fetch `profiles.role` → redirect by role map (`principal → /dashboard`, `teacher → /teacher`, `parent → /parent`).
- **Signup**: 🟡🔒 Fake **and risky to leave live**. `handleSignup` just calls `router.push("/dashboard")` — no `supabase.auth.signUp()` call, no profile row created, the "Full Name" field isn't even sent anywhere. A visitor can click "Sign Up," fill the form, and land on a URL that will immediately bounce them (dashboard layout requires a real session + `principal` role) — confusing, and worse, it *looks* like it worked. **This should be removed from the public-facing page.** Account creation must be principal-initiated (see file 03).
- **Forgot password**: 🔴 Link with `href="#"`, does nothing.
- Redirect targets `/teacher` and `/parent`: 🔴 **These routes don't exist in `src/app/`.** Any teacher/parent who successfully logs in today hits a 404.

### Dashboard — `src/app/dashboard/page.tsx`

🟡 **Entirely static.** Every stat card (teachers present, students present, fee-unpaid amount), the "Teacher Arrival Today" table, the fee-pending tiers, and the notices list are hardcoded arrays. This is the *only* principal page that doesn't even attempt a Supabase query, despite `Students` and `Classes` (built later, per uncommitted diff) already showing the pattern for how to do it. School Timing card values are also hardcoded, not read from a `settings` table.

### Students list — `src/app/dashboard/students/page.tsx`

🟠 **Partially real** — the best-wired page in the app. Server Component queries `students` for real (`id, admission_no, full_name, father_name, class_name, contact_number, gender, admission_date`), computes total/boys/girls/new-this-month from the live rows, and renders a real empty state and a real Supabase error state. But: "Present Today" stat is a hardcoded `"—"` (attendance doesn't exist yet, honestly labeled "not connected yet" — good practice, keep doing this). Search box, "All Classes" filter, "All Status" filter are decorative (no `onChange`). Row actions: **View** and **Edit** buttons have no `onClick` at all (dead). **Delete** button also has no `onClick` here (dead) — contrast with `ClassStudentsTable`, which *does* wire up delete. Same product, two different students tables, inconsistent capability — a real gap a user will notice.

### Add Student — `src/app/dashboard/students/add/page.tsx`

🟠 Real insert into `students` (admission_no, full_name, father_name, date_of_birth, gender, class_name, contact_number, monthly_fee, admission_fee, created_by). Uses `alert()` for both success and error instead of a toast. No Zod/server-side validation — only HTML `required`. Document upload fields (B-Form, certificate) are visually present but explicitly labeled "not connected yet" (again, honest and good). Photo upload (`<input type="file">`) has no Supabase Storage wiring — selecting a file does nothing. ⚠️ Note the class list here is `["Playgroup","Nursery","Prep","Class 1"..."Class 8"]`, while `Promote Students`, `Timetable`, and `Settings` pages use `["Play Group","Nursery","Prep","Grade 1"..."Grade 8"]` — **two different naming schemes for the same 11 classes coexist in the live app.** This is a real, present bug, not a hypothetical (see §Bad Architecture below).

### Promote Students — `src/app/dashboard/students/promote/page.tsx`

🟡 Fully mock. `rosterByClass` is a hardcoded object keyed by `"Grade 5"`/`"Grade 6"` with fake admission numbers (`AEMS-0012`, etc. — note the different admission-number format vs. the real `students` table's `AMS-2022-001` style seen on the Fees mock data, another naming inconsistency). Clicking "Promote Selected Students" only flips local React state (`setConfirmed(true)`) and shows a static success banner — **no database write happens at all.** This is the page most in need of real backing given how much the brief emphasizes promotion correctness.

### Classes list — `src/app/dashboard/classes/page.tsx`

🟠 Class *cards* (name, teacher) come from the hardcoded `lib/classes-data.ts` array. Student *counts per class* are real — a live query (`select class_name` from `students`, grouped client-side). So this page is a hybrid: structure is mock, one number on each card is real.

### Class detail — `src/app/dashboard/classes/[className]/page.tsx`

🟠 Real: queries `students` filtered by `class_name`, computes total/boys/girls live, renders via `ClassStudentsTable` which has a **working delete** (`supabase.from("students").delete().eq("id", ...)` with a `window.confirm()` guard and `router.refresh()`). Mock: the class-teacher name comes from the hardcoded directory, not any `teachers` table (none exists), and "Today's Attendance" is an honest "not connected yet" label. Edit button in this table is present but inert (tooltip says so explicitly).

### Teachers list — `src/app/dashboard/teachers/page.tsx`

🟡 100% mock. 6 hardcoded teacher records, fake pagination ("Showing 1 to 6 of 32" — 32 is never actually 32 anywhere). View/Edit/Delete buttons: no handlers.

### Add Teacher — `src/app/dashboard/teachers/add/page.tsx`

🟡 Form has no `onSubmit` handler at all — not even `preventDefault`. Submitting **reloads the page** with no save. Includes username/password fields implying this form is meant to also create the teacher's login account (`supabase.auth.admin.createUser` territory — needs a server action, can't be done from the browser client, see file 03).

### Attendance — `src/app/dashboard/attendance/page.tsx`

🟡 100% mock (stat cards, per-class-per-section table, donut chart) — no `attendance` table exists, so there is nothing to query yet. Date picker button and Export button are decorative.

### Fees list — `src/app/dashboard/fees/page.tsx`

🟠 Interesting case: the **table data is 100% mock** (6 hardcoded students), but the **month filter and status filter are real** — `MonthFilter` writes `?month=` to the URL via `router.push`, and the page reads `?status=pending|paid` from `searchParams` to filter the mock array and change the banner. So the filtering *mechanism* is correctly built; it's just filtering fake data. This is good scaffolding to reuse once a real `student_fee_records` table exists.

### Fee detail — `src/app/dashboard/fees/[id]/page.tsx`

🟡 100% mock — `params.id` is awaited but never actually used to look anything up; the same hardcoded "Ahmed Raza" record renders regardless of which student ID is in the URL. This is the clearest single example in the codebase of "looks finished, isn't wired" — worth testing by hand once to see it firsthand.

### Exams list / Add Exam — `src/app/dashboard/exams/page.tsx`, `exams/add/page.tsx`

🟡 Both 100% mock, Add Exam form has no submit handler (page reload on submit, same defect as Add Teacher).

### Results — `src/app/dashboard/results/page.tsx`

🟡 100% mock, including "Top Performers" sidebar.

### Timetable / Edit Timetable — `src/app/dashboard/timetable/page.tsx`, `timetable/edit/page.tsx`

🟡 100% mock. Note the period-time header pattern (times shown once in a header row, not repeated per cell) is **already implemented correctly** in the "Today" tab — matches the brief's explicit ask. Edit page's day-schedule dropdowns have no state/save handler.

### Notices / Add Notice — `src/app/dashboard/notices/page.tsx`, `notices/add/page.tsx`

🟡 100% mock, including a fairly built-out rich-text toolbar (bold/italic/lists/align/link/image buttons) that does nothing — purely decorative buttons, `textarea` is plain text underneath.

### Homework — `src/app/dashboard/homework/page.tsx`

🟡 100% mock, includes a hand-rolled calendar widget (`buildCalendar` — actually correct date-math, reusable) that doesn't connect to any data.

### Reports — `src/app/dashboard/reports/page.tsx`

🟡 100% mock — 8 report cards, "Generate Report" buttons do nothing.

### Settings / Edit School Timing — `src/app/dashboard/settings/page.tsx`, `settings/timing/page.tsx`

🟡 Forms have no submit handler; "Current Session" field is the one real value on the page (computed from `school-calendar.ts`). Class/section/subject "chips" are read-only hardcoded lists, not editable.

### Shared components

| Component | Status | Notes |
|---|---|---|
| `Sidebar.tsx` | ✅ | Static nav, correct active-state highlighting. Hardcodes "Notices" badge count to `3` — should be dynamic once notices exist. |
| `Topbar.tsx` | 🟠 | Real logout (`supabase.auth.signOut()`). "My Profile" / "Change Password" menu items have no navigation — dead. Greeting hardcodes "Principal" — will need to become dynamic once teacher/parent share this component (they currently can't, since those routes don't exist). |
| `PageHeader.tsx`, `StatCard.tsx`, `DonutChart.tsx`, `MonthFilter.tsx`, `SessionBadge.tsx` | ✅ | Genuinely reusable, well-built, presentational-only components. Good foundation to keep building on. `SessionBadge` renders a dropdown chevron but has no click handler — decorative for now. |
| `ClassStudentsTable.tsx` | 🟠 | Only place outside Add Student with a real Supabase write (delete). |
| `lib/school-calendar.ts` | ✅ | Solid, pure, well-tested-looking date logic for the Feb–Feb session model. No changes needed structurally. |
| `lib/classes-data.ts` | 🟠 | Hardcoded array standing in for a future `classes` table — fine as a placeholder, but see Bad Architecture below for why it needs to become a real table soon. |

## 3. Bad Architecture — Current Approach → Why It's a Problem → Fix

**1. Class name is a free-text string duplicated across the app, with two incompatible naming schemes already in use.**
- *Current*: `students.class_name` is plain text. `Add Student` writes `"Class 1".."Class 8"`. `Promote Students`, `Timetable`, `Settings` all independently hardcode `"Grade 1".."Grade 8"`. `lib/classes-data.ts` uses yet a third form (`"Class 1"`, matching Add Student).
- *Why it's a problem*: A student added today via "Add Student" gets `class_name = "Class 5"`. The Promote Students page's roster lookup keys on `"Grade 5"` and will never find them. This isn't a future risk — it's a live inconsistency in the current codebase between two pages that are both already built.
- *Fix*: Create a `classes` table with a stable `id` and single canonical `name` (pick one label style, e.g. "Class 5"), reference it everywhere by `class_id`, and never hardcode the class list in more than one place (`lib/classes-data.ts` becomes a thin cached read of the table, not a source of truth). See [02-database-schema.md](02-database-schema.md).

**2. No student_enrollments / academic-session model — `class_name` is treated as "current state" with no history.**
- *Current*: There is one `class_name` column per student, period. There is no session concept anywhere in the schema.
- *Why it's a problem*: The brief's central requirement — "promote a student without destroying last year's attendance/fees/results" — is structurally impossible with a single mutable `class_name` field, because promoting a student means overwriting the only record of what class they were in.
- *Fix*: `student_enrollments(student_id, session_id, class_id, roll_number, status)`. "Current class" becomes "the enrollment row for the active session," not a column you overwrite. See file 02 and file 06.

**3. Two different Students tables with different capabilities (`/students` main list vs. `ClassStudentsTable`).**
- *Current*: The main Students page table has View/Edit/Delete buttons that are all dead. `ClassStudentsTable` (used only on the class-detail page) has a *working* delete for the same underlying data.
- *Why it's a problem*: Confusing for both the developer (two places to maintain the same row-actions logic) and eventually the user (delete works from one screen but not the other, with no visible reason why).
- *Fix*: Extract one shared `StudentRow`/`StudentsTable` component used by both pages, with actions wired once.

**4. Forms with no submit handler at all (Add Teacher, Add Exam, Add Notice, Settings, Edit Timetable).**
- *Current*: `<form>` with no `onSubmit`. Native browser behavior on submit is a full page reload/navigation to `?` with no data sent anywhere.
- *Why it's a problem*: Beyond "it doesn't save," a plain form submit without `event.preventDefault()` can actually navigate the browser away/reload, silently discarding whatever the user typed — worse than a form that visibly does nothing.
- *Fix*: Every form needs, at minimum, a client handler that calls `e.preventDefault()` and either calls a Server Action or a Supabase client call, with a loading state — following the pattern already correctly used in `students/add/page.tsx`.

**5. `alert()` / `window.confirm()` used for user feedback and confirmations.**
- *Current*: Add Student success/error and the class-table delete confirmation both use native browser dialogs.
- *Why it's a problem*: Blocks the JS thread, can't be styled, looks unprofessional next to an otherwise polished UI, and native `confirm()` dialogs are increasingly suppressed/auto-dismissed by some browsers on repeat use.
- *Fix*: A toast library (or a small custom toast context) + a reusable `<ConfirmDialog>` component. See file 04.

**6. All page logic lives inside `page.tsx` files; no `actions/`, `services/`, or `validators/` layers exist.**
- *Current*: Supabase calls, business rules (e.g., computing boys/girls/new-this-month), and markup are all interleaved in the same file.
- *Why it's a problem*: Fine at today's scale; will not stay fine once Fees/Attendance/Promotion need multi-step, transactional logic (e.g., "promote 30 students: create 30 new enrollment rows, carry forward N unpaid fee balances, all-or-nothing"). Business logic embedded in a page component can't be reused by a future teacher-facing "mark attendance" page or tested in isolation.
- *Fix*: Introduce `actions/` (Server Actions per domain), `services/` (pure functions containing business rules, callable from actions or tests), `validators/` (Zod schemas). See file 04 for the full proposed structure.

**7. No RLS policies in the repository (nothing to review — a gap, not a bug).**
- See file 03 for the full recommended policy set. Flagged here because it's as much an architecture decision (where does authorization live?) as a security one: right now, *nothing* stops a logged-in user of any role from reading or writing `students` directly from the browser, because there's no evidence any RLS policy has been applied.
