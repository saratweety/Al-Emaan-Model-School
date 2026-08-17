# Feature Specifications — Principal, Teacher & Parent Modules

Per-page specs. "Exists" summarizes file 01's findings; the rest is the target design. Reusable components reference the shared list in file 04 §2.

---

## Principal Dashboard (`/dashboard`)

**Exists**: fully static (file 01). **Target**: every card below computed from real tables, not hardcoded.

| Card | Source | Calculate dynamically? |
|---|---|---|
| Total students | `count(students) where status='active'` | Yes |
| Present / absent today | `count(attendance) where date=today group by status`, joined to today's expected roster | Yes — this is the one card that meaningfully changes hour to hour |
| Teachers present today | same pattern against a future `teacher_attendance` table (not yet in file 02 — add only if teacher self-attendance is in MVP scope; otherwise cut this card, see "avoid unnecessary cards") | Yes, if built |
| Fees collected this month | `sum(fee_payments.amount) where payment_date in current month` | Yes |
| Outstanding fees | `sum(fee_amount + late_fee - discount - paid_amount) where status != 'paid'` | Yes |
| Upcoming exams | `exams where start_date > today order by start_date limit 3` | Yes |
| Recent notices | `notices order by publish_date desc limit 3` | Yes |
| School timing | `settings` table (new, or a `school_settings` singleton row) | Yes, once Settings page saves for real |

Cut from the mock version: "Teacher Arrival Today" full table on the dashboard is redundant with the Teachers page — keep a 1-line summary stat, drop the per-teacher table (avoids cluttering the dashboard, per the brief's "avoid unnecessary cards").

**Actions**: Quick Actions row (Add Student, Add Teacher, Collect Fee, Create Notice, Create Exam, Generate Report) — links already correct, keep as-is once targets are real.
**Loading**: skeleton stat cards while the 6+ queries resolve (consider `Promise.all` + `Suspense` boundaries per card group so slow queries don't block the whole page).
**Empty**: "No notices yet," "No upcoming exams" per card, not a blank space.

---

## Students Module

### Students list (`/dashboard/students`)
**Exists**: real query, fake search/filter/actions (file 01). **Target**:
- **Actions**: Add Student (✅ works) · View → `/dashboard/students/[id]` (🔴 build) · Edit → same page in edit mode or `/dashboard/students/[id]/edit` · Archive (soft delete via `status='archived'`, not a hard DB delete — preserves fee/attendance history) · Delete only if the student has zero fee/attendance/result history (otherwise force Archive).
- **Filters**: class (from real `classes` table), status (active/archived), session — all via URL params per file 04 §6.
- **Search**: name/admission-no/father-name, `ilike` query or `pg_trgm` if it needs to be fast.
- **Table columns**: keep current set, add a Fee Status pill (from current month's `student_fee_records.status`) since the brief's example table includes it.
- **Confirm dialogs**: Archive (not silent — explain what it does: "hides the student from active lists but keeps all history").
- **Reusable**: unify with `ClassStudentsTable` into one `StudentsTable` component (file 01 bad-architecture #3).

### Add Student (`/dashboard/students/add`)
**Exists**: real insert, honest "not connected yet" labels for documents (file 01). **Target**: switch `class_name` text input to a `class_id` select sourced from the `classes` table; add Zod validation (file 04 §3); wire the photo upload to Supabase Storage (a `student-photos` bucket, private, served via signed URL — not public, since it's a minor's photo); keep the fee-info section but have it create the *first* `student_fee_records` row(s) via the Server Action rather than storing `monthly_fee`/`admission_fee` directly on `students` (see file 02 migration note).

### Edit Student (🔴 missing — new page)
Same form as Add, pre-filled, `updateStudent` action. Admission number should be read-only once created (changing it retroactively breaks receipts/history references).

### Student Detail (`/dashboard/students/[id]` — 🔴 entirely missing)
Tabs: **Overview | Attendance | Fees | Results | Personal Details | Parent/Contact | Academic History**.
- **Overview**: photo, name, current class/section/roll (from the current-session `student_enrollments` row), admission no, quick stats (attendance %, fee status, last exam %).
- **Attendance tab**: monthly calendar/heatmap of present/absent/leave + running percentage, reusing the calendar-building logic already written (and reusable) in `homework/page.tsx`'s `buildCalendar()`.
- **Fees tab**: exactly the month-by-month grid already built (as mock) on `/dashboard/fees/[id]` — that page's UI should become *this* tab, driven by real `student_fee_records`, not a separate route.
- **Results tab**: list of exams with subject-wise marks, grade, percentage; link to a printable result card (brief §21).
- **Personal Details / Parent-Contact**: editable fields, DOB, address, parent info from `student_parents`.
- **Academic History**: every row from `student_enrollments` for this student across all sessions — "2025–2026: Class 4-A, Promoted" / "2026–2027: Class 5-A, Active" — this is the tab that visibly proves promotion history isn't being destroyed.
- **Loading**: skeleton per tab (lazy-load tab content, don't fetch all 7 tabs' data on first paint).
- **Error**: `notFound()` if the ID doesn't resolve to a student the current user (teacher/parent) is allowed to see — RLS will return zero rows, translate that into a proper 404/403, not a blank page.

### Promote Students (`/dashboard/students/promote`)
**Exists**: fully mock, no DB write (file 01 — this is the page most at odds with the brief's emphasis). **Target**: real roster from `student_enrollments` for the selected class + current session; "Promote" calls a Server Action that, in one transaction: inserts a new `student_enrollments` row per selected student (new session, next `class_id`), sets `status='promoted'` on the old row (or `'repeated'` for unchecked students, same session moves forward too — actually repeating students need a *new* enrollment row in the new session pointing at the *same* class, not a mutated old row, so their new-session attendance/fees are still tracked separately). Also generates the next session's `student_fee_records` for the new class's `fee_structures`, carrying forward `student_fee_records` in the old class untouched.
- Support both **single-student** promotion (from the student detail page) and **whole-class bulk** promotion (this page) — same underlying action.
- Confirm dialog before committing (bulk, semi-irreversible): "Promote 24 students from Class 5 to Class 6 for session 2027–2028? 3 students marked to repeat will stay in Class 5."

---

## Class Management

### Classes list (`/dashboard/classes`)
**Exists**: hybrid — mock card shell + real per-class count (file 01). **Target**: cards driven entirely by the `classes` table (with `display_order`), student count from `student_enrollments` for the current session (not raw `students.class_name` matching), class teacher from `teacher_assignments where is_class_teacher`.

### Class detail (`/dashboard/classes/[classId]`)
**Exists**: real student query + working delete via `ClassStudentsTable` (file 01). **Target**: switch the route param from a URL-encoded class *name* to a class *id* (avoids the "Class 1" vs "Grade 1" mismatch entirely — the brief's suggested table columns (name, father name, contact, attendance status, admission no, actions) are already close to what's built; add a live "today's attendance" column once `attendance` exists. Per the brief: **do not** add gender, due-amount, or room-number columns to this table — keep it lean.
- **Class detail page additions** (per brief §6): Class Teacher (from `teacher_assignments`), Subjects (`class_subjects`), a link to that class's Timetable, a link to that class's Attendance-taking screen, student count — all should appear as a summary strip above the student table, not buried.

---

## Teacher Module (Principal's view of teachers)

### Teachers list (`/dashboard/teachers`)
**Exists**: 100% mock (file 01). **Target**: real query against `teachers` joined to `profiles` and current-session `teacher_assignments` (for "Class Teacher" / "Subject" columns). Search/filter/pagination per file 04 §6.

### Add Teacher (`/dashboard/teachers/add`)
**Exists**: form with no submit handler at all (file 01 — the worst-off form in the app). **Target**: Server Action that (1) calls `supabase.auth.admin.createUser()` with the username/email + password from the form (service-role key, server-only — see file 03), (2) inserts the `profiles` row with `role='teacher'`, (3) inserts the `teachers` row, (4) optionally creates initial `teacher_assignments` if class/subject were picked on this form. Wrap in a transaction where possible; if the auth user creation succeeds but a later insert fails, the action must clean up the orphaned auth user rather than leaving a login with no teacher record.

### Assign Classes / Subjects / Timetable Periods
Not a standalone page in the current mock — recommend a **Teacher Detail page** (`/dashboard/teachers/[id]`) with tabs: **Overview | Assignments | Timetable | Attendance**. Assignments tab: a simple "add row: class + subject + session" form writing to `teacher_assignments`, enforcing the one-teacher-per-class-per-subject-per-session unique constraint from file 02 (surface the conflict as a friendly error).

### Disable Teacher
Sets `profiles.is_active = false` — do **not** delete the `teachers` row or their `profiles` row (preserves their historical `results.entered_by`, `attendance.marked_by` references). Confirm dialog explaining the effect ("They will no longer be able to log in. Their past attendance and marks records are kept.")

**Teacher → Subject → Class → Timetable relationship, stated plainly**: a `teacher_assignments` row says "this teacher teaches this subject to this class, this session." A `timetable_entries` row says "this class has this subject (and therefore, looked up via `teacher_assignments`, this teacher) at this day/period." The timetable doesn't store the teacher redundantly if you're willing to join through `teacher_assignments`; the schema in file 02 stores `teacher_id` directly on `timetable_entries` too, as a pragmatic denormalization to keep timetable queries a single-table read (a small, deliberate exception to "avoid storing data twice," justified by how often the timetable is read vs. written) — just make sure the Server Action that writes a timetable entry validates that the `teacher_id` matches an actual `teacher_assignments` row for that class/subject/session, so the two never drift apart.

---

## Attendance

### Attendance page — Principal's review view (`/dashboard/attendance`)
**Exists**: 100% mock table + donut chart (file 01). **Target**: real per-class-per-day rollup from `attendance`, date picker (defaults to today) driving a real query, class filter, search by student. Donut chart component (`DonutChart.tsx`, already reusable) fed real present/absent/leave totals.

### Teacher's "Take Attendance" screen (🔴 missing — belongs under `/teacher`, not `/dashboard`)
The brief is explicit: teachers normally mark attendance, principal reviews/corrects. This screen doesn't exist in the mock UI at all (the closest thing, `/dashboard/attendance`, is a principal read-only rollup). Design: teacher selects their assigned class (if they have more than one) → today's date (editable within a grace window) → roster with Present/Absent/Leave/Late toggle per student (default Present, so the teacher only touches exceptions) → "Save Attendance." Upsert semantics (file 02's unique `(student_id, date)` constraint) — resubmitting the same day updates rather than duplicating, which is also how the principal's "correct attendance" workflow reuses the identical action with a role check that allows it beyond the teacher's grace window.

**Daily workflow**: Teacher marks → saved to `attendance` → principal's page reads the same table (no separate "pending approval" state needed for MVP — keep it simple per the brief; add an approval step only if experience shows teachers make frequent mistakes).
**Duplicate protection**: DB unique constraint (file 02) + action does `upsert` not `insert`.
**Attendance percentage**: `present_days / (present_days + absent_days)` — decide whether `leave` counts as present or is excluded entirely; recommend excluding `leave` from the denominator (a student on approved leave shouldn't be penalized), decide once and apply everywhere (student detail tab, parent view, reports).
**Parent view**: read-only version of the student's Attendance tab (file 05 §Student Detail), scoped by RLS to their own children.

---

## Fees

### Fees list (`/dashboard/fees`)
**Exists**: real month/status URL filtering, mock table data (file 01 — good scaffolding, needs a real data source). **Target**: query `student_fee_records` joined to `students`/`student_enrollments` for the selected month, `status` filter working against the real enum. Class-wise and Sibling-wise toggle buttons (currently decorative) become real groupings.

### Fee detail (`/dashboard/fees/[id]` → fold into Student Detail's Fees tab, see above)
Rather than a standalone route keyed by a loosely-typed `id`, make this the Fees tab of the Student Detail page — avoids the exact bug found in file 01 (the mock page ignores its own `id` param). Month grid (Paid/Pending/Partial/Upcoming, current class highlighted, previous 3 months emphasized per the brief) is already well-designed in the mock — keep the visual design, swap the data source.

### Pending Fees — separate page? **Yes, recommended.**
The brief asks "determine whether a separate page is needed" — given fee collection is a daily operational task distinct from browsing all students, yes: `/dashboard/fees/pending` (or a `?status=pending` view of the existing Fees list, which the URL-param pattern already supports today — **this can literally be the existing Fees page with the filter applied**, no new route needed, matching what's already partially built).
- Columns per the brief: Student, Class, Months Pending, Previous Due, Current Due, Total Due, Action.
- Filters: class, section, 1/2/3+ months pending tiers (matches the dashboard's mock "2–3+ months pending" tiles — make those tiles link here with the tier pre-filtered).

### Fee Structure (🔴 missing page)
`/dashboard/fees/structure` — table of `fee_structures` rows (class × current session), editable admission/monthly/exam fee per class. Needed before Add Student can look up a real monthly fee instead of the principal typing it per-student.

### Collect Fee action
Modal (not a full page) launched from Fees list, Pending Fees list, or Student Detail's Fees tab: pick month(s) to pay (can span multiple pending months in one transaction), amount, method, notes → `recordPayment` Server Action → inserts `fee_payments`, updates `student_fee_records.paid_amount`/`status`, generates `receipt_no` server-side, shows a printable receipt (brief §12 — logo, student, class, roll no, months paid, amount, method, date, received-by, Print/Download PDF buttons).

---

## Exams & Results

### Exams list / Add Exam
**Exists**: 100% mock, Add Exam form has no submit handler at all (file 01). **Target**: real `exams` + `exam_subjects` rows. Add Exam form should, after the base exam fields, let the principal pick which subjects apply (defaulting to that class's `class_subjects`) and set max/passing marks per subject in the same form — avoids a second trip to configure subjects.

### Marks Entry (🔴 missing page — belongs primarily under `/teacher`)
Per the brief's workflow (**teacher enters → principal reviews/publishes → parent sees**): `/teacher/exams/[examId]/[subjectId]/marks` — roster with Total (read-only, from `exam_subjects.max_marks`) and Obtained (editable) columns, "Save Marks" writing to `results`. Principal sees the same screen (reused component) with an added "Publish" action once all subjects for that exam are in.

### Results (`/dashboard/results`)
**Exists**: 100% mock overview + top performers (file 01). **Target**: real aggregation — pass % per class/exam from `results` joined to `exam_subjects`. **Publish/unpublish** toggle per exam gates parent visibility (`exams.is_published`). Per the brief's open question — "editable after publication?" — recommendation: **teachers lose edit access on publish (RLS in file 03 already encodes this); principal retains edit access, logged to `activity_logs`** so a post-publish correction is visible/auditable rather than silently allowed or fully blocked.

### Result Card (🔴 missing — printable view)
Per brief §21: school logo, name, student name, father name, roll no, class/section, exam name, subject-wise marks/grade, total, percentage, overall grade, position (computed via a window function ranking students by percentage within their class+exam), attendance %, teacher remarks, signature lines. Build as a print-optimized route (`/dashboard/results/[examId]/[studentId]/card`) using `@media print` CSS rather than a PDF library initially — simpler, and "Print" from the browser already produces a clean PDF via "Save as PDF."

---

## Subjects (🔴 missing page — needed once `subjects`/`class_subjects` exist)
`/dashboard/subjects` — flat list of subjects (create/rename/delete-if-unused), plus per-class assignment (checkboxes: which of this class's subjects are active, per session). Reinforces the brief's "Mathematics is one subject, assigned to many classes" model — the UI should make it structurally impossible to create "Mathematics (Grade 5)" as a separate subject from "Mathematics (Grade 6)."

## Timetable
**Exists**: today/weekly view (real UI, mock data), edit form with no save handler (file 01). **Target**: `timetable_entries` read for the "Today"/"Weekly" grids; Edit page's per-cell subject `<select>` becomes a subject+teacher combined picker (teacher list filtered to teachers with a `teacher_assignments` row for that class+subject), save action enforces the teacher-conflict unique index from file 02 and surfaces a friendly "This teacher is already scheduled elsewhere at this time" error rather than a raw constraint violation.
- **Teacher's own timetable**: `/teacher/timetable` — same grid, pre-filtered to `timetable_entries.teacher_id = current teacher`.
- **Parent's view**: `/parent/timetable` — pre-filtered to the child's class, read-only.

---

## Parent Module (`/parent/**` — 🔴 entirely missing)

- **Multiple children**: supported structurally by `student_parents` (many-to-many). UI needs a **child switcher** (dropdown in the topbar, matching the brief's "Switch Student" mock: "Ali – Grade 5 / Ayesha – Grade 2") that sets which child's data the rest of the parent UI queries — store the selection in a URL param (`/parent?child=<id>`) or a short-lived cookie, not just component state, so deep links work.
- **Dashboard**: child overview card (photo, class, roll no) + 4 stat cards (Attendance %, Fees pending amount, Latest result %, Homework pending count) + latest notices — same visual language as the principal dashboard's stat cards, reused component.
- **Attendance**: read-only version of the student-detail Attendance tab.
- **Fees / Pending Fees**: read-only version of the Fees tab, with Download Receipt for past payments.
- **Results**: read-only, **published exams only** (RLS-enforced, not just hidden in the UI).
- **Timetable**: read-only, child's class.
- **Notifications**: fee overdue, result published, child absent, upcoming exam, announcements — the `notifications` table (file 02), filtered to `recipient_id = auth.uid()`.

Everything in the parent UI is **read-only** except: marking notifications read, and (later, non-MVP) downloading PDFs. No create/edit/delete anywhere in this module — enforce both in the UI (no buttons) and in RLS (no write policies for `parent`).

## Teacher Module (`/teacher/**` — 🔴 entirely missing)

- **Dashboard**: My Classes list, today's summary (classes today, attendance pending count, marks pending count, homework posted count), quick actions (Mark Attendance, Enter Marks, Post Homework) — matches the brief's mock closely.
- **My Classes / Student List**: read-only roster of assigned classes' students (view only — brief is explicit teachers cannot edit/delete students).
- **Take Attendance**: see Attendance §above.
- **Enter Marks**: see Exams §above.
- **My Timetable**: see Timetable §above.
- **Homework**: post/edit homework for their own assigned class+subject only (`homework` table not yet in file 02 — add if homework is in MVP scope, see file 07 MVP-vs-future split).
- **Profile**: view own `teachers`/`profiles` row, change own password.

**Explicit permission boundary (per the brief) — what a teacher can/cannot do:**
| Action | Teacher |
|---|---|
| View assigned classes' students | ✅ view only |
| Edit/delete a student record | ❌ |
| Mark/edit attendance for assigned classes | ✅ |
| Change school fees / record payments | ❌ |
| Enter marks for assigned subject/class, before publish | ✅ |
| Edit marks after principal publishes | ❌ (principal only, logged) |
| View own timetable | ✅ |
| Edit timetable | ❌ (principal only) |
| Post homework/class announcements | ✅ (own class/subject only) |
| See another teacher's classes/students | ❌ |
