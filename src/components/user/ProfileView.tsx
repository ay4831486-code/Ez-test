import React, { useState } from 'react';
import { 
  User, 
  Key, 
  Phone, 
  Award, 
  School, 
  Hash, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Calendar, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Sliders,
  LogOut,
  X,
  LineChart as LineChartIcon,
  RefreshCw
} from 'lucide-react';
import { DatabaseState, Student, Attempt, Test } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

function getHeatmapData(attempts: Attempt[]) {
  const data = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // 6 months = 26 weeks * 7 days = 182 days
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24*60*60*1000);
    data.push({
      date: d,
      count: 0
    });
  }

  attempts.forEach(a => {
    if (!a.submitTime) return;
    const ad = new Date(a.submitTime);
    ad.setHours(0,0,0,0);
    const diffTime = today.getTime() - ad.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 182) {
      data[181 - diffDays].count++;
    }
  });

  return data;
}

function PerformanceHeatmap({ attempts }: { attempts: Attempt[] }) {
  const data = React.useMemo(() => getHeatmapData(attempts), [attempts]);
  
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-emerald-200';
    if (count === 2) return 'bg-emerald-400';
    if (count === 3) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((day, dIdx) => (
              <div 
                key={dIdx} 
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`} 
                title={`${day.date.toDateString()}: ${day.count} attempts`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-slate-100" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800" />
        <span>More</span>
      </div>
    </div>
  );
}

interface ProfileViewProps {
  db: DatabaseState;
  currUser: any;
  userType: 'admin' | 'student' | null;
  syncDB: () => Promise<void>;
  onLogout?: () => void;
  setSelectedAnalysis?: (a: { test: Test; attempt: Attempt } | null) => void;
}

export default function ProfileView({ 
  db, 
  currUser, 
  userType, 
  syncDB,
  onLogout,
  setSelectedAnalysis
}: ProfileViewProps) {
  // Common states
  const [activeSubView, setActiveSubView] = useState<'details' | 'academic_stats' | 'rank_history' | 'users' | 'add_student' | 'admin_password'>(
    userType === 'admin' ? 'users' : 'details'
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student details edit form states
  const [studentName, setStudentName] = useState(currUser?.name || '');
  const [studentMobile, setStudentMobile] = useState(currUser?.mobile || '');
  const [studentClass, setStudentClass] = useState(currUser?.classVal || 'Class 12');
  const [studentRoll, setStudentRoll] = useState(currUser?.rollNumber || '');
  const [studentBatch, setStudentBatch] = useState(currUser?.batchYear || '2025-2026');
  const [studentPassword, setStudentPassword] = useState(currUser?.password || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Admin password states
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [isUpdatingAdminPassword, setIsUpdatingAdminPassword] = useState(false);

  // Admin select/filter state
  const [selectedClassFilter, setSelectedClassFilter] = useState<'All' | 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12'>('All');
  const [selectedBatchYearFilter, setSelectedBatchYearFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pull-to-refresh states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);

  // Admin selected student for modal editing
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormMobile, setEditFormMobile] = useState('');
  const [editFormClass, setEditFormClass] = useState('Class 12');
  const [editFormRoll, setEditFormRoll] = useState('');
  const [editFormBatch, setEditFormBatch] = useState('2025-2026');
  const [editFormPassword, setEditFormPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Admin direct enroll form states
  const [directName, setDirectName] = useState('');
  const [directMobile, setDirectMobile] = useState('');
  const [directClass, setDirectClass] = useState('Class 12');
  const [directRoll, setDirectRoll] = useState('');
  const [directBatch, setDirectBatch] = useState('2025-2026');
  const [directPassword, setDirectPassword] = useState('');
  const [isAddingDirectly, setIsAddingDirectly] = useState(false);

  const notifications = db?.notifications || [];
  const tests = db?.tests || [];
  const attempts = db?.attempts || [];
  const students = db?.students || [];

  // ==========================================
  // RANK CALCULATIONS (REAL AND SCIENTIFIC)
  // ==========================================
  const approvedStudents = students.filter(s => s.status === 'Approved');
  
  // Helper to compute a student's aggregate performance indicator (avg score across all tests they attempted)
  const getStudentAveragePerformance = (studentId: string) => {
    const studentAttempts = attempts.filter(a => a.studentId === studentId && a.status === 'submitted');
    if (studentAttempts.length === 0) return -1; // No submitted attempts
    const totalCorrect = studentAttempts.reduce((sum, current) => sum + current.score, 0);
    return totalCorrect / studentAttempts.length;
  };

  // Build descending ranked list of student IDs for approved students based on their computed average scores
  const getLeaderboardRanks = (classFilter?: string) => {
    const relevantStudents = classFilter 
      ? approvedStudents.filter(s => s.classVal === classFilter)
      : approvedStudents;

    const withPerformance = relevantStudents.map(student => {
      return {
        id: student.studentId,
        name: student.name,
        avg: getStudentAveragePerformance(student.studentId)
      };
    }).filter(item => item.avg >= 0); // Exclude students with no submissions

    // Sort descending by average score
    return withPerformance.sort((a, b) => b.avg - a.avg);
  };

  // 1. Overall Rank
  const overallLeaderboard = getLeaderboardRanks();
  const studentOverallIndex = overallLeaderboard.findIndex(item => item.id === currUser?.studentId);
  const calculatedOverallRank = studentOverallIndex !== -1 ? studentOverallIndex + 1 : null;
  const totalStudentsWithScores = overallLeaderboard.length;

  // 2. Class Rank
  const classLeaderboard = getLeaderboardRanks(currUser?.classVal);
  const studentClassIndex = classLeaderboard.findIndex(item => item.id === currUser?.studentId);
  const calculatedClassRank = studentClassIndex !== -1 ? studentClassIndex + 1 : null;
  const totalClassmatesWithScores = classLeaderboard.length;

  // 3. Best Score & Best Rank
  const currStudentAttempts = attempts.filter(a => a.studentId === currUser?.studentId && a.status === 'submitted');
  const bestScore = currStudentAttempts.length > 0 
    ? Math.max(...currStudentAttempts.map(a => a.score)) 
    : 0;

  const validTestRanks = currStudentAttempts.map(a => a.rank).filter((r): r is number => r !== undefined);
  const bestRankKey = validTestRanks.length > 0 
    ? Math.min(...validTestRanks) 
    : null;

  // ==========================================
  // STUDENT: TRIGGER DIRECT DETAILS UPDATE
  // ==========================================
  const handleStudentProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentMobile.trim() || !studentRoll.trim() || !studentPassword.trim()) {
      setErrorMsg("Please complete all fields.");
      return;
    }

    setIsUpdatingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Find database entry ID for current user
      const dbStudent = students.find(s => s.studentId === currUser.studentId);
      if (!dbStudent) {
        setErrorMsg("Failed to sync your local account metadata.");
        return;
      }

      const res = await fetch(`/api/students/${dbStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          mobile: studentMobile,
          classVal: studentClass,
          rollNumber: studentRoll,
          batchYear: studentBatch,
          password: studentPassword
        })
      });

      if (res.ok) {
        setSuccessMsg("Your EZ credentials and details updated successfully in the cloud!");
        triggerToastNotification("Profile change success");
        await syncDB();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Update aborted by cloud database.");
      }
    } catch (err) {
      setErrorMsg("Internal offline network error.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ==========================================
  // ADMIN: CHANGE PASSWORD HANDLER
  // ==========================================
  const handleAdminPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCurrentPassword.trim() || !adminNewPassword.trim() || !adminConfirmPassword.trim()) {
      setErrorMsg("Please fill in all password fields.");
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setIsUpdatingAdminPassword(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword
        })
      });

      if (res.ok) {
        setSuccessMsg("Administrator password updated successfully!");
        setAdminCurrentPassword('');
        setAdminNewPassword('');
        setAdminConfirmPassword('');
        triggerToastNotification("Password change success");
        await syncDB();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Password change rejected.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the administration service.");
    } finally {
      setIsUpdatingAdminPassword(false);
    }
  };

  // ==========================================
  // ADMIN: INLINE DIRECT STUDENT ADDTION 
  // ==========================================
  const handleDirectEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim() || !directMobile.trim() || !directRoll.trim() || !directPassword.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setIsAddingDirectly(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: directName,
          mobile: directMobile,
          classVal: directClass,
          rollNumber: directRoll,
          batchYear: directBatch,
          password: directPassword
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Directly enrolled student: ${directName}! Assigned Student ID: ${data.student.studentId}`);
        // Reset fields
        setDirectName('');
        setDirectMobile('');
        setDirectRoll('');
        setDirectPassword('');
        await syncDB();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to enrol student.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the administration service.");
    } finally {
      setIsAddingDirectly(false);
    }
  };

  // ==========================================
  // ADMIN: OPEN STUDENT DETAIL EDIT MODAL
  // ==========================================
  const startEditingStudent = (student: Student) => {
    setEditingStudent(student);
    setEditFormName(student.name);
    setEditFormMobile(student.mobile);
    setEditFormClass(student.classVal);
    setEditFormRoll(student.rollNumber);
    setEditFormBatch(student.batchYear || '2025-2026');
    setEditFormPassword(student.password || 'studentpassword');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAdminSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSavingEdit(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormName,
          mobile: editFormMobile,
          classVal: editFormClass,
          rollNumber: editFormRoll,
          batchYear: editFormBatch,
          password: editFormPassword
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully saved updated credential schemas for ${editFormName}.`);
        setEditingStudent(null);
        await syncDB();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Cloud modification was rejected.");
      }
    } catch (_) {
      setErrorMsg("Failed connecting to the admin service.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ==========================================
  // ADMIN: DIRECT DELETE STUDENT (API INSIDE)
  // ==========================================
  const handleDeleteStudentDirectly = async (student: Student) => {
    const check = window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete student ${student.name} (${student.studentId || 'Pending'})? This will erase all OMR paper scores, attempts and dashboard history records irreversibly.`);
    if (!check) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccessMsg(`Irreversibly deleted student details and results records for ${student.name}.`);
        await syncDB();
      } else {
        setErrorMsg("Server error: Student deletion could not complete.");
      }
    } catch (_) {
      setErrorMsg("Failing cloud authorization.");
    }
  };

  // Toggle dynamic notification helpers
  const triggerToastNotification = (action: string) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, context.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.3);
    } catch (_) {}
  };

  // Filter students class wise & by search query for admin's grid
  const filteredStudentsForAdmin = approvedStudents.filter(student => {
    const matchClass = selectedClassFilter === 'All' ? true : student.classVal === selectedClassFilter;
    const matchBatch = selectedBatchYearFilter === 'All' ? true : (student.batchYear || '2025-2026') === selectedBatchYearFilter;
    const matchQuery = searchQuery.trim() === '' ? true : (
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (student.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mobile.includes(searchQuery)
    );
    return matchClass && matchBatch && matchQuery;
  });

  const availableBatchYears = ['All', ...Array.from(new Set(approvedStudents.map(s => s.batchYear || '2025-2026'))).sort((a, b) => b.localeCompare(a))];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      setPullStartY(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0) {
      const move = e.targetTouches[0].clientY;
      if (move > pullStartY) {
        setPullMoveY(Math.min((move - pullStartY) * 0.4, 60)); 
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullMoveY >= 50) {
      setIsRefreshing(true);
      await syncDB?.();
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullStartY(0);
    setPullMoveY(0);
  };

  return (
    <div 
      className="space-y-6 font-sans pb-28 md:pb-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh Indicator */}
      <div 
        className="absolute w-full flex justify-center left-0 top-0 z-50 pointer-events-none transition-transform duration-200 mt-2"
        style={{ transform: `translateY(${Math.max(pullMoveY - 40, -40)}px)` }}
      >
        <div className={`bg-white shadow-md rounded-full p-2 border border-slate-200 transition-opacity ${pullMoveY > 0 ? 'opacity-100' : 'opacity-0'}`}>
           <RefreshCw className={`h-5 w-5 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullMoveY * 5}deg)` }}/>
        </div>
      </div>
      
      {/* Banner design - Premium Coaching look & feel */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-xl select-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-amber-500/5 rounded-full filter blur-lg select-none" />
        
        <div className="z-10 flex items-center gap-4.5">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center font-bold text-lg shadow-inner shadow-indigo-500/20">
            {userType === 'admin' ? 'AD' : (currUser?.name?.slice(0, 2).toUpperCase() || 'ST')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[9px] font-mono font-bold uppercase text-indigo-400 tracking-widest">
                {userType === 'admin' ? 'Principal Administrator' : `${currUser?.classVal || "General Class"} Student`}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold font-display text-white mt-1.5 tracking-tight flex items-center gap-2">
              {userType === 'admin' ? 'Admin Controller Desk' : currUser?.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Registered ID: <span className="text-neutral-200 font-semibold">{userType === 'admin' ? 'ezadmin01' : currUser?.studentId}</span>
            </p>
          </div>
        </div>

        <div className="z-10 flex gap-2 w-full sm:w-auto">
          {userType === 'admin' ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSubView('users')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'users' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" /> Class-Wise Student Coordinator
              </button>
              <button
                onClick={() => setActiveSubView('add_student')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'add_student' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> Direct Enroll Wizard
              </button>
              <button
                onClick={() => setActiveSubView('admin_password')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'admin_password' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Key className="h-3.5 w-3.5 text-amber-500" /> Change Password
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveSubView('academic_stats')}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'academic_stats' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Bento Academic Stats
              </button>
              <button
                onClick={() => setActiveSubView('rank_history')}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'rank_history' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <LineChartIcon className="h-3.5 w-3.5 text-emerald-400" /> Rank History
              </button>
              <button
                onClick={() => setActiveSubView('details')}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  activeSubView === 'details' 
                    ? 'bg-white text-slate-900 border-white font-extrabold' 
                    : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5 text-purple-400" /> Edit Credentials
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success / Error notification bar */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in font-mono">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in font-mono">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* =======================================================
          STUDENT PATHWAY A: EDIT PROFILE AND CREDENTIALS
          ======================================================= */}
      {userType === 'student' && activeSubView === 'details' && (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Left: Form Details Editor */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm text-left">
            <div className="pb-3 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900 font-display">Edit Profile Schema</h3>
              <p className="text-xs text-slate-500 mt-1">Keep your roll number, batch session, mobile phone, and secure password validated.</p>
            </div>

            <form onSubmit={handleStudentProfileUpdate} className="space-y-4 font-sans text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Student Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User className="h-4 w-4" /></span>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="h-4 w-4" /></span>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                      value={studentMobile}
                      onChange={(e) => setStudentMobile(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Active Class</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><School className="h-4 w-4" /></span>
                    <select
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition appearance-none"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                    >
                      <option value="Class 9">Class 9th</option>
                      <option value="Class 10">Class 10th</option>
                      <option value="Class 11">Class 11th</option>
                      <option value="Class 12">Class 12th</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Roll / Seat No.</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash className="h-4 w-4" /></span>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Session Batch Year</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar className="h-4 w-4" /></span>
                    <input
                      type="text"
                      placeholder="e.g. 2025-2026"
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                      value={studentBatch}
                      onChange={(e) => setStudentBatch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Update Login Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key className="h-4 w-4" /></span>
                  <input
                    type="password"
                    placeholder="Enter new strong password"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition font-mono"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-lg shadow-slate-900/10 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  {isUpdatingProfile ? 'Saving Details...' : 'Save Credential Updates'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Cards: Informational coaching policy */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-sm text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" /> Security Policy
              </h4>
              <p className="text-[11px] text-slate-350 leading-relaxed mt-2.5">
                Your credentials verify your rank on national live tests. Keep this mobile number and password strictly private from classmates. Ranks are compiled and processed daily.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left">
              <h4 className="text-xs font-bold text-slate-900 font-display">Institute Info</h4>
              <div className="space-y-3.5 mt-4 text-xs font-sans text-slate-650">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span>Authorized Center ID:</span>
                  <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-900 font-bold">EZ-PREMIER-MAIN</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span>Batch Session:</span>
                  <span className="text-slate-900 font-bold font-mono">{studentBatch}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span>Current Class:</span>
                  <span className="text-slate-950 font-extrabold text-indigo-600">{studentClass}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Board:</span>
                  <span className="font-extrabold text-teal-700 bg-teal-50 border border-teal-150 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">Bihar Board (BSEB)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =======================================================
          STUDENT PATHWAY B: ACADEMIC BENTO GRID STATISTICS
          ======================================================= */}
      {userType === 'student' && activeSubView === 'academic_stats' && (
        <div className="space-y-6 text-left">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold font-display text-slate-900">Academic Scoreboard &amp; Bento Summary</h3>
            <p className="text-xs text-slate-500 mt-1">Dynamic computations parsed across active coaching test batches.</p>
          </div>

          {/* BENTO GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Bento item 1: Overall Rank */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute top-0 right-0 p-3 text-indigo-400 opacity-20">
                <Award className="h-20 w-20" />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">ALL-INSTITUTE OVERALL RANK</span>
                <p className="text-[11px] text-slate-400 mt-1">Comparison across all registered students</p>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-extrabold tracking-tight font-display text-white">
                  {calculatedOverallRank ? `#${calculatedOverallRank}` : <span className="text-slate-500 text-sm font-bold font-sans">N/A (No tests submitted)</span>}
                </p>
                {calculatedOverallRank && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Based on avg evaluated correct score against {totalStudentsWithScores} classmates</p>
                )}
              </div>
            </div>

            {/* Bento item 2: Class Rank */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-850 shadow-md relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute top-0 right-0 p-3 text-amber-500 opacity-25">
                <School className="h-20 w-20" />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">CLASSWISE SECTOR RANK</span>
                <p className="text-[11px] text-slate-400 mt-1">Comparison within your active class level ({currUser?.classVal || 'General'})</p>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-extrabold tracking-tight font-display text-white">
                  {calculatedClassRank ? `#${calculatedClassRank}` : <span className="text-slate-500 text-sm font-bold font-sans">N/A (No tests submitted)</span>}
                </p>
                {calculatedClassRank && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Top percentage in {currUser?.classVal || 'your level'} out of {totalClassmatesWithScores} active attempt scores</p>
                )}
              </div>
            </div>

            {/* Bento item 3: Key scorecard stats (Best Score / Best Rank) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-44">
              <div className="pb-2 border-b border-slate-100">
                <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">BEST PERFORMANCE STATS</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Best Correct Score</span>
                  <p className="text-2xl font-extrabold text-slate-800 font-display mt-1">{bestScore} <span className="text-xs text-slate-400 font-normal">marks</span></p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Best Test Rank</span>
                  <p className="text-2xl font-extrabold text-indigo-600 font-display mt-1">
                    {bestRankKey ? `#${bestRankKey}` : <span className="text-slate-400 text-xs">-</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Bento item: Performance Heatmap (Full width) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm md:col-span-3 text-left overflow-hidden">
              <div className="pb-3 border-b border-slate-150 mb-4">
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-900">Performance Heatmap</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Test attempt activity tracking over the last 6 months.</p>
              </div>
              <PerformanceHeatmap attempts={currStudentAttempts} />
            </div>

            {/* Bento item 4: Particular Test-Wise Rank Metrics (Full width bento block) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm md:col-span-3 text-left">
              <div className="pb-3 border-b border-slate-150 flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-900">Particular OMR Test Evaluated Rank Sheets</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Summary of individual evaluation sheets processed in coaching institute databases.</p>
                </div>
                <div className="p-1 px-3.5 bg-indigo-50 border border-indigo-100/50 rounded-full text-[10px] text-indigo-750 font-bold font-mono">
                  Submitted Exams Count: {currStudentAttempts.length}
                </div>
              </div>

              {currStudentAttempts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No test attempts evaluated yet.</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Submit your live OMR sheets in the examinations portal to generate interactive scoreboards in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-3 md:hidden pb-2">
                    {currStudentAttempts.map((attempt, index) => {
                      const targetTest = tests.find(t => t.id === attempt.testId);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          key={attempt.id} 
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-slate-300 transition"
                          onClick={() => {
                            if (setSelectedAnalysis && targetTest) {
                              setSelectedAnalysis({ test: targetTest, attempt });
                            }
                          }}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="inline-block text-[9px] uppercase tracking-wider font-mono text-indigo-650 bg-indigo-50 border border-indigo-100/50 rounded px-1.5 py-0.5 mb-1.5">
                                {targetTest?.subject || "Physics"}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{targetTest?.title || "Evaluating Test Paper"}</h4>
                            </div>
                            <span 
                              className="px-3 py-1 bg-slate-900 border border-slate-800 text-white font-mono text-[10px] font-bold rounded-xl shadow-xs whitespace-nowrap cursor-pointer hover:bg-slate-800 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setSelectedAnalysis && targetTest) {
                                  setSelectedAnalysis({ test: targetTest, attempt });
                                }
                              }}
                            >
                              {attempt.rank ? `#${attempt.rank}` : "Evaluating..."}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                            <div>
                              <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Date</p>
                              <p className="text-slate-600 font-mono text-[10px] font-bold">
                                {attempt.submitTime ? new Date(attempt.submitTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 text-center">Score</p>
                              <p className="text-slate-850 font-mono text-[10px] font-bold text-center">
                                {attempt.correctAnswers} / {Object.keys(targetTest?.answerKey || {}).length || 10}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 text-right">Accuracy</p>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${attempt.accuracy >= 75 ? 'bg-emerald-50 text-emerald-650' : attempt.accuracy >= 50 ? 'bg-amber-50 text-amber-650' : 'bg-rose-50 text-rose-650'}`}>
                                {attempt.accuracy}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50 text-[10px] uppercase font-mono tracking-wider">
                        <th className="py-2.5 px-4 rounded-l-xl">Subject &amp; Name</th>
                        <th className="py-2.5 px-4 font-normal">Evaluation Date</th>
                        <th className="py-2.5 px-4 font-normal">Score Correct</th>
                        <th className="py-2.5 px-4 font-normal text-right">OMR Accuracy</th>
                        <th className="py-2.5 px-4 text-center rounded-r-xl">Your Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currStudentAttempts.map((attempt) => {
                        const targetTest = tests.find(t => t.id === attempt.testId);
                        return (
                          <tr 
                            key={attempt.id} 
                            className="hover:bg-slate-50/50 transition cursor-pointer"
                            onClick={() => {
                              if (setSelectedAnalysis && targetTest) {
                                setSelectedAnalysis({ test: targetTest, attempt });
                              }
                            }}
                          >
                            <td className="py-3 px-4 font-sans font-bold text-slate-900">
                              <span className="block text-[9px] uppercase tracking-wider font-mono text-indigo-650 bg-indigo-50 border border-indigo-100/50 rounded px-1.5 py-0.2 w-fit mb-1">
                                {targetTest?.subject || "Physics"}
                              </span>
                              {targetTest?.title || "Evaluating Test Paper"}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px] font-bold">
                              {attempt.submitTime ? new Date(attempt.submitTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-slate-850 font-mono text-[11px] font-bold">
                              {attempt.correctAnswers} / {Object.keys(targetTest?.answerKey || {}).length || 10} correct
                            </td>
                            <td className="py-3 px-4 text-slate-650 font-mono font-bold text-right">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${attempt.accuracy >= 75 ? 'bg-emerald-50 text-emerald-650' : attempt.accuracy >= 50 ? 'bg-amber-50 text-amber-650' : 'bg-rose-50 text-rose-650'}`}>
                                {attempt.accuracy}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-white font-mono text-xs font-bold rounded-xl shadow-xs inline-block">
                                {attempt.rank ? `#${attempt.rank}` : "Evaluating..."}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =======================================================
          STUDENT PATHWAY C: RANK HISTORY
          ======================================================= */}
      {userType === 'student' && activeSubView === 'rank_history' && (
        <div className="space-y-6 text-left">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold font-display text-slate-900">Rank History Tracker</h3>
            <p className="text-xs text-slate-500 mt-1">Visualize your competitive standing evolution across scheduled tests.</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            {currStudentAttempts.filter(a => a.rank !== undefined).length < 2 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <LineChartIcon className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">Not enough data to display rank evolution.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Submit at least 2 structured tests to track your rank over time.</p>
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={currStudentAttempts
                      .slice()
                      .sort((a, b) => new Date(a.submitTime || 0).getTime() - new Date(b.submitTime || 0).getTime())
                      .filter(a => a.rank !== undefined)
                      .map(a => {
                        const targetTest = tests.find(t => t.id === a.testId);
                        return {
                          name: targetTest?.title || "Unknown Test",
                          rank: a.rank,
                          date: a.submitTime ? new Date(a.submitTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''
                        };
                      })}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis 
                      reversed 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      label={{ value: 'Rank (Lower is Better)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#475569' } }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#4f46e5' }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      formatter={(value: number) => [`#${value}`, 'Rank']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rank" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      activeDot={{ r: 6, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }} 
                      dot={{ r: 4, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          ADMIN PATHWAY A: VIEW AND EDIT STUDENTS CLASS-WISE
          ======================================================= */}
      {userType === 'admin' && activeSubView === 'users' && (
        <div className="space-y-6 text-left">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Administrative Student Directory (Class-Wise Filters)</h3>
              <p className="text-xs text-slate-500 mt-1">Directly edit student records, change passwords, change mobile numbers, or delete students.</p>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Batch Year Dropdown Filter */}
              <div className="inline-flex bg-slate-100 p-1 border border-slate-200 rounded-2xl w-fit">
                <select
                  value={selectedBatchYearFilter}
                  onChange={(e) => setSelectedBatchYearFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold text-slate-700 py-1 px-2 focus:ring-0 cursor-pointer outline-none cursor-pointer"
                >
                  <option value="All" disabled className="text-slate-400">Batch Year</option>
                  {availableBatchYears.map(year => (
                    <option key={year} value={year}>{year === 'All' ? 'All Batches' : year}</option>
                  ))}
                </select>
              </div>

              {/* Class filtering buttons */}
              <div className="inline-flex bg-slate-100 p-1 border border-slate-200 rounded-2xl w-fit">
                {['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((classOption) => (
                  <button
                    key={classOption}
                    onClick={() => setSelectedClassFilter(classOption as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
                      selectedClassFilter === classOption 
                        ? 'bg-slate-900 text-white font-extrabold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {classOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search students by name, ID, or mobile number..."
              className="bg-transparent border-0 focus:ring-0 text-xs w-full text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Student Grid listing */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            {filteredStudentsForAdmin.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No active students found in this search filter.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the Direct Enroll Wizard to instantly onboard class admissions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto select-none">
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden pb-4">
                  {filteredStudentsForAdmin.map((student, index) => (
                    <motion.div 
                      key={student.id} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold text-[10px]">
                              {student.studentId || 'Pending'}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-750 font-bold rounded-full font-mono text-[9px]">
                              {student.classVal}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditingStudent(student)}
                            className="p-1.5 bg-slate-50 border border-slate-200 text-indigo-750 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition cursor-pointer"
                            title="Modify Details"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentDirectly(student)}
                            className="p-1.5 bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Mobile</p>
                          <p className="text-slate-750 font-mono text-[11px] font-semibold">{student.mobile}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Batch Year</p>
                          <p className="text-slate-550 font-mono text-[11px] font-bold">{student.batchYear || '2025-2026'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Password</p>
                          <p className="text-slate-500 font-mono text-[11px] font-bold truncate">{student.password || 'studentpassword'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 font-bold bg-slate-50 text-[10px] uppercase font-mono tracking-wider">
                      <th className="py-2.5 px-4 rounded-l-xl">Student ID</th>
                      <th className="py-2.5 px-4 font-normal">Candidate Name</th>
                      <th className="py-2.5 px-4 font-normal">Class Sector</th>
                      <th className="py-2.5 px-4 font-normal">Mobile / Phone</th>
                      <th className="py-2.5 px-4 font-normal">Batch Year</th>
                      <th className="py-2.5 px-4 font-normal">Password key</th>
                      <th className="py-2.5 px-4 text-center rounded-r-xl">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudentsForAdmin.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold text-[11px]">
                            {student.studentId || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-750 font-bold rounded-full font-mono text-[10px]">
                            {student.classVal}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-750 font-mono text-[11px]">{student.mobile}</td>
                        <td className="py-3 px-4 text-slate-550 font-mono text-[11px] font-bold">{student.batchYear || '2025-2026'}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 font-bold">{student.password || 'studentpassword'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => startEditingStudent(student)}
                              className="p-1.5 bg-slate-50 border border-slate-200 text-indigo-750 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition cursor-pointer"
                              title="Modify Details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudentDirectly(student)}
                              className="p-1.5 bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          ADMIN PATHWAY B: DIRECT ENROLL / ADD STUDENT WIZARD
          ======================================================= */}
      {userType === 'admin' && activeSubView === 'add_student' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs text-left max-w-2xl mx-auto font-sans">
          <div className="pb-3 border-b border-slate-100 mb-5">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-650" /> Direct Enrollment Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">Directly generate verified user accounts. An official Student ID will be automatically mapped to their classroom sector.</p>
          </div>

          <form onSubmit={handleDirectEnroll} className="space-y-4 font-sans text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">New Student Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><User className="h-4 w-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="Enter candidate full name"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Primary Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="h-4 w-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                    value={directMobile}
                    onChange={(e) => setDirectMobile(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Classroom Group</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><School className="h-4 w-4" /></span>
                  <select
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition appearance-none"
                    value={directClass}
                    onChange={(e) => setDirectClass(e.target.value)}
                  >
                    <option value="Class 9">Class 9th</option>
                    <option value="Class 10">Class 10th</option>
                    <option value="Class 11">Class 11th</option>
                    <option value="Class 12">Class 12th</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Candidate Roll No.</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash className="h-4 w-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                    value={directRoll}
                    onChange={(e) => setDirectRoll(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Academic Session Batch</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar className="h-4 w-4" /></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025-2026"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition"
                    value={directBatch}
                    onChange={(e) => setDirectBatch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Default Welcome Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  placeholder="Enter initial login password"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition font-mono"
                  value={directPassword}
                  onChange={(e) => setDirectPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isAddingDirectly}
                className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-lg shadow-slate-900/10 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                {isAddingDirectly ? 'Creating Account...' : 'Directly Validate & Enroll Candidate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          ADMIN PATHWAY D: ADMIN CHANGE PASSWORD PORTAL
          ======================================================= */}
      {userType === 'admin' && activeSubView === 'admin_password' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs text-left max-w-md mx-auto font-sans animate-fade-in">
          <div className="pb-3 border-b border-slate-100 mb-5">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-650" /> Change Admin Password
            </h3>
            <p className="text-xs text-slate-500 mt-1">Protect your administrative dashboard by updating your secure login root credentials.</p>
          </div>

          <form onSubmit={handleAdminPasswordUpdate} className="space-y-4 font-sans text-slate-700">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key className="h-4 w-4" /></span>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition font-mono"
                  value={adminCurrentPassword}
                  onChange={(e) => setAdminCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key className="h-4 w-4" /></span>
                <input
                  type="password"
                  required
                  placeholder="Enter new secure password"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition font-mono"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Key className="h-4 w-4" /></span>
                <input
                  type="password"
                  required
                  placeholder="Re-type new secure password"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 transition font-mono"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isUpdatingAdminPassword}
                className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-lg shadow-slate-900/10 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Key className="h-4 w-4 text-amber-400" />
                {isUpdatingAdminPassword ? 'Updating Password...' : 'Save & Update Credentials'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =======================================================
          ADMIN PATHWAY C: STUDENT MODAL EDIT OVERLAY
          ======================================================= */}
      <AnimatePresence>
      {editingStudent && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          id="student-edit-overlay" 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl w-full max-w-lg relative text-left font-sans"
          >
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pb-3 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-1.5">
                <Edit3 className="h-4.5 w-4.5 text-indigo-650" /> Modify Student Details
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Assigned Login Student ID: <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-bold text-slate-800">{editingStudent.studentId || 'Pending'}</span></p>
            </div>

            <form onSubmit={handleAdminSaveStudentEdit} className="space-y-4 font-sans text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Student Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition"
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Mobile/Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition"
                    value={editFormMobile}
                    onChange={(e) => setEditFormMobile(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Class sector</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition appearance-none"
                    value={editFormClass}
                    onChange={(e) => setEditFormClass(e.target.value)}
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Roll Number</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition"
                    value={editFormRoll}
                    onChange={(e) => setEditFormRoll(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Batch Year</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition"
                    value={editFormBatch}
                    onChange={(e) => setEditFormBatch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">Credential Password key</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none focus:bg-white text-slate-900 transition font-mono"
                  value={editFormPassword}
                  onChange={(e) => setEditFormPassword(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition cursor-pointer font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  {isSavingEdit ? 'Applying...' : 'Apply Details'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
