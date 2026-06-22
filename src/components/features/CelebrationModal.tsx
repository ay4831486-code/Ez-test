import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  CheckCircle, 
  Target, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Star,
  Award,
  BookOpen
} from 'lucide-react';

interface Particle {
  id: number;
  startX: number;
  drift: number;
  size: number;
  color: string;
  shape: 'circle' | 'rect' | 'triangle';
  delay: number;
  duration: number;
  endRotate: number;
}

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: {
    id?: string;
    testId: string;
    studentId: string;
    studentName: string;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    submitTime?: string;
    startTime?: string;
  };
  test: {
    id: string;
    title: string;
    type: string;
    subject: string;
    answerKey: Record<number, string>;
  } | null;
  onViewAnalysis: () => void;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  attempt, 
  test, 
  onViewAnalysis 
}: CelebrationModalProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeStar, setActiveStar] = useState(0);

  // Generate 80 randomized confetti particles
  useEffect(() => {
    if (isOpen) {
      const colors = [
        '#34d399', // Emerald 400
        '#60a5fa', // Blue 400
        '#f59e0b', // Amber 500
        '#f43f5e', // Rose 500
        '#a855f7', // Purple 500
        '#ec4899', // Pink 500
        '#14b8a6', // Teal 500
        '#e11d48'  // Rose 600
      ];
      const shapes: Array<'circle' | 'rect' | 'triangle'> = ['circle', 'rect', 'triangle'];
      
      const newParticles = Array.from({ length: 85 }).map((_, i) => {
        const size = Math.random() * 10 + 6; // 6px to 16px
        return {
          id: i,
          startX: Math.random() * 100, // percentage of viewport width
          drift: (Math.random() - 0.5) * 35, // horizontal sway
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          delay: Math.random() * 3, // staggered entry
          duration: Math.random() * 3.5 + 3, // 3s to 6.5s fall time
          endRotate: Math.random() * 600 + 120 // end rotation angle
        };
      });
      setParticles(newParticles);

      // Simple animation helper for sparkle stars
      const interval = setInterval(() => {
        setActiveStar(prev => (prev + 1) % 4);
      }, 800);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalQuestions = test ? Object.keys(test.answerKey).length : 10;
  const skippedCount = totalQuestions - (attempt.correctAnswers + attempt.wrongAnswers);
  const accuracy = attempt.accuracy;

  // Real-time custom positive reinforcement titles/messages based on student evaluation
  let badgeTitle = 'Excellent Attempt! 🌟';
  let badgeStyle = 'from-indigo-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400';
  let scoreDescription = 'You have shown significant progress. Keep pushing your limits!';
  let trophyColor = 'text-amber-400';

  if (accuracy >= 90) {
    badgeTitle = 'Supreme Precision! 🏆';
    badgeStyle = 'from-emerald-500/20 to-teal-500/30 border-emerald-500/40 text-emerald-400';
    scoreDescription = 'Phenomenal job! Your understanding is absolutely pristine and flawless.';
    trophyColor = 'text-yellow-400 animate-bounce';
  } else if (accuracy >= 75) {
    badgeTitle = 'Commanding Score! ✨';
    badgeStyle = 'from-indigo-500/20 to-violet-500/20 border-violet-500/30 text-indigo-400';
    scoreDescription = 'Excellent focus and strategy! Your hard work is yield showing strong results.';
  } else if (accuracy < 50) {
    badgeTitle = 'Brave Submission! 💪';
    badgeStyle = 'from-rose-500/20 to-amber-500/20 border-rose-500/30 text-amber-400';
    scoreDescription = 'Every trial is a setup for an epic comeback. Analyze your gaps and try again!';
    trophyColor = 'text-slate-400';
  }

  // Calculate elapsed time if available
  let timeSpentString = 'N/A';
  if (attempt.startTime && attempt.submitTime) {
    const elapsedSeconds = Math.floor(
      (new Date(attempt.submitTime).getTime() - new Date(attempt.startTime).getTime()) / 1000
    );
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    timeSpentString = `${m}m ${s}s`;
  }

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-[9999] overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer"
        />

        {/* Falling Custom Confetti Rain */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -50, x: `${p.startX}vw`, rotate: 0, opacity: 1 }}
              animate={{ 
                y: '105vh', 
                x: `${p.startX + p.drift}vw`, 
                rotate: p.endRotate,
                opacity: [1, 1, 1, 0.8, 0]
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
                repeat: Infinity
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.shape === 'rect' ? p.size * 0.5 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '0',
                top: 0,
                clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>

        {/* Floating background glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Main interactive celebration card */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-20 flex flex-col max-h-[90vh]"
          id="celebration_modal_container"
        >
          {/* Header Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition z-50 cursor-pointer"
            id="close_celebration_button"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="overflow-y-auto flex-1 p-6 sm:p-8">
            
            {/* Visual Trophy & Radiating Sparks */}
            <div className="relative flex flex-col items-center justify-center mt-3 mb-6" id="success_trophy_visual">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-28 h-28 bg-emerald-400/10 rounded-full blur-xl filter animate-pulse"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Sparkles */}
              <div className="absolute w-full h-full pointer-events-none">
                <Sparkles className={`absolute h-5 w-5 text-amber-300 top-2 left-1/3 transition-all duration-300 ${activeStar === 0 ? 'scale-125 opacity-100' : 'scale-75 opacity-40'}`} />
                <Sparkles className={`absolute h-4 w-4 text-emerald-400 bottom-4 right-1/4 transition-all duration-300 ${activeStar === 1 ? 'scale-125 opacity-100' : 'scale-75 opacity-40'}`} />
                <Sparkles className={`absolute h-5 w-5 text-sky-300 top-4 right-1/3 transition-all duration-300 ${activeStar === 2 ? 'scale-125 opacity-100' : 'scale-75 opacity-40'}`} />
                <Sparkles className={`absolute h-4 w-4 text-pink-400 bottom-6 left-1/4 transition-all duration-300 ${activeStar === 3 ? 'scale-125 opacity-100' : 'scale-75 opacity-40'}`} />
              </div>

              {/* Central Trophy / Icon */}
              <motion.div 
                initial={{ scale: 0.3, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.15, stiffness: 200, damping: 15 }}
                className={`p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-lg ${trophyColor}`}
              >
                {accuracy >= 75 ? (
                  <Trophy className="h-12 w-12" />
                ) : (
                  <Award className="h-12 w-12 text-indigo-400" />
                )}
              </motion.div>

              {/* Confetti celebration message */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-5"
              >
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r border shadow-sm ${badgeStyle}`}>
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>{badgeTitle}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-2">
                  OMR Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                  {test?.title || 'Main Practice Exam'}
                </p>
              </motion.div>
            </div>

            {/* Performance Bento Grid Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6" id="bento_performance_stats">
              
              {/* Score card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-1">
                  <BookOpen className="h-3 w-3 text-slate-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-450 uppercase mb-1">
                  GRADED SCORE
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-emerald-400 flex items-baseline leading-none mt-1">
                  {attempt.score}
                  <span className="text-xs font-medium text-slate-500 ml-1">/{totalQuestions}</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  {attempt.correctAnswers} Correct answers
                </p>
              </motion.div>

              {/* Accuracy card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-1">
                  <Target className="h-3 w-3 text-slate-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-slate-450 uppercase mb-1">
                  ACCURACY INDEX
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-white flex items-baseline leading-none mt-1">
                  {accuracy}%
                </span>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  {attempt.wrongAnswers} Wrong • {skippedCount} Skipped
                </p>
              </motion.div>

              {/* Time Spent */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1"
              >
                <div className="p-2 ml-1 rounded-xl bg-slate-800 text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                    TIME ELAPSED
                  </h4>
                  <p className="text-sm font-semibold text-slate-250 mt-0.5">
                    {timeSpentString}
                  </p>
                </div>
              </motion.div>

              {/* Efficiency Increase */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 }}
                className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1"
              >
                <div className="p-2 ml-1 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                    VERDICT
                  </h4>
                  <p className="text-xs font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wide">
                    {accuracy >= 90 ? 'Mastery' : accuracy >= 60 ? 'Strong Pass' : 'Keep Practicing'}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* Motivational message banner */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-950/40 border border-slate-800/60 py-3 px-4 rounded-2xl text-center mb-6"
            >
              <p className="text-xs sm:text-sm text-slate-350 italic font-medium leading-relaxed">
                "{scoreDescription}"
              </p>
            </motion.div>

          </div>

          {/* Call to actions */}
          <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800/70 flex flex-col sm:flex-row items-stretch gap-2.5 z-10">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm tracking-wide text-slate-300 hover:text-slate-100 transition cursor-pointer"
              id="close_celebration_redirect_home"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                onViewAnalysis();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm tracking-wide text-slate-100 flex items-center justify-center gap-2 transition cursor-pointer group shadow-lg shadow-emerald-500/10"
              id="open_exam_analysis_button"
            >
              <span>Detailed Analysis</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
