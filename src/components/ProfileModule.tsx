/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  BookOpen, 
  Shield, 
  Image as ImageIcon,
  Key, 
  Compass, 
  Award, 
  MapPin, 
  X,
  Calendar,
  Save,
  CheckCircle,
  FileText,
  UploadCloud,
  Layers,
  CreditCard
} from 'lucide-react';
import { User, Student, Teacher, StudentFee } from '../types';

interface ProfileModuleProps {
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  appUrl?: string;
  onUpdateCurrentUser: (updatedUser: User, extraPayload: any) => Promise<any>;
}

export default function ProfileModule({ 
  currentUser, 
  students, 
  teachers, 
  onUpdateCurrentUser 
}: ProfileModuleProps) {
  
  // Find linked student/teacher info if applicable
  const linkedStudent = currentUser.role === 'student' 
    ? students.find(s => s.name.toLowerCase() === currentUser.name.toLowerCase() || `s-${s.id}` === currentUser.id || s.rollNumber === (currentUser as any).rollNumber) 
    : null;

  const linkedTeacher = currentUser.role === 'teacher' 
    ? teachers.find(t => t.name.toLowerCase() === currentUser.name.toLowerCase() || `t-${t.id}` === currentUser.id) 
    : null;

  // Fee payment states & handlers
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser.role === 'student' && linkedStudent) {
      fetchFees();
    }
  }, [currentUser, linkedStudent]);

  const fetchFees = async () => {
    if (!linkedStudent) return;
    setIsLoadingFees(true);
    try {
      const res = await fetch(`/api/students/${linkedStudent.id}/fees`);
      if (res.ok) {
        const data = await res.json();
        setFees(data);
      }
    } catch (err) {
      console.error("Error fetching student fees:", err);
    } finally {
      setIsLoadingFees(false);
    }
  };

  const handlePayFee = async (feeId: string) => {
    if (!linkedStudent) return;
    setPayingFeeId(feeId);
    setPaymentSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/students/${linkedStudent.id}/pay-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeId, paymentMethod: selectedPaymentMethod })
      });
      if (!res.ok) {
        throw new Error('Fee payment processing failed. Please try again.');
      }
      const data = await res.json();
      if (data.success) {
        setPaymentSuccessMsg(`Deposit successful! $${data.fee.amount} paid for ${data.fee.feeName}. Transaction ID: ${data.fee.transactionId}`);
        fetchFees(); // refresh fee collection
        setTimeout(() => setPaymentSuccessMsg(''), 8000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing payment.');
    } finally {
      setPayingFeeId(null);
    }
  };


  // Form states initialized derived from loggedIn profile
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  // Extra fields for students
  const [rollNumber, setRollNumber] = useState(linkedStudent?.rollNumber || 'R-1001');
  const [phone, setPhone] = useState(linkedStudent?.phone || linkedTeacher?.phone || '+1 (555) 000-0000');
  const [gender, setGender] = useState(linkedStudent?.gender || 'Male');
  const [address, setAddress] = useState(linkedStudent?.address || 'K.N.S Campus, Bangalore');
  const [parentName, setParentName] = useState(linkedStudent?.parentName || 'Richard Carter');
  const [parentEmail, setParentEmail] = useState(linkedStudent?.parentEmail || 'parent@knsit.edu.in');
  const [parentPhone, setParentPhone] = useState(linkedStudent?.parentPhone || '+1 (555) 987-6543');
  
  // Extra fields for teachers
  const [department, setDepartment] = useState(linkedTeacher?.department || currentUser.subjectSpecialty || 'General Studies');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample cool professional preset avatar placeholders
  const presetAvatars = [
    { name: 'Modern Corporate M', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
    { name: 'Modern Professional F', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { name: 'Creative Designer F', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { name: 'Creative Tech M', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Tech Engineer F', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Creative Writer F', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80' }
  ];

  // FileReader helper for real-world custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image file is too large! Please limit size to 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error building image format payload.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const extraPayload: any = {
        phone,
        address,
        rollNumber,
        department,
        parentName,
        parentEmail,
        parentPhone
      };

      const updatedUser: User = {
        ...currentUser,
        name,
        email,
        avatarUrl,
        subjectSpecialty: currentUser.role === 'teacher' ? department : currentUser.subjectSpecialty
      };

      await onUpdateCurrentUser(updatedUser, extraPayload);
      setSuccessMsg('Your security profile has been successfully saved to servers!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failure updating profile values.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSystemRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Principal Administrator';
      case 'teacher': return 'Senior Faculty Board Member';
      case 'student': return 'Enrolled Campus Student';
      default: return role;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="profile-module-root">
      
      {/* Header card with generic stats */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6 relative overflow-hidden" id="profile-summary-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/10 rounded-full blur-xl pointer-events-none"></div>
        
        {/* Profile picture display and preset select */}
        <div className="relative group shrink-0" id="avatar-container">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-100 flex items-center justify-center bg-slate-50 relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-slate-300" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-[10px] text-white font-extrabold flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Modify</span>
            </span>
          </div>
        </div>

        <div className="text-center md:text-left space-y-1.5 flex-1 select-none">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{name || 'Unnamed Faculty'}</h3>
            <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
              {getSystemRoleName(currentUser.role)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 justify-center md:justify-start text-xs text-slate-500 font-medium font-mono">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{email || 'no-email@knsit.edu.in'}</span>
            </span>
            {currentUser.role !== 'admin' && (
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.role === 'student' ? (linkedStudent?.className ? `${linkedStudent.className}-${linkedStudent.section}` : 'Class 10-A') : department}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>UID: {currentUser.id.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-805 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-200" id="profile-success-alert">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-805 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-200" id="profile-error-alert">
          <X className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor & Profile settings layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="profile-editor-layout">
        
        {/* Left column: Profile Avatars preset list & Upload panel */}
        <div className="space-y-6 lg:col-span-1" id="avatar-presets-card">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Profile Photo Options</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Choose a pre-styled modern avatar or upload a custom snapshot from your device.</p>
            </div>

            {/* Drag & drop or Manual image select form */}
            <div className="border-2 border-dashed border-slate-205 py-6 px-4 rounded-xl hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center text-center relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="profile-file-uploader"
              />
              <UploadCloud className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-slate-700">Upload Campus Avatar</span>
              <p className="text-[9px] text-slate-400 mt-1">PNG, JPG, or WEBP. Max size 2MB</p>
            </div>

            {/* Manual Text input URL helper if they want to copy/paste directly */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Or Paste Direct Image URL</label>
              <input 
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50/20 rounded-lg text-xs font-mono placeholder:text-slate-400/70"
              />
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Preset Avatars:</span>
              <div className="grid grid-cols-6 gap-2">
                {presetAvatars.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border transition-all hover:scale-105 active:scale-95 ${avatarUrl === preset.url ? 'ring-2 ring-indigo-650 border-white' : 'border-slate-150'}`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Form fields details cards based on role */}
        <div className="lg:col-span-2" id="profile-fields-card">
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-6">
            
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Roster Information Details</span>
              </h4>
              <span className="text-[10px] bg-slate-50 text-slate-500 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                ROLE: {currentUser.role.toUpperCase()}
              </span>
            </div>

            {/* Shared Master Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Full Legal Name *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Corporate / Personal Email *</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* Principal Admin Custom Specific Info */}
            {currentUser.role === 'admin' && (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex gap-2 items-center text-xs font-bold text-indigo-750">
                  <Shield className="w-4 h-4" />
                  <span>Administrative Control Scope</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  As the <b>Principal (Dr. Sasi Kumar)</b> of K.N.S INSTITUTE OF TECHNOLOGY, you hold full structural privileges on this SmartEdu ERP tenant. You have authorization to access SaaS subscriptions, view overall enrollment analytics, hire academic faculty members, admit students, and review auto-generated SMTP email dispatches for regulatory compliance logs.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Scope Privileges:</span>
                    <span className="font-bold">Superuser Root Admin</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Institutional Domain:</span>
                    <span>knsit.edu.in</span>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Specific Campus Info */}
            {currentUser.role === 'teacher' && (
              <div className="space-y-4">
                <div className="px-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Faculty Academic Assignments</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Specialized Faculty Department</label>
                    <input 
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Faculty Mobile Phone</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                {linkedTeacher && (
                  <div className="bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-150 text-xs">
                    <span className="font-bold text-emerald-800 block mb-1">Assigned Lecture Subjects:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {linkedTeacher.subjects.map((sub, sIdx) => (
                        <span key={sIdx} className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Student Specific Campus Info */}
            {currentUser.role === 'student' && (
              <div className="space-y-4">
                <div className="px-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Student Academic & Parental Guarding</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Campus Roll ID *</label>
                    <input 
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 bg-slate-50/50 rounded-lg text-xs text-slate-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Student Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Student Phone</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Residential Address *</label>
                  <input 
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/55 rounded-2xl border border-slate-150">
                  <div className="sm:col-span-3 pb-1 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase uppercase">Registered Parental / Guardian Attributes</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Guardian Name</label>
                    <input 
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Guardian Email</label>
                    <input 
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Guardian Phone</label>
                    <input 
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form footer actions */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-black rounded-lg inline-flex items-center gap-2 transition-all shadow-md active:scale-97 disabled:opacity-55 cursor-pointer"
                id="profile-save-button"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Synchronizing Profiles...' : 'Authorize & Save Profile'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Student Specific Fee Payment Section */}
      {currentUser.role === 'student' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6" id="student-fees-card">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Student Fee Payment Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                View your outstanding academic term dues, complete secure payments, and obtain transaction records.
              </p>
            </div>
            {fees.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-right">
                <span className="text-[10px] text-indigo-500 font-bold block uppercase tracking-wider">Total Dues Pending</span>
                <span className="text-lg font-black text-indigo-950 font-mono">
                  ${fees.filter(f => f.status !== 'paid').reduce((total, f) => total + f.amount, 0)}
                </span>
              </div>
            )}
          </div>

          {paymentSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-805 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-200" id="fee-success-alert">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{paymentSuccessMsg}</span>
            </div>
          )}

          {isLoadingFees ? (
            <div className="py-12 text-center text-slate-450 text-xs font-medium font-mono">
              Loading academic fee records...
            </div>
          ) : fees.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 border border-slate-150 rounded-2xl">
              <p className="text-xs text-slate-450 font-medium leading-relaxed">
                No fee records assigned to this student profile yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/85 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-550 font-bold border-b border-slate-200">
                      <th className="p-4">Fee Details</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Transaction Details</th>
                      <th className="p-4 text-right">Payment Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{fee.feeName}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {fee.id.toUpperCase()}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-550 font-medium">
                          {fee.dueDate}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">
                          ${fee.amount}
                        </td>
                        <td className="p-4">
                          {fee.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-505"></span>
                              Deposited
                            </span>
                          ) : fee.status === 'overdue' ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-150 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-505"></span>
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-150 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-505"></span>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-550 leading-relaxed">
                          {fee.status === 'paid' ? (
                            <div>
                              <span className="block text-slate-800"><span className="text-[9px] font-bold text-slate-400 uppercase">Method:</span> {fee.paymentMethod}</span>
                              <span className="block text-indigo-650 font-bold"><span className="text-[9px] font-bold text-slate-400 uppercase">Ref:</span> {fee.transactionId}</span>
                              <span className="block text-slate-400 text-[9px]">{new Date(fee.paidAt!).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-slate-404 italic">No transaction yet</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {fee.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-3 py-1.5 rounded-xl">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Paid & Logged</span>
                            </span>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                              {/* Payment Gateway Selector */}
                              <select
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                disabled={payingFeeId !== null}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-slate-50 font-medium"
                              >
                                <option value="UPI">UPI (GooglePay / PhonePe)</option>
                                <option value="NetBanking">Net Banking</option>
                                <option value="Card">Visa / MasterCard</option>
                                <option value="Wallet">Digital Wallet</option>
                              </select>
                              <button
                                type="button"
                                disabled={payingFeeId !== null}
                                onClick={() => handlePayFee(fee.id)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-lg transition-colors cursor-pointer active:scale-97 disabled:opacity-50"
                              >
                                {payingFeeId === fee.id ? 'Depositing...' : 'Pay Fee'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment disclaimer info */}
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 shrink-0">Secured Gateway Protection:</span>
                <span>
                  Payments are processed on simulated PCI-DSS compliant sandbox channels. Academic dispatches and receipt confirmation logs are immediately delivered to your verified parent email for fiscal audits.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
