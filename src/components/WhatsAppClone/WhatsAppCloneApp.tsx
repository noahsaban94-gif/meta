import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  MoreVertical, 
  Search, 
  Check, 
  CheckCheck, 
  ArrowLeft,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Trash2,
  Download,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Truck,
  MapPin,
  Sparkles,
  ExternalLink,
  Mic,
  Clock,
  Menu,
  X,
  Share2
} from 'lucide-react';
import { WhatsAppDoodleBg } from './WhatsAppDoodleBg';
import { MessageContent } from './MessageContent';
import { SettingsModal, CloneSettings } from './SettingsModal';
import { AboutModal } from './AboutModal';
import { ContactInfoModal } from './ContactInfoModal';
import { soundSynthesizer } from '../../utils/audioSynthesizer';
import { 
  processClientMessage, 
  QuickChip, 
  MAIN_MENU_TEXT, 
  MAIN_MENU_CHIPS 
} from '../../utils/logisticsEngine';

export interface CloneMessage {
  id: string;
  sender: 'user' | 'bot'; // user = outgoing (green), bot = incoming (white/dark-card)
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  chips?: QuickChip[];
  wazeUrl?: string;
  isConfirmation?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  phone: string;
  avatarText: string;
  avatarBg: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isBot?: boolean;
  statusBadge?: string;
  isPinned?: boolean;
}

const DEFAULT_SETTINGS: CloneSettings = {
  theme: 'light',
  soundEnabled: true,
  userName: 'לקוח ח. סבן',
  geminiApiKey: '',
  webhookUrl: ''
};

const DEFAULT_CONTACTS: ChatContact[] = [
  {
    id: 'noa_ai',
    name: 'נועה AI • סידור ולוגיסטיקה',
    phone: '+972 50-886-0896',
    avatarText: '🏗️',
    avatarBg: 'bg-[#008069]',
    lastMessage: 'מעולה, עדכנתי והוספתי להזמנה! ➕',
    lastTime: '10:42',
    unreadCount: 0,
    isBot: true,
    statusBadge: 'סוכנת רשמית',
    isPinned: true
  },
  {
    id: 'rami_masarwa',
    name: 'ראמי מסארווה (מנהל סידור ותפעול)',
    phone: '050-886-0896',
    avatarText: '👷',
    avatarBg: 'bg-amber-600',
    lastMessage: 'המרצדס מנוף פנויה לסבב הבא ברעננה 👍',
    lastTime: '10:15',
    unreadCount: 0,
    statusBadge: 'מנהל תפעול'
  },
  {
    id: 'driver_hachmat',
    name: 'חכמת (משאית מרצדס מנוף 615-41-002)',
    phone: '050-512-3456',
    avatarText: '🚛',
    avatarBg: 'bg-blue-600',
    lastMessage: 'סיימתי פריקת 60 מלט באחוזה, יוצא חזרה',
    lastTime: '09:50',
    unreadCount: 0
  },
  {
    id: 'driver_ali',
    name: 'עלי (משאית איסוזו חלוקה 651-51-701)',
    phone: '050-678-9012',
    avatarText: '🚚',
    avatarBg: 'bg-emerald-600',
    lastMessage: 'העמסתי 30 לוחות גבס מהתלמיד 6',
    lastTime: '09:12',
    unreadCount: 0
  },
  {
    id: 'warehouse_harash',
    name: 'מחסן 4 ראשי (החרש 10 הוד השרון)',
    phone: '09-745-1234',
    avatarText: '🏬',
    avatarBg: 'bg-indigo-600',
    lastMessage: 'מלאי חול וסומסום בלות עודכן במערכת',
    lastTime: 'אתמול',
    unreadCount: 0
  },
  {
    id: 'warehouse_talmid',
    name: 'מחסן 1 חלוקה (התלמיד 6 הוד השרון)',
    phone: '09-745-5678',
    avatarText: '📦',
    avatarBg: 'bg-teal-600',
    lastMessage: 'פתוח רצוף עד 17:00',
    lastTime: 'אתמול',
    unreadCount: 0
  },
  {
    id: 'management_idelson',
    name: 'הנהלה — הראל אידלסון (מנכ״ל)',
    phone: '050-111-2233',
    avatarText: '🏛️',
    avatarBg: 'bg-purple-700',
    lastMessage: 'אישור פרויקטים מיוחדים',
    lastTime: 'שלשום',
    unreadCount: 0
  }
];

interface WhatsAppCloneAppProps {
  onOpenStudio?: () => void;
}

export const WhatsAppCloneApp: React.FC<WhatsAppCloneAppProps> = ({ onOpenStudio }) => {
  // Settings from LocalStorage
  const [settings, setSettings] = useState<CloneSettings>(() => {
    try {
      const saved = localStorage.getItem('noa_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Effective Dark Theme Calculation
  const isDark = 
    settings.theme === 'dark' || 
    (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Sync dark class on body / html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Messages History State from LocalStorage
  const [messages, setMessages] = useState<CloneMessage[]>(() => {
    try {
      const saved = localStorage.getItem('noa_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return [
      {
        id: 'init_welcome',
        sender: 'bot',
        text: MAIN_MENU_TEXT,
        timestamp: timeStr,
        status: 'read',
        chips: MAIN_MENU_CHIPS
      }
    ];
  });

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('noa_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Active Chat State (Desktop & Mobile)
  const [activeContactId, setActiveContactId] = useState<string>('noa_ai');
  const [mobileView, setMobileView] = useState<'chat' | 'list'>('chat'); // Mobile screen mode
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'favorites'>('all');

  // Input & Typing status
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);

  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dotsMenuRef = useRef<HTMLDivElement>(null);

  const activeContact = DEFAULT_CONTACTS.find(c => c.id === activeContactId) || DEFAULT_CONTACTS[0];

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, mobileView]);

  // Click outside to close 3-dots menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target as Node)) {
        setShowDotsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sound Mute Toggle
  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextVal };
    setSettings(updated);
    soundSynthesizer.setMuted(!nextVal);
    try {
      localStorage.setItem('noa_settings', JSON.stringify(updated));
    } catch {}
    showToast(nextVal ? 'התראות קוליות הופעלו 🔊' : 'התראות קוליות הושתקו 🔇');
  };

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme as 'light' | 'dark' };
    setSettings(updated);
    try {
      localStorage.setItem('noa_settings', JSON.stringify(updated));
    } catch {}
    showToast(nextTheme === 'dark' ? 'מצב כהה הופעל 🌙' : 'מצב בהיר הופעל ☀️');
  };

  // Save Settings Modal
  const handleSaveSettings = (newSettings: CloneSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('noa_settings', JSON.stringify(newSettings));
    } catch {}
    showToast('ההגדרות נשמרו בהצלחה ✅');
  };

  // Clear Chat History
  const handleClearChat = () => {
    const timeStr = getCurrentTime();
    const initial: CloneMessage[] = [
      {
        id: 'init_reset',
        sender: 'bot',
        text: MAIN_MENU_TEXT,
        timestamp: timeStr,
        status: 'read',
        chips: MAIN_MENU_CHIPS
      }
    ];
    setMessages(initial);
    try {
      localStorage.setItem('noa_chat_history', JSON.stringify(initial));
    } catch {}
    showToast('השיחה נוקתה בהצלחה 🗑️');
  };

  // Export Chat to Text File
  const handleExportChat = () => {
    const lines = messages.map(m => {
      const sender = m.sender === 'user' ? (settings.userName || 'אתה') : 'נועה AI (ח. סבן)';
      return `[${m.timestamp}] ${sender}:\n${m.text}\n`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saban_chat_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('השיחה יוצאה בהצלחה לקובץ טקסט 📄');
  };

  // Send Message Logic (Supports chip click, text send, and audio)
  const handleSendMessage = (textToSend?: string) => {
    const raw = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!raw) return;

    // Play Outgoing Sound
    soundSynthesizer.playOutgoing();

    const timeStr = getCurrentTime();
    const userMsgId = `usr_${Date.now()}`;

    const userMessage: CloneMessage = {
      id: userMsgId,
      sender: 'user',
      text: raw,
      timestamp: timeStr,
      status: 'read'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowAttachMenu(false);

    // If chat is with a human driver or rami, simulate specific answer or let Noa reply
    setIsTyping(true);

    // Natural typing delay (700-1100ms) for authentic WhatsApp feel
    const typingDuration = 650 + Math.random() * 450;

    setTimeout(() => {
      let replyResult = processClientMessage(raw, activeContact.phone, settings.userName);

      // If active contact is Hachmat or Ali specifically
      if (activeContactId === 'driver_hachmat') {
        replyResult = {
          text: `אהלן! כאן חכמת עם המרצדס מנוף 🚛.\nקלטתי: "${raw}".\nאני בסבב ומעדכן את ראמי במקביל. אם דחוף לך תתקשר לראמי: 050-886-0896.`,
          chips: [{ id: 'ch1', label: '📞 חיוג לראמי', value: '51' }]
        };
      } else if (activeContactId === 'driver_ali') {
        replyResult = {
          text: `שלום, כאן עלי עם האיסוזו חלוקה 🚚.\nקיבלתי: "${raw}".\nיוצא מהתלמיד 6 בקרוב לחלוקה. תודה!`,
          chips: [{ id: 'ch2', label: '🏪 סניף התלמיד 6', value: '32' }]
        };
      }

      const botMessage: CloneMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: replyResult.text,
        timestamp: getCurrentTime(),
        status: 'read',
        chips: replyResult.chips,
        wazeUrl: replyResult.wazeUrl,
        isConfirmation: replyResult.actionType === 'order_confirmed'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Play Incoming Sound
      soundSynthesizer.playIncoming();
    }, typingDuration);
  };

  const handleChipClick = (value: string) => {
    if (value.startsWith('tel:')) {
      window.location.href = value;
      return;
    }
    handleSendMessage(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered contacts list
  const filteredContacts = DEFAULT_CONTACTS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone.includes(searchQuery) ||
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (chatFilter === 'unread') return matchesSearch && c.unreadCount > 0;
    if (chatFilter === 'favorites') return matchesSearch && c.isPinned;
    return matchesSearch;
  });

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col ${isDark ? 'dark bg-[#0b141a]' : 'bg-[#efeae2]'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Dual-Pane / Mobile Container */}
      <div className="flex-1 flex overflow-hidden w-full h-full relative">

        {/* ════════════════════════════════════════════════════════════════════════
            LEFT SIDEBAR: Contacts & Chats (Desktop / Tablet or Mobile Chat List)
           ════════════════════════════════════════════════════════════════════════ */}
        <aside 
          className={`
            ${mobileView === 'list' ? 'flex' : 'hidden'} 
            md:flex flex-col w-full md:w-[380px] lg:w-[420px] shrink-0 border-l border-slate-200 dark:border-[#222d34] 
            bg-white dark:bg-[#111b21] z-20 transition-all duration-200
          `}
        >
          {/* Sidebar Top Header */}
          <div className="h-16 px-4 flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] shrink-0 border-b border-slate-200 dark:border-[#222d34]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                🏗️
              </div>
              <div>
                <h1 className="font-bold text-sm text-[#111b21] dark:text-[#e9edef] leading-tight">
                  ח. סבן חומרי בניין
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-[#8696a0]">
                  מערך סידור ולוגיסטיקה WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-600 dark:text-[#aebac1]">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={settings.soundEnabled ? 'השתק צלילים' : 'הפעל צלילים'}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#00a884]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="החלף ערכת נושא"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="הגדרות"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-2.5 bg-white dark:bg-[#111b21] border-b border-slate-100 dark:border-[#202c33]/70 space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0f2f5] dark:bg-[#202c33] text-xs">
              <Search className="w-4 h-4 text-slate-500 dark:text-[#8696a0]" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש איש קשר, נהג או הודעה..."
                className="w-full bg-transparent border-none outline-hidden text-[#111b21] dark:text-[#e9edef] placeholder:text-slate-500 dark:placeholder:text-[#8696a0]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setChatFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  chatFilter === 'all'
                    ? 'bg-[#00a884] text-white'
                    : 'bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-[#8696a0] hover:bg-slate-200'
                }`}
              >
                הכל
              </button>
              <button
                onClick={() => setChatFilter('favorites')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  chatFilter === 'favorites'
                    ? 'bg-[#00a884] text-white'
                    : 'bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-[#8696a0] hover:bg-slate-200'
                }`}
              >
                מועדפים (נועה AI)
              </button>
              <button
                onClick={() => setChatFilter('unread')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  chatFilter === 'unread'
                    ? 'bg-[#00a884] text-white'
                    : 'bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-[#8696a0] hover:bg-slate-200'
                }`}
              >
                לא נקראו
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#202c33]/50">
            {filteredContacts.map(contact => {
              const isSelected = contact.id === activeContactId;
              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setMobileView('chat');
                  }}
                  className={`
                    flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' 
                      : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]/60'
                    }
                  `}
                >
                  {/* Contact Avatar */}
                  <div className={`relative w-12 h-12 rounded-full ${contact.avatarBg} text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs`}>
                    <span>{contact.avatarText}</span>
                    {contact.isBot && (
                      <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-[#00a884] text-white flex items-center justify-center text-[9px] border-2 border-white dark:border-[#111b21]" title="סוכנת מאומתת">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-sm text-[#111b21] dark:text-[#e9edef] truncate">
                          {contact.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-[#8696a0] shrink-0 font-medium">
                        {contact.lastTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#8696a0]">
                      <p className="truncate text-xs max-w-[210px] md:max-w-[190px]">
                        {contact.id === 'noa_ai' && isTyping ? (
                          <span className="text-[#00a884] font-medium animate-pulse">נועה מקלידה...</span>
                        ) : (
                          contact.lastMessage
                        )}
                      </p>

                      {contact.isPinned && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                          נעוץ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: Quick Info & Studio Switch */}
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-slate-200 dark:border-[#222d34] flex items-center justify-between text-xs text-slate-500 dark:text-[#8696a0]">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#00a884] flex items-center gap-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>אודות סבן (1994)</span>
            </button>

            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                className="px-2.5 py-1 rounded-lg bg-[#008069] hover:bg-[#00a884] text-white font-bold flex items-center gap-1 text-[11px] transition-colors shadow-xs"
                title="מעבר לעורך הענפים ומסך הסטודיו"
              >
                <span>🛠️ בונה ענפים וסטודיו</span>
              </button>
            )}
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════════════════════
            RIGHT MAIN WINDOW: WhatsApp Active Chat Window
           ════════════════════════════════════════════════════════════════════════ */}
        <section 
          className={`
            ${mobileView === 'chat' ? 'flex' : 'hidden'} 
            md:flex flex-col flex-1 h-full overflow-hidden relative z-10
          `}
        >
          {/* Chat Window Header */}
          <header className="h-16 px-4 flex items-center justify-between bg-[#008069] md:bg-[#f0f2f5] dark:bg-[#202c33] text-white md:text-[#111b21] dark:text-[#e9edef] shrink-0 border-b border-slate-200 dark:border-[#222d34] shadow-xs z-20">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -mr-1.5 rounded-full hover:bg-black/10 transition-colors text-white"
                title="חזרה לרשימת שיחות"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>

              {/* Active Avatar */}
              <div 
                onClick={() => setIsContactInfoOpen(true)}
                className={`w-10 h-10 rounded-full ${activeContact.avatarBg} text-white flex items-center justify-center font-bold text-lg shrink-0 cursor-pointer shadow-xs hover:opacity-90 transition-opacity`}
                title="הצג פרטי איש קשר"
              >
                <span>{activeContact.avatarText}</span>
              </div>

              {/* Title & Typing Status */}
              <div 
                onClick={() => setIsContactInfoOpen(true)}
                className="cursor-pointer min-w-0"
                title="הצג פרטי איש קשר"
              >
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm md:text-base leading-tight truncate">
                    {activeContact.name}
                  </h2>
                  {activeContact.isBot && (
                    <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 md:text-[#008069] dark:text-[#25d366] font-semibold shrink-0">
                      סוכנת AI
                    </span>
                  )}
                </div>

                <div className="text-[11px] md:text-xs">
                  {isTyping ? (
                    <span className="font-semibold text-emerald-200 md:text-[#00a884] dark:text-[#25d366] animate-pulse">
                      נועה מקלידה...
                    </span>
                  ) : (
                    <span className="text-emerald-100 md:text-slate-500 dark:text-[#8696a0] truncate block">
                      זמינה 24/7 • מחוברת לסידור העבודה
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-2 text-white md:text-slate-600 dark:text-[#aebac1]">
              {/* Clickable 'Call Contact' Button */}
              <a
                href={`tel:${activeContact.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 md:bg-[#008069] md:hover:bg-[#00a884] text-white transition-all font-semibold text-xs shadow-xs border border-white/30 md:border-transparent active:scale-95 cursor-pointer"
                title={`התקשר לאיש קשר (${activeContact.name}): ${activeContact.phone}`}
                aria-label={`Call contact ${activeContact.name}`}
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span className="whitespace-nowrap font-bold">התקשר לאיש קשר</span>
              </a>

              {/* Sound Toggle (Header) */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title={settings.soundEnabled ? 'השתק צלילים' : 'הפעל צלילים'}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-emerald-200 md:text-[#00a884] dark:text-[#25d366]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-300 md:text-slate-400" />
                )}
              </button>

              {/* 3-Dots Menu Dropdown */}
              <div className="relative" ref={dotsMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowDotsMenu(prev => !prev)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="תפריט אפשרויות"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showDotsMenu && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] py-1.5 z-50 text-xs text-slate-700 dark:text-[#d1d7db] animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setShowDotsMenu(false);
                        setIsAboutOpen(true);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-[#00a884]" />
                      <span>אודות ח. סבן (1994)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowDotsMenu(false);
                        toggleTheme();
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                      <span>{isDark ? 'מצב בהיר' : 'מצב כהה'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowDotsMenu(false);
                        handleExportChat();
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>ייצא שיחה ל-Text</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowDotsMenu(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                      <span>הגדרות מתקדמות</span>
                    </button>

                    {onOpenStudio && (
                      <button
                        onClick={() => {
                          setShowDotsMenu(false);
                          onOpenStudio();
                        }}
                        className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2 text-[#008069] dark:text-[#25d366] font-bold"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>פתח סטודיו לוגיסטי</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-[#2a3942] my-1" />

                    <button
                      onClick={() => {
                        setShowDotsMenu(false);
                        if (confirm('האם אתה בטוח שברצונך לנקות את היסטוריית הצ\'אט?')) {
                          handleClearChat();
                        }
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>נקה צ'אט</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════════════════════════════════════
              CHAT MESSAGES SCROLL AREA (With SVG Doodle Background Pattern)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 relative z-0">
            {/* SVG WhatsApp Doodles Background */}
            <WhatsAppDoodleBg isDark={isDark} />

            {/* End-to-End Encryption Banner */}
            <div className="relative z-10 flex justify-center mb-4">
              <div className="px-3.5 py-1.5 rounded-lg bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#ffd279] text-[11px] font-medium shadow-2xs max-w-md text-center border border-amber-200/50 dark:border-amber-900/30">
                🔒 ההודעות והשיחות מוצפנות מקצה לקצה. סידור ולוגיסטיקה ח. סבן (1994) בע״מ.
              </div>
            </div>

            {/* Date Capsule */}
            <div className="relative z-10 flex justify-center mb-4">
              <span className="px-3 py-1 rounded-md bg-white/80 dark:bg-[#182229]/80 backdrop-blur-xs text-slate-600 dark:text-[#8696a0] text-[11px] font-semibold shadow-2xs">
                היום
              </span>
            </div>

            {/* Message Bubbles Stream */}
            <div className="relative z-10 space-y-2.5 max-w-4xl mx-auto">
              {messages.map((msg) => {
                const isIncoming = msg.sender === 'bot';

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isIncoming ? 'items-start' : 'items-end'}`}
                  >
                    {/* Bubble Card */}
                    <div 
                      className={`
                        relative max-w-[88%] md:max-w-[75%] rounded-lg p-2.5 md:p-3 shadow-xs
                        ${isIncoming 
                          ? 'bubble-incoming-tail bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef]' 
                          : 'bubble-outgoing-tail bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef]'
                        }
                      `}
                      style={{
                        color: isIncoming 
                          ? (isDark ? '#e9edef' : '#111b21') 
                          : (isDark ? '#e9edef' : '#111b21')
                      }}
                    >
                      {/* Sender label for bot */}
                      {isIncoming && (
                        <div className="text-[11px] font-bold text-[#008069] dark:text-[#25d366] mb-1 flex items-center justify-between">
                          <span>נועה AI • ח. סבן</span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">מק"ט תקני</span>
                        </div>
                      )}

                      {/* Main Message Text (with backticks, bold, links formatting) */}
                      <MessageContent 
                        text={msg.text} 
                        isIncoming={isIncoming}
                        isDark={isDark}
                        onChipClick={handleChipClick}
                      />

                      {/* Interactive Clickable Quick Action Chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-1.5">
                          {msg.chips.map(chip => (
                            <button
                              key={chip.id}
                              type="button"
                              onClick={() => handleChipClick(chip.value)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] dark:hover:text-white transition-all transform active:scale-95 text-slate-800 dark:text-slate-100 flex items-center gap-1 shadow-2xs border border-black/5 dark:border-white/5"
                            >
                              <span>{chip.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Waze Link Direct Banner if available */}
                      {msg.wazeUrl && (
                        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                          <a
                            href={msg.wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-bold shadow-xs hover:bg-[#008f6f] transition-colors"
                          >
                            <span>🚗 פתח ניווט Waze ישיר לאתר</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Timestamp & Double Blue Ticks */}
                      <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 text-[10.5px] text-slate-500 dark:text-[#8696a0] select-none">
                        <span>{msg.timestamp}</span>
                        {!isIncoming && (
                          <CheckCheck 
                            className="w-3.5 h-3.5 text-[#53bdeb]" 
                            aria-label="נקרא" 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Animated Typing Bubble Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start animate-in fade-in duration-150">
                  <div className="bubble-incoming-tail bg-white dark:bg-[#202c33] rounded-lg px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                    <span className="text-[11px] text-[#008069] dark:text-[#25d366] font-semibold ml-1">
                      נועה מקלידה
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              QUICK LOGISTICS BAR (Immediate Branch Shortcuts)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="px-3 py-1.5 bg-[#f0f2f5] dark:bg-[#182229] border-t border-slate-200 dark:border-[#222d34] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-[#8696a0] font-semibold shrink-0 ml-1">
              ענפים מהירים:
            </span>
            <button
              onClick={() => handleSendMessage('0')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              📋 תפריט ראשי (0)
            </button>
            <button
              onClick={() => handleSendMessage('11')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              ⏳ אגרגטים בבלות (11)
            </button>
            <button
              onClick={() => handleSendMessage('12')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              🧱 מלט ובלוקים מנוף (12)
            </button>
            <button
              onClick={() => handleSendMessage('21')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              🔄 החלפת מכולה 8 קוב (21)
            </button>
            <button
              onClick={() => handleSendMessage('31')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              📍 סניף החרש 10 Waze (31)
            </button>
            <button
              onClick={() => handleSendMessage('41')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              🚛 איתור משאית (41)
            </button>
            <button
              onClick={() => handleSendMessage('51')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-[#00a884] hover:text-white dark:hover:bg-[#00a884] text-slate-700 dark:text-[#d1d7db] text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
            >
              📞 שיחה עם ראמי (51)
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              BOTTOM INPUT BAR (WhatsApp Authentic Bar)
             ════════════════════════════════════════════════════════════════════════ */}
          <footer className="h-16 px-3 md:px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-2 shrink-0 border-t border-slate-200 dark:border-[#222d34] z-20">
            {/* Attachment Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(prev => !prev)}
                className="p-2 text-slate-500 dark:text-[#8696a0] hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="צרף מסמך / מיקום / תעודה"
              >
                <Paperclip className="w-5 h-5 -rotate-45" />
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-14 right-0 w-52 rounded-xl shadow-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] p-2 z-50 text-xs text-slate-700 dark:text-[#d1d7db] space-y-1 animate-in slide-in-from-bottom-2 duration-150">
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      handleSendMessage('שלחתי מיקום אתר: רחוב אחוזה 142 רעננה');
                    }}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                  >
                    <span className="p-1.5 rounded-full bg-emerald-500 text-white"><MapPin className="w-3.5 h-3.5" /></span>
                    <span>שלח מיקום אתר (GPS)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      handleSendMessage('שלחתי צילום תעודת משלוח חתומה מקומקס');
                    }}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                  >
                    <span className="p-1.5 rounded-full bg-blue-500 text-white"><ExternalLink className="w-3.5 h-3.5" /></span>
                    <span>תעודת משלוח חתומה</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      handleSendMessage('שלחתי צילום של מכולת הפסולת (גובה דפנות אפס)');
                    }}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111b21] flex items-center gap-2"
                  >
                    <span className="p-1.5 rounded-full bg-purple-500 text-white"><Truck className="w-3.5 h-3.5" /></span>
                    <span>צילום מכולה לפינוי</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input Capsule Field */}
            <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-lg px-3 py-1.5 shadow-2xs border border-transparent focus-within:border-[#00a884]">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="הקלד הודעה או מספר ענף (לדוגמה: 11, 21, 3 חול 60 מלט)..."
                className="w-full bg-transparent border-none outline-hidden text-sm text-[#111b21] dark:text-[#e9edef] placeholder:text-slate-400 dark:placeholder:text-[#8696a0]"
              />
            </div>

            {/* Send Button or Mic */}
            {inputText.trim() ? (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00a884]/20 transition-all transform active:scale-95"
                title="שלח הודעה (Enter)"
              >
                <Send className="w-5 h-5 -rotate-90 translate-y-[-1px]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage('3 חול 60 מלט נשר')}
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2a3942] hover:bg-[#00a884] hover:text-white text-slate-600 dark:text-[#8696a0] flex items-center justify-center shrink-0 transition-colors"
                title="שלח דוגמת הזמנה מהירה (3 חול 60 מלט)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </footer>
        </section>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
      />

      {/* About Saban Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Contact Details & Direct Call Modal */}
      <ContactInfoModal
        isOpen={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        contact={activeContact}
      />
    </div>
  );
};
