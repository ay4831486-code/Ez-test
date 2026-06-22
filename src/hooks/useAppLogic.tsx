
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseState, Test, Student, Attempt } from '../types';
import { saveOfflineAttempt, getOfflineAttempts, clearOfflineAttempt } from '../offlineSync';

export function useAppLogic() {
    const [userType, setUserType] = useState<'admin' | 'student' | null>(() => {
      const saved = localStorage.getItem('ez_user_type');
      return saved ? (saved as 'admin' | 'student') : null;
    });
    const [currUser, setCurrUser] = useState<any>(() => {
      const saved = localStorage.getItem('ez_curr_user');
      try {
        return saved ? JSON.parse(saved) : null;
      } catch {
        localStorage.removeItem('ez_curr_user');
        return null;
      }
    });
  
    // Database synchronizer
    const [db, setDb] = useState<DatabaseState>({
      students: [],
      tests: [],
      attempts: [],
      notifications: [],
      activities: []
    });
  
    // UI state
    const [activeTab, setActiveTab] = useState<string>(() => {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      return params.get('tab') || 'home';
    });
    const [adminSubTab, setAdminSubTab] = useState<'all' | 'pending'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dbLoading, setDbLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
    // Authentication Fields (Clean, no default values to comply with Security Guidelines)
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
    
    // Student registration fields
    const [regName, setRegName] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regClass, setRegClass] = useState('Class 10');
    const [regBatch, setRegBatch] = useState('2025-2026');
    const [regRoll, setRegRoll] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  
    // Split-screen Live Exam interface
    const [activeExam, setActiveExam] = useState<Test | null>(null);
    const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
    const [examTimer, setExamTimer] = useState<number>(0); // in seconds
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationData, setCelebrationData] = useState<any>(null);
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
  
    // Bottom nav dock state remains solidly true across all scroll levels for direct native mobile immersion
    const [showBottomTabs, setShowBottomTabs] = useState(true);
  
  
    // Swipe gesture detection on main content area to change active bottom navigation tabs
    const mainTouchStartPos = useRef<{ x: number; y: number } | null>(null);
  
    const handleMainTouchStart = (e: React.TouchEvent) => {
      // Check if touch is on scrollable or interactive elements that should handle their own horizontal swipe/scroll
      let target = e.target as HTMLElement | null;
      while (target && target !== e.currentTarget) {
        if (
          (target.classList && (
            target.classList.contains('overflow-x-auto') ||
            target.classList.contains('overflow-x-scroll')
          )) ||
          target.tagName === 'TABLE' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.getAttribute('role') === 'slider' ||
          target.scrollWidth > target.clientWidth + 10
        ) {
          return; // Skip gesture detection to let local component scroll or interact
        }
        target = target.parentElement;
      }
  
      const touch = e.touches[0];
      mainTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
    };
  
    const handleMainTouchEnd = (e: React.TouchEvent) => {
      if (!mainTouchStartPos.current) return;
      const touch = e.changedTouches[0];
      const dX = touch.clientX - mainTouchStartPos.current.x;
      const dY = touch.clientY - mainTouchStartPos.current.y;
      mainTouchStartPos.current = null;
  
      // We require a minimum horizontal travel of 85px and the swipe to be primarily horizontal
      if (Math.abs(dX) > 85 && Math.abs(dX) > Math.abs(dY) * 2.0) {
        const tabs = ['home', 'live', 'practice', 'students', 'profile'].filter(
          (tabId) => tabId !== 'students' || userType === 'admin'
        );
        const currentIdx = tabs.indexOf(activeTab);
        if (currentIdx !== -1) {
          if (dX < 0) {
            // Swipe Left -> Next Tab
            if (currentIdx < tabs.length - 1) {
              setActiveTab(tabs[currentIdx + 1]);
            }
          } else {
            // Swipe Right -> Previous Tab
            if (currentIdx > 0) {
              setActiveTab(tabs[currentIdx - 1]);
            }
          }
        }
      }
    };
  
  
    // Doubt solving drawer panel
    const [doubtOpen, setDoubtOpen] = useState(false);
  
    // Mobile menu control toggler
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    // Active exam view tab selector configuration (for mobile toggling questions/bubble view)
    const [examMobileTab, setExamMobileTab] = useState<'paper' | 'omr'>('paper');
  
    // Admin Create/Edit test form
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [testFormTitle, setTestFormTitle] = useState('');
    const [testFormType, setTestFormType] = useState<'live' | 'practice'>('live');
    const [testFormClass, setTestFormClass] = useState('Class 10');
    const [testFormSubject, setTestFormSubject] = useState('Physics');
    const [testFormDate, setTestFormDate] = useState('');
    const [testFormStart, setTestFormStart] = useState('');
    const [testFormEnd, setTestFormEnd] = useState('');
    const [testFormDuration, setTestFormDuration] = useState('60');
    const [testFormNumQuestions, setTestFormNumQuestions] = useState(10);
    const [testFormKeys, setTestFormKeys] = useState<Record<number, string>>({
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B'
    });
    const [testFormPdfName, setTestFormPdfName] = useState('');
    const [testFormPdfData, setTestFormPdfData] = useState('');
    const [testFormImages, setTestFormImages] = useState<string[]>([]);
  
    // Helper mapping of appropriate subjects per grade class level
    const getSubjectsForClass = (classVal: string): string[] => {
      if (classVal === 'Class 11' || classVal === 'Class 12') {
        return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English'];
      }
      return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Hindi', 'Sanskrit'];
    };
  
    // Dynamically update subject option when active class group selection changes
    useEffect(() => {
      const allowed = getSubjectsForClass(testFormClass);
      if (!allowed.includes(testFormSubject)) {
        setTestFormSubject(allowed[0]);
      }
    }, [testFormClass]);
  
    // Dynamically expand/contract answer keys based on selected number of questions
    useEffect(() => {
      const updated = { ...testFormKeys };
      const currentKeysCount = Object.keys(updated).length;
      if (testFormNumQuestions > currentKeysCount) {
        for (let i = currentKeysCount + 1; i <= testFormNumQuestions; i++) {
          updated[i] = ['A', 'B', 'C', 'D'][(i - 1) % 4];
        }
      } else if (testFormNumQuestions < currentKeysCount) {
        Object.keys(updated).forEach(k => {
          const num = parseInt(k, 10);
          if (num > testFormNumQuestions) {
            delete updated[num];
          }
        });
      }
      setTestFormKeys(updated);
    }, [testFormNumQuestions]);
  
    // Direct Student Profile view popup (Drilldown)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState<{ test: Test; attempt: Attempt } | null>(null);
    const [showDirectAddStudent, setShowDirectAddStudent] = useState(false);
    const [showDemoCreds, setShowDemoCreds] = useState(false);
  
    // Load and synchronize data
    const syncDB = async () => {
      try {
        const response = await fetch('/api/db');
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            setDb(data);
          } else {
            // Platform loading screen may return 200 OK with HTML when server is waking up
            console.warn("Expected JSON, got HTML. Skipping sync.");
          }
        }
      } catch (err: any) {
        if (err.message !== 'Failed to fetch') {
          console.error("Failed to sync database", err);
        }
      } finally {
        setDbLoading(false);
      }
    };
  
    useEffect(() => {
      syncDB();
      const interval = setInterval(syncDB, 15000); // synchronize database every 15s

      // Silent login ping to increment daily streak if local storage persists
      if (userType === 'student' && currUser && currUser.studentId && currUser.password) {
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currUser.studentId, password: currUser.password })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) setCurrUser(data.user);
        })
        .catch(() => {});
      }

      return () => clearInterval(interval);
    }, []);
  
    const syncOfflineAttempts = async () => {
      if (!navigator.onLine) return;
      try {
        const offlineAttempts = await getOfflineAttempts();
        for (const attempt of offlineAttempts) {
          try {
            const { id, ...data } = attempt;
            const res = await fetch('/api/attempts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (res.ok) {
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.indexOf("application/json") !== -1) {
                await clearOfflineAttempt(id);
              }
            }
          } catch (err: any) {
            if (err.message !== 'Failed to fetch') {
              console.error("Failed to sync offline attempt", err);
            }
          }
        }
        if (offlineAttempts.length > 0) {
          syncDB();
          if (currUser) {
             alert("Your offline exam answers have been auto-synced successfully.");
          }
        }
      } catch (err) {
        console.error("Error accessing offline DB", err);
      }
    };
  
    useEffect(() => {
      window.addEventListener('online', syncOfflineAttempts);
      syncOfflineAttempts();
      return () => window.removeEventListener('online', syncOfflineAttempts);
    }, [currUser]);
  
    // Update localStorage when auth changes
    useEffect(() => {
      if (userType && !currUser) {
        setUserType(null); // Safety mechanism to desync bad local states
        return;
      }
      
      if (userType) {
        localStorage.setItem('ez_user_type', userType);
        localStorage.setItem('ez_curr_user', JSON.stringify(currUser));
      } else {
        localStorage.removeItem('ez_user_type');
        localStorage.removeItem('ez_curr_user');
      }
    }, [userType, currUser]);
  
    // Exam Countdown handler
    useEffect(() => {
      if (activeExam) {
        timerRef.current = setInterval(() => {
          setExamTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [activeExam]);

    // Background sync feature to auto-save OMR selections to localStorage every 30 seconds
    useEffect(() => {
      if (!activeExam) return;
      const backupInterval = setInterval(() => {
        try {
          localStorage.setItem(`ez_omr_backup_${activeExam.id}`, JSON.stringify(examAnswers));
        } catch (err) {
          console.warn('Failed to auto-save OMR selections to localStorage');
        }
      }, 30000);
      
      // Also save right away when examAnswers change
      try {
        localStorage.setItem(`ez_omr_backup_${activeExam.id}`, JSON.stringify(examAnswers));
      } catch (e) {}

      return () => clearInterval(backupInterval);
    }, [activeExam, examAnswers]);
  
    // Web Notification scheduler for upcoming exams
  useEffect(() => {
    if (!currUser || userType !== 'student' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    let notifiedExamIds: string[] = [];
    try {
      const saved = localStorage.getItem('notified_exam_ids');
      if (saved) notifiedExamIds = JSON.parse(saved);
    } catch {
      // Ignored
    }

    const checkUpcomingExams = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const upcomingExams = db.tests.filter((test) => {
        if (test.classVal !== currUser.classVal && test.classVal !== 'All' && test.classVal !== 'all') {
          return false;
        }

        if (test.type !== 'live') return false;
        
        if (!test.startTime || !test.date) return false;
        
        const startTime = new Date(`${test.date}T${test.startTime}:00`);
        const timeDiffMs = startTime.getTime() - now.getTime();
        const diffMinutes = timeDiffMs / 60000;
        
        // Between 0 and 15 minutes
        return diffMinutes > 0 && diffMinutes <= 15 && !notifiedExamIds.includes(test.id);
      });

      if (upcomingExams.length > 0) {
        upcomingExams.forEach(exam => {
          new Notification('Upcoming Exam Reminder!', {
            body: `Your live exam "${exam.title}" will start in ${Math.round((new Date(`${exam.date}T${exam.startTime}:00`).getTime() - now.getTime()) / 60000)} minutes!`,
          });
          notifiedExamIds.push(exam.id);
        });
        localStorage.setItem('notified_exam_ids', JSON.stringify(notifiedExamIds));
      }
    };

    // Check immediately and then every minute
    checkUpcomingExams();
    const interval = setInterval(checkUpcomingExams, 60000);
    return () => clearInterval(interval);
  }, [db.tests, currUser, userType]);

  // LOGIN OPERATION
    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
  
      if (!loginUsername.trim() || !loginPassword.trim()) {
        setErrorMessage("Both username / mobile and password are required.");
        return;
      }
  
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loginUsername, password: loginPassword })
        });
  
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Authentication failed. Check your password.");
          return;
        }
  
        setUserType(data.userType);
        setCurrUser(data.user);
        setActiveTab('home');
        setLoginUsername('');
        setLoginPassword('');
        syncDB();
      } catch (err) {
        setErrorMessage("Connection timed out. Check if Express server is loaded.");
      }
    };
  
    // STUDENT REGISTRATION OPERATION
    const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
      setRegSuccessMsg(null);
  
      if (!regName.trim() || !regMobile.trim() || !regRoll.trim() || !regPassword.trim()) {
        setErrorMessage("All registration parameters must be completed.");
        return;
      }
  
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: regName,
            mobile: regMobile,
            classVal: regClass,
            rollNumber: regRoll,
            batchYear: regBatch,
            password: regPassword
          })
        });
  
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Failed to create registration request.");
          return;
        }
  
        setRegSuccessMsg("Enrollment requested successfully! Your application stands pending Principal Admin confirmation.");
        // Reset registration form
        setRegName('');
        setRegMobile('');
        setRegRoll('');
        setRegPassword('');
        syncDB();
      } catch (err) {
        setErrorMessage("Failed to coordinate registration. Try again.");
      }
    };
  
    // ADMIN OPERATIONS
    const handleApproveStudent = async (id: string) => {
      try {
        const res = await fetch(`/api/students/${id}/approve`, { method: "POST" });
        if (res.ok) {
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleRejectStudent = async (id: string) => {
      try {
        const res = await fetch(`/api/students/${id}/reject`, { method: "POST" });
        if (res.ok) {
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleToggleBlock = async (id: string) => {
      try {
        const res = await fetch(`/api/students/${id}/toggle-block`, { method: "POST" });
        if (res.ok) {
          syncDB();
          // Update selectedStudent view if open
          if (selectedStudent && selectedStudent.id === id) {
            setSelectedStudent(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleResetPassword = async (id: string) => {
      const newPass = prompt("Specify new password for this credentials account:");
      if (!newPass) return;
  
      try {
        const res = await fetch(`/api/students/${id}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: newPass })
        });
        if (res.ok) {
          alert("Account password updated successfully.");
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleDeleteStudent = async (id: string) => {
      if (!confirm("Are you certain you wish to delete this student and erase their academic history?")) return;
      try {
        const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSelectedStudent(null);
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleDirectAddStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!regName || !regMobile || !regRoll || !regPassword) {
        alert("Provide all fields.");
        return;
      }
  
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName,
            mobile: regMobile,
            classVal: regClass,
            rollNumber: regRoll,
            batchYear: regBatch,
            password: regPassword
          })
        });
  
        if (res.ok) {
          setShowDirectAddStudent(false);
          setRegName('');
          setRegMobile('');
          setRegRoll('');
          setRegPassword('');
          syncDB();
        } else {
          const error = await res.json();
          alert(error.error || "Failed directly enrolling student");
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    // ADMIN CREATE TEST
    const handleCreateTestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!testFormTitle.trim()) {
        alert("Please provide dry exam title.");
        return;
      }
  
      let calculatedStart = "";
      let calculatedEnd = "";
      let derivedDuration = parseInt(testFormDuration) || 60;

      if (testFormType === 'live') {
        if (!testFormDate || !testFormStart || !testFormEnd) {
          alert("Live testing timings date, start and end coordinates are required.");
          return;
        }
        const st = new Date(`${testFormDate}T${testFormStart}`);
        const et = new Date(`${testFormDate}T${testFormEnd}`);
        calculatedStart = st.toISOString();
        calculatedEnd = et.toISOString();
        derivedDuration = Math.round((et.getTime() - st.getTime()) / 60000);
      }
  
      const payload = {
        title: testFormTitle,
        type: testFormType,
        classVal: testFormClass,
        subject: testFormSubject,
        date: testFormDate,
        startTime: calculatedStart,
        endTime: calculatedEnd,
        duration: derivedDuration,
        answerKey: testFormKeys,
        pdfName: testFormPdfName || `${testFormSubject.toLowerCase()}_test_paper_${Math.floor(Math.random() * 1050)}.pdf`,
        pdfData: testFormPdfData || "",
        questionImages: testFormImages
      };
  
      try {
        const res = await fetch('/api/tests', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
  
        if (res.ok) {
          setShowCreateTest(false);
          setTestFormTitle('');
          setTestFormPdfName('');
          setTestFormPdfData('');
          setTestFormImages([]);
          syncDB();
        } else {
          const d = await res.json();
          alert(d.error || "Failed generating exam context.");
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleDeleteTest = async (testId: string) => {
      if (!confirm("Remove this scheduled test and purge evaluation rows?")) return;
      try {
        const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
        if (res.ok) {
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    // ACTIVE EXAM SESSION HANDLERS
    const startExamSession = async (test: Test) => {
      // Double check availability
      if (test.type === 'live') {
        const now = new Date().getTime();
        const st = new Date(test.startTime).getTime();
        const et = new Date(test.endTime).getTime();
        
        if (now < st) {
          alert(`This live exam scheduled is currently locked. It will trigger precisely at ${new Date(test.startTime).toLocaleTimeString()}`);
          return;
        }
        if (now > et) {
          alert("This live exam windows has already elapsed and closed.");
          return;
        }
  
        // Check duplicate
        const duplicate = db.attempts.find(a => a.testId === test.id && a.studentId === currUser.studentId && a.status === 'submitted');
        if (duplicate) {
          alert("You have already completed and submitted your live test session.");
          return;
        }
      }
  
      // Initialize/sync attempt with backend
      try {
        const res = await fetch('/api/attempts', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId: test.id,
            studentId: currUser.studentId,
            studentName: currUser.name,
            answers: {},
            status: 'started'
          })
        });
  
        if (res.ok) {
          const data = await res.json();
          const attemptStart = new Date(data.attempt.startTime).getTime();
          const now = new Date().getTime();
          const testLimitMin = test.duration;
          const rawRemainingSecs = Math.round(((attemptStart + (testLimitMin * 60 * 1000)) - now) / 1000);
  
          let finalTimer = rawRemainingSecs;
          if (test.type === 'live') {
            finalTimer = Math.round((new Date(test.endTime).getTime() - now) / 1000);
          }
  
          if (finalTimer <= 0) {
            alert("Your allowed time limit for this exam session has ended. Attempt finalized.");
            if (data.attempt.status === 'started') {
              await fetch('/api/attempts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  testId: test.id,
                  studentId: currUser.studentId,
                  studentName: currUser.name,
                  answers: data.attempt.answers || {},
                  status: 'submitted'
                })
              });
              syncDB();
            }
            return;
          }
  
          // Attempt to load local backup in case of browser refresh data loss
          let mergedAnswers = { ...data.attempt.answers };
          try {
            const backedUp = localStorage.getItem(`ez_omr_backup_${test.id}`);
            if (backedUp) {
              const parsedBackup = JSON.parse(backedUp);
              // Server has precedence theoretically, but if server answers are empty/less and device has it cached, use cached
              if (Object.keys(parsedBackup).length > Object.keys(mergedAnswers || {}).length) {
                mergedAnswers = { ...mergedAnswers, ...parsedBackup };
              }
            }
          } catch (e) {}

          setExamAnswers(mergedAnswers || {});
          setExamTimer(finalTimer);
          setActiveExam(test);
        } else {
          const data = await res.json();
          alert(data.error || "Failed initializing test attempt context.");
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleSelectOption = async (qNum: number, letterOption: string) => {
      const updated = { ...examAnswers, [qNum]: letterOption };
      setExamAnswers(updated);
  
      // Dynamic background saving of answers
      try {
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: activeExam!.id,
            studentId: currUser.studentId,
            answers: { [qNum]: letterOption }
          })
        });
      } catch (err) {
        console.warn("Background backup progress skipped", err);
      }
    };
  
    const handleClearOption = async (qNum: number) => {
      const updated = { ...examAnswers, [qNum]: "" };
      setExamAnswers(updated);
  
      try {
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: activeExam!.id,
            studentId: currUser.studentId,
            answers: { [qNum]: "" }
          })
        });
      } catch (err) {
        console.warn("Cleared option sync error", err);
      }
    };
  
    const handleManualSubmit = () => {
      if (confirm("Are you absolutely certain you wish to submit your complete OMR Bubble response now? This will permanently close the session and calculate score.")) {
        handleAutoSubmit();
      }
    };
  
    const handleAutoSubmit = async () => {
      if (!activeExam) return;
      if (timerRef.current) clearInterval(timerRef.current);
  
      const payload = {
        testId: activeExam.id,
        studentId: currUser.studentId,
        studentName: currUser.name,
        answers: examAnswers,
        status: 'submitted',
        timestamp: Date.now()
      };
  
      if (!navigator.onLine) {
        try {
          await saveOfflineAttempt(payload);
          alert("You are offline. Your exam attempt has been securely saved to IndexedDB and will auto-sync when connection is restored.");
        } catch (e) {
          console.error("Failed to save offline attempt", e);
          alert("Failed to save offline attempt.");
        }
        setActiveExam(null);
        setExamAnswers({});
        setActiveTab('home');
        return;
      }
  
      try {
        const res = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
  
        if (res.ok) {
          const data = await res.json();
          const currentExam = { ...activeExam };
          setActiveExam(null);
          setExamAnswers({});
          
          if (data.attempt) {
            setCelebrationData({ attempt: data.attempt, test: currentExam });
            setShowCelebration(true);
          } else {
            alert("OMR Bubble Sheet processed and graded successfully. You can review your ranking and corrections.");
          }
          syncDB();
          setActiveTab('home');
        } else {
          alert("Submission completed with warnings. Synchronizing database.");
          setActiveExam(null);
          syncDB();
        }
      } catch (err) {
        console.error(err);
        try {
          await saveOfflineAttempt(payload);
          alert("Submission encountered connection limits. Force closed session. Saved offline and will be synced upon reconnection.");
        } catch (e) {
          console.error("Failed to save offline attempt", e);
          alert("Submission failed, unable to save offline!");
        }
        setActiveExam(null);
        setExamAnswers({});
        setActiveTab('home');
      }
    };
  
    const handleRecalculateRanks = async () => {
      if (!confirm("Are you sure you want to recalculate all student ranks across all tests?")) return;
      try {
        const res = await fetch('/api/ranks/recalculate', {
          method: 'POST'
        });
        if (res.ok) {
          alert("Ranks successfully recalculated.");
          syncDB();
        } else {
          alert("Failed to recalculate ranks.");
        }
      } catch (err) {
        console.error(err);
        alert("Error occurred while recalculating ranks.");
      }
    };
  
    // NOTIFICATION FEED
    const handleMarkAllRead = async () => {
      try {
        const res = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: currUser?.studentId || 'admin' })
        });
        if (res.ok) {
          syncDB();
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleLogout = () => {
      setUserType(null);
      setCurrUser(null);
      setActiveTab('home');
      alert("Logged out securely.");
    };
  
    // GENERAL HELPER FOR STUDENT PERFORMANCE GRAPH
    const renderMiniChart = (studentAttempts: Attempt[]) => {
      if (studentAttempts.length === 0) return (
        <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
          No completed test attempts. Start practice.
        </div>
      );
  
      // Render beautiful dynamic custom path SVG bar/lines representation 
      const maxScore = 10;
      const width = 360;
      const height = 120;
      const padding = 20;
  
      const points = studentAttempts.map((att, index) => {
        const x = padding + (index * (width - 2 * padding) / Math.max(1, studentAttempts.length - 1 || 1));
        const y = height - padding - (att.score * (height - 2 * padding) / maxScore);
        return { x, y, score: att.score, ...att };
      });
  
      const pathD = points.length > 1
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';
  
      return (
        <div className="relative">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Vertical axis guides */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
            
            {/* horizontal guidelines */}
            <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
            
            {/* Score Path Line */}
            {points.length > 1 && (
              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-pulse" />
            )}
  
            {/* Dots on points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4.5" 
                  fill="#818cf8" 
                  className="hover:r-6 cursor-help transition-all" 
                />
                <text 
                  x={p.x} 
                  y={p.y - 8} 
                  textAnchor="middle" 
                  fill="#f8fafc" 
                  fontSize="9" 
                  fontWeight="bold"
                  className="font-mono"
                >
                  {p.score}/10
                </text>
              </g>
            ))}
          </svg>
          <div className="flex justify-between px-4 text-[9px] text-slate-500 font-mono mt-1">
            <span>First test Attempt</span>
            <span>Latest Test performance trend</span>
          </div>
        </div>
      );
    };
  
    // Convert time to human remaining countdown
    const secondsToHms = (d: number) => {
      const h = Math.floor(d / 3600);
      const m = Math.floor((d % 3600) / 60);
      const s = Math.floor(d % 60);
      return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
  
    // DYNAMIC TIMER STATE CALCULATORS
    const getLiveTestState = (test: Test) => {
      const now = new Date().getTime();
      const start = new Date(test.startTime).getTime();
      const end = new Date(test.endTime).getTime();
  
      if (now < start) {
        return { label: 'Upcoming', style: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
      } else if (now >= start && now <= end) {
        return { label: 'Active Now', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse' };
      } else {
        return { label: 'Completed', style: 'bg-slate-550 border-slate-700 text-slate-400' };
      }
    };
  
  
  
  return {
    userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, activeExam, setActiveExam, examAnswers, setExamAnswers, examTimer, setExamTimer, timerRef, showBottomTabs, setShowBottomTabs, mainTouchStartPos, handleMainTouchStart, handleMainTouchEnd, doubtOpen, setDoubtOpen, mobileMenuOpen, setMobileMenuOpen, examMobileTab, setExamMobileTab, showCreateTest, setShowCreateTest, testFormTitle, setTestFormTitle, testFormType, setTestFormType, testFormClass, setTestFormClass, testFormSubject, setTestFormSubject, testFormDate, setTestFormDate, testFormStart, setTestFormStart, testFormEnd, setTestFormEnd, testFormDuration, setTestFormDuration, testFormNumQuestions, setTestFormNumQuestions, testFormKeys, setTestFormKeys, testFormPdfName, setTestFormPdfName, testFormPdfData, setTestFormPdfData, testFormImages, setTestFormImages, getSubjectsForClass, selectedStudent, setSelectedStudent, selectedAnalysis, setSelectedAnalysis, showDirectAddStudent, setShowDirectAddStudent, showDemoCreds, setShowDemoCreds, syncDB, syncOfflineAttempts, handleLoginSubmit, handleRegisterSubmit, handleApproveStudent, handleRejectStudent, handleToggleBlock, handleResetPassword, handleDeleteStudent, handleDirectAddStudent, handleCreateTestSubmit, handleDeleteTest, startExamSession, handleSelectOption, handleClearOption, handleManualSubmit, handleAutoSubmit, handleRecalculateRanks, handleMarkAllRead, handleLogout, renderMiniChart, secondsToHms, getLiveTestState,
    showCelebration, setShowCelebration, celebrationData, setCelebrationData, isAiChatOpen, setIsAiChatOpen
  };
}
