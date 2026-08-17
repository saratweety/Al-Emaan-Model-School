# Academic Sessions, Promotion, Notifications & Reports

## 1. Academic Session Architecture

The good news: `lib/school-calendar.ts` already correctly implements the Feb→Feb session math (`getSessionStartYear`, `getCurrentSessionLabel`, `getSessionMonths`) as pure, reusable functions — that logic doesn't need to change. What's missing is a **database table backing it**; today "session" is purely a client-side calculation, never stored, so nothing in the database can be scoped to "which session was this record created in."

**Design**: `academic_sessions` (file 02) — one row per year, `is_current` flag marking exactly one active session. Every table that represents a point-in-time fact — `student_enrollments`, `student_fee_records` (indirectly, via `enrollment_id`), `exams`, `timetable_entries`, `teacher_assignments`, `class_subjects` — carries a `session_id` (or reaches it via `enrollment_id`). Tables that represent *identity*, not a point-in-time fact — `students`, `teachers`, `parents`, `subjects`, `classes` — do not need a `session_id`, because they exist independent of any one year.

**Starting a new session** (a Server Action, `actions/sessions.ts`, principal-only):
1. Insert the new `academic_sessions` row, `is_current = true`.
2. Flip the previous session's `is_current` to `false` (the partial unique index from file 02 makes it impossible for two sessions to be current simultaneously — the action should do this as one transaction so that invariant is never violated even for an instant).
3. Copy `fee_structures` forward from the prior session as a starting point (principal can then adjust amounts) — saves re-entering all 11 classes' fees from scratch every year, without ever touching the *old* session's `fee_structures` rows.
4. Do **not** automatically create new `student_enrollments` — that only happens via the Promotion workflow (§2 below), which is a deliberate, reviewed action, not an automatic side effect of starting a session.
5. Do **not** touch `timetable_entries`, `teacher_assignments`, `exams`, or `attendance` from prior sessions — they stay exactly as they are, permanently readable via the Student Detail "Academic History" tab and Reports.

This is what "historical data should remain accessible" means concretely: nothing is ever deleted or overwritten when a session rolls over — a new session is purely additive.

## 2. Promotion System

Today's `/dashboard/students/promote` page is 100% disconnected mock data (file 01) — this section is the real design for what should replace it.

**Single-student promotion** (from Student Detail): one Server Action call, one enrollment inserted.
**Whole-class promotion** (the Promote Students page): same action, called in a loop inside one transaction, driven from a roster of the class's current-session `student_enrollments`.

```
function promoteStudents(studentIds[], fromClassId, toClassId, newSessionId):
  for each studentId:
    - insert student_enrollments (student_id, newSessionId, toClassId, status='active')
    - the OLD enrollment row is left completely untouched — no update, no delete
  for each REMAINING (non-promoted / "repeat") studentId in fromClassId:
    - insert student_enrollments (student_id, newSessionId, fromClassId, status='active')
    - (this is still a NEW row, not a mutation of the old one — repeating still needs its own
       attendance/fees/results bucket for the new year, distinct from the year they first attempted it)
  - generate student_fee_records for the new session for every promoted/repeating student,
    based on the destination class's fee_structures for the new session
  - leave every fee/attendance/result record tied to the OLD enrollment_id exactly as it was
  - all of the above in one DB transaction — a failure partway through must roll back entirely,
    never leaving "half the class promoted"
```

**How to promote:**
- One student — student detail page, a "Promote" action with a class picker (defaults to next class).
- Entire class — Promote Students page, bulk toggle per student (matches the existing mock UI's toggle switches — keep that interaction, wire it to the real action).

**What's preserved, concretely** (this is the brief's headline example, worked through against the schema in file 02):
> Student in Class 4, November + December fees unpaid, promoted to Class 5.

- The `student_fee_records` rows for November/December point at an `enrollment_id` belonging to the Class-4/old-session enrollment. Promotion never touches those rows.
- The new session creates a *new* `student_enrollments` row for Class 5, and *new* `student_fee_records` rows for the new session's months, referencing the *new* `enrollment_id`.
- The Student Detail Fees tab queries **all** `student_fee_records` for the student across all their `enrollment_id`s, so November/December still show as Pending, correctly labeled "Class 4," permanently — while August 2027 shows "Class 5" — both visible in the same month-by-month view, never merged or confused.

## 3. Notifications

Recommended for MVP, per the brief's "don't overcomplicate v1" instruction — **in-app only**, table already specced in file 02 (`notifications`).

| Trigger | Recipient | Event that fires it |
|---|---|---|
| Fee overdue | Parent | A `student_fee_records` row crosses into a new month still `pending`/`partial` (could be a scheduled function, or computed on-read rather than a stored notification — see note below) |
| Result published | Parent | `exams.is_published` flips true → fan out one notification per affected student's parent(s) |
| Student absent | Parent | `attendance` insert with `status='absent'` for their child |
| Upcoming exam | Parent + affected teachers | `exams` created with `start_date` within N days (or a daily check) |
| School announcement | Everyone / Teachers / Parents / one class, per `notices.audience` | `notices` insert |

**Note on fee-overdue**: rather than a stored notification per overdue month (which would need a scheduled job), the simplest MVP approach is to compute "is this parent's child currently overdue" live from `student_fee_records` whenever the parent dashboard loads, and only use the `notifications` table for genuinely event-driven pushes (absent-today, result-published, new notice). Keep it simple; add a scheduled reminder job only if it turns out parents don't check the dashboard often enough (a v1.5 concern, not MVP).

**Future** (explicitly not v1, per the brief): SMS/WhatsApp/email delivery — the `notifications` table's shape doesn't need to change to add these later, they'd just add a `delivered_via` / provider-webhook layer on top.

## 4. Reports

The mock Reports page already lists a reasonable set of 8 report types. Split by MVP relevance:

**MVP (build against real tables as each module lands):**
- Student Report (list + filters, effectively the Students list with export)
- Fee Report / Pending Fee Report (effectively the Fees / Pending Fees list with export — don't build a separate report engine, just add CSV/print export to the existing filtered list views)
- Student Attendance Report (class + date range, aggregated from `attendance`)
- Result Report (class/exam, aggregated from `results`)

**v1.5:**
- Teacher Report, Teacher Attendance Report (depends on whether teacher self-attendance is tracked at all — see dashboard note in file 05; if it's not in MVP, these reports aren't either)
- Summary Report (a dashboard-style single-page rollup of the above — genuinely just a combination view, build last)
- Student Promotion Report (list of who was promoted/repeated, per session — trivial once `student_enrollments.status` exists, low priority)

**Implementation approach**: most "reports" in this system are just an existing filtered list view plus a **Print** (browser print CSS) and **Export CSV** button — resist building a separate reporting engine/templating system for MVP. Only the Result Card (file 05) needs bespoke print layout because it's a fundamentally different shape (one student's data across subjects, not a table of many students).

## 5. Activity / Audit Logs

Per the brief, log at minimum: student archived, fee payment recorded, fee payment changed, result changed (especially post-publish), attendance changed (a correction, not the original mark), teacher account disabled. Schema in file 02 (`activity_logs`, `entity_type` + `entity_id` + `actor_id` + `metadata jsonb`).

**Where to write these**: inside the Server Action that performs the mutation, right after the write succeeds, in the same transaction where practical (e.g. `recordPayment` action writes `fee_payments` + updates `student_fee_records` + inserts one `activity_logs` row, all together). Don't rely on a database trigger for this one, since the log entry needs `actor_id` (the authenticated user), which a generic trigger doesn't have easy access to — the application layer already knows it.

**Where it's surfaced**: a simple `/dashboard/reports` (or a dedicated `/dashboard/activity`) list, filterable by entity type and date range — low priority, build once the underlying mutating actions exist and are writing to it, not before.
