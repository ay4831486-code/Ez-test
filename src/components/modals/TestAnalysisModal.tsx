import React, { useState, forwardRef } from 'react';
import { X, CheckCircle, AlertCircle, HelpCircle, Award, PieChart as PieChartIcon, Info, Users } from 'lucide-react';
import { Test, Attempt } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface TestAnalysisModalProps {
  test: Test;
  attempt: Attempt;
  onClose: () => void;
  db?: any;
}

const TestAnalysisModal = forwardRef<HTMLDivElement, TestAnalysisModalProps>(({ test, attempt, onClose, db }, ref) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const qKeys = Object.keys(test.answerKey).map(Number).sort((a, b) => a - b);
  const totalQuestions = qKeys.length;

  const analysis = qKeys.map((qNum) => {
    const correctKey = test.answerKey[qNum];
    const studentAnswer = attempt.answers[qNum] || "";
    let status: 'correct' | 'incorrect' | 'unattempted' = 'unattempted';

    if (!studentAnswer || studentAnswer.trim() === "") {
      status = 'unattempted';
    } else if (studentAnswer.toUpperCase() === correctKey.toUpperCase()) {
      status = 'correct';
    } else {
      status = 'incorrect';
    }

    return {
      qNum,
      correctKey,
      studentAnswer,
      status
    };
  });

  const correctCount = analysis.filter(q => q.status === 'correct').length;
  const incorrectCount = analysis.filter(q => q.status === 'incorrect').length;
  const unattemptedCount = analysis.filter(q => q.status === 'unattempted').length;

  const filteredAnalysis = analysis.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const pieData = [
    { name: 'Correct', value: correctCount, color: '#10b981' },
    { name: 'Incorrect', value: incorrectCount, color: '#f43f5e' },
    { name: 'Unattempted', value: unattemptedCount, color: '#94a3b8' }
  ].filter(d => d.value > 0);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden text-slate-800 font-sans flex flex-col max-h-[90vh]"
        id="test-analysis-modal"
      >
        {/* Decorative ambient color header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
            title="Close analysis"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3.5 mb-2">
            <span className="bg-white/25 text-white text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-white/10">
              Analysis Dashboard
            </span>
            <span className="text-xs text-indigo-200 font-mono font-medium">{test.classVal} • {test.subject}</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">{test.title}</h3>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
            <p className="text-xs text-indigo-100 font-mono">Attempted on: {attempt.submitTime ? new Date(attempt.submitTime).toLocaleString() : new Date().toLocaleString()}</p>
            {(() => {
              if (!attempt.startTime || !attempt.submitTime) return null;
              const diffInSeconds = Math.floor((new Date(attempt.submitTime).getTime() - new Date(attempt.startTime).getTime()) / 1000);
              if (isNaN(diffInSeconds) || diffInSeconds < 0) return null;
              const m = Math.floor(diffInSeconds / 60);
              const s = diffInSeconds % 60;
              return <span className="text-[10px] text-white font-mono font-bold bg-white/15 px-2 py-0.5 rounded-md border border-white/20">Time Taken: {m}m {s}s</span>;
            })()}
          </div>
        </div>

        {/* Content body - scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          
          {/* Scoring Metrics Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div 
              className={`bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center relative overflow-hidden group ${db ? 'cursor-pointer hover:bg-orange-100 hover:border-orange-200 transition' : ''}`}
              onClick={() => db && setShowLeaderboard(true)}
            >
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-orange-700 font-bold font-mono">Rank</p>
              <div className="text-2xl font-black text-orange-600 mt-1 flex items-center justify-center gap-1 relative z-10">
                <Award className="h-5 w-5 text-orange-500 shrink-0" />
                <span>{attempt.rank || 'N/A'}</span>
              </div>
              <p className="text-[9px] text-orange-600 mt-0.5 relative z-10">
                {db ? "tap for leaderboard" : "overall standing"}
              </p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold font-mono">Score Earned</p>
              <div className="text-2xl font-black text-indigo-600 mt-1">{attempt.score} / {totalQuestions}</div>
              <p className="text-[9px] text-slate-400 mt-0.5">correct selection ratio</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold font-mono">Correct Bubbles</p>
              <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{correctCount}</span>
              </div>
              <p className="text-[9px] text-emerald-650 font-bold mt-0.5 font-mono">+{correctCount} correct marks</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-wider text-rose-700 font-bold font-mono">Incorrect Bubbles</p>
              <div className="text-2xl font-black text-rose-600 mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                <span>{incorrectCount}</span>
              </div>
              <p className="text-[9px] text-rose-650 font-bold mt-0.5 font-mono">wrong choice deductions</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-505 font-bold font-mono">Unattempted</p>
              <div className="text-2xl font-black text-slate-600 mt-1 flex items-center justify-center gap-1">
                <HelpCircle className="h-5 w-5 text-slate-500 shrink-0" />
                <span>{unattemptedCount}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">skipped bubble rows</p>
            </div>
          </div>

          {/* Quick stand-alone progress accuracy bar and Breakdown Custom PieChart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1">
                  <PieChartIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 font-sans">Accuracy metrics stood at</span>
                </div>
                <span className="text-xs font-mono font-black text-slate-800">{attempt.accuracy}%</span>
              </div>
              <div className="w-full bg-slate-205 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    attempt.accuracy >= 75 ? 'bg-emerald-500' : attempt.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${attempt.accuracy}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Grid visual bubble overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 font-mono flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-500" /> Bubble Board Evaluation standing
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.map((item) => (
                <div 
                  key={item.qNum} 
                  className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center text-[10px] font-mono font-bold font-semibold transition-all select-none ${
                    item.status === 'correct' 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700 ring-2 ring-emerald-500/10' 
                      : item.status === 'incorrect' 
                        ? 'bg-rose-50 border-rose-250 text-rose-700 ring-2 ring-rose-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                  title={`Q${item.qNum}: Correct (${item.correctKey}) - Selected (${item.studentAnswer || 'None'})`}
                >
                  <div>Q{item.qNum}</div>
                  <div className="text-[9px] scale-90 font-black tracking-normal opacity-80">{item.studentAnswer || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive filter & Detailed table breakdown */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">Question Breakdown Analysis</h4>
              
              <div className="flex items-center gap-1">
                {(['all', 'correct', 'incorrect', 'unattempted'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition capitalize cursor-pointer border ${
                      filter === opt 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-80 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-705 font-sans leading-relaxed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 select-none">
                    <th className="px-4 py-3">Quest. No</th>
                    <th className="px-4 py-3">Your OMR Bubble Selection</th>
                    <th className="px-4 py-3">Correct Answer Key</th>
                    <th className="px-4 py-3 text-right">Status Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                        No matches discovered inside the filtered choice.
                      </td>
                    </tr>
                  ) : (
                    filteredAnalysis.map((item) => (
                      <tr key={item.qNum} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3.5 font-bold font-mono text-slate-800">
                          Question {String(item.qNum).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {item.studentAnswer ? (
                            <span className={`px-2 py-0.5 rounded font-black border text-xs ${
                              item.status === 'correct' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                              {item.studentAnswer}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono italic">Not Attempted</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold text-xs">
                          Option {item.correctKey}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black tracking-wide border ${
                            item.status === 'correct' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : item.status === 'incorrect' 
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Modal Footer area */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 flex justify-end shrink-0 select-none">
          <button
            type="button"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-5.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>

      {/* Nested Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && db && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden text-slate-800 font-sans flex flex-col max-h-[85vh]"
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-6 text-white shrink-0 relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Test Leaderboard</h3>
                    <p className="text-xs text-orange-100 font-mono">Real-time overall rankings</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                {(() => {
                  const allAttempts = db.attempts.filter(a => a.testId === test.id && a.status === 'submitted');
                  const sortedAttempts = [...allAttempts].sort((a, b) => b.score - a.score); // Basic sort by score mapping ranks
                  
                  if (sortedAttempts.length === 0) return <div className="text-center p-4 text-slate-500 font-bold">No participants yet.</div>;

                  return sortedAttempts.map((att, idx) => {
                    // Try to find student
                    const isCurrentUser = att.id === attempt.id;
                    const student = db.students.find(s => s.studentId === att.studentId);
                    
                    return (
                      <div key={att.id} className={`flex items-center justify-between p-3 rounded-2xl border ${isCurrentUser ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'} transition`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-500'}`}>
                            #{att.rank || (idx + 1)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              {student?.name || att.studentId}
                              {isCurrentUser && <span className="text-[9px] bg-orange-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {att.studentId}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">{att.score}</div>
                          <div className="text-[9px] text-slate-400 font-mono uppercase">Score</div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default TestAnalysisModal;
