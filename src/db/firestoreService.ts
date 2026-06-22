import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize firebase-admin
if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log("Firebase Admin initialized successfully with Project ID:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    initializeApp();
  }
}

// Get the specific database instance
export const firestoreDb = getFirestore(firebaseConfig.firestoreDatabaseId);

// Helper to convert Firestore timestamp/snapshot fields safely
function convertDoc(doc: DocumentSnapshot) {
  if (!doc.exists) return null;
  const data = doc.data()!;
  
  // Convert map timestamps or date strings
  const res = { id: doc.id, ...data } as any;

  // Convert Firebase Firestore Timestamps to ISO Strings where required
  for (const key of Object.keys(res)) {
    if (res[key] && typeof res[key] === 'object' && typeof res[key].toDate === 'function') {
      res[key] = res[key].toDate().toISOString();
    }
  }
  return res;
}

// ----------------------------------------
// 1. STUDENTS COLLECTION OPERATIONS
// ----------------------------------------
export async function getStudents(): Promise<any[]> {
  const snapshot = await firestoreDb.collection('students').get();
  return snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
}

export async function getStudentByMobileOrId(username: string): Promise<any | null> {
  // Query mobile number
  const snapshotMob = await firestoreDb.collection('students')
    .where('mobile', '==', username)
    .get();
  if (!snapshotMob.empty) {
    return convertDoc(snapshotMob.docs[0]);
  }

  // Query studentId
  const snapshotId = await firestoreDb.collection('students')
    .where('studentId', '==', username)
    .get();
  if (!snapshotId.empty) {
    return convertDoc(snapshotId.docs[0]);
  }

  // Query doc ID directly
  const docRef = await firestoreDb.collection('students').doc(username).get();
  if (docRef.exists) {
    return convertDoc(docRef);
  }

  return null;
}

export async function getStudentById(id: string): Promise<any | null> {
  const doc = await firestoreDb.collection('students').doc(id).get();
  return convertDoc(doc);
}

export async function insertStudent(studentData: any): Promise<any> {
  const idValue = studentData.id || 'stud-' + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...studentData,
    id: idValue,
    createdAt: studentData.createdAt || new Date().toISOString()
  };
  await firestoreDb.collection('students').doc(idValue).set(finalData);
  return finalData;
}

export async function updateStudent(id: string, updateData: any): Promise<any | null> {
  const docRef = firestoreDb.collection('students').doc(id);
  // Remove id or undefined keys
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) delete cleanData[key];
  });

  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}

export async function deleteStudent(id: string): Promise<void> {
  await firestoreDb.collection('students').doc(id).delete();
}

// ----------------------------------------
// 2. TESTS COLLECTION OPERATIONS
// ----------------------------------------
export async function getTests(): Promise<any[]> {
  const snapshot = await firestoreDb.collection('tests').get();
  return snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
}

export async function getTestById(id: string): Promise<any | null> {
  const doc = await firestoreDb.collection('tests').doc(id).get();
  return convertDoc(doc);
}

export async function insertTest(testData: any): Promise<any> {
  const idValue = testData.id || 'test-' + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...testData,
    id: idValue,
    createdAt: testData.createdAt || new Date().toISOString()
  };
  await firestoreDb.collection('tests').doc(idValue).set(finalData);
  return finalData;
}

export async function updateTest(id: string, updateData: any): Promise<any | null> {
  const docRef = firestoreDb.collection('tests').doc(id);
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) delete cleanData[key];
  });

  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}

export async function deleteTest(id: string): Promise<void> {
  await firestoreDb.collection('tests').doc(id).delete();
}

// ----------------------------------------
// 3. ATTEMPTS COLLECTION OPERATIONS
// ----------------------------------------
export async function getAttempts(): Promise<any[]> {
  const snapshot = await firestoreDb.collection('attempts').get();
  return snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
}

export async function getAttemptsByStudentAndTest(studentId: string, testId: string, status?: string): Promise<any[]> {
  let query = firestoreDb.collection('attempts')
    .where('studentId', '==', studentId)
    .where('testId', '==', testId);

  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
}

export async function insertAttempt(attemptData: any): Promise<any> {
  const idValue = attemptData.id || 'att-' + Math.random().toString(36).substring(2, 9);
  // Convert timestamps to ISO string if needed
  const finalData = {
    ...attemptData,
    id: idValue,
    startTime: attemptData.startTime instanceof Date ? attemptData.startTime.toISOString() : (attemptData.startTime || new Date().toISOString())
  };
  await firestoreDb.collection('attempts').doc(idValue).set(finalData);
  return finalData;
}

export async function updateAttempt(id: string, updateData: any): Promise<any | null> {
  const docRef = firestoreDb.collection('attempts').doc(id);
  const cleanData = { ...updateData };
  delete cleanData.id;
  
  if (cleanData.startTime instanceof Date) cleanData.startTime = cleanData.startTime.toISOString();
  if (cleanData.submitTime instanceof Date) cleanData.submitTime = cleanData.submitTime.toISOString();

  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) delete cleanData[key];
  });

  await docRef.update(cleanData);
  const updatedDoc = await docRef.get();
  return convertDoc(updatedDoc);
}

export async function deleteAttemptsByStudentId(studentId: string): Promise<void> {
  const snapshot = await firestoreDb.collection('attempts')
    .where('studentId', '==', studentId)
    .get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

export async function deleteAttemptsByTestId(testId: string): Promise<void> {
  const snapshot = await firestoreDb.collection('attempts')
    .where('testId', '==', testId)
    .get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// ----------------------------------------
// 4. NOTIFICATIONS COLLECTION OPERATIONS
// ----------------------------------------
export async function getNotifications(): Promise<any[]> {
  const snapshot = await firestoreDb.collection('notifications').get();
  const list = snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
  // Sort in-memory desc by createdAt
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function insertNotification(notificationData: any): Promise<any> {
  const idValue = notificationData.id || 'notif-' + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...notificationData,
    id: idValue,
    createdAt: notificationData.createdAt || new Date().toISOString()
  };
  await firestoreDb.collection('notifications').doc(idValue).set(finalData);
  return finalData;
}

export async function markNotificationsRead(studentId: string): Promise<void> {
  const snapshot = await firestoreDb.collection('notifications').get();
  const batch = firestoreDb.batch();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.recipientId === studentId || data.recipientId === 'all') {
      batch.update(doc.ref, { read: true });
    }
  });
  await batch.commit();
}

// ----------------------------------------
// 5. ACTIVITIES (AUDIT) OPERATIONS
// ----------------------------------------
export async function getActivities(): Promise<any[]> {
  const snapshot = await firestoreDb.collection('activities').get();
  const list = snapshot.docs.map(doc => convertDoc(doc)).filter(Boolean);
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function insertActivity(activityData: any): Promise<any> {
  const idValue = activityData.id || 'act-' + Math.random().toString(36).substring(2, 9);
  const finalData = {
    ...activityData,
    id: idValue,
    timestamp: activityData.timestamp || new Date().toISOString()
  };
  await firestoreDb.collection('activities').doc(idValue).set(finalData);
  return finalData;
}

// ----------------------------------------
// 6. ADMIN PASSWORD OPERATIONS
// ----------------------------------------
export async function getAdminPassword(): Promise<string> {
  const docRef = firestoreDb.collection('admin_settings').doc('global');
  const dSnapshot = await docRef.get();
  if (dSnapshot.exists) {
    return dSnapshot.data()?.adminPassword || 'ezadmin01';
  } else {
    // Seed default settings row
    await docRef.set({ adminPassword: 'ezadmin01' });
    return 'ezadmin01';
  }
}

export async function updateAdminPassword(pwd: string): Promise<void> {
  const docRef = firestoreDb.collection('admin_settings').doc('global');
  await docRef.set({ adminPassword: pwd });
}
