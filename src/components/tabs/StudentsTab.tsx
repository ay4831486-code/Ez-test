import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import StudentRow from '../user/StudentRow';

export default function StudentsTab() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState } = useAppContext();
  const [selectedClassFilter, setSelectedClassFilter] = React.useState<string>('All');
  
  const studentAttempts = currUser ? db.attempts.filter((a: any) => a.studentId === currUser.studentId && a.status === 'submitted') : [];
  const maxScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map((a: any) => a.score)) : 1;
  const padding = 20; const height = 80; const width = 300;
  return (
    <>
            {userType === 'admin' && activeTab === 'students' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Coaching Institute Students Directory</h2>
                    <p className="text-xs text-slate-500 mt-1">Approve registrations, manage blocks, reset logins credentials.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowDirectAddStudent(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Enroll Student directly
                    </button>
                  </div>
                </div>

                {/* Sub Tab switch */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center w-full">
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/80 select-none font-sans">
                    <button
                      onClick={() => setAdminSubTab('all')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${adminSubTab === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Approved ({db.students.filter(s => s.status === 'Approved').length})
                    </button>
                    <button
                      onClick={() => setAdminSubTab('pending')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${adminSubTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Pending ({db.students.filter(s => s.status === 'Pending').length})
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 w-full sm:w-auto">
                    <span>Class:</span>
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex-1 sm:flex-none text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  </div>
                </div>

                {/* Student grid/table list */}
                <main className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 overflow-hidden shadow-sm">
                  
                  {/* Search box */}
                  <div className="relative mb-4">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Search className="h-4 w-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search students by official name or mobile number link..."
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-full sm:min-w-[600px] font-sans block sm:table">
                      <thead className="hidden sm:table-header-group">
                        <tr className="text-slate-400 uppercase tracking-wider text-[9px] font-mono border-b border-slate-100">
                          <th className="pb-2.5 px-3">Legal Name</th>
                          <th className="pb-2.5 px-3">StudentID</th>
                          <th className="pb-2.5 px-3">Class</th>
                          <th className="pb-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 block sm:table-row-group">
                        {(() => {
                          const filteredList = db.students
                            .filter(s => {
                              if (adminSubTab === 'all') return s.status === 'Approved';
                              return s.status === 'Pending';
                            })
                            .filter(s => selectedClassFilter === 'All' ? true : (selectedClassFilter === 'Unassigned' ? !['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(s.classVal) : s.classVal === selectedClassFilter))
                            .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.mobile.includes(searchQuery));

                          if (filteredList.length === 0) {
                            return (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium italic">
                                  No matches discovered in directory database ledger.
                                </td>
                              </tr>
                            );
                          }

                          const classesList = ['Class 12', 'Class 11', 'Class 10', 'Class 9', 'Unassigned & Others'];
                          const grouped:Record<string, any[]> = {};
                          classesList.forEach(cls => { grouped[cls] = []; });

                          filteredList.forEach(student => {
                            const c = student.classVal || '';
                            if (classesList.includes(c)) {
                              grouped[c].push(student);
                            } else {
                              grouped['Unassigned & Others'].push(student);
                            }
                          });

                          return classesList.map(clsName => {
                            const studentsInGroup = grouped[clsName] || [];
                            if (studentsInGroup.length === 0) return null;

                            return (
                              <React.Fragment key={clsName}>
                                <tr className="bg-slate-50 border-y border-slate-100/60 select-none">
                                  <td colSpan={4} className="px-3.5 py-1.5 font-bold text-[10px] text-indigo-700 tracking-wide uppercase font-sans">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                                      {clsName}
                                      <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-mono border border-indigo-200 font-semibold tracking-normal lowercase">
                                        {studentsInGroup.length} registration{studentsInGroup.length === 1 ? '' : 's'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                 {studentsInGroup.map((student) => (
                                  <StudentRow
                                    key={student.id}
                                    student={student}
                                    setSelectedStudent={setSelectedStudent}
                                    handleApproveStudent={handleApproveStudent}
                                    handleRejectStudent={handleRejectStudent}
                                    handleToggleBlock={handleToggleBlock}
                                    handleResetPassword={handleResetPassword}
                                  />
                                ))}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </main>
              </div>
            )}
    </>
  );
}
