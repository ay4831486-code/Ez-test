export interface Student {
  id: string;
  studentId: string;
  name: string;
  mobile: string;
  classVal: string;
  rollNumber: string;
  batchYear?: string; // e.g. "2025-2026"
  password?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  streakCount?: number;
}

export interface Test {
  id: string;
  title: string;
  type: 'live' | 'practice';
  classVal: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  pdfName: string;
  pdfData: string; // Base64
  questionImages?: string[]; // Array of base64 images for full-quality visual test
  answerKey: Record<number, string>;
  published: boolean;
  createdAt: string;
}

export interface Attempt {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  answers: Record<number, string>;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  status: 'started' | 'submitted';
  startTime: string;
  submitTime?: string;
  rank?: number;
  percentile?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'result' | 'reminder' | 'announcement';
  recipientId: 'all' | 'admin' | string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userType: 'admin' | 'student';
  action: string;
  timestamp: string;
}

export interface DatabaseState {
  students: Student[];
  tests: Test[];
  attempts: Attempt[];
  notifications: Notification[];
  activities: ActivityLog[];
  adminPassword?: string;
}
