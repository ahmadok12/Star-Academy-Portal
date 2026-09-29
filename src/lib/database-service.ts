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
  TeacherSubjectAssignment,
  TimetablePeriod,
  TimetableSlot,
  DayOfWeek,
  DailyAttendance,
  LectureAttendance,
  AttendanceStatus,
  AttendanceKPIStats,
  StudentAttendanceSummary,
  SchemeOfStudy,
  SubjectContent,
  Assessment,
  StudentMark,
  StudentMarksheetSubjectResult,
  StudentReportCard,
  Parent,
  ParentStudent,
  StudentPortalOverview,
  ParentPortalOverview,
  ParentPortalChildSummary,
  FeeStructure,
  FeeInvoice,
  FeePayment,
  FeeKPIStats
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
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Science', code: 'SEC-SC', display_order: 1, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Computer', code: 'SEC-CS', display_order: 2, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Pre - Medical', code: 'PMED', display_order: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Pre - Engineering', code: 'PENG', display_order: 5, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'ICS - Physics', code: 'ICSP', display_order: 6, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000007', name: 'ICS - Statistics', code: 'ICSS', display_order: 7, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e0000000-0000-0000-0000-000000000008', name: 'FA - IT', code: 'FAIT', display_order: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
  { id: 'b0000000-0000-0000-0000-000000000006', name: 'Islamiyat', code: 'ISL', short_name: 'Islamiyat', display_order: 6, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000007', name: 'Physics', code: 'PHY', short_name: 'Physics', display_order: 7, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000008', name: 'Chemistry', code: 'CHM', short_name: 'Chemistry', display_order: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000009', name: 'Biology', code: 'BIO', short_name: 'Biology', display_order: 9, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000010', name: 'Tarjama tul Quran', code: 'TTQ', short_name: 'Tarjama Quran', display_order: 10, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000011', name: 'Pak Studies', code: 'PKS', short_name: 'Pak Studies', display_order: 11, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000012', name: 'Statistics', code: 'STAT', short_name: 'Statistics', display_order: 12, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000013', name: 'Economics', code: 'ECO', short_name: 'Economics', display_order: 13, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000014', name: 'Physical Education', code: 'PED', short_name: 'Physical Edu', display_order: 14, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b0000000-0000-0000-0000-000000000015', name: 'Islamiyat Elective', code: 'ISL-E', short_name: 'Isl Elective', display_order: 15, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_CLASS_SECTIONS: ClassSection[] = [
  { id: '38f24892-56d6-4203-aa55-bc72e090344a', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000001', section_id: 'e0000000-0000-0000-0000-000000000001', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ccada1f5-24f1-4fdb-9b2e-c538ad83ebf8', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000001', section_id: 'e0000000-0000-0000-0000-000000000002', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '765e6ef2-c11b-45e5-b965-e5b47b9f1246', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5dc440d8-38d6-46fb-8332-ce58376dc781', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000002', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '0b26d2b8-6d87-4d0d-b05a-3c8b91180d04', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000003', section_id: 'e0000000-0000-0000-0000-000000000001', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b8031a8e-a0a5-4dfd-97d2-8c684d2dbd49', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000003', section_id: 'e0000000-0000-0000-0000-000000000002', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // FSc Part 1 Sections
  { id: 'cs000000-0000-0000-0000-000000000006', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000004', section_id: 'e0000000-0000-0000-0000-000000000004', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000007', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000004', section_id: 'e0000000-0000-0000-0000-000000000005', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000008', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000004', section_id: 'e0000000-0000-0000-0000-000000000006', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000009', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000004', section_id: 'e0000000-0000-0000-0000-000000000007', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000010', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000004', section_id: 'e0000000-0000-0000-0000-000000000008', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // FSc Part 2 Sections
  { id: 'cs000000-0000-0000-0000-000000000011', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000005', section_id: 'e0000000-0000-0000-0000-000000000004', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000012', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000005', section_id: 'e0000000-0000-0000-0000-000000000005', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000013', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000005', section_id: 'e0000000-0000-0000-0000-000000000006', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000014', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000005', section_id: 'e0000000-0000-0000-0000-000000000007', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cs000000-0000-0000-0000-000000000015', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000005', section_id: 'e0000000-0000-0000-0000-000000000008', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const INITIAL_CLASS_SUBJECTS: ClassSubject[] = [
  {
    "id": "f1726c06-75ce-468a-a921-257b5746c42f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "1ddd11cc-b7fc-4d3d-9aa7-f9de4cad932f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "3fc0d482-bae8-4744-8956-cd2bb53caf4c",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000009",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "6e82e901-58fe-425c-9aa1-d0ae0d19791f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "c4417bc4-0330-4396-99ae-e5030d34c6b1",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "7301083d-2dd8-492c-873e-782b281c6d2e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "6a7c6122-6592-4106-a79b-441529be3c9e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "9c2afbc4-36f4-47b1-92ec-44cfeebf62e8",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "bd240994-d3e8-4cf5-9a1f-43883d538394",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "4df46df2-2f88-41e2-a173-c7c269e25573",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "cc0d8ca1-f67c-4faf-a4b9-d403ed26e385",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "84e8aa08-32fd-448d-a1ae-59f366ba2190",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "028206a5-6571-4b13-be3e-1394e2dbc339",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "7a51fb38-65cb-4c95-9380-90436b05e883",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "327a7303-2ea7-46ba-8094-432e71442562",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "f504c65f-bc1f-4764-85fa-1e8dc180a408",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000001",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "b3c15bcd-23a8-494c-9cb6-a026cc6ff7b1",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "bb3c3cf6-f357-4c0b-8d5f-9bcfda7ad823",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "1ace65bf-4df6-47cb-9172-7930939537f6",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000009",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "65eab052-25f8-4b26-bdfc-0e6eddadcdad",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "fc36182d-3587-4991-8af7-2075a89bb885",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "0c2c189c-b925-4cb1-8bbd-c4d56fe8f931",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "0d357939-697b-4409-8e02-aba8a9006850",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "a2cdba0b-840c-4c16-823c-ee537b5f9084",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "d9cd9ee0-7f61-4af7-a525-372554a39943",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "067aca86-7078-41e0-8e1a-f934b337f22e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "bf806353-462d-4a7c-bac7-70f038f68c5c",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "f2ac40a2-0eb7-4e88-9ced-14a36efe870a",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "0b627be6-11eb-4402-8f67-590730a5f2fa",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "773e33c5-6e05-4e81-9a79-d69215888a68",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "f4ee24c7-ffd6-4cfb-b6d6-2476cd8d497a",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "70f1d213-e670-45f6-b973-a842864949e2",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000002",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "969fbb9f-0424-4ef3-ab2c-477a8b44cba2",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "28bae1e6-b48d-46c6-814d-769f10452045",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "f1718001-0751-4692-bfd5-5c7fa33581e4",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000009",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "a3ca9edc-3176-4888-acbd-38f6f9a662cd",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "cff5d9ed-fd50-4589-8d2a-0b506b0101ab",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "70c67b23-8034-43ac-ae28-828c94c26185",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "73d54690-75f1-40da-a43e-bc1a0fafaf74",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "d607bd87-3b87-414e-8177-98a4fdbdccd8",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000001",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "abf8d6c5-2c85-405c-95c3-816dc4af114b",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "660d23b8-1ce3-4bb4-9100-9c7e32e2663a",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "6d3f6102-17df-457c-8ce3-698a5a353ec7",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "a73fc907-b77e-4737-985f-e7bd363f6742",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "c581498d-a491-48c3-978c-f5121627ad66",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "f82b409f-c4e8-4664-9a49-9f1a7f567947",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "5f7cfe6d-e851-45de-baa0-87a585a7fef8",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "ef6aa161-bdba-492b-a844-83c522b70526",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000003",
    "section_id": "e0000000-0000-0000-0000-000000000002",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28 14:05:56.376508+00",
    "updated_at": "2026-09-28 14:05:56.376508+00"
  },
  {
    "id": "17e2021c-be5a-4828-985d-8d7f260a4e81",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "57b73cbd-c2ed-4a19-9692-dd8a54d4c01d",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "00deb93a-b278-4fcf-9811-c2e579d934d5",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000009",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "75f6d4e5-97d5-4ea6-acc8-e34c460239c5",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "d7870b50-0237-486b-bcd4-9101d3ef79eb",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "d56fb573-5fff-464d-9766-2c86e0c38c49",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "05258c3c-73bc-4908-b27b-415026262821",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "6ede43ea-6a82-4b6e-b542-85645cd3ff7f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "36fe8bc4-0670-4051-9f5b-0dfd4245e069",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "cd3dc198-7412-4d0b-8172-0e37e947f010",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "d2a7d459-3a32-4256-95d5-36f4b8ee50aa",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "ac0e427a-72d7-4150-9cd9-9463dfc6893d",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "73f431fc-daf2-43b5-8593-a9e517b26033",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "d863c9cb-32e3-47cc-839b-8ebbbd10ef47",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "a6718b49-7ded-4e84-928e-473e344e06d1",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "389cec55-bd23-47b7-a97f-a77ddd2f70c8",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "424e01d4-ae6d-47f1-9d3f-5d25fafae943",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "576e293a-baa8-427e-b1a0-d4168800484e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "07b0c551-5b94-407c-90cf-0896a547c2cf",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "9b3379e8-3811-45e1-9d6a-d86d4851074e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "80c1cef2-0e4b-410b-bb74-bfe26c0e0dcc",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "940c572d-3e75-4af6-a185-308f2b458b62",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000012",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "1e4031d9-12e9-4549-9b81-7775057dda7f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "5ccc5039-ee8b-4e0c-859a-506d4520cc6d",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "521cc509-5db3-4423-a799-db7aba8d6ca1",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "be90b81c-304e-40b5-9df3-b48edcf08052",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "9469d336-3ba8-408b-a009-c9a6c53a8103",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "0f4faf33-343e-40ea-8ed8-0f0c46196668",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "f4663da3-49e0-4ac1-ba36-839ce9f4a235",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000013",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "df7a08bd-cc80-4403-b562-6441a2c58824",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "91ab9739-f9e0-481d-ac37-79ad09725727",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000014",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "b3bdecf2-1043-43a3-90ee-03fb17880a1f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "a1904b09-d4ef-43c1-bb2d-dbb22bd7274e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "956683e9-cd42-4d78-93b0-98e7ba3c01da",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000006",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "b5a633fe-0d79-47f3-b197-87c71d461760",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000015",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "12611390-0114-49a5-8bab-1479d7268e70",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000004",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "94284980-a3f4-4eb4-ae6f-aa47abb52850",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "eb61ff00-a727-4b6a-abd8-306a9e0207a1",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "bc97ca99-28b9-41e1-a8bb-9a9e2d447f84",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000009",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "61d2993a-d923-49ce-abf5-25398c79ed36",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "73732889-e71e-4308-8dc3-6a71577d842e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "4c70424a-0daf-46c4-b882-9bd7fe657e39",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "0a5c1f2c-c18d-4c05-9acd-e99b58e4dc40",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000004",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "e138c5b2-413c-47bc-b898-d78f105734f7",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "a5e39d89-5b6d-4038-88a8-d26ec2c007a4",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000008",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "242d3baf-ea6a-45fc-83b3-b25ed8b85e59",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "99d4348c-8858-48d5-bc14-df5178a59695",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "772b30aa-b720-46a5-ba2b-9a9f50436cf6",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "5ee2c4e4-382b-4015-b2c5-4244c4031d69",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "ee1fcb4d-fd9f-49a9-9885-aeabaff235ed",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000005",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "6a3bf8ca-41af-4789-8411-2b1dabb390c0",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000007",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "c3e9e77a-65e4-4722-9b87-bee7373e0aeb",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "e54f6b61-cabc-4a6e-acf1-56a020ce3856",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "a2d64795-11f0-4b38-9fb5-6470cc01d731",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "766b77f8-43e7-491c-8d88-af4f93db5ab4",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "dab480b7-05c8-4d9f-9406-f30309888fe0",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "05c088f2-af8e-4fd6-b9c3-933104a01189",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000006",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "714ae16c-5407-4902-a8ad-71421dd2fbcd",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000012",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "202809d7-37d3-4caa-9864-64cbefcc7f66",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "ca5d263b-b9a8-4fd7-91ca-079ade6e5f0f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000003",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "44b10009-900f-45b0-b7bb-7bdc2bdd764e",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "9d00ccb7-7556-4e7e-86a6-dd2605ce5fe2",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "46d7c97a-8e4c-45e2-a2bd-0bc0bf18ff6b",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "2ea5036d-5984-415a-ad5d-cb04d756ab2f",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000007",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "cca28793-94b4-4c9a-8075-348893711e55",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000013",
    "display_order": 1,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "cd4fc56f-297d-4fc5-99ba-ca2bde805fe9",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000005",
    "display_order": 2,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "d6692e51-13ae-4dea-83e2-efc72da9ba96",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000014",
    "display_order": 3,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "21f9632b-aa5a-40ee-9143-fe3fada412af",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000001",
    "display_order": 4,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "1695dee1-3be1-4958-aa80-2e3c57129852",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000002",
    "display_order": 5,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "dc8c3b2a-c566-4883-8484-44c3e2e5b749",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000011",
    "display_order": 6,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "1614df69-323f-4932-b07b-fa886af5c463",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000015",
    "display_order": 7,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  },
  {
    "id": "a2490695-5cd6-497b-a228-e9ff378940d5",
    "academic_year_id": "a0000000-0000-0000-0000-000000000001",
    "class_id": "c0000000-0000-0000-0000-000000000005",
    "section_id": "e0000000-0000-0000-0000-000000000008",
    "subject_id": "b0000000-0000-0000-0000-000000000010",
    "display_order": 8,
    "status": "active",
    "created_at": "2026-09-28T12:53:45.314089+00:00",
    "updated_at": "2026-09-28T12:53:45.314089+00:00"
  }
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
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
    section_id: 'e0000000-0000-0000-0000-000000000002', // Section B
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
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
    section_id: 'e0000000-0000-0000-0000-000000000001', // Section A
    subject_id: 'sub00000-0000-0000-0000-000000000004', // English
    is_class_teacher: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Phase 5: Initial Timetable Periods
const INITIAL_TIMETABLE_PERIODS: TimetablePeriod[] = [
  { id: 'f0000000-0000-0000-0000-000000000001', period_number: 1, name: 'Period 1', start_time: '08:00', end_time: '08:45', is_break: false, display_order: 1, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000002', period_number: 2, name: 'Period 2', start_time: '08:45', end_time: '09:30', is_break: false, display_order: 2, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000003', period_number: 3, name: 'Period 3', start_time: '09:30', end_time: '10:15', is_break: false, display_order: 3, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000004', period_number: 0, name: 'Morning Recess / Break', start_time: '10:15', end_time: '10:45', is_break: true, display_order: 4, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000005', period_number: 4, name: 'Period 4', start_time: '10:45', end_time: '11:30', is_break: false, display_order: 5, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000006', period_number: 5, name: 'Period 5', start_time: '11:30', end_time: '12:15', is_break: false, display_order: 6, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000007', period_number: 6, name: 'Period 6', start_time: '12:15', end_time: '13:00', is_break: false, display_order: 7, status: 'active' },
  { id: 'f0000000-0000-0000-0000-000000000008', period_number: 7, name: 'Period 7', start_time: '13:00', end_time: '13:45', is_break: false, display_order: 8, status: 'active' }
];

// Phase 5: Initial Timetable Slots (Class 9 - Section A Sample)
const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  { id: 'fa000000-0000-0000-0000-000000000001', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000001', day_of_week: 'Monday', period_number: 1, start_time: '08:00', end_time: '08:45', subject_id: 'b0000000-0000-0000-0000-000000000003', teacher_id: '30000000-0000-0000-0000-000000000001', room: 'Room 101', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000002', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000002', day_of_week: 'Monday', period_number: 2, start_time: '08:45', end_time: '09:30', subject_id: 'b0000000-0000-0000-0000-000000000007', teacher_id: '30000000-0000-0000-0000-000000000002', room: 'Physics Lab', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000003', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000003', day_of_week: 'Monday', period_number: 3, start_time: '09:30', end_time: '10:15', subject_id: 'b0000000-0000-0000-0000-000000000008', teacher_id: '30000000-0000-0000-0000-000000000003', room: 'Chem Lab', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000004', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000005', day_of_week: 'Monday', period_number: 4, start_time: '10:45', end_time: '11:30', subject_id: 'b0000000-0000-0000-0000-000000000001', teacher_id: '30000000-0000-0000-0000-000000000004', room: 'Room 101', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000005', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000006', day_of_week: 'Monday', period_number: 5, start_time: '11:30', end_time: '12:15', subject_id: 'b0000000-0000-0000-0000-000000000005', teacher_id: '30000000-0000-0000-0000-000000000006', room: 'Computer Lab', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000006', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000001', day_of_week: 'Tuesday', period_number: 1, start_time: '08:00', end_time: '08:45', subject_id: 'b0000000-0000-0000-0000-000000000007', teacher_id: '30000000-0000-0000-0000-000000000002', room: 'Room 101', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000007', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000002', day_of_week: 'Tuesday', period_number: 2, start_time: '08:45', end_time: '09:30', subject_id: 'b0000000-0000-0000-0000-000000000003', teacher_id: '30000000-0000-0000-0000-000000000001', room: 'Room 101', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000008', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000003', day_of_week: 'Tuesday', period_number: 3, start_time: '09:30', end_time: '10:15', subject_id: 'b0000000-0000-0000-0000-000000000002', teacher_id: '30000000-0000-0000-0000-000000000005', room: 'Room 101', status: 'active' },
  { id: 'fa000000-0000-0000-0000-000000000009', academic_year_id: 'a0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000002', section_id: 'e0000000-0000-0000-0000-000000000001', period_id: 'f0000000-0000-0000-0000-000000000005', day_of_week: 'Tuesday', period_number: 4, start_time: '10:45', end_time: '11:30', subject_id: 'b0000000-0000-0000-0000-000000000009', teacher_id: '30000000-0000-0000-0000-000000000007', room: 'Bio Lab', status: 'active' }
];

// Phase 6: Initial Daily Attendance Seeds
const INITIAL_DAILY_ATTENDANCE: DailyAttendance[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: 'On time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000002',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: 'On time',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Phase 6: Initial Lecture Attendance Seeds
const INITIAL_LECTURE_ATTENDANCE: LectureAttendance[] = [
  {
    id: 'e2000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    timetable_slot_id: 'fa000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    teacher_id: '30000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: 'Active in class',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Phase 7 & 8: Initial Seeds
const INITIAL_SCHEME_OF_STUDIES: SchemeOfStudy[] = [
  {
    id: '90000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    month_name: 'April',
    order_index: 1,
    chapter_title: 'Matrices and Determinants',
    topics_covered: 'Types of Matrices, Addition, Multiplication, Inverses & Cramer Rule',
    learning_objectives: 'Understand linear equations solving using matrices',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    month_name: 'May',
    order_index: 2,
    chapter_title: 'Real and Complex Numbers',
    topics_covered: 'Radicals and Radicands, Laws of Exponents, Complex Numbers',
    learning_objectives: 'Master complex number operations and algebraic simplification',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    month_name: 'June',
    order_index: 3,
    chapter_title: 'Logarithms',
    topics_covered: 'Scientific Notation, Common Logarithm, Characteristic & Mantissa, Laws of Logarithms',
    learning_objectives: 'Perform multi-step calculations using log tables and laws',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000004',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    month_name: 'July',
    order_index: 4,
    chapter_title: 'Algebraic Expressions & Formulas',
    topics_covered: 'Algebraic Identities, Rational Expressions, Surds and their Conjugates',
    learning_objectives: 'Factorization and polynomial expansion mastery',
    status: 'planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000005',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    month_name: 'April',
    order_index: 1,
    chapter_title: 'Physical Quantities & Measurement',
    topics_covered: 'International System of Units, Vernier Callipers, Screw Gauge, Significant Figures',
    learning_objectives: 'Lab measurement instruments and uncertainty calculation',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000006',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    month_name: 'May',
    order_index: 2,
    chapter_title: 'Kinematics',
    topics_covered: 'Speed, Velocity, Acceleration, Equations of Motion, Motion under Gravity',
    learning_objectives: 'Derive and apply motion formulas for constant acceleration',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '90000000-0000-0000-0000-000000000007',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    month_name: 'June',
    order_index: 3,
    chapter_title: 'Dynamics',
    topics_covered: 'Newtons Laws of Motion, Momentum, Friction, Centripetal Force',
    learning_objectives: 'Analyze force diagrams and friction coefficient problems',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_SUBJECT_CONTENTS: SubjectContent[] = [
  {
    id: '91000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Complete Matric Math Course Syllabus 2026-27',
    content_type: 'syllabus',
    chapter_ref: 'General',
    description: 'Annual Board syllabus breakdown, chapter weightage, and paper pattern',
    is_published: true,
    created_by: '30000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '91000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Unit 1 Matrices & Determinants Handouts',
    content_type: 'notes',
    chapter_ref: 'Chapter 1',
    description: 'Comprehensive theoretical derivations, solved numericals and shortcuts for Cramer Rule',
    is_published: true,
    created_by: '30000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '91000000-0000-0000-0000-000000000003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    title: 'Kinematics 3 Equations of Motion Practice Worksheet',
    content_type: 'worksheet',
    chapter_ref: 'Chapter 2',
    description: '20 high-frequency board questions with step-by-step graphical proofs',
    is_published: true,
    created_by: '30000000-0000-0000-0000-000000000003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: '92000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Monthly Assessment 1 (Math)',
    assessment_type: 'monthly_test',
    total_marks: 50,
    passing_marks: 20,
    test_date: '2026-05-15',
    start_time: '09:00:00',
    end_time: '10:30:00',
    room_number: 'Hall A',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '92000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    title: 'Monthly Assessment 1 (Physics)',
    assessment_type: 'monthly_test',
    total_marks: 50,
    passing_marks: 20,
    test_date: '2026-05-18',
    start_time: '09:00:00',
    end_time: '10:30:00',
    room_number: 'Hall A',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '92000000-0000-0000-0000-000000000003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000008',
    title: 'Monthly Assessment 1 (Chemistry)',
    assessment_type: 'monthly_test',
    total_marks: 50,
    passing_marks: 20,
    test_date: '2026-05-20',
    start_time: '09:00:00',
    end_time: '10:30:00',
    room_number: 'Hall A',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '92000000-0000-0000-0000-000000000004',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Monthly Assessment 1 (English)',
    assessment_type: 'monthly_test',
    total_marks: 50,
    passing_marks: 20,
    test_date: '2026-05-22',
    start_time: '09:00:00',
    end_time: '10:30:00',
    room_number: 'Hall A',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '92000000-0000-0000-0000-000000000005',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Mid-Term Examination 2026 (Math)',
    assessment_type: 'midterm',
    total_marks: 75,
    passing_marks: 25,
    test_date: '2026-10-10',
    start_time: '08:30:00',
    end_time: '11:30:00',
    room_number: 'Exam Hall 1',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '92000000-0000-0000-0000-000000000006',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    subject_id: 'b0000000-0000-0000-0000-000000000007',
    title: 'Mid-Term Examination 2026 (Physics)',
    assessment_type: 'midterm',
    total_marks: 75,
    passing_marks: 25,
    test_date: '2026-10-12',
    start_time: '08:30:00',
    end_time: '11:30:00',
    room_number: 'Exam Hall 1',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_STUDENT_MARKS: StudentMark[] = [
  {
    id: '93000000-0000-0000-0000-000000000001',
    assessment_id: '92000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    obtained_marks: 46.5,
    is_absent: false,
    percentage: 93.0,
    grade: 'A+',
    remarks: 'Outstanding performance in Cramer rule & matrices',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '93000000-0000-0000-0000-000000000002',
    assessment_id: '92000000-0000-0000-0000-000000000002',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    obtained_marks: 42.0,
    is_absent: false,
    percentage: 84.0,
    grade: 'A+',
    remarks: 'Very good conceptual grasp of Kinematics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '93000000-0000-0000-0000-000000000003',
    assessment_id: '92000000-0000-0000-0000-000000000003',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    obtained_marks: 39.0,
    is_absent: false,
    percentage: 78.0,
    grade: 'A',
    remarks: 'Good attempt, review chemical bonding equations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '93000000-0000-0000-0000-000000000004',
    assessment_id: '92000000-0000-0000-0000-000000000004',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    obtained_marks: 44.0,
    is_absent: false,
    percentage: 88.0,
    grade: 'A+',
    remarks: 'Excellent grammar and comprehension writing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_PARENTS: Parent[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    user_id: null,
    full_name: 'Usman Ali',
    relationship: 'Father',
    phone: '+92 300 5550101',
    email: 'usman.ali@example.com',
    cnic: '35201-1234567-1',
    occupation: 'Senior Electrical Engineer',
    address: 'House 42, Street 8, Sector G-9/1, Islamabad',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    user_id: null,
    full_name: 'Noor Ahmad',
    relationship: 'Father',
    phone: '+92 321 5550202',
    email: 'noor.ahmad@example.com',
    cnic: '35201-2345678-3',
    occupation: 'Business Consultant & Entrepreneur',
    address: 'Plot 15-B, Commercial Area, F-10, Islamabad',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    user_id: null,
    full_name: 'Hassan Raza',
    relationship: 'Father',
    phone: '+92 333 5550303',
    email: 'hassan.raza@example.com',
    cnic: '35201-3456789-5',
    occupation: 'Chartered Accountant',
    address: 'House 12, Lane 3, Askari 14, Rawalpindi',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_PARENT_STUDENTS: ParentStudent[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    parent_id: 'e0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    relationship_type: 'Father',
    is_primary_contact: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    parent_id: 'e0000000-0000-0000-0000-000000000002',
    student_id: 'd0000000-0000-0000-0000-000000000002',
    relationship_type: 'Father',
    is_primary_contact: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    parent_id: 'e0000000-0000-0000-0000-000000000003',
    student_id: 'd0000000-0000-0000-0000-000000000003',
    relationship_type: 'Father',
    is_primary_contact: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    parent_id: 'e0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000003',
    relationship_type: 'Guardian',
    is_primary_contact: false,
    created_at: new Date().toISOString()
  }
];

const INITIAL_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Matric Science Standard Fee',
    tuition_fee: 5000.0,
    admission_fee: 0.0,
    exam_fee: 500.0,
    lab_fee: 500.0,
    other_fee: 0.0,
    total_amount: 6000.0,
    billing_frequency: 'monthly',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Matric Science 10th Fee',
    tuition_fee: 5500.0,
    admission_fee: 0.0,
    exam_fee: 500.0,
    lab_fee: 500.0,
    other_fee: 0.0,
    total_amount: 6500.0,
    billing_frequency: 'monthly',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_FEE_INVOICES: FeeInvoice[] = [
  {
    id: 'e2000000-0000-0000-0000-000000000001',
    invoice_no: 'INV-2026-0001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000001',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    fee_structure_id: 'e1000000-0000-0000-0000-000000000001',
    month: 'May 2026',
    issue_date: '2026-05-01',
    due_date: '2026-05-15',
    subtotal: 6000.0,
    discount: 0.0,
    discount_reason: null,
    fine: 0.0,
    total_amount: 6000.0,
    paid_amount: 3500.0,
    balance_amount: 2500.0,
    status: 'partial',
    notes: 'Partial installment paid on 5th May; remaining 2,500 due.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e2000000-0000-0000-0000-000000000002',
    invoice_no: 'INV-2026-0002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000001',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    fee_structure_id: 'e1000000-0000-0000-0000-000000000001',
    month: 'May 2026',
    issue_date: '2026-05-01',
    due_date: '2026-05-15',
    subtotal: 6000.0,
    discount: 1000.0,
    discount_reason: 'Merit Scholarship 15% Waiver',
    fine: 0.0,
    total_amount: 5000.0,
    paid_amount: 5000.0,
    balance_amount: 0.0,
    status: 'paid',
    notes: 'Full tuition and lab fee cleared via Bank Alfalah.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e2000000-0000-0000-0000-000000000003',
    invoice_no: 'INV-2026-0003',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000003',
    class_id: 'c0000000-0000-0000-0000-000000000001',
    section_id: 'e0000000-0000-0000-0000-000000000001',
    fee_structure_id: 'e1000000-0000-0000-0000-000000000001',
    month: 'May 2026',
    issue_date: '2026-05-01',
    due_date: '2026-05-15',
    subtotal: 6000.0,
    discount: 0.0,
    discount_reason: null,
    fine: 0.0,
    total_amount: 6000.0,
    paid_amount: 0.0,
    balance_amount: 6000.0,
    status: 'unpaid',
    notes: 'First monthly fee voucher issued.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_FEE_PAYMENTS: FeePayment[] = [
  {
    id: 'e3000000-0000-0000-0000-000000000001',
    receipt_no: 'REC-2026-0001',
    invoice_id: 'e2000000-0000-0000-0000-000000000001',
    student_id: 'd0000000-0000-0000-0000-000000000001',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    amount: 3500.0,
    payment_date: '2026-05-05',
    payment_method: 'Cash',
    transaction_reference: 'CSH-8821',
    collected_by: 'Sheikh Zeeshan (Accounts)',
    remarks: 'Part payment of Rs 3,500 received at front desk.',
    created_at: new Date().toISOString()
  },
  {
    id: 'e3000000-0000-0000-0000-000000000002',
    receipt_no: 'REC-2026-0002',
    invoice_id: 'e2000000-0000-0000-0000-000000000002',
    student_id: 'd0000000-0000-0000-0000-000000000002',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    amount: 5000.0,
    payment_date: '2026-05-08',
    payment_method: 'Bank Transfer',
    transaction_reference: 'BAFL-TRX-99412',
    collected_by: 'Sheikh Zeeshan (Accounts)',
    remarks: 'Direct transfer to Star Academy Meezan Bank Account.',
    created_at: new Date().toISOString()
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
  TIMETABLE_PERIODS: 'star_academy_timetable_periods',
  TIMETABLE_SLOTS: 'star_academy_timetable_slots',
  DAILY_ATTENDANCE: 'star_academy_daily_attendance',
  LECTURE_ATTENDANCE: 'star_academy_lecture_attendance',
  SCHEME_OF_STUDIES: 'star_academy_scheme_of_studies',
  SUBJECT_CONTENTS: 'star_academy_subject_contents',
  ASSESSMENTS: 'star_academy_assessments',
  STUDENT_MARKS: 'star_academy_student_marks',
  PARENTS: 'star_academy_parents',
  PARENT_STUDENTS: 'star_academy_parent_students',
  FEE_STRUCTURES: 'star_academy_fee_structures',
  FEE_INVOICES: 'star_academy_fee_invoices',
  FEE_PAYMENTS: 'star_academy_fee_payments',
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
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) && Array.isArray(parsed) && parsed.length < defaultValue.length) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return parsed;
    } else {
      const raw = memoryStorage.get(key);
      if (!raw) {
        memoryStorage.set(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) && Array.isArray(parsed) && parsed.length < defaultValue.length) {
        memoryStorage.set(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return parsed;
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
            .map((rec: any) => {
              const enrollment = {
                ...rec,
                supplementary_subjects: subjects.filter(s => rec.supplementary_subject_ids?.includes(s.id))
              };
              return {
                ...rec.student,
                currentEnrollment: enrollment,
                academic_record: enrollment
              };
            });

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
          academic_record: hydratedRec,
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
          academic_record: studentRecs[0],
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
  },

  // --------------------------------------------------------------------------
  // Phase 5: Timetable Periods Master
  // --------------------------------------------------------------------------
  async getTimetablePeriods(): Promise<TimetablePeriod[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable_periods')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) return data as TimetablePeriod[];
      } catch (e) {
        console.warn('Supabase timetable_periods query failed, falling back locally', e);
      }
    }
    const list = loadFromStorage<TimetablePeriod[]>(STORAGE_KEYS.TIMETABLE_PERIODS, INITIAL_TIMETABLE_PERIODS);
    return list.sort((a, b) => a.display_order - b.display_order);
  },

  async createTimetablePeriod(payload: Omit<TimetablePeriod, 'id' | 'created_at' | 'updated_at'>): Promise<TimetablePeriod> {
    const now = new Date().toISOString();
    const newPeriod: TimetablePeriod = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable_periods')
          .insert(newPeriod)
          .select()
          .single();
        if (!error && data) return data as TimetablePeriod;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase create timetable_period failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetablePeriod[]>(STORAGE_KEYS.TIMETABLE_PERIODS, INITIAL_TIMETABLE_PERIODS);
    list.push(newPeriod);
    saveToStorage(STORAGE_KEYS.TIMETABLE_PERIODS, list);
    return newPeriod;
  },

  async updateTimetablePeriod(id: string, updates: Partial<TimetablePeriod>): Promise<TimetablePeriod> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable_periods')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as TimetablePeriod;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase update timetable_period failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetablePeriod[]>(STORAGE_KEYS.TIMETABLE_PERIODS, INITIAL_TIMETABLE_PERIODS);
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Timetable period not found');
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.TIMETABLE_PERIODS, list);
    return list[idx];
  },

  async deleteTimetablePeriod(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('timetable_periods')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete timetable_period failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetablePeriod[]>(STORAGE_KEYS.TIMETABLE_PERIODS, INITIAL_TIMETABLE_PERIODS);
    const filtered = list.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.TIMETABLE_PERIODS, filtered);
  },

  // --------------------------------------------------------------------------
  // Phase 5: Timetable Slots (Class & Section Schedules)
  // --------------------------------------------------------------------------
  async getTimetableSlots(filters?: {
    academicYearId?: string;
    classId?: string;
    sectionId?: string;
    teacherId?: string;
    dayOfWeek?: DayOfWeek;
  }): Promise<TimetableSlot[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('timetable_slots')
          .select(`
            *,
            period:timetable_periods(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*),
            teacher:staff(*)
          `)
          .order('period_number', { ascending: true });

        if (filters?.academicYearId) query = query.eq('academic_year_id', filters.academicYearId);
        if (filters?.classId) query = query.eq('class_id', filters.classId);
        if (filters?.sectionId) query = query.eq('section_id', filters.sectionId);
        if (filters?.teacherId) query = query.eq('teacher_id', filters.teacherId);
        if (filters?.dayOfWeek) query = query.eq('day_of_week', filters.dayOfWeek);

        const { data, error } = await query;
        if (!error && data) return data as TimetableSlot[];
      } catch (e) {
        console.warn('Supabase timetable_slots query failed, falling back locally', e);
      }
    }

    let list = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE_SLOTS, INITIAL_TIMETABLE_SLOTS);
    const periods = await this.getTimetablePeriods();
    const years = await this.getAcademicYears();
    const classes = await this.getClasses();
    const sections = await this.getSections();
    const subjects = await this.getSubjects();
    const staffList = await this.getStaff();

    if (filters?.academicYearId) list = list.filter(s => s.academic_year_id === filters.academicYearId);
    if (filters?.classId) list = list.filter(s => s.class_id === filters.classId);
    if (filters?.sectionId) list = list.filter(s => s.section_id === filters.sectionId);
    if (filters?.teacherId) list = list.filter(s => s.teacher_id === filters.teacherId);
    if (filters?.dayOfWeek) list = list.filter(s => s.day_of_week === filters.dayOfWeek);

    return list.map(slot => ({
      ...slot,
      period: periods.find(p => p.id === slot.period_id || p.period_number === slot.period_number),
      academic_year: years.find(y => y.id === slot.academic_year_id),
      class: classes.find(c => c.id === slot.class_id),
      section: sections.find(sec => sec.id === slot.section_id),
      subject: subjects.find(sub => sub.id === slot.subject_id),
      teacher: staffList.find(st => st.id === slot.teacher_id)
    })).sort((a, b) => a.period_number - b.period_number);
  },

  async createTimetableSlot(payload: Omit<TimetableSlot, 'id' | 'created_at' | 'updated_at'>): Promise<TimetableSlot> {
    // 1. Conflict Check: Teacher Double-booking
    const allSlots = await this.getTimetableSlots({
      academicYearId: payload.academic_year_id,
      dayOfWeek: payload.day_of_week
    });
    
    const teacherConflict = allSlots.find(
      s => s.status === 'active' && s.teacher_id === payload.teacher_id && s.period_number === payload.period_number
    );
    if (teacherConflict) {
      const teacherName = teacherConflict.teacher?.name || 'Teacher';
      const className = teacherConflict.class?.name || 'another class';
      const sectionName = teacherConflict.section?.name ? `(${teacherConflict.section.name})` : '';
      throw new Error(`Scheduling Conflict: ${teacherName} is already assigned to ${className} ${sectionName} during Period ${payload.period_number} on ${payload.day_of_week}.`);
    }

    // 2. Conflict Check: Class & Section Double-booking
    const classConflict = allSlots.find(
      s => s.status === 'active' &&
        s.class_id === payload.class_id &&
        (s.section_id === payload.section_id || !s.section_id || !payload.section_id) &&
        s.period_number === payload.period_number
    );
    if (classConflict) {
      const className = classConflict.class?.name || 'Class';
      const subjectName = classConflict.subject?.name || 'another subject';
      throw new Error(`Scheduling Conflict: ${className} already has ${subjectName} scheduled during Period ${payload.period_number} on ${payload.day_of_week}.`);
    }

    // 3. Conflict Check: Room Double-booking
    if (payload.room && payload.room.trim()) {
      const roomConflict = allSlots.find(
        s => s.status === 'active' &&
          s.period_number === payload.period_number &&
          s.room?.trim().toLowerCase() === payload.room?.trim().toLowerCase()
      );
      if (roomConflict) {
        throw new Error(`Scheduling Conflict: Room "${payload.room}" is already booked for ${roomConflict.class?.name} during Period ${payload.period_number} on ${payload.day_of_week}.`);
      }
    }

    const now = new Date().toISOString();
    const newSlot: TimetableSlot = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable_slots')
          .insert({
            id: newSlot.id,
            academic_year_id: newSlot.academic_year_id,
            class_id: newSlot.class_id,
            section_id: newSlot.section_id || null,
            period_id: newSlot.period_id || null,
            day_of_week: newSlot.day_of_week,
            period_number: newSlot.period_number,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            subject_id: newSlot.subject_id,
            teacher_id: newSlot.teacher_id,
            room: newSlot.room || null,
            status: newSlot.status
          })
          .select(`
            *,
            period:timetable_periods(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*),
            teacher:staff(*)
          `)
          .single();

        if (!error && data) return data as TimetableSlot;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase create timetable_slot failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE_SLOTS, INITIAL_TIMETABLE_SLOTS);
    list.push(newSlot);
    saveToStorage(STORAGE_KEYS.TIMETABLE_SLOTS, list);
    return newSlot;
  },

  async updateTimetableSlot(id: string, updates: Partial<TimetableSlot>): Promise<TimetableSlot> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable_slots')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select(`
            *,
            period:timetable_periods(*),
            academic_year:academic_years(*),
            class:classes(*),
            section:sections(*),
            subject:subjects(*),
            teacher:staff(*)
          `)
          .single();
        if (!error && data) return data as TimetableSlot;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase update timetable_slot failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE_SLOTS, INITIAL_TIMETABLE_SLOTS);
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Timetable slot not found');
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.TIMETABLE_SLOTS, list);
    return list[idx];
  },

  async deleteTimetableSlot(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('timetable_slots')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase delete timetable_slot failed', e);
        throw e;
      }
    }

    const list = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE_SLOTS, INITIAL_TIMETABLE_SLOTS);
    const filtered = list.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.TIMETABLE_SLOTS, filtered);
  },

  // ============================================================================
  // PHASE 6: ATTENDANCE MODULE METHODS
  // ============================================================================

  async getDailyAttendance(params: {
    academic_year_id: string;
    date?: string;
    class_id?: string;
    section_id?: string;
    batch_id?: string;
    student_id?: string;
  }): Promise<DailyAttendance[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('daily_attendance')
          .select(`
            *,
            student:students(*),
            class:classes(*),
            section:sections(*),
            batch:batches(*),
            recorded_by_staff:staff(*)
          `)
          .eq('academic_year_id', params.academic_year_id);

        if (params.date) query = query.eq('date', params.date);
        if (params.class_id) query = query.eq('class_id', params.class_id);
        if (params.section_id) query = query.eq('section_id', params.section_id);
        if (params.batch_id) query = query.eq('batch_id', params.batch_id);
        if (params.student_id) query = query.eq('student_id', params.student_id);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as DailyAttendance[];
        if (error) console.warn('Supabase getDailyAttendance query error:', error);
      } catch (e) {
        console.warn('Supabase getDailyAttendance failed, falling back to local storage', e);
      }
    }

    // Local Storage Fallback
    const list = loadFromStorage<DailyAttendance[]>(STORAGE_KEYS.DAILY_ATTENDANCE, INITIAL_DAILY_ATTENDANCE);
    const students = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const classes = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const sections = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const batches = loadFromStorage<BatchItem[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);

    return list
      .filter(item => {
        if (item.academic_year_id !== params.academic_year_id) return false;
        if (params.date && item.date !== params.date) return false;
        if (params.class_id && item.class_id !== params.class_id) return false;
        if (params.section_id && item.section_id !== params.section_id) return false;
        if (params.batch_id && item.batch_id !== params.batch_id) return false;
        if (params.student_id && item.student_id !== params.student_id) return false;
        return true;
      })
      .map(item => ({
        ...item,
        student: students.find(s => s.id === item.student_id),
        class: classes.find(c => c.id === item.class_id),
        section: sections.find(s => s.id === item.section_id),
        batch: batches.find(b => b.id === item.batch_id)
      }));
  },

  async recordDailyAttendanceBatch(
    records: Array<Omit<DailyAttendance, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<DailyAttendance[]> {
    if (records.length === 0) return [];
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const payload = records.map(r => ({
          academic_year_id: r.academic_year_id,
          student_id: r.student_id,
          class_id: r.class_id,
          section_id: r.section_id || null,
          batch_id: r.batch_id || null,
          date: r.date,
          status: r.status,
          remarks: r.remarks || null,
          recorded_by: r.recorded_by || null,
          updated_at: now
        }));

        const { data, error } = await supabase
          .from('daily_attendance')
          .upsert(payload, { onConflict: 'academic_year_id,student_id,date' })
          .select(`
            *,
            student:students(*),
            class:classes(*),
            section:sections(*),
            batch:batches(*)
          `);

        if (!error && data) return data as DailyAttendance[];
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase recordDailyAttendanceBatch failed, updating local fallback', e);
        throw e;
      }
    }

    // Local Storage Fallback
    const list = loadFromStorage<DailyAttendance[]>(STORAGE_KEYS.DAILY_ATTENDANCE, INITIAL_DAILY_ATTENDANCE);
    const updatedResults: DailyAttendance[] = [];

    for (const r of records) {
      const existingIdx = list.findIndex(
        item => item.academic_year_id === r.academic_year_id &&
                item.student_id === r.student_id &&
                item.date === r.date
      );

      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...r,
          updated_at: now
        };
        updatedResults.push(list[existingIdx]);
      } else {
        const newItem: DailyAttendance = {
          ...r,
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          created_at: now,
          updated_at: now
        };
        list.push(newItem);
        updatedResults.push(newItem);
      }
    }

    saveToStorage(STORAGE_KEYS.DAILY_ATTENDANCE, list);
    return updatedResults;
  },

  async getLectureAttendance(params: {
    academic_year_id: string;
    date?: string;
    timetable_slot_id?: string;
    teacher_id?: string;
    student_id?: string;
    subject_id?: string;
    class_id?: string;
    section_id?: string;
  }): Promise<LectureAttendance[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('lecture_attendance')
          .select(`
            *,
            student:students(*),
            subject:subjects(*),
            teacher:staff!lecture_attendance_teacher_id_fkey(*),
            timetable_slot:timetable_slots(*),
            class:classes(*),
            section:sections(*)
          `)
          .eq('academic_year_id', params.academic_year_id);

        if (params.date) query = query.eq('date', params.date);
        if (params.timetable_slot_id) query = query.eq('timetable_slot_id', params.timetable_slot_id);
        if (params.teacher_id) query = query.eq('teacher_id', params.teacher_id);
        if (params.student_id) query = query.eq('student_id', params.student_id);
        if (params.subject_id) query = query.eq('subject_id', params.subject_id);
        if (params.class_id) query = query.eq('class_id', params.class_id);
        if (params.section_id) query = query.eq('section_id', params.section_id);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as LectureAttendance[];
        if (error) console.warn('Supabase getLectureAttendance query error:', error);
      } catch (e) {
        console.warn('Supabase getLectureAttendance failed, falling back to local storage', e);
      }
    }

    // Local Storage Fallback
    const list = loadFromStorage<LectureAttendance[]>(STORAGE_KEYS.LECTURE_ATTENDANCE, INITIAL_LECTURE_ATTENDANCE);
    const students = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const subjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const staff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const slots = loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE_SLOTS, INITIAL_TIMETABLE_SLOTS);

    return list
      .filter(item => {
        if (item.academic_year_id !== params.academic_year_id) return false;
        if (params.date && item.date !== params.date) return false;
        if (params.timetable_slot_id && item.timetable_slot_id !== params.timetable_slot_id) return false;
        if (params.teacher_id && item.teacher_id !== params.teacher_id) return false;
        if (params.student_id && item.student_id !== params.student_id) return false;
        if (params.subject_id && item.subject_id !== params.subject_id) return false;
        if (params.class_id && item.class_id !== params.class_id) return false;
        if (params.section_id && item.section_id !== params.section_id) return false;
        return true;
      })
      .map(item => ({
        ...item,
        student: students.find(s => s.id === item.student_id),
        subject: subjects.find(sub => sub.id === item.subject_id),
        teacher: staff.find(t => t.id === item.teacher_id),
        timetable_slot: slots.find(sl => sl.id === item.timetable_slot_id)
      }));
  },

  async recordLectureAttendanceBatch(
    records: Array<Omit<LectureAttendance, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<LectureAttendance[]> {
    if (records.length === 0) return [];
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const payload = records.map(r => ({
          academic_year_id: r.academic_year_id,
          timetable_slot_id: r.timetable_slot_id || null,
          student_id: r.student_id,
          subject_id: r.subject_id,
          teacher_id: r.teacher_id,
          class_id: r.class_id,
          section_id: r.section_id || null,
          date: r.date,
          status: r.status,
          remarks: r.remarks || null,
          recorded_by: r.recorded_by || null,
          updated_at: now
        }));

        const { data, error } = await supabase
          .from('lecture_attendance')
          .upsert(payload, { onConflict: 'timetable_slot_id,student_id,date' })
          .select(`
            *,
            student:students(*),
            subject:subjects(*),
            teacher:staff!lecture_attendance_teacher_id_fkey(*),
            timetable_slot:timetable_slots(*)
          `);

        if (!error && data) return data as LectureAttendance[];
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase recordLectureAttendanceBatch failed', e);
        throw e;
      }
    }

    // Local Storage Fallback
    const list = loadFromStorage<LectureAttendance[]>(STORAGE_KEYS.LECTURE_ATTENDANCE, INITIAL_LECTURE_ATTENDANCE);
    const updatedResults: LectureAttendance[] = [];

    for (const r of records) {
      const existingIdx = list.findIndex(
        item => item.timetable_slot_id === r.timetable_slot_id &&
                item.student_id === r.student_id &&
                item.date === r.date
      );

      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...r,
          updated_at: now
        };
        updatedResults.push(list[existingIdx]);
      } else {
        const newItem: LectureAttendance = {
          ...r,
          id: `lec-att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          created_at: now,
          updated_at: now
        };
        list.push(newItem);
        updatedResults.push(newItem);
      }
    }

    saveToStorage(STORAGE_KEYS.LECTURE_ATTENDANCE, list);
    return updatedResults;
  },

  async getAttendanceKPIs(
    academic_year_id: string,
    date: string,
    class_id?: string,
    section_id?: string
  ): Promise<AttendanceKPIStats> {
    const attendanceRecords = await this.getDailyAttendance({
      academic_year_id,
      date,
      class_id,
      section_id
    });

    const enrolledStudents = await this.getStudents(academic_year_id);
    const filteredStudents = enrolledStudents.filter(s => {
      if (class_id && s.academic_record?.class_id !== class_id) return false;
      if (section_id && s.academic_record?.section_id !== section_id) return false;
      return true;
    });

    const totalStudents = filteredStudents.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    attendanceRecords.forEach(r => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Late') late++;
      else if (r.status === 'Leave') leave++;
    });

    // If records were taken, calculate percentage
    const recordedTotal = present + absent + late + leave;
    const denominator = recordedTotal > 0 ? recordedTotal : (totalStudents || 1);
    const percentage = denominator > 0 ? Math.round(((present + late) / denominator) * 100) : 0;

    return {
      total: totalStudents,
      present,
      absent,
      late,
      leave,
      percentage
    };
  },

  async getStudentMonthlyRegister(params: {
    academic_year_id: string;
    class_id: string;
    section_id?: string;
    month: number; // 1-12
    year: number;  // e.g. 2026
  }): Promise<StudentAttendanceSummary[]> {
    // 1. Get enrolled students
    const studentsWithEnrollment = await this.getStudents(params.academic_year_id);
    const classStudents = studentsWithEnrollment.filter(s => {
      if (s.academic_record?.class_id !== params.class_id) return false;
      if (params.section_id && s.academic_record?.section_id !== params.section_id) return false;
      return true;
    });

    // 2. Format month start and end dates
    const paddedMonth = String(params.month).padStart(2, '0');
    const startDate = `${params.year}-${paddedMonth}-01`;
    const lastDay = new Date(params.year, params.month, 0).getDate();
    const endDate = `${params.year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`;

    // 3. Fetch all daily attendance in that month range
    let allRecords: DailyAttendance[] = [];
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('daily_attendance')
          .select('*')
          .eq('academic_year_id', params.academic_year_id)
          .eq('class_id', params.class_id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (params.section_id) {
          query = query.eq('section_id', params.section_id);
        }

        const { data, error } = await query;
        if (!error && data) allRecords = data as DailyAttendance[];
      } catch (e) {
        console.warn('Supabase monthly register fetch error, using local', e);
      }
    }

    if (allRecords.length === 0) {
      const local = loadFromStorage<DailyAttendance[]>(STORAGE_KEYS.DAILY_ATTENDANCE, INITIAL_DAILY_ATTENDANCE);
      allRecords = local.filter(r => 
        r.academic_year_id === params.academic_year_id &&
        r.class_id === params.class_id &&
        (!params.section_id || r.section_id === params.section_id) &&
        r.date >= startDate &&
        r.date <= endDate
      );
    }

    // 4. Map for each student
    return classStudents.map(st => {
      const studentRecords = allRecords.filter(r => r.student_id === st.id);
      const recordMap: Record<string, AttendanceStatus> = {};
      let present = 0;
      let absent = 0;
      let late = 0;
      let leave = 0;

      studentRecords.forEach(r => {
        recordMap[r.date] = r.status;
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Late') late++;
        else if (r.status === 'Leave') leave++;
      });

      const totalRecorded = studentRecords.length;
      const attendancePercentage = totalRecorded > 0 ? Math.round(((present + late) / totalRecorded) * 100) : 100;

      return {
        student_id: st.id,
        admission_no: st.admission_no,
        student_name: st.student_name,
        father_name: st.father_name,
        class_name: st.academic_record?.class?.name || '',
        section_name: st.academic_record?.section?.name,
        batch_name: st.academic_record?.batch?.name,
        phone: st.phone,
        total_days: totalRecorded,
        present_days: present,
        absent_days: absent,
        late_days: late,
        leave_days: leave,
        attendance_percentage: attendancePercentage,
        records: recordMap
      };
    });
  },

  async getAttendanceDefaulters(
    academic_year_id: string,
    minPercentage = 75,
    class_id?: string
  ): Promise<StudentAttendanceSummary[]> {
    const studentsWithEnrollment = await this.getStudents(academic_year_id);
    const filteredStudents = studentsWithEnrollment.filter(s => {
      if (class_id && s.academic_record?.class_id !== class_id) return false;
      return true;
    });

    let allRecords: DailyAttendance[] = [];
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('daily_attendance')
          .select('*')
          .eq('academic_year_id', academic_year_id);

        if (class_id) query = query.eq('class_id', class_id);
        const { data, error } = await query;
        if (!error && data) allRecords = data as DailyAttendance[];
      } catch (e) {
        console.warn('Supabase fetch attendance records failed', e);
      }
    }

    if (allRecords.length === 0) {
      const local = loadFromStorage<DailyAttendance[]>(STORAGE_KEYS.DAILY_ATTENDANCE, INITIAL_DAILY_ATTENDANCE);
      allRecords = local.filter(r => r.academic_year_id === academic_year_id);
    }

    const summaries: StudentAttendanceSummary[] = [];

    for (const st of filteredStudents) {
      const studentRecords = allRecords.filter(r => r.student_id === st.id);
      if (studentRecords.length === 0) continue; // Skip students with 0 recorded days yet

      const recordMap: Record<string, AttendanceStatus> = {};
      let present = 0;
      let absent = 0;
      let late = 0;
      let leave = 0;

      studentRecords.forEach(r => {
        recordMap[r.date] = r.status;
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Late') late++;
        else if (r.status === 'Leave') leave++;
      });

      const totalRecorded = studentRecords.length;
      const rate = Math.round(((present + late) / totalRecorded) * 100);

      if (rate < minPercentage) {
        summaries.push({
          student_id: st.id,
          admission_no: st.admission_no,
          student_name: st.student_name,
          father_name: st.father_name,
          class_name: st.academic_record?.class?.name || '',
          section_name: st.academic_record?.section?.name,
          batch_name: st.academic_record?.batch?.name,
          phone: st.phone,
          total_days: totalRecorded,
          present_days: present,
          absent_days: absent,
          late_days: late,
          leave_days: leave,
          attendance_percentage: rate,
          records: recordMap
        });
      }
    }

    return summaries.sort((a, b) => a.attendance_percentage - b.attendance_percentage);
  },

  // ============================================================================
  // PHASE 7 & 8: SCHEME OF STUDY (SOS)
  // ============================================================================
  async getSchemeOfStudies(
    academic_year_id: string,
    class_id?: string,
    subject_id?: string
  ): Promise<SchemeOfStudy[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('scheme_of_studies')
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*)')
          .eq('academic_year_id', academic_year_id)
          .order('order_index', { ascending: true });

        if (class_id) query = query.eq('class_id', class_id);
        if (subject_id) query = query.eq('subject_id', subject_id);

        const { data, error } = await query;
        if (!error && data) return data as SchemeOfStudy[];
      } catch (e) {
        console.warn('Supabase fetch scheme_of_studies failed, using local cache', e);
      }
    }

    const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
    const classes = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const subjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const years = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);

    return list
      .filter(item => {
        if (item.academic_year_id !== academic_year_id) return false;
        if (class_id && item.class_id !== class_id) return false;
        if (subject_id && item.subject_id !== subject_id) return false;
        return true;
      })
      .sort((a, b) => a.order_index - b.order_index)
      .map(item => ({
        ...item,
        class: classes.find(c => c.id === item.class_id),
        subject: subjects.find(s => s.id === item.subject_id),
        academic_year: years.find(y => y.id === item.academic_year_id)
      }));
  },

  async createSchemeOfStudy(
    data: Omit<SchemeOfStudy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SchemeOfStudy> {
    const now = new Date().toISOString();
    const id = `90000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const newRecord: SchemeOfStudy = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('scheme_of_studies')
          .insert({
            academic_year_id: data.academic_year_id,
            class_id: data.class_id,
            subject_id: data.subject_id,
            month_name: data.month_name,
            order_index: data.order_index,
            chapter_title: data.chapter_title,
            topics_covered: data.topics_covered,
            learning_objectives: data.learning_objectives,
            status: data.status
          })
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*)')
          .single();

        if (!error && inserted) {
          const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
          saveToStorage(STORAGE_KEYS.SCHEME_OF_STUDIES, [...list, inserted]);
          return inserted as SchemeOfStudy;
        }
      } catch (e) {
        console.warn('Supabase create scheme_of_studies failed, saving to local cache', e);
      }
    }

    const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
    saveToStorage(STORAGE_KEYS.SCHEME_OF_STUDIES, [...list, newRecord]);
    return newRecord;
  },

  async updateSchemeOfStudy(id: string, updates: Partial<SchemeOfStudy>): Promise<SchemeOfStudy> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('scheme_of_studies')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*)')
          .single();

        if (!error && data) {
          const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
          const idx = list.findIndex(i => i.id === id);
          if (idx >= 0) list[idx] = data as SchemeOfStudy;
          saveToStorage(STORAGE_KEYS.SCHEME_OF_STUDIES, list);
          return data as SchemeOfStudy;
        }
      } catch (e) {
        console.warn('Supabase update scheme_of_studies failed', e);
      }
    }

    const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Scheme of study record not found');
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.SCHEME_OF_STUDIES, list);
    return list[idx];
  },

  async deleteSchemeOfStudy(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('scheme_of_studies').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete scheme_of_studies failed', e);
      }
    }
    const list = loadFromStorage<SchemeOfStudy[]>(STORAGE_KEYS.SCHEME_OF_STUDIES, INITIAL_SCHEME_OF_STUDIES);
    saveToStorage(STORAGE_KEYS.SCHEME_OF_STUDIES, list.filter(i => i.id !== id));
  },

  // ============================================================================
  // PHASE 7 & 8: SUBJECT CONTENTS & STUDY MATERIALS
  // ============================================================================
  async getSubjectContents(
    academic_year_id: string,
    class_id?: string,
    subject_id?: string,
    content_type?: string
  ): Promise<SubjectContent[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('subject_contents')
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*), creator:staff(*)')
          .eq('academic_year_id', academic_year_id)
          .order('created_at', { ascending: false });

        if (class_id) query = query.eq('class_id', class_id);
        if (subject_id) query = query.eq('subject_id', subject_id);
        if (content_type) query = query.eq('content_type', content_type);

        const { data, error } = await query;
        if (!error && data) return data as SubjectContent[];
      } catch (e) {
        console.warn('Supabase fetch subject_contents failed, using local cache', e);
      }
    }

    const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
    const classes = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const subjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const staff = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);

    return list
      .filter(item => {
        if (item.academic_year_id !== academic_year_id) return false;
        if (class_id && item.class_id !== class_id) return false;
        if (subject_id && item.subject_id !== subject_id) return false;
        if (content_type && item.content_type !== content_type) return false;
        return true;
      })
      .map(item => ({
        ...item,
        class: classes.find(c => c.id === item.class_id),
        subject: subjects.find(s => s.id === item.subject_id),
        creator: staff.find(st => st.id === item.created_by)
      }));
  },

  async createSubjectContent(
    data: Omit<SubjectContent, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SubjectContent> {
    const now = new Date().toISOString();
    const id = `91000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const newRecord: SubjectContent = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('subject_contents')
          .insert({
            academic_year_id: data.academic_year_id,
            class_id: data.class_id,
            subject_id: data.subject_id,
            title: data.title,
            content_type: data.content_type,
            chapter_ref: data.chapter_ref,
            description: data.description,
            file_url: data.file_url,
            is_published: data.is_published,
            created_by: data.created_by
          })
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*), creator:staff(*)')
          .single();

        if (!error && inserted) {
          const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
          saveToStorage(STORAGE_KEYS.SUBJECT_CONTENTS, [...list, inserted]);
          return inserted as SubjectContent;
        }
      } catch (e) {
        console.warn('Supabase create subject_contents failed', e);
      }
    }

    const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
    saveToStorage(STORAGE_KEYS.SUBJECT_CONTENTS, [...list, newRecord]);
    return newRecord;
  },

  async updateSubjectContent(id: string, updates: Partial<SubjectContent>): Promise<SubjectContent> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subject_contents')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select('*, class:classes(*), subject:subjects(*), academic_year:academic_years(*), creator:staff(*)')
          .single();

        if (!error && data) {
          const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
          const idx = list.findIndex(i => i.id === id);
          if (idx >= 0) list[idx] = data as SubjectContent;
          saveToStorage(STORAGE_KEYS.SUBJECT_CONTENTS, list);
          return data as SubjectContent;
        }
      } catch (e) {
        console.warn('Supabase update subject_contents failed', e);
      }
    }

    const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Subject content record not found');
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.SUBJECT_CONTENTS, list);
    return list[idx];
  },

  async deleteSubjectContent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('subject_contents').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete subject_contents failed', e);
      }
    }
    const list = loadFromStorage<SubjectContent[]>(STORAGE_KEYS.SUBJECT_CONTENTS, INITIAL_SUBJECT_CONTENTS);
    saveToStorage(STORAGE_KEYS.SUBJECT_CONTENTS, list.filter(i => i.id !== id));
  },

  // ============================================================================
  // PHASE 8: ASSESSMENTS / EXAMS / DATESHEETS
  // ============================================================================
  async getAssessments(
    academic_year_id: string,
    class_id?: string,
    section_id?: string,
    subject_id?: string
  ): Promise<Assessment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('assessments')
          .select('*, class:classes(*), section:sections(*), subject:subjects(*), academic_year:academic_years(*)')
          .eq('academic_year_id', academic_year_id)
          .order('test_date', { ascending: true });

        if (class_id) query = query.eq('class_id', class_id);
        if (section_id) query = query.eq('section_id', section_id);
        if (subject_id) query = query.eq('subject_id', subject_id);

        const { data, error } = await query;
        if (!error && data) return data as Assessment[];
      } catch (e) {
        console.warn('Supabase fetch assessments failed, using local cache', e);
      }
    }

    const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    const classes = loadFromStorage<ClassItem[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const sections = loadFromStorage<SectionItem[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    const subjects = loadFromStorage<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const years = loadFromStorage<AcademicYear[]>(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS);

    return list
      .filter(item => {
        if (item.academic_year_id !== academic_year_id) return false;
        if (class_id && item.class_id !== class_id) return false;
        if (section_id && item.section_id && item.section_id !== section_id) return false;
        if (subject_id && item.subject_id !== subject_id) return false;
        return true;
      })
      .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
      .map(item => ({
        ...item,
        class: classes.find(c => c.id === item.class_id),
        section: sections.find(s => s.id === item.section_id),
        subject: subjects.find(s => s.id === item.subject_id),
        academic_year: years.find(y => y.id === item.academic_year_id)
      }));
  },

  async createAssessment(
    data: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Assessment> {
    const now = new Date().toISOString();
    const id = `92000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const newRecord: Assessment = {
      ...data,
      id,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('assessments')
          .insert({
            academic_year_id: data.academic_year_id,
            class_id: data.class_id,
            section_id: data.section_id || null,
            subject_id: data.subject_id,
            title: data.title,
            assessment_type: data.assessment_type,
            total_marks: data.total_marks,
            passing_marks: data.passing_marks,
            test_date: data.test_date,
            start_time: data.start_time || null,
            end_time: data.end_time || null,
            room_number: data.room_number || null,
            status: data.status
          })
          .select('*, class:classes(*), section:sections(*), subject:subjects(*), academic_year:academic_years(*)')
          .single();

        if (!error && inserted) {
          const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
          saveToStorage(STORAGE_KEYS.ASSESSMENTS, [...list, inserted]);
          return inserted as Assessment;
        }
      } catch (e) {
        console.warn('Supabase create assessments failed', e);
      }
    }

    const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, [...list, newRecord]);
    return newRecord;
  },

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select('*, class:classes(*), section:sections(*), subject:subjects(*), academic_year:academic_years(*)')
          .single();

        if (!error && data) {
          const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
          const idx = list.findIndex(i => i.id === id);
          if (idx >= 0) list[idx] = data as Assessment;
          saveToStorage(STORAGE_KEYS.ASSESSMENTS, list);
          return data as Assessment;
        }
      } catch (e) {
        console.warn('Supabase update assessments failed', e);
      }
    }

    const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Assessment not found');
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, list);
    return list[idx];
  },

  async deleteAssessment(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('assessments').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete assessments failed', e);
      }
    }
    const list = loadFromStorage<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    saveToStorage(STORAGE_KEYS.ASSESSMENTS, list.filter(i => i.id !== id));
  },

  // ============================================================================
  // PHASE 8: MARKS ENTRY, MARKSHEETS & REPORT CARDS
  // ============================================================================
  calculateGradeAndPercentage(obtained: number | null | undefined, total: number, is_absent: boolean): { percentage: number | null; grade: string } {
    if (is_absent || obtained === null || obtained === undefined) {
      return { percentage: is_absent ? 0 : null, grade: is_absent ? 'ABS' : '-' };
    }
    const percentage = Math.round((obtained / total) * 100 * 100) / 100;
    let grade = 'F';
    if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    return { percentage, grade };
  },

  async getStudentMarks(assessment_id: string): Promise<StudentMark[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_marks')
          .select('*, student:students(*)')
          .eq('assessment_id', assessment_id);

        if (!error && data) return data as StudentMark[];
      } catch (e) {
        console.warn('Supabase fetch student_marks failed', e);
      }
    }

    const list = loadFromStorage<StudentMark[]>(STORAGE_KEYS.STUDENT_MARKS, INITIAL_STUDENT_MARKS);
    const students = loadFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

    return list
      .filter(item => item.assessment_id === assessment_id)
      .map(item => ({
        ...item,
        student: students.find(s => s.id === item.student_id)
      }));
  },

  async saveStudentMarksBatch(
    assessment_id: string,
    total_marks: number,
    marksList: Array<{
      student_id: string;
      obtained_marks?: number | null;
      is_absent: boolean;
      remarks?: string | null;
    }>
  ): Promise<StudentMark[]> {
    const now = new Date().toISOString();
    const preparedRecords = marksList.map(item => {
      const { percentage, grade } = this.calculateGradeAndPercentage(item.obtained_marks, total_marks, item.is_absent);
      return {
        assessment_id,
        student_id: item.student_id,
        obtained_marks: item.is_absent ? 0 : item.obtained_marks ?? null,
        is_absent: item.is_absent,
        percentage,
        grade,
        remarks: item.remarks || null,
        updated_at: now
      };
    });

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_marks')
          .upsert(preparedRecords, { onConflict: 'assessment_id,student_id' })
          .select('*, student:students(*)');

        if (!error && data) {
          const list = loadFromStorage<StudentMark[]>(STORAGE_KEYS.STUDENT_MARKS, INITIAL_STUDENT_MARKS);
          const others = list.filter(m => m.assessment_id !== assessment_id);
          saveToStorage(STORAGE_KEYS.STUDENT_MARKS, [...others, ...(data as StudentMark[])]);
          return data as StudentMark[];
        }
      } catch (e) {
        console.warn('Supabase save student_marks batch failed, falling back to local storage', e);
      }
    }

    const list = loadFromStorage<StudentMark[]>(STORAGE_KEYS.STUDENT_MARKS, INITIAL_STUDENT_MARKS);
    const updated: StudentMark[] = [];

    for (const prep of preparedRecords) {
      const idx = list.findIndex(m => m.assessment_id === assessment_id && m.student_id === prep.student_id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...prep };
        updated.push(list[idx]);
      } else {
        const newMark: StudentMark = {
          id: `93000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
          ...prep,
          created_at: now
        };
        list.push(newMark);
        updated.push(newMark);
      }
    }

    saveToStorage(STORAGE_KEYS.STUDENT_MARKS, list);
    return updated;
  },

  async getStudentReportCard(
    academic_year_id: string,
    student_id: string
  ): Promise<StudentReportCard | null> {
    const studentsWithEnrollment = await this.getStudents(academic_year_id);
    const student = studentsWithEnrollment.find(s => s.id === student_id);
    if (!student || !student.academic_record) return null;

    const class_id = student.academic_record.class_id;
    const section_id = student.academic_record.section_id;

    const allAssessments = await this.getAssessments(academic_year_id, class_id);
    const relevantAssessments = allAssessments.filter(a => !a.section_id || a.section_id === section_id);

    // Fetch marks for each assessment
    let allStudentMarks: StudentMark[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_marks')
          .select('*')
          .eq('student_id', student_id);
        if (!error && data) allStudentMarks = data as StudentMark[];
      } catch (e) {
        console.warn('Supabase fetch student report marks failed', e);
      }
    }

    if (allStudentMarks.length === 0) {
      const local = loadFromStorage<StudentMark[]>(STORAGE_KEYS.STUDENT_MARKS, INITIAL_STUDENT_MARKS);
      allStudentMarks = local.filter(m => m.student_id === student_id);
    }

    const results: StudentMarksheetSubjectResult[] = [];
    let totalMax = 0;
    let totalObt = 0;
    let passedCount = 0;

    for (const a of relevantAssessments) {
      const mark = allStudentMarks.find(m => m.assessment_id === a.id);
      const obt = mark ? mark.obtained_marks : null;
      const isAbsent = mark?.is_absent || false;
      const isPassed = !isAbsent && (obt !== null && obt !== undefined) ? obt >= a.passing_marks : false;

      totalMax += Number(a.total_marks);
      if (obt !== null && !isAbsent) totalObt += Number(obt);
      if (isPassed) passedCount++;

      results.push({
        assessment_id: a.id,
        assessment_title: a.title,
        assessment_type: a.assessment_type,
        test_date: a.test_date,
        subject_id: a.subject_id,
        subject_name: a.subject?.name || 'Subject',
        subject_code: a.subject?.code || 'SUB',
        total_marks: Number(a.total_marks),
        passing_marks: Number(a.passing_marks),
        obtained_marks: obt ?? null,
        is_absent: isAbsent,
        percentage: mark?.percentage ?? (obt !== null && obt !== undefined ? Math.round((Number(obt) / Number(a.total_marks)) * 100) : null),
        grade: mark?.grade ?? (isAbsent ? 'ABS' : '-'),
        is_passed: isPassed,
        remarks: mark?.remarks || null
      });
    }

    const overallPercentage = totalMax > 0 ? Math.round((totalObt / totalMax) * 100 * 100) / 100 : 0;
    let overallGrade = 'F';
    if (overallPercentage >= 80) overallGrade = 'A+';
    else if (overallPercentage >= 70) overallGrade = 'A';
    else if (overallPercentage >= 60) overallGrade = 'B';
    else if (overallPercentage >= 50) overallGrade = 'C';
    else if (overallPercentage >= 40) overallGrade = 'D';

    return {
      student,
      academic_year: student.academic_record.academic_year,
      class: student.academic_record.class,
      section: student.academic_record.section,
      batch: student.academic_record.batch,
      results,
      total_maximum_marks: totalMax,
      total_obtained_marks: totalObt,
      overall_percentage: overallPercentage,
      overall_grade: overallGrade,
      overall_result: overallGrade !== 'F' ? 'PASS' : 'FAIL',
      class_rank: 1
    };
  },

  // ============================================================================
  // PHASE 7: TEACHER PORTAL OVERVIEW
  // ============================================================================
  async getTeacherPortalOverview(teacher_id: string, academic_year_id: string) {
    const staffMembers = await this.getStaff();
    const teacher = staffMembers.find(s => s.id === teacher_id);

    const assignments = await this.getTeacherAssignments({ academicYearId: academic_year_id, teacherId: teacher_id });
    const teacherAssignments = assignments.filter(a => a.status === 'active');

    // Days mapping
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayDayName = dayNames[todayIndex] || 'Monday';
    const todayDateStr = new Date().toISOString().split('T')[0];

    const allSlots = await this.getTimetableSlots({ academicYearId: academic_year_id, teacherId: teacher_id });
    const teacherSlots = allSlots.filter(s => s.status === 'active');
    const todaySlots = teacherSlots
      .filter(s => s.day_of_week === todayDayName)
      .sort((a, b) => a.period_number - b.period_number);

    // Check attendance status for today's slots
    const todaySlotIds = todaySlots.map(s => s.id);
    let todayLecturesAttended: LectureAttendance[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lecture_attendance')
          .select('*')
          .eq('academic_year_id', academic_year_id)
          .eq('date', todayDateStr)
          .in('timetable_slot_id', todaySlotIds);
        if (!error && data) todayLecturesAttended = data as LectureAttendance[];
      } catch (e) {
        console.warn('Supabase fetch teacher attendance status failed', e);
      }
    }

    if (todayLecturesAttended.length === 0) {
      const local = loadFromStorage<LectureAttendance[]>(STORAGE_KEYS.LECTURE_ATTENDANCE, INITIAL_LECTURE_ATTENDANCE);
      todayLecturesAttended = local.filter(l => l.academic_year_id === academic_year_id && l.date === todayDateStr && todaySlotIds.includes(l.timetable_slot_id || ''));
    }

    const slotsWithAttendanceStatus = todaySlots.map(slot => {
      const hasAttendance = todayLecturesAttended.some(la => la.timetable_slot_id === slot.id);
      return {
        ...slot,
        isAttendanceMarked: hasAttendance
      };
    });

    const pendingAttendanceCount = slotsWithAttendanceStatus.filter(s => !s.isAttendanceMarked).length;

    // Assigned subjects and classes
    const assignedSubjectIds = Array.from(new Set(teacherAssignments.map(a => a.subject_id)));
    const assignedClassIds = Array.from(new Set(teacherAssignments.map(a => a.class_id)));

    // Scheme of studies for teacher's subjects
    const allSOS = await this.getSchemeOfStudies(academic_year_id);
    const teacherSOS = allSOS.filter(s => assignedSubjectIds.includes(s.subject_id) && assignedClassIds.includes(s.class_id));

    // Assessments for teacher's subjects
    const allAssessments = await this.getAssessments(academic_year_id);
    const teacherAssessments = allAssessments.filter(a => assignedSubjectIds.includes(a.subject_id) && assignedClassIds.includes(a.class_id));

    return {
      teacher,
      teacherAssignments,
      todayDayName,
      todayDateStr,
      todaySlots: slotsWithAttendanceStatus,
      weeklySlots: teacherSlots,
      pendingAttendanceCount,
      teacherSOS,
      teacherAssessments
    };
  },

  // --------------------------------------------------------------------------
  // Phase 9: Parents & Parent-Students
  // --------------------------------------------------------------------------
  async getParents(): Promise<Parent[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('parents')
          .select('*')
          .order('full_name', { ascending: true });
        if (!error && data) return data as Parent[];
      } catch (e) {
        console.warn('Supabase getParents failed, falling back to local store', e);
      }
    }
    return loadFromStorage<Parent[]>(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
  },

  async getParentById(id: string): Promise<Parent | null> {
    const parents = await this.getParents();
    return parents.find(p => p.id === id) || null;
  },

  async createParent(parentData: Omit<Parent, 'id' | 'created_at' | 'updated_at'>): Promise<Parent> {
    const now = new Date().toISOString();
    const newParent: Parent = {
      id: crypto.randomUUID(),
      ...parentData,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('parents')
          .insert(newParent)
          .select()
          .single();
        if (!error && data) return data as Parent;
      } catch (e) {
        console.warn('Supabase createParent failed, saving locally', e);
      }
    }

    const parents = await this.getParents();
    parents.push(newParent);
    saveToStorage(STORAGE_KEYS.PARENTS, parents);
    return newParent;
  },

  async updateParent(id: string, updates: Partial<Parent>): Promise<Parent> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('parents')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Parent;
      } catch (e) {
        console.warn('Supabase updateParent failed, saving locally', e);
      }
    }

    const parents = await this.getParents();
    const index = parents.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Parent record not found');
    parents[index] = { ...parents[index], ...updates, updated_at: now };
    saveToStorage(STORAGE_KEYS.PARENTS, parents);
    return parents[index];
  },

  async deleteParent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('parents').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteParent failed, falling back to local store', e);
      }
    }

    const parents = (await this.getParents()).filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PARENTS, parents);

    const parentStudents = (await this.getParentStudents()).filter(ps => ps.parent_id !== id);
    saveToStorage(STORAGE_KEYS.PARENT_STUDENTS, parentStudents);
  },

  async getParentStudents(parentId?: string): Promise<ParentStudent[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('parent_students').select(`
          *,
          parent:parents(*),
          student:students(*)
        `);
        if (parentId) {
          query = query.eq('parent_id', parentId);
        }
        const { data, error } = await query;
        if (!error && data) return data as unknown as ParentStudent[];
      } catch (e) {
        console.warn('Supabase getParentStudents failed, falling back to local store', e);
      }
    }

    let records = loadFromStorage<ParentStudent[]>(STORAGE_KEYS.PARENT_STUDENTS, INITIAL_PARENT_STUDENTS);
    if (parentId) {
      records = records.filter(r => r.parent_id === parentId);
    }
    return records;
  },

  async linkParentStudent(data: Omit<ParentStudent, 'id' | 'created_at'>): Promise<ParentStudent> {
    const newLink: ParentStudent = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('parent_students')
          .insert(newLink)
          .select()
          .single();
        if (!error && inserted) return inserted as unknown as ParentStudent;
      } catch (e) {
        console.warn('Supabase linkParentStudent failed, saving locally', e);
      }
    }

    const links = await this.getParentStudents();
    links.push(newLink);
    saveToStorage(STORAGE_KEYS.PARENT_STUDENTS, links);
    return newLink;
  },

  async unlinkParentStudent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('parent_students').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase unlinkParentStudent failed, falling back to local store', e);
      }
    }

    const links = (await this.getParentStudents()).filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.PARENT_STUDENTS, links);
  },

  async getStudentPortalOverview(studentId: string, academicYearId?: string): Promise<StudentPortalOverview> {
    const currentYear = academicYearId 
      ? (await this.getAcademicYears()).find(y => y.id === academicYearId)
      : (await this.getAcademicYears()).find(y => y.is_current);

    const yearId = currentYear?.id || '';

    // Get student details with enrollment
    const student = await this.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const classId = student.academic_record?.class_id || '';
    const sectionId = student.academic_record?.section_id || '';

    // 1. Attendance Summary
    let attendanceSummary = {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      percentage: 100
    };

    try {
      const dailyAttendance = await this.getDailyAttendance({
        academic_year_id: yearId,
        student_id: student.id
      });
      const total = dailyAttendance.length;
      const present = dailyAttendance.filter(a => a.status === 'Present').length;
      const absent = dailyAttendance.filter(a => a.status === 'Absent').length;
      const leave = dailyAttendance.filter(a => a.status === 'Leave' || a.status === 'Late').length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

      attendanceSummary = {
        totalDays: total,
        presentDays: present,
        absentDays: absent,
        leaveDays: leave,
        percentage: pct
      };
    } catch (e) {
      console.warn('Failed to calculate student attendance summary', e);
    }

    // 2. Today's Timetable Slots
    const dayNames: DayOfWeek[] = ['Sunday' as any, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[new Date().getDay()] || 'Monday';

    let todaySlots: any[] = [];
    try {
      const allSlots = await this.getTimetableSlots({
        academicYearId: yearId,
        classId: classId
      });
      todaySlots = allSlots
        .filter(s => s.status === 'active' && s.day_of_week === todayDayName && (!sectionId || !s.section_id || s.section_id === sectionId))
        .sort((a, b) => a.period_number - b.period_number)
        .map(s => ({
          ...s,
          subject_name: s.subject?.name || 'Class Lecture',
          teacher_name: s.teacher?.name || 'Assigned Faculty',
          room_number: s.room || 'Room 1'
        }));
    } catch (e) {
      console.warn('Failed to load student todaySlots', e);
    }

    // 3. Upcoming Assessments
    let upcomingAssessments: Assessment[] = [];
    try {
      const allAssessments = await this.getAssessments(yearId);
      upcomingAssessments = allAssessments
        .filter(a => a.class_id === classId && (!a.section_id || a.section_id === sectionId) && a.status === 'scheduled')
        .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
        .slice(0, 5);
    } catch (e) {
      console.warn('Failed to load upcoming assessments', e);
    }

    // 4. Report Card & Recent Marks
    let reportCard: StudentReportCard | null = null;
    let recentMarks: StudentMarksheetSubjectResult[] = [];
    try {
      reportCard = await this.getStudentReportCard(student.id, yearId);
      if (reportCard && reportCard.results) {
        recentMarks = reportCard.results;
      }
    } catch (e) {
      console.warn('Failed to load student report card', e);
    }

    // 5. Study Materials
    let studyMaterials: SubjectContent[] = [];
    try {
      const allContent = await this.getSubjectContents(yearId);
      studyMaterials = allContent.filter(c => c.class_id === classId);
    } catch (e) {
      console.warn('Failed to load study materials', e);
    }

    return {
      student,
      academicYear: currentYear,
      attendanceSummary,
      todaySlots,
      upcomingAssessments,
      recentMarks,
      reportCard,
      studyMaterials
    };
  },

  async getParentPortalOverview(parentId: string, academicYearId?: string): Promise<ParentPortalOverview> {
    const parent = await this.getParentById(parentId);
    if (!parent) {
      throw new Error('Parent not found');
    }

    const currentYear = academicYearId 
      ? (await this.getAcademicYears()).find(y => y.id === academicYearId)
      : (await this.getAcademicYears()).find(y => y.is_current);

    const yearId = currentYear?.id || '';

    // Fetch linked children
    const links = await this.getParentStudents(parentId);
    const childrenSummaries: ParentPortalChildSummary[] = [];

    for (const link of links) {
      try {
        const student = await this.getStudentById(link.student_id);
        if (!student) continue;

        // Attendance %
        const daily = await this.getDailyAttendance({
          academic_year_id: yearId,
          student_id: student.id
        });
        const total = daily.length;
        const present = daily.filter(d => d.status === 'Present').length;
        const attendancePct = total > 0 ? Math.round((present / total) * 100) : 100;

        // Marks & Grades
        const report = await this.getStudentReportCard(student.id, yearId);
        const totalTests = report?.results.length || 0;
        const avgPct = report?.overall_percentage || 0;
        const grade = report?.overall_grade || 'N/A';

        childrenSummaries.push({
          student,
          relationship_type: link.relationship_type,
          is_primary_contact: link.is_primary_contact,
          attendancePercentage: attendancePct,
          latestGrade: grade,
          totalTestsGiven: totalTests,
          averageMarksPercentage: avgPct
        });
      } catch (e) {
        console.warn('Failed to compile child summary for parent portal', e);
      }
    }

    return {
      parent,
      children: childrenSummaries
    };
  },

  // --------------------------------------------------------------------------
  // Phase 10: Fee Structures, Invoices & Payments
  // --------------------------------------------------------------------------
  async getFeeStructures(academicYearId?: string): Promise<FeeStructure[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('fee_structures')
          .select(`
            *,
            class:classes(*)
          `)
          .order('title', { ascending: true });
        if (academicYearId) {
          query = query.eq('academic_year_id', academicYearId);
        }
        const { data, error } = await query;
        if (!error && data) return data as unknown as FeeStructure[];
      } catch (e) {
        console.warn('Supabase getFeeStructures failed, falling back to local store', e);
      }
    }

    let records = loadFromStorage<FeeStructure[]>(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES);
    if (academicYearId) {
      records = records.filter(r => r.academic_year_id === academicYearId);
    }
    const classes = await this.getClasses();
    return records.map(r => ({
      ...r,
      class: classes.find(c => c.id === r.class_id)
    }));
  },

  async createFeeStructure(data: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>): Promise<FeeStructure> {
    const now = new Date().toISOString();
    const total_amount = Number(data.tuition_fee || 0) +
      Number(data.admission_fee || 0) +
      Number(data.exam_fee || 0) +
      Number(data.lab_fee || 0) +
      Number(data.other_fee || 0);

    const newStruct: FeeStructure = {
      id: crypto.randomUUID(),
      ...data,
      total_amount,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('fee_structures')
          .insert(newStruct)
          .select()
          .single();
        if (!error && inserted) return inserted as unknown as FeeStructure;
      } catch (e) {
        console.warn('Supabase createFeeStructure failed, saving locally', e);
      }
    }

    const list = await this.getFeeStructures();
    list.push(newStruct);
    saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return newStruct;
  },

  async updateFeeStructure(id: string, updates: Partial<FeeStructure>): Promise<FeeStructure> {
    const now = new Date().toISOString();
    const list = await this.getFeeStructures();
    const index = list.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Fee structure not found');

    const merged = { ...list[index], ...updates };
    const total_amount = Number(merged.tuition_fee || 0) +
      Number(merged.admission_fee || 0) +
      Number(merged.exam_fee || 0) +
      Number(merged.lab_fee || 0) +
      Number(merged.other_fee || 0);

    const finalStruct = { ...merged, total_amount, updated_at: now };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('fee_structures')
          .update(finalStruct)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as unknown as FeeStructure;
      } catch (e) {
        console.warn('Supabase updateFeeStructure failed, saving locally', e);
      }
    }

    list[index] = finalStruct;
    saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return finalStruct;
  },

  async deleteFeeStructure(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('fee_structures').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteFeeStructure failed, falling back to local store', e);
      }
    }

    const list = (await this.getFeeStructures()).filter(f => f.id !== id);
    saveToStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
  },

  // --------------------------------------------------------------------------
  // Fee Invoices
  // --------------------------------------------------------------------------
  async getFeeInvoices(filter?: {
    academicYearId?: string;
    studentId?: string;
    classId?: string;
    status?: string;
  }): Promise<FeeInvoice[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('fee_invoices')
          .select(`
            *,
            student:students(*),
            class:classes(*),
            section:sections(*),
            fee_structure:fee_structures(*),
            payments:fee_payments(*)
          `)
          .order('issue_date', { ascending: false });

        if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId);
        if (filter?.studentId) query = query.eq('student_id', filter.studentId);
        if (filter?.classId) query = query.eq('class_id', filter.classId);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data) return data as unknown as FeeInvoice[];
      } catch (e) {
        console.warn('Supabase getFeeInvoices failed, falling back to local store', e);
      }
    }

    let records = loadFromStorage<FeeInvoice[]>(STORAGE_KEYS.FEE_INVOICES, INITIAL_FEE_INVOICES);
    if (filter?.academicYearId) records = records.filter(r => r.academic_year_id === filter.academicYearId);
    if (filter?.studentId) records = records.filter(r => r.student_id === filter.studentId);
    if (filter?.classId) records = records.filter(r => r.class_id === filter.classId);
    if (filter?.status) records = records.filter(r => r.status === filter.status);

    const [students, classes, sections, payments] = await Promise.all([
      this.getStudents(),
      this.getClasses(),
      this.getSections(),
      this.getFeePayments()
    ]);

    return records.map(inv => ({
      ...inv,
      student: students.find(s => s.id === inv.student_id),
      class: classes.find(c => c.id === inv.class_id),
      section: sections.find(sec => sec.id === inv.section_id),
      payments: payments.filter(p => p.invoice_id === inv.id)
    }));
  },

  async getFeeInvoiceById(id: string): Promise<FeeInvoice | null> {
    const list = await this.getFeeInvoices();
    return list.find(i => i.id === id) || null;
  },

  async createFeeInvoice(data: {
    academic_year_id: string;
    student_id: string;
    class_id: string;
    section_id?: string | null;
    fee_structure_id?: string | null;
    month: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    discount?: number;
    discount_reason?: string | null;
    fine?: number;
    notes?: string | null;
  }): Promise<FeeInvoice> {
    const now = new Date().toISOString();
    const existing = await this.getFeeInvoices();
    const invoiceNum = `INV-${new Date().getFullYear()}-${String(existing.length + 1).padStart(4, '0')}`;

    const subtotal = Number(data.subtotal || 0);
    const discount = Number(data.discount || 0);
    const fine = Number(data.fine || 0);
    const total_amount = Math.max(0, subtotal - discount + fine);

    const newInvoice: FeeInvoice = {
      id: crypto.randomUUID(),
      invoice_no: invoiceNum,
      academic_year_id: data.academic_year_id,
      student_id: data.student_id,
      class_id: data.class_id,
      section_id: data.section_id || null,
      fee_structure_id: data.fee_structure_id || null,
      month: data.month,
      issue_date: data.issue_date,
      due_date: data.due_date,
      subtotal,
      discount,
      discount_reason: data.discount_reason || null,
      fine,
      total_amount,
      paid_amount: 0,
      balance_amount: total_amount,
      status: 'unpaid',
      notes: data.notes || null,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('fee_invoices')
          .insert(newInvoice)
          .select()
          .single();
        if (!error && inserted) return inserted as unknown as FeeInvoice;
      } catch (e) {
        console.warn('Supabase createFeeInvoice failed, saving locally', e);
      }
    }

    existing.unshift(newInvoice);
    saveToStorage(STORAGE_KEYS.FEE_INVOICES, existing);
    return newInvoice;
  },

  async generateMonthlyInvoicesBatch(params: {
    academicYearId: string;
    month: string;
    dueDate: string;
    classId?: string;
  }): Promise<FeeInvoice[]> {
    const allStudents = await this.getStudents(params.academicYearId);
    let targetStudents = allStudents.filter(s => s.status === 'active' && s.academic_record);
    if (params.classId) {
      targetStudents = targetStudents.filter(s => s.academic_record?.class_id === params.classId);
    }

    const feeStructures = await this.getFeeStructures(params.academicYearId);
    const existingInvoices = await this.getFeeInvoices({ academicYearId: params.academicYearId });

    const createdList: FeeInvoice[] = [];
    const todayDate = new Date().toISOString().split('T')[0];

    for (const student of targetStudents) {
      const clsId = student.academic_record!.class_id;
      const secId = student.academic_record!.section_id;

      // Avoid duplicates for this month
      const alreadyHas = existingInvoices.some(
        inv => inv.student_id === student.id && inv.month.toLowerCase() === params.month.toLowerCase()
      );
      if (alreadyHas) continue;

      const matchedStruct = feeStructures.find(f => f.class_id === clsId && f.status === 'active') || feeStructures[0];
      const subtotal = matchedStruct ? Number(matchedStruct.total_amount) : 5000;

      const created = await this.createFeeInvoice({
        academic_year_id: params.academicYearId,
        student_id: student.id,
        class_id: clsId,
        section_id: secId,
        fee_structure_id: matchedStruct?.id || null,
        month: params.month,
        issue_date: todayDate,
        due_date: params.dueDate,
        subtotal,
        discount: 0,
        fine: 0,
        notes: `Centralized batch generation for ${params.month}`
      });

      createdList.push(created);
    }

    return createdList;
  },

  async updateFeeInvoice(id: string, updates: Partial<FeeInvoice>): Promise<FeeInvoice> {
    const now = new Date().toISOString();
    const existing = await this.getFeeInvoices();
    const index = existing.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Fee invoice not found');

    const merged = { ...existing[index], ...updates };
    const subtotal = Number(merged.subtotal || 0);
    const discount = Number(merged.discount || 0);
    const fine = Number(merged.fine || 0);
    const total_amount = Math.max(0, subtotal - discount + fine);
    const paid_amount = Number(merged.paid_amount || 0);
    const balance_amount = Math.max(0, total_amount - paid_amount);

    let status = merged.status;
    if (balance_amount <= 0) {
      status = 'paid';
    } else if (paid_amount > 0) {
      status = 'partial';
    } else if (new Date(merged.due_date) < new Date()) {
      status = 'overdue';
    } else {
      status = 'unpaid';
    }

    const finalInvoice = {
      ...merged,
      total_amount,
      paid_amount,
      balance_amount,
      status,
      updated_at: now
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('fee_invoices')
          .update(finalInvoice)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as unknown as FeeInvoice;
      } catch (e) {
        console.warn('Supabase updateFeeInvoice failed, saving locally', e);
      }
    }

    existing[index] = finalInvoice;
    saveToStorage(STORAGE_KEYS.FEE_INVOICES, existing);
    return finalInvoice;
  },

  async deleteFeeInvoice(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('fee_invoices').delete().eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn('Supabase deleteFeeInvoice failed, falling back to local store', e);
      }
    }

    const existing = (await this.getFeeInvoices()).filter(i => i.id !== id);
    saveToStorage(STORAGE_KEYS.FEE_INVOICES, existing);
  },

  // --------------------------------------------------------------------------
  // Fee Payments (Receipts)
  // --------------------------------------------------------------------------
  async getFeePayments(filter?: {
    invoiceId?: string;
    studentId?: string;
    academicYearId?: string;
  }): Promise<FeePayment[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('fee_payments')
          .select(`
            *,
            student:students(*),
            invoice:fee_invoices(*)
          `)
          .order('payment_date', { ascending: false });

        if (filter?.invoiceId) query = query.eq('invoice_id', filter.invoiceId);
        if (filter?.studentId) query = query.eq('student_id', filter.studentId);
        if (filter?.academicYearId) query = query.eq('academic_year_id', filter.academicYearId);

        const { data, error } = await query;
        if (!error && data) return data as unknown as FeePayment[];
      } catch (e) {
        console.warn('Supabase getFeePayments failed, falling back to local store', e);
      }
    }

    let records = loadFromStorage<FeePayment[]>(STORAGE_KEYS.FEE_PAYMENTS, INITIAL_FEE_PAYMENTS);
    if (filter?.invoiceId) records = records.filter(r => r.invoice_id === filter.invoiceId);
    if (filter?.studentId) records = records.filter(r => r.student_id === filter.studentId);
    if (filter?.academicYearId) records = records.filter(r => r.academic_year_id === filter.academicYearId);

    const students = await this.getStudents();
    return records.map(p => ({
      ...p,
      student: students.find(s => s.id === p.student_id)
    }));
  },

  async recordFeePayment(paymentData: {
    invoice_id: string;
    student_id: string;
    academic_year_id: string;
    amount: number;
    payment_date: string;
    payment_method: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online / Mobile Wallet';
    transaction_reference?: string | null;
    collected_by?: string | null;
    remarks?: string | null;
  }): Promise<FeePayment> {
    const existingPayments = await this.getFeePayments();
    const receiptNum = `REC-${new Date().getFullYear()}-${String(existingPayments.length + 1).padStart(4, '0')}`;

    const newPayment: FeePayment = {
      id: crypto.randomUUID(),
      receipt_no: receiptNum,
      ...paymentData,
      amount: Number(paymentData.amount),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from('fee_payments')
          .insert(newPayment)
          .select()
          .single();
        if (!error && inserted) {
          // Trigger in PostgreSQL will sync invoice automatically
          return inserted as unknown as FeePayment;
        }
      } catch (e) {
        console.warn('Supabase recordFeePayment failed, saving locally', e);
      }
    }

    // Local storage path: record payment and update invoice balance
    existingPayments.unshift(newPayment);
    saveToStorage(STORAGE_KEYS.FEE_PAYMENTS, existingPayments);

    // Sync invoice
    const invoices = await this.getFeeInvoices();
    const invIndex = invoices.findIndex(i => i.id === paymentData.invoice_id);
    if (invIndex !== -1) {
      const inv = invoices[invIndex];
      const invPayments = existingPayments.filter(p => p.invoice_id === inv.id);
      const totalPaid = invPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = Math.max(0, Number(inv.total_amount) - totalPaid);

      let newStatus: any = 'unpaid';
      if (balance <= 0) newStatus = 'paid';
      else if (totalPaid > 0) newStatus = 'partial';
      else if (new Date(inv.due_date) < new Date()) newStatus = 'overdue';

      invoices[invIndex] = {
        ...inv,
        paid_amount: totalPaid,
        balance_amount: balance,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.FEE_INVOICES, invoices);
    }

    return newPayment;
  },

  async getFeeKPIStats(academicYearId?: string): Promise<FeeKPIStats> {
    const invoices = await this.getFeeInvoices(academicYearId ? { academicYearId } : undefined);

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let defaultersCount = 0;

    for (const inv of invoices) {
      totalInvoiced += Number(inv.total_amount || 0);
      totalCollected += Number(inv.paid_amount || 0);
      totalOutstanding += Number(inv.balance_amount || 0);

      if (inv.status === 'unpaid' || inv.status === 'partial' || inv.status === 'overdue') {
        if (Number(inv.balance_amount) > 0) {
          defaultersCount++;
        }
      }
    }

    const collectionPercentage = totalInvoiced > 0 
      ? Math.round((totalCollected / totalInvoiced) * 100) 
      : 100;

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      totalDefaulters: defaultersCount,
      collectionPercentage
    };
  }
};

