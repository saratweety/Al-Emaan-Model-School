# Authentication, Authorization & Security

## 1. Authentication Design

### What exists today (verified)
- **Login** (`AuthCard.tsx`): `supabase.auth.signInWithPassword({email, password})` → on success, `select role from profiles where id = user.id` → redirect via a `roleRedirects` map to `/dashboard`, `/teacher`, or `/parent`.
- **Logout** (`Topbar.tsx`): `supabase.auth.signOut()` → `router.push("/")`. Correct.
- **Route protection**: `src/app/dashboard/layout.tsx` runs on the server for every request under `/dashboard/**`: gets the user, redirects to `/` if absent, fetches `profiles.role`, redirects to `/` if not `"principal"`. This is a sound pattern (server-side, can't be bypassed by disabling JS) and should be the template for `teacher` and `parent` layouts.
- **Signup**: fake (see file 01) — needs to be removed from the public page.

### Gaps to close (in priority order)

1. **Create `/teacher` and `/parent` route groups with the same layout-guard pattern.**
   ```
   src/app/teacher/layout.tsx   → redirect to "/" unless profiles.role === "teacher"
   src/app/parent/layout.tsx    → redirect to "/" unless profiles.role === "parent"
   ```
   Also add an `is_active` check (from `profiles.is_active`) so a disabled teacher/parent account is rejected even with valid credentials — the brief explicitly asks for an "account disabled" status.

2. **Add `middleware.ts`** using the standard `@supabase/ssr` pattern: call `supabase.auth.getUser()` on every request to refresh the session cookie, matching all paths except static assets. This doesn't replace the layout guard (keep both — middleware refreshes the session, the layout enforces the role), it prevents silent session expiry.

3. **Remove the Sign Up tab from `AuthCard.tsx`.** Replace with: principal creates teacher/parent accounts from `/dashboard/teachers/add` and a future `/dashboard/parents` flow, using `supabase.auth.admin.createUser()` — which requires the **service-role key** and therefore **must run in a Server Action or Route Handler, never in the browser**. This is the correct place to introduce the service-role key into the project for the first time — store it as `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) and only reference it from server-only files.

4. **Wire up Forgot Password / Reset Password**: `supabase.auth.resetPasswordForEmail(email, { redirectTo: ".../reset-password" })` + a `/reset-password` page calling `supabase.auth.updateUser({ password })`. Needed before real parents/teachers are onboarded (they will forget passwords).

5. **"Change Password" in the Topbar menu** should open a modal calling `supabase.auth.updateUser({ password })` while already logged in.

6. **Unauthorized page**: currently any denied access silently redirects to `/`. Consider a dedicated `/unauthorized` page so a teacher who manually types `/dashboard/students` gets a clear "you don't have access" message instead of being bounced to login with no explanation (better UX, same security outcome).

### Redirect map (confirmed working, extend as routes are built)
| Role | Redirect | Status |
|---|---|---|
| principal | `/dashboard` | ✅ works |
| teacher | `/teacher` | 🔴 route doesn't exist yet |
| parent | `/parent` | 🔴 route doesn't exist yet |

---

## 2. Row Level Security (RLS) Strategy

No RLS policies exist in the repo today (no SQL migrations found). **Every table in file 02 needs `alter table ... enable row level security;` plus explicit policies before it holds real data** — Supabase tables default to fully open to any authenticated (or even anonymous, depending on grants) client once RLS is off, which is the single most common way school-management side-projects leak student data.

### Helper pattern
Define a SQL helper once and reuse it in every policy, rather than repeating the `profiles` subquery everywhere:

```sql
create or replace function auth.user_role() returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth.is_principal() returns boolean as $$
  select auth.user_role() = 'principal';
$$ language sql stable security definer;
```

### Per-table policy summary

| Table | Principal | Teacher | Parent |
|---|---|---|---|
| `profiles` | full read/write | read own row only | read own row only |
| `students` | full read/write | read only students in `teacher_assignments`-linked classes for the current session | read only own children (via `student_parents`) |
| `student_enrollments` | full read/write | read for assigned classes | read for own children |
| `classes`, `subjects`, `academic_sessions`, `timetable_periods` | full read/write | read all (reference data) | read all (reference data) |
| `teacher_assignments` | full read/write | read own assignments | no access |
| `attendance` | full read/write (correction workflow) | **insert/update only for their assigned class's students, only for today or a principal-configured grace window**; read own classes | read only own children's rows |
| `student_fee_records`, `fee_payments` | full read/write | no access (fees are principal-only per the brief) | read only own children's rows; no write |
| `fee_structures` | full read/write | read (reference) | read (reference) |
| `exams`, `exam_subjects` | full read/write | read/write only for assigned class + subject | read only published exams for own children's class |
| `results` | full read/write, including after publish | insert/update only for their assigned subject's students, **only while `exams.is_published = false`** | read only **published** results (`exams.is_published = true`) for own children |
| `timetable_entries` | full read/write | read own classes | read own children's class |
| `notices` | full read/write | read (scoped by audience) | read (scoped by audience) |
| `notifications` | full read/write | read/update (`is_read`) own rows only | read/update (`is_read`) own rows only |
| `activity_logs` | read-only (system-written) | no access | no access |

### Example policies (representative, not exhaustive — write the rest by mirroring these)

```sql
-- students: principal full access
create policy "principal_full_access_students" on students
  for all using (auth.is_principal()) with check (auth.is_principal());

-- students: teacher can read students in their assigned classes, current session
create policy "teacher_read_assigned_students" on students
  for select using (
    exists (
      select 1 from student_enrollments se
      join teacher_assignments ta on ta.class_id = se.class_id and ta.session_id = se.session_id
      join academic_sessions s on s.id = se.session_id and s.is_current
      where se.student_id = students.id and ta.teacher_id = auth.uid()
    )
  );

-- students: parent can read only their own children
create policy "parent_read_own_children" on students
  for select using (
    exists (
      select 1 from student_parents sp
      where sp.student_id = students.id and sp.parent_id = auth.uid()
    )
  );

-- attendance: teacher can insert/update only for their own assigned class, and only recent dates
create policy "teacher_mark_attendance" on attendance
  for insert with check (
    marked_by = auth.uid()
    and exists (
      select 1 from teacher_assignments ta
      join academic_sessions s on s.id = ta.session_id and s.is_current
      where ta.teacher_id = auth.uid() and ta.class_id = attendance.class_id
    )
    and date >= current_date - interval '3 days'
  );

-- results: teacher can only write while the exam is unpublished
create policy "teacher_enter_marks_before_publish" on results
  for insert with check (
    entered_by = auth.uid()
    and exists (
      select 1 from exam_subjects es
      join exams e on e.id = es.exam_id and e.is_published = false
      join teacher_assignments ta on ta.subject_id = es.subject_id and ta.class_id = e.class_id
      where es.id = results.exam_subject_id and ta.teacher_id = auth.uid()
    )
  );
```

### Operations that should go through Server Actions instead of direct browser RLS-gated writes

Some operations are either (a) multi-table and need to be transactional, (b) require the service-role key, or (c) have business rules too complex to express safely as a single RLS `check` clause. These should be Server Actions (server-only code, using the server Supabase client — still respecting RLS unless deliberately using the service key for admin tasks):

- **Creating a teacher/parent login** — needs `auth.admin.createUser()` (service role).
- **Promoting students** — must insert N `student_enrollments` rows and update `student_enrollments.status` on the prior rows atomically; a partial failure must not leave some students promoted and others not.
- **Recording a fee payment** — must insert into `fee_payments` *and* update `student_fee_records.paid_amount`/`status` together.
- **Publishing an exam** — flips `exams.is_published`, which changes what parents can see; should also be the trigger point for a `result_published` notification fan-out.
- **Disabling a teacher/parent account** — sets `profiles.is_active = false`; should also invalidate their existing sessions if possible.

---

## 3. Security Audit

| Risk | Found? | Fix |
|---|---|---|
| Service-role key exposed in frontend | ❌ Not found — good. `.env.local` only has the publishable key. | Keep it that way; when it's introduced (for admin user creation), store as `SUPABASE_SERVICE_ROLE_KEY`, reference only from `"use server"` files, and add it to `.env.example` with a loud comment, never commit the real value. |
| Missing RLS | ⚠️ Cannot confirm presence or absence from code (no migrations in repo) — must be verified directly in the Supabase dashboard. Treat as **not yet enabled** until confirmed, and do not add more tables without RLS from day one. | Enable RLS + write policies per table 2 above, as each table is created — never as a follow-up step. |
| Client-side-only role checking | ❌ Not found — role check happens server-side in `dashboard/layout.tsx`. Good pattern, must be replicated for `/teacher` and `/parent`. | Keep doing this; never trust a client-side `if (role === 'principal')` as the *only* gate for a sensitive action — always back it with RLS. |
| SQL injection | ❌ Not applicable — all queries go through the Supabase JS client's parameterized query builder, no raw SQL string concatenation found anywhere. | No action needed; keep avoiding `.rpc()` calls that concatenate user input into SQL. |
| Insecure API routes | N/A — no API routes/route handlers exist yet. | When Server Actions/Route Handlers are added (fee payments, promotion), always re-derive the current user's role server-side from `profiles`, never trust a role passed in the request body. |
| Sensitive student data exposure | ⚠️ Currently mitigated only by the fact that most tables don't exist yet. Once `students` holds real names/contacts/photos and RLS isn't enabled, any authenticated user (any role) could read all of it. | Priority: enable RLS on `students` **before** entering real student data, not after. |
| Incorrect env var usage | ❌ Not found. `NEXT_PUBLIC_*` prefix used correctly only for the URL and publishable key. | Continue the convention: anything without `NEXT_PUBLIC_` must never be imported into a `"use client"` file. |
| User manually changing IDs in URL (IDOR) | ⚠️ Not yet testable — `/dashboard/fees/[id]` doesn't even use its `id` param yet (see file 01), so there's nothing to exploit today, but this is exactly the shape of bug RLS must prevent once it's wired: a parent must not be able to change `/parent/fees/<other-child-id>` and see it. | Enforce via RLS (parent policies above), not via "hide the link in the UI" — the URL is always guessable/typeable. |
| Unauthorized teacher/parent access | N/A yet — those roles don't have routes. | Build the layout guards (§1) and RLS policies (§2) together, from the first commit that creates `/teacher` or `/parent`. |
| Password storage | ✅ Handled entirely by Supabase Auth (bcrypt-hashed, never touched by app code). No action needed. | — |

### Immediate action items, in order
1. Confirm in the Supabase dashboard whether RLS is currently enabled on `students`/`profiles`. If not, enable it today, even before other tables are built — this is a live data-exposure gap right now, not a future one.
2. Remove the fake Sign Up flow from the public login page.
3. Add `middleware.ts` for session refresh.
4. Build `/teacher` and `/parent` layout guards *before* building any teacher/parent-facing pages, so there's never a moment where those routes exist unprotected.
