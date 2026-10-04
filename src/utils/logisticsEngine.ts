/**
 * Saban Logistics & Virtual Agent Engine ("נועה AI")
 * Implements the full hierarchical navigation tree, NLP parsing, cart accumulation,
 * deposits calculation, vehicle scheduling, and confirmation generation.
 */

export interface QuickChip {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface LogisticsReply {
  text: string;
  chips?: QuickChip[];
  actionType?: 'menu' | 'cart_update' | 'order_confirmed' | 'container' | 'location' | 'status' | 'contact' | 'rami_command';
  assignedDriver?: string;
  truckDetails?: string;
  warehouseLocation?: string;
  wazeUrl?: string;
}

export interface CartItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  isBale?: boolean;
  palletEligible?: boolean;
  note?: string;
}

export interface ClientCartSession {
  cart: CartItem[];
  address?: string;
  targetTime?: string;
  lastUpdated: number;
}

// In-memory cart session storage per phone or default
const clientCartSessions: Map<string, ClientCartSession> = new Map();

export function getClientCart(phone: string = 'default'): ClientCartSession {
  let session = clientCartSessions.get(phone);
  if (!session) {
    session = { cart: [], lastUpdated: Date.now() };
    clientCartSessions.set(phone, session);
  }
  return session;
}

export function clearClientCart(phone: string = 'default') {
  clientCartSessions.delete(phone);
}

// Main Menu Text
export const MAIN_MENU_TEXT = `שלום וברוכים הבאים ל-*ח. סבן חומרי בניין (1994) בע״מ* 🏗️
אני *נועה*, נציגת הסידור והלוגיסטיקה האוטונומית שלך.

בחר שירות או הקלד מספר ענף:
\`1\` 🚚 *הזמנת חומרי בניין והובלות לאתר*
\`2\` 🗑️ *שירות מכולה 8 קוב תקנית* (הצבה/החלפה/פינוי)
\`3\` 🏪 *סניפי סבן, שעות ואיסוף עצמי* (החרש 10 / התלמיד 6)
\`4\` 📍 *בירור סטטוס אספקה ומיקום משאית*
\`5\` 📞 *פנייה אישית ישירה לראמי מסארווה*

ניתן להקליד בכל שלב מספר מקוצר (כגון \`11\`, \`21\`) או לשלוח רשימת חומרים חופשית.`;

export const MAIN_MENU_CHIPS: QuickChip[] = [
  { id: 'c1', label: '🚚 1. הזמנת חומרים', value: '1' },
  { id: 'c2', label: '🗑️ 2. מכולה 8 קוב', value: '2' },
  { id: 'c3', label: '🏪 3. סניפים ושעות', value: '3' },
  { id: 'c4', label: '📍 4. איתור משאית', value: '4' },
  { id: 'c5', label: '📞 5. שיחה עם ראמי', value: '5' }
];

export function processClientMessage(
  rawText: string,
  senderPhone: string = '050-000-0000',
  senderName: string = 'לקוח'
): LogisticsReply {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const digits = String(senderPhone || '').replace(/[^0-9]/g, '');
  const session = getClientCart(digits || 'default');

  // 1. נוהל מפקד עליון — ראמי מסארווה (050-886-0896 / 050-880-1080)
  const isRami = 
    digits.includes('508860896') || 
    digits.includes('508801080') || 
    lower.includes('המפקד') || 
    lower === 'ראמי';

  if (isRami) {
    if (lower === '1' || lower.includes('תמונת מצב') || lower.includes('סבבים') || lower.includes('חכמת') || lower.includes('עלי')) {
      return {
        text: `המפקד, להלן תמונת מצב צי המשאיות והסבבים בזמן אמת: 🚛\n\n1. *חכמת* (משאית מנוף 615-41-002):\n• סטטוס: בסבב פריקה פעיל באתר ברעננה (רחוב אחוזה 142).\n• תעודת משלוח: קומקס 6215751 (בלוקים + מלט).\n• צפי סיום וחזרה לסבב הבא: כ-20 דקות.\n\n2. *עלי* (איסוזו חלוקה 651-51-701):\n• סטטוס: בנסיעה לקו חלוקה בהוד השרון (חומרי גבס ודבקים).\n• פריקה מתוכננת: רחוב החרש 10.\n• זמינות לקריאה דחופה: מיידית.\n\nהאם לשבץ סבב נוסף לאחד מהם, המפקד? 🫡`,
        actionType: 'rami_command',
        chips: [
          { id: 'rc1', label: '➕ שיבוץ הזמנה חדשה', value: 'שיבוץ הזמנה' },
          { id: 'rc2', label: '📊 דוח בוקר מבצעי', value: 'דוח בוקר' },
          { id: 'rc3', label: '📢 שידור הודעה לנהגים', value: 'שידור הודעה' }
        ]
      };
    }
    return {
      text: `שלום המפקד! 🫡\nנועה כאן לרשותך, זיהיתי אותך מיד. כל המערכות, הסידור וצי המשאיות דרוכים.\n\nמה המשימה כרגע?\n[1] 🚛 *תמונת מצב סבבים ונהגים* (איפה חכמת ועלי עומדים)\n[2] ➕ *קליטה ושיבוץ מהיר של הזמנה חדשה לסידור*\n[3] 📊 *הפקת דוח בוקר / סיכום סוף יום (EOD)*\n[4] 📑 *הצלבת תעודות משלוח חתומות מול קומקס*\n[5] 📢 *שידור הודעה תפעולית לנהגים*`,
      actionType: 'rami_command',
      chips: [
        { id: 'rc1', label: '🚛 תמונת מצב סבבים', value: '1' },
        { id: 'rc2', label: '➕ קליטת הזמנה לסידור', value: 'קליטת הזמנה' },
        { id: 'rc3', label: '📊 דוח סוף יום', value: 'דוח' }
      ]
    };
  }

  // 2. פקודת תפריט ראשי / איפוס
  if (lower === '0' || lower === 'תפריט' || lower === 'התחלה' || lower === 'שלום' || lower === 'היי' || lower === 'בוקר טוב') {
    return {
      text: MAIN_MENU_TEXT,
      chips: MAIN_MENU_CHIPS,
      actionType: 'menu'
    };
  }

  // 3. ענף 1 — הזמנת חומרי בניין והובלות לאתר
  if (lower === '1' || lower === 'הזמנה' || lower.includes('הזמנת חומרים') || lower.includes('הובלה')) {
    return {
      text: `*מחלקת הזמנות והובלות לאתר — ח. סבן* 🏗️🚚
משאיות המנוף והחלוקה של סבן זמינות לאספקה ישירה לאתר:

אנא בחר את קבוצת החומרים:
\`11\` ⏳ *אגרגטים בבלות ושקים* (חול, סומסום, טיט מוכן) — יציאה ממחסן 4 החרש 10
\`12\` 🧱 *מלט, טיט, בלוקים ודבקים* (הובלת מנוף כבדה — נהג: חכמת, מרצדס 615-41-002)
\`13\` 🪵 *גבס, פרופילים, צבע ובידוד* (חלוקת איסוזו מהירה — נהג: עלי, התלמיד 6)

💡 ניתן גם להקליד ישירות: "3 חול 60 מלט לרעננה"`,
      chips: [
        { id: 'c11', label: '⏳ 11. אגרגטים ובלות', value: '11' },
        { id: 'c12', label: '🧱 12. מלט ובלוקים (מנוף)', value: '12' },
        { id: 'c13', label: '🪵 13. גבס ובידוד (חלוקה)', value: '13' },
        { id: 'c0', label: '🔙 חזרה לתפריט ראשי', value: '0' }
      ],
      actionType: 'menu'
    };
  }

  // תת ענף 11 — אגרגטים בבלות ושקים
  if (lower === '11' || lower.includes('אגרגט') || (lower.includes('חול') && !lower.match(/\d+/))) {
    return {
      text: `⏳ *אגרגטים בבלות ובשקים — ח. סבן:*
מלאי שוטף במחסן 4 (החרש 10, הוד השרון):
• מק"ט \`11501\` — חול ים / מחצבה בלה (0.6 מ"ק)
• מק"ט \`11511\` — סומסום בלה מנופה לריצוף (0.6 מ"ק)
• מק"ט \`11500\` — שקי חול 25 ק"ג
• מק"ט \`11520\` — טיט מוכן בלה / שקים

🛡️ *הערת פקדון:* 1 בלה = פקדון מק"ט \`60002\`.
כמה בלות או שקים תרצה להזמין, ולאיזו כתובת אתר?`,
      chips: [
        { id: 'order_sand', label: '3 בלות חול + 2 סומסום', value: '3 חול 2 סומסום' },
        { id: 'order_sand_bags', label: '20 שקי חול + 10 טיט', value: '20 שקי חול 10 שקי טיט' },
        { id: 'c1', label: '🔙 חזרה להזמנות', value: '1' }
      ]
    };
  }

  // תת ענף 12 — מלט, בלוקים ודבקים (מנוף חכמת)
  if (lower === '12' || lower.includes('מלט') && !lower.match(/\d+/) || lower.includes('בלוקים')) {
    return {
      text: `🧱 *מלט, טיט, בלוקים ודבקים — הובלת מנוף כבדה:*
משובץ למשאית מרצדס מנוף (חכמת, רכב 615-41-002):
• מק"ט \`10002\` — מלט אפור נשר 25 ק"ג (משטח תקני = 30 שקים)
• מק"ט \`10005\` — מלט לבן נשר 25 ק"ג
• מק"ט \`20001\` — בלוק בטון תקני 20/20/40
• מק"ט \`20005\` — בלוק איטונג מקורי
• מק"ט \`30010\` — דבק קרמיקה 109 / 132

🛡️ *פקדונות:* משטח סבן פקדון (מק"ט \`60060\`).
כמה שקים או משטחים נדרשים לפרויקט?`,
      chips: [
        { id: 'order_cement', label: '60 שקי מלט נשר (2 משטחים)', value: '60 מלט נשר' },
        { id: 'order_blocks', label: '2 משטחי בלוק 20', value: '2 משטחי בלוק בטון 20' },
        { id: 'c1', label: '🔙 חזרה להזמנות', value: '1' }
      ]
    };
  }

  // תת ענף 13 — גבס, פרופילים, צבע ובידוד (עלי)
  if (lower === '13' || lower.includes('גבס') || lower.includes('בידוד')) {
    return {
      text: `🪵 *גבס, פרופילים ובידוד — חלוקת איסוזו מהירה:*
יציאה יומית ממחסן 1 (התלמיד 6, הוד השרון) עם הנהג עלי (651-51-701):
• מק"ט \`40001\` — לוחות גבס לבן / ירוק עמיד מים (2.60 מ')
• מק"ט \`40020\` — ניצבים ומסלולים 50/70
• מק"ט \`50001\` — צמר זכוכית / בידוד אקוסטי
• מק"ט \`50010\` — שפכטל אמריקאי מוכן 28 ק"ג

שלח את הכמויות והכתובת לשיבוץ מיידי בקו של עלי!`,
      chips: [
        { id: 'order_gypsum', label: '30 לוחות גבס + פרופילים', value: '30 לוחות גבס לבן ופרופילים' },
        { id: 'c1', label: '🔙 חזרה להזמנות', value: '1' }
      ]
    };
  }

  // 4. ענף 2 — שירות מכולה 8 קוב תקנית בלבד
  if (lower === '2' || lower === 'מכולה' || lower.includes('מכולת') || lower.includes('פסולת')) {
    return {
      text: `🗑️ *שירות מכולות לפינוי פסולת בניין — ח. סבן:*
אנו מפעילים מכולות **8 קוב תקניות בלבד** המאושרות ע"י איגוד ערים והרשויות המקומיות:

אנא בחר את הפעולה הנדרשת:
\`21\` 🔄 *החלפת מכולה* (מלאה בריקה 8 קוב) [חוק ברזל: קו דפנות אפס, גישה פנויה למשאית רמסע]
\`22\` 📍 *הצבת מכולה 8 קוב חדשה* לאתר
\`23\` 🚜 *פינוי מכולה מהאתר* (ללא החלפה)

⚠️ *חשוב:* חל איסור מוחלט על חריגה מגובה הדפנות (בטיחות בכביש).`,
      chips: [
        { id: 'c21', label: '🔄 21. החלפת מכולה (מלאה בריקה)', value: '21' },
        { id: 'c22', label: '📍 22. הצבת מכולה 8 קוב חדשה', value: '22' },
        { id: 'c23', label: '🚜 23. פינוי מכולה מהאתר', value: '23' },
        { id: 'c0', label: '🔙 תפריט ראשי', value: '0' }
      ],
      actionType: 'container'
    };
  }

  // תת ענף 21 — החלפת מכולה
  if (lower === '21' || lower.includes('החלפת מכולה') || lower.includes('להחליף מכולה')) {
    return {
      text: `🔄 *קריאה להחלפת מכולה 8 קוב (מלאה בריקה):*
קלטתי את הבקשה! כדי שנוכל לשגר משאית רמסע:

1. מהי כתובת האתר המדויקת?
2. נא לאשר: האם הפסולת בגובה קו דפנות אפס והגישה פנויה למשאית?
(הקלד כתובת ומילה "מאושר").`,
      chips: [
        { id: 'cont_addr1', label: 'האתר ברעננה (גישה פנויה)', value: 'רעננה, גישה פנויה קו דפנות אפס' },
        { id: 'cont_addr2', label: 'האתר בהוד השרון (מאושר)', value: 'הוד השרון, קו דפנות אפס מאושר' }
      ],
      actionType: 'container'
    };
  }

  // תת ענף 22 — הצבת מכולה חדשה
  if (lower === '22' || lower.includes('הצבת מכולה') || lower.includes('מכולה חדשה')) {
    return {
      text: `📍 *הצבת מכולה 8 קוב חדשה:*
המכולה תובל ותוצב ע"י משאית רמסע.
לאיזו כתובת לשגר את המכולה ומתי (היום / מחר בבוקר)?`,
      actionType: 'container'
    };
  }

  // תת ענף 23 — פינוי מכולה
  if (lower === '23' || lower.includes('פינוי מכולה') || lower.includes('לפנות מכולה')) {
    return {
      text: `🚜 *פינוי מכולה 8 קוב מהאתר:*
קלטתי. אנא ציין כתובת לאיסוף המכולה וודא שאין רכבים חוסמים לפני המכולה.`,
      actionType: 'container'
    };
  }

  // 5. ענף 3 — סניפי סבן, שעות ואיסוף עצמי
  if (lower === '3' || lower === 'סניפים' || lower.includes('שעות') || lower.includes('איסוף')) {
    return {
      text: `🏪 *סניפי ח. סבן חומרי בניין (1994) בע״מ:*
שעות פעילות: **ימים א׳–ה׳: 06:30–17:00 | יום ו׳ וערבי חג: 06:30–13:00**

אנא בחר סניף לקבלת פרטים וניווט Waze ישיר:
\`31\` 📍 *סניף החרש 10, הוד השרון* (מחסן 4 ראשי — אגרגטים, מלט, בלוקים ומנוף)
\`32\` 📍 *סניף התלמיד 6, הוד השרון* (מחסן 1 חלוקה — גבס, צבעים, אינסטלציה ובידוד)
• *מחסן כפר ברא:* חצר לוגיסטית ומכולות פסולת`,
      chips: [
        { id: 'c31', label: '📍 31. סניף החרש 10 (מחסן 4) Waze', value: '31' },
        { id: 'c32', label: '📍 32. סניף התלמיד 6 (מחסן 1) Waze', value: '32' },
        { id: 'c0', label: '🔙 חזרה לתפריט', value: '0' }
      ],
      actionType: 'location'
    };
  }

  // תת ענף 31 — החרש 10
  if (lower === '31' || lower.includes('החרש')) {
    const waze = 'https://waze.com/ul?q=%D7%94%D7%97%D7%A8%D7%A9+10+%D7%94%D7%95%D7%93+%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes';
    return {
      text: `📍 *סניף ומחסן 4 ראשי — החרש 10, אזור תעשייה נווה נאמן, הוד השרון*
• סוגי חומרים: חול, סומסום, טיט, מלט, בלוקים, ברזל, חצר פריקה ומנופים.
• שעות פתיחה: א-ה 06:30-17:00, ו 06:30-13:00.
• מנהל מחסן ומנוף: ראמי מסארווה (050-886-0896)

🚗 *ניווט Waze ישיר:*
${waze}`,
      wazeUrl: waze,
      actionType: 'location',
      chips: [
        { id: 'waze_harash', label: '🚗 פתח ניווט Waze להחרש 10', value: 'Waze החרש 10' },
        { id: 'c3', label: '🔙 חזרה לסניפים', value: '3' }
      ]
    };
  }

  // תת ענף 32 — התלמיד 6
  if (lower === '32' || lower.includes('התלמיד')) {
    const waze = 'https://waze.com/ul?q=%D7%94%D7%AA%D7%9C%D7%9E%D7%99%D7%93+6+%D7%94%D7%95%D7%93+%D7%94%D7%A9%D7%A8%D7%95%D7%9F&navigate=yes';
    return {
      text: `📍 *סניף ומחסן 1 חלוקה — התלמיד 6, הוד השרון*
• סוגי חומרים: גבס, פרופילים, צבעי טמבור/נירלט, דבקים, בידוד וכלי עבודה.
• שעות פתיחה: א-ה 06:30-17:00, ו 06:30-13:00.
• נהג חלוקה סניף: עלי (651-51-701)

🚗 *ניווט Waze ישיר:*
${waze}`,
      wazeUrl: waze,
      actionType: 'location',
      chips: [
        { id: 'waze_talmid', label: '🚗 פתח ניווט Waze להתלמיד 6', value: 'Waze התלמיד 6' },
        { id: 'c3', label: '🔙 חזרה לסניפים', value: '3' }
      ]
    };
  }

  // 6. ענף 4 — בירור סטטוס אספקה ומיקום משאית
  if (lower === '4' || lower === '41' || lower.includes('סטטוס') || lower.includes('איפה המשאית') || lower.includes('מיקום משאית') || lower.includes('איתוראן')) {
    return {
      text: `📍 *איתור משאיות ובירור סטטוס בזמן אמת (איתוראן Fleet):*

🚛 *חכמת* (משאית מרצדס מנוף 615-41-002):
• מיקום: בדרך לאספקה ברעננה (אחוזה 142).
• צפי פריקה: ~20 דקות.

🚚 *עלי* (משאית איסוזו חלוקה 651-51-701):
• מיקום: בהעמסה במחסן 1 התלמיד 6.
• יציאה הבאה: הוד השרון וכפר סבא.

לבירור ספציפי על הזמנתך, ציין את מספר ההזמנה או שם המזמין.`,
      chips: [
        { id: 'call_rami', label: '📞 שיחה עם ראמי לבדיקה דחופה', value: '51' },
        { id: 'c0', label: '🔙 תפריט ראשי', value: '0' }
      ],
      actionType: 'status'
    };
  }

  // 7. ענף 5 — פנייה אישית ישירה לראמי מסארווה
  if (lower === '5' || lower === '51' || lower.includes('ראמי') || lower.includes('נציג') || lower.includes('דחוף') || lower.includes('תמחור')) {
    return {
      text: `📞 *פנייה ישירה לראמי מסארווה — מנהל תפעול וסידור עבודה:*
טלפון ישיר: **050-880-1080** / **050-886-0896** 📱
שלוחה פנימית בח. סבן (1994) בע"מ.

ראמי זמין לתיאום פריקות מנוף מורכבות, אספקות דחופות מהיום להיום ותמחור כמויות קבלניות לפרויקטים.`,
      chips: [
        { id: 'call_now', label: '📞 חייג עכשיו לראמי (050-886-0896)', value: 'tel:0508860896' },
        { id: 'c0', label: '🔙 חזרה לתפריט', value: '0' }
      ],
      actionType: 'contact'
    };
  }

  // 8. אישור הזמנה סופית כאשר יש סל וכתובת
  const isConfirm = lower === 'מאשר' || lower === 'אישור' || lower === 'כן' || lower === 'תאשר' || lower === 'סגור';
  if (isConfirm && session.cart.length > 0) {
    const orderNum = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const dest = session.address || 'אתר הלקוח (הוד השרון/רעננה)';
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(dest)}&navigate=yes`;

    const cartSummary = session.cart.map((i, idx) => `• ${i.name} (מק"ט ${i.sku}) — כמות: ${i.qty} ${i.unit || ''} ${i.note || ''}`).join('\n');
    clearClientCart(digits || 'default');

    return {
      text: `ההזמנה אושרה ושובצה בהצלחה בסידור העבודה! ✅

📦 *מספר הזמנה:* *${orderNum}*
📍 *יעד אספקה:* *${dest}*
🚛 *שיבוץ נדרש:* משאית מרצדס מנוף (חכמת)
🏬 *מחסן יציאה:* מחסן 4 — החרש 10, הוד השרון
⚖️ *משקל כולל משוער:* כ-11.5 טון

📋 *פירוט החומרים ששובצו:*
${cartSummary}

🚗 *קישור Waze לנהג:*
${wazeUrl}

ראמי מסארווה (050-886-0896) מפקח על האספקה. תודה שבחרת ב-ח. סבן חומרי בניין! 🏗️`,
      wazeUrl,
      actionType: 'order_confirmed',
      chips: [
        { id: 'c_waze', label: '🚗 פתח Waze ליעד', value: `Waze ${dest}` },
        { id: 'c0', label: '🔙 הזמנה חדשה / תפריט', value: '0' }
      ]
    };
  }

  // 9. קליטת כתובת אספקה אם יש סל קיים
  const hasStreetAddress = lower.includes('רחוב') || lower.includes('אחוזה') || lower.includes('הבנים') || lower.includes('השקד') || lower.includes('רעננה') || lower.includes('הוד השרון') || lower.includes('כפר סבא') || lower.includes('כפר ברא');
  const hasMaterials = lower.includes('חול') || lower.includes('מלט') || lower.includes('סומסום') || lower.includes('טיט') || lower.includes('בלוק') || lower.includes('גבס');

  if (session.cart.length > 0 && hasStreetAddress && !hasMaterials) {
    session.address = text;
    session.lastUpdated = Date.now();

    const cartLines = session.cart.map((item, idx) => {
      const noteStr = item.note ? ` ${item.note}` : '';
      return `${idx + 1}. מק"ט: ${item.sku} | ${item.name} | כמות: ${item.qty}${noteStr}`;
    }).join('\n');

    return {
      text: `מעולה! פרטי האספקה נקלטו בהצלחה 🚚📍

📍 *יעד אספקה:* ${text}
🚛 *שיבוץ נדרש:* משאית מרצדס מנוף (חכמת)
⚖️ *משקל כולל משוער:* כ-11.5 טון

📋 *סיכום סל ההזמנה:*
${cartLines}

האם לאשר ולשגר את ההזמנה לסידור העבודה של ראמי? (נא להשיב *"מאשר"* או ללחוץ על הכפתור מטה).`,
      chips: [
        { id: 'btn_confirm', label: '✅ מאשר, שגר לסידור!', value: 'מאשר' },
        { id: 'btn_add_more', label: '➕ רוצה להוסיף חומרים', value: 'רוצה להוסיף חומרים' }
      ],
      actionType: 'cart_update'
    };
  }

  // 10. עיבוד טבעי של חומרי בניין (חול, מלט, סומסום, טיט) וצבירת סל
  if (hasMaterials) {
    const isAddition = lower.includes('להוסיף') || lower.includes('רוצה להוסיף') || lower.includes('עוד') || lower.includes('תוסיף') || session.cart.length > 0;

    // קליטת חול
    if (lower.includes('חול')) {
      const match = lower.match(/(\d+)\s*(?:בלה|בלות)?\s*חול/) || lower.match(/חול.*?(\d+)/);
      const qty = match ? parseInt(match[1], 10) : 3;
      const existing = session.cart.find(i => i.sku === '11501');
      if (existing) {
        existing.qty += qty;
      } else {
        session.cart.push({ sku: '11501', name: 'חול שק גדול (בלה)', qty, unit: 'בלה', isBale: true });
      }
    }

    // קליטת מלט
    if (lower.includes('מלט')) {
      const match = lower.match(/(\d+)\s*(?:שק|שקים)?\s*מלט/) || lower.match(/מלט.*?(\d+)/);
      const qty = match ? parseInt(match[1], 10) : 60;
      const pallets = Math.ceil(qty / 30);
      const existing = session.cart.find(i => i.sku === '10002');
      if (existing) {
        existing.qty += qty;
        existing.note = `(${Math.ceil(existing.qty / 30)} משטחים)`;
      } else {
        session.cart.push({ sku: '10002', name: 'מלט אפור 25 ק"ג נשר', qty, unit: 'שק', palletEligible: true, note: `(${pallets} משטחים)` });
      }
    }

    // קליטת סומסום
    if (lower.includes('סומסום')) {
      const match = lower.match(/(\d+)\s*(?:בלה|בלות)?\s*סומסום/) || lower.match(/סומסום.*?(\d+)/);
      const qty = match ? parseInt(match[1], 10) : 5;
      const existing = session.cart.find(i => i.sku === '11511');
      if (existing) {
        existing.qty += qty;
      } else {
        session.cart.push({ sku: '11511', name: 'סומסום שק גדול (בלה)', qty, unit: 'בלה', isBale: true });
      }
    }

    session.lastUpdated = Date.now();

    // חישוב בלות ומשטחים
    let belsCount = 0;
    let bagsCount = 0;
    for (const it of session.cart) {
      if (it.isBale) belsCount += it.qty;
      if (it.palletEligible) bagsCount += it.qty;
    }
    const palletsCount = bagsCount > 0 ? Math.ceil(bagsCount / 30) : 0;

    const cartLines = session.cart.map((item, idx) => {
      const noteStr = item.note ? ` ${item.note}` : '';
      return `${idx + 1}. מק"ט: ${item.sku} | ${item.name} | כמות: ${item.qty}${noteStr}`;
    }).join('\n');

    if (isAddition && session.cart.length > 1) {
      const deposits = [];
      if (belsCount > 0) deposits.push(`• ${belsCount} בלות פקדון (מק"ט 60002)`);
      if (palletsCount > 0) deposits.push(`• ${palletsCount} משטחי סבן פקדון (מק"ט 60060)`);

      return {
        text: `מעולה, עדכנתי והוספתי להזמנה! ➕

📋 *סיכום סל הזמנה מעודכן:*
${cartLines}

🛡️ *פקדונות מחייבים:*
${deposits.join('\n')}

⚖️ משקל כולל משוער: כ-11.5 טון ➔ *שיבוץ נדרש: משאית מרצדס מנוף (חכמת).*

📍 לאיזו כתובת לשגר את חכמת, ולאיזו שעה לתאם את האספקה?`,
        chips: [
          { id: 'chip_addr1', label: '📍 רחוב השקד 14 כפר ברא, מחר 08:00', value: 'רחוב השקד 14 כפר ברא מחר ב-08:00' },
          { id: 'chip_addr2', label: '📍 רחוב אחוזה 142 רעננה, היום בצהריים', value: 'רחוב אחוזה 142 רעננה היום בצהריים' },
          { id: 'chip_confirm_direct', label: '✅ מאשר הזמנה', value: 'מאשר' }
        ],
        actionType: 'cart_update'
      };
    } else {
      const deposits = [];
      if (belsCount > 0) deposits.push(`${belsCount} בלות (מק"ט 60002)`);
      if (palletsCount > 0) deposits.push(`${palletsCount} משטחי סבן (מק"ט 60060)`);
      const depStr = deposits.length > 0 ? deposits.join(' + ') : 'ללא פקדונות';

      return {
        text: `קלטתי את פריטי ההזמנה שלך! 🏗️

📦 *פירוט החומרים שנקלטו:*
${cartLines}
🛡️ *פקדונות נלווים:* ${depStr}.

📍 *כדי שראמי יוכל לשבץ לך משאית:*
1. מהי כתובת האספקה המדויקת?
2. האם יש פריטים נוספים שתרצה להוסיף?`,
        chips: [
          { id: 'chip_add_sesame', label: '➕ רוצה להוסיף 5 סומסום', value: 'רוצה להוסיף 5 סומסום' },
          { id: 'chip_give_address', label: '📍 שלח כתובת אספקה', value: 'רחוב השקד 14 כפר ברא' },
          { id: 'c0', label: '🔙 תפריט ראשי', value: '0' }
        ],
        actionType: 'cart_update'
      };
    }
  }

  // Fallback מענה נעים ומזמין
  return {
    text: `שלום ${senderName}! 🏗️
קלטתי את הודעתך: "${text}".

איך אוכל לסייע לך בח. סבן?
\`1\` 🚚 *הזמנת חומרי בניין והובלת מנוף*
\`2\` 🗑️ *מכולה 8 קוב לפינוי פסולת*
\`3\` 🏪 *סניפי סבן ואיסוף עצמי*
\`4\` 📍 *בירור אספקה ומיקום משאית*
\`5\` 📞 *שיחה דחופה עם ראמי (050-886-0896)*`,
    chips: MAIN_MENU_CHIPS,
    actionType: 'menu'
  };
}
