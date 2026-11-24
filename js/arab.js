// LOLO BOX — الدول العربية (LOLO_ARAB_2026). One small map per Arab country (Egypt and Saudi Arabia have their own big
// worlds), each built around its most famous landmark. Countries are data: to add more landmarks to a country later,
// add an entry to its `sites` list (id, name, English name, facts, question, builder + position).
// All countries share one offset; the current country's scene is built when entered and removed when left.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';
import { voLoad, voPlay, voStop, voPlaying, voReady, voClean } from './vo.js?v=2';

export const ARAB_OFF = 15000;
const TH = { // ground themes
  desert: { g: '#f0d49a', s: ['#e6c788', '#f6e0ae'], deco: 'palm', sea: '#2fa6e8' },
  med: { g: '#9fd36a', s: ['#8cc55a', '#b0de7c'], deco: 'olive', sea: '#2fa6e8' },
  green: { g: '#5fc04a', s: ['#73d35c', '#4eab3c'], deco: 'tree', sea: '#2fa6e8' },
  salt: { g: '#efe8da', s: ['#e3dccb', '#f8f4ec'], deco: 'rock', sea: '#3fb6ff' },
};
// The country list. mapId is the map-selection card; i = flag emoji; hello = guide greeting.
export const COUNTRIES = [
  { id: 'uae', mapId: 19, n: 'الإمارات', en: 'United Arab Emirates', i: '🇦🇪', th: 'desert', guide: 'المرشد حمدان', hello: 'هلا وغلا! حياك في الإمارات',
    sites: [{ id: 'burj', b: 'burj', n: 'برج خليفة', en: 'Burj Khalifa', i: '🏙️', f: ['برج خليفة في دبي هو أطول مبنى في العالم، طوله حوالي 828 متر!', 'اتفتح سنة 2010، ومن فوقه تشوف دبي كلها والبحر والصحرا.'], q: ['برج خليفة في أنهي مدينة؟', ['دبي', 'القاهرة', 'تونس'], 0] }] },
  { id: 'qatar', mapId: 20, n: 'قطر', en: 'Qatar', i: '🇶🇦', th: 'desert', guide: 'المرشد جاسم', hello: 'هلا والله! حياك في قطر',
    sites: [{ id: 'mia', b: 'mia', n: 'متحف الفن الإسلامي', en: 'Museum of Islamic Art', i: '🏛️', f: ['متحف كبير على البحر في الدوحة، اتفتح سنة 2008.', 'صممه المعماري المشهور آي إم باي، وجواه تحف إسلامية من بلاد كتير.'], q: ['المتحف ده في أنهي مدينة؟', ['الدوحة', 'بغداد', 'الرباط'], 0] }] },
  { id: 'kuwait', mapId: 21, n: 'الكويت', en: 'Kuwait', i: '🇰🇼', th: 'desert', guide: 'المرشد بدر', hello: 'هلا بيك! حياك في الكويت',
    sites: [{ id: 'ktowers', b: 'ktowers', n: 'أبراج الكويت', en: 'Kuwait Towers', i: '🗼', f: ['تلات أبراج على البحر عليها كور ملونة، اتفتحت سنة 1979.', 'أطول برج فيهم حوالي 187 متر، وفي الكورة الكبيرة مطعم والكورة الصغيرة بتلف!'], q: ['أبراج الكويت كام برج؟', ['تلاتة', 'واحد', 'عشرة'], 0] }] },
  { id: 'bahrain', mapId: 22, n: 'البحرين', en: 'Bahrain', i: '🇧🇭', th: 'desert', guide: 'المرشدة نورة', hello: 'أهلين! حياك في البحرين',
    sites: [{ id: 'bwtc', b: 'bwtc', n: 'مركز البحرين التجاري العالمي', en: 'Bahrain World Trade Center', i: '🌬️', f: ['برجين شكلهم زي شراع المركب، وبينهم 3 مراوح هوا كبيرة.', 'اتبنى سنة 2008، وكان من أول ناطحات السحاب في العالم اللي بتولّد كهربا من الهوا.'], q: ['المراوح اللي بين البرجين بتعمل إيه؟', ['بتولّد كهربا', 'بتبرّد الشارع', 'للزينة بس'], 0] }] },
  { id: 'oman', mapId: 23, n: 'عُمان', en: 'Oman', i: '🇴🇲', th: 'desert', guide: 'المرشد سالم', hello: 'حياك الله في عُمان',
    sites: [{ id: 'nizwa', b: 'nizwa', n: 'قلعة نزوى', en: 'Nizwa Fort', i: '🏰', f: ['قلعة قديمة في مدينة نزوى، فيها برج دايري ضخم.', 'اتبنت في القرن السابع عشر، وكانت بتحمي المدينة وسوقها ومزارع النخل.'], q: ['أشهر حاجة في قلعة نزوى؟', ['البرج الدايري الضخم', 'ساعة كبيرة', 'نافورة'], 0] }] },
  { id: 'yemen', mapId: 24, n: 'اليمن', en: 'Yemen', i: '🇾🇪', th: 'desert', guide: 'المرشد عبدالله', hello: 'مرحبا بك في اليمن السعيد',
    sites: [{ id: 'shibam', b: 'shibam', n: 'مدينة شبام', en: 'Shibam, Hadramaut', i: '🏘️', f: ['مدينة بيوتها عالية ومبنية من الطين، اسمها «مانهاتن الصحرا».', 'في قائمة اليونسكو من سنة 1982، وأغلب بيوتها عمرها مئات السنين.'], q: ['بيوت شبام مبنية من إيه؟', ['الطين', 'الإزاز', 'الحديد'], 0] }] },
  { id: 'iraq', mapId: 25, n: 'العراق', en: 'Iraq', i: '🇮🇶', th: 'desert', guide: 'المرشد علي', hello: 'هلا بيك! حياك في العراق',
    sites: [{ id: 'ur', b: 'ur', n: 'زقورة أور', en: 'Ziggurat of Ur', i: '🧱', f: ['معبد مدرّج ضخم بناه السومريين من حوالي 4000 سنة.', 'اتبنى بالطوب، وليه سلالم طويلة بتطلع لفوق. العراق بلد الحضارات القديمة: سومر وبابل وآشور.'], q: ['مين اللي بنى زقورة أور؟', ['السومريين', 'الرومان', 'الفايكنج'], 0] }] },
  { id: 'jordan', mapId: 26, n: 'الأردن', en: 'Jordan', i: '🇯🇴', th: 'desert', guide: 'المرشد زيد', hello: 'يا هلا فيك! أهلاً في الأردن',
    sites: [{ id: 'petra', b: 'petra', n: 'الخزنة في البتراء', en: 'Al-Khazneh, Petra', i: '🏛️', f: ['مبنى منحوت جوه جبل صخر وردي، نحته الأنباط من حوالي 2000 سنة.', 'البتراء من عجايب الدنيا السبع الجديدة، وبتوصلها من ممر ضيق اسمه السيق.'], q: ['الخزنة منحوتة في إيه؟', ['جبل صخر', 'جبل تلج', 'شجرة'], 0] }] },
  { id: 'palestine', mapId: 27, n: 'فلسطين', en: 'Palestine', i: '🇵🇸', th: 'med', guide: 'المرشد يوسف', hello: 'أهلاً وسهلاً في فلسطين', holy: true,
    sites: [{ id: 'aqsa', b: 'aqsa', holy: true, n: 'المسجد الأقصى وقبة الصخرة', en: 'Al-Aqsa Mosque & Dome of the Rock', i: '🕌', f: ['المسجد الأقصى في القدس، تالت أقدس مكان عند المسلمين.', 'قبة الصخرة بقبتها الدهبي اتبنت سنة 691 تقريبًا، ومن أجمل المباني في التاريخ.'], q: ['قبة الصخرة في أنهي مدينة؟', ['القدس', 'دمشق', 'عمّان'], 0] }] },
  { id: 'lebanon', mapId: 28, n: 'لبنان', en: 'Lebanon', i: '🇱🇧', th: 'med', guide: 'المرشدة ريتا', hello: 'أهلين فيك بلبنان',
    sites: [{ id: 'baalbek', b: 'baalbek', n: 'قلعة بعلبك', en: 'Baalbek Temples', i: '🏛️', f: ['معابد رومانية ضخمة من حوالي 2000 سنة، أعمدتها من أطول الأعمدة في العالم.', 'في قائمة اليونسكو من سنة 1984. وشجرة الأرز هي رمز لبنان، وموجودة على علمه.'], q: ['إيه الشجرة اللي على علم لبنان؟', ['الأرز', 'النخلة', 'التفاح'], 0] }] },
  { id: 'syria', mapId: 29, n: 'سوريا', en: 'Syria', i: '🇸🇾', th: 'med', guide: 'المرشد سامر', hello: 'أهلاً وسهلاً بسوريا',
    sites: [{ id: 'aleppo', b: 'aleppo', n: 'قلعة حلب', en: 'Citadel of Aleppo', i: '🏰', f: ['قلعة ضخمة فوق تل عالي في وسط مدينة حلب، من أقدم وأكبر القلاع في العالم.', 'بتدخلها من جسر طويل وبوابة عظيمة، ومدينة حلب القديمة في قائمة اليونسكو.'], q: ['قلعة حلب مبنية فين؟', ['فوق تل', 'في البحر', 'تحت الأرض'], 0] }] },
  { id: 'morocco', mapId: 30, n: 'المغرب', en: 'Morocco', i: '🇲🇦', th: 'med', guide: 'المرشد يونس', hello: 'مرحبا بيك فالمغرب', holy: true,
    sites: [{ id: 'hassan2', b: 'hassan2', holy: true, n: 'مسجد الحسن الثاني', en: 'Hassan II Mosque', i: '🕌', f: ['مسجد ضخم في الدار البيضاء على المحيط الأطلسي، وجزء منه مبني فوق المية.', 'مئذنته طولها حوالي 210 متر، من أطول المآذن في العالم. اتبنى سنة 1993.'], q: ['مسجد الحسن الثاني على أنهي محيط؟', ['الأطلسي', 'الهادي', 'المتجمد'], 0] }] },
  { id: 'algeria', mapId: 31, n: 'الجزائر', en: 'Algeria', i: '🇩🇿', th: 'med', guide: 'المرشد أمين', hello: 'مرحبا بيك في الجزائر',
    sites: [{ id: 'maqam', b: 'maqam', n: 'مقام الشهيد', en: "Martyrs' Memorial (Maqam Echahid)", i: '🌴', f: ['نصب تذكاري في العاصمة الجزائر، شكله 3 سعفات نخل واقفين جنب بعض.', 'طوله حوالي 92 متر، واتبنى سنة 1982 تكريمًا لشهداء استقلال الجزائر.'], q: ['مقام الشهيد شكله زي إيه؟', ['سعف نخل', 'سفينة', 'هرم'], 0] }] },
  { id: 'tunisia', mapId: 32, n: 'تونس', en: 'Tunisia', i: '🇹🇳', th: 'med', guide: 'المرشدة مريم', hello: 'مرحبا بيك في تونس',
    sites: [{ id: 'eljem', b: 'eljem', n: 'مسرح الجم', en: 'Amphitheatre of El Jem', i: '🏟️', f: ['مسرح روماني ضخم مدوّر، اتبنى من حوالي 1800 سنة.', 'كان بيساع حوالي 35 ألف متفرج، ومن أكبر المسارح الرومانية في العالم. في اليونسكو من سنة 1979.'], q: ['مسرح الجم بناه مين؟', ['الرومان', 'الفراعنة', 'الصينيين'], 0] }] },
  { id: 'libya', mapId: 33, n: 'ليبيا', en: 'Libya', i: '🇱🇾', th: 'desert', guide: 'المرشد مفتاح', hello: 'مرحبا بيك في ليبيا',
    sites: [{ id: 'leptis', b: 'leptis', n: 'لبدة الكبرى', en: 'Leptis Magna', i: '🏛️', f: ['مدينة رومانية قديمة على البحر المتوسط، من أحسن المدن الرومانية المحفوظة في العالم.', 'فيها قوس النصر وأعمدة ومسرح، ومسجلة في اليونسكو من سنة 1982.'], q: ['لبدة الكبرى على أنهي بحر؟', ['البحر المتوسط', 'البحر الأحمر', 'بحر الشمال'], 0] }] },
  { id: 'sudan', mapId: 34, n: 'السودان', en: 'Sudan', i: '🇸🇩', th: 'desert', guide: 'المرشد عثمان', hello: 'مرحب بيك في السودان',
    sites: [{ id: 'meroe', b: 'meroe', n: 'أهرامات مروي', en: 'Pyramids of Meroë', i: '🔺', f: ['أهرامات صغيرة ومدببة بناها ملوك مملكة كوش القديمة.', 'في السودان أهرامات أكتر من أي بلد تانية في العالم! ومروي في اليونسكو من سنة 2011.'], q: ['أهرامات مروي شكلها إزاي؟', ['صغيرة ومدببة', 'مدورة', 'مربعة من غير قمة'], 0] }] },
  { id: 'mauritania', mapId: 35, n: 'موريتانيا', en: 'Mauritania', i: '🇲🇷', th: 'desert', guide: 'المرشد سيدي', hello: 'مرحبا بيك في موريتانيا',
    sites: [{ id: 'chinguetti', b: 'chinguetti', n: 'مدينة شنقيط القديمة', en: 'Ancient Chinguetti', i: '📜', f: ['مدينة قديمة في الصحرا، بيوتها من الحجر، ومشهورة بمكتباتها.', 'في مكتباتها كتب ومخطوطات قديمة جدًا، والمدينة في قائمة اليونسكو.'], q: ['شنقيط مشهورة بإيه؟', ['المكتبات والمخطوطات', 'ناطحات السحاب', 'التلج'], 0] }] },
  { id: 'somalia', mapId: 36, n: 'الصومال', en: 'Somalia', i: '🇸🇴', th: 'green', guide: 'المرشدة فاطمة', hello: 'سو داوو! أهلاً في الصومال',
    sites: [{ id: 'lido', b: 'lido', n: 'شاطئ ليدو في مقديشو', en: 'Lido Beach, Mogadishu', i: '🏖️', f: ['مقديشو عاصمة الصومال، على المحيط الهندي، وشاطئ ليدو من أشهر شواطئها.', 'الصومال عندها أطول ساحل في قارة أفريقيا!'], q: ['الصومال على أنهي محيط؟', ['المحيط الهندي', 'المحيط الأطلسي', 'المحيط المتجمد'], 0] }] },
  { id: 'djibouti', mapId: 37, n: 'جيبوتي', en: 'Djibouti', i: '🇩🇯', th: 'salt', guide: 'المرشد إدريس', hello: 'أهلاً بيك في جيبوتي',
    sites: [{ id: 'assal', b: 'assal', n: 'بحيرة عسل', en: 'Lake Assal', i: '🧂', f: ['بحيرة مالحة جدًا، أعمق من مستوى البحر بحوالي 155 متر.', 'هي أوطى نقطة في قارة أفريقيا، وحواليها ملح أبيض زي التلج!'], q: ['بحيرة عسل طعمها إيه؟', ['مالحة جدًا', 'مسكّرة', 'زي العصير'], 0] }] },
  { id: 'comoros', mapId: 38, n: 'جزر القمر', en: 'Comoros', i: '🇰🇲', th: 'green', guide: 'المرشدة عائشة', hello: 'أهلاً بيك في جزر القمر',
    sites: [{ id: 'karthala', b: 'karthala', n: 'بركان كارتالا', en: 'Mount Karthala', i: '🌋', f: ['بركان نشط على جزيرة القمر الكبرى، ارتفاعه حوالي 2361 متر.', 'جزر القمر جزر جميلة في المحيط الهندي، مشهورة بالزهور والفانيليا.'], q: ['كارتالا يبقى إيه؟', ['بركان', 'نهر', 'برج'], 0] }] },
];
export const CBY = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));
const CSS = `
.arUI{position:fixed;inset:0;z-index:25;display:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif;color:#2a1c5a}
.arUI.on{display:block}
.arUI .pan{position:absolute;left:50%;top:12px;bottom:12px;transform:translateX(-50%);width:min(94vw,580px);background:linear-gradient(#fbf8ff,#efe6ff);border:4px solid #7a5cff;border-radius:24px;box-shadow:0 8px 0 #4b2fc4,0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
.arUI .hd{background:linear-gradient(#8f6dff,#5b3be0);color:#fff;padding:10px 14px 8px;display:flex;align-items:center;gap:10px}
.arUI .hd b{flex:1;font-size:clamp(17px,3.2vh,24px);font-weight:900;line-height:1.25}.arUI .hd small{display:block;font-size:12px;opacity:.95;font-weight:700}
.arUI .x{width:40px;height:40px;border-radius:50%;background:linear-gradient(#ff7ab8,#e33d8c);color:#fff;font-size:20px;font-weight:900;box-shadow:0 3px 0 #a81f5e;flex:none;border:0}
.arUI .bd{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.arUI .big{font-size:60px;text-align:center;line-height:1.1}.arUI .en{text-align:center;font-weight:800;color:#5b3be0;direction:ltr}
.arUI .fact{background:#fff;border:2px solid #ddd0ff;border-radius:14px;padding:8px 12px;font-weight:800;font-size:clamp(14px,2.6vh,17px);line-height:1.6}
.arUI .qz{background:#fff8dc;border:3px solid #ffcc33;border-radius:16px;padding:10px;display:flex;flex-direction:column;gap:6px}
.arUI .opt,.arUI .grid button{border-radius:12px;padding:8px 12px;font-weight:900;font-size:15px;background:#fff;border:3px solid #c9b8ff;color:#3b2a8a;font-family:inherit;cursor:pointer}
.arUI .opt.good{background:#c9f7d6;border-color:#2fb44a}.arUI .opt.bad{background:#ffd6de;border-color:#e8213d}
.arUI .stamp{background:#eefbf2;border:3px dashed #2fb44a;border-radius:16px;padding:8px;text-align:center;font-weight:900}
.arUI .holy{background:#f2fbf6;border:2px solid #9ad6b2;border-radius:14px;padding:8px 12px;font-weight:800;font-size:14px;text-align:center}
.arUI .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
.arUI .grid button{display:flex;flex-direction:column;align-items:center;gap:2px}.arUI .grid button b{font-size:28px}.arUI .grid button.st{background:#eefbf2;border-color:#2fb44a}
.arUI .btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px}
.arUI .ok,.arUI .snd{border:0;border-radius:14px;padding:10px;font-weight:900;font-size:16px;font-family:inherit;color:#fff}
.arUI .ok{background:linear-gradient(#6ee37f,#2fb44a);box-shadow:0 4px 0 #1d7f31}.arUI .snd{background:linear-gradient(#8f6dff,#5b3be0);box-shadow:0 4px 0 #3b22a8}.arUI .snd.on{background:linear-gradient(#ff8ac4,#ef4e98);box-shadow:0 4px 0 #b32466}
`;

export function buildArab(C) {
  const { toon, ctex } = C, OFF = ARAB_OFF, B = 92;
  const st = () => { const S = C.S; if (!S.arab || typeof S.arab !== 'object') S.arab = {}; const m = S.arab; for (const k of ['stamps', 'right', 'coins', 'visited']) if (!Array.isArray(m[k])) m[k] = []; if (m.voice === undefined) m.voice = 1; return m; };
  { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  const ui = document.createElement('div'); ui.className = 'arUI'; ui.id = 'arP'; ui.setAttribute('dir', 'rtl'); document.body.appendChild(ui);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let cur = null, G = null; const camBlock = [], OWN_S = [], OWN_C = [];
  let NPC = [], COINS = [], CHEST = null, SITES_AT = [], ANIM = [], HOLY = [];

  // ---------- builder helpers (all in the current country's group) ----------
  function vox(list, opt = {}) { const by = {}; for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); } for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), opt.basic ? new THREE.MeshBasicMaterial({ color: c, toneMapped: false }) : toon(c)); m.castShadow = opt.shadow !== false; m.receiveShadow = true; G.add(m); if (opt.block) camBlock.push(m); } }
  const mesh = (geo, col, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, o.mat || toon(col, o.em ? { emissive: o.em, emissiveIntensity: o.ei || 0.4 } : undefined)); m.position.set(x, y, z); if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; m.castShadow = true; m.receiveShadow = true; G.add(m); if (o.block) camBlock.push(m); return m; };
  const solid = (x0, x1, z0, z1) => { const o = { x0: OFF + Math.min(x0, x1), x1: OFF + Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; C.solids.push(o); OWN_S.push(o); };
  const circ = (x, z, r) => { const o = { x: OFF + x, z, r }; C.circles.push(o); OWN_C.push(o); };
  const unpush = (arr, own) => { const set = new Set(own); for (let i = arr.length - 1; i >= 0; i--) if (set.has(arr[i])) arr.splice(i, 1); own.length = 0; };
  function textTex(lines, o = {}) { const w = o.w || 512, h = o.h || 128; const t = ctex(w, h, (g) => { if (o.bg) { g.fillStyle = o.bg; rr(g, 4, 4, w - 8, h - 8, o.r == null ? 22 : o.r); g.fill(); if (o.border) { g.lineWidth = 8; g.strokeStyle = o.border; g.stroke(); } } g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length; lines.forEach(([tx, px, col, stroke], i) => { g.font = `900 ${px}px Cairo, Tajawal, "Segoe UI", sans-serif`; g.direction = /[؀-ۿ]/.test(tx) ? 'rtl' : 'ltr'; const y = h * (i + 0.5) / n; if (stroke) { g.lineWidth = px * 0.18; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(tx, w / 2, y, w - 30); } g.fillStyle = col; g.fillText(tx, w / 2, y, w - 30); }); }); t.anisotropy = 4; return t; }
  const sign = (tex, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const label = (t, x, y, z, ry = 0, w = 5) => sign(textTex([[t, 50, '#ffffff']], { w: 600, h: 110, bg: '#5b3be0', border: '#ffffff', r: 18 }), w, w * 110 / 600, x, y, z, ry);
  const palm = (x, z, h = 5) => { vox([[x, h / 2, z, 0.6, h, 0.6, '#8a5a2b'], [x, h + 0.2, z, 3.2, 0.5, 0.9, '#3ea83a'], [x, h + 0.2, z, 0.9, 0.5, 3.2, '#3ea83a'], [x, h + 0.6, z, 2, 0.5, 2, '#58c04a']]); circ(x, z, 0.45); };
  const tree = (x, z, c = '#3ea83a') => { vox([[x, 1.2, z, 0.5, 2.4, 0.5, '#8a5a2b'], [x, 3, z, 2.6, 2, 2.6, c], [x, 4.1, z, 1.6, 1, 1.6, '#58c04a']]); circ(x, z, 0.4); };
  const cedar = (x, z) => { vox([[x, 1.5, z, 0.6, 3, 0.6, '#7a4a22'], [x, 3, z, 5, 0.8, 5, '#2f7a3a'], [x, 4.2, z, 3.8, 0.8, 3.8, '#2f8a3f'], [x, 5.4, z, 2.6, 0.8, 2.6, '#35994a'], [x, 6.4, z, 1.2, 0.8, 1.2, '#3daa52']]); circ(x, z, 0.5); };
  const colm = (L, x, z, h, w = 1.4, c = '#e8d6b0') => { L.push([x, 0.3, z, w + 0.6, 0.6, w + 0.6, c], [x, h / 2 + 0.3, z, w, h, w, c], [x, h + 0.5, z, w + 0.6, 0.6, w + 0.6, c]); };
  const hgt = (L, x, z, w, d, h, c) => { L.push([x, h / 2, z, w, h, d, c]); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); };

  // ---------- the landmark builders (centre x, z; they return where the info point is) ----------
  const LB = {
    burj: (x, z) => { const L = [[x, 1, z, 18, 2, 18, '#dfe6ee']]; let w = 9; for (let i = 0; i < 42; i++) { if (i % 6 === 5) w *= 0.84; L.push([x, 2 + i * 2 + 1, z, w, 2, w, i % 2 ? '#bcd4ec' : '#a6c3e0']); for (const s of [-1, 1]) if (i % 6 === 0) L.push([x + s * w * 0.6, 2 + i * 2 + 1, z, w * 0.3, 2, w * 0.5, '#c6dbef']); } L.push([x, 88, z, 0.6, 10, 0.6, '#e9eef5']); vox(L, { block: true }); solid(x - 9, x + 9, z - 9, z + 9); return [x, z + 12]; },
    mia: (x, z) => { const L = [[x, 0.5, z, 26, 1, 26, '#efe6d2']]; [[18, 8], [14, 6], [10, 6], [7, 4]].reduce((y, [w, h]) => { L.push([x, y + h / 2, z, w, h, w, '#f3ecdb']); return y + h; }, 1); L.push([x, 25.5, z, 3, 3, 3, '#e3d6b6'], [x, 10, z + 9.05, 4, 8, 0.2, '#6b5a3a'], [x, 15, z + 7.05, 3, 2, 0.2, '#6b5a3a']); vox(L, { block: true }); hgt([], x, z, 18, 18, 1, '#000'); return [x, z + 13]; },
    ktowers: (x, z) => { const L = []; const tw = (tx, h, r1, r2, y1, y2) => { mesh(new THREE.CylinderGeometry(0.3, 1.6, h, 10), '#d9dde6', tx, h / 2, z); mesh(new THREE.SphereGeometry(r1, 18, 12), '#1f6fb8', tx, y1, z, { em: '#0d3f80', ei: 0.2 }); if (r2) mesh(new THREE.SphereGeometry(r2, 16, 10), '#1f6fb8', tx, y2, z, { em: '#0d3f80', ei: 0.2 }); circ(tx, z, 1.8); }; tw(x, 62, 7, 4.2, 28, 46); tw(x + 14, 48, 6, 0, 30, 0); tw(x - 10, 34, 0, 0, 0, 0); return [x, z + 10]; },
    bwtc: (x, z) => { for (const s of [-1, 1]) { const g = new THREE.Group(); const L2 = []; for (let i = 0; i < 25; i++) { const w = 9 * (1 - i / 32); L2.push([0, i * 2.4 + 1.2, 0, w, 2.4, 10 - i * 0.2, i % 2 ? '#a9c9e6' : '#cfe0f0']); } const geos = L2.map(([a, b, c, w, h, d]) => { const gg = new THREE.BoxGeometry(w, h, d); gg.translate(a, b, c); return gg; }); const m = new THREE.Mesh(mergeGeometries(geos), toon('#bcd6ee')); g.add(m); g.position.set(x + s * 10, 0, z); g.rotation.y = s * 0.35; G.add(g); camBlock.push(m); solid(x + s * 10 - 5, x + s * 10 + 5, z - 6, z + 6); } for (const y of [14, 28, 42]) { mesh(new THREE.BoxGeometry(14, 0.6, 1), '#e9eef5', x, y, z); const r = new THREE.Group(); for (let k = 0; k < 3; k++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 0.15), toon('#ffffff')); bl.position.y = 2.6; const p = new THREE.Group(); p.add(bl); p.rotation.z = k * 2.094; r.add(p); } r.position.set(x, y, z + 0.7); G.add(r); ANIM.push((t) => (r.rotation.z = t * 2)); } return [x, z + 12]; },
    nizwa: (x, z) => { const L = []; mesh(new THREE.CylinderGeometry(13, 14, 22, 24), '#c99a64', x, 11, z, { block: true }); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; L.push([x + Math.cos(a) * 12.6, 22.8, z + Math.sin(a) * 12.6, 1.4, 1.6, 1.4, '#c99a64']); } L.push([x, 2.2, z + 13.4, 3, 4.4, 1, '#6b3a1a']); hgt(L, x - 20, z + 4, 18, 10, 9, '#d2a670'); hgt(L, x + 20, z + 4, 18, 10, 9, '#d2a670'); vox(L, { block: true }); circ(x, z, 13.6); for (const dx of [-30, -26, 26, 30]) palm(x + dx, z + 16); return [x, z + 17]; },
    shibam: (x, z) => { const L = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const bx = x - 18 + i * 9, bz = z - 6 + j * 9, h = 18 + ((i * 7 + j * 5) % 12); L.push([bx, h / 2, bz, 7.6, h, 7.6, j % 2 ? '#c9a274' : '#d4ad7e'], [bx, h + 0.3, bz, 7.8, 0.6, 7.8, '#f1ece0']); for (let f = 2; f < h; f += 3) L.push([bx - 2, f, bz + 3.85, 1, 1.2, 0.1, '#4a2a12'], [bx + 2, f, bz + 3.85, 1, 1.2, 0.1, '#4a2a12'], [bx, f + 0.8, bz + 3.86, 6.4, 0.3, 0.1, '#f1ece0']); } hgt(L, x, z + 3, 46, 28, 1, '#c9a274'); L.push([x, 2, z + 17.5, 46, 4, 1, '#c9a274']); vox(L, { block: true }); solid(x - 23, x + 23, z - 11, z + 18); return [x, z + 21]; },
    ur: (x, z) => { const L = []; [[40, 30, 6], [30, 22, 5], [20, 14, 5]].reduce((y, [w, d, h]) => { L.push([x, y + h / 2, z, w, h, d, '#c08a55']); for (let i = 0; i < w / 2; i++) L.push([x - w / 2 + 1 + i * 2, y + h / 2, z + d / 2 + 0.1, 0.8, h - 0.4, 0.2, '#a8743f']); return y + h; }, 0); L.push([x, 17, z, 10, 2, 8, '#a8743f']); for (let i = 0; i < 14; i++) L.push([x, 0.4 + i * 0.6, z + 15 + 10 - i * 0.9, 4, 0.6, 1, '#d4a06a']); vox(L, { block: true }); solid(x - 20, x + 20, z - 15, z + 15); return [x + 8, z + 18]; },
    petra: (x, z) => { const L = []; for (let i = 0; i < 12; i++) L.push([x - 30 + i * 5.5, 14, z - 4 + (i % 3), 6, 28, 12, i % 2 ? '#d98e7a' : '#c97a66']); L.push([x, 9, z + 2.4, 22, 18, 1, '#e4a08a'], [x, 19, z + 2.6, 22, 2, 1.2, '#d08a74'], [x, 24, z + 2.4, 18, 8, 1, '#e4a08a']); for (const cx of [-8, -3, 3, 8]) L.push([x + cx, 7, z + 3.2, 1.6, 14, 1.6, '#f0b49c']); for (const cx of [-7, 7]) L.push([x + cx, 24, z + 3, 1.4, 7, 1.4, '#f0b49c']); L.push([x, 4, z + 3, 3, 8, 0.4, '#4a2a22'], [x, 27, z + 3, 3, 3, 1.8, '#f0b49c']); vox(L, { block: true }); solid(x - 33, x + 33, z - 10, z + 3.6); return [x, z + 9]; },
    aqsa: (x, z) => { const L = [[x, 0.6, z, 34, 1.2, 34, '#efe8d8']]; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; L.push([x + Math.cos(a) * 8.6, 4.4, z + Math.sin(a) * 8.6, 7, 7.2, 0.8, i % 2 ? '#2b6bd6' : '#3a7be0']); } vox(L); mesh(new THREE.CylinderGeometry(9.3, 9.3, 7.2, 8), '#2f74d8', x, 4.4, z, { block: true }); mesh(new THREE.CylinderGeometry(5, 5, 2.4, 20), '#2f74d8', x, 9.2, z); const d = mesh(new THREE.SphereGeometry(5, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), '#f2c234', x, 10.4, z, { em: '#c99a10', ei: 0.3 }); d.scale.y = 1.25; vox([[x, 17.4, z, 0.3, 1.4, 0.3, '#f2c234']]); vox([[x + 22, 3, z - 14, 16, 6, 10, '#e9dfc9'], [x + 22, 6.4, z - 14, 16.6, 0.8, 10.6, '#cfc3a8']]); mesh(new THREE.SphereGeometry(2.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#7b8a99', x + 22, 6.8, z - 14); solid(x - 19, x + 32, z - 20, z + 17); HOLY.push([x, z, 34]); return [x, z + 21]; },
    baalbek: (x, z) => { const L = [[x, 1, z, 40, 2, 18, '#e1caa0']]; for (let i = 0; i < 6; i++) colm(L, x - 12.5 + i * 5, z - 4, 20, 1.8, '#e8d4ae'); L.push([x, 23, z - 4, 30, 2.4, 3, '#dcc49a']); for (let i = 0; i < 4; i++) colm(L, x - 9 + i * 6, z + 6, 10, 1.4, '#d8c39d'); vox(L, { block: true }); solid(x - 20, x + 20, z - 9, z + 9); for (const dx of [-30, 30, -36, 36]) cedar(x + dx, z + 14); return [x, z + 12]; },
    aleppo: (x, z) => { const L = []; for (let i = 0; i < 6; i++) { const r = 30 - i * 3.4; L.push([x, i * 2 + 1, z, r * 2 * 0.9, 2, r * 1.8, i % 2 ? '#cbb184' : '#c2a676']); } L.push([x, 15, z, 34, 6, 28, '#d8c39a']); for (let i = 0; i < 9; i++) L.push([x - 16 + i * 4, 18.8, z + 13.6, 2, 1.6, 1, '#d8c39a'], [x - 16 + i * 4, 18.8, z - 13.6, 2, 1.6, 1, '#d8c39a']); L.push([x, 8, z + 30, 9, 16, 7, '#d8c39a'], [x, 4, z + 33.6, 3, 5, 0.2, '#4a2a12']); for (let i = 0; i < 8; i++) L.push([x, 1 + i * 1.5, z + 30 + 4 + (8 - i) * 2.2 - 16 + 18, 4, 0.8, 2.2, '#bda577']); vox(L, { block: true }); solid(x - 28, x + 28, z - 26, z + 26); solid(x - 4.5, x + 4.5, z + 26, z + 34); return [x + 8, z + 38]; },
    hassan2: (x, z) => { const L = [[x, 0.6, z, 40, 1.2, 30, '#f3efe6'], [x - 4, 5, z, 28, 8, 22, '#f6f2ea'], [x - 4, 9.3, z, 28.6, 0.8, 22.6, '#2f9a74']]; for (let i = 0; i < 8; i++) L.push([x - 16 + i * 3.6, 3.4, z + 11.05, 2.2, 5, 0.2, '#c9b78f']); const H = 60; for (let i = 0; i < H / 3; i++) L.push([x + 14, i * 3 + 1.5, z - 6, 6, 3, 6, i % 4 === 3 ? '#2f9a74' : '#efe6d4']); L.push([x + 14, H + 2, z - 6, 4, 4, 4, '#2f9a74'], [x + 14, H + 5, z - 6, 0.5, 3, 0.5, '#f2c234']); vox(L, { block: true }); solid(x - 20, x + 20, z - 15, z + 15); HOLY.push([x, z, 30]); return [x, z + 19]; },
    maqam: (x, z) => { const L = [[x, 1, z, 22, 2, 22, '#dcd6ca']]; vox(L); for (let k = 0; k < 3; k++) { const a = k * 2.094 + Math.PI / 2; const g = new THREE.Group(); const geos = []; for (let i = 0; i < 24; i++) { const gg = new THREE.BoxGeometry(5 - i * 0.12, 2.2, 1.2); gg.translate(0, 2 + i * 2.1, 3 + Math.sin(i / 24 * Math.PI) * 1.4 - i * 0.02); geos.push(gg); } const m = new THREE.Mesh(mergeGeometries(geos), toon('#e8e2d6')); g.add(m); g.rotation.y = a; g.position.set(x, 0, z); G.add(g); camBlock.push(m); } mesh(new THREE.CylinderGeometry(3, 3, 4, 12), '#d0c8b8', x, 4, z); solid(x - 6, x + 6, z - 6, z + 6); return [x, z + 14]; },
    eljem: (x, z) => { const R1 = 22, R2 = 14, N = 40; const geos = []; for (let lv = 0; lv < 3; lv++) for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, gx = Math.cos(a) * R1, gz = Math.sin(a) * R1 * 0.8; const gg = new THREE.BoxGeometry(3.2, 5, 1.6); gg.rotateY(-a); gg.translate(gx, 2.5 + lv * 5.2, gz); if (!(i % 2 === 1 && lv < 3)) geos.push(gg); else { const p1 = new THREE.BoxGeometry(0.9, 5, 1.6); p1.rotateY(-a); p1.translate(gx, 2.5 + lv * 5.2, gz); geos.push(p1); const top = new THREE.BoxGeometry(3.2, 1, 1.6); top.rotateY(-a); top.translate(gx, 4.5 + lv * 5.2, gz); geos.push(top); } } const m = new THREE.Mesh(mergeGeometries(geos), toon('#d9b47a')); m.position.set(x, 0, z); G.add(m); camBlock.push(m); const ar = new THREE.Mesh(new THREE.CylinderGeometry(R2, R2, 0.3, 32), toon('#e8cf9c')); ar.scale.z = 0.8; ar.position.set(x, 0.2, z); G.add(ar); for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.05) continue; circ(x + Math.cos(a) * R1, z + Math.sin(a) * R1 * 0.8, 1.8); } return [x, z + R1 * 0.8 + 4]; },
    leptis: (x, z) => { const L = [[x, 0.5, z, 36, 1, 26, '#e3cfa6']]; L.push([x, 7, z + 6, 12, 14, 12, '#dcc09a'], [x, 4, z + 6, 5, 8, 12.2, '#8a7350'], [x, 4, z + 6, 12.2, 8, 5, '#8a7350'], [x, 15, z + 6, 13, 2, 13, '#cfb38a']); for (let i = 0; i < 7; i++) colm(L, x - 15 + i * 5, z - 8, 9, 1.2, '#e6d2ac'); L.push([x, 10, z - 8, 32, 1.4, 2.4, '#d8c39d']); for (let i = 0; i < 5; i++) colm(L, x - 16, z - 4 + i * 4, 6 + (i % 2) * 2, 1.1, '#e0caa0'); vox(L, { block: true }); solid(x - 6, x - 2.5, z, z + 12); solid(x + 2.5, x + 6, z, z + 12); for (let i = 0; i < 7; i++) circ(x - 15 + i * 5, z - 8, 1.2); return [x, z + 16]; },
    meroe: (x, z) => { for (let i = 0; i < 9; i++) { const px = x - 24 + (i % 5) * 12 + (i > 4 ? 6 : 0), pz = z - 6 + (i > 4 ? 14 : 0), h = 12 + (i * 5 % 7), b = 6 + (i % 3); const L = []; for (let k = 0; k < h / 1.2; k++) { const w = b * (1 - k / (h / 1.2)); L.push([px, k * 1.2 + 0.6, pz, w, 1.2, w, k % 2 ? '#a8603a' : '#b86c42']); } L.push([px, 2, pz + b / 2 + 1.5, b * 0.6, 4, 3, '#a8603a']); vox(L, { block: true }); solid(px - b / 2, px + b / 2, pz - b / 2, pz + b / 2 + 3); } return [x, z + 22]; },
    chinguetti: (x, z) => { const L = []; for (let i = 0; i < 8; i++) { const hx = x - 24 + (i % 4) * 14, hz = z - 6 + Math.floor(i / 4) * 14; hgt(L, hx, hz, 10, 9, 5 + (i % 3), i % 2 ? '#b88b5c' : '#c49a6a'); L.push([hx, 2, hz + 4.55, 1.6, 3, 0.1, '#5a2e12']); } L.push([x + 26, 9, z - 14, 5, 18, 5, '#b07f50'], [x + 26, 18.6, z - 14, 3, 1.2, 3, '#b07f50']); hgt(L, x + 26, z - 14, 5, 5, 1, '#b07f50'); L.push([x - 4, 0.5, z + 20, 6, 1, 4, '#8a5a2b'], [x - 4, 1.3, z + 20, 1.6, 0.6, 1.2, '#f1e6c8'], [x - 2.4, 1.3, z + 20, 1.2, 0.8, 1, '#c8203c']); solid(x - 7, x - 1, z + 18, z + 22); vox(L, { block: true }); return [x - 4, z + 25]; },
    lido: (x, z) => { const sand = new THREE.Mesh(new THREE.PlaneGeometry(90, 30), toon('#f7e6bd')); sand.rotation.x = -Math.PI / 2; sand.position.set(x, 0.07, z - 6); G.add(sand); const L = []; for (let i = 0; i < 9; i++) { const ux = x - 36 + i * 9; L.push([ux, 1.3, z - 4, 0.15, 2.6, 0.15, '#ffffff'], [ux, 2.7, z - 4, 3, 0.25, 3, ['#2fa6e8', '#ffffff', '#ffd23f'][i % 3]]); } hgt(L, x + 30, z + 12, 14, 10, 7, '#ffffff'); L.push([x + 30, 7.4, z + 12, 14.6, 0.8, 10.6, '#2fa6e8'], [x - 32, 6, z + 14, 3, 12, 3, '#ffffff'], [x - 32, 12.8, z + 14, 2, 1.6, 2, '#ffd23f']); hgt([], x - 32, z + 14, 3, 3, 1, '#000'); vox(L); for (let i = 0; i < 8; i++) palm(x - 35 + i * 10, z + 6); return [x, z + 2]; },
    assal: (x, z) => { const lake = new THREE.Mesh(new THREE.CircleGeometry(24, 40), new THREE.MeshToonMaterial({ color: '#36c6d8', emissive: '#138a9c', emissiveIntensity: 0.3 })); lake.rotation.x = -Math.PI / 2; lake.position.set(x, 0.08, z - 8); G.add(lake); const salt = new THREE.Mesh(new THREE.RingGeometry(24, 31, 40), toon('#ffffff')); salt.rotation.x = -Math.PI / 2; salt.position.set(x, 0.07, z - 8); G.add(salt); circ(x, z - 8, 26); const L = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; L.push([x + Math.cos(a) * 28, 0.5, z - 8 + Math.sin(a) * 28, 1.2 + (i % 3) * 0.4, 1, 1.2, '#f4f4f0']); } for (let i = 0; i < 7; i++) { const a = Math.PI + i * 0.45; L.push([x + Math.cos(a) * 44, 6, z - 8 + Math.sin(a) * 44 - 6, 14, 12, 10, i % 2 ? '#6b5a4a' : '#7d6a58']); } vox(L); return [x, z + 25]; },
    karthala: (x, z) => { const L = []; for (let i = 0; i < 14; i++) { const r = 34 - i * 2.1; L.push([x, i * 2 + 1, z - 10, r * 2, 2, r * 2, i < 5 ? (i % 2 ? '#3e9a3a' : '#48aa44') : i % 2 ? '#5a4a44' : '#4a3d38']); } L.push([x, 29, z - 10, 10, 1, 10, '#ff5a1f']); vox(L, { block: true }); solid(x - 30, x + 30, z - 40, z + 20); const smoke = []; for (let i = 0; i < 6; i++) { const s = mesh(new THREE.SphereGeometry(2.2, 10, 8), '#d8d8d8', x, 31 + i * 3, z - 10, { mat: new THREE.MeshBasicMaterial({ color: '#e6e6e6', transparent: true, opacity: 0.6, toneMapped: false }) }); smoke.push(s); } ANIM.push((t) => smoke.forEach((s, i) => { const k = (t * 0.25 + i / 6) % 1; s.position.y = 30 + k * 20; s.position.x = OFF * 0 + x + Math.sin(t + i) * 2; s.material.opacity = 0.7 * (1 - k); s.scale.setScalar(0.6 + k * 1.6); })); for (const [dx, dz] of [[-30, 22], [-22, 26], [22, 26], [30, 22], [-36, 12], [36, 12]]) palm(x + dx, z + dz); return [x, z + 24]; },
  };

  // ---------- country scene ----------
  function clear() { if (G) { C.scene.remove(G); G.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); } unpush(C.solids, OWN_S); unpush(C.circles, OWN_C); camBlock.length = 0; NPC.forEach((n) => C.scene.remove(n.k)); NPC = []; COINS = []; CHEST = null; SITES_AT = []; ANIM = []; HOLY = []; }
  function build(cid) {
    clear(); cur = CBY[cid]; const T = TH[cur.th];
    G = new THREE.Group(); G.position.x = OFF; C.scene.add(G);
    // sea + island ground
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshToonMaterial({ color: T.sea, emissive: '#1460a8', emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.3; G.add(sea);
    const tx = ctex(16, 16, (g) => { g.fillStyle = T.g; g.fillRect(0, 0, 16, 16); let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 70; i++) { g.fillStyle = T.s[(r() * T.s.length) | 0]; g.fillRect((r() * 16) | 0, (r() * 16) | 0, 1, 1); } }); tx.magFilter = THREE.NearestFilter; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(36, 36);
    const isl = new THREE.Mesh(new THREE.CircleGeometry(B + 8, 64), new THREE.MeshToonMaterial({ map: tx })); isl.rotation.x = -Math.PI / 2; isl.position.y = 0.02; isl.receiveShadow = true; G.add(isl);
    const beach = new THREE.Mesh(new THREE.RingGeometry(B + 8, B + 14, 64), toon('#f7e6bd')); beach.rotation.x = -Math.PI / 2; beach.position.y = 0.01; G.add(beach);
    const pathT = ctex(16, 16, (g) => { g.fillStyle = '#efe3cc'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d2bd96'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); }); pathT.magFilter = THREE.NearestFilter; pathT.wrapS = pathT.wrapT = THREE.RepeatWrapping; pathT.repeat.set(3, 20);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(8, 70), new THREE.MeshToonMaterial({ map: pathT })); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.04, 40); G.add(path);
    // welcome arch with the country's name
    { const L = [[-7, 4, 66, 1.6, 8, 1.6, '#ffffff'], [7, 4, 66, 1.6, 8, 1.6, '#ffffff'], [0, 8.6, 66, 16, 1.6, 1.8, '#5b3be0']]; vox(L); circ(-7, 66, 1.1); circ(7, 66, 1.1); const t = textTex([[cur.i + ' ' + cur.n, 84, '#ffffff', '#2a1c5a'], [cur.en, 40, '#ffe27a']], { w: 900, h: 230, bg: '#5b3be0', border: '#ffffff', r: 24 }); for (const s of [1, -1]) { const m = sign(t, 12, 3, 0, 11, 66 + s * 0.95); if (s < 0) m.rotation.y = Math.PI; } }
    // landmark(s)
    const s0 = cur.sites[0]; const [fx, fz] = LB[s0.b](0, -26); SITES_AT.push({ s: s0, x: fx, z: fz }); label(s0.n, fx, 2.4, fz - 1.5, 0, 5.4);
    for (let i = 1; i < cur.sites.length; i++) { const s = cur.sites[i], [px, pz] = s.at || [40 * (i % 2 ? 1 : -1), 10]; const [ix, iz] = LB[s.b](px, pz); SITES_AT.push({ s, x: ix, z: iz }); label(s.n, ix, 2.4, iz - 1.5, 0, 5); }
    // decoration around the island
    let sd = 11; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = 50 + r() * 34, x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(x) < 10 && z > 0) continue; if (Math.hypot(x, z + 26) < 46) continue; if (T.deco === 'palm') palm(x, z, 4 + r() * 2); else if (T.deco === 'olive') (cur.id === 'lebanon' ? cedar : (a, b) => tree(a, b, '#7aa84a'))(x, z); else if (T.deco === 'tree') tree(x, z); else vox([[x, 0.6, z, 2 + r() * 2, 1.2, 2, '#d8d2c4']]); }
    // houses in a local palette near the entrance
    { const L = []; const pal = T.deco === 'tree' ? ['#ffffff', '#ffd7a0', '#9fe0ff'] : T.deco === 'olive' ? ['#f3ead6', '#ffffff', '#e8d6b0'] : ['#d9b07a', '#e8c48e', '#c99a64']; [[-26, 40], [-26, 54], [26, 40], [26, 54]].forEach(([hx, hz], i) => { hgt(L, hx, hz, 10, 8, 5 + (i % 2) * 2, pal[i % 3]); L.push([hx + (hx < 0 ? 5.05 : -5.05), 1.4, hz, 0.1, 2.8, 1.4, '#6b3a1a']); }); vox(L, { block: true }); }
    // coins on the path and around, one hidden chest (never in holy places)
    const m = st(), coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 18), coinMat = toon('#ffc21a', { emissive: '#ffb300', emissiveIntensity: 0.5 });
    const spots = [[0, 56], [0, 48], [0, 40], [0, 32], [0, 24], [-14, 16], [14, 16], [-36, 30], [36, 30], [-44, -6]];
    spots.forEach(([x, z], i) => { const id = `${cur.id}${i}`; if (m.coins.includes(id) || HOLY.some(([hx, hz, hr]) => Math.hypot(x - hx, z - hz) < hr)) return; const c = new THREE.Mesh(coinGeo, coinMat); c.rotation.x = Math.PI / 2; c.position.set(x, 1, z); G.add(c); COINS.push({ id, m: c, x, z }); });
    { const id = `${cur.id}_chest`; if (!m.coins.includes(id)) { const g = new THREE.Group(); const L2 = [[0, 0.5, 0, 1.6, 1, 1.1, '#8a4b1c'], [0, 1.15, 0, 1.7, 0.4, 1.2, '#a05a24'], [0, 0.8, 0.57, 0.3, 0.4, 0.06, '#ffd23f']]; const geos = L2.map(([a, b, c, w, h, d]) => { const gg = new THREE.BoxGeometry(w, h, d); gg.translate(a, b, c); return gg; }); g.add(new THREE.Mesh(mergeGeometries(geos), toon('#9a5522'))); const [cx, cz] = [52, -40]; g.position.set(cx, 0, cz); G.add(g); CHEST = { id, g, x: cx, z: cz }; } }
    // the guide
    { const L = C.cloneLook(C.PRESETS[(cur.mapId % 4)]); Object.assign(L, { top: 'polo', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'cap', glasses: 'none', bag: 'none' }); L.c = Object.assign({}, L.c, { top: '#7a5cff', bottom: '#2a1c5a', shoes: '#ffffff' }); const k = C.makeAvatar(L); k.scale.setScalar(1.1); k.position.set(OFF + 6, 0.12, 58); k.rotation.y = Math.PI; C.scene.add(k); k.add(nameTag(cur.guide)); NPC.push({ k, nm: cur.guide, seen: false, yaw: Math.PI, bub: null, bubT: 0 }); circ(6, 58, 0.5); }
    // airport kiosk
    { const L = [[-10, 0.6, 58, 4, 1.2, 2, '#ffffff'], [-10, 2.6, 58, 4.4, 0.3, 2.6, '#2fa6e8'], [-11.9, 1.9, 58, 0.2, 1.4, 0.2, '#2fa6e8'], [-8.1, 1.9, 58, 0.2, 1.4, 0.2, '#2fa6e8']]; vox(L); solid(-12, -8, 57, 59); sign(textTex([['✈️ طيارة لولو', 64, '#ffffff', '#0d4f80']], { w: 600, h: 120, bg: '#2fa6e8', border: '#ffffff', r: 20 }), 4.4, 0.9, -10, 3.5, 59.35); }
    // island edge
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; circ(Math.cos(a) * (B + 12), Math.sin(a) * (B + 12), 7); }
  }

  // ---------- UI ----------
  const TTS = window.speechSynthesis || null; let arVoice = null;
  const pickVoice = () => { if (!TTS) return; const vs = TTS.getVoices() || []; arVoice = vs.find((v) => /^ar/i.test(v.lang)) || null; };
  if (TTS) { pickVoice(); try { TTS.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
  voLoad('ar');
  const pack = () => 'ar';
  const canSpeak = () => voReady(pack()) || !!(TTS && arVoice);
  function hush() { voStop(); try { if (TTS) TTS.cancel(); } catch (e) {} }
  function speak(text, voOnly) { text = voClean(text); if (!text) return; hush(); if (voPlay(pack(), text)) return; if (voOnly || !(TTS && arVoice)) return; try { const u = new SpeechSynthesisUtterance(text); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.95; TTS.speak(u); } catch (e) {} }
  function openUI(html) { ui.className = 'arUI on'; ui.innerHTML = html; document.body.classList.add('mallFocus'); C.setPanel('arab'); }
  function closeUI() { hush(); ui.className = 'arUI'; ui.innerHTML = ''; document.body.classList.remove('mallFocus'); C.setPanel(null); }
  const reward = (n, msg) => { C.S.coins = (C.S.coins || 0) + n; C.save(); C.updPills(); if (msg) C.toast(msg); };
  let curSite = null;
  const siteText = (s) => `${s.n}. ${s.f.join(' ')}`;
  function openSite(s) {
    const m = st(), key = `${cur.id}:${s.id}`, first = !m.stamps.includes(key); curSite = s;
    if (first) { m.stamps.push(key); reward(15); C.sfx.coin(); }
    const answered = m.right.includes(key), voice = canSpeak();
    openUI(`<div class="pan"><div class="hd"><b>${esc(s.n)}<small>${cur.i} ${esc(cur.n)} · ${esc(cur.en)}</small></b><button class="x" data-ar="close" aria-label="إغلاق">✕</button></div><div class="bd"><div class="big">${s.i}</div><div class="en">${esc(s.en)}</div>
      ${s.f.map((f) => `<div class="fact">✨ ${esc(f)}</div>`).join('')}
      ${s.holy ? '<div class="holy">🤍 مكان مقدس: نشوفه ونتعلم عنه بهدوء واحترام.</div>' : ''}
      <div class="qz"><b>❓ ${esc(s.q[0])}</b>${answered ? '<div class="stamp">✅ جاوبت صح</div>' : s.q[1].map((o, i) => `<button class="opt" data-ar="ans" data-v="${i}">${esc(o)}</button>`).join('')}</div>
      ${first ? `<div class="stamp">🛂 ختم ${esc(cur.n)} في جواز سفرك + 🪙 15</div>` : ''}</div>
      <div class="btns">${voice ? `<button class="snd ${m.voice ? 'on' : ''}" data-ar="voice">🔊 ${m.voice ? 'بيشرح دلوقتي' : 'اسمع الشرح'}</button>` : ''}<button class="ok" data-ar="close" ${voice ? '' : 'style="grid-column:1/-1"'}>تم 👍</button></div></div>`);
    if (voice && m.voice) speak(siteText(s));
  }
  function answer(i, btn) { const s = curSite, m = st(), key = `${cur.id}:${s.id}`; if (m.right.includes(key)) return; if (i === s.q[2]) { btn.classList.add('good'); m.right.push(key); reward(10, '✅ صح عليك! + 🪙 10'); C.sfx.win(); setTimeout(() => openSite(s), 700); } else { btn.classList.add('bad'); C.sfx.pop(); C.toast('❌ حاول تاني'); } }
  let onFly = null;
  function openPicker() {
    const m = st();
    openUI(`<div class="pan"><div class="hd"><b>✈️ طيارة لولو — الدول العربية<small>اختار البلد اللي عايز تسافرله · ${new Set(m.stamps.map((k) => k.split(':')[0])).size}/${COUNTRIES.length} بلد زرتها</small></b><button class="x" data-ar="close" aria-label="إغلاق">✕</button></div><div class="bd"><div class="grid">
      ${COUNTRIES.map((c) => `<button class="${m.stamps.some((k) => k.startsWith(c.id + ':')) ? 'st' : ''}" data-ar="fly" data-v="${c.id}"><b>${c.i}</b>${esc(c.n)}<small>${esc(c.sites[0].n)}</small></button>`).join('')}
      <button data-ar="fly" data-v="egypt"><b>🇪🇬</b>مصر<small>الأهرامات والغردقة ودهب</small></button><button data-ar="fly" data-v="saudi"><b>🇸🇦</b>السعودية<small>الرياض وجدة والعُلا</small></button><button data-ar="fly" data-v="city"><b>🏙️</b>مدينة لولو<small>الجولة الحرة</small></button>
      </div></div></div>`);
  }
  ui.addEventListener('click', (e) => { const b = e.target.closest('[data-ar]'); if (!b) return; C.sfx.click(); const a = b.dataset.ar, v = b.dataset.v;
    if (a === 'close') closeUI(); else if (a === 'ans') answer(+v, b); else if (a === 'fly') { closeUI(); if (onFly) onFly(v); }
    else if (a === 'voice') { const m = st(); if (m.voice && ((TTS && TTS.speaking) || voPlaying())) { hush(); m.voice = 0; } else { m.voice = 1; if (curSite) speak(siteText(curSite)); } C.save(); b.classList.toggle('on', !!m.voice); b.textContent = m.voice ? '🔊 بيشرح دلوقتي' : '🔊 اسمع الشرح'; } });

  function interactables() {
    if (!cur) return []; const L = [], o = OFF, m = st();
    for (const p of SITES_AT) L.push({ x: o + p.x, z: p.z, r: 4.5, label: `${m.stamps.includes(cur.id + ':' + p.s.id) ? '✅' : '🔎'} ${p.s.n}`, act: () => openSite(p.s) });
    for (const n of NPC) L.push({ x: n.k.position.x, z: n.k.position.z, r: 2.8, label: `💬 كلّم ${n.nm}`, act: () => openSite(cur.sites[0]) });
    L.push({ x: o - 10, z: 60.6, r: 3, label: '✈️ طيارة لولو — سافر', act: openPicker });
    if (CHEST) L.push({ x: o + CHEST.x, z: CHEST.z, r: 2.4, label: '🎁 افتح الكنز', act: () => { st().coins.push(CHEST.id); CHEST.g.visible = false; CHEST = null; reward(25, '🎁 لقيت كنز مستخبي! + 🪙 25'); C.sfx.win(); } });
    return L;
  }
  function update(dt, now, active) {
    if (!active || !cur) return; const t = now / 1000, px = C.PL.x - OFF, pz = C.PL.z, m = st();
    ANIM.forEach((f) => f(t));
    for (const c of COINS) { if (!c.m.visible) continue; c.m.rotation.z = t * 3; if (Math.hypot(c.x - px, c.z - pz) < 1.4) { c.m.visible = false; m.coins.push(c.id); reward(2); C.sfx.coin(); } }
    for (const n of NPC) { const dx = C.PL.x - n.k.position.x, dz = C.PL.z - n.k.position.z, d = Math.hypot(dx, dz); n.k.rotation.y = angLerp(n.k.rotation.y, d < 6.5 ? Math.atan2(dx, dz) : n.yaw, dt * 4); if (d < 5 && !n.seen) { n.seen = true; n.k.emo = { k: 'wave', t: 1.4 }; if (n.bub) n.k.remove(n.bub); n.bub = bubbleSprite(cur.hello + ' ' + cur.i); n.bub.position.set(0, 3.1, 0); n.k.add(n.bub); n.bubT = 3.2; C.sfx.pop(); if (m.voice) speak(cur.hello, true); } if (d > 14) n.seen = false; C.animKid(n.k, 0, dt, false); if (n.bub) { n.bubT -= dt; n.bub.material.opacity = Math.min(1, n.bubT); if (n.bubT <= 0) { n.k.remove(n.bub); n.bub = null; } } }
  }
  function drawMap(g, s) { g.fillStyle = TH[cur.th].sea; g.fillRect(-400 * s, -400 * s, 800 * s, 800 * s); g.fillStyle = TH[cur.th].g; g.beginPath(); g.arc(0, 0, (B + 8) * s, 0, 7); g.fill(); g.fillStyle = '#efe3cc'; g.fillRect(-4 * s, 5 * s, 8 * s, 70 * s); g.fillStyle = '#7a5cff'; g.beginPath(); g.arc(0, -26 * s, 14 * s, 0, 7); g.fill(); }
  function goal() { const m = st(), s = cur.sites[0], key = cur.id + ':' + s.id; return `${cur.i} ${cur.n}<small>${!m.stamps.includes(key) ? `المهمة: اكتشف «${s.n}»` : !m.right.includes(key) ? 'المهمة: جاوب سؤال المعلم' : 'المهمة: سافر لبلد عربي تاني ✈️'} · 🌍 ${new Set(m.stamps.map((k) => k.split(':')[0])).size}/${COUNTRIES.length}</small>`; }
  return {
    select(cid) { if (!cur || cur.id !== cid) build(cid); if (!st().visited.includes(cid)) { st().visited.push(cid); C.save(); } },
    get cur() { return cur; }, set onFly(f) { onFly = f; }, picker: openPicker,
    update, interactables, drawMap, goal, camBlock, B: B + 6, OFF, MAPW: 260, get SPAWN() { return { x: OFF, z: 76, yaw: Math.PI }; },
    onEnter() {}, onLeave() { closeUI(); }, noJump: (wx, z) => HOLY.some(([hx, hz, r]) => Math.hypot(wx - OFF - hx, z - hz) < r),
    voiceLines(cid) { const c = CBY[cid]; const out = [c.hello, ...c.sites.map(siteText)]; return out.map(voClean); },
  };
}

function nameTag(t) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(91,59,224,.85)'; rr(g, 4, 6, 248, 52, 24); g.fill(); g.font = '900 28px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#fff'; g.fillText(t, 128, 33, 236); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(1.8, 0.45, 1); s.position.set(0, 2.55, 0); s.renderOrder = 5; return s; }
function bubbleSprite(t) { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; rr(g, 4, 4, 504, 100, 30); g.fill(); g.beginPath(); g.moveTo(236, 100); g.lineTo(256, 124); g.lineTo(276, 100); g.fill(); g.lineWidth = 5; g.strokeStyle = '#7a5cff'; rr(g, 4, 4, 504, 100, 30); g.stroke(); g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#2a1c5a'; g.fillText(t, 256, 54, 480); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(3.4, 0.85, 1); s.renderOrder = 6; return s; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
