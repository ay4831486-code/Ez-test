var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/db/firestoreService.ts
var import_drizzle_orm2 = require("drizzle-orm");

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  adminSettings: () => adminSettings,
  attempts: () => attempts,
  attemptsRelations: () => attemptsRelations,
  notifications: () => notifications,
  students: () => students,
  studentsRelations: () => studentsRelations,
  tests: () => tests,
  testsRelations: () => testsRelations
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var students = (0, import_pg_core.pgTable)("students", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").unique(),
  // Firebase Auth UID if needed
  studentId: (0, import_pg_core.text)("student_id").notNull().unique(),
  name: (0, import_pg_core.text)("name").notNull(),
  mobile: (0, import_pg_core.text)("mobile").notNull(),
  classVal: (0, import_pg_core.text)("class_val").notNull(),
  rollNumber: (0, import_pg_core.text)("roll_number").notNull(),
  batchYear: (0, import_pg_core.text)("batch_year"),
  password: (0, import_pg_core.text)("password").notNull(),
  // hashed
  status: (0, import_pg_core.text)("status").notNull().default("Pending"),
  isBlocked: (0, import_pg_core.boolean)("is_blocked").notNull().default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  lastLoginAt: (0, import_pg_core.timestamp)("last_login_at"),
  streakCount: (0, import_pg_core.integer)("streak_count").default(0)
});
var tests = (0, import_pg_core.pgTable)("tests", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  type: (0, import_pg_core.text)("type").notNull(),
  // 'live' | 'practice'
  classVal: (0, import_pg_core.text)("class_val").notNull(),
  subject: (0, import_pg_core.text)("subject").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  startTime: (0, import_pg_core.text)("start_time").notNull(),
  endTime: (0, import_pg_core.text)("end_time").notNull(),
  duration: (0, import_pg_core.integer)("duration").notNull(),
  pdfName: (0, import_pg_core.text)("pdf_name").notNull(),
  pdfData: (0, import_pg_core.text)("pdf_data").notNull(),
  questionImages: (0, import_pg_core.jsonb)("question_images"),
  // string[]
  answerKey: (0, import_pg_core.jsonb)("answer_key").notNull(),
  // {1: 'A', 2: 'B'}
  published: (0, import_pg_core.boolean)("published").notNull().default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var attempts = (0, import_pg_core.pgTable)("attempts", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  testId: (0, import_pg_core.text)("test_id").references(() => tests.id).notNull(),
  studentId: (0, import_pg_core.text)("student_id").references(() => students.id).notNull(),
  studentName: (0, import_pg_core.text)("student_name").notNull(),
  answers: (0, import_pg_core.jsonb)("answers").notNull(),
  score: (0, import_pg_core.integer)("score").notNull().default(0),
  correctAnswers: (0, import_pg_core.integer)("correct_answers").notNull().default(0),
  wrongAnswers: (0, import_pg_core.integer)("wrong_answers").notNull().default(0),
  accuracy: (0, import_pg_core.real)("accuracy").notNull().default(0),
  status: (0, import_pg_core.text)("status").notNull(),
  // 'started' | 'submitted'
  startTime: (0, import_pg_core.timestamp)("start_time").notNull(),
  submitTime: (0, import_pg_core.timestamp)("submit_time"),
  rank: (0, import_pg_core.integer)("rank"),
  percentile: (0, import_pg_core.real)("percentile")
});
var notifications = (0, import_pg_core.pgTable)("notifications", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  message: (0, import_pg_core.text)("message").notNull(),
  type: (0, import_pg_core.text)("type").notNull(),
  recipientId: (0, import_pg_core.text)("recipient_id").notNull(),
  read: (0, import_pg_core.boolean)("read").notNull().default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var activities = (0, import_pg_core.pgTable)("activities", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").notNull(),
  userName: (0, import_pg_core.text)("user_name").notNull(),
  userType: (0, import_pg_core.text)("user_type").notNull(),
  // 'admin' | 'student'
  action: (0, import_pg_core.text)("action").notNull(),
  timestamp: (0, import_pg_core.timestamp)("timestamp").defaultNow()
});
var adminSettings = (0, import_pg_core.pgTable)("admin_settings", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  adminPassword: (0, import_pg_core.text)("admin_password").notNull().default("ezadmin01")
});
var studentsRelations = (0, import_drizzle_orm.relations)(students, ({ many }) => ({
  attempts: many(attempts)
}));
var testsRelations = (0, import_drizzle_orm.relations)(tests, ({ many }) => ({
  attempts: many(attempts)
}));
var attemptsRelations = (0, import_drizzle_orm.relations)(attempts, ({ one }) => ({
  test: one(tests, {
    fields: [attempts.testId],
    references: [tests.id]
  }),
  student: one(students, {
    fields: [attempts.studentId],
    references: [students.id]
  })
}));

// src/db/index.ts
var { Pool } = import_pg.default;
var createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6vKptoJnX3dB@ep-late-truth-aodqz064-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    connectionTimeoutMillis: 15e3
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/firestoreService.ts
async function getStudents() {
  const result = await db.select().from(students);
  return result.map((s) => ({ ...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString() }));
}
async function getStudentByMobileOrId(username) {
  const result = await db.select().from(students).where(
    (0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(students.mobile, username), (0, import_drizzle_orm2.eq)(students.studentId, username), (0, import_drizzle_orm2.eq)(students.id, username))
  ).limit(1);
  if (result.length > 0) {
    const s = result[0];
    return { ...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString() };
  }
  return null;
}
async function getStudentById(id) {
  const result = await db.select().from(students).where((0, import_drizzle_orm2.eq)(students.id, id)).limit(1);
  if (result.length > 0) {
    const s = result[0];
    return { ...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString() };
  }
  return null;
}
async function insertStudent(studentData) {
  const idValue = studentData.id || "stud-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...studentData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  await db.insert(students).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString() };
}
async function updateStudent(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  if (cleanData.createdAt) cleanData.createdAt = new Date(cleanData.createdAt);
  if (cleanData.lastLoginAt) cleanData.lastLoginAt = new Date(cleanData.lastLoginAt);
  await db.update(students).set(cleanData).where((0, import_drizzle_orm2.eq)(students.id, id));
  return await getStudentById(id);
}
async function deleteStudent(id) {
  await db.delete(students).where((0, import_drizzle_orm2.eq)(students.id, id));
}
async function getTests() {
  const result = await db.select().from(tests);
  return result.map((t) => ({ ...t, createdAt: t.createdAt?.toISOString() }));
}
async function getTestById(id) {
  const result = await db.select().from(tests).where((0, import_drizzle_orm2.eq)(tests.id, id)).limit(1);
  if (result.length > 0) {
    const t = result[0];
    return { ...t, createdAt: t.createdAt?.toISOString() };
  }
  return null;
}
async function insertTest(testData) {
  const idValue = testData.id || "test-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...testData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  await db.insert(tests).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString() };
}
async function updateTest(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  if (cleanData.createdAt) cleanData.createdAt = new Date(cleanData.createdAt);
  await db.update(tests).set(cleanData).where((0, import_drizzle_orm2.eq)(tests.id, id));
  return await getTestById(id);
}
async function deleteTest(id) {
  await db.delete(tests).where((0, import_drizzle_orm2.eq)(tests.id, id));
}
async function getAttempts() {
  const result = await db.select().from(attempts);
  return result.map((a) => ({ ...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString() }));
}
async function getAttemptsByStudentAndTest(studentId, testId, status) {
  const condition = (0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(attempts.studentId, studentId), (0, import_drizzle_orm2.eq)(attempts.testId, testId));
  const fullCondition = status ? (0, import_drizzle_orm2.and)(condition, (0, import_drizzle_orm2.eq)(attempts.status, status)) : condition;
  const result = await db.select().from(attempts).where(fullCondition);
  return result.map((a) => ({ ...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString() }));
}
async function insertAttempt(attemptData) {
  const idValue = attemptData.id || "att-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...attemptData, id: idValue };
  if (finalData.startTime) finalData.startTime = new Date(finalData.startTime);
  if (finalData.submitTime) finalData.submitTime = new Date(finalData.submitTime);
  await db.insert(attempts).values(finalData);
  return { ...finalData, startTime: finalData.startTime?.toISOString(), submitTime: finalData.submitTime?.toISOString() };
}
async function updateAttempt(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach((k) => {
    if (cleanData[k] === void 0) delete cleanData[k];
  });
  if (cleanData.startTime) cleanData.startTime = new Date(cleanData.startTime);
  if (cleanData.submitTime) cleanData.submitTime = new Date(cleanData.submitTime);
  await db.update(attempts).set(cleanData).where((0, import_drizzle_orm2.eq)(attempts.id, id));
  const result = await db.select().from(attempts).where((0, import_drizzle_orm2.eq)(attempts.id, id)).limit(1);
  if (result.length > 0) {
    const a = result[0];
    return { ...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString() };
  }
  return null;
}
async function deleteAttemptsByStudentId(studentId) {
  await db.delete(attempts).where((0, import_drizzle_orm2.eq)(attempts.studentId, studentId));
}
async function deleteAttemptsByTestId(testId) {
  await db.delete(attempts).where((0, import_drizzle_orm2.eq)(attempts.testId, testId));
}
async function getNotifications() {
  const result = await db.select().from(notifications);
  return result.map((n) => ({ ...n, createdAt: n.createdAt?.toISOString() })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
async function insertNotification(notificationData) {
  const idValue = notificationData.id || "notif-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...notificationData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  await db.insert(notifications).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || (/* @__PURE__ */ new Date()).toISOString() };
}
async function markNotificationsRead(studentId) {
  await db.update(notifications).set({ read: true }).where((0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(notifications.recipientId, studentId), (0, import_drizzle_orm2.eq)(notifications.recipientId, "all")));
}
async function getActivities() {
  const result = await db.select().from(activities);
  return result.map((a) => ({ ...a, timestamp: a.timestamp?.toISOString() })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
async function insertActivity(activityData) {
  const idValue = activityData.id || "act-" + Math.random().toString(36).substring(2, 9);
  const finalData = { ...activityData, id: idValue };
  if (finalData.timestamp) finalData.timestamp = new Date(finalData.timestamp);
  await db.insert(activities).values(finalData);
  return { ...finalData, timestamp: finalData.timestamp?.toISOString() || (/* @__PURE__ */ new Date()).toISOString() };
}
async function getAdminPassword() {
  const result = await db.select().from(adminSettings).limit(1);
  if (result.length > 0) {
    return result[0].adminPassword;
  } else {
    await db.insert(adminSettings).values({ adminPassword: "ezadmin01" });
    return "ezadmin01";
  }
}
async function updateAdminPassword(pwd) {
  const result = await db.select().from(adminSettings).limit(1);
  if (result.length > 0) {
    await db.update(adminSettings).set({ adminPassword: pwd }).where((0, import_drizzle_orm2.eq)(adminSettings.id, result[0].id));
  } else {
    await db.insert(adminSettings).values({ adminPassword: pwd });
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
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use((0, import_compression.default)());
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api", (req, res, next) => {
    const requiredKey = process.env.VITE_APP_PUBLISHABLE_KEY;
    if (requiredKey) {
      const clientKey = req.headers["x-publishable-key"];
      if (!clientKey || clientKey !== requiredKey) {
        return res.status(401).json({ error: "Unauthorized. Invalid or missing Publishable API Key." });
      }
    }
    next();
  });
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
