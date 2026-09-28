import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Phone, UserPlus, Trash2, HelpCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { FormDialog } from '../../components/common/FormDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { StudentInquiry, ClassItem, InquiryStatus } from '../../types/database.types';

interface StudentInquiriesPageProps {
  onConvertToAdmission: (inquiry: StudentInquiry) => void;
}

export const StudentInquiriesPage: React.FC<StudentInquiriesPageProps> = ({ onConvertToAdmission }) => {
  const [inquiries, setInquiries] = useState<StudentInquiry[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<StudentInquiry | null>(null);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [contact, setContact] = useState('');
  const [interestedClassId, setInterestedClassId] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [status, setStatus] = useState<InquiryStatus>('New');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<StudentInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [inqList, cList] = await Promise.all([
        databaseService.getStudentInquiries(),
        databaseService.getClasses(),
      ]);
      setInquiries(inqList);
      setClasses(cList);
    } catch (e: any) {
      toast.error('Failed to load inquiries', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingInquiry(null);
    setStudentName('');
    setFatherName('');
    setContact('');
    setInterestedClassId(classes[0]?.id || '');
    setSource('Walk-in');
    setStatus('New');
    setRemarks('');
    setFollowUpDate('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (inq: StudentInquiry) => {
    setEditingInquiry(inq);
    setStudentName(inq.student_name);
    setFatherName(inq.father_name || '');
    setContact(inq.contact);
    setInterestedClassId(inq.interested_class_id || '');
    setSource(inq.source || 'Walk-in');
    setStatus(inq.status);
    setRemarks(inq.remarks || '');
    setFollowUpDate(inq.follow_up_date || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!studentName.trim()) {
      setFormError('Student name is required.');
      return;
    }
    if (!contact.trim()) {
      setFormError('Contact number is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingInquiry) {
        await databaseService.updateStudentInquiry(editingInquiry.id, {
          student_name: studentName.trim(),
          father_name: fatherName.trim() || null,
          contact: contact.trim(),
          interested_class_id: interestedClassId || null,
          source,
          status,
          remarks: remarks.trim() || null,
          follow_up_date: followUpDate || null,
        });
        toast.success('Inquiry Updated', 'Record updated successfully.');
      } else {
        await databaseService.createStudentInquiry({
          date: new Date().toISOString().split('T')[0],
          student_name: studentName.trim(),
          father_name: fatherName.trim() || null,
          contact: contact.trim(),
          interested_class_id: interestedClassId || null,
          source,
          status,
          remarks: remarks.trim() || null,
          follow_up_date: followUpDate || null,
        });
        toast.success('Inquiry Logged', 'New student inquiry registered.');
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteStudentInquiry(deleteTarget.id);
      await loadData();
      toast.success('Deleted', `Inquiry ${deleteTarget.inquiry_no} was removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (st: InquiryStatus) => {
    const config = {
      New: 'bg-blue-50 text-blue-700 border-blue-200',
      Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
      'Follow-up': 'bg-amber-50 text-amber-700 border-amber-200',
      Enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-slate-100 text-slate-600 border-slate-200',
      Lost: 'bg-red-50 text-red-700 border-red-200',
    }[st] || 'bg-slate-100 text-slate-600 border-slate-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config}`}>
        ● {st}
      </span>
    );
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.student_name.toLowerCase().includes(search.toLowerCase()) ||
      (inq.father_name && inq.father_name.toLowerCase().includes(search.toLowerCase())) ||
      inq.inquiry_no.toLowerCase().includes(search.toLowerCase()) ||
      inq.contact.includes(search);
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<StudentInquiry>[] = [
    {
      header: 'Inquiry #',
      accessorKey: 'inquiry_no',
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">{row.inquiry_no}</span>
          <span className="text-[10px] text-slate-400 font-mono">{row.date}</span>
        </div>
      ),
    },
    {
      header: 'Student & Guardian',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.student_name}</span>
          <span className="text-[11px] text-slate-500">
            Father: {row.father_name || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 text-slate-700 font-mono text-xs">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{row.contact}</span>
        </div>
      ),
    },
    {
      header: 'Target Class',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.interested_class?.name || 'Any Class'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Follow-Up Date',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.follow_up_date || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          {row.status !== 'Enrolled' && (
            <button
              onClick={() => onConvertToAdmission(row)}
              title="Convert Inquiry to Student Admission"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg shadow-2xs transition"
              type="button"
            >
              <UserPlus className="w-3 h-3" />
              <span>Admit</span>
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Inquiry"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Inquiry"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Students' },
          { label: 'Inquiries Pipeline' },
        ]}
        title="Student Inquiry Management"
        subtitle="Track prospective admissions, follow-ups, and convert inquiries directly into full admissions without re-entering data."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>New Inquiry</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search inquiries by student, father, inquiry #, or phone..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
          >
            <option value="all">All Inquiries ({inquiries.length})</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Rejected">Rejected</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInquiries}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No student inquiries found matching filters."
      />

      {/* Add / Edit Inquiry Dialog */}
      <FormDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInquiry ? 'Edit Student Inquiry' : 'Register New Student Inquiry'}
        subtitle="Capture prospect details, lead source, and schedule follow-ups."
        icon={HelpCircle}
        badge={editingInquiry ? editingInquiry.inquiry_no : 'New Lead'}
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Saving...' : editingInquiry ? 'Update Inquiry' : 'Save Inquiry'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-700 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Zaid Khan"
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father / Guardian Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Tariq Khan"
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interested Class
              </label>
              <select
                value={interestedClassId}
                onChange={(e) => setInterestedClassId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="">Any / General</option>
                {classes.filter(c => c.status === 'active').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Banner / Billboard">Banner / Billboard</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inquiry Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Rejected">Rejected</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Inquired about pre-engineering session timings and discount criteria..."
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Inquiry Record"
        message={`Are you sure you want to delete inquiry "${deleteTarget?.inquiry_no}" for "${deleteTarget?.student_name}"?`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
