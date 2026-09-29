import React, { useState } from 'react';
import { LogIn, Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@staracademy.edu.pk');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Invalid credentials');
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@staracademy.edu.pk');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#ECEEF2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-modal border border-slate-200/90 p-8 animate-modal-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#11141A] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md mb-3">
            ★
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Star Academy ERP</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Academy Management System — Foundation
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/70 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@staracademy.edu.pk"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In as Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5"
          >
            <span>Fill Admin Demo Credentials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Role-Based Access Protected</span>
          </div>
        </div>

        {/* Mobile Client Portals Access Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Separate Mobile Portals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="?app=teacher"
              className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/60 transition"
            >
              Teacher App
            </a>
            <a
              href="?app=student"
              className="text-[11px] font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition"
            >
              Student App
            </a>
            <a
              href="?app=parent"
              className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200/60 transition"
            >
              Parent App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
