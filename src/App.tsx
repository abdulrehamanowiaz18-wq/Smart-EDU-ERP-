/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  LogOut, 
  ShieldAlert, 
  HelpCircle, 
  Award, 
  BookOpen, 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  Terminal, 
  Lock, 
  CheckCircle2, 
  Layers,
  Sparkles,
  RefreshCw,
  PhoneCall,
  ArrowUpRight
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
  Invoice, 
  SaaSPlan 
} from './types';

// Component imports
import Sidebar from './components/Sidebar';
import CustomChart from './components/CustomChart';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentModule from './components/StudentModule';
import TeacherModule from './components/TeacherModule';
import AttendanceModule from './components/AttendanceModule';
import TimetableModule from './components/TimetableModule';
import ResultsModule from './components/ResultsModule';
import NotesModule from './components/NotesModule';
import NotificationLogTray from './components/NotificationLogTray';
import ProfileModule from './components/ProfileModule';

export default function App() {
  
  // Auth Session State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('password');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // App Master state database vectors
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [timetablePeriods, setTimetablePeriods] = useState<TimetablePeriod[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [noteFiles, setNoteFiles] = useState<NoteFile[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>([]);

  // Navigation Panel Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Quick Action Notification Alerts
  const [recentNotifications, setRecentNotifications] = useState<string[]>([
    "Campus attendance audit schedule uploaded for Friday",
    "Stripe Gateway connection validated - Sandbox Ready",
    "Biology Unit notes successfully updated by Dr. Padmini"
  ]);

  // Load backend models when logged in
  useEffect(() => {
    if (token) {
      loadApplicationData();
    }
  }, [token]);

  const loadApplicationData = async () => {
    setIsLoadingData(true);
    try {
      const [
        studentsRes, 
        teachersRes, 
        attendanceRes, 
        timetableRes, 
        resultsRes, 
        notesRes, 
        notifRes, 
        billingRes
      ] = await Promise.all([
        fetch('/api/students').then(r => r.json()),
        fetch('/api/teachers').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/timetable').then(r => r.json()),
        fetch('/api/results').then(r => r.json()),
        fetch('/api/notes').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/billing/info').then(r => r.json())
      ]);

      setStudents(studentsRes);
      setTeachers(teachersRes);
      setAttendanceRecords(attendanceRes);
      setTimetablePeriods(timetableRes);
      setExamResults(resultsRes);
      setNoteFiles(notesRes);
      setNotificationLogs(notifRes);
      
      if (billingRes) {
        setSubscriptionInfo(billingRes.subscription);
        setInvoices(billingRes.invoices);
        setSaasPlans(billingRes.plans);
      }

    } catch (err) {
      triggerGlobalAlert('error', 'Error synchronized with database. Check API server connection.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const triggerGlobalAlert = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  // Auth logins handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Validation failure');
      }

      setUser(data.user);
      setToken(data.token);
      triggerGlobalAlert('success', `Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      setAuthError(err.message || 'Login rejected. Double check credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
  };

  // DEMO ROLE SWAPPER: Instantly logins as another demo profile
  const handleQuickSwap = async (targetUsername: string) => {
    setAuthError('');
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername, password: 'any' })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setActiveTab('dashboard');
        triggerGlobalAlert('success', `Swapped identity to ${data.user.name} (${data.user.role.toUpperCase()})`);
      }
    } catch (err) {
      triggerGlobalAlert('error', 'Quick swap failure. Reset server memory.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Student operations fetches proxies
  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    if (!res.ok) throw new Error('Persisting student failure');
    const newStud = await res.json();
    setStudents(prev => [...prev, newStud]);
    triggerGlobalAlert('success', `Registered: ${newStud.name}. Auto-credentials and welcome parental mail sent.`);
    loadApplicationData(); // refresh lists & logs
    return newStud;
  };

  const handleEditStudent = async (id: string, updateData: Partial<Student>) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Amending student records failed');
    const updated = await res.json();
    setStudents(prev => prev.map(s => s.id === id ? updated : s));
    triggerGlobalAlert('success', `Updated Profile: ${updated.name}`);
    return updated;
  };

  const handleDeleteStudent = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setStudents(prev => prev.filter(s => s.id !== id));
    triggerGlobalAlert('success', 'Student roster records updated. Associated login revoked.');
    return true;
  };

  // Teachers fetches proxies
  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData)
    });
    if (!res.ok) throw new Error('Hiring deployment aborted');
    const newInstructor = await res.json();
    setTeachers(prev => [...prev, newInstructor]);
    triggerGlobalAlert('success', `Faculty Appointed: ${newInstructor.name}`);
    loadApplicationData();
    return newInstructor;
  };

  const handleEditTeacher = async (id: string, updateData: Partial<Teacher>) => {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Amending instructor details failed');
    const updated = await res.json();
    setTeachers(prev => prev.map(t => t.id === id ? updated : t));
    triggerGlobalAlert('success', `Faculty profile saved: ${updated.name}`);
    return updated;
  };

  const handleDeleteTeacher = async (id: string) => {
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setTeachers(prev => prev.filter(t => t.id !== id));
    triggerGlobalAlert('success', 'Instructor credentials deleted from directory.');
    return true;
  };

  // Daily Roll-call proxy
  const handleSaveAttendance = async (
    className: string, 
    section: string, 
    date: string, 
    records: { studentId: string, studentName: string, status: 'present' | 'absent' | 'late', remarks: string }[]
  ) => {
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, date, className, section })
    });
    if (!res.ok) throw new Error('Attendance synchronization failed');
    await loadApplicationData(); // pull updated attendance & dispatch reports
    return true;
  };

  // Timetable planner planner proxy
  const handleAddTimetablePeriod = async (periodData: Omit<TimetablePeriod, 'id'>) => {
    const res = await fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    if (!res.ok) throw new Error('Deployment of scheduler blocked');
    const added = await res.json();
    setTimetablePeriods(prev => [...prev, added]);
    triggerGlobalAlert('success', `Course Segment Scheduled: ${added.subject} in ${added.room}`);
    return added;
  };

  const handleDeleteTimetablePeriod = async (id: string) => {
    const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setTimetablePeriods(prev => prev.filter(p => p.id !== id));
    triggerGlobalAlert('success', 'Schedule period removed');
    return true;
  };

  // Study materials proxy
  const handleUploadNote = async (noteData: Omit<NoteFile, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    if (!res.ok) throw new Error('Notes storage rejected');
    const added = await res.json();
    setNoteFiles(prev => [added, ...prev]);
    triggerGlobalAlert('success', `Material published: ${added.title}. Target parents informed.`);
    loadApplicationData();
    return added;
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    setNoteFiles(prev => prev.filter(n => n.id !== id));
    triggerGlobalAlert('success', 'Syllabus resource removed');
    return true;
  };

  // Grade Card assessment publisher proxy
  const handleAddResult = async (resultData: Omit<ExamResult, 'id' | 'grade' | 'gp'>) => {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    if (!res.ok) throw new Error('Publishing outcome card failed');
    const added = await res.json();
    setExamResults(prev => [added, ...prev]);
    triggerGlobalAlert('success', `Mark released successfully. Report card upgraded.`);
    loadApplicationData();
    return added;
  };

  // Profile / user credential updation callback
  const handleUpdateCurrentUser = async (updatedUser: User, extraPayload: any) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
          ...extraPayload
        })
      });
      if (!res.ok) throw new Error('Could not update user credentials on server');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        triggerGlobalAlert('success', 'Profile saved & fully synchronized with system database.');
      }
    } catch (err: any) {
      triggerGlobalAlert('error', err.message || 'Verification or profile update failure.');
      throw err;
    } finally {
      setIsLoadingData(false);
      loadApplicationData(); // reload rosters with fresh synchronized records
    }
  };

  // Billing SaaS upgrade proxy
  const handleUpgradePlan = async (
    planId: string, 
    payload: { cardToken?: string, last4: string, institutionName: string }
  ) => {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, ...payload })
    });
    if (!res.ok) throw new Error('Checkouts error. Payment credential rejected.');
    const updatedInfo = await res.json();
    
    setSubscriptionInfo(updatedInfo.subscription);
    setInvoices(updatedInfo.invoices);
    triggerGlobalAlert('success', 'Sandbox payment approved! SaaS upgrades configured.');
    loadApplicationData();
    return updatedInfo;
  };

  // Calculate Cumulative Ratios for charts
  const getAverageAttendance = () => {
    if (attendanceRecords.length === 0) return 94.0; // default benchmark
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

  // Determine matching student or teacher primary IDs for modules references
  const matchingStudentId = user?.role === 'student' ? (students.find(s => s.name === user.name)?.id || 's-1') : undefined;
  const matchingTeacherId = user?.role === 'teacher' ? (teachers.find(t => t.name === user.name)?.id || 't-1') : undefined;
  const matchingClass = user?.role === 'student' ? user.classAllocated : undefined;

  // Render Core UI tab layouts switcher
  const renderTabContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-650 mb-3" />
          <span className="font-semibold">Loading Campus Data...</span>
          <p className="text-xs text-slate-400/80 mt-1">Retrieving persistent school dashboards models</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard':
        if (user?.role === 'teacher') {
          return (
            <TeacherDashboard 
              currentUser={user}
              teachers={teachers}
              students={students}
              attendanceRecords={attendanceRecords}
              timetablePeriods={timetablePeriods}
              examResults={examResults}
              noteFiles={noteFiles}
              onSaveAttendance={handleSaveAttendance}
              onUploadNote={handleUploadNote}
              setActiveTab={setActiveTab}
            />
          );
        }

        if (user?.role === 'student') {
          return (
            <StudentDashboard 
              currentUser={user}
              students={students}
              attendanceRecords={attendanceRecords}
              timetablePeriods={timetablePeriods}
              examResults={examResults}
              noteFiles={noteFiles}
              teachers={teachers}
              setActiveTab={setActiveTab}
            />
          );
        }

        return (
          <AdminDashboard 
            currentUser={user!}
            students={students}
            teachers={teachers}
            attendanceRecords={attendanceRecords}
            timetablePeriods={timetablePeriods}
            examResults={examResults}
            noteFiles={noteFiles}
            notificationLogs={notificationLogs}
            subscriptionInfo={subscriptionInfo}
            invoices={invoices}
            onQuickSwap={handleQuickSwap}
            setActiveTab={setActiveTab}
          />
        );

      case 'profile':
        return (
          <ProfileModule 
            currentUser={user!}
            students={students}
            teachers={teachers}
            onUpdateCurrentUser={handleUpdateCurrentUser}
          />
        );

      case 'students':
        return (
          <StudentModule 
            students={students}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            userRole={user ? user.role : 'admin'}
          />
        );

      case 'teachers':
        return (
          <TeacherModule 
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onEditTeacher={handleEditTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            userRole={user ? user.role : 'admin'}
          />
        );

      case 'attendance':
        return (
          <AttendanceModule 
            students={students}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={handleSaveAttendance}
            userRole={user ? user.role : 'admin'}
            currentStudentId={matchingStudentId}
          />
        );

      case 'timetable':
        return (
          <TimetableModule 
            timetablePeriods={timetablePeriods}
            teachers={teachers}
            onAddTimetablePeriod={handleAddTimetablePeriod}
            onDeleteTimetablePeriod={handleDeleteTimetablePeriod}
            userRole={user ? user.role : 'admin'}
            currentTeacherId={matchingTeacherId}
            currentStudentClass={matchingClass}
          />
        );

      case 'results':
        return (
          <ResultsModule 
            results={examResults}
            students={students}
            onAddResult={handleAddResult}
            userRole={user ? user.role : 'admin'}
            currentStudentId={matchingStudentId}
          />
        );

      case 'notes':
        return (
          <NotesModule 
            notes={noteFiles}
            currentUser={user}
            onUploadNote={handleUploadNote}
            onDeleteNote={handleDeleteNote}
          />
        );

      case 'notifications':
        return (
          <NotificationLogTray logs={notificationLogs} />
        );

      default:
        return <div>Dashboard panel</div>;
    }
  };

  // ==========================================
  // VIEW RENDER A: AUTH LOGIN CANVAS CARD
  // ==========================================
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        
        {/* Glow patterns */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md space-y-6">
          
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-650/40 mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-sans">SmartEdu ERP</h1>
              <p className="text-xs text-slate-400 font-medium">Startup Admin & Campus Workspace Roster</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {authError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-305 text-xs font-bold rounded-xl truncate">
                {authError}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Demo Username *</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Choose login from demo credentials below..."
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Security Password *</label>
                <span className="text-[10px] text-indigo-400 font-semibold">'any' password accepted</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter passcode credentials..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-550 transition-colors font-mono"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md active:scale-97 disabled:opacity-50"
            >
              <Terminal className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating Token Sessions...' : 'Authorize Login Credentials'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Swapper cards */}
          <div className="pt-4 border-t border-slate-850 space-y-3 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
              Tap Demo Profile Credentials Switcher
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold">
              <button
                onClick={() => { setLoginUsername('admin'); setLoginPassword('any'); }}
                className="bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-900/40 text-indigo-300 p-2 rounded-xl text-center transition-colors truncate"
              >
                Administrator
                <span className="block text-[8px] text-indigo-400/85 mt-0.5 font-mono">user: admin</span>
              </button>
              <button
                onClick={() => { setLoginUsername('padmini'); setLoginPassword('any'); }}
                className="bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-300 p-2 rounded-xl text-center transition-colors truncate"
              >
                Teacher Padmini
                <span className="block text-[8px] text-emerald-400/85 mt-0.5 font-mono">user: padmini</span>
              </button>
              <button
                onClick={() => { setLoginUsername('syed'); setLoginPassword('any'); }}
                className="bg-sky-950/40 border border-sky-900/50 hover:bg-sky-900/40 text-sky-300 p-2 rounded-xl text-center transition-colors truncate"
              >
                Student Syed
                <span className="block text-[8px] text-sky-400/85 mt-0.5 font-mono">user: syed</span>
              </button>
              <button
                onClick={() => { setLoginUsername('abdul'); setLoginPassword('any'); }}
                className="bg-teal-950/40 border border-teal-900/50 hover:bg-teal-900/40 text-teal-300 p-2 rounded-xl text-center transition-colors truncate"
              >
                Student Abdul
                <span className="block text-[8px] text-teal-400/85 mt-0.5 font-mono">user: abdul</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW RENDER B: AUTHENTICATED GLOBAL CORE SHELL
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-55 flex">
      
      {/* Sidebar column layout */}
      <Sidebar 
        currentUser={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        notificationCount={notificationLogs.length}
      />

      {/* Main Core workspace layout sheet */}
      <div className="flex-1 pl-80 flex flex-col min-h-screen">
        
        {/* Top Header Controls row */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-150 rounded px-2 py-0.5 uppercase">
              Current Session
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-700">{user.name}</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold uppercase ml-1">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Quick swap control helper */}
            <div className="flex items-center gap-1 bg-slate-105 p-1 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Swap Role:</span>
              <button 
                onClick={() => handleQuickSwap('admin')}
                className={`text-[10px] font-black px-2 py-1 rounded transition-colors ${user.role === 'admin' ? 'bg-black text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => handleQuickSwap('padmini')}
                className={`text-[10px] font-black px-2 py-1 rounded transition-colors ${user.role === 'teacher' ? 'bg-black text-white shadow-xs' : 'text-slate-505 hover:text-slate-900'}`}
              >
                Teacher
              </button>
              <button 
                onClick={() => handleQuickSwap('syed')}
                className={`text-[10px] font-black px-2 py-1 rounded transition-colors ${user.role === 'student' ? 'bg-black text-white shadow-xs' : 'text-slate-505 hover:text-slate-900'}`}
              >
                Student
              </button>
            </div>

            {/* Notification alert count logs trigger */}
            <div className="relative group">
              <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                {notificationLogs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
                )}
              </button>
              
              {/* Floating notification log tooltip dropdown */}
              <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl p-4 shadow-xl w-60 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all text-xs space-y-2 z-30">
                <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1.5 uppercase tracking-wider text-[10px]">
                  SMTP Alerts Triggered Today
                </span>
                <div className="space-y-1.5 text-slate-500 max-h-40 overflow-y-auto scrollbar-thin">
                  {notificationLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="pb-1.5 border-b border-slate-50 last:border-0">
                      <p className="font-semibold text-slate-800 leading-tight">{log.subject}</p>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(log.sentAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
              title="Sign Out Session"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>

        </header>

        {/* Dynamic page client container layout panel */}
        <main className="flex-1 p-8 space-y-6">
          
          {/* Global synchronized messages alerts overlay */}
          {globalMessage && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-10 duration-200 ${
              globalMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-250/70 text-rose-800'
            }`}>
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>{globalMessage.text}</div>
            </div>
          )}

          {/* Module specific component loading */}
          {renderTabContent()}

        </main>

        {/* Footer info credentials */}
        <footer className="h-14 border-t border-slate-150 flex items-center justify-between px-8 text-[11px] font-bold text-slate-400">
          <span>SmartEdu ERP Startup-Ready MVP © 2026</span>
          <div className="flex gap-4">
            <span className="text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All backend API integrations Operational</span>
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}
