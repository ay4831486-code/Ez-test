import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function PracticeTab() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState } = useAppContext();
  const studentAttempts = currUser ? db.attempts.filter((a: any) => a.studentId === currUser.studentId && a.status === 'submitted') : [];
  const maxScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map((a: any) => a.score)) : 1;
  const padding = 20; const height = 80; const width = 300;
  return (
    <>
            {activeTab === 'practice' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Practice Mock Exams Library</h2>
                    <p className="text-xs text-slate-500 mt-1">Unlimited mock assessments with answers scoring feedback.</p>
                  </div>

                  {userType === 'admin' && (
                    <button
                      onClick={() => {
                        setTestFormType('practice');
                        setShowCreateTest(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Publish Practice Paper
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 space-y-4">
                  {(() => {
                    const visiblePracticeTests = db.tests.filter(t => t.type === 'practice' && (userType === 'admin' || t.classVal === currUser?.classVal || t.classVal === 'All Classes' || t.classVal === 'All'));

                    return (
                      <>
                        {visiblePracticeTests.length === 0 ? (
                          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 shadow-sm">
                            No Practice papers published for your class.
                          </div>
                        ) : (
                          visiblePracticeTests.map((test) => {
                        const isStudent = userType === 'student';
                        const attList = isStudent 
                          ? db.attempts.filter(a => a.testId === test.id && a.studentId === currUser.studentId && a.status === 'submitted')
                          : [];

                        return (
                          <div key={test.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-300 shadow-sm transition">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-3.5 mb-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider border bg-indigo-50 border-indigo-100 text-indigo-750 font-bold">
                                    Mock Drill Case
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">{test.classVal} • {test.subject}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{test.title}</h3>
                                
                                <div className="flex items-center gap-4 text-[11px] text-slate-550 mt-3 font-mono">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{test.duration} mins maximum limit</span>
                                  </div>
                                  <div>
                                    <span>Answer key: {Object.keys(test.answerKey).length} standard OMR bubbles</span>
                                  </div>
                                </div>

                                {attList.length > 0 && (
                                  <div className="mt-3.5 space-y-2">
                                    <div className="flex items-center gap-2.5 text-[10px] font-mono text-slate-605 bg-slate-50 p-2 rounded-xl border border-slate-100/80 w-fit">
                                      <span>Attempts: {attList.length}</span>
                                      <span>•</span>
                                      <span className="text-emerald-600 font-bold font-semibold">Best Score: {Math.max(...attList.map(a => a.score))}/{Object.keys(test.answerKey).length}</span>
                                    </div>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                      {attList.map((att, idx) => (
                                        <div key={att.id} className="flex items-center justify-between gap-4 text-[11px] bg-slate-50 border border-slate-150/60 p-2 rounded-xl">
                                          <div className="font-mono text-slate-600">
                                            <span className="font-bold text-slate-705">Attempt #{idx + 1}</span> ({att.submitTime ? new Date(att.submitTime).toLocaleDateString() : 'Practice'}): <span className="font-bold text-slate-800">{att.score}/{Object.keys(test.answerKey).length}</span> ({att.accuracy}% acc)
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedAnalysis({ test, attempt: att })}
                                            className="text-[10px] text-indigo-650 hover:text-indigo-805 font-bold cursor-pointer hover:underline"
                                          >
                                            Analysis &rarr;
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                {userType === 'admin' ? (
                                  <button
                                    onClick={() => handleDeleteTest(test.id)}
                                    className="text-rose-600 hover:text-rose-505 text-xs font-mono font-medium border border-rose-200 px-3.5 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition animate-fade-in"
                                  >
                                    Delete Paper
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => startExamSession(test)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  >
                                    Practice Drill <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    </>
                    );
                  })()}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-slate-805">
                      <h4 className="text-sm font-bold text-slate-800 mb-2 font-sans">Practice evaluations stats</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 font-sans">
                        Practice mock exams possess unlocked timetables. Students may take them multiple times to correct speed accuracy.
                      </p>
                      
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3 font-sans">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-sans">Unique practice tests:</span>
                          <span className="font-mono text-slate-705 font-bold">
                            {userType === 'admin' 
                              ? db.tests.filter(t => t.type === 'practice').length
                              : db.tests.filter(t => t.type === 'practice' && (t.classVal === currUser?.classVal || t.classVal === 'All Classes' || t.classVal === 'All')).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-505 font-sans">Total Practice submissions:</span>
                          <span className="font-mono text-slate-705 font-bold">
                            {userType === 'student'
                              ? db.attempts.filter(a => a.studentId === currUser.studentId && db.tests.find(t => t.id === a.testId)?.type === 'practice').length
                              : db.attempts.filter(a => db.tests.find(t => t.id === a.testId)?.type === 'practice').length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
    </>
  );
}
