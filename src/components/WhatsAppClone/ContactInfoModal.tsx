import React from 'react';
import { X, Phone, MessageSquare, ShieldCheck, MapPin, Truck, Clock, ExternalLink } from 'lucide-react';
import { ChatContact } from './WhatsAppCloneApp';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ChatContact;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  isOpen,
  onClose,
  contact
}) => {
  if (!isOpen) return null;

  const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#008069] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">פרטי איש קשר</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-white"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#182229]">
          <div className={`w-20 h-20 rounded-full ${contact.avatarBg} text-white flex items-center justify-center font-bold text-3xl shadow-md mb-3`}>
            <span>{contact.avatarText}</span>
          </div>

          <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{contact.name}</span>
            {contact.isBot && (
              <span className="w-4 h-4 rounded-full bg-[#00a884] text-white text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </h4>

          <p className="text-sm text-slate-500 dark:text-[#8696a0] dir-ltr mt-0.5 font-medium">
            {contact.phone}
          </p>

          {contact.statusBadge && (
            <span className="mt-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              {contact.statusBadge}
            </span>
          )}

          {/* Primary Action: Direct Call Button */}
          <div className="mt-5 w-full flex items-center justify-center gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-3 bg-[#00a884] hover:bg-[#008f6f] text-white font-bold rounded-xl text-sm shadow-md shadow-[#00a884]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title={`חייג עכשיו ל-${contact.name}`}
            >
              <Phone className="w-4 h-4" />
              <span>התקשר לאיש קשר</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-3 bg-white dark:bg-[#202c33] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#00a884]" />
              <span>המשך צ'אט</span>
            </button>
          </div>
        </div>

        {/* Contact Details List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Phone Number Tile */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#202c33] flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">מספר טלפון להתקשרות:</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white dir-ltr block">{contact.phone}</span>
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#008069] dark:text-[#25d366] font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>חיוג ישיר</span>
            </a>
          </div>

          {/* Affiliation */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#202c33] space-y-1">
            <span className="text-slate-400 block text-[10px]">שיוך ארגוני:</span>
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
              ח. סבן חומרי בניין (1994) בע״מ • מערך סידור והובלות
            </span>
          </div>

          {/* Special Role Details */}
          {contact.id === 'noa_ai' && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold block">סוכנת AI מוסמכת של סבן</span>
              <p>זמינה 24/7 לשיבוץ משאיות, קליטת אגרגטים, מלט, בלוקים, מכולות 8 קוב וניווט Waze.</p>
            </div>
          )}

          {contact.id === 'rami_masarwa' && (
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block">מנהל תפעול וסידור עבודה</span>
              <p>ראמי מסארווה מנהל את צי המשאיות ומפקח על אספקות דחופות לאתרים.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#182229] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
            <span>איש קשר מאומת במערכת סבן</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
