# MVP Scope, Roadmap & Task Checklist

## 1. MVP vs Future

### MUST HAVE — Version 1
Auth (real login, principal/teacher/parent roles, protected routes) · Academic sessions & classes as real tables · Students (CRUD, enrollment-based class tracking) · Teachers (CRUD, account creation) · Subjects & assignments · Attendance (teacher marks, principal reviews) · Fees (structures, monthly records, payments, pending view, receipts) · Exams & Results (create, enter marks, publish, parent view) · Timetable (view + edit, conflict prevention) · Promotion (real, history-preserving) · Parent dashboard (read-only, own children) · Teacher dashboard (assigned classes only) · Notices (school-wide announcements) · Basic reports (student/fee/attendance/result lists with print/export) · RLS on every table · Activity log for sensitive mutations.

### SHOULD HAVE — Version 1.5
Homework/assignments module (full CRUD, currently just a static mock) · In-app notifications (fee overdue, result published, absence, announcements) · Teacher-attendance tracking (if the school actually wants to track teacher punctuality, not just student attendance) · Result cards as polished print layouts · Fee discounts/scholarships as first-class fields (schema supports `discount_amount` already; UI for applying/approving discounts is v1.5) · Summary/promotion reports · Change-password / forgot-password self-service flows for teacher/parent.

### FUTURE
SMS/WhatsApp/email delivery of notifications · Online fee payment (payment gateway integration) · QR-code or biometric attendance · Native mobile app · Advanced analytics (trend charts beyond the simple stat cards/donut charts already in place) · Multi-school / multi-branch support (out of scope entirely for this single-school system) · Document management beyond simple photo/certificate uploads.

## 2. Dependency Map

```
Authentication (real login, exists)
   ↓
Roles & Protected Routes  (principal ✅ / teacher 🔴 / parent 🔴 layouts)
   ↓
Academic Sessions + Classes + Subjects   (nothing below this is safe to build on `class_name` text)
   ↓
Students  +  Teachers                    (can proceed in parallel once the row above exists)
   ↓
Student Enrollments  (depends on Students + Classes + Sessions)
   ↓
Subject/Teacher Assignments   (depends on Teachers + Classes + Subjects + Sessions)
   ↓
Attendance   +   Timetable    (both depend on Enrollments + Assignments; can proceed in parallel)
   ↓
Fees   +   Exams/Results      (both depend on Enrollments; Fees also needs Fee Structures;
   ↓                            Results also needs Assignments for the teacher-entry permission)
Promotion       (depends on Enrollments + Fees + Attendance + Results all existing, since it
   ↓             must prove none of them get destroyed)
Parent Dashboard + Teacher Dashboard   (depend on everything above being real, not mock)
   ↓
Notifications / Reports / Activity Log   (thin layers over everything above — build last)
   ↓
Testing & Security hardening pass → Deployment
```

The one-line version: **you cannot safely build Attendance, Fees, Timetable, or Promotion on top of today's free-text `class_name` — Sessions/Classes/Enrollments must come first**, which is why the Executive Summary's "next task" is exactly that.

## 3. Phased Roadmap

Each phase lists Goal · Features · Frontend · Backend · Database · RLS · Likely files · Testing · Dependencies · Definition of Done. Phases already partially done are marked.

---

### Phase 0 — Audit (✅ done — this document)
**DoD**: this folder exists and accurately reflects the current codebase (it does, as of this writing).

---

### Phase 1 — Project Architecture Cleanup
**Goal**: establish the folders/conventions every later phase depends on, before writing more feature code.
**Features**: `actions/`, `services/`, `validators/`, `types/`, `components/ui/` scaffolding; Zod + React Hook Form installed; a toast system; a `<ConfirmDialog>`.
**Frontend**: build `components/ui/{Button,Input,Select,Modal,ConfirmDialog,Toast,Skeleton}.tsx`.
**Backend**: none yet — this phase is pure scaffolding.
**Database**: none.
**RLS**: none.
**Files**: see file 04 §2 for the full tree.
**Testing**: none required yet (nothing to test).
**Dependencies**: none — can start immediately.
**DoD**: `npm install zod react-hook-form @hookform/resolvers` done; the 6 UI primitives exist and are used to replace at least the two current `alert()`/`window.confirm()` call sites.

---

### Phase 2 — Database Foundation: Sessions, Classes, Subjects, Enrollments
**Goal**: replace `students.class_name` with a real relational model — the single highest-priority phase (see Executive Summary).
**Features**: principal can view (not yet edit) the current session; classes/subjects become real, queryable tables.
**Frontend**: Classes/Students pages switch from the hardcoded `lib/classes-data.ts` array to querying the new `classes` table; Add Student's class `<select>` becomes `class_id`-based.
**Backend**: a one-time migration script to backfill `student_enrollments` from existing `students.class_name` values for the current session.
**Database**: `academic_sessions`, `classes`, `subjects`, `class_subjects`, `student_enrollments` (file 02).
**RLS**: enable RLS + principal-full-access policy on all 5 new tables (teacher/parent policies wait for Phase 4).
**Files**: `supabase/migrations/*.sql`, `lib/classes-data.ts` (rewritten as a query, not an array), `students/page.tsx`, `students/add/page.tsx`, `classes/page.tsx`, `classes/[classId]/page.tsx` (route param changes from name to id).
**Testing**: manual — add a student, confirm they appear in the right class card; confirm the two previously-inconsistent class-naming schemes (file 01 bad-architecture #1) no longer exist anywhere in the code.
**Dependencies**: Phase 1 folders exist (optional but recommended before this phase's migration script).
**DoD**: no page in the app references `students.class_name` as a string anymore; every class reference is a `class_id` FK.

---

### Phase 3 — Authentication Hardening
**Goal**: close the gaps in file 03 before more roles/routes are added.
**Features**: remove fake Sign Up; add middleware; add Forgot/Reset/Change Password.
**Frontend**: `AuthCard.tsx` loses the signup tab; new `/reset-password` page.
**Backend**: Server Action or direct client calls for `resetPasswordForEmail`/`updateUser`.
**Database**: none new.
**RLS**: none new.
**Files**: `middleware.ts` (new), `AuthCard.tsx` (edit), `app/reset-password/page.tsx` (new), `app/unauthorized/page.tsx` (new).
**Testing**: manual — confirm signup is gone; confirm a session survives a long idle period (middleware refresh working); confirm forgot-password email arrives (Supabase Auth email templates, may need configuring in the Supabase dashboard).
**Dependencies**: none beyond what exists today — can run in parallel with Phase 2.
**DoD**: no way for a random visitor to create an account; password reset works end to end.

---

### Phase 4 — Roles: Teacher & Parent Route Shells
**Goal**: stop `/teacher` and `/parent` from 404ing; establish the layout-guard pattern for both.
**Features**: bare `/teacher` and `/parent` dashboards (can be minimal — "Welcome, logged in successfully" — real content comes in Phase 13/14).
**Frontend**: `app/teacher/layout.tsx`, `app/teacher/page.tsx`, `app/parent/layout.tsx`, `app/parent/page.tsx`.
**Backend**: none new.
**Database**: none new (uses existing `profiles.role`).
**RLS**: none new yet.
**Files**: as above.
**Testing**: manual — log in as a `teacher`-role or `parent`-role profile (create one directly in Supabase for testing), confirm redirect works and a `principal` cannot access `/teacher` by typing the URL (and vice versa).
**Dependencies**: none.
**DoD**: all three roles land on a real, guarded page after login — zero 404s.

---

### Phase 5 — Students Module Completion
**Goal**: finish what Phase 2 started — full CRUD, detail page, real search/filter/pagination.
**Features**: Student Detail page (all 7 tabs, though Fees/Results tabs will be empty until Phases 9/12 land), Edit Student, Archive, unified `StudentsTable` component (fixing file 01 bad-architecture #3), real search/pagination.
**Frontend**: `students/[id]/page.tsx` (new), `students/[id]/edit/page.tsx` (new), `components/students/StudentsTable.tsx` (new, replacing both existing duplicated tables).
**Backend**: `actions/students.ts` (`createStudent` already effectively exists inline — extract it; add `updateStudent`, `archiveStudent`).
**Database**: none new beyond Phase 2 (maybe add `photo_url` if not already added).
**RLS**: teacher/parent read policies on `students`/`student_enrollments` (file 03) — worth adding now even though those roles' pages aren't built yet, since it's the same phase touching this table.
**Files**: as above + `validators/student.ts`.
**Testing**: manual CRUD walkthrough; confirm archived students disappear from the default list but remain reachable via a status filter.
**Dependencies**: Phase 2 (enrollments), Phase 1 (validators/UI primitives).
**DoD**: every button in the Students module does what it visually implies (fixes file 01's "dead View/Edit/Delete buttons" finding).

---

### Phase 6 — Teachers Module Completion
**Goal**: real teacher CRUD + account creation.
**Features**: Teachers list (real), Add Teacher (real, creates login), Teacher Detail with Assignments tab, Disable Teacher.
**Frontend**: `teachers/page.tsx` (rewrite), `teachers/add/page.tsx` (wire up), `teachers/[id]/page.tsx` (new).
**Backend**: `actions/teachers.ts` (`createTeacherAccount` using `auth.admin.createUser` + service role, `updateTeacher`, `disableTeacher`, `assignTeacherToClassSubject`).
**Database**: `teachers`, `teacher_assignments` (file 02).
**RLS**: principal-full-access on both; teacher-read-own-row.
**Files**: as above + `validators/teacher.ts`.
**Testing**: manual — create a teacher account, log in as them (Phase 4's shell now has a real user to test with), confirm they can't reach `/dashboard`.
**Dependencies**: Phase 2 (classes/subjects), Phase 3 (auth patterns), Phase 4 (teacher route exists to actually log into).
**DoD**: a principal can create a working teacher login end to end, from this UI, with no manual Supabase-dashboard steps.

---

### Phase 7 — Subjects & Assignments
**Goal**: make "Mathematics is one subject, many classes" real and editable.
**Features**: Subjects list page, per-class subject assignment.
**Frontend**: `subjects/page.tsx` (new).
**Backend**: `actions/subjects.ts`.
**Database**: already created in Phase 2 (`subjects`, `class_subjects`) — this phase is UI + actions only.
**RLS**: already covered by Phase 2's "reference data, read-all" policy.
**Testing**: manual — confirm the same subject appears correctly across multiple classes without duplication.
**Dependencies**: Phase 2.
**DoD**: subjects are manageable from the UI, no longer only the hardcoded chip list on the Settings mock.

---

### Phase 8 — Attendance
**Goal**: real daily attendance, teacher-marks/principal-reviews workflow.
**Features**: Teacher "Take Attendance" screen, principal review/correction on the existing Attendance page, per-student attendance history (feeds the Student Detail tab).
**Frontend**: `teacher/attendance/page.tsx` (new), `dashboard/attendance/page.tsx` (rewrite to real data), Student Detail's Attendance tab (real).
**Backend**: `actions/attendance.ts` (`markAttendance` as upsert, `correctAttendance`).
**Database**: `attendance` (file 02).
**RLS**: teacher-mark-own-class, principal-full, parent-read-own-children (file 03).
**Testing**: duplicate-submission test (same student, same day, twice — must update not duplicate); permission test (teacher cannot mark a class they're not assigned to).
**Dependencies**: Phase 6 (teacher assignments), Phase 5 (student enrollments).
**DoD**: a teacher can mark a full class in under a minute; a principal can see and correct it same day.

---

### Phase 9 — Fees
**Goal**: the most detail-heavy module in the brief — get the promotion-safe design right.
**Features**: Fee Structures page, monthly fee record generation, Fees list (real), Pending Fees (filtered view of the same list), Collect Fee modal + receipt, Student Detail Fees tab (real).
**Frontend**: `fees/structure/page.tsx` (new), `fees/page.tsx` (rewrite), remove `fees/[id]/page.tsx` in favor of the Student Detail tab (or keep as a redirect for bookmarked links).
**Backend**: `actions/fees.ts` (`recordPayment`, transactional across `fee_payments` + `student_fee_records`; a scheduled/manual "generate this month's fee records" step — could be a Supabase scheduled function or a principal-triggered action at the start of each month).
**Database**: `fee_structures`, `student_fee_records`, `fee_payments` (file 02).
**RLS**: principal-full only (file 03 — fees are explicitly principal-only per the brief, no teacher access).
**Testing**: the brief's exact scenario — student with unpaid Class-4 months promoted to Class 5, confirm both months still show, correctly labeled, unaffected by the promotion (this test can't fully run until Phase 11).
**Dependencies**: Phase 2 (enrollments), Phase 5 (students).
**DoD**: a payment recorded here is reflected instantly and correctly in the Student Detail Fees tab, the Pending Fees list, and the dashboard's outstanding-fees stat.

---

### Phase 10 — Exams & Results
**Goal**: teacher enters, principal publishes, parent sees.
**Features**: Add Exam (real, with subjects+marks config), Marks Entry (teacher-facing), Results overview (real), Publish toggle, Result Card.
**Frontend**: `exams/add/page.tsx` (wire up), `teacher/exams/[id]/[subjectId]/marks/page.tsx` (new), `results/page.tsx` (rewrite), `results/[examId]/[studentId]/card/page.tsx` (new, print-optimized).
**Backend**: `actions/exams.ts` (`createExam`, `enterMarks`, `publishExam`).
**Database**: `exams`, `exam_subjects`, `results` (file 02).
**RLS**: teacher-write-before-publish, principal-full, parent-read-published-only (file 03).
**Testing**: permission test (teacher cannot enter marks for a subject they don't teach; cannot edit after publish); parent cannot see unpublished results.
**Dependencies**: Phase 6 (teacher assignments for the permission check), Phase 5.
**DoD**: full exam lifecycle works end to end for one exam, one class, one subject, provably gated correctly by role.

---

### Phase 11 — Promotion
**Goal**: the brief's headline scenario, for real.
**Features**: real Promote Students (single + bulk), Academic History tab on Student Detail.
**Frontend**: `students/promote/page.tsx` (rewrite against real data), Student Detail's Academic History tab (real).
**Backend**: `actions/students.ts` (`promoteStudents`, transactional per file 06 §2).
**Database**: no new tables — this phase is entirely about correctly *using* Phase 2's `student_enrollments` and Phase 9's `student_fee_records`.
**RLS**: principal-only (already covered).
**Testing**: **this is the phase to run the brief's exact worked example as a manual test**: promote a student with unpaid prior-class fees, confirm the old fee records are untouched and still visible, confirm attendance/results history for the old class remains queryable.
**Dependencies**: Phases 2, 8, 9, 10 (needs enrollments, attendance, fees, and results all real, so the test can prove nothing is destroyed).
**DoD**: promoting a class of 30 students completes in one transaction, is confirmed via dialog first, and a spot-check of 3 students' full history (old + new class) is correct.

---

### Phase 12 — Timetable
**Goal**: real, conflict-free scheduling.
**Features**: Edit Timetable (real save), teacher-conflict prevention, teacher's own timetable view.
**Frontend**: `timetable/edit/page.tsx` (wire up), `teacher/timetable/page.tsx` (new).
**Backend**: `actions/timetable.ts` (`saveTimetableEntry`, relies on the DB unique index for conflict detection, translates the constraint violation into a friendly error per file 04 §4).
**Database**: `timetable_periods`, `timetable_entries` (file 02).
**RLS**: principal-write, teacher/parent read-own.
**Testing**: attempt to double-book a teacher across two classes in the same period, confirm it's rejected with a clear message, not a raw DB error.
**Dependencies**: Phase 6 (teacher assignments), Phase 7 (subjects).
**DoD**: the existing (already well-designed) Today/Weekly timetable views render real data, and the conflict rule is unbreakable even via a fast double-submit.

---

### Phase 13 — Parent Dashboard
**Goal**: build the entirely-missing parent-facing app.
**Features**: full module per file 05 §Parent Module — child switcher, dashboard, attendance, fees, results, timetable, notifications.
**Frontend**: `app/parent/**` (new — dashboard, attendance, fees, results, timetable, notifications pages, all read-only).
**Backend**: mostly reuses Server Components reading through RLS — little new write logic needed (parents don't write anything except "mark notification read").
**Database**: `parents`, `student_parents` (file 02) — need to exist and be populated (principal links a parent account to a student, likely from the Student Detail "Parent/Contact" tab, Phase 5).
**RLS**: parent-read-own-children policies across `students`, `attendance`, `student_fee_records`, `results`, `timetable_entries` (file 03) — most of these should already exist from earlier phases if each phase added its parent policy as it went; this phase is the first time they're actually *used*.
**Testing**: **critical permission test** — Parent A must not be able to change a URL/ID and see Parent B's child, verified against real RLS, not just hidden links.
**Dependencies**: everything from Phases 2, 5, 8, 9, 10, 12 needs to be real (the parent dashboard is a read-only mirror of all of it).
**DoD**: a parent test account sees exactly one (or their actual N) children, all data correct and read-only, zero leakage of other students' data under direct URL manipulation.

---

### Phase 14 — Teacher Dashboard
**Goal**: build the entirely-missing teacher-facing app (beyond the attendance/marks screens already built in Phases 8/10).
**Features**: full module per file 05 §Teacher Module — dashboard, my classes/students, homework (if in scope), profile.
**Frontend**: `app/teacher/**` completion.
**Backend**: mostly reuses actions from Phases 8/10; homework needs its own if in scope (`actions/homework.ts`).
**Database**: `homework` table if in scope (not yet in file 02 — add if v1 includes it, per the MVP-vs-1.5 split above).
**RLS**: teacher-read-assigned-classes (already largely covered by earlier phases).
**Testing**: permission test — Teacher A cannot see Teacher B's assigned classes/students.
**Dependencies**: Phases 6, 8, 10, 12.
**DoD**: a teacher test account can complete a full day's workflow (mark attendance, check timetable, enter marks when an exam is open) without ever touching `/dashboard`.

---

### Phase 15 — Notifications & Reports
**Goal**: thin layer over everything now that it's all real.
**Features**: per file 06 §3–4.
**Frontend**: notification bell/list (all 3 roles), report list pages with print/export.
**Backend**: `actions/notifications.ts` (mark-read), event-triggered inserts added into the relevant existing actions (e.g. `publishExam` now also fans out notifications).
**Database**: `notifications` (file 02).
**RLS**: read/update-own only.
**Dependencies**: everything above (this phase touches every module lightly).
**DoD**: at least fee-overdue (computed live), result-published, and student-absent notifications appear correctly for a parent test account.

---

### Phase 16 — Testing & Security Hardening
**Goal**: systematic pass over the full test matrix in file 08 §1, plus a second look at file 03's security checklist now that every table is real and holds test data.
**DoD**: every permission test in file 08 passes; RLS confirmed enabled on every table (not just assumed); no `console.log`/raw error leakage to the client.

---

### Phase 17 — Deployment
**Goal**: production-ready release. See file 08 §2 for the full checklist.
**DoD**: production Supabase project + Vercel deployment live, with production RLS matching (not looser than) what was tested in Phase 16.

## 4. Task Checklist — worked example (Students, matching the brief's requested format; use the same shape for every phase above)

```text
PHASE: Students (Phase 2 + Phase 5)

[ ] Create academic_sessions table
[ ] Create classes table
[ ] Create subjects, class_subjects tables
[ ] Create student_enrollments table
[ ] Add foreign keys (student_id, session_id, class_id)
[ ] Add unique constraint (student_id, session_id)
[ ] Enable RLS on all 4 new tables
[ ] Add principal-full-access RLS policies
[ ] Add teacher-read / parent-read RLS policies (stubs, used later)
[ ] Backfill student_enrollments from existing students.class_name
[ ] Generate/update TypeScript types from schema
[ ] Write Zod validation schema for student create/update
[ ] Rewrite lib/classes-data.ts as a live query against classes
[ ] Update Add Student form: class_name text input -> class_id select
[ ] Create actions/students.ts: createStudent, updateStudent, archiveStudent
[ ] Rewrite Students list to use unified StudentsTable component
[ ] Wire up View button -> /dashboard/students/[id]
[ ] Wire up Edit button -> edit form
[ ] Wire up Archive (soft delete) with confirm dialog
[ ] Add real search (name/admission no/father name) via URL params
[ ] Add real class/status filters via URL params
[ ] Add real pagination via URL params
[ ] Add loading.tsx skeleton
[ ] Add empty state (already exists, verify it still fires correctly)
[ ] Add error handling (already exists, verify it still fires correctly)
[ ] Build Student Detail page shell + Overview tab
[ ] Build Academic History tab (reads student_enrollments across sessions)
[ ] Test: add student -> correct class card count updates
[ ] Test: two different pages no longer disagree on class names
[ ] Test: archived student disappears from default list, reachable via filter
[ ] Test: teacher/parent cannot reach a student they're not permitted to see (RLS)
```

Repeat this shape (schema → RLS → types/validation → actions → UI wiring → states → tests) for every phase in §3 above.

## 5. Missing Features — Full List (consolidated)

**Frontend pages**: Teacher module (all), Parent module (all), Student Detail, Edit Student, Teacher Detail, Subjects, Fee Structure, Marks Entry, Result Card, Reset/Forgot Password, Unauthorized page.
**Backend functionality**: every Server Action listed across Phases 2–15 above — none currently exist (`actions/` folder doesn't exist).
**Database tables**: `academic_sessions`, `classes`, `sections`(optional), `subjects`, `class_subjects`, `student_enrollments`, `parents`, `student_parents`, `teachers`, `teacher_assignments`, `timetable_periods`, `timetable_entries`, `attendance`, `fee_structures`, `student_fee_records`, `fee_payments`, `exams`, `exam_subjects`, `results`, `notices`, `notifications`, `activity_logs`, optionally `homework`.
**Relationships**: all of the FK relationships described in file 02's ER summary — none exist today beyond `students.created_by → profiles.id`.
**RLS policies**: all of them (file 03) — none confirmed to exist.
**Validation**: Zod on every form (file 04 §3) — none exists today.
**Loading states**: every route needs a `loading.tsx` — none exist.
**Error states**: every route needs an `error.tsx` — none exist (though several pages already handle Supabase query errors inline, which is good and should continue).
**Security measures**: middleware, service-role isolation for admin actions, teacher/parent RLS, activity logging — see file 03.
**Reports**: all 8 mock report types need a real data source (file 06 §4).
**Tests**: no test framework installed; see file 08 §1 for the target matrix.
