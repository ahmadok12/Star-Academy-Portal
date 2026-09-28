export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
export type EntityStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface AcademySettings {
  id: string;
  academy_name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. 2026-27
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: EntityStatus;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  display_order: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface SectionItem {
  id: string;
  name: string;
  code: string;
  display_order: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface ClassSection {
  id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  class?: ClassItem;
  section?: SectionItem;
  academic_year?: AcademicYear;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  short_name: string;
  display_order: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface ClassSubject {
  id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  display_order: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  class?: ClassItem;
  section?: SectionItem;
  subject?: SubjectItem;
  academic_year?: AcademicYear;
}

// ============================================================================
// BATCHES MASTER TYPES
// ============================================================================
export interface BatchItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  display_order: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PHASE 3: STUDENTS MODULE TYPES
// ============================================================================
export type InquiryStatus = 'New' | 'Contacted' | 'Follow-up' | 'Enrolled' | 'Rejected' | 'Lost';
export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'active' | 'inactive' | 'passed_out' | 'struck_off';
export type EnrollmentStatus = 'active' | 'promoted' | 'retained' | 'left';
export type EnrollmentType = 'regular' | 'supplementary';

export interface StudentInquiry {
  id: string;
  inquiry_no: string;
  date: string;
  student_name: string;
  father_name?: string | null;
  contact: string;
  interested_class_id?: string | null;
  enrollment_type?: EnrollmentType;
  source: string;
  status: InquiryStatus;
  remarks?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  interested_class?: ClassItem;
}

export interface Student {
  id: string;
  admission_no: string;
  student_name: string;
  father_name: string;
  mother_name?: string | null;
  dob: string;
  gender: Gender;
  cnic_bform?: string | null;
  address?: string | null;
  phone: string;
  emergency_contact?: string | null;
  photo_url?: string | null;
  blood_group?: string | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentAcademicRecord {
  id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  batch_id?: string | null;
  roll_no?: string | null;
  enrollment_type?: EnrollmentType;
  supplementary_subject_ids?: string[] | null;
  supplementary_notes?: string | null;
  status: EnrollmentStatus;
  enrollment_date: string;
  leaving_date?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  student?: Student;
  academic_year?: AcademicYear;
  class?: ClassItem;
  section?: SectionItem;
  batch?: BatchItem;
  supplementary_subjects?: SubjectItem[];
}

export interface StudentWithEnrollment extends Student {
  currentEnrollment?: StudentAcademicRecord;
  allEnrollments?: StudentAcademicRecord[];
}

// ============================================================================
// PHASE 4: STAFF & TEACHER ASSIGNMENTS
// ============================================================================

export type StaffRole =
  | 'teacher'
  | 'admin'
  | 'accountant'
  | 'clerk'
  | 'principal'
  | 'librarian'
  | 'support'
  | 'other';

export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export type ContractType =
  | 'Permanent'
  | 'Visiting / Contract'
  | 'Probation'
  | 'Part-Time';

export interface Staff {
  id: string;
  employee_id: string;
  user_id?: string | null;
  name: string;
  father_name?: string | null;
  role: StaffRole;
  designation: string;
  department?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  phone: string;
  email?: string | null;
  cnic?: string | null;
  gender: Gender;
  dob?: string | null;
  joining_date: string;
  contract_type: ContractType;
  salary: number;
  address?: string | null;
  emergency_contact?: string | null;
  photo_url?: string | null;
  status: StaffStatus;
  created_at: string;
  updated_at: string;
}

export interface TeacherSubjectAssignment {
  id: string;
  academic_year_id: string;
  teacher_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  is_class_teacher: boolean;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  // Joined
  teacher?: Staff;
  academic_year?: AcademicYear;
  class?: ClassItem;
  section?: SectionItem;
  subject?: SubjectItem;
}

