import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from "firebase/firestore";
import { firestore } from "./firebase";

// Helper to convert Firestore document to a plain JS Object with string fields
function docToObject(docSnap: any): any {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id
  };
}

export async function getStudents(): Promise<any[]> {
  const qSnapshot = await getDocs(collection(firestore, "students"));
  return qSnapshot.docs.map(doc => docToObject(doc));
}

export async function getStudentByMobileOrId(username: string): Promise<any | null> {
  // Query by studentId first
  const qById = query(collection(firestore, "students"), where("studentId", "==", username));
  let qSnapshot = await getDocs(qById);
  
  if (qSnapshot.empty) {
    // If not found, query by mobile
    const qByMobile = query(collection(firestore, "students"), where("mobile", "==", username));
    qSnapshot = await getDocs(qByMobile);
  }

  if (qSnapshot.empty) {
    // Try by document ID (id)
    const docRef = doc(firestore, "students", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToObject(docSnap);
    }
    return null;
  }

  return docToObject(qSnapshot.docs[0]);
}

export async function getStudentById(id: string): Promise<any | null> {
  const docRef = doc(firestore, "students", id);
  const docSnap = await getDoc(docRef);
  return docToObject(docSnap);
}

export async function insertStudent(studentData: any): Promise<any> {
  const idValue = studentData.id || 'stud-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...studentData, id: idValue };
  
  // Save to Firestore using document ID
  const docRef = doc(firestore, "students", idValue);
  await setDoc(docRef, finalData);
  return finalData;
}

export async function updateStudent(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  
  const docRef = doc(firestore, "students", id);
  await updateDoc(docRef, cleanData);
  return await getStudentById(id);
}

export async function deleteStudent(id: string): Promise<void> {
  const docRef = doc(firestore, "students", id);
  await deleteDoc(docRef);
}

export async function getTests(): Promise<any[]> {
  const qSnapshot = await getDocs(collection(firestore, "tests"));
  return qSnapshot.docs.map(doc => docToObject(doc));
}

export async function getTestById(id: string): Promise<any | null> {
  const docRef = doc(firestore, "tests", id);
  const docSnap = await getDoc(docRef);
  return docToObject(docSnap);
}

export async function insertTest(testData: any): Promise<any> {
  const idValue = testData.id || 'test-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...testData, id: idValue };
  
  const docRef = doc(firestore, "tests", idValue);
  await setDoc(docRef, finalData);
  return finalData;
}

export async function updateTest(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  
  const docRef = doc(firestore, "tests", id);
  await updateDoc(docRef, cleanData);
  return await getTestById(id);
}

export async function deleteTest(id: string): Promise<void> {
  const docRef = doc(firestore, "tests", id);
  await deleteDoc(docRef);
}

export async function getAttempts(): Promise<any[]> {
  const qSnapshot = await getDocs(collection(firestore, "attempts"));
  return qSnapshot.docs.map(doc => docToObject(doc));
}

export async function getAttemptsByStudentAndTest(studentId: string, testId: string, status?: string): Promise<any[]> {
  let q = query(
    collection(firestore, "attempts"), 
    where("studentId", "==", studentId),
    where("testId", "==", testId)
  );

  if (status) {
    q = query(
      collection(firestore, "attempts"), 
      where("studentId", "==", studentId),
      where("testId", "==", testId),
      where("status", "==", status)
    );
  }

  const qSnapshot = await getDocs(q);
  return qSnapshot.docs.map(doc => docToObject(doc));
}

export async function insertAttempt(attemptData: any): Promise<any> {
  const idValue = attemptData.id || 'att-' + Math.random().toString(36).substring(2, 9);
  const finalData = { ...attemptData, id: idValue };
  
  const docRef = doc(firestore, "attempts", idValue);
  await setDoc(docRef, finalData);
  return finalData;
}

export async function updateAttempt(id: string, updateData: any): Promise<any | null> {
  const cleanData = { ...updateData };
  delete cleanData.id;
  Object.keys(cleanData).forEach(k => { if (cleanData[k] === undefined) delete cleanData[k]; });
  
  const docRef = doc(firestore, "attempts", id);
  await updateDoc(docRef, cleanData);
  
  const docSnap = await getDoc(docRef);
  return docToObject(docSnap);
}

export async function deleteAttemptsByStudentId(studentId: string): Promise<void> {
  const q = query(collection(firestore, "attempts"), where("studentId", "==", studentId));
  const qSnapshot = await getDocs(q);
  
  const batch = writeBatch(firestore);
  qSnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}

export async function deleteAttemptsByTestId(testId: string): Promise<void> {
  const q = query(collection(firestore, "attempts"), where("testId", "==", testId));
  const qSnapshot = await getDocs(q);
  
  const batch = writeBatch(firestore);
  qSnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}

export async function getNotifications(): Promise<any[]> {
  const qSnapshot = await getDocs(collection(firestore, "notifications"));
  const list = qSnapshot.docs.map(doc => docToObject(doc));
  
  // Sort in-memory to avoid needing standard composite indexing for simple queries
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function insertNotification(notificationData: any): Promise<any> {
  const idValue = notificationData.id || 'notif-' + Math.random().toString(36).substring(2, 9);
  const finalData = { 
    ...notificationData, 
    id: idValue,
    createdAt: notificationData.createdAt || new Date().toISOString()
  };
  
  const docRef = doc(firestore, "notifications", idValue);
  await setDoc(docRef, finalData);
  return finalData;
}

export async function markNotificationsRead(studentId: string): Promise<void> {
  // Query notifications where recipientId is studentId or 'all'
  const q1 = query(collection(firestore, "notifications"), where("recipientId", "==", studentId));
  const q2 = query(collection(firestore, "notifications"), where("recipientId", "==", "all"));
  
  const [shot1, shot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const batch = writeBatch(firestore);
  
  shot1.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  
  shot2.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  
  await batch.commit();
}

export async function getActivities(): Promise<any[]> {
  const qSnapshot = await getDocs(collection(firestore, "activities"));
  const list = qSnapshot.docs.map(doc => docToObject(doc));
  
  // Sort in-memory
  return list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
}

export async function insertActivity(activityData: any): Promise<any> {
  const idValue = activityData.id || 'act-' + Math.random().toString(36).substring(2, 9);
  const finalData = { 
    ...activityData, 
    id: idValue,
    timestamp: activityData.timestamp || new Date().toISOString()
  };
  
  const docRef = doc(firestore, "activities", idValue);
  await setDoc(docRef, finalData);
  return finalData;
}

export async function getAdminPassword(): Promise<string> {
  const docRef = doc(firestore, "adminSettings", "settings");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().adminPassword;
  } else {
    // default setup
    await setDoc(docRef, { adminPassword: 'ezadmin01' });
    return 'ezadmin01';
  }
}

export async function updateAdminPassword(pwd: string): Promise<void> {
  const docRef = doc(firestore, "adminSettings", "settings");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, { adminPassword: pwd });
  } else {
    await setDoc(docRef, { adminPassword: pwd });
  }
}
