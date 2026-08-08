/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  X, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  ChevronRight,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { Student } from '../types';

interface StudentModuleProps {
  students: Student[];
  onAddStudent: (data: Omit<Student, 'id'>) => Promise<any>;
  onEditStudent: (id: string, data: Partial<Student>) => Promise<any>;
  onDeleteStudent: (id: string) => Promise<boolean>;
  userRole: 'admin' | 'teacher' | 'student';
}

export default function StudentModule({ 
  students, 
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent,
  userRole
}: StudentModuleProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  
  // Modals view controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Filtering list
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = classFilter === 'All' || student.className === classFilter;
    const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;

    return matchesSearch && matchesClass && matchesSection;
  });

  // Extract unique classes
  const classesList = ['All', ...Array.from(new Set(students.map(s => s.className)))];
  const sectionsList = ['All', ...Array.from(new Set(students.map(s => s.section)))];

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setRollNumber(`R-${1000 + students.length + 1}`);
    setGender('Male');
    setAddress('');
    setPhone('');
    setParentName('');
    setParentEmail('');
    setParentPhone('');
    setClassName('Class 10');
    setSection('A');
    setAvatarUrl('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details modal
    setEditingStudent(student);
    setName(student.name);
    setRollNumber(student.rollNumber);
    setGender(student.gender);
    setAddress(student.address);
    setPhone(student.phone);
    setParentName(student.parentName);
    setParentEmail(student.parentEmail);
    setParentPhone(student.parentPhone);
    setClassName(student.className);
    setSection(student.section);
    setAvatarUrl(student.avatarUrl || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber || !className) {
      setFormError('Please fill in all core school fields (Name, Roll, Class)');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name,
        rollNumber,
        gender,
        address,
        phone,
        parentName,
        parentEmail,
        parentPhone,
        className,
        section,
        avatarUrl
      };

      if (editingStudent) {
        await onEditStudent(editingStudent.id, payload);
      } else {
        await onAddStudent(payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Verification or persistence failure. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you absolutely sure you want to permanently delete this student record? This automatically triggers automated status corrections.')) {
      await onDeleteStudent(id);
      if (selectedStudentDetail?.id === id) {
        setSelectedStudentDetail(null);
      }
    }
  };

  // Mock download student CSV spreadsheet
  const handleCSVExport = () => {
    const headers = 'ID,Name,Roll Number,Gender,Address,Phone,Parent,Parent Email,Class,Section\n';
    const rows = filteredStudents.map(s => 
      `"${s.id}","${s.name}","${s.rollNumber}","${s.gender}","${s.address}","${s.phone}","${s.parentName}","${s.parentEmail}","${s.className}","${s.section}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `smartedu_student_roster_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Module Controls bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student directories by name, roll, parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs font-semibold text-slate-650 bg-transparent focus:outline-none cursor-pointer"
            >
              <optgroup label="Select Class">
                {classesList.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Section filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="text-xs font-semibold text-slate-650 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All">All Sections</option>
              {sectionsList.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>Sec {s}</option>
              ))}
            </select>
          </div>

          {/* Export roster and adding buttons */}
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all hover:text-slate-900"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary students record list and detail split-pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table panel */}
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${selectedStudentDetail ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  <th className="py-4 px-5">Student Information</th>
                  <th className="py-4 px-4">Roll Number</th>
                  <th className="py-4 px-4">Class Level</th>
                  <th className="py-4 px-4">Parent / Guardian</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudentDetail(student)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedStudentDetail?.id === student.id ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 shrink-0">
                              {student.name.slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-900 block">{student.name}</span>
                            <span className="text-xs text-slate-400 uppercase font-mono font-semibold">{student.gender}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {student.className} - {student.section}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-slate-700 font-medium block">{student.parentName}</span>
                          <span className="text-xs text-slate-400">{student.parentEmail}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentDetail(student)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <ChevronRight className="w-4.5 h-4.5" />
                          </button>
                          {userRole === 'admin' && (
                            <>
                              <button
                                onClick={(e) => handleOpenEdit(student, e)}
                                className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 rounded-lg transition-colors"
                                title="Edit Record"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(student.id, e)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <GraduationCap className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
                      <span className="font-semibold block">No Students Found</span>
                      <p className="text-xs mt-1 text-slate-400/80">Adjust filters or enroll a new pupil to populate the list</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected student deep drawer info panel */}
        {selectedStudentDetail && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative space-y-6 animate-in fade-in-50 duration-200 slide-in-from-right-10">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Profile banner */}
            <div className="text-center pb-4 border-b border-slate-100">
              {selectedStudentDetail.avatarUrl ? (
                <img 
                  src={selectedStudentDetail.avatarUrl} 
                  alt={selectedStudentDetail.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white ring-2 ring-indigo-600/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-750 font-bold text-2xl flex items-center justify-center mx-auto mb-3 border-2 border-white ring-2 ring-indigo-600/10">
                  {selectedStudentDetail.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{selectedStudentDetail.name}</h3>
              <p className="text-xs uppercase font-semibold font-mono tracking-wider text-indigo-600 mt-1">
                Roll No: {selectedStudentDetail.rollNumber}
              </p>
            </div>

            {/* Academy Segment details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Assigned Class</span>
                  <span className="text-sm font-bold text-slate-800">{selectedStudentDetail.className}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Section Block</span>
                  <span className="text-sm font-bold text-slate-800">Section {selectedStudentDetail.section}</span>
                </div>
              </div>
            </div>

            {/* Student metadata info */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Details</h4>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span>{selectedStudentDetail.gender}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <span>{selectedStudentDetail.phone || 'No phone set'}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mt-0.5 shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <span>{selectedStudentDetail.address || 'No physical address records'}</span>
              </div>
            </div>

            {/* Parent contact information parameters */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Parental Liaison</span>
              </h4>
              <div className="text-slate-800 text-sm">
                <span className="font-semibold">{selectedStudentDetail.parentName}</span>
                <p className="text-slate-450 text-xs mt-0.5">Primary Relationship Holder</p>
              </div>
              <div className="space-y-1.5 pt-1.5 border-t border-indigo-150/40 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-indigo-500" />
                  <span>{selectedStudentDetail.parentEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-indigo-500" />
                  <span>{selectedStudentDetail.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* Student Login Credentials */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-650" />
                <span>Student Login Credentials</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Access the campus portal with these details:
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-450">Username:</span>
                  <span className="font-bold text-indigo-705 bg-indigo-50/50 px-1.5 py-0.5 rounded">{selectedStudentDetail.name.toLowerCase().replace(/\s+/g, "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Password:</span>
                  <span className="font-semibold text-slate-600">any</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Enroll or Edit student registration popup dialog modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-650" />
                <span>{editingStudent ? 'Edit Student Profile' : 'Enroll New Campus Student'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content forms */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              {/* SECTION A: STUDENT CORE */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sec. A: Academic Profile</h4>
                
                {/* Image upload section in dialog */}
                <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Student Profile Picture Url</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/photo-..." 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono mb-2"
                    />
                    <div className="relative inline-block">
                      <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md font-bold cursor-pointer hover:bg-indigo-100 inline-block transition-colors">
                        Upload custom file
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. SYED HUSSAIN"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Roll Registration Number *</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. R-1011"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Class Level *</label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    >
                      <option value="Class 9">Class 9 (Freshman)</option>
                      <option value="Class 10">Class 10 (Sophomore)</option>
                      <option value="Class 11">Class 11 (Junior)</option>
                      <option value="Class 12">Class 12 (Senior)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Section Allocations *</label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Gender *</label>
                    <div className="flex gap-4 mt-2">
                      {['Male', 'Female', 'Other'].map(g => (
                        <label key={g} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="genderRadio" 
                            value={g} 
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="accent-indigo-650"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Student Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Physical Residential Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full physical residential address..."
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* SECTION B: PARENT META */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-4">Sec. B: Parent/Guardian Liaison Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Richard Carter"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Parent Email *</label>
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="e.g. parent@example.com"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Parent Phone *</label>
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom buttons actions bar */}
              <div className="pt-6 border-t border-slate-150 flex justify-end gap-3 shrink-0">
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
                  {isSubmitting ? 'Saving changes...' : (editingStudent ? 'Update Details' : 'Verify & Enroll')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
