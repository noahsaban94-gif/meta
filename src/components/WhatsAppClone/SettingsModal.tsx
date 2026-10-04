import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Monitor, 
  Key, 
  Webhook, 
  Trash2, 
  Download, 
  Check, 
  Play, 
  Info,
  Sparkles
} from 'lucide-react';
import { soundSynthesizer } from '../../utils/audioSynthesizer';

export interface CloneSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  userName: string;
  geminiApiKey: string;
  webhookUrl: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CloneSettings;
  onSaveSettings: (newSettings: CloneSettings) => void;
  onClearChat: () => void;
  onExportChat: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearChat,
  onExportChat
}) => {
  const [localSettings, setLocalSettings] = useState<CloneSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    soundSynthesizer.setMuted(!localSettings.soundEnabled);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const testIncomingSound = () => {
    soundSynthesizer.playIncoming();
  };

  const testOutgoingSound = () => {
    soundSynthesizer.playOutgoing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#008069] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="font-bold text-base">הגדרות וואטסאפ ונועה AI</h3>
              <p className="text-xs text-emerald-100">ח. סבן חומרי בניין (1994) בע״מ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm">
          
          {/* User Name */}
          <div className="space-y-1.5">
            <label className="font-semibold block text-xs text-slate-500 dark:text-slate-400">
              שם המשתמש (קבלן / מזמין):
            </label>
            <input 
              type="text" 
              value={localSettings.userName}
              onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#202c33] focus:outline-hidden focus:border-[#00a884]"
              placeholder="לדוגמה: יוסי קבלן"
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold block text-xs text-slate-500 dark:text-slate-400">
              ערכת נושא (Theme):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-medium text-xs transition-all ${
                  localSettings.theme === 'light'
                    ? 'border-[#00a884] bg-emerald-50 dark:bg-emerald-950/30 text-[#008069] dark:text-[#25d366]'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>מצב בהיר</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-medium text-xs transition-all ${
                  localSettings.theme === 'dark'
                    ? 'border-[#00a884] bg-emerald-50 dark:bg-emerald-950/30 text-[#008069] dark:text-[#25d366]'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>מצב כהה</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, theme: 'system' })}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 font-medium text-xs transition-all ${
                  localSettings.theme === 'system'
                    ? 'border-[#00a884] bg-emerald-50 dark:bg-emerald-950/30 text-[#008069] dark:text-[#25d366]'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>מערכת</span>
              </button>
            </div>
          </div>

          {/* Sound Synthesizer Controls */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182229] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {localSettings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#00a884]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="font-semibold block text-xs">התראות קוליות (Web Audio API)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">צלילי וואטסאפ מקומיים ללא תלות בקבצי MP3</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, soundEnabled: !localSettings.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  localSettings.soundEnabled ? 'bg-[#00a884]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span 
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    localSettings.soundEnabled ? 'right-0.5' : 'right-5.5'
                  }`}
                />
              </button>
            </div>

            {localSettings.soundEnabled && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={testIncomingSound}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-[#00a884]" />
                  <span>בדוק צליל נכנס (פעמון)</span>
                </button>
                <button
                  type="button"
                  onClick={testOutgoingSound}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-slate-400" />
                  <span>בדוק צליל יוצא (קליק)</span>
                </button>
              </div>
            )}
          </div>

          {/* Gemini API Key (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>מפתח Gemini API (אופציונלי):</span>
              </label>
              <span className="text-[10px] text-slate-400">לשיחות חופשיות מחוץ לעץ הלוגיסטי</span>
            </div>
            <input 
              type="password"
              value={localSettings.geminiApiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
              placeholder="AIzaSy... (ברירת מחדל: מנוע לוגיסטי פנימי)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#202c33] focus:outline-hidden focus:border-[#00a884] font-mono text-xs"
            />
          </div>

          {/* Webhook URL (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Webhook className="w-3.5 h-3.5 text-blue-500" />
                <span>כתובת Webhook / שרת שידור:</span>
              </label>
              <span className="text-[10px] text-slate-400">Make / Google Apps Script</span>
            </div>
            <input 
              type="text" 
              value={localSettings.webhookUrl}
              onChange={(e) => setLocalSettings({ ...localSettings, webhookUrl: e.target.value })}
              placeholder="https://hook.eu1.make.com/... או /api/bridge/query"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#202c33] focus:outline-hidden focus:border-[#00a884] font-mono text-xs dir-ltr"
            />
          </div>

          {/* Chat Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">פעולות צ'אט:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportChat}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#202c33] hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>ייצא שיחה לטקסט</span>
              </button>

              <button
                type="button"
                onClick={onClearChat}
                className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-1.5 text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>נקה צ'אט</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#182229] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            גרסה 2.5 • PWA Offline Ready
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold shadow-md shadow-[#00a884]/20 flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>נשמר!</span>
                </>
              ) : (
                <span>שמור שינויים</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
