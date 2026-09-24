// מילון המונחים. כל מונח:
//   id        — מזהה ייחודי באנגלית (משמש גם כעוגן בכתובת: /glossary#id)
//   he / en   — המונח בעברית ובאנגלית
//   category  — אחד מ-CATEGORIES
//   definition— הסבר קצר בעברית מדוברת
//   example   — (לא חובה) דוגמה מספרית או מהחיים
//   aliases   — (לא חובה) שמות נוספים שהחיפוש צריך למצוא
//   related   — (לא חובה) ids של מונחים קשורים
//   module    — (לא חובה) id של מודול שבו המונח מוסבר לעומק
//
// תוכן לימודי בלבד — אין כאן המלצות השקעה.

export const CATEGORIES = [
  { id: 'funds', label: 'כלי השקעה וקרנות', accent: 'cyan' },
  { id: 'securities', label: 'ניירות ערך', accent: 'purple' },
  { id: 'valuation', label: 'מדדי הערכה', accent: 'lime' },
  { id: 'trading', label: 'מסחר ותנודתיות', accent: 'pink' },
  { id: 'macro', label: 'מאקרו', accent: 'cyan' },
  { id: 'mortgages', label: 'משכנתאות', accent: 'purple' },
  { id: 'regulators', label: 'גופי פיקוח', accent: 'lime' },
]

export const TERMS = [
  // ---------------------------------------------------------------- כלי השקעה וקרנות
  {
    id: 'mutual-fund',
    he: 'קרן נאמנות',
    en: 'Mutual Fund',
    category: 'funds',
    definition:
      'קופה משותפת של הרבה משקיעים, שמנהל מקצועי משקיע עבורם בסל של ניירות ערך. קונים ומוכרים יחידות בקרן פעם ביום, לפי מחיר שנקבע בסוף יום המסחר.',
    example: 'קרן נאמנות שמשקיעה באג״ח ממשלתיות ישראליות, או קרן מנייתית שמשקיעה בחברות טכנולוגיה.',
    related: ['etf', 'index-fund', 'management-fee'],
  },
  {
    id: 'etf',
    he: 'קרן סל',
    en: 'ETF',
    category: 'funds',
    aliases: ['תעודת סל', 'Exchange Traded Fund'],
    definition:
      'קרן שבדרך כלל עוקבת אחרי מדד, ונסחרת בבורסה כמו מניה לאורך כל יום המסחר. בזכות הניהול הפסיבי, דמי הניהול בה נמוכים בדרך כלל.',
    example: 'קרן סל על מדד S&P 500 נותנת חשיפה ל-500 החברות הגדולות בארה״ב בקנייה אחת.',
    related: ['index-fund', 'stock-index', 'mutual-fund'],
  },
  {
    id: 'index-fund',
    he: 'קרן מחקה',
    en: 'Index Fund',
    category: 'funds',
    aliases: ['קרן מחקת מדד'],
    definition:
      'קרן נאמנות שמנסה לשכפל את הביצועים של מדד מסוים, במקום לנסות לנצח אותו. אין בה מנהל שבוחר מניות, ולכן היא זולה יחסית.',
    related: ['etf', 'passive-investing', 'stock-index'],
  },
  {
    id: 'stock-index',
    he: 'מדד מניות',
    en: 'Stock Index',
    category: 'funds',
    aliases: ['מדד'],
    definition:
      'סל מניות שמייצג שוק או תחום, ומשמש כ״מדחום״ שלו. אי אפשר לקנות מדד ישירות, אבל אפשר לקנות קרן שעוקבת אחריו.',
    example: 'ת״א 35 (35 החברות הגדולות בבורסת תל אביב), S&P 500, נאסד״ק 100.',
    related: ['etf', 'index-fund'],
  },
  {
    id: 'passive-investing',
    he: 'השקעה פסיבית',
    en: 'Passive Investing',
    category: 'funds',
    aliases: ['ניהול פסיבי', 'ניהול אקטיבי', 'Active Investing'],
    definition:
      'השקעה שעוקבת אחרי מדד במקום לבחור מניות. ההפך הוא ניהול אקטיבי, שבו מנהל מנסה להשיג תשואה גבוהה מהמדד, בדרך כלל בדמי ניהול גבוהים יותר.',
    related: ['index-fund', 'etf', 'management-fee'],
  },
  {
    id: 'management-fee',
    he: 'דמי ניהול',
    en: 'Management Fee',
    category: 'funds',
    definition:
      'אחוז שנתי מהכסף המושקע שגובה מי שמנהל אותו: קרן נאמנות, קופת גמל או קרן פנסיה. הבדל שנראה קטן מצטבר לסכום גדול לאורך שנים.',
    example: 'על חיסכון של ₪200,000, הפרש של 0.5% בדמי הניהול הוא ₪1,000 בשנה, עוד לפני ריבית דריבית.',
    related: ['compound-interest', 'mutual-fund'],
  },
  {
    id: 'provident-fund',
    he: 'קופת גמל להשקעה',
    en: 'Investment Provident Fund',
    category: 'funds',
    definition:
      'מוצר חיסכון שאפשר להפקיד אליו עד תקרה שנתית ולמשוך ממנו בכל רגע (ואז משלמים מס רווחי הון). מי שמחכה לגיל 60 ומושך כקצבה חודשית פטור ממס על הרווחים.',
    related: ['study-fund', 'pension-fund', 'management-fee'],
  },
  {
    id: 'study-fund',
    he: 'קרן השתלמות',
    en: 'Study Fund',
    category: 'funds',
    aliases: ['Keren Hishtalmut'],
    definition:
      'חיסכון לטווח בינוני שהמעסיק והעובד מפקידים אליו מדי חודש (בדרך כלל 7.5% ו-2.5% מהשכר). אחרי 6 שנים אפשר למשוך, ועד תקרת הפקדה מסוימת הרווחים פטורים ממס.',
    related: ['provident-fund', 'pension-fund'],
  },
  {
    id: 'pension-fund',
    he: 'קרן פנסיה',
    en: 'Pension Fund',
    category: 'funds',
    definition:
      'חיסכון חובה לפרישה: חלק מהמשכורת מופקד מדי חודש ומושקע לאורך שנים, ובגיל פרישה משולם כקצבה חודשית. הקרן כוללת גם ביטוח למקרה נכות ולשאירים.',
    related: ['provident-fund', 'management-fee', 'capital-market-authority'],
  },
  {
    id: 'hedge-fund',
    he: 'קרן גידור',
    en: 'Hedge Fund',
    category: 'funds',
    definition:
      'קרן פרטית למשקיעים עשירים או מוסדיים, שמשתמשת באסטרטגיות מורכבות כמו מינוף ומכירה בחסר. היא כפופה לפחות רגולציה מקרן נאמנות, ולכן פתוחה רק למשקיעים ״כשירים״.',
    related: ['leverage', 'short-selling'],
  },
  {
    id: 'portfolio',
    he: 'תיק השקעות',
    en: 'Portfolio',
    category: 'funds',
    definition: 'כל ההשקעות שלכם ביחד: מניות, אג״ח, קרנות, מזומן. מסתכלים על התיק כמכלול ולא על כל השקעה לבד.',
    related: ['diversification', 'asset-allocation'],
  },
  {
    id: 'diversification',
    he: 'פיזור',
    en: 'Diversification',
    category: 'funds',
    definition:
      'לא לשים את כל הביצים בסל אחד: לחלק את הכסף בין הרבה השקעות, כך שנפילה של אחת לא תמחק את כל התיק.',
    example: 'במקום מניה אחת, קרן סל שמחזיקה מאות חברות מתחומים ומדינות שונים.',
    related: ['portfolio', 'asset-allocation', 'etf'],
  },
  {
    id: 'asset-allocation',
    he: 'הקצאת נכסים',
    en: 'Asset Allocation',
    category: 'funds',
    definition:
      'ההחלטה איזה חלק מהתיק יהיה במניות, איזה באג״ח ואיזה במזומן. היא נקבעת לפי טווח ההשקעה והיכולת לספוג ירידות.',
    related: ['portfolio', 'diversification'],
  },
  {
    id: 'compound-interest',
    he: 'ריבית דריבית',
    en: 'Compound Interest',
    category: 'funds',
    definition: 'תשואה שמרוויחה תשואה: הרווחים מושקעים מחדש, ובשנה הבאה גם הם מרוויחים. לאורך זמן זה מצטבר בקצב מפתיע.',
    example: '₪10,000 בתשואה של 7% בשנה יהפכו אחרי 30 שנה לכ-₪76,000, בלי להוסיף שקל.',
    related: ['management-fee'],
  },

  // ---------------------------------------------------------------- ניירות ערך
  {
    id: 'security',
    he: 'נייר ערך',
    en: 'Security',
    category: 'securities',
    definition: 'השם הכללי לכל מה שנסחר בבורסה ומייצג זכות כספית: מניות, אג״ח, קרנות סל, אופציות ועוד.',
    related: ['stock', 'bond'],
  },
  {
    id: 'stock',
    he: 'מניה',
    en: 'Stock / Share',
    category: 'securities',
    definition:
      'חלק בבעלות על חברה. בעל מניה זכאי לחלק מהרווחים (אם מחולקים), נהנה מעליית הערך של החברה, ויכול להצביע באסיפה הכללית.',
    related: ['dividend', 'ipo', 'market-cap'],
    module: 'what-is-a-stock',
  },
  {
    id: 'dividend',
    he: 'דיבידנד',
    en: 'Dividend',
    category: 'securities',
    definition: 'חלק מהרווח שהחברה מחלקת במזומן לבעלי המניות, לפי מספר המניות של כל אחד. החברה לא חייבת לחלק דיבידנד.',
    related: ['stock', 'dividend-yield'],
    module: 'what-is-a-stock',
  },
  {
    id: 'ipo',
    he: 'הנפקה ראשונית לציבור',
    en: 'IPO',
    category: 'securities',
    aliases: ['Initial Public Offering', 'הנפקה'],
    definition:
      'הפעם הראשונה שחברה מוכרת מניות לציבור ונרשמת למסחר בבורסה. זה קורה בשוק הראשוני, והכסף מגיע לחברה עצמה.',
    related: ['stock', 'primary-market'],
    module: 'what-is-a-stock',
  },
  {
    id: 'primary-market',
    he: 'שוק ראשוני',
    en: 'Primary Market',
    category: 'securities',
    aliases: ['שוק משני', 'Secondary Market'],
    definition:
      'השוק שבו חברה או מדינה מנפיקה ניירות ערך חדשים ומקבלת את הכסף. בשוק המשני, לעומת זאת, משקיעים סוחרים ביניהם בניירות קיימים.',
    related: ['ipo', 'stock-exchange'],
    module: 'what-is-a-stock',
  },
  {
    id: 'bond',
    he: 'אגרת חוב',
    en: 'Bond',
    category: 'securities',
    aliases: ['אג״ח', 'אגח'],
    definition:
      'הלוואה שנותנים לחברה או למדינה. בתמורה מקבלים ריבית קבועה (קופון) לאורך התקופה, ובסוף מקבלים בחזרה את הסכום שהלוויתם.',
    example: 'אג״ח ל-5 שנים עם קופון של 4%: על כל ₪1,000 מקבלים ₪40 בשנה, ואת ה-₪1,000 בסוף.',
    related: ['coupon', 'yield-to-maturity', 'credit-rating', 'government-bond'],
  },
  {
    id: 'government-bond',
    he: 'אג״ח ממשלתית',
    en: 'Government Bond',
    category: 'securities',
    aliases: ['שחר', 'גליל', 'מק״מ'],
    definition:
      'הלוואה למדינה. נחשבת לבטוחה יחסית, ולכן הריבית נמוכה יותר. בישראל יש סדרות לא צמודות (״שחר״) וצמודות למדד (״גליל״), ומק״מ הוא מלווה קצר של בנק ישראל.',
    related: ['bond', 'corporate-bond', 'cpi-indexation'],
  },
  {
    id: 'corporate-bond',
    he: 'אג״ח קונצרנית',
    en: 'Corporate Bond',
    category: 'securities',
    definition:
      'הלוואה לחברה. בגלל שחברה יכולה להיקלע לקשיים, הריבית גבוהה יותר מבאג״ח ממשלתית. ככל שהדירוג נמוך יותר, הריבית (והסיכון) גבוהים יותר.',
    related: ['bond', 'credit-rating', 'government-bond'],
  },
  {
    id: 'coupon',
    he: 'קופון',
    en: 'Coupon',
    category: 'securities',
    definition: 'הריבית שאגרת חוב משלמת למחזיקים, בדרך כלל פעם בשנה או פעם בחצי שנה. מחושבת כאחוז מהערך הנקוב של האג״ח.',
    related: ['bond', 'yield-to-maturity'],
  },
  {
    id: 'yield-to-maturity',
    he: 'תשואה לפדיון',
    en: 'Yield to Maturity',
    category: 'securities',
    aliases: ['YTM'],
    definition:
      'התשואה השנתית שתקבלו אם תקנו אג״ח במחיר של היום ותחזיקו אותה עד הסוף. כשמחיר האג״ח יורד, התשואה לפדיון עולה, ולהפך.',
    related: ['bond', 'coupon'],
  },
  {
    id: 'credit-rating',
    he: 'דירוג אשראי',
    en: 'Credit Rating',
    category: 'securities',
    definition:
      'ציון שנותנת חברת דירוג ליכולת של מנפיק להחזיר את החוב, מ-AAA (הכי בטוח) ומטה. בעולם הגדולות הן S&P, Moody’s ו-Fitch; בישראל, מעלות ומידרוג.',
    related: ['bond', 'corporate-bond'],
  },
  {
    id: 'preferred-stock',
    he: 'מניית בכורה',
    en: 'Preferred Stock',
    category: 'securities',
    definition:
      'סוג מניה שמקבלת דיבידנד (ובפירוק החברה גם כסף) לפני המניות הרגילות, אבל בדרך כלל בלי זכות הצבעה. היא משהו באמצע בין מניה לאג״ח.',
    related: ['stock', 'dividend'],
  },
  {
    id: 'option',
    he: 'אופציה',
    en: 'Option',
    category: 'securities',
    aliases: ['Call', 'Put', 'אופציית רכש', 'אופציית מכר'],
    definition:
      'זכות, אבל לא חובה, לקנות (Call) או למכור (Put) נכס במחיר קבוע עד תאריך מסוים. משלמים על הזכות הזו פרמיה, ואם לא משתמשים בה היא פוקעת.',
    related: ['futures', 'leverage'],
  },
  {
    id: 'futures',
    he: 'חוזה עתידי',
    en: 'Futures',
    category: 'securities',
    definition:
      'התחייבות של שני הצדדים לקנות ולמכור נכס במחיר שנקבע היום, בתאריך עתידי. בניגוד לאופציה, זו חובה ולא זכות.',
    related: ['option', 'leverage'],
  },

  // ---------------------------------------------------------------- מדדי הערכה
  {
    id: 'market-cap',
    he: 'שווי שוק',
    en: 'Market Cap',
    category: 'valuation',
    aliases: ['Market Capitalization'],
    definition: 'כמה הבורסה מעריכה שהחברה שווה: מחיר המניה כפול מספר המניות.',
    example: 'חברה עם 50 מיליון מניות במחיר ₪40 שווה בבורסה ₪2 מיליארד.',
    related: ['stock', 'pe-ratio'],
  },
  {
    id: 'eps',
    he: 'רווח למניה',
    en: 'EPS',
    category: 'valuation',
    aliases: ['Earnings Per Share'],
    definition: 'הרווח הנקי של החברה בשנה, חלקי מספר המניות. כמה רווח ״שייך״ לכל מניה.',
    example: 'רווח של ₪100 מיליון ו-50 מיליון מניות: ₪2 רווח למניה.',
    related: ['pe-ratio', 'net-income'],
  },
  {
    id: 'pe-ratio',
    he: 'מכפיל רווח',
    en: 'P/E Ratio',
    category: 'valuation',
    aliases: ['מכפיל', 'PE', 'Price to Earnings'],
    definition:
      'מחיר המניה חלקי הרווח למניה: כמה שנים של רווח (בקצב הנוכחי) משלמים במחיר של היום. מכפיל גבוה אומר שהשוק מצפה לצמיחה, או שהמניה יקרה.',
    example: 'מניה במחיר ₪40 עם רווח של ₪2 למניה: מכפיל 20.',
    related: ['eps', 'pb-ratio', 'market-cap'],
  },
  {
    id: 'pb-ratio',
    he: 'מכפיל הון',
    en: 'P/B Ratio',
    category: 'valuation',
    aliases: ['Price to Book', 'PB'],
    definition:
      'שווי השוק חלקי ההון העצמי במאזן. מכפיל מתחת ל-1 אומר שהבורסה מעריכה את החברה בפחות מהשווי ״בספרים״ שלה.',
    related: ['equity', 'pe-ratio'],
  },
  {
    id: 'ps-ratio',
    he: 'מכפיל מכירות',
    en: 'P/S Ratio',
    category: 'valuation',
    aliases: ['Price to Sales'],
    definition: 'שווי השוק חלקי ההכנסות השנתיות. שימושי במיוחד בחברות צעירות שעוד לא מרוויחות, ולכן אין להן מכפיל רווח.',
    related: ['pe-ratio', 'market-cap'],
  },
  {
    id: 'dividend-yield',
    he: 'תשואת דיבידנד',
    en: 'Dividend Yield',
    category: 'valuation',
    definition: 'הדיבידנד השנתי למניה חלקי מחיר המניה. כמה ״ריבית״ המניה משלמת במזומן.',
    example: 'דיבידנד של ₪2 בשנה על מניה במחיר ₪50: תשואת דיבידנד של 4%.',
    related: ['dividend'],
  },
  {
    id: 'equity',
    he: 'הון עצמי',
    en: 'Equity / Book Value',
    category: 'valuation',
    definition: 'מה שנשאר לבעלי המניות אם החברה מוכרת את כל הנכסים ומשלמת את כל החובות: נכסים פחות התחייבויות.',
    related: ['pb-ratio', 'roe', 'debt-to-equity'],
  },
  {
    id: 'roe',
    he: 'תשואה על ההון',
    en: 'ROE',
    category: 'valuation',
    aliases: ['Return on Equity'],
    definition: 'הרווח הנקי חלקי ההון העצמי: כמה ביעילות החברה מרוויחה על הכסף של בעלי המניות.',
    example: 'רווח של ₪15 מיליון על הון של ₪100 מיליון: תשואה על ההון של 15%.',
    related: ['equity', 'net-income'],
  },
  {
    id: 'net-income',
    he: 'רווח נקי',
    en: 'Net Income',
    category: 'valuation',
    definition: 'השורה התחתונה בדוח רווח והפסד: ההכנסות פחות כל ההוצאות, כולל ריבית ומסים.',
    related: ['eps', 'ebitda'],
  },
  {
    id: 'ebitda',
    he: 'EBITDA',
    en: 'EBITDA',
    category: 'valuation',
    aliases: ['רווח תפעולי לפני פחת'],
    definition:
      'רווח לפני ריבית, מסים, פחת והפחתות. מראה כמה העסק עצמו מייצר, בלי השפעה של מבנה החוב והחשבונאות. נוח להשוואה בין חברות.',
    related: ['net-income', 'free-cash-flow'],
  },
  {
    id: 'free-cash-flow',
    he: 'תזרים מזומנים חופשי',
    en: 'Free Cash Flow',
    category: 'valuation',
    aliases: ['FCF'],
    definition:
      'הכסף שנכנס לקופה מהפעילות, פחות מה שהושקע בציוד ובמבנים. זה הכסף שהחברה יכולה לחלק, להחזיר חוב או להשקיע בצמיחה. קשה ״לייפות״ אותו יותר מאשר רווח.',
    related: ['ebitda', 'intrinsic-value'],
  },
  {
    id: 'debt-to-equity',
    he: 'יחס חוב להון',
    en: 'Debt-to-Equity',
    category: 'valuation',
    definition: 'סך החובות של החברה חלקי ההון העצמי. יחס גבוה אומר שהחברה ממומנת בעיקר בהלוואות, וזה מגדיל את הסיכון כשהריבית עולה.',
    related: ['equity', 'leverage'],
  },
  {
    id: 'intrinsic-value',
    he: 'שווי הוגן',
    en: 'Intrinsic Value',
    category: 'valuation',
    aliases: ['שווי פנימי', 'DCF'],
    definition:
      'הערכה של כמה החברה ״באמת״ שווה, לפי הכסף שהיא צפויה לייצר בעתיד. משווים אותה למחיר בבורסה כדי להחליט אם המניה זולה או יקרה. זו הערכה, לא עובדה.',
    related: ['free-cash-flow', 'pe-ratio'],
  },

  // ---------------------------------------------------------------- מסחר ותנודתיות
  {
    id: 'stock-exchange',
    he: 'בורסה',
    en: 'Stock Exchange',
    category: 'trading',
    definition: 'השוק שמחבר בין קונים למוכרים של ניירות ערך, לפי כללים קבועים ובשקיפות מלאה. ניגשים אליה דרך ברוקר.',
    related: ['broker', 'tase', 'order-book'],
    module: 'what-is-a-stock',
  },
  {
    id: 'broker',
    he: 'ברוקר',
    en: 'Broker',
    category: 'trading',
    aliases: ['חבר בורסה', 'בית השקעות'],
    definition: 'בנק או בית השקעות שמחזיק בשבילכם חשבון מסחר ושולח את הפקודות שלכם לבורסה, תמורת עמלה.',
    related: ['stock-exchange', 'market-order'],
    module: 'what-is-a-stock',
  },
  {
    id: 'bid',
    he: 'מחיר ביקוש',
    en: 'Bid',
    category: 'trading',
    aliases: ['ביד'],
    definition: 'ההצעה הגבוהה ביותר שקונה כלשהו מוכן לשלם כרגע. מי שרוצה למכור מיד, יקבל את המחיר הזה.',
    related: ['ask', 'spread', 'order-book'],
    module: 'what-is-a-stock',
  },
  {
    id: 'ask',
    he: 'מחיר היצע',
    en: 'Ask',
    category: 'trading',
    aliases: ['Offer', 'אסק'],
    definition: 'ההצעה הנמוכה ביותר שמוכר כלשהו מוכן לקבל כרגע. מי שרוצה לקנות מיד, ישלם את המחיר הזה.',
    related: ['bid', 'spread', 'order-book'],
    module: 'what-is-a-stock',
  },
  {
    id: 'spread',
    he: 'מרווח',
    en: 'Spread',
    category: 'trading',
    aliases: ['ספרד'],
    definition:
      'ההפרש בין מחיר ההיצע (Ask) למחיר הביקוש (Bid). זו ״עמלה נסתרת״ על ביצוע מיידי. במניות עם הרבה מסחר הוא זעיר, ובמניות דלילות הוא יכול להיות גדול.',
    example: 'Bid של 99.98 ו-Ask של 100.03: מרווח של 0.05.',
    related: ['bid', 'ask', 'liquidity'],
    module: 'what-is-a-stock',
  },
  {
    id: 'candlestick',
    he: 'נר',
    en: 'Candlestick',
    category: 'trading',
    aliases: ['OHLC', 'גרף נרות'],
    definition:
      'דרך להציג את המחיר בפרק זמן: הגוף מראה את מחיר הפתיחה והסגירה, והפתילים מראים את הגבוה והנמוך. נר עולה נסגר מעל הפתיחה, נר יורד מתחתיה.',
    related: ['volatility', 'timeframe'],
    module: 'what-is-a-stock',
  },
  {
    id: 'order-book',
    he: 'ספר פקודות',
    en: 'Order Book',
    category: 'trading',
    aliases: ['עומק שוק', 'Market Depth'],
    definition:
      'רשימה חיה של כל פקודות הקנייה והמכירה שמחכות לביצוע, מסודרות לפי מחיר. מראה כמה מניות מחכות בכל רמת מחיר.',
    related: ['bid', 'ask', 'limit-order', 'price-time-priority'],
    module: 'order-types',
  },
  {
    id: 'market-order',
    he: 'פקודת שוק',
    en: 'Market Order',
    category: 'trading',
    aliases: ['מרקט'],
    definition: 'פקודה לקנות או למכור מיד, במחיר הטוב ביותר שיש כרגע בספר. מבטיחה ביצוע, אבל לא מחיר.',
    related: ['limit-order', 'slippage', 'order-book'],
    module: 'order-types',
  },
  {
    id: 'limit-order',
    he: 'פקודה מוגבלת',
    en: 'Limit Order',
    category: 'trading',
    aliases: ['פקודת לימיט', 'לימיט'],
    definition:
      'פקודה עם מחיר גבול: לקנות לא ביותר ממנו, או למכור לא בפחות ממנו. מבטיחה מחיר, אבל לא ביצוע. אם אין מי שיסכים למחיר, הפקודה מחכה בספר.',
    related: ['market-order', 'order-book', 'price-time-priority', 'stop-order'],
    module: 'order-types',
  },
  {
    id: 'stop-order',
    he: 'פקודת סטופ',
    en: 'Stop Order',
    category: 'trading',
    aliases: ['סטופ לוס', 'Stop-Loss', 'פקודת הפסד מוגבל'],
    definition:
      'פקודה ״רדומה״ שמתעוררת כשהמחיר מגיע לרמה שקבעתם, ואז הופכת לפקודת שוק. משתמשים בה בעיקר כדי להגביל הפסד. בתנועה חדה היא יכולה להתבצע רחוק מהרמה שקבעתם.',
    example: 'קניתם ב-₪100 וקבעתם סטופ ב-₪90: אם המחיר יורד ל-₪90, נשלחת פקודת מכירה בשוק.',
    related: ['market-order', 'limit-order', 'slippage'],
  },
  {
    id: 'slippage',
    he: 'החלקה',
    en: 'Slippage',
    category: 'trading',
    definition:
      'הפער בין המחיר שראיתם כששלחתם פקודה לבין המחיר הממוצע שקיבלתם בפועל. קורה בעיקר בפקודות שוק גדולות מול ספר דליל.',
    related: ['market-order', 'liquidity'],
    module: 'order-types',
  },
  {
    id: 'price-time-priority',
    he: 'עדיפות מחיר-זמן',
    en: 'Price-Time Priority',
    category: 'trading',
    definition:
      'הכלל שלפיו הבורסה מבצעת פקודות ממתינות: קודם המחיר הטוב ביותר, ובמחיר זהה, מי שהגיע ראשון.',
    related: ['order-book', 'limit-order'],
    module: 'order-types',
  },
  {
    id: 'liquidity',
    he: 'נזילות',
    en: 'Liquidity',
    category: 'trading',
    definition:
      'כמה קל לקנות או למכור נכס מהר בלי להזיז את המחיר. מניה נזילה היא מניה עם הרבה קונים ומוכרים ומרווח צר.',
    related: ['spread', 'slippage', 'volume'],
    module: 'order-types',
  },
  {
    id: 'volume',
    he: 'מחזור מסחר',
    en: 'Volume',
    category: 'trading',
    aliases: ['ווליום'],
    definition: 'כמה מניות (או כמה כסף) החליפו ידיים בפרק זמן מסוים. מחזור גבוה מעיד על עניין ועל נזילות.',
    related: ['liquidity', 'breakout'],
    module: 'chart-reading',
  },
  {
    id: 'timeframe',
    he: 'טווח זמן',
    en: 'Timeframe',
    category: 'trading',
    aliases: ['טיימפריים'],
    definition:
      'כמה זמן מייצג כל נר בגרף: דקה, שעה, יום, שבוע. אותה מניה יכולה להיראות במגמת ירידה בגרף של דקות ובמגמת עלייה בגרף יומי.',
    related: ['candlestick', 'trend'],
    module: 'chart-reading',
  },
  {
    id: 'trend',
    he: 'מגמה',
    en: 'Trend',
    category: 'trading',
    aliases: ['מגמת עלייה', 'מגמת ירידה', 'דשדוש', 'Uptrend', 'Downtrend', 'Sideways'],
    definition:
      'הכיוון הכללי של המחיר. מגמת עלייה: שיאים ושפלים עולים. מגמת ירידה: שיאים ושפלים יורדים. דשדוש: המחיר נע בטווח בלי שיאים ושפלים חדשים.',
    related: ['support', 'resistance', 'timeframe', 'correction'],
    module: 'chart-reading',
  },
  {
    id: 'support',
    he: 'תמיכה',
    en: 'Support',
    category: 'trading',
    definition:
      'אזור מחיר שבו ירידות נוטות להיעצר, כי קונים נכנסים שם שוב ושוב. זה אזור ולא קו מדויק, וכשהוא נשבר הוא נוטה להפוך להתנגדות.',
    example: 'מניה שירדה שלוש פעמים ל-₪96 ובכל פעם עלתה בחזרה: ₪96 הוא אזור תמיכה.',
    related: ['resistance', 'breakout', 'trend'],
    module: 'chart-reading',
  },
  {
    id: 'resistance',
    he: 'התנגדות',
    en: 'Resistance',
    category: 'trading',
    definition:
      'אזור מחיר שבו עליות נוטות להיעצר, כי מוכרים ממתינים שם. כשהמחיר פורץ אותו, הוא נוטה להפוך לתמיכה.',
    related: ['support', 'breakout'],
    module: 'chart-reading',
  },
  {
    id: 'breakout',
    he: 'פריצה',
    en: 'Breakout',
    category: 'trading',
    aliases: ['פריצת שווא', 'False Breakout', 'שבירה'],
    definition:
      'כשהמחיר עובר רמת תמיכה או התנגדות ונשאר מעבר לה. פריצה בנפח מסחר גבוה נחשבת אמינה יותר. כשהמחיר עובר לרגע וחוזר מיד, זו פריצת שווא.',
    related: ['support', 'resistance', 'volume'],
    module: 'chart-reading',
  },
  {
    id: 'volatility',
    he: 'תנודתיות',
    en: 'Volatility',
    category: 'trading',
    definition:
      'כמה חזק ומהר המחיר זז, למעלה ולמטה. מודדים אותה בדרך כלל בסטיית תקן של התשואות. תנודתיות גבוהה פירושה אפשרות לרווח גדול, וגם להפסד גדול.',
    related: ['beta', 'vix', 'candlestick'],
  },
  {
    id: 'beta',
    he: 'בטא',
    en: 'Beta',
    category: 'trading',
    definition:
      'כמה מניה נוטה לזוז ביחס לשוק כולו. בטא 1 זזה כמו השוק, בטא 1.5 זזה בערך פי 1.5, ובטא 0.5 בערך בחצי.',
    related: ['volatility', 'stock-index'],
  },
  {
    id: 'vix',
    he: 'מדד הפחד',
    en: 'VIX',
    category: 'trading',
    definition:
      'מדד שמודד כמה תנודתיות השוק מצפה לה ב-30 הימים הקרובים במדד S&P 500, לפי מחירי אופציות. כשיש לחץ בשווקים, הוא קופץ.',
    related: ['volatility', 'option'],
  },
  {
    id: 'bull-market',
    he: 'שוק שורי',
    en: 'Bull Market',
    category: 'trading',
    aliases: ['שוק דובי', 'Bear Market'],
    definition:
      'תקופה ממושכת של עליות מחירים ואופטימיות. ההפך הוא שוק דובי: לפי ההגדרה המקובלת, ירידה של 20% ומעלה מהשיא.',
    related: ['correction', 'volatility'],
  },
  {
    id: 'correction',
    he: 'תיקון',
    en: 'Correction',
    category: 'trading',
    definition: 'ירידה של 10% עד 20% מהשיא האחרון. קורה לא מעט, גם בתוך שוק שעולה לאורך זמן.',
    related: ['bull-market'],
  },
  {
    id: 'short-selling',
    he: 'מכירה בחסר',
    en: 'Short Selling',
    category: 'trading',
    aliases: ['שורט', 'Short'],
    definition:
      'הימור על ירידה: שואלים מניה, מוכרים אותה, ומקווים לקנות אותה בחזרה בזול ולהחזיר. אם המחיר דווקא עולה, ההפסד תיאורטית לא מוגבל.',
    related: ['leverage', 'hedge-fund'],
  },
  {
    id: 'leverage',
    he: 'מינוף',
    en: 'Leverage',
    category: 'trading',
    aliases: ['מרג׳ין', 'Margin'],
    definition: 'השקעה עם כסף שאול. מגדיל את הרווח כשצודקים, ובאותה מידה את ההפסד כשטועים. אפשר להפסיד יותר מהכסף שהשקעתם.',
    example: 'במינוף פי 2, ירידה של 10% במניה היא הפסד של 20% מההון שלכם.',
    related: ['short-selling', 'debt-to-equity'],
  },

  // ---------------------------------------------------------------- מאקרו
  {
    id: 'inflation',
    he: 'אינפלציה',
    en: 'Inflation',
    category: 'macro',
    definition:
      'עלייה כללית ומתמשכת במחירים, כלומר ירידה בכוח הקנייה של הכסף. בנק ישראל מכוון לאינפלציה של 1%–3% בשנה.',
    example: 'באינפלציה של 3% בשנה, מה שעולה היום ₪100 יעלה בעוד שנה ₪103.',
    related: ['cpi', 'boi-rate', 'real-interest-rate'],
  },
  {
    id: 'cpi',
    he: 'מדד המחירים לצרכן',
    en: 'CPI',
    category: 'macro',
    aliases: ['המדד', 'Consumer Price Index'],
    definition:
      'מדד שמודד את השינוי במחיר של סל קבוע של מוצרים ושירותים שמשפחה ממוצעת קונה. בישראל הלמ״ס מפרסמת אותו מדי חודש, ולפיו מחושבים הצמדות למדד.',
    related: ['inflation', 'cpi-indexation', 'cbs'],
  },
  {
    id: 'boi-rate',
    he: 'ריבית בנק ישראל',
    en: 'Bank of Israel Rate',
    category: 'macro',
    aliases: ['הריבית', 'ריבית מוניטרית'],
    definition:
      'הריבית שבנק ישראל קובע, ושממנה נגזרות כמעט כל הריביות במשק. מעלים אותה כדי לרסן אינפלציה, ומורידים כדי לעודד צמיחה.',
    related: ['prime-rate', 'monetary-policy', 'bank-of-israel'],
  },
  {
    id: 'prime-rate',
    he: 'ריבית הפריים',
    en: 'Prime Rate',
    category: 'macro',
    aliases: ['פריים'],
    definition:
      'הריבית שהבנקים בישראל גובים מהלקוחות הכי טובים, ועליה מבוססות הרבה הלוואות. בישראל היא תמיד ריבית בנק ישראל ועוד 1.5%.',
    example: 'כשריבית בנק ישראל היא 4.5%, הפריים הוא 6%.',
    related: ['boi-rate', 'prime-track'],
  },
  {
    id: 'real-interest-rate',
    he: 'ריבית ריאלית',
    en: 'Real Interest Rate',
    category: 'macro',
    aliases: ['ריבית נומינלית'],
    definition: 'הריבית אחרי שמורידים ממנה את האינפלציה. היא מראה כמה כוח הקנייה שלכם באמת גדל.',
    example: 'פיקדון בריבית 4% כשהאינפלציה 3%: ריבית ריאלית של כ-1%.',
    related: ['inflation', 'boi-rate'],
  },
  {
    id: 'gdp',
    he: 'תוצר מקומי גולמי',
    en: 'GDP',
    category: 'macro',
    aliases: ['תמ״ג', 'צמיחה'],
    definition: 'השווי של כל הסחורות והשירותים שמיוצרים במדינה בשנה. השינוי בו הוא ״הצמיחה״ של המשק.',
    related: ['recession', 'unemployment'],
  },
  {
    id: 'recession',
    he: 'מיתון',
    en: 'Recession',
    category: 'macro',
    definition:
      'תקופה של התכווצות בפעילות הכלכלית. הגדרה מקובלת (לא רשמית): שני רבעונים רצופים של צמיחה שלילית בתוצר.',
    related: ['gdp', 'unemployment', 'bull-market'],
  },
  {
    id: 'unemployment',
    he: 'שיעור אבטלה',
    en: 'Unemployment Rate',
    category: 'macro',
    definition: 'האחוז מכוח העבודה שמחפש עבודה ולא מוצא. נתון שהבנקים המרכזיים עוקבים אחריו מקרוב.',
    related: ['gdp', 'recession'],
  },
  {
    id: 'monetary-policy',
    he: 'מדיניות מוניטרית',
    en: 'Monetary Policy',
    category: 'macro',
    aliases: ['הקלה כמותית', 'QE', 'Quantitative Easing'],
    definition:
      'הכלים של הבנק המרכזי לשלוט בכמות הכסף ובמחירו: בעיקר הריבית, ולפעמים גם קניית אג״ח בהיקפים גדולים (״הקלה כמותית״).',
    related: ['boi-rate', 'fiscal-policy', 'federal-reserve'],
  },
  {
    id: 'fiscal-policy',
    he: 'מדיניות פיסקלית',
    en: 'Fiscal Policy',
    category: 'macro',
    definition: 'ההחלטות של הממשלה לגבי מסים והוצאות. גירעון גדול מגדיל את החוב של המדינה ויכול ללחוץ על הריביות למעלה.',
    related: ['monetary-policy', 'gdp'],
  },
  {
    id: 'exchange-rate',
    he: 'שער חליפין',
    en: 'Exchange Rate',
    category: 'macro',
    aliases: ['דולר', 'שקל'],
    definition:
      'המחיר של מטבע אחד במונחי מטבע אחר. משפיע על כל השקעה בחו״ל: אם הדולר נחלש מול השקל, השקעה בדולרים שווה פחות בשקלים.',
    example: 'שער של 3.7 ש״ח לדולר: כל דולר עולה ₪3.70.',
    related: ['inflation'],
  },
  {
    id: 'federal-reserve',
    he: 'הפדרל ריזרב',
    en: 'Federal Reserve',
    category: 'macro',
    aliases: ['הפד', 'Fed'],
    definition:
      'הבנק המרכזי של ארה״ב. ההחלטות שלו על הריבית משפיעות על השווקים בכל העולם, כולל ישראל.',
    related: ['monetary-policy', 'bank-of-israel'],
  },
  {
    id: 'cbs',
    he: 'הלשכה המרכזית לסטטיסטיקה',
    en: 'CBS',
    category: 'macro',
    aliases: ['למ״ס', 'Central Bureau of Statistics'],
    definition: 'הגוף הממשלתי שאוסף ומפרסם נתונים רשמיים על המשק בישראל, כמו מדד המחירים לצרכן, התוצר והאבטלה.',
    related: ['cpi', 'gdp'],
  },

  // ---------------------------------------------------------------- משכנתאות
  {
    id: 'mortgage',
    he: 'משכנתא',
    en: 'Mortgage',
    category: 'mortgages',
    definition:
      'הלוואה לרכישת דירה, שהדירה עצמה משמשת בטוחה לה. אם לא מחזירים, הבנק יכול לממש את הנכס. בדרך כלל לתקופה של 20–30 שנה.',
    related: ['mortgage-mix', 'ltv', 'payment-to-income'],
  },
  {
    id: 'mortgage-mix',
    he: 'תמהיל משכנתא',
    en: 'Mortgage Mix',
    category: 'mortgages',
    aliases: ['מסלולים'],
    definition:
      'החלוקה של המשכנתא לכמה מסלולים עם סוגי ריבית שונים, כדי לאזן בין סיכון לעלות. לפי כללי בנק ישראל, לפחות שליש מהמשכנתא צריך להיות בריבית קבועה.',
    related: ['prime-track', 'fixed-unlinked', 'fixed-linked', 'variable-5'],
  },
  {
    id: 'prime-track',
    he: 'מסלול פריים',
    en: 'Prime Track',
    category: 'mortgages',
    definition:
      'מסלול בריבית משתנה שצמודה לפריים: כשבנק ישראל מעלה ריבית, ההחזר החודשי עולה מיד. בדרך כלל אפשר לפרוע אותו מוקדם בלי קנס.',
    related: ['prime-rate', 'mortgage-mix', 'prepayment-fee'],
  },
  {
    id: 'fixed-unlinked',
    he: 'קבועה לא צמודה',
    en: 'Fixed Unlinked',
    category: 'mortgages',
    aliases: ['קל״צ', 'קלצ'],
    definition:
      'מסלול שבו הריבית קבועה לכל התקופה והקרן לא צמודה למדד, כך שההחזר החודשי ידוע מראש. הוודאות עולה כסף: הריבית בו בדרך כלל גבוהה יותר.',
    related: ['fixed-linked', 'mortgage-mix', 'prepayment-fee'],
  },
  {
    id: 'fixed-linked',
    he: 'קבועה צמודה',
    en: 'Fixed CPI-Linked',
    category: 'mortgages',
    aliases: ['ק״צ', 'קצ'],
    definition:
      'מסלול עם ריבית קבועה, אבל הקרן צמודה למדד המחירים לצרכן. כשיש אינפלציה, יתרת החוב גדלה, וגם ההחזר.',
    related: ['cpi-indexation', 'fixed-unlinked', 'mortgage-mix'],
  },
  {
    id: 'variable-5',
    he: 'משתנה כל 5 שנים',
    en: 'Variable Rate (5Y)',
    category: 'mortgages',
    aliases: ['משתנה'],
    definition:
      'מסלול שבו הריבית נקבעת מחדש כל 5 שנים לפי תנאי השוק באותו רגע. קיים בגרסה צמודה ולא צמודה, ובנקודות השינוי אפשר בדרך כלל לפרוע בלי קנס.',
    related: ['mortgage-mix', 'fixed-linked'],
  },
  {
    id: 'cpi-indexation',
    he: 'הצמדה למדד',
    en: 'CPI Indexation',
    category: 'mortgages',
    definition:
      'מנגנון שבו סכום (חוב, פיקדון או אג״ח) מתעדכן לפי השינוי במדד המחירים לצרכן. בהלוואה צמודה, אינפלציה מגדילה את החוב.',
    example: 'חוב צמוד של ₪500,000 באינפלציה של 3% יגדל בשנה לכ-₪515,000, לפני ההחזרים.',
    related: ['cpi', 'fixed-linked', 'government-bond'],
  },
  {
    id: 'spitzer',
    he: 'לוח שפיצר',
    en: 'Spitzer Amortization',
    category: 'mortgages',
    aliases: ['שפיצר'],
    definition:
      'שיטת החזר עם תשלום חודשי קבוע (בלי שינויי ריבית והצמדה). בהתחלה רוב התשלום הולך לריבית, ורק עם הזמן יותר ממנו מקטין את הקרן. זו השיטה הנפוצה בישראל.',
    related: ['equal-principal', 'mortgage'],
  },
  {
    id: 'equal-principal',
    he: 'קרן שווה',
    en: 'Equal Principal',
    category: 'mortgages',
    definition:
      'שיטת החזר שבה מחזירים כל חודש את אותו חלק מהקרן, ולכן ההחזר הראשון גבוה והוא יורד עם הזמן. בסך הכול משלמים פחות ריבית מבשפיצר.',
    related: ['spitzer'],
  },
  {
    id: 'ltv',
    he: 'אחוז מימון',
    en: 'LTV',
    category: 'mortgages',
    aliases: ['Loan to Value'],
    definition:
      'כמה אחוזים משווי הדירה הבנק מממן. לפי בנק ישראל: עד 75% בדירה יחידה, עד 70% למשפרי דיור, ועד 50% בדירה להשקעה.',
    example: 'דירה ב-₪2,000,000 כדירה יחידה: משכנתא של עד ₪1,500,000, והשאר מהון עצמי.',
    related: ['mortgage', 'payment-to-income'],
  },
  {
    id: 'payment-to-income',
    he: 'יחס החזר',
    en: 'Payment-to-Income',
    category: 'mortgages',
    aliases: ['יחס החזר מהכנסה'],
    definition:
      'ההחזר החודשי כאחוז מההכנסה הפנויה של משק הבית. בנק ישראל לא מאפשר משכנתא עם יחס החזר מעל 50%, והבנקים זהירים הרבה לפני כן.',
    related: ['ltv', 'mortgage'],
  },
  {
    id: 'prepayment-fee',
    he: 'עמלת פירעון מוקדם',
    en: 'Prepayment Fee',
    category: 'mortgages',
    definition:
      'קנס שהבנק יכול לגבות כשמחזירים משכנתא לפני הזמן, בעיקר במסלולים בריבית קבועה כשהריבית במשק ירדה מאז שלקחתם אותה.',
    related: ['fixed-unlinked', 'prime-track'],
  },
  {
    id: 'pre-approval',
    he: 'אישור עקרוני',
    en: 'Pre-Approval',
    category: 'mortgages',
    definition: 'אישור ראשוני מהבנק לגובה המשכנתא ולתנאים, לפני שחותמים על חוזה לקניית דירה. בדרך כלל תקף לתקופה מוגבלת.',
    related: ['mortgage', 'ltv'],
  },

  // ---------------------------------------------------------------- גופי פיקוח
  {
    id: 'isa',
    he: 'רשות ניירות ערך',
    en: 'Israel Securities Authority',
    category: 'regulators',
    aliases: ['רני״ע', 'ISA'],
    definition:
      'הרגולטור של שוק ההון בישראל. מפקחת על חברות ציבוריות, על הבורסה, על קרנות הנאמנות ועל יועצי ההשקעות, ואוכפת איסורים כמו שימוש במידע פנים.',
    related: ['tase', 'investment-advisor', 'magna-maya', 'sec'],
  },
  {
    id: 'tase',
    he: 'הבורסה לניירות ערך בתל אביב',
    en: 'TASE',
    category: 'regulators',
    aliases: ['בורסת תל אביב', 'הבורסה'],
    definition: 'הבורסה היחידה בישראל. מפעילה את המסחר ואת המדדים (כמו ת״א 35 ות״א 125), ומפוקחת על ידי רשות ניירות ערך.',
    related: ['stock-exchange', 'isa', 'stock-index'],
    module: 'what-is-a-stock',
  },
  {
    id: 'bank-of-israel',
    he: 'בנק ישראל',
    en: 'Bank of Israel',
    category: 'regulators',
    definition:
      'הבנק המרכזי של ישראל. קובע את הריבית, אחראי ליציבות המחירים ולמערכת הפיננסית, ודרך הפיקוח על הבנקים גם קובע את כללי המשכנתאות.',
    related: ['boi-rate', 'banking-supervision', 'federal-reserve'],
  },
  {
    id: 'banking-supervision',
    he: 'הפיקוח על הבנקים',
    en: 'Banking Supervision',
    category: 'regulators',
    definition:
      'יחידה בבנק ישראל שמפקחת על הבנקים ועל חברות כרטיסי האשראי: יציבות, שמירה על הלקוחות, ומגבלות כמו אחוז מימון ויחס החזר במשכנתאות.',
    related: ['bank-of-israel', 'ltv', 'payment-to-income'],
  },
  {
    id: 'capital-market-authority',
    he: 'רשות שוק ההון, ביטוח וחיסכון',
    en: 'Capital Market Authority',
    category: 'regulators',
    aliases: ['רשות שוק ההון'],
    definition:
      'הרגולטור של חברות הביטוח, קרנות הפנסיה, קופות הגמל וקרנות ההשתלמות. היא שקובעת, למשל, את התקרות על דמי הניהול.',
    related: ['pension-fund', 'provident-fund', 'study-fund'],
  },
  {
    id: 'investment-advisor',
    he: 'יועץ השקעות',
    en: 'Investment Advisor',
    category: 'regulators',
    aliases: ['משווק השקעות'],
    definition:
      'מי שנותן ייעוץ השקעות אישי בישראל חייב רישיון מרשות ניירות ערך. יועץ השקעות אינו קשור לגוף שמנהל את המוצרים, ואילו ״משווק השקעות״ קשור לגוף כזה (למשל בנק שמשווק קרנות) וחייב לגלות לכם את זה.',
    related: ['isa'],
  },
  {
    id: 'magna-maya',
    he: 'מגנ״א ומאי״ה',
    en: 'MAGNA / MAYA',
    category: 'regulators',
    aliases: ['מגנא', 'מאיה', 'דיווחים'],
    definition:
      'מערכות הדיווח של שוק ההון בישראל: במגנ״א (של רשות ניירות ערך) ובמאי״ה (של הבורסה) חברות ציבוריות מפרסמות דוחות כספיים ודיווחים מיידיים. חינמי ופתוח לכולם.',
    related: ['isa', 'tase'],
  },
  {
    id: 'sec',
    he: 'רשות ניירות ערך האמריקאית',
    en: 'SEC',
    category: 'regulators',
    aliases: ['Securities and Exchange Commission'],
    definition: 'הרגולטור של שוק ההון בארה״ב, המקבילה האמריקאית של רשות ניירות ערך. חברות אמריקאיות מדווחות אליה במערכת EDGAR.',
    related: ['isa', 'finra'],
  },
  {
    id: 'finra',
    he: 'FINRA',
    en: 'FINRA',
    category: 'regulators',
    definition: 'גוף פיקוח עצמי בארה״ב שמפקח על הברוקרים ועל אנשי המכירות שלהם, תחת ה-SEC.',
    related: ['sec', 'broker'],
  },
]

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id)
