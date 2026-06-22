import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Clock, Search, Filter, BookOpen, Users, Sliders, Play, 
  CheckCircle, Zap, User, RefreshCw, Trophy, Target, Timer, TrendingUp, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { Attempt, Test } from '../../types';

export default function Leaderboard() {
  const { db, userType, currUser, syncDB, dbLoading } = useAppContext();
  
  // Tab/State for Selected Test
  const [testMode, setTestMode] = useState<'live'|'practice'>('live');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get active eligible tests based on user
  const visibleTests = useMemo(() => {
    return db.tests.filter((t: Test) => {
      if (t.type !== testMode) return false;
      if (userType === 'admin') return true;
      // Students see tests for their class, all classes, or foundation
      return (
        t.classVal === currUser?.classVal || 
        t.classVal === 'All Classes' || 
        t.classVal === 'All' || 
        t.classVal === 'Foundation'
      );
    });
  }, [db.tests, userType, currUser, testMode]);

  // Set default selected test if empty or when testMode changes
  React.useEffect(() => {
    if (visibleTests.length > 0 && !visibleTests.find(t => t.id === selectedTestId)) {
      setSelectedTestId(visibleTests[0].id);
    } else if (visibleTests.length === 0) {
      setSelectedTestId('');
    }
  }, [visibleTests, selectedTestId]);

  const selectedTestObj = useMemo(() => {
    return db.tests.find((t: Test) => t.id === selectedTestId);
  }, [db.tests, selectedTestId]);

  // Get and sort submitted attempts for the chosen test
  const testLeaderboardData = useMemo(() => {
    if (!selectedTestId) return [];

    // Filter attempts for this test
    const testAttempts = db.attempts.filter(
      (a: Attempt) => a.testId === selectedTestId && a.status === 'submitted'
    );

    // Group by studentId and only keep the best attempt
    const bestAttemptsMap = new Map<string, Attempt>();
    for (const attempt of testAttempts) {
      const existing = bestAttemptsMap.get(attempt.studentId);
      if (!existing) {
        bestAttemptsMap.set(attempt.studentId, attempt);
      } else {
        // Compare to keep the best one (highest score, highest accuracy, least time)
        let isBetter = false;
        if (attempt.score > existing.score) {
          isBetter = true;
        } else if (attempt.score === existing.score) {
          if (attempt.accuracy > existing.accuracy) {
            isBetter = true;
          } else if (attempt.accuracy === existing.accuracy) {
            const timeA = attempt.submitTime && attempt.startTime ? new Date(attempt.submitTime).getTime() - new Date(attempt.startTime).getTime() : 0;
            const timeE = existing.submitTime && existing.startTime ? new Date(existing.submitTime).getTime() - new Date(existing.startTime).getTime() : 0;
            if (timeA && timeE && timeA < timeE) {
              isBetter = true;
            }
          }
        }
        if (isBetter) {
          bestAttemptsMap.set(attempt.studentId, attempt);
        }
      }
    }

    const uniqueBestAttempts = Array.from(bestAttemptsMap.values());

    // Calculate completion times and map the student class details
    const mappedAttempts = uniqueBestAttempts.map((attempt: Attempt) => {
      let completionMs = 0;
      if (attempt.submitTime && attempt.startTime) {
        completionMs = new Date(attempt.submitTime).getTime() - new Date(attempt.startTime).getTime();
      } else if (attempt.startTime) {
        // Fallback or practice mode
        completionMs = (selectedTestObj?.duration || 45) * 60 * 1000;
      }
      
      const studentClass = db.students.find(s => s.studentId === attempt.studentId)?.classVal || 'Unknown';
      const studentRoll = db.students.find(s => s.studentId === attempt.studentId)?.rollNumber || 'N/A';
      
      return {
        ...attempt,
        completionMs,
        studentClass,
        studentRoll
      };
    });

    // Filtering by class
    const filteredAttempts = mappedAttempts.filter((att) => {
      // Class filter
      if (classFilter !== 'All' && att.studentClass !== classFilter) {
        return false;
      }
      
      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          att.studentName.toLowerCase().includes(query) ||
          att.studentId.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

    // Custom sorting:
    // 1. Highest Score first
    // 2. Highest Accuracy first (tie-breaker)
    // 3. Lowest Completion Time (speed tie-breaker)
    // 4. Earliest submitTime
    return filteredAttempts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      if (a.completionMs && b.completionMs && a.completionMs !== b.completionMs) {
        return a.completionMs - b.completionMs;
      }
      const timeA = a.submitTime ? new Date(a.submitTime).getTime() : 0;
      const timeB = b.submitTime ? new Date(b.submitTime).getTime() : 0;
      return timeA - timeB;
    });

  }, [selectedTestId, db.attempts, db.students, selectedTestObj, classFilter, searchQuery]);

  // Derive top stats helper
  const stats = useMemo(() => {
    if (testLeaderboardData.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgAccuracy: 0,
        highestScore: 0,
        fastestTimeStr: 'N/A',
        fastestName: 'N/A'
      };
    }

    const total = testLeaderboardData.length;
    const totalScore = testLeaderboardData.reduce((acc, curr) => acc + curr.score, 0);
    const totalAccuracy = testLeaderboardData.reduce((acc, curr) => acc + curr.accuracy, 0);
    const highestScore = Math.max(...testLeaderboardData.map(a => a.score));

    // Calculate fastest from attempts that have real submitTime and startTime
    const completedAttempts = testLeaderboardData.filter(a => a.submitTime && a.startTime);
    let fastestStr = 'N/A';
    let fastestName = 'N/A';

    if (completedAttempts.length > 0) {
      const quickest = [...completedAttempts].sort((a, b) => (a.completionMs || 0) - (b.completionMs || 0))[0];
      if (quickest && quickest.completionMs) {
        const totalSecs = Math.floor(quickest.completionMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        fastestStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        fastestName = quickest.studentName;
      }
    }

    return {
      total,
      avgScore: Number((totalScore / total).toFixed(1)),
      avgAccuracy: Math.round(totalAccuracy / total),
      highestScore,
      fastestTimeStr: fastestStr,
      fastestName
    };
  }, [testLeaderboardData]);

  // Helper to format mills to nice string
  const formatCompletionTime = (ms: number | undefined) => {
    if (!ms || ms <= 0) return 'Practice Mode';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    let str = '';
    if (hours > 0) str += `${hours}h `;
    if (mins > 0 || hours > 0) str += `${mins}m `;
    str += `${secs}s`;
    return str;
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 font-sans flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            EZ Score Leaderboard chamber
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time student performance rankings, precision scores, and completion speed analysis.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTestMode('live')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                testMode === 'live' 
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Live Tests
            </button>
            <button
              onClick={() => setTestMode('practice')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                testMode === 'practice' 
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Practice
            </button>
          </div>
          
          <button
            onClick={syncDB}
            disabled={dbLoading}
            className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer border border-indigo-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Control Filters Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Test select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
              1. Select Target Exam / Practice paper
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {visibleTests.length === 0 ? (
                  <option value="">No tests uploaded yet</option>
                ) : (
                  visibleTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.type === 'live' ? 'Live' : 'Practice'} • {t.classVal})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Academic class filters */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
              2. Filter Grade Class
            </label>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="All">All Class Batches</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Foundation">Foundation</option>
              </select>
            </div>
          </div>

          {/* Search bar student name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
              3. Search Candidate
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or Student ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Selected Test context pill bar */}
        {selectedTestObj && (
          <div className="flex flex-wrap gap-2.5 pt-3 boundary-t border-slate-100 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-750 border border-indigo-100">
                {selectedTestObj.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                {selectedTestObj.classVal} Target
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                Format: {Object.keys(selectedTestObj.answerKey).length} MCQs
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100">
                Limit: {selectedTestObj.duration} minutes
              </span>
            </div>

            {selectedTestObj.type === 'live' && selectedTestObj.date && (
              <span className="text-[11px] text-indigo-600 font-semibold font-mono tracking-wide">
                Live Window Scheduled: {selectedTestObj.date}
              </span>
            )}
          </div>
        )}
      </div>

      {visibleTests.length === 0 ? (
        <div className="bg-white border border-slate-20s shadow-sm rounded-3xl p-12 text-center text-slate-400 font-medium">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          No assessment tests exist in the database. When tests are published, their leaderboard metrics appear here.
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total submissions card */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 p-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-450">Active Candidates</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.total}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Submitted evaluations</p>
            </div>

            {/* Average score card */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Target className="h-4 w-4" />
              </div>
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-450">Class Average Score</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {stats.avgScore} <span className="text-xs font-bold text-slate-400">/ {selectedTestObj ? Object.keys(selectedTestObj.answerKey).length : 10}</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Average correctness {stats.avgAccuracy}%</p>
            </div>

            {/* Highest Rank card */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 p-1.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-500">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-450">Highest Score Achieved</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {testLeaderboardData.length > 0 ? stats.highestScore : '0'} <span className="text-xs font-bold text-slate-400">/ {selectedTestObj ? Object.keys(selectedTestObj.answerKey).length : 10}</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Top evaluation precision limit</p>
            </div>

            {/* Fastest finish card */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
                <Timer className="h-4 w-4" />
              </div>
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-450">Fastest Submission Speed</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1 truncate" title={stats.fastestName}>
                {stats.fastestTimeStr}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 truncate">By {stats.fastestName}</p>
            </div>
          </div>

          {/* Leaders Table list */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Student Ranking Ladder</h4>
              </div>
              <span className="text-[10px] text-slate-405 font-mono font-semibold">Ordered by Score &rarr; Accuracy &rarr; Speed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider text-[9px] font-mono border-b border-slate-100 bg-slate-50/20">
                    <th className="px-5 py-3">Rank on Ladder</th>
                    <th className="py-3">Candidate name</th>
                    <th className="py-3">Class Grade</th>
                    <th className="py-3">Evaluation Score</th>
                    <th className="py-3">Precision Accuracy</th>
                    <th className="py-3">Completion Speed</th>
                    <th className="px-5 py-3 text-right">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {testLeaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                        No completed student submission logs found matching the filter constraints.
                      </td>
                    </tr>
                  ) : (
                    testLeaderboardData.map((attempt, idx) => {
                      const rankNum = idx + 1;
                      
                      // Highlight top 3 beautifully
                      let rankBadgeClass = "bg-slate-100 text-slate-600";
                      let bgRowClass = "hover:bg-slate-50/70 transition";
                      let rankIcon = null;

                      if (rankNum === 1) {
                        rankBadgeClass = "bg-amber-100 text-amber-800 font-bold border border-amber-305/80 ring-2 ring-amber-50";
                        bgRowClass = "bg-amber-50/15 hover:bg-amber-50/35 transition-colors font-semibold";
                        rankIcon = <Trophy className="h-3 w-3 text-amber-500 fill-amber-500" />;
                      } else if (rankNum === 2) {
                        rankBadgeClass = "bg-slate-205 text-slate-800 font-bold border border-slate-300 ring-2 ring-slate-100/60";
                        bgRowClass = "bg-slate-50/25 hover:bg-slate-50/50 transition-colors";
                        rankIcon = <Trophy className="h-3 w-3 text-slate-400 fill-slate-400" />;
                      } else if (rankNum === 3) {
                        rankBadgeClass = "bg-orange-100 text-orange-850 font-bold border border-orange-305/50 ring-2 ring-orange-50";
                        bgRowClass = "bg-orange-50/5 hover:bg-orange-50/15 transition-colors";
                        rankIcon = <Trophy className="h-3 w-3 text-orange-500 fill-orange-500" />;
                      }

                      // Check if this attempt belongs to the logged in student
                      const isCurrentUser = currUser && currUser.studentId === attempt.studentId;
                      if (isCurrentUser) {
                        bgRowClass = "bg-indigo-50/30 hover:bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/10 font-bold";
                      }

                      return (
                        <tr key={attempt.id} className={`${bgRowClass}`}>
                          {/* Rank Icon with beautiful badges */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${rankBadgeClass}`}>
                                {rankNum}
                              </span>
                              {rankIcon}
                            </div>
                          </td>

                          {/* Candidate details with Dicebear Avatars */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${attempt.studentId}`} 
                                alt={attempt.studentName} 
                                className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50" 
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                                }}
                              />
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">
                                  {attempt.studentName}
                                  {isCurrentUser && (
                                    <span className="ml-1.5 px-1.5 py-0.2 select-none text-[8px] bg-indigo-600 text-white rounded font-mono uppercase font-black uppercase-none">
                                      You
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-450 block font-mono">ID: {attempt.studentId} • Roll: #{attempt.studentRoll}</span>
                              </div>
                            </div>
                          </td>

                          {/* Target Grade level */}
                          <td className="py-3.5">
                            <span className="text-slate-600 font-medium text-xs">
                              {attempt.studentClass}
                            </span>
                          </td>

                          {/* Performance Score */}
                          <td className="py-3.5">
                            <div className="font-mono text-xs font-bold text-slate-850">
                              <span className="text-indigo-650 text-sm">{attempt.score}</span> 
                              <span className="text-[11px] text-slate-450 font-normal"> / {selectedTestObj ? Object.keys(selectedTestObj.answerKey).length : 10}</span>
                            </div>
                          </td>

                          {/* Precision accuracy with colored pill */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                                <div 
                                  className={`h-full rounded-full ${
                                    attempt.accuracy >= 80 ? 'bg-emerald-500' : attempt.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${attempt.accuracy}%` }}
                                />
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                attempt.accuracy >= 80 ? 'bg-emerald-50 text-emerald-700' : attempt.accuracy >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {attempt.accuracy}%
                              </span>
                            </div>
                          </td>

                          {/* Completion Speed time formatted */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-650 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatCompletionTime(attempt.completionMs)}</span>
                            </div>
                          </td>

                          {/* Submission Date formatting */}
                          <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-400">
                            {attempt.submitTime ? (
                              <span>
                                {new Date(attempt.submitTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                <span className="block text-[8px] text-slate-400/80">
                                  {new Date(attempt.submitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
