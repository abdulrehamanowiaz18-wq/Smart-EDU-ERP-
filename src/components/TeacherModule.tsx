/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Users, 
  BookOpen, 
  Phone, 
  Mail, 
  Briefcase,
  Image as ImageIcon
} from 'lucide-react';
import { Teacher } from '../types';

interface TeacherModuleProps {
  teachers: Teacher[];
  onAddTeacher: (data: Omit<Teacher, 'id'>) => Promise<any>;
  onEditTeacher: (id: string, data: Partial<Teacher>) => Promise<any>;
  onDeleteTeacher: (id: string) => Promise<boolean>;
  userRole: 'admin' | 'teacher' | 'student';
}

export default function TeacherModule({ 
  teachers, 
  onAddTeacher, 
  onEditTeacher, 
  onDeleteTeacher,
  userRole
}: TeacherModuleProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  // Modals view controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Science & Biology');
  const [subjectsString, setSubjectsString] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Extract unique departments
  const departments = ['All', ...Array.from(new Set(teachers.map(t => t.department)))];

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = departmentFilter === 'All' || teacher.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('Science & Biology');
    setSubjectsString('');
    setAvatarUrl('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setPhone(teacher.phone);
    setDepartment(teacher.department);
    setSubjectsString(teacher.subjects.join(', '));
    setAvatarUrl(teacher.avatarUrl || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !department) {
      setFormError('Please fill in Name, Email contact, and school Department allocation');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const parsedSubjects = subjectsString
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        name,
        email,
        phone,
        department,
        subjects: parsedSubjects,
        avatarUrl
      };

      if (editingTeacher) {
        await onEditTeacher(editingTeacher.id, payload);
      } else {
        await onAddTeacher(payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failure deploying edits. Double check input properties.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Verify delete request: Remove this faculty member and invalidate their active teacher dashboard tokens?')) {
      await onDeleteTeacher(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and control rail bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search academic faculty members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter option */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs font-semibold text-slate-655 bg-transparent focus:outline-none cursor-pointer"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
              ))}
            </select>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Hire Instructor</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Teacher cards visual layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div 
              key={teacher.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between group overflow-hidden"
            >
              {/* Backglow design card */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full z-0 pointer-events-none group-hover:scale-110 transition-transform"></div>

              <div className="space-y-4 z-10 relative">
                {/* Upper line: name and buttons */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt={teacher.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-750 font-bold text-lg flex items-center justify-center shrink-0">
                        {teacher.name.replace("Dr. ", "").replace("Prof. ", "").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-650 transition-colors leading-tight">{teacher.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{teacher.department}</span>
                      </span>
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex bg-slate-100/50 p-1 rounded-lg">
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1 hover:bg-white text-slate-500 hover:text-indigo-700 rounded-md transition-all hover:shadow-xs"
                        title="Edit profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1 hover:bg-white text-slate-400 hover:text-rose-600 rounded-md transition-all hover:shadow-xs"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub details */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone || 'No phone registration'}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100/50 bg-slate-50/50 px-2 py-1.5 rounded-lg flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-450">Demo Credentials:</span>
                    <span className="font-bold text-teal-700">{teacher.name.toLowerCase().replace(/\s+/g, "").split(".")[0] || "teacher"}</span>
                  </div>
                </div>

                {/* Subject tag badges */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject Allocation</span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      teacher.subjects.map(sub => (
                        <span 
                          key={sub}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 border border-slate-205 text-slate-600 flex items-center gap-1"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{sub}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-slate-400">None assigned</span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-450 col-span-full">
            <Users className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
            <span className="font-semibold block">Faculty Board Empty</span>
            <p className="text-xs text-slate-400/80 mt-1">Hire an instructor to begin assigning curriculum classes and timetable slots</p>
          </div>
        )}
      </div>

      {/* Add or Edit teacher registration details popup drawer dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-250 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-650" />
                <span>{editingTeacher ? 'Revise Faculty Details' : 'Onboard New Academic Instructor'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Inputs body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 animate-in fade-induration-150">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg">
                  {formError}
                </div>
              )}

              {/* Avatar upload section inside dialog */}
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-slate-250 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-350" />
                  )}
                </div>
                <div className="flex-1 space-y-1 w-full">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Faculty Profile Image Link</span>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <div className="relative inline-block mt-1">
                    <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-md cursor-pointer hover:bg-indigo-100">
                      Upload local snapshot
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') setAvatarUrl(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Corporate Faculty Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@smartedu-erp.com"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Contact Office Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Department assignment *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Mathematics">Mathematics & Physical Science</option>
                  <option value="Science & Biology">Sciences & Chemistry Lab</option>
                  <option value="Languages">Languages & English Literature</option>
                  <option value="Social Sciences">Social Sciences & History</option>
                  <option value="Administration">Main Administration Board</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Subjects Allocated (comma separated list)</label>
                <input
                  type="text"
                  value={subjectsString}
                  onChange={(e) => setSubjectsString(e.target.value)}
                  placeholder="e.g. Biology, Chemistry, General Science"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">Use commas to allocate multiple subjects for syllabus tasks</span>
              </div>

              {/* Modal footer action */}
              <div className="pt-4 border-t border-slate-150 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-650 hover:bg-indigo-750 font-bold text-xs text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding instructor...' : (editingTeacher ? 'Save Changes' : 'Verify & Hire')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
