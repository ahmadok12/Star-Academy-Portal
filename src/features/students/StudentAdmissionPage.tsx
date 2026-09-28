import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Upload,
  Calendar,
  GraduationCap,
  Layers,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  ClassItem,
  ClassSection,
  BatchItem,
  SubjectItem,
  Gender,
  EnrollmentType,
  StudentInquiry
} from '../../types/database.types';

interface StudentAdmissionPageProps {
  prefilledInquiry?: StudentInquiry | null;
  onBack: () => void;
  onAdmissionSuccess: () => void;
}

export const StudentAdmissionPage: React.FC<StudentAdmissionPageProps> = ({
  prefilledInquiry,
  onBack,
  onAdmissionSuccess,
}) => {
  const { academicYears, selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [availableClassSections, setAvailableClassSections] = useState<ClassSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Enrollment fields
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('regular');
  const [supplementarySubjectIds, setSupplementarySubjectIds] = useState<string[]>([]);
  const [supplementaryNotes, setSupplementaryNotes] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);

  // Student Identity fields
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [dob, setDob] = useState('2010-01-01');
  const [gender, setGender] = useState<Gender>('Male');
  const [cnicBform, setCnicBform] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load classes, batches, subjects & initialize from prefill
  useEffect(() => {
    const initialize = async () => {
      try {
        const [cList, bList, sList] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getBatches(),
          databaseService.getSubjects(),
        ]);
        const activeClasses = cList.filter(c => c.status === 'active');
        const activeBatches = bList.filter(b => b.status === 'active');
        const activeSubjects = sList.filter(s => s.status === 'active');

        setClasses(activeClasses);
        setBatches(activeBatches);
        setSubjects(activeSubjects);

        const defaultBatch = activeBatches.find(b => b.code === 'REG') || activeBatches[0];
        if (defaultBatch) {
          setBatchId(defaultBatch.id);
        }

        const initialYearId = selectedAcademicYear?.id || academicYears[0]?.id || '';
        setAcademicYearId(initialYearId);

        if (prefilledInquiry) {
          setStudentName(prefilledInquiry.student_name);
          setFatherName(prefilledInquiry.father_name || '');
          setPhone(prefilledInquiry.contact);
          if (prefilledInquiry.enrollment_type) {
            setEnrollmentType(prefilledInquiry.enrollment_type);
          }
          if (prefilledInquiry.interested_class_id) {
            setClassId(prefilledInquiry.interested_class_id);
          } else if (activeClasses[0]) {
            setClassId(activeClasses[0].id);
          }
        } else if (activeClasses[0]) {
          setClassId(activeClasses[0].id);
        }
      } catch (e: any) {
        toast.error('Failed to initialize admission form', e.message);
      }
    };

    initialize();
  }, [selectedAcademicYear, prefilledInquiry, toast]);

  // When academic year or class changes, fetch configured sections for that class and year!
  useEffect(() => {
    const loadSectionsForClass = async () => {
      if (!academicYearId || !classId) {
        setAvailableClassSections([]);
        return;
      }
      try {
        const csList = await databaseService.getClassSections(academicYearId, classId);
        const activeCS = csList.filter(cs => cs.status === 'active');
        setAvailableClassSections(activeCS);
        if (activeCS.length > 0) {
          setSectionId(activeCS[0].section_id);
        } else {
          setSectionId('');
        }
      } catch (e) {
        console.error('Error fetching sections for class:', e);
      }
    };

    loadSectionsForClass();
  }, [academicYearId, classId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const url = await databaseService.uploadStudentPhoto(file);
      setPhotoUrl(url);
      toast.success('Photo Attached', 'Student passport photograph uploaded.');
    } catch (err: any) {
      toast.error('Upload Error', err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim() || !fatherName.trim() || !phone.trim()) {
      setErrorMsg('Student name, father name, and primary phone are required.');
      return;
    }
    if (!academicYearId || !classId || !sectionId) {
      setErrorMsg('Please select an Academic Year, Class standard, and an assigned Section.');
      return;
    }
    if (enrollmentType === 'supplementary' && supplementarySubjectIds.length === 0) {
      setErrorMsg('Please select at least one supplementary subject that the student is taking exams for.');
      return;
    }

    try {
      setIsSubmitting(true);
      const student = await databaseService.createStudentAdmission(
        {
          student_name: studentName.trim(),
          father_name: fatherName.trim(),
          mother_name: motherName.trim() || null,
          dob,
          gender,
          cnic_bform: cnicBform.trim() || null,
          address: address.trim() || null,
          phone: phone.trim(),
          emergency_contact: emergencyContact.trim() || null,
          photo_url: photoUrl,
          blood_group: bloodGroup || null,
          status: 'active',
        },
        {
          academic_year_id: academicYearId,
          class_id: classId,
          section_id: sectionId,
          batch_id: batchId || null,
          enrollment_type: enrollmentType,
          supplementary_subject_ids: enrollmentType === 'supplementary' ? supplementarySubjectIds : [],
          supplementary_notes: enrollmentType === 'supplementary' ? (supplementaryNotes.trim() || null) : null,
          roll_no: rollNo.trim() || undefined,
          enrollment_date: enrollmentDate,
        },
        prefilledInquiry?.id
      );

      toast.success(
        'Admission Complete!',
        `${student.student_name} enrolled successfully with Admission #${student.admission_no}.`
      );
      onAdmissionSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete admission process');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>

        {prefilledInquiry && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">
            Converting Inquiry #{prefilledInquiry.inquiry_no}
          </span>
        )}
      </div>

      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Students' },
          { label: 'New Admission' },
        ]}
        title="Student Admission &amp; Academic Enrollment"
        subtitle="Register permanent student identity and create their year-specific class enrollment."
      />

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Academic Year & Class Enrollment Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Academic Placement &amp; Enrollment</h2>
              <p className="text-xs text-slate-500">Year-specific class, section, and roll number assignment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Master <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                </span>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section (Configured) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {availableClassSections.length === 0 ? (
                    <option value="">No sections active for this class/year</option>
                  ) : (
                    availableClassSections.map((cs) => {
                      const secName = cs.section?.name || 'Section';
                      const label = secName.toLowerCase().startsWith('section') ? secName : `Section ${secName}`;
                      return (
                        <option key={cs.section_id} value={cs.section_id}>
                          {label}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
              {availableClassSections.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Assign sections under Academic Setup &rarr; Class Sections.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Allocation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </span>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Multiple batches can exist for this class &amp; section.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 01, 102"
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrollment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Enrollment Category: Regular vs Supplementary */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Enrollment Category <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Identify whether this student is enrolled for standard academic curriculum or taking supplementary exams for failed subjects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setEnrollmentType('regular')}
                className={`cursor-pointer flex items-start p-3.5 rounded-2xl border transition ${
                  enrollmentType === 'regular'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <input
                  type="radio"
                  name="enrollmentType"
                  value="regular"
                  checked={enrollmentType === 'regular'}
                  onChange={() => setEnrollmentType('regular')}
                  className="sr-only"
                />
                <div>
                  <span className="font-bold text-xs block">Regular Student</span>
                  <span className={`text-[11px] block mt-0.5 leading-relaxed ${enrollmentType === 'regular' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Standard continuous curriculum, full class syllabus &amp; annual examination track.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setEnrollmentType('supplementary')}
                className={`cursor-pointer flex items-start p-3.5 rounded-2xl border transition ${
                  enrollmentType === 'supplementary'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50/50 text-amber-900 border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                <input
                  type="radio"
                  name="enrollmentType"
                  value="supplementary"
                  checked={enrollmentType === 'supplementary'}
                  onChange={() => setEnrollmentType('supplementary')}
                  className="sr-only"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block">Supplementary Student</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      enrollmentType === 'supplementary' ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-900'
                    }`}>
                      Compartment
                    </span>
                  </div>
                  <span className={`text-[11px] block mt-0.5 leading-relaxed ${enrollmentType === 'supplementary' ? 'text-amber-100' : 'text-amber-800'}`}>
                    Enrolled specifically for supplementary / failed subject exam preparation belonging to previous academic cycle.
                  </span>
                </div>
              </label>
            </div>

            {/* Supplementary Configuration Box */}
            {enrollmentType === 'supplementary' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3.5 animate-fadeIn">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Select Failed / Supplementary Subject(s)</h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      Technically, these supplementary subjects belong to the student's previous academic year.
                      Select the specific subjects this student failed and needs to take supplementary exams for:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {subjects.map((sub) => {
                    const isSelected = supplementarySubjectIds.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSupplementarySubjectIds(supplementarySubjectIds.filter((id) => id !== sub.id));
                          } else {
                            setSupplementarySubjectIds([...supplementarySubjectIds, sub.id]);
                          }
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <span className="truncate mr-1">{sub.name}</span>
                        <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                          {sub.code}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                    Supplementary Exam Details &amp; Board Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={supplementaryNotes}
                    onChange={(e) => setSupplementaryNotes(e.target.value)}
                    placeholder="e.g. BISE 2nd Annual Supplementary 2026, Previous Roll # 43102, Failed in Physics & Maths"
                    className="w-full text-xs font-medium bg-white border border-amber-300/80 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Student Master Personal Information */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Profile &amp; Identity (Permanent Master)</h2>
              <p className="text-xs text-slate-500">Official student biographical records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Student Photo */}
            <div className="flex flex-col items-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden mb-3">
                {photoUrl ? (
                  <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 font-semibold">Passport Photo</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'Uploading...' : 'Attach Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {/* Identity Fields */}
            <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Usman Ali"
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="e.g. Fatima Bibi"
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNIC / B-Form Number
                  </label>
                  <input
                    type="text"
                    value={cnicBform}
                    onChange={(e) => setCnicBform(e.target.value)}
                    placeholder="35202-xxxxxxx-x"
                    className="w-full text-xs font-mono font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+92 321 7654321"
                    className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Street, Area / Colony, City"
                  className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || availableClassSections.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Enrolling Student...' : 'Complete Admission'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
