# Backend Architecture & Cross-Cutting Standards

This file covers the patterns that should be decided **once** and then applied consistently across every module in file 05 — where backend logic lives, how forms validate, how errors surface, what loading/empty states look like, and how search/pagination/performance are handled. Get these right early; retrofitting them across 13 pages later is much more expensive than starting Teachers/Attendance/Fees with them already in place.

## 1. Where backend logic should live

Today, every page in the repo does one of: (a) a raw Supabase query inline in a Server Component, or (b) a raw Supabase call inline in a `"use client"` handler, or (c) nothing (mock data). None of that is wrong for a page that does one simple read — but it doesn't scale to multi-table, transactional operations (promotion, fee payments, exam publishing).

**Decision rule:**

| Use this... | ...when |
|---|---|
| **Server Component data fetching** (current pattern — keep it) | Simple reads that render a page: student list, class detail, fee list. This is already correctly used in `students/page.tsx` and `classes/page.tsx` — extend the same pattern to Teachers, Attendance, Exams, Results, Timetable, Notices, Homework, Reports as their tables are built. |
| **Server Actions** (`actions/*.ts`, `"use server"`) | Any write: create/update/delete, especially multi-table ones (promotion, fee payment, exam publish, teacher account creation). Prefer these over Route Handlers for form submissions — they integrate with `<form action={...}>` and don't need a separate fetch/JSON layer. |
| **Route Handlers** (`app/api/*/route.ts`) | Only when something outside the Next.js request/response cycle needs to call in — a webhook, a CSV/PDF export endpoint, or a future SMS/WhatsApp provider callback. Not needed for normal form submissions. |
| **Supabase client queries directly from the browser** (`"use client"` + `createClient()`) | Only for reads/writes that are genuinely simple, single-table, and already RLS-protected — e.g. the existing `ClassStudentsTable` delete. As soon as an action needs the service-role key or spans multiple tables, move it to a Server Action. |
| **Database functions/triggers** | Keep `paid_amount`/`status` on `student_fee_records` in sync after a `fee_payments` insert; keep `updated_at` current; enforce the "exactly one current session" invariant. Business rules that must hold *no matter which client writes the data* belong here, not only in application code. |

## 2. Recommended folder structure (additions to what exists)

```
src/
  app/                        (existing — routes only, thin)
    (auth)/                   optional grouping for "/", reset-password, unauthorized
    dashboard/                principal routes (existing)
    teacher/                  NEW
    parent/                   NEW
    api/                      NEW — only for webhooks/exports, not general CRUD
  actions/                    NEW — one file per domain, "use server"
    students.ts                 createStudent, updateStudent, archiveStudent, promoteStudents
    teachers.ts                  createTeacher (calls admin.createUser), updateTeacher, disableTeacher
    attendance.ts                markAttendance, correctAttendance
    fees.ts                      recordPayment, waiveFee
    exams.ts                     createExam, enterMarks, publishExam
    timetable.ts                 saveTimetableEntry (checks teacher-conflict before insert)
    notices.ts                   createNotice
  services/                   NEW — pure business-rule functions, no Supabase calls, easily unit-testable
    fees.ts                      computeDueAmount(), classifyPendingTier()
    attendance.ts                computeAttendancePercentage()
    results.ts                   computeGrade(), computePercentage(), computePassFail()
    promotion.ts                  nextClass(), buildPromotionPlan()
  validators/                 NEW — Zod schemas, one per form
    student.ts, teacher.ts, attendance.ts, feePayment.ts, exam.ts, result.ts, timetableEntry.ts
  lib/
    supabase/                   (existing)
    school-calendar.ts           (existing, keep as-is)
    classes-data.ts               → replace with a query against the new `classes` table
    toast.ts                     NEW — thin wrapper so the whole app calls one API for notifications
  types/                     NEW
    database.types.ts            generated via `supabase gen types typescript`
    domain.ts                    hand-written types that compose the generated ones (e.g. `StudentWithEnrollment`)
  components/
    ui/                        NEW — Button, Input, Select, Modal/ConfirmDialog, Toast, Skeleton (generic, no domain knowledge)
    dashboard/                  (existing — keep PageHeader/StatCard/etc.)
    students/, teachers/, attendance/, fees/, timetable/, results/   NEW — domain-specific composed components (e.g. a shared `StudentsTable` used by both the main list and the class-detail page, fixing the duplication noted in file 01)
```

**What belongs where, in one sentence each:**
- `actions/` — "do a thing," server-only, called from forms; validates input, calls `services/`, writes via Supabase, revalidates the path.
- `services/` — "figure a thing out," pure functions, no I/O, unit-testable without a database.
- `validators/` — "is this input shaped correctly," Zod schemas shared between the client form (for inline errors) and the server action (for the real check that can't be skipped).
- `types/` — "what does this data look like," generated + hand-composed.

## 3. Validation

Neither Zod nor React Hook Form is installed today — every form (`students/add`, `teachers/add`, `exams/add`, `notices/add`) relies solely on HTML `required`. Recommend adding both:

```bash
npm install zod react-hook-form @hookform/resolvers
```

One Zod schema per form, reused on both sides:

```ts
// validators/student.ts
export const studentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  fullName: z.string().min(2, "Enter the student's full name"),
  fatherName: z.string().min(2, "Enter the father's name"),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(["male", "female"]),
  classId: z.string().uuid("Select a class"),
  contactNumber: z.string().regex(/^\d{4}-?\d{7}$/, "Enter a valid phone number").optional(),
});
```

Client side: `useForm({ resolver: zodResolver(studentSchema) })` for inline field errors as the principal types. Server side: the Server Action calls `studentSchema.safeParse(input)` again before touching the database — **never trust that client validation ran**, since a form can be submitted programmatically or the client bundle could be stale.

Fields that specifically need validation per the brief:
- **Student creation**: admission number uniqueness (DB `unique` constraint + a friendly pre-check), required fields above, class must exist.
- **Teacher creation**: CNIC format, unique email/username, password confirmation match, password strength minimum.
- **Fee payments**: `amount > 0`, `amount <= remainingDue` (or explicitly allow overpayment as credit — decide and validate consistently), a receipt number is auto-generated server-side, never client-supplied.
- **Attendance**: `date` not in the future, `status` one of the four enum values, one row per student per day (DB unique constraint backs this up — see file 02).
- **Exams**: `end_date >= start_date`, `passing_marks <= max_marks`.
- **Results**: `obtained_marks <= max_marks` (and `>= 0`).
- **Timetable**: no double-booking a teacher in the same period (DB unique index backs this up — see file 02) — surface the conflict as a clear inline error, not a raw constraint-violation message.

## 4. Error Handling

No `error.tsx` boundaries exist anywhere in the app today. Recommended strategy:

- **Per-route `error.tsx`** at `app/dashboard/error.tsx` (and later `teacher/error.tsx`, `parent/error.tsx`) — catches unexpected render/data errors, shows a friendly "Something went wrong" card with a retry button, logs the real error server-side (never render raw error/stack text to the user — this is the "don't expose internal database errors" rule from the brief).
- **Server Actions return a typed result**, not a thrown exception the UI has to guess about:
  ```ts
  type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
  ```
  The action translates known Postgres errors into friendly messages before returning (`23505` unique violation on `admission_no` → `"A student with this admission number already exists."`; unique violation on `attendance(student_id, date)` → `"Attendance for this student has already been submitted today."`; unique violation on the teacher-conflict timetable index → `"This teacher is already teaching another class during this period."`).
- **Specific cases called out in the brief, mapped to concrete handling:**
  | Case | Where it surfaces | Message |
  |---|---|---|
  | Invalid login | `AuthCard.tsx` (already handled) | "Invalid email or password." (already correct — keep the pattern of not revealing which field was wrong) |
  | Duplicate admission number | `actions/students.ts` | Friendly message above, field-level error on Admission No |
  | Duplicate attendance | `actions/attendance.ts` | Friendly message; UI should prevent this proactively too by disabling "Save" once a day is already marked (see file 05) |
  | Payment already recorded | N/A directly (payments are additive, not "already recorded" in the same sense) — but a double-submit (user double-clicks "Collect Fee") should be prevented by disabling the submit button while the action is pending |
  | Timetable conflict | `actions/timetable.ts` | Friendly message naming the conflicting class/period |
  | Unauthorized access | RLS denial or a role check in a Server Action | Redirect to `/unauthorized`, don't leak whether the record exists |
  | Missing student (bad ID in URL) | Route param lookup returns null | `notFound()` (Next.js), matching the pattern already correctly used in `classes/[className]/page.tsx` |
  | Network/database errors (any Supabase call fails) | Server Component: render the existing `error ? <banner/> : ...` pattern already used in `students/page.tsx` — good, replicate everywhere. Client action: catch, return `{ok:false, error: "Couldn't save right now. Please try again."}` |

## 5. Loading States, Empty States, Confirmations, Toasts

None of `loading.tsx`, a toast system, or a reusable confirm dialog exist today (confirmed: `window.confirm`/`alert` used in two places, nowhere else).

- **`loading.tsx` per route** (Next.js file convention) showing a skeleton matching that page's layout — cheap to add, immediate perceived-performance win for every page that fetches data server-side.
- **Loading buttons**: the `Add Student` form already does this correctly (`disabled={saving}`, label changes to "Saving...") — make this the standard for every submit button, not a one-off.
- **Toasts**: add a small toast context (or a lightweight library) and replace both existing `alert()` calls plus every future action's success/error feedback. Non-blocking, dismissable, consistent styling with the rest of the UI.
- **Confirmation dialogs**: replace `window.confirm` in `ClassStudentsTable` with a reusable `<ConfirmDialog>` (`components/ui/`). Needed for: delete/archive student, delete teacher, disable teacher account, publish exam (irreversible-ish), promote students (bulk, hard to undo).
- **Empty states**: `students/page.tsx` already has a good one ("No students yet. Use 'Add Student'..."). Reuse that tone/pattern for: no teachers yet, no attendance marked today, no fee records, no exams scheduled, no notices.
- **Avoiding duplicate submissions**: disable the submit button (or use `useFormStatus().pending` with Server Actions) on every form the moment it's submitted, re-enable only on error.

## 6. Search, Filters, Pagination

Every search box and filter dropdown across the app is currently decorative except `MonthFilter` (real, URL-param-based) and the Fees page's `?status=` filter (real, but filtering mock data). Recommend making **URL search params the standard mechanism** for all list-page filtering (not local component state) — it makes filtered views bookmarkable/shareable/back-button-friendly, and it's the pattern already proven to work on the Fees page.

| List | Search by | Filter by |
|---|---|---|
| Students | name, admission no, father name | class, status, session |
| Teachers | name, ID, phone | subject, status |
| Fees | name, admission no | status (paid/pending/partial), month, class |
| Attendance | name, admission no, roll no | date, class, status |
| Results | student/class | exam, class, subject |

**Pagination**: at current/expected scale (a few hundred students, dozens of teachers), server-side `.range(from, to)` pagination with a page-size of ~25–50 is sufficient — no need for cursor-based pagination or infinite scroll (per the brief's "avoid overengineering"). Move from the current fake "Showing 1 to 6 of X" + non-functional page buttons to real `.range()` calls driven by a `?page=` URL param, mirroring the `MonthFilter` pattern already in the codebase.

## 7. Performance

Given the project's scale (single school, low hundreds of students), the existing approach of Server Component data fetching is already the right default and should stay that way — most of the "performance" work here is about not undoing that as new pages are built:

- Keep list pages as Server Components with a single `select` plus needed joins, rather than fetching everything client-side and filtering in JS (already done correctly in `students/page.tsx`, `classes/page.tsx`).
- Avoid N+1 queries once relational tables exist — e.g. the class list page's "students per class" count should become one grouped query (`select class_id, count(*) from students group by class_id`) rather than one query per class card.
- Add the indexes called out in file 02 (`admission_no`, `(class_id, date)` on attendance, `(entity_type, entity_id)` on activity logs) as those tables are created, not retroactively once the tables are slow.
- Keep client components (`"use client"`) limited to genuinely interactive pieces (menus, forms, tabs) — the current split (Sidebar/Topbar/forms are client, most page shells are server) is correct; don't convert whole pages to client components just to add one interactive filter — pass server data down and keep the filter itself as a small client island (the `MonthFilter` component is the right model to copy).
- Defer caching (React `cache()`, `revalidate` tuning) until there's an actual measured slowness — premature at this project's size.
