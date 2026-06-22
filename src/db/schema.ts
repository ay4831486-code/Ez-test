import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, real, jsonb } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID if needed
  studentId: text('student_id').notNull().unique(),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  classVal: text('class_val').notNull(),
  rollNumber: text('roll_number').notNull(),
  batchYear: text('batch_year'),
  password: text('password').notNull(), // hashed
  status: text('status').notNull().default('Pending'),
  isBlocked: boolean('is_blocked').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  streakCount: integer('streak_count').default(0)
});

export const tests = pgTable('tests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'live' | 'practice'
  classVal: text('class_val').notNull(),
  subject: text('subject').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  duration: integer('duration').notNull(),
  pdfName: text('pdf_name').notNull(),
  pdfData: text('pdf_data').notNull(),
  questionImages: jsonb('question_images'), // string[]
  answerKey: jsonb('answer_key').notNull(), // {1: 'A', 2: 'B'}
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const attempts = pgTable('attempts', {
  id: text('id').primaryKey(),
  testId: text('test_id').references(() => tests.id).notNull(),
  studentId: text('student_id').references(() => students.id).notNull(),
  studentName: text('student_name').notNull(),
  answers: jsonb('answers').notNull(), 
  score: integer('score').notNull().default(0),
  correctAnswers: integer('correct_answers').notNull().default(0),
  wrongAnswers: integer('wrong_answers').notNull().default(0),
  accuracy: real('accuracy').notNull().default(0),
  status: text('status').notNull(), // 'started' | 'submitted'
  startTime: timestamp('start_time').notNull(),
  submitTime: timestamp('submit_time'),
  rank: integer('rank'),
  percentile: real('percentile')
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  recipientId: text('recipient_id').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userType: text('user_type').notNull(), // 'admin' | 'student'
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

// Admin settings for things like adminPassword (single row likely)
export const adminSettings = pgTable('admin_settings', {
  id: serial('id').primaryKey(),
  adminPassword: text('admin_password').notNull().default('ezadmin01')
});

export const studentsRelations = relations(students, ({ many }) => ({
  attempts: many(attempts),
}));

export const testsRelations = relations(tests, ({ many }) => ({
  attempts: many(attempts),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  test: one(tests, {
    fields: [attempts.testId],
    references: [tests.id],
  }),
  student: one(students, {
    fields: [attempts.studentId],
    references: [students.id],
  })
}));
