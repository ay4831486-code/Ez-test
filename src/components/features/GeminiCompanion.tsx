import React, { useState, useRef } from 'react';
import { Send, Sparkles, Image, Clipboard, Trash, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface GeminiCompanionProps {
  studentClass?: string;
  studentName?: string;
}

const SAMPLE_DIAGRAMS = [
  {
    name: "Electrostatic Circuit (PDF Page 1)",
    prompt: "Analyze the attached capacitor diagram. If C1 = 10uF, C2 = 20uF and they are connected in series with a 12V battery, calculate exact charge stored.",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // simple 1x1 png base64
  },
  {
    name: "Chemistry Equation Problem",
    prompt: "Review this organic chemical reaction. Balance the equation, name the catalysts, and identify the correct option if Option A suggests an exothermic reaction.",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  },
  {
    name: "Math Limit Theorem Doubt",
    prompt: "Integrate standard limit (x -> 0) for sin(x)/x. Outline step-by-step why the limit is 1 using L'Hopital's rule.",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  }
];

export default function GeminiCompanion({ studentClass = "Class 12", studentName = "Student" }: GeminiCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hello ${studentName}! I am your automated academic solver. Upload a screenshot, select a diagram, or ask about OMR question layouts. I can break down Physics mechanics, Organic Chemistry, or Calculus limits step-by-step using first principles. How can I guide you today?` }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [highThinking, setHighThinking] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/png");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToEnd = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Maximum image upload size is 4MB. Select a smaller picture.");
        return;
      }
      setImageName(file.name);
      setImageMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // strip prefix
        const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");
        setSelectedImage(cleanBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const attachSample = (sample: typeof SAMPLE_DIAGRAMS[0]) => {
    setSelectedImage(sample.base64);
    setImageName(sample.name);
    setInputMsg(sample.prompt);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !selectedImage) return;

    const userText = inputMsg;
    setInputMsg("");
    setLoading(true);

    const updatedMessages = [...messages, { role: 'user', content: userText } as Message];
    setMessages(updatedMessages);
    scrollToEnd();

    try {
      // If there's an image, query visual explanation endpoint first, otherwise handle standard chat
      let endpoint = "/api/gemini/chat";
      let body: any = {
        messages: updatedMessages,
        userContext: { name: studentName, classVal: studentClass },
        highThinking
      };

      if (selectedImage) {
        endpoint = "/api/gemini/explain";
        body = {
          questionText: userText || "Analyze this academic problem in detail.",
          imageBase64: selectedImage,
          mimeType: imageMime
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: `Evaluator limit reached or API Key error: ${data.error || 'Check Settings'}` }]);
      }
      clearImage();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Network error occurred connecting with Gemini solver. Ensure process.env.GEMINI_API_KEY is available in platform configuration." }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col h-full font-sans">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">AI Doubt Solver</h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-0.5">EZ TEST Assistant</p>
          </div>
        </div>
        
        {/* Thinking mode toggle */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
          <span className="text-[10px] font-bold tracking-wider text-slate-600">DEEP THINKING</span>
          <button 
            type="button"
            onClick={() => setHighThinking(!highThinking)}
            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${highThinking ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${highThinking ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Helper quick select diagrams */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <HelpCircle className="h-3 w-3" /> Quick Try:
        </span>
        {SAMPLE_DIAGRAMS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => attachSample(sample)}
            className="text-[10px] font-bold tracking-tight text-slate-700 hover:text-blue-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 transition cursor-pointer select-none shrink-0"
          >
            {sample.name}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line prose max-w-none text-[13px] leading-relaxed">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 shadow-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] flex items-center gap-2.5">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-xs font-bold tracking-tight">Solving directly...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Image Preview attachment */}
      {selectedImage && (
        <div className="mx-4 mb-2 p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-xs text-blue-700 min-w-0 font-bold">
            <Image className="h-4 w-4 shrink-0" />
            <span className="truncate">{imageName || "Attached_Diagram.png"}</span>
          </div>
          <button 
            type="button" 
            onClick={clearImage}
            className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-bold p-1"
          >
            <Trash className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      )}

      {/* Input controls */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0 pb-safe">
        <input 
          type="file" 
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden" 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Question image"
          className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0 h-11 w-11"
        >
          <Image className="h-5 w-5" />
        </button>

        <textarea
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={selectedImage ? "Ask something about this image..." : "Ask your doubt..."}
          className="flex-1 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder-slate-400 resize-none min-h-[44px] max-h-32"
          rows={Math.max(1, Math.min(4, inputMsg.split('\n').length))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />

        <button
          type="submit"
          disabled={loading || (!inputMsg.trim() && !selectedImage)}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 h-11 w-11"
        >
          <Send className="h-5 w-5 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
