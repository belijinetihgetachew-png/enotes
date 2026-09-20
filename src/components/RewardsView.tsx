import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  BookOpen,
  Lock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  BookMarked,
  Filter,
  Send,
} from 'lucide-react';
import { StudentProfile, Material, PointTransaction, ReferralRecord, GradeLevel } from '../types.ts';
import { api } from '../lib/api.ts';

interface RewardsViewProps {
  student: StudentProfile;
  materials: Material[];
  onChapterRedeemed: () => void;
  onOpenMaterial?: (material: Material) => void;
  onDownloadMaterial?: (material: Material) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  student,
  materials,
  onChapterRedeemed,
  onOpenMaterial,
  onDownloadMaterial,
}) => {
  const [copied, setCopied] = useState(false);
  const [pointsData, setPointsData] = useState<{
    currentPoints: number;
    transactions: PointTransaction[];
    pointsPerFreeChapter: number;
  }>({
    currentPoints: student.points,
    transactions: [],
    pointsPerFreeChapter: 100, // will be replaced immediately by dynamic admin settings
  });

  const [referralsData, setReferralsData] = useState<{
    referralCode: string;
    referralLink: string;
    referrals: ReferralRecord[];
    totalEarned: number;
    rewardPerReferral: number;
  }>({
    referralCode: student.referralCode,
    referralLink: `${window.location.origin}?ref=${student.referralCode}`,
    referrals: [],
    totalEarned: 0,
    rewardPerReferral: 20, // will be replaced immediately by dynamic admin settings
  });

  // Step-by-step Redemption Flow States
  // Steps: 1 (select) -> 2 (show required) -> 3 (confirm & verify) -> 4 (deduct & unlock) -> 5 (Unlocked with Points celebration)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [justUnlockedMaterial, setJustUnlockedMaterial] = useState<Material | null>(null);

  // Points history filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'EARNED' | 'REDEEMED'>('ALL');

  useEffect(() => {
    loadData();
  }, [student.id]);

  const loadData = async () => {
    try {
      const [pts, refs] = await Promise.all([
        api.getMyPoints(student.id),
        api.getMyReferrals(student.id),
      ]);
      if (pts) setPointsData(pts);
      if (refs) setReferralsData(refs);
    } catch (e) {
      console.error('Error loading rewards data:', e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralsData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Paid materials that student has not yet purchased
  const eligibleMaterials = materials.filter((m) => m.price > 0 && !m.isPurchased);
  const filteredEligible = eligibleMaterials.filter((m) => {
    if (gradeFilter !== 'ALL' && m.grade !== gradeFilter) return false;
    return true;
  });

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const requiredPoints = pointsData.pointsPerFreeChapter;
  const currentPoints = pointsData.currentPoints;
  const hasSufficientPoints = currentPoints >= requiredPoints;
  const pointsRemainingAfter = currentPoints - requiredPoints;

  // Execute Step 4 & 5: Deduct points and unlock chapter
  const handleExecuteRedemption = async () => {
    if (!selectedMaterialId || !selectedMaterial) {
      setRedeemError('Please select a chapter first.');
      return;
    }

    if (!hasSufficientPoints) {
      setRedeemError(
        `Insufficient points. You have ${currentPoints} points, but ${requiredPoints} points are required.`
      );
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);

    try {
      await api.redeemChapter(student.id, selectedMaterialId);
      // Success: Save unlocked item for celebration screen
      setJustUnlockedMaterial({
        ...selectedMaterial,
        isPurchased: true,
        unlockedWithPoints: true,
      });
      await loadData();
      onChapterRedeemed();
      setIsConfirming(false);
    } catch (err: any) {
      setRedeemError(err.message || 'Failed to redeem chapter. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Filter points transactions
  const filteredTransactions = pointsData.transactions.filter((tx) => {
    if (historyFilter === 'EARNED') return tx.amount > 0;
    if (historyFilter === 'REDEEMED') return tx.amount < 0;
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* ========================================================= */}
      {/* 1. ⭐ CURRENT POINTS CARD */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>eNotes Reward Club</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-xs">
                {currentPoints}
              </span>
              <span className="text-xl font-extrabold text-amber-100">Points ⭐</span>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed max-w-sm">
              Exchange your points to unlock full chapters, download exam worksheets, and access video lessons.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 sm:items-end">
            <div className="px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-100 block">Reward Rate</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {requiredPoints} Points = 1 Free Chapter
              </span>
            </div>
            <div className="px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-100 block">Referral Bonus</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                +{referralsData.rewardPerReferral} Points / Invited Friend
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 🎁 REDEEM FREE CHAPTER FLOW (REQUIREMENT 2 & 3) */}
      {/* ========================================================= */}
      <div id="redeem-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Redeem Free Chapter with Points
              </h3>
              <p className="text-xs text-slate-500">
                Unlock any paid curriculum chapter instantly using your reward points
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-xs rounded-xl shrink-0">
            {requiredPoints} pts / chapter
          </span>
        </div>

        {/* Celebratory State: Just Unlocked with Points! */}
        {justUnlockedMaterial ? (
          <div className="py-6 px-4 bg-gradient-to-b from-amber-50/80 to-orange-50/50 rounded-2xl border-2 border-amber-300 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-7 h-7 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-black text-xs uppercase tracking-wider">
              <span>🎉 Unlocked with Points</span>
            </div>

            <h4 className="font-black text-lg text-slate-900">
              {justUnlockedMaterial.title}
            </h4>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              You have successfully unlocked this chapter using{' '}
              <strong className="text-amber-800 font-bold">{requiredPoints} points</strong>. It is now permanently available in your library!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              {onOpenMaterial && (
                <button
                  onClick={() => onOpenMaterial(justUnlockedMaterial)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>OPEN NOTE NOW</span>
                </button>
              )}
              {onDownloadMaterial && (
                <button
                  onClick={() => onDownloadMaterial(justUnlockedMaterial)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PDF</span>
                </button>
              )}
              <button
                onClick={() => {
                  setJustUnlockedMaterial(null);
                  setSelectedMaterialId('');
                }}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition"
              >
                Redeem Another Chapter
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold pb-1">
              <div
                className={`py-1.5 px-2 rounded-xl border transition ${
                  !selectedMaterialId
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                1. Select Chapter
              </div>
              <div
                className={`py-1.5 px-2 rounded-xl border transition ${
                  selectedMaterialId && !isConfirming
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : selectedMaterialId && isConfirming
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                2. Verify Points
              </div>
              <div
                className={`py-1.5 px-2 rounded-xl border transition ${
                  isConfirming
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                3. Unlock Chapter
              </div>
            </div>

            {/* Error banner */}
            {redeemError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{redeemError}</span>
              </div>
            )}

            {/* Step 1: Chapter Selection */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Select a chapter to unlock ({filteredEligible.length} available):
                </label>

                {/* Grade filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                  {['ALL', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        gradeFilter === g
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {eligibleMaterials.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <h4 className="font-extrabold text-sm text-slate-800">All Content Unlocked!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Congratulations! You have already unlocked all available paid materials on eNotes.
                  </p>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y-0">
                  {filteredEligible.map((mat) => {
                    const isSelected = selectedMaterialId === mat.id;
                    return (
                      <div
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterialId(mat.id);
                          setIsConfirming(false);
                          setRedeemError(null);
                        }}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-blue-100 text-blue-800 rounded-md">
                              {mat.grade}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600">
                              {mat.subject} • {mat.unit}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {mat.title}
                          </h5>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            By {mat.authorName} • {mat.type}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-400 line-through block">
                            {mat.price} Birr
                          </span>
                          <span className="text-xs font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg border border-amber-200">
                            {requiredPoints} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2 & 3: Required Points & Confirmation verification */}
            {selectedMaterial && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Selected Chapter
                    </span>
                    <h5 className="font-bold text-sm text-slate-900">
                      {selectedMaterial.title}
                    </h5>
                    <span className="text-xs text-blue-600 font-semibold">
                      {selectedMaterial.grade} • {selectedMaterial.subject} ({selectedMaterial.unit})
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-black bg-amber-100 text-amber-900 rounded-lg">
                    Cost: {requiredPoints} pts
                  </span>
                </div>

                {/* Points verification ledger */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Required Points to Unlock:</span>
                    <span className="font-black text-slate-900">{requiredPoints} Points</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Your Available Balance:</span>
                    <span className="font-bold text-amber-700">⭐ {currentPoints} Points</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold">
                    <span>Balance After Unlock:</span>
                    <span
                      className={
                        pointsRemainingAfter >= 0 ? 'text-emerald-700' : 'text-red-600 font-black'
                      }
                    >
                      {pointsRemainingAfter >= 0
                        ? `${pointsRemainingAfter} Points`
                        : `Missing ${Math.abs(pointsRemainingAfter)} Points`}
                    </span>
                  </div>
                </div>

                {/* Verification Check Notice */}
                {!hasSufficientPoints ? (
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>Insufficient Reward Points</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      You need <strong className="font-bold">{requiredPoints - currentPoints} more points</strong> to redeem this chapter. Invite a classmate using your referral link below to earn +{referralsData.rewardPerReferral} points!
                    </p>
                  </div>
                ) : isConfirming ? (
                  <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-xs space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-blue-950">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Confirm Chapter Redemption</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Are you sure you want to deduct <strong>{requiredPoints} points</strong> to permanently unlock <strong>"{selectedMaterial.title}"</strong>?
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleExecuteRedemption}
                        disabled={isRedeeming}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        {isRedeeming ? (
                          <span>Unlocking Chapter...</span>
                        ) : (
                          <>
                            <Gift className="w-3.5 h-3.5" />
                            <span>YES, UNLOCK CHAPTER</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setIsConfirming(false)}
                        className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>PROCEED TO REDEEM ({requiredPoints} Points)</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. 👥 REFERRAL REWARDS (REQUIREMENT 2 & 14) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Peer Referral Rewards
              </h3>
              <p className="text-xs text-slate-500">
                Share your invite link with Ethiopian Grade 9–12 students
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs rounded-xl shrink-0">
            +{referralsData.rewardPerReferral} pts / invite
          </span>
        </div>

        {/* Student Referral Code & Link Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Your Referral Code:</span>
            <span className="font-mono text-base font-black text-blue-700 bg-white px-3 py-1 rounded-xl border border-blue-200">
              {referralsData.referralCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:flex-1 font-mono text-xs font-semibold text-blue-900 bg-white px-3 py-2.5 rounded-xl border border-blue-100 truncate">
              {referralsData.referralLink}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  referralsData.referralLink
                )}&text=${encodeURIComponent(
                  'Join eNotes to access official Ethiopian Grade 9-12 short notes, worksheets, and national exam materials!'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition active:scale-95"
                title="Share on Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Referral Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Total Invited</span>
            <span className="text-xl font-black text-slate-900">
              {referralsData.referrals.length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Active Students</span>
            <span className="text-xl font-black text-emerald-700">
              {referralsData.referrals.length}
            </span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Points Earned</span>
            <span className="text-xl font-black text-amber-900">
              +{referralsData.totalEarned} pts
            </span>
          </div>
        </div>

        {/* Peer Referrals List */}
        {referralsData.referrals.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-extrabold text-slate-700 block mb-2">
              Recent Peer Referrals:
            </span>
            <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {referralsData.referrals.map((r) => (
                <div key={r.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{r.refereeName}</span>
                    <span className="text-slate-400 text-[10px] block">
                      Joined {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-600">
                    +{r.rewardPoints || referralsData.rewardPerReferral} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. 📊 POINTS HISTORY (REQUIREMENT 2) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Points Activity History
              </h3>
              <p className="text-xs text-slate-500">
                Complete record of earned, spent, and redeemed points
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {(['ALL', 'EARNED', 'REDEEMED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  historyFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No points activity recorded under this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-black text-xs sm:text-sm shrink-0 ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPositive ? `+${tx.amount}` : tx.amount} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
