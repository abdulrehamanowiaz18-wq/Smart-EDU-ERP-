/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Users, 
  GraduationCap, 
  Clock, 
  Award, 
  FolderDown, 
  Mail, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity, 
  CreditCard,
  Plus,
  Calendar,
  BookOpen,
  FileText
} from 'lucide-react';

import { 
  User, 
  Student, 
  Teacher, 
  AttendanceRecord, 
  TimetablePeriod, 
  ExamResult, 
  NoteFile, 
  NotificationLog, 
  SubscriptionInfo, 
  Invoice 
} from '../types';

import CustomChart from './CustomChart';

interface AdminDashboardProps {
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  timetablePeriods: TimetablePeriod[];
  examResults: ExamResult[];
  noteFiles: NoteFile[];
  notificationLogs: NotificationLog[];
  subscriptionInfo: SubscriptionInfo | null;
  invoices: Invoice[];
  onQuickSwap: (username: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({
  currentUser,
  students,
  teachers,
  attendanceRecords,
  timetablePeriods,
  examResults,
  noteFiles,
  notificationLogs,
  subscriptionInfo,
  invoices,
  onQuickSwap,
  setActiveTab
}: AdminDashboardProps) {

  // Cumulative Ratios
  const getAverageAttendance = () => {
    if (attendanceRecords.length === 0) return 94.0;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    return ((present + late * 0.5) / attendanceRecords.length) * 100;
  };

  const getGradesDistribution = () => {
    const grades = ['A+', 'A', 'B', 'B-', 'C', 'D', 'F'];
    return grades.map(g => ({
      grade: g,
      count: examResults.filter(r => r.grade === g).length
    }));
  };

  const getWeeklyAttendanceTrend = () => {
    return [
      { day: 'Mon', percentage: 95 },
      { day: 'Tue', percentage: 98 },
      { day: 'Wed', percentage: 94 },
      { day: 'Thu', percentage: 97 },
      { day: 'Fri', percentage: 91 },
      { day: 'Sat', percentage: 88 }
    ];
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Branding Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-bl-full pointer-events-none"></div>

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">System Administrator Operations Control</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome to {subscriptionInfo?.institutionName || 'K.N.S INSTITUTE OF TECHNOLOGY'}, {currentUser.name}!
          </h2>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            Full operational overview of campus activities, student enrolments, faculty rosters, daily attendance metrics, exam grade trends, and automated parent email notifications.
          </p>
        </div>

        {/* Quick status badges */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shrink-0 self-start md:self-auto z-10 w-full sm:w-auto flex justify-between gap-6">
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Active SaaS Tier</span>
            <span className="text-sm font-black text-emerald-300 capitalize">
              {subscriptionInfo?.currentPlanId.replace("plan-", "") || "Growth"} Tier
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase block">System Health</span>
            <span className="text-sm font-bold text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              100% Operational
            </span>
          </div>
        </div>
      </div>

      {/* KPI Activity Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <button 
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Active Enrolled</span>
        </button>

        <button 
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{teachers.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Full-time Staff</span>
        </button>

        <button 
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{getAverageAttendance().toFixed(1)}%</div>
          <span className="text-[10px] text-indigo-600 font-bold mt-1 block">Campus Average</span>
        </button>

        <button 
          onClick={() => setActiveTab('results')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Grades</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{examResults.length}</div>
          <span className="text-[10px] text-purple-600 font-bold mt-1 block">Records Logged</span>
        </button>

        <button 
          onClick={() => setActiveTab('notes')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes Vault</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <FolderDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{noteFiles.length}</div>
          <span className="text-[10px] text-sky-600 font-bold mt-1 block">Shared Resources</span>
        </button>

        <button 
          onClick={() => setActiveTab('notifications')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Logs</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{notificationLogs.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Alerts Dispatched</span>
        </button>

      </div>

      {/* Analytics Visualizations */}
      <CustomChart 
        studentsCount={students.length}
        teachersCount={teachers.length}
        averageAttendance={getAverageAttendance()}
        gradesDistribution={getGradesDistribution()}
        weeklyAttendance={getWeeklyAttendanceTrend()}
      />

      {/* Grid: Admin System Activity Stream & Quick Action Cabinet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Activity Stream & Bulletins */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Real-time System Activity Stream</h4>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-750 px-2.5 py-0.5 rounded-full font-bold uppercase">
              Live Audits
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-3.5">
            {/* Student enrolment activity */}
            {students.length > 0 && (
              <div className="flex items-start gap-3 pt-3.5 first:pt-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Latest Student Registered</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {students[students.length - 1].rollNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {students[students.length - 1].name} ({students[students.length - 1].className} - {students[students.length - 1].section}) enrolled with parent contact {students[students.length - 1].parentPhone}.
                  </p>
                </div>
              </div>
            )}

            {/* Note upload activity */}
            {noteFiles.length > 0 && (
              <div className="flex items-start gap-3 pt-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Material Uploaded to Vault</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {noteFiles[0].fileSize}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    "{noteFiles[0].title}" published by {noteFiles[0].uploaderName} for {noteFiles[0].className} ({noteFiles[0].subject}).
                  </p>
                </div>
              </div>
            )}

            {/* Exam result activity */}
            {examResults.length > 0 && (
              <div className="flex items-start gap-3 pt-3.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Exam Grade Released</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold font-mono">
                      Grade {examResults[0].grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {examResults[0].studentName} scored {examResults[0].marksObtained}/{examResults[0].maxMarks} in {examResults[0].subject} ({examResults[0].examName}).
                  </p>
                </div>
              </div>
            )}

            {/* Notification alert dispatch */}
            {notificationLogs.length > 0 && (
              <div className="flex items-start gap-3 pt-3.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Parent Notification Email Dispatched</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Delivered</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sent to {notificationLogs[0].toEmail}: "{notificationLogs[0].subject}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Quick Action Cabinet & Role Swapper */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-1 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-sm">Quick Action Cabinet</h4>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('students')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center justify-between text-slate-800 hover:text-indigo-900 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Register New Student</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>

            <button 
              onClick={() => setActiveTab('teachers')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 flex items-center justify-between text-slate-800 hover:text-emerald-900 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Appoint Faculty Member</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button 
              onClick={() => setActiveTab('timetable')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 flex items-center justify-between text-slate-800 hover:text-amber-900 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Schedule Timetable Period</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-between text-slate-800 hover:text-rose-900 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-600" />
                <span>View SMTP Email Logs</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Demo Identity Quick Swapper
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button 
                onClick={() => onQuickSwap('padmini')}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
              >
                Teacher Padmini
                <span className="block text-[9px] text-emerald-600 font-normal">Faculty View</span>
              </button>
              <button 
                onClick={() => onQuickSwap('syed')}
                className="p-2 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-left transition-colors"
              >
                Student Syed
                <span className="block text-[9px] text-sky-600 font-normal">Student View</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
