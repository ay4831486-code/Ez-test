import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import GeminiCompanion from '../features/GeminiCompanion';
import TestAnalysisModal from '../modals/TestAnalysisModal';

export default function Modals() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState } = useAppContext();

  const [editingStudent, setEditingStudent] = React.useState<any>(null);
  
  const handleEditStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    const fd = new FormData(e.currentTarget);
    const updatedData = {
      name: fd.get('name'),
      mobile: fd.get('mobile'),
      classVal: fd.get('classVal'),
      rollNumber: fd.get('rollNumber'),
      batchYear: fd.get('batchYear'),
    };
    
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        await syncDB();
        setEditingStudent(null);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error("Failed to edit student");
    }
  };

  return (
    <>
      {/* ===================================
          MODAL DRAWER: GEMINI DOUBLE DRAWER INTERACTIVE PANEL
         =================================== */}
      <AnimatePresence>
      {doubtOpen && userType === 'student' && (
        <motion.div 
          initial={{ x: '100%', opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: '100%', opacity: 0 }} 
          transition={{ type: "spring", duration: 0.5, bounce: 0 }}
          className="absolute inset-y-0 right-0 w-full bg-white z-50 shadow-2xl flex flex-col h-full overflow-hidden select-none"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
            <span className="text-[13px] uppercase font-black tracking-widest text-[#1a2b4c] flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" /> AI डाउट सॉल्वर (Doubt Solver)
            </span>
            <button 
              onClick={() => setDoubtOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <GeminiCompanion 
              studentClass={currUser.classVal} 
              studentName={currUser.name} 
            />
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ===================================
          MODAL: ADMIN STUDENT DETAILED PROFILE VIEW (DRILLDOWN ACADEMIC STATISTICS)
         =================================== */}
      <AnimatePresence>
      {selectedStudent && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-slate-100 font-sans"
          >
            
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl text-slate-450 hover:text-slate-200 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile info */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5 mb-5 select-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-lg">
                {selectedStudent.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-100">{selectedStudent.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${selectedStudent.isBlocked ? 'bg-rose-500/10 text-rose-450' : 'bg-emerald-500/10 text-emerald-440'}`}>
                    {selectedStudent.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-3.5 text-xs text-slate-400 mt-1 font-mono">
                  <span>Student ID: <code className="text-indigo-400 font-bold">{selectedStudent.studentId || "Admitted pending ID"}</code></span>
                  <span>Class: {selectedStudent.classVal} (Roll #{selectedStudent.rollNumber} • Batch {selectedStudent.batchYear || "2025-2026"})</span>
                  <span>Mobile: {selectedStudent.mobile}</span>
                </div>
              </div>
            </div>

            {/* Sub performance chart view */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 select-none">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 text-center flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider leading-tight">Attempts</span>
                <p className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                  {db.attempts.filter(a => a.studentId === selectedStudent.studentId && a.status === 'submitted').length}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 text-center flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider leading-tight">Accuracy</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {(() => {
                    const attempts = db.attempts.filter(a => a.studentId === selectedStudent.studentId && a.status === 'submitted');
                    if (attempts.length === 0) return '0%';
                    const sum = attempts.reduce((acc, curr) => acc + curr.accuracy, 0);
                    return `${Math.round(sum / attempts.length)}%`;
                  })()}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 text-center flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider leading-tight">Avg Score</span>
                <p className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
                  {(() => {
                    const attempts = db.attempts.filter(a => a.studentId === selectedStudent.studentId && a.status === 'submitted');
                    if (attempts.length === 0) return '0.0';
                    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
                    return (sum / attempts.length).toFixed(1);
                  })()}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 text-center flex flex-col justify-center border-l border-l-amber-500/20">
                <span className="text-[9px] text-amber-500/70 font-mono uppercase tracking-wider leading-tight">Institute Rank</span>
                <p className="text-lg font-bold font-mono text-amber-500 mt-0.5">
                  {(() => {
                      const studentScores = new Map();
                      db.attempts.filter(a => a.status === 'submitted').forEach(a => {
                          studentScores.set(a.studentId, (studentScores.get(a.studentId)||0) + a.score);
                      });
                      const sortedIds = Array.from(studentScores.entries()).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
                      const idx = sortedIds.indexOf(selectedStudent.studentId);
                      return idx === -1 ? 'N/A' : `#${idx+1}`;
                  })()}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/80 text-center flex flex-col justify-center border-l border-l-cyan-500/20">
                <span className="text-[9px] text-cyan-500/70 font-mono uppercase tracking-wider leading-tight">Class Rank</span>
                <p className="text-lg font-bold font-mono text-cyan-500 mt-0.5">
                  {(() => {
                      const studentScores = new Map();
                      db.attempts.filter(a => a.status === 'submitted').forEach(a => {
                          const s = db.students.find(st=>st.studentId === a.studentId);
                          if(s && s.classVal === selectedStudent.classVal) {
                             studentScores.set(a.studentId, (studentScores.get(a.studentId)||0) + a.score);
                          }
                      });
                      const sortedIds = Array.from(studentScores.entries()).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
                      const idx = sortedIds.indexOf(selectedStudent.studentId);
                      return idx === -1 ? 'N/A' : `#${idx+1}`;
                  })()}
                </p>
              </div>
            </div>

            {/* Full attempt records table */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400">Student Historical Exams Performance History</h4>
              
              <div className="overflow-x-auto bg-slate-950 rounded-2xl border border-slate-850 p-3 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-wider text-[9px] font-mono border-b border-slate-900 pb-2">
                      <th className="pb-2">Test Scheduled Title</th>
                      <th className="pb-2">Scoring</th>
                      <th className="pb-2">Rank</th>
                      <th className="pb-2 text-right">OMR Answers Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 leading-relaxed">
                    {db.attempts.filter(a => a.studentId === selectedStudent.studentId && a.status === 'submitted').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-550 italic">
                          No completed exam submissions found.
                        </td>
                      </tr>
                    ) : (
                      db.attempts.filter(a => a.studentId === selectedStudent.studentId && a.status === 'submitted').map(att => {
                        const testObj = db.tests.find(t => t.id === att.testId);
                        return (
                          <tr 
                            key={att.id} 
                            className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                            onClick={() => {
                              if (testObj) {
                                setSelectedAnalysis({ test: testObj, attempt: att });
                                setSelectedStudent(null);
                              }
                            }}
                          >
                            <td className="py-2.5 font-bold text-slate-300">{testObj?.title || 'Mock Practice paper'}</td>
                            <td className="py-2.5 font-mono text-indigo-400 font-bold">{att.score} / {testObj ? Object.keys(testObj.answerKey).length : 10}</td>
                            <td className="py-2.5 font-mono text-orange-400 font-bold">{att.rank ? `#${att.rank}` : "Evaluating..."}</td>
                            <td className="py-2.5 text-right text-slate-400 font-mono">
                              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">{att.correctAnswers} Correct</span>
                              <span className="text-rose-450 text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded">{att.wrongAnswers} Wrong</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Direct profile configuration adjustments */}
              <div className="flex gap-3 justify-end pt-5 border-t border-slate-800 flex-wrap">
                <button
                  onClick={() => setEditingStudent(selectedStudent)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-4.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleToggleBlock(selectedStudent.id)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                    selectedStudent.isBlocked ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-100' : 'bg-amber-600 hover:bg-amber-500 text-slate-100'
                  }`}
                >
                  {selectedStudent.isBlocked ? 'Restore Student Account Access' : 'Suspensively Block Access'}
                </button>
                <button
                  onClick={() => handleDeleteStudent(selectedStudent.id)}
                  className="bg-rose-650 hover:bg-rose-500 text-slate-100 px-4.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Erase account
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {editingStudent && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none"
        >
          <motion.form 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onSubmit={handleEditStudentSubmit} 
            className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative text-slate-100 font-sans"
          >
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-extrabold tracking-tight text-slate-100 mb-5 pb-3 border-b border-slate-800">
              Edit Student Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Full Name</label>
                <input required name="name" defaultValue={editingStudent.name} className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs focus:ring-1 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Mobile</label>
                <input required name="mobile" defaultValue={editingStudent.mobile} className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs focus:ring-1 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Class</label>
                <select name="classVal" defaultValue={editingStudent.classVal} className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs focus:ring-1 outline-none">
                  {['Class 12', 'Class 11', 'Class 10', 'Class 9', 'Foundation'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Roll No</label>
                  <input required name="rollNumber" defaultValue={editingStudent.rollNumber} className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs focus:ring-1 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Batch Year</label>
                  <input required name="batchYear" defaultValue={editingStudent.batchYear} className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 px-3.5 py-2.5 text-xs focus:ring-1 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold mt-4 transition cursor-pointer">
                Save Details
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ===================================
          MODAL: ADMIN CREATE LIVE TEST
         =================================== */}
      <AnimatePresence>
      {showCreateTest && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none"
        >
          <motion.form 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onSubmit={handleCreateTestSubmit} 
            className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative text-slate-100 font-sans"
          >
            
            <button
              type="button"
              onClick={() => setShowCreateTest(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-extrabold tracking-tight text-slate-100 mb-5 pb-3 border-b border-slate-800">
              Publish New Institure Exam Form
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Exam Title / Chapter description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capacitors JEE Advanced revision"
                  className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-805 px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-650"
                  value={testFormTitle}
                  onChange={(e) => setTestFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Target Grade Class</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={testFormClass}
                    onChange={(e) => setTestFormClass(e.target.value)}
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Subject Chapter</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={testFormSubject}
                    onChange={(e) => setTestFormSubject(e.target.value)}
                  >
                    {getSubjectsForClass(testFormClass).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HIGH-QUALITY QUESTIONS IMAGES UPLOAD */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-400">Question Sheets Images</span>
                  {testFormImages.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => { setTestFormImages([]); }}
                      className="text-[9px] text-rose-400 hover:underline font-mono cursor-pointer"
                    >
                      Clear All ({testFormImages.length})
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-xl p-4 transition-all duration-200 cursor-pointer relative bg-slate-900/30">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      
                      const readers = files.map((file: File) => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              resolve(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      });

                      Promise.all(readers).then(results => {
                        setTestFormImages(prev => [...prev, ...results]);
                      });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <ImageIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <div className="text-center">
                    <p className="text-[11px] text-slate-300 font-medium">Click or drag question paper page images</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Select multiple images (PNG/JPG)</p>
                  </div>
                </div>

                {/* Thumbnails list */}
                {testFormImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800 max-h-36 overflow-y-auto">
                    {testFormImages.map((img, index) => (
                      <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 group">
                        <img 
                          src={img} 
                          className="w-full h-full object-cover" 
                          alt={`Page ${index + 1}`} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/icon-512.png';
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[8px] px-1 py-0.2 rounded font-mono text-white">Pg {index+1}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTestFormImages(prev => prev.filter((_, idx) => idx !== index));
                          }}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white p-0.5 rounded-full transition cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TIMINGS SETTINGS IF LIVE TYPE */}
              {testFormType === 'live' && (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 font-sans">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-400">Schedules Timelines coordinates</span>
                  
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-mono">Evaluation Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs"
                      value={testFormDate}
                      onChange={(e) => setTestFormDate(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 font-mono">Starts Scheduled Time</label>
                      <input
                        type="time"
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs"
                        value={testFormStart}
                        onChange={(e) => setTestFormStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 font-mono">Ends Scheduled Time</label>
                      <input
                        type="time"
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs"
                        value={testFormEnd}
                        onChange={(e) => setTestFormEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PRACTICE SETTINGS */}
              {testFormType === 'practice' && (
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Duration limit (Minutes)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-805 px-3.5 py-2.5 text-xs focus:ring-1"
                    value={testFormDuration}
                    onChange={(e) => setTestFormDuration(e.target.value)}
                  />
                </div>
              )}

              {/* QUESTION COUNT SELECTOR AND OVERRIDE */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 font-sans">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-400">Question Layout Settings</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-mono">Standard Count</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      value={testFormNumQuestions}
                      onChange={(e) => setTestFormNumQuestions(parseInt(e.target.value, 10))}
                    >
                      <option value={10}>10 Questions (Default)</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={30}>30 Questions</option>
                      <option value={45}>45 Questions (NEET style)</option>
                      <option value={50}>50 Questions</option>
                      <option value={90}>90 Questions (JEE style)</option>
                      <option value={100}>100 Questions</option>
                      <option value={180}>180 Questions (Full Mock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-mono">Precision Override</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      value={testFormNumQuestions}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= 200) {
                          setTestFormNumQuestions(val);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Answer Key custom bubble programmer */}
              <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-400 mb-2 block">OMR Correct Reference Key (Q1 - Q{testFormNumQuestions})</span>
                <div className="grid grid-cols-5 gap-3 mt-2 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: testFormNumQuestions }).map((_, i) => {
                    const qNum = i + 1;
                    return (
                      <div key={qNum} className="flex flex-col items-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500">Q.{qNum}</span>
                        <select
                          className="w-11 bg-slate-900 border border-slate-805 text-slate-200 rounded-lg text-xs py-0.5 px-1 mt-1 text-center font-bold"
                          value={testFormKeys[qNum] || 'A'}
                          onChange={(e) => setTestFormKeys(prev => ({ ...prev, [qNum]: e.target.value }))}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 py-3 rounded-xl text-xs font-bold tracking-wide transition mt-4 cursor-pointer"
              >
                Schedule & Publish Paper
              </button>

            </div>

          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ===================================
          MODAL: DIRECT ENROLL STUDENT (ADMIN SECTOR)
         =================================== */}
      <AnimatePresence>
      {showDirectAddStudent && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none"
        >
          <motion.form 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onSubmit={handleDirectAddStudent} 
            className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl max-w-sm w-full relative text-slate-100 font-sans"
          >
            
            <button
              type="button"
              onClick={() => setShowDirectAddStudent(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-850 rounded-xl text-slate-450 hover:text-slate-205 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-5 pb-2 border-b border-slate-805/85">
              Direct Student Admission Form
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Full Legal Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 text-slate-105 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 placeholder-slate-650"
                  placeholder="e.g.Sneha Patel"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Mobile Link</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-950 text-slate-105 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 placeholder-slate-650"
                    placeholder="9988776655"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Roll Number</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 text-slate-105 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 placeholder-slate-650"
                    placeholder="12"
                    value={regRoll}
                    onChange={(e) => setRegRoll(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Academic Class</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-702 px-3 py-1.5 text-xs focus:ring-1"
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Batch Year</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-702 px-3 py-1.5 text-xs focus:ring-1"
                    value={regBatch}
                    onChange={(e) => setRegBatch(e.target.value)}
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">Password</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 text-slate-105 rounded-xl border border-slate-805 px-3 py-2 text-xs focus:ring-1 placeholder-slate-650"
                  placeholder="studentpassword"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 py-3 rounded-xl text-xs font-bold transition mt-4 cursor-pointer"
              >
                Enroll Student (Issue permanent ID)
              </button>
            </div>

          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {selectedAnalysis && (
        <TestAnalysisModal
          test={selectedAnalysis.test}
          attempt={selectedAnalysis.attempt}
          onClose={() => setSelectedAnalysis(null)}
          db={db}
        />
      )}
      </AnimatePresence>
    </>
  );
}