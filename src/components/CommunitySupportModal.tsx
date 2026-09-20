import React from 'react';
import { X, Send, Share2, Sparkles, ExternalLink, HelpCircle, PhoneCall } from 'lucide-react';
import { AdminSettings } from '../types.ts';

interface CommunitySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings | null;
}

export const CommunitySupportModal: React.FC<CommunitySupportModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  const telegramLink = settings?.supportTelegram || 'https://t.me/enotes_ethiopia';
  const tiktokLink = settings?.supportTikTok || 'https://tiktok.com/@enotes_ethiopia';
  const telebirrNumber = settings?.telebirrNumber || '0908170534';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Community & Support</h3>
              <p className="text-[11px] text-slate-500">Official Ethiopian Student Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Telegram Channel (Requirement 15) */}
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 rounded-2xl flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-sky-950">Official Telegram Channel</h4>
                <p className="text-xs text-sky-700">Daily study updates & exam alerts</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition" />
          </a>

          {/* TikTok Profile (Requirement 15) */}
          <a
            href={tiktokLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs font-black text-xs">
                TT
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-950">Official TikTok</h4>
                <p className="text-xs text-slate-600">Short video explanations & tutorials</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition" />
          </a>

          {/* Support Phone */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Telebirr Helpdesk:</span>
            </div>
            <p className="text-slate-600 font-mono text-xs pl-5 font-bold">
              {telebirrNumber}
            </p>
            <p className="text-[11px] text-slate-500 pl-5">
              Available 7 days a week for Ethiopian Grade 9–12 students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
