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
var import_cors = __toESM(require("cors"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/db/dbService.ts
var import_firestore2 = require("firebase/firestore");

// src/db/firebase.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function getFirebaseConfig() {
  try {
    const configPath = import_path.default.resolve(process.cwd(), "firebase-applet-config.json");
    if (import_fs.default.existsSync(configPath)) {
      const content = import_fs.default.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read firebase-applet-config.json:", err);
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || "citric-buckeye-4lsxp",
    appId: process.env.FIREBASE_APP_ID || "1:671143637219:web:aac4861f872d64c09d95d6",
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAF3GqKxbC9tpunoq_wuu2z5Ro5s51Jb2k",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "citric-buckeye-4lsxp.firebaseapp.com",
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || "ai-studio-044b1206-94dc-43f9-b122-4082f49907c0",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "citric-buckeye-4lsxp.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "671143637219"
  };
}
var config = getFirebaseConfig();
var firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};
var app = (0, import_app.getApps)().length === 0 ? (0, import_app.initializeApp)(firebaseConfig) : (0, import_app.getApp)();
var firestore = config.firestoreDatabaseId ? (0, import_firestore.getFirestore)(app, config.firestoreDatabaseId) : (0, import_firestore.getFirestore)(app);

// src/db/dbService.ts
function docToObject(docSnap) {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id
  };
}
async function getStudents() {
  const qSnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(firestore, "students"));
  return qSnapshot.docs.map((doc2) => docToObject(doc2));
}
async function getStudentByMobileOrId(username) {
  const qById = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "students"), (0, import_firestore2.where)("studentId", "==", username));
  let qSnapshot = await (0, import_firestore2.getDocs)(qById);
  if (qSnapshot.empty) {
    const qByMobile = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "students"), (0, import_firestore2.where)("mobile", "==", username));
    qSnapshot = await (0, import_firestore2.getDocs)(qByMobile);
  }
  if (qSnapshot.empty) {
    const docRef = (0, import_firestore2.doc)(firestore, "students", username);
    const docSnap = await (0, import_firestore2.getDoc)(docRef);
    if (docSnap.exists()) {
      return docToObject(docSnap);
    }
    return null;
  }
  return docToObject(qSnapshot.docs[0]);
}
async function getStudentById(id) {
  const docRef = (0, import_firestore2.doc)(firestore, "students", id);
  const docSnap = await (0, import_firestore2.getDoc)(docRef);
  return docToObject(docSnap);
}
async function insertStudent(studentData) {
  const idValue = studentData.id || "stud-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...studentData, id: idValue };
  const docRef = (0, import_firestore2.doc)(firestore, "students", idValue);
  await (0, import_firestore2.setDoc)(docRef, finalData);
  return finalData;
}
async function updateStudent(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  const docRef = (0, import_firestore2.doc)(firestore, "students", id);
  await (0, import_firestore2.updateDoc)(docRef, cleanData);
  return await getStudentById(id);
}
async function deleteStudent(id) {
  const docRef = (0, import_firestore2.doc)(firestore, "students", id);
  await (0, import_firestore2.deleteDoc)(docRef);
}
async function getTests() {
  const qSnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(firestore, "tests"));
  return qSnapshot.docs.map((doc2) => docToObject(doc2));
}
async function getTestById(id) {
  const docRef = (0, import_firestore2.doc)(firestore, "tests", id);
  const docSnap = await (0, import_firestore2.getDoc)(docRef);
  return docToObject(docSnap);
}
async function insertTest(testData) {
  const idValue = testData.id || "test-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...testData, id: idValue };
  const docRef = (0, import_firestore2.doc)(firestore, "tests", idValue);
  await (0, import_firestore2.setDoc)(docRef, finalData);
  return finalData;
}
async function updateTest(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  const docRef = (0, import_firestore2.doc)(firestore, "tests", id);
  await (0, import_firestore2.updateDoc)(docRef, cleanData);
  return await getTestById(id);
}
async function deleteTest(id) {
  const docRef = (0, import_firestore2.doc)(firestore, "tests", id);
  await (0, import_firestore2.deleteDoc)(docRef);
}
async function getAttempts() {
  const qSnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(firestore, "attempts"));
  return qSnapshot.docs.map((doc2) => docToObject(doc2));
}
async function getAttemptsByStudentAndTest(studentId, testId, status) {
  let q = (0, import_firestore2.query)(
    (0, import_firestore2.collection)(firestore, "attempts"),
    (0, import_firestore2.where)("studentId", "==", studentId),
    (0, import_firestore2.where)("testId", "==", testId)
  );
  if (status) {
    q = (0, import_firestore2.query)(
      (0, import_firestore2.collection)(firestore, "attempts"),
      (0, import_firestore2.where)("studentId", "==", studentId),
      (0, import_firestore2.where)("testId", "==", testId),
      (0, import_firestore2.where)("status", "==", status)
    );
  }
  const qSnapshot = await (0, import_firestore2.getDocs)(q);
  return qSnapshot.docs.map((doc2) => docToObject(doc2));
}
async function insertAttempt(attemptData) {
  const idValue = attemptData.id || "att-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...attemptData, id: idValue };
  const docRef = (0, import_firestore2.doc)(firestore, "attempts", idValue);
  await (0, import_firestore2.setDoc)(docRef, finalData);
  return finalData;
}
async function updateAttempt(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  const docRef = (0, import_firestore2.doc)(firestore, "attempts", id);
  await (0, import_firestore2.updateDoc)(docRef, cleanData);
  const docSnap = await (0, import_firestore2.getDoc)(docRef);
  return docToObject(docSnap);
}
async function deleteAttemptsByStudentId(studentId) {
  const q = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "attempts"), (0, import_firestore2.where)("studentId", "==", studentId));
  const qSnapshot = await (0, import_firestore2.getDocs)(q);
  const batch = (0, import_firestore2.writeBatch)(firestore);
  qSnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}
async function deleteAttemptsByTestId(testId) {
  const q = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "attempts"), (0, import_firestore2.where)("testId", "==", testId));
  const qSnapshot = await (0, import_firestore2.getDocs)(q);
  const batch = (0, import_firestore2.writeBatch)(firestore);
  qSnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}
async function getNotifications() {
  const qSnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(firestore, "notifications"));
  const list = qSnapshot.docs.map((doc2) => docToObject(doc2));
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}
async function insertNotification(notificationData) {
  const idValue = notificationData.id || "notif-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...notificationData,
    id: idValue,
    createdAt: notificationData.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  const docRef = (0, import_firestore2.doc)(firestore, "notifications", idValue);
  await (0, import_firestore2.setDoc)(docRef, finalData);
  return finalData;
}
async function markNotificationsRead(studentId) {
  const q1 = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "notifications"), (0, import_firestore2.where)("recipientId", "==", studentId));
  const q2 = (0, import_firestore2.query)((0, import_firestore2.collection)(firestore, "notifications"), (0, import_firestore2.where)("recipientId", "==", "all"));
  const [shot1, shot2] = await Promise.all([(0, import_firestore2.getDocs)(q1), (0, import_firestore2.getDocs)(q2)]);
  const batch = (0, import_firestore2.writeBatch)(firestore);
  shot1.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  shot2.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}
async function getActivities() {
  const qSnapshot = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(firestore, "activities"));
  const list = qSnapshot.docs.map((doc2) => docToObject(doc2));
  return list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
}
async function insertActivity(activityData) {
  const idValue = activityData.id || "act-" + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...activityData,
    id: idValue,
    timestamp: activityData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
  const docRef = (0, import_firestore2.doc)(firestore, "activities", idValue);
  await (0, import_firestore2.setDoc)(docRef, finalData);
  return finalData;
}
async function getAdminPassword() {
  const docRef = (0, import_firestore2.doc)(firestore, "adminSettings", "settings");
  const docSnap = await (0, import_firestore2.getDoc)(docRef);
  if (docSnap.exists()) {
    return docSnap.data().adminPassword;
  } else {
    await (0, import_firestore2.setDoc)(docRef, { adminPassword: "ezadmin01" });
    return "ezadmin01";
  }
}
async function updateAdminPassword(pwd) {
  const docRef = (0, import_firestore2.doc)(firestore, "adminSettings", "settings");
  const docSnap = await (0, import_firestore2.getDoc)(docRef);
  if (docSnap.exists()) {
    await (0, import_firestore2.updateDoc)(docRef, { adminPassword: pwd });
  } else {
    await (0, import_firestore2.setDoc)(docRef, { adminPassword: pwd });
  }
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
    const bestAttemptMap = /* @__PURE__ */ new Map();
    testAttempts.forEach((attempt) => {
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
      const percentile = totalCount > 1 ? Math.round((totalCount - rank) / (totalCount - 1) * 100) : 100;
      await updateAttempt(bestAttemptId, { rank, percentile });
    }
  }
}
async function startServer() {
  const app2 = (0, import_express.default)();
  const PORT = 3e3;
  app2.use((0, import_cors.default)({
    origin: "*",
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "x-publishable-key", "Authorization"]
  }));
  app2.use((0, import_compression.default)());
  app2.use(import_express.default.json({ limit: "10mb" }));
  app2.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  app2.use("/api", (req, res, next) => {
    next();
  });
  app2.post("/api/auth/login", async (req, res) => {
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
  app2.post("/api/auth/register", async (req, res) => {
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
  app2.post("/api/ranks/recalculate", async (req, res) => {
    try {
      await computeStats();
      await logActivity("admin", "Principal Admin", "admin", "Triggered calculation");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed" });
    }
  });
  app2.get("/api/db", async (req, res) => {
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
  app2.post("/api/students", async (req, res) => {
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
  app2.put("/api/students/:id", async (req, res) => {
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
  app2.delete("/api/students/:id", async (req, res) => {
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
  app2.post("/api/students/:id/approve", async (req, res) => {
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
  app2.post("/api/students/:id/reject", async (req, res) => {
    try {
      const updated = await updateStudent(req.params.id, { status: "Rejected" });
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/students/:id/reset-password", async (req, res) => {
    try {
      const s = await updateStudent(req.params.id, { password: req.body.newPassword });
      if (s) await triggerNotification("Password Reset", "Admin reset pwd", "system", s.studentId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.put("/api/admin/change-password", async (req, res) => {
    try {
      const ADMIN_PASSWORD = await getAdminPassword();
      if (req.body.currentPassword !== ADMIN_PASSWORD) return res.status(400).json({ error: "Incorrect" });
      await updateAdminPassword(req.body.newPassword);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/students/:id/toggle-block", async (req, res) => {
    try {
      const s = await getStudentById(req.params.id);
      if (!s) return res.status(404).json({ error: "Not found" });
      const updated = await updateStudent(req.params.id, { isBlocked: !s.isBlocked });
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/tests", async (req, res) => {
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
  app2.put("/api/tests/:id", async (req, res) => {
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
  app2.delete("/api/tests/:id", async (req, res) => {
    try {
      await deleteAttemptsByTestId(req.params.id);
      await deleteTest(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/tests/:id/upload-pdf", async (req, res) => {
    try {
      await updateTest(req.params.id, { pdfName: req.body.pdfName, pdfData: req.body.pdfData });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/attempts", async (req, res) => {
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
  app2.post("/api/ai/chat", async (req, res) => {
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
  app2.post("/api/notifications/mark-read", async (req, res) => {
    try {
      await markNotificationsRead(req.body.studentId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      await triggerNotification(req.body.title, req.body.message, req.body.type || "announcement", req.body.recipientId || "all");
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/gemini/chat", async (req, res) => {
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
  app2.post("/api/gemini/explain", async (req, res) => {
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
  app2.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for full-stack integration...");
    const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true }, appType: "spa" });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => res.sendFile(import_path2.default.join(distPath, "index.html")));
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
