import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  ChevronRight, 
  Layers, 
  Search, 
  Plus, 
  Sparkles, 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  LogOut, 
  ArrowRight, 
  Lock, 
  User, 
  BookOpenCheck,
  ClipboardList,
  Flame,
  LineChart,
  Brain,
  History,
  X,
  Menu,
  FileCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Upload,
  Trophy
} from 'lucide-react';
import PDFViewer from './components/features/PDFViewer';
import QuestionImagesViewer from './components/features/QuestionImagesViewer';
import NotificationDock from './components/layout/NotificationDock';
import OMRSheet from './components/features/OMRSheet';
import ProfileView from './components/user/ProfileView';
import EzTestIcon from './components/common/EzTestIcon';
import { AppContext } from './AppContext';
import { useAppLogic } from './hooks/useAppLogic';
import CelebrationModal from './components/features/CelebrationModal';
import Leaderboard from './components/features/Leaderboard';
import Modals from './components/tabs/Modals';
import AuthPortal from './components/tabs/AuthPortal';
import HomeTab from './components/tabs/HomeTab';
import LiveTab from './components/tabs/LiveTab';
import PracticeTab from './components/tabs/PracticeTab';
import StudentsTab from './components/tabs/StudentsTab';
import AacharyaChat from './components/ai/AacharyaChat';

interface DeviceFrameProps {
  children: React.ReactNode;
  bgClass?: string;
  theme?: 'dark' | 'light';
}

function DeviceFrameWrapper({ children, bgClass = 'bg-slate-50', theme = 'light' }: DeviceFrameProps) {
  return (
    <div className={`w-full h-full min-h-screen flex flex-col overflow-hidden relative ${bgClass}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auth state
  const appState = useAppLogic();
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState, showCelebration, setShowCelebration, celebrationData, setCelebrationData, isAiChatOpen, setIsAiChatOpen } = appState;

  const [examViewMode, setExamViewMode] = useState<'questions' | 'omr'>('questions');

  // native Android hardware back button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let activeListenerPromise = (async () => {
      const listener = await CapApp.addListener('backButton', () => {
        if (activeExam) {
          if (window.confirm("Do you really want to close the current exam? Any offline progress will remain backed up locally.")) {
            handleManualSubmit();
          }
          return;
        }

        if (doubtOpen) {
          setDoubtOpen(false);
          return;
        }

        if (isAiChatOpen) {
          setIsAiChatOpen(false);
          return;
        }

        if (selectedStudent) {
          setSelectedStudent(null);
          return;
        }

        if (selectedAnalysis) {
          setSelectedAnalysis(null);
          return;
        }

        if (showCreateTest) {
          setShowCreateTest(false);
          return;
        }

        if (showDirectAddStudent) {
          setShowDirectAddStudent(false);
          return;
        }

        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          return;
        }

        if (activeTab !== 'home') {
          setActiveTab('home');
          return;
        }

        // Minimize app if we are already on home and clean
        CapApp.minimizeApp();
      });
      return listener;
    })();

    return () => {
      activeListenerPromise.then(l => l.remove());
    };
  }, [
    activeExam,
    doubtOpen,
    isAiChatOpen,
    selectedStudent,
    selectedAnalysis,
    showCreateTest,
    showDirectAddStudent,
    mobileMenuOpen,
    activeTab,
    setActiveTab,
    setDoubtOpen,
    setIsAiChatOpen,
    setSelectedStudent,
    setSelectedAnalysis,
    setShowCreateTest,
    setShowDirectAddStudent,
    setMobileMenuOpen,
    handleManualSubmit
  ]);

  // ===================================
  // RENDER SPLIT EXAM SCREEN (IF ACTIVE)
  // ===================================
  if (activeExam) {
    const totalExamSeconds = activeExam.duration * 60;
    const percentRemaining = Math.max(0, Math.min(100, (examTimer / (totalExamSeconds || 1)) * 100));
    
    let progressColor = 'bg-emerald-500';
    if (percentRemaining < 15) {
      progressColor = 'bg-red-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]';
    } else if (percentRemaining < 35) {
      progressColor = 'bg-amber-500';
    }

    return (
      <AppContext.Provider value={appState}>
      <DeviceFrameWrapper bgClass="bg-slate-950" theme="dark">
        {/* Split Screen Header */}
        <header className="bg-slate-900 border-b border-slate-800 relative shadow-2xl shrink-0 flex flex-col">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800/30">
            <div 
              className={`h-full ${progressColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
          
          <div className="px-3 py-2.5 sm:px-6 sm:py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 relative z-10 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg shrink-0">
                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-1.5 leading-none">
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                    {activeExam.type.toUpperCase()} TEST
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">ID: {activeExam.id}</span>
                </div>
                <h2 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-250 mt-1 truncate">{activeExam.title}</h2>
              </div>
            </div>

            {/* Core Ticking clock & Submit OMR */}
            <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 font-semibold w-full md:w-auto mt-0.5 md:mt-0">
              <div className={`flex items-center gap-1.5 border px-2.5 py-1 sm:px-4 sm:py-2 rounded-xl font-mono text-xs sm:text-sm font-bold ${
                examTimer < 300 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
                  : 'bg-slate-950 border-slate-800 text-amber-500'
              }`}>
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{secondsToHms(examTimer)}</span>
              </div>

              <button
                onClick={handleManualSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <FileCheck className="h-4 w-4" />
                <span>Submit OMR</span>
              </button>
            </div>
          </div>

          {/* Premium Mobile Switcher Tabs for viewport Optimization */}
          <div className="px-3 pb-2.5 flex bg-slate-900 border-t border-slate-800/40 w-full justify-center">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full max-w-sm shrink-0 select-none">
              <button 
                type="button"
                onClick={() => setExamViewMode('questions')}
                className={`flex-1 text-center py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  examViewMode === 'questions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Questions
              </button>
              <button 
                type="button"
                onClick={() => setExamViewMode('omr')}
                className={`flex-1 text-center py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  examViewMode === 'omr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Bubble OMR
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Responsive Split/Tab Layout */}
        <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-130px)]">
          {/* Section A: Visualizer (High-quality Question images or PDF fallback) */}
          <div className={`
            border-b border-slate-900 overflow-hidden flex flex-col
            ${examViewMode === 'questions' ? 'flex-1 h-full' : 'hidden'}
          `}>
            {activeExam.questionImages && activeExam.questionImages.length > 0 ? (
              <QuestionImagesViewer 
                images={activeExam.questionImages} 
                testTitle={activeExam.title}
              />
            ) : (
              <PDFViewer 
                pdfName={activeExam.pdfName} 
                pdfData={activeExam.pdfData} 
                testTitle={activeExam.title}
              />
            )}
          </div>

          {/* Section B: Interactive OMR Sheet */}
          <div className={`
            p-3 sm:p-5 bg-slate-900/15 overflow-y-auto flex flex-col justify-between
            ${examViewMode === 'omr' ? 'flex-1 h-full' : 'hidden'}
          `}>
            <OMRSheet 
              answers={examAnswers}
              onSelectAnswer={(qNum, val) => handleSelectOption(qNum, val)}
              onClearAnswer={(qNum) => handleClearOption(qNum)}
              answerKeySize={Object.keys(activeExam.answerKey).length}
            />
          </div>
        </main>
      </DeviceFrameWrapper>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={appState}>
    <DeviceFrameWrapper bgClass="bg-slate-50" theme="light">
      <AnimatePresence>
      {showSplash && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
            className="flex flex-col items-center gap-6 relative z-10"
          >
            <div className="p-4 rounded-3xl bg-slate-800 shadow-xl border border-slate-700">
              <img 
                src="/icon.svg" 
                alt="EZ Logo" 
                className="w-24 h-24 drop-shadow-md" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/icon-192.png';
                }}
              />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-widest font-sans mt-2">
              EZ <span className="text-blue-500 font-black">TEST</span>
            </h1>
            <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      {!userType ? (
        <AuthPortal />
      ) : (
        /* ===================================
            UNIFIED CONNECTED DASHBOARDS
           =================================== */
        <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-50 relative overflow-hidden">
          
          {/* Mobile Top Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 select-none shadow-xs shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-1 text-slate-600 hover:text-slate-900 focus:outline-none transition-transform cursor-pointer rounded-xl bg-slate-50 border border-slate-200"
                title="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-2">
                <EzTestIcon size="sm" />
                <span className="text-sm font-black uppercase tracking-widest text-[#1a2b4c]">EZ TEST</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currUser?.streakCount && userType === 'student' && (
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-2 py-1.5 rounded-full font-bold">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-[11px]">{currUser.streakCount}</span>
                </div>
              )}
              <div className="text-[11px] bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-bold max-w-[100px] truncate">
                {currUser?.name || 'User'}
              </div>
              <NotificationDock 
                db={db}
                currUser={currUser}
                userType={userType}
                onMarkAllRead={async () => {
                  try {
                    await fetch('/api/notifications/mark-read', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ studentId: currUser?.studentId || 'admin' })
                    });
                    syncDB();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onSendNotification={async (title, msg, type, recipient) => {
                  try {
                    await fetch('/api/notifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title, message: msg, type, recipientId: recipient })
                    });
                    syncDB();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              />
            </div>
          </header>

          {/* Backdrop for mobile drawer */}
          {mobileMenuOpen && (
            <div 
              className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* ===================================
              SIDEBAR PANEL (RESPONSIVE)
             =================================== */}
          <aside className={`
            absolute top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 font-sans select-none shadow-2xl transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            
            {/* Top header */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <EzTestIcon size="md" />
                  <div>
                    <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800">EZ TEST PLATFORM</h1>
                    <p className="text-[9px] text-slate-500 font-mono">
                      {userType === 'admin' ? 'Principal Admin Portal' : 'Student Evaluation Portal'}
                    </p>
                  </div>
                </div>
                {/* Close drawer on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="md:hidden p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* User summary pill */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/85 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-700 truncate">{currUser.name}</p>
                    <p className="text-[9px] font-mono text-blue-600 font-bold tracking-wider">
                      {userType === 'admin' ? 'Principal Manager' : currUser.studentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navlinks */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'home' 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers className="h-4 w-4 text-blue-500" /> Home Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab('live'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'live' 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse" /> Scheduled Live Exams
                </button>

                <button
                  onClick={() => { setActiveTab('practice'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'practice' 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpenCheck className="h-4 w-4 text-emerald-500" /> Mock Practice papers
                </button>

                <button
                  onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'leaderboard' 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="h-4 w-4 text-amber-500" /> Score Leaderboards
                </button>

                {userType === 'admin' && (
                  <button
                    onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                      activeTab === 'students' 
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                        : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Users className="h-4 w-4 text-blue-400" /> Students Database
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'profile' 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <User className="h-4 w-4 text-purple-500" /> My Profile &amp; Stats
                </button>
              </nav>
            </div>

            {/* Bottom logout */}
            <div className="p-5 border-t border-slate-100">
              {/* Optional Gemini Assistant launcher badge */}
              {userType === 'student' && (
                <button
                  type="button"
                  onClick={() => { setDoubtOpen(!doubtOpen); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 py-2.5 px-3 rounded-xl text-[10px] font-bold tracking-tight mb-4 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  Ask Feynman Doubt Solver
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" /> Sign Out Platform
              </button>
            </div>
          </aside>

          {/* ===================================
              MAIN VIEW AREA CONTAINER
             =================================== */}
          <main 
            className="flex-1 bg-slate-50 p-4 sm:p-6 md:p-8 pb-12 overflow-y-auto font-sans relative text-slate-800 scrollbar-hide"
          >
            
            {/* STICKY/PREMIUM TOP BAR DOCK */}
            <div className="hidden md:flex justify-between items-center pb-5 mb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                    {userType === 'admin' ? 'Administrative Suite' : 'Student Coaching Hub'}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 mt-0.5 flex items-center gap-2">
                  EZ PREMIER PLATFORM <span className="text-[10px] text-blue-600 font-mono font-bold">Class 9th-12th Coaching</span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Live clock badge */}
                <div className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hidden sm:flex">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>

                {currUser?.streakCount && userType === 'student' && (
                  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-2.5 py-1.5 rounded-xl font-bold">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-xs">{currUser.streakCount} <span className="text-[10px] text-orange-400">Day{currUser.streakCount > 1 ? 's' : ''}</span></span>
                  </div>
                )}

                {/* Notifications Bell Tab */}
                <NotificationDock 
                  db={db}
                  currUser={currUser}
                  userType={userType}
                  onMarkAllRead={async () => {
                    try {
                      await fetch('/api/notifications/mark-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId: currUser?.studentId || 'admin' })
                      });
                      syncDB();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  onSendNotification={async (title, msg, type, recipient) => {
                    try {
                      await fetch('/api/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, message: msg, type, recipientId: recipient })
                      });
                      syncDB();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              </div>
            </div>
            
            {/* TAB CONTENT: HOME VIEW */}
            <HomeTab />
            {/* TAB CONTENT: LIVE EXAMS LIST */}
            <LiveTab />

            {/* TAB CONTENT: PRACTICE PAPERS LIST */}
            <PracticeTab />

            {/* TAB CONTENT: STUDENTS ADMISSIONS DATABASE (ADMIN SECTOR ONLY) */}
            <StudentsTab />

            {activeTab === 'leaderboard' && (
              <Leaderboard />
            )}

            {activeTab === 'profile' && (
              <ProfileView 
                db={db}
                currUser={currUser}
                userType={userType}
                syncDB={syncDB}
                onLogout={handleLogout}
                setSelectedAnalysis={setSelectedAnalysis}
              />
            )}

          </main>

          {/* PW / Allen premium mobile sticky bottom tab dock */}
          <nav 
            id="pw-bottom-tabs" 
            className="w-full shrink-0 z-45 bg-white/95 backdrop-blur-md border-t border-slate-200/85 px-2 pt-2 flex justify-around items-center shadow-[0_-8px_32px_rgba(0,0,0,0.05)] select-none pb-[calc(12px+env(safe-area-inset-bottom))]"
          >
            {['home', 'live', 'practice', 'leaderboard', 'students', 'profile'].map((tabId) => {
              if (tabId === 'students' && userType !== 'admin') return null;

              let label = '';
              let IconComp: React.ComponentType<any> = Layers;
              let isProfile = false;

              if (tabId === 'home') {
                label = 'Home';
                IconComp = Layers;
              } else if (tabId === 'live') {
                label = 'Live Tests';
                IconComp = Clock;
              } else if (tabId === 'practice') {
                label = 'Practice';
                IconComp = BookOpenCheck;
              } else if (tabId === 'leaderboard') {
                label = 'Rankings';
                IconComp = Trophy;
              } else if (tabId === 'students') {
                label = 'Students';
                IconComp = Users;
              } else if (tabId === 'profile') {
                label = 'Profile';
                IconComp = User;
                isProfile = true;
              }

              const isActive = activeTab === tabId;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={`relative flex-1 flex flex-col items-center justify-center py-1.5 transition-all duration-200 cursor-pointer after:absolute after:-inset-y-3 after:-inset-x-1 after:content-[''] touches-none ${
                    isActive ? 'text-blue-600 scale-105 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.22 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="relative shrink-0 flex items-center justify-center"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab-glow"
                        className="absolute inset-[-6px] bg-blue-500/20 rounded-full filter blur-sm -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <IconComp className={`h-4.5 w-4.5 shrink-0 z-10 ${isProfile ? 'text-purple-500' : ''}`} />
                    {isProfile && (() => {
                      const studentHasUnread = (db?.notifications || []).some(n => {
                        if (userType !== 'student') return false;
                        const studentId = currUser?.studentId;
                        const classVal = currUser?.classVal;
                        const matchesRecipient = n.recipientId === 'all' || n.recipientId === studentId || (classVal && n.recipientId === classVal);
                        return matchesRecipient && !n.read;
                      });
                      if (studentHasUnread) {
                        return (
                          <>
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
                          </>
                        );
                      }
                      return null;
                    })()}
                  </motion.div>
                  <motion.span
                    initial={false}
                    animate={{
                      height: isActive ? 'auto' : 0,
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.8,
                      marginTop: isActive ? '4px' : '0px'
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="text-[9px] font-bold tracking-tight font-sans uppercase overflow-hidden block whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="pw-bottom-tabs-underline"
                      className="absolute bottom-0 left-3 right-3 h-[3px] bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <Modals />
      <AacharyaChat />

      {showCelebration && celebrationData && (
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          attempt={celebrationData.attempt}
          test={celebrationData.test}
          onViewAnalysis={() => {
            setSelectedAnalysis({
              test: celebrationData.test,
              attempt: celebrationData.attempt
            });
          }}
        />
      )}

      </DeviceFrameWrapper>
    </AppContext.Provider>
  );
}
