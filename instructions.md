# Academy Student Management System — Development Instructions

## 1. Project Objective

Build a complete Academy Student Management System using a shared backend/database and multiple interfaces.

The system will consist of:

1. **Desktop Admin App**
   - Full administrative control.
   - All configuration, student, academic, HR, finance, attendance, examination, and reporting functions.

2. **Mobile Admin Reports App**
   - Mobile-only interface for administrators/management.
   - Primarily used to view dashboards and reports.

3. **Student Portal**
   - Students can view their academic information and records.

4. **Parent Portal**
   - Parents can view information for one or more enrolled children.

5. **Teacher Portal**
   - Mobile-only interface.
   - Teachers can view their assigned subjects/content and mark lecture attendance according to the timetable.

---

# 2. Core Architecture

Do NOT build the five applications as independent systems.

Use:

```text
                    ┌─────────────────────┐
                    │   Shared Backend    │
                    │                     │
                    │ PostgreSQL          │
                    │ Authentication      │
                    │ Storage             │
                    │ Security / RLS      │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
   Desktop Admin        Mobile Reports        Mobile Portals
      Web App                App             ┌──────────────┐
                                             │ Teacher      │
                                             │ Student      │
                                             │ Parent       │
                                             └──────────────┘
```

Recommended technology approach:

- PostgreSQL/Supabase for database
- Supabase Authentication
- Supabase Storage where required
- Row Level Security (RLS)
- Web application for Admin App
- Responsive/mobile interfaces for Teacher, Student and Parent portals
- Mobile-optimized Admin Reports application

The Admin App should initially be a responsive web/desktop application rather than a Windows-specific native application.

---

# 3. Fundamental Architecture Principle

Build the system around **shared data models**, not around independent pages/apps.

For example, timetable data should be created once.

That same data should be consumed by:

- Admin App
- Teacher Portal
- Student Portal
- Parent Portal
- Reports

The same principle applies to:

- Academic Years
- Students
- Academic Enrollment
- Classes
- Sections
- Subjects
- Teachers
- Attendance
- Scheme of Study
- Tests
- Datesheets
- Marks
- Fees
- Finance

Do not duplicate business logic between applications.

---

# 4. Academic Hierarchy

The core academic hierarchy is:

```text
Academy
│
├── Academic Years
│
├── Classes
│   └── Sections
│       └── Class Subjects
│
├── Students
│
├── Teachers
│
└── Staff
```

Important distinction:

- Classes, sections and subjects are master data.
- A student's class/section membership is academic-year-specific.

Example:

```text
Student: Ali

2025-26
Class 7
Section A

2026-27
Class 8
Section B
```

Never permanently store a student's current class as the only class relationship.

Use an academic enrollment/history table.

---

# 5. Academic Year System

The academy's academic year approximately runs from May through April.

Example:

```text
2026-27
May 2026 → April 2027

2027-28
May 2027 → April 2028
```

Create:

```text
academic_years

id
name
start_date
end_date
is_current
status
created_at
updated_at
```

## Requirements

Admin must be able to:

- Create academic year
- Edit academic year
- Set current academic year
- Close academic year
- View previous academic years

System rule:

> Only one academic year can be current at a time.

## Active Student Rule

Only students with an enrollment record in the current academic year should be treated as active/current students.

Students from previous academic years must remain available for historical reports.

Do not delete previous-year student records merely because the academic year has ended.

---

# 6. Academic Structure Settings

Create a dynamic Settings module.

Required settings:

```text
Academy Profile
Academic Years
Classes
Sections
Batches (Advance, Regular, ICU)
Subjects
Class Subjects
Grading System
Attendance Settings
Fee Settings
Expense Categories
Bank Accounts
User Roles
```

## Dynamic Master Data Rule

Anything added through Settings must automatically become available anywhere it is relevant.

Example:

Admin adds:

```text
Class 10
```

Class 10 must automatically become available in:

- Student admission
- Student enrollment
- Attendance filters
- Marks filters
- Timetable
- Datesheet
- Reports
- Relevant dialogs and forms

Do not hardcode classes, sections or subjects inside individual screens.

---

# 7. Classes

Create a `classes` table.

Example:

```text
Class 1
Class 2
Class 3
...
Class 10
```

Admin can:

- Add
- Edit
- Activate/deactivate
- Reorder/display order if required

Only active classes should appear in normal selection dialogs.

Historical data must continue to reference inactive classes.

---

# 8. Sections

Sections belong to classes.

Example:

```text
Class 8
├── Section A
├── Section B
└── Section C
```

Sections should have a relationship to their class.

Suggested fields:

```text
id
class_id
name
status
created_at
updated_at
```

---

# 9. Subjects

Subjects are global academic master data.

Example:

```text
Mathematics
Physics
Chemistry
English
Urdu
Islamiyat
Computer Science
```

Suggested fields:

```text
id
name
code
description
status
created_at
updated_at
```

---

# 10. Class Subjects

Do not permanently attach every subject directly to every class.

Create a relationship table:

```text
class_subjects
```

Example:

| Class | Subject |
|---|---|
| 8 | Mathematics |
| 8 | English |
| 8 | Physics |
| 9 | Mathematics |
| 9 | Physics |

Suggested fields:

```text
id
class_id
subject_id
status
created_at
updated_at
```

---

# 10B. Batches (Dynamic Batches Architecture)

The academy groups students into dynamic performance and pacing cohorts called **Batches**.

At system launch, three initial batches are established:
1. **Advance Batch**: High-performance, fast-track students needing advanced syllabus depth.
2. **Regular Batch**: Standard curriculum pace for the general student cohort.
3. **ICU Batch**: Intensive Care Unit / Remedial batch for struggling students requiring daily intervention and focused review.

### Dynamic Settings Rule
Batches must NOT be hardcoded. The system includes a dynamic **Batches Master** settings management interface allowing administrators to:
- Create new batches (e.g. `Weekend Batch`, `Crash Course Batch`, `MDCAT Preparation Batch`)
- Edit batch names, short codes, and descriptions
- Activate / deactivate batches
- Soft delete / remove batches

### Multi-Batch Mapping (Class + Section + Batch)
Batches cut across classes and sections. Multiple batches can operate concurrently within the same class and section.

Example:
```text
Class 9th
└── Section Science
    ├── Advance Batch (Cohort A - Fast Track)
    ├── Regular Batch (Cohort B - Standard)
    └── ICU Batch     (Cohort C - Remedial Assistance)
```

Each student's enrollment record links to their assigned batch, enabling:
- Batch-filtered student rosters and attendance sheets
- Targeted exam papers, tests, and homework delivery
- Batch-specific performance analytics and teacher assignments

---

# 11. Authentication and Roles

Use one authentication system.

Core roles:

```text
Admin
Teacher
Student
Parent
Staff
```

Conceptual structure:

```text
auth.users
     │
     ▼
profiles
     │
     ├── admin
     ├── teacher
     ├── student
     └── parent
```

Access must be controlled using:

- User roles
- User-to-entity relationships
- Row Level Security

Do not rely only on frontend restrictions.

A teacher must not be able to access all academy students simply by manipulating frontend requests.

---

# 12. Student Module

The Student Module should contain:

```text
Student Inquiry
Student Admission
Student Master
Academic Enrollment
Previous-Year Enrollment
Attendance
Fees
```

---

# 13. Student Inquiry

Create an inquiry system.

Suggested fields:

```text
inquiry_no
date
student_name
father_name
contact
interested_class
source
status
remarks
follow_up_date
```

Suggested statuses:

```text
New
Contacted
Follow-up
Enrolled
Rejected
Lost
```

Inquiry should be convertible into a student admission without unnecessarily re-entering information.

---

# 14. Student Master

Student profile should contain information such as:

```text
Admission No
Student Name
Father Name
Mother Name
Date of Birth
Gender
CNIC/B-Form
Address
Phone
Emergency Contact
Photo
```

Keep permanent student identity information separate from academic-year-specific information.

---

# 15. Academic Enrollment

Create a separate table:

```text
student_academic_records
```

Suggested fields:

```text
id
student_id
academic_year_id
class_id
section_id
batch_id                     -- UUID linking to batches table (e.g. Advance, Regular, ICU)
enrollment_type              -- 'regular' | 'supplementary'
supplementary_subject_ids    -- JSON/Array of subject UUIDs the student is taking supplementary exams in
supplementary_notes          -- Optional remarks regarding exam session or special arrangements
roll_no
status                       -- 'active' | 'promoted' | 'completed' | 'withdrawn' | 'transferred'
enrollment_date
leaving_date
created_at
updated_at
```

Example:

```text
Ali

2025-26
Class 7 / Section A / Regular Batch

2026-27
Class 8 / Section B / Advance Batch
```

This preserves the student's complete academic history and batch progression.

---

# 16. Previous Academic Year Enrollment & Promotion

Provide an admin workflow to enroll/promote students from the previous academic year.

Example:

```text
2025-26
Class 7 / Section A
        ↓
2026-27
Class 8 / Section B (Target Batch: Advance / Regular / ICU)
```

The system should create a new academic enrollment record in the target cycle.

It must NOT modify or overwrite the previous year's record.

---

# 16B. Supplementary Students System

Some students fail in one or more subjects during regular academic assessments or board exams and enroll at the academy specifically for supplementary examination preparation.

### Core Domain Rules:
1. **Academic Year & Class Separation**:
   - Technically, a supplementary student's failed subjects belong to their previous academic year / previous class syllabus.
   - However, in the current academic session, they must be registered and tracked actively without confusing them with regular full-curriculum students.
2. **Distinct Categorization**:
   - Every enrollment record designates `enrollment_type` as either `'regular'` or `'supplementary'`.
   - The system tracks which specific subjects the student is retaking (`supplementary_subject_ids`).
3. **Multi-Module Impact**:
   - **Student Directory**: Clear visual identification badge ("Supplementary Student") with immediate tags for each failed subject (e.g., `[Math] [Physics]`). Filter students by Regular vs. Supplementary category.
   - **Admission & Re-enrollment**: Support direct admission as Supplementary or re-enrollment from previous academic cycles.
   - **Timetable & Attendance**: Supplementary students only attend lectures for their registered supplementary subjects, rather than the entire class timetable.
   - **Fee Structure**: Enable per-subject supplementary fee calculation or customized voucher amounts separate from full-term tuition.
   - **Examination & Marks**: Generate test results and datesheets tailored to their failed subject list.

---

# 17. Teacher and Staff Management

Create a staff administration module.

## Teacher

Suggested information:

```text
Teacher ID
Name
Phone
CNIC
Address
Joining Date
Qualification
Specialization
Status
```

## Other Staff

Use a similar employee structure where appropriate.

---

# 18. Teacher Assignments

Create a relationship such as:

```text
teacher_subject_assignments
```

Example:

```text
Teacher: Ahmed
Class: 8
Section: A
Subject: Mathematics
```

Teacher assignments are the basis for:

- Teacher Portal permissions
- Timetable
- Attendance
- Subject content
- Teacher reports
- Payroll relationships where applicable

---

# 19. Timetable

Create a timetable module after teachers, subjects, classes and sections exist.

Suggested fields:

```text
academic_year_id
class_id
section_id
day
period
start_time
end_time
subject_id
teacher_id
room
status
```

Example:

```text
Monday
08:00–08:40
Class 8-A
Mathematics
Mr Ahmed
Room 4
```

The timetable must be used by the Teacher Portal to determine the teacher's assigned lectures.

---

# 20. Attendance

There should be two related attendance concepts.

## Student/General Attendance

```text
student
date
status
```

## Subject/Lecture Attendance

```text
student
subject
teacher
timetable_slot
date
status
```

Suggested statuses:

```text
Present
Absent
Late
Leave
```

The Teacher Portal must allow a teacher to mark attendance only for lectures/classes assigned to that teacher.

---

# 21. Teacher Portal

Teacher Portal is mobile-only.

Teacher dashboard should show:

```text
Today's Classes
Upcoming Classes
Attendance Pending
My Subjects
My Classes
Subject Content
```

For today's timetable:

```text
08:00 Mathematics
[Mark Attendance]

09:00 Physics
[Mark Attendance]

10:00 English
[Mark Attendance]
```

Teacher should only see:

- Their assigned classes
- Their assigned sections
- Their assigned subjects
- Their relevant students
- Their relevant subject content

---

# 22. Scheme of Study (SOS)

Build a Scheme of Study system for the entire academic year.

Recommended hierarchy:

```text
Academic Year
 ↓
Class
 ↓
Subject
 ↓
Scheme of Study
 ↓
Month
 ↓
Topics
```

Example:

```text
Class 9
Mathematics

May
  Algebra
  Sets

June
  Functions
  Matrices

July
  Geometry
```

SOS should be accessible according to permissions from:

- Admin
- Teacher
- Student
- Parent

---

# 23. Subject Content

Teachers should be able to view content related to subjects assigned to them.

Possible structure:

```text
Subject
 ├── Scheme of Study
 ├── Chapters
 ├── Topics
 ├── Study Material
 └── Tests
```

Students and parents can view published/relevant content through their portals.

---

# 24. Tests

Create an examination/test system.

Suggested structure:

```text
assessment
assessment_subject
student_marks
```

A test should contain:

```text
Test Name
Academic Year
Class
Section
Subject
Total Marks
Date
```

Example:

```text
Monthly Test 1
Class 8
Mathematics
15 June
50 marks
```

---

# 25. Datesheet

Create a datesheet based on assessments.

Example:

```text
Class 8

15 June → Mathematics
17 June → Physics
19 June → English
```

Datesheets should be available to:

- Admin
- Students
- Parents
- Reports

---

# 26. Marksheets

Do not create a separate manually entered marksheet for every student.

Use assessment and student marks data.

Example:

```text
Monthly Test 1
      │
      ├── Mathematics
      │       ├── Ali = 42
      │       ├── Ahmed = 38
      │       └── Bilal = 45
      │
      └── Physics
              ├── Ali = 40
              ├── Ahmed = 35
              └── Bilal = 44
```

Student marks should contain:

```text
assessment_id
student_id
subject_id
obtained_marks
total_marks
grade
remarks
```

The system should generate student marksheets from this data.

Example:

```text
Student: Ali
Class: 8
Academic Year: 2026-27

Subject       Obtained   Total   %
Mathematics      42        50    84%
Physics          40        50    80%
English          44        50    88%
```

Later the system can support:

- GPA
- Grades
- Percentage
- Position
- Remarks
- Report cards

---

# 27. Fees

The Student Module must support fee collection.

Required capabilities:

- Full payment
- Partial payment
- Outstanding balance
- Fee invoices
- Fee adjustments
- Fee waivers where applicable

Example:

```text
Monthly Fee = Rs 5,000

Payment 1 = Rs 3,000
Remaining = Rs 2,000

Payment 2 = Rs 2,000
Remaining = Rs 0
```

Do not overwrite invoices when receiving payments.

Maintain individual payment transactions for auditability.

---

# 28. Finance Module

Finance should include:

```text
Bank Accounts
Bank Transfers
Expenses
Teacher Payroll
```

---

# 29. Bank Accounts

Allow admin to create:

```text
Cash
Meezan Bank
HBL
Bank Alfalah
```

Suggested bank account fields:

```text
id
name
account_number
bank_name
opening_balance
status
```

---

# 30. Bank Transfers

A transfer must affect both accounts.

Example:

```text
Meezan Bank
     ↓ Rs 100,000
HBL
```

Do not treat this as an expense.

It is a transfer between internal accounts.

Maintain an auditable transaction record.

---

# 31. Expenses

Expense record should contain:

```text
Date
Category
Amount
Payment Account
Description
Attachment
```

Examples of dynamic categories:

```text
Salary
Electricity
Rent
Stationery
Maintenance
Transport
Marketing
Other
```

---

# 32. Teacher Payroll

Payroll should be built after teacher management, attendance and finance are available.

Possible payroll fields:

```text
Teacher
Basic Salary
Allowances
Deductions
Attendance
Advances
Net Salary
```

Example:

```text
Basic Salary      50,000
Allowance          5,000
Deduction          2,000
------------------------
Net Salary        53,000
```

Payroll payment should connect to the finance transaction system.

---

# 33. Student Portal

Student Portal should be simple and mobile-friendly.

Dashboard:

```text
Student Name
Class / Section

Today's Timetable

Attendance %
Latest Results
Upcoming Test
```

Menus:

```text
Attendance
Marksheets
Datesheet
Scheme of Study
Timetable
Subject Content
Profile
```

Students should only be able to access their own records.

---

# 34. Parent Portal

Parents may have multiple children.

Use a relationship:

```text
parent
   ↓
parent_students
   ↓
students
```

Example:

```text
Parent
 ├── Ali
 ├── Ahmed
 └── Sara
```

Parent dashboard:

```text
My Children

Ali
Class 8-A
Attendance: 93%

Ahmed
Class 5-B
Attendance: 96%
```

Parent selects a child and then views that child's:

- Attendance
- Marksheets
- Datesheet
- SOS
- Timetable
- Subject content where applicable

Parents must only access their linked children.

---

# 35. Admin Reports

Create a centralized Reports module in the Admin App.

Reports should include at minimum:

```text
Student Reports
Attendance Reports
Fee Reports
Teacher Reports
Exam Reports
Finance Reports
Expense Reports
Payroll Reports
Timetable Reports
Academic Reports
```

Reports should support relevant filters such as:

```text
Academic Year
Class
Section
Subject
Student
Teacher
Date Range
Status
```

Use the same dynamic master data throughout the reporting system.

---

# 36. Mobile Admin Reports App

Build this only after the main reporting system exists.

Do not create a second reporting backend.

The mobile app should consume the same backend/reporting services.

Example dashboard:

```text
Today's Overview

Students
1,284

Present
1,201

Absent
83

Fees Collected
Rs 485,000

Outstanding Fees
Rs 1,240,000

Teachers Present
82 / 87
```

Reports:

```text
Student Reports
Attendance Reports
Fee Reports
Teacher Reports
Exam Reports
Finance Reports
Expense Reports
Payroll Reports
```

The mobile reports application is primarily for viewing and monitoring, not full administrative data entry.

---

# 37. Recommended Development Sequence

Build the project in the following order.

## PHASE 1 — FOUNDATION

```text
Project Setup
Supabase
Database Architecture
Authentication
User Roles
RLS/Security
Base Layout
Navigation
```

↓

## PHASE 2 — ACADEMIC FOUNDATION

```text
Academic Years
Classes
Sections
Subjects
Class Subjects
Academic Settings
```

↓

## PHASE 3 — STUDENTS

```text
Student Inquiry
Student Master
Student Admission
Academic Enrollment
Previous-Year Enrollment
```

↓

## PHASE 4 — STAFF

```text
Teachers
Other Staff
Teacher Subject/Class Assignments
```

↓

## PHASE 5 — TIMETABLE

```text
Timetable
Periods
Teacher Assignments
Class Schedule
```

↓

## PHASE 6 — ATTENDANCE

```text
Admin Attendance
Teacher Lecture Attendance
Attendance Reports
```

↓

## PHASE 7 — TEACHER PORTAL

```text
Teacher Dashboard
Today's Classes
My Subjects
Subject Content
Attendance
SOS
```

↓

## PHASE 8 — ACADEMIC CONTENT & EXAMS

```text
Scheme of Study
Subject Content
Tests
Datesheet
Marks
Marksheets
```

↓

## PHASE 9 — STUDENT/PARENT PORTALS

```text
Student Portal
Parent Portal
Child Switching
Academic Records
```

↓

## PHASE 10 — FEES

```text
Fee Structure
Fee Invoice
Fee Payment
Partial Payment
Outstanding Fees
Fee Reports
```

↓

## PHASE 11 — FINANCE

```text
Bank Accounts
Bank Transfers
Expenses
Teacher Payroll
```

↓

## PHASE 12 — REPORTING

```text
Central Reports
Dashboards
Filters
Exports
Printable Reports
```

↓

## PHASE 13 — MOBILE ADMIN REPORT APP

```text
Mobile Dashboard
Management Reports
KPIs
Charts
Filtered Reports
```

---

# 38. First Development Milestone

Do NOT attempt to build the complete academy system in one prompt.

The first milestone should contain only:

```text
Login
│
├── Dashboard
│
└── Settings
    │
    ├── Academy Profile
    ├── Academic Years
    ├── Classes
    ├── Sections
    ├── Subjects
    └── Class Subjects
```

This foundation must work correctly before Student Admission is started.

Test the following workflow:

```text
Admin creates Class 10
        ↓
Class 10 appears automatically in
relevant dropdowns and filters

Admin creates Section A under Class 10
        ↓
Section A appears automatically
when Class 10 is selected

Admin creates Mathematics
        ↓
Mathematics appears as a selectable subject

Admin assigns Mathematics to Class 10
        ↓
Mathematics becomes available
for Class 10 academic workflows
```

No hardcoded academic entities should exist in application code.

---

# 39. Critical Data Design Rules

## Rule 1 — Preserve Historical Data

Never delete academic records simply because an academic year has ended.

Historical records must remain available for reports.

## Rule 2 — Current Academic Year Controls Active Students

Normal student selection should default to the current academic year.

Historical reports must allow previous academic years.

## Rule 3 — Separate Master Data from Transactions

Examples:

```text
Subject = master data

Student Enrollment = transactional/relationship data

Attendance = transaction

Fee Payment = transaction

Marks = transaction
```

## Rule 4 — Never Overwrite Historical Records

If a student moves from:

```text
Class 7-A
```

to:

```text
Class 8-B
```

create a new academic enrollment record.

Do not modify the old record.

## Rule 5 — Use Relationships Instead of Duplicating Data

A teacher should be assigned to a class/section/subject through relationships.

Do not duplicate teacher details inside timetable, attendance and marks records unnecessarily.

## Rule 6 — Backend Security Is Mandatory

Frontend visibility is not security.

Use Supabase RLS and server-side validation so that:

- Teachers only access assigned data.
- Students only access their own data.
- Parents only access linked children.
- Admins access according to their role/permissions.

---

# 40. UI Architecture Principle

Use a consistent application shell.

Admin:

```text
Sidebar
│
├── Dashboard
├── Students
├── Academics
├── Attendance
├── Examinations
├── HR
├── Fees
├── Finance
├── Reports
└── Settings
```

Each major module can have:

```text
List/View
Create/Edit
Details
Filters
Reports
```

Avoid putting every possible function into one enormous page.

However, do not unnecessarily create separate applications for each feature.

Use dialogs for small quick actions and dedicated pages for complex workflows.

---

# 41. AI Development Rules

The application will be developed incrementally using AI coding tools.

When implementing a phase:

1. Inspect the existing project structure.
2. Inspect the existing database schema.
3. Do not destroy working functionality.
4. Do not rewrite unrelated modules.
5. Make database changes before dependent UI changes.
6. Reuse existing components and design patterns.
7. Keep naming consistent.
8. Add validation.
9. Add appropriate RLS policies.
10. Test existing workflows after changes.
11. Do not hardcode master data.
12. Do not create duplicate tables for the same concept.
13. Do not create separate business logic for each portal when the same logic can be shared.

---

# 42. Feature Implementation Pattern

For each new module, follow this sequence:

```text
1. Define requirements
        ↓
2. Design database tables
        ↓
3. Define relationships
        ↓
4. Define permissions/RLS
        ↓
5. Create backend operations
        ↓
6. Build Admin UI
        ↓
7. Build portal/mobile views
        ↓
8. Build reports
        ↓
9. Test workflows
        ↓
10. Move to next module
```

Do not jump directly into UI generation without first determining the underlying data model.

---

# 43. Definition of Done

A module is not considered complete simply because its page exists.

A module is complete only when:

- Database schema exists.
- Relationships are correct.
- Authentication/permissions are implemented.
- RLS is implemented where required.
- Admin workflow works.
- Relevant portal workflow works.
- Validation exists.
- Historical data behavior is correct.
- Reports use the same underlying data.
- Existing modules continue to work.
- Basic edge cases have been tested.

---

# 44. Initial Build Target

Start by implementing only:

```text
FOUNDATION

Authentication
User Profiles
Roles
Application Shell
Dashboard
Settings

ACADEMIC SETTINGS

Academic Years
Classes
Sections
Batches (Advance, Regular, ICU)
Subjects
Class Subjects
```

After this foundation is tested and stable, implement:

```text
Student Inquiry
↓
Student Master
↓
Student Admission (with Batch allocation & Regular / Supplementary selection)
↓
Academic Enrollment
↓
Previous-Year Enrollment & Batch Promotion
```

Then continue through the development sequence defined above.

The project should be developed **module-by-module, dialog-by-dialog, workflow-by-workflow and report-by-report**, rather than attempting to generate the entire system at once.
