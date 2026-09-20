import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { Material, StudentProfile } from '../types.ts';
import { api } from '../lib/api.ts';

interface TelebirrPaymentModalProps {
  material: Material | null;
  student: StudentProfile | null;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const TelebirrPaymentModal: React.FC<TelebirrPaymentModalProps> = ({
  material,
  student,
  onClose,
  onPaymentSubmitted,
}) => {
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!material) return null;

  const telebirrNumber = '0908170534';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(telebirrNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setError('Please login first to submit a payment.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !transactionNumber.trim()) {
      setError('Please fill out all fields: Full Name, Phone, and Telebirr Transaction Number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitPayment(student.id, {
        materialId: material.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        transactionNumber: transactionNumber.trim(),
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        onPaymentSubmitted();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm">
              TB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight leading-none">
                  Telebirr Payment
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-900 rounded-full">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Instant curriculum unlock on approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {submittedSuccess ? (
            <div className="py-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full uppercase tracking-wider">
                Status: PENDING
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-3">
                Payment Submitted!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                Your payment request has been received. Our admin team will verify your Telebirr
                transaction shortly. Your note will automatically unlock upon approval!
              </p>
              <div className="mt-5 p-3 bg-blue-50 rounded-2xl border border-blue-100 text-left text-xs text-blue-900">
                <div className="font-semibold text-blue-950">Material Selected:</div>
                <div className="font-bold">{material.title}</div>
                <div className="text-[11px] text-blue-700 mt-0.5">Amount: {material.price} Birr</div>
              </div>
            </div>
          ) : (
            <>
              {/* Material Info Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    {material.grade} • {material.subject}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                    {material.title}
                  </h4>
                </div>
                <div className="text-right pl-3 shrink-0">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Price</div>
                  <div className="text-base font-black text-blue-700">{material.price} Birr</div>
                </div>
              </div>

              {/* Payment Details Container */}
              <div className="p-4 bg-gradient-to-b from-sky-50 to-blue-50/50 rounded-2xl border border-sky-200/70 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">Payment Amount:</span>
                  <span className="text-lg font-black text-slate-900">{material.price} Birr</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5">
                  <span className="font-medium">Payment Method:</span>
                  <span className="font-extrabold text-blue-800 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                    TELEBIRR ONLY
                  </span>
                </div>

                {/* Telebirr Number Box */}
                <div className="mt-2 pt-2 border-t border-sky-200/80">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Payment Number:
                  </span>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border-2 border-blue-500 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider">
                        {telebirrNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instruction Quote */}
                <div className="mt-3 p-2.5 bg-blue-100/70 rounded-xl text-xs font-semibold text-blue-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    "Send the required amount ({material.price} Birr) to the Telebirr number above."
                  </p>
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Verification Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter student full name"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telebirr Transaction Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="e.g. TBR983241029 or SMS reference code"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Copy the transaction code from your Telebirr SMS receipt.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SUBMIT PAYMENT</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
