import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Send, 
  Check, 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Users,
  ChevronDown
} from 'lucide-react';
import { DatabaseState, Student, Notification } from '../../types';

interface NotificationDockProps {
  db: DatabaseState;
  currUser: any;
  userType: 'admin' | 'student' | null;
  onMarkAllRead: () => Promise<void>;
  onSendNotification: (title: string, message: string, type: 'system' | 'result' | 'reminder' | 'announcement', recipientId: string) => Promise<void>;
}

export default function NotificationDock({ 
  db, 
  currUser, 
  userType, 
  onMarkAllRead, 
  onSendNotification 
}: NotificationDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  // Form states for Admin sending notifications
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'system' | 'reminder' | 'announcement'>('announcement');
  const [notifRecipient, setNotifRecipient] = useState<string>('all');
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Filter notifications based on actual user
  const notifications = db?.notifications || [];
  const filteredNotifications = notifications.filter(n => {
    if (userType === 'admin') return true; // Admins see all logs
    const studentId = currUser?.studentId;
    const classVal = currUser?.classVal;
    return n.recipientId === 'all' || n.recipientId === studentId || (classVal && n.recipientId === classVal);
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  // Sound chime state or automatic toast on new notifications since opening browser
  const [toastNotif, setToastNotif] = useState<Notification | null>(null);
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    // If unread count increases, show a sleek toast notification
    if (unreadCount > prevCountRef.current && unreadCount > 0) {
      const newest = unreadNotifications[0];
      if (newest) {
        setToastNotif(newest);
        // Play soft synthetic chime if allowed
        try {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.08, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(context.destination);
          osc.start();
          osc.stop(context.currentTime + 0.5);
        } catch (_) {}

        // Hide toast after 4s
        const t = setTimeout(() => setToastNotif(null), 4000);
        return () => clearTimeout(t);
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Click outside listener to keep interface clean
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAll = async () => {
    await onMarkAllRead();
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setIsSending(true);
    try {
      await onSendNotification(notifTitle, notifMessage, notifType, notifRecipient);
      setNotifTitle('');
      setNotifMessage('');
      setShowSendForm(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <Info className="h-3.5 w-3.5 text-indigo-400" />;
      case 'result':
        return <Check className="h-3.5 w-3.5 text-emerald-400" />;
      case 'reminder':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Megaphone className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  const approvedStudents = db?.students?.filter(s => s.status === 'Approved') || [];

  return (
    <div className="relative font-sans" ref={dockRef}>
      {/* Absolute floating in-app notification Toast (Banner) */}
      {toastNotif && (
        <div className="absolute top-4 right-4 z-50 animate-bounce max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex gap-3.5 items-start text-slate-100 backdrop-blur-md">
          <div className="p-2 bg-indigo-500/20 rounded-xl mt-0.5">
            <Bell className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">New Dynamic update</p>
            <h5 className="text-xs font-bold font-sans mt-0.5 text-white truncate">{toastNotif.title}</h5>
            <p className="text-[11px] text-slate-350 mt-1 leading-relaxed line-clamp-2">{toastNotif.message}</p>
          </div>
          <button 
            onClick={() => setToastNotif(null)}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Trigger Bell Icon with pulsing indicator */}
      <button
        type="button"
        id="noti-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition duration-150 text-slate-300 hover:text-white focus:outline-none flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
        title="In-App Notifications Board"
      >
        <Bell className={`h-4.5 w-4.5 ${unreadCount > 0 ? 'animate-wiggle text-amber-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 font-bold font-mono text-[9px] text-white h-4.5 px-1.5 min-w-4.5 flex items-center justify-center rounded-full scale-95 ring-2 ring-slate-950 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Flyout panel */}
      {isOpen && (
        <div 
          id="noti-flyout"
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl z-50 py-3.5 flex flex-col font-sans backdrop-blur-lg select-text text-left max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-850 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Notifications Feed
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{unreadCount} actionable alerts unread</p>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300 transition rounded-md hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Success action banner */}
          {successToast && (
            <div className="mx-3.5 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] text-center font-bold font-mono">
              Notification successfully broadcasted to student app channels!
            </div>
          )}

          {/* Admin Composer Panel */}
          {userType === 'admin' && (
            <div className="px-3.5 py-2.5 border-b border-slate-850 bg-slate-900/30">
              <button
                type="button"
                onClick={() => setShowSendForm(!showSendForm)}
                className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                <Send className="h-3 w-3 text-indigo-400" />
                {showSendForm ? "Minimize Compose Portal" : "Send Official Notification"}
              </button>

              {showSendForm && (
                <form onSubmit={handleCreateNotification} className="mt-3 space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-850 animate-fade-in text-left">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Target Audience</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-sans text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={notifRecipient}
                      onChange={(e) => setNotifRecipient(e.target.value)}
                    >
                      <option value="all">All Registered Students</option>
                      <optgroup label="Entire Class">
                        <option value="Class 9">Class 9 Students</option>
                        <option value="Class 10">Class 10 Students</option>
                        <option value="Class 11">Class 11 Students</option>
                        <option value="Class 12">Class 12 Students</option>
                      </optgroup>
                      <optgroup label="Individual Student">
                        {approvedStudents.map(student => (
                          <option key={student.id} value={student.studentId}>
                            {student.name} ({student.studentId || 'No ID'} - {student.classVal})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Alert Category</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-sans text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value as any)}
                      >
                        <option value="announcement">Announcement</option>
                        <option value="reminder">Reminder Info</option>
                        <option value="system">System Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Alert Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Test Cancelled"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-sans text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Message Body</label>
                    <textarea
                      required
                      placeholder="Enter detailed description rules..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-[10px] font-sans text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" />
                    {isSending ? "Publishing Alert..." : "Broadcast Real-time Notification"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* List Component Body */}
          <div className="flex-1 overflow-y-auto max-h-64 sm:max-h-80 select-text px-3.5 space-y-2.5 mt-2 pr-1.5 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-10">
                <span className="block text-slate-500 text-[11px] font-medium">No system notifications published yet.</span>
                <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Students will be pinged instantly for live calendar events, alerts, and scorecard publications.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-xl border transition-all text-left ${
                    !n.read 
                      ? 'bg-slate-900/60 border-slate-800 ring-1 ring-indigo-500/10' 
                      : 'bg-slate-950/20 border-slate-900/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg mt-0.5 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-slate-200 truncate">{n.title}</h4>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed leading-sans">{n.message}</p>
                      
                      {userType === 'admin' && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[8px] font-mono tracking-wider font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                            To: {n.recipientId === 'all' ? 'All' : n.recipientId}
                          </span>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600">
                            {n.read ? 'Opened' : 'Unread'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
