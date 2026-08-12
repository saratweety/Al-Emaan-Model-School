Hi Sara 👋 Yes. For your **Al-Eman Model School Management System**, it’s best to define the requirements before writing code so the database, UI, and pages don’t become confusing later.

Based on the school system you’ve been planning, I would structure it around **3 main users: Principal/Admin, Teacher, and Parent**. Students don’t necessarily need their own login at first; parents can access student information.

## 1. Main Purpose of the Website

The system should allow the school to manage:

* Students
* Teachers
* Classes and sections
* Attendance
* Monthly fees
* Pending fees
* Exams and results
* Subjects
* Timetable
* Announcements
* Parent communication
* Student promotion to the next class
* Academic sessions
* Reports

For your school, one academic session can be something like:

**February 2026 → January/February 2027**

The exact session dates can be configurable by the principal.

---

# 2. User Roles

### Principal / Admin

The principal has complete control over the system.

They can:

* Add/edit/delete students
* Add/edit/delete teachers
* Create classes
* Create sections
* Assign teachers to classes
* Assign subjects
* Manage fee structures
* Record fee payments
* View pending fees
* Manage exams
* View results
* Promote students
* Manage sessions
* View attendance
* Create announcements
* Generate reports
* Manage teacher accounts
* Manage parent accounts

### Teacher

Teachers should only see information related to the classes they teach.

They can:

* View assigned classes
* View students
* Mark attendance
* Edit attendance
* Enter exam marks
* View student results
* View timetable
* Add homework/assignments
* Post class announcements
* View student basic information

Teachers **should not** be able to change school fees or delete students.

### Parent

Parents should only see their own children.

They can:

* View child profile
* View attendance
* View monthly fee status
* View pending fees
* View payment history
* View exam results
* View timetable
* View homework
* View announcements
* Download result cards
* Download fee receipts

---

# 3. Principal Dashboard

Your main principal dashboard should show important statistics.

For example:

**Students**

* Total students
* Boys
* Girls
* New admissions

**Teachers**

* Total teachers
* Present today
* Absent today

**Attendance**

* Students present today
* Students absent today
* Attendance percentage

**Fees**

* Fees collected this month
* Pending fees
* Total outstanding amount
* Students with overdue fees

**Exams**

* Upcoming exams
* Recently published results

You can also show a small graph:

**Monthly Fee Collection**

Jan | Feb | Mar | Apr | May...

And another:

**Student Attendance**

---

# 4. Student Management

The Principal sidebar should contain:

**Students**

When opened:

### Student List

Columns:

| Student | Admission No. | Class | Section | Parent | Fee Status | Attendance | Action |
| ------- | ------------- | ----- | ------- | ------ | ---------- | ---------- | ------ |

Filters:

* All Classes
* Grade 1
* Grade 2
* Grade 3
* ...
* Boys
* Girls
* Active
* Inactive
* Paid
* Pending

Search:

`Search student by name / admission number`

Buttons:

**+ Add Student**

---

# 5. Add Student Form

Student information should contain:

### Personal Information

* Student ID
* Admission number
* First name
* Last name
* Gender
* Date of birth
* Student photo
* B-Form number
* Blood group
* Address

### Academic Information

* Academic session
* Admission date
* Class
* Section
* Roll number
* Previous school
* Admission class

### Parent Information

* Father name
* Mother name
* Guardian name
* CNIC
* Phone number
* WhatsApp number
* Email
* Occupation
* Address

### Fee Information

* Admission fee
* Monthly fee
* Transport fee
* Other fee
* Discount
* Scholarship
* Fee start month

---

# 6. Student Detail Page

When the Principal clicks a student name, open a complete student profile.

For example:

**Muhammad Ali**

Grade 5 – Section A
Roll No: 12
Admission No: AEMS-2026-0012

Tabs:

**Overview | Attendance | Fees | Results | Documents**

### Overview

Show:

* Student photo
* Name
* Class
* Section
* Roll number
* DOB
* Gender
* Parent
* Phone
* Address
* Admission date
* Session

---

# 7. Student Fee Detail

This is an important part of your system.

Student fee page should show:

**Current Class: Grade 5**

**Session: Feb 2026 – Jan 2027**

At the top:

### Current Month

**August 2026**

Monthly Fee: Rs 3,000
Previous Balance: Rs 6,000
Fine: Rs 200

**Total Due: Rs 9,200**

Status:

`Pending`

Buttons:

**Record Payment**

**Print Receipt**

---

## Monthly Fee History

| Month | Class   |  Fee | Paid | Balance | Date   | Status  |
| ----- | ------- | ---: | ---: | ------: | ------ | ------- |
| Feb   | Grade 5 | 3000 | 3000 |       0 | 05 Feb | Paid    |
| Mar   | Grade 5 | 3000 | 3000 |       0 | 06 Mar | Paid    |
| Apr   | Grade 5 | 3000 |    0 |    3000 | —      | Pending |
| May   | Grade 5 | 3000 |    0 |    3000 | —      | Pending |
| Jun   | Grade 5 | 3000 | 3000 |       0 | 12 Jun | Paid    |

Use statuses:

✅ **Paid**

🟠 **Partial**

🔴 **Pending**

---

# 8. Pending Fees Carry Forward

This requirement is especially important for your school.

Suppose:

Student is in:

**Grade 5 – Session 2026**

and has:

April = Rs 3,000 pending
May = Rs 3,000 pending

Then the student gets promoted to:

**Grade 6 – Session 2027**

The Rs 6,000 should **NOT disappear**.

The new fee page should show:

**Previous Session Balance: Rs 6,000**

Then:

Grade 6 Monthly Fee: Rs 3,500

So:

Previous Balance = Rs 6,000
Current Month = Rs 3,500

**Total Due = Rs 9,500**

Store the original fee records instead of copying or deleting them.

That means your database should keep:

`student_id`

`session_id`

`class_id`

`month`

`fee_amount`

`paid_amount`

`balance`

`status`

---

# 9. Fee Management

Principal menu:

**Fees**

Submenus:

* Fee Dashboard
* Collect Fee
* Pending Fees
* Fee Structure
* Discounts
* Payment History

### Fee Dashboard

Show:

**Collected This Month**

Rs 450,000

**Pending**

Rs 125,000

**Students Paid**

245

**Students Pending**

62

---

# 10. Pending Fee Page

This page helps the principal identify students whose fees haven't been paid.

Table:

| Student | Class   | Months Pending | Previous Due | Current Due | Total Due | Action |
| ------- | ------- | -------------- | -----------: | ----------: | --------: | ------ |
| Ali     | Grade 5 | Apr, May       |         6000 |        3000 |      9000 | View   |
| Sara    | Grade 4 | June           |         3000 |        3000 |      6000 | View   |

Filters:

* Class
* Section
* Month
* 1 month pending
* 2 months pending
* 3+ months pending

You can highlight:

**3+ months overdue**

in red.

---

# 11. Fee Structure

Different classes may have different fees.

For example:

| Class   | Admission Fee | Monthly Fee | Exam Fee |
| ------- | ------------: | ----------: | -------: |
| Nursery |          5000 |        2500 |     1000 |
| Prep    |          5000 |        2700 |     1000 |
| Grade 1 |          6000 |        3000 |     1200 |
| Grade 2 |          6000 |        3000 |     1200 |

The principal should be able to change this.

---

# 12. Payment Receipt

After payment, generate a receipt.

For example:

**AL-EMAN MODEL SCHOOL**

Fee Receipt

Receipt #: 000234

Student: Muhammad Ali
Class: Grade 5-A
Roll No: 12

April Fee: Rs 3,000
May Fee: Rs 3,000

Paid: Rs 6,000

Payment Method:

Cash

Date:

11 August 2026

Received By:

Admin

Buttons:

**Print**

**Download PDF**

---

# 13. Teacher Management

Principal sidebar:

**Teachers**

Teacher table:

| Teacher | ID | Subject | Classes | Phone | Status |
| ------- | -- | ------- | ------- | ----- | ------ |

Teacher profile should include:

* Teacher ID
* Photo
* Full name
* CNIC
* Gender
* Phone
* Email
* Address
* Joining date
* Qualification
* Subjects
* Assigned classes
* Salary
* Status

Buttons:

**Edit Teacher**

**Assign Class**

---

# 14. Class Management

Principal can create:

Grade 1

Grade 2

Grade 3

...

Each class can contain sections:

A

B

C

Example:

**Grade 5**

Section A — 32 students
Section B — 28 students

The principal can assign:

* Class teacher
* Subject teacher
* Students
* Timetable

---

# 15. Subject Management

Example subjects:

English

Urdu

Mathematics

Science

Computer

Islamiyat

Pakistan Studies

Principal can assign subjects by class.

Example:

Grade 5:

English
Urdu
Math
Science
Computer
Islamiyat

---

# 16. Attendance System

Teachers should mark attendance daily.

Example:

**Grade 5-A**

Date:

11 August 2026

| Student | Status  |
| ------- | ------- |
| Ali     | Present |
| Ahmed   | Absent  |
| Sara    | Present |

Statuses:

**P — Present**

**A — Absent**

**L — Leave**

**Late — Late**

Teacher clicks:

**Save Attendance**

---

# 17. Attendance Report

Student page:

Attendance:

Total Days: 150
Present: 135
Absent: 10
Leave: 5

Attendance:

**90%**

Monthly breakdown:

Jan 95%
Feb 92%
Mar 88%

---

# 18. Exam Management

Create:

**Mid Term**

and

**Final Term**

You can optionally later add:

Monthly Test

Quiz

Class Test

Principal creates exam:

Exam Name:

Mid Term 2026

Class:

Grade 5

Start Date:

10 October

End Date:

20 October

---

# 19. Marks Entry

Teacher sees:

**Grade 5 – Mathematics – Mid Term**

| Student | Total Marks | Obtained |
| ------- | ----------: | -------: |
| Ali     |         100 |       82 |
| Ahmed   |         100 |       71 |
| Sara    |         100 |       91 |

Then click:

**Save Marks**

---

# 20. Result System

Result page:

**Muhammad Ali**

Grade 5

Mid Term Examination

| Subject | Total | Obtained | Grade |
| ------- | ----: | -------: | ----- |
| English |   100 |       82 | A     |
| Math    |   100 |       90 | A+    |
| Science |   100 |       76 | B+    |

Total:

500

Obtained:

421

Percentage:

84.2%

Grade:

A

Position:

3rd

---

# 21. Result Card

The system should generate a printable result card containing:

* School logo
* School name
* Student name
* Father name
* Roll number
* Class
* Section
* Exam
* Subject marks
* Total
* Percentage
* Grade
* Position
* Attendance
* Teacher remarks
* Class teacher signature
* Principal signature

---

# 22. Student Promotion

At the end of the academic year:

Principal opens:

**Promote Students**

Example:

Current:

Grade 5

Next:

Grade 6

Select students.

Then:

**Promote**

The system should create a new student academic record.

Do **not change old records**.

Keep:

2026 → Grade 5

2027 → Grade 6

This is important because you need historical data.

---

# 23. Timetable

Principal can create timetable.

Example:

| Time  | Monday  | Tuesday  | Wednesday |
| ----- | ------- | -------- | --------- |
| 8:00  | English | Math     | Science   |
| 9:00  | Math    | Urdu     | English   |
| 10:00 | Science | Computer | Math      |

Teachers and parents can see the timetable.

---

# 24. Homework / Assignments

Teacher can post:

**Mathematics Homework**

Grade 5-A

Chapter 4

Questions 1–10

Due:

13 August 2026

Parents can view it.

---

# 25. Announcements

Principal can post:

**School Holiday**

School will remain closed on Friday.

Announcement can target:

* Everyone
* Teachers
* Parents
* Particular class

---

# 26. Parent Dashboard

Parent logs in and sees:

**Muhammad Ali**

Grade 5-A

Cards:

Attendance
92%

Fees
Rs 3,000 Pending

Latest Result
84%

Homework
3 Pending

Below:

Latest announcements.

If the parent has multiple children:

**Switch Student**

Ali – Grade 5

Ayesha – Grade 2

---

# 27. Teacher Dashboard

Teacher dashboard could show:

**My Classes**

Grade 5-A
Grade 6-B

**Today**

Classes: 5

Attendance Pending: 1

Marks Pending: 0

Homework: 2

Quick actions:

**Mark Attendance**

**Enter Marks**

**Post Homework**

---

# 28. Academic Session Management

Principal should create sessions such as:

2025–2026

2026–2027

2027–2028

Store a session ID for almost every academic record.

For example:

```text
Student
Class
Attendance
Fees
Exams
Results
Timetable
```

This prevents old data from being overwritten.

---

# 29. Reports

Principal should be able to generate reports.

Important reports:

* Student list
* Class-wise students
* Teacher list
* Daily attendance report
* Monthly attendance report
* Fee collection report
* Pending fees report
* Student fee statement
* Exam result report
* Class result report
* Student promotion report

Allow:

**Print**

and

**Download PDF**

---

# 30. Login System

Login page:

**AL-EMAN MODEL SCHOOL**

Email / Username

Password

Sign In

Role should be identified automatically.

Example:

Principal → Principal Dashboard

Teacher → Teacher Dashboard

Parent → Parent Dashboard

---

# 31. Notifications

Useful notifications include:

**Fee Reminder**

Your child's August fee is pending.

**Attendance**

Ali was absent today.

**Results**

Mid-Term result has been published.

**Announcement**

School will remain closed tomorrow.

Initially these can appear inside the website.

Later you could integrate:

WhatsApp

SMS

Email

---

# 32. Settings

Principal settings should contain:

### School Information

* School name
* Logo
* Address
* Phone
* Email
* Principal name

### Academic Settings

* Current session
* Classes
* Sections
* Subjects

### Fee Settings

* Due date
* Fine
* Fee structure

### Result Settings

* Grades
* Passing percentage

Example:

A+ = 90–100

A = 80–89

B = 70–79

C = 60–69

D = 50–59

Fail = Below 50

---

# 33. Database Requirements

For your database, you will likely need tables similar to:

```text
users
students
parents
teachers

academic_sessions
classes
sections
subjects

student_enrollments
teacher_assignments

attendance

fee_structures
student_fees
fee_payments

exams
exam_subjects
marks
results

timetables
homework
announcements
notifications
```

One particularly important table is:

### student_enrollments

```text
id
student_id
session_id
class_id
section_id
roll_number
status
```

This allows:

```text
2026 → Student → Grade 5
2027 → Same Student → Grade 6
```

without destroying Grade 5 history.

---

# 34. Technical Requirements

Since you're already working with Next.js, a strong stack for this project would be:

**Frontend**

Next.js
React
TypeScript
Tailwind CSS

**Backend**

Next.js Server Actions / API routes

**Database**

Supabase PostgreSQL

**Authentication**

Supabase Auth

**Deployment**

Vercel

So your architecture can look like:

```text
User
  ↓
Next.js Website
  ↓
Supabase Authentication
  ↓
Supabase PostgreSQL Database
  ↓
School Data
```

---

# 35. Security Requirements

This part is very important.

Principal can see:

**Everything**

Teacher can see:

**Only assigned classes**

Parent can see:

**Only their children**

For example, Parent A must never be able to change a URL and access Parent B's child.

You should use:

**Role-Based Access Control — RBAC**

Roles:

```text
principal
teacher
parent
```

And with Supabase, later use:

**Row Level Security — RLS**

---

# 36. Non-Functional Requirements

Your website should also be:

**Responsive**

Works on:

Desktop
Tablet
Mobile

**Fast**

Dashboard should load quickly.

**Secure**

Passwords must never be stored manually as plain text.

**Reliable**

Old fee and result data shouldn't disappear.

**Easy to Use**

The principal shouldn't need technical knowledge.

**Consistent**

Same sidebar, navbar, buttons and table styles throughout the system.

---

# 37. Recommended Principal Sidebar

Your final sidebar could be:

```text
Dashboard

Students
Teachers

Classes
Subjects
Timetable

Attendance

Fees
   Fee Dashboard
   Collect Fee
   Pending Fees
   Fee Structure

Exams
   Exams
   Marks
   Results

Homework

Announcements

Reports

Academic Sessions

Settings
```

This gives you a complete but manageable school ERP instead of making the system unnecessarily complicated.

## Best order to build it

I would **not build all features simultaneously**. Build it in this order:

1. Login + roles
2. Principal dashboard
3. Students
4. Teachers
5. Classes / Sections
6. Academic sessions
7. Student promotion
8. Fees
9. Attendance
10. Exams & results
11. Timetable
12. Parent dashboard
13. Teacher dashboard
14. Reports
15. Notifications

For your university/project version, **Students + Fees + Attendance + Results + Teacher/Parent roles** are the core features that will make the system look like a real school management system rather than just a dashboard design.
