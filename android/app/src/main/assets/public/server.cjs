var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/db/firestoreService.ts
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "citric-buckeye-4lsxp",
  appId: "1:671143637219:web:aac4861f872d64c09d95d6",
  apiKey: "AIzaSyAF3GqKxbC9tpunoq_wuu2z5Ro5s51Jb2k",
  authDomain: "citric-buckeye-4lsxp.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-044b1206-94dc-43f9-b122-4082f49907c0",
  storageBucket: "citric-buckeye-4lsxp.firebasestorage.app",
  messagingSenderId: "671143637219",
  measurementId: ""
};

// src/db/firestoreService.ts
if ((0, import_app.getApps)().length === 0) {
  try {
    (0, import_app.initializeApp)({
      projectId: firebase_applet_config_default.projectId
    });
    console.log("Firebase Admin initialized successfully with Project ID:", firebase_applet_config_default.projectId);
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    (0, import_app.initializeApp)();
  }
}
var firestoreDb = (0, import_firestore.getFirestore)(firebase_applet_config_default.firestoreDatabaseId);
function convertDoc(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  const res = { id: doc.id, ...data };
  for (const key of Object.keys(res)) {
    if (res[key] && typeof res[key] === "object" && typeof res[key].toDate === "function") {
      res[key] = res[key].toDate().toISOString();
    }
  }
  return res;
}
async function getStudents() {
  const snapshot = await firestoreDb.collection("students").get();
  return snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
}
async function getStudentByMobileOrId(username) {
  const snapshotMob = await firestoreDb.collection("students").where("mobile", "==", username).get();
  if (!snapshotMob.empty) {
    return convertDoc(snapshotMob.docs[0]);
  }
  const snapshotId = await firestoreDb.collection("students").where("studentId", "==", username).get();
  if (!snapshotId.empty) {
    return convertDoc(snapshotId.docs[0]);
  }
  const docRef = await firestoreDb.collection("students").doc(username).get();
  if (docRef.exists) {
    return convertDoc(docRef);
  }
  return null;
}
async function getStudentById(id) {
  const doc = await firestoreDb.collection("students").doc(id).get();
  return convertDoc(doc);
}
async function insertStudent(studentData) {
  const idValue = studentData.id || "stud-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...studentData,
    id: idValue,
    createdAt: studentData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  await firestoreDb.collection("students").doc(idValue).set(finalData);
  return finalData;
}
async function updateStudent(id, updateData) {
  const docRef = firestoreDb.collection("students").doc(id);
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === void 0) delete cleanData[key];
  });
  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}
async function deleteStudent(id) {
  await firestoreDb.collection("students").doc(id).delete();
}
async function getTests() {
  const snapshot = await firestoreDb.collection("tests").get();
  return snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
}
async function getTestById(id) {
  const doc = await firestoreDb.collection("tests").doc(id).get();
  return convertDoc(doc);
}
async function insertTest(testData) {
  const idValue = testData.id || "test-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...testData,
    id: idValue,
    createdAt: testData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  await firestoreDb.collection("tests").doc(idValue).set(finalData);
  return finalData;
}
async function updateTest(id, updateData) {
  const docRef = firestoreDb.collection("tests").doc(id);
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === void 0) delete cleanData[key];
  });
  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}
async function deleteTest(id) {
  await firestoreDb.collection("tests").doc(id).delete();
}
async function getAttempts() {
  const snapshot = await firestoreDb.collection("attempts").get();
  return snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
}
async function getAttemptsByStudentAndTest(studentId, testId, status) {
  let query = firestoreDb.collection("attempts").where("studentId", "==", studentId).where("testId", "==", testId);
  if (status) {
    query = query.where("status", "==", status);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
}
async function insertAttempt(attemptData) {
  const idValue = attemptData.id || "att-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...attemptData,
    id: idValue,
    startTime: attemptData.startTime instanceof Date ? attemptData.startTime.toISOString() : attemptData.startTime || (/* @__PURE__ */ new Date()).toISOString()
  };
  await firestoreDb.collection("attempts").doc(idValue).set(finalData);
  return finalData;
}
async function updateAttempt(id, updateData) {
  const docRef = firestoreDb.collection("attempts").doc(id);
  const cleanData = { ...updateData };
  delete cleanData.id;
  if (cleanData.startTime instanceof Date) cleanData.startTime = cleanData.startTime.toISOString();
  if (cleanData.submitTime instanceof Date) cleanData.submitTime = cleanData.submitTime.toISOString();
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === void 0) delete cleanData[key];
  });
  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}
async function deleteAttemptsByStudentId(studentId) {
  const snapshot = await firestoreDb.collection("attempts").where("studentId", "==", studentId).get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
async function deleteAttemptsByTestId(testId) {
  const snapshot = await firestoreDb.collection("attempts").where("testId", "==", testId).get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
async function getNotifications() {
  const snapshot = await firestoreDb.collection("notifications").get();
  const list = snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
async function insertNotification(notificationData) {
  const idValue = notificationData.id || "notif-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...notificationData,
    id: idValue,
    createdAt: notificationData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  await firestoreDb.collection("notifications").doc(idValue).set(finalData);
  return finalData;
}
async function markNotificationsRead(studentId) {
  const snapshot = await firestoreDb.collection("notifications").get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.recipientId === studentId || data.recipientId === "all") {
      batch.update(doc.ref, { read: true });
    }
  });
  await batch.commit();
}
async function getActivities() {
  const snapshot = await firestoreDb.collection("activities").get();
  const list = snapshot.docs.map((doc) => convertDoc(doc)).filter(Boolean);
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
async function insertActivity(activityData) {
  const idValue = activityData.id || "act-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...activityData,
    id: idValue,
    timestamp: activityData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
  await firestoreDb.collection("activities").doc(idValue).set(finalData);
  return finalData;
}
async function getAdminPassword() {
  const docRef = firestoreDb.collection("admin_settings").doc("global");
  const dSnapshot = await docRef.get();
  if (dSnapshot.exists) {
    return dSnapshot.data()?.adminPassword || "ezadmin01";
  } else {
    await docRef.set({ adminPassword: "ezadmin01" });
    return "ezadmin01";
  }
}
async function updateAdminPassword(pwd) {
  const docRef = firestoreDb.collection("admin_settings").doc("global");
  await docRef.set({ adminPassword: pwd });
}

// server.ts
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-if-not-set",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function logActivity(userId, userName, userType, action) {
  try {
    await insertActivity({
      userId,
      userName,
      userType,
      action
    });
  } catch (e) {
    console.error("Error logging activity", e);
  }
}
async function triggerNotification(title, message, type, recipientId) {
  try {
    await insertNotification({
      title,
      message,
      type,
      recipientId,
      read: false
    });
  } catch (e) {
    console.error("Error triggering notification", e);
  }
}
async function generateStudentID() {
  const result = await getStudents();
  let maxNum = 0;
  const regex = /^EZT(\d+)$/;
  result.forEach((s) => {
    if (s.studentId) {
      const match = s.studentId.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  const padded = String(maxNum + 1).padStart(4, "0");
  return `EZT${padded}`;
}
async function computeStats() {
  const allAttempts = await getAttempts();
  const testIds = Array.from(new Set(allAttempts.map((a) => a.testId).filter(Boolean)));
  for (const testId of testIds) {
    const testAttempts = allAttempts.filter((a) => a.testId === testId && a.status === "submitted");
    const sorted = [...testAttempts].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeA = a.submitTime ? new Date(a.submitTime).getTime() : 0;
      const timeB = b.submitTime ? new Date(b.submitTime).getTime() : 0;
      return timeA - timeB;
    });
    const totalCount = sorted.length;
    for (let index = 0; index < sorted.length; index++) {
      const attempt = sorted[index];
      const rank = index + 1;
      const percentile = totalCount > 1 ? Math.round((totalCount - rank) / (totalCount - 1) * 100) : 100;
      await updateAttempt(attempt.id, { rank, percentile });
    }
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_compression.default)());
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing mobile number/ID or password." });
      }
      const ADMIN_MOBILE = "9987654321";
      const ADMIN_PASSWORD = await getAdminPassword();
      if (username === ADMIN_MOBILE && password === ADMIN_PASSWORD) {
        await logActivity("admin", "Principal Admin", "admin", "Log in successful");
        return res.json({
          success: true,
          userType: "admin",
          user: { name: "Principal Admin", mobile: ADMIN_MOBILE, id: "admin" }
        });
      }
      const student = await getStudentByMobileOrId(username);
      if (!student || student.password !== password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      if (student.status === "Pending") return res.status(403).json({ error: "Pending Admin approval." });
      if (student.status === "Rejected") return res.status(403).json({ error: "Request rejected." });
      if (student.isBlocked) return res.status(403).json({ error: "Account blocked." });
      const now = /* @__PURE__ */ new Date();
      const todayStr = now.toISOString().split("T")[0];
      let newStreak = student.streakCount || 0;
      if (student.lastLoginAt) {
        const lastLoginDate = new Date(student.lastLoginAt);
        const lastLoginStr = lastLoginDate.toISOString().split("T")[0];
        if (todayStr !== lastLoginStr) {
          const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastLoginStr).getTime());
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      const updatedS = await updateStudent(student.id, {
        lastLoginAt: now.toISOString(),
        streakCount: newStreak
      });
      await logActivity(student.studentId, student.name, "student", "Log in successful");
      res.json({ success: true, userType: "student", user: updatedS });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, mobile, classVal, rollNumber, batchYear, password } = req.body;
      if (!name || !mobile || !classVal || !rollNumber || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }
      const existing = await getStudentByMobileOrId(mobile);
      if (existing) {
        return res.status(409).json({ error: "Exists with this mobile" });
      }
      await insertStudent({
        id: "stud-" + Math.random().toString(36).substring(2, 9),
        studentId: "PENDING_" + Math.random().toString(36).substring(2, 9),
        name,
        mobile,
        classVal,
        rollNumber,
        batchYear: batchYear || "2025-2026",
        password,
        status: "Pending",
        isBlocked: false
      });
      await logActivity("register", name, "student", `Registered request pending approval`);
      res.status(201).json({ success: true, message: "Registration submitted." });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/ranks/recalculate", async (req, res) => {
    try {
      await computeStats();
      await logActivity("admin", "Principal Admin", "admin", "Triggered calculation");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed" });
    }
  });
  app.get("/api/db", async (req, res) => {
    try {
      const resStud = await getStudents();
      const resTests = await getTests();
      const resAtt = await getAttempts();
      const resNotif = await getNotifications();
      const resAct = await getActivities();
      const sanitizedStudents = resStud.map((s) => {
        const { password, ...rest } = s;
        return rest;
      });
      res.json({
        students: sanitizedStudents,
        tests: resTests,
        attempts: resAtt,
        notifications: resNotif,
        activities: resAct,
        adminPassword: void 0
        // Explicitly obscure system-wide administrator password on the client-side API layer
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/students", async (req, res) => {
    try {
      const { name, mobile, classVal, rollNumber, batchYear, password } = req.body;
      const sId = await generateStudentID();
      const studentObj = {
        id: "stud-" + Math.random().toString(36).substring(2, 9),
        studentId: sId,
        name,
        mobile,
        classVal,
        rollNumber,
        batchYear: batchYear || "2025-2026",
        password,
        status: "Approved",
        isBlocked: false
      };
      await insertStudent(studentObj);
      await logActivity("admin", "Admin", "admin", `Created student: ${name}`);
      await triggerNotification("Admission Confirmed", `Welcome ${name}! ID: ${sId}`, "system", sId);
      const { password: _, ...sanitizedNewStudent } = studentObj;
      res.json({ success: true, student: sanitizedNewStudent });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const up = await updateStudent(id, updateData);
      if (!up) return res.status(404).json({ error: "Not found" });
      await logActivity("admin", "Admin", "admin", `Modified student ${id}`);
      const { password: _, ...sanitizedUpdatedStudent } = up;
      res.json({ success: true, student: sanitizedUpdatedStudent });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteAttemptsByStudentId(id);
      await deleteStudent(id);
      await logActivity("admin", "Admin", "admin", `Deleted student ${id}`);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/students/:id/approve", async (req, res) => {
    try {
      const sId = await generateStudentID();
      const updated = await updateStudent(req.params.id, { status: "Approved", studentId: sId });
      if (!updated) return res.status(404).json({ error: "Not found" });
      await logActivity("admin", "Admin", "admin", `Approved ${updated.name}`);
      await triggerNotification("Approved", `Your ID is ${sId}`, "system", sId);
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/students/:id/reject", async (req, res) => {
    try {
      const updated = await updateStudent(req.params.id, { status: "Rejected" });
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/students/:id/reset-password", async (req, res) => {
    try {
      const s = await updateStudent(req.params.id, { password: req.body.newPassword });
      if (s) await triggerNotification("Password Reset", "Admin reset pwd", "system", s.studentId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/admin/change-password", async (req, res) => {
    try {
      const ADMIN_PASSWORD = await getAdminPassword();
      if (req.body.currentPassword !== ADMIN_PASSWORD) return res.status(400).json({ error: "Incorrect" });
      await updateAdminPassword(req.body.newPassword);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/students/:id/toggle-block", async (req, res) => {
    try {
      const s = await getStudentById(req.params.id);
      if (!s) return res.status(404).json({ error: "Not found" });
      const updated = await updateStudent(req.params.id, { isBlocked: !s.isBlocked });
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/tests", async (req, res) => {
    try {
      const { title, type, classVal, subject, date, startTime, endTime, duration, pdfName, pdfData, questionImages, answerKey } = req.body;
      let d = duration ? parseInt(duration, 10) : 60;
      if (type === "live" && startTime && endTime) {
        d = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 6e4);
      }
      const testObj = {
        id: "test-" + Math.random().toString(36).substring(2, 9),
        title,
        type,
        classVal,
        subject,
        date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        startTime: startTime || "",
        endTime: endTime || "",
        duration: d,
        pdfName: pdfName || "Mock.pdf",
        pdfData: pdfData || "",
        questionImages: questionImages || [],
        answerKey: answerKey || {},
        published: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const inserted = await insertTest(testObj);
      await triggerNotification(`New ${type} Test`, title, "reminder", "all");
      res.json({ success: true, test: inserted });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/tests/:id", async (req, res) => {
    try {
      const ud = { ...req.body };
      if (ud.type === "live" && ud.startTime && ud.endTime) {
        ud.duration = Math.round((new Date(ud.endTime).getTime() - new Date(ud.startTime).getTime()) / 6e4);
      }
      const t = await updateTest(req.params.id, ud);
      res.json({ success: true, test: t });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/tests/:id", async (req, res) => {
    try {
      await deleteAttemptsByTestId(req.params.id);
      await deleteTest(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/tests/:id/upload-pdf", async (req, res) => {
    try {
      await updateTest(req.params.id, { pdfName: req.body.pdfName, pdfData: req.body.pdfData });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/attempts", async (req, res) => {
    try {
      const { testId, studentId, studentName, answers, status } = req.body;
      const test = await getTestById(testId);
      if (!test) return res.status(404).json({ error: "Test not found" });
      if (test.type === "live") {
        const prevArray = await getAttemptsByStudentAndTest(studentId, testId, "submitted");
        if (prevArray.length > 0) return res.status(400).json({ error: "Already completed" });
      }
      const activeAttempts = await getAttemptsByStudentAndTest(studentId, testId, "started");
      let attempt;
      if (activeAttempts.length === 0) {
        const attemptData = {
          id: "att-" + Math.random().toString(36).substring(2, 9),
          testId,
          studentId,
          studentName,
          answers: answers || {},
          status: status || "started",
          startTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        attempt = await insertAttempt(attemptData);
      } else {
        const updateData = { answers: { ...activeAttempts[0].answers, ...answers || {} } };
        if (status === "submitted") updateData.status = "submitted";
        attempt = await updateAttempt(activeAttempts[0].id, updateData);
      }
      if (attempt.status === "submitted") {
        let correct = 0, wrong = 0;
        const totalQ = Object.keys(test.answerKey || {}).length || 10;
        Object.keys(test.answerKey || {}).forEach((qKey) => {
          const cA = test.answerKey[qKey];
          const sA = attempt.answers[qKey];
          if (sA) {
            if (sA === cA) correct++;
            else wrong++;
          }
        });
        const ansCount = Object.keys(attempt.answers).length;
        const scoreUpdate = {
          submitTime: (/* @__PURE__ */ new Date()).toISOString(),
          correctAnswers: correct,
          wrongAnswers: wrong,
          score: correct,
          accuracy: ansCount > 0 ? Math.round(correct / ansCount * 100) : 0
        };
        attempt = await updateAttempt(attempt.id, scoreUpdate);
        await computeStats();
        await triggerNotification("Result Generated", `Score: ${correct}/${totalQ}`, "result", studentId);
      }
      res.json({ success: true, attempt });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: `You are Aacharya. User message: ${req.body.message}` }] }]
      });
      res.json({ text: response.text });
    } catch (e) {
      res.status(500).json({ error: "AI Error" });
    }
  });
  app.post("/api/notifications/mark-read", async (req, res) => {
    try {
      await markNotificationsRead(req.body.studentId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/notifications", async (req, res) => {
    try {
      await triggerNotification(req.body.title, req.body.message, req.body.type || "announcement", req.body.recipientId || "all");
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: req.body.messages.map((m) => ({ role: m.role || "user", parts: [{ text: m.content || "" }] }))
      });
      res.json({ success: true, text: response.text });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      let parts = [];
      if (req.body.imageBase64) parts.push({ inlineData: { data: req.body.imageBase64, mimeType: req.body.mimeType || "image/png" } });
      parts.push({ text: req.body.questionText || "Solve" });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts }]
      });
      res.json({ success: true, text: response.text });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for full-stack integration...");
    const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => res.sendFile(import_path.default.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
