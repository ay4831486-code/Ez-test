import React, { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Maximize2, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  pdfName: string;
  pdfData?: string;
  testTitle?: string;
}

export default function PDFViewer({ pdfName, pdfData, testTitle = "Coaching Evaluation Exam" }: PDFViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.7));

  // Visual simulation of actual JEE/NEET Coaching Questions inside the "PDF"
  const renderPdfContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-105 pb-2 mb-4 text-center">
              <h4 className="text-xs uppercase tracking-wider text-rose-600 font-bold font-mono">EZ TEST INSTITUTE - EVALUATION BLOCK 1</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">SECTION A: SINGLE CORRECT CHOICE [QUESTIONS 1 - 4]</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.1</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">A parallel plate capacitor is charged and then disconnected from standard battery. If the plates are moved further apart:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Charge increases, potential remains constant.</div>
                  <div>(B) Potential increases, capacity decreases.</div>
                  <div>(C) Capacity increases, potential decreases.</div>
                  <div>(D) Energy stored decreases, charge stays same.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.2</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">The magnetic flux density B at a distance r from an infinitely long straight filament carrying positive direct current I varies as:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Proportional to r²</div>
                  <div>(B) Proportional to 1/r</div>
                  <div>(C) Proportional to r</div>
                  <div>(D) Proportional to 1/r²</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.3</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">A cylindrical conductor of length L and uniform cross-section resistance R is stretched to twice its initial length. The new resistance is:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) R/2</div>
                  <div>(B) 2R</div>
                  <div>(C) R</div>
                  <div>(D) 4R</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.4</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">Two point charges +4q and -q are placed r distance apart. Where is the electric potential zero along the line joining them?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) At distance r/3 from -q</div>
                  <div>(B) At distance r/5 from +4q</div>
                  <div>(C) At distance r/2 from -q</div>
                  <div>(D) Potential can never be zero except infinity</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-105 pb-2 mb-4 text-center">
              <h4 className="text-xs uppercase tracking-wider text-rose-600 font-bold font-mono">EZ TEST INSTITUTE - EVALUATION BLOCK 2</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">SECTION B: CHEMISTRY INORGANIC EQUILIBRIUM [QUESTIONS 5 - 7]</p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.5</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">Which of the following molecules has the shortest Nitrogen-Nitrogen bond length?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Nitrogen gas (N₂)</div>
                  <div>(B) Hydrazine (N₂H₄)</div>
                  <div>(C) Nitrous oxide (N₂O)</div>
                  <div>(D) Dinitrogen tetroxide (N₂O₄)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.6</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">In the standard industrial synthesis of ammonia by Haber's process, the promoter added to the Iron catalyst is:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Platinum (Pt)</div>
                  <div>(B) Molybdenum (Mo) or Al₂O₃</div>
                  <div>(C) Palladium (Pd)</div>
                  <div>(D) Cupric Chloride (CuCl₂)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.7</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">Which halogen element has the most exothermic electron gain enthalpy (electron affinity) under normal conditions?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Fluorine (F)</div>
                  <div>(B) Chlorine (Cl)</div>
                  <div>(C) Bromine (Br)</div>
                  <div>(D) Iodine (I)</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-105 pb-2 mb-4 text-center">
              <h4 className="text-xs uppercase tracking-wider text-rose-600 font-bold font-mono">EZ TEST INSTITUTE - EVALUATION BLOCK 3</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">SECTION C: MATHEMATICS CALCULUS INTEGRATION [QUESTIONS 8 - 10]</p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.8</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">Evaluate the integral bounded by x=0 to x=π/2 for standard ratio [sin(x)/(sin(x) + cos(x))] dx:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) π / 4</div>
                  <div>(B) π / 2</div>
                  <div>(C) π</div>
                  <div>(D) 0</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.9</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">If the derivative f'(x) = g(x) and g'(x) = -f(x) for all real x, and f(0) = 0, g(0) = 1, then the square [f(x)]² + [g(x)]² is equal to:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) 0</div>
                  <div>(B) 1</div>
                  <div>(C) 2</div>
                  <div>(D) Constant x²</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mr-1.5">Q.10</span>
                <span className="text-xs text-slate-805 leading-relaxed font-sans font-medium">State the order and degree of the differential equation: (d²y/dx²)³ + (dy/dx)² + sin(dy/dx) = 0:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6 font-mono text-[11px] text-slate-500">
                  <div>(A) Order 2, Degree 3</div>
                  <div>(B) Order 2, Degree Not Defined</div>
                  <div>(C) Order 1, Degree 2</div>
                  <div>(D) Degree 1, Order Not Defined</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl flex flex-col h-full shadow-sm overflow-hidden text-slate-800">
      {/* Control bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between text-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-rose-500 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 truncate max-w-[200px] md:max-w-xs">{pdfName}</h4>
            <p className="text-[10px] text-slate-500 truncate font-semibold">{testTitle}</p>
          </div>
        </div>

        {/* Navigation & zoom buttons */}
        <div className="flex items-center gap-4">
          {/* Zoom Level */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <button 
              type="button" 
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono font-semibold w-9 text-slate-700 text-center select-none">{Math.round(zoom * 100)}%</span>
            <button 
              type="button" 
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] text-slate-600 font-mono font-semibold select-none">
              Pg {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet canvas scrollarea */}
      <div className="flex-1 overflow-auto p-3 sm:p-5 bg-slate-100/40 relative">
        {pdfData === 'MOCK_RESTRICTED' ? (
          <div className="bg-white border border-slate-200 p-6 shadow-md rounded-xl mx-auto max-w-3xl text-center py-20 text-slate-500">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-2 mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-slate-600">Secure Lockout Enabled</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">PDF Question sheet is locked. Return to active timings.</p>
          </div>
        ) : pdfData && (pdfData.startsWith('data:application/pdf') || pdfData.startsWith('http') || pdfData.length > 500) ? (
          <div className="w-full h-full min-h-[400px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <iframe 
              src={pdfData} 
              className="w-full flex-grow h-[550px] border-0" 
              title={pdfName}
            />
          </div>
        ) : (
          <div 
            className="bg-white border border-slate-200/80 p-6 shadow-md rounded-xl mx-auto origin-top transition-transform duration-200 max-w-3xl"
            style={{ transform: `scale(${zoom})`, minHeight: '400px' }}
          >
            {renderPdfContent()}
          </div>
        )}
      </div>
    </div>
  );
}
