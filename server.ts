import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as firestoreService from "./src/db/firestoreService.ts";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-if-not-set",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function logActivity(userId: string, userName: string, userType: 'admin' | 'student', action: string) {
  try {
    await firestoreService.insertActivity({
      userId,
      userName,
      userType,
      action
    });
  } catch(e) { console.error('Error logging activity', e); }
}

async function triggerNotification(title: string, message: string, type: string, recipientId: string) {
  try {
    await firestoreService.insertNotification({
      title,
      message,
      type,
      recipientId,
      read: false
    });
  } catch(e) { console.error('Error triggering notification', e); }
}

async function generateStudentID() {
  const result = await firestoreService.getStudents();
  let maxNum = 0;
  const regex = /^EZT(\d+)$/;
  result.forEach(s => {
    if (s.studentId) {
      const match = s.studentId.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  const padded = String(maxNum + 1).padStart(4, '0');
  return `EZT${padded}`;
}

async function computeStats() {
  const allAttempts = await firestoreService.getAttempts();
  const testIds = Array.from(new Set(allAttempts.map(a => a.testId).filter(Boolean)));
  
  for (const testId of testIds) {
    const testAttempts = allAttempts.filter(a => a.testId === testId && a.status === 'submitted');
    
    // Group by studentId to keep only their best attempt for ranking calculation
    const bestAttemptMap = new Map();
    testAttempts.forEach(attempt => {
       const existing = bestAttemptMap.get(attempt.studentId);
       let isBetter = false;
       if (!existing) {
         isBetter = true;
       } else {
         if (attempt.score > existing.score) {
           isBetter = true;
         } else if (attempt.score === existing.score) {
            const timeA = attempt.submitTime && attempt.startTime ? new Date(attempt.submitTime).getTime() - new Date(attempt.startTime).getTime() : 0;
            const timeE = existing.submitTime && existing.startTime ? new Date(existing.submitTime).getTime() - new Date(existing.startTime).getTime() : 0;
            if (timeA && timeE && timeA < timeE) {
              isBetter = true;
            }
         }
       }
       if (isBetter) {
         bestAttemptMap.set(attempt.studentId, attempt);
       }
    });

    const uniqueBestAttempts = Array.from(bestAttemptMap.values());
    const sorted = [...uniqueBestAttempts].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeA = a.submitTime && a.startTime ? new Date(a.submitTime).getTime() - new Date(a.startTime).getTime() : 0;
      const timeB = b.submitTime && b.startTime ? new Date(b.submitTime).getTime() - new Date(b.startTime).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeA - timeB;
      
      const subA = a.submitTime ? new Date(a.submitTime).getTime() : 0;
      const subB = b.submitTime ? new Date(b.submitTime).getTime() : 0;
      return subA - subB;
    });

    const totalCount = sorted.length;
    for (let index = 0; index < sorted.length; index++) {
      const bestAttemptId = sorted[index].id;
      const rank = index + 1;
      const percentile = totalCount > 1 
        ? Math.round(((totalCount - rank) / (totalCount - 1)) * 100) 
        : 100;
        
      // Update ALL attempts for this student on this test to have this rank/percentile
      // so if they look at their history, the rank is their best rank or the rank of that attempt.
      // Wait, it's better to only set the rank on their BEST attempt, or update all.
      // Let's just update the attempt that earned the rank!
      await firestoreService.updateAttempt(bestAttemptId, { rank, percentile });
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Independent App Security Middleware
  app.use("/api", (req, res, next) => {
    // Only verify app publishable key if it's set in the environment
    const requiredKey = process.env.VITE_APP_PUBLISHABLE_KEY;
    if (requiredKey) {
      const clientKey = req.headers['x-publishable-key'];
      if (!clientKey || clientKey !== requiredKey) {
        return res.status(401).json({ error: "Unauthorized. Invalid or missing Publishable API Key." });
      }
    }
    next();
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Missing mobile number/ID or password." });
      }

      const ADMIN_MOBILE = "9987654321";
      const ADMIN_PASSWORD = await firestoreService.getAdminPassword();

      if (username === ADMIN_MOBILE && password === ADMIN_PASSWORD) {
        await logActivity('admin', 'Principal Admin', 'admin', 'Log in successful');
        return res.json({
          success: true,
          userType: "admin",
          user: { name: "Principal Admin", mobile: ADMIN_MOBILE, id: "admin" }
        });
      }

      const student = await firestoreService.getStudentByMobileOrId(username);

      if (!student || student.password !== password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      if (student.status === "Pending") return res.status(403).json({ error: "Pending Admin approval." });
      if (student.status === "Rejected") return res.status(403).json({ error: "Request rejected." });
      if (student.isBlocked) return res.status(403).json({ error: "Account blocked." });
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      let newStreak = student.streakCount || 0;
      
      if (student.lastLoginAt) {
        const lastLoginDate = new Date(student.lastLoginAt);
        const lastLoginStr = lastLoginDate.toISOString().split('T')[0];
        if (todayStr !== lastLoginStr) {
          const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastLoginStr).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      
      const updatedS = await firestoreService.updateStudent(student.id, {
        lastLoginAt: now.toISOString(),
        streakCount: newStreak
      });

      await logActivity(student.studentId, student.name, 'student', 'Log in successful');
      res.json({ success: true, userType: "student", user: updatedS });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, mobile, classVal, rollNumber, batchYear, password } = req.body;
      if (!name || !mobile || !classVal || !rollNumber || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const existing = await firestoreService.getStudentByMobileOrId(mobile);
      if (existing) {
        return res.status(409).json({ error: "Exists with this mobile" });
      }

      await firestoreService.insertStudent({
        id: 'stud-' + Math.random().toString(36).substring(2, 9),
        studentId: 'PENDING_' + Math.random().toString(36).substring(2, 9),
        name, mobile, classVal, rollNumber,
        batchYear: batchYear || "2025-2026",
        password,
        status: "Pending",
        isBlocked: false
      });

      await logActivity('register', name, 'student', `Registered request pending approval`);
      res.status(201).json({ success: true, message: "Registration submitted." });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/ranks/recalculate", async (req: Request, res: Response) => {
    try {
      await computeStats();
      await logActivity('admin', 'Principal Admin', 'admin', 'Triggered calculation');
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: "Failed" }); }
  });

  app.get("/api/db", async (req: Request, res: Response) => {
    try {
      const resStud = await firestoreService.getStudents();
      const resTests = await firestoreService.getTests();
      const resAtt = await firestoreService.getAttempts();
      const resNotif = await firestoreService.getNotifications();
      const resAct = await firestoreService.getActivities();
      
      // Sanitize students list to protect passwords from unauthorized access in typical bulk fetch payload
      const sanitizedStudents = resStud.map(s => {
        const { password, ...rest } = s;
        return rest;
      });
      
      res.json({
        students: sanitizedStudents,
        tests: resTests,
        attempts: resAtt,
        notifications: resNotif,
        activities: resAct,
        adminPassword: undefined // Explicitly obscure system-wide administrator password on the client-side API layer
      });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const { name, mobile, classVal, rollNumber, batchYear, password } = req.body;
      const sId = await generateStudentID();
      const studentObj = {
        id: 'stud-' + Math.random().toString(36).substring(2, 9),
        studentId: sId,
        name, mobile, classVal, rollNumber,
        batchYear: batchYear || "2025-2026",
        password,
        status: "Approved",
        isBlocked: false
      };
      await firestoreService.insertStudent(studentObj);
      await logActivity('admin', 'Admin', 'admin', `Created student: ${name}`);
      await triggerNotification('Admission Confirmed', `Welcome ${name}! ID: ${sId}`, 'system', sId);
      const { password: _, ...sanitizedNewStudent } = studentObj as any;
      res.json({ success: true, student: sanitizedNewStudent });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const up = await firestoreService.updateStudent(id, updateData);
      if(!up) return res.status(404).json({ error: "Not found" });
      await logActivity('admin', 'Admin', 'admin', `Modified student ${id}`);
      const { password: _, ...sanitizedUpdatedStudent } = up;
      res.json({ success: true, student: sanitizedUpdatedStudent });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await firestoreService.deleteAttemptsByStudentId(id);
      await firestoreService.deleteStudent(id);
      await logActivity('admin', 'Admin', 'admin', `Deleted student ${id}`);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/students/:id/approve", async (req: Request, res: Response) => {
    try {
      const sId = await generateStudentID();
      const updated = await firestoreService.updateStudent(req.params.id, { status: 'Approved', studentId: sId });
      if(!updated) return res.status(404).json({error: 'Not found'});
      await logActivity('admin', 'Admin', 'admin', `Approved ${updated.name}`);
      await triggerNotification('Approved', `Your ID is ${sId}`, 'system', sId);
      res.json({ success: true, student: updated });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/students/:id/reject", async (req: Request, res: Response) => {
    try {
      const updated = await firestoreService.updateStudent(req.params.id, { status: 'Rejected' });
      res.json({ success: true, student: updated });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/students/:id/reset-password", async (req: Request, res: Response) => {
    try {
      const s = await firestoreService.updateStudent(req.params.id, { password: req.body.newPassword });
      if(s) await triggerNotification('Password Reset', 'Admin reset pwd', 'system', s.studentId);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/change-password", async (req: Request, res: Response) => {
    try {
      const ADMIN_PASSWORD = await firestoreService.getAdminPassword();
      if (req.body.currentPassword !== ADMIN_PASSWORD) return res.status(400).json({error: "Incorrect"});
      
      await firestoreService.updateAdminPassword(req.body.newPassword);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/students/:id/toggle-block", async (req: Request, res: Response) => {
    try {
      const s = await firestoreService.getStudentById(req.params.id);
      if(!s) return res.status(404).json({error: "Not found"});
      const updated = await firestoreService.updateStudent(req.params.id, { isBlocked: !s.isBlocked });
      res.json({ success: true, student: updated });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/tests", async (req: Request, res: Response) => {
    try {
      const { title, type, classVal, subject, date, startTime, endTime, duration, pdfName, pdfData, questionImages, answerKey } = req.body;
      let d = duration ? parseInt(duration, 10) : 60;
      if (type === 'live' && startTime && endTime) {
        d = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
      }
      const testObj = {
        id: 'test-' + Math.random().toString(36).substring(2, 9),
        title, type, classVal, subject,
        date: date || new Date().toISOString().split('T')[0],
        startTime: startTime || "", endTime: endTime || "", duration: d,
        pdfName: pdfName || "Mock.pdf", pdfData: pdfData || "",
        questionImages: questionImages || [], answerKey: answerKey || {},
        published: true,
        createdAt: new Date().toISOString()
      };
      const inserted = await firestoreService.insertTest(testObj);
      await triggerNotification(`New ${type} Test`, title, 'reminder', 'all');
      res.json({ success: true, test: inserted });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      const ud = { ...req.body };
      if(ud.type==='live' && ud.startTime && ud.endTime) {
        ud.duration = Math.round((new Date(ud.endTime).getTime() - new Date(ud.startTime).getTime()) / 60000);
      }
      const t = await firestoreService.updateTest(req.params.id, ud);
      res.json({ success: true, test: t });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      await firestoreService.deleteAttemptsByTestId(req.params.id);
      await firestoreService.deleteTest(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/tests/:id/upload-pdf", async (req: Request, res: Response) => {
    try {
      await firestoreService.updateTest(req.params.id, { pdfName: req.body.pdfName, pdfData: req.body.pdfData });
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/attempts", async (req: Request, res: Response) => {
    try {
      const { testId, studentId, studentName, answers, status } = req.body;
      const test = await firestoreService.getTestById(testId);
      if(!test) return res.status(404).json({error: "Test not found"});

      if (test.type === 'live') {
        const prevArray = await firestoreService.getAttemptsByStudentAndTest(studentId, testId, 'submitted');
        if(prevArray.length > 0) return res.status(400).json({error: "Already completed"});
      }

      const activeAttempts = await firestoreService.getAttemptsByStudentAndTest(studentId, testId, 'started');
      let attempt;

      if(activeAttempts.length === 0) {
        const attemptData = {
          id: 'att-' + Math.random().toString(36).substring(2, 9),
          testId, studentId, studentName, answers: answers || {},
          status: status || 'started', startTime: new Date().toISOString()
        };
        attempt = await firestoreService.insertAttempt(attemptData);
      } else {
        const updateData: any = { answers: { ...(activeAttempts[0].answers as any), ...(answers || {}) } };
        if(status === 'submitted') updateData.status = 'submitted';
        attempt = await firestoreService.updateAttempt(activeAttempts[0].id, updateData);
      }

      if(attempt.status === 'submitted') {
        let correct = 0, wrong = 0;
        const totalQ = Object.keys((test.answerKey as any) || {}).length || 10;
        Object.keys((test.answerKey as any) || {}).forEach((qKey) => {
          const cA = (test.answerKey as any)[qKey];
          const sA = (attempt.answers as any)[qKey];
          if(sA) { if(sA === cA) correct++; else wrong++; }
        });

        const ansCount = Object.keys(attempt.answers as any).length;
        const scoreUpdate = {
           submitTime: new Date().toISOString(),
           correctAnswers: correct,
           wrongAnswers: wrong,
           score: correct,
           accuracy: ansCount > 0 ? Math.round((correct/ansCount)*100) : 0
        };
        attempt = await firestoreService.updateAttempt(attempt.id, scoreUpdate);
        await computeStats();
        await triggerNotification('Result Generated', `Score: ${correct}/${totalQ}`, 'result', studentId);
      }
      res.json({ success: true, attempt });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `You are Aacharya. User message: ${req.body.message}` }] }],
      });
      res.json({ text: response.text });
    } catch (e: any) { res.status(500).json({ error: 'AI Error' }); }
  });

  app.post("/api/notifications/mark-read", async (req: Request, res: Response) => {
    try {
      await firestoreService.markNotificationsRead(req.body.studentId);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      await triggerNotification(req.body.title, req.body.message, req.body.type || 'announcement', req.body.recipientId || 'all');
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/gemini/chat", async (req: Request, res: Response) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: req.body.messages.map((m: any) => ({ role: m.role || "user", parts: [{ text: m.content || "" }] }))
      });
      res.json({ success: true, text: response.text });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/gemini/explain", async (req: Request, res: Response) => {
    try {
      let parts: any[] = [];
      if(req.body.imageBase64) parts.push({ inlineData: { data: req.body.imageBase64, mimeType: req.body.mimeType || "image/png" } });
      parts.push({ text: req.body.questionText || "Solve" });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: parts }]
      });
      res.json({ success: true, text: response.text });
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.use("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for full-stack integration...");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running at http://localhost:${PORT}`);
  });
}

startServer();
