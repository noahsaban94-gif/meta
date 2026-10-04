import React from 'react';
import { X, Building2, MapPin, Phone, Clock, Truck, ShieldCheck, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#008069] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              🏗️
            </div>
            <div>
              <h3 className="font-bold text-base">ח. סבן חומרי בניין (1994) בע״מ</h3>
              <p className="text-xs text-emerald-100">ספקית מובילה לחומרי בניין, מליטה, מנופים ומכולות</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm leading-relaxed">
          
          {/* Company Brief */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 text-xs">
            <span className="font-bold block mb-1">נוסדה בשנת 1994 • מעל 30 שנות מצוינות בענף הבנייה</span>
            חברת ח. סבן מספקת מעטפת לוגיסטית מקיפה לקבלנים, בונים פרטיים ומוסדות באזור השרון והמרכז, כולל צי משאיות מנוף ורמסע מתקדמות, מחסנים ממוחשבים וסוכנת AI אוטונומית.
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>סניפים ומחסנים לוגיסטיים:</span>
            </h4>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                <span>מחסן 4 ראשי (הובלות מנוף ואגרגטים):</span>
                <a 
                  href="https://waze.com/ul?q=%D7%94%D7%97%D7%A8%D7%A9+10+%D7%94%D7%95%D7%93+%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00a884] hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>Waze</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">רחוב החרש 10, אזור תעשייה נווה נאמן, הוד השרון</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                <span>מחסן 1 חלוקה (גבס, צבעים ובידוד):</span>
                <a 
                  href="https://waze.com/ul?q=%D7%94%D7%AA%D7%9C%D7%9E%D7%99%D7%93+6+%D7%94%D7%95%D7%93+%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00a884] hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <span>Waze</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">רחוב התלמיד 6, הוד השרון</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                חצר לוגיסטית ומכולות פסולת:
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">מתחם לוגיסטי כפר ברא</p>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1">
            <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>שעות פעילות ואספקה:</span>
            </h4>
            <div className="text-xs space-y-0.5 text-slate-700 dark:text-slate-300">
              <div>• <strong>ימים א׳ – ה׳:</strong> 06:30 – 17:00 (רצוף)</div>
              <div>• <strong>יום ו׳ וערבי חג:</strong> 06:30 – 13:00</div>
              <div className="text-slate-400 text-[11px] pt-1">נועה AI זמינה לקליטת הזמנות בוואטסאפ 24/7</div>
            </div>
          </div>

          {/* Logistics Fleet */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1.5 text-xs">
            <h4 className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>צי המשאיות של סבן:</span>
            </h4>
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <div>• <strong>משאית מנוף כבדה:</strong> מרצדס (נהג: חכמת, 615-41-002) — עד 26 טון, פריקות לקומות וחצרות.</div>
              <div>• <strong>משאית חלוקה מהירה:</strong> איסוזו (נהג: עלי, 651-51-701) — חלוקת גבס, צבעים ודבקים.</div>
              <div>• <strong>מכולות 8 קוב:</strong> מכולות תקניות לפינוי פסולת בניין עם תעודת הטמנה מורשית.</div>
            </div>
          </div>

          {/* Direct Contacts */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-1 text-xs">
            <h4 className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>טלפונים ואנשי קשר:</span>
            </h4>
            <div className="space-y-1">
              <div>
                <strong>ראמי מסארווה (מנהל סידור ותפעול):</strong>{' '}
                <a href="tel:0508860896" className="text-[#00a884] font-bold underline">050-886-0896</a> /{' '}
                <a href="tel:0508801080" className="text-[#00a884] font-bold underline">050-880-1080</a>
              </div>
              <div>
                <strong>הנהלה — הראל אידלסון (מנכ״ל) / ורד אידלסון:</strong> פניות משרדיות ותעודות משלוח.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#182229] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
            <span>ספק מורשה משרד הביטחון והרשויות</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
