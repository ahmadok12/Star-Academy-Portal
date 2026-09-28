import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Upload,
  Calendar,
  GraduationCap,
  Layers,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  ClassItem,
  ClassSection,
  Gender,
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
  const [availableClassSections, setAvailableClassSections] = useState<ClassSection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Enrollment fields
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
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

  // Load classes & initialize from prefill
  useEffect(() => {
    const initialize = async () => {
      try {
        const cList = await databaseService.getClasses();
        const activeClasses = cList.filter(c => c.status === 'active');
        setClasses(activeClasses);

        const initialYearId = selectedAcademicYear?.id || academicYears[0]?.id || '';
        setAcademicYearId(initialYearId);

        if (prefilledInquiry) {
          setStudentName(prefilledInquiry.student_name);
          setFatherName(prefilledInquiry.father_name || '');
          setPhone(prefilledInquiry.contact);
          if (prefilledInquiry.interested_class_id) {
            setClassId(prefilledInquiry.interested_class_id);
          } else if (activeClasses[0]) {
            setClassId(activeClasses[0].id);
          }
        } else if (activeClasses[0]) {
          setClassId(activeClasses[0].id);
        }
      } catch (e: any) {
        toast.error('Failed to load classes', e.message);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    availableClassSections.map((cs) => (
                      <option key={cs.section_id} value={cs.section_id}>
                        Section {cs.section?.name || 'Section'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {availableClassSections.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Assign sections to this class under Academic Setup &rarr; Class Sections.
                </p>
              )}
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
