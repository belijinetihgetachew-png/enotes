import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  BookOpen,
  Users,
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  Send,
  AlertCircle,
  Sparkles,
  Search,
  UploadCloud,
  Gift,
  Award,
  ArrowRight,
  UserCheck,
  TrendingUp,
  FileText,
  CreditCard,
  Tag,
} from 'lucide-react';
import {
  PaymentRequest,
  Material,
  UploadedMaterialRequest,
  StudentProfile,
  AdminSettings,
  GradeLevel,
  SubjectName,
  MaterialType,
  PointTransaction,
  ReferralRecord,
} from '../types.ts';
import { api } from '../lib/api.ts';

interface AdminDashboardProps {
  adminStudent: StudentProfile;
  onClose: () => void;
  onDataChanged: () => void;
}

type AdminSectionTab =
  | 'overview'
  | 'students'
  | 'materials'
  | 'payments'
  | 'points'
  | 'rewards'
  | 'referrals'
  | 'uploads'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminStudent,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSectionTab>('overview');

  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploads, setUploads] = useState<UploadedMaterialRequest[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [totalCirculatingPoints, setTotalCirculatingPoints] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // New Material Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('Grade 9');
  const [newSubject, setNewSubject] = useState<SubjectName>('Mathematics');
  const [newUnit, setNewUnit] = useState('Unit 1');
  const [newType, setNewType] = useState<MaterialType>('Notes');
  const [newPrice, setNewPrice] = useState<number>(10);
  const [newContent, setNewContent] = useState('');

  // Editing price inline
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<number>(0);

  // Manual point adjust form
  const [selectedStudentForPoints, setSelectedStudentForPoints] = useState('');
  const [pointAdjustAmount, setPointAdjustAmount] = useState<number>(50);
  const [pointAdjustReason, setPointAdjustReason] = useState('');
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [payRes, matRes, upRes, setRes, studRes, ptsRes, refRes] = await Promise.all([
        api.admin.getPayments(adminStudent.id),
        api.admin.getMaterials(adminStudent.id),
        api.admin.getUploads(adminStudent.id),
        api.admin.getSettings(),
        api.admin.getStudents(adminStudent.id),
        api.admin.getPoints(adminStudent.id).catch(() => ({ transactions: [], totalCirculating: 0 })),
        api.admin.getReferrals(adminStudent.id).catch(() => ({ referrals: [] })),
      ]);
      setPayments(payRes.payments);
      setMaterials(matRes.materials);
      setUploads(upRes.uploads);
      setSettings(setRes.settings);
      setStudents(studRes.students);
      setPointTransactions(ptsRes.transactions || []);
      setTotalCirculatingPoints(ptsRes.totalCirculating || 0);
      setReferrals(refRes.referrals || []);
      if (studRes.students.length > 0 && !selectedStudentForPoints) {
        setSelectedStudentForPoints(studRes.students[0].id);
      }
    } catch (err: any) {
      console.error(err);
      showNotice('Failed to load admin records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Payment Approval / Rejection
  const handleApprovePayment = async (paymentId: string) => {
    try {
      await api.admin.approvePayment(adminStudent.id, paymentId);
      showNotice('Payment approved! Note unlocked for student.');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice(e.message || 'Approval failed', 'error');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const reason = window.prompt('Enter rejection reason (or leave empty):', 'Invalid Telebirr transaction number');
    if (reason === null) return;

    try {
      await api.admin.rejectPayment(adminStudent.id, paymentId, reason);
      showNotice('Payment rejected.');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice(e.message || 'Rejection failed', 'error');
    }
  };

  // Inline Price change (Requirement 7 & 18: change 10 -> 15, 15 -> 0, 0 -> 10 without code edit)
  const handleSavePrice = async (materialId: string) => {
    try {
      await api.admin.updateMaterialPrice(adminStudent.id, materialId, Number(editingPriceVal));
      showNotice('Material price updated successfully!');
      setEditingPriceId(null);
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice(e.message || 'Price update failed', 'error');
    }
  };

  // Publish / Unpublish
  const handleTogglePublish = async (materialId: string) => {
    try {
      await api.admin.togglePublish(adminStudent.id, materialId);
      showNotice('Material status updated.');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice('Failed to toggle status', 'error');
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to delete this educational material?')) return;
    try {
      await api.admin.deleteMaterial(adminStudent.id, materialId);
      showNotice('Material deleted.');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice('Delete failed', 'error');
    }
  };

  // Student Upload Approval / Rejection
  const handleApproveUpload = async (uploadId: string) => {
    try {
      await api.admin.approveUpload(adminStudent.id, uploadId);
      const bonusPts = settings?.contributionRewardPoints || 50;
      showNotice(`Student material approved and published! +${bonusPts} points awarded.`);
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice('Approval failed', 'error');
    }
  };

  const handleRejectUpload = async (uploadId: string) => {
    try {
      await api.admin.rejectUpload(adminStudent.id, uploadId);
      showNotice('Upload submission rejected.');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice('Action failed', 'error');
    }
  };

  // Manual Points Adjustment
  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPoints) return;
    setIsAdjustingPoints(true);
    try {
      await api.admin.adjustPoints(
        adminStudent.id,
        selectedStudentForPoints,
        pointAdjustAmount,
        pointAdjustReason || 'Admin manual reward/adjustment'
      );
      showNotice(`Adjusted ${pointAdjustAmount >= 0 ? '+' : ''}${pointAdjustAmount} points successfully!`);
      setPointAdjustReason('');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice(e.message || 'Failed to adjust points', 'error');
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  // Add Material Form
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.addMaterial(adminStudent.id, {
        title: newTitle,
        description: newDesc,
        grade: newGrade,
        subject: newSubject,
        unit: newUnit,
        chapter: newUnit,
        type: newType,
        price: Number(newPrice),
        content: newContent || `# ${newTitle}\n\nComprehensive educational content here.`,
      });
      showNotice('New material added successfully!');
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewContent('');
      await loadAllAdminData();
      onDataChanged();
    } catch (e: any) {
      showNotice(e.message || 'Failed to create material', 'error');
    }
  };

  // Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.admin.updateSettings(adminStudent.id, settings);
      showNotice('Platform settings updated successfully!');
      onDataChanged();
    } catch (e: any) {
      showNotice('Settings update failed', 'error');
    }
  };

  const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING').length;
  const pendingUploadsCount = uploads.filter((u) => u.status === 'PENDING').length;
  const approvedPayments = payments.filter((p) => p.status === 'APPROVED');
  const totalRevenueBirr = approvedPayments.reduce((acc, p) => acc + (p.price || 0), 0);

  const adminTabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'students', label: '👨‍🎓 Students', count: students.length },
    { id: 'materials', label: '📚 Materials', count: materials.length },
    { id: 'payments', label: '💳 Payments', badge: pendingPaymentsCount },
    { id: 'points', label: '⭐ Points', count: totalCirculatingPoints },
    { id: 'rewards', label: '🎁 Rewards' },
    { id: 'referrals', label: '👥 Referrals', count: referrals.length },
    { id: 'uploads', label: '📤 Student Uploads', badge: pendingUploadsCount },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="space-y-5 pb-20">
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">Admin Control Center</h2>
              <span className="px-2 py-0.5 text-[10px] font-black bg-purple-500/30 text-purple-300 rounded-md">
                TELEBIRR & CURRICULUM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ethiopian Curriculum Grade 9–12 Educational Platform Management
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Notice alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {adminTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminSectionTab)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && tab.badge === undefined && (
                <span className="text-[10px] opacity-70">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: 📊 OVERVIEW */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Telebirr Revenue</span>
              <div className="text-xl font-black text-slate-900 mt-1">{totalRevenueBirr} Birr</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{approvedPayments.length} approved purchases</span>
            </div>

            <div
              onClick={() => setActiveTab('payments')}
              className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-purple-300 transition"
            >
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Pending Payments</span>
              <div className="text-xl font-black text-amber-600 mt-1">{pendingPaymentsCount}</div>
              <span className="text-[11px] text-amber-700 font-semibold">Awaiting Telebirr approval</span>
            </div>

            <div
              onClick={() => setActiveTab('students')}
              className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-purple-300 transition"
            >
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Registered Students</span>
              <div className="text-xl font-black text-slate-900 mt-1">{students.length}</div>
              <span className="text-[11px] text-blue-600 font-semibold">Grades 9–12 enrolled</span>
            </div>

            <div
              onClick={() => setActiveTab('materials')}
              className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-purple-300 transition"
            >
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Curriculum Materials</span>
              <div className="text-xl font-black text-slate-900 mt-1">{materials.length}</div>
              <span className="text-[11px] text-slate-500 font-semibold">{materials.filter(m => m.price === 0).length} free • {materials.filter(m => m.price > 0).length} paid</span>
            </div>
          </div>

          {/* Quick Pending Telebirr Approvals Queue */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Telebirr Verification Requests ({pendingPaymentsCount})</span>
              </h3>
              {pendingPaymentsCount > 0 && (
                <button
                  onClick={() => setActiveTab('payments')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  View All &rarr;
                </button>
              )}
            </div>

            {pendingPaymentsCount === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All Telebirr payments are verified. No pending items in queue.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments
                  .filter((p) => p.status === 'PENDING')
                  .slice(0, 3)
                  .map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{p.studentName} ({p.studentPhone})</div>
                        <div className="text-xs text-blue-700">{p.materialTitle} • <strong className="text-slate-900">{p.price} Birr</strong></div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Tx: <strong className="text-slate-900">{p.transactionNumber}</strong> • To: {p.telebirrNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleApprovePayment(p.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayment(p.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 2: 👨‍🎓 STUDENTS */}
      {/* ==================================================== */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Registered Students Roster</h3>
              <p className="text-xs text-slate-500">Student accounts, grades, and rewards balances</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{students.length} Students</span>
          </div>

          <div className="divide-y divide-slate-100">
            {students.map((st) => (
              <div key={st.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    {st.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{st.fullName}</h4>
                      {st.role === 'admin' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-purple-100 text-purple-700 rounded-md">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-semibold text-blue-600">{st.grade}</span>
                      <span>•</span>
                      <span>{st.phone}</span>
                      <span>•</span>
                      <span>{st.email}</span>
                      <span>•</span>
                      <span className="font-mono">Ref: {st.referralCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-700">⭐ {st.points} pts</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudentForPoints(st.id);
                      setActiveTab('points');
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl transition"
                  >
                    Adjust Pts
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 3: 📚 MATERIALS & DYNAMIC PRICING */}
      {/* ==================================================== */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Curriculum Materials & Dynamic Pricing
              </h3>
              <p className="text-xs text-slate-500">
                Change any material price (e.g. 10 → 15, 15 → 0, 0 → 10). Changes update student view instantly!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {materials.map((m) => (
              <div key={m.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 rounded-md">
                      {m.grade}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{m.subject}</span>
                    <span className="text-xs text-slate-400">• {m.unit}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                        m.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.isPublished ? 'PUBLISHED' : 'HIDDEN'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                  <div className="text-[11px] text-slate-500">By {m.authorName} • {m.type}</div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {/* Dynamic Pricing Controller */}
                  {editingPriceId === m.id ? (
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-purple-200">
                      <input
                        type="number"
                        min="0"
                        value={editingPriceVal}
                        onChange={(e) => setEditingPriceVal(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                      />
                      <span className="text-[10px] font-bold text-slate-500">Birr</span>
                      <button
                        onClick={() => handleSavePrice(m.id)}
                        className="px-2 py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="px-2 py-1 text-slate-500 hover:bg-slate-200 text-[11px] font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="text-right mr-1">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Price</span>
                        <span
                          className={`text-xs font-black ${
                            m.price === 0 ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {m.price === 0 ? 'FREE (0 Birr)' : `${m.price} Birr`}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPriceId(m.id);
                          setEditingPriceVal(m.price);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-xl transition"
                        title="Change Price (e.g. 10 -> 15, 15 -> 0)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Toggle publish status */}
                  <button
                    onClick={() => handleTogglePublish(m.id)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
                    title={m.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {m.isPublished ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 4: 💳 PAYMENTS VERIFICATION (TELEBIRR ONLY) */}
      {/* ==================================================== */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Telebirr Payment Requests
              </h3>
              <p className="text-xs text-slate-500">
                Official Telebirr number: <strong className="font-mono text-slate-800">{settings?.telebirrNumber || '0908170534'}</strong> (Telebirr only, no CBE/other banks)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total: {payments.length} requests
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No payment requests recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{p.studentName}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-blue-700">
                      {p.materialTitle} • <span className="font-bold text-slate-900">{p.price} Birr</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                      <span>Phone: {p.studentPhone}</span>
                      <span>•</span>
                      <span>Method: <strong className="text-slate-800">TELEBIRR</strong></span>
                      <span>•</span>
                      <span>Tx: <strong className="text-slate-900 font-bold">{p.transactionNumber}</strong></span>
                      <span>•</span>
                      <span>To: {p.telebirrNumber}</span>
                      <span>•</span>
                      <span>{new Date(p.submittedAt).toLocaleString()}</span>
                    </div>

                    {p.reviewNote && (
                      <div className="text-[11px] text-slate-500 italic">
                        Review note: {p.reviewNote}
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject Buttons (Requirement 9 & 10) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleApprovePayment(p.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>APPROVE</span>
                        </button>
                        <button
                          onClick={() => handleRejectPayment(p.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition active:scale-95 flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>REJECT</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-xs font-bold text-slate-400">
                        {p.status === 'APPROVED' ? 'Access Granted' : 'Access Denied'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 5: ⭐ POINTS LEDGER & MANUAL ADJUSTMENT */}
      {/* ==================================================== */}
      {activeTab === 'points' && (
        <div className="space-y-4">
          {/* Manual Adjust Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Manual Points Management</h3>
            <p className="text-xs text-slate-500 mb-4">
              Award bonus points for academic achievements or adjust balances manually
            </p>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-3 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentForPoints}
                  onChange={(e) => setSelectedStudentForPoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.phone} • {st.grade}) - Balance: {st.points} pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Points Amount (+ or -)</label>
                  <input
                    type="number"
                    value={pointAdjustAmount}
                    onChange={(e) => setPointAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Description</label>
                  <input
                    type="text"
                    value={pointAdjustReason}
                    onChange={(e) => setPointAdjustReason(e.target.value)}
                    placeholder="e.g. Science Quiz 1st Place"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdjustingPoints}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
              >
                {isAdjustingPoints ? 'Updating...' : 'Apply Points Adjustment'}
              </button>
            </form>
          </div>

          {/* Points Transactions Log */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">All System Point Transactions</h3>
            {pointTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No point transactions recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pointTransactions.map((tx) => {
                  const student = students.find((s) => s.id === tx.studentId);
                  return (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {student?.fullName || 'Student'} • {tx.description}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                        </div>
                      </div>
                      <span className={`font-black ${tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 6: 🎁 REWARDS & REDEMPTION RULES */}
      {/* ==================================================== */}
      {activeTab === 'rewards' && settings && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Points & Chapter Rewards Overview</h3>
          <p className="text-xs text-slate-500">
            Current configuration for points redemption and reward triggers
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-extrabold uppercase text-amber-800">Redeem 1 Free Chapter</span>
              <div className="text-2xl font-black text-amber-950 mt-1">{settings.pointsPerFreeChapter} Points</div>
              <p className="text-[11px] text-amber-800 mt-1">
                Any student with {settings.pointsPerFreeChapter}+ points can unlock a paid chapter immediately.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
              <span className="text-[10px] font-extrabold uppercase text-indigo-800">Referral Reward</span>
              <div className="text-2xl font-black text-indigo-950 mt-1">+{settings.referralBonusPoints} Points</div>
              <p className="text-[11px] text-indigo-800 mt-1">
                Both referrer and referee receive this bonus when joining via referral link.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800">Note Contribution Bonus</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">+{settings.contributionRewardPoints || 50} Points</div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Awarded to student when their submitted curriculum note is approved.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Edit Reward Quantities in Settings &rarr;
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 7: 👥 REFERRALS LEDGER */}
      {/* ==================================================== */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Student Referral Records</h3>
              <p className="text-xs text-slate-500">Track peer invitations and awarded points</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{referrals.length} Referrals</span>
          </div>

          {referrals.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No referrals registered yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {referrals.map((ref) => {
                const referrer = students.find((s) => s.id === ref.referrerId);
                return (
                  <div key={ref.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {ref.refereeName} invited by <span className="text-purple-700 font-extrabold">{referrer?.fullName || 'Student'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Date: {new Date(ref.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-black text-emerald-600">+{ref.rewardPoints} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 8: 📤 STUDENT UPLOADS */}
      {/* ==================================================== */}
      {activeTab === 'uploads' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Student Upload Submissions
              </h3>
              <p className="text-xs text-slate-500">
                Review peer notes submitted by students. Approved materials earn +{settings?.contributionRewardPoints || 50} points.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {uploads.length} Submissions
            </span>
          </div>

          {uploads.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No student submissions pending review.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {uploads.map((up) => (
                <div key={up.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 rounded-md">
                          {up.grade} • {up.subject}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                            up.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : up.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {up.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{up.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{up.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Submitted by: {up.studentName} ({up.studentPhone}) • Suggested price: {up.suggestedPrice} Birr
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {up.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveUpload(up.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                          >
                            Approve & Publish (+{settings?.contributionRewardPoints || 50} pts)
                          </button>
                          <button
                            onClick={() => handleRejectUpload(up.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-mono line-clamp-3">
                    {up.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 9: ⚙️ SETTINGS */}
      {/* ==================================================== */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5">
          <h3 className="font-extrabold text-base text-slate-900 mb-1">
            Platform & Telebirr Settings
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Configure official payment phone number, point rewards, and support channels
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telebirr Payment Number * (Telebirr ONLY)
              </label>
              <input
                type="text"
                required
                value={settings.telebirrNumber}
                onChange={(e) => setSettings({ ...settings, telebirrNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default: 0908170534. Students see this exact number for Telebirr payments.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Points Required to Redeem 1 Free Chapter
              </label>
              <input
                type="number"
                min="10"
                required
                value={settings.pointsPerFreeChapter}
                onChange={(e) =>
                  setSettings({ ...settings, pointsPerFreeChapter: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Referral Bonus Points per Invited Student
              </label>
              <input
                type="number"
                min="5"
                required
                value={settings.referralBonusPoints}
                onChange={(e) =>
                  setSettings({ ...settings, referralBonusPoints: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Upload Reward Points
              </label>
              <input
                type="number"
                min="5"
                required
                value={settings.contributionRewardPoints || 50}
                onChange={(e) =>
                  setSettings({ ...settings, contributionRewardPoints: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Telegram Channel Link
              </label>
              <input
                type="url"
                required
                value={settings.supportTelegram}
                onChange={(e) => setSettings({ ...settings, supportTelegram: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official TikTok Profile Link
              </label>
              <input
                type="url"
                required
                value={settings.supportTikTok}
                onChange={(e) => setSettings({ ...settings, supportTikTok: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Save Admin Settings
            </button>
          </form>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 mb-3">Add Educational Material</h3>

            <form onSubmit={handleCreateMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 2 – Two-Dimensional Kinematics"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade *</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[
                      'Mathematics',
                      'Physics',
                      'Biology',
                      'Chemistry',
                      'Economics',
                      'Citizenship',
                      'HPE',
                      'Amharic',
                      'IT',
                      'English',
                      'History',
                      'Geography',
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Unit 1"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MaterialType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Notes">Notes</option>
                    <option value="Worksheets">Worksheets</option>
                    <option value="Videos">Videos</option>
                    <option value="Textbooks">Textbooks</option>
                    <option value="Exercises">Exercises</option>
                    <option value="Exam Papers">Exam Papers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (Birr)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    placeholder="0 = Free"
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary overview of the curriculum material..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Educational Content (Markdown / Study Notes)
                </label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="# Unit Title&#10;&#10;Key Concepts, Definitions, Formulas, Worked Examples, and Review Questions..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
