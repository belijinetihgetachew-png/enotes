import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  Download,
  CreditCard,
  Share2,
  Bookmark,
  Edit3,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  Gift,
  Users,
  Bell,
  Settings,
  Copy,
  Check,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import {
  StudentProfile,
  Material,
  PaymentRequest,
  Purchase,
  GradeLevel,
  PointTransaction,
  ReferralRecord,
  AppNotification,
} from '../types.ts';
import { api } from '../lib/api.ts';

interface ProfileViewProps {
  student: StudentProfile;
  materials: Material[];
  onOpenMaterial: (material: Material) => void;
  onDownloadMaterial: (material: Material) => void;
  onProfileUpdated: (updated: StudentProfile) => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onNavigateRewards?: () => void;
}

type ProfileSubTab =
  | 'purchases'
  | 'downloads'
  | 'payments'
  | 'rewards'
  | 'referrals'
  | 'notifications'
  | 'saved'
  | 'settings';

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  materials,
  onOpenMaterial,
  onDownloadMaterial,
  onProfileUpdated,
  onLogout,
  onOpenUpload,
  onNavigateRewards,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('purchases');

  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.fullName);
  const [editPhone, setEditPhone] = useState(student.phone);
  const [editGrade, setEditGrade] = useState<GradeLevel>(student.grade);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAllStudentData();
  }, [student.id]);

  const loadAllStudentData = async () => {
    try {
      const [payData, dlData, ptData, refData, notifData] = await Promise.all([
        api.getMyPayments(student.id).catch(() => ({ payments: [], purchases: [] })),
        api.getMyDownloads(student.id).catch(() => ({ downloads: [] })),
        api.getMyPoints(student.id).catch(() => ({ currentPoints: student.points, transactions: [] })),
        api.getMyReferrals(student.id).catch(() => ({
          referrals: [],
          referralLink: `${window.location.origin}?ref=${student.referralCode}`,
        })),
        api.getNotifications(student.id).catch(() => ({ notifications: [] })),
      ]);

      setPaymentHistory(payData.payments || []);
      setPurchases(payData.purchases || []);
      setDownloads(dlData.downloads || []);
      setPointTransactions(ptData.transactions || []);
      setReferrals(refData.referrals || []);
      setReferralLink(refData.referralLink || `${window.location.origin}?ref=${student.referralCode}`);
      setNotifications(notifData.notifications || []);
    } catch (e) {
      console.error('Error loading student profile details:', e);
    }
  };

  const handleCopyReferral = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile(student.id, {
        fullName: editName,
        phone: editPhone,
        grade: editGrade,
      });
      onProfileUpdated(res.student);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const savedMaterials = materials.filter((m) =>
    (student.savedMaterialIds || []).includes(m.id)
  );

  const subTabs = [
    { id: 'purchases', label: 'Purchased Materials', icon: ShoppingBag, count: purchases.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: downloads.length },
    { id: 'payments', label: 'Payment History', icon: CreditCard, count: paymentHistory.length },
    { id: 'rewards', label: 'Points & Rewards', icon: Gift, count: student.points },
    { id: 'referrals', label: 'Referrals', icon: Users, count: referrals.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(n => !n.read).length },
    { id: 'saved', label: 'Saved Notes', icon: Bookmark, count: savedMaterials.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={
                  student.profilePhoto ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                    student.fullName
                  )}`
                }
                alt={student.fullName}
                className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-600 p-0.5 object-cover shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-600 text-white rounded-md uppercase">
                {student.grade}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {student.fullName}
                </h2>
                {student.role === 'admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-700 rounded-md">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Points & Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-center">
          <div
            onClick={() => setActiveSubTab('rewards')}
            className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:bg-amber-100/60 transition"
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase block">⭐ Points</span>
            <span className="text-base font-black text-amber-950">⭐ {student.points}</span>
          </div>
          <div
            onClick={() => setActiveSubTab('purchases')}
            className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100/60 transition"
          >
            <span className="text-[10px] font-bold text-blue-700 uppercase block">📚 Purchased</span>
            <span className="text-base font-black text-blue-950">{purchases.length}</span>
          </div>
          <div
            onClick={() => setActiveSubTab('referrals')}
            className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100 cursor-pointer hover:bg-indigo-100/60 transition"
          >
            <span className="text-[10px] font-bold text-indigo-700 uppercase block">🔗 Ref Code</span>
            <span className="text-xs font-mono font-black text-indigo-900 mt-1 block">
              {student.referralCode}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
            <button
              onClick={onOpenUpload}
              className="w-full h-full flex flex-col items-center justify-center text-emerald-800 hover:text-emerald-950"
            >
              <span className="text-[10px] font-bold uppercase flex items-center gap-0.5">
                <UploadCloud className="w-3 h-3" />
                Upload Note
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700 mt-0.5">+50 pts</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-tabs Navigation Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-slate-100 no-scrollbar">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as ProfileSubTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Purchased Materials */}
        {activeSubTab === 'purchases' && (
          <div className="mt-4">
            {purchases.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No purchased materials yet</p>
                <p className="mt-1">Explore our curriculum notes, submit a Telebirr payment, or redeem free chapters using your points!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {purchases.map((p) => {
                  const mat = materials.find((m) => m.id === p.materialId);
                  const isPointsRedeemed = p.method === 'POINTS' || p.id.startsWith('purch-pts-');
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {isPointsRedeemed ? (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 rounded-md uppercase flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>UNLOCKED WITH POINTS</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md uppercase">
                              VERIFIED TELEBIRR
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-slate-900">{p.materialTitle}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {isPointsRedeemed
                            ? `Unlocked on ${new Date(p.purchasedAt).toLocaleDateString()} via Reward Points`
                            : `Purchased on ${new Date(p.purchasedAt).toLocaleDateString()} • ${p.price} Birr`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {mat && (
                          <button
                            onClick={() => onOpenMaterial(mat)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
                          >
                            Open Note
                          </button>
                        )}
                        {mat && (
                          <button
                            onClick={() => onDownloadMaterial(mat)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Downloads History */}
        {activeSubTab === 'downloads' && (
          <div className="mt-4">
            {downloads.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <Download className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No downloads recorded yet</p>
                <p className="mt-1">When you download free or purchased curriculum notes, they will appear here for quick access.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {downloads.map((dl) => {
                  const mat = materials.find((m) => m.id === dl.materialId);
                  return (
                    <div key={dl.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-900">{dl.materialTitle}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Downloaded on {new Date(dl.downloadedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {mat && (
                          <button
                            onClick={() => onDownloadMaterial(mat)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Re-download</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment History */}
        {activeSubTab === 'payments' && (
          <div className="mt-4">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Telebirr payments recorded</p>
                <p className="mt-1">All Telebirr transactions and verification statuses are listed here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paymentHistory.map((pay) => (
                  <div key={pay.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{pay.materialTitle}</h4>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase ${
                            pay.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pay.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>Telebirr: {pay.telebirrNumber}</span>
                        <span>•</span>
                        <span>Tx: <strong className="font-mono text-slate-800">{pay.transactionNumber}</strong></span>
                        <span>•</span>
                        <span>{new Date(pay.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {pay.reviewNote && (
                        <div className="text-[10px] text-rose-600 mt-1 italic">
                          Admin Note: {pay.reviewNote}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-slate-900">{pay.price} Birr</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Points & Rewards */}
        {activeSubTab === 'rewards' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-800">My Rewards Balance</span>
                <div className="text-2xl font-black text-amber-950 flex items-center gap-1.5 mt-0.5">
                  ⭐ {student.points} Points
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Use 100 points to unlock any paid curriculum chapter completely free!
                </p>
              </div>
              {onNavigateRewards && (
                <button
                  onClick={onNavigateRewards}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 shrink-0"
                >
                  Redeem Free Chapter
                </button>
              )}
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Points Activity Log
              </h4>
              {pointTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No points activity recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pointTransactions.map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{tx.description}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`font-black ${
                          tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Referrals */}
        {activeSubTab === 'referrals' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Your Referral Program</span>
              <h3 className="text-base font-extrabold text-indigo-950 mt-0.5">Invite Classmates & Earn Points</h3>
              <p className="text-xs text-indigo-800/80 mt-1">
                Share your referral link. When a classmate signs up, you both receive 20 reward points!
              </p>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl font-mono text-slate-700"
                />
                <button
                  onClick={handleCopyReferral}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Friends You Invited ({referrals.length})
              </h4>
              {referrals.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No friends registered with your link yet. Share your code to earn free chapters!
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{ref.refereeName}</div>
                        <div className="text-[10px] text-slate-400">
                          Joined on {new Date(ref.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-600">+{ref.rewardPoints} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Notifications */}
        {activeSubTab === 'notifications' && (
          <div className="mt-4">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Saved Materials */}
        {activeSubTab === 'saved' && (
          <div className="mt-4">
            {savedMaterials.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No saved materials</p>
                <p className="mt-1">Bookmark chapters and study sheets across the app to review them later!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedMaterials.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">
                        {m.grade} • {m.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    </div>
                    <button
                      onClick={() => onOpenMaterial(m)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Study
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Settings */}
        {activeSubTab === 'settings' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase">Account Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-800">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-bold text-slate-800">{student.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-bold text-slate-800">{student.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Grade</span>
                  <span className="font-bold text-slate-800">{student.grade}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Information</span>
                </button>
              </div>
            </div>

            {/* Official Community Channels */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase mb-2">
                Official Ethiopian Study Channels
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                <a
                  href="https://t.me/Ethio_note0"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram: @Ethio_note0</span>
                </a>
                <a
                  href="https://www.tiktok.com/@ethio.s_note"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition"
                >
                  <span>TikTok: @ethio.s_note</span>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-5 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">Edit Student Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
