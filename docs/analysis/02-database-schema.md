# Recommended Supabase Database Schema

This is the full schema needed to support the MVP roadmap in file 07. Tables marked **EXISTS** are confirmed live (referenced by working code in the repo); everything else is **NEW**. Types are Postgres/Supabase conventions (`uuid`, `timestamptz`, `numeric`, `text`, `date`).

General conventions used throughout:
- Every table has `id uuid primary key default gen_random_uuid()`.
- Every table has `created_at timestamptz not null default now()`; mutable tables also get `updated_at timestamptz not null default now()` (bump via trigger).
- Foreign keys use `on delete restrict` by default (never silently cascade-delete a student's fee history) except join/child tables that are meaningless without their parent (e.g. `exam_subjects`), which use `on delete cascade`.
- Money fields are `numeric(10,2)`, never `float`.
- "Status" fields are Postgres `enum` types, not free text, so invalid values are impossible at the DB layer.

---

## Core identity & roles

### `profiles` — **EXISTS**
Extends `auth.users` with app-specific role info. One row per authenticated user (principal, teacher, or parent).

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, FK → `auth.users.id`, `on delete cascade` |
| `role` | `user_role` enum (`principal`,`teacher`,`parent`) | not null |
| `full_name` | text | not null |
| `phone` | text | nullable |
| `is_active` | boolean | not null default true — used to "disable" a teacher/parent login without deleting history |
| `created_at` | timestamptz | not null default now() |

*Index*: none beyond PK needed at this scale; `role` could get a btree index once teacher/parent counts grow.

---

## Academic structure

### `academic_sessions` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `label` | text | not null, unique — e.g. `"2026–2027"` |
| `start_date` | date | not null — e.g. `2026-02-01` |
| `end_date` | date | not null — e.g. `2027-01-31` |
| `is_current` | boolean | not null default false — **exactly one row should be true**; enforce with a partial unique index: `create unique index one_current_session on academic_sessions (is_current) where is_current` |
| `created_at` | timestamptz | |

### `classes` — NEW (replaces the free-text `class_name`)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | not null, unique — canonical list: Playgroup, Nursery, Prep, Class 1…Class 8 |
| `display_order` | int | not null — for sorting cards/dropdowns in curriculum order, not alphabetical |
| `created_at` | timestamptz | |

*Note*: sections (A/B) are referenced throughout the mock UI (`Grade 5-A`). Recommend a `sections` table too if you need more than one section per class; otherwise, add a `default_section text` to `classes` and only introduce a real `sections` table when a class actually splits (keep MVP simple per the brief's "avoid overengineering" instruction).

### `sections` — NEW (only if multi-section is needed at launch; otherwise defer)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `class_id` | uuid | FK → `classes.id`, not null |
| `name` | text | not null — "A", "B" |
| unique | | `(class_id, name)` |

### `subjects` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | not null, unique — "Mathematics", not duplicated per class |
| `created_at` | timestamptz | |

### `class_subjects` — NEW (join table: which subjects apply to which class)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `class_id` | uuid | FK → `classes.id`, not null |
| `subject_id` | uuid | FK → `subjects.id`, not null |
| `session_id` | uuid | FK → `academic_sessions.id`, not null — curriculum can change year to year |
| unique | | `(class_id, subject_id, session_id)` |

---

## People

### `students` — **EXISTS, needs migration**
Current live columns (confirmed by code): `id, admission_no, full_name, father_name, date_of_birth, gender, class_name, contact_number, monthly_fee, admission_fee, created_by, created_at, admission_date`.

Recommended final shape — split "identity" (stable) from "current class" (moves to `student_enrollments`):

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `admission_no` | text | not null, unique |
| `full_name` | text | not null |
| `father_name` | text | not null |
| `mother_name` | text | nullable |
| `date_of_birth` | date | nullable |
| `gender` | `gender` enum (`male`,`female`) | nullable |
| `contact_number` | text | nullable |
| `address` | text | nullable |
| `admission_date` | date | not null default `current_date` |
| `photo_url` | text | nullable — Supabase Storage path, once wired |
| `status` | `student_status` enum (`active`,`archived`,`transferred`) | not null default `active` |
| `emergency_contact` | text | nullable |
| `created_by` | uuid | FK → `profiles.id`, not null |
| `created_at` / `updated_at` | timestamptz | |

*Remove*: `class_name`, `monthly_fee`, `admission_fee` — class moves to `student_enrollments`; fee amounts move to `fee_structures` (per-class, per-session) so they aren't duplicated per student unless a discount applies (see `student_fee_overrides` below).

*Indexes*: `admission_no` (unique, already implied), `full_name` (for search — consider a `pg_trgm` GIN index if search-by-partial-name needs to be fast at scale).

### `student_enrollments` — NEW (the most important new table — enables promotion without history loss)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.id`, not null |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `class_id` | uuid | FK → `classes.id`, not null |
| `section_id` | uuid | FK → `sections.id`, nullable (if sections used) |
| `roll_number` | text | nullable |
| `status` | `enrollment_status` enum (`active`,`promoted`,`repeated`,`transferred_out`,`left`) | not null default `active` |
| `created_at` | timestamptz | |
| unique | | `(student_id, session_id)` — a student has exactly one enrollment per session |

"What class is this student in right now?" = the enrollment row where `session_id = current session`. Promotion = **insert a new row** for the new session; never update the old one.

### `parents` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, FK → `profiles.id` (a parent is a profile with `role = 'parent'`) |
| `occupation` | text | nullable |
| `cnic` | text | nullable |
| `created_at` | timestamptz | |

### `student_parents` — NEW (many-to-many: one parent, multiple children; one child, up to 2 parents/guardians)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.id`, not null |
| `parent_id` | uuid | FK → `parents.id`, not null |
| `relationship` | text | not null — "Father", "Mother", "Guardian" |
| unique | | `(student_id, parent_id)` |

### `teachers` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, FK → `profiles.id` |
| `teacher_code` | text | not null, unique — "T001" style |
| `cnic` | text | nullable |
| `qualification` | text | nullable |
| `specialization_subject_id` | uuid | FK → `subjects.id`, nullable |
| `experience_years` | int | nullable |
| `joining_date` | date | nullable |
| `photo_url` | text | nullable |
| `created_at` / `updated_at` | timestamptz | |

### `teacher_assignments` — NEW (Teacher → Subject → Class, per session)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `teacher_id` | uuid | FK → `teachers.id`, not null |
| `class_id` | uuid | FK → `classes.id`, not null |
| `subject_id` | uuid | FK → `subjects.id`, not null |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `is_class_teacher` | boolean | not null default false — one row per class/session should have this true |
| unique | | `(class_id, subject_id, session_id)` — one teacher per subject per class per session |

---

## Timetable

### `timetable_periods` — NEW (the period grid — "Period 1 = 8:00–8:40", shared across the school)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `period_number` | int | not null, unique — 1..7 |
| `start_time` | time | not null |
| `end_time` | time | not null |
| `is_break` | boolean | not null default false |

### `timetable_entries` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `class_id` | uuid | FK → `classes.id`, not null |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `day_of_week` | int | not null, check `between 0 and 6` |
| `period_id` | uuid | FK → `timetable_periods.id`, not null |
| `subject_id` | uuid | FK → `subjects.id`, nullable (null = break/free) |
| `teacher_id` | uuid | FK → `teachers.id`, nullable |
| unique | | `(class_id, session_id, day_of_week, period_id)` — one entry per class/day/period |

*Teacher-conflict prevention*: add a second unique index `(teacher_id, session_id, day_of_week, period_id)` **where `teacher_id` is not null** — this is what makes "one teacher can't be in two classes at the same period" a database-enforced guarantee, not just a UI check.

---

## Attendance

### `attendance` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.id`, not null |
| `class_id` | uuid | FK → `classes.id`, not null — denormalized snapshot of the class at time of marking, so a later promotion doesn't rewrite past attendance's apparent class |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `date` | date | not null |
| `status` | `attendance_status` enum (`present`,`absent`,`leave`,`late`) | not null |
| `marked_by` | uuid | FK → `profiles.id`, not null |
| `created_at` / `updated_at` | timestamptz | |
| unique | | `(student_id, date)` — **this is the duplicate-attendance guard**: a second insert for the same student/date must be an `upsert` (update), never a second row |

*Index*: `(class_id, date)` — this is the query pattern for "take attendance for Class 5 on 11 Aug" and "class attendance report for a date."

---

## Fees

### `fee_structures` — NEW (per class, per session — replaces per-student `monthly_fee`/`admission_fee`)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `class_id` | uuid | FK → `classes.id`, not null |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `admission_fee` | numeric(10,2) | not null default 0 |
| `monthly_fee` | numeric(10,2) | not null |
| `exam_fee` | numeric(10,2) | not null default 0 |
| unique | | `(class_id, session_id)` |

### `student_fee_records` — NEW (one row per student per month — the core of the fee module)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_id` | uuid | FK → `students.id`, not null |
| `enrollment_id` | uuid | FK → `student_enrollments.id`, not null — ties the fee month to the class/session the student was in *at that time*, so promotion never rewrites it |
| `month` | date | not null — always the 1st of the month, e.g. `2026-11-01` |
| `fee_amount` | numeric(10,2) | not null |
| `discount_amount` | numeric(10,2) | not null default 0 |
| `late_fee_amount` | numeric(10,2) | not null default 0 |
| `paid_amount` | numeric(10,2) | not null default 0 |
| `status` | `fee_status` enum (`pending`,`partial`,`paid`,`waived`) | not null default `pending` — kept as a real column (not computed) for fast filtering, but should be kept in sync via a trigger or view that compares `paid_amount` to `fee_amount + late_fee_amount - discount_amount` |
| `created_at` | timestamptz | |
| unique | | `(student_id, month)` — one fee record per student per month, **regardless of which class they were in** |

This is the table that directly satisfies the brief's "Class 4 unpaid Nov/Dec must survive promotion to Class 5" requirement: the row is keyed to `student_id` + `month`, not to the student's current class, and it's never deleted or overwritten by the promotion process — promotion only ever inserts new `student_enrollments` and new future months' `student_fee_records`.

### `fee_payments` — NEW (transaction log — supports partial payments across multiple months in one visit)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `student_fee_record_id` | uuid | FK → `student_fee_records.id`, not null |
| `amount` | numeric(10,2) | not null, check `> 0` |
| `payment_date` | date | not null default `current_date` |
| `payment_method` | `payment_method` enum (`cash`,`bank_transfer`,`online`,`cheque`) | not null |
| `receipt_no` | text | not null, unique |
| `received_by` | uuid | FK → `profiles.id`, not null |
| `notes` | text | nullable |
| `created_at` | timestamptz | |

*A payment updates `student_fee_records.paid_amount` (and derived `status`) via a trigger or a server-action transaction — never let the client update both tables independently.*

---

## Exams & Results

### `exams` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `session_id` | uuid | FK → `academic_sessions.id`, not null |
| `name` | text | not null — "Mid Term Exam 2026" |
| `exam_type` | `exam_type` enum (`mid_term`,`final_term`,`monthly_test`,`class_test`,`quiz`) | not null |
| `class_id` | uuid | FK → `classes.id`, not null — one exam row per class (an "All Classes" mid-term is N rows, one per class, not one row) |
| `start_date` / `end_date` | date | not null |
| `is_published` | boolean | not null default false — gates parent/student visibility |
| `created_by` | uuid | FK → `profiles.id`, not null |
| `created_at` | timestamptz | |

### `exam_subjects` — NEW (max marks, passing marks per subject per exam)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `exam_id` | uuid | FK → `exams.id`, `on delete cascade` |
| `subject_id` | uuid | FK → `subjects.id`, not null |
| `max_marks` | numeric(6,2) | not null |
| `passing_marks` | numeric(6,2) | not null |
| unique | | `(exam_id, subject_id)` |

### `results` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `exam_subject_id` | uuid | FK → `exam_subjects.id`, `on delete cascade` |
| `student_id` | uuid | FK → `students.id`, not null |
| `obtained_marks` | numeric(6,2) | not null |
| `remarks` | text | nullable |
| `entered_by` | uuid | FK → `profiles.id`, not null — the teacher |
| `entered_at` | timestamptz | not null default now() |
| unique | | `(exam_subject_id, student_id)` |

*Grade/percentage/pass-fail are derived (obtained/max, compared to `exam_subjects.passing_marks` and a school-wide grade scale from `settings`) — compute in a view or at query time, don't store redundantly.* Editing after `exams.is_published = true` should require re-confirmation in the UI (see file 05) — the brief leaves this as a judgment call; recommend: **teachers can no longer edit after publish; principal can, with the edit logged to `activity_logs`.**

---

## Notifications, Reports, Audit

### `notifications` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `recipient_id` | uuid | FK → `profiles.id`, not null |
| `type` | `notification_type` enum (`fee_overdue`,`result_published`,`attendance_absent`,`exam_upcoming`,`announcement`) | not null |
| `title` | text | not null |
| `body` | text | nullable |
| `link` | text | nullable — in-app route to open on click |
| `is_read` | boolean | not null default false |
| `created_at` | timestamptz | |

### `notices` — NEW (school-wide announcements — distinct from personal `notifications`)
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | not null |
| `description` | text | not null |
| `notice_type` | `notice_type` enum (`holiday`,`event`,`general`,`reminder`) | not null |
| `audience` | `notice_audience` enum (`everyone`,`teachers`,`parents`,`class`) | not null |
| `class_id` | uuid | FK → `classes.id`, nullable — set only when `audience = 'class'` |
| `publish_date` | date | not null |
| `expiry_date` | date | nullable |
| `attachment_url` | text | nullable |
| `created_by` | uuid | FK → `profiles.id`, not null |
| `created_at` | timestamptz | |

### `activity_logs` — NEW
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `actor_id` | uuid | FK → `profiles.id`, not null |
| `action` | text | not null — "student.archived", "fee_payment.recorded", "result.changed_after_publish" |
| `entity_type` | text | not null — "student", "fee_payment", "result" |
| `entity_id` | uuid | not null |
| `metadata` | jsonb | nullable — before/after values for changed fields |
| `created_at` | timestamptz | not null default now() |

*Index*: `(entity_type, entity_id)` for "show me the history of this record."

---

## Entity-Relationship Summary

```
academic_sessions ──┬── student_enrollments ──── students ──┬── student_parents ──── parents (profiles)
                     │         │                             ├── attendance
                     │         │                             ├── student_fee_records ── fee_payments
                     │         │                             └── results
                     ├── classes ──┬── class_subjects ── subjects
                     │             ├── teacher_assignments ── teachers (profiles)
                     │             ├── timetable_entries ── timetable_periods
                     │             ├── fee_structures
                     │             └── exams ── exam_subjects ── results
                     └── notices
```

Key relationships, stated plainly (per the brief's ask):
- One class has many students **per session**, via `student_enrollments` — not directly.
- One student has one *active* enrollment per session, and many enrollments over their years at the school (full history preserved).
- One teacher can teach multiple subjects, in multiple classes, via `teacher_assignments` (all scoped to a session).
- One subject is one row, reused across every class that teaches it (`class_subjects` links it, doesn't duplicate it) — directly satisfies the brief's "Mathematics should be one subject, not duplicated per class."
- One parent can have multiple children, and one child can have multiple guardians, via `student_parents`.
- One student has many `student_fee_records` (one per month) across many sessions — never overwritten by promotion.
- One exam has many `exam_subjects`, each of which has many `results` (one per student).
