// LOLO BOX — عالم السعودية / Saudi Arabia World (LOLO_SAUDI_2026)
// One open world at SA_OFF shaped like Saudi Arabia (Red Sea west, Arabian Gulf east), with 8 regions placed roughly
// where they are on the real map: Tabuk, AlUla, Madinah, Jeddah, Makkah, Asir, Riyadh (centre, spawn) and the
// Eastern Province, linked by desert roads and a tour bus. Each region: entrance arch, central landmark, paths,
// info cards (Arabic + English name, a short fact in a light Saudi dialect, optional Arabic narration, a 3-choice
// question), hidden coins and treasure chests (never in the holy sites), a passport stamp and a completion reward.
// Makkah and Madinah are shown with respect: viewed from outside, no coins, chests, bots, races or jumping there.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';
import { voLoad, voPlay, voStop, voPlaying, voReady, voClean } from './vo.js?v=1';

export const SA_OFF = 12000;

const REG = {
  riyadh: { n: 'الرياض', en: 'Riyadh', c: [60, 30], i: '🏙️', stop: [60, 66] },
  eastern: { n: 'المنطقة الشرقية', en: 'Eastern Province', c: [270, -20], i: '🌊', stop: [236, -20] },
  jeddah: { n: 'جدة', en: 'Jeddah', c: [-228, 95], i: '⛲', stop: [-200, 95] },
  makkah: { n: 'مكة المكرمة', en: 'Makkah', c: [-150, 120], i: '🕋', stop: [-150, 174], holy: true },
  madinah: { n: 'المدينة المنورة', en: 'Madinah', c: [-150, -40], i: '🕌', stop: [-112, -40], holy: true },
  alula: { n: 'العُلا', en: 'AlUla', c: [-200, -140], i: '🐘', stop: [-166, -140] },
  tabuk: { n: 'تبوك', en: 'Tabuk', c: [-250, -245], i: '🏜️', stop: [-216, -245] },
  asir: { n: 'عسير', en: 'Asir', c: [-100, 232], i: '⛰️', stop: [-66, 232] },
};
const HOLY = [[-150, 120, 64], [-150, -40, 54]]; // no jumping / games inside these circles
// landmarks: id, region, emoji, Arabic, English, fact lines (Saudi dialect), question [q, [a,b,c], correct index]
const SITES = [
  { id: 'kingdom', r: 'riyadh', i: '🏙️', n: 'برج المملكة', en: 'Kingdom Centre Tower', f: ['برج المملكة من أشهر معالم الرياض، طوله حوالي 302 متر.', 'فوقه جسر زجاجي تشوف منه الرياض كلها!'], q: ['كم تقريبًا طول برج المملكة؟', ['100 متر', '302 متر', '900 متر'], 1] },
  { id: 'masmak', r: 'riyadh', i: '🏰', n: 'قصر المصمك', en: 'Al Masmak Fortress', f: ['حصن من الطين، تقريبًا انبنى سنة 1865.', 'في سنة 1902 استرد الملك عبدالعزيز الرياض، ومنها بدأ توحيد المملكة.'], q: ['من الطين ولا من الحديد انبنى قصر المصمك؟', ['من الطين', 'من الحديد', 'من الزجاج'], 0] },
  { id: 'turaif', r: 'riyadh', i: '🏘️', n: 'حي الطريف في الدرعية', en: 'At-Turaif, Diriyah', f: ['الدرعية كانت عاصمة الدولة السعودية الأولى.', 'بيوت حي الطريف من الطين، وهو في قائمة اليونسكو للتراث العالمي من سنة 2010.'], q: ['الدرعية كانت عاصمة أي دولة؟', ['الدولة السعودية الأولى', 'دولة الأنباط', 'دولة الفراعنة'], 0] },
  { id: 'zal', r: 'riyadh', i: '🛍️', n: 'سوق الزل', en: 'Souq Al-Zal', f: ['من أقدم أسواق الرياض الشعبية.', 'تلقى فيه البشوت والبخور والسجاد والتحف القديمة.'], q: ['وش تلقى في سوق الزل؟', ['بشوت وبخور', 'سيارات', 'طيارات'], 0] },
  { id: 'skyline', r: 'riyadh', i: '🌆', n: 'الرياض الحديثة', en: 'Modern Riyadh', f: ['الرياض عاصمة المملكة العربية السعودية وأكبر مدنها.', 'فيها أبراج حديثة وحدائق وطرق كبيرة.'], q: ['وش عاصمة السعودية؟', ['جدة', 'الرياض', 'الدمام'], 1] },
  { id: 'albalad', r: 'jeddah', i: '🏛️', n: 'جدة التاريخية — البلد', en: 'Historic Jeddah (Al-Balad)', f: ['بيوتها القديمة مبنية من الحجر المرجاني من البحر الأحمر.', 'صارت في قائمة اليونسكو للتراث العالمي سنة 2014.'], q: ['من وش مبنية بيوت البلد القديمة؟', ['الحجر المرجاني', 'الثلج', 'البلاستيك'], 0] },
  { id: 'rawasheen', r: 'jeddah', i: '🪟', n: 'الرواشين', en: 'Rawasheen (wooden windows)', f: ['الروشان شباك خشب كبير مزخرف بارز من الجدار.', 'يدخل الهوا ويخفف حر الشمس، ويخلي أهل البيت يشوفون الشارع.'], q: ['الروشان مصنوع من وش؟', ['خشب', 'حديد', 'قماش'], 0] },
  { id: 'fountain', r: 'jeddah', i: '⛲', n: 'نافورة الملك فهد', en: 'King Fahd Fountain', f: ['من أطول النوافير في العالم!', 'ترمي الموية في الهوا لارتفاع حوالي 300 متر وسط البحر الأحمر.'], q: ['وين تقع نافورة الملك فهد؟', ['في البحر الأحمر', 'في الخليج العربي', 'في الصحراء'], 0] },
  { id: 'corniche', r: 'jeddah', i: '🌊', n: 'كورنيش جدة', en: 'Jeddah Corniche', f: ['ممشى طويل على البحر الأحمر، فيه حدائق وألعاب للأطفال.', 'البحر الأحمر فيه شعاب مرجانية ملونة وأسماك كثيرة.'], q: ['جدة على أي بحر؟', ['البحر الأحمر', 'البحر الأسود', 'البحر الأبيض'], 0] },
  { id: 'hegra', r: 'alula', i: '🏺', n: 'الحِجر (مدائن صالح)', en: 'Hegra (Mada\'in Salih)', f: ['مدينة قديمة للأنباط، فيها أكثر من 100 مقبرة منحوتة في الصخر.', 'أول موقع سعودي في قائمة اليونسكو، سنة 2008.'], q: ['مين نحت مقابر الحِجر؟', ['الأنباط', 'الرومان', 'الفايكنج'], 0] },
  { id: 'farid', r: 'alula', i: '🗿', n: 'قصر الفريد', en: 'Qasr Al-Farid', f: ['قبر منحوت في صخرة وحدة، ارتفاعه حوالي 22 متر.', 'سموه «الفريد» لأنه واقف لحاله، وما اكتمل نحته.'], q: ['ليش سموه قصر الفريد؟', ['لأنه واقف لحاله', 'لأنه من ذهب', 'لأنه في البحر'], 0] },
  { id: 'elephant', r: 'alula', i: '🐘', n: 'جبل الفيل', en: 'Elephant Rock', f: ['صخرة ضخمة شكلها مثل الفيل وخرطومه نازل للأرض!', 'الرياح والموية نحتوها على مدى آلاف السنين، وطولها حوالي 52 متر.'], q: ['وش شكل جبل الفيل؟', ['فيل', 'جمل', 'سمكة'], 0] },
  { id: 'camp', r: 'alula', i: '⛺', n: 'مخيم الصحراء', en: 'Desert Camp', f: ['في العُلا تقدر تخيّم بين الجبال وتشوف النجوم بالليل.', 'الخيام العربية تنسج من شعر الماعز.'], q: ['وش أحلى شي تشوفه في المخيم بالليل؟', ['النجوم', 'الثلج', 'القطار'], 0] },
  { id: 'dig', r: 'alula', i: '⛏️', n: 'موقع التنقيب', en: 'Archaeology Dig', f: ['علماء الآثار يدورون على كنوز التاريخ بالفرشاة والمجرفة بهدوء.', 'العُلا فيها آثار لحضارات قديمة مثل دادان ولحيان والأنباط.'], q: ['وش يستخدم عالم الآثار عشان ينظف القطع؟', ['الفرشاة', 'المطرقة الكبيرة', 'الماء الحار'], 0] },
  { id: 'haram', r: 'makkah', i: '🕋', n: 'المسجد الحرام', en: 'Masjid Al-Haram', holy: true, f: ['أكبر مسجد في العالم، في مكة المكرمة.', 'في وسطه الكعبة المشرفة، قبلة المسلمين اللي يتجهون لها في صلاتهم.'], q: ['وش اسم القبلة اللي يتجه لها المسلمون في الصلاة؟', ['الكعبة المشرفة', 'برج الساعة', 'جبل الفيل'], 0] },
  { id: 'clock', r: 'makkah', i: '🕰️', n: 'برج الساعة — أبراج البيت', en: 'Abraj Al Bait Clock Tower', holy: true, f: ['من أطول المباني في العالم، ارتفاعه حوالي 600 متر.', 'ساعته من أكبر الساعات في العالم، وتنشاف من بعيد.'], q: ['برج الساعة في أي مدينة؟', ['مكة المكرمة', 'الرياض', 'تبوك'], 0] },
  { id: 'nabawi', r: 'madinah', i: '🕌', n: 'المسجد النبوي', en: "The Prophet's Mosque", holy: true, f: ['بناه النبي محمد ﷺ بعد الهجرة للمدينة المنورة.', 'ثاني أقدس مسجد عند المسلمين.'], q: ['المسجد النبوي في أي مدينة؟', ['المدينة المنورة', 'جدة', 'أبها'], 0] },
  { id: 'dome', r: 'madinah', i: '💚', n: 'القبة الخضراء', en: 'The Green Dome', holy: true, f: ['قبة خضراء فوق الحجرة النبوية الشريفة.', 'من أشهر معالم المدينة المنورة.'], q: ['وش لون قبة المسجد النبوي المشهورة؟', ['أخضر', 'أزرق', 'أحمر'], 0] },
  { id: 'umbrellas', r: 'madinah', i: '⛱️', n: 'مظلات المسجد النبوي', en: "Prophet's Mosque Umbrellas", holy: true, f: ['مظلات ضخمة تنفتح وتتسكر لحالها.', 'تظلل المصلين من الشمس في الساحات.'], q: ['ليش المظلات موجودة في ساحات المسجد النبوي؟', ['تظلل من الشمس', 'للعب', 'للزينة بس'], 0] },
  { id: 'rijal', r: 'asir', i: '🏘️', n: 'قرية رجال ألمع', en: 'Rijal Almaa Village', f: ['عمرها أكثر من 900 سنة، وفيها حوالي 60 مبنى من الحجر.', 'بعض بيوتها توصل 8 أدوار، وشبابيكها ملونة بالأخضر والأصفر والأحمر.'], q: ['كم تقريبًا عمر قرية رجال ألمع؟', ['10 سنين', 'أكثر من 900 سنة', 'سنة وحدة'], 1] },
  { id: 'qatt', r: 'asir', i: '🎨', n: 'فن القط العسيري', en: 'Al-Qatt Al-Asiri art', f: ['رسومات وأشكال ملونة ترسمها نساء عسير على جدران البيوت.', 'مسجل في اليونسكو كتراث ثقافي غير مادي.'], q: ['مين ترسم فن القط العسيري؟', ['نساء عسير', 'الروبوتات', 'الطيور'], 0] },
  { id: 'mountains', r: 'asir', i: '⛰️', n: 'جبال عسير الخضراء', en: 'Green Mountains of Asir', f: ['جبال خضراء وجوها بارد ولطيف، وفيها ضباب أحيانًا.', 'فيها جبل السودة، من أعلى القمم في المملكة (حوالي 3000 متر).'], q: ['وش يميز جو عسير؟', ['بارد ولطيف', 'حار جدًا دايم', 'ما فيه هوا'], 0] },
  { id: 'terraces', r: 'asir', i: '🌾', n: 'المدرجات الزراعية', en: 'Mountain Farm Terraces', f: ['المزارعين يسوون درجات في الجبل عشان يزرعون فيها.', 'تمسك الموية والتربة وقت المطر.'], q: ['ليش يسوون المدرجات في الجبل؟', ['عشان الزراعة', 'عشان التزلج', 'عشان السباق'], 0] },
  { id: 'disah', r: 'tabuk', i: '🏜️', n: 'وادي الديسة', en: 'Wadi Disah', f: ['وادي بين جبال من الحجر الرملي الأحمر، ارتفاعها يوصل 500 متر.', 'فيه عيون موية ونخيل وزرع أخضر طول السنة.'], q: ['من وش جبال وادي الديسة؟', ['الحجر الرملي', 'الثلج', 'الرخام الأبيض'], 0] },
  { id: 'oasis', r: 'tabuk', i: '🌴', n: 'الواحة', en: 'Palm Oasis', f: ['الواحة مكان فيه موية وسط الصحراء.', 'يكثر فيها النخيل والزرع، والمسافرين يرتاحون عندها.'], q: ['وش تلقى في الواحة؟', ['موية ونخيل', 'ثلج', 'بحر'], 0] },
  { id: 'trail', r: 'tabuk', i: '🥾', n: 'مسار الجبال', en: 'Mountain Trail', f: ['مسارات مشي بين الصخور العملاقة، لازم تمشي مع أهلك ومعك موية.', 'تبوك في شمال غرب المملكة، وجوها بارد في الشتا.'], q: ['وش لازم تاخذ معك في مسار المشي؟', ['موية', 'تلفزيون', 'ثلاجة'], 0] },
  { id: 'ithra', r: 'eastern', i: '🪨', n: 'إثراء', en: 'Ithra (King Abdulaziz Center for World Culture)', f: ['افتتح سنة 2016 في الظهران، وشكله مثل حجارة فوق بعض.', 'فيه مكتبة ومتحف وسينما ومسرح.'], q: ['شكل مبنى إثراء يشبه وش؟', ['حجارة فوق بعض', 'سفينة', 'طيارة'], 0] },
  { id: 'gulf', r: 'eastern', i: '🏖️', n: 'الخليج العربي', en: 'Arabian Gulf Coast', f: ['المنطقة الشرقية على الخليج العربي.', 'فيها شواطئ وكورنيش الخبر والدمام.'], q: ['المنطقة الشرقية على أي خليج؟', ['الخليج العربي', 'خليج المكسيك', 'خليج البنغال'], 0] },
  { id: 'ahsa', r: 'eastern', i: '🌴', n: 'واحة الأحساء', en: 'Al-Ahsa Oasis', f: ['من أكبر واحات النخيل في العالم، فيها ملايين النخل.', 'مسجلة في قائمة اليونسكو سنة 2018.'], q: ['وش أكثر شجر في واحة الأحساء؟', ['النخل', 'الصنوبر', 'التفاح'], 0] },
  { id: 'well7', r: 'eastern', i: '🛢️', n: 'بئر الخير — بئر الدمام 7', en: 'Dammam Well No. 7', f: ['أول بئر نفط تجاري في السعودية.', 'طلع منه النفط سنة 1938، وسموه «بئر الخير».'], q: ['وش اللي طلع من بئر الخير سنة 1938؟', ['النفط', 'الذهب', 'الموية'], 0] },
];
const SBY = Object.fromEntries(SITES.map((s) => [s.id, s]));
const ACH = [
  { id: 'first', n: 'أول ختم', d: 'اختم جوازك في أول منطقة', ok: (m) => m.stamps.length >= 1, r: 20 },
  { id: 'half', n: 'رحّال', d: 'اختم 4 مناطق', ok: (m) => m.stamps.length >= 4, r: 40 },
  { id: 'all8', n: 'مستكشف السعودية', d: 'اختم المناطق الثمان كلها', ok: (m) => m.stamps.length >= 8, r: 150 },
  { id: 'quiz10', n: 'الفهيم', d: 'جاوب 10 أسئلة صح', ok: (m) => m.right.length >= 10, r: 50 },
  { id: 'chests', n: 'صياد الكنوز', d: 'افتح كل صناديق الكنز', ok: (m) => m.chests.length >= CHESTS_N, r: 80 },
  { id: 'cards', n: 'موسوعة المملكة', d: 'اكتشف كل المعالم', ok: (m) => m.seen.length >= SITES.length, r: 100 },
];
let CHESTS_N = 0;
// Saudi Arabia, roughly (x east, z south), and the inside test used to keep players on land
const LAND = [[-300, -300], [-150, -330], [0, -272], [80, -232], [230, -150], [300, -92], [332, -12], [342, 40], [304, 92], [362, 142], [332, 232], [200, 302], [40, 330], [-92, 318], [-150, 298], [-172, 240], [-232, 150], [-277, 60], [-302, -60], [-332, -200]];

const CSS = `
.saUI{position:fixed;inset:0;z-index:25;display:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif;color:#0f3d2e}
.saUI.on{display:block}
.saUI .dbox{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,720px);background:linear-gradient(#f6fff8,#e3f6ea);border:4px solid #1f9a5a;border-radius:24px;box-shadow:0 8px 0 #12683b,0 16px 40px rgba(0,0,0,.35);padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.saUI .dav{width:64px;height:64px;border-radius:18px;background:#d2f2de;display:grid;place-items:center;font-size:40px;flex:none}
.saUI .dnm{font-weight:900;color:#12683b;font-size:15px}.saUI .dtx{font-weight:800;font-size:clamp(15px,2.8vh,19px);line-height:1.6;margin:2px 0 8px}
.saUI .dch{display:flex;flex-wrap:wrap;gap:6px}
.saUI .dch button,.saUI .row button,.saUI .opt{border-radius:12px;padding:6px 12px;font-weight:900;font-size:14px;background:#fff;border:3px solid #8fd8ad;color:#0f5a36;font-family:inherit;cursor:pointer}
.saUI .pan{position:absolute;left:50%;top:12px;bottom:12px;transform:translateX(-50%);width:min(94vw,600px);background:linear-gradient(#f6fff8,#e3f6ea);border:4px solid #1f9a5a;border-radius:24px;box-shadow:0 8px 0 #12683b,0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
.saUI .hd{background:linear-gradient(#26b56a,#14804a);color:#fff;padding:10px 14px 8px;display:flex;align-items:center;gap:10px}
.saUI .hd b{flex:1;font-size:clamp(17px,3.2vh,24px);font-weight:900;line-height:1.25}.saUI .hd small{display:block;font-size:12px;opacity:.95;font-weight:700}
.saUI .x{width:40px;height:40px;border-radius:50%;background:linear-gradient(#ff7ab8,#e33d8c);color:#fff;font-size:20px;font-weight:900;box-shadow:0 3px 0 #a81f5e;flex:none;border:0}
.saUI .bd{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.saUI .big{font-size:60px;text-align:center;line-height:1.1}
.saUI .en{text-align:center;font-weight:800;color:#12683b;direction:ltr}
.saUI .fact{background:#fff;border:2px solid #bfe8cf;border-radius:14px;padding:8px 12px;font-weight:800;font-size:clamp(14px,2.6vh,17px);line-height:1.6}
.saUI .qz{background:#fff8dc;border:3px solid #ffcc33;border-radius:16px;padding:10px;display:flex;flex-direction:column;gap:6px}
.saUI .qz b{font-size:16px}.saUI .opt.good{background:#c9f7d6;border-color:#2fb44a}.saUI .opt.bad{background:#ffd6de;border-color:#e8213d}
.saUI .stamp{background:#e9fff1;border:3px dashed #1f9a5a;border-radius:16px;padding:8px;text-align:center;font-weight:900}
.saUI .holy{background:#f2fbf6;border:2px solid #9ad6b2;border-radius:14px;padding:8px 12px;font-weight:800;font-size:14px;text-align:center}
.saUI .row{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:6px 10px;border:2px solid #bfe8cf}
.saUI .row .ic{font-size:26px;width:36px;text-align:center}.saUI .row .t{flex:1;font-weight:800;font-size:14px}.saUI .row .t small{display:block;color:#12683b;font-weight:700}
.saUI .row.done{background:#e9fff1}
.saUI .btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px}
.saUI .ok,.saUI .snd{border:0;border-radius:14px;padding:10px;font-weight:900;font-size:16px;font-family:inherit;color:#fff}
.saUI .ok{background:linear-gradient(#6ee37f,#2fb44a);box-shadow:0 4px 0 #1d7f31}.saUI .snd{background:linear-gradient(#36c7a0,#159a78);box-shadow:0 4px 0 #0d6e55}.saUI .snd.on{background:linear-gradient(#ff8ac4,#ef4e98);box-shadow:0 4px 0 #b32466}
.saUI .smap{position:relative;width:100%;aspect-ratio:1/0.9;background:#3fb6ff;border-radius:18px;overflow:hidden;border:3px solid #fff}
.saUI .smap svg{position:absolute;inset:0;width:100%;height:100%}
.saUI .smap button{position:absolute;transform:translate(-50%,-50%);border-radius:999px;padding:3px 9px;font-weight:900;font-size:12px;background:#fff;border:3px solid #1f9a5a;color:#0f5a36;font-family:inherit;white-space:nowrap}
.saUI .smap button.st{background:#ffd23f;border-color:#b47a00}
.saUI .cnt{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.saUI .cnt span{background:#fff;border:2px solid #bfe8cf;border-radius:999px;padding:4px 12px;font-weight:900;font-size:14px}
.saUI .go{background:linear-gradient(#ffd34d,#ffad0f);color:#6b3a00;border:0;border-radius:16px;padding:12px;font-weight:900;font-size:19px;font-family:inherit;box-shadow:0 4px 0 #c77800;margin:0 12px 12px}
#saHud{position:fixed;right:calc(12px + env(safe-area-inset-right));top:calc(clamp(118px,25vh,170px) + env(safe-area-inset-top));z-index:6;display:none;flex-direction:row;gap:8px}
#saHud.on{display:flex}
#saHud button{width:clamp(44px,9vh,56px);height:clamp(44px,9vh,56px);border-radius:16px;font-size:clamp(22px,4.6vh,28px);background:linear-gradient(#26b56a,#14804a);box-shadow:0 4px 0 #0d5c33;border:3px solid #fff}
body.mallFocus #saHud{display:none}
.saRide{position:fixed;inset:0;z-index:24;display:none;pointer-events:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif}
.saRide.on{display:block}
.saRide .t{position:absolute;top:calc(12px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(15,61,46,.9);color:#fff;font-weight:900;font-size:clamp(15px,2.8vh,20px);padding:8px 20px;border-radius:999px;border:3px solid #ffd23f;white-space:nowrap}
.saRide .f{position:absolute;bottom:calc(84px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(92vw,640px);background:rgba(246,255,248,.96);color:#0f3d2e;font-weight:900;font-size:clamp(15px,2.8vh,19px);padding:10px 16px;border-radius:18px;border:3px solid #1f9a5a;text-align:center;line-height:1.6}
.saRide .bar{position:absolute;bottom:calc(14px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);height:12px;width:min(70vw,420px);background:rgba(0,0,0,.35);border-radius:99px;overflow:hidden}
.saRide .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#26b56a)}
.saRide .sk{position:absolute;bottom:calc(34px + env(safe-area-inset-bottom));right:calc(16px + env(safe-area-inset-right));pointer-events:auto;border-radius:999px;padding:8px 18px;font-weight:900;font-family:inherit;background:#fff;color:#0f5a36;border:3px solid #8fd8ad}
`;
const ROAD_FACTS = ['🐪 الجمل يقدر يمشي أيام في الصحراء بدون ما يشرب موية كثير.', '🌴 النخلة من أهم الأشجار في السعودية، والتمر أكلة أساسية في كل بيت.', '🏜️ الربع الخالي من أكبر الصحاري الرملية في العالم.', '☕ القهوة السعودية تنقدّم مع التمر عشان الترحيب بالضيوف.', '🦅 الصقور لها مكانة كبيرة في التراث السعودي.'];

export function buildSaudi(C) {
  const { toon, ctex } = C;
  const OFF = SA_OFF, B = 380;
  const root = new THREE.Group(); root.position.x = OFF; C.scene.add(root);
  const camBlock = [];
  const st = () => { const S = C.S; if (!S.saudi || typeof S.saudi !== 'object') S.saudi = {}; const m = S.saudi; for (const k of ['stamps', 'seen', 'right', 'chests', 'coins', 'ach', 'done']) if (!Array.isArray(m[k])) m[k] = []; if (m.voice === undefined) m.voice = 1; return m; };

  // ---------- helpers ----------
  const solid = (x0, x1, z0, z1) => C.solids.push({ x0: OFF + Math.min(x0, x1), x1: OFF + Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const circ = (x, z, r) => C.circles.push({ x: OFF + x, z, r });
  const groups = {}; for (const k in REG) { const g = new THREE.Group(); g.userData.c = REG[k].c; root.add(g); groups[k] = g; }
  let cur = root; // where vox/sign add their meshes (a region group while building it)
  function vox(list, parent = cur, opt = {}) {
    const by = {}; for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); }
    for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), opt.basic ? new THREE.MeshBasicMaterial({ color: c, toneMapped: false }) : toon(c)); m.castShadow = !!opt.shadow; m.receiveShadow = true; parent.add(m); if (opt.block) camBlock.push(m); }
  }
  function textTex(lines, o = {}) {
    const w = o.w || 512, h = o.h || 128;
    const t = ctex(w, h, (g) => {
      if (o.bg) { g.fillStyle = o.bg; rr(g, 4, 4, w - 8, h - 8, o.r == null ? 22 : o.r); g.fill(); if (o.border) { g.lineWidth = 8; g.strokeStyle = o.border; g.stroke(); } }
      g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
      lines.forEach(([tx, px, col, stroke], i) => { g.font = `900 ${px}px Cairo, Tajawal, "Segoe UI", sans-serif`; g.direction = /[؀-ۿ]/.test(tx) ? 'rtl' : 'ltr'; const y = h * (i + 0.5) / n; if (stroke) { g.lineWidth = px * 0.18; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(tx, w / 2, y, w - 30); } g.fillStyle = col; g.fillText(tx, w / 2, y, w - 30); });
    });
    t.anisotropy = 4; return t;
  }
  const sign = (tex, w, h, x, y, z, ry = 0, parent = cur) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m; };
  const label = (t, x, y, z, ry = 0, w = 4.6) => sign(textTex([[t, 50, '#ffffff']], { w: 600, h: 110, bg: '#14804a', border: '#ffffff', r: 18 }), w, w * 110 / 600, x, y, z, ry);
  const pixTex = (base, spots, n = 60, sz = 16, extra) => { const t = ctex(sz, sz, (g) => { g.fillStyle = base; g.fillRect(0, 0, sz, sz); let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < n; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; g.fillRect((r() * sz) | 0, (r() * sz) | 0, 1, 1); } if (extra) extra(g, sz); }); t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plane = (tex, w, d, x, z, y, rep, ry = 0) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.rotation.z = ry; m.position.set(x, y, z); m.receiveShadow = true; cur.add(m); return m; };
  const disc = (r, x, z, y, col) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), toon(col)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; cur.add(m); return m; };
  const T = {
    sand: pixTex('#f0d49a', ['#e6c788', '#f6e0ae', '#e0bd7a', '#f3d9a2'], 80),
    road: pixTex('#5b5f74', ['#53576b', '#666a80'], 40, 16, (g, s) => { g.fillStyle = '#f6e27a'; g.fillRect(7, 0, 2, 6); }),
    pave: pixTex('#efe3cc', ['#e6d7bb', '#f6ecd9'], 30, 16, (g, s) => { g.fillStyle = '#d2bd96'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    marble: pixTex('#dedbd3', ['#d6d3cb', '#e6e3dc', '#d0cdc4'], 30, 16, (g, s) => { g.fillStyle = '#c4c0b6'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    grass: pixTex('#5fc04a', ['#73d35c', '#4eab3c', '#86de6a'], 70),
    red: pixTex('#d9804f', ['#cc7244', '#e38f5e', '#c4683c'], 60),
  };
  const palm = (x, z, h = 5) => { vox([[x, h / 2, z, 0.6, h, 0.6, '#8a5a2b'], [x, h + 0.2, z, 3.2, 0.5, 0.9, '#3ea83a'], [x, h + 0.2, z, 0.9, 0.5, 3.2, '#3ea83a'], [x, h + 0.6, z, 2.0, 0.5, 2.0, '#58c04a'], [x + 0.4, h - 0.3, z, 0.4, 0.4, 0.4, '#a0521f']], cur, { shadow: true }); circ(x, z, 0.45); };
  const tree = (x, z) => { vox([[x, 1.2, z, 0.5, 2.4, 0.5, '#8a5a2b'], [x, 3, z, 2.6, 2, 2.6, '#3ea83a'], [x, 4.1, z, 1.6, 1, 1.6, '#58c04a']], cur, { shadow: true }); circ(x, z, 0.4); };
  // a region's entrance arch (Saudi style: green + white with a palm/swords-free plain emblem)
  const arch = (k, x, z, ry) => { const g = new THREE.Group(); vox([[-6, 4, 0, 1.6, 8, 1.6, '#f3ead6'], [6, 4, 0, 1.6, 8, 1.6, '#f3ead6'], [0, 8.6, 0, 14, 1.6, 1.8, '#14804a'], [-6, 8.6, 0, 2, 2, 2, '#e7c86a'], [6, 8.6, 0, 2, 2, 2, '#e7c86a']], g, { shadow: true }); const t = textTex([[REG[k].i + ' ' + REG[k].n, 84, '#ffffff', '#0d5c33'], [REG[k].en, 40, '#ffe27a']], { w: 900, h: 230, bg: '#14804a', border: '#ffffff', r: 24 }); for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.8), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false })); m.position.set(0, 10.9, s * 0.95); if (s < 0) m.rotation.y = Math.PI; g.add(m); } g.position.set(x, 0, z); g.rotation.y = ry; cur.add(g); const c = Math.cos(ry), sn = Math.sin(ry); circ(x - 6 * c, z + 6 * sn, 1.1); circ(x + 6 * c, z - 6 * sn, 1.1); };
  const mudHouse = (L, x, z, w, d, h, col = '#c98f5a', trim = '#e7cfa6') => { L.push([x, h / 2, z, w, h, d, col], [x, h + 0.3, z, w + 0.2, 0.3, d + 0.2, shade(col, -14)]); for (let i = 0; i < Math.floor(w / 1.2); i++) L.push([x - w / 2 + 0.6 + i * 1.2, h + 0.75, z + d / 2 - 0.1, 0.5, 0.6, 0.2, col], [x - w / 2 + 0.6 + i * 1.2, h + 0.75, z - d / 2 + 0.1, 0.5, 0.6, 0.2, col]); L.push([x, h * 0.35, z + d / 2 + 0.02, 1.2, h * 0.6, 0.1, '#6b3a1a'], [x - w * 0.3, h * 0.7, z + d / 2 + 0.02, 0.6, 0.5, 0.1, trim], [x + w * 0.3, h * 0.7, z + d / 2 + 0.02, 0.6, 0.5, 0.1, trim]); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); };

  // ---------- the land, the seas ----------
  { const shp = new THREE.Shape(); LAND.forEach(([x, z], i) => (i ? shp.lineTo(x, -z) : shp.moveTo(x, -z))); const geo = new THREE.ShapeGeometry(shp); geo.rotateX(-Math.PI / 2); const t = T.sand.clone(); t.needsUpdate = true; t.repeat.set(1 / 6, 1 / 6); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) { const p = geo.attributes.position; uv.setXY(i, p.getX(i) / 6, p.getZ(i) / 6); } t.repeat.set(1, 1); const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: t })); m.position.y = 0.02; m.receiveShadow = true; root.add(m);
    const beach = new THREE.Mesh(geo.clone(), toon('#f7e6bd')); beach.scale.set(1.025, 1, 1.025); beach.position.y = 0.0; root.add(beach); }
  { const w = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshToonMaterial({ color: '#2fa6e8', emissive: '#1460a8', emissiveIntensity: 0.25 })); w.rotation.x = -Math.PI / 2; w.position.set(20, -0.3, 0); root.add(w); }
  sign(textTex([['البحر الأحمر', 90, '#ffffff', '#0d4f80'], ['Red Sea', 50, '#d9f2ff']], { w: 700, h: 230 }), 40, 13, -330, 0.4, 40, 0, root).rotation.x = -Math.PI / 2;
  sign(textTex([['الخليج العربي', 90, '#ffffff', '#0d4f80'], ['Arabian Gulf', 50, '#d9f2ff']], { w: 700, h: 230 }), 40, 13, 380, 0.4, -40, 0, root).rotation.x = -Math.PI / 2;
  // dunes + desert rocks sprinkled across the empty desert, and the roads between regions
  { const L = []; let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 160; i++) { const x = -280 + r() * 600, z = -280 + r() * 580; if (!inLand(x, z, 18)) continue; if (Object.values(REG).some((g) => Math.hypot(g.c[0] - x, g.c[1] - z) < 62)) continue; const w = 6 + r() * 12; L.push([x, 0.6, z, w, 1.2, w * 0.6, '#ecc98a'], [x + 1, 1.5, z, w * 0.6, 1, w * 0.4, '#f3d79e']); if (i % 9 === 0) L.push([x + 6, 1.5, z + 4, 3, 3, 2.4, '#b9864f']); } vox(L, root); }
  const EDGES = [['riyadh', 'eastern'], ['riyadh', 'makkah'], ['riyadh', 'madinah'], ['riyadh', 'asir'], ['makkah', 'jeddah'], ['jeddah', 'madinah'], ['madinah', 'alula'], ['alula', 'tabuk'], ['makkah', 'asir']];
  for (const [a, b] of EDGES) { const A = REG[a].stop, Bp = REG[b].stop, dx = Bp[0] - A[0], dz = Bp[1] - A[1], L = Math.hypot(dx, dz); const t = T.road.clone(); t.needsUpdate = true; t.repeat.set(1, L / 6); const m = new THREE.Mesh(new THREE.PlaneGeometry(6, L), new THREE.MeshToonMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(dx, -dz) + Math.PI; m.position.set((A[0] + Bp[0]) / 2, 0.05, (A[1] + Bp[1]) / 2); root.add(m); }

  // ======================= RIYADH (centre) =======================
  cur = groups.riyadh;
  { const [X, Z] = REG.riyadh.c;
    plane(T.pave, 90, 90, X, Z, 0.06, 4); arch('riyadh', X, Z + 40, 0);
    // Kingdom Centre: two tapering legs that meet in a parabola, with the skybridge on top
    { const x = X + 22, z = Z - 22, L = [[x, 2, z, 16, 4, 12, '#9fc4e8']]; for (let i = 0; i < 40; i++) { const y = 4 + i * 1.2, k = i / 39, half = 7 * (1 - k * 0.55), gap = i < 24 ? 0 : 6 * Math.sqrt((i - 24) / 15) * (1 - k * 0.2); if (gap < 0.5) L.push([x, y, z, half * 2, 1.2, 5, i % 2 ? '#7fb0dc' : '#6aa0d2']); else for (const s of [-1, 1]) { const w = half - gap; if (w > 0.4) L.push([x + s * (gap + w / 2), y, z, w, 1.2, 5, i % 2 ? '#7fb0dc' : '#6aa0d2']); } } L.push([x, 4 + 31 * 1.2, z, 8.6, 1.2, 4, '#dfe6ee']); vox(L, cur, { shadow: true, block: true }); solid(x - 8, x + 8, z - 6, z + 6); label('برج المملكة', x, 5, z + 6.2, 0, 4.4); }
    // modern skyline (Faisaliah-like pyramid tower with a globe, glass towers)
    { const L = []; for (const [dx, dz, w, h, c] of [[40, -10, 7, 30, '#5aa0d8'], [34, -30, 6, 22, '#8fb8dc'], [-10, -34, 6, 26, '#6aa0d2'], [-26, -28, 8, 18, '#a8c8e6'], [44, 14, 6, 16, '#7fb0dc']]) { L.push([X + dx, h / 2, Z + dz, w, h, w, c]); for (let i = 2; i < h; i += 2.4) L.push([X + dx, i, Z + dz + w / 2 + 0.03, w * 0.8, 0.3, 0.05, '#ffffff']); solid(X + dx - w / 2, X + dx + w / 2, Z + dz - w / 2, Z + dz + w / 2); }
      const fx = X + 4, fz = Z - 40; for (let i = 0; i < 22; i++) { const w = 8 * (1 - i / 24); L.push([fx, 1 + i * 1.6, fz, w, 1.6, w, i % 2 ? '#c7cede' : '#b3bfd2']); } L.push([fx, 37, fz, 3.4, 3.4, 3.4, '#f2c234']); solid(fx - 4, fx + 4, fz - 4, fz + 4); vox(L, cur, { shadow: true, block: true }); label('الرياض الحديثة', X + 30, 4, Z - 3, 0, 4.4); }
    // Al Masmak: mud-brick fortress with four round towers and pointed crenellations
    { const x = X - 24, z = Z - 8, L = [[x, 4, z, 16, 8, 14, '#c98f5a']]; for (let i = 0; i < 13; i++) L.push([x - 7.5 + i * 1.25, 8.55, z + 7.05, 0.6, 1.1, 0.2, '#c98f5a'], [x - 7.5 + i * 1.25, 8.55, z - 7.05, 0.6, 1.1, 0.2, '#c98f5a']); L.push([x, 2.2, z + 7.06, 2.4, 4.4, 0.2, '#6b3a1a'], [x, 2.2, z + 7.12, 0.15, 4.2, 0.1, '#3b2010']); for (let i = 0; i < 4; i++) L.push([x - 5 + i * 3.4, 5.6, z + 7.06, 0.7, 0.9, 0.1, '#3b2010']); vox(L, cur, { shadow: true, block: true });
      for (const [dx, dz] of [[-8, -7], [8, -7], [-8, 7], [8, 7]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.1, 11, 12), toon('#c08550')); t.position.set(x + dx, 5.5, z + dz); t.castShadow = true; cur.add(t); const top = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.8, 0.8, 12), toon('#b17643')); top.position.set(x + dx, 11.2, z + dz); cur.add(top); } solid(x - 10, x + 10, z - 9, z + 9); label('قصر المصمك', x, 9.8, z + 7.4, 0, 4.4); }
    // At-Turaif / Diriyah: a cluster of Najdi mud houses with palms
    { const L = []; const bx = X - 30, bz = Z + 20; [[0, 0, 7, 6, 5], [8, -2, 6, 6, 6], [-8, 3, 6, 5, 4], [3, 9, 8, 5, 7], [-6, -8, 7, 5, 5]].forEach(([dx, dz, w, d, h]) => mudHouse(L, bx + dx, bz + dz, w, d, h, '#cf9b64')); vox(L, cur, { shadow: true, block: true }); for (const [dx, dz] of [[13, 6], [-13, -2], [12, -9], [-2, 15]]) palm(bx + dx, bz + dz); label('حي الطريف — الدرعية', bx, 9.5, bz + 3.2, 0, 5); }
    // Souq Al-Zal: market stalls with striped awnings
    { const L = []; const sx = X + 6, sz = Z + 24; for (let i = 0; i < 6; i++) { const x = sx - 10 + i * 4, z = sz; L.push([x, 0.6, z, 3, 1.2, 2, '#8a5a2b'], [x, 2.6, z - 0.6, 3.2, 0.2, 3, i % 2 ? '#e8213d' : '#ffd23f'], [x - 1.4, 1.6, z - 1.6, 0.15, 2, 0.15, '#6b3a1a'], [x + 1.4, 1.6, z - 1.6, 0.15, 2, 0.15, '#6b3a1a'], [x - 0.6, 1.35, z, 0.6, 0.3, 0.6, ['#7a2bd6', '#c8203c', '#2b6bd6', '#ff8a1f'][i % 4]], [x + 0.6, 1.35, z, 0.6, 0.5, 0.6, '#f1e6c8']); solid(x - 1.5, x + 1.5, z - 1, z + 1); } vox(L, cur, { shadow: true }); label('سوق الزل', sx, 4, sz + 1.2, 0, 3.6); }
    // a park with trees
    disc(10, X + 30, Z + 26, 0.08, '#5fc04a'); for (const [dx, dz] of [[24, 20], [34, 22], [28, 32], [36, 30]]) tree(X + dx, Z + dz);
  }

  // ======================= EASTERN PROVINCE (Gulf coast) =======================
  cur = groups.eastern;
  { const [X, Z] = REG.eastern.c;
    plane(T.pave, 70, 80, X - 6, Z, 0.06, 4); arch('eastern', X - 34, Z, -Math.PI / 2);
    // Ithra: rounded "stones" with metal stripes and a tall keystone tower
    { const x = X - 6, z = Z - 18; const stone = (dx, dz, r, h) => { for (let i = 0; i < 6; i++) { const rr2 = r * Math.sqrt(1 - Math.pow(i / 6, 2)); const m = new THREE.Mesh(new THREE.CylinderGeometry(rr2 * 0.95, rr2, h / 6, 18), toon(i % 2 ? '#b8bcc6' : '#9aa0ac')); m.position.set(x + dx, h / 12 + i * h / 6, z + dz); m.castShadow = true; cur.add(m); } circ(x + dx, z + dz, r); };
      stone(-7, 2, 5, 7); stone(7, 3, 5.5, 8); stone(0, -6, 4.5, 6);
      for (let i = 0; i < 14; i++) { const k = i / 13, rr2 = 4.6 * (1 - Math.abs(k - 0.45) * 0.8); const m = new THREE.Mesh(new THREE.CylinderGeometry(rr2, rr2, 2.2, 18), toon(i % 2 ? '#c7ccd6' : '#a9afbb')); m.position.set(x, 1.1 + i * 2.2, z + 1); m.castShadow = true; cur.add(m); } camBlock.push(...cur.children.slice(-14));
      label('إثراء', x, 3, z + 9.6, 0, 3.6); }
    // Gulf beach + corniche
    plane(T.pave, 8, 70, X + 26, Z, 0.07, 3); for (let i = 0; i < 8; i++) palm(X + 22, Z - 32 + i * 9); for (let i = 0; i < 6; i++) { const z = Z - 26 + i * 10; vox([[X + 34, 0.9, z, 1.6, 0.2, 1.6, ['#ff4fae', '#2fc4ff', '#ffd23f'][i % 3]], [X + 34, 0.45, z, 0.15, 0.9, 0.15, '#ffffff']]); }
    label('الخليج العربي', X + 30, 3.4, Z + 6, -Math.PI / 2, 4.6);
    // Al-Ahsa palm grove
    for (let i = 0; i < 24; i++) palm(X - 30 + (i % 6) * 5, Z + 16 + Math.floor(i / 6) * 5, 4 + (i % 3) * 0.6); label('واحة الأحساء', X - 17, 7.4, Z + 13, 0, 4.4);
    // Dammam Well No. 7 (a small oil derrick)
    { const x = X + 8, z = Z + 22, L = [[x, 0.4, z, 5, 0.8, 5, '#9aa3b5']]; for (let i = 0; i < 8; i++) { const w = 3.6 - i * 0.4; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) L.push([x + a * w / 2, 1.2 + i * 1.2, z + b * w / 2, 0.25, 1.2, 0.25, '#c0392b']); L.push([x, 1.2 + i * 1.2, z, w, 0.15, 0.15, '#c0392b'], [x, 1.2 + i * 1.2, z, 0.15, 0.15, w, '#c0392b']); } vox(L, cur, { shadow: true }); solid(x - 2.5, x + 2.5, z - 2.5, z + 2.5); label('بئر الخير', x, 2.2, z + 2.7, 0, 3.4); }
  }

  // ======================= JEDDAH (Red Sea coast) =======================
  cur = groups.jeddah;
  { const [X, Z] = REG.jeddah.c;
    plane(T.pave, 60, 70, X + 6, Z, 0.06, 4); arch('jeddah', X + 30, Z, Math.PI / 2);
    // Al-Balad: tall coral-stone houses with wooden Rawasheen
    { const L = []; [[-4, -20, 6, 14], [4, -22, 5, 11], [12, -20, 6, 16], [-6, -8, 5, 12], [14, -6, 6, 13]].forEach(([dx, dz, w, h], i) => { const x = X + dx, z = Z + dz; L.push([x, h / 2, z, w, h, w, '#eee3cf'], [x, h + 0.3, z, w + 0.3, 0.6, w + 0.3, '#d8c9ab']); for (let f = 1; f < h / 3.4; f++) for (const s of [-1, 1]) { const rx = x + s * w * 0.22, ry = f * 3.2 + 0.6; L.push([rx, ry, z + w / 2 + 0.35, w * 0.32, 2.2, 0.7, i % 2 ? '#3f7a4a' : '#6b3a1a'], [rx, ry, z + w / 2 + 0.72, w * 0.26, 1.6, 0.05, i % 2 ? '#7ab88a' : '#a0703a'], [rx, ry + 1.2, z + w / 2 + 0.35, w * 0.36, 0.25, 0.8, '#4a2a12']); } L.push([x, 1.2, z + w / 2 + 0.05, 1.3, 2.4, 0.1, '#4a2a12']); solid(x - w / 2, x + w / 2, z - w / 2, z + w / 2 + 0.8); }); vox(L, cur, { shadow: true, block: true });
      label('جدة التاريخية — البلد', X + 4, 3.2, Z - 13, 0, 5); label('الرواشين', X + 14, 3.2, Z + 0.6, 0, 3.4); }
    // corniche + the sea side
    plane(T.pave, 8, 70, X - 22, Z, 0.07, 3); for (let i = 0; i < 8; i++) { palm(X - 18, Z - 32 + i * 9); vox([[X - 25.5, 2, Z - 30 + i * 9, 0.2, 4, 0.2, '#2b2f48'], [X - 25.5, 4.1, Z - 30 + i * 9, 0.8, 0.3, 0.8, '#fff3b0']]); }
    label('كورنيش جدة', X - 22, 3.4, Z + 4, Math.PI / 2, 4.4);
  }
  // King Fahd Fountain: a tall animated water jet in the Red Sea (outside the land outline)
  const FOUNT = new THREE.Group(); { const [X, Z] = REG.jeddah.c; const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.8, 46, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#e9f7ff', transparent: true, opacity: 0.75, toneMapped: false, side: THREE.DoubleSide })); jet.position.y = 23; FOUNT.add(jet); const top = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8), new THREE.MeshBasicMaterial({ color: '#f4fbff', transparent: true, opacity: 0.6, toneMapped: false })); top.position.y = 46; FOUNT.add(top); const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 16), toon('#ffffff')); base.position.y = 0.2; FOUNT.add(base); FOUNT.position.set(X - 52, 0, Z - 6); groups.jeddah.add(FOUNT); FOUNT.userData.jet = jet; }
  label('نافورة الملك فهد ⬅', REG.jeddah.c[0] - 26, 3.2, REG.jeddah.c[1] - 6, Math.PI / 2, 4.6);

  // ======================= MAKKAH (holy: view from outside, with respect) =======================
  cur = groups.makkah;
  { const [X, Z] = REG.makkah.c;
    plane(T.marble, 76, 60, X, Z + 44, 0.06, 3); arch('makkah', X, Z + 64, 0);
    // Masjid Al-Haram: arcaded walls + minarets around the white courtyard, the Kaaba in the centre
    const W = 52, L = [];
    disc(24, X, Z, 0.07, '#ebe8e2');
    for (const [dx, dz, w, d, h] of [[0, -W / 2, W, 3, 8], [0, W / 2, W, 3, 2.6], [-W / 2, 0, 3, W, 8], [W / 2, 0, 3, W, 8]]) { L.push([X + dx, h / 2, Z + dz, w, h, d, '#ece7dc'], [X + dx, h + 0.4, Z + dz, w + 0.6, 0.8, d + 0.6, '#e3d9c2']); }
    for (let i = 0; i < 13; i++) { const t = -W / 2 + 2 + i * ((W - 4) / 12); L.push([X + t, 1.3, Z + W / 2 + 1.55, 2.2, 1.6, 0.1, '#c9bfa6'], [X + t, 3, Z - W / 2 + 1.55, 2.2, 5, 0.1, '#c9bfa6'], [X + W / 2 - 1.55, 3, Z + t, 0.1, 5, 2.2, '#c9bfa6'], [X - W / 2 + 1.55, 3, Z + t, 0.1, 5, 2.2, '#c9bfa6']); }
    for (const [dx, dz] of [[-W / 2, -W / 2], [W / 2, -W / 2], [-W / 2, W / 2], [W / 2, W / 2], [-13, W / 2], [13, W / 2]]) { L.push([X + dx, 9, Z + dz, 1.6, 18, 1.6, '#f6f2e8'], [X + dx, 12, Z + dz, 2.2, 0.5, 2.2, '#d9cfb8'], [X + dx, 18.6, Z + dz, 1.0, 1.2, 1.0, '#e7c86a']); }
    L.push([X, 2.4, Z, 4.6, 4.8, 4.6, '#111111'], [X, 3.6, Z, 4.66, 0.6, 4.66, '#d9b23a'], [X + 0.8, 1.6, Z + 2.34, 0.9, 1.8, 0.05, '#d9b23a']);
    vox(L, cur, { shadow: true, block: true });
    // the whole complex is closed to play: a respectful fence keeps players in the viewing plaza outside
    solid(X - W / 2 - 2, X + W / 2 + 2, Z - W / 2 - 2, Z + W / 2 + 2);
    label('المسجد الحرام', X - 16, 4.6, Z + W / 2 + 1.7, 0, 5);
    // Abraj Al Bait Clock Tower (south of the mosque)
    { const x = X + 40, z = Z - 30, L2 = [[x, 6, z, 22, 12, 16, '#d6d0c2']]; for (let i = 0; i < 18; i++) { const w = 9 - i * 0.18; L2.push([x, 12 + i * 2.6 + 1.3, z, w, 2.6, w, i % 2 ? '#cfc6b2' : '#bdb39c']); } L2.push([x, 62, z, 5.6, 6, 5.6, '#e8e1cf'], [x, 66.5, z, 3, 3, 3, '#e7c86a'], [x, 69.5, z, 0.6, 3, 0.6, '#e7c86a'], [x, 71.4, z, 1.6, 0.6, 0.3, '#e7c86a']); vox(L2, cur, { shadow: true, block: true }); solid(x - 11, x + 11, z - 8, z + 8);
      const clk = textTex([['🕰️', 120, '#ffffff']], { w: 256, h: 256, bg: '#1f9a5a', border: '#e7c86a', r: 128 }); for (const [rx, ox, oz] of [[0, 0, 3.6], [Math.PI, 0, -3.6], [Math.PI / 2, 3.6, 0], [-Math.PI / 2, -3.6, 0]]) { const m = sign(clk, 4.2, 4.2, x + ox, 60, z + oz, rx); m.userData.clock = 1; }
      label('برج الساعة', x, 13.4, z + 8.2, 0, 4.4); }
    for (let i = 0; i < 6; i++) palm(X - 30 + i * 12, Z + 44);
  }

  // ======================= MADINAH (holy: view from outside, with respect) =======================
  cur = groups.madinah;
  const UMB = [];
  { const [X, Z] = REG.madinah.c;
    plane(T.marble, 90, 80, X, Z, 0.06, 3); arch('madinah', X + 40, Z, Math.PI / 2);
    const L = [], W = 44, D = 34;
    L.push([X, 4, Z, W, 8, D, '#ece7dc'], [X, 8.3, Z, W + 0.6, 0.6, D + 0.6, '#e3d9c2']);
    for (let i = 0; i < 15; i++) { const t = -W / 2 + 1.6 + i * ((W - 3.2) / 14); L.push([X + t, 3.2, Z + D / 2 + 0.05, 1.8, 4.6, 0.1, '#c9bfa6'], [X + t, 3.2, Z - D / 2 - 0.05, 1.8, 4.6, 0.1, '#c9bfa6']); }
    for (let i = 0; i < 11; i++) { const t = -D / 2 + 1.6 + i * ((D - 3.2) / 10); L.push([X + W / 2 + 0.05, 3.2, Z + t, 0.1, 4.6, 1.8, '#c9bfa6'], [X - W / 2 - 0.05, 3.2, Z + t, 0.1, 4.6, 1.8, '#c9bfa6']); }
    for (const [dx, dz] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [-8, D / 2], [8, D / 2], [-8, -D / 2], [8, -D / 2]]) L.push([X + dx, 10, Z + dz, 1.5, 20, 1.5, '#f6f2e8'], [X + dx, 13, Z + dz, 2.1, 0.5, 2.1, '#d9cfb8'], [X + dx, 20.6, Z + dz, 0.9, 1.2, 0.9, '#e7c86a']);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) L.push([X - 15 + i * 6, 8.9, Z - 10 + j * 6.6, 3.4, 0.8, 3.4, '#e8e2d2']);
    vox(L, cur, { shadow: true, block: true }); solid(X - W / 2 - 1, X + W / 2 + 1, Z - D / 2 - 1, Z + D / 2 + 1);
    { const d = new THREE.Mesh(new THREE.SphereGeometry(4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#1f9a5a')); d.position.set(X - 14, 9.6, Z + 10); d.scale.y = 1.25; d.castShadow = true; cur.add(d); const b = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 1.4, 20), toon('#1f9a5a')); b.position.set(X - 14, 9.2, Z + 10); cur.add(b); vox([[X - 14, 15.2, Z + 10, 0.3, 1.6, 0.3, '#e7c86a'], [X - 14, 16.2, Z + 10, 0.7, 0.3, 0.3, '#e7c86a']]); }
    label('المسجد النبوي', X, 9.6, Z + D / 2 + 1.2, 0, 5); label('القبة الخضراء', X - 14, 1.6, Z + D / 2 + 1.25, 0, 3.6);
    // the giant umbrellas in the plaza (they open and close)
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const ux = X - 18 + i * 7.2, uz = Z + s * (D / 2 + 7); const g = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6, 8), toon('#d9d2c2')); pole.position.y = 3; g.add(pole); const can = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.2, 4, 1, true), new THREE.MeshToonMaterial({ color: '#f7f3ea', side: THREE.DoubleSide })); can.position.y = 6.2; can.rotation.y = Math.PI / 4; g.add(can); g.position.set(ux, 0, uz); cur.add(g); UMB.push(can); circ(ux, uz, 0.4); }
    label('مظلات المسجد النبوي', X + 22, 3.2, Z + D / 2 + 7, 0, 4.4);
    for (let i = 0; i < 8; i++) palm(X - 28 + i * 8, Z + 36);
  }

  // ======================= ALULA =======================
  cur = groups.alula;
  { const [X, Z] = REG.alula.c;
    plane(T.red, 80, 80, X, Z, 0.05, 5); arch('alula', X + 34, Z, Math.PI / 2);
    const rock = (L, x, z, w, d, h, c = '#c8743f') => { for (let i = 0; i < Math.ceil(h / 2); i++) { const k = 1 - i / Math.ceil(h / 2) * 0.35; L.push([x + Math.sin(i * 1.7) * 0.4, i * 2 + 1, z + Math.cos(i * 1.3) * 0.4, w * k, 2, d * k, i % 2 ? c : shade(c, -16)]); } solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2); };
    const L = [];
    // sandstone mountains around the valley
    for (const [dx, dz, w, d, h] of [[-30, -30, 14, 12, 18], [-34, 6, 10, 16, 14], [22, -32, 16, 10, 16], [-10, 34, 18, 8, 12], [30, 30, 10, 10, 15]]) rock(L, X + dx, Z + dz, w, d, h);
    // Hegra tombs: facades carved into rock outcrops; Qasr Al-Farid stands alone
    for (const [dx, dz] of [[-24, -16], [-24, -4]]) { const x = X + dx, z = Z + dz; rock(L, x, z, 10, 8, 12, '#d08a52'); L.push([x + 5.05, 5, z, 0.12, 6, 3.4, '#b8693a'], [x + 5.1, 3.2, z, 0.12, 2.6, 1.4, '#3b2010'], [x + 5.12, 8.4, z, 0.1, 0.8, 3.8, '#a85d30']); for (const s of [-1, 1]) L.push([x + 5.12, 9.2, z + s * 1.2, 0.1, 0.6, 0.8, '#a85d30'], [x + 5.12, 9.8, z + s * 0.6, 0.1, 0.6, 0.8, '#a85d30']); }
    { const x = X - 4, z = Z - 18; rock(L, x, z, 8, 8, 12, '#d6935a'); L.push([x, 5.5, z + 4.05, 4.6, 8, 0.12, '#c27a46'], [x, 2.8, z + 4.1, 1.6, 3, 0.12, '#3b2010'], [x - 1.8, 5.5, z + 4.12, 0.4, 7, 0.1, '#b06a38'], [x + 1.8, 5.5, z + 4.12, 0.4, 7, 0.1, '#b06a38'], [x - 0.6, 5.5, z + 4.12, 0.4, 7, 0.1, '#b06a38'], [x + 0.6, 5.5, z + 4.12, 0.4, 7, 0.1, '#b06a38']); for (let s = 0; s < 4; s++) L.push([x - 1.5 + s, 10.2 + (s % 2) * 0.5, z + 4.12, 0.8, 0.8, 0.1, '#b06a38']); }
    // Elephant Rock: body + head + a trunk reaching down to the ground (with an arch under it)
    { const x = X + 14, z = Z + 6; L.push([x, 5, z, 14, 8, 8, '#b9693c'], [x, 9.5, z, 11, 3, 7, '#c27445'], [x + 8, 7.5, z, 4, 6, 6, '#b9693c'], [x + 10.2, 4.5, z, 1.6, 5, 2.6, '#b9693c'], [x + 10.8, 1.2, z, 2.2, 2.4, 2.8, '#b9693c'], [x - 5, 0.5, z, 3, 1, 7, '#b9693c'], [x - 1, 0.5, z, 3, 1, 7, '#b9693c'], [x + 4, 0.5, z, 3, 1, 7, '#b9693c']); solid(x - 7, x + 12, z - 4, z + 4); }
    vox(L, cur, { shadow: true, block: true });
    label('الحِجر', X - 18, 3, Z - 10, Math.PI / 2, 3.4); label('قصر الفريد', X - 4, 1.6, Z - 13.6, 0, 3.6); label('جبل الفيل', X + 14, 1.6, Z + 10.4, 0, 3.6);
    // desert camp
    { const L2 = []; for (const [dx, dz, c] of [[18, -14, '#3b2a1a'], [24, -10, '#f1e6c8'], [12, -8, '#3b2a1a']]) { const x = X + dx, z = Z + dz; L2.push([x, 1.2, z, 4, 2.4, 3, c], [x, 2.6, z, 4.2, 0.4, 2.2, c], [x, 1, z + 1.55, 1.2, 2, 0.1, '#e8213d']); solid(x - 2, x + 2, z - 1.5, z + 1.5); } L2.push([X + 18, 0.3, Z - 4, 1.4, 0.6, 1.4, '#6b3a1a'], [X + 18, 0.9, Z - 4, 0.8, 0.8, 0.8, '#ff8a1f']); vox(L2, cur, { shadow: true }); label('مخيم الصحراء', X + 18, 4, Z - 7.6, 0, 3.6); }
    // archaeology dig: a roped pit with tools
    { const x = X + 2, z = Z + 22; vox([[x, 0.04, z, 8, 0.08, 6, '#8a5030'], [x - 4, 0.5, z - 3, 0.2, 1, 0.2, '#ffd23f'], [x + 4, 0.5, z - 3, 0.2, 1, 0.2, '#ffd23f'], [x - 4, 0.5, z + 3, 0.2, 1, 0.2, '#ffd23f'], [x + 4, 0.5, z + 3, 0.2, 1, 0.2, '#ffd23f'], [x, 0.9, z - 3, 8, 0.08, 0.08, '#e8213d'], [x, 0.9, z + 3, 8, 0.08, 0.08, '#e8213d'], [x - 1.5, 0.3, z, 1.2, 0.3, 0.8, '#e7c86a'], [x + 1.6, 0.25, z + 1, 0.8, 0.2, 0.4, '#d9a75e'], [x + 2.5, 0.6, z - 1.2, 0.1, 1.2, 0.1, '#6b3a1a']]); solid(x - 4, x + 4, z - 3, z + 3); label('موقع التنقيب', x, 2, z - 3.2, Math.PI, 3.4); }
  }

  // ======================= TABUK (Wadi Disah) =======================
  cur = groups.tabuk;
  { const [X, Z] = REG.tabuk.c;
    plane(T.red, 70, 70, X, Z, 0.05, 5); arch('tabuk', X + 34, Z, Math.PI / 2);
    const L = [];
    // canyon walls of red sandstone pillars on both sides of the wadi (wadi runs east-west through z = Z)
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const x = X - 30 + i * 7, z = Z + s * (12 + (i % 3) * 2), h = 14 + (i * 7 % 9); for (let k = 0; k < h / 2; k++) L.push([x + Math.sin(k + i) * 0.5, k * 2 + 1, z, 6 - k * 0.12, 2, 5, k % 2 ? '#c8643a' : '#b85730']); solid(x - 3, x + 3, z - 2.5, z + 2.5); }
    vox(L, cur, { shadow: true, block: true });
    // the stream, palms and green along it
    { const w = new THREE.Mesh(new THREE.PlaneGeometry(64, 3), new THREE.MeshToonMaterial({ color: '#3fb6ff', emissive: '#1d78c9', emissiveIntensity: 0.3 })); w.rotation.x = -Math.PI / 2; w.position.set(X, 0.09, Z + 3); cur.add(w); plane(T.grass, 64, 4, X, Z + 6, 0.07, 3); plane(T.grass, 64, 3, X, Z - 0.5, 0.07, 3); }
    for (let i = 0; i < 12; i++) palm(X - 28 + i * 5, Z + (i % 2 ? 7 : -1), 4 + (i % 3) * 0.7);
    label('وادي الديسة', X + 26, 3.2, Z + 1, Math.PI / 2, 4);
    // the oasis pool + trail markers up a side valley
    { const p = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.2, 24), new THREE.MeshToonMaterial({ color: '#3fb6ff', emissive: '#1d78c9', emissiveIntensity: 0.3 })); p.position.set(X - 6, 0.1, Z + 24); cur.add(p); circ(X - 6, Z + 24, 5); for (const a of [0, 1, 2, 3, 4]) palm(X - 6 + Math.cos(a * 1.25) * 7, Z + 24 + Math.sin(a * 1.25) * 7); label('الواحة', X - 6, 2.6, Z + 17, 0, 3); }
    { const L2 = []; for (let i = 0; i < 8; i++) L2.push([X + 12 + i * 2.2, 0.4, Z + 20 + Math.sin(i) * 2, 0.6, 0.8, 0.6, i % 2 ? '#ffffff' : '#e8213d']); vox(L2); label('مسار الجبال', X + 20, 2.4, Z + 18, 0, 3.4); }
  }

  // ======================= ASIR (green mountains, Rijal Almaa) =======================
  cur = groups.asir;
  { const [X, Z] = REG.asir.c;
    plane(T.grass, 80, 80, X, Z, 0.05, 4); arch('asir', X + 34, Z, Math.PI / 2);
    const L = [];
    // stepped green mountains behind the village + farm terraces
    for (const [dx, dz, w, h] of [[-26, -26, 24, 22], [6, -32, 28, 26], [-30, 10, 18, 16]]) { for (let i = 0; i < h / 2; i++) { const k = 1 - i / (h / 2); L.push([X + dx, i * 2 + 1, Z + dz, w * (0.35 + 0.65 * k), 2, w * (0.35 + 0.65 * k), i % 2 ? '#4caf50' : '#43a047']); } solid(X + dx - w / 2, X + dx + w / 2, Z + dz - w / 2, Z + dz + w / 2); }
    for (let i = 0; i < 5; i++) L.push([X + 14, 0.4 + i * 0.8, Z - 8 - i * 3, 16, 0.8 + i * 1.6, 3, i % 2 ? '#7cc85a' : '#8bd96a'], [X + 14, 1.2 + i * 1.6, Z - 8 - i * 3 + 1.4, 16, 0.3, 0.3, '#a0703a']); solid(X + 6, X + 22, Z - 22, Z - 6.5);
    // Rijal Almaa: tall stone tower-houses with white trims and coloured windows
    const cols = ['#2fb44a', '#ffd23f', '#e8213d', '#2fc4ff', '#ffffff'];
    [[-8, 4, 6, 18], [0, 2, 6, 22], [8, 5, 6, 16], [-4, 13, 5, 13], [5, 14, 6, 15]].forEach(([dx, dz, w, h], n) => { const x = X + dx, z = Z + dz; L.push([x, h / 2, z, w, h, w, '#7d6a55']); for (let f = 0; f < h / 3; f++) { L.push([x, f * 3 + 0.2, z, w + 0.1, 0.35, w + 0.1, '#ece6d8']); for (const s of [-1, 1]) L.push([x + s * w * 0.24, f * 3 + 1.6, z + w / 2 + 0.04, 0.9, 1.1, 0.06, cols[(n + f + (s > 0 ? 1 : 0)) % cols.length]], [x + s * w * 0.24, f * 3 + 1.6, z + w / 2 + 0.07, 0.5, 0.7, 0.04, '#1d2030']); } for (let i = 0; i < 4; i++) L.push([x - w / 2 + 0.75 + i * (w - 1.5) / 3, h + 0.5, z + w / 2 - 0.2, 0.7, 1, 0.4, '#ece6d8']); L.push([x, 1.2, z + w / 2 + 0.05, 1.2, 2.4, 0.1, '#4a2a12']); solid(x - w / 2, x + w / 2, z - w / 2, z + w / 2); });
    vox(L, cur, { shadow: true, block: true });
    // Al-Qatt Al-Asiri painted wall (a big colourful mural board)
    const qatt = ctex(512, 256, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 256); const c = ['#e8213d', '#2fb44a', '#ffd23f', '#2b6bd6', '#ff8a1f', '#7a2bd6']; for (let r = 0; r < 4; r++) for (let i = 0; i < 16; i++) { g.fillStyle = c[(i + r) % c.length]; g.beginPath(); const x = i * 32, y = r * 64; if ((i + r) % 2) { g.moveTo(x, y + 64); g.lineTo(x + 16, y); g.lineTo(x + 32, y + 64); } else { g.moveTo(x, y); g.lineTo(x + 32, y); g.lineTo(x + 16, y + 32); g.moveTo(x, y + 64); g.lineTo(x + 32, y + 64); g.lineTo(x + 16, y + 32); } g.fill(); } });
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshToonMaterial({ map: qatt })); m.position.set(X - 20, 3, Z + 22); cur.add(m); vox([[X - 20, 3, Z + 21.8, 10.4, 5.4, 0.3, '#ece6d8']]); solid(X - 25.2, X - 14.8, Z + 21.6, Z + 22); label('فن القط العسيري', X - 20, 6.2, Z + 22.2, 0, 4); }
    label('قرية رجال ألمع', X, 3.4, Z + 18, 0, 4.4); label('المدرجات الزراعية', X + 14, 2.4, Z - 4.6, 0, 4);
    for (const [dx, dz] of [[20, 14], [24, 22], [-24, 30], [14, 28], [-14, 30]]) tree(X + dx, Z + dz);
  }
  cur = root;

  // ======================= collectibles: coins on the paths, treasure chests (never in holy regions) =======================
  const COINS = [], CHESTS = [];
  const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 18), coinMat = toon('#ffc21a', { emissive: '#ffb300', emissiveIntensity: 0.5 });
  for (const k of Object.keys(REG)) { if (REG[k].holy) continue; const [X, Z] = REG[k].c, sp = REG[k].stop; for (let i = 0; i < 8; i++) { const t = (i + 1) / 9, x = sp[0] + (X - sp[0]) * t + Math.sin(i * 2.1) * 3, z = sp[1] + (Z - sp[1]) * t + Math.cos(i * 1.7) * 3; const id = `${k}${i}`; const m = new THREE.Mesh(coinGeo, coinMat); m.rotation.x = Math.PI / 2; m.position.set(x, 1, z); groups[k].add(m); COINS.push({ id, m, x, z }); } }
  const CHEST_AT = { riyadh: [[96, 2], [20, 70]], eastern: [[250, 20]], jeddah: [[-210, 128]], alula: [[-226, -112], [-180, -170]], tabuk: [[-282, -228]], asir: [[-136, 262]] };
  for (const k in CHEST_AT) for (const [x, z] of CHEST_AT[k]) { const g = new THREE.Group(); vox([[0, 0.5, 0, 1.6, 1, 1.1, '#8a4b1c'], [0, 1.15, 0, 1.7, 0.4, 1.2, '#a05a24'], [0, 0.8, 0.57, 0.3, 0.4, 0.06, '#ffd23f'], [0, 0.5, 0, 1.66, 0.12, 1.16, '#ffd23f']], g, { shadow: true }); g.position.set(x, 0, z); groups[k].add(g); CHESTS.push({ id: `${k}_${x}_${z}`, g, x, z, k }); circ(x, z, 0.8); }
  CHESTS_N = CHESTS.length;

  // ======================= people: guides per region + tourists =======================
  const NPC = [];
  const UNI = { top: 'polo', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'none', bag: 'none' };
  const look = (base, extra, top, bottom) => { const L = C.cloneLook(C.PRESETS[base]); Object.assign(L, UNI, extra || {}); L.c = Object.assign({}, L.c, { top: top || '#ffffff', bottom: bottom || '#ffffff', shoes: '#6b3a1a' }); return L; };
  const addNPC = (e) => { const k = C.makeAvatar(e.look); k.scale.setScalar(1.1); k.position.set(OFF + e.x, 0.12, e.z); k.rotation.y = e.yaw; C.scene.add(k); const tag = nameTag(e.nm); tag.position.set(0, 2.55, 0); k.add(tag); const n = Object.assign({ k, seen: false, bub: null, bubT: 0 }, e); NPC.push(n); circ(e.x, e.z, 0.5); };
  const R = (k, dx, dz) => [REG[k].c[0] + dx, REG[k].c[1] + dz];
  [
    { id: 'g_riyadh', r: 'riyadh', nm: 'المرشد فهد', av: '🧑🏻‍💼', p: R('riyadh', 0, 34), yaw: Math.PI, look: look(1, { hat: 'cap' }), hello: 'هلا والله! حياك في الرياض 👋' },
    { id: 'g_eastern', r: 'eastern', nm: 'المرشدة نورة', av: '🧕', p: R('eastern', -28, 6), yaw: -Math.PI / 2, look: look(0, { hair: 'long' }, '#2fc4ff', '#1d2030'), hello: 'يا هلا! حياك في الشرقية 🌊' },
    { id: 'g_jeddah', r: 'jeddah', nm: 'العم سالم', av: '👴', p: R('jeddah', 24, 6), yaw: Math.PI / 2, look: look(3, {}), hello: 'أهلين يا بطل! حياك في جدة ⛲' },
    { id: 'g_makkah', r: 'makkah', nm: 'المرشد عبدالله', av: '🧔', p: R('makkah', 10, 42), yaw: Math.PI, look: look(3, {}), hello: 'حياك الله في مكة المكرمة 🤍' },
    { id: 'g_madinah', r: 'madinah', nm: 'المرشد إبراهيم', av: '🧔', p: R('madinah', 34, 8), yaw: Math.PI / 2, look: look(1, {}), hello: 'حياك الله في المدينة المنورة 🤍' },
    { id: 'g_alula', r: 'alula', nm: 'المرشدة ريم', av: '👩‍🔬', p: R('alula', 28, 6), yaw: Math.PI / 2, look: look(2, { hair: 'pony', hat: 'cap' }, '#d9804f', '#6b3a1a'), hello: 'هلا! جاهز تستكشف العُلا؟ 🐘' },
    { id: 'g_tabuk', r: 'tabuk', nm: 'المرشد خالد', av: '🧗', p: R('tabuk', 28, 4), yaw: Math.PI / 2, look: look(1, { hat: 'cap' }, '#2fb44a', '#3b2a1a'), hello: 'حياك في وادي الديسة! 🏜️' },
    { id: 'g_asir', r: 'asir', nm: 'العمة مزنة', av: '👵', p: R('asir', 28, 6), yaw: Math.PI / 2, look: look(0, { hair: 'bun' }, '#e8213d', '#2fb44a'), hello: 'يا مرحبا! حياك في عسير ⛰️' },
  ].forEach((e) => addNPC(Object.assign(e, { x: e.p[0], z: e.p[1], role: 'مرشد ' + REG[e.r].n })));
  const VIS = [];
  for (const k of ['riyadh', 'jeddah', 'alula', 'asir', 'eastern', 'tabuk']) { const [X, Z] = REG[k].c; const loop = [[X - 10, Z + 30], [X + 10, Z + 30], [X + 10, Z + 34], [X - 10, Z + 34]]; for (let j = 0; j < 2; j++) { const kk = C.makeAvatar(C.randomLook(j % 2 ? 'girl' : 'boy')); kk.scale.setScalar(j ? 0.9 : 1.05); C.scene.add(kk); VIS.push({ k: kk, loop, seg: j * 2, t: 0.3, sp: 1.1 + j * 0.3 }); } }
  for (const k of ['makkah', 'madinah']) { const sp = REG[k].stop; const loop = [[sp[0] - 8, sp[1] - 4], [sp[0] + 8, sp[1] - 4]]; const kk = C.makeAvatar(C.randomLook('boy')); C.scene.add(kk); VIS.push({ k: kk, loop, seg: 0, t: 0, sp: 0.9 }); }

  // ======================= tour bus =======================
  const bus = new THREE.Group(); { const L = [[0, 1.6, 0, 3, 2.4, 9, '#14804a'], [0, 3, 0, 3.02, 0.6, 9.02, '#ffffff'], [0, 0.6, 0, 3.1, 0.4, 9.1, '#1d2030']]; for (let i = 0; i < 5; i++) for (const s of [-1, 1]) L.push([s * 1.52, 2.2, -3.4 + i * 1.6, 0.06, 0.9, 1.2, '#9fd8ff']); L.push([0, 2.2, 4.52, 2.6, 1, 0.06, '#9fd8ff']); for (const [a, b] of [[-1.2, -3], [1.2, -3], [-1.2, 3], [1.2, 3]]) L.push([a * 1.05, 0.5, b, 0.5, 1, 1, '#151515']); vox(L, bus, { shadow: true }); const t = new THREE.Mesh(new THREE.PlaneGeometry(6, 1), new THREE.MeshBasicMaterial({ map: textTex([['🚌 رحلات لولو', 70, '#ffffff']], { w: 600, h: 110 }), transparent: true, toneMapped: false })); t.position.set(1.54, 1.6, 0); t.rotation.y = Math.PI / 2; bus.add(t); }
  bus.visible = false; root.add(bus);
  for (const k in REG) { const [x, z] = REG[k].stop; vox([[x, 1.6, z, 0.2, 3.2, 0.2, '#14804a'], [x, 3.4, z, 2.4, 0.9, 0.2, '#14804a'], [x - 1.4, 1.1, z - 1.2, 2.4, 0.2, 0.6, '#ffffff']], groups[k], { shadow: true }); sign(textTex([['🚌 موقف رحلات لولو', 50, '#ffffff']], { w: 600, h: 110 }), 2.3, 0.42, x, 3.4, z + 0.12, 0, groups[k]); }

  // ======================= UI =======================
  const st2 = document.createElement('style'); st2.textContent = CSS; document.head.appendChild(st2);
  const ui = document.createElement('div'); ui.className = 'saUI'; ui.id = 'saP'; ui.setAttribute('dir', 'rtl'); document.body.appendChild(ui);
  const hud = document.createElement('div'); hud.id = 'saHud'; hud.innerHTML = '<button data-sa="map" aria-label="خريطة السعودية">🗺️</button><button data-sa="pass" aria-label="جواز السفر">🛂</button><button data-sa="ach" aria-label="الإنجازات">🏆</button>'; document.body.appendChild(hud);
  const ride = document.createElement('div'); ride.className = 'saRide'; ride.setAttribute('dir', 'rtl'); ride.innerHTML = '<div class="t"></div><div class="f"></div><div class="bar"><i></i></div><button class="sk" data-sa="skip">⏩ وصّلني على طول</button>'; document.body.appendChild(ride);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let RIDE = null, CH = [], curSite = null;
  function openUI(cls, html) { ui.className = 'saUI on ' + cls; ui.innerHTML = html; document.body.classList.add('mallFocus'); C.setPanel('saudi'); }
  function closeUI() { hush(); ui.className = 'saUI'; ui.innerHTML = ''; if (!RIDE) { document.body.classList.remove('mallFocus'); C.setPanel(null); } }
  const TTS = window.speechSynthesis || null; let arVoice = null;
  const pickVoice = () => { if (!TTS) return; const vs = TTS.getVoices() || []; arVoice = vs.find((v) => /^ar[-_]SA/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)) || null; };
  if (TTS) { pickVoice(); try { TTS.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
  voLoad('sa');
  const canSpeak = () => voReady('sa') || !!(TTS && arVoice);
  function speak(text, voOnly) { text = voClean(text); if (!text) return; hush(); if (voPlay('sa', text)) return; if (voOnly || !(TTS && arVoice)) return; try { const u = new SpeechSynthesisUtterance(text); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.95; TTS.speak(u); } catch (e) {} }
  function hush() { voStop(); try { if (TTS) TTS.cancel(); } catch (e) {} }
  let CAP = null;
  function reward(n, msg) { C.S.coins = (C.S.coins || 0) + n; C.save(); C.updPills(); if (msg) C.toast(msg); }
  function checkAch() { const m = st(); for (const a of ACH) if (!m.ach.includes(a.id) && a.ok(m)) { m.ach.push(a.id); reward(a.r, `🏆 إنجاز جديد: ${a.n}! + 🪙 ${a.r}`); C.sfx.win(); } }
  function regionOf(x, z) { let best = null, bd = 1e9; for (const k in REG) { const d = Math.hypot(REG[k].c[0] - x, REG[k].c[1] - z); if (d < bd) { bd = d; best = k; } } return bd < 70 ? best : null; }
  function stamp(k) { const m = st(); if (m.stamps.includes(k)) return; m.stamps.push(k); reward(15, `🛂 ختم جديد في جوازك: ${REG[k].n}! + 🪙 15`); C.sfx.coin(); checkAch(); }
  function regionDone(k) { const m = st(); if (m.done.includes(k)) return; const ss = SITES.filter((s) => s.r === k); if (ss.every((s) => m.seen.includes(s.id) && m.right.includes(s.id))) { m.done.push(k); reward(50, `🎉 خلّصت منطقة ${REG[k].n}! + 🪙 50`); C.sfx.win(); checkAch(); } }
  function talk(n, tx, choices) { if (CAP) { CAP.push(tx); return; } CH = choices; if (st().voice) setTimeout(() => speak(tx, true), 60); openUI('dlg', `<div class="dbox"><div class="dav">${n.av}</div><div style="flex:1"><div class="dnm">${esc(n.nm)} · <small>${esc(n.role)}</small></div><div class="dtx">${esc(tx)}</div><div class="dch">${choices.map((c, i) => `<button data-sa="ch" data-v="${i}">${esc(c[0])}</button>`).join('')}</div></div></div>`); n.k.emo = { k: 'wave', t: 1.2 }; C.sfx.pop(); }
  function say(n, tx) { if (n.bub) n.k.remove(n.bub); n.bub = bubbleSprite(tx); n.bub.position.set(0, 3.1, 0); n.k.add(n.bub); n.bubT = 3.2; }
  function openSite(id) {
    const s = SBY[id], m = st(), first = !m.seen.includes(id); curSite = s;
    if (first) { m.seen.push(id); reward(10); C.sfx.coin(); }
    const answered = m.right.includes(id), voice = canSpeak();
    openUI('card', `<div class="pan"><div class="hd"><b>${esc(s.n)}<small>${esc(REG[s.r].n)} · ${m.seen.length}/${SITES.length} معلم</small></b><button class="x" data-sa="close" aria-label="إغلاق">✕</button></div><div class="bd"><div class="big">${s.i}</div><div class="en">${esc(s.en)}</div>
      ${s.f.map((f) => `<div class="fact">✨ ${esc(f)}</div>`).join('')}
      ${s.holy ? '<div class="holy">🤍 مكان مقدس: نشوفه ونتعلم عنه بهدوء واحترام.</div>' : ''}
      <div class="qz"><b>❓ ${esc(s.q[0])}</b>${answered ? '<div class="stamp">✅ جاوبت صح على السؤال هذا</div>' : s.q[1].map((o, i) => `<button class="opt" data-sa="ans" data-v="${i}">${esc(o)}</button>`).join('')}</div>
      ${first ? '<div class="stamp">🎉 اكتشفت معلم جديد + 🪙 10</div>' : ''}</div>
      <div class="btns">${voice ? `<button class="snd ${m.voice ? 'on' : ''}" data-sa="voice">🔊 ${m.voice ? 'يشرح الحين' : 'اسمع الشرح'}</button>` : ''}<button class="ok" data-sa="close" ${voice ? '' : 'style="grid-column:1/-1"'}>تم 👍</button></div></div>`);
    if (voice && m.voice) speak(`${s.n}. ${s.f.join(' ')}`);
    checkAch();
  }
  function answer(i, btn) { const s = curSite, m = st(); if (!s || m.right.includes(s.id)) return; if (i === s.q[2]) { btn.classList.add('good'); m.right.push(s.id); reward(5, '✅ صح عليك! + 🪙 5'); C.sfx.coin(); regionDone(s.r); checkAch(); setTimeout(() => openSite(s.id), 700); } else { btn.classList.add('bad'); C.sfx.pop(); C.toast('❌ حاول مرة ثانية'); } }
  function mapSVG() { return `<svg viewBox="-360 -350 760 700" preserveAspectRatio="xMidYMid meet"><polygon points="${LAND.map(([x, z]) => x + ',' + z).join(' ')}" fill="#f0d49a" stroke="#fff" stroke-width="5"/>${EDGES.map(([a, b]) => `<line x1="${REG[a].c[0]}" y1="${REG[a].c[1]}" x2="${REG[b].c[0]}" y2="${REG[b].c[1]}" stroke="#8b6a3a" stroke-width="4" stroke-dasharray="10 8"/>`).join('')}</svg>`; }
  function openMap() {
    const m = st(); const here = regionOf(C.PL.x - OFF, C.PL.z);
    openUI('card', `<div class="pan"><div class="hd"><b>🇸🇦 عالم السعودية<small>Saudi Arabia World — اختر منطقة وانطلق</small></b><button class="x" data-sa="close" aria-label="إغلاق">✕</button></div><div class="bd">
      <div class="cnt"><span>🗺️ ${m.seen.length}/${SITES.length} معلم</span><span>🛂 ${m.stamps.length}/8 أختام</span><span>🪙 ${C.S.coins || 0}</span><span>🏆 ${m.ach.length}/${ACH.length}</span></div>
      <div class="smap">${mapSVG()}${Object.keys(REG).map((k) => `<button class="${m.stamps.includes(k) ? 'st' : ''}" style="left:${((REG[k].c[0] + 360) / 760) * 100}%;top:${((REG[k].c[1] + 350) / 700) * 100}%" data-sa="go" data-v="${k}">${REG[k].i} ${REG[k].n}</button>`).join('')}</div>
      <div class="fact">💡 اضغط على أي منطقة وباص رحلات لولو يوديك. قرّب من المعالم واعرف قصتها، وجاوب الأسئلة، ودوّر على الكنوز المخفية!</div></div>
      <button class="go" data-sa="close">🚀 يلا نستكشف${here ? ' ' + REG[here].n : ''}</button></div>`);
  }
  function openPass() {
    const m = st();
    openUI('card', `<div class="pan"><div class="hd"><b>🛂 جواز سفر السعودية<small>${m.stamps.length}/8 أختام · ${m.seen.length}/${SITES.length} معلم · ${m.right.length} إجابة صح</small></b><button class="x" data-sa="close" aria-label="إغلاق">✕</button></div><div class="bd">
      ${Object.keys(REG).map((k) => { const ss = SITES.filter((s) => s.r === k); const sn = ss.filter((s) => m.seen.includes(s.id)).length; return `<div class="row ${m.stamps.includes(k) ? 'done' : ''}"><span class="ic">${m.stamps.includes(k) ? '✅' : REG[k].i}</span><div class="t">${REG[k].n} — ${REG[k].en}<small>المعالم ${sn}/${ss.length}${m.done.includes(k) ? ' · 🎉 خلّصتها' : ''}</small></div><button data-sa="go" data-v="${k}">🚌 روح</button></div>`; }).join('')}</div></div>`);
  }
  function openAch() {
    const m = st();
    openUI('card', `<div class="pan"><div class="hd"><b>🏆 الإنجازات<small>${m.ach.length}/${ACH.length} · كنوز ${m.chests.length}/${CHESTS.length}</small></b><button class="x" data-sa="close" aria-label="إغلاق">✕</button></div><div class="bd">
      ${ACH.map((a) => `<div class="row ${m.ach.includes(a.id) ? 'done' : ''}"><span class="ic">${m.ach.includes(a.id) ? '🏆' : '🔒'}</span><div class="t">${a.n}<small>${a.d} · 🪙 ${a.r}</small></div></div>`).join('')}</div></div>`);
  }
  function travel(to) {
    closeUI(); const here = regionOf(C.PL.x - OFF, C.PL.z); const from = here ? REG[here].stop : [C.PL.x - OFF, C.PL.z], dst = REG[to].stop;
    if (here === to) { place(dst[0] - 3, dst[1]); return; }
    const L = Math.hypot(dst[0] - from[0], dst[1] - from[1]);
    RIDE = { a: from, b: dst, t: 0, dur: Math.min(18, 6 + L / 40), to, fi: -1 }; C.setPanel('bus'); document.body.classList.add('mallFocus');
    const kid = C.getKid(); if (kid) kid.visible = false; bus.visible = true; ride.className = 'saRide on'; ride.querySelector('.t').textContent = `🚌 باص رحلات لولو رايح ${REG[to].n}…`; C.sfx.pop();
  }
  function endRide() { const r = RIDE; RIDE = null; hush(); ride.className = 'saRide'; bus.visible = false; document.body.classList.remove('mallFocus'); C.setPanel(null); const kid = C.getKid(); if (kid) kid.visible = true; place(r.b[0] - 3, r.b[1] + 2); C.toast(`🎉 وصلنا ${REG[r.to].n}!`); C.sfx.win(); }
  function place(x, z) { C.PL.x = OFF + x; C.PL.z = z; C.PL.y = 0.12; C.PL.vy = 0; }
  ui.addEventListener('click', (e) => { const b = e.target.closest('[data-sa]'); if (!b) return; C.sfx.click(); const a = b.dataset.sa, v = b.dataset.v;
    if (a === 'close') closeUI(); else if (a === 'ch') { const c = CH[+v]; if (c) c[1](); } else if (a === 'go') travel(v); else if (a === 'ans') answer(+v, b);
    else if (a === 'voice') { const m = st(); if (m.voice && ((TTS && TTS.speaking) || voPlaying())) { hush(); m.voice = 0; } else { m.voice = 1; if (curSite) speak(`${curSite.n}. ${curSite.f.join(' ')}`); } C.save(); b.classList.toggle('on', !!m.voice); b.textContent = m.voice ? '🔊 يشرح الحين' : '🔊 اسمع الشرح'; } });
  hud.addEventListener('click', (e) => { const b = e.target.closest('[data-sa]'); if (!b || RIDE) return; C.sfx.click(); const a = b.dataset.sa; if (a === 'map') openMap(); else if (a === 'pass') openPass(); else if (a === 'ach') openAch(); });
  ride.addEventListener('click', (e) => { if (e.target.closest('[data-sa="skip"]') && RIDE) { C.sfx.click(); endRide(); } });
  const guideTalk = (n) => { const k = n.r, ss = SITES.filter((s) => s.r === k), m = st(); talk(n, REG[k].holy ? `حياك الله في ${REG[k].n}. هذا مكان مقدس عند المسلمين، نشوفه من برا ونتعلم عنه بهدوء واحترام.` : `هلا والله! حياك في ${REG[k].n}. فيها ${ss.length} معالم تقدر تكتشفها، وفيه كنوز مخفية وعملات على الطريق. وش تبي تعرف؟`, [...ss.slice(0, 3).map((s) => [`${s.i} ${s.n}`, () => openSite(s.id)]), ['🗺️ خريطة السعودية', openMap], ['👋 شكرًا', closeUI]]); };
  const SITE_PTS = (() => { const P = (k, dx, dz, r = 3.5) => [REG[k].c[0] + dx, REG[k].c[1] + dz, r]; return {
    kingdom: P('riyadh', 22, -14.6, 4), skyline: P('riyadh', 30, 0), masmak: P('riyadh', -24, 3, 4), turaif: P('riyadh', -30, 28.6, 4), zal: P('riyadh', 6, 27.2, 4),
    ithra: P('eastern', -6, -6.6, 4), gulf: P('eastern', 26, 6, 4), ahsa: P('eastern', -17, 10.5, 4), well7: P('eastern', 8, 27, 3),
    albalad: P('jeddah', 4, -10, 4), rawasheen: P('jeddah', 14, 3, 3), fountain: P('jeddah', -24, -6, 4), corniche: P('jeddah', -22, 8, 4),
    haram: P('makkah', 0, 33, 7), clock: P('makkah', 40, -19.5, 5),
    nabawi: P('madinah', 0, 22, 5), dome: P('madinah', -14, 22, 4), umbrellas: P('madinah', 22, 27, 4),
    hegra: P('alula', -17, -10, 4), farid: P('alula', -4, -11, 3.5), elephant: P('alula', 14, 13, 4), camp: P('alula', 18, -4, 3.5), dig: P('alula', 2, 16.6, 3),
    disah: P('tabuk', 24, 3, 4), oasis: P('tabuk', -6, 16.4, 3.5), trail: P('tabuk', 20, 22, 3.5),
    rijal: P('asir', 0, 20.5, 4), qatt: P('asir', -20, 25, 3.5), mountains: P('asir', -18, -4, 4.5), terraces: P('asir', 14, -3, 3.5),
  }; })();
  function interactables() {
    if (RIDE) return [];
    const L = [], o = OFF;
    for (const n of NPC) L.push({ x: n.k.position.x, z: n.k.position.z, r: 2.6, label: `💬 كلّم ${n.nm}`, act: () => guideTalk(n) });
    const m = st();
    for (const id in SITE_PTS) { const [x, z, r] = SITE_PTS[id]; L.push({ x: o + x, z, r, label: `${m.seen.includes(id) ? '✅' : '🔎'} ${SBY[id].n}`, act: () => openSite(id) }); }
    for (const k in REG) { const [x, z] = REG[k].stop; L.push({ x: o + x, z, r: 2.6, label: '🚌 باص الرحلات', act: openMap }); }
    for (const c of CHESTS) if (!m.chests.includes(c.id)) L.push({ x: o + c.x, z: c.z, r: 2.2, label: '🎁 افتح الكنز', act: () => { m.chests.push(c.id); c.g.visible = false; reward(25, '🎁 لقيت كنز مخفي! + 🪙 25'); C.sfx.win(); checkAch(); } });
    L.push({ x: o + REG.riyadh.c[0], z: REG.riyadh.c[1] + 46, r: 3, label: '🏙️ ارجع للمدينة', act: C.goCity });
    return L;
  }
  // keep players on land (the country's outline) — a gentle invisible coast
  function clamp(o) { const x = o.x - OFF, z = o.z; if (inLand(x, z, 3)) return false; let best = null, bd = 1e9; for (let i = 0; i < LAND.length; i++) { const [ax, az] = LAND[i], [bx, bz] = LAND[(i + 1) % LAND.length]; const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))), px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (d < bd) { bd = d; best = [px, pz]; } } const cx = 0, cz = 0, k = 3.5 / Math.max(1, Math.hypot(best[0] - cx, best[1] - cz)); o.x = OFF + best[0] - (best[0] - cx) * k; o.z = best[1] - (best[1] - cz) * k; return true; }
  const noJump = (wx, z) => { const x = wx - OFF; return HOLY.some(([hx, hz, r]) => Math.hypot(x - hx, z - hz) < r); };
  let lastReg = null, welcomed = false;
  function update(dt, now, active) {
    hud.classList.toggle('on', !!active && !RIDE && C.isPlaying()); if (!active) return; const t = now / 1000;
    if (!welcomed) { welcomed = true; setTimeout(() => { if (C.isPlaying()) openMap(); }, 900); }
    if (RIDE) { RIDE.t += dt; const k = Math.min(1, RIDE.t / RIDE.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, x = RIDE.a[0] + (RIDE.b[0] - RIDE.a[0]) * e, z = RIDE.a[1] + (RIDE.b[1] - RIDE.a[1]) * e; bus.position.set(x, 0.1 + Math.abs(Math.sin(t * 9)) * 0.06, z); bus.rotation.y = Math.atan2(RIDE.b[0] - RIDE.a[0], RIDE.b[1] - RIDE.a[1]); C.PL.x = OFF + x; C.PL.z = z;
      const fi = Math.min(ROAD_FACTS.length - 1, Math.floor(k * ROAD_FACTS.length)); if (fi !== RIDE.fi) { RIDE.fi = fi; ride.querySelector('.f').textContent = ROAD_FACTS[fi]; if (st().voice && canSpeak()) speak(ROAD_FACTS[fi].replace(/^\S+\s/, '')); } ride.querySelector('.bar i').style.width = (k * 100).toFixed(1) + '%'; if (k >= 1) endRide(); }
    // stamps when entering a region, show/hide far regions (performance)
    const px = C.PL.x - OFF, pz = C.PL.z, rg = regionOf(px, pz); if (!RIDE) { if (rg && rg !== lastReg) stamp(rg); lastReg = rg; }
    for (const k in groups) { const g = groups[k], [cx, cz] = g.userData.c; g.visible = Math.hypot(cx - px, cz - pz) < 260; }
    FOUNT.userData.jet.scale.y = 0.9 + Math.sin(t * 3) * 0.1; FOUNT.userData.jet.position.y = 23 * FOUNT.userData.jet.scale.y;
    { const o = (Math.sin(t * 0.25) + 1) / 2; for (const u of UMB) { u.scale.set(0.25 + o * 0.75, 1, 0.25 + o * 0.75); } }
    const m = st();
    for (const c of COINS) { if (m.coins.includes(c.id)) { c.m.visible = false; continue; } c.m.rotation.z = t * 3; if (Math.hypot(c.x - px, c.z - pz) < 1.4) { m.coins.push(c.id); c.m.visible = false; reward(2); C.sfx.coin(); } }
    for (const c of CHESTS) if (m.chests.includes(c.id)) c.g.visible = false;
    for (const n of NPC) {
      const dx = C.PL.x - n.k.position.x, dz = C.PL.z - n.k.position.z, d = Math.hypot(dx, dz);
      if (d < 6.5) n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(dx, dz), dt * 5); else n.k.rotation.y = angLerp(n.k.rotation.y, n.yaw, dt * 2);
      if (d < 5 && !n.seen && !RIDE) { n.seen = true; n.k.emo = { k: 'wave', t: 1.4 }; say(n, n.hello); C.sfx.pop(); if (st().voice && !document.body.classList.contains('mallFocus')) speak(n.hello, true); } if (d > 14) n.seen = false;
      C.animKid(n.k, 0, dt, false); if (n.bub) { n.bubT -= dt; n.bub.material.opacity = Math.min(1, n.bubT); if (n.bubT <= 0) { n.k.remove(n.bub); n.bub = null; } }
    }
    for (const v of VIS) { const a = v.loop[v.seg], b = v.loop[(v.seg + 1) % v.loop.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; v.t += (v.sp * dt) / L; if (v.t >= 1) { v.t = 0; v.seg = (v.seg + 1) % v.loop.length; } const x = a[0] + (b[0] - a[0]) * v.t, z = a[1] + (b[1] - a[1]) * v.t; v.k.position.set(OFF + x, 0.12, z); v.k.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); C.animKid(v.k, v.sp, dt, false); }
  }
  function goal() { const m = st(), rg = regionOf(C.PL.x - OFF, C.PL.z); const next = SITES.find((s) => s.r === rg && !m.seen.includes(s.id)); return `🇸🇦 عالم السعودية${rg ? ' · ' + REG[rg].n : ''}<small>${next ? `المهمة: اكتشف «${next.n}»` : rg && !REG[rg].holy && SITES.some((s) => s.r === rg && !m.right.includes(s.id)) ? 'المهمة: جاوب أسئلة معالم المنطقة' : 'المهمة: اركب الباص لمنطقة جديدة 🚌'} · 🛂 ${m.stamps.length}/8 · 🗺️ ${m.seen.length}/${SITES.length}</small>`; }
  function drawMap(g, s) {
    g.fillStyle = '#2fa6e8'; g.fillRect(-500 * s, -500 * s, 1000 * s, 1000 * s);
    g.fillStyle = '#f0d49a'; g.beginPath(); LAND.forEach(([x, z], i) => (i ? g.lineTo(x * s, z * s) : g.moveTo(x * s, z * s))); g.closePath(); g.fill();
    g.strokeStyle = '#5b5f74'; g.lineWidth = Math.max(2, 5 * s); for (const [a, b] of EDGES) { g.beginPath(); g.moveTo(REG[a].stop[0] * s, REG[a].stop[1] * s); g.lineTo(REG[b].stop[0] * s, REG[b].stop[1] * s); g.stroke(); }
    for (const k in REG) { g.fillStyle = REG[k].holy ? '#ffffff' : '#26b56a'; g.beginPath(); g.arc(REG[k].c[0] * s, REG[k].c[1] * s, 26 * s, 0, 7); g.fill(); }
  }
  function onEnter() { welcomed = false; lastReg = null; }
  function onLeave() { if (RIDE) { RIDE = null; ride.className = 'saRide'; bus.visible = false; const kid = C.getKid(); if (kid) kid.visible = true; } closeUI(); hud.classList.remove('on'); }
  return {
    voiceLines() { const out = new Set(); SITES.forEach((s) => out.add(`${s.n}. ${s.f.join(' ')}`)); ROAD_FACTS.forEach((f) => out.add(f.replace(/^\S+\s/, ''))); NPC.forEach((n) => out.add(n.hello)); CAP = []; try { NPC.forEach((n) => { try { guideTalk(n); } catch (e) {} }); } finally { CAP.forEach((t) => out.add(t)); CAP = null; } return [...out].map(voClean).filter(Boolean); },
    _t: { SITE_PTS, REG, SITES, travel, openSite, openMap, openPass, openAch, CHESTS, endRide, get ride() { return RIDE; } },
    root, update, interactables, goal, drawMap, onEnter, onLeave, camBlock, B, OFF, MAPW: 900, SPAWN: { x: OFF + REG.riyadh.c[0], z: REG.riyadh.c[1] + 52, yaw: Math.PI }, viewOn: false, clamp, noJump,
    get camOverride() { if (!RIDE) return null; const yaw = bus.rotation.y, bx = bus.position.x, bz = bus.position.z; return { p: [OFF + bx - Math.sin(yaw) * 22, 16, bz - Math.cos(yaw) * 22], l: [OFF + bx + Math.sin(yaw) * 6, 2, bz + Math.cos(yaw) * 6] }; },
  };
}

// ---------------- helpers ----------------
function inLand(x, z, inset = 0) { let c = false; for (let i = 0, j = LAND.length - 1; i < LAND.length; j = i++) { const [xi, zi] = LAND[i], [xj, zj] = LAND[j]; if (((zi > z) !== (zj > z)) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } if (!c || !inset) return c; for (let i = 0; i < LAND.length; i++) { const [ax, az] = LAND[i], [bx, bz] = LAND[(i + 1) % LAND.length]; const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(x - ax - dx * t, z - az - dz * t) < inset) return false; } return true; }
function shade(hex, d) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, v + d)); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join(''); }
function nameTag(t) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(20,128,74,.85)'; rr(g, 4, 6, 248, 52, 24); g.fill(); g.font = '900 28px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#fff'; g.fillText(t, 128, 33, 236);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(1.8, 0.45, 1); s.renderOrder = 5; return s;
}
function bubbleSprite(t) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; rr(g, 4, 4, 504, 100, 30); g.fill(); g.beginPath(); g.moveTo(236, 100); g.lineTo(256, 124); g.lineTo(276, 100); g.fill(); g.lineWidth = 5; g.strokeStyle = '#1f9a5a'; rr(g, 4, 4, 504, 100, 30); g.stroke();
  g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#0f3d2e'; g.fillText(t, 256, 54, 480);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(3.4, 0.85, 1); s.renderOrder = 6; return s;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
