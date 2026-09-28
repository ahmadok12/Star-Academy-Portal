import React, { useState, useEffect } from 'react';
import { Building2, Upload, Globe, Mail, Phone, MapPin, Clock, DollarSign, Check, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { AcademySettings } from '../../types/database.types';

interface AcademySettingsPageProps {
  onSettingsUpdated?: (settings: AcademySettings) => void;
}

export const AcademySettingsPage: React.FC<AcademySettingsPageProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<AcademySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form State
  const [academyName, setAcademyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [currency, setCurrency] = useState('PKR');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await databaseService.getAcademySettings();
        setSettings(data);
        setAcademyName(data.academy_name);
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setWebsite(data.website || '');
        setTimezone(data.timezone || 'Asia/Karachi');
        setCurrency(data.currency || 'PKR');
        setLogoUrl(data.logo_url);
      } catch (e: any) {
        toast.error('Failed to load academy settings', e.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    try {
      setIsUploadingLogo(true);
      const url = await databaseService.uploadLogo(file);
      setLogoUrl(url);
      toast.success('Logo Uploaded', 'Academy logo has been saved and updated.');
      if (settings) {
        const updated = { ...settings, logo_url: url };
        setSettings(updated);
        onSettingsUpdated?.(updated);
      }
    } catch (err: any) {
      toast.error('Upload Failed', err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyName.trim()) {
      toast.error('Validation Error', 'Academy Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await databaseService.updateAcademySettings({
        academy_name: academyName.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        timezone,
        currency,
        logo_url: logoUrl,
      });

      setSettings(updated);
      onSettingsUpdated?.(updated);
      toast.success('Settings Saved', 'Academy profile details successfully updated.');
    } catch (err: any) {
      toast.error('Failed to save settings', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading academy settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Settings' },
          { label: 'Academy Profile' },
        ]}
        title="Academy Profile Settings"
        subtitle="Configure institution identity, branding assets, contact details, currency, and local timezone."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card: Logo & Identity */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institution Branding</h2>
              <p className="text-xs text-slate-500">Official academy name and logo asset</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Logo Uploader */}
            <div className="flex flex-col items-center p-5 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden mb-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Academy Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 font-semibold">No Logo</span>
                  </div>
                )}
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-2">
                Stored in Supabase Storage (`academy-assets`)
              </p>
            </div>

            {/* Basic Info Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academy / School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="e.g. Star Academy"
                  className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="PKR"
                      className="w-full text-xs font-mono font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default: PKR</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default: Asia/Karachi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Contact Details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Contact &amp; Location Information</h2>
            <p className="text-xs text-slate-500">Official contact records for students and guardians</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@staracademy.edu.pk"
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 42 35870000"
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-3.5 h-3.5" />
                </span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://staracademy.edu.pk"
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Campus Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Main Boulevard, Lahore, Pakistan"
                  className="w-full text-xs font-medium pl-8 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
