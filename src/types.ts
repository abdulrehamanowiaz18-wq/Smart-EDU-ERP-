/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  classAllocated?: string; // e.g., 'Class 10-A'
  subjectSpecialty?: string; // for teachers
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  gender: string;
  address: string;
  phone: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  className: string; // e.g. "Class 10"
  section: string; // e.g. "A"
  avatarUrl?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  avatarUrl?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export interface TimetablePeriod {
  id: string;
  className: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subject: string;
  teacherId: string;
  teacherName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  examName: string; // e.g. "Mid Term", "Finals"
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  gp: number; // Grade point (0.0 to 10.0 or 4.0 representation)
}

export interface NoteFile {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  uploadedBy: string; // user id
  uploaderName: string;
  uploaderRole: UserRole;
  fileName: string;
  fileSize: string;
  contentUrl: string; // data URI or simulated link
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  toEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'delivered';
}

export interface SaaSPlan {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  billingPeriod: string;
  features: string[];
  studentLimit: number;
}

export interface SubscriptionInfo {
  currentPlanId: string;
  institutionName: string;
  status: 'active' | 'past_due' | 'unpaid';
  expiresAt: string;
  cardLast4?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  planName: string;
  status: 'paid' | 'pending';
}

export interface StudentFee {
  id: string;
  studentId: string;
  feeName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

