import React, { useState } from 'react';
import {
  Bell,
  Search,
  MessageCircle,
  Shield,
  GraduationCap,
  ChevronDown,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  LogOut,
  User,
} from 'lucide-react';
import { StudentProfile, GradeLevel, AppNotification } from '../types.ts';

interface HeaderProps {
  student: StudentProfile | null;
  currentGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  onOpenSearch: () => void;
  onOpenContact: () => void;
  onOpenProfile: () => void;
  onToggleAdmin: () => void;
  isAdminMode: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkNotificationsRead: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  currentGrade,
  onGradeChange,
  onOpenSearch,
  onOpenContact,
  onOpenProfile,
  onToggleAdmin,
  isAdminMode,
  notifications,
  unreadCount,
  onMarkNotificationsRead,
  onLogout,
}) => {
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const grades: GradeLevel[] = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <span className="text-xl select-none">📚</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                eNotes<span className="text-blue-600">.et</span>
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                ETHIOPIA
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">
              Grade 9–12 Educational App
            </p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Grade Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowGradeMenu(!showGradeMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200/80 transition active:scale-95"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentGrade}</span>
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {showGradeMenu && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/10"
                  onClick={() => setShowGradeMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Grade
                  </div>
                  {grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => {
                        onGradeChange(grade);
                        setShowGradeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition ${
                        currentGrade === grade
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{grade}</span>
                      {currentGrade === grade && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition active:scale-95"
            title="Search Notes & Materials"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Contact Support */}
          <button
            onClick={onOpenContact}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition active:scale-95 relative"
            title="Telegram & TikTok Support"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition active:scale-95 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/15"
                  onClick={() => setShowNotifs(false)}
                />
                <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Notifications
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-left transition hover:bg-slate-50 ${
                            !n.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'payment'
                                  ? 'bg-blue-100 text-blue-700'
                                  : n.type === 'points'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {n.type === 'payment' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : n.type === 'points' ? (
                                <Sparkles className="w-3.5 h-3.5" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                {n.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1.5 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin Switcher / Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isAdminMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Switch to Admin Approval & Content Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminMode ? 'Exit Admin' : 'Admin'}</span>
          </button>

          {/* Profile / Points pill */}
          {student && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition active:scale-95"
              title="My Points & Account"
            >
              <span className="text-xs">⭐</span>
              <span className="text-xs font-extrabold text-amber-900">{student.points}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
