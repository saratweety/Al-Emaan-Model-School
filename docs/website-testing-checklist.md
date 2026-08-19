# Website Testing Checklist

Manual QA checklist for Al-Emaan Model School portal. Go through each section on the live site and check items off as you confirm them. Test with the actual role each section names (principal / teacher / parent) — a feature working for one role doesn't mean it works, or is correctly blocked, for another.

## Login & Auth (`/`)

- [ ] Correct email + password logs in and redirects to the right dashboard (principal → `/dashboard`, teacher → `/teacher`, parent → `/parent`)
- [ ] Wrong password shows "Invalid email or password" (no extra detail)
- [ ] "Forgot password?" sends an email and the link in it works (see Password Reset below)
- [ ] Logging out (Topbar → Log Out) actually ends the session — reloading a protected page afterward bounces you back to `/`
- [ ] Refreshing the page while logged in keeps you logged in (session persists)
- [ ] Visiting `/dashboard`, `/teacher`, or `/parent` while logged out redirects to `/`
- [ ] A teacher account visiting `/dashboard` or `/parent` directly is redirected/blocked, not shown the page
- [ ] A parent account visiting `/dashboard` or `/teacher` directly is redirected/blocked
- [ ] Browser tab shows the school logo as the favicon

## Password Reset (`/reset-password`, `/auth/confirm`)

- [ ] Reset email arrives (check spam folder too)
- [ ] Clicking the link on the same device/browser as the running app lands on `/reset-password` without an "invalid or expired" error
- [ ] Submitting a new password (6+ characters, matching confirmation) succeeds
- [ ] After reset, you can log in with the new password (and the old one no longer works)
- [ ] An expired/reused reset link shows the "invalid or expired" message instead of a broken form

## My Profile (`/dashboard/settings/profile`, `/teacher/settings`, `/parent/settings`)

- [ ] Changing Full Name and saving actually persists — reload the page and the new name is still there (not reverted to the old value)
- [ ] Changing Username and saving persists the same way
- [ ] Changing Email triggers a "check your inbox to confirm" message, and the new email must be confirmed before it takes effect
- [ ] Change Password with correct current password + valid new password succeeds
- [ ] Change Password with wrong current password fails with a clear error

## Principal — Dashboard (`/dashboard`)

- [ ] Dashboard loads with correct summary stats (students, teachers, fees, attendance, etc.)
- [ ] Sidebar navigation links all work and highlight the active page

### Students
- [ ] `/dashboard/students` — list loads, search and class filter work
- [ ] `/dashboard/students/add` — adding a student with valid data succeeds and appears in the list
- [ ] `/dashboard/students/[id]` — detail page loads for an existing student
- [ ] `/dashboard/students/[id]/edit` — editing and saving updates the student
- [ ] `/dashboard/students/promote` — promotion flow completes without breaking existing fee/attendance history

### Teachers
- [ ] `/dashboard/teachers` — list loads
- [ ] `/dashboard/teachers/add` — adding a teacher creates a working login for them
- [ ] `/dashboard/teachers/[id]` — detail page loads
- [ ] `/dashboard/teachers/[id]/edit` — editing and saving updates the teacher
- [ ] `/dashboard/teachers/attendance` — teacher attendance records load correctly
- [ ] `/dashboard/teachers/documents` — documents list/upload works

### Classes & Subjects
- [ ] `/dashboard/classes` — list loads
- [ ] `/dashboard/classes/[classId]` — class detail (roster) loads correctly
- [ ] `/dashboard/subjects` — list, add, edit work

### Attendance
- [ ] `/dashboard/attendance` — principal can view/correct attendance for any class

### Fees
- [ ] `/dashboard/fees` — list loads, filtering by status works
- [ ] `/dashboard/fees/[id]` — recording a payment updates paid amount/status correctly, including partial payments
- [ ] Receipt numbers are unique and not editable by hand

### Exams & Results
- [ ] `/dashboard/exams` and `/dashboard/exams/add` — creating an exam works
- [ ] `/dashboard/results` — results list/publish flow works
- [ ] Principal can edit marks even after publishing

### Timetable
- [ ] `/dashboard/timetable` and `/dashboard/timetable/edit` — viewing and editing the timetable works and saves

### Notices
- [ ] `/dashboard/notices`, `/add`, `/[id]`, `/[id]/edit` — creating, viewing, and editing a notice all work
- [ ] A newly published notice shows up for teachers/parents

### Homework
- [ ] `/dashboard/homework` — loads correctly

### Reports
- [ ] `/dashboard/reports` and each sub-report (`attendance`, `fees`, `pending-fees`, `results`, `students`, `summary`, `teachers`) load with correct data

### Settings
- [ ] `/dashboard/settings` and `/dashboard/settings/timing` — save correctly and changes reflect elsewhere in the app

## Teacher (`/teacher`)

- [ ] `/teacher` — dashboard loads with the teacher's own summary (not another teacher's data)
- [ ] `/teacher/attendance` — teacher can mark attendance only for their own assigned class
- [ ] `/teacher/students` — teacher sees only their own students/classes
- [ ] `/teacher/results` and `/teacher/tests` — teacher can enter marks only for their assigned subject/class, and cannot edit after publish
- [ ] `/teacher/timetable` — shows the correct schedule for this teacher
- [ ] `/teacher/notices` — shows notices relevant to teachers
- [ ] `/teacher/homework` — loads correctly
- [ ] A teacher cannot see or edit another teacher's classes/students/marks by changing the URL

## Parent (`/parent`)

- [ ] `/parent` — dashboard loads with this parent's own child/children only
- [ ] `/parent/children` — shows only this parent's children
- [ ] `/parent/attendance` — shows correct attendance for their child(ren)
- [ ] `/parent/fees` — shows correct fee status, and there is no way to edit/pay directly (read-only)
- [ ] `/parent/results` — only published results are visible, never an unpublished exam
- [ ] `/parent/timetable` — shows the correct class timetable
- [ ] `/parent/homework` — shows correct homework for their child's class
- [ ] `/parent/notices` — shows relevant notices
- [ ] A parent cannot view another parent's child's data by changing an ID in the URL
- [ ] A parent cannot reach any write action anywhere (no edit/delete buttons visible, and direct URL/action attempts are blocked)

## Cross-cutting

- [ ] `/unauthorized` shows a clear message when a role tries to access a page it shouldn't
- [ ] All toasts/success/error messages are accurate — no "success" message when nothing actually changed
- [ ] No console errors on any page (browser DevTools → Console)
- [ ] Mobile/narrow window layout is usable on the main pages (sidebar collapses, tables scroll instead of overflowing)
