import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormDialog } from '../../components/common/FormDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  Staff,
  StaffRole,
  StaffStatus,
  ContractType,
  Gender,
  TeacherSubjectAssignment
} from '../../types/database.types';

export const StaffDirectoryPage: React.FC = () => {
  const toast = useToast();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [staffAssignments, setStaffAssignments] = useState<TeacherSubjectAssignment[]>([]);

  // Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [role, setRole] = useState<StaffRole>('teacher');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Sciences');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState('1990-01-01');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractType, setContractType] = useState<ContractType>('Permanent');
  const [salary, setSalary] = useState<number>(60000);
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [status, setStatus] = useState<StaffStatus>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getStaff();
      setStaffList(data);
    } catch (err: any) {
      toast.error('Failed to load staff list', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    const randomNum = Math.floor(100 + Math.random() * 900);
    setEmployeeId(`STAFF-${new Date().getFullYear()}-${randomNum}`);
    setName('');
    setFatherName('');
    setRole('teacher');
    setDesignation('Teacher');
    setDepartment('Sciences');
    setQualification('');
    setSpecialization('');
    setPhone('');
    setEmail('');
    setCnic('');
    setGender('Male');
    setDob('1992-05-15');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setContractType('Permanent');
    setSalary(70000);
    setAddress('');
    setEmergencyContact('');
    setStatus('active');
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setEmployeeId(staff.employee_id);
    setName(staff.name);
    setFatherName(staff.father_name || '');
    setRole(staff.role);
    setDesignation(staff.designation);
    setDepartment(staff.department || 'General');
    setQualification(staff.qualification || '');
    setSpecialization(staff.specialization || '');
    setPhone(staff.phone);
    setEmail(staff.email || '');
    setCnic(staff.cnic || '');
    setGender(staff.gender);
    setDob(staff.dob || '1990-01-01');
    setJoiningDate(staff.joining_date);
    setContractType(staff.contract_type);
    setSalary(staff.salary);
    setAddress(staff.address || '');
    setEmergencyContact(staff.emergency_contact || '');
    setStatus(staff.status);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenProfile = async (staff: Staff) => {
    setViewingStaff(staff);
    setProfileOpen(true);
    if (staff.role === 'teacher') {
      try {
        const assignments = await databaseService.getTeacherAssignments({ teacherId: staff.id });
        setStaffAssignments(assignments);
      } catch {
        setStaffAssignments([]);
      }
    } else {
      setStaffAssignments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !designation.trim()) {
      setFormError('Please fill in Name, Phone, and Designation.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingStaff) {
        await databaseService.updateStaff(editingStaff.id, {
          name: name.trim(),
          father_name: fatherName.trim() || null,
          role,
          designation: designation.trim(),
          department: department.trim() || null,
          qualification: qualification.trim() || null,
          specialization: specialization.trim() || null,
          phone: phone.trim(),
          email: email.trim() || null,
          cnic: cnic.trim() || null,
          gender,
          dob,
          joining_date: joiningDate,
          contract_type: contractType,
          salary: Number(salary),
          address: address.trim() || null,
          emergency_contact: emergencyContact.trim() || null,
          status,
        });
        toast.success('Staff Updated', `${name} updated successfully.`);
      } else {
        await databaseService.createStaff({
          employee_id: employeeId.trim(),
          name: name.trim(),
          father_name: fatherName.trim() || null,
          role,
          designation: designation.trim(),
          department: department.trim() || null,
          qualification: qualification.trim() || null,
          specialization: specialization.trim() || null,
          phone: phone.trim(),
          email: email.trim() || null,
          cnic: cnic.trim() || null,
          gender,
          dob,
          joining_date: joiningDate,
          contract_type: contractType,
          salary: Number(salary),
          address: address.trim() || null,
          emergency_contact: emergencyContact.trim() || null,
          status,
        });
        toast.success('Staff Registered', `${name} added to staff directory.`);
      }
      setFormOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    try {
      await databaseService.deleteStaff(deletingStaff.id);
      toast.success('Staff Removed', `${deletingStaff.name} has been removed.`);
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.department && s.department.toLowerCase().includes(search.toLowerCase())) ||
      s.designation.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const teacherCount = staffList.filter((s) => s.role === 'teacher').length;
  const adminCount = staffList.filter((s) => s.role !== 'teacher').length;
  const activeCount = staffList.filter((s) => s.status === 'active').length;

  const renderStaffStatus = (st: StaffStatus) => {
    if (st === 'active' || st === 'inactive') {
      return <StatusBadge status={st} />;
    }
    if (st === 'on_leave') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          On Leave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
        Terminated
      </span>
    );
  };

  const columns: Column<Staff>[] = [
    {
      header: 'Staff Member',
      cell: (item: Staff) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0">
            {item.photo_url ? (
              <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              item.name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{item.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {item.employee_id}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{item.designation}</span>
              {item.department && (
                <>
                  <span>•</span>
                  <span>{item.department}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role & Type',
      cell: (item: Staff) => (
        <div>
          <span
            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
              item.role === 'teacher'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : item.role === 'admin' || item.role === 'principal'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {item.role}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.contract_type}</p>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (item: Staff) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{item.phone}</span>
          </div>
          {item.email && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{item.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Qualification',
      cell: (item: Staff) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{item.qualification || '—'}</p>
          <p className="text-slate-400 text-[11px] truncate max-w-[140px]">{item.specialization || ''}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item: Staff) => renderStaffStatus(item.status),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: Staff) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => handleOpenProfile(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            title="View Profile & Assignments"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit Staff Member"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingStaff(item);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Remove Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Staff & Teachers' },
          { label: 'Staff Directory' },
        ]}
        title="Staff & Teacher Administration"
        subtitle="Manage faculty, instructors, administrative personnel, and their professional profiles."
        action={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Teachers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{teacherCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Subject lecturers &amp; instructors</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Administrative Staff</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{adminCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Admin, finance, support</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Duty</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Total active on payroll</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, ID, phone, department..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Roles</option>
            <option value="teacher">Teachers / Faculty</option>
            <option value="admin">Administrators</option>
            <option value="accountant">Accountants / Finance</option>
            <option value="principal">Principals / Heads</option>
            <option value="clerk">Clerks / Front Desk</option>
            <option value="support">Support Personnel</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No staff members found matching the selected criteria."
      />

      {/* Add / Edit Staff Modal */}
      <FormDialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Register New Staff Member'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Prof. Tariq Mahmood"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father's Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's name"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff Role <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="teacher">Teacher / Faculty</option>
                <option value="admin">Administrator</option>
                <option value="accountant">Accountant / Finance</option>
                <option value="principal">Principal</option>
                <option value="clerk">Clerk / Front Desk</option>
                <option value="librarian">Librarian</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                placeholder="e.g. Senior Mathematics Lecturer"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Mathematics, Sciences, Admin"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="0300-1234567"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@staracademy.edu.pk"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNIC Number
              </label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35202-xxxxxxx-x"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highest Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc Mathematics, Ph.D"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization / Major
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Pure Mathematics, Organic Chemistry"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contract Type
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Permanent">Permanent</option>
                <option value="Visiting / Contract">Visiting / Contract</option>
                <option value="Probation">Probation</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Salary (PKR)
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                min="0"
                step="1000"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
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
              placeholder="Full home address"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Brother - 0300-9876543"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingStaff ? 'Update Staff Member' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </FormDialog>

      {/* Profile & Assignment View Dialog */}
      {viewingStaff && (
        <FormDialog
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          title={`Staff Profile: ${viewingStaff.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-800">
                {viewingStaff.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">{viewingStaff.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {viewingStaff.employee_id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewingStaff.designation} • {viewingStaff.department || 'General'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {renderStaffStatus(viewingStaff.status)}
                  <span className="text-[11px] text-slate-500 font-medium">
                    Joined {new Date(viewingStaff.joining_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  Academic &amp; Professional
                </h4>
                <div>
                  <span className="text-slate-400">Qualification:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.qualification || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Specialization:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.specialization || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Contract Type:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.contract_type}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Contact &amp; Identification
                </h4>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">CNIC:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.cnic || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Address:</span>{' '}
                  <span className="font-medium text-slate-700">{viewingStaff.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Teaching Assignments Section if teacher */}
            {viewingStaff.role === 'teacher' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Assigned Teaching Slots &amp; Classes
                </h4>

                {staffAssignments.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                    No active subject assignments found for this teacher.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {staffAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">
                            {a.subject?.name || 'Subject'}
                          </span>
                          {a.is_class_teacher && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                              Class Teacher
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Class: {a.class?.name} • Section: {a.section?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Year: {a.academic_year?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </FormDialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${deletingStaff?.name}? This action cannot be undone.`}
        confirmText="Confirm Remove"
        type="danger"
      />
    </div>
  );
};
