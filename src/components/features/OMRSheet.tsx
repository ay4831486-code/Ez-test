import React from 'react';
import { Sparkles, Trash2, Flag, CheckCircle } from 'lucide-react';

interface OMRSheetProps {
  answers: Record<number, string>;
  onSelectAnswer: (questionNum: number, optionLetter: string) => void;
  onClearAnswer: (questionNum: number) => void;
  answerKeySize?: number;
}

const OMRRow = React.memo(function OMRRow({
  qNum,
  currentSelection,
  isFlagged,
  onToggleFlag,
  onSelectAnswer,
  onClearAnswer
}: {
  qNum: number;
  currentSelection: string;
  isFlagged: boolean;
  onToggleFlag: (qNum: number) => void;
  onSelectAnswer: (questionNum: number, optionLetter: string) => void;
  onClearAnswer: (questionNum: number) => void;
}) {
  return (
    <div 
      className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
        currentSelection 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-white border-slate-100'
      } ${isFlagged ? 'ring-1 ring-amber-500/50 border-amber-250' : ''}`}
    >
      {/* Question badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold font-mono text-slate-400 w-6">
          {String(qNum).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => onToggleFlag(qNum)}
          title={isFlagged ? "Remove from review" : "Mark to review later"}
          className="p-1 hover:bg-slate-100 rounded transition cursor-pointer"
        >
          <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'text-amber-500 fill-amber-500/30' : 'text-slate-400 hover:text-slate-600'}`} />
        </button>
      </div>

      {/* A-B-C-D options circles */}
      <div className="flex items-center gap-3">
        {['A', 'B', 'C', 'D'].map((opt) => {
          const active = currentSelection === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelectAnswer(qNum, opt)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md transform scale-110'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Reset bubble line */}
      <button
        type="button"
        disabled={!currentSelection}
        onClick={() => onClearAnswer(qNum)}
        title="Reset selection"
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

export default function OMRSheet({ 
  answers, 
  onSelectAnswer, 
  onClearAnswer, 
  answerKeySize = 10 
}: OMRSheetProps) {
  
  // High-fidelity flagged/reviews list
  const [flagged, setFlagged] = React.useState<Record<number, boolean>>({});

  const toggleFlag = React.useCallback((qNum: number) => {
    setFlagged(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  }, []);

  const selectAnswerHandler = React.useCallback((qNum: number, opt: string) => {
    onSelectAnswer(qNum, opt);
  }, [onSelectAnswer]);

  const clearAnswerHandler = React.useCallback((qNum: number) => {
    onClearAnswer(qNum);
  }, [onClearAnswer]);

  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k, 10)] !== "").length;
  const flaggedCount = Object.keys(flagged).filter(k => flagged[parseInt(k, 10)]).length;
  const unansweredCount = answerKeySize - answeredCount;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full text-slate-800">
      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
          <p className="text-[9px] uppercase tracking-wider text-emerald-700 font-semibold font-mono">Attempted</p>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{answeredCount}</div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center">
          <p className="text-[9px] uppercase tracking-wider text-rose-700 font-semibold font-mono">Unanswered</p>
          <div className="text-xl font-bold text-rose-600 mt-0.5">{unansweredCount}</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-center">
          <p className="text-[9px] uppercase tracking-wider text-indigo-700 font-semibold font-mono">Bookmarked</p>
          <div className="text-xl font-bold text-indigo-600 mt-0.5">{flaggedCount}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">Bubble Answer OMR Grid</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Auto-saves to cloud backup</span>
      </div>

      {/* Bubble interactive area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin max-h-96 w-full">
        {Array.from({ length: answerKeySize }).map((_, idx) => {
          const qNum = idx + 1;
          const currentSelection = answers[qNum] || "";
          const isFlagged = flagged[qNum] || false;

          return (
            <OMRRow
              key={qNum}
              qNum={qNum}
              currentSelection={currentSelection}
              isFlagged={isFlagged}
              onToggleFlag={toggleFlag}
              onSelectAnswer={selectAnswerHandler}
              onClearAnswer={clearAnswerHandler}
            />
          );
        })}
      </div>
    </div>
  );
}
