import Database from "better-sqlite3";
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
} from "./types.ts";

let sqliteDb: any = null;

try {
  sqliteDb = new Database("database.sqlite");
  sqliteDb.pragma("journal_mode = WAL");
} catch (e) {
  console.error("SQLite initializer failed:", e);
}

// Ensure database tables exist
export async function initializeSchemas() {
  if (!sqliteDb) return;
  
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      name TEXT,
      role TEXT,
      email TEXT,
      avatarUrl TEXT,
      classAllocated TEXT,
      subjectSpecialty TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT,
      rollNumber TEXT,
      gender TEXT,
      address TEXT,
      phone TEXT,
      parentName TEXT,
      parentEmail TEXT,
      parentPhone TEXT,
      className TEXT,
      section TEXT,
      avatarUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      department TEXT,
      subjects TEXT,
      avatarUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS attendanceRecords (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      studentName TEXT,
      className TEXT,
      section TEXT,
      date TEXT,
      status TEXT,
      remarks TEXT
    );

    CREATE TABLE IF NOT EXISTS timetablePeriods (
      id TEXT PRIMARY KEY,
      className TEXT,
      section TEXT,
      day TEXT,
      subject TEXT,
      teacherId TEXT,
      teacherName TEXT,
      startTime TEXT,
      endTime TEXT,
      room TEXT
    );

    CREATE TABLE IF NOT EXISTS examResults (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      studentName TEXT,
      className TEXT,
      section TEXT,
      examName TEXT,
      subject TEXT,
      marksObtained REAL,
      maxMarks REAL,
      grade TEXT,
      gp REAL
    );

    CREATE TABLE IF NOT EXISTS noteFiles (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      subject TEXT,
      className TEXT,
      uploadedBy TEXT,
      uploaderName TEXT,
      uploaderRole TEXT,
      fileName TEXT,
      fileSize TEXT,
      contentUrl TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS notificationLogs (
      id TEXT PRIMARY KEY,
      toEmail TEXT,
      recipientName TEXT,
      subject TEXT,
      message TEXT,
      sentAt TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptionSettings (
      id TEXT PRIMARY KEY,
      currentPlanId TEXT,
      institutionName TEXT,
      status TEXT,
      expiresAt TEXT,
      cardLast4 TEXT
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      date TEXT,
      amount REAL,
      planName TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS studentFees (
      id TEXT PRIMARY KEY,
      studentId TEXT,
      feeName TEXT,
      amount REAL,
      dueDate TEXT,
      status TEXT,
      paidAt TEXT,
      paymentMethod TEXT,
      transactionId TEXT
    );
  `);
}

// Default Seed Datasets
const initialUsers: User[] = [
  { id: "u-admin", username: "admin", name: "Principal Dr. Sasi Kumar", role: "admin", email: "sasi.kumar@knsit.edu.in", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
  { id: "u-teacher1", username: "padmini", name: "Dr. Padmini", role: "teacher", email: "padmini@smartedu-erp.com", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", subjectSpecialty: "Science & Biology" },
  { id: "u-teacher2", username: "david", name: "Prof. David Rowan", role: "teacher", email: "david.rowan@smartedu-erp.com", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", subjectSpecialty: "Mathematics" },
  { id: "u-teacher3", username: "elena", name: "Elena Rostova", role: "teacher", email: "elena.rostova@smartedu-erp.com", avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80", subjectSpecialty: "English Literature" },
  { id: "u-student1", username: "syed", name: "SYED HUSSAIN", role: "student", email: "syed.hussain@student.com", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", classAllocated: "Class 10-A" },
  { id: "u-student2", username: "sophia", name: "Sophia Martinez", role: "student", email: "sophia.martinez@student.com", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", classAllocated: "Class 10-A" },
  { id: "u-student3", username: "abdul", name: "SYED ABDUL REHAMAN", role: "student", email: "syed.abdul@student.com", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", classAllocated: "Class 10-A" }
];

const initialStudents: Student[] = [
  { id: "s-1", name: "SYED HUSSAIN", rollNumber: "R-1001", gender: "Male", address: "142 Elm Street, Seattle, WA", phone: "+1 (555) 234-5678", parentName: "Richard Carter", parentEmail: "richard.carter@gmail.com", parentPhone: "+1 (555) 987-6543", className: "Class 10", section: "A" },
  { id: "s-2", name: "Sophia Martinez", rollNumber: "R-1002", gender: "Female", address: "89 Redwood Dr, Bellevue, WA", phone: "+1 (555) 345-6789", parentName: "Maria Martinez", parentEmail: "maria.martinez@hotmail.com", parentPhone: "+1 (555) 876-5432", className: "Class 10", section: "A" },
  { id: "s-3", name: "Jackson Vance", rollNumber: "R-1003", gender: "Male", address: "405 Pine Ave, Lynnwood, WA", phone: "+1 (555) 456-7890", parentName: "Donald Vance", parentEmail: "donald.vance@yahoo.com", parentPhone: "+1 (555) 765-4321", className: "Class 10", section: "B" },
  { id: "s-4", name: "Ava Sterling", rollNumber: "R-1101", gender: "Female", address: "712 Birch Lane, Tacoma, WA", phone: "+1 (555) 567-8901", parentName: "Grace Sterling", parentEmail: "grace.sterling@outlook.com", parentPhone: "+1 (555) 654-3210", className: "Class 11", section: "A" },
  { id: "s-5", name: "Noah Patel", rollNumber: "R-1201", gender: "Male", address: "33 High Meadow Rd, Redmond, WA", phone: "+1 (555) 678-9012", parentName: "Sanjay Patel", parentEmail: "sanjay.patel@gmail.com", parentPhone: "+1 (555) 543-2109", className: "Class 12", section: "A" },
  { id: "s-6", name: "SYED ABDUL REHAMAN", rollNumber: "R-1006", gender: "Male", address: "K.N.S Campus, Bangalore", phone: "+1 (555) 999-8888", parentName: "Abdul Rehaman Sr.", parentEmail: "parent.abdul@gmail.com", parentPhone: "+1 (555) 888-7777", className: "Class 10", section: "A" }
];

const initialTeachers: Teacher[] = [
  { id: "t-1", name: "Dr. Padmini", email: "padmini@smartedu-erp.com", phone: "+1 (555) 123-4567", department: "Science & Biology", subjects: ["Biology", "Chemistry", "General Science"] },
  { id: "t-2", name: "Prof. David Rowan", email: "david.rowan@smartedu-erp.com", phone: "+1 (555) 234-5678", department: "Mathematics", subjects: ["Calculus", "Algebra", "Geometry"] },
  { id: "t-3", name: "Elena Rostova", email: "elena.rostova@smartedu-erp.com", phone: "+1 (555) 345-6789", department: "Languages", subjects: ["English Literature", "Creative Writing"] },
  { id: "t-4", name: "Marcus Thorne", email: "marcus.thorne@smartedu-erp.com", phone: "+1 (555) 456-7890", department: "Social Sciences", subjects: ["World History", "Geography"] }
];

const initialAttendanceRecords: AttendanceRecord[] = [
  { id: "att-1", studentId: "s-1", studentName: "SYED HUSSAIN", className: "Class 10", section: "A", date: "2026-06-04", status: "present", remarks: "Punctual" },
  { id: "att-2", studentId: "s-2", studentName: "Sophia Martinez", className: "Class 10", section: "A", date: "2026-06-04", status: "present", remarks: "Highly interactive" },
  { id: "att-3", studentId: "s-3", studentName: "Jackson Vance", className: "Class 10", section: "B", date: "2026-06-04", status: "absent", remarks: "Emailed in advance - Unwell" },
  { id: "att-4", studentId: "s-1", studentName: "SYED HUSSAIN", className: "Class 10", section: "A", date: "2026-06-03", status: "present" },
  { id: "att-5", studentId: "s-2", studentName: "Sophia Martinez", className: "Class 10", section: "A", date: "2026-06-03", status: "late", remarks: "Late by 10 mins" },
  { id: "att-6", studentId: "s-3", studentName: "Jackson Vance", className: "Class 10", section: "B", date: "2026-06-03", status: "present" },
  { id: "att-7", studentId: "s-1", studentName: "SYED HUSSAIN", className: "Class 10", section: "A", date: "2026-06-02", status: "present" },
  { id: "att-8", studentId: "s-2", studentName: "Sophia Martinez", className: "Class 10", section: "A", date: "2026-06-02", status: "present" },
  { id: "att-9", studentId: "s-3", studentName: "Jackson Vance", className: "Class 10", section: "B", date: "2026-06-02", status: "present" },
  { id: "att-10", studentId: "s-6", studentName: "SYED ABDUL REHAMAN", className: "Class 10", section: "A", date: "2026-06-04", status: "present", remarks: "Excellent discipline" }
];

const initialTimetablePeriods: TimetablePeriod[] = [
  { id: "tt-1", className: "Class 10", section: "A", day: "Monday", subject: "Mathematics", teacherId: "t-2", teacherName: "Prof. David Rowan", startTime: "08:30", endTime: "09:30", room: "Room 101" },
  { id: "tt-2", className: "Class 10", section: "A", day: "Monday", subject: "Biology", teacherId: "t-1", teacherName: "Dr. Padmini", startTime: "09:40", endTime: "10:40", room: "Science Lab" },
  { id: "tt-3", className: "Class 10", section: "A", day: "Monday", subject: "English Literature", teacherId: "t-3", teacherName: "Elena Rostova", startTime: "11:00", endTime: "12:00", room: "Room 101" },
  { id: "tt-4", className: "Class 10", section: "A", day: "Monday", subject: "World History", teacherId: "t-4", teacherName: "Marcus Thorne", startTime: "13:00", endTime: "14:00", room: "Room 204" },
  { id: "tt-5", className: "Class 10", section: "A", day: "Tuesday", subject: "Biology", teacherId: "t-1", teacherName: "Dr. Padmini", startTime: "08:30", endTime: "09:30", room: "Science Lab" },
  { id: "tt-6", className: "Class 10", section: "A", day: "Tuesday", subject: "Mathematics", teacherId: "t-2", teacherName: "Prof. David Rowan", startTime: "09:40", endTime: "10:40", room: "Room 101" },
  { id: "tt-7", className: "Class 11", section: "A", day: "Wednesday", subject: "Calculus", teacherId: "t-2", teacherName: "Prof. David Rowan", startTime: "09:00", endTime: "10:30", room: "Room 302" }
];

const initialExamResults: ExamResult[] = [
  { id: "res-1", studentId: "s-1", studentName: "SYED HUSSAIN", className: "Class 10", section: "A", examName: "Mid-Term Examination", subject: "Mathematics", marksObtained: 88, maxMarks: 100, grade: "A", gp: 9.0 },
  { id: "res-2", studentId: "s-1", studentName: "SYED HUSSAIN", className: "Class 10", section: "A", examName: "Mid-Term Examination", subject: "Biology", marksObtained: 92, maxMarks: 100, grade: "A+", gp: 9.5 },
  { id: "res-3", studentId: "s-2", studentName: "Sophia Martinez", className: "Class 10", section: "A", examName: "Mid-Term Examination", subject: "Mathematics", marksObtained: 95, maxMarks: 100, grade: "A+", gp: 10.0 },
  { id: "res-4", studentId: "s-2", studentName: "Sophia Martinez", className: "Class 10", section: "A", examName: "Mid-Term Examination", subject: "Biology", marksObtained: 85, maxMarks: 100, grade: "A", gp: 8.5 },
  { id: "res-5", studentId: "s-3", studentName: "Jackson Vance", className: "Class 10", section: "B", examName: "Mid-Term Examination", subject: "Mathematics", marksObtained: 72, maxMarks: 100, grade: "B-", gp: 7.2 },
  { id: "res-6", studentId: "s-6", studentName: "SYED ABDUL REHAMAN", className: "Class 10", section: "A", examName: "Mid-Term Examination", subject: "Biology", marksObtained: 96, maxMarks: 100, grade: "O", gp: 10.0 }
];

const initialNoteFiles: NoteFile[] = [
  { id: "note-101", title: "Unit 2: Cellular Biology & Genetics", description: "Comprehensive slide deck covering mitosis, meiosis, and DNA replication mechanisms.", subject: "Biology", className: "Class 10", uploadedBy: "u-teacher1", uploaderName: "Dr. Padmini", uploaderRole: "teacher", fileName: "cellular_biology_unit2.pdf", fileSize: "2.4 MB", contentUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...", createdAt: "2026-06-01T10:00:00Z" },
  { id: "note-102", title: "Calculus Foundations & Quadratic Functions", description: "Practice problem sets with complete step-by-step solutions for Grade 10 Math.", subject: "Mathematics", className: "Class 10", uploadedBy: "u-teacher2", uploaderName: "Prof. David Rowan", uploaderRole: "teacher", fileName: "quadratic_equations_workbook.pdf", fileSize: "1.8 MB", contentUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...", createdAt: "2026-06-02T14:30:00Z" }
];

const initialNotificationLogs: NotificationLog[] = [
  { id: "notif-1", toEmail: "richard.carter@gmail.com", recipientName: "Richard Carter", subject: "Daily Attendance Alert: SYED HUSSAIN Marked Present", message: "Dear Parent, your ward SYED HUSSAIN was recorded PRESENT for Class 10-A on 2026-06-04.", sentAt: "2026-06-04T08:45:00Z", status: "delivered" },
  { id: "notif-2", toEmail: "maria.martinez@hotmail.com", recipientName: "Maria Martinez", subject: "Monthly Attendance Summary", message: "Dear Parent, Sophia Martinez's attendance percentage for June has been calculated at 96.5%.", sentAt: "2026-06-04T17:45:00Z", status: "delivered" }
];

const initialSubscription: SubscriptionInfo = {
  currentPlanId: "plan-growth",
  institutionName: "K.N.S INSTITUTE OF TECHNOLOGY",
  status: "active",
  expiresAt: "2026-12-31T23:59:59Z",
  cardLast4: "4242"
};

const initialInvoices: Invoice[] = [
  { id: "inv-101", date: "2026-06-01", amount: 49.00, planName: "Growth Tier (Up to 500 Students)", status: "paid" },
  { id: "inv-100", date: "2026-05-01", amount: 49.00, planName: "Growth Tier (Up to 500 Students)", status: "paid" }
];

const initialStudentFees = [
  { id: "fee-101", studentId: "s-1", feeName: "Tuition Fee - Q1 Term", amount: 1200, dueDate: "2026-04-15", status: "paid", paidAt: "2026-04-12T10:15:00Z", paymentMethod: "UPI", transactionId: "TXN981723490" },
  { id: "fee-102", studentId: "s-1", feeName: "Hostel Fee - Semi-Annual", amount: 800, dueDate: "2026-05-15", status: "paid", paidAt: "2026-05-10T14:30:00Z", paymentMethod: "Card", transactionId: "TXN102834091" },
  { id: "fee-103", studentId: "s-1", feeName: "Tuition Fee - Q2 Term", amount: 1200, dueDate: "2026-07-15", status: "pending" },
  { id: "fee-104", studentId: "s-1", feeName: "University Examination Fee", amount: 150, dueDate: "2026-06-30", status: "pending" },
  { id: "fee-201", studentId: "s-6", feeName: "Tuition Fee - Q1 Term", amount: 1200, dueDate: "2026-04-15", status: "paid", paidAt: "2026-04-10T09:45:00Z", paymentMethod: "NetBanking", transactionId: "TXN748123019" },
  { id: "fee-202", studentId: "s-6", feeName: "University Examination Fee", amount: 150, dueDate: "2026-06-30", status: "pending" },
  { id: "fee-203", studentId: "s-6", feeName: "Annual Lab & Internet Charges", amount: 350, dueDate: "2026-06-15", status: "overdue" },
  { id: "fee-301", studentId: "s-2", feeName: "Tuition Fee - Q2 Term", amount: 1200, dueDate: "2026-07-15", status: "pending" },
  { id: "fee-302", studentId: "s-3", feeName: "Tuition Fee - Q2 Term", amount: 1200, dueDate: "2026-07-15", status: "pending" },
  { id: "fee-303", studentId: "s-4", feeName: "Tuition Fee - Q2 Term", amount: 1200, dueDate: "2026-07-15", status: "pending" },
  { id: "fee-304", studentId: "s-5", feeName: "Tuition Fee - Q2 Term", amount: 1200, dueDate: "2026-07-15", status: "pending" }
];

export async function seedDatabaseIfEmpty() {
  await initializeSchemas();
  if (!sqliteDb) return;

  try {
    const row = sqliteDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    if (row && row.count > 0) return;

    const insertUser = sqliteDb.prepare("INSERT OR REPLACE INTO users (id, username, name, role, email, avatarUrl, classAllocated, subjectSpecialty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const u of initialUsers) {
      insertUser.run(u.id, u.username, u.name, u.role, u.email, u.avatarUrl || null, u.classAllocated || null, u.subjectSpecialty || null);
    }

    const insertStudent = sqliteDb.prepare("INSERT OR REPLACE INTO students (id, name, rollNumber, gender, address, phone, parentName, parentEmail, parentPhone, className, section, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const s of initialStudents) {
      insertStudent.run(s.id, s.name, s.rollNumber, s.gender, s.address, s.phone, s.parentName, s.parentEmail, s.parentPhone, s.className, s.section, s.avatarUrl || null);
    }

    const insertTeacher = sqliteDb.prepare("INSERT OR REPLACE INTO teachers (id, name, email, phone, department, subjects, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const t of initialTeachers) {
      insertTeacher.run(t.id, t.name, t.email, t.phone, t.department, JSON.stringify(t.subjects), t.avatarUrl || null);
    }

    const insertAttendance = sqliteDb.prepare("INSERT OR REPLACE INTO attendanceRecords (id, studentId, studentName, className, section, date, status, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const a of initialAttendanceRecords) {
      insertAttendance.run(a.id, a.studentId, a.studentName, a.className, a.section, a.date, a.status, a.remarks || null);
    }

    const insertTimetable = sqliteDb.prepare("INSERT OR REPLACE INTO timetablePeriods (id, className, section, day, subject, teacherId, teacherName, startTime, endTime, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const tt of initialTimetablePeriods) {
      insertTimetable.run(tt.id, tt.className, tt.section, tt.day, tt.subject, tt.teacherId, tt.teacherName, tt.startTime, tt.endTime, tt.room);
    }

    const insertResult = sqliteDb.prepare("INSERT OR REPLACE INTO examResults (id, studentId, studentName, className, section, examName, subject, marksObtained, maxMarks, grade, gp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const r of initialExamResults) {
      insertResult.run(r.id, r.studentId, r.studentName, r.className, r.section, r.examName, r.subject, r.marksObtained, r.maxMarks, r.grade, r.gp);
    }

    const insertNote = sqliteDb.prepare("INSERT OR REPLACE INTO noteFiles (id, title, description, subject, className, uploadedBy, uploaderName, uploaderRole, fileName, fileSize, contentUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const n of initialNoteFiles) {
      insertNote.run(n.id, n.title, n.description, n.subject, n.className, n.uploadedBy, n.uploaderName, n.uploaderRole, n.fileName, n.fileSize, n.contentUrl, n.createdAt);
    }

    const insertNotification = sqliteDb.prepare("INSERT OR REPLACE INTO notificationLogs (id, toEmail, recipientName, subject, message, sentAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const n of initialNotificationLogs) {
      insertNotification.run(n.id, n.toEmail, n.recipientName, n.subject, n.message, n.sentAt, n.status);
    }

    const insertInvoice = sqliteDb.prepare("INSERT OR REPLACE INTO invoices (id, date, amount, planName, status) VALUES (?, ?, ?, ?, ?)");
    for (const inv of initialInvoices) {
      insertInvoice.run(inv.id, inv.date, inv.amount, inv.planName, inv.status);
    }

    const insertFee = sqliteDb.prepare("INSERT OR REPLACE INTO studentFees (id, studentId, feeName, amount, dueDate, status, paidAt, paymentMethod, transactionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const fee of initialStudentFees) {
      insertFee.run(fee.id, fee.studentId, fee.feeName, fee.amount, fee.dueDate, fee.status, fee.paidAt || null, fee.paymentMethod || null, fee.transactionId || null);
    }

    const insertSub = sqliteDb.prepare("INSERT OR REPLACE INTO subscriptionSettings (id, currentPlanId, institutionName, status, expiresAt, cardLast4) VALUES (?, ?, ?, ?, ?, ?)");
    insertSub.run("current", initialSubscription.currentPlanId, initialSubscription.institutionName, initialSubscription.status, initialSubscription.expiresAt, initialSubscription.cardLast4 || null);

    console.log("Local SQLite database initialized with baseline seeds.");
  } catch (error) {
    console.error("Seed execution error:", error);
  }
}

// Data Access API Functions

export async function getUsers(): Promise<User[]> {
  const rows = sqliteDb.prepare("SELECT * FROM users").all() as any[];
  return rows.map(r => ({
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role,
    email: r.email,
    avatarUrl: r.avatarUrl || undefined,
    classAllocated: r.classAllocated || undefined,
    subjectSpecialty: r.subjectSpecialty || undefined
  }));
}

export async function saveUser(user: User): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO users (id, username, name, role, email, avatarUrl, classAllocated, subjectSpecialty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    user.id,
    user.username,
    user.name,
    user.role,
    user.email,
    user.avatarUrl || null,
    user.classAllocated || null,
    user.subjectSpecialty || null
  );
}

export async function getStudents(): Promise<Student[]> {
  const rows = sqliteDb.prepare("SELECT * FROM students").all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    rollNumber: r.rollNumber,
    gender: r.gender,
    address: r.address,
    phone: r.phone,
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    parentPhone: r.parentPhone,
    className: r.className,
    section: r.section,
    avatarUrl: r.avatarUrl || undefined
  }));
}

export async function addStudent(student: Student): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO students (id, name, rollNumber, gender, address, phone, parentName, parentEmail, parentPhone, className, section, avatarUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    student.id,
    student.name,
    student.rollNumber,
    student.gender,
    student.address,
    student.phone,
    student.parentName,
    student.parentEmail,
    student.parentPhone,
    student.className,
    student.section,
    student.avatarUrl || null
  );
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
  const fields = Object.keys(updates);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const values = fields.map(f => (updates as any)[f]);
    const stmt = sqliteDb.prepare(`UPDATE students SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);
  }
  const students = await getStudents();
  return students.find(s => s.id === id);
}

export async function deleteStudent(id: string): Promise<void> {
  sqliteDb.prepare("DELETE FROM students WHERE id = ?").run(id);
}

export async function getStudentFees(studentId?: string): Promise<any[]> {
  if (studentId) {
    return sqliteDb.prepare("SELECT * FROM studentFees WHERE studentId = ?").all(studentId) as any[];
  }
  return sqliteDb.prepare("SELECT * FROM studentFees").all() as any[];
}

export async function getStudentFeeById(feeId: string): Promise<any> {
  return sqliteDb.prepare("SELECT * FROM studentFees WHERE id = ?").get(feeId) as any;
}

export async function updateStudentFee(feeId: string, updates: any): Promise<void> {
  const fields = Object.keys(updates);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const values = fields.map(f => (updates as any)[f]);
    const stmt = sqliteDb.prepare(`UPDATE studentFees SET ${setClause} WHERE id = ?`);
    stmt.run(...values, feeId);
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  const rows = sqliteDb.prepare("SELECT * FROM teachers").all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    department: r.department,
    subjects: JSON.parse(r.subjects || "[]"),
    avatarUrl: r.avatarUrl || undefined
  }));
}

export async function addTeacher(teacher: Teacher): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO teachers (id, name, email, phone, department, subjects, avatarUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    teacher.id,
    teacher.name,
    teacher.email,
    teacher.phone,
    teacher.department,
    JSON.stringify(teacher.subjects),
    teacher.avatarUrl || null
  );
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | undefined> {
  if (updates.subjects) {
    (updates as any).subjects = JSON.stringify(updates.subjects);
  }
  const fields = Object.keys(updates);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const values = fields.map(f => (updates as any)[f]);
    const stmt = sqliteDb.prepare(`UPDATE teachers SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);
  }
  const teachers = await getTeachers();
  return teachers.find(t => t.id === id);
}

export async function deleteTeacher(id: string): Promise<void> {
  sqliteDb.prepare("DELETE FROM teachers WHERE id = ?").run(id);
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const rows = sqliteDb.prepare("SELECT * FROM attendanceRecords").all() as any[];
  return rows.map(r => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    className: r.className,
    section: r.section,
    date: r.date,
    status: r.status as any,
    remarks: r.remarks || undefined
  }));
}

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO attendanceRecords (id, studentId, studentName, className, section, date, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    record.id,
    record.studentId,
    record.studentName,
    record.className,
    record.section,
    record.date,
    record.status,
    record.remarks || null
  );
}

export async function deleteAttendanceForDay(classNameOrStudentId: string, sectionOrDate: string, date?: string): Promise<void> {
  if (date) {
    sqliteDb.prepare("DELETE FROM attendanceRecords WHERE className = ? AND section = ? AND date = ?").run(classNameOrStudentId, sectionOrDate, date);
  } else {
    sqliteDb.prepare("DELETE FROM attendanceRecords WHERE studentId = ? AND date = ?").run(classNameOrStudentId, sectionOrDate);
  }
}

export async function getTimetable(): Promise<TimetablePeriod[]> {
  const rows = sqliteDb.prepare("SELECT * FROM timetablePeriods").all() as any[];
  return rows.map(r => ({
    id: r.id,
    className: r.className,
    section: r.section,
    day: r.day as any,
    subject: r.subject,
    teacherId: r.teacherId,
    teacherName: r.teacherName,
    startTime: r.startTime,
    endTime: r.endTime,
    room: r.room
  }));
}

export async function addTimetablePeriod(period: TimetablePeriod): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO timetablePeriods (id, className, section, day, subject, teacherId, teacherName, startTime, endTime, room)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    period.id,
    period.className,
    period.section,
    period.day,
    period.subject,
    period.teacherId,
    period.teacherName,
    period.startTime,
    period.endTime,
    period.room
  );
}

export async function deleteTimetablePeriod(id: string): Promise<void> {
  sqliteDb.prepare("DELETE FROM timetablePeriods WHERE id = ?").run(id);
}

export async function getNotes(): Promise<NoteFile[]> {
  const rows = sqliteDb.prepare("SELECT * FROM noteFiles ORDER BY createdAt DESC").all() as any[];
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    subject: r.subject,
    className: r.className,
    uploadedBy: r.uploadedBy,
    uploaderName: r.uploaderName,
    uploaderRole: r.uploaderRole as any,
    fileName: r.fileName,
    fileSize: r.fileSize,
    contentUrl: r.contentUrl,
    createdAt: r.createdAt
  }));
}

export async function addNote(note: NoteFile): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO noteFiles (id, title, description, subject, className, uploadedBy, uploaderName, uploaderRole, fileName, fileSize, contentUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    note.id,
    note.title,
    note.description,
    note.subject,
    note.className,
    note.uploadedBy,
    note.uploaderName,
    note.uploaderRole,
    note.fileName,
    note.fileSize,
    note.contentUrl,
    note.createdAt
  );
}

export async function deleteNote(id: string): Promise<void> {
  sqliteDb.prepare("DELETE FROM noteFiles WHERE id = ?").run(id);
}

export async function getResults(): Promise<ExamResult[]> {
  const rows = sqliteDb.prepare("SELECT * FROM examResults").all() as any[];
  return rows.map(r => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    className: r.className,
    section: r.section,
    examName: r.examName,
    subject: r.subject,
    marksObtained: r.marksObtained,
    maxMarks: r.maxMarks,
    grade: r.grade,
    gp: r.gp
  }));
}

export async function addResult(result: ExamResult): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO examResults (id, studentId, studentName, className, section, examName, subject, marksObtained, maxMarks, grade, gp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    result.id,
    result.studentId,
    result.studentName,
    result.className,
    result.section,
    result.examName,
    result.subject,
    result.marksObtained,
    result.maxMarks,
    result.grade,
    result.gp
  );
}

export async function getNotifications(): Promise<NotificationLog[]> {
  const rows = sqliteDb.prepare("SELECT * FROM notificationLogs ORDER BY sentAt DESC").all() as any[];
  return rows.map(r => ({
    id: r.id,
    toEmail: r.toEmail,
    recipientName: r.recipientName,
    subject: r.subject,
    message: r.message,
    sentAt: r.sentAt,
    status: r.status as any
  }));
}

export async function addNotificationLog(log: NotificationLog): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO notificationLogs (id, toEmail, recipientName, subject, message, sentAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    log.id,
    log.toEmail,
    log.recipientName,
    log.subject,
    log.message,
    log.sentAt,
    log.status
  );
}

export async function getSubscription(): Promise<SubscriptionInfo> {
  const r = sqliteDb.prepare("SELECT * FROM subscriptionSettings WHERE id = 'current'").get() as any;
  if (!r) return initialSubscription;
  return {
    currentPlanId: r.currentPlanId,
    institutionName: r.institutionName,
    status: r.status as any,
    expiresAt: r.expiresAt,
    cardLast4: r.cardLast4 || undefined
  };
}

export async function updateSubscription(updates: Partial<SubscriptionInfo>): Promise<void> {
  const fields = Object.keys(updates);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const values = fields.map(f => (updates as any)[f]);
    const stmt = sqliteDb.prepare(`UPDATE subscriptionSettings SET ${setClause} WHERE id = 'current'`);
    stmt.run(...values);
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  const rows = sqliteDb.prepare("SELECT * FROM invoices").all() as any[];
  return rows.map(r => ({
    id: r.id,
    date: r.date,
    amount: r.amount,
    planName: r.planName,
    status: r.status as any
  }));
}

export async function addInvoice(invoice: Invoice): Promise<void> {
  const stmt = sqliteDb.prepare(`
    INSERT OR REPLACE INTO invoices (id, date, amount, planName, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    invoice.id,
    invoice.date,
    invoice.amount,
    invoice.planName,
    invoice.status
  );
}
