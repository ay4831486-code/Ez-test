import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Minimize2,
  Move
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface QuestionImagesViewerProps {
  images: string[];
  testTitle?: string;
}

export default function QuestionImagesViewer({ images, testTitle }: QuestionImagesViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 font-sans border-b border-slate-900 lg:border-b-0 lg:border-r">
        <p className="text-slate-400 text-sm font-medium">No question images have been uploaded for this exam.</p>
        <p className="text-slate-600 text-xs mt-1">Please ask your Principal Admin to update the test papers.</p>
      </div>
    );
  }

  const handleNext = () => {
    if (currentPage < images.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const activeImage = images[currentPage];

  return (
    <div className={`flex flex-col flex-1 h-full select-none bg-slate-950 font-sans border-b border-slate-900 lg:border-b-0 lg:border-r overflow-hidden ${isFullscreen ? 'absolute inset-0 z-[60] bg-black/95' : 'relative'}`}>
      
      {/* Title & Stats HUD */}
      <div className="flex bg-slate-900/95 border-b border-slate-800 text-slate-200 px-4 py-2.5 items-center justify-between z-10 shrink-0 font-sans">
        <div className="truncate pr-4">
          <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-indigo-400">Question Paper Sheet</span>
          <h4 className="text-xs font-semibold truncate text-slate-100 mt-0.5">{testTitle || "Exam Paper Pages"}</h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Page Counter badge */}
          <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 text-slate-300 font-bold">
            Pg {currentPage + 1} of {images.length}
          </span>
        </div>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ wheelDisabled: false }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: false, step: 0.5 }}
      >
        {({ zoomIn, zoomOut, resetTransform, state }) => (
          <>
            {/* Main Image Viewport Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center min-h-0 bg-slate-950 touch-none">
              <div className="absolute inset-0 bg-radial-gradient from-indigo-950/5 to-transparent pointer-events-none" />
              
              {/* Render Image with dynamic transformations */}
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-200 touch-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <TransformComponent wrapperClass="!w-full !h-full flex items-center justify-center touch-none" contentClass="!w-full !h-full flex items-center justify-center touch-none">
                  <img 
                    src={activeImage} 
                    referrerPolicy="no-referrer"
                    className="max-w-[100vw] lg:max-w-[90vw] max-h-[80vh] lg:max-h-[72vh] xl:max-h-[78vh] object-contain select-none cursor-grab active:cursor-grabbing border-slate-850 shadow-2xl relative z-10 touch-none"
                    alt={`Question paper page ${currentPage + 1}`}
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/icon-512.png';
                    }}
                  />
                </TransformComponent>
              </div>

              {/* Floating Left Page Trigger */}
              {currentPage > 0 && (
                <button 
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-800 shadow-md transition-all active:scale-90 cursor-pointer z-20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Floating Right Page Trigger */}
              {currentPage < images.length - 1 && (
                <button 
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-800 shadow-md transition-all active:scale-90 cursor-pointer z-20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Floating Bottom Navigation & Controls Dock bar */}
            <div className="bg-slate-900/90 border-t border-slate-850 p-2.5 flex items-center justify-between shrink-0 select-none px-4 z-10 relative">
              
              {/* Navigation Indicators */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  className="p-1 px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold font-mono transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5 cursor-pointer"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage === images.length - 1}
                  className="p-1 px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold font-mono transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5 cursor-pointer"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Zoom & Rotation dock */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden sm:flex px-2 py-1 items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[9px] text-slate-400 font-mono mr-1">
                  <Move className="w-3 h-3 text-slate-500" />
                  <span>Pan & Zoom</span>
                </div>

                {/* Zoom Out Button */}
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  title="Zoom Out"
                  className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  title="Reset Transformations"
                  className="px-2.5 py-1 text-[9px] font-mono bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 transition cursor-pointer flex flex-col items-center justify-center min-w-[44px]"
                >
                  <span>{Math.round(state.scale * 100)}%</span>
                </button>

                {/* Zoom In Button */}
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  title="Zoom In"
                  className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                {/* Rotate Board Button */}
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title="Rotate Questions"
                  className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>

                {/* Full Quality Modal Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Lens View"}
                  className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-rose-450" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>

            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
