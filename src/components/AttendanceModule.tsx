/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  Calendar, 
  UserCheck, 
  FileCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceModuleProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (className: string, section: string, date: string, records: { studentId: string, studentName: string, status: AttendanceStatus, remarks: string }[]) => Promise<any>;
  userRole: 'admin' | 'teacher' | 'student';
  currentStudentId?: string;
}

export default function AttendanceModule({ 
  students, 
  attendanceRecords, 
  onSaveAttendance,
  userRole,
  currentStudentId
}: AttendanceModuleProps) {

  // Default configuration
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState('2026-06-05'); // Local Time context 2026-06-05
  const [searchQuery, setSearchQuery] = useState('');

  // Daily roster checklist state
  type StudentStatusMap = { [studentId: string]: { status: AttendanceStatus, remarks: string } };
  const [roster, setRoster] = useState<StudentStatusMap>({});
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Enrolled class candidates list
  const activeStudents = students.filter(s => s.className === selectedClass && s.section === selectedSection);
  const filteredStudents = activeStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Setup/load existing roll-call if already recorded
  useEffect(() => {
    const historical = attendanceRecords.filter(
      r => r.className === selectedClass && r.section === selectedSection && r.date === selectedDate
    );

    const initialRoster: StudentStatusMap = {};
    
    // Fill in existing records if any
    activeStudents.forEach(student => {
      const match = historical.find(h => h.studentId === student.id);
      initialRoster[student.id] = {
        status: match ? match.status : 'present', // default to Present if not recorded
        remarks: match && match.remarks ? match.remarks : ''
      };
    });

    setRoster(initialRoster);
    setAlertMessage(null);
  }, [selectedClass, selectedSection, selectedDate, attendanceRecords, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRoster(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRoster(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSave = async () => {
    if (userRole === 'student') return;
    setIsSaving(true);
    setAlertMessage(null);

    const payload = activeStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: roster[student.id]?.status || 'present',
      remarks: roster[student.id]?.remarks || ''
    }));

    try {
      await onSaveAttendance(selectedClass, selectedSection, selectedDate, payload);
      setAlertMessage({ type: 'success', text: `Roster saved successfully. ${payload.filter(p => p.status === 'absent').length} parents notified of absences.` });
      
      // Clear alert after 4 seconds
      setTimeout(() => setAlertMessage(null), 4000);
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message || 'Failure writing records to database.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Student role: compute self cumulative status ratios
  const getStudentStats = () => {
    if (!currentStudentId) return null;
    const selfRecords = attendanceRecords.filter(r => r.studentId === currentStudentId);
    const total = selfRecords.length;
    if (total === 0) return { presentCount: 0, absentCount: 0, lateCount: 0, percent: 100 };
    
    const presentCount = selfRecords.filter(r => r.status === 'present').length;
    const lateCount = selfRecords.filter(r => r.status === 'late').length;
    const absentCount = selfRecords.filter(r => r.status === 'absent').length;
    const percent = Math.round(((presentCount + lateCount * 0.5) / total) * 100);

    return { total, presentCount, absentCount, lateCount, percent };
  };

  const selfStats = getStudentStats();

  return (
    <div className="space-y-6">
      
      {/* CASE A: Student Dashboard roll statistics */}
      {userRole === 'student' && selfStats && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Attendance Report</h3>
              <p className="text-xs text-slate-400">Class terms tracking details</p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-extrabold ${selfStats.percent >= 75 ? 'text-indigo-650' : 'text-rose-600'}`}>
                {selfStats.percent}%
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Percentage</p>
            </div>
          </div>

          {/* Quick bar chart percentages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Total Classes Taken</span>
              <span className="text-xl font-bold text-slate-800">{selfStats.total} sessions</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-bold block uppercase mb-1">Present Status</span>
              <span className="text-xl font-bold text-emerald-800">{selfStats.presentCount} days</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-600 font-bold block uppercase mb-1">Late Arrivals</span>
              <span className="text-xl font-bold text-amber-800">{selfStats.lateCount} days</span>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-600 font-bold block uppercase mb-1">Absent Marks</span>
              <span className="text-xl font-bold text-rose-800">{selfStats.absentCount} days</span>
            </div>
          </div>

          {/* Self timetable audit details list */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">Recent Session Registrations</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {attendanceRecords.filter(r => r.studentId === currentStudentId).map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">{rec.date}</span>
                    {rec.remarks && (
                      <span className="text-xs text-slate-400 pl-3 border-l border-slate-200">"{rec.remarks}"</span>
                    )}
                  </div>
                  <div>
                    {rec.status === 'present' && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg uppercase">Present</span>}
                    {rec.status === 'late' && <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg uppercase">Late</span>}
                    {rec.status === 'absent' && <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-lg uppercase">Absent</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASE B: Teachers & Admins Roll Roster Control Cabin */}
      {userRole !== 'student' && (
        <div className="space-y-6">
          
          {/* Top selection parameters bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Class selector input */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                <span className="text-xs text-slate-400 font-bold uppercase">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs font-bold text-slate-705 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Class 9">Class 9 (Freshman)</option>
                  <option value="Class 10">Class 10 (Sophomore)</option>
                  <option value="Class 11">Class 11 (Junior)</option>
                  <option value="Class 12">Class 12 (Senior)</option>
                </select>
              </div>

              {/* Section Selector */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                <span className="text-xs text-slate-400 font-bold uppercase">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="text-xs font-bold text-slate-705 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="A">Class Sec. A</option>
                  <option value="B">Class Sec. B</option>
                  <option value="C">Class Sec. C</option>
                </select>
              </div>

              {/* Day picker details */}
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-705 bg-transparent focus:outline-none cursor-pointer font-mono"
                />
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find in active Class class list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Alert state popup logs */}
          {alertMessage && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
              alertMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                : 'bg-rose-50 border-rose-250 text-rose-800'
            }`}>
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>{alertMessage.text}</div>
            </div>
          )}

          {/* Interactive Class Pupils Checklist Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Attendance Checklist</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recording roll calls for {selectedClass} - {selectedSection} on {selectedDate}</p>
              </div>
              <span className="text-[11px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-750 px-2.5 py-1 rounded-full uppercase">
                {activeStudents.length} Students Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    <th className="py-3 px-6">Student Block</th>
                    <th className="py-3 px-4">Roll ID</th>
                    <th className="py-3 px-6 text-center">Status Roster Switch</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const studentRoster = roster[student.id] || { status: 'present', remarks: '' };

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-6">
                            <span className="font-semibold text-slate-900 block">{student.name}</span>
                            <span className="text-xs text-slate-400">Parent: {student.parentName}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">
                            {student.rollNumber}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-xl max-w-xs mx-auto">
                              
                              {/* Present */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  studentRoster.status === 'present'
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:bg-slate-200/50'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </button>

                              {/* Late */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  studentRoster.status === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:bg-slate-200/50'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Late</span>
                              </button>

                              {/* Absent */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  studentRoster.status === 'absent'
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:bg-slate-200/50'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>

                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={studentRoster.remarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="e.g. Unwell, medical slip, delayed"
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-550 w-full"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <AlertTriangle className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
                        <span className="font-semibold block">Roster No Candidate</span>
                        <p className="text-xs text-slate-400 mt-1">Check that students have been enrolled in Class Level: '{selectedClass}'</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Attendance checklist submit button bar */}
            {activeStudents.length > 0 && (
              <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-450 flex items-center gap-1.5 font-semibold">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Recording attendance instantly triggers parent notice emails logic.</span>
                </span>
                <button
                  onClick={handleSave}
                  disabled={isSaving || activeStudents.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all px-6 py-2.5 active:scale-95 disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSaving ? 'Synching records...' : 'Finalize Roll Call'}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
