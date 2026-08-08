/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  X, 
  User, 
  BookOpen, 
  Filter 
} from 'lucide-react';
import { TimetablePeriod, Teacher } from '../types';

interface TimetableModuleProps {
  timetablePeriods: TimetablePeriod[];
  teachers: Teacher[];
  onAddTimetablePeriod: (data: Omit<TimetablePeriod, 'id'>) => Promise<any>;
  onDeleteTimetablePeriod: (id: string) => Promise<boolean>;
  userRole: 'admin' | 'teacher' | 'student';
  currentTeacherId?: string;
  currentStudentClass?: string;
}

export default function TimetableModule({
  timetablePeriods,
  teachers,
  onAddTimetablePeriod,
  onDeleteTimetablePeriod,
  userRole,
  currentTeacherId,
  currentStudentClass
}: TimetableModuleProps) {

  const [filterType, setFilterType] = useState<'class' | 'teacher' | 'exams'>('class');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || 'All');

  // Popup modal controller
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Add state inputs
  const [formClassName, setFormClassName] = useState('Class 10');
  const [formSection, setFormSection] = useState('A');
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [formSubject, setFormSubject] = useState('');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [formStartTime, setFormStartTime] = useState('08:30');
  const [formEndTime, setFormEndTime] = useState('09:30');
  const [formRoom, setFormRoom] = useState('Room 101');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Weekly days array
  const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Filtering timetable records based on type selections
  const filteredPeriods = timetablePeriods.filter(period => {
    if (userRole === 'student' && currentStudentClass) {
      // Students see only their own allocated class
      const [studentClass, studentSection] = currentStudentClass.split('-');
      return period.className === studentClass && period.section === studentSection;
    }

    if (userRole === 'teacher' && currentTeacherId) {
      // Teachers see only their assigned lesson slots by default
      return period.teacherId === currentTeacherId;
    }

    // Admins filters
    if (filterType === 'class') {
      return period.className === selectedClass && period.section === selectedSection;
    } else if (filterType === 'teacher') {
      return selectedTeacherId === 'All' || period.teacherId === selectedTeacherId;
    }
    
    return true; // placeholder for exams filter
  });

  // Mock static exam dates data
  const examSchedules = [
    { subject: "Mathematics Theory", date: "2026-06-15", time: "09:00 AM - 12:00 PM", room: "Auditorium Main Hall", targetClass: "Class 10 & 11" },
    { subject: "Biology Practical", date: "2026-06-16", time: "10:30 AM - 12:30 PM", room: "Science Lab B", targetClass: "Class 10 Only" },
    { subject: "Languages & English Lit", date: "2026-06-17", time: "09:00 AM - 11:30 AM", room: "Room 104 / 105", targetClass: "Class 10 & 12" },
    { subject: "Socio History & Geographics", date: "2026-06-18", time: "13:00 PM - 15:30 PM", room: "Auditorium Main Hall", targetClass: "Class 12" }
  ];

  const handleDelete = async (id: string, subject: string) => {
    if (confirm(`Are you sure you want to delete this ${subject} period from the schedule layout?`)) {
      await onDeleteTimetablePeriod(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject) {
      setFormError('Please give a Subject title details (e.g. Calculus)');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const assignedInstructor = teachers.find(t => t.id === formTeacherId);

    try {
      await onAddTimetablePeriod({
        className: formClassName,
        section: formSection,
        day: formDay,
        subject: formSubject,
        teacherId: formTeacherId,
        teacherName: assignedInstructor ? assignedInstructor.name : "Substitute Teacher",
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom
      });
      setIsFormOpen(false);
      setFormSubject('');
    } catch (err: any) {
      setFormError(err.message || 'Error processing scheduler rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Mode Switch Tabs bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Navigation role selections */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {userRole === 'admin' && (
            <>
              <button
                onClick={() => setFilterType('class')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                  filterType === 'class' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Track by Class
              </button>
              <button
                onClick={() => setFilterType('teacher')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                  filterType === 'teacher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Track by Faculty
              </button>
            </>
          )}

          <button
            onClick={() => setFilterType('exams')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
              filterType === 'exams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-905'
            }`}
          >
            Exam Milestones Timeline
          </button>
        </div>

        {/* Dynamic filters based on selections */}
        <div className="flex flex-wrap items-center gap-3">
          
          {userRole === 'admin' && filterType === 'class' && (
            <>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-bold text-slate-705 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10 (Soph)</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs font-bold text-slate-705 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </>
          )}

          {userRole === 'admin' && filterType === 'teacher' && (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="text-xs font-bold text-slate-705 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
            >
              <option value="All">All Faculty Schedule</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-705 text-white font-bold rounded-xl shadow-md text-xs px-4 py-2 transition-transform transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Slot</span>
            </button>
          )}

        </div>
      </div>

      {/* TIMELINE VIEW CASE A: Exams schedules */}
      {filterType === 'exams' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h3 className="font-extrabold text-slate-900 text-sm">Upcoming Examination Schedules</h3>
            <p className="text-xs text-slate-400 mt-1">Mid-Term and Final academic assessments schedules (Phase 1 assessment)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {examSchedules.map((exam, i) => (
              <div 
                key={i} 
                className="p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/15 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 roundedbg-rose-50 border border-rose-100 text-rose-700">
                      Exam Session
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{exam.targetClass}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-rose-700">{exam.subject}</h4>
                </div>

                <div className="space-y-2 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold text-slate-751">{new Date(exam.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{exam.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // TIMELINE VIEW CASE B: Class grids day-wise
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map(day => {
            const dayPeriods = filteredPeriods
              .filter(p => p.day === day)
              .sort((a,b) => a.startTime.localeCompare(b.startTime));

            return (
              <div 
                key={day}
                className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="pb-3 border-b border-sidebar-divider flex justify-between items-center mb-4">
                    <span className="font-extrabold text-slate-905">{day}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-full px-2 py-0.5">
                      {dayPeriods.length} Classes
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {dayPeriods.length > 0 ? (
                      dayPeriods.map(p => (
                        <div 
                          key={p.id}
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-slate-600 font-medium group relative"
                        >
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDelete(p.id, p.subject)}
                              className="absolute top-2.5 right-2.5 p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Period"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-805 text-sm flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-505" />
                              <span>{p.subject}</span>
                            </span>
                            <span className="text-[9px] font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 uppercase font-mono">
                              {p.className}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-slate-500 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold text-slate-700">{p.startTime} - {p.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Prof: {p.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Loc: {p.room}</span>
                            </div>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No lectures scheduled
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100/60 hidden"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add timetable period modal drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-650" />
                <span>Schedule Academic Period</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Target Class *</label>
                  <select
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Section *</label>
                  <select
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Set Day of Week *</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Room Assignment</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. Science Lab B"
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Subject Course Title *</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Advanced Chemistry"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Allocated Faculty Principal *</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50"
                >
                  <option value="">Choose Faculty</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 animate-pulse-none">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              {/* Action buttons */}
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
                  {isSubmitting ? 'Scheduling...' : 'Deploy Slot'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
