// LOLO BOX — آثار مصر / Egypt's Monuments (LOLO_EGYPT_2026, v2)
// One world at EGY_OFF with three fenced regions along the Nile (x 232..300 is the river):
//   Cairo (z -220..220): the Grand Egyptian Museum (forecourt + hanging obelisk, grand hall + Ramses II, walkable
//   grand staircase ending at the pyramids window, Tutankhamun galleries, main galleries + Khufu boat, a pharaohs
//   timeline wall) and the Giza plateau (3 pyramids, queens' pyramids, Sphinx) behind it.
//   Luxor (z 360..660): Luxor temple, avenue of sphinxes, Karnak (pylon, hypostyle hall, obelisk, sacred lake),
//   Hatshepsut's temple, the Colossi of Memnon, the Valley of the Kings.
//   Aswan (z 820..1080): Abu Simbel + Nefertari temple, Philae, the unfinished obelisk, the High Dam, a Nubian village.
// A Nile cruise ship links the three regions (a short ride with narration). Every monument has an info card
// (name, date, story) that can also be read aloud; visiting stamps the "Egypt passport" and gives coins.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';
import { buildCoast, COAST_REG, COAST_SITES } from './egyptcoast.js?v=2';

export const EGY_OFF = 9000;

const REG = { cairo: 'القاهرة والجيزة', luxor: 'الأقصر', aswan: 'أسوان' };
const NILE_REG = Object.keys(REG);
const SITES = [
  // ---- pharaohs timeline (grand hall wall) ----
  { id: 'e1', r: 'cairo', g: 'timeline', i: '🌅', n: 'بداية الحضارة وتوحيد مصر', d: 'حوالي سنة 3100 قبل الميلاد', f: ['الملك مينا (نارمر) وحّد الشمال والجنوب وبقت مصر دولة واحدة.', 'في الوقت ده بدأت الكتابة الهيروغليفية.'] },
  { id: 'e2', r: 'cairo', g: 'timeline', i: '🔺', n: 'الدولة القديمة — عصر بناة الأهرامات', d: 'حوالي 2686 لـ 2181 قبل الميلاد', f: ['الملوك خوفو وخفرع ومنكاورع بنوا أهرامات الجيزة.', 'العاصمة كانت منف، قريبة من القاهرة النهارده.'] },
  { id: 'e3', r: 'cairo', g: 'timeline', i: '📜', n: 'الدولة الوسطى', d: 'حوالي 2055 لـ 1650 قبل الميلاد', f: ['عصر ازدهار الأدب والفنون والزراعة.', 'في الوقت ده بدأ بناء معابد الكرنك في طيبة (الأقصر).'] },
  { id: 'e4', r: 'cairo', g: 'timeline', i: '👑', n: 'الدولة الحديثة — عصر الإمبراطورية', d: 'حوالي 1550 لـ 1069 قبل الميلاد', f: ['أشهر ملوكها حتشبسوت وتحتمس التالت وتوت عنخ آمون ورمسيس التاني.', 'طيبة (الأقصر) كانت العاصمة، والملوك اتدفنوا في وادي الملوك.'] },
  { id: 'e5', r: 'cairo', g: 'timeline', i: '🏺', n: 'العصر المتأخر', d: 'حوالي 664 لـ 332 قبل الميلاد', f: ['آخر عصور الملوك المصريين قبل الإسكندر الأكبر.'] },
  { id: 'e6', r: 'cairo', g: 'timeline', i: '🏛️', n: 'العصر البطلمي', d: 'من 332 لـ 30 قبل الميلاد', f: ['بدأ بعد ما الإسكندر الأكبر جه مصر.', 'آخر ملكة فيه كانت كليوباترا السابعة.'] },
  // ---- Grand Egyptian Museum ----
  { id: 'hobelisk', r: 'cairo', i: '🗼', n: 'المسلة المعلقة', d: 'من عهد رمسيس التاني — حوالي 1250 قبل الميلاد', f: ['مسلة للملك رمسيس التاني، أول حاجة بتقابلك في ساحة المتحف.', 'متعلقة فوق الأرض عشان تقدر تبص تحتها وتشوف خرطوش الملك المنقوش.'] },
  { id: 'ramses', r: 'cairo', i: '🗿', n: 'تمثال رمسيس الثاني', d: 'رمسيس التاني حكم من حوالي 1279 لـ 1213 قبل الميلاد', f: ['ارتفاعه حوالي 11 متر ووزنه حوالي 83 طن.', 'كان واقف في ميدان رمسيس، واتنقل للمتحف الكبير.', 'رمسيس التاني حكم مصر حوالي 66 سنة، ومن أشهر الملوك.'] },
  { id: 'stairs', r: 'cairo', i: '🏛️', n: 'الدرج العظيم', d: 'تماثيل من عصور مختلفة', f: ['درج عملاق على جنبيه عشرات التماثيل لملوك وآلهة.', 'اطلعه لآخره هتلاقي شباك كبير بيطل على الأهرامات.'] },
  { id: 'window', r: 'cairo', i: '🪟', n: 'شباك الأهرامات', d: 'فوق الدرج العظيم', f: ['من هنا تشوف أهرامات الجيزة من جوه المتحف!', 'المتحف اتبنى قريب جدًا من هضبة الأهرامات.'] },
  { id: 'mask', r: 'cairo', i: '👑', n: 'قناع توت عنخ آمون الذهبي', d: 'حوالي 1323 قبل الميلاد', f: ['معمول من الدهب ومزيّن بأحجار ملونة، ووزنه حوالي 10 كيلو.', 'هوارد كارتر اكتشف مقبرة توت عنخ آمون في وادي الملوك سنة 1922.', 'توت عنخ آمون بقى ملك وهو عنده حوالي 9 سنين.'] },
  { id: 'throne', r: 'cairo', i: '🪑', n: 'كرسي عرش توت عنخ آمون', d: 'حوالي 1330 قبل الميلاد', f: ['كرسي متغطي بالدهب ومزيّن بأحجار ملونة.', 'على ضهره رسمة للملك ومراته الملكة عنخ إسن آمون.'] },
  { id: 'shrine', r: 'cairo', i: '📦', n: 'المقصورة الذهبية', d: 'حوالي 1323 قبل الميلاد', f: ['صناديق خشب كبيرة متغطية بالدهب، كانت حوالين تابوت الملك جوه بعض.'] },
  { id: 'anubis', r: 'cairo', i: '🐕', n: 'تمثال أنوبيس', d: 'حوالي 1323 قبل الميلاد', f: ['أنوبيس على شكل ابن آوى أسود قاعد فوق صندوق.', 'كان بيحرس كنوز مقبرة توت عنخ آمون.'] },
  { id: 'chariot', r: 'cairo', i: '🐎', n: 'العجلة الحربية', d: 'حوالي 1330 قبل الميلاد', f: ['اتلقى في مقبرة توت عنخ آمون كذا عجلة حربية.', 'كانت بتشدها الخيول وبتستخدم في الحرب والصيد.'] },
  { id: 'boat', r: 'cairo', i: '⛵', n: 'مركب خوفو', d: 'حوالي 2500 قبل الميلاد — اتلقت سنة 1954', f: ['معمولة من خشب الأرز وطولها حوالي 43 متر.', 'اتلقت مدفونة جنب الهرم الأكبر، واتنقلت للمتحف الكبير.'] },
  { id: 'canopic', r: 'cairo', i: '🏺', n: 'الأواني الكانوبية', d: 'مصر القديمة', f: ['4 أواني بأغطية على شكل رؤوس أبناء حورس الأربعة.', 'كانت جزء من طقوس التحنيط عند المصريين القدماء.'] },
  { id: 'coffin', r: 'cairo', i: '⚱️', n: 'التابوت الملون', d: 'عصور مختلفة', f: ['المصريين القدماء كانوا بيزوّقوا التوابيت بألوان ورسومات جميلة.', 'وكانوا بيكتبوا عليها بالهيروغليفي أسماء ودعوات.'] },
  { id: 'hiero', r: 'cairo', i: '📜', n: 'الكتابة الهيروغليفية', d: 'من حوالي 3200 قبل الميلاد', f: ['كتابة بالصور والرموز، كل رمز ليه معنى أو صوت.', 'العالم شامبليون فك رموزها سنة 1822 بمساعدة حجر رشيد.'] },
  // ---- Giza ----
  { id: 'khufu', r: 'cairo', i: '🔺', n: 'الهرم الأكبر — هرم خوفو', d: 'حوالي 2560 قبل الميلاد', f: ['ارتفاعه الأصلي كان حوالي 146 متر.', 'هو الوحيد اللي لسه موجود من عجائب الدنيا السبع القديمة.'] },
  { id: 'khafre', r: 'cairo', i: '🔺', n: 'هرم خفرع', d: 'حوالي 2550 قبل الميلاد', f: ['باين أعلى من هرم خوفو لأنه مبني على أرض أعلى.', 'لسه فوق قمته جزء من الكسوة الحجرية الأصلية.'] },
  { id: 'menkaure', r: 'cairo', i: '🔺', n: 'هرم منكاورع', d: 'حوالي 2510 قبل الميلاد', f: ['أصغر الأهرامات التلاتة الكبيرة في الجيزة.', 'جنبه أهرامات صغيرة للملكات.'] },
  { id: 'sphinx', r: 'cairo', i: '🦁', n: 'أبو الهول', d: 'حوالي 2500 قبل الميلاد', f: ['جسمه جسم أسد وراسه راس إنسان، ومنحوت في الصخر.', 'طوله حوالي 73 متر وارتفاعه حوالي 20 متر، وبيبص ناحية الشروق.'] },
  // ---- Luxor ----
  { id: 'luxortemple', r: 'luxor', i: '🏯', n: 'معبد الأقصر', d: 'بدأ بناؤه حوالي 1390 قبل الميلاد', f: ['بناه الملك أمنحتب التالت، وكمّل فيه رمسيس التاني.', 'قدامه تماثيل لرمسيس التاني ومسلة، والمسلة التانية في باريس.'] },
  { id: 'avenue', r: 'luxor', i: '🐏', n: 'طريق الكباش', d: 'اتفتح للزوار سنة 2021', f: ['طريق طوله حوالي 2.7 كيلو على جنبيه تماثيل أبو الهول وكباش.', 'بيربط معبد الأقصر بمعابد الكرنك.'] },
  { id: 'karnak', r: 'luxor', i: '🏛️', n: 'معابد الكرنك', d: 'اتبنت على مدار حوالي 2000 سنة', f: ['أكبر مجمع معابد قديم في العالم.', 'في قاعة الأعمدة الكبرى 134 عمود ضخم!'] },
  { id: 'hatobelisk', r: 'luxor', i: '🗼', n: 'مسلة حتشبسوت', d: 'حوالي 1457 قبل الميلاد', f: ['من أطول المسلات الواقفة في مصر، طولها حوالي 29 متر.', 'معمولة من حتة جرانيت واحدة جاية من أسوان.'] },
  { id: 'lake', r: 'luxor', i: '💧', n: 'البحيرة المقدسة', d: 'معابد الكرنك', f: ['بحيرة جوه معبد الكرنك، الكهنة كانوا بيتطهروا فيها قبل الصلاة.'] },
  { id: 'hatshepsut', r: 'luxor', i: '🏯', n: 'معبد حتشبسوت — الدير البحري', d: 'حوالي 1470 قبل الميلاد', f: ['معبد على شكل مدرجات منحوت قدام جبل في البر الغربي.', 'بنته الملكة حتشبسوت، من أشهر الملكات اللي حكمت مصر.'] },
  { id: 'memnon', r: 'luxor', i: '🗿', n: 'تمثالا ممنون', d: 'حوالي 1350 قبل الميلاد', f: ['تمثالين ضخام للملك أمنحتب التالت قاعدين في البر الغربي.', 'ارتفاع كل واحد حوالي 18 متر.'] },
  { id: 'valley', r: 'luxor', i: '⛰️', n: 'وادي الملوك', d: 'مقابر ملوك الدولة الحديثة', f: ['فيه أكتر من 60 مقبرة محفورة في الجبل.', 'مقبرة توت عنخ آمون (KV62) اتكشفت هنا سنة 1922 وكانت مليانة كنوز.'] },
  // ---- Aswan ----
  { id: 'abusimbel', r: 'aswan', i: '🗿', n: 'معبد أبو سمبل الكبير', d: 'حوالي 1264 قبل الميلاد — واتنقل 1964 لـ 1968', f: ['بناه رمسيس التاني، وقدامه 4 تماثيل قاعدة طول الواحد حوالي 20 متر.', 'اتنقل بالكامل لمكان أعلى عشان ما يغرقش في بحيرة ناصر.', 'يوم 22 فبراير و22 أكتوبر الشمس بتدخل وتنوّر التماثيل اللي جوه.'] },
  { id: 'nefertari', r: 'aswan', i: '👸', n: 'معبد نفرتاري', d: 'حوالي 1264 قبل الميلاد', f: ['المعبد الصغير جنب أبو سمبل، لزوجة رمسيس التاني الملكة نفرتاري.', 'قدامه 6 تماثيل واقفة للملك والملكة.'] },
  { id: 'philae', r: 'aswan', i: '🏝️', n: 'معبد فيلة', d: 'العصر البطلمي — واتنقل 1977 لـ 1980', f: ['معبد الإلهة إيزيس على جزيرة في نهر النيل.', 'اتنقل حجر حجر لجزيرة تانية عشان يتحمى من المية.'] },
  { id: 'unfinished', r: 'aswan', i: '🪨', n: 'المسلة الناقصة', d: 'غالبًا من عصر حتشبسوت', f: ['لو كانت اكتملت كان طولها حوالي 42 متر، أكبر مسلة في التاريخ.', 'اتشرخت وهما بينحتوها في محجر الجرانيت، فسابوها مكانها.'] },
  { id: 'dam', r: 'aswan', i: '🌊', n: 'السد العالي', d: 'اتبنى من 1960 لـ 1970', f: ['سد ضخم على النيل بيحمي مصر من الفيضان وبيولّد كهربا.', 'وراه اتكوّنت بحيرة ناصر، من أكبر البحيرات الصناعية في العالم.'] },
  { id: 'nubian', r: 'aswan', i: '🏡', n: 'القرية النوبية', d: 'النوبة', f: ['بيوت ملونة بألوان مبهجة ورسومات على الحيطان.', 'أهل النوبة مشهورين بالكرم والترحيب بالضيوف.'] },
  { id: 'felucca', r: 'aswan', i: '⛵', n: 'الفلوكة', d: 'من زمان لحد النهارده', f: ['مركب خشب بشراع أبيض، بيمشي بالهوا في النيل.', 'ركوب الفلوكة في أسوان وقت الغروب من أحلى الحاجات.'] },
];
SITES.push(...COAST_SITES); Object.assign(REG, COAST_REG);
const SBY = Object.fromEntries(SITES.map((s) => [s.id, s]));
const DOCK = { cairo: [222, 150], luxor: [222, 520], aswan: [222, 950] };
const NILE_FACTS = ['🌊 النيل من أطول أنهار العالم، طوله حوالي 6650 كيلو.', '🪨 الفراعنة كانوا بينقلوا الحجارة على مراكب في النيل عشان يبنوا المعابد والأهرامات.', '🌾 على ضفاف النيل الأرض خضرا وفيها نخل وزراعة، ووراها الصحرا.', '🏛️ الأقصر زمان كان اسمها طيبة، وكانت عاصمة مصر في الدولة الحديثة.', '🪨 أسوان مشهورة بالجرانيت الأحمر اللي اتعملت منه المسلات والتماثيل.', '⛵ الصعيد هو جنوب مصر، وفيه معابد كتير جدًا على النيل.'];

const CSS = `
.egyUI{position:fixed;inset:0;z-index:25;display:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif;color:#5a3410}
.egyUI.on{display:block}
.egyUI .dbox{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,720px);background:linear-gradient(#fffaf0,#ffefcf);border:4px solid #d79a2b;border-radius:24px;box-shadow:0 8px 0 #9a6414,0 16px 40px rgba(0,0,0,.35);padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.egyUI .dav{width:64px;height:64px;border-radius:18px;background:#ffe6b3;display:grid;place-items:center;font-size:40px;flex:none}
.egyUI .dnm{font-weight:900;color:#a4600f;font-size:15px}.egyUI .dtx{font-weight:800;font-size:clamp(15px,2.8vh,19px);line-height:1.6;margin:2px 0 8px}
.egyUI .dch{display:flex;flex-wrap:wrap;gap:6px}
.egyUI .dch button,.egyUI .row button{border-radius:12px;padding:6px 12px;font-weight:900;font-size:14px;background:#fff;border:3px solid #f0c46a;color:#7a4a0c;font-family:inherit;cursor:pointer}
.egyUI .pan{position:absolute;left:50%;top:12px;bottom:12px;transform:translateX(-50%);width:min(94vw,560px);background:linear-gradient(#fffaf0,#ffefcf);border:4px solid #d79a2b;border-radius:24px;box-shadow:0 8px 0 #9a6414,0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
.egyUI .hd{background:linear-gradient(#f0b23a,#c8811a);color:#fff;padding:10px 14px 8px;display:flex;align-items:center;gap:10px}
.egyUI .hd b{flex:1;font-size:clamp(17px,3.2vh,24px);font-weight:900;line-height:1.2}.egyUI .hd small{display:block;font-size:12px;opacity:.95;font-weight:700}
.egyUI .x{width:40px;height:40px;border-radius:50%;background:linear-gradient(#ff7ab8,#e33d8c);color:#fff;font-size:20px;font-weight:900;box-shadow:0 3px 0 #a81f5e;flex:none;border:0}
.egyUI .bd{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.egyUI .big{font-size:64px;text-align:center;line-height:1.1}
.egyUI .date{text-align:center;font-weight:900;color:#fff;background:#a4600f;border-radius:999px;padding:4px 14px;align-self:center}
.egyUI .fact{background:#fff;border:2px solid #f6dca3;border-radius:14px;padding:8px 12px;font-weight:800;font-size:clamp(14px,2.6vh,17px);line-height:1.6}
.egyUI .stamp{background:#fff4cf;border:3px dashed #d79a2b;border-radius:16px;padding:8px;text-align:center;font-weight:900}
.egyUI .row{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:6px 10px;border:2px solid #f6dca3}
.egyUI .row .ic{font-size:26px;width:36px;text-align:center}.egyUI .row .t{flex:1;font-weight:800;font-size:14px}.egyUI .row .t small{display:block;color:#a4600f;font-weight:700}
.egyUI .btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px}
.egyUI .ok,.egyUI .snd{border:0;border-radius:14px;padding:10px;font-weight:900;font-size:16px;font-family:inherit;color:#fff}
.egyUI .ok{background:linear-gradient(#6ee37f,#2fb44a);box-shadow:0 4px 0 #1d7f31}.egyUI .snd{background:linear-gradient(#f0b23a,#c8811a);box-shadow:0 4px 0 #8a5410}
.egyUI .snd.on{background:linear-gradient(#ff8ac4,#ef4e98);box-shadow:0 4px 0 #b32466}
body.mallFocus #bAct{visibility:hidden}
.egyRide{position:fixed;inset:0;z-index:24;display:none;pointer-events:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif}
.egyRide.on{display:block}
.egyRide .t{position:absolute;top:calc(12px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(90,52,16,.88);color:#fff;font-weight:900;font-size:clamp(15px,2.8vh,20px);padding:8px 20px;border-radius:999px;border:3px solid #ffd23f;white-space:nowrap}
.egyRide .f{position:absolute;bottom:calc(84px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(92vw,640px);background:rgba(255,250,240,.95);color:#5a3410;font-weight:900;font-size:clamp(15px,2.8vh,19px);padding:10px 16px;border-radius:18px;border:3px solid #d79a2b;text-align:center;line-height:1.6}
.egyRide .bar{position:absolute;bottom:calc(14px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);height:12px;width:min(70vw,420px);background:rgba(0,0,0,.35);border-radius:99px;overflow:hidden}
.egyRide .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#ff8a1f)}
.egyRide .sk{position:absolute;bottom:calc(34px + env(safe-area-inset-bottom));right:calc(16px + env(safe-area-inset-right));pointer-events:auto;border:0;border-radius:999px;padding:8px 18px;font-weight:900;font-family:inherit;background:#fff;color:#7a4a0c;border:3px solid #f0c46a}
`;

export function buildEgypt(C) {
  const { toon, ctex } = C;
  const OFF = EGY_OFF, B = 1250;
  const root = new THREE.Group(); root.position.x = OFF; C.scene.add(root);
  const camBlock = [];
  const st = () => { const S = C.S; if (!S.egypt || typeof S.egypt !== 'object') S.egypt = {}; if (!Array.isArray(S.egypt.stamps)) S.egypt.stamps = []; if (S.egypt.voice === undefined) S.egypt.voice = 1; return S.egypt; };

  // ---------- helpers ----------
  const solid = (x0, x1, z0, z1) => C.solids.push({ x0: OFF + Math.min(x0, x1), x1: OFF + Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const circ = (x, z, r) => C.circles.push({ x: OFF + x, z, r });
  function vox(list, parent = root, opt = {}) {
    const by = {}; for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); }
    for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), toon(c)); m.castShadow = !!opt.shadow; m.receiveShadow = true; parent.add(m); if (opt.block) camBlock.push(m); }
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
  const sign = (tex, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  const label = (t, x, y, z, ry = 0, w = 4.4) => sign(textTex([[t, 50, '#ffffff']], { w: 560, h: 110, bg: '#6b3a07', border: '#ffd23f', r: 18 }), w, w * 110 / 560, x, y, z, ry);
  const pixTex = (base, spots, n = 60, sz = 16, extra) => { const t = ctex(sz, sz, (g) => { g.fillStyle = base; g.fillRect(0, 0, sz, sz); let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < n; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; g.fillRect((r() * sz) | 0, (r() * sz) | 0, 1, 1); } if (extra) extra(g, sz); }); t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plane = (tex, w, d, x, z, y, rep) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; root.add(m); return m; };
  const T = {
    sand: pixTex('#ead7ad', ['#e0c99b', '#f2e2c0', '#dcc393', '#f0dcb5'], 80),
    stone: pixTex('#d9bf8e', ['#cfb27f', '#e4cc9f', '#c8a870'], 40, 16, (g, s) => { g.fillStyle = '#b8955c'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    road: pixTex('#d6bb8a', ['#cbae7b', '#e0c79b'], 40, 16, (g, s) => { g.fillStyle = '#bf9f68'; g.fillRect(0, s / 2, s, 1); }),
    marble: pixTex('#ece4d6', ['#e3d9c6', '#f4ede1', '#ddd1bb'], 30, 16, (g, s) => { g.fillStyle = '#cdbfa5'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    field: pixTex('#6cbf4a', ['#7fd35c', '#5aab3c', '#8bd96a'], 70),
  };
  const palm = (x, z, h = 5) => { vox([[x, h / 2, z, 0.6, h, 0.6, '#8a5a2b'], [x, h + 0.2, z, 3.2, 0.5, 0.9, '#3ea83a'], [x, h + 0.2, z, 0.9, 0.5, 3.2, '#3ea83a'], [x, h + 0.6, z, 2.0, 0.5, 2.0, '#58c04a'], [x + 0.4, h - 0.3, z, 0.4, 0.4, 0.4, '#7a3a12']], root, { shadow: true }); circ(x, z, 0.45); };
  const obelisk = (x, z, h, s = 1, y0 = 0) => { const L = [[x, y0 + 0.4 * s, z, 2.6 * s, 0.8 * s, 2.6 * s, '#b89a6a'], [x, y0 + h / 2 + 0.8 * s, z, 1.5 * s, h, 1.5 * s, '#c98f6a'], [x, y0 + h + 1.1 * s, z, 1.0 * s, 0.6 * s, 1.0 * s, '#e7c86a'], [x, y0 + h + 1.5 * s, z, 0.5 * s, 0.35 * s, 0.5 * s, '#e7c86a']]; for (let i = 0; i < 6; i++) L.push([x, y0 + 2 * s + i * h / 7, z + 0.76 * s, 0.7 * s, 0.25 * s, 0.03, '#7a4a2a'], [x + 0.76 * s, y0 + 2.4 * s + i * h / 7, z, 0.03, 0.25 * s, 0.7 * s, '#7a4a2a']); vox(L, root, { shadow: true, block: true }); if (!y0) circ(x, z, 1.4 * s); };
  const seated = (x, z, s, ry, crown = '#e7c86a') => { const g = new THREE.Group(); vox([[0, 0.6 * s, 0, 2 * s, 1.2 * s, 2.6 * s, '#b98f52'], [0, 2.0 * s, -0.2 * s, 1.6 * s, 1.6 * s, 1.6 * s, '#c9935a'], [-0.45 * s, 1.6 * s, 0.9 * s, 0.6 * s, 0.4 * s, 1.2 * s, '#c9935a'], [0.45 * s, 1.6 * s, 0.9 * s, 0.6 * s, 0.4 * s, 1.2 * s, '#c9935a'], [-0.45 * s, 0.85 * s, 1.35 * s, 0.55 * s, 1.3 * s, 0.4 * s, '#c9935a'], [0.45 * s, 0.85 * s, 1.35 * s, 0.55 * s, 1.3 * s, 0.4 * s, '#c9935a'], [0, 3.4 * s, -0.3 * s, 1.5 * s, 1.4 * s, 1.0 * s, '#c9935a'], [0, 4.6 * s, -0.3 * s, 0.9 * s, 1.0 * s, 0.9 * s, '#c9935a'], [0, 4.7 * s, -0.4 * s, 1.3 * s, 1.1 * s, 0.9 * s, crown], [0, 5.5 * s, -0.3 * s, 0.6 * s, 0.6 * s, 0.6 * s, '#f1e6c8'], [0, 4.2 * s, 0.2 * s, 0.22 * s, 0.6 * s, 0.2 * s, '#8a5a2b']], g, { shadow: true }); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); circ(x, z, 1.3 * s); return g; };
  const standing = (x, y, z, s, ry, col = '#c9935a') => { const g = new THREE.Group(); vox([[0, 0.25 * s, 0, 1.2 * s, 0.5 * s, 1.2 * s, '#a88358'], [-0.22 * s, 1.1 * s, 0.1 * s, 0.38 * s, 1.3 * s, 0.45 * s, col], [0.22 * s, 1.1 * s, -0.15 * s, 0.38 * s, 1.3 * s, 0.45 * s, col], [0, 2.0 * s, 0, 0.9 * s, 0.6 * s, 0.6 * s, '#f1e6c8'], [0, 2.7 * s, 0, 1.0 * s, 1.0 * s, 0.55 * s, col], [0, 3.5 * s, 0, 0.55 * s, 0.6 * s, 0.5 * s, col], [0, 3.65 * s, -0.05 * s, 0.8 * s, 0.7 * s, 0.55 * s, '#e7c86a']], g, { shadow: true }); g.position.set(x, y, z); g.rotation.y = ry; root.add(g); return g; };
  const pylon = (x, z, w, h) => { const L = []; for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const hh = h / 6; L.push([x + sx * w * 0.3, hh * i + hh / 2, z, w * 0.4 * (1 - i * 0.05), hh, 3.4 - i * 0.15, i % 2 ? '#d9b57a' : '#cfa96c']); } L.push([x, (7 + h * 0.84) / 2, z, w * 0.24, h * 0.84 - 7, 2.8, '#c49c5c'], [x, 7.6, z + 1.42, w * 0.2, 0.8, 0.1, '#2b6bd6'], [x, 7.6, z - 1.42, w * 0.2, 0.8, 0.1, '#2b6bd6']); for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) L.push([x + sx * w * 0.3, 3 + i * 2.4, z + 1.72, w * 0.28, 0.3, 0.05, i % 2 ? '#e8213d' : '#2b6bd6'], [x + sx * w * 0.3, 3 + i * 2.4, z - 1.72, w * 0.28, 0.3, 0.05, i % 2 ? '#e8213d' : '#2b6bd6']); vox(L, root, { shadow: true, block: true }); solid(x - w * 0.5, x - w * 0.1, z - 1.7, z + 1.7); solid(x + w * 0.1, x + w * 0.5, z - 1.7, z + 1.7); };
  const pyramid = (x, z, base, h, col, cap) => { const L = []; const n = Math.round(h / 1.2); for (let i = 0; i < n; i++) { const w = base * (1 - i / n); L.push([x, 0.6 + i * 1.2, z, w, 1.2, w, i % 2 ? col : shade(col, -12)]); } if (cap) for (let i = Math.floor(n * 0.82); i < n; i++) { const w = base * (1 - i / n) + 0.05; L.push([x, 0.6 + i * 1.2, z, w, 1.22, w, '#f1e6c8']); } vox(L, root, { shadow: true, block: true }); solid(x - base / 2, x + base / 2, z - base / 2, z + base / 2); };
  const columns = (x0, z0, nx, nz, dx, dz, h, r) => { const L = []; for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = x0 + i * dx, z = z0 + j * dz; L.push([x, 0.5, z, r * 2.6, 1.0, r * 2.6, '#c49c5c'], [x, h / 2, z, r * 2, h, r * 2, j % 2 ? '#d9b57a' : '#d4ad70'], [x, h + 0.4, z, r * 2.9, 0.8, r * 2.9, '#cfa96c']); for (const y of [h * 0.3, h * 0.5, h * 0.7]) L.push([x, y, z, r * 2.1, 0.45, r * 2.1, ['#2b6bd6', '#e8213d', '#3ec95a'][(i + j) % 3]]); circ(x, z, r * 1.2); } vox(L, root, { shadow: true, block: true }); };

  // ---------- landscape: desert, the Nile, green banks, fences between the three regions ----------
  plane(T.sand, 540, 1520, -32, 480, 0, 6);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(70, 1540), new THREE.MeshToonMaterial({ color: '#2f9ee8', emissive: '#1460a8', emissiveIntensity: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.set(266, 0.06, 480); root.add(water);
  plane(T.field, 14, 1520, 223, 480, 0.03, 4); plane(T.field, 30, 1520, 316, 480, 0.03, 4); plane(T.sand, 200, 1520, 431, 480, 0.01, 6);
  vox([[231.5, 0.35, 480, 1, 0.7, 1520, '#c49c5c']]);
  solid(231, 390, -900, 2000); // the river: you cannot walk into it
  for (const [z0, z1] of [[-230, 220], [360, 660], [820, 1080]]) { solid(-1300, -210, z0 - 10, z1 + 10); solid(-1300, 231, z0 - 20, z0); solid(-1300, 231, z1, z1 + 20); }
  { const L = []; for (let z = -200; z < 1160; z += 9) { if (Math.sin(z * 0.37) > -0.2) L.push([226, 2.5, z, 0.5, 5, 0.5, '#8a5a2b'], [226, 5.2, z, 2.8, 0.45, 0.8, '#3ea83a'], [226, 5.2, z, 0.8, 0.45, 2.8, '#3ea83a']); if (Math.cos(z * 0.21) > 0) L.push([306, 2.5, z + 4, 0.5, 5, 0.5, '#8a5a2b'], [306, 5.2, z + 4, 2.8, 0.45, 0.8, '#3ea83a'], [306, 5.2, z + 4, 0.8, 0.45, 2.8, '#3ea83a']); if (((z + 200) / 9) % 7 === 3) { const c = ['#f1e6c8', '#ffd7a0', '#cfe8ff', '#ffc2d6'][((z + 200) / 9 | 0) % 4]; L.push([322, 2, z, 7, 4, 6, c], [322, 4.2, z, 7.4, 0.4, 6.4, '#ffffff'], [318.4, 1.3, z, 0.12, 2.6, 1.4, '#6b3a07']); } } vox(L, root, { shadow: true }); }

  // ======================= CAIRO: Grand Egyptian Museum + Giza =======================
  plane(T.stone, 150, 80, 0, 175, 0.04, 3); plane(T.road, 12, 110, 0, 105, 0.035, 3); plane(T.road, 160, 10, 140, 165, 0.035, 3); plane(T.road, 10, 250, -80, 0, 0.035, 3); plane(T.road, 10, 250, 80, 0, 0.035, 3); plane(T.road, 170, 10, 0, -82, 0.035, 3);
  for (const [x, z] of [[-20, 150], [20, 150], [-40, 180], [40, 180], [-60, 150], [60, 150], [-14, 120], [14, 120], [-14, 90], [14, 90], [-90, 60], [90, 60], [-90, -40], [90, -40], [150, 175], [190, 175]]) palm(x, z);
  vox([[-12, 7, 196, 2.6, 14, 2.6, '#d9b57a'], [12, 7, 196, 2.6, 14, 2.6, '#d9b57a'], [0, 14.6, 196, 27, 1.6, 2.8, '#c49c5c'], [-12, 14.6, 196, 3.2, 1.8, 3.2, '#e7c86a'], [12, 14.6, 196, 3.2, 1.8, 3.2, '#e7c86a']], root, { shadow: true, block: true });
  solid(-13.3, -10.7, 194.7, 197.3); solid(10.7, 13.3, 194.7, 197.3);
  const archTx = textTex([['آثار مصر', 120, '#ffffff', '#6b3a07'], ["EGYPT'S MONUMENTS", 46, '#ffe27a']], { w: 1024, h: 300, bg: '#a4600f', border: '#ffd23f', r: 26 });
  sign(archTx, 14, 4.1, 0, 17.6, 197.6); sign(archTx, 14, 4.1, 0, 17.6, 194.4, Math.PI);
  { const f = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.4, 0.8, 36), toon('#d9b57a')); f.position.set(0, 0.4, 168); root.add(f); const w = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 0.1, 36), new THREE.MeshToonMaterial({ color: '#3fb6ff', emissive: '#1d78c9', emissiveIntensity: 0.3 })); w.position.set(0, 0.82, 168); root.add(w); circ(0, 168, 6.4); obelisk(0, 168, 7, 0.6); }
  vox([[16, 1.4, 160, 0.4, 2.8, 0.4, '#6b3a07'], [16, 2.6, 160, 4.4, 2.4, 0.3, '#a4600f']], root, { shadow: true }); solid(13.8, 18.2, 159.6, 160.4);
  sign(textTex([['🗺️ خريطة آثار مصر', 54, '#ffffff'], ['وجواز سفر الآثار', 36, '#ffe27a']], { w: 512, h: 260, bg: '#6b3a07', border: '#ffd23f', r: 20 }), 4.1, 2.1, 16, 2.6, 160.2);
  label('🏛️ المتحف المصري الكبير ⬆', -8, 5, 132, 0, 6); label('🔺 الأهرامات (ورا المتحف) ⬆', -80, 5, 120, 0, 6); label('🚢 مرسى الباخرة ➡', 120, 5, 172, 0, 5.4);

  // ---- GEM forecourt + the hanging obelisk ----
  plane(T.marble, 120, 60, 0, 92, 0.045, 3);
  { const x = 0, z = 100; vox([[x, 0.5, z, 7, 1, 7, '#cdbfa5'], [x - 2.6, 3.2, z - 2.6, 0.5, 5.4, 0.5, '#8f96a8'], [x + 2.6, 3.2, z - 2.6, 0.5, 5.4, 0.5, '#8f96a8'], [x - 2.6, 3.2, z + 2.6, 0.5, 5.4, 0.5, '#8f96a8'], [x + 2.6, 3.2, z + 2.6, 0.5, 5.4, 0.5, '#8f96a8'], [x, 5.9, z, 5.8, 0.4, 5.8, '#8f96a8'], [x, 1.05, z, 2.6, 0.1, 2.6, '#e7c86a'], [x, 1.1, z, 1.2, 0.06, 0.8, '#6b3a07']], root, { shadow: true }); solid(x - 3.5, x + 3.5, z - 3.5, z + 3.5); obelisk(x, z, 18, 1.1, 6.1); }
  label('المسلة المعلقة', 0, 2.1, 103.6, 0, 3.4);
  // ---- GEM building: x -60..60, z -40..60, entrance x -8..8 on the facade (z 60) ----
  const GH = 24, GC = '#ece4d6', GS = [];
  const gw = (x0, z0, x1, z1, h = GH, c = GC) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || 1.2, d = Math.abs(z1 - z0) || 1.2; GS.push([cx, h / 2, cz, w, h, d, c]); solid(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2); };
  gw(-60, 60, -8, 60); gw(8, 60, 60, 60); GS.push([0, (GH + 10) / 2, 60, 16, GH - 10, 1.2, GC]);
  gw(-60, -40, -20, -40); gw(20, -40, 60, -40); GS.push([0, 5.6, -40, 40, 11.2, 1.2, GC], [0, 23.5, -40, 40, 1, 1.2, GC]); solid(-20, 20, -40.6, -39.4);
  gw(-60, -40, -60, 60); gw(60, -40, 60, 60);
  vox(GS, root, { block: true });
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), new THREE.MeshPhongMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.22, shininess: 120, depthWrite: false, side: THREE.DoubleSide })); g.position.set(0, 17, -40); root.add(g); vox([[0, 17, -40, 40, 0.3, 0.4, '#8f96a8'], [-10, 17, -40, 0.3, 12, 0.4, '#8f96a8'], [10, 17, -40, 0.3, 12, 0.4, '#8f96a8'], [0, 17, -40, 0.3, 12, 0.4, '#8f96a8']]); }
  // the famous facade: a huge wall of alabaster triangles
  const tri = ctex(512, 256, (g) => { g.fillStyle = '#e9ddc6'; g.fillRect(0, 0, 512, 256); for (let y = 0; y < 4; y++) for (let x = -1; x < 10; x++) { const up = (x + y) % 2 === 0; const X = x * 56 + (y % 2) * 28, Y = y * 64; g.fillStyle = ['#d8c49c', '#f4ead6', '#cdb58a', '#eadcc0', '#fff8ea'][(x * 7 + y * 3 + 20) % 5]; g.beginPath(); if (up) { g.moveTo(X, Y + 64); g.lineTo(X + 56, Y + 64); g.lineTo(X + 28, Y); } else { g.moveTo(X, Y); g.lineTo(X + 56, Y); g.lineTo(X + 28, Y + 64); } g.closePath(); g.fill(); g.strokeStyle = '#a88a58'; g.lineWidth = 3; g.stroke(); } });
  for (const [x, w] of [[-34, 52], [34, 52]]) { const t = tri.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(w / 14, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, GH - 0.4), new THREE.MeshToonMaterial({ map: t })); m.position.set(x, GH / 2, 60.65); root.add(m); }
  { const t = tri.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(16 / 14, 0.6); const m = new THREE.Mesh(new THREE.PlaneGeometry(16, GH - 10.4), new THREE.MeshToonMaterial({ map: t })); m.position.set(0, (GH + 10) / 2, 60.65); root.add(m); }
  vox([[0, GH + 0.6, 60, 122, 1.2, 2.2, '#cdb58a'], [-60, GH / 2, 60.8, 1.6, GH, 1.2, '#b89a6a'], [60, GH / 2, 60.8, 1.6, GH, 1.2, '#b89a6a'], [0, 10.4, 60.9, 17, 0.8, 0.6, '#6b3a07']], root, { shadow: true });
  sign(textTex([['المتحف المصري الكبير', 92, '#ffffff', '#3b1d05'], ['GRAND EGYPTIAN MUSEUM', 44, '#ffe27a']], { w: 1024, h: 230, bg: '#6b3a07', border: '#ffd23f', r: 20 }), 18, 4.0, 0, 14.6, 61.1);
  { const roof = new THREE.Mesh(new THREE.BoxGeometry(122, 0.5, 102), toon('#cdbfa5')); roof.position.set(0, GH + 0.2, 10); root.add(roof); }
  plane(T.marble, 119, 99, 0, 10, 0.05, 3);
  { const lm = new THREE.MeshBasicMaterial({ color: '#fff3d6', toneMapped: false }); for (const x of [-40, -20, 20, 40]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 96), lm); s.position.set(x, GH - 0.3, 10); root.add(s); } }
  // grand hall: Ramses II
  { const x = 0, z = 40, s = 1.45; vox([
    [x, 1, z, 6, 2, 4.4, '#b98f52'], [x, 2.1, z, 6.2, 0.2, 4.6, '#e7c86a'],
    [x - 0.45 * s, 2 + 1.9 * s, z + 0.25 * s, 0.75 * s, 2.6 * s, 0.9 * s, '#c98f6a'], [x + 0.45 * s, 2 + 1.9 * s, z - 0.3 * s, 0.75 * s, 2.6 * s, 0.9 * s, '#c98f6a'],
    [x, 2 + 3.7 * s, z, 1.9 * s, 1.2 * s, 1.1 * s, '#f1e6c8'], [x, 2 + 5.4 * s, z, 2.0 * s, 2.3 * s, 1.0 * s, '#c98f6a'],
    [x - 1.25 * s, 2 + 5.0 * s, z, 0.5 * s, 2.4 * s, 0.6 * s, '#c98f6a'], [x + 1.25 * s, 2 + 5.0 * s, z, 0.5 * s, 2.4 * s, 0.6 * s, '#c98f6a'],
    [x, 2 + 7.1 * s, z, 1.1 * s, 1.1 * s, 1.0 * s, '#c98f6a'], [x, 2 + 7.3 * s, z - 0.05 * s, 1.5 * s, 1.4 * s, 1.1 * s, '#e7c86a'], [x, 2 + 8.3 * s, z, 0.9 * s, 0.8 * s, 0.9 * s, '#f1e6c8'], [x, 2 + 6.5 * s, z + 0.5 * s, 0.25 * s, 0.6 * s, 0.2 * s, '#8a5a2b'],
    [x - 0.2 * s, 2 + 7.2 * s, z + 0.55 * s, 0.14 * s, 0.1 * s, 0.05, '#3b1d05'], [x + 0.2 * s, 2 + 7.2 * s, z + 0.55 * s, 0.14 * s, 0.1 * s, 0.05, '#3b1d05']], root, { shadow: true }); solid(x - 3.2, x + 3.2, z - 2.4, z + 2.4); }
  label('تمثال رمسيس الثاني', 0, 1.3, 42.3, 0, 3.6);
  // timeline wall: the story of the pharaohs (west wall of the grand hall)
  const ERAS = SITES.filter((s) => s.g === 'timeline');
  ERAS.forEach((s, i) => { const z = 54 - i * 5.4; sign(textTex([[s.i, 90, '#ffffff'], [s.n.split(' — ')[0], 40, '#ffffff'], [s.d, 30, '#ffe27a']], { w: 420, h: 420, bg: ['#7a4a0c', '#8a5410', '#6b3a07', '#a4600f', '#7a4a0c', '#8a5410'][i], border: '#ffd23f', r: 24 }), 4.4, 4.4, -59.3, 4.6, z, Math.PI / 2); });
  sign(textTex([['📜 تاريخ الفراعنة', 64, '#ffffff', '#3b1d05']], { w: 640, h: 120, bg: '#a4600f', border: '#ffd23f', r: 20 }), 10, 1.9, -59.3, 8.4, 40.5, Math.PI / 2);
  // grand staircase (walkable: each step is a platform), statues on both sides, the pyramids window at the top
  const STEPS = 30, SH = 0.3, SD = 1.3, SZ0 = 18; let topY = 0.03;
  for (let i = 0; i < STEPS; i++) { const top = 0.03 + (i + 1) * SH, z = SZ0 - i * SD - SD / 2; C.platform(OFF, z, 18, SD, top, i % 2 ? '#e3d6bd' : '#d8c8a8', { th: top }); topY = top; }
  const LZ0 = SZ0 - STEPS * SD; // the landing runs from LZ0 to -39
  C.platform(OFF, (LZ0 - 39) / 2, 40, LZ0 + 39, topY, '#d8c8a8', { th: topY });
  { const L = []; for (let i = 0; i < STEPS; i += 3) { const top = 0.03 + (i + 1) * SH, z = SZ0 - i * SD - SD / 2; for (const sx of [-1, 1]) L.push([sx * 10.2, top / 2, z - SD, 2.4, top, SD * 3, '#cdb58a']); } vox(L, root, { shadow: true }); solid(-11.4, -9.1, LZ0, SZ0); solid(9.1, 11.4, LZ0, SZ0); C.solids.push({ x0: OFF - 20, x1: OFF + 20, z0: -39, z1: LZ0, ymax: topY - 0.5 }); }
  for (let i = 1; i < STEPS; i += 3) { const top = 0.03 + (i + 1) * SH, z = SZ0 - i * SD - SD / 2; standing(-10.2, top, z, 1.15, 0.25, i % 2 ? '#c98f6a' : '#7d6a55'); standing(10.2, top, z, 1.15, -0.25, i % 2 ? '#7d6a55' : '#c98f6a'); }
  vox([[0, topY + 0.5, -38.4, 39, 1, 0.3, '#8f96a8']]);
  label('الدرج العظيم', 0, 1.6, SZ0 + 0.7, 0, 3.4);
  // ---- Tutankhamun galleries (west wing x -58..-14, z -38..16) ----
  vox([[-39, GH / 2, 18, 38, GH, 1, GC], [-15, GH / 2, 18, 2, GH, 1, GC], [-19, (GH + 8) / 2, 18, 6, GH - 8, 1, GC]], root, { block: true }); solid(-58, -22, 17.4, 18.6); solid(-16, -14, 17.4, 18.6);
  vox([[-13.4, GH / 2, -11, 1, GH, 58, GC]], root, { block: true }); solid(-14, -12.8, -40, 18);
  label('👑 قاعات توت عنخ آمون', -19, 9, 18.6, 0, 6);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(44, 56), toon('#3a2a1c')); f.rotation.x = -Math.PI / 2; f.position.set(-36, 0.07, -11); root.add(f); }
  const glassCase = (x, z, w, d, h = 2.2) => { vox([[x, 0.5, z, w + 0.4, 1, d + 0.4, '#1d1410'], [x, 1.02, z, w + 0.2, 0.04, d + 0.2, '#e7c86a']], root, { shadow: true }); const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshPhongMaterial({ color: '#cfefff', transparent: true, opacity: 0.2, shininess: 120, depthWrite: false })); g.position.set(x, 1 + h / 2, z); root.add(g); solid(x - w / 2 - 0.2, x + w / 2 + 0.2, z - d / 2 - 0.2, z + d / 2 + 0.2); };
  glassCase(-36, -4, 2.4, 2.4);
  vox([[-36, 1.9, -4, 1.0, 1.3, 0.8, '#f2c234'], [-36, 2.65, -4.05, 1.3, 0.5, 0.85, '#f2c234'], [-36.55, 1.7, -4, 0.25, 1.2, 0.7, '#1f4fb8'], [-35.45, 1.7, -4, 0.25, 1.2, 0.7, '#1f4fb8'], [-36, 1.25, -3.6, 1.3, 0.35, 0.2, '#1f4fb8'], [-36.2, 2.05, -3.58, 0.16, 0.08, 0.04, '#1d1d2b'], [-35.8, 2.05, -3.58, 0.16, 0.08, 0.04, '#1d1d2b'], [-36, 2.95, -3.7, 0.25, 0.25, 0.25, '#f2c234'], [-36, 1.25, -3.95, 0.35, 0.35, 0.5, '#1f4fb8'], [-36, 1.55, -3.55, 0.12, 0.55, 0.12, '#1f4fb8']], root, { shadow: true });
  glassCase(-48, -4, 2.8, 2.8, 2.6);
  vox([[-48, 1.45, -4, 1.4, 0.15, 1.2, '#f2c234'], [-48, 2.3, -4.55, 1.4, 1.6, 0.15, '#f2c234'], [-48, 2.3, -4.46, 1.0, 1.1, 0.04, '#2f8bff'], [-48.65, 1.2, -3.45, 0.15, 0.8, 0.15, '#f2c234'], [-47.35, 1.2, -3.45, 0.15, 0.8, 0.15, '#f2c234'], [-48.65, 1.2, -4.55, 0.15, 0.8, 0.15, '#f2c234'], [-47.35, 1.2, -4.55, 0.15, 0.8, 0.15, '#f2c234'], [-48.7, 1.85, -4, 0.1, 0.5, 1.2, '#f2c234'], [-47.3, 1.85, -4, 0.1, 0.5, 1.2, '#f2c234']], root, { shadow: true });
  vox([[-26, 0.5, -20, 5.4, 1, 4.4, '#1d1410'], [-26, 2.6, -20, 4.6, 3.2, 3.6, '#f2c234'], [-26, 4.4, -20, 5.0, 0.5, 4.0, '#e7b82c'], [-26, 2.6, -18.18, 3.8, 2.4, 0.05, '#1f4fb8'], [-26, 2.6, -18.15, 3.2, 1.8, 0.05, '#f2c234']], root, { shadow: true }); solid(-28.8, -23.2, -22.3, -17.7);
  vox([[-46, 0.5, -20, 2.4, 1, 3.6, '#1d1410'], [-46, 1.5, -20, 1.6, 1.0, 3.0, '#f2c234'], [-46, 2.2, -20.4, 0.9, 0.5, 1.8, '#151515'], [-46, 2.9, -19.4, 0.6, 1.0, 0.7, '#151515'], [-46, 3.3, -18.9, 0.4, 0.35, 0.8, '#151515'], [-46.18, 3.7, -19.3, 0.12, 0.55, 0.2, '#151515'], [-45.82, 3.7, -19.3, 0.12, 0.55, 0.2, '#151515'], [-46, 2.7, -19.1, 0.6, 0.12, 0.1, '#f2c234']], root, { shadow: true }); solid(-47.3, -44.7, -21.9, -18.1);
  { const L = [[-36, 0.5, -32, 4.6, 1, 3.6, '#1d1410'], [-36, 1.9, -32.2, 1.8, 0.9, 1.2, '#f2c234'], [-36, 1.5, -30.4, 0.15, 0.15, 3.2, '#c8925a']]; for (const sx of [-1, 1]) L.push([-36 + sx * 1.15, 1.7, -32.6, 0.12, 1.4, 1.4, '#e7b82c'], [-36 + sx * 1.15, 1.7, -32.6, 0.14, 0.2, 1.5, '#8a5a2b']); vox(L, root, { shadow: true }); solid(-38.4, -33.6, -34, -30); }
  glassCase(-52, -32, 2.4, 5, 1.6);
  vox([[-52, 1.4, -32, 1.3, 0.8, 4.2, '#f2c234'], [-52, 1.85, -30.3, 1.0, 0.3, 0.7, '#f2c234'], [-52, 1.85, -32.6, 1.1, 0.1, 1.4, '#1f4fb8'], [-52, 1.85, -30.3, 0.7, 0.12, 0.4, '#1f4fb8']], root, { shadow: true });
  // ---- main galleries (east wing x 14..58, z -38..16) ----
  vox([[39, GH / 2, 18, 38, GH, 1, GC], [15, GH / 2, 18, 2, GH, 1, GC], [19, (GH + 8) / 2, 18, 6, GH - 8, 1, GC]], root, { block: true }); solid(22, 58, 17.4, 18.6); solid(14, 16, 17.4, 18.6);
  vox([[13.4, GH / 2, -11, 1, GH, 58, GC]], root, { block: true }); solid(12.8, 14, -40, 18);
  label('🏺 قاعات العرض الرئيسية', 19, 9, 18.6, 0, 6);
  { const S = [[36, 0.5, -10, 3.6, 1.0, 34, '#3b2a1a']]; for (let i = 0; i < 30; i++) { const z = -24.5 + i, k = 1 - Math.pow((i - 14.5) / 15.5, 2), w = 0.9 + 2.0 * k; S.push([36, 1.5 + (1 - k) * 0.8, z, w, 0.7, 1.02, '#a06a35']); } S.push([36, 2.7, -10, 0.3, 2, 0.3, '#8a5a2b'], [36, 2.3, -13, 1.8, 1.0, 4, '#c8925a'], [36, 2.9, -25.6, 0.35, 1.8, 0.35, '#a06a35'], [36, 2.9, 5.6, 0.35, 1.8, 0.35, '#a06a35']); vox(S, root, { shadow: true }); solid(34, 38, -27.2, 7.2); }
  label('⛵ مركب خوفو', 36, 5.6, 8.4, 0, 4);
  vox([[22, 0.5, -30, 2.2, 1.0, 4, '#3b2a1a'], [22, 1.35, -30, 1.4, 0.7, 3.4, '#2b6bd6'], [22, 1.72, -28.8, 1.1, 0.1, 0.9, '#f2c234'], [22, 1.72, -30.5, 1.1, 0.1, 1.4, '#e8213d']], root, { shadow: true }); solid(20.8, 23.2, -32.2, -27.8);
  { const L = [[50, 0.5, -30, 3.6, 1, 1.6, '#3b2a1a']]; [['#d9b57a', '#1d1d2b'], ['#8a5a2b', '#8a5a2b'], ['#151515', '#151515'], ['#c98f6a', '#c98f6a']].forEach(([c], i) => { const x = 48.6 + i * 0.95; L.push([x, 1.45, -30, 0.6, 0.9, 0.6, '#efe3cc'], [x, 2.05, -30, 0.5, 0.35, 0.5, c]); }); vox(L, root, { shadow: true }); solid(48, 52, -31, -29); }
  const hiero = ctex(512, 256, (g) => { g.fillStyle = '#e2c48c'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#5a3410'; g.fillStyle = '#5a3410'; g.lineWidth = 3; for (let c = 0; c < 8; c++) { g.fillRect(c * 64, 0, 2, 256); for (let r = 0; r < 4; r++) { const X = c * 64 + 32, Y = r * 62 + 32, k = (c * 5 + r * 3) % 6; g.beginPath(); if (k === 0) { g.ellipse(X, Y, 16, 8, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(X, Y, 4, 0, 7); g.fill(); } else if (k === 1) { g.moveTo(X - 14, Y + 12); g.lineTo(X, Y - 14); g.lineTo(X + 14, Y + 12); g.stroke(); } else if (k === 2) { g.arc(X, Y - 6, 7, 0, 7); g.moveTo(X, Y + 1); g.lineTo(X, Y + 16); g.moveTo(X - 10, Y + 5); g.lineTo(X + 10, Y + 5); g.stroke(); } else if (k === 3) { g.moveTo(X - 16, Y); for (let t = 0; t < 4; t++) g.lineTo(X - 12 + t * 8, Y + (t % 2 ? -6 : 6)); g.stroke(); } else if (k === 4) { g.arc(X, Y, 11, 0, 7); g.stroke(); g.beginPath(); g.arc(X, Y, 3, 0, 7); g.fill(); } else { g.fillRect(X - 12, Y - 10, 24, 4); g.fillRect(X - 4, Y - 6, 8, 18); } } } });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), new THREE.MeshToonMaterial({ map: hiero })); m.position.set(59.3, 5, -10); m.rotation.y = -Math.PI / 2; root.add(m); }
  // ---- Giza plateau (behind the museum, seen through the window) ----
  pyramid(-20, -130, 52, 34, '#d9b57a'); pyramid(60, -165, 48, 33.6, '#d4ad70', true); pyramid(130, -190, 26, 18, '#cfa96c');
  for (const [x, z] of [[100, -205], [112, -208], [124, -210]]) pyramid(x, z, 7, 4.8, '#c49c5c');
  { const x = 110, z = -110, S = [];
    S.push([x, 1.6, z, 18, 3.2, 6, '#d8b071'], [x - 7.5, 3.6, z, 3.4, 2.4, 5.6, '#d8b071'], [x + 9.5, 0.9, z - 1.8, 6, 1.8, 1.6, '#cfa96c'], [x + 9.5, 0.9, z + 1.8, 6, 1.8, 1.6, '#cfa96c']);
    S.push([x + 6, 5.6, z, 4.4, 4.8, 4.6, '#d8b071'], [x + 6.2, 6.0, z, 4.8, 5.4, 5.6, '#d2a865'], [x + 8.3, 5.8, z, 0.6, 1.0, 0.8, '#c49c5c'], [x + 8.25, 6.6, z - 0.9, 0.2, 0.35, 0.6, '#6b3a07'], [x + 8.25, 6.6, z + 0.9, 0.2, 0.35, 0.6, '#6b3a07'], [x + 8.25, 5.1, z, 0.2, 0.25, 1.4, '#8a5a2b']);
    for (let i = 0; i < 5; i++) S.push([x + 6.25, 3.8 + i * 0.95, z - 2.85, 4.8, 0.45, 0.1, '#2b6bd6'], [x + 6.25, 3.8 + i * 0.95, z + 2.85, 4.8, 0.45, 0.1, '#2b6bd6']);
    vox(S, root, { shadow: true, block: true }); solid(x - 9.2, x + 12.5, z - 3.2, z + 3.2); }
  const camel = (x, z, ry) => { const g = new THREE.Group(); vox([[0, 1.6, 0, 1.0, 1.1, 2.4, '#c9935a'], [0, 2.3, -0.2, 0.9, 0.7, 0.9, '#b97f45'], [0, 2.6, 1.3, 0.45, 1.4, 0.45, '#c9935a'], [0, 3.3, 1.65, 0.55, 0.5, 0.8, '#c9935a'], [0, 2.4, -0.2, 1.2, 0.2, 1.2, '#e8213d'], ...[[-0.35, -0.9], [0.35, -0.9], [-0.35, 0.9], [0.35, 0.9]].map(([a, b]) => [a, 0.55, b, 0.3, 1.1, 0.3, '#b97f45'])], g, { shadow: true }); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); circ(x, z, 1.3); };
  camel(-60, -86, 0.6); camel(-66, -92, 2.2); camel(20, -92, -0.4); camel(140, -96, 1.2);
  // ---- docks + the cruise ship ----
  for (const k of Object.keys(DOCK)) { const [, z] = DOCK[k]; vox([[220, 0.4, z, 22, 0.5, 16, '#8a5a2b'], [210, 1.0, z - 7, 0.3, 1.4, 0.3, '#6b3a07'], [230, 1.0, z - 7, 0.3, 1.4, 0.3, '#6b3a07'], [210, 1.0, z + 7, 0.3, 1.4, 0.3, '#6b3a07'], [230, 1.0, z + 7, 0.3, 1.4, 0.3, '#6b3a07']], root, { shadow: true }); }
  label('🚢 مرسى الباخرة — رحلات للأقصر وأسوان', 206, 5, 150, -Math.PI / 2, 7);
  const ship = new THREE.Group(); { const L = []; L.push([0, 1.2, 0, 9, 2.4, 40, '#ffffff'], [0, 0.4, 0, 9.2, 0.8, 40.4, '#1f4fb8'], [0, 1.2, 20.6, 6, 2.4, 2, '#ffffff'], [0, 3.6, -2, 8, 2.4, 30, '#f4f4f4'], [0, 6.0, -4, 7, 2.4, 22, '#ffffff'], [0, 7.6, 2, 5, 1.0, 6, '#ffd23f'], [0, 8.5, -12, 1.4, 2.2, 1.4, '#a4600f']); for (let i = 0; i < 12; i++) for (const sx of [-1, 1]) L.push([sx * 4.52, 1.4, -17 + i * 3, 0.06, 0.9, 1.6, '#2b6bd6'], [sx * 4.02, 3.7, -15 + i * 2.4, 0.06, 0.9, 1.4, '#2b6bd6']); vox(L, ship, { shadow: true });
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.3), new THREE.MeshBasicMaterial({ map: textTex([['باخرة لولو 🚢', 70, '#1f4fb8']], { w: 512, h: 110 }), transparent: true, toneMapped: false })); nm.position.set(-4.62, 1.3, 0); nm.rotation.y = -Math.PI / 2; ship.add(nm); }
  ship.position.set(255, 0.15, 150); root.add(ship);

  // ======================= LUXOR =======================
  plane(T.stone, 8, 112, 150, 486, 0.04, 3); plane(T.road, 70, 8, 190, 520, 0.035, 3); plane(T.road, 8, 160, 60, 520, 0.035, 3); plane(T.road, 100, 8, 105, 470, 0.035, 3);
  label('🚢 مرسى الأقصر', 232, 5, 520, -Math.PI / 2, 5); label('الأقصر — طيبة القديمة', 196, 5, 500, -Math.PI / 2, 6);
  pylon(150, 556, 24, 14); seated(144, 550, 1.6, Math.PI); seated(156, 550, 1.6, Math.PI); obelisk(139, 551, 15);
  columns(144, 564, 2, 7, 12, 4.4, 11, 1.1); vox([[150, 11.8, 577, 15, 0.8, 30, '#cfa96c']], root, { shadow: true });
  label('معبد الأقصر', 150, 2.4, 553.6, Math.PI, 4.4);
  { const L = []; for (let z = 440; z <= 540; z += 5) for (const s of [-1, 1]) { const x = 150 + s * 6; L.push([x, 0.5, z, 1.4, 1.0, 2.6, '#c49c5c'], [x, 1.35, z + 0.4, 1.0, 0.8, 1.6, '#d8b071'], [x, 1.95, z - 0.65, 0.8, 0.9, 0.8, '#d8b071'], [x - s * 0.05, 2.3, z - 0.6, 0.9, 0.3, 0.3, '#cfa96c']); circ(x, z, 1.0); } vox(L, root, { shadow: true }); }
  pylon(150, 430, 30, 16); columns(134, 422, 8, 4, 4.6, -6, 12, 1.25);
  { const L = []; for (let j = 0; j < 4; j++) L.push([150, 12.8, 422 - j * 6, 36, 0.8, 2.4, '#cfa96c']); vox(L, root, { shadow: true }); }
  obelisk(122, 434, 22); label('معابد الكرنك', 150, 2.4, 432.2, 0, 4.6);
  { const lake = new THREE.Mesh(new THREE.BoxGeometry(22, 0.2, 14), new THREE.MeshToonMaterial({ color: '#2f9ee8', emissive: '#1460a8', emissiveIntensity: 0.3 })); lake.position.set(196, 0.1, 410); root.add(lake); vox([[196, 0.25, 402.6, 23, 0.5, 1, '#c49c5c'], [196, 0.25, 417.4, 23, 0.5, 1, '#c49c5c'], [184.6, 0.25, 410, 1, 0.5, 15.8, '#c49c5c'], [207.4, 0.25, 410, 1, 0.5, 15.8, '#c49c5c']]); solid(185, 207, 403, 417); }
  label('⬅ البر الغربي: حتشبسوت · وادي الملوك · ممنون', 96, 5, 524, Math.PI / 2, 8);
  { const x = 0, z = 440, L = []; L.push([x, 14, z - 22, 110, 28, 10, '#c49c5c'], [x - 40, 10, z - 16, 30, 20, 6, '#cfa96c'], [x + 38, 11, z - 16, 34, 22, 6, '#cfa96c']);
    for (const [y, d, w] of [[1.5, 0, 50], [4.5, -6, 44], [7.5, -12, 36]]) { L.push([x, (y + 1.5) / 2, z + d, w, y + 1.5, 6, '#e2cfa8']); for (let i = 0; i < Math.floor(w / 3.2); i++) L.push([x - w / 2 + 1.6 + i * 3.2, y + 3, z + d + 3.1, 1.2, 3, 1.2, '#f1e6c8']); L.push([x, y + 4.7, z + d + 3.1, w, 0.5, 1.4, '#e2cfa8']); }
    L.push([x, 1.1, z + 8, 8, 2.2, 10, '#e2cfa8']); vox(L, root, { shadow: true, block: true }); solid(x - 55, x + 55, z - 27, z - 15); solid(x - 25, x + 25, z - 15, z + 3); solid(x - 4, x + 4, z + 3, z + 13); }
  label('معبد حتشبسوت', 0, 3.6, 453.2, 0, 4.6);
  { const x = -20, z = 560; vox([[x, 10, z, 14, 20, 26, '#c49c5c'], [x + 7.1, 2.2, z, 0.2, 4.4, 2.6, '#2b1d12'], [x + 7.15, 4.8, z, 0.2, 0.6, 3.2, '#a4600f']], root, { shadow: true, block: true }); solid(x - 7, x + 7, z - 13, z + 13); label('وادي الملوك — KV62', x + 7.3, 6.2, z, Math.PI / 2, 4.6); }
  seated(30, 600, 3.2, Math.PI / 2, '#c9935a'); seated(30, 614, 3.2, Math.PI / 2, '#c9935a'); label('تمثالا ممنون', 40, 2.2, 607, Math.PI / 2, 4.4);
  for (const [x, z] of [[190, 480], [190, 560], [120, 600], [100, 450], [60, 600], [80, 400]]) palm(x, z);

  // ======================= ASWAN =======================
  plane(T.road, 70, 8, 190, 950, 0.035, 3); plane(T.road, 8, 200, 100, 950, 0.035, 3);
  label('🚢 مرسى أسوان', 232, 5, 950, -Math.PI / 2, 5); label('أسوان — بوابة النوبة', 196, 5, 930, -Math.PI / 2, 6);
  { const x = 0, z = 930; vox([[x - 6, 12, z, 12, 24, 52, '#cfa96c'], [x - 6, 25, z, 10, 2, 46, '#c49c5c'], [x + 0.4, 16, z, 1, 2, 40, '#d9b57a'], [x + 0.25, 3.8, z, 0.2, 7.6, 3.4, '#2b1d12'], [x + 0.6, 21, z, 0.5, 2.5, 3, '#c9935a']], root, { shadow: true, block: true }); solid(x - 12, x + 0.5, z - 26, z + 26);
    for (const dz of [-15, -7.5, 7.5, 15]) seated(x + 4, z + dz, 2.6, Math.PI / 2);
    label('معبد أبو سمبل', x + 0.6, 9.2, z, Math.PI / 2, 4.6); }
  { const x = 0, z = 990; vox([[x - 5, 8, z, 10, 16, 24, '#d4ad70'], [x + 0.25, 2.8, z, 0.2, 5.6, 2.6, '#2b1d12']], root, { shadow: true, block: true }); solid(x - 10, x + 0.5, z - 12, z + 12); for (const dz of [-9, -5.5, -2.2, 2.2, 5.5, 9]) standing(x + 1.6, 0, z + dz, 2.4, Math.PI / 2, Math.abs(dz) > 3 && Math.abs(dz) < 6 ? '#d9a75e' : '#c9935a'); label('معبد نفرتاري', x + 0.6, 7.4, z, Math.PI / 2, 4.4); }
  { const x = 266, z = 900; const isl = new THREE.Mesh(new THREE.CylinderGeometry(13, 14, 1.2, 28), toon('#d8b071')); isl.position.set(x, 0.3, z); root.add(isl); const L = [];
    for (let i = 0; i < 6; i++) L.push([x - 7.5 + i * 3, 3.8, z + 4, 1.5, 6.8, 1.5, '#e2c48c'], [x - 7.5 + i * 3, 7.4, z + 4, 2.2, 0.6, 2.2, '#3ec95a']); L.push([x, 8, z + 4, 18, 0.6, 2.4, '#d9b57a'], [x - 6, 5, z - 3, 6, 9, 6, '#d9b57a'], [x + 6, 5, z - 3, 6, 9, 6, '#d9b57a'], [x, 6.4, z - 3, 6, 4.2, 5, '#c49c5c']);
    vox(L, root, { shadow: true }); palm(x - 10, z - 6); palm(x + 10, z - 5); }
  label('معبد فيلة على الجزيرة ➡', 226, 3.4, 900, -Math.PI / 2, 5);
  { const x = 100, z = 870; const L = [[x, 0.05, z, 34, 0.1, 12, '#b5654a']]; for (let i = 0; i < 26; i++) { const w = 2.4 - i * 0.06; L.push([x - 13 + i, 0.6, z, 1.02, 1.1, w, '#c1735a']); } L.push([x + 3, 0.7, z + 0.4, 0.2, 1.2, 2.4, '#5a2c1f'], [x, 1.4, z - 6.5, 34, 2.8, 1, '#a65842'], [x, 1.4, z + 6.5, 34, 2.8, 1, '#a65842']); vox(L, root, { shadow: true }); solid(x - 17, x + 17, z - 7, z - 6); solid(x - 17, x + 17, z + 6, z + 7); label('المسلة الناقصة', x, 3.8, z - 7.1, Math.PI, 4.4); }
  { const z = 1060; vox([[110, 3, z, 200, 6, 6, '#9aa3b5'], [110, 6.4, z, 200, 0.8, 7, '#7d879a']], root, { shadow: true, block: true }); solid(10, 230, z - 3, z + 3);
    const L = [[60, 1, z - 14, 6, 2, 6, '#e6e8ee']]; for (const a of [0, 1, 2, 3]) { const ang = a * Math.PI / 2; L.push([60 + Math.cos(ang) * 1.3, 9, z - 14 + Math.sin(ang) * 1.3, 1.2, 16, 1.2, '#f4f5f8']); } L.push([60, 17.4, z - 14, 4.6, 0.8, 4.6, '#f4f5f8']); vox(L, root, { shadow: true }); circ(60, z - 14, 3.2); label('السد العالي', 110, 8.2, z - 3.6, Math.PI, 4.4); }
  { const L = []; const cols = ['#2fc4ff', '#ffd23f', '#ff8fb8', '#7cf04a', '#ff8a1f', '#b277ff'];
    [[130, 930], [142, 936], [154, 930], [134, 948], [150, 950]].forEach(([x, z], i) => { const c = cols[i % cols.length]; L.push([x, 2.2, z, 7, 4.4, 6, c], [x, 4.6, z, 7.4, 0.4, 6.4, '#ffffff'], [x, 1.4, z - 3.05, 1.6, 2.8, 0.15, '#6b3a07'], [x - 2.2, 2.8, z - 3.05, 1.0, 1.0, 0.15, '#ffffff'], [x + 2.2, 2.8, z - 3.05, 1.0, 1.0, 0.15, '#ffffff']); for (let t = 0; t < 6; t++) L.push([x - 3 + t * 1.2, 3.9, z - 3.06, 0.6, 0.3, 0.12, cols[(i + t + 1) % cols.length]]); solid(x - 3.6, x + 3.6, z - 3.1, z + 3.1); });
    vox(L, root, { shadow: true, block: true }); for (const [x, z] of [[130, 930], [154, 930], [142, 936]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffffff')); d.position.set(x, 4.8, z); root.add(d); } }
  label('القرية النوبية', 142, 6.4, 924, Math.PI, 4.4);
  for (const [x, z] of [[190, 900], [190, 1000], [60, 900], [60, 1000], [120, 1000], [30, 870]]) palm(x, z);
  const FEL = []; for (let i = 0; i < 10; i++) { const g = new THREE.Group(); vox([[0, 0.4, 0, 1.6, 0.5, 4.2, '#8a5a2b'], [0, 0.7, 0, 1.3, 0.2, 3.8, '#c8925a'], [0, 3.2, 0.2, 0.15, 5, 0.15, '#6b3a07']], g, { shadow: true }); const sail = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1, 1.8), new THREE.Vector3(0, 6, -0.2), new THREE.Vector3(0, 1, -1.6)]), new THREE.MeshToonMaterial({ color: '#ffffff', side: THREE.DoubleSide })); sail.geometry.computeVertexNormals(); g.add(sail); g.position.set(i % 2 ? 282 : 244, 0.2, -150 + i * 135); root.add(g); FEL.push({ g, sp: 2 + (i % 3) * 0.6, dir: i % 2 ? -1 : 1 }); }

  // ======================= people =======================
  const NPC = [];
  const UNI = { top: 'polo', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'none', bag: 'none' };
  const guideLook = (base, extra, top) => { const L = C.cloneLook(C.PRESETS[base]); Object.assign(L, UNI, extra || {}); L.c = Object.assign({}, L.c, { top: top || '#a4600f', bottom: '#f1e6c8', shoes: '#6b3a07' }); return L; };
  const addNPC = (e) => { const k = C.makeAvatar(e.look); k.scale.setScalar(1.1); k.position.set(OFF + e.x, 0.12, e.z); k.rotation.y = e.yaw; C.scene.add(k); const tag = nameTag(e.nm); tag.position.set(0, 2.55, 0); k.add(tag); const n = Object.assign({ k, seen: false, bub: null, bubT: 0 }, e); NPC.push(n); circ(e.x, e.z, 0.5); };
  [
    { id: 'salma', nm: 'المرشدة سلمى', role: 'مرشدة سياحية', av: '🧕', x: -8, z: 176, yaw: Math.PI, look: guideLook(0, { hair: 'long' }), hello: 'أهلاً بيك في آثار مصر! 🇪🇬' },
    { id: 'khaled', nm: 'د. خالد', role: 'أمين المتحف', av: '👨‍🏫', x: 8, z: 50, yaw: Math.PI, look: guideLook(3, { glasses: 'round' }, '#1d2030'), hello: 'نورت المتحف المصري الكبير! 🏛️' },
    { id: 'sayed', nm: 'عم سيد الجمّال', role: 'هضبة الجيزة', av: '🐪', x: -60, z: -80, yaw: Math.PI, look: guideLook(1, { hat: 'cap' }, '#ffffff'), hello: 'أهلاً بالأبطال عند الأهرامات! 🐪' },
    { id: 'captain', nm: 'الريس حسن', role: 'قبطان باخرة لولو', av: '🧑‍✈️', x: 214, z: 145, yaw: -Math.PI / 2, look: guideLook(1, { hat: 'cap' }, '#ffffff'), hello: 'الباخرة جاهزة على النيل! 🚢' },
    { id: 'mona', nm: 'أبلة منى', role: 'مرشدة الأقصر', av: '👩‍🏫', x: 200, z: 512, yaw: -Math.PI / 2, look: guideLook(2, { hair: 'pony' }), hello: 'أهلاً بيك في الأقصر! 🏛️' },
    { id: 'captain2', nm: 'الريس حسن', role: 'قبطان باخرة لولو', av: '🧑‍✈️', x: 214, z: 515, yaw: -Math.PI / 2, look: guideLook(1, { hat: 'cap' }, '#ffffff'), hello: 'الباخرة مستنياك! 🚢' },
    { id: 'fatma', nm: 'حاجة فاطمة', role: 'القرية النوبية', av: '👵', x: 142, z: 918, yaw: Math.PI, look: guideLook(0, { hair: 'bun' }, '#2fc4ff'), hello: 'مرحب بيك في النوبة! 🌞' },
    { id: 'captain3', nm: 'الريس حسن', role: 'قبطان باخرة لولو', av: '🧑‍✈️', x: 214, z: 945, yaw: -Math.PI / 2, look: guideLook(1, { hat: 'cap' }, '#ffffff'), hello: 'نرجع بالباخرة؟ 🚢' },
  ].forEach(addNPC);
  const VIS = [];
  [[[-30, 150], [30, 150], [30, 185], [-30, 185]], [[-24, 28], [24, 28], [24, 54], [-24, 54]], [[-60, -70], [40, -78], [90, -96], [-40, -96]], [[146, 470], [146, 535]], [[60, 470], [60, 600]], [[110, 900], [110, 1000]], [[30, 900], [30, 1010]]].forEach((loop, i) => { for (let j = 0; j < 2; j++) { const k = C.makeAvatar(C.randomLook((i + j) % 2 ? 'girl' : 'boy')); k.scale.setScalar(j ? 0.9 : 1.05); C.scene.add(k); VIS.push({ k, loop, seg: j % loop.length, t: 0.4 * j, sp: 1.1 + j * 0.3 }); } });

  // ======================= UI: dialogs, info cards (+ narration), passport, ship rides =======================
  const st2 = document.createElement('style'); st2.textContent = CSS; document.head.appendChild(st2);
  const ui = document.createElement('div'); ui.className = 'egyUI'; ui.id = 'egyP'; ui.setAttribute('dir', 'rtl'); document.body.appendChild(ui);
  const ride = document.createElement('div'); ride.className = 'egyRide'; ride.setAttribute('dir', 'rtl'); ride.innerHTML = '<div class="t"></div><div class="f"></div><div class="bar"><i></i></div><button class="sk" data-eg="skip">⏩ وصّلني على طول</button>'; document.body.appendChild(ride);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let RIDE = null;
  function openUI(cls, html) { ui.className = 'egyUI on ' + cls; ui.innerHTML = html; document.body.classList.add('mallFocus'); C.setPanel('egypt'); }
  function closeUI() { hush(); ui.className = 'egyUI'; ui.innerHTML = ''; if (!RIDE) { document.body.classList.remove('mallFocus'); C.setPanel(null); } }
  // narration with the device's Arabic voice (when the device has one)
  const TTS = window.speechSynthesis || null; let arVoice = null;
  const pickVoice = () => { if (!TTS) return; const vs = TTS.getVoices() || []; arVoice = vs.find((v) => /^ar[-_]EG/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)) || null; };
  if (TTS) { pickVoice(); try { TTS.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
  const canSpeak = () => !!(TTS && arVoice);
  function speak(text) { if (!canSpeak()) return false; try { TTS.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.95; TTS.speak(u); return true; } catch (e) { return false; } }
  function hush() { try { if (TTS) TTS.cancel(); } catch (e) {} }
  let CH = [], curSite = null;
  function talk(n, tx, choices) { CH = choices; openUI('dlg', `<div class="dbox"><div class="dav">${n.av}</div><div style="flex:1"><div class="dnm">${esc(n.nm)} · <small>${esc(n.role)}</small></div><div class="dtx">${esc(tx)}</div><div class="dch">${choices.map((c, i) => `<button data-eg="ch" data-v="${i}">${esc(c[0])}</button>`).join('')}</div></div></div>`); n.k.emo = { k: 'wave', t: 1.2 }; C.sfx.pop(); }
  function say(n, tx) { if (n.bub) n.k.remove(n.bub); n.bub = bubbleSprite(tx); n.bub.position.set(0, 3.1, 0); n.k.add(n.bub); n.bubT = 3.2; }
  const siteText = (s) => `${s.n}. ${s.d}. ${s.f.join(' ')}`;
  function openSite(id) {
    const s = SBY[id], m = st(), had = m.stamps.includes(id); curSite = s; let all = '';
    if (!had) { m.stamps.push(id); C.S.coins = (C.S.coins || 0) + 10; if (m.stamps.length === SITES.length && !m.done) { m.done = 1; C.S.coins += 100; all = '<div class="stamp">🏅 جمعت كل أختام آثار مصر! بقيت «مستكشف آثار مصر» + 🪙 100</div>'; C.sfx.win(); } else C.sfx.coin(); C.save(); C.updPills(); }
    const voice = canSpeak();
    openUI('card', `<div class="pan"><div class="hd"><b>${esc(s.n)}<small>${esc(REG[s.r])}${s.g === 'timeline' ? ' · تاريخ الفراعنة' : ''}</small></b><button class="x" data-eg="close" aria-label="إغلاق">✕</button></div><div class="bd"><div class="big">${s.i}</div><div class="date">📅 ${esc(s.d)}</div>
      ${s.f.map((f) => `<div class="fact">✨ ${esc(f)}</div>`).join('')}
      <div class="stamp">${had ? '✅ الختم ده في جواز سفرك' : '🎉 ختم جديد في جواز سفر الآثار + 🪙 10'} · ${m.stamps.length}/${SITES.length}</div>${all}</div>
      <div class="btns">${voice ? `<button class="snd ${m.voice ? 'on' : ''}" data-eg="voice">🔊 ${m.voice ? 'بيشرح دلوقتي' : 'اسمع الشرح'}</button>` : ''}<button class="ok" data-eg="close" ${voice ? '' : 'style="grid-column:1/-1"'}>اتعلمت حاجة جديدة 👍</button></div></div>`);
    if (voice && m.voice) speak(siteText(s));
  }
  // ---- regions, fast travel, the Nile cruise ----
  const SPOTS = { gem: { x: 0, z: 74, n: 'المتحف المصري الكبير', r: 'cairo' }, giza: { x: 20, z: -84, n: 'أهرامات الجيزة', r: 'cairo' }, plaza: { x: 0, z: 182, n: 'ميدان آثار مصر', r: 'cairo' }, cdock: { x: 208, z: 150, n: 'مرسى الباخرة', r: 'cairo' }, luxor: { x: 208, z: 520, n: 'الأقصر', r: 'luxor' }, aswan: { x: 208, z: 950, n: 'أسوان', r: 'aswan' } };
  const regionOf = (z, x = C.PL.x - OFF) => (COAST && COAST.regionAt(x, z)) || (z < 300 ? 'cairo' : z < 750 ? 'luxor' : 'aswan');
  let COAST = null;
  function place(x, z) { C.PL.x = OFF + x; C.PL.z = z; C.PL.y = 0.12; C.PL.vy = 0; }
  function goSpot(k) { closeUI(); const s = SPOTS[k], here = regionOf(C.PL.z); if (!NILE_REG.includes(here)) { COAST.fly('cairo'); return; } if (s.r !== here) { cruise(here, s.r); return; } place(s.x, s.z); C.toast(`📍 ${s.n}`); C.sfx.coin(); }
  function cruise(from, to) {
    closeUI(); if (from === to) return;
    const z0 = DOCK[from][1], z1 = DOCK[to][1], dur = Math.min(24, 8 + Math.abs(z1 - z0) / 60);
    RIDE = { z0, z1, t: 0, dur, to, fi: -1 }; C.setPanel('cruise'); document.body.classList.add('mallFocus');
    const kid = C.getKid(); if (kid) kid.visible = false;
    ship.rotation.y = z1 > z0 ? 0 : Math.PI; ride.className = 'egyRide on'; ride.querySelector('.t').textContent = `🚢 باخرة لولو رايحة ${REG[to]}…`; C.sfx.pop();
  }
  function endRide() {
    const r = RIDE; RIDE = null; hush(); ride.className = 'egyRide'; document.body.classList.remove('mallFocus'); C.setPanel(null);
    const kid = C.getKid(); if (kid) kid.visible = true;
    const d = DOCK[r.to]; ship.position.set(255, 0.15, d[1]); place(d[0] - 14, d[1]); C.PL.yaw = -Math.PI / 2;
    C.toast(`🎉 وصلنا ${REG[r.to]}!`); C.sfx.win();
  }
  function cruiseMenu(n) { const here = regionOf(C.PL.z); talk(n, 'أهلاً يا بطل! باخرة لولو بتطلع رحلات على النيل، وهتشوف الصعيد والنخل والفلايك في السكة. عايز تروح فين؟', [...NILE_REG.filter((k) => k !== here).map((k) => [`🚢 ${REG[k]}`, () => cruise(here, k)]), ['✈️ طيارة لولو للبحر', () => COAST.fly('hurghada')], ['👋 بعدين', closeUI]]); }
  function openMap() {
    const m = st(); const cnt = (r) => SITES.filter((s) => s.r === r && m.stamps.includes(s.id)).length + '/' + SITES.filter((s) => s.r === r).length;
    openUI('card', `<div class="pan"><div class="hd"><b>🗺️ خريطة مصر<small>جواز سفر الآثار: ${m.stamps.length}/${SITES.length} ختم</small></b><button class="x" data-eg="close" aria-label="إغلاق">✕</button></div><div class="bd">
      <div class="row"><span class="ic">🏛️</span><div class="t">المتحف المصري الكبير<small>القاهرة والجيزة · الأختام ${cnt('cairo')}</small></div><button data-eg="go" data-v="gem">🚀 روح</button></div>
      <div class="row"><span class="ic">🔺</span><div class="t">أهرامات الجيزة وأبو الهول<small>ورا المتحف</small></div><button data-eg="go" data-v="giza">🚀 روح</button></div>
      <div class="row"><span class="ic">🚢</span><div class="t">مرسى الباخرة<small>رحلات على النيل للأقصر وأسوان</small></div><button data-eg="go" data-v="cdock">🚀 روح</button></div>
      <div class="row"><span class="ic">🏯</span><div class="t">الأقصر<small>بالباخرة · الأختام ${cnt('luxor')}</small></div><button data-eg="go" data-v="luxor">🚢 سافر</button></div>
      <div class="row"><span class="ic">⛵</span><div class="t">أسوان<small>بالباخرة · الأختام ${cnt('aswan')}</small></div><button data-eg="go" data-v="aswan">🚢 سافر</button></div>
      <div class="row"><span class="ic">⛲</span><div class="t">ميدان آثار مصر</div><button data-eg="go" data-v="plaza">🚀 روح</button></div>
      <div class="row"><span class="ic">🐠</span><div class="t">الغردقة<small>الأكواريوم · الغواصة · عرض الدولفين · الأختام ${cnt('hurghada')}</small></div><button data-eg="fly" data-v="hurghada">✈️ طير</button></div>
      <div class="row"><span class="ic">🔵</span><div class="t">دهب<small>البلو هول · خيمة البدو</small></div><button data-eg="fly" data-v="dahab">✈️ طير</button></div>
      <div class="row"><span class="ic">🕊️</span><div class="t">شرم الشيخ<small>خليج نعمة · رأس محمد · الأختام ${cnt('sinai')}</small></div><button data-eg="fly" data-v="sharm">✈️ طير</button></div>
      <div class="row"><span class="ic">🌆</span><div class="t">العلمين<small>البحر المتوسط · الأبراج · الأختام ${cnt('alamein')}</small></div><button data-eg="fly" data-v="alamein">✈️ طير</button></div>
      <div class="row"><span class="ic">🏙️</span><div class="t">القاهرة<small>المتحف الكبير والأهرامات</small></div><button data-eg="fly" data-v="cairo">✈️ طير</button></div>
      <div class="fact">💡 قرّب من أي أثر واضغط عليه: هتعرف اسمه وتاريخه وحكايته، وتاخد ختم + 🪙 10. اجمع ${SITES.length} ختم وخد 🪙 100!</div></div></div>`);
  }
  ui.addEventListener('click', (e) => { const b = e.target.closest('[data-eg]'); if (!b) return; C.sfx.click(); const a = b.dataset.eg, v = b.dataset.v;
    if (a === 'close') closeUI(); else if (a === 'ch') { const c = CH[+v]; if (c) c[1](); } else if (a === 'go') goSpot(v); else if (a === 'fly') COAST.fly(v);
    else if (a === 'voice') { const m = st(); if (m.voice && TTS && TTS.speaking) { hush(); m.voice = 0; } else { m.voice = 1; if (curSite) speak(siteText(curSite)); } C.save(); b.classList.toggle('on', !!m.voice); b.textContent = m.voice ? '🔊 بيشرح دلوقتي' : '🔊 اسمع الشرح'; } });
  ride.addEventListener('click', (e) => { if (e.target.closest('[data-eg="skip"]') && RIDE) { C.sfx.click(); endRide(); } });
  const SCRIPTS = {
    salma: (n) => talk(n, 'أهلاً بيك في آثار مصر! ابدأ بالمتحف المصري الكبير والأهرامات، وبعدين اركب باخرة لولو على النيل للأقصر وأسوان. تحب تروح فين؟', [['🏛️ المتحف الكبير', () => goSpot('gem')], ['🔺 الأهرامات', () => goSpot('giza')], ['🚢 مرسى الباخرة', () => goSpot('cdock')], ['🛂 جواز سفر الآثار', openMap], ['👋 شكرًا', closeUI]]),
    khaled: (n) => talk(n, 'نورت المتحف المصري الكبير، أكبر متحف في العالم لحضارة واحدة! في البهو تمثال رمسيس، وعلى الشمال حيطة تاريخ الفراعنة، وقدامك الدرج العظيم، وعلى الجنبين قاعات توت عنخ آمون والقاعات الرئيسية.', [['📜 احكيلي تاريخ الفراعنة', () => openSite('e1')], ['👑 قناع توت عنخ آمون', () => openSite('mask')], ['🗿 تمثال رمسيس', () => openSite('ramses')], ['👋 شكرًا', closeUI]]),
    sayed: (n) => talk(n, 'أهلاً يا بطل! دي هضبة الجيزة: هرم خوفو الكبير، وهرم خفرع، وهرم منكاورع، وأبو الهول هناك بيبص على الشروق 🌅', [['🔺 الهرم الأكبر', () => openSite('khufu')], ['🦁 أبو الهول', () => openSite('sphinx')], ['👋 شكرًا يا عم سيد', closeUI]]),
    captain: cruiseMenu, captain2: cruiseMenu, captain3: cruiseMenu,
    mona: (n) => talk(n, 'أهلاً بيك في الأقصر، طيبة القديمة! هنا معبد الأقصر وطريق الكباش ومعابد الكرنك، وفي البر الغربي معبد حتشبسوت ووادي الملوك وتمثالا ممنون.', [['🏯 معبد الأقصر', () => openSite('luxortemple')], ['🏛️ الكرنك', () => openSite('karnak')], ['⛰️ وادي الملوك', () => openSite('valley')], ['👋 شكرًا', closeUI]]),
    fatma: (n) => talk(n, 'مرحب بيك في النوبة يا حبيبي! شوف بيوتنا الملونة، وروح شوف أبو سمبل ونفرتاري ومعبد فيلة والسد العالي.', [['🏡 احكيلي عن النوبة', () => openSite('nubian')], ['🗿 أبو سمبل', () => openSite('abusimbel')], ['🌊 السد العالي', () => openSite('dam')], ['👋 شكرًا', closeUI]]),
  };
  COAST = buildCoast(C, { root, OFF, vox, sign, label, textTex, palm, plane, T, solid, circ, place, st, addNPC, NPC, SCRIPTS, SBY, talk, closeUI, openSite, speak, hush });
  const SITE_PTS = [
    ...ERAS.map((s, i) => [s.id, -56.6, 54 - i * 5.4, 2.4]),
    ['hobelisk', 0, 105, 3], ['ramses', 0, 44.2, 3], ['stairs', 0, 20.5, 3], ['window', 0, -36.5, 4], ['mask', -36, -1.6, 2], ['throne', -48, -1.4, 2], ['shrine', -26, -16.6, 2.4], ['anubis', -46, -16.8, 2.2], ['chariot', -36, -28.8, 2.4], ['coffin', 22, -26.6, 2.2], ['canopic', 50, -27.8, 2.2], ['hiero', 57.4, -10, 3], ['boat', 36, 9.4, 3],
    ['khufu', -20, -101, 5], ['khafre', 60, -138, 5], ['menkaure', 130, -174, 4], ['sphinx', 126, -110, 4],
    ['luxortemple', 150, 548, 3.5], ['avenue', 150, 500, 3], ['karnak', 150, 436, 3.5], ['hatobelisk', 122, 438, 3], ['lake', 196, 400, 3.5], ['hatshepsut', 0, 456, 4], ['memnon', 40, 607, 4], ['valley', -10, 560, 3.5],
    ['abusimbel', 12, 930, 4.5], ['nefertari', 8, 990, 4], ['philae', 226, 900, 3.5], ['unfinished', 100, 861, 4], ['dam', 110, 1053, 4], ['nubian', 142, 922, 3], ['felucca', 210, 940, 3],
  ];
  function interactables() {
    if (RIDE || COAST.busy) return [];
    const L = [], o = OFF;
    L.push({ x: o + 16, z: 161.8, r: 3, label: '🗺️ خريطة آثار مصر', act: openMap });
    L.push({ x: o, z: 212, r: 3.5, label: '🏙️ ارجع للمدينة', act: C.goCity });
    for (const n of NPC) L.push({ x: n.k.position.x, z: n.k.position.z, r: 2.6, label: `💬 كلّم ${n.nm}`, act: () => SCRIPTS[n.id](n) });
    const m = st();
    if (COAST.regionAt(C.PL.x - OFF, C.PL.z)) L.push(...COAST.interactables());
    for (const [id, x, z, r] of SITE_PTS) L.push({ x: o + x, z, r, label: `${m.stamps.includes(id) ? '✅' : '🔎'} ${SBY[id].n}`, act: () => openSite(id) });
    return L;
  }
  function update(dt, now, active) {
    COAST.update(dt, now, active); if (!active) return; const t = now / 1000;
    if (RIDE) {
      RIDE.t += dt; const k = Math.min(1, RIDE.t / RIDE.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, z = RIDE.z0 + (RIDE.z1 - RIDE.z0) * e;
      ship.position.set(255 + Math.sin(t * 0.6) * 0.4, 0.15 + Math.sin(t * 1.3) * 0.08, z); C.PL.x = OFF + 255; C.PL.z = z;
      const fi = Math.min(NILE_FACTS.length - 1, Math.floor(k * NILE_FACTS.length)); if (fi !== RIDE.fi) { RIDE.fi = fi; ride.querySelector('.f').textContent = NILE_FACTS[fi]; if (st().voice && canSpeak()) speak(NILE_FACTS[fi].replace(/^\S+\s/, '')); }
      ride.querySelector('.bar i').style.width = (k * 100).toFixed(1) + '%'; if (k >= 1) endRide();
    }
    for (const f of FEL) { f.g.position.z += f.dir * f.sp * dt; if (f.g.position.z > 1150) f.g.position.z = -200; if (f.g.position.z < -200) f.g.position.z = 1150; f.g.rotation.y = f.dir > 0 ? 0 : Math.PI; f.g.position.y = 0.2 + Math.sin(t * 1.5 + f.sp) * 0.08; }
    for (const n of NPC) {
      const dx = C.PL.x - n.k.position.x, dz = C.PL.z - n.k.position.z, d = Math.hypot(dx, dz);
      if (d < 6.5) n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(dx, dz), dt * 5); else n.k.rotation.y = angLerp(n.k.rotation.y, n.yaw, dt * 2);
      if (d < 5 && !n.seen && !RIDE) { n.seen = true; n.k.emo = { k: 'wave', t: 1.4 }; say(n, n.hello); C.sfx.pop(); } if (d > 14) n.seen = false;
      C.animKid(n.k, 0, dt, false);
      if (n.bub) { n.bubT -= dt; n.bub.material.opacity = Math.min(1, n.bubT); if (n.bubT <= 0) { n.k.remove(n.bub); n.bub = null; } }
    }
    for (const v of VIS) { const a = v.loop[v.seg], b = v.loop[(v.seg + 1) % v.loop.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); v.t += (v.sp * dt) / L; if (v.t >= 1) { v.t = 0; v.seg = (v.seg + 1) % v.loop.length; } const x = a[0] + (b[0] - a[0]) * v.t, z = a[1] + (b[1] - a[1]) * v.t; v.k.position.set(OFF + x, 0.12, z); v.k.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); C.animKid(v.k, v.sp, dt, false); }
  }
  function goal() { const m = st(), cr = COAST.regionAt(C.PL.x - OFF, C.PL.z); if (cr) return COAST.goal(cr); return `🇪🇬 مصر · ${REG[regionOf(C.PL.z)]}<small>جواز سفر الآثار: ${m.stamps.length}/${SITES.length} ختم — قرّب من أي أثر واعرف اسمه وتاريخه</small>`; }
  function drawMap(g, s) {
    { const cr = COAST.regionAt(C.PL.x - OFF, C.PL.z); if (cr) return COAST.drawMap(g, s, cr); }
    const r = regionOf(C.PL.z), z0 = r === 'cairo' ? -230 : r === 'luxor' ? 360 : 820, z1 = r === 'cairo' ? 220 : r === 'luxor' ? 660 : 1080;
    g.fillStyle = '#e8d2a4'; g.fillRect(-260 * s, z0 * s, 600 * s, (z1 - z0) * s);
    g.fillStyle = '#6cbf4a'; g.fillRect(216 * s, z0 * s, 15 * s, (z1 - z0) * s); g.fillStyle = '#2f9ee8'; g.fillRect(231 * s, z0 * s, 70 * s, (z1 - z0) * s);
    g.fillStyle = '#d6bb8a';
    if (r === 'cairo') { g.fillRect(-6 * s, 50 * s, 12 * s, 110 * s); g.fillRect(60 * s, 160 * s, 160 * s, 10 * s); g.fillStyle = '#efe3cc'; g.fillRect(-60 * s, -40 * s, 120 * s, 100 * s); g.fillStyle = '#c49c5c'; for (const [x, z, b] of [[-20, -130, 52], [60, -165, 48], [130, -190, 26]]) { g.beginPath(); g.moveTo((x - b / 2) * s, (z + b / 2) * s); g.lineTo((x + b / 2) * s, (z + b / 2) * s); g.lineTo(x * s, (z - b / 2) * s); g.closePath(); g.fill(); } g.fillRect(100 * s, -113 * s, 22 * s, 6 * s); }
    else if (r === 'luxor') { g.fillRect(146 * s, 430 * s, 8 * s, 120 * s); g.fillStyle = '#d8b071'; g.fillRect(132 * s, 400 * s, 36 * s, 34 * s); g.fillRect(140 * s, 550 * s, 20 * s, 30 * s); g.fillRect(-55 * s, 413 * s, 110 * s, 30 * s); g.fillRect(-27 * s, 547 * s, 14 * s, 26 * s); g.fillStyle = '#2f9ee8'; g.fillRect(185 * s, 403 * s, 22 * s, 14 * s); }
    else { g.fillRect(96 * s, 850 * s, 8 * s, 200 * s); g.fillStyle = '#d8b071'; g.fillRect(-12 * s, 904 * s, 13 * s, 52 * s); g.fillRect(-10 * s, 978 * s, 11 * s, 24 * s); g.fillStyle = '#9aa3b5'; g.fillRect(10 * s, 1057 * s, 220 * s, 6 * s); g.fillStyle = '#ff8fb8'; g.fillRect(126 * s, 926 * s, 32 * s, 28 * s); g.fillStyle = '#d8b071'; g.beginPath(); g.arc(266 * s, 900 * s, 13 * s, 0, 7); g.fill(); }
  }
  function onEnter() {}
  function onLeave() { COAST.leave(); if (RIDE) { RIDE = null; ride.className = 'egyRide'; const kid = C.getKid(); if (kid) kid.visible = true; } closeUI(); }
  return {
    root, update, interactables, goal, drawMap, onEnter, onLeave, camBlock, B, OFF, MAPW: 520, SPAWN: { x: OFF, z: 208, yaw: Math.PI }, viewOn: false,
    get camOverride() { if (COAST.cam) return COAST.cam; if (!RIDE) return null; const z = ship.position.z, dir = RIDE.z1 > RIDE.z0 ? 1 : -1; return { p: [OFF + 234, 15, z - dir * 30], l: [OFF + 262, 4, z + dir * 16] }; },
    get riding() { return !!RIDE || COAST.busy; }, get coast() { return COAST; },
  };
}

// ---------------- small helpers ----------------
function shade(hex, d) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, v + d)); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join(''); }
function nameTag(t) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(107,58,7,.8)'; rr(g, 4, 6, 248, 52, 24); g.fill(); g.font = '900 28px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#fff'; g.fillText(t, 128, 33, 236);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(1.8, 0.45, 1); s.renderOrder = 5; return s;
}
function bubbleSprite(t) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; rr(g, 4, 4, 504, 100, 30); g.fill(); g.beginPath(); g.moveTo(236, 100); g.lineTo(256, 124); g.lineTo(276, 100); g.fill(); g.lineWidth = 5; g.strokeStyle = '#d79a2b'; rr(g, 4, 4, 504, 100, 30); g.stroke();
  g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#6b3a07'; g.fillText(t, 256, 54, 480);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(3.4, 0.85, 1); s.renderOrder = 6; return s;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
