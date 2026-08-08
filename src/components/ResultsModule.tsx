/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Plus, 
  X, 
  Search, 
  TrendingUp, 
  ChevronRight, 
  User, 
  ArrowUpRight 
} from 'lucide-react';
import { ExamResult, Student } from '../types';

interface ResultsModuleProps {
  results: ExamResult[];
  students: Student[];
  onAddResult: (data: Omit<ExamResult, 'id' | 'grade' | 'gp'>) => Promise<any>;
  userRole: 'admin' | 'teacher' | 'student';
  currentStudentId?: string;
}

export default function ResultsModule({ 
  results, 
  students, 
  onAddResult,
  userRole,
  currentStudentId
}: ResultsModuleProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    userRole === 'student' && currentStudentId ? currentStudentId : (students[0]?.id || null)
  );

  // New Result popup controller
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states inputs
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [examName, setExamName] = useState('Mid-Term Examination');
  const [subject, setSubject] = useState('Biology');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Extract selected student results
  const currentStudentResults = results.filter(r => r.studentId === selectedStudentId);
  const currentStudentRef = students.find(s => s.id === selectedStudentId);

  // Calculate Cumulative GPA (assuming GPA out of 10 scale point index)
  const calculateGPA = (studentResults: ExamResult[]) => {
    if (studentResults.length === 0) return 0.0;
    const sum = studentResults.reduce((acc, curr) => acc + curr.gp, 0);
    return Number((sum / studentResults.length).toFixed(2));
  };

  const currentGPA = calculateGPA(currentStudentResults);

  // Filter students index list based on keyword matches
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !subject || !marksObtained) {
      setFormError('Please select Student, Subject, and insert Marks obtained');
      return;
    }

    const marksNum = Number(marksObtained);
    const maxNum = Number(maxMarks);

    if (isNaN(marksNum) || isNaN(maxNum) || marksNum < 0 || marksNum > maxNum) {
      setFormError(`Marks obtained must be a positive number up to maximum value of (${maxNum})`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const matchingStudent = students.find(s => s.id === targetStudentId);

    try {
      await onAddResult({
        studentId: targetStudentId,
        studentName: matchingStudent ? matchingStudent.name : "Student",
        className: matchingStudent ? matchingStudent.className : "Class 10",
        section: matchingStudent ? matchingStudent.section : "A",
        examName,
        subject,
        marksObtained: marksNum,
        maxMarks: maxNum
      });

      // Clear states
      setMarksObtained('');
      setIsFormOpen(false);
      // Auto-focus selected student to the freshly uploaded mark
      setSelectedStudentId(targetStudentId);
    } catch (err: any) {
      setFormError(err.message || 'Failure deploying grades parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CASE A: ADMINS AND TEACHERS GRADE BOOK GRID PANELS */}
      {userRole !== 'student' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Student Directory selection list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Grading Book directory</h3>
                <p className="text-[11px] text-slate-400">Choose student profile to view report cards</p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="p-1.5 hover:bg-indigo-50 text-indigo-650 rounded-lg flex items-center justify-center border border-indigo-100 transition-colors"
                title="Input course grade marks"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Quick Filter student query bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find pupil by name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-550 focus:bg-white transition-colors"
              />
            </div>

            {/* Student selections list container */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const studentGPA = calculateGPA(results.filter(r => r.studentId === student.id));

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedStudentId === student.id
                          ? 'bg-black border-black text-white shadow-md shadow-slate-950/20'
                          : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block truncate max-w-[150px]">{student.name}</span>
                        <span className={`text-[10px] font-semibold mt-0.5 block ${selectedStudentId === student.id ? 'text-slate-300' : 'text-slate-400'}`}>
                          {student.rollNumber} • {student.className}-{student.section}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-extrabold ${selectedStudentId === student.id ? 'text-white' : 'text-black'}`}>
                          {studentGPA > 0 ? `GPA ${studentGPA}` : 'No mark'}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs italic">
                  No matching student records found
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive report sheet details of chosen student */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
            {currentStudentRef ? (
              <>
                {/* Header overview banner for chosen pupil */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-sidebar-divider">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      Report Card : {currentStudentRef.name}
                    </h3>
                    <p className="text-xs text-slate-405 mt-1">
                      Roll Number: <span className="font-mono font-bold">{currentStudentRef.rollNumber}</span> • Level: <span className="font-bold">{currentStudentRef.className}-{currentStudentRef.section}</span>
                    </p>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 animate-pulse-none" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Term Cumulative GPA</span>
                      <span className="text-lg font-black text-indigo-700">{currentGPA > 0 ? `${currentGPA} scale pb-4` : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Scorecards breakdown list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Course-wise Breakdown Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStudentResults.length > 0 ? (
                      currentStudentResults.map(res => (
                        <div 
                          key={res.id}
                          className="p-4 rounded-xl border border-slate-205 bg-slate-50 flex items-start justify-between hover:shadow-xs transition-shadow"
                        >
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-500 uppercase tracking-wide">
                              <BookOpen className="w-2.5 h-2.5 text-indigo-500" />
                              <span>{res.subject}</span>
                            </span>
                            <h5 className="font-bold text-slate-800 text-xs truncate max-w-[170px]">{res.examName}</h5>
                            <span className="text-[10px] text-slate-400 block font-medium">Marks Obtained: {res.marksObtained} / {res.maxMarks}</span>
                          </div>

                          <div className="text-center bg-white border border-slate-200 p-2 rounded-lg shrink-0 w-11 h-12 flex flex-col justify-center">
                            <span className="text-sm font-black text-indigo-650 font-mono block leading-none mb-0.5">{res.grade}</span>
                            <span className="text-[8px] text-slate-400 font-bold block leading-none font-mono">GP {res.gp}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-slate-400">
                        <Award className="w-10 h-10 stroke-1 mx-auto mb-2.5 text-slate-350" />
                        <span className="font-semibold block text-sm">No Results Catalogued</span>
                        <p className="text-xs mt-0.5">Log mid or end-term marks for this pupil by clicking the scheduling button (+) at the left side.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytics performance advisory indicator */}
                {currentGPA > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-750">
                    <TrendingUp className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Academic Advisor Commentary</span>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {currentGPA >= 9.0 
                          ? `${currentStudentRef.name} has outstanding academic focus. High recommendations to apply for academic honors or scholar tier student clubs next semester.` 
                          : `${currentStudentRef.name} is performing consistently around high average milestones. Maintaining Biology and Mathematics trends will guarantee high placement scores.`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <ChevronRight className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
                <span className="font-bold block">No Student Profile Selected</span>
                <p className="text-xs mt-1">Select a student from the left list to analyze active report sheets and GPAs</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        // CASE B: STUDENT SELF-SERVICE VIEW PANELS
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Your Personal Grade Book Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Term records and grading details</p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-404 font-bold">Cumulative GPA:</span>
              <span className="text-lg font-black text-indigo-700">{currentGPA > 0 ? `${currentGPA} GPA` : 'Calculations Pending'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentStudentResults.length > 0 ? (
              currentStudentResults.map(res => (
                <div 
                  key={res.id}
                  className="p-5 rounded-2xl border border-slate-205 bg-slate-50 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-700 uppercase tracking-widest">
                      {res.subject}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{res.examName}</h4>
                    <span className="text-xs text-slate-500 block font-medium">Marks: {res.marksObtained} / {res.maxMarks}</span>
                  </div>

                  <div className="text-center bg-white border border-slate-200 p-2.5 rounded-xl shrink-0 w-11 h-12 flex flex-col justify-center">
                    <span className="text-base font-black text-indigo-650 block mb-0.5 font-mono">{res.grade}</span>
                    <span className="text-[9px] text-slate-400 font-bold font-mono">GP {res.gp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-10/40 border-2 border-dashed border-slate-200 rounded-2xl">
                <Award className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
                <span className="font-semibold block">Academic Marks Absent</span>
                <p className="text-xs text-slate-400 mt-1">Assignments or mid-term scoreboards are currently being processed by your subject instructors.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Grade Result Record Drawer popup dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-sidebar-divider flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-650" />
                <span>Upload Student Academic Grade</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content input forms */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg animate-pulse-none">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Select Campus Student *</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                >
                  <option value="">Locate pupil profile...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber} • {s.className}-{s.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Academic Assessment Module *</label>
                <select
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                >
                  <option value="Mid-Term Examination">Mid-Term Examination Assessment</option>
                  <option value="End-Term Finals">End-Term Finals Assessment</option>
                  <option value="Unit 1 Practice Quiz">Unit 1 Practice Quiz</option>
                  <option value="Project Assessment Session">Project Assessment Session</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Subject Discipline *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                >
                  <option value="Biology">Biology & LifeSciences</option>
                  <option value="Chemistry">Chemistry Lab Science</option>
                  <option value="Mathematics">Mathematics / Calculus</option>
                  <option value="English Literature">English Literature</option>
                  <option value="World History">World History</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Score Obtained (Marks) *</label>
                  <input
                    type="number"
                    required
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    placeholder="e.g. 88"
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Maximum Scale Score *</label>
                  <input
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-650 hover:bg-indigo-755 font-bold text-xs text-white rounded-lg shadow-md"
                >
                  {isSubmitting ? 'Recording Grade...' : 'Upload & Publish'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
