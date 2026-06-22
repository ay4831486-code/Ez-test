import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload, Bot
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function HomeTab() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState, setIsAiChatOpen } = useAppContext();
  const [selectedClassFilter, setSelectedClassFilter] = React.useState<string>('All');
  const [topPerformersClassFilter, setTopPerformersClassFilter] = React.useState<string>('All');
  const studentAttempts = currUser ? db.attempts.filter((a: any) => a.studentId === currUser.studentId && a.status === 'submitted') : [];
  const maxScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map((a: any) => a.score)) : 1;
  const padding = 20; const height = 80; const width = 300;
  return (
    <>
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* Header overview */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-800">Welcome back, {currUser.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 font-sans">EZ TEST Evaluation platform, providing real-time assessments grading.</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono font-medium">Current Live Time: {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>

                {/* ===================================
                    STUDENT HOME COMPONENT
                   =================================== */}
                {userType === 'student' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 column bento metric block */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Metric cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Overall Rank Widget */}
                        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800 font-sans">
                          <div className="absolute top-3 right-3 p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <Award className="h-4 w-4 text-indigo-600" />
                          </div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-450 font-mono font-bold">Best Rank</p>
                          <h3 className="text-2xl font-black text-indigo-600 mt-1">
                            {db.attempts.filter(a => a.studentId === currUser.studentId && a.rank).length > 0
                              ? `#${Math.min(...db.attempts.filter(a => a.studentId === currUser.studentId && a.rank).map(a => a.rank || 99))}`
                              : 'NA'}
                          </h3>
                        </div>

                        {/* Accuracy metric */}
                        <div className="bg-white border border-slate-200/85 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800 font-sans">
                          <div className="absolute top-3 right-3 p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-455 font-mono font-bold">Accuracy</p>
                          <h3 className="text-2xl font-black text-emerald-600 mt-1">
                            {(() => {
                              const studentAttempts = db.attempts.filter(a => a.studentId === currUser.studentId && a.status === 'submitted');
                              if (studentAttempts.length === 0) return '0%';
                              const sum = studentAttempts.reduce((acc, curr) => acc + curr.accuracy, 0);
                              return `${Math.round(sum / studentAttempts.length)}%`;
                            })()}
                          </h3>
                        </div>

                        {/* Tests completed */}
                        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800 font-sans">
                          <div className="absolute top-3 right-3 p-1.5 bg-pink-50 border border-pink-100 rounded-lg">
                            <BookOpenCheck className="h-4 w-4 text-pink-600" />
                          </div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-450 font-mono font-bold">Completed</p>
                          <h3 className="text-2xl font-black text-pink-600 mt-1">
                            {db.attempts.filter(a => a.studentId === currUser.studentId && a.status === 'submitted').length}
                          </h3>
                        </div>
                      </div>

                      {/* Performance Trend chart */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm text-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-indigo-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Progress Curve (Scores out of 10)</h4>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">Real-time stats sync</span>
                        </div>
                        {renderMiniChart(db.attempts.filter(a => a.studentId === currUser.studentId && a.status === 'submitted'))}
                      </div>



                    </div>

                    {/* Right column: doubt solver Launcher & side guide */}
                    <div className="space-y-6">

                      {/* Side quick guide banner */}
                      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800">
                        <div className="absolute -right-3 -bottom-3 opacity-[0.03]">
                          <Award className="w-24 h-24 text-indigo-500" />
                        </div>
                        <h4 className="text-sm font-bold tracking-tight text-slate-700">Admissions Ledger Card</h4>
                        <div className="space-y-2.5 mt-3 text-xs text-slate-600 leading-relaxed font-sans">
                          <div className="flex justify-between">
                            <span>Register Class:</span>
                            <span className="font-mono text-slate-800 font-bold">{currUser.classVal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Institute Roll:</span>
                            <span className="font-mono text-slate-800 font-bold">#{currUser.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Student Mobile link:</span>
                            <span className="font-mono text-slate-800 font-bold">{currUser.mobile}</span>
                          </div>
                        </div>
                      </div>

                      {/* Leaderboard Widget */}
                      {(() => {
                        const submittedAttempts = db.attempts.filter(a => a.status === 'submitted' && a.submitTime);
                        if (submittedAttempts.length === 0) return null;
                        
                        // Find the latest test taken
                        const sortedAttemptsByTime = [...submittedAttempts].sort((a, b) => new Date(b.submitTime || 0).getTime() - new Date(a.submitTime || 0).getTime());
                        const latestTestId = sortedAttemptsByTime[0].testId;
                        
                        const latestTestAttempts = submittedAttempts.filter(a => a.testId === latestTestId);
                        const sortedByScore = [...latestTestAttempts].sort((a, b) => b.score - a.score);
                        
                        const topPerformers = [];
                        const seenIds = new Set();
                        for (const attempt of sortedByScore) {
                          if (!seenIds.has(attempt.studentId)) {
                            // Filter by class
                            const studObj = db.students.find(s => s.studentId === attempt.studentId);
                            if (studObj) {
                              if (topPerformersClassFilter !== 'All') {
                                if (topPerformersClassFilter === 'Unassigned' && ['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(studObj.classVal)) continue;
                                if (topPerformersClassFilter !== 'Unassigned' && studObj.classVal !== topPerformersClassFilter) continue;
                              }
                            }
                            seenIds.add(attempt.studentId);
                            topPerformers.push(attempt);
                            if (topPerformers.length === 5) break;
                          }
                        }
                        
                        const latestTest = db.tests.find(t => t.id === latestTestId);
                        
                        return (
                          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800 flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                                  <Award className="h-4 w-4 text-amber-500" />
                                </div>
                                <h4 className="text-sm font-bold tracking-tight text-slate-700">Leaderboard</h4>
                              </div>
                              <select
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={topPerformersClassFilter}
                                onChange={(e) => setTopPerformersClassFilter(e.target.value)}
                              >
                                <option value="All">All Classes</option>
                                <option value="Class 9">Class 9</option>
                                <option value="Class 10">Class 10</option>
                                <option value="Class 11">Class 11</option>
                                <option value="Class 12">Class 12</option>
                                <option value="Unassigned">Unassigned</option>
                              </select>
                            </div>
                            <p className="text-[10px] text-slate-500 mb-3 truncate">Based on: <span className="font-semibold text-slate-600 truncate">{latestTest?.title || 'Recent Test'}</span></p>
                            <div className="space-y-3 flex-1 flex flex-col justify-start">
                              {topPerformers.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-400 font-medium italic">No performers found.</div>
                              ) : topPerformers.map((performer, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${performer.studentId}`} 
                                        alt={performer.studentName} 
                                        className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 relative z-10" 
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                                        }}
                                      />
                                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-white ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {idx + 1}
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{performer.studentName}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {performer.score} pts
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Upcoming Exam Notifications Widget */}
                      {(() => {
                        const now = new Date();
                        const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                        const upcomingTests = db.tests.filter(t => {
                          if (!t.date || !t.startTime) return false;
                          const scheduledTime = new Date(`${t.date}T${t.startTime}:00`);
                          if (isNaN(scheduledTime.getTime())) return false;
                          return scheduledTime > now && scheduledTime <= next24h && t.classVal === currUser.classVal;
                        }).sort((a, b) => {
                          const timeA = new Date(`${a.date}T${a.startTime}:00`).getTime();
                          const timeB = new Date(`${b.date}T${b.startTime}:00`).getTime();
                          return timeA - timeB;
                        });

                        if (upcomingTests.length === 0) return null;

                        const notifyTest = (testTitle: string) => {
                          if (!('Notification' in window)) {
                            alert("This browser does not support desktop notification");
                            return;
                          }
                          if (Notification.permission === 'granted') {
                            new Notification('Upcoming Test Reminder Enabled', {
                              body: `You will be notified before ${testTitle} starts.`,
                            });
                          } else if (Notification.permission !== 'denied') {
                            Notification.requestPermission().then(permission => {
                              if (permission === 'granted') {
                                new Notification('Upcoming Test Reminder Enabled', {
                                  body: `You will be notified before ${testTitle} starts.`,
                                });
                              }
                            });
                          } else {
                            alert("Please enable notifications in your browser settings.");
                          }
                        };

                        return (
                          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl relative overflow-hidden shadow-sm text-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                                <Bell className="h-4 w-4 text-blue-500" />
                              </div>
                              <h4 className="text-sm font-bold tracking-tight text-slate-700">Upcoming Exams (24h)</h4>
                            </div>
                            <div className="space-y-3">
                              {upcomingTests.map(test => (
                                <div key={test.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-800">{test.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                      {new Date(`${test.date}T${test.startTime}:00`).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => notifyTest(test.title)}
                                    className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition self-start"
                                  >
                                    Notify Me
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ===================================
                    ADMIN HOME COMPONENT (staff metrics monitor)
                   =================================== */}
                {userType === 'admin' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 border-b border-slate-200 pb-2 mb-2 inline-block">Admin Dashboard</h2>
                        <p className="text-xs text-slate-500 font-mono">Overview of platform metrics and rankings.</p>
                      </div>
                      <button
                        onClick={handleRecalculateRanks}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all focus:outline-none bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-700 border-none"
                      >
                        <History className="h-4 w-4" />
                        Recalculate All Ranks
                      </button>
                    </div>

                    {/* Admin summary metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      
                      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm text-slate-800 font-sans">
                        <p className="text-[9px] uppercase tracking-wider text-slate-450 font-mono font-bold">Total Approved Students</p>
                        <h3 className="text-2xl font-black text-indigo-600 mt-1">
                          {db.students.filter(s => s.status === 'Approved').length}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Permanently assigned ID</p>
                      </div>

                      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm text-slate-800 font-sans">
                        <p className="text-[9px] uppercase tracking-wider text-slate-450 font-mono font-bold">Admissions Pending Approval</p>
                        <h3 className="text-2xl font-black text-amber-600 mt-1">
                          {db.students.filter(s => s.status === 'Pending').length}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Needs permanent ID generation</p>
                      </div>

                      <div className="bg-white border border-slate-200/82 p-5 rounded-3xl shadow-sm text-slate-800 font-sans">
                        <p className="text-[9px] uppercase tracking-wider text-slate-455 font-mono font-bold">Scheduled Exams</p>
                        <h3 className="text-2xl font-black text-rose-600 mt-1">
                          {db.tests.length}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Live and practice assessments</p>
                      </div>

                      <div className="bg-white border border-slate-200/85 p-5 rounded-3xl shadow-sm text-slate-800 font-sans">
                        <p className="text-[9px] uppercase tracking-wider text-slate-450 font-mono font-bold">Evaluated OMRs</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">
                          {db.attempts.filter(a => a.status === 'submitted').length}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Automatic score evaluation</p>
                      </div>
                    </div>

                    <div className="w-full">
                      
                      {/* LIVE TEST real-time monitoring grid! */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm text-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">Live test supervision monitoring grid</h4>
                            <p className="text-[10px] text-slate-505 mt-0.5 font-sans">Displays real-time answers and percentiles</p>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 sm:flex-none"
                              value={selectedClassFilter}
                              onChange={(e) => setSelectedClassFilter(e.target.value)}
                            >
                              <option value="All">All Classes</option>
                              <option value="Class 9">Class 9</option>
                              <option value="Class 10">Class 10</option>
                              <option value="Class 11">Class 11</option>
                              <option value="Class 12">Class 12</option>
                              <option value="Unassigned">Unassigned</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const msg = prompt("Draft global update/announcement notification for all students:");
                                if (msg) {
                                  fetch('/api/notifications', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      title: "Urgent Announcement",
                                      message: msg,
                                      type: "announcement"
                                    })
                                  }).then(() => syncDB());
                                }
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-650 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition border border-indigo-100/80 shrink-0"
                            >
                              Broadcast
                            </button>
                            <span className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded font-mono uppercase font-bold tracking-wider animate-pulse shrink-0 hidden sm:inline-block">Staff Active</span>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs min-w-full sm:min-w-[500px]">
                            <thead className="hidden sm:table-header-group">
                              <tr className="text-slate-400 uppercase tracking-wider text-[9px] font-mono border-b border-slate-100 mb-2">
                                <th className="pb-2">Student Name</th>
                                <th className="pb-2">Scheduled Paper</th>
                                <th className="pb-2">Attempt Status</th>
                                <th className="pb-2">Auto Score</th>
                                <th className="pb-2 text-right">Ranks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans block sm:table-row-group">
                              {db.attempts.filter(att => {
                                if (selectedClassFilter === 'All') return true;
                                const studObj = db.students.find(s => s.studentId === att.studentId);
                                if (!studObj) return false;
                                if (selectedClassFilter === 'Unassigned') return !['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(studObj.classVal);
                                return studObj.classVal === selectedClassFilter;
                              }).length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-8 text-slate-400 italic block sm:table-cell">
                                    No live test attempts currently logged. Enable a test from schedule.
                                  </td>
                                </tr>
                              ) : (
                                db.attempts.filter(att => {
                                  if (selectedClassFilter === 'All') return true;
                                  const studObj = db.students.find(s => s.studentId === att.studentId);
                                  if (!studObj) return false;
                                  if (selectedClassFilter === 'Unassigned') return !['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(studObj.classVal);
                                  return studObj.classVal === selectedClassFilter;
                                }).map((att) => {
                                  const associatedTest = db.tests.find(t => t.id === att.testId);
                                  return (
                                    <tr key={att.id} className="hover:bg-slate-50 transition border-b border-slate-100 sm:border-none block sm:table-row py-2 sm:py-0">
                                      <td className="py-1 sm:py-3 font-semibold text-slate-700 block sm:table-cell">
                                        <span className="sm:hidden text-[10px] text-slate-400 font-normal mr-2">Name:</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const studObj = db.students.find(s => s.studentId === att.studentId);
                                            if (studObj) setSelectedStudent(studObj);
                                          }}
                                          className="hover:text-indigo-600 cursor-pointer text-left"
                                        >
                                          {att.studentName}
                                        </button>
                                      </td>
                                      <td className="py-1 sm:py-3 text-slate-500 font-mono text-[11px] truncate max-w-full sm:max-w-[140px] block sm:table-cell" title={associatedTest?.title}>
                                        <span className="sm:hidden text-[10px] text-slate-400 font-normal font-sans mr-2">Test:</span>
                                        {associatedTest?.title || "Class Test"}
                                      </td>
                                      <td className="py-1 sm:py-3 block sm:table-cell">
                                        <span className="sm:hidden text-[10px] text-slate-400 font-normal font-sans mr-2">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wide ${
                                          att.status === 'submitted' 
                                            ? 'bg-emerald-50 text-emerald-650 border border-emerald-100' 
                                            : 'bg-amber-50 text-amber-650 border border-amber-105 animate-pulse'
                                        }`}>
                                          {att.status}
                                        </span>
                                      </td>
                                      <td className="py-1 sm:py-3 font-mono font-semibold text-indigo-600 block sm:table-cell">
                                        <span className="sm:hidden text-[10px] text-slate-400 font-normal font-sans mr-2">Score:</span>
                                        {att.status === 'submitted' ? `${att.score} / ${associatedTest ? Object.keys(associatedTest.answerKey).length : 10} (${att.accuracy}%)` : 'In Session'}
                                      </td>
                                      <td className="py-1 sm:py-3 sm:text-right font-mono text-xs font-bold text-slate-500 block sm:table-cell">
                                        <span className="sm:hidden text-[10px] text-slate-400 font-normal font-sans mr-2">Rank:</span>
                                        {att.rank ? `#${att.rank}` : 'Calculating'}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Draggable Aacharya AI Floating Button */}
                <motion.div
                  drag
                  dragConstraints={{ left: -window.innerWidth + 80, right: 24, top: -window.innerHeight + 120, bottom: 24 }}
                  dragElastic={0.1}
                  dragMomentum={false}
                  whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsAiChatOpen(true)}
                  style={{ touchAction: 'none' }}
                  className="absolute bottom-24 right-6 z-[999] flex flex-col items-center justify-center cursor-grab group select-none"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
                    <div className="relative h-14 w-14 bg-white rounded-full flex items-center justify-center border-2 border-blue-500 shadow-xl overflow-hidden">
                      <Bot className="h-7 w-7 text-blue-600 drop-shadow-sm pointer-events-none" />
                      
                      {/* Inner glowing pulse */}
                      <div className="absolute inset-0 bg-blue-400 opacity-20 animate-pulse rounded-full pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Name tag */}
                  <div className="mt-2 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-slate-700 font-mono tracking-widest whitespace-nowrap pointer-events-none">
                    AACHARYA
                  </div>
                </motion.div>

              </div>
            )}
    </>
  );
}
