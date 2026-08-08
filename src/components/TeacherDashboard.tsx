/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FolderDown, 
  Award, 
  Plus, 
  ArrowUpRight, 
  FileText,
  UserCheck,
  Building,
  Upload
} from 'lucide-react';

import { 
  User, 
  Teacher, 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  TimetablePeriod, 
  ExamResult, 
  NoteFile 
} from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  teachers: Teacher[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  timetablePeriods: TimetablePeriod[];
  examResults: ExamResult[];
  noteFiles: NoteFile[];
  onSaveAttendance: (className: string, section: string, date: string, records: { studentId: string, studentName: string, status: AttendanceStatus, remarks: string }[]) => Promise<any>;
  onUploadNote: (noteData: Omit<NoteFile, 'id' | 'createdAt'>) => Promise<any>;
  setActiveTab: (tab: string) => void;
}

export default function TeacherDashboard({
  currentUser,
  teachers,
  students,
  attendanceRecords,
  timetablePeriods,
  examResults,
  noteFiles,
  onSaveAttendance,
  onUploadNote,
  setActiveTab
}: TeacherDashboardProps) {

  // Find teacher details
  const currentTeacher = teachers.find(t => t.name.toLowerCase() === currentUser.name.toLowerCase()) || teachers[0];

  // Selected class for quick attendance roll-call
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState('2026-06-05'); // Context local date 2026-06-05
  
  // Quick Attendance Roster State
  type RosterState = { [studentId: string]: { status: AttendanceStatus, remarks: string } };
  const classStudents = students.filter(s => s.className === selectedClass && s.section === selectedSection);

  // Initialize roster state from existing attendance or default to present
  const [roster, setRoster] = useState<RosterState>(() => {
    const map: RosterState = {};
    classStudents.forEach(s => {
      const existing = attendanceRecords.find(
        r => r.studentId === s.id && r.date === selectedDate
      );
      map[s.id] = {
        status: existing ? existing.status : 'present',
        remarks: existing?.remarks || ''
      };
    });
    return map;
  });

  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceNotice, setAttendanceNotice] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Quick Note Upload Modal / Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState(currentTeacher?.subjects?.[0] || 'Biology');
  const [noteClass, setNoteClass] = useState('Class 10');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFileName, setNoteFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Filter today's timetable for this teacher
  const teacherPeriods = timetablePeriods.filter(
    p => p.teacherId === currentTeacher?.id || p.teacherName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // Filter notes uploaded by this teacher
  const teacherNotes = noteFiles.filter(
    n => n.uploadedBy === currentUser.id || n.uploaderName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // Filter exam results relevant to this teacher's subject / students
  const classResults = examResults.filter(
    r => r.className === selectedClass && r.section === selectedSection
  );

  // Handle Attendance Status Toggle
  const handleToggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setRoster(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus
      }
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRoster(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Submit quick attendance
  const handleQuickAttendanceSubmit = async () => {
    setIsSavingAttendance(true);
    setAttendanceNotice(null);
    try {
      const recordsToSave = classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: roster[s.id]?.status || 'present',
        remarks: roster[s.id]?.remarks || ''
      }));

      await onSaveAttendance(selectedClass, selectedSection, selectedDate, recordsToSave);
      setAttendanceNotice({
        type: 'success',
        text: `Attendance saved for ${selectedClass}-${selectedSection} (${selectedDate}). Auto parental notifications triggered.`
      });
      setTimeout(() => setAttendanceNotice(null), 4000);
    } catch (err: any) {
      setAttendanceNotice({
        type: 'error',
        text: err.message || 'Failed to save attendance.'
      });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Submit quick note upload
  const handleQuickNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteFileName) return;
    setIsUploading(true);

    try {
      await onUploadNote({
        title: noteTitle,
        description: noteDescription || 'Class lecture resource and study sheet.',
        subject: noteSubject,
        className: noteClass,
        uploadedBy: currentUser.id,
        uploaderName: currentUser.name,
        uploaderRole: 'teacher',
        fileName: noteFileName.endsWith('.pdf') ? noteFileName : `${noteFileName}.pdf`,
        fileSize: '1.8 MB',
        contentUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
      });

      setShowUploadModal(false);
      setNoteTitle('');
      setNoteDescription('');
      setNoteFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-bl-full pointer-events-none"></div>

        <div className="flex items-center gap-4 z-10">
          {currentUser.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 border-2 border-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-200 uppercase">
                Academic Faculty Workspace
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentUser.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full font-semibold">
                <Building className="w-3.5 h-3.5" />
                {currentTeacher?.department || 'Science & Biology'}
              </span>
              <span>•</span>
              <span className="font-medium">
                Subjects: {currentTeacher?.subjects?.join(', ') || 'Biology, Science'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick statistics for teacher */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shrink-0 self-start md:self-auto z-10 w-full sm:w-auto flex justify-between gap-6">
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Classes Today</span>
            <span className="text-sm font-black text-emerald-300">{teacherPeriods.length} Periods</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Materials Uploaded</span>
            <span className="text-sm font-black text-teal-300">{teacherNotes.length} Files</span>
          </div>
        </div>
      </div>

      {/* Grid: Schedule & Class Roster Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Today's Teaching Schedule */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">My Teaching Schedule & Periods</h3>
            </div>
            <button 
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Full Timetable</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {teacherPeriods.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No scheduled periods found for this teacher in timetable.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the Timetable Scheduler to allocate teaching slots.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teacherPeriods.map((period) => (
                <div 
                  key={period.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all space-y-2 relative group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                      {period.day} • {period.room}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{period.subject}</h4>
                    <p className="text-xs font-semibold text-slate-500">
                      Class: {period.className} (Section {period.section})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Class Roster & Department Summary */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-1 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Class Roster Summary</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Allocated Class</span>
              <div className="text-lg font-black text-emerald-950">Class 10 - Section A</div>
              <p className="text-xs text-emerald-700 font-medium">{classStudents.length} Students Enrolled</p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Shortcuts</span>
              
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Class Study Material</span>
              </button>

              <button 
                onClick={() => setActiveTab('results')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4 text-purple-600" />
                <span>Publish Exam Marks</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Class Attendance Roll Call Widget */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Quick Class Roll Call & Attendance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Mark daily attendance for your allocated class with auto email notifications</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {attendanceNotice && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            attendanceNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{attendanceNotice.text}</span>
          </div>
        )}

        {/* Student Roll Call List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Roll No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Attendance Status</th>
                <th className="p-3">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student) => {
                const currentStatus = roster[student.id]?.status || 'present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-600">{student.rollNumber}</td>
                    <td className="p-3 font-extrabold text-slate-900">{student.name}</td>
                    <td className="p-3">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, 'late')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={roster[student.id]?.remarks || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleQuickAttendanceSubmit}
            disabled={isSavingAttendance}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-97 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSavingAttendance ? 'Synchronizing Roll Call...' : 'Save & Publish Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Shared Study Materials & Class Results Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Materials Vault */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FolderDown className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">My Class Study Materials</h3>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Notes</span>
            </button>
          </div>

          {teacherNotes.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No notes uploaded by you yet.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-2 text-xs font-bold text-emerald-600 underline"
              >
                Upload your first lesson pdf
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {teacherNotes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate">{note.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{note.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{note.className}</span>
                      <span>•</span>
                      <span>{note.fileName}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded shrink-0">
                    {note.fileSize}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Exam Grade Summary */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Class Exam Results Overview</h3>
            </div>
            <button 
              onClick={() => setActiveTab('results')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Gradebook</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {classResults.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No exam marks entered for Class 10-A.</p>
              </div>
            ) : (
              classResults.slice(0, 4).map((res) => (
                <div key={res.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block">{res.studentName}</span>
                    <span className="text-[11px] text-slate-500">{res.subject} • {res.examName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm">{res.marksObtained}/{res.maxMarks}</span>
                    <span className="block text-[10px] font-bold text-purple-600">Grade {res.grade}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Upload Notes Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Upload Class Notes</span>
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickNoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2 Cellular Biology & Genetics"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Target Class</label>
                  <select
                    value={noteClass}
                    onChange={(e) => setNoteClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">File Name (.pdf) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. biology_lecture_unit2.pdf"
                  value={noteFileName}
                  onChange={(e) => setNoteFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Short notes or key takeaways for students..."
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isUploading ? 'Uploading Material...' : 'Publish Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
