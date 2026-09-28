import { supabase, isSupabaseConfigured } from './supabase';
import {
  AcademySettings,
  AcademicYear,
  ClassItem,
  SectionItem,
  ClassSection,
  SubjectItem,
  ClassSubject,
  EntityStatus,
  BatchItem,
  EnrollmentType,
  StudentInquiry,
  Student,
  StudentAcademicRecord,
  StudentWithEnrollment,
  Staff,
  TeacherSubjectAssignment
} from '../types/database.types';

// ============================================================================
// INITIAL SEED DATA (mirrors supabase/migrations/00002_seed_data.sql & 00003_students_module.sql)
// ============================================================================
const INITIAL_SETTINGS: AcademySettings = {
  id: '00000000-0000-0000-0000-000000000001',
  academy_name: 'Star Academy',
  logo_url: null,
  address: 'Main Campus, Education Hub, Lahore, Pakistan',
  phone: '+92 42 35870000',
  email: 'admin@staracademy.edu.pk',
  website: 'https://staracademy.edu.pk',
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: '2026-27',
    start_date: '2026-05-01',
    end_date: '2027-04-30',
    status: 'active',
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000000',
    name: '2025-26',
    start_date: '2025-05-01',
    end_date: '2026-04-30',
    status: 'active',
    is_current: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_CLASSES: ClassItem[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Pre 9th', code: 'PRE-9', display_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Class 9', code: 'CL-9', display_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Class 10', code: 'CL-10', display_order: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', name: 'FSc Part 1', code: 'FSC-1', display_order: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000005', name: 'FSc Part 2', code: 'FSC-2', display_order: 5, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_SECTIONS: SectionItem[] = [
  { id: 's0000000-0000-0000-0000-000000000001', name: 'A', code: 'SEC-A', display_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000002', name: 'B', code: 'SEC-B', display_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000003', name: 'C', code: 'SEC-C', display_order: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_BATCHES: BatchItem[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Advance Batch',
    code: 'ADV',
    description: 'Accelerated curriculum and high-performance academic coaching',
    display_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Regular Batch',
    code: 'REG',
    description: 'Standard institutional curriculum and board examination preparation',
    display_order: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'ICU Batch',
    code: 'ICU',
    description: 'Intensive Care Unit / academic reinforcement and rescue coaching for struggling students',
    display_order: 3,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'English', code: 'ENG', short_name: 'English', display_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Urdu', code: 'URD', short_name: 'Urdu', display_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'Mathematics', code: 'MTH', short_name: 'Maths', display_order: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Science', code: 'SCI', short_name: 'Science', display_order: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Computer Science', code: 'CS', short_name: 'Comp Sci', display_order: 5, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000006', name: 'Islamiyat', code: 'ISL', short_name: 'Islamiyat', display_order: 6, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_CLASS_SECTIONS: ClassSection[] = [
  { id: 'cs000000-0000-0000-0000-000000000001', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 's0000000-0000-0000-0000-000000000001', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000002', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 's0000000-0000-0000-0000-000000000002', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000003', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000003', section_id: 's0000000-0000-0000-0000-000000000001', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000004', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000003', section_id: 's0000000-0000-0000-0000-000000000002', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000005', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000003', section_id: 's0000000-0000-0000-0000-000000000003', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_CLASS_SUBJECTS: ClassSubject[] = [
  { id: 'cb000000-0000-0000-0000-000000000001', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', subject_id: 'b0000000-0000-0000-0000-000000000001', display_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000000-0000-0000-0000-000000000002', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', subject_id: 'b0000000-0000-0000-0000-000000000002', display_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000000-0000-0000-0000-000000000003', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', subject_id: 'b0000000-0000-0000-0000-000000000003', display_order: 3, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cb000000-0000-0000-0000-000000000004', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', subject_id: 'b0000000-0000-0000-0000-000000000005', display_order: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

// Phase 3: Initial Inquiries
const INITIAL_INQUIRIES: StudentInquiry[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    inquiry_no: 'INQ-2026-0001',
    date: new Date().toISOString().split('T')[0],
    student_name: 'Zaid Khan',
    father_name: 'Tariq Khan',
    contact: '+92 300 1234567',
    interested_class_id: 'c0000000-0000-0000-0000-000000000002',
    source: 'Walk-in',
    status: 'New',
    remarks: 'Interested in Science group admission',
    follow_up_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    inquiry_no: 'INQ-2026-0002',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    student_name: 'Ayesha Bibi',
    father_name: 'Muhammad Arshad',
    contact: '+92 321 9876543',
    interested_class_id: 'c0000000-0000-0000-0000-000000000003',
    source: 'Social Media',
    status: 'Follow-up',
    remarks: 'Called for fee structure query',
    follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Phase 3: Initial Students (Permanent Master)
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    admission_no: 'ADM-2026-0001',
    student_name: 'Muhammad Ali',
    father_name: 'Usman Ali',
    mother_name: 'Fatima Bibi',
    dob: '2010-04-15',
    gender: 'Male',
    cnic_bform: '35202-1234567-1',
    address: 'House 14, Block B, Model Town, Lahore',
    phone: '+92 300 5550101',
    emergency_contact: '+92 300 5550102',
    photo_url: null,
    blood_group: 'B+',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    admission_no: 'ADM-2026-0002',
    student_name: 'Fatima Noor',
    father_name: 'Noor Ahmad',
    mother_name: 'Zainab Bibi',
    dob: '2010-08-20',
    gender: 'Female',
    cnic_bform: '35202-7654321-2',
    address: 'Street 3, Gulberg III, Lahore',
    phone: '+92 321 5550202',
    emergency_contact: '+92 321 5550203',
    photo_url: null,
    blood_group: 'O+',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    admission_no: 'ADM-2026-0003',
    student_name: 'Bilal Hassan',
    father_name: 'Hassan Raza',
    mother_name: 'Maryam Bibi',
    dob: '2009-11-12',
    gender: 'Male',
    cnic_bform: '35202-9988776-1',
    address: 'Sector C, DHA Phase 5, Lahore',
    phone: '+92 333 5550303',
    emergency_contact: '+92 333 5550304',
    photo_url: null,
    blood_group: 'A+',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Phase 3: Initial Academic Enrollments
const INITIAL_ACADEMIC_RECORDS: StudentAcademicRecord[] = [
  {
    id: 'sar00000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    class_id: 'c0000000-0000-0000-0000-000000000002', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    batch_id: 'b0000000-0000-0000-0000-000000000001', // Advance Batch
    enrollment_type: 'regular',
    roll_no: '01',
    status: 'active',
    enrollment_date: '2026-05-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sar00000-0000-0000-0000-000000000002',
    student_id: 'd0000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    class_id: 'c0000000-0000-0000-0000-000000000002', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000002', // Section B
    batch_id: 'b0000000-0000-0000-0000-000000000002', // Regular Batch
    enrollment_type: 'regular',
    roll_no: '02',
    status: 'active',
    enrollment_date: '2026-05-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sar00000-0000-0000-0000-000000000003',
    student_id: 'd0000000-0000-0000-0000-000000000003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    class_id: 'c0000000-0000-0000-0000-000000000003', // Class 10
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    batch_id: 'b0000000-0000-0000-0000-000000000003', // ICU Batch
    enrollment_type: 'supplementary',
    supplementary_subject_ids: ['b0000000-0000-0000-0000-000000000003'], // Mathematics
    supplementary_notes: 'Preparing for BISE Supplementary Examination in Mathematics',
    roll_no: '01',
    status: 'active',
    enrollment_date: '2026-05-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_STAFF: Staff[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    employee_id: 'TCH-001',
    name: 'Prof. Muhammad Tariq',
    father_name: 'Haji Ghulam Rasool',
    role: 'teacher',
    designation: 'Senior Mathematics Lecturer',
    department: 'Mathematics',
    qualification: 'M.Sc Mathematics, M.Ed',
    specialization: 'Pure Mathematics & Calculus',
    phone: '0300-1122334',
    email: 'tariq.math@staracademy.edu.pk',
    cnic: '35202-1234567-1',
    gender: 'Male',
    joining_date: '2020-08-15',
    contract_type: 'Permanent',
    salary: 85000,
    address: 'House 12, Gulshan Ravi, Lahore',
    emergency_contact: '0300-9988776',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    employee_id: 'TCH-002',
    name: 'Dr. Sarah Farooq',
    father_name: 'Dr. Farooq Ahmad',
    role: 'teacher',
    designation: 'Head of Department - Physics',
    department: 'Sciences',
    qualification: 'Ph.D Applied Physics',
    specialization: 'Modern Physics & Electromagnetism',
    phone: '0321-9876543',
    email: 'sarah.farooq@staracademy.edu.pk',
    cnic: '35201-7654321-2',
    gender: 'Female',
    joining_date: '2019-09-01',
    contract_type: 'Permanent',
    salary: 110000,
    address: '15-C, Model Town, Lahore',
    emergency_contact: '0321-1122334',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    employee_id: 'TCH-003',
    name: 'Engr. Bilal Hashmi',
    father_name: 'Hashmi Riaz',
    role: 'teacher',
    designation: 'Lecturer Chemistry',
    department: 'Sciences',
    qualification: 'M.Phil Organic Chemistry',
    specialization: 'Organic & Analytical Chemistry',
    phone: '0333-5566778',
    email: 'bilal.hashmi@staracademy.edu.pk',
    cnic: '35200-3344556-3',
    gender: 'Male',
    joining_date: '2022-01-10',
    contract_type: 'Permanent',
    salary: 75000,
    address: 'Block E, Johar Town, Lahore',
    emergency_contact: '0333-1122445',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    employee_id: 'TCH-004',
    name: 'Ms. Ayesha Siddiqui',
    father_name: 'Muhammad Siddique',
    role: 'teacher',
    designation: 'English Language Instructor',
    department: 'Humanities',
    qualification: 'M.A English Literature & Linguistics',
    specialization: 'Grammar, Essay Writing & Literature',
    phone: '0345-4433221',
    email: 'ayesha.eng@staracademy.edu.pk',
    cnic: '35202-9988776-4',
    gender: 'Female',
    joining_date: '2021-03-15',
    contract_type: 'Permanent',
    salary: 70000,
    address: 'Canal View Society, Lahore',
    emergency_contact: '0345-1234567',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    employee_id: 'TCH-005',
    name: 'Mr. Usman Ali Khan',
    father_name: 'Liaquat Ali Khan',
    role: 'teacher',
    designation: 'Computer Science Instructor',
    department: 'Computer Science',
    qualification: 'BS Computer Science, MS-CS',
    specialization: 'Database Systems & C++',
    phone: '0312-8877665',
    email: 'usman.cs@staracademy.edu.pk',
    cnic: '35201-5544332-5',
    gender: 'Male',
    joining_date: '2023-08-01',
    contract_type: 'Permanent',
    salary: 72000,
    address: 'Wapda Town, Lahore',
    emergency_contact: '0312-9988112',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    employee_id: 'ADM-001',
    name: 'Malik Jahangir',
    father_name: 'Malik Khuda Bakhsh',
    role: 'admin',
    designation: 'Academy Administrator / Registrar',
    department: 'Administration',
    qualification: 'MBA Educational Management',
    specialization: 'Admissions, HR & Compliance',
    phone: '0300-5551122',
    email: 'admin@staracademy.edu.pk',
    cnic: '35202-4455667-7',
    gender: 'Male',
    joining_date: '2018-05-01',
    contract_type: 'Permanent',
    salary: 95000,
    address: 'Allama Iqbal Town, Lahore',
    emergency_contact: '0300-4443322',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30000000-0000-0000-0000-000000000007',
    employee_id: 'ACC-001',
    name: 'Sheikh Zeeshan',
    father_name: 'Sheikh Anwar',
    role: 'accountant',
    designation: 'Finance & Accounts Officer',
    department: 'Finance',
    qualification: 'M.Com, ACCA Finalist',
    specialization: 'Payroll, Fee Reconciliation & Taxation',
    phone: '0322-6677889',
    email: 'accounts@staracademy.edu.pk',
    cnic: '35201-8899001-8',
    gender: 'Male',
    joining_date: '2020-11-15',
    contract_type: 'Permanent',
    salary: 80000,
    address: 'Shadman, Lahore',
    emergency_contact: '0322-7788990',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_TEACHER_ASSIGNMENTS: TeacherSubjectAssignment[] = [
  {
    id: '31000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    teacher_id: '30000000-0000-0000-0000-000000000001', // Prof Tariq
    class_id: 'c0000000-0000-0000-0000-000000000001', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    subject_id: 'sub00000-0000-0000-0000-000000000001', // Mathematics
    is_class_teacher: true,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '31000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    teacher_id: '30000000-0000-0000-0000-000000000002', // Dr. Sarah
    class_id: 'c0000000-0000-0000-0000-000000000001', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    subject_id: 'sub00000-0000-0000-0000-000000000002', // Physics
    is_class_teacher: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '31000000-0000-0000-0000-000000000003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    teacher_id: '30000000-0000-0000-0000-000000000003', // Engr. Bilal
    class_id: 'c0000000-0000-0000-0000-000000000001', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    subject_id: 'sub00000-0000-0000-0000-000000000003', // Chemistry
    is_class_teacher: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '31000000-0000-0000-0000-000000000004',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001', // 2026-27
    teacher_id: '30000000-0000-0000-0000-000000000004', // Ms. Ayesha
    class_id: 'c0000000-0000-0000-0000-000000000001', // Class 9
    section_id: 's0000000-0000-0000-0000-000000000001', // Section A
    subject_id: 'sub00000-0000-0000-0000-000000000004', // English
    is_class_teacher: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Local storage keys
const STORAGE_KEYS = {
  SETTINGS: 'star_academy_settings',
  YEARS: 'star_academy_years',
  CLASSES: 'star_academy_classes',
  SECTIONS: 'star_academy_sections',
  BATCHES: 'star_academy_batches',
  CLASS_SECTIONS: 'star_academy_class_sections',
  SUBJECTS: 'star_academy_subjects',
  CLASS_SUBJECTS: 'star_academy_class_subjects',
  INQUIRIES: 'star_academy_student_inquiries',
  STUDENTS: 'star_academy_students',
  STUDENT_ACADEMIC_RECORDS: 'star_academy_student_academic_records',
  STAFF: 'star_academy_staff',
  TEACHER_ASSIGNMENTS: 'star_academy_teacher_assignments',
};

// Safe storage access helper (supports browser localStorage and Node test environments)
const memoryStorage = new Map<string, string>();

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(raw);
    } else {
      const raw = memoryStorage.get(key);
      if (!raw) {
        memoryStorage.set(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(raw);
    }
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      memoryStorage.set(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Failed to save key ${key} to storage`, e);
  }
}

// ============================================================================
// DATABASE SERVICE API
// ============================================================================
export const databaseService = {
  // --------------------------------------------------------------------------
  // Academy Settings
  // --------------------------------------------------------------------------
  async getAcademySettings(): Promise<AcademySettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academy_settings')
          .select('*')
          .limit(1)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    return loadFromStorage<AcademySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateAcademySettings(updates: Partial<AcademySettings>): Promise<AcademySettings> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academy_settings')
          .update({ ...updates, updated_at: now })
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed, falling back to local store', e);
      }
    }
    const current = await this.getAcademySettings();
    const updated = { ...current, ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  async uploadLogo(file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `academy/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('academy-assets')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('academy-assets')
            .getPublicUrl(filePath);

          if (data?.publicUrl) {
            await this.updateAcademySettings({ logo_url: data.publicUrl });
            return data.publicUrl;
          }
        }
      } catch (e) {
        console.warn('Supabase logo upload failed, using local Data URL', e);
      }
    }

    // Local Data URL fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        await this.updateAcademySettings({ logo_url: dataUrl });
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  },

  // --------------------------------------------------------------------------
  // Academic Years
  // --------------------------------------------------------------------------
  async getAcademicYears(): Promise<AcademicYear[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('academic_years')
          .select('*')
          .order('start_date', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    const years = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);
    return years.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  },

  async createAcademicYear(payload: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>): Promise<AcademicYear> {
    if (new Date(payload.start_date) >= new Date(payload.end_date)) {
      throw new Error('Academic year start date must be strictly before end date.');
    }

    const now = new Date().toISOString();
    const newYear: AcademicYear = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        if (newYear.is_current) {
          await supabase.from('academic_years').update({ is_current: false }).eq('is_current', true);
        }
        const { data, error } = await supabase
          .from('academic_years')
          .insert(newYear)
          .select()
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving to local store', e);
      }
    }

    let years = await this.getAcademicYears();
    // Validate uniqueness of name
    if (years.some(y => y.name.trim().toLowerCase() === newYear.name.trim().toLowerCase())) {
      throw new Error(`Academic year with name "${newYear.name}" already exists.`);
    }

    if (newYear.is_current) {
      years = years.map(y => ({ ...y, is_current: false }));
    }
    years.push(newYear);
    saveToStorage(STORAGE_KEYS.YEARS, years);
    return newYear;
  },

  async updateAcademicYear(id: string, updates: Partial<AcademicYear>): Promise<AcademicYear> {
    if (updates.start_date && updates.end_date) {
      if (new Date(updates.start_date) >= new Date(updates.end_date)) {
        throw new Error('Start date must be before end date.');
      }
    }

    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        if (updates.is_current) {
          await supabase.from('academic_years').update({ is_current: false }).neq('id', id);
        }
        const { data, error } = await supabase
          .from('academic_years')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed, saving locally', e);
      }
    }

    const years = await this.getAcademicYears();
    const index = years.findIndex(y => y.id === id);
    if (index === -1) throw new Error('Academic year not found');

    if (updates.is_current) {
      years.forEach(y => { y.is_current = false; });
    }

    years[index] = { ...years[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.YEARS, years);
    return years[index];
  },

  async setCurrentAcademicYear(id: string): Promise<AcademicYear> {
    if (isSupabaseConfigured) {
      try {
        const { error: rpcError } = await supabase.rpc('set_current_academic_year', { target_year_id: id });
        if (!rpcError) {
          const { data } = await supabase.from('academic_years').select('*').eq('id', id).single();
          if (data) return data;
        } else {
          // Fallback SQL update sequence
          await supabase.from('academic_years').update({ is_current: false }).eq('is_current', true);
          const { data } = await supabase.from('academic_years').update({ is_current: true, status: 'active' }).eq('id', id).select().single();
          if (data) return data;
        }
      } catch (e) {
        console.warn('Supabase RPC failed, using local store', e);
      }
    }

    const years = await this.getAcademicYears();
    let updatedYear: AcademicYear | null = null;
    const updated = years.map(y => {
      if (y.id === id) {
        updatedYear = { ...y, is_current: true, status: 'active', updated_at: new Date().toISOString() };
        return updatedYear;
      }
      return { ...y, is_current: false };
    });

    if (!updatedYear) throw new Error('Academic year not found');
    saveToStorage(STORAGE_KEYS.YEARS, updated);
    return updatedYear;
  },

  async deleteAcademicYear(id: string): Promise<void> {
    // Check referential integrity with class_sections or class_subjects
    const classSections = await this.getClassSections(id);
    const classSubjects = await this.getClassSubjects(id);
    if (classSections.length > 0 || classSubjects.length > 0) {
      throw new Error('Cannot delete academic year: Historical class sections or subjects are linked to it. Please deactivate the year instead.');
    }

    const years = await this.getAcademicYears();
    const target = years.find(y => y.id === id);
    if (target?.is_current) {
      throw new Error('Cannot delete the current academic year. Please designate another year as current first.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('academic_years').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const filtered = years.filter(y => y.id !== id);
    saveToStorage(STORAGE_KEYS.YEARS, filtered);
  },

  // --------------------------------------------------------------------------
  // Classes Master
  // --------------------------------------------------------------------------
  async getClasses(): Promise<ClassItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    const list = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    return list.sort((a, b) => a.display_order - b.display_order);
  },

  async createClass(payload: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>): Promise<ClassItem> {
    const now = new Date().toISOString();
    const newClass: ClassItem = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .insert(newClass)
          .select()
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const list = await this.getClasses();
    if (list.some(c => c.name.trim().toLowerCase() === newClass.name.trim().toLowerCase())) {
      throw new Error(`Class with name "${newClass.name}" already exists.`);
    }
    if (list.some(c => c.code.trim().toLowerCase() === newClass.code.trim().toLowerCase())) {
      throw new Error(`Class code "${newClass.code}" already exists.`);
    }

    list.push(newClass);
    saveToStorage(STORAGE_KEYS.CLASSES, list);
    return newClass;
  },

  async updateClass(id: string, updates: Partial<ClassItem>): Promise<ClassItem> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed, saving locally', e);
      }
    }

    const list = await this.getClasses();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Class not found');

    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.CLASSES, list);
    return list[index];
  },

  async deleteClass(id: string): Promise<void> {
    // Check referential integrity
    const allClassSections = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    const allClassSubjects = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);

    const hasSections = allClassSections.some(cs => cs.class_id === id);
    const hasSubjects = allClassSubjects.some(cs => cs.class_id === id);

    if (hasSections || hasSubjects) {
      throw new Error('Classes must NOT be deleted if they are already referenced by academic year data. Please deactivate the class instead.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const list = await this.getClasses();
    const filtered = list.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLASSES, filtered);
  },

  // --------------------------------------------------------------------------
  // Sections Master
  // --------------------------------------------------------------------------
  async getSections(): Promise<SectionItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('sections')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back to local store', e);
      }
    }
    const list = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    return list.sort((a, b) => a.display_order - b.display_order);
  },

  async createSection(payload: Omit<SectionItem, 'id' | 'created_at' | 'updated_at'>): Promise<SectionItem> {
    const now = new Date().toISOString();
    const newSection: SectionItem = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('sections')
          .insert(newSection)
          .select()
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const list = await this.getSections();
    if (list.some(s => s.name.trim().toLowerCase() === newSection.name.trim().toLowerCase())) {
      throw new Error(`Section "${newSection.name}" already exists.`);
    }
    if (list.some(s => s.code.trim().toLowerCase() === newSection.code.trim().toLowerCase())) {
      throw new Error(`Section code "${newSection.code}" already exists.`);
    }

    list.push(newSection);
    saveToStorage(STORAGE_KEYS.SECTIONS, list);
    return newSection;
  },

  async updateSection(id: string, updates: Partial<SectionItem>): Promise<SectionItem> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('sections')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed, saving locally', e);
      }
    }

    const list = await this.getSections();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Section not found');

    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.SECTIONS, list);
    return list[index];
  },

  async deleteSection(id: string): Promise<void> {
    const allClassSections = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    const hasAssignments = allClassSections.some(cs => cs.section_id === id);

    if (hasAssignments) {
      throw new Error('Sections must NOT be deleted if they are referenced by academic year class assignments. Please deactivate the section instead.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('sections').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const list = await this.getSections();
    const filtered = list.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SECTIONS, filtered);
  },

  // --------------------------------------------------------------------------
  // Batches Master
  // --------------------------------------------------------------------------
  async getBatches(): Promise<BatchItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data as BatchItem[];
      } catch (e) {
        console.warn('Supabase batches query failed, falling back locally', e);
      }
    }
    const batches = loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    return batches.sort((a, b) => a.display_order - b.display_order);
  },

  async createBatch(payload: Omit<BatchItem, 'id' | 'created_at' | 'updated_at'>): Promise<BatchItem> {
    const batches = await this.getBatches();
    if (batches.some(b => b.code.trim().toUpperCase() === payload.code.trim().toUpperCase())) {
      throw new Error(`A batch with code "${payload.code}" already exists.`);
    }
    if (batches.some(b => b.name.trim().toLowerCase() === payload.name.trim().toLowerCase())) {
      throw new Error(`A batch named "${payload.name}" already exists.`);
    }

    const now = new Date().toISOString();
    const newBatch: BatchItem = {
      ...payload,
      id: crypto.randomUUID(),
      code: payload.code.trim().toUpperCase(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .insert(newBatch)
          .select()
          .single();
        if (!error && data) return data as BatchItem;
      } catch (e) {
        console.warn('Supabase batch insert failed, saving locally', e);
      }
    }

    const all = loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    all.push(newBatch);
    saveToStorage(STORAGE_KEYS.BATCHES, all);
    return newBatch;
  },

  async updateBatch(id: string, updates: Partial<BatchItem>): Promise<BatchItem> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as BatchItem;
      } catch (e) {
        console.warn('Supabase batch update failed, saving locally', e);
      }
    }

    const list = loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Batch not found');
    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.BATCHES, list);
    return list[index];
  },

  async updateBatchStatus(id: string, status: EntityStatus): Promise<BatchItem> {
    return this.updateBatch(id, { status });
  },

  async deleteBatch(id: string): Promise<void> {
    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);
    const inUse = allRecords.some(r => r.batch_id === id);
    if (inUse) {
      throw new Error('Cannot delete this batch: Students are currently or historically enrolled in it. Please deactivate the batch instead.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('batches').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase batch delete failed', e);
      }
    }

    const list = loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    const filtered = list.filter(b => b.id !== id);
    saveToStorage(STORAGE_KEYS.BATCHES, filtered);
  },

  // --------------------------------------------------------------------------
  // Class Sections (Academic Year Relationships)
  // --------------------------------------------------------------------------
  async getClassSections(academicYearId?: string, classId?: string): Promise<ClassSection[]> {
    let effectiveYearId = academicYearId;
    let effectiveClassId = classId;

    if (academicYearId && classId) {
      const classes = await this.getClasses();
      const years = await this.getAcademicYears();
      const isParam1Class = classes.some(c => c.id === academicYearId);
      const isParam2Year = years.some(y => y.id === classId);
      if (isParam1Class && isParam2Year) {
        effectiveYearId = classId;
        effectiveClassId = academicYearId;
      }
    }

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('class_sections')
          .select(`
            *,
            class:classes(*),
            section:sections(*),
            academic_year:academic_years(*)
          `);

        if (effectiveYearId) query = query.eq('academic_year_id', effectiveYearId);
        if (effectiveClassId) query = query.eq('class_id', effectiveClassId);

        const { data, error } = await query;
        if (!error && data) return data as ClassSection[];
      } catch (e) {
        console.warn('Supabase class sections query failed, falling back locally', e);
      }
    }

    const classSections = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();

    let filtered = classSections;
    if (effectiveYearId) filtered = filtered.filter(cs => cs.academic_year_id === effectiveYearId);
    if (effectiveClassId) filtered = filtered.filter(cs => cs.class_id === effectiveClassId);

    // Hydrate joined objects
    return filtered.map(cs => ({
      ...cs,
      class: classes.find(c => c.id === cs.class_id),
      section: sections.find(s => s.id === cs.section_id),
      academic_year: years.find(y => y.id === cs.academic_year_id)
    }));
  },

  async createClassSection(academicYearId: string, classId: string, sectionId: string): Promise<ClassSection> {
    const now = new Date().toISOString();
    const newEntry: ClassSection = {
      id: crypto.randomUUID(),
      academic_year_id: academicYearId,
      class_id: classId,
      section_id: sectionId,
      status: 'active',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('class_sections')
          .insert({
            academic_year_id: academicYearId,
            class_id: classId,
            section_id: sectionId,
            status: 'active'
          })
          .select(`
            *,
            class:classes(*),
            section:sections(*),
            academic_year:academic_years(*)
          `)
          .single();

        if (!error && data) return data as ClassSection;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const existing = await this.getClassSections(academicYearId, classId);
    if (existing.some(item => item.section_id === sectionId)) {
      throw new Error('This section is already assigned to this class for the selected academic year.');
    }

    const all = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    all.push(newEntry);
    saveToStorage(STORAGE_KEYS.CLASS_SECTIONS, all);

    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();

    return {
      ...newEntry,
      class: classes.find(c => c.id === classId),
      section: sections.find(s => s.id === sectionId),
      academic_year: years.find(y => y.id === academicYearId)
    };
  },

  async updateClassSectionStatus(id: string, status: EntityStatus): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('class_sections')
          .update({ status, updated_at: now })
          .eq('id', id);
        return;
      } catch (e) {
        console.warn('Supabase status update failed', e);
      }
    }

    const all = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    const index = all.findIndex(cs => cs.id === id);
    if (index !== -1) {
      all[index].status = status;
      all[index].updated_at = now;
      saveToStorage(STORAGE_KEYS.CLASS_SECTIONS, all);
    }
  },

  async deleteClassSection(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('class_sections').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const all = loadFromStorage<ClassSection[]>(STORAGE_KEYS.CLASS_SECTIONS, INITIAL_CLASS_SECTIONS);
    const filtered = all.filter(cs => cs.id !== id);
    saveToStorage(STORAGE_KEYS.CLASS_SECTIONS, filtered);
  },

  // --------------------------------------------------------------------------
  // Subjects Master
  // --------------------------------------------------------------------------
  async getSubjects(): Promise<SubjectItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase query failed, falling back locally', e);
      }
    }
    const list = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    return list.sort((a, b) => a.display_order - b.display_order);
  },

  async createSubject(payload: Omit<SubjectItem, 'id' | 'created_at' | 'updated_at'>): Promise<SubjectItem> {
    const now = new Date().toISOString();
    const newSubject: SubjectItem = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .insert(newSubject)
          .select()
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const list = await this.getSubjects();
    if (list.some(s => s.name.trim().toLowerCase() === newSubject.name.trim().toLowerCase())) {
      throw new Error(`Subject with name "${newSubject.name}" already exists.`);
    }
    if (list.some(s => s.code.trim().toLowerCase() === newSubject.code.trim().toLowerCase())) {
      throw new Error(`Subject code "${newSubject.code}" already exists.`);
    }

    list.push(newSubject);
    saveToStorage(STORAGE_KEYS.SUBJECTS, list);
    return newSubject;
  },

  async updateSubject(id: string, updates: Partial<SubjectItem>): Promise<SubjectItem> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed, saving locally', e);
      }
    }

    const list = await this.getSubjects();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subject not found');

    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.SUBJECTS, list);
    return list[index];
  },

  async deleteSubject(id: string): Promise<void> {
    const allClassSubjects = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);
    const hasAssignments = allClassSubjects.some(cs => cs.subject_id === id);

    if (hasAssignments) {
      throw new Error('Subjects must NOT be deleted if they are assigned to classes in academic year curricula. Please deactivate the subject instead.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const list = await this.getSubjects();
    const filtered = list.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SUBJECTS, filtered);
  },

  // --------------------------------------------------------------------------
  // Class Subjects (Academic Year Relationships)
  // --------------------------------------------------------------------------
  async getClassSubjects(
    academicYearId?: string,
    classId?: string,
    sectionId?: string
  ): Promise<ClassSubject[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('class_subjects')
          .select(`
            *,
            class:classes(*),
            section:sections(*),
            subject:subjects(*),
            academic_year:academic_years(*)
          `)
          .order('display_order', { ascending: true });

        if (academicYearId) query = query.eq('academic_year_id', academicYearId);
        if (classId) query = query.eq('class_id', classId);
        if (sectionId) {
          query = query.or(`section_id.eq.${sectionId},section_id.is.null`);
        }

        const { data, error } = await query;
        if (!error && data) return data as ClassSubject[];
      } catch (e) {
        console.warn('Supabase class subjects query failed, falling back locally', e);
      }
    }

    const classSubjects = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);
    const classes = await this.getClasses();
    const sections = await this.getSections();
    const subjects = await this.getSubjects();
    const years = await this.getAcademicYears();

    let filtered = classSubjects;
    if (academicYearId) filtered = filtered.filter(cs => cs.academic_year_id === academicYearId);
    if (classId) filtered = filtered.filter(cs => cs.class_id === classId);
    if (sectionId) {
      filtered = filtered.filter(cs => !cs.section_id || cs.section_id === sectionId);
    }

    return filtered.map(cs => ({
      ...cs,
      class: classes.find(c => c.id === cs.class_id),
      section: sections.find(s => s.id === cs.section_id),
      subject: subjects.find(s => s.id === cs.subject_id),
      academic_year: years.find(y => y.id === cs.academic_year_id)
    })).sort((a, b) => a.display_order - b.display_order);
  },

  async createClassSubject(
    academicYearId: string,
    classId: string,
    subjectId: string,
    displayOrder = 1,
    sectionId?: string | null
  ): Promise<ClassSubject> {
    const now = new Date().toISOString();
    const newEntry: ClassSubject = {
      id: crypto.randomUUID(),
      academic_year_id: academicYearId,
      class_id: classId,
      section_id: sectionId || null,
      subject_id: subjectId,
      display_order: displayOrder,
      status: 'active',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('class_subjects')
          .insert({
            academic_year_id: academicYearId,
            class_id: classId,
            section_id: sectionId || null,
            subject_id: subjectId,
            display_order: displayOrder,
            status: 'active'
          })
          .select(`
            *,
            class:classes(*),
            section:sections(*),
            subject:subjects(*),
            academic_year:academic_years(*)
          `)
          .single();

        if (!error && data) return data as ClassSubject;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const all = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);
    
    // Duplicate validation: check if already assigned to this exact section (or all sections if sectionId is null)
    const duplicate = all.find(item => 
      item.academic_year_id === academicYearId &&
      item.class_id === classId &&
      (item.section_id || null) === (sectionId || null) &&
      item.subject_id === subjectId
    );
    if (duplicate) {
      throw new Error(
        sectionId 
          ? 'This subject is already assigned to this class section for the selected academic year.'
          : 'This subject is already assigned to this class for the selected academic year.'
      );
    }

    all.push(newEntry);
    saveToStorage(STORAGE_KEYS.CLASS_SUBJECTS, all);

    const classes = await this.getClasses();
    const sections = await this.getSections();
    const subjects = await this.getSubjects();
    const years = await this.getAcademicYears();

    return {
      ...newEntry,
      class: classes.find(c => c.id === classId),
      section: sections.find(s => s.id === sectionId),
      subject: subjects.find(s => s.id === subjectId),
      academic_year: years.find(y => y.id === academicYearId)
    };
  },

  async updateClassSubject(id: string, updates: Partial<ClassSubject>): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('class_subjects')
          .update({ ...updates, updated_at: now })
          .eq('id', id);
        return;
      } catch (e) {
        console.warn('Supabase update failed', e);
      }
    }

    const all = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);
    const index = all.findIndex(cs => cs.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates, updated_at: now };
      saveToStorage(STORAGE_KEYS.CLASS_SUBJECTS, all);
    }
  },

  async deleteClassSubject(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('class_subjects').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const all = loadFromStorage<ClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, INITIAL_CLASS_SUBJECTS);
    const filtered = all.filter(cs => cs.id !== id);
    saveToStorage(STORAGE_KEYS.CLASS_SUBJECTS, filtered);
  },

  // ==========================================================================
  // PHASE 3: STUDENT INQUIRIES
  // ==========================================================================
  async getStudentInquiries(): Promise<StudentInquiry[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_inquiries')
          .select(`
            *,
            interested_class:classes(*)
          `)
          .order('date', { ascending: false });
        if (!error && data) return data as StudentInquiry[];
      } catch (e) {
        console.warn('Supabase inquiries query failed, using local store', e);
      }
    }

    const list = loadFromStorage<StudentInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const classes = await this.getClasses();

    return list.map(inq => ({
      ...inq,
      interested_class: classes.find(c => c.id === inq.interested_class_id)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createStudentInquiry(payload: Omit<StudentInquiry, 'id' | 'inquiry_no' | 'created_at' | 'updated_at'>): Promise<StudentInquiry> {
    const now = new Date().toISOString();
    const existing = await this.getStudentInquiries();
    const yearNumber = new Date().getFullYear();
    const nextSeq = String(existing.length + 1).padStart(4, '0');
    const inquiryNo = `INQ-${yearNumber}-${nextSeq}`;

    const newInquiry: StudentInquiry = {
      ...payload,
      id: crypto.randomUUID(),
      inquiry_no: inquiryNo,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_inquiries')
          .insert(newInquiry)
          .select(`
            *,
            interested_class:classes(*)
          `)
          .single();
        if (!error && data) return data as StudentInquiry;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase inquiry insert failed, saving locally', e);
      }
    }

    const list = loadFromStorage<StudentInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    list.unshift(newInquiry);
    saveToStorage(STORAGE_KEYS.INQUIRIES, list);

    const classes = await this.getClasses();
    return {
      ...newInquiry,
      interested_class: classes.find(c => c.id === newInquiry.interested_class_id)
    };
  },

  async updateStudentInquiry(id: string, updates: Partial<StudentInquiry>): Promise<StudentInquiry> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_inquiries')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select(`
            *,
            interested_class:classes(*)
          `)
          .single();
        if (!error && data) return data as StudentInquiry;
      } catch (e) {
        console.warn('Supabase inquiry update failed, saving locally', e);
      }
    }

    const list = loadFromStorage<StudentInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const index = list.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Inquiry not found');

    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.INQUIRIES, list);

    const classes = await this.getClasses();
    return {
      ...list[index],
      interested_class: classes.find(c => c.id === list[index].interested_class_id)
    };
  },

  async deleteStudentInquiry(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('student_inquiries').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const list = loadFromStorage<StudentInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const filtered = list.filter(i => i.id !== id);
    saveToStorage(STORAGE_KEYS.INQUIRIES, filtered);
  },

  // ==========================================================================
  // PHASE 3: STUDENTS & ACADEMIC ENROLLMENTS
  // ==========================================================================
  async getStudents(
    academicYearId?: string,
    classId?: string,
    sectionId?: string,
    search?: string,
    batchId?: string,
    enrollmentType?: string
  ): Promise<StudentWithEnrollment[]> {
    if (isSupabaseConfigured) {
      try {
        // Query through student_academic_records joined with students
        let query = supabase
          .from('student_academic_records')
          .select(`
            *,
            student:students(*),
            class:classes(*),
            section:sections(*),
            academic_year:academic_years(*),
            batch:batches(*)
          `);

        if (academicYearId) query = query.eq('academic_year_id', academicYearId);
        if (classId && classId !== 'all') query = query.eq('class_id', classId);
        if (sectionId && sectionId !== 'all') query = query.eq('section_id', sectionId);
        if (batchId && batchId !== 'all') query = query.eq('batch_id', batchId);
        if (enrollmentType && enrollmentType !== 'all') query = query.eq('enrollment_type', enrollmentType);

        const { data, error } = await query;
        if (!error && data) {
          const subjects = await this.getSubjects();
          const results: StudentWithEnrollment[] = data
            .filter((rec: any) => rec.student)
            .map((rec: any) => ({
              ...rec.student,
              currentEnrollment: {
                ...rec,
                supplementary_subjects: subjects.filter(s => rec.supplementary_subject_ids?.includes(s.id))
              }
            }));

          if (search) {
            const q = search.toLowerCase();
            return results.filter(s =>
              s.student_name.toLowerCase().includes(q) ||
              s.admission_no.toLowerCase().includes(q) ||
              s.father_name.toLowerCase().includes(q) ||
              (s.phone && s.phone.includes(q))
            );
          }
          return results;
        }
      } catch (e) {
        console.warn('Supabase students query failed, using local store', e);
      }
    }

    const allStudents = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);
    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();
    const batches = await this.getBatches();
    const subjects = await this.getSubjects();

    // Map each student to their enrollment in the requested academic year
    let matched: StudentWithEnrollment[] = [];

    if (academicYearId) {
      const yearRecords = allRecords.filter(r => r.academic_year_id === academicYearId);
      for (const rec of yearRecords) {
        const student = allStudents.find(s => s.id === rec.student_id);
        if (!student) continue;

        if (classId && classId !== 'all' && rec.class_id !== classId) continue;
        if (sectionId && sectionId !== 'all' && rec.section_id !== sectionId) continue;
        if (batchId && batchId !== 'all' && rec.batch_id !== batchId) continue;
        if (enrollmentType && enrollmentType !== 'all' && (rec.enrollment_type || 'regular') !== enrollmentType) continue;

        const hydratedRec: StudentAcademicRecord = {
          ...rec,
          class: classes.find(c => c.id === rec.class_id),
          section: sections.find(s => s.id === rec.section_id),
          academic_year: years.find(y => y.id === rec.academic_year_id),
          batch: batches.find(b => b.id === rec.batch_id),
          supplementary_subjects: subjects.filter(s => rec.supplementary_subject_ids?.includes(s.id)),
          student: student
        };

        matched.push({
          ...student,
          currentEnrollment: hydratedRec,
          allEnrollments: allRecords.filter(r => r.student_id === student.id)
        });
      }
    } else {
      matched = allStudents.map(student => {
        const studentRecs = allRecords
          .filter(r => r.student_id === student.id)
          .map(r => ({
            ...r,
            class: classes.find(c => c.id === r.class_id),
            section: sections.find(s => s.id === r.section_id),
            academic_year: years.find(y => y.id === r.academic_year_id),
            batch: batches.find(b => b.id === r.batch_id),
            supplementary_subjects: subjects.filter(s => r.supplementary_subject_ids?.includes(s.id))
          }));
        return {
          ...student,
          currentEnrollment: studentRecs[0],
          allEnrollments: studentRecs
        };
      });
    }

    if (search) {
      const q = search.toLowerCase();
      matched = matched.filter(s =>
        s.student_name.toLowerCase().includes(q) ||
        s.admission_no.toLowerCase().includes(q) ||
        s.father_name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
      );
    }

    return matched;
  },

  async getStudentById(id: string): Promise<StudentWithEnrollment | null> {
    const allStudents = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const student = allStudents.find(s => s.id === id);
    if (!student) return null;

    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);
    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();
    const batches = await this.getBatches();
    const subjects = await this.getSubjects();

    const studentEnrollments = allRecords
      .filter(r => r.student_id === id)
      .map(r => ({
        ...r,
        class: classes.find(c => c.id === r.class_id),
        section: sections.find(s => s.id === r.section_id),
        academic_year: years.find(y => y.id === r.academic_year_id),
        batch: batches.find(b => b.id === r.batch_id),
        supplementary_subjects: subjects.filter(s => r.supplementary_subject_ids?.includes(s.id))
      }));

    return {
      ...student,
      currentEnrollment: studentEnrollments[0],
      allEnrollments: studentEnrollments
    };
  },

  async createStudentAdmission(
    studentData: Omit<Student, 'id' | 'admission_no' | 'created_at' | 'updated_at'>,
    enrollmentData: {
      academic_year_id: string;
      class_id: string;
      section_id: string;
      batch_id?: string | null;
      enrollment_type?: EnrollmentType;
      supplementary_subject_ids?: string[];
      supplementary_notes?: string | null;
      roll_no?: string;
      enrollment_date?: string;
    },
    inquiryIdToClose?: string
  ): Promise<StudentWithEnrollment> {
    const now = new Date().toISOString();
    const allStudents = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);

    // Auto-generate Admission Number e.g. ADM-2026-0004
    const yearNumber = new Date().getFullYear();
    const nextSeq = String(allStudents.length + 1).padStart(4, '0');
    const admissionNo = `ADM-${yearNumber}-${nextSeq}`;

    const studentId = crypto.randomUUID();
    const newStudent: Student = {
      ...studentData,
      id: studentId,
      admission_no: admissionNo,
      status: 'active',
      created_at: now,
      updated_at: now
    };

    const newEnrollment: StudentAcademicRecord = {
      id: crypto.randomUUID(),
      student_id: studentId,
      academic_year_id: enrollmentData.academic_year_id,
      class_id: enrollmentData.class_id,
      section_id: enrollmentData.section_id,
      batch_id: enrollmentData.batch_id || null,
      enrollment_type: enrollmentData.enrollment_type || 'regular',
      supplementary_subject_ids: enrollmentData.supplementary_subject_ids || [],
      supplementary_notes: enrollmentData.supplementary_notes || null,
      roll_no: enrollmentData.roll_no || null,
      status: 'active',
      enrollment_date: enrollmentData.enrollment_date || new Date().toISOString().split('T')[0],
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { error: sError } = await supabase.from('students').insert(newStudent);
        if (sError) throw sError;

        const { error: eError } = await supabase.from('student_academic_records').insert(newEnrollment);
        if (eError) throw eError;

        if (inquiryIdToClose) {
          await supabase.from('student_inquiries').update({ status: 'Enrolled' }).eq('id', inquiryIdToClose);
        }
      } catch (e) {
        console.warn('Supabase student admission insert failed, saving locally', e);
      }
    }

    allStudents.push(newStudent);
    saveToStorage(STORAGE_KEYS.STUDENTS, allStudents);

    allRecords.push(newEnrollment);
    saveToStorage(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, allRecords);

    if (inquiryIdToClose) {
      await this.updateStudentInquiry(inquiryIdToClose, { status: 'Enrolled' });
    }

    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();
    const batches = await this.getBatches();
    const subjects = await this.getSubjects();

    return {
      ...newStudent,
      currentEnrollment: {
        ...newEnrollment,
        class: classes.find(c => c.id === newEnrollment.class_id),
        section: sections.find(s => s.id === newEnrollment.section_id),
        academic_year: years.find(y => y.id === newEnrollment.academic_year_id),
        batch: batches.find(b => b.id === newEnrollment.batch_id),
        supplementary_subjects: subjects.filter(s => newEnrollment.supplementary_subject_ids?.includes(s.id))
      }
    };
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Student;
      } catch (e) {
        console.warn('Supabase student update failed, saving locally', e);
      }
    }

    const list = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');

    list[index] = { ...list[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.STUDENTS, list);
    return list[index];
  },

  async promoteOrEnrollStudents(payload: {
    sourceAcademicYearId: string;
    targetAcademicYearId: string;
    targetClassId: string;
    targetSectionId: string;
    targetBatchId?: string | null;
    enrollmentType?: EnrollmentType;
    supplementarySubjectIds?: string[];
    studentIds: string[];
    enrollmentDate?: string;
  }): Promise<{ promotedCount: number }> {
    const now = new Date().toISOString();
    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);

    let count = 0;
    for (const studentId of payload.studentIds) {
      // 1. Mark previous year enrollment as 'promoted'
      const oldRecIndex = allRecords.findIndex(
        r => r.student_id === studentId && r.academic_year_id === payload.sourceAcademicYearId
      );
      if (oldRecIndex !== -1) {
        allRecords[oldRecIndex].status = 'promoted';
        allRecords[oldRecIndex].updated_at = now;
      }

      // 2. Check if enrollment already exists in target year
      const existingTargetIndex = allRecords.findIndex(
        r => r.student_id === studentId && r.academic_year_id === payload.targetAcademicYearId
      );

      if (existingTargetIndex !== -1) {
        // Update target
        allRecords[existingTargetIndex].class_id = payload.targetClassId;
        allRecords[existingTargetIndex].section_id = payload.targetSectionId;
        if (payload.targetBatchId !== undefined) {
          allRecords[existingTargetIndex].batch_id = payload.targetBatchId;
        }
        if (payload.enrollmentType) {
          allRecords[existingTargetIndex].enrollment_type = payload.enrollmentType;
        }
        if (payload.supplementarySubjectIds) {
          allRecords[existingTargetIndex].supplementary_subject_ids = payload.supplementarySubjectIds;
        }
        allRecords[existingTargetIndex].status = 'active';
        allRecords[existingTargetIndex].updated_at = now;
      } else {
        // Insert new enrollment record
        allRecords.push({
          id: crypto.randomUUID(),
          student_id: studentId,
          academic_year_id: payload.targetAcademicYearId,
          class_id: payload.targetClassId,
          section_id: payload.targetSectionId,
          batch_id: payload.targetBatchId || null,
          enrollment_type: payload.enrollmentType || 'regular',
          supplementary_subject_ids: payload.supplementarySubjectIds || [],
          status: 'active',
          enrollment_date: payload.enrollmentDate || new Date().toISOString().split('T')[0],
          created_at: now,
          updated_at: now
        });
      }
      count++;
    }

    saveToStorage(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, allRecords);

    if (isSupabaseConfigured) {
      try {
        for (const studentId of payload.studentIds) {
          await supabase
            .from('student_academic_records')
            .update({ status: 'promoted', updated_at: now })
            .eq('student_id', studentId)
            .eq('academic_year_id', payload.sourceAcademicYearId);

          await supabase
            .from('student_academic_records')
            .upsert({
              student_id: studentId,
              academic_year_id: payload.targetAcademicYearId,
              class_id: payload.targetClassId,
              section_id: payload.targetSectionId,
              batch_id: payload.targetBatchId || null,
              enrollment_type: payload.enrollmentType || 'regular',
              supplementary_subject_ids: payload.supplementarySubjectIds || [],
              status: 'active',
              enrollment_date: payload.enrollmentDate || new Date().toISOString().split('T')[0],
              updated_at: now
            }, { onConflict: 'student_id,academic_year_id' });
        }
      } catch (e) {
        console.warn('Supabase batch promotion failed', e);
      }
    }

    return { promotedCount: count };
  },

  async updateStudentEnrollment(
    recordId: string,
    updates: Partial<StudentAcademicRecord>
  ): Promise<StudentAcademicRecord> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_academic_records')
          .update({ ...updates, updated_at: now })
          .eq('id', recordId)
          .select(`
            *,
            class:classes(*),
            section:sections(*),
            academic_year:academic_years(*),
            batch:batches(*)
          `)
          .single();
        if (!error && data) return data as StudentAcademicRecord;
      } catch (e) {
        console.warn('Supabase enrollment update failed, saving locally', e);
      }
    }

    const allRecords = loadFromStorage<StudentAcademicRecord[]>(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, INITIAL_ACADEMIC_RECORDS);
    const index = allRecords.findIndex(r => r.id === recordId);
    if (index === -1) throw new Error('Enrollment record not found');
    allRecords[index] = { ...allRecords[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.STUDENT_ACADEMIC_RECORDS, allRecords);

    const classes = await this.getClasses();
    const sections = await this.getSections();
    const years = await this.getAcademicYears();
    const batches = await this.getBatches();
    const subjects = await this.getSubjects();

    const rec = allRecords[index];
    return {
      ...rec,
      class: classes.find(c => c.id === rec.class_id),
      section: sections.find(s => s.id === rec.section_id),
      academic_year: years.find(y => y.id === rec.academic_year_id),
      batch: batches.find(b => b.id === rec.batch_id),
      supplementary_subjects: subjects.filter(s => rec.supplementary_subject_ids?.includes(s.id))
    };
  },

  async uploadStudentPhoto(file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `student-${Date.now()}.${fileExt}`;
        const filePath = `students/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('academy-assets')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('academy-assets')
            .getPublicUrl(filePath);

          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (e) {
        console.warn('Supabase photo upload failed, using Data URL', e);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  },

  // ============================================================================
  // PHASE 4: STAFF & TEACHER ASSIGNMENTS
  // ============================================================================

  async getStaff(): Promise<Staff[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('name');
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch staff failed, using local storage', e);
      }
    }
    const staff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    return staff.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getStaffMember(id: string): Promise<Staff | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch single staff failed', e);
      }
    }
    const list = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    return list.find(s => s.id === id) || null;
  },

  async createStaff(data: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> {
    const now = new Date().toISOString();
    const newStaff: Staff = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('staff')
          .insert(newStaff)
          .select()
          .single();
        if (!error && inserted) return inserted;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase create staff failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    list.push(newStaff);
    saveToStorage(STORAGE_KEYS.STAFF, list);
    return newStaff;
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('staff')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase update staff failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Staff member not found');

    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    saveToStorage(STORAGE_KEYS.STAFF, list);
    return updated;
  },

  async deleteStaff(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete staff failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const filtered = list.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.STAFF, filtered);
  },

  async getTeacherAssignments(filters?: {
    academicYearId?: string;
    teacherId?: string;
    classId?: string;
    sectionId?: string;
  }): Promise<TeacherSubjectAssignment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('teacher_subject_assignments')
          .select(`
            *,
            teacher:staff(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*)
          `);

        if (filters?.academicYearId) {
          query = query.eq('academic_year_id', filters.academicYearId);
        }
        if (filters?.teacherId) {
          query = query.eq('teacher_id', filters.teacherId);
        }
        if (filters?.classId) {
          query = query.eq('class_id', filters.classId);
        }
        if (filters?.sectionId) {
          query = query.eq('section_id', filters.sectionId);
        }

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch teacher assignments failed, using local storage', e);
      }
    }

    // Local Storage Join
    let list = loadFromStorage<TeacherSubjectAssignment[]>(
      STORAGE_KEYS.TEACHER_ASSIGNMENTS,
      INITIAL_TEACHER_ASSIGNMENTS
    );

    if (filters?.academicYearId) {
      list = list.filter(a => a.academic_year_id === filters.academicYearId);
    }
    if (filters?.teacherId) {
      list = list.filter(a => a.teacher_id === filters.teacherId);
    }
    if (filters?.classId) {
      list = list.filter(a => a.class_id === filters.classId);
    }
    if (filters?.sectionId) {
      list = list.filter(a => a.section_id === filters.sectionId);
    }

    const allStaff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const allYears = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);
    const allClasses = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const allSections = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const allSubjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);

    return list.map(a => ({
      ...a,
      teacher: allStaff.find(s => s.id === a.teacher_id),
      academic_year: allYears.find(y => y.id === a.academic_year_id),
      class: allClasses.find(c => c.id === a.class_id),
      section: allSections.find(s => s.id === a.section_id),
      subject: allSubjects.find(sub => sub.id === a.subject_id),
    }));
  },

  async createTeacherAssignment(
    data: Omit<TeacherSubjectAssignment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TeacherSubjectAssignment> {
    const now = new Date().toISOString();
    const newAssignment: TeacherSubjectAssignment = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('teacher_subject_assignments')
          .insert({
            id: newAssignment.id,
            academic_year_id: newAssignment.academic_year_id,
            teacher_id: newAssignment.teacher_id,
            class_id: newAssignment.class_id,
            section_id: newAssignment.section_id,
            subject_id: newAssignment.subject_id,
            is_class_teacher: newAssignment.is_class_teacher,
            status: newAssignment.status,
          })
          .select(`
            *,
            teacher:staff(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*)
          `)
          .single();
        if (!error && inserted) return inserted;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase create teacher assignment failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TeacherSubjectAssignment[]>(
      STORAGE_KEYS.TEACHER_ASSIGNMENTS,
      INITIAL_TEACHER_ASSIGNMENTS
    );

    // Check duplicate assignment for same year + class + section + subject
    const duplicate = list.find(
      a =>
        a.academic_year_id === newAssignment.academic_year_id &&
        a.class_id === newAssignment.class_id &&
        a.section_id === newAssignment.section_id &&
        a.subject_id === newAssignment.subject_id
    );
    if (duplicate) {
      throw new Error('This subject is already assigned to a teacher for this class and section.');
    }

    list.push(newAssignment);
    saveToStorage(STORAGE_KEYS.TEACHER_ASSIGNMENTS, list);

    const allStaff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const allYears = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);
    const allClasses = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const allSections = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const allSubjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);

    return {
      ...newAssignment,
      teacher: allStaff.find(s => s.id === newAssignment.teacher_id),
      academic_year: allYears.find(y => y.id === newAssignment.academic_year_id),
      class: allClasses.find(c => c.id === newAssignment.class_id),
      section: allSections.find(s => s.id === newAssignment.section_id),
      subject: allSubjects.find(sub => sub.id === newAssignment.subject_id),
    };
  },

  async updateTeacherAssignment(
    id: string,
    updates: Partial<TeacherSubjectAssignment>
  ): Promise<TeacherSubjectAssignment> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('teacher_subject_assignments')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select(`
            *,
            teacher:staff(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*)
          `)
          .single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase update teacher assignment failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TeacherSubjectAssignment[]>(
      STORAGE_KEYS.TEACHER_ASSIGNMENTS,
      INITIAL_TEACHER_ASSIGNMENTS
    );
    const index = list.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Teacher assignment not found');

    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    saveToStorage(STORAGE_KEYS.TEACHER_ASSIGNMENTS, list);

    const allStaff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const allYears = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);
    const allClasses = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const allSections = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const allSubjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);

    return {
      ...updated,
      teacher: allStaff.find(s => s.id === updated.teacher_id),
      academic_year: allYears.find(y => y.id === updated.academic_year_id),
      class: allClasses.find(c => c.id === updated.class_id),
      section: allSections.find(s => s.id === updated.section_id),
      subject: allSubjects.find(sub => sub.id === updated.subject_id),
    };
  },

  async deleteTeacherAssignment(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('teacher_subject_assignments')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete teacher assignment failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TeacherSubjectAssignment[]>(
      STORAGE_KEYS.TEACHER_ASSIGNMENTS,
      INITIAL_TEACHER_ASSIGNMENTS
    );
    const filtered = list.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.TEACHER_ASSIGNMENTS, filtered);
  },

  async uploadStaffPhoto(file: File): Promise<string> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `staff-${Date.now()}.${fileExt}`;
        const filePath = `staff/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('academy-assets')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('academy-assets')
            .getPublicUrl(filePath);

          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (e) {
        console.warn('Supabase staff photo upload failed, using Data URL', e);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};

