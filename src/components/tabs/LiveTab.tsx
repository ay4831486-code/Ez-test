import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function LiveTab() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState } = useAppContext();
  const studentAttempts = currUser ? db.attempts.filter((a: any) => a.studentId === currUser.studentId && a.status === 'submitted') : [];
  const maxScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map((a: any) => a.score)) : 1;
  const padding = 20; const height = 80; const width = 300;
  return (
    <>
            {activeTab === 'live' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Live Scheduled Exams Chamber</h2>
                    <p className="text-xs text-slate-500 mt-1">Official evaluation dates, auto unlocking and OMR sheet inputs.</p>
                  </div>

                  {userType === 'admin' && (
                    <button
                      onClick={() => {
                        setTestFormType('live');
                        setShowCreateTest(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Schedule Live Exam
                    </button>
                  )}
                </div>

                {/* Exams List widget */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Test schedulers items list */}
                  <div className="lg:col-span-2 space-y-4">
                  {(() => {
                    const visibleLiveTests = db.tests.filter(t => t.type === 'live' && (userType === 'admin' || t.classVal === currUser?.classVal || t.classVal === 'All Classes' || t.classVal === 'All'));

                    return (
                      <>
                        {visibleLiveTests.length === 0 ? (
                          <div className="bg-white border border-slate-205 shadow-sm rounded-3xl p-10 text-center text-slate-400">
                            No scheduled Live Testing parameters found for your class.
                          </div>
                        ) : (
                          visibleLiveTests.map((test) => {
                        const statusObj = getLiveTestState(test);
                        const isStudent = userType === 'student';
                        
                        // Check if student already attempted
                        const priorAttempt = isStudent 
                          ? db.attempts.find(a => a.testId === test.id && a.studentId === currUser.studentId && a.status === 'submitted')
                          : null;

                        return (
                          <div key={test.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-300 shadow-sm transition">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-3.5 mb-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider border ${statusObj.style}`}>
                                    {statusObj.label}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">{test.classVal} • {test.subject}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{test.title}</h3>
                                
                                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 font-mono">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                      {test.type === 'live' && test.startTime && test.endTime 
                                        ? Math.round((new Date(test.endTime).getTime() - new Date(test.startTime).getTime()) / 60000) 
                                        : test.duration} mins total window
                                    </span>
                                  </div>
                                  <div>
                                    <span>Date: {test.date}</span>
                                  </div>
                                </div>

                                {/* Active Scheduled exact details */}
                                <div className="text-[10px] text-indigo-600 font-mono mt-1 leading-relaxed font-semibold">
                                  Time Slot: {new Date(test.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(test.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} (Local Time)
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                                {userType === 'admin' ? (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleDeleteTest(test.id)}
                                      className="text-rose-600 hover:text-rose-500 text-xs font-mono font-medium border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition"
                                    >
                                      Cancel Exam
                                    </button>
                                  </div>
                                ) : (
                                  /* Student Button control */
                                  <div>
                                    {priorAttempt ? (
                                      <div className="text-right">
                                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 justify-end font-mono">
                                          <CheckCircle className="h-4 w-4" /> Score: {priorAttempt.score}/{Object.keys(test.answerKey).length}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400 block">
                                          Ranked #{priorAttempt.rank || 'N/A'} (Acc {priorAttempt.accuracy}%)
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedAnalysis({ test, attempt: priorAttempt })}
                                          className="mt-1.5 text-[11px] text-indigo-650 hover:text-indigo-805 font-bold flex items-center gap-1 justify-end hover:underline cursor-pointer ml-auto"
                                        >
                                          View Full Analysis &rarr;
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => startExamSession(test)}
                                        disabled={statusObj.label !== 'Active Now'}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                          statusObj.label === 'Active Now'
                                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/10'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                        }`}
                                      >
                                        <ArrowRight className="h-4 w-4" />
                                        {statusObj.label === 'Active Now' ? 'Begin Live OMR' : 'Locked'}
                                      </button>
                                    )}
                                  </div>
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

                  {/* Right side instruction card or detail widgets */}
                  <div className="space-y-6">
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 text-indigo-950 font-sans shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 flex items-center gap-1">
                        <ShieldAlert className="h-4 w-4 text-indigo-600" /> Exam Safety protocol instructions
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-650 leading-relaxed list-disc list-inside">
                        <li>Scheduled Live Exams must be entered during the active scheduled window. No extra time window allowed.</li>
                        <li>OMR bubbles once finalized and submitted cannot be changed manually or reset.</li>
                        <li>Leaving the tab background saves answers but ticking clock continues synchronously.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}
    </>
  );
}
