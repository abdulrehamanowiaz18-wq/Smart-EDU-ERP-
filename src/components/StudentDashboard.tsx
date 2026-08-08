/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Award, 
  FolderDown, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Download, 
  Eye, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Search, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

import { 
  User, 
  Student, 
  AttendanceRecord, 
  TimetablePeriod, 
  ExamResult, 
  NoteFile, 
  Teacher 
} from '../types';

interface StudentDashboardProps {
  currentUser: User;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  timetablePeriods: TimetablePeriod[];
  examResults: ExamResult[];
  noteFiles: NoteFile[];
  teachers: Teacher[];
  setActiveTab: (tab: string) => void;
}

export default function StudentDashboard({
  currentUser,
  students,
  attendanceRecords,
  timetablePeriods,
  examResults,
  noteFiles,
  teachers,
  setActiveTab
}: StudentDashboardProps) {

  // Match current student profile
  const student = students.find(s => s.name.toLowerCase() === currentUser.name.toLowerCase()) || {
    id: 's-1',
    name: currentUser.name,
    rollNumber: 'R-1001',
    gender: 'Male',
    address: 'Seattle, WA',
    phone: '+1 (555) 234-5678',
    parentName: 'Parent Guardian',
    parentEmail: 'parent@example.com',
    parentPhone: '+1 (555) 987-6543',
    className: currentUser.classAllocated ? currentUser.classAllocated.split('-')[0] : 'Class 10',
    section: currentUser.classAllocated ? currentUser.classAllocated.split('-')[1] || 'A' : 'A'
  };

  const studentClass = student.className; // e.g. "Class 10"
  const studentSection = student.section; // e.g. "A"

  // Selected Day tab for Timetable
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');

  // Search filter for study notes
  const [notesSearch, setNotesSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Preview Note Modal state
  const [previewNote, setPreviewNote] = useState<NoteFile | null>(null);

  // Filter student timetable
  const myTimetable = timetablePeriods.filter(
    p => p.className === studentClass && (p.section === studentSection || !p.section)
  );

  const timetableForDay = myTimetable.filter(p => p.day === selectedDay);

  // Filter student exam results
  const myResults = examResults.filter(
    r => r.studentId === student.id || r.studentName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // Calculate student GPA
  const totalMarksObtained = myResults.reduce((acc, r) => acc + r.marksObtained, 0);
  const totalMaxMarks = myResults.reduce((acc, r) => acc + r.maxMarks, 0);
  const averagePercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
  const averageGP = myResults.length > 0 ? (myResults.reduce((acc, r) => acc + r.gp, 0) / myResults.length) : 0;

  // Filter student attendance history
  const myAttendance = attendanceRecords.filter(
    a => a.studentId === student.id || a.studentName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const lateCount = myAttendance.filter(a => a.status === 'late').length;
  const absentCount = myAttendance.filter(a => a.status === 'absent').length;
  const totalRecordedDays = myAttendance.length;
  const attendancePercentage = totalRecordedDays > 0 
    ? (((presentCount + lateCount * 0.5) / totalRecordedDays) * 100) 
    : 95.0;

  // Filter shared study notes for student's class
  const classNotes = noteFiles.filter(
    n => n.className === studentClass || n.className === `${studentClass}-${studentSection}` || n.className.includes('Class 10')
  );

  const availableSubjects = Array.from(new Set(classNotes.map(n => n.subject)));

  const filteredNotes = classNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                          n.description.toLowerCase().includes(notesSearch.toLowerCase()) ||
                          n.subject.toLowerCase().includes(notesSearch.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
            <div className="w-16 h-16 rounded-2xl bg-sky-600 border-2 border-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-sky-200 uppercase">
                Student Portal • Enrolled Candidate
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentUser.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-100 font-mono">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-bold">
                Roll: {student.rollNumber}
              </span>
              <span>•</span>
              <span className="font-bold">
                {studentClass} ({studentSection})
              </span>
            </div>
          </div>
        </div>

        {/* Quick academic metrics for student */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shrink-0 self-start md:self-auto z-10 w-full sm:w-auto flex justify-between gap-6">
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Attendance</span>
            <span className="text-sm font-black text-emerald-300">{attendancePercentage.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">GPA Score</span>
            <span className="text-sm font-black text-amber-300">
              {myResults.length > 0 ? `${averageGP.toFixed(1)} / 10` : '9.2 / 10'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Class Notes</span>
            <span className="text-sm font-black text-sky-300">{classNotes.length} Ready</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{attendancePercentage.toFixed(1)}%</div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              {presentCount} Days Present
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Average</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{averagePercentage.toFixed(1)}%</div>
            <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-1">
              <Award className="w-3 h-3" />
              {myResults.length} Exams Graded
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Classes</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{myTimetable.length} Periods</div>
            <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {studentClass} Schedule
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Study Resources</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{classNotes.length} PDFs</div>
            <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
              <FolderDown className="w-3 h-3" />
              Vault Ready
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FolderDown className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Section 1: My Timetable Schedule */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <span>My Class Timetable & Schedule</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Daily class periods, assigned teachers, and room numbers for {studentClass}</p>
          </div>

          <button 
            onClick={() => setActiveTab('timetable')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Full Planner</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDay === day
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule Cards List */}
        {timetableForDay.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No scheduled periods for {selectedDay}.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enjoy your free study or laboratory hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {timetableForDay.map((period, index) => (
              <div 
                key={period.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-200 transition-all space-y-2 relative"
              >
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
                    Period {index + 1}
                  </span>
                  <span className="text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {period.startTime} - {period.endTime}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{period.subject}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Instructor: <span className="font-bold">{period.teacherName}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] font-semibold text-slate-500">
                  <span>Room Location</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold font-mono">
                    {period.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Section 2 & 3 (Results + Shared Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Academic Results & Report Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>My Exam Results & Report Card</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Published marks and subject grade points</p>
            </div>

            <button 
              onClick={() => setActiveTab('results')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myResults.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No exam results published for your profile yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myResults.map((result) => {
                const percentage = (result.marksObtained / result.maxMarks) * 100;
                return (
                  <div key={result.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs">{result.subject}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{result.examName}</span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm">{result.marksObtained}</span>
                          <span className="text-slate-400 text-xs">/ {result.maxMarks}</span>
                          <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">
                            {result.grade}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          GP: {result.gp} / 10.0
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shared Notes & Study Material Vault */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-indigo-600" />
                <span>Shared Class Notes & Materials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Faculty slide decks and reference guides for {studentClass}</p>
            </div>

            <button 
              onClick={() => setActiveTab('notes')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Notes Vault</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search and Subject filter controls */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search study material..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {availableSubjects.length > 0 && (
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Subjects</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}
          </div>

          {/* Notes list */}
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              <FolderDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No study material notes match your search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">
                        {note.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{note.fileSize}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-xs truncate">{note.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{note.description}</p>
                    
                    <div className="text-[10px] text-slate-400 font-medium pt-1">
                      Uploaded by <span className="font-bold text-slate-700">{note.uploaderName}</span> ({note.uploaderRole})
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewNote(note)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                    title="Preview study note"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Read</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Attendance Log History Section */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Personal Attendance History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Recorded daily presence logs and teacher remarks</p>
          </div>

          <button 
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myAttendance.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No attendance records logged for your profile yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myAttendance.map((rec) => (
              <div key={rec.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{rec.date}</span>
                  <span className="text-[10px] text-slate-400">{rec.remarks || 'No remarks'}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase flex items-center gap-1 ${
                  rec.status === 'present'
                    ? 'bg-emerald-100 text-emerald-800'
                    : rec.status === 'absent'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                  {rec.status === 'absent' && <XCircle className="w-3 h-3" />}
                  {rec.status === 'late' && <AlertCircle className="w-3 h-3" />}
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Preview Drawer Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase inline-block mb-1">
                  {previewNote.subject} • {previewNote.className}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">{previewNote.title}</h3>
              </div>
              <button 
                onClick={() => setPreviewNote(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <p className="text-slate-700 leading-relaxed">{previewNote.description}</p>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between font-mono">
                <span>Instructor: {previewNote.uploaderName}</span>
                <span>File: {previewNote.fileName} ({previewNote.fileSize})</span>
              </div>
            </div>

            {/* Simulated PDF Reader preview sheet */}
            <div className="h-44 bg-slate-900 text-slate-300 rounded-2xl p-4 flex flex-col justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4" />
                <span className="font-bold">{previewNote.fileName}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed italic">
                "[PDF PREVIEW CONTENT] - High School {previewNote.subject} Course Syllabus. Key concepts, diagrams, formula references, and practice problems attached."
              </p>
              <div className="text-[10px] text-emerald-400 flex justify-between items-center">
                <span>Status: Verified Safe Document</span>
                <span>PDF Format</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <a
                href={previewNote.contentUrl || '#'}
                download={previewNote.fileName}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Resource</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
