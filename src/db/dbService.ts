import { eq, or, and } from 'drizzle-orm';
import { db } from './index';
import * as schema from './schema';

export async function getStudents(): Promise<any[]> {
  const result = await db.select().from(schema.students);
  return result.map(s => ({...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString()}));
}

export async function getStudentByMobileOrId(username: string): Promise<any | null> {
  const result = await db.select().from(schema.students).where(
    or(eq(schema.students.mobile, username), eq(schema.students.studentId, username), eq(schema.students.id, username))
  ).limit(1);
  if (result.length > 0) {
    const s = result[0];
    return {...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString()};
  }
  return null;
}

export async function getStudentById(id: string): Promise<any | null> {
  const result = await db.select().from(schema.students).where(eq(schema.students.id, id)).limit(1);
  if (result.length > 0) {
    const s = result[0];
    return {...s, createdAt: s.createdAt?.toISOString(), lastLoginAt: s.lastLoginAt?.toISOString()};
  }
  return null;
}

export async function insertStudent(studentData: any): Promise<any> {
  const idValue = studentData.id || 'stud-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...studentData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  
  await db.insert(schema.students).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || new Date().toISOString() };
}

export async function updateStudent(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  
  if (cleanData.createdAt) cleanData.createdAt = new Date(cleanData.createdAt);
  if (cleanData.lastLoginAt) cleanData.lastLoginAt = new Date(cleanData.lastLoginAt);

  await db.update(schema.students).set(cleanData).where(eq(schema.students.id, id));
  return await getStudentById(id);
}

export async function deleteStudent(id: string): Promise<void> {
  await db.delete(schema.students).where(eq(schema.students.id, id));
}

export async function getTests(): Promise<any[]> {
  const result = await db.select().from(schema.tests);
  return result.map(t => ({...t, createdAt: t.createdAt?.toISOString()}));
}

export async function getTestById(id: string): Promise<any | null> {
  const result = await db.select().from(schema.tests).where(eq(schema.tests.id, id)).limit(1);
  if (result.length > 0) {
    const t = result[0];
    return {...t, createdAt: t.createdAt?.toISOString()};
  }
  return null;
}

export async function insertTest(testData: any): Promise<any> {
  const idValue = testData.id || 'test-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...testData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  await db.insert(schema.tests).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || new Date().toISOString() };
}

export async function updateTest(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  if (cleanData.createdAt) cleanData.createdAt = new Date(cleanData.createdAt);
  
  await db.update(schema.tests).set(cleanData).where(eq(schema.tests.id, id));
  return await getTestById(id);
}

export async function deleteTest(id: string): Promise<void> {
  await db.delete(schema.tests).where(eq(schema.tests.id, id));
}

export async function getAttempts(): Promise<any[]> {
  const result = await db.select().from(schema.attempts);
  return result.map(a => ({...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString()}));
}

export async function getAttemptsByStudentAndTest(studentId: string, testId: string, status?: string): Promise<any[]> {
  const condition = and(eq(schema.attempts.studentId, studentId), eq(schema.attempts.testId, testId));
  const fullCondition = status ? and(condition, eq(schema.attempts.status, status)) : condition;
  
  const result = await db.select().from(schema.attempts).where(fullCondition);
  return result.map(a => ({...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString()}));
}

export async function insertAttempt(attemptData: any): Promise<any> {
  const idValue = attemptData.id || 'att-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...attemptData, id: idValue };
  
  if (finalData.startTime) finalData.startTime = new Date(finalData.startTime);
  if (finalData.submitTime) finalData.submitTime = new Date(finalData.submitTime);
  
  await db.insert(schema.attempts).values(finalData);
  return { ...finalData, startTime: finalData.startTime?.toISOString(), submitTime: finalData.submitTime?.toISOString() };
}

export async function updateAttempt(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  
  if (cleanData.startTime) cleanData.startTime = new Date(cleanData.startTime);
  if (cleanData.submitTime) cleanData.submitTime = new Date(cleanData.submitTime);

  await db.update(schema.attempts).set(cleanData).where(eq(schema.attempts.id, id));
  
  const result = await db.select().from(schema.attempts).where(eq(schema.attempts.id, id)).limit(1);
  if (result.length > 0) {
    const a = result[0];
    return {...a, startTime: a.startTime?.toISOString(), submitTime: a.submitTime?.toISOString()};
  }
  return null;
}

export async function deleteAttemptsByStudentId(studentId: string): Promise<void> {
  await db.delete(schema.attempts).where(eq(schema.attempts.studentId, studentId));
}

export async function deleteAttemptsByTestId(testId: string): Promise<void> {
  await db.delete(schema.attempts).where(eq(schema.attempts.testId, testId));
}

export async function getNotifications(): Promise<any[]> {
  const result = await db.select().from(schema.notifications);
  return result
    .map(n => ({...n, createdAt: n.createdAt?.toISOString()}))
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
}

export async function insertNotification(notificationData: any): Promise<any> {
  const idValue = notificationData.id || 'notif-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...notificationData, id: idValue };
  if (finalData.createdAt) finalData.createdAt = new Date(finalData.createdAt);
  
  await db.insert(schema.notifications).values(finalData);
  return { ...finalData, createdAt: finalData.createdAt?.toISOString() || new Date().toISOString() };
}

export async function markNotificationsRead(studentId: string): Promise<void> {
  await db.update(schema.notifications)
    .set({ read: true })
    .where(or(eq(schema.notifications.recipientId, studentId), eq(schema.notifications.recipientId, 'all')));
}

export async function getActivities(): Promise<any[]> {
  const result = await db.select().from(schema.activities);
  return result
    .map(a => ({...a, timestamp: a.timestamp?.toISOString()}))
    .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
}

export async function insertActivity(activityData: any): Promise<any> {
  const idValue = activityData.id || 'act-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...activityData, id: idValue };
  if (finalData.timestamp) finalData.timestamp = new Date(finalData.timestamp);
  
  await db.insert(schema.activities).values(finalData);
  return { ...finalData, timestamp: finalData.timestamp?.toISOString() || new Date().toISOString() };
}

export async function getAdminPassword(): Promise<string> {
  const result = await db.select().from(schema.adminSettings).limit(1);
  if (result.length > 0) {
    return result[0].adminPassword;
  } else {
    await db.insert(schema.adminSettings).values({ adminPassword: 'ezadmin01' });
    return 'ezadmin01';
  }
}

export async function updateAdminPassword(pwd: string): Promise<void> {
  const result = await db.select().from(schema.adminSettings).limit(1);
  if (result.length > 0) {
    await db.update(schema.adminSettings).set({ adminPassword: pwd }).where(eq(schema.adminSettings.id, result[0].id));
  } else {
    await db.insert(schema.adminSettings).values({ adminPassword: pwd });
  }
}

