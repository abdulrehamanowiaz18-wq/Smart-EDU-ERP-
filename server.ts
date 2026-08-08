import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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
} from "./src/types.ts";
import {
  seedDatabaseIfEmpty,
  getUsers,
  saveUser,
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getAttendance,
  saveAttendanceRecord,
  deleteAttendanceForDay,
  getTimetable,
  addTimetablePeriod,
  deleteTimetablePeriod,
  getNotes,
  addNote,
  deleteNote,
  getResults,
  addResult,
  getNotifications,
  addNotificationLog,
  getSubscription,
  updateSubscription,
  getInvoices,
  addInvoice
} from "./src/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize and Auto-seed Firebase database
  await seedDatabaseIfEmpty();

  const saasPlans: SaaSPlan[] = [
    { id: "plan-free", name: "Free Startup Starter", price: "Free", priceNumeric: 0, billingPeriod: "month", studentLimit: 100, features: ["Up to 100 students limit", "Basic Daily Attendance", "Timetable scheduler", "Shared Class Drive (up to 100MB)", "Standard Community Support"] },
    { id: "plan-growth", name: "School Growth Tier", price: "$49", priceNumeric: 49, billingPeriod: "month", studentLimit: 500, features: ["Up to 500 students limit", "Detailed Exam & GPA Results system", "Dynamic Attendance analytics reports", "Unlimited Notes & File repositories", "Sandbox Stripe Payments Integration", "Automated parent email dispatch alerts", "Priority 24/7 technical support"] },
    { id: "plan-enterprise", name: "District Enterprise", price: "$149", priceNumeric: 149, billingPeriod: "month", studentLimit: 5000, features: ["Up to 5,000 students limit", "SaaS multi-branch setup architecture", "Advanced comparative GPA prediction", "Dedicated account school administrators", "High availability cloud structures", "Real-world Custom SMTP Email Servers", "Developer REST APIs access keys"] }
  ];

  // Helper to dispatch notification internally and store to database
  const logNotification = async (toEmail: string, recipientName: string, subject: string, message: string) => {
    const newLog: NotificationLog = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      toEmail: toEmail || "parent@example.com",
      recipientName: recipientName || "Parent / Recipient",
      subject: subject || "SmartEdu ERP Notification Alert",
      message: message || "",
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };
    await addNotificationLog(newLog);
    return newLog;
  };

  // ==========================================
  // API ROUTING SECTION
  // ==========================================

  // Authentication API
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username } = req.body;
      const users = await getUsers();
      
      const match = users.find(u => u.username.toLowerCase() === (username || "").toLowerCase());
      
      if (match) {
        return res.json({
          success: true,
          user: match,
          token: `mock-jwt-token-for-${match.id}-${Date.now()}`
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials. Try using 'admin', 'padmini', 'david', or 'syed'."
        });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Students API
  app.get("/api/students", async (req, res) => {
    try {
      const students = await getStudents();
      res.json(students);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const data = req.body;
      if (!data.name || !data.rollNumber || !data.className) {
        return res.status(400).json({ error: "Missing required student attributes" });
      }
      
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        name: data.name,
        rollNumber: data.rollNumber,
        gender: data.gender || "Other",
        address: data.address || "",
        phone: data.phone || "",
        parentName: data.parentName || "",
        parentEmail: data.parentEmail || "",
        parentPhone: data.parentPhone || "",
        className: data.className,
        section: data.section || "A"
      };

      await addStudent(newStudent);

      // Auto-create Student user account if doesn't exist
      const username = data.name.toLowerCase().replace(/\s+/g, "");
      const newStudentUser: User = {
        id: `u-${newStudent.id}`,
        username,
        name: newStudent.name,
        role: 'student',
        email: `${username}@student.com`,
        classAllocated: `${newStudent.className}-${newStudent.section}`
      };
      await saveUser(newStudentUser);

      // Notify Parent via automated email log
      await logNotification(
        newStudent.parentEmail || "parent@example.com",
        newStudent.parentName || "Parent",
        `Welcome to SmartEdu ERP - ${newStudent.name} Account Onboarded`,
        `Dear ${newStudent.parentName || "Parent"},\n\nWe are delighted to inform you that your child, ${newStudent.name}, has been registered successfully on SmartEdu ERP for ${newStudent.className}-${newStudent.section}. You can now view their academic timeline, timetables, and daily attendance reports online.`
      );

      res.status(201).json(newStudent);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const students = await getStudents();
      const student = students.find(s => s.id === id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const updated = await updateStudent(id, {
        name: data.name ?? student.name,
        rollNumber: data.rollNumber ?? student.rollNumber,
        gender: data.gender ?? student.gender,
        address: data.address ?? student.address,
        phone: data.phone ?? student.phone,
        parentName: data.parentName ?? student.parentName,
        parentEmail: data.parentEmail ?? student.parentEmail,
        parentPhone: data.parentPhone ?? student.parentPhone,
        className: data.className ?? student.className,
        section: data.section ?? student.section,
        avatarUrl: data.avatarUrl ?? student.avatarUrl
      });

      // Maintain users record synchronized
      const users = await getUsers();
      const userMatch = users.find(u => u.id === `u-${id}` || u.name.toLowerCase() === updated.name.toLowerCase());
      if (userMatch) {
        userMatch.name = updated.name;
        userMatch.avatarUrl = updated.avatarUrl || userMatch.avatarUrl;
        await saveUser(userMatch);
      }

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteStudent(id);
      res.json({ success: true, message: "Student deleted" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Student Fees API
  app.get("/api/students/:studentId/fees", async (req, res) => {
    try {
      const { studentId } = req.params;
      const fees = await getStudentFees(studentId);
      res.json(fees);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/students/:studentId/pay-fee", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { feeId, paymentMethod } = req.body;

      const fee = await getStudentFeeById(feeId);
      if (!fee || fee.studentId !== studentId) {
        return res.status(404).json({ error: "Fee record not found" });
      }

      if (fee.status === "paid") {
        return res.status(400).json({ error: "Fee has already been successfully deposited" });
      }

      // Process sandbox payment simulation real update
      const paidAt = new Date().toISOString();
      const txnId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      await updateStudentFee(feeId, {
        status: "paid",
        paidAt,
        paymentMethod: paymentMethod || "UPI",
        transactionId: txnId
      });

      fee.status = "paid";
      fee.paidAt = paidAt;
      fee.paymentMethod = paymentMethod || "UPI";
      fee.transactionId = txnId;

      // Generate notification for compliance log
      const students = await getStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        await logNotification(
          student.parentEmail || "parent@knsit.edu.in",
          `${student.parentName} (Parent of ${student.name})`,
          `SmartEdu ERP: Fee Payment Successful - ${fee.feeName}`,
          `Dear Parent,\n\nWe have successfully received payment of $${fee.amount}.00 for '${fee.feeName}' on behalf of student ${student.name}. \n\nTransaction ID: ${fee.transactionId}\nPaid At: ${fee.paidAt}\nPayment Method: ${fee.paymentMethod}\n\nThank you for choosing SmartEdu ERP secure payment gateway.`
        );
      }

      res.json({ success: true, message: "Fee payment processed successfully", fee });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Teachers API
  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await getTeachers();
      res.json(teachers);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const data = req.body;
      if (!data.name || !data.email || !data.department) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        department: data.department,
        subjects: Array.isArray(data.subjects) ? data.subjects : (data.subjects ? [data.subjects] : [])
      };

      await addTeacher(newTeacher);

      // Onboard user
      const username = data.name.toLowerCase().replace(/\s+/g, "").split(".")[0] || "teacher";
      const newTeacherUser: User = {
        id: `u-${newTeacher.id}`,
        username,
        name: newTeacher.name,
        role: 'teacher',
        email: newTeacher.email,
        subjectSpecialty: newTeacher.department
      };
      await saveUser(newTeacherUser);

      await logNotification(
        newTeacher.email,
        newTeacher.name,
        `Welcome to Oakland Faculty: SmartEdu ERP Credentials`,
        `Dear ${newTeacher.name},\n\nYour instructor dashboard access credential has been successfully provisioned on SmartEdu ERP. You are allocated department '${newTeacher.department}'. You can now post study notes, take digital student attendance rosters, and upload mid/end term result cards.`
      );

      res.status(201).json(newTeacher);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const teachers = await getTeachers();
      const teacher = teachers.find(t => t.id === id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const updated = await updateTeacher(id, {
        name: data.name ?? teacher.name,
        email: data.email ?? teacher.email,
        phone: data.phone ?? teacher.phone,
        department: data.department ?? teacher.department,
        subjects: data.subjects ?? teacher.subjects,
        avatarUrl: data.avatarUrl ?? teacher.avatarUrl
      });

      // Keep users record synchronized
      const users = await getUsers();
      const userMatch = users.find(u => u.id === `u-${id}` || u.name.toLowerCase() === updated.name.toLowerCase());
      if (userMatch) {
        userMatch.name = updated.name;
        userMatch.email = updated.email;
        userMatch.avatarUrl = updated.avatarUrl || userMatch.avatarUrl;
        userMatch.subjectSpecialty = updated.department;
        await saveUser(userMatch);
      }

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteTeacher(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Attendance API
  app.get("/api/attendance", async (req, res) => {
    try {
      const { className, section, date } = req.query;
      let filtered = await getAttendance();
      if (className) filtered = filtered.filter(a => a.className === className);
      if (section) filtered = filtered.filter(a => a.section === section);
      if (date) filtered = filtered.filter(a => a.date === date);
      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const { records, date, className, section } = req.body; // array of { studentId, studentName, status, remarks }
      if (!records || !date || !className) {
        return res.status(400).json({ error: "Missing payload attributes" });
      }

      const students = await getStudents();

      for (const rec of records) {
        // Clean up pre-existing records matching student and date
        await deleteAttendanceForDay(rec.studentId, date);
        
        const newRec: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: rec.studentId,
          studentName: rec.studentName,
          className,
          section: section || "A",
          date,
          status: rec.status,
          remarks: rec.remarks || ""
        };
        await saveAttendanceRecord(newRec);

        // Notify parents of absence
        if (rec.status === 'absent') {
          const studentInfo = students.find(s => s.id === rec.studentId);
          if (studentInfo?.parentEmail) {
            await logNotification(
              studentInfo.parentEmail,
              studentInfo.parentName,
              `ALERT: ${studentInfo.name} marked Absent today`,
              `Dear ${studentInfo.parentName},\n\nWe notice that your child, ${studentInfo.name}, was marked ABSENT today (${date}) during normal digital roll calls. Please submit an excuse application if they are unwell or have a primary home obligation.`
            );
          }
        }
      }

      res.json({ success: true, count: records.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Timetables API
  app.get("/api/timetable", async (req, res) => {
    try {
      const timetable = await getTimetable();
      res.json(timetable);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/timetable", async (req, res) => {
    try {
      const data = req.body;
      const newPeriod: TimetablePeriod = {
        id: `tt-${Date.now()}`,
        className: data.className,
        section: data.section || "A",
        day: data.day,
        subject: data.subject,
        teacherId: data.teacherId || "unknown",
        teacherName: data.teacherName || "Assigned Faculty",
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || "Room 101"
      };
      await addTimetablePeriod(newPeriod);
      res.status(201).json(newPeriod);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/timetable/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteTimetablePeriod(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Notes/Document Center
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await getNotes();
      res.json(notes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const { title, description, subject, className, uploadedBy, uploaderName, uploaderRole, fileName, fileSize, contentUrl } = req.body;
      const newNote: NoteFile = {
        id: `note-${Date.now()}`,
        title,
        description,
        subject,
        className,
        uploadedBy: uploadedBy || "u-teacher1",
        uploaderName: uploaderName || "Faculty Instructor",
        uploaderRole: uploaderRole || "teacher",
        fileName: fileName || "notes_attachment.pdf",
        fileSize: fileSize || "1.2 MB",
        contentUrl: contentUrl || "data:text/plain;base64,U2ltdWxhdGVkIGZpbGU=",
        createdAt: new Date().toISOString()
      };
      
      await addNote(newNote);

      const students = await getStudents();
      const targetStudents = students.filter(s => s.className === className);
      
      for (const s of targetStudents) {
        if (s.parentEmail) {
          await logNotification(
            s.parentEmail,
            s.parentName,
            `New Material Uploaded for ${className}: ${title}`,
            `Dear Parent,\n\nA new class study material, '${title}' (${subject}), has been shared by ${uploaderName} for ${className}. Students are encouraged to download and review before upcoming exam milestones.`
          );
        }
      }

      res.status(201).json(newNote);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteNote(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Results API
  app.get("/api/results", async (req, res) => {
    try {
      const results = await getResults();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/results", async (req, res) => {
    try {
      const data = req.body;
      const grading = (pct: number) => {
        if (pct >= 90) return { grade: "A+", gp: 10.0 };
        if (pct >= 80) return { grade: "A", gp: 9.0 };
        if (pct >= 70) return { grade: "B", gp: 8.0 };
        if (pct >= 60) return { grade: "C", gp: 7.0 };
        if (pct >= 50) return { grade: "D", gp: 6.0 };
        return { grade: "F", gp: 0.0 };
      };

      const ratio = Math.round((data.marksObtained / data.maxMarks) * 100);
      const score = grading(ratio);

      const newResult: ExamResult = {
        id: `res-${Date.now()}`,
        studentId: data.studentId,
        studentName: data.studentName,
        className: data.className,
        section: data.section || "A",
        examName: data.examName || "Mid-Term",
        subject: data.subject,
        marksObtained: Number(data.marksObtained),
        maxMarks: Number(data.maxMarks),
        grade: score.grade,
        gp: score.gp
      };

      await addResult(newResult);

      // Dynamic parent notification
      const students = await getStudents();
      const studentInfo = students.find(s => s.id === data.studentId);
      if (studentInfo && studentInfo.parentEmail) {
        await logNotification(
          studentInfo.parentEmail,
          studentInfo.parentName,
          `Report Card Update: ${studentInfo.name} - ${data.subject}`,
          `Dear ${studentInfo.parentName},\n\nThe outcome score for ${studentInfo.name} in '${data.subject}' (${data.examName}) has been finalized and uploaded: ${data.marksObtained}/${data.maxMarks} (${score.grade}, Grade Point: ${score.gp}).`
        );
      }

      res.status(201).json(newResult);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Email Notifications Logging API
  app.get("/api/notifications", async (req, res) => {
    try {
      const logs = await getNotifications();
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Billing & Subscription Management Flow
  app.get("/api/billing/info", async (req, res) => {
    try {
      const sub = await getSubscription();
      const invoices = await getInvoices();
      res.json({
        subscription: sub,
        invoices,
        plans: saasPlans
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Simulated Secure Stripe Checkout
  app.post("/api/billing/checkout", async (req, res) => {
    try {
      const { planId, last4, institutionName } = req.body;
      const selectedPlan = saasPlans.find(p => p.id === planId);
      
      if (!selectedPlan) {
        return res.status(404).json({ error: "Invalid SaaS plan selected" });
      }

      // Update in-memory sandbox checkout status
      const updatedSub: SubscriptionInfo = {
        currentPlanId: planId,
        institutionName: institutionName || "SmartEdu ERP School",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cardLast4: last4 || "4242"
      };

      await updateSubscription(updatedSub);

      // Register invoice
      if (selectedPlan.priceNumeric > 0) {
        const listInvoices = await getInvoices();
        const newInvoice: Invoice = {
          id: `inv-10${listInvoices.length + 2}`,
          date: new Date().toISOString().split('T')[0],
          amount: selectedPlan.priceNumeric,
          planName: `${selectedPlan.name} (${selectedPlan.studentLimit} Students limit)`,
          status: "paid"
        };
        await addInvoice(newInvoice);
      }

      // Dispatch system setup confirmations
      await logNotification(
        "admin@smartedu-erp.com",
        "Executive School Board",
        `Invoice Paid & SaaS Plan Upgraded: ${selectedPlan.name}`,
        `Thank you for subscribing to SmartEdu ERP. Your licensing has been upgraded to ${selectedPlan.name} with up to ${selectedPlan.studentLimit} concurrent student capacity. Sandbox secure transaction was successfully authorized via Stripe.`
      );

      const latestInvoices = await getInvoices();
      res.json({
        success: true,
        message: "Sandbox subscription authorized successfully via Stripe test payment gateway.",
        subscription: updatedSub,
        invoices: latestInvoices
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Profile / User Update API
  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, avatarUrl, phone, department, address, rollNumber, parentName, parentEmail, parentPhone } = req.body;
      
      const users = await getUsers();
      const userMatch = users.find(u => u.id === id);
      if (!userMatch) {
        return res.status(404).json({ error: "User account not found" });
      }
      
      // Update master user info
      const updatedUser: User = {
        ...userMatch,
        name: name ?? userMatch.name,
        email: email ?? userMatch.email,
        avatarUrl: avatarUrl ?? userMatch.avatarUrl
      };

      // If student, synchronize with corresponding student entry
      if (updatedUser.role === 'student') {
        const students = await getStudents();
        const studentObj = students.find(s => s.name === updatedUser.name || `u-${s.id}` === id || s.id === id.replace("u-", ""));
        if (studentObj) {
          await updateStudent(studentObj.id, {
            name: name ?? studentObj.name,
            parentEmail: parentEmail ?? email ?? studentObj.parentEmail,
            phone: phone ?? studentObj.phone,
            address: address ?? studentObj.address,
            parentName: parentName ?? studentObj.parentName,
            parentPhone: parentPhone ?? studentObj.parentPhone,
            rollNumber: rollNumber ?? studentObj.rollNumber,
            avatarUrl: avatarUrl ?? studentObj.avatarUrl
          });
        }
      }

      // If teacher, synchronize with corresponding teacher entry
      if (updatedUser.role === 'teacher') {
        const teachers = await getTeachers();
        const teacherObj = teachers.find(t => t.name === updatedUser.name || `u-${t.id}` === id || t.id === id.replace("u-", ""));
        if (teacherObj) {
          await updateTeacher(teacherObj.id, {
            name: name ?? teacherObj.name,
            email: email ?? teacherObj.email,
            phone: phone ?? teacherObj.phone,
            department: department ?? teacherObj.department,
            avatarUrl: avatarUrl ?? teacherObj.avatarUrl
          });
          updatedUser.subjectSpecialty = department ?? updatedUser.subjectSpecialty;
        }
      }

      await saveUser(updatedUser);

      res.json({ success: true, user: updatedUser });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
  });

  // Load Vite assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartEdu ERP running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server bootstrap failure:", err);
});
