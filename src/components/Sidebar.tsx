/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  FolderDown, 
  Mail, 
  CreditCard, 
  LogOut, 
  User as UserIcon,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  notificationCount: number;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout, notificationCount }: SidebarProps) {
  
  // Custom navigation structure mapping
  const navItems = [
    // Shared / Admin
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers, roles: ['admin', 'teacher', 'student'] },
    { id: 'profile', label: 'My Profile Dashboard', icon: UserIcon, roles: ['admin', 'teacher', 'student'] },
    { id: 'students', label: 'Student Directory', icon: GraduationCap, roles: ['admin', 'teacher', 'student'] },
    { id: 'teachers', label: 'Faculty Roster', icon: Users, roles: ['admin', 'teacher'] },
    { id: 'attendance', label: 'Daily Attendance', icon: Clock, roles: ['admin', 'teacher', 'student'] },
    { id: 'timetable', label: 'Timetable Scheduler', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
    { id: 'results', label: 'Academic Grades', icon: Award, roles: ['admin', 'teacher', 'student'] },
    { id: 'notes', label: 'Notes & Material Vault', icon: FolderDown, roles: ['admin', 'teacher', 'student'] },
    { id: 'notifications', label: 'Email Logs', icon: Mail, roles: ['admin', 'teacher'] }
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(currentUser.role));

  const roleLabel = (role: UserRole) => {
    switch(role) {
      case 'admin': return 'System Admin';
      case 'teacher': return 'Academic Faculty';
      case 'student': return 'Enrolled Student';
      default: return 'User';
    }
  };

  const roleColor = (role: UserRole) => {
    switch(role) {
      case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'teacher': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'student': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen fixed top-0 left-0 z-20">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md shadow-slate-950/10">
          <BookOpen className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">SmartEdu ERP</h1>
          <p className="text-xs text-slate-400 font-medium">Startup Admin MVP</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin">
        <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          Administrative Menu
        </div>
        {allowedItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'notifications' && notificationCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {notificationCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Session Profile Footing */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/55">
        <div 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 p-2 rounded-lg bg-white border cursor-pointer hover:bg-slate-50 transition-all mb-3 ${
            activeTab === 'profile' 
              ? 'border-black ring-2 ring-black/10' 
              : 'border-slate-155 hover:border-slate-400/30'
          }`}
        >
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-755 border border-slate-300">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-950 truncate leading-none mb-1">{currentUser.name}</h4>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleColor(currentUser.role)}`}>
              {roleLabel(currentUser.role)}
            </span>
          </div>
        </div>

        {/* System logouts */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-semibold border border-slate-200 hover:border-rose-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Account</span>
        </button>
      </div>

    </div>
  );
}
