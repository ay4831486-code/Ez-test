import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Users, Clock, Award, ChevronRight, Layers, Search, Plus, Sparkles, Bell, ShieldAlert, CheckCircle, LogOut, ArrowRight, Lock, User, BookOpenCheck, ClipboardList, Flame, LineChart, Brain, History, X, Menu, FileCheck, AlertCircle, FileText, Image as ImageIcon, Upload
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import EzTestIcon from '../common/EzTestIcon';

export default function AuthPortal() {
  const { userType, setUserType, currUser, setCurrUser, db, setDb, activeTab, setActiveTab, adminSubTab, setAdminSubTab, searchQuery, setSearchQuery, dbLoading, setDbLoading, errorMessage, setErrorMessage, loginUsername, setLoginUsername, loginPassword, setLoginPassword, authTab, setAuthTab, regName, setRegName, regMobile, setRegMobile, regClass, setRegClass, regBatch, setRegBatch, regRoll, setRegRoll, regPassword, setRegPassword, regSuccessMsg, setRegSuccessMsg, showDemoCreds, setShowDemoCreds, handleLoginSubmit, handleRegisterSubmit } = useAppContext();

  return (
    <>
      {/* ===================================
          GORGEOUS LOGGED-OUT PORTAL (LOGIN/REGISTER)
         =================================== */}
      {!userType ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50">
          
          {/* Logo Column */}
          <div className="text-center mb-6 relative select-none">
            <EzTestIcon size="xl" className="mx-auto mb-4 scale-105" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              EZ <span className="text-blue-600">TEST</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto font-medium">
              Class 9th to 12th Coaching Evaluation Platform
            </p>
          </div>

          {/* Clean Portal Container Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl max-w-md w-full relative z-10 text-slate-800">

            {/* Nav Switch */}
            <div className="flex border-b border-slate-100 pb-3 mb-6">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setErrorMessage(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold transition cursor-pointer ${authTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign In Portal
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setErrorMessage(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold transition cursor-pointer ${authTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Student Admission
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex gap-2 items-center mb-4 leading-relaxed">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {regSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-650 text-xs flex gap-2 items-center mb-4 leading-relaxed">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{regSuccessMsg}</span>
              </div>
            )}

            {/* TAB 1: CONNECT TO LOG IN SCREEN */}
            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Mobile Number or Student ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                      placeholder="e.g. 9987654321 or student ID"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1.5 font-bold">Secure Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer mt-6 shadow-lg shadow-slate-900/15 active:scale-98"
                >
                  Access Platform <ArrowRight className="h-4 w-4" />
                </button>
              </form>
      
      ) : (
              /* TAB 2: REGISTER DEMO FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 font-bold">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                    placeholder="e.g. Rohan Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 font-bold">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                      placeholder="9876543210"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 font-bold">Roll Number</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                      placeholder="e.g. 21"
                      value={regRoll}
                      onChange={(e) => setRegRoll(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 font-bold">Academic Class</label>
                    <select
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-505 mb-1 font-bold">Batch Year</label>
                    <select
                      className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={regBatch}
                      onChange={(e) => setRegBatch(e.target.value)}
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2026-2027">2026-2027</option>
                      <option value="2027-2028">2027-2028</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-505 mb-1 font-bold font-sans">Choose Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 text-slate-800 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer mt-6 shadow-lg shadow-slate-900/10 active:scale-98"
                >
                  Submit Admission Request
                </button>
              </form>
            )}

          </div>
        </div>
      ) : null}
    </>
  );
}