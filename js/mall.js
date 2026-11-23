// LOLO BOX — MALL OF ARABIA / مول العرب (LOLO_MALL_2026) — milestone 1
// An independent world placed far from the city at MALL_OFF (like the park and the house), reusing the game's
// player, camera, collision, avatars and HUD. Milestone 1: plaza + parking + roads, the mall building with automatic
// doors, atrium with a glass dome, corridors, a fully interactive B.TECH showroom (19 inspectable 3D products,
// 4 employee NPCs with dialogue), product inspection (rotate / zoom / wishlist / compare / cart) and a virtual
// shopping system that uses in-game coins only (no real payments).
// Systems inside: MallWorldManager (build), MallNavigationSystem (directory + guide beacon), StoreInteriorManager,
// NPCManager / NPCDialogueSystem / NPCInteractionSystem, ProductDisplaySystem / ProductInspectionSystem,
// ShoppingCartSystem / InventorySystem.
import * as THREE from 'three';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

export const MALL_OFF = 6000;

// ---------------- product catalogue (fictional models, virtual prices in coins) ----------------
export const DEPTS = {
  phones: { n: 'الموبايلات', i: '📱' }, computers: { n: 'اللابتوب والكمبيوتر', i: '💻' }, tv: { n: 'الشاشات', i: '📺' },
  home: { n: 'الأجهزة المنزلية', i: '🧊' }, gaming: { n: 'الألعاب', i: '🎮' }, acc: { n: 'الإكسسوارات', i: '🎧' },
};
export const STORES = { btech: 'بي تك', dream: 'دريم 2000' };
export const PRODUCTS = [
  { id: 'p1', d: 'phones', k: 'phone', n: 'موبايل نوفا X', price: 180, c: '#2b2f48', specs: { 'الشاشة': '6.7 بوصة', 'الكاميرا': '108 ميجا', 'البطارية': '5000 ملي أمبير', 'المساحة': '256 جيجا' }, f: ['كاميرا ليلية', 'شحن سريع', 'مقاوم للمية'] },
  { id: 'p2', d: 'phones', k: 'phone', n: 'موبايل لايت 5', price: 90, c: '#ff6fb5', specs: { 'الشاشة': '6.1 بوصة', 'الكاميرا': '48 ميجا', 'البطارية': '4000 ملي أمبير', 'المساحة': '128 جيجا' }, f: ['خفيف', 'ألوان مبهجة', 'سعر مناسب'] },
  { id: 'p3', d: 'phones', k: 'fold', n: 'موبايل فولد برو', price: 260, c: '#7a4dff', specs: { 'الشاشة': '7.6 بوصة بتتطبق', 'الكاميرا': '50 ميجا', 'البطارية': '4500 ملي أمبير', 'المساحة': '512 جيجا' }, f: ['شاشة بتتقفل زي الكتاب', 'تعدد مهام', 'قلم ذكي'] },
  { id: 'c1', d: 'computers', k: 'laptop', n: 'لابتوب جيمنج ثاندر', price: 320, c: '#1d2030', rgb: true, specs: { 'الشاشة': '16 بوصة 165 هرتز', 'المعالج': '12 نواة', 'الرامات': '32 جيجا', 'كارت الشاشة': 'جيمنج قوي' }, f: ['كيبورد بإضاءة ملونة', 'تبريد مزدوج', 'للألعاب الثقيلة'] },
  { id: 'c2', d: 'computers', k: 'laptop', n: 'لابتوب إير 14', price: 210, c: '#c7cede', specs: { 'الشاشة': '14 بوصة', 'المعالج': '8 أنوية', 'الرامات': '16 جيجا', 'الوزن': '1.2 كيلو' }, f: ['خفيف جدًا', 'بطارية طول اليوم', 'مناسب للمذاكرة'] },
  { id: 'c3', d: 'computers', k: 'desktop', n: 'كمبيوتر مكتبي برو', price: 280, c: '#2b2f48', specs: { 'الشاشة': '27 بوصة', 'المعالج': '16 نواة', 'الرامات': '32 جيجا', 'التخزين': '1 تيرا' }, f: ['قوي للتصميم', 'إضاءة ملونة', 'سهل الترقية'] },
  { id: 'c4', d: 'computers', k: 'monitor', n: 'شاشة كمبيوتر 27 بوصة', price: 120, c: '#1d2030', specs: { 'المقاس': '27 بوصة', 'الدقة': '4K', 'التحديث': '144 هرتز', 'المنافذ': 'HDMI و USB-C' }, f: ['ألوان دقيقة', 'حامل بيتحرك', 'مريحة للعين'] },
  { id: 'c5', d: 'computers', k: 'keyboard', n: 'كيبورد وماوس RGB', price: 45, c: '#1d2030', specs: { 'النوع': 'ميكانيكال', 'الإضاءة': 'ملونة', 'الماوس': '6 زراير', 'التوصيل': 'لاسلكي' }, f: ['زراير هادية', 'إضاءة بتتغير', 'بطارية طويلة'] },
  { id: 't1', d: 'tv', k: 'tv', size: 3.0, n: 'شاشة سمارت 75 بوصة', price: 450, c: '#1d2030', specs: { 'المقاس': '75 بوصة', 'الدقة': '4K', 'النظام': 'سمارت', 'الصوت': 'محيطي' }, f: ['تطبيقات وألعاب', 'تحكم بالصوت', 'ألوان زاهية'] },
  { id: 't2', d: 'tv', k: 'tv', size: 2.3, n: 'شاشة سمارت 55 بوصة', price: 300, c: '#1d2030', specs: { 'المقاس': '55 بوصة', 'الدقة': '4K', 'النظام': 'سمارت', 'المنافذ': '3 HDMI' }, f: ['الأكثر طلبًا', 'وضع الألعاب', 'ريموت ذكي'] },
  { id: 't3', d: 'tv', k: 'tv', size: 1.8, n: 'شاشة 43 بوصة', price: 180, c: '#2b2f48', specs: { 'المقاس': '43 بوصة', 'الدقة': 'Full HD', 'النظام': 'سمارت', 'الاستهلاك': 'موفر' }, f: ['مناسبة للأوضة', 'سعر كويس', 'خفيفة'] },
  { id: 'h1', d: 'home', k: 'fridge', n: 'تلاجة بابين', price: 380, c: '#e8ecf5', specs: { 'السعة': '600 لتر', 'الأبواب': '2', 'التبريد': 'نوفروست', 'الكفاءة': 'A+' }, f: ['موزع مية', 'رفوف إزاز', 'هادية'] },
  { id: 'h2', d: 'home', k: 'washer', n: 'غسالة أوتوماتيك 10 كيلو', price: 260, c: '#f4f6fb', specs: { 'السعة': '10 كيلو', 'البرامج': '15 برنامج', 'السرعة': '1400 لفة', 'الكفاءة': 'A+++' }, f: ['تنشيف بخار', 'قفل أطفال', 'موفرة للمية'] },
  { id: 'h3', d: 'home', k: 'ac', n: 'تكييف سبليت 1.5 حصان', price: 340, c: '#f4f6fb', specs: { 'القدرة': '1.5 حصان', 'النوع': 'بارد وساخن', 'التقنية': 'إنفرتر', 'الضوضاء': 'منخفضة' }, f: ['موفر للكهربا', 'ريموت ذكي', 'فلتر للهوا'] },
  { id: 'h4', d: 'home', k: 'microwave', n: 'ميكروويف 30 لتر', price: 80, c: '#2b2f48', specs: { 'السعة': '30 لتر', 'القدرة': '900 وات', 'البرامج': '8 برامج', 'الشوي': 'متاح' }, f: ['تسخين سريع', 'إذابة تلج', 'سهل التنضيف'] },
  { id: 'h5', d: 'home', k: 'oven', n: 'فرن كهربائي', price: 150, c: '#c7cede', specs: { 'السعة': '60 لتر', 'الحرارة': 'لحد 250 درجة', 'المراوح': 'هوا ساخن', 'المؤقت': 'ديجيتال' }, f: ['خبيز مظبوط', 'إزاز مزدوج', 'نور جوه'] },
  { id: 'h6', d: 'home', k: 'blender', n: 'خلاط مطبخ', price: 40, c: '#ff7a1a', specs: { 'السعة': '1.5 لتر', 'القدرة': '600 وات', 'السرعات': '5', 'الكوب': 'إزاز' }, f: ['عصاير ساقعة', 'سكاكين قوية', 'آمن'] },
  { id: 'g1', d: 'gaming', k: 'console', n: 'جهاز ألعاب لولو جيم', price: 250, c: '#f4f6fb', specs: { 'التخزين': '1 تيرا', 'الدقة': '4K', 'الأذرع': 'ذراع واحد', 'اللعب': 'أونلاين' }, f: ['ألعاب للعيلة', 'تحميل سريع', 'إضاءة زرقا'] },
  { id: 'g2', d: 'gaming', k: 'controller', n: 'ذراع ألعاب لاسلكي', price: 50, c: '#7a4dff', specs: { 'التوصيل': 'لاسلكي', 'البطارية': '20 ساعة', 'الاهتزاز': 'متاح', 'الزراير': 'قابلة للبرمجة' }, f: ['مريح في الإيد', 'ألوان', 'شحن USB-C'] },
  { id: 'g3', d: 'gaming', k: 'headset', n: 'سماعة جيمنج', price: 60, c: '#ff4fc8', specs: { 'الصوت': 'محيطي', 'المايك': 'عازل للدوشة', 'التوصيل': 'لاسلكي', 'البطارية': '30 ساعة' }, f: ['مريحة', 'إضاءة', 'كلام واضح مع صحابك'] },
];
// store 2: Dream 2000 (LOLO_MALL_DREAM_2026)
PRODUCTS.push(...[
  { id: 'd1', d: 'phones', k: 'phone', n: 'موبايل دريم ستار 12', price: 150, c: '#1fb8ff', specs: { 'الشاشة': '6.5 بوصة', 'الكاميرا': '64 ميجا', 'البطارية': '5000 ملي أمبير', 'المساحة': '256 جيجا' }, f: ['ألوان زاهية', 'شحن سريع', 'صوت ستيريو'] },
  { id: 'd2', d: 'phones', k: 'phone', n: 'موبايل سكاي 7', price: 110, c: '#18c95a', specs: { 'الشاشة': '6.3 بوصة', 'الكاميرا': '50 ميجا', 'البطارية': '4500 ملي أمبير', 'المساحة': '128 جيجا' }, f: ['خفيف', 'بطارية طويلة', 'سعر كويس'] },
  { id: 'd3', d: 'phones', k: 'phone', n: 'موبايل برو ماكس 15', price: 230, c: '#2b2f37', specs: { 'الشاشة': '6.9 بوصة', 'الكاميرا': '200 ميجا', 'البطارية': '5500 ملي أمبير', 'المساحة': '512 جيجا' }, f: ['تصوير 8K', 'شاشة 120 هرتز', 'مقاوم للمية'] },
  { id: 'd4', d: 'phones', k: 'charger', n: 'شاحن لاسلكي سريع', price: 25, c: '#ffffff', specs: { 'القدرة': '15 وات', 'النوع': 'لاسلكي', 'المنفذ': 'USB-C', 'الإضاءة': 'مؤشر أخضر' }, f: ['تحط الموبايل وبس', 'آمن', 'بيشحن السماعات كمان'] },
  { id: 'd5', d: 'computers', k: 'laptop', n: 'لابتوب جيمنج فينوم', price: 300, c: '#1d2030', rgb: true, specs: { 'الشاشة': '15.6 بوصة 144 هرتز', 'المعالج': '10 أنوية', 'الرامات': '16 جيجا', 'كارت الشاشة': 'جيمنج' }, f: ['كيبورد ملون', 'مراوح قوية', 'صوت محيطي'] },
  { id: 'd6', d: 'computers', k: 'laptop', n: 'لابتوب بيزنس برو 15', price: 240, c: '#8f96a8', specs: { 'الشاشة': '15 بوصة', 'المعالج': '8 أنوية', 'الرامات': '16 جيجا', 'البطارية': '14 ساعة' }, f: ['خفيف للشغل', 'بصمة إصبع', 'كاميرا واضحة'] },
  { id: 'd7', d: 'computers', k: 'monitor', n: 'شاشة وكيبورد للمكتب', price: 130, c: '#2b2f37', specs: { 'المقاس': '24 بوصة', 'الدقة': 'Full HD', 'الكيبورد': 'لاسلكي', 'المنافذ': 'HDMI' }, f: ['مريحة للمذاكرة', 'ألوان حلوة', 'سهلة التركيب'] },
  { id: 'd8', d: 'acc', k: 'headset', n: 'سماعة رأس لاسلكية', price: 55, c: '#2b2f37', specs: { 'الصوت': 'عزل للدوشة', 'البطارية': '40 ساعة', 'التوصيل': 'بلوتوث', 'الوزن': 'خفيفة' }, f: ['مريحة', 'بتتطبق', 'صوت نقي'] },
  { id: 'd9', d: 'acc', k: 'speaker', n: 'سماعة بلوتوث محمولة', price: 35, c: '#18c95a', specs: { 'القدرة': '20 وات', 'البطارية': '12 ساعة', 'المية': 'مقاومة', 'التوصيل': 'بلوتوث' }, f: ['صوت عالي', 'إضاءة', 'تتعلق في الشنطة'] },
  { id: 'd10', d: 'acc', k: 'watch', n: 'ساعة ذكية سبورت', price: 70, c: '#1fb8ff', specs: { 'الشاشة': '1.8 بوصة', 'البطارية': '7 أيام', 'المية': 'مقاومة', 'الحساسات': 'نبض وخطوات' }, f: ['تعد خطواتك', 'إشعارات', 'أسورة ملونة'] },
  { id: 'd11', d: 'acc', k: 'case', n: 'جراب موبايل ملون', price: 10, c: '#ff4fc8', specs: { 'الخامة': 'سيليكون', 'الحماية': 'ضد الوقوع', 'الألوان': '8 ألوان', 'الوزن': 'خفيف' }, f: ['ناعم في الإيد', 'بيحمي الكاميرا', 'سهل التركيب'] },
  { id: 'd12', d: 'acc', k: 'powerbank', n: 'باور بانك 20000', price: 30, c: '#2b2f37', specs: { 'السعة': '20000 ملي أمبير', 'المنافذ': '3', 'الشحن': 'سريع', 'الشاشة': 'نسبة الشحن' }, f: ['يشحن الموبايل 4 مرات', 'للرحلات', 'آمن'] },
  { id: 'd13', d: 'gaming', k: 'console', n: 'جهاز ألعاب نيو بلاي', price: 240, c: '#1d2030', specs: { 'التخزين': '1 تيرا', 'الدقة': '4K', 'الأذرع': 'ذراع واحد', 'اللعب': 'أونلاين' }, f: ['تحميل سريع', 'ألعاب عيلة', 'إضاءة خضرا'] },
  { id: 'd14', d: 'gaming', k: 'controller', n: 'دراع تحكم برو', price: 45, c: '#18c95a', specs: { 'التوصيل': 'لاسلكي', 'البطارية': '25 ساعة', 'الاهتزاز': 'متاح', 'الزراير': 'زراير ضهر' }, f: ['مسكة مريحة', 'سريع', 'شحن USB-C'] },
  { id: 'd15', d: 'gaming', k: 'headset', n: 'سماعة جيمنج آر جي بي', price: 50, c: '#18c95a', specs: { 'الصوت': 'محيطي 7.1', 'المايك': 'عازل للدوشة', 'الإضاءة': 'ملونة', 'التوصيل': 'USB' }, f: ['كلام واضح', 'وسادات ناعمة', 'إضاءة'] },
  { id: 'd16', d: 'gaming', k: 'chair', n: 'كرسي جيمنج', price: 140, c: '#18c95a', specs: { 'الخامة': 'جلد صناعي', 'الظهر': 'بيرجع لورا', 'العجل': '5 عجلات', 'الوسائد': 'رقبة وضهر' }, f: ['مريح للعب الطويل', 'بيلف', 'ارتفاع بيتظبط'] },
].map((p) => Object.assign(p, { store: 'dream' })));
const PBY = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

const CSS = `
.mallUI{position:fixed;inset:0;z-index:25;display:none;font-family:Cairo,Tajawal,"Segoe UI",sans-serif;color:#3b1d78}
.mallUI.on{display:block}
.mallUI .mpan{position:absolute;right:calc(12px + env(safe-area-inset-right));top:12px;bottom:12px;width:min(400px,46vw);background:linear-gradient(#f7f2ff,#e8dcff);border:4px solid #a46cf5;border-radius:24px;box-shadow:0 8px 0 #6d36c9,0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
.mallUI .mhd{background:linear-gradient(#a45cff,#7a32e6);color:#fff;padding:10px 14px 8px;display:flex;align-items:center;gap:10px}
.mallUI .mhd b{flex:1;font-size:clamp(17px,3.2vh,24px);font-weight:900;line-height:1.2}
.mallUI .mhd small{display:block;font-size:12px;opacity:.9;font-weight:700}
.mallUI .mx{width:40px;height:40px;border-radius:50%;background:linear-gradient(#ff7ab8,#e33d8c);color:#fff;font-size:20px;font-weight:900;box-shadow:0 3px 0 #a81f5e;flex:none}
.mallUI .mbd{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
.mallUI .price{display:flex;align-items:center;justify-content:center;gap:6px;font-size:clamp(20px,4vh,30px);font-weight:900;color:#b45f00;background:#fff4cf;border-radius:14px;padding:4px}
.mallUI table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:clamp(12px,2.3vh,15px)}
.mallUI td,.mallUI th{padding:5px 8px;border-bottom:1px solid #eee4ff;text-align:right}
.mallUI th{background:#efe6ff;font-weight:900}
.mallUI .feat{display:flex;flex-wrap:wrap;gap:5px}.mallUI .feat span{background:#fff;border:2px solid #d8c6ff;border-radius:99px;padding:1px 10px;font-size:13px;font-weight:800}
.mallUI .mbtns{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px 12px 12px}
.mallUI .mb{border-radius:14px;padding:8px 6px;font-weight:900;font-size:clamp(13px,2.5vh,16px);color:#fff;background:linear-gradient(#b277ff,#7d3cf0);box-shadow:0 4px 0 #5520b5;border:0;cursor:pointer;font-family:inherit}
.mallUI .mb.y{background:linear-gradient(#ffd34d,#ffad0f);color:#6b3a00;box-shadow:0 4px 0 #c77800}
.mallUI .mb.p{background:linear-gradient(#ff8ac4,#ef4e98);box-shadow:0 4px 0 #b32466}
.mallUI .mb.g{background:linear-gradient(#6ee37f,#2fb44a);box-shadow:0 4px 0 #1d7f31}
.mallUI .mb.full{grid-column:1/-1}
.mallUI .mb:disabled{opacity:.5}
.mallUI .mb:active{transform:translateY(3px);box-shadow:none}
.mallUI .zoom{position:absolute;left:calc(14px + env(safe-area-inset-left));bottom:14px;display:flex;flex-direction:column;gap:8px}
.mallUI .zoom button{width:52px;height:52px;border-radius:16px;font-size:26px;font-weight:900;color:#fff;background:linear-gradient(#b277ff,#7d3cf0);box-shadow:0 4px 0 #5520b5;border:3px solid #fff}
.mallUI .hint{position:absolute;left:50%;top:14px;transform:translateX(-50%);background:rgba(40,10,100,.5);color:#fff;border-radius:99px;padding:4px 14px;font-weight:800;font-size:13px;pointer-events:none}
.mallUI.dlg .dbox{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,720px);background:linear-gradient(#fff,#f1e9ff);border:4px solid #a46cf5;border-radius:24px;box-shadow:0 8px 0 #6d36c9,0 16px 40px rgba(0,0,0,.35);padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.mallUI .dav{width:64px;height:64px;border-radius:18px;background:#efe6ff;display:grid;place-items:center;font-size:40px;flex:none}
.mallUI .dnm{font-weight:900;color:#7a32e6;font-size:15px}.mallUI .dtx{font-weight:800;font-size:clamp(15px,2.8vh,19px);line-height:1.6;margin:2px 0 8px}
.mallUI .dch{display:flex;flex-wrap:wrap;gap:6px}
.mallUI .dch button{border-radius:12px;padding:6px 12px;font-weight:900;font-size:14px;background:#fff;border:3px solid #c8b0ff;color:#4a2386;font-family:inherit;cursor:pointer}
.mallUI .dch button:active{background:#efe6ff}
.mallUI.list .mpan{left:50%;right:auto;transform:translateX(-50%);width:min(94vw,620px)}
.mallUI .row{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:6px 10px;border:2px solid #eee4ff}
.mallUI .row .ic{font-size:26px;width:36px;text-align:center}.mallUI .row .t{flex:1;font-weight:800;font-size:14px}.mallUI .row .t small{display:block;color:#8a62c9;font-weight:700}
.mallUI .row button{border-radius:10px;min-width:34px;height:34px;font-weight:900;background:#efe6ff;color:#5b22c9;border:0;font-family:inherit;cursor:pointer;padding:0 8px}
.mallUI .tabs{display:flex;gap:6px;padding:8px 12px 0}.mallUI .tabs button{flex:1;border-radius:12px 12px 0 0;padding:6px;font-weight:900;background:#e3d6ff;color:#5b22c9;border:0;font-family:inherit}.mallUI .tabs button.on{background:#fff}
.mallUI .tot{display:flex;justify-content:space-between;font-weight:900;font-size:16px;background:#fff4cf;border-radius:12px;padding:6px 12px}
.mallUI .empty{text-align:center;color:#8a62c9;font-weight:800;padding:18px}
.mallUI .conf{background:#fff;border:3px solid #ffb300;border-radius:16px;padding:10px;text-align:center;font-weight:900}
body.mallFocus #hud,body.mallFocus #ctl{visibility:hidden}
#mallHud{position:fixed;right:calc(12px + env(safe-area-inset-right));top:calc(clamp(118px,25vh,170px) + env(safe-area-inset-top));z-index:6;display:none;flex-direction:row;gap:8px}
#mallHud.on{display:flex}
#mallHud button{position:relative;width:clamp(44px,9vh,56px);height:clamp(44px,9vh,56px);border-radius:16px;font-size:clamp(22px,4.6vh,28px);background:linear-gradient(#b277ff,#7d3cf0);box-shadow:0 4px 0 #5520b5;border:3px solid #fff}
#mallHud button i{position:absolute;top:-6px;left:-6px;min-width:22px;height:22px;border-radius:11px;background:#ff2d55;color:#fff;font-size:13px;font-style:normal;font-weight:900;display:grid;place-items:center;padding:0 4px;border:2px solid #fff}
@media (max-height:480px){.mallUI .mpan{width:min(360px,50vw)}.mallUI .mbd{gap:5px}}
`;

export function buildMall(C) {
  const { toon, ctex } = C;
  const OFF = MALL_OFF, B = 112;
  const root = new THREE.Group(); root.position.x = OFF; C.scene.add(root);
  const camBlock = [];
  const st = () => { const S = C.S; if (!S.mall || typeof S.mall !== 'object') S.mall = {}; const m = S.mall; ['cart', 'wish', 'inv', 'hist', 'cmp'].forEach((k) => { if (!Array.isArray(m[k])) m[k] = []; }); return m; };

  // ---------- helpers ----------
  const solid = (x0, x1, z0, z1) => C.solids.push({ x0: OFF + Math.min(x0, x1), x1: OFF + Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const circ = (x, z, r) => C.circles.push({ x: OFF + x, z, r });
  function vox(list, parent = root, opt = {}) { // [x,y,z,w,h,d,color] merged per colour
    const by = {}; for (const [x, y, z, w, h, d, c] of list) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); (by[c] = by[c] || []).push(g); }
    const out = []; for (const c in by) { const m = new THREE.Mesh(mergeGeometries(by[c]), opt.mat ? opt.mat(c) : toon(c)); m.castShadow = !!opt.shadow; m.receiveShadow = true; parent.add(m); out.push(m); if (opt.block) camBlock.push(m); }
    return out;
  }
  function textTex(lines, o = {}) { // lines: [text, font px, colour]; canvas sign
    const w = o.w || 512, h = o.h || 128;
    const t = ctex(w, h, (g) => {
      if (o.bg) { g.fillStyle = o.bg; rr(g, 4, 4, w - 8, h - 8, o.r == null ? 22 : o.r); g.fill(); if (o.border) { g.lineWidth = 8; g.strokeStyle = o.border; g.stroke(); } }
      g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
      lines.forEach(([tx, px, col, stroke], i) => { g.font = `900 ${px}px Cairo, Tajawal, "Segoe UI", sans-serif`; g.direction = /[؀-ۿ]/.test(tx) ? 'rtl' : 'ltr'; const y = h * (i + 0.5) / n + (o.dy || 0); if (stroke) { g.lineWidth = px * 0.18; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(tx, w / 2, y); } g.fillStyle = col; g.fillText(tx, w / 2, y); });
    });
    t.anisotropy = 4; return t;
  }
  const sign = (tex, w, h, x, y, z, ry = 0, parent = root, basic = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }) : new THREE.MeshToonMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m; };
  const pixTex = (base, spots, n = 60, sz = 16, extra) => { const t = ctex(sz, sz, (g) => { g.fillStyle = base; g.fillRect(0, 0, sz, sz); let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < n; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; g.fillRect((r() * sz) | 0, (r() * sz) | 0, 1, 1); } if (extra) extra(g, sz); }); t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const tiledPlane = (tex, w, d, x, z, y, rep) => { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; root.add(m); return m; };

  // ======================= MallWorldManager: ground, roads, parking =======================
  const T = {
    grass: pixTex('#5fd34a', ['#7ae65c', '#49b83a', '#8ff06a'], 70),
    pave: pixTex('#f1d6f2', ['#e6c2ea', '#fbe6fb', '#dcb3e3'], 40, 16, (g, s) => { g.fillStyle = '#d49fe0'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    road: pixTex('#5b5f74', ['#53576b', '#666a80', '#4d5063'], 50),
    park: pixTex('#6b6f84', ['#62667a', '#75798e'], 40, 16, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1, s); }),
    tile: pixTex('#f6f2ff', ['#ece5ff', '#ffffff', '#e4dcfa'], 30, 16, (g, s) => { g.fillStyle = '#d9cdf5'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    marble: pixTex('#e6cdb8', ['#dcc0a8', '#eed8c6', '#d6b89e'], 40, 16, (g, s) => { g.fillStyle = '#c4a283'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
    store: pixTex('#d6deea', ['#ccd5e3', '#dfe6f0'], 25, 16, (g, s) => { g.fillStyle = '#b3c0d4'; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s); }),
  };
  tiledPlane(T.grass, 2 * B + 40, 2 * B + 40, 0, 0, 0.0, 4);
  tiledPlane(T.road, 200, 14, 0, 104, 0.02, 6); tiledPlane(T.road, 14, 210, -96, 0, 0.021, 6); tiledPlane(T.road, 14, 210, 96, 0, 0.022, 6); tiledPlane(T.road, 200, 14, 0, -100, 0.023, 6);
  tiledPlane(T.pave, 140, 96, 0, 50, 0.03, 3); // front plaza
  tiledPlane(T.pave, 160, 18, 0, -78, 0.031, 3); // back walkway
  for (const s of [-1, 1]) { tiledPlane(T.park, 34, 40, s * 70, 54, 0.04, 2.6); tiledPlane(T.pave, 14, 120, s * 62, -30, 0.032, 3); }
  // road lane marks
  { const L = []; for (let x = -92; x <= 92; x += 8) { L.push([x, 0.06, 104, 4, 0.02, 0.4, '#ffffff'], [x, 0.06, -100, 4, 0.02, 0.4, '#ffffff']); } for (let z = -96; z <= 100; z += 8) { L.push([-96, 0.06, z, 0.4, 0.02, 4, '#ffffff'], [96, 0.06, z, 0.4, 0.02, 4, '#ffffff']); } vox(L); }
  // parked blocky cars
  const CARC = ['#ff4fb0', '#2fc4ff', '#ffc21a', '#ff7a1a', '#7cf04a', '#c05cff', '#ffffff'];
  { const L = []; let n = 0; for (const s of [-1, 1]) for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) { if ((i + row + (s > 0 ? 1 : 0)) % 3 === 0) continue; const x = s * 70 - 13 + i * 6.5, z = 40 + row * 24, c = CARC[n++ % CARC.length]; L.push([x, 0.8, z, 2.4, 0.9, 4.2, c], [x, 1.55, z - 0.2, 2.1, 0.7, 2.4, c], [x, 1.55, z - 0.2, 2.15, 0.5, 2.0, '#bfe6ff'], [x - 1.1, 0.45, z + 1.3, 0.3, 0.7, 0.7, '#1d2030'], [x + 1.1, 0.45, z + 1.3, 0.3, 0.7, 0.7, '#1d2030'], [x - 1.1, 0.45, z - 1.3, 0.3, 0.7, 0.7, '#1d2030'], [x + 1.1, 0.45, z - 1.3, 0.3, 0.7, 0.7, '#1d2030']); solid(x - 1.3, x + 1.3, z - 2.2, z + 2.2); } vox(L, root, { shadow: true }); }
  { const ps = textTex([['P', 96, '#ffffff']], { w: 128, h: 128, bg: '#2f6bff', border: '#ffffff', r: 24 }); for (const s of [-1, 1]) { vox([[s * 54, 1.6, 30, 0.2, 3.2, 0.2, '#c7cede']]); sign(ps, 1.8, 1.8, s * 54, 3.8, 30.12); sign(ps, 1.8, 1.8, s * 54, 3.8, 29.88, Math.PI); } }

  // palms, lamps, benches, flags, planters
  function palm(x, z, h = 5) { const L = []; for (let y = 0; y < h; y++) L.push([x + Math.sin(y * 0.5) * 0.15, y + 0.5, z, 0.55, 1, 0.55, y % 2 ? '#a0703f' : '#8a5a34']); const top = h + 0.2; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]]) { L.push([x + dx * 1.1, top, z + dz * 1.1, 1.4 * (Math.abs(dx) > 0.5 ? 1 : 0.5) + 0.4, 0.3, 1.4 * (Math.abs(dz) > 0.5 ? 1 : 0.5) + 0.4, '#2fb44a']); L.push([x + dx * 2, top - 0.4, z + dz * 2, 0.6, 0.3, 0.6, '#49c95a']); } L.push([x, top + 0.2, z, 1, 0.6, 1, '#3ec95a']); return L; }
  const lamp = (x, z) => [[x, 2, z, 0.25, 4, 0.25, '#4a3b6b'], [x, 4.15, z, 0.7, 0.5, 0.7, '#ffe9a8']];
  const bench = (x, z, rot) => rot ? [[x, 0.5, z, 0.6, 0.12, 2.2, '#b07b4a'], [x - 0.3, 0.9, z, 0.12, 0.7, 2.2, '#b07b4a'], [x, 0.25, z - 0.9, 0.5, 0.5, 0.15, '#4a3b6b'], [x, 0.25, z + 0.9, 0.5, 0.5, 0.15, '#4a3b6b']] : [[x, 0.5, z, 2.2, 0.12, 0.6, '#b07b4a'], [x, 0.9, z + 0.3, 2.2, 0.7, 0.12, '#b07b4a'], [x - 0.9, 0.25, z, 0.15, 0.5, 0.5, '#4a3b6b'], [x + 0.9, 0.25, z, 0.15, 0.5, 0.5, '#4a3b6b']];
  { const L = [], LL = [];
    for (let z = 22; z <= 92; z += 12) for (const s of [-1, 1]) { L.push(...palm(s * 14, z, 5 + (z % 3))); circ(s * 14, z, 0.6); }
    for (const [x, z] of [[-46, 20], [46, 20], [-30, 90], [30, 90], [-60, -60], [60, -60], [-64, 0], [64, 0], [-80, 70], [80, 70]]) { L.push(...palm(x, z, 6)); circ(x, z, 0.6); }
    for (let z = 26; z <= 90; z += 16) for (const s of [-1, 1]) { LL.push(...lamp(s * 9, z)); circ(s * 9, z, 0.3); }
    for (const [x, z] of [[-6, 62], [6, 62], [-20, 30], [20, 30]]) LL.push(...bench(x, z, false));
    vox(L, root, { shadow: true }); vox(LL, root, { shadow: true });
    const glow = new THREE.MeshBasicMaterial({ color: '#fff3c4', toneMapped: false }); for (let z = 26; z <= 90; z += 16) for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.45), glow); b.position.set(s * 9, 4.15, z); root.add(b); }
  }
  // portal back to the city
  { const pr = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.32, 10, 32), toon('#7fd8ff', { emissive: '#3fb6ff', emissiveIntensity: 0.9 })); pr.position.set(24, 2.9, 92); root.add(pr);
    const pin = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), new THREE.MeshBasicMaterial({ color: '#bfeaff', transparent: true, opacity: 0.55, side: THREE.DoubleSide, toneMapped: false })); pin.position.copy(pr.position); root.add(pin);
    sign(textTex([['🏙️ رجوع للمدينة', 64, '#ffffff', '#1f64b8']], { w: 512, h: 110 }), 4.4, 0.95, 24, 6.1, 92); }
  // front fountain
  const fountain = (x, z, r, parent = root) => { vox([[x, 0.35, z, r * 2 + 0.8, 0.7, r * 2 + 0.8, '#d9c8ff'], [x, 0.4, z, r * 2, 0.6, r * 2, '#6fd6ff'], [x, 1.2, z, 1.2, 1.6, 1.2, '#d9c8ff'], [x, 2.2, z, 2.4, 0.3, 2.4, '#d9c8ff']], parent); const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.5, 3.2, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#bff0ff', transparent: true, opacity: 0.65, toneMapped: false })); jet.position.set(x, 3.6, z); parent.add(jet); return jet; };
  const jets = [fountain(0, 42, 4.5)]; circ(0, 42, 5.2);

  // ======================= the mall building =======================
  // footprint x -52..52, z -66..12; entrance gap x -6..6 at z = 12; side entrances at x = ±52, z -25..-15
  const H = 12, WT = 0.8;
  const OUT = '#f3e9ff', TRIM = '#7a3cf0', GOLD = '#ffc21a';
  const wallsOut = [];
  const wall = (x0, z0, x1, z1, h = H, c = OUT, col = true, list = wallsOut) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || WT, d = Math.abs(z1 - z0) || WT; list.push([cx, h / 2, cz, w, h, d, c]); if (col) solid(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2); };
  // outer shell
  wall(-52, 12, -6, 12); wall(6, 12, 52, 12); wall(-52, -66, 52, -66);
  wall(-52, 12, -52, -15); wall(-52, -25, -52, -66); wall(52, 12, 52, -15); wall(52, -25, 52, -66);
  vox(wallsOut, root, { block: true });
  // facade decoration: purple band, gold trims, shop windows (glass), banners
  { const L = [];
    L.push([0, H + 0.6, 12.3, 106, 1.2, 0.8, TRIM], [0, 0.4, 12.5, 106, 0.8, 0.6, '#d9c8ff']);
    for (let x = -46; x <= 46; x += 8) { if (Math.abs(x) < 10) continue; L.push([x, 6, 12.45, 0.6, 12, 0.4, GOLD]); }
    vox(L, root);
    const glass = new THREE.MeshToonMaterial({ color: '#8fdcff', emissive: '#3fa8ff', emissiveIntensity: 0.25, transparent: true, opacity: 0.85 });
    for (let x = -42; x <= 42; x += 8) { if (Math.abs(x) < 10) continue; const g = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4), glass); g.position.set(x, 2.6, 12.42); root.add(g); const g2 = g.clone(); g2.position.y = 8.2; root.add(g2); }
    const flagT = textTex([['★', 90, '#ffd23f']], { w: 128, h: 256, bg: '#b25cff', r: 12 });
    for (const x of [-34, -18, 18, 34]) sign(flagT, 1.4, 2.8, x, 9.2, 12.75);
  }
  // grand entrance: gold arch + dome over the door + big sign + automatic glass doors
  { const L = [];
    for (const s of [-1, 1]) { L.push([s * 7.5, 8, 12.8, 3, 16, 2.4, GOLD], [s * 7.5, 8, 13.6, 2, 15, 0.6, '#ffe27a']); }
    L.push([0, 15.5, 12.8, 18, 2.2, 2.6, GOLD], [0, 17, 12.8, 12, 1.2, 2.2, TRIM]);
    vox(L, root, { shadow: true });
    const bag = textTex([['مول العرب', 120, '#ffffff', '#4a14b0'], ['Mall of Arabia', 64, '#ffd23f', '#4a14b0']], { w: 1024, h: 340, bg: '#7a32e6', border: '#ffd23f', r: 40 });
    sign(bag, 14, 4.6, 0, 12.2, 14.15);
    const can = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 6), toon('#b25cff')); can.position.set(0, 9.4, 15); root.add(can);
  }
  const doorMat = new THREE.MeshToonMaterial({ color: '#bff0ff', transparent: true, opacity: 0.55, emissive: '#7fd8ff', emissiveIntensity: 0.2 });
  const doors = [];
  for (const [x, z, ax] of [[0, 12, 'x'], [52, -20, 'z'], [-52, -20, 'z']]) for (const s of [-1, 1]) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(ax === 'x' ? 5.6 : 0.2, 8, ax === 'x' ? 0.2 : 4.6), doorMat); const bx = x + (ax === 'x' ? s * 3 : 0), bz = z + (ax === 'z' ? s * 2.5 : 0);
    d.position.set(bx, 4, bz); root.add(d); doors.push({ m: d, bx, bz, s, ax, cx: x, cz: z, open: 0 });
  }
  // interior floor + ceiling glass
  tiledPlane(T.marble, 103, 77, 0, -27, 0.05, 3);
  const glassRoof = new THREE.MeshToonMaterial({ color: '#cfefff', transparent: true, opacity: 0.35, depthWrite: false });
  { const r = new THREE.Mesh(new THREE.BoxGeometry(104, 0.3, 78), glassRoof); r.position.set(0, H, -27); root.add(r); }
  // glass dome over the atrium
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(13, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: '#9fe3ff', transparent: true, opacity: 0.4, emissive: '#4fb8ff', emissiveIntensity: 0.25, depthWrite: false, side: THREE.DoubleSide }));
    dome.position.set(0, H, -20); root.add(dome);
    const ribs = new THREE.Mesh(new THREE.SphereGeometry(13.05, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd23f', wireframe: true, toneMapped: false })); ribs.position.copy(dome.position); root.add(ribs);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 0.35, 8, 48), toon(GOLD)); ring.rotation.x = Math.PI / 2; ring.position.set(0, H, -20); root.add(ring);
    const top = new THREE.Mesh(new THREE.OctahedronGeometry(1), toon('#ff4fc8', { emissive: '#ff4fc8', emissiveIntensity: 0.3 })); top.position.set(0, H + 13.6, -20); root.add(top);
  }
  // atrium: fountain, planters, info desk, directory, kiosks, benches
  jets.push(fountain(0, -20, 3.6)); circ(0, -20, 4.4);
  { const L = [];
    for (const [x, z] of [[-9, -12], [9, -12], [-9, -28], [9, -28]]) { L.push([x, 0.5, z, 2.2, 1, 2.2, '#b25cff'], [x, 1.1, z, 2, 0.2, 2, '#5fd34a']); L.push(...palm(x, z, 4).map((b) => [b[0], b[1] + 1, b[2], b[3] * 0.8, b[4], b[5] * 0.8, b[6]])); circ(x, z, 1.4); }
    // information desk (west of the fountain)
    L.push([-18, 0.6, -20, 2.4, 1.2, 6, '#7a3cf0'], [-18, 1.25, -20, 2.8, 0.15, 6.4, '#ffd23f']); solid(-19.3, -16.7, -23.2, -16.8);
    // mall directory board (east of the fountain)
    L.push([18, 2, -20, 0.5, 4, 4.4, '#7a3cf0']); solid(17.6, 18.4, -22.4, -17.6);
    // kiosks in the corridor
    for (const [x, c] of [[-34, '#ff4fc8'], [34, '#2fc4ff']]) { L.push([x, 0.6, -20, 3, 1.2, 3, c], [x, 1.25, -20, 3.3, 0.15, 3.3, '#ffffff'], [x, 3.4, -20, 3.6, 0.3, 3.6, c]); for (const s of [-1, 1]) for (const t of [-1, 1]) L.push([x + s * 1.6, 2.2, -20 + t * 1.6, 0.2, 2.2, 0.2, '#ffffff']); solid(x - 1.6, x + 1.6, -21.6, -18.4); }
    L.push(...bench(-46, -14.6, false), ...bench(46, -14.6, false), ...bench(-46, -25.4, false), ...bench(46, -25.4, false));
    vox(L, root, { shadow: true });
    sign(textTex([['الاستعلامات', 64, '#ffffff', '#4a14b0'], ['Information', 40, '#ffd23f']], { w: 512, h: 200 }), 4, 1.6, -18, 3.2, -20, Math.PI / 2);
    const dir = textTex([['🗺️ دليل المول', 56, '#ffffff'], ['بي تك ✅  ·  دريم 2000 ✅', 40, '#ffd23f'], ['راية  ·  الفين  ·  سينما', 40, '#ffd23f']], { w: 512, h: 400, bg: '#4a14b0', r: 20 });
    sign(dir, 4, 3.1, 17.7, 2.3, -20, -Math.PI / 2);
    sign(textTex([['🍿 فشار', 64, '#ffffff', '#b32466']], { w: 256, h: 96 }), 3, 1.1, -34, 4.2, -18.15); sign(textTex([['🍦 آيس كريم', 56, '#ffffff', '#1f64b8']], { w: 256, h: 96 }), 3, 1.1, 34, 4.2, -18.15);
  }

  // ======================= storefronts =======================
  // north row z -27..-66, south row z -13..12; corridor z -27..-13
  const SW = [];
  const front = (x0, x1, z, doorX0, doorX1) => { if (doorX0 === undefined) { wall(x0, z, x1, z, H, '#e4daf6', true, SW); return; } wall(x0, z, doorX0, z, H, '#e4daf6', true, SW); wall(doorX1, z, x1, z, H, '#e4daf6', true, SW); SW.push([(doorX0 + doorX1) / 2, (H + 7.5) / 2, z, doorX1 - doorX0, H - 7.5, WT, '#e4daf6']); };
  // B.TECH (north-east): x 8..50, z -64..-27, door x 22..34
  front(8, 50, -27, 22, 34); wall(8, -27, 8, -66, H, '#e4daf6', true, SW); wall(50, -27, 50, -66, H, '#e4daf6', true, SW);
  // Dream 2000 (north-west, store 2) — door x -35..-23
  front(-50, -8, -27, -35, -23); wall(-8, -27, -8, -66, H, '#e4daf6', true, SW);
  // atrium niche north wall (cinema teaser)
  wall(-8, -40, 8, -40, H, '#e4daf6', true, SW);
  // RAYA (south-west) and ELFIN (south-east), closed for now
  front(-50, -8, -13); wall(-8, -13, -8, 12, H, '#e4daf6', true, SW);
  front(8, 50, -13); wall(8, -13, 8, 12, H, '#e4daf6', true, SW);
  vox(SW, root, { block: true });
  // shop signs, display windows and shutters
  const brand = (ar, en, bg, fg, x, z, ry, w = 14) => sign(textTex([[en, 92, fg], [ar, 64, fg]], { w: 1024, h: 300, bg, r: 26 }), w, w * 300 / 1024, x, 9.4, z, ry);
  // official store logos (files supplied by LOLO) drawn on a white panel; dimmed slightly so bloom doesn't wash them out
  const logoSign = (src, cw, ch, w, x, y, z, ry = 0) => { const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g2 = cv.getContext('2d'); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    g2.fillStyle = '#ffffff'; g2.beginPath(); g2.roundRect(0, 0, cw, ch, 40); g2.fill();
    const im = new Image(); im.onload = () => { const pad = 36, k = Math.min((cw - pad * 2) / im.width, (ch - pad * 2) / im.height), iw = im.width * k, ih = im.height * k; g2.drawImage(im, (cw - iw) / 2, (ch - ih) / 2, iw, ih); tx.needsUpdate = true; }; im.src = src;
    const m = sign(tx, w, w * ch / cw, x, y, z, ry); m.material.color.set('#dedede'); return m; };
  logoSign('assets/btech-logo.webp?v=1', 1024, 300, 13, 28, 9.4, -26.5); // official B.TECH logo
  brand('راية', 'RAYA', '#ffffff', '#1d3d8f', -29, -13.5, Math.PI);
  brand('الفين', 'ELFIN', '#ffffff', '#b0123b', 29, -13.5, Math.PI);
  sign(textTex([['🎬 السينما', 90, '#ffffff', '#b32466'], ['قريبًا', 60, '#ffd23f']], { w: 1024, h: 300, bg: '#2b1650', border: '#ffd23f', r: 26 }), 12, 3.5, 0, 6.5, -39.5);
  const shutterT = ctex(64, 64, (g) => { for (let y = 0; y < 64; y += 4) { g.fillStyle = y % 8 ? '#b9b3cc' : '#cfc9e0'; g.fillRect(0, y, 64, 4); } }); shutterT.wrapS = shutterT.wrapT = THREE.RepeatWrapping; shutterT.repeat.set(1, 6);
  const shutterM = new THREE.MeshToonMaterial({ map: shutterT });
  const soon = textTex([['🚧 بيفتح قريبًا', 64, '#4a14b0'], ['Opening soon', 40, '#7a3cf0']], { w: 512, h: 180, bg: '#ffd23f', r: 20 });
  for (const [x, z, ry] of [[-29, -13.45, Math.PI], [29, -13.45, Math.PI]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(36, 6.6), shutterM); m.position.set(x, 3.4, z); m.rotation.y = ry; root.add(m); sign(soon, 5, 1.75, x, 3.6, z + (ry ? -0.05 : 0.05), ry); }
  // B.TECH display windows (glass) beside its door
  { const g = new THREE.MeshToonMaterial({ color: '#8fdcff', transparent: true, opacity: 0.45, emissive: '#3fa8ff', emissiveIntensity: 0.2 }); for (const [x, w] of [[15, 12], [42, 14]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 5), g); m.position.set(x, 3, -26.55); root.add(m); } }

  // ======================= StoreInteriorManager: B.TECH showroom =======================
  const BT = { x0: 8, x1: 50, z0: -66, z1: -27, door: [22, 34] };
  tiledPlane(T.store, 41, 38, 29, -46.5, 0.07, 2.5);
  // ceiling with light strips (inside the shop only)
  { const c = new THREE.Mesh(new THREE.BoxGeometry(42, 0.3, 39), toon('#cfd6e4')); c.position.set(29, 7.6, -46.5); root.add(c);
    const lm = new THREE.MeshBasicMaterial({ color: '#f4fbff', toneMapped: false }); for (let x = 12; x <= 46; x += 8.5) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 34), lm); s.position.set(x, 7.42, -46.5); root.add(s); } }
  // department signs hanging from the ceiling
  const deptSign = (d, x, z, ry = 0) => sign(textTex([[DEPTS[d].i + ' ' + DEPTS[d].n, 54, '#ffffff']], { w: 512, h: 110, bg: '#1d2030', border: '#ffd23f', r: 18 }), 5.2, 1.12, x, 6.3, z, ry);
  // fixtures: display tables, TV wall, appliance podiums, counter
  const FX = [];
  const table = (x, z, w, d) => { FX.push([x, 0.45, z, w, 0.9, d, '#7a3cf0'], [x, 0.95, z, w + 0.2, 0.12, d + 0.2, '#ffffff']); solid(x - w / 2 - 0.1, x + w / 2 + 0.1, z - d / 2 - 0.1, z + d / 2 + 0.1); };
  table(16, -36, 4, 2); table(16, -47, 5, 2.4); table(16, -58, 5, 2.4); table(32, -42, 4.5, 2.4);
  FX.push([49.3, 3.6, -47, 0.6, 7, 34, '#1d2030']); // TV wall
  FX.push([29, 3.6, -65.3, 40, 7, 0.6, '#d6cdee']); // appliance wall
  for (let x = 14; x <= 44; x += 6) FX.push([x, 0.15, -61.6, 4, 0.3, 2.6, '#d9c8ff']);
  solid(11.5, 46.5, -63, -60.3);
  FX.push([42, 0.6, -32, 6, 1.2, 1.6, '#14161f'], [42, 1.25, -32, 6.4, 0.15, 2, '#ffffff'], [44.5, 1.8, -32.5, 0.8, 1, 0.1, '#2b2f48']); solid(38.8, 45.2, -33, -31);
  vox(FX, root, { shadow: true });
  deptSign('phones', 16, -36); deptSign('computers', 16, -52.5); deptSign('tv', 46, -47, -Math.PI / 2); deptSign('home', 29, -59); deptSign('gaming', 32, -42);
  sign(textTex([['💳 الدفع', 60, '#ffffff']], { w: 300, h: 100, bg: '#1d2030', border: '#ffd23f', r: 16 }), 2.4, 0.8, 42, 3.2, -32.9, Math.PI);
  // the big interactive display wall at the back of the TV department
  const wallTV = new THREE.CanvasTexture(document.createElement('canvas')); wallTV.image.width = 256; wallTV.image.height = 128; wallTV.colorSpace = THREE.SRGBColorSpace;
  const showcase = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), new THREE.MeshBasicMaterial({ map: wallTV, toneMapped: false })); showcase.position.set(48.95, 4.6, -56); showcase.rotation.y = -Math.PI / 2; root.add(showcase);

  // ======================= ProductDisplaySystem: 3D products =======================
  const screenTex = makeScreens();
  const PL3 = [];
  const place = { p1: [14.6, 1.02, -36], p2: [16, 1.02, -36], p3: [17.4, 1.02, -36], c1: [14.3, 1.02, -47], c2: [17.7, 1.02, -47], c3: [14.5, 1.02, -58], c4: [17.6, 1.02, -58], c5: [16, 1.02, -46.2],
    t1: [48.9, 3.9, -36], t2: [48.9, 3.6, -43.5], t3: [48.9, 3.3, -50], h1: [14, 0.3, -61.6], h2: [20, 0.3, -61.6], h3: [26, 3.6, -64.8], h4: [32, 0.3, -61.6], h5: [38, 0.3, -61.6], h6: [44, 0.3, -61.6], g1: [30.6, 1.02, -42], g2: [32.6, 1.02, -42], g3: [34.2, 1.02, -42] };
  for (const p of PRODUCTS.filter((x) => !x.store)) {
    const m = productModel(p, screenTex); const [x, y, z] = place[p.id];
    m.position.set(x, y, z); if (p.d === 'tv') m.rotation.y = -Math.PI / 2; if (p.id === 'h3') m.rotation.y = 0;
    root.add(m);
    // price screen beside each product
    const tag = sign(textTex([[p.n, 40, '#ffffff'], ['🪙 ' + p.price, 52, '#ffd23f']], { w: 400, h: 170, bg: '#1d2030', border: '#2fc4ff', r: 16 }), p.d === 'tv' ? 1.8 : 1.1, p.d === 'tv' ? 0.77 : 0.47, 0, 0, 0);
    if (p.d === 'tv') { tag.position.set(48.9, 1.3, z); tag.rotation.y = -Math.PI / 2; }
    else if (p.d === 'home') { tag.position.set(x, p.id === 'h3' ? 2.2 : 3.0, p.id === 'h3' ? -64.9 : -60.25); }
    else { tag.position.set(x, 1.95, z + 1.2); tag.scale.setScalar(0.75); }
    PL3.push({ p, m, x, z: p.d === 'tv' ? z : p.d === 'home' ? -59.4 : z + (z > -40 ? 1.6 : 1.7), r: p.d === 'tv' ? 3.2 : p.d === 'home' ? 2.6 : 1.5 });
  }
  for (const q of PL3) if (q.p.d === 'tv') q.x = 46.5;

  // ======================= NPCManager: employees + visitors =======================
  const UNI = { top: 'polo', print: 'none', bottom: 'pants', dress: 'none', shoes: 'sneakers', hat: 'none', glasses: 'none', bag: 'none' };
  const uniform = (base, extra) => { const L = C.cloneLook(C.PRESETS[base]); Object.assign(L, UNI, extra || {}); L.c = Object.assign({}, L.c, { top: '#14161f', bottom: '#2b2f48', shoes: '#ffffff' }); return L; };
  const EMP = [
    { id: 'greet', nm: 'أستاذ سامح', role: 'استقبال بي تك', av: '🧑‍💼', x: 28, z: -31, yaw: 0, look: uniform(1, { hair: 'short', face: 'happy' }) },
    { id: 'phone', nm: 'منى', role: 'قسم الموبايلات', av: '👩‍💼', x: 19.6, z: -38.5, yaw: -Math.PI / 2, look: uniform(2, { glasses: 'none' }) },
    { id: 'tv', nm: 'حسام', role: 'الشاشات والأجهزة', av: '🧑‍🔧', x: 40, z: -50, yaw: Math.PI / 2, look: uniform(3, { glasses: 'round' }), walk: [[40, -50], [40, -38], [30, -55], [22, -54]] },
    { id: 'cash', nm: 'نادية', role: 'الكاشير', av: '👩‍💻', x: 42, z: -33.6, yaw: 0, ix: 42, iz: -30.2, look: uniform(0, { hair: 'pony' }) },
  ];
  const NPC = [];
  const addEmployee = (e) => { const k = C.makeAvatar(e.look); k.scale.setScalar(1.1); k.position.set(OFF + e.x, 0.12, e.z); k.rotation.y = e.yaw; C.scene.add(k); const tag = nameTag(e.nm); tag.position.set(0, 2.55, 0); k.add(tag); const n = Object.assign({ k, emp: true, seen: false, bub: null, bubT: 0, wi: 0, home: [e.x, e.z], go: null }, e); NPC.push(n); circ(e.x, e.z, 0.5); n.ci = C.circles[C.circles.length - 1]; }; EMP.forEach(addEmployee);
  // visitors walking loops (inside corridor + outside plaza) and standing families
  const LOOPS = [[[-40, -15.2], [40, -15.2], [40, -24.8], [-40, -24.8]], [[-12, 30], [12, 30], [12, 80], [-12, 80]], [[-40, 16], [-24, 70], [24, 70], [40, 16]]];
  const VIS = [];
  for (let i = 0; i < 10; i++) { const L = C.randomLook(i % 2 ? 'girl' : 'boy'); const k = C.makeAvatar(L); k.scale.setScalar(i % 3 === 0 ? 0.85 : 1.05); C.scene.add(k); VIS.push({ k, loop: LOOPS[i % 3], seg: i % 4, t: (i * 0.37) % 1, sp: 1.2 + (i % 4) * 0.2 }); }
  const guard = C.makeAvatar(Object.assign(uniform(3, { hat: 'cap' }), { c: { hair: '#24160f', top: '#1f3a8f', bottom: '#1d2030', shoes: '#1d2030', hat: '#1f3a8f', bag: '#000', glasses: '#000', dress: '#000' } })); guard.scale.setScalar(1.12); guard.position.set(OFF + 9, 0.12, 19); guard.rotation.y = 0; C.scene.add(guard); { const gt = nameTag('الأمن'); gt.position.set(0, 2.55, 0); guard.add(gt); } circ(9, 19, 0.5);

  // guide beacon (MallNavigationSystem)
  const beacon = new THREE.Group(); const bcol = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 8, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); bcol.position.y = 4; beacon.add(bcol);
  const barrow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), toon('#ffd23f', { emissive: '#ffb300', emissiveIntensity: 0.6 })); barrow.rotation.x = Math.PI; barrow.position.y = 3.2; beacon.add(barrow); beacon.visible = false; root.add(beacon);
  let GUIDE = null;
  const SPOTS = { btech: { x: 28, z: -24, n: 'بي تك' }, phones: { x: 16, z: -38.6, n: DEPTS.phones.n }, computers: { x: 16, z: -50, n: DEPTS.computers.n }, tv: { x: 45, z: -44, n: DEPTS.tv.n }, home: { x: 29, z: -58.4, n: DEPTS.home.n }, gaming: { x: 32, z: -39.4, n: DEPTS.gaming.n }, cash: { x: 42, z: -29.8, n: 'الكاشير' }, info: { x: -15.5, z: -20, n: 'الاستعلامات' }, exit: { x: 0, z: 20, n: 'باب الخروج' } };
  function guideTo(key) { const s = SPOTS[key]; if (!s) return; GUIDE = { key, ...s }; beacon.visible = true; beacon.position.set(s.x, 0, s.z); C.toast(`📍 امشي ناحية العمود الأصفر: ${s.n}`); }

  // ======================= UI (dialog, inspection, cart, inventory, directory) =======================
  const stEl = document.createElement('style'); stEl.textContent = CSS; document.head.appendChild(stEl);
  const ui = document.createElement('div'); ui.id = 'mallP'; ui.className = 'mallUI'; ui.setAttribute('dir', 'rtl'); document.body.appendChild(ui);
  const hud = document.createElement('div'); hud.id = 'mallHud'; hud.setAttribute('dir', 'rtl'); hud.innerHTML = '<button data-mh="cart" title="السلة" aria-label="السلة">🛒<i>0</i></button><button data-mh="bag" title="مشترياتي" aria-label="مشترياتي">🛍️</button><button data-mh="dir" title="دليل المول" aria-label="دليل المول">🗺️</button>'; document.body.appendChild(hud);
  hud.addEventListener('click', (e) => { const b = e.target.closest('[data-mh]'); if (!b) return; C.sfx.click(); const a = b.dataset.mh; if (a === 'cart') openCart(); else if (a === 'bag') openBag('inv'); else openDirectory(); });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let uiMode = null;
  function openUI(cls, html) { ui.className = 'mallUI on ' + cls; ui.innerHTML = html; uiMode = cls; document.body.classList.toggle('mallFocus', cls !== 'dlg'); C.setPanel('mallP'); hud.classList.remove('on'); }
  function closeUI() { ui.className = 'mallUI'; ui.innerHTML = ''; uiMode = null; document.body.classList.remove('mallFocus'); VIEW.on = false; C.setPanel(null); }
  ui.addEventListener('click', (e) => { const t = e.target.closest('[data-mu]'); if (!t) return; C.sfx.click(); onUI(t.dataset.mu, t.dataset.v, t); });

  // ---------- NPCDialogueSystem: lines + choices ----------
  function talk(n, tx, choices) {
    openUI('dlg', `<div class="dbox"><div class="dav">${n.av}</div><div style="flex:1"><div class="dnm">${esc(n.nm)} · <small>${esc(n.role)}</small></div><div class="dtx">${esc(tx)}</div><div class="dch">${choices.map((c, i) => `<button data-mu="ch" data-v="${i}">${esc(c[0])}</button>`).join('')}</div></div></div>`);
    talk.ch = choices; talk.n = n; n.k.emo = { k: 'wave', t: 1.2 }; C.sfx.pop();
  }
  const SCRIPTS = {
    greet: (n) => talk(n, 'أهلاً بيك في بي تك! نورت المعرض. 😊 تحب أوديك على أي قسم؟', [
      ['📱 الموبايلات', () => { closeUI(); guideTo('phones'); say(n, 'منى هناك هتساعدك!'); }], ['💻 اللابتوب', () => { closeUI(); guideTo('computers'); }], ['📺 الشاشات', () => { closeUI(); guideTo('tv'); }],
      ['🧊 الأجهزة المنزلية', () => { closeUI(); guideTo('home'); }], ['🎮 الألعاب', () => { closeUI(); guideTo('gaming'); }], ['👋 شكرًا', closeUI]]),
    phone: (n) => talk(n, 'بتدور على موبايل جديد ولا لابتوب؟', [
      ['✨ وريني أحدث موبايل', () => openProduct('p3')], ['⚖️ تحب تعرف الفرق بين الموديلين دول؟', () => { const m = st(); m.cmp = ['p1', 'p2']; C.save(); openCompare(); }],
      ['💻 لابتوب', () => { closeUI(); guideTo('computers'); }], ['👋 شكرًا', closeUI]]),
    tv: (n) => talk(n, 'تعالى أوريك أحدث الأجهزة عندنا.', [
      ['📺 الشاشات', () => { closeUI(); walkNPC(n, 44, -44); guideTo('tv'); }], ['🧊 الأجهزة المنزلية', () => { closeUI(); walkNPC(n, 29, -57); guideTo('home'); }],
      ['🔥 إيه أكتر جهاز عليه طلب؟', () => talk(n, 'الجهاز ده من أكتر الأجهزة اللي عليها طلب: شاشة سمارت 55 بوصة! تحب تتفرج عليها؟', [['🔍 أيوه وريني', () => openProduct('t2')], ['👋 بعدين', closeUI]])], ['👋 شكرًا', closeUI]]),
    cash: (n) => talk(n, st().cart.length ? `عندك ${st().cart.length} حاجة في السلة. تحب تدفع؟` : 'أهلاً بيك! السلة لسه فاضية — اختار اللي يعجبك من المعرض وتعالى ادفع هنا.', [
      ['🛒 افتح السلة', openCart], ['🛍️ مشترياتي', () => openBag('inv')], ['👋 شكرًا', closeUI]]),
  };
  function say(n, tx) { if (n.bub) n.k.remove(n.bub); n.bub = bubbleSprite(tx); n.bub.position.set(0, 3.1, 0); n.k.add(n.bub); n.bubT = 3.2; }
  function walkNPC(n, x, z) { n.go = [x, z]; }

  // ======================= STORE 2: DREAM 2000 (LOLO_MALL_DREAM_2026) =======================
  // Same size and systems as B.TECH: x -50..-8, z -66..-27, door x -35..-23 on the main corridor.
  // Brand colours green / blue / white. The sign shows the name as text — the official logo file can replace it.
  (function buildDream() {
    const DX = -29, LIME = '#8be000', BLUE = '#1fb8ff', DARK = '#2b2f37';
    const neon = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
    // ---- exterior: dark brand band, sign, neon door frame, glass windows, promo screens ----
    vox([[DX, 9.4, -26.7, 22, 3.6, 0.5, DARK], [DX, 0.25, -26.6, 42, 0.5, 0.4, DARK]], root);
    logoSign('assets/dream2000-logo.webp?v=1', 1024, 440, 7.6, DX, 9.4, -26.4); // official Dream 2000 logo (supplied by LOLO)
    { const g = new THREE.Group(); root.add(g);
      for (const [x, y, w, h, c] of [[DX - 6.2, 3.8, 0.25, 7.6, LIME], [DX + 6.2, 3.8, 0.25, 7.6, LIME], [DX, 7.6, 12.6, 0.25, LIME], [DX, 7.95, 12.6, 0.12, BLUE]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), neon(c)); m.position.set(x, y, -26.35); g.add(m); } }
    const glass = new THREE.MeshToonMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.45, emissive: '#3fa8ff', emissiveIntensity: 0.2 });
    for (const [x, w] of [[-41.5, 11], [-15.5, 13]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 5), glass); m.position.set(x, 3, -26.55); root.add(m); }
    const ad = (title, emoji, c1, c2) => textTex([[emoji, 150, '#ffffff'], [title, 54, '#ffffff'], ['dream 2000', 44, LIME]], { w: 360, h: 620, bg: c1, border: c2, r: 26 });
    sign(ad('أحدث الموبايلات', '📱', '#1d4f8f', LIME), 2.2, 3.8, -37.7, 2.6, -26.3);
    sign(ad('سماعات بعروض', '🎧', '#155c3b', BLUE), 2.2, 3.8, -20.3, 2.6, -26.3);
    { const L = []; for (const x of [-39.6, -18.4]) L.push([x, 0.5, -25.2, 1.2, 1, 1.2, '#ffffff'], [x, 1.4, -25.2, 1, 0.8, 1, '#3ec95a'], [x, 2.1, -25.2, 0.7, 0.6, 0.7, '#5fd34a']); vox(L, root, { shadow: true }); circ(-39.6, -25.2, 0.7); circ(-18.4, -25.2, 0.7); }
    // ---- interior shell: floor, ceiling with lights + green neon ring, brand wall, storage room ----
    tiledPlane(T.store, 41, 38, DX, -46.5, 0.07, 2.5);
    { const c = new THREE.Mesh(new THREE.BoxGeometry(42, 0.3, 39), toon('#cfd6e4')); c.position.set(DX, 7.6, -46.5); root.add(c);
      const lm = neon('#f4fbff'); for (let x = -46; x <= -12; x += 8.5) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 30), lm); st.position.set(x, 7.42, -45); root.add(st); }
      for (const [x, z, w, d] of [[DX, -39, 16, 0.3], [DX, -51, 16, 0.3], [DX - 8, -45, 0.3, 12], [DX + 8, -45, 0.3, 12]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), neon(LIME)); r.position.set(x, 7.4, z); root.add(r); } }
    const W2 = [];
    const wl = (x0, z0, x1, z1, h, c) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || 0.5, d = Math.abs(z1 - z0) || 0.5; W2.push([cx, h / 2, cz, w, h, d, c]); solid(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2); };
    W2.push([-24, 3.6, -65.3, 32, 7, 0.6, DARK]); // brand wall behind customer service
    // storage room (back-left corner) with a door
    wl(-50, -56, -47.5, -56, 7, '#d6dbe4'); wl(-45.5, -56, -42, -56, 7, '#d6dbe4'); wl(-42, -56, -42, -66, 7, '#d6dbe4'); W2.push([-46.5, 6.25, -56, 2, 1.5, 0.5, '#d6dbe4']);
    vox(W2, root, { block: true });
    logoSign('assets/dream2000-logo.webp?v=1', 1024, 440, 5.4, -27, 5.3, -64.95);
    sign(textTex([['خدمة العملاء', 90, LIME]], { w: 768, h: 160, bg: DARK, r: 20 }), 4.8, 1, -27, 3.6, -64.95);
    sign(textTex([['📦 المخزن', 60, '#ffffff']], { w: 300, h: 100, bg: DARK, border: LIME, r: 16 }), 2, 0.67, -46.5, 5.9, -55.7);
    { const B = []; for (let i = 0; i < 9; i++) { const x = -49 + (i % 3) * 2.2, z = -64.6 + Math.floor(i / 3) * 2.6; for (let h = 0; h < 1 + (i % 3); h++) B.push([x, 0.45 + h * 0.9, z, 1.6, 0.85, 1.6, h % 2 ? '#c99a62' : '#b8854f']); B.push([x, 0.92 + (i % 3) * 0.9, z, 1.62, 0.06, 0.3, LIME]); } vox(B, root, { shadow: true }); solid(-50, -42.8, -66, -58.4); }
    // ---- fixtures: display tables with lime strips, wall shelves, counters ----
    const FX2 = [];
    const dtable = (x, z, w, d) => { FX2.push([x, 0.45, z, w, 0.9, d, '#f4f6fb'], [x, 0.96, z, w + 0.2, 0.1, d + 0.2, '#ffffff'], [x, 0.18, z, w + 0.05, 0.1, d + 0.05, LIME]); solid(x - w / 2 - 0.1, x + w / 2 + 0.1, z - d / 2 - 0.1, z + d / 2 + 0.1); };
    dtable(-43, -36, 4, 2); dtable(-43, -45, 4, 2); dtable(-15, -39, 5, 2.4); dtable(-15, -48, 5, 2.4); dtable(DX, -47, 4.5, 2.4);
    // accessories wall shelf (east wall)
    FX2.push([-9.1, 1.7, -55, 1.2, 3.4, 11, '#f4f6fb'], [-9.6, 0.92, -55, 1.1, 0.08, 10.8, '#ffffff'], [-9.6, 1.82, -55, 1.1, 0.08, 10.8, '#ffffff'], [-9.6, 2.72, -55, 1.1, 0.08, 10.8, '#ffffff'], [-9.7, 3.3, -55, 1.0, 0.12, 10.8, LIME]);
    solid(-9.8, -8, -60.6, -49.4);
    // charging-accessories wall rack (west wall, mobile department)
    FX2.push([-49.3, 1.9, -40.5, 0.6, 3, 7, '#f4f6fb']); for (let y = 0; y < 3; y++) for (let k = 0; k < 6; k++) FX2.push([-48.95, 1.0 + y * 0.9, -43.4 + k * 1.15, 0.12, 0.5, 0.6, ['#18c95a', '#1fb8ff', '#ffffff', '#ff4fc8', '#2b2f37', '#ffc21a'][(k + y) % 6]]);
    solid(-49.7, -48.9, -44, -37);
    // customer service counter + cashier counter
    FX2.push([DX, 0.6, -60.5, 8, 1.2, 1.6, '#ffffff'], [DX, 1.25, -60.5, 8.4, 0.12, 2, '#f4f6fb'], [DX, 0.35, -59.68, 8, 0.12, 0.05, LIME]); solid(DX - 4.2, DX + 4.2, -61.5, -59.5);
    FX2.push([-14, 0.6, -30.6, 6, 1.2, 1.4, DARK], [-14, 1.25, -30.6, 6.4, 0.12, 1.8, '#ffffff'], [-14, 0.3, -29.88, 6, 0.1, 0.05, LIME], [-12.2, 1.8, -31, 0.8, 1, 0.1, DARK]); solid(-17.2, -10.8, -31.5, -29.7);
    vox(FX2, root, { shadow: true });
    sign(textTex([['💳 الكاشير', 60, '#ffffff']], { w: 300, h: 100, bg: DARK, border: LIME, r: 16 }), 2.4, 0.8, -14, 3.2, -31.5, Math.PI);
    const dsign = (t, x, z, ry = 0) => sign(textTex([[t, 54, '#ffffff']], { w: 512, h: 110, bg: DARK, border: LIME, r: 18 }), 5.2, 1.12, x, 6.3, z, ry);
    dsign('📱 الموبايلات', -43, -40.5); dsign('💻 اللابتوبات', -15, -43.5); dsign('🎧 الإكسسوارات', -11.5, -55, -Math.PI / 2); dsign('🎮 الألعاب', DX, -47); dsign('🙋 خدمة العملاء', DX, -57.5);
    // ---- products (reusing the product models + inspection + cart systems) ----
    const put = (id, x, y, z, ry, tag, spot, r) => {
      const p = PBY[id], m = productModel(p, screenTex); m.position.set(x, y, z); m.rotation.y = ry || 0; root.add(m);
      const tg = sign(textTex([[p.n, 40, '#ffffff'], ['🪙 ' + p.price, 52, '#ffd23f']], { w: 400, h: 170, bg: DARK, border: LIME, r: 16 }), 1.1, 0.47, tag[0], tag[1], tag[2], tag[3] || 0); tg.scale.setScalar(tag[4] || 0.75);
      PL3.push({ p, m, x: spot[0], z: spot[1], r: r || 1.5, base: ry || 0 });
    };
    put('d1', -44.2, 1.02, -36, 0, [-44.2, 1.95, -34.8], [-44.2, -34.4]); put('d2', -41.8, 1.02, -36, 0, [-41.8, 1.95, -34.8], [-41.8, -34.4]);
    put('d3', -44.2, 1.02, -45, 0, [-44.2, 1.95, -43.8], [-44.2, -43.4]); put('d4', -41.8, 1.02, -45, 0, [-41.8, 1.95, -43.8], [-41.8, -43.4]);
    put('d5', -16.6, 1.02, -39, 0, [-16.6, 1.95, -37.6], [-16.6, -37.3]); put('d6', -13.4, 1.02, -39, 0, [-13.4, 1.95, -37.6], [-13.4, -37.3]);
    put('d7', -15, 1.02, -48, 0, [-15, 2.2, -46.6], [-15, -46.2], 1.8);
    put('d8', -9.5, 0.96, -51.5, -Math.PI / 2, [-10.2, 3.1, -51.5, -Math.PI / 2, 0.6], [-11.6, -51.5], 1.4); put('d9', -9.5, 0.96, -54, -Math.PI / 2, [-10.2, 3.1, -54, -Math.PI / 2, 0.6], [-11.6, -54], 1.4);
    put('d10', -9.5, 0.96, -56.5, -Math.PI / 2, [-10.2, 3.1, -56.5, -Math.PI / 2, 0.6], [-11.6, -56.5], 1.4); put('d11', -9.5, 1.86, -55.3, -Math.PI / 2, [-10.2, 3.1, -55.3, -Math.PI / 2, 0.6], [-11.6, -55.25], 1.1);
    put('d12', -9.5, 1.86, -58.6, -Math.PI / 2, [-10.2, 3.1, -58.6, -Math.PI / 2, 0.6], [-11.6, -58.6], 1.4);
    put('d13', DX - 1.6, 1.02, -47, 0, [DX - 1.6, 1.95, -45.8], [DX - 1.6, -45.4]); put('d14', DX + 0.2, 1.02, -47, 0, [DX + 0.2, 1.95, -45.8], [DX + 0.2, -45.4]); put('d15', DX + 1.7, 1.02, -47, 0, [DX + 1.7, 1.95, -45.8], [DX + 1.7, -45.4]);
    put('d16', DX + 5, 0.07, -47.5, -0.6, [DX + 5, 2.6, -46.4], [DX + 5, -45.2], 1.8); solid(DX + 4.2, DX + 5.8, -48.3, -46.7);
    // ---- employees (black polo, grey trousers) ----
    const dUni = (base, extra) => { const L = uniform(base, extra); L.c = Object.assign({}, L.c, { top: '#1d2030', bottom: '#5b6270', shoes: '#18c95a' }); return L; };
    [
      { id: 'd_greet', nm: 'عمرو', role: 'استقبال دريم 2000', av: '🧑‍💼', x: DX - 4.2, z: -30.4, yaw: 0.5, look: dUni(1, { hair: 'spiky', face: 'happy' }), hello: 'أهلاً بيك في دريم 2000! 👋' },
      { id: 'd_phone', nm: 'ريم', role: 'قسم الموبايلات', av: '👩‍💼', x: -39.6, z: -40.5, yaw: -Math.PI / 2, look: dUni(0, { hair: 'long' }), hello: 'بتدور على موبايل جديد؟ 📱' },
      { id: 'd_laptop', nm: 'يوسف', role: 'قسم اللابتوبات', av: '🧑‍💻', x: -18.6, z: -43.5, yaw: Math.PI / 2, look: dUni(3, { glasses: 'round' }), hello: 'تعالى شوف أحدث اللابتوبات عندنا 💻', walk: [[-18.6, -43.5], [-19, -35.5], [-24, -40], [-22, -52]], arrive: 'دي أحدث اللابتوبات، شوفهم براحتك 👌' },
      { id: 'd_cs1', nm: 'هبة', role: 'خدمة العملاء', av: '🙋‍♀️', x: DX - 2, z: -62.3, yaw: 0, ix: DX - 2, iz: -58.6, look: dUni(2, {}), hello: 'ممكن أساعدك تقارن بين الأجهزة 😊' },
      { id: 'd_cs2', nm: 'كريم', role: 'استفسارات المنتجات', av: '🧑‍💼', x: DX + 2, z: -62.3, yaw: 0, ix: DX + 2, iz: -58.6, look: dUni(1, { hair: 'curly' }), hello: 'عندك سؤال عن أي جهاز؟' },
      { id: 'd_cash', nm: 'سلمى', role: 'الكاشير', av: '👩‍💻', x: -14, z: -32.4, yaw: 0, ix: -14, iz: -28.9, look: dUni(0, { hair: 'pony' }), hello: 'أهلاً! الدفع من هنا 💳' },
      { id: 'd_stock', nm: 'مصطفى', role: 'المخزن', av: '📦', x: -46.5, z: -57.4, yaw: 0, look: dUni(3, { hat: 'cap' }), hello: 'بجيب بضاعة جديدة من المخزن 📦', walk: [[-46.5, -57.4], [-46.5, -53], [-12, -52], [-12, -58], [-40, -58.6]] },
    ].forEach(addEmployee);
    Object.assign(SPOTS, { dream: { x: DX, z: -24, n: 'دريم 2000' }, d_phones: { x: -43, z: -38.8, n: 'دريم 2000 · الموبايلات' }, d_laptops: { x: -15, z: -41.8, n: 'دريم 2000 · اللابتوبات' }, d_acc: { x: -12, z: -55, n: 'دريم 2000 · الإكسسوارات' }, d_gaming: { x: DX, z: -44.6, n: 'دريم 2000 · الألعاب' }, d_cs: { x: DX, z: -58, n: 'دريم 2000 · خدمة العملاء' }, d_cash: { x: -14, z: -28.8, n: 'دريم 2000 · الكاشير' } });
    const nearest = (n) => { let b = null, bd = 1e9; for (const q of PL3) { if (q.p.store !== 'dream') continue; const d = Math.hypot(q.x - (n.k.position.x - OFF), q.z - n.k.position.z); if (d < bd) { bd = d; b = q; } } return b; };
    Object.assign(SCRIPTS, {
      d_greet: (n) => talk(n, 'أهلاً بيك في دريم 2000! تحب أوديك على أي قسم؟', [
        ['📱 الموبايلات', () => { closeUI(); guideTo('d_phones'); }], ['💻 اللابتوبات', () => { closeUI(); guideTo('d_laptops'); }], ['🎧 الإكسسوارات', () => { closeUI(); guideTo('d_acc'); }],
        ['🎮 الألعاب', () => { closeUI(); guideTo('d_gaming'); }], ['🙋 خدمة العملاء', () => { closeUI(); guideTo('d_cs'); }], ['👋 شكرًا', closeUI]]),
      d_phone: (n) => talk(n, 'بتدور على موبايل جديد؟ عندنا أحدث الموديلات وشواحن لاسلكي كمان.', [
        ['⭐ وريني أقوى موبايل', () => openProduct('d3')], ['⚖️ قارن بين ستار 12 وسكاي 7', () => { const m = st(); m.cmp = ['d1', 'd2']; C.save(); openCompare(); }],
        ['🔌 عايز شاحن', () => openProduct('d4')], ['👋 شكرًا', closeUI]]),
      d_laptop: (n) => talk(n, 'تعالى شوف أحدث اللابتوبات عندنا. للألعاب ولا للشغل والمذاكرة؟', [
        ['🎮 للألعاب', () => { closeUI(); walkNPC(n, -16.6, -36.6); guideTo('d_laptops'); setTimeout(() => openProduct('d5'), 2600); }], ['📚 للشغل والمذاكرة', () => openProduct('d6')],
        ['⚖️ إيه الفرق بينهم؟', () => { const m = st(); m.cmp = ['d5', 'd6']; C.save(); openCompare(); }], ['👋 شكرًا', closeUI]]),
      d_cs1: (n) => talk(n, 'ممكن أساعدك تقارن بين الأجهزة. تحب تقارن إيه؟', [
        ['📱 موبايلين', () => { const m = st(); m.cmp = ['d1', 'd3']; C.save(); openCompare(); }], ['🎧 سماعتين', () => { const m = st(); m.cmp = ['d8', 'd15']; C.save(); openCompare(); }],
        ['⚖️ اللي اخترته أنا', () => (st().cmp.length === 2 ? openCompare() : talk(n, 'اختار جهازين بزرار «قارن» من أي منتج، وأنا أعرضلك الفرق 👍', [['تمام', closeUI]]))], ['👋 شكرًا', closeUI]]),
      d_cs2: (n) => { const q = nearest(n); talk(n, 'عندك سؤال عن أي جهاز؟ أنا أعرف كل حاجة في المحل.', [
        ['🔥 إيه الأكتر مبيعًا؟', () => talk(n, 'الساعة الذكية سبورت عليها طلب كبير الأيام دي! تحب تشوفها؟', [['🔍 أيوه', () => openProduct('d10')], ['👋 بعدين', closeUI]])],
        ['🎮 عايز حاجة للألعاب', () => { closeUI(); guideTo('d_gaming'); }], ['🛍️ مشترياتي', () => openBag('inv')], ['👋 شكرًا', closeUI]]); },
      d_cash: (n) => SCRIPTS.cash(n),
      d_stock: (n) => talk(n, 'أنا بنقل البضاعة من المخزن للرفوف. لو محتاج حاجة اسأل زمايلي في الأقسام 😊', [['📍 وديني للإكسسوارات', () => { closeUI(); guideTo('d_acc'); }], ['👋 تمام', closeUI]]),
    });
  })();

  // ---------- ProductInspectionSystem (3D view rendered with the game's renderer) ----------
  const VIEW = { on: false, scene: null, cam: null, obj: null, yaw: 0.6, pitch: 0.25, zoom: 1, drag: null, pts: new Map(), pinch: 0, id: null };
  function viewInit() {
    if (VIEW.scene) return; const s = new THREE.Scene();
    s.background = ctex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d2a5c'); gr.addColorStop(0.6, '#3b2a8f'); gr.addColorStop(1, '#7a4dff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    s.add(new THREE.HemisphereLight('#ffffff', '#8f6cff', 1.6)); const d = new THREE.DirectionalLight('#ffffff', 2.4); d.position.set(3, 5, 4); s.add(d); const r = new THREE.DirectionalLight('#7fd8ff', 1.2); r.position.set(-4, 2, -3); s.add(r);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.25, 40), toon('#f3edff')); ped.position.y = -0.125; s.add(ped);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: '#2fc4ff', toneMapped: false })); ring.rotation.x = Math.PI / 2; s.add(ring);
    VIEW.scene = s; VIEW.cam = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
  }
  function viewSet(id) {
    viewInit(); if (VIEW.obj) VIEW.scene.remove(VIEW.obj);
    const o = productModel(PBY[id], screenTex); const box = new THREE.Box3().setFromObject(o), size = box.getSize(new THREE.Vector3()), k = 1.7 / Math.max(size.x, size.y, size.z);
    o.scale.setScalar(k); box.setFromObject(o); const c = box.getCenter(new THREE.Vector3()); o.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
    const g = new THREE.Group(); g.add(o); VIEW.scene.add(g); VIEW.obj = g; VIEW.h = box.max.y - box.min.y; VIEW.zoom = 1; VIEW.yaw = 0.6; VIEW.pitch = 0.22; VIEW.id = id;
  }
  function renderView(dt, now) {
    const r = C.renderer, cam = VIEW.cam, pw = ui.querySelector('.mpan'); const a = innerWidth / innerHeight; cam.aspect = a; cam.updateProjectionMatrix();
    const frac = pw ? pw.getBoundingClientRect().width / innerWidth : 0, dist = 4.2 / VIEW.zoom, half = Math.tan((cam.fov * Math.PI) / 360) * dist, sx = frac * half * a;
    if (VIEW.drag === null && VIEW.pts.size === 0) VIEW.yaw += dt * 0.25;
    const ty = VIEW.h * 0.5; cam.position.set(sx + Math.sin(VIEW.yaw) * Math.cos(VIEW.pitch) * dist, ty + Math.sin(VIEW.pitch) * dist, Math.cos(VIEW.yaw) * Math.cos(VIEW.pitch) * dist); cam.lookAt(sx, ty, 0);
    // keep the product in the free area (left of the panel)
    cam.position.x -= 0; r.render(VIEW.scene, cam);
  }
  ui.addEventListener('pointerdown', (e) => { if (uiMode !== 'insp' || e.target.closest('.mpan,.zoom')) return; VIEW.pts.set(e.pointerId, [e.clientX, e.clientY]); VIEW.drag = [e.clientX, e.clientY]; if (VIEW.pts.size === 2) { const [p, q] = [...VIEW.pts.values()]; VIEW.pinch = Math.hypot(p[0] - q[0], p[1] - q[1]); } });
  ui.addEventListener('pointermove', (e) => { if (uiMode !== 'insp' || !VIEW.pts.has(e.pointerId)) return; VIEW.pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (VIEW.pts.size === 2) { const [p, q] = [...VIEW.pts.values()], d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (VIEW.pinch) VIEW.zoom = Math.min(3, Math.max(0.6, VIEW.zoom * d / VIEW.pinch)); VIEW.pinch = d; return; }
    VIEW.yaw -= (e.clientX - VIEW.drag[0]) * 0.01; VIEW.pitch = Math.min(1.2, Math.max(-0.3, VIEW.pitch + (e.clientY - VIEW.drag[1]) * 0.006)); VIEW.drag = [e.clientX, e.clientY]; });
  const pUp = (e) => { VIEW.pts.delete(e.pointerId); if (!VIEW.pts.size) { VIEW.drag = null; VIEW.pinch = 0; } };
  ui.addEventListener('pointerup', pUp); ui.addEventListener('pointercancel', pUp);
  ui.addEventListener('wheel', (e) => { if (uiMode !== 'insp') return; e.preventDefault(); VIEW.zoom = Math.min(3, Math.max(0.6, VIEW.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); }, { passive: false });

  function openProduct(id) {
    const p = PBY[id], m = st(); viewSet(id); VIEW.on = true;
    const wished = m.wish.includes(id), inCmp = m.cmp.includes(id), inCart = m.cart.filter((x) => x === id).length;
    openUI('insp', `<div class="hint">👆 اسحب لتلف الجهاز · قرّب بصباعين أو بالأزرار</div>
      <div class="zoom"><button data-mu="zin" aria-label="تقريب">＋</button><button data-mu="zout" aria-label="تبعيد">－</button></div>
      <div class="mpan"><div class="mhd"><b>${esc(p.n)}<small>${DEPTS[p.d].i} ${DEPTS[p.d].n} · ${STORES[p.store || 'btech']}</small></b><button class="mx" data-mu="close" aria-label="إغلاق">✕</button></div>
      <div class="mbd"><div class="price">🪙 ${p.price}</div>
        <table><tr><th colspan="2">المواصفات</th></tr>${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join('')}</table>
        <div class="feat">${p.f.map((x) => `<span>✨ ${esc(x)}</span>`).join('')}</div>
        <small style="color:#8a62c9;font-weight:700;text-align:center">الأسعار بعملات اللعبة بس — مفيش فلوس حقيقية.</small></div>
      <div class="mbtns"><button class="mb p" data-mu="wish" data-v="${id}">${wished ? '💖 في المفضلة' : '🤍 أضف للمفضلة'}</button><button class="mb" data-mu="cmp" data-v="${id}">${inCmp ? '⚖️ في المقارنة' : '⚖️ قارن'}</button>
        <button class="mb y full" data-mu="add" data-v="${id}">🛒 أضف للسلة${inCart ? ` (${inCart})` : ''}</button>${m.cmp.length === 2 ? '<button class="mb g full" data-mu="showcmp">⚖️ اعرض المقارنة</button>' : ''}</div></div>`);
  }
  function openCompare() {
    const m = st(); const [a, b] = m.cmp.map((x) => PBY[x]); if (!a || !b) return C.toast('⚖️ اختار جهازين علشان تقارن');
    const keys = [...new Set([...Object.keys(a.specs), ...Object.keys(b.specs)])];
    openUI('list', `<div class="mpan"><div class="mhd"><b>⚖️ مقارنة</b><button class="mx" data-mu="close" aria-label="إغلاق">✕</button></div><div class="mbd">
      <table><tr><th></th><th>${esc(a.n)}</th><th>${esc(b.n)}</th></tr><tr><td>السعر</td><td><b>🪙 ${a.price}</b></td><td><b>🪙 ${b.price}</b></td></tr>
      ${keys.map((k) => `<tr><td>${esc(k)}</td><td>${esc(a.specs[k] || '—')}</td><td>${esc(b.specs[k] || '—')}</td></tr>`).join('')}
      <tr><td>مميزات</td><td>${a.f.map(esc).join('، ')}</td><td>${b.f.map(esc).join('، ')}</td></tr></table></div>
      <div class="mbtns"><button class="mb" data-mu="open" data-v="${a.id}">🔍 ${esc(a.n)}</button><button class="mb" data-mu="open" data-v="${b.id}">🔍 ${esc(b.n)}</button><button class="mb p full" data-mu="cmpclear">مسح المقارنة</button></div></div>`);
  }
  // ---------- ShoppingCartSystem ----------
  function openCart(confirm) {
    const m = st(), items = {}; m.cart.forEach((id) => { items[id] = (items[id] || 0) + 1; }); const total = m.cart.reduce((s, id) => s + (PBY[id] ? PBY[id].price : 0), 0), coins = C.S.coins || 0;
    openUI('list', `<div class="mpan"><div class="mhd"><b>🛒 السلة<small>مول العرب</small></b><button class="mx" data-mu="close" aria-label="إغلاق">✕</button></div><div class="mbd">
      ${Object.keys(items).length ? Object.entries(items).map(([id, q]) => { const p = PBY[id]; return `<div class="row"><span class="ic">${DEPTS[p.d].i}</span><div class="t">${esc(p.n)}<small>🪙 ${p.price} × ${q}</small></div><button data-mu="dec" data-v="${id}" aria-label="شيل واحد">－</button><b>${q}</b><button data-mu="inc" data-v="${id}" aria-label="زوّد واحد">＋</button></div>`; }).join('') : '<div class="empty">🛒 السلة فاضية — قرّب من أي جهاز واضغط «أضف للسلة».</div>'}
      <div class="tot"><span>الإجمالي</span><span>🪙 ${total}</span></div><div class="tot" style="background:#efe6ff"><span>رصيدك</span><span>🪙 ${coins}</span></div>
      ${confirm ? `<div class="conf">متأكد إنك عايز تشتري بـ 🪙 ${total}؟<br><small>هيتخصم من عملات اللعبة.</small></div>` : ''}</div>
      <div class="mbtns">${confirm ? '<button class="mb g" data-mu="buy">✅ أيوه اشتري</button><button class="mb p" data-mu="cart">رجوع</button>' : `<button class="mb y full" data-mu="checkout" ${m.cart.length ? '' : 'disabled'}>💳 اشتري بالعملات</button>`}</div></div>`);
  }
  function buy() {
    const m = st(); const total = m.cart.reduce((s, id) => s + (PBY[id] ? PBY[id].price : 0), 0);
    if ((C.S.coins || 0) < total) { openCart(); C.toast(`🪙 محتاج ${total - (C.S.coins || 0)} عملة كمان — لِم عملات في الجولة الحرة والمهام`); return; }
    C.S.coins -= total; const at = Date.now(); m.cart.forEach((id) => m.inv.push({ id, at })); m.hist.unshift({ at, items: m.cart.slice(), total }); m.hist = m.hist.slice(0, 50); m.cart = []; C.save(); C.updPills(); C.sfx.win();
    closeUI(); C.toast('🛍️ مبروك! اشتريت بنجاح — شنطة المشتريات في إيدك'); bagOn();
  }
  // ---------- InventorySystem ----------
  function openBag(tab) {
    const m = st(); const t = (k, n) => `<button class="${tab === k ? 'on' : ''}" data-mu="tab" data-v="${k}">${n}</button>`; let body = '';
    if (tab === 'inv') { const c = {}; m.inv.forEach((x) => { c[x.id] = (c[x.id] || 0) + 1; }); body = Object.keys(c).length ? Object.entries(c).map(([id, q]) => `<div class="row"><span class="ic">${DEPTS[PBY[id].d].i}</span><div class="t">${esc(PBY[id].n)}<small>عندك ${q}</small></div><button data-mu="open" data-v="${id}">🔍</button></div>`).join('') : '<div class="empty">🛍️ لسه ما اشتريتش حاجة.</div>'; }
    else if (tab === 'wish') body = m.wish.length ? m.wish.map((id) => `<div class="row"><span class="ic">${DEPTS[PBY[id].d].i}</span><div class="t">${esc(PBY[id].n)}<small>🪙 ${PBY[id].price}</small></div><button data-mu="open" data-v="${id}">🔍</button><button data-mu="add" data-v="${id}">🛒</button></div>`).join('') : '<div class="empty">🤍 المفضلة فاضية.</div>';
    else body = m.hist.length ? m.hist.map((h) => `<div class="row"><span class="ic">🧾</span><div class="t">${h.items.map((id) => esc(PBY[id] ? PBY[id].n : id)).join('، ')}<small>${new Date(h.at).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · 🪙 ${h.total}</small></div></div>`).join('') : '<div class="empty">🧾 مفيش عمليات شرا لسه.</div>';
    openUI('list', `<div class="mpan"><div class="mhd"><b>🛍️ مشترياتي</b><button class="mx" data-mu="close" aria-label="إغلاق">✕</button></div><div class="tabs">${t('inv', 'مشترياتي')}${t('wish', 'المفضلة')}${t('hist', 'سجل الشرا')}</div><div class="mbd">${body}</div></div>`);
  }
  // ---------- MallNavigationSystem: directory ----------
  function openDirectory() {
    const rows = [['btech', '1️⃣', 'بي تك — B.TECH', 'مفتوح'], ['dream', '2️⃣', 'دريم 2000 — Dream 2000', 'مفتوح'], ['d_phones', '📱', 'دريم 2000 · الموبايلات', 'مفتوح'], ['d_laptops', '💻', 'دريم 2000 · اللابتوبات', 'مفتوح'], ['d_acc', '🎧', 'دريم 2000 · الإكسسوارات', 'مفتوح'], ['d_gaming', '🎮', 'دريم 2000 · الألعاب', 'مفتوح'], ['d_cs', '🙋', 'دريم 2000 · خدمة العملاء', 'مفتوح'], ['phones', '📱', 'بي تك · الموبايلات', 'مفتوح'], ['tv', '📺', 'بي تك · الشاشات', 'مفتوح'], ['home', '🧊', 'بي تك · الأجهزة المنزلية', 'مفتوح'], ['cash', '💳', 'بي تك · الكاشير', 'مفتوح'], ['info', 'ℹ️', 'الاستعلامات', 'مفتوح'], ['exit', '🚪', 'باب الخروج', 'مفتوح']];
    const soon = [['راية — RAYA', '🚧'], ['الفين — ELFIN', '🚧'], ['السينما', '🎬'], ['سافوري لاند', '🎡'], ['مدينة التلج', '❄️']];
    openUI('list', `<div class="mpan"><div class="mhd"><b>🗺️ دليل مول العرب</b><button class="mx" data-mu="close" aria-label="إغلاق">✕</button></div><div class="mbd">
      ${rows.map(([k, i, n, s]) => `<div class="row"><span class="ic">${i}</span><div class="t">${n}<small>✅ ${s}</small></div><button data-mu="go" data-v="${k}">📍 وديني</button></div>`).join('')}
      ${soon.map(([n, i]) => `<div class="row" style="opacity:.6"><span class="ic">${i}</span><div class="t">${n}<small>🚧 بيتجهز — قريبًا</small></div></div>`).join('')}</div></div>`);
  }
  function onUI(a, v) {
    const m = st();
    if (a === 'close') closeUI();
    else if (a === 'ch') { const c = talk.ch && talk.ch[+v]; if (c) c[1](); }
    else if (a === 'zin') VIEW.zoom = Math.min(3, VIEW.zoom * 1.2); else if (a === 'zout') VIEW.zoom = Math.max(0.6, VIEW.zoom / 1.2);
    else if (a === 'wish') { const i = m.wish.indexOf(v); if (i > -1) m.wish.splice(i, 1); else { m.wish.push(v); C.toast('💖 اتضاف للمفضلة'); } C.save(); openProduct(v); }
    else if (a === 'cmp') { const i = m.cmp.indexOf(v); if (i > -1) m.cmp.splice(i, 1); else { m.cmp.push(v); if (m.cmp.length > 2) m.cmp.shift(); } C.save(); if (m.cmp.length === 2 && i < 0) openCompare(); else openProduct(v); }
    else if (a === 'showcmp') openCompare(); else if (a === 'cmpclear') { m.cmp = []; C.save(); closeUI(); }
    else if (a === 'add') { m.cart.push(v); C.save(); updHud(); C.toast(`🛒 ${PBY[v].n} اتضاف للسلة`); if (uiMode === 'insp') openProduct(v); else openBag('wish'); }
    else if (a === 'open') openProduct(v);
    else if (a === 'inc') { m.cart.push(v); C.save(); updHud(); openCart(); } else if (a === 'dec') { const i = m.cart.indexOf(v); if (i > -1) m.cart.splice(i, 1); C.save(); updHud(); openCart(); }
    else if (a === 'checkout') openCart(true); else if (a === 'cart') openCart(); else if (a === 'buy') buy();
    else if (a === 'tab') openBag(v); else if (a === 'go') { closeUI(); guideTo(v); }
  }
  function updHud() { hud.querySelector('i').textContent = st().cart.length; }

  // shopping bag in the kid's hand after a purchase
  let bagMesh = null;
  function bagOn() { const k = C.getKid(); if (!k || !k.P) return; if (bagMesh && bagMesh.parent) bagMesh.parent.remove(bagMesh); bagMesh = new THREE.Group(); vox([[0, -0.75, 0.1, 0.42, 0.46, 0.18, '#b25cff'], [0, -0.48, 0.1, 0.3, 0.08, 0.04, '#ffd23f']], bagMesh); k.P.arms[1].add(bagMesh); k.__mallBag = true; }
  function bagOff() { if (bagMesh && bagMesh.parent) bagMesh.parent.remove(bagMesh); bagMesh = null; }

  // ======================= NPCInteractionSystem + update =======================
  let welcomed = false;
  function update(dt, now, active) {
    if (!active) return;
    const t = now / 1000;
    jets.forEach((j, i) => { j.scale.y = 1 + Math.sin(t * 4 + i) * 0.12; });
    // automatic doors
    for (const d of doors) { const near = Math.hypot(C.PL.x - OFF - d.cx, C.PL.z - d.cz) < 9; d.open += ((near ? 1 : 0) - d.open) * Math.min(1, dt * 5); if (d.ax === 'x') d.m.position.x = d.bx + d.s * d.open * 5; else d.m.position.z = d.bz + d.s * d.open * 4.4; }
    // display wall animation
    drawShowcase(wallTV, t); wallTV.needsUpdate = true;
    const kid = C.getKid();
    if (!welcomed) { welcomed = true; const m = st(); if (!m.gift) { m.gift = 1; C.S.coins = (C.S.coins || 0) + 300; C.save(); C.updPills(); setTimeout(() => C.toast('🎁 هدية افتتاح مول العرب: 300 عملة 🪙'), 1800); } updHud(); }
    if (kid && st().inv.length && !kid.__mallBag) bagOn();
    hud.classList.toggle('on', !uiMode && C.isPlaying());
    // employees: notice, turn, greet, walk / guide
    for (const n of NPC) {
      const dx = C.PL.x - n.k.position.x, dz = C.PL.z - n.k.position.z, d = Math.hypot(dx, dz);
      let speed = 0;
      if (n.go) { const gx = OFF + n.go[0] - n.k.position.x, gz = n.go[1] - n.k.position.z, gd = Math.hypot(gx, gz); if (gd < 0.4) { n.go = null; if (n.id === 'tv' || n.arrive) say(n, n.arrive || 'اتفضل، شوف براحتك 👌'); } else { const s = Math.min(2.2, gd) * dt * 1.6; n.k.position.x += (gx / gd) * s; n.k.position.z += (gz / gd) * s; n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(gx, gz), dt * 8); speed = 2.2; } }
      else if (n.walk && d > 7) { const w = n.walk[n.wi], gx = OFF + w[0] - n.k.position.x, gz = w[1] - n.k.position.z, gd = Math.hypot(gx, gz); if (gd < 0.4) n.wi = (n.wi + 1) % n.walk.length; else { n.k.position.x += (gx / gd) * dt * 1.3; n.k.position.z += (gz / gd) * dt * 1.3; n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(gx, gz), dt * 6); speed = 1.3; } }
      if (d < 6.5 && !n.go) n.k.rotation.y = angLerp(n.k.rotation.y, Math.atan2(dx, dz), dt * 5);
      else if (!n.walk && !n.go) n.k.rotation.y = angLerp(n.k.rotation.y, n.yaw, dt * 2);
      if (d < 5 && !n.seen) { n.seen = true; n.k.emo = { k: 'wave', t: 1.4 }; say(n, n.hello ? n.hello : n.id === 'greet' ? 'أهلاً بيك في بي تك! نورت المعرض 👋' : n.id === 'phone' ? 'أهلاً! محتاج مساعدة في الموبايلات؟' : n.id === 'tv' ? 'تعالى أوريك أحدث الأجهزة عندنا!' : 'أهلاً! الدفع من هنا 💳'); C.sfx.pop(); }
      if (d > 14) n.seen = false;
      if (n.ci) { n.ci.x = n.k.position.x; n.ci.z = n.k.position.z; }
      C.animKid(n.k, speed, dt, false);
      if (n.bub) { n.bubT -= dt; n.bub.material.opacity = Math.min(1, n.bubT); if (n.bubT <= 0) { n.k.remove(n.bub); n.bub = null; } }
    }
    for (const v of VIS) { const a = v.loop[v.seg], b = v.loop[(v.seg + 1) % v.loop.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); v.t += (v.sp * dt) / L; if (v.t >= 1) { v.t = 0; v.seg = (v.seg + 1) % v.loop.length; } const x = a[0] + (b[0] - a[0]) * v.t, z = a[1] + (b[1] - a[1]) * v.t; v.k.position.set(OFF + x, 0.12, z); v.k.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); C.animKid(v.k, v.sp, dt, false); }
    C.animKid(guard, 0, dt, false); if (Math.hypot(C.PL.x - OFF - 9, C.PL.z - 19) < 6) guard.rotation.y = angLerp(guard.rotation.y, Math.atan2(C.PL.x - guard.position.x, C.PL.z - guard.position.z), dt * 4); else guard.rotation.y = angLerp(guard.rotation.y, 0, dt * 2);
    // guide beacon
    if (GUIDE) { barrow.position.y = 3.2 + Math.sin(t * 4) * 0.3; barrow.rotation.y = t * 2; if (Math.hypot(C.PL.x - OFF - GUIDE.x, C.PL.z - GUIDE.z) < 3) { C.toast(`✅ وصلت: ${GUIDE.n}`); C.sfx.coin(); GUIDE = null; beacon.visible = false; } }
    // products gently turn on their tables (not TVs/appliances)
    for (const q of PL3) if (['phones', 'computers', 'gaming'].includes(q.p.d) && q.p.k !== 'desktop') q.m.rotation.y = (q.base || 0) + Math.sin(t * 0.8 + q.x) * 0.5;
  }

  function interactables() {
    const L = [], o = OFF;
    L.push({ x: o + 24, z: 92, r: 4.5, label: '🏙️ ارجع للمدينة', act: C.goCity });
    L.push({ x: o - 15.5, z: -20, r: 3.5, label: '🗺️ الاستعلامات ودليل المول', act: openDirectory });
    L.push({ x: o + 16.5, z: -20, r: 3, label: '🗺️ دليل المول', act: openDirectory });
    for (const n of NPC) L.push({ x: n.ix !== undefined ? o + n.ix : n.k.position.x, z: n.iz !== undefined ? n.iz : n.k.position.z, r: 2.6, label: `💬 كلّم ${n.nm}`, act: () => SCRIPTS[n.id](n) });
    for (const q of PL3) L.push({ x: o + q.x, z: q.z, r: q.r, label: `🔍 ${q.p.n}`, act: () => openProduct(q.p.id) });
    for (const [x, z, n] of [[-29, -16, 'راية'], [29, -16, 'الفين'], [0, -36, 'السينما']]) L.push({ x: o + x, z, r: 4, label: `🚧 ${n}`, act: () => C.toast(`🚧 ${n} بيتجهز — هيفتح قريب في مول العرب!`) });
    L.push({ x: o - 34, z: -17.5, r: 3, label: '🍿 كشك الفشار', act: () => { C.sfx.pop(); C.toast('🍿 فشار سخن! (الكشك هيبيع قريب)'); } });
    L.push({ x: o + 34, z: -17.5, r: 3, label: '🍦 كشك الآيس كريم', act: () => { C.sfx.pop(); C.toast('🍦 آيس كريم بالفراولة! (الكشك هيبيع قريب)'); } });
    return L;
  }
  function goal() { const m = st(); return GUIDE ? `📍 رايح: ${GUIDE.n}<small>امشي ناحية العمود الأصفر</small>` : `🛍️ مول العرب<small>${m.cart.length ? `في السلة ${m.cart.length} · ادفع عند الكاشير` : 'ادخل بي تك أو دريم 2000 وافحص الأجهزة'}</small>`; }
  function drawMap(g, s) {
    g.fillStyle = '#7fd36a'; g.fillRect(-B * s, -B * s, 2 * B * s, 2 * B * s);
    g.fillStyle = '#5b5f74'; g.fillRect(-103 * s, 97 * s, 206 * s, 14 * s); g.fillRect(-103 * s, -107 * s, 206 * s, 14 * s); g.fillRect(-103 * s, -107 * s, 14 * s, 218 * s); g.fillRect(89 * s, -107 * s, 14 * s, 218 * s);
    g.fillStyle = '#f1d6f2'; g.fillRect(-70 * s, 2 * s, 140 * s, 96 * s);
    g.fillStyle = '#e9ddff'; g.fillRect(-52 * s, -66 * s, 104 * s, 78 * s);
    g.fillStyle = '#14161f'; g.fillRect(8 * s, -66 * s, 42 * s, 39 * s);
    g.fillStyle = '#2b2f37'; g.fillRect(-50 * s, -66 * s, 42 * s, 39 * s); g.fillStyle = '#8be000'; g.fillRect(-35 * s, -28 * s, 12 * s, 2 * s); g.fillStyle = '#c9c3dc'; g.fillRect(-50 * s, -13 * s, 42 * s, 25 * s); g.fillRect(8 * s, -13 * s, 42 * s, 25 * s);
    g.fillStyle = '#6fd6ff'; g.beginPath(); g.arc(0, -20 * s, 4 * s, 0, 7); g.arc(0, 42 * s, 4.5 * s, 0, 7); g.fill();
    if (GUIDE) { g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(GUIDE.x * s, GUIDE.z * s, 2.4 * s + 3, 0, 7); g.fill(); }
  }
  function onEnter() { welcomed = false; }
  function onLeave() { closeUI(); hud.classList.remove('on'); bagOff(); const k = C.getKid(); if (k) k.__mallBag = false; GUIDE = null; beacon.visible = false; }
  return { root, update, interactables, goal, drawMap, renderView, onEnter, onLeave, camBlock, get viewOn() { return VIEW.on; }, SPAWN: { x: OFF, z: 90, yaw: Math.PI }, B, OFF, PRODUCTS, openProduct, openCart, openDirectory };
}

// ---------------- 3D product models (voxel style, ~real proportions, 1 unit ≈ 0.65 m) ----------------
function makeScreens() {
  const mk = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  return {
    phone: mk(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#7a4dff'); gr.addColorStop(1, '#ff4fc8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const C2 = ['#ffd23f', '#2fc4ff', '#7cf04a', '#ff7a1a', '#ffffff', '#ff2d55']; for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) { g.fillStyle = C2[(x + y) % 6]; g.fillRect(6 + x * 14, 14 + y * 18, 10, 10); } g.fillStyle = '#ffffff'; g.fillRect(8, 112, 48, 4); }),
    laptop: mk(128, 80, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f7dff'); gr.addColorStop(1, '#b9a8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#5fd34a'; g.fillRect(0, 56, w, 24); g.fillStyle = '#ffd23f'; g.fillRect(90, 10, 16, 16); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 72, w, 8); }),
    tv: mk(160, 90, (g, w, h) => { g.fillStyle = '#63b8ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) g.fillRect(10 + i * 40, 12 + (i % 2) * 6, 22, 8); g.fillStyle = '#5fd34a'; g.fillRect(0, 60, w, 30); g.fillStyle = '#9a6a3e'; g.fillRect(0, 78, w, 12); g.fillStyle = '#ff4fc8'; g.fillRect(70, 44, 14, 16); g.fillStyle = '#ffd23f'; g.fillRect(120, 46, 10, 10); }),
    game: mk(128, 72, (g, w, h) => { g.fillStyle = '#1d2a5c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f'; for (let i = 0; i < 12; i++) g.fillRect((i * 37) % w, (i * 23) % 40, 2, 2); g.fillStyle = '#7a4dff'; g.fillRect(0, 50, w, 22); g.fillStyle = '#2fc4ff'; g.fillRect(50, 34, 16, 16); }),
  };
}
function productModel(p, TX) {
  const g = new THREE.Group(); const M = (c, e) => new THREE.MeshToonMaterial(Object.assign({ color: c }, e || {}));
  const box = (w, h, d, c, x = 0, y = 0, z = 0, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || M(c)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const scr = (tex, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const c = p.c;
  if (p.k === 'phone' || p.k === 'fold') {
    box(0.42, 0.06, 0.3, '#ffffff', 0, 0.03, 0); // stand
    const w = p.k === 'fold' ? 0.36 : 0.22, b = box(w, 0.44, 0.03, c, 0, 0.3, 0); b.rotation.x = -0.15; const s = scr(TX.phone, w - 0.03, 0.4, 0, 0.3, 0.017); s.rotation.x = -0.15; if (p.k === 'fold') box(0.01, 0.44, 0.032, '#c7cede', 0, 0.3, 0.001).rotation.x = -0.15; box(0.06, 0.06, 0.02, '#1d2030', w / 2 - 0.06, 0.45, -0.02);
  } else if (p.k === 'laptop') {
    box(0.86, 0.04, 0.56, c, 0, 0.02, 0); const lid = new THREE.Group(); lid.position.set(0, 0.04, -0.28); lid.rotation.x = -0.28; g.add(lid);
    const L = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.56, 0.03), M(c)); L.position.set(0, 0.28, 0); lid.add(L); const S = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.48), new THREE.MeshBasicMaterial({ map: TX.laptop, toneMapped: false })); S.position.set(0, 0.28, 0.017); lid.add(S);
    box(0.7, 0.01, 0.26, '#2b2f48', 0, 0.045, 0.02); if (p.rgb) { box(0.72, 0.012, 0.02, '#ff4fc8', 0, 0.05, -0.12, M('#ff4fc8', { emissive: '#ff4fc8', emissiveIntensity: 0.8 })); box(0.72, 0.012, 0.02, '#2fc4ff', 0, 0.05, 0.15, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.8 })); }
  } else if (p.k === 'desktop' || p.k === 'monitor') {
    const mx = p.k === 'desktop' ? 0.25 : 0; box(0.3, 0.04, 0.22, '#2b2f48', mx, 0.02, 0); box(0.06, 0.34, 0.06, '#2b2f48', mx, 0.2, -0.04); box(1.02, 0.6, 0.05, c, mx, 0.62, 0); scr(TX.laptop, 0.94, 0.52, mx, 0.62, 0.027);
    if (p.k === 'desktop') { box(0.3, 0.7, 0.66, '#1d2030', -0.55, 0.35, 0); box(0.02, 0.6, 0.02, '#ff4fc8', -0.39, 0.35, 0.33, M('#ff4fc8', { emissive: '#ff4fc8', emissiveIntensity: 0.9 })); box(0.6, 0.03, 0.2, '#2b2f48', mx, 0.015, 0.32); }
  } else if (p.k === 'keyboard') {
    box(0.8, 0.05, 0.28, c, -0.12, 0.025, 0); for (let i = 0; i < 5; i++) box(0.12, 0.012, 0.24, ['#ff2d55', '#ffc21a', '#7cf04a', '#2fc4ff', '#c05cff'][i], -0.44 + i * 0.16, 0.056, 0, M(['#ff2d55', '#ffc21a', '#7cf04a', '#2fc4ff', '#c05cff'][i], { emissive: ['#ff2d55', '#ffc21a', '#7cf04a', '#2fc4ff', '#c05cff'][i], emissiveIntensity: 0.6 }));
    box(0.12, 0.05, 0.2, c, 0.42, 0.025, 0.02); box(0.04, 0.01, 0.06, '#2fc4ff', 0.42, 0.055, -0.04, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.8 }));
  } else if (p.k === 'tv') {
    const s = p.size, h = s * 0.5625; box(s, h, 0.08, c, 0, h / 2 + 0.1, 0); scr(TX.tv, s - 0.1, h - 0.1, 0, h / 2 + 0.1, 0.045); box(s * 0.3, 0.04, 0.08, '#c7cede', 0, 0.06, 0.06);
  } else if (p.k === 'fridge') {
    box(1.4, 2.9, 1.0, c, 0, 1.45, 0); box(0.02, 2.8, 1.02, '#c7cede', 0, 1.45, 0.001); for (const x of [-0.08, 0.08]) box(0.05, 0.9, 0.08, '#8f96a8', x, 1.7, 0.53); box(0.32, 0.4, 0.02, '#1d2030', -0.38, 1.9, 0.51); box(0.2, 0.06, 0.03, '#2fc4ff', -0.38, 1.98, 0.525, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.8 }));
  } else if (p.k === 'washer') {
    box(1.1, 1.3, 1.0, c, 0, 0.65, 0); const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 24), M('#c7cede')); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.6, 0.5); g.add(ring); const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 24), M('#4fb8ff', { transparent: true, opacity: 0.8 })); gl.rotation.x = Math.PI / 2; gl.position.set(0, 0.6, 0.51); g.add(gl); box(1.0, 0.18, 0.03, '#e4e9f2', 0, 1.15, 0.5); box(0.12, 0.12, 0.04, '#7a4dff', 0.35, 1.15, 0.51);
  } else if (p.k === 'ac') {
    box(1.8, 0.55, 0.4, c, 0, 0, 0); box(1.6, 0.06, 0.02, '#c7cede', 0, -0.18, 0.21); box(1.6, 0.04, 0.02, '#c7cede', 0, -0.08, 0.21); box(0.12, 0.05, 0.02, '#2fc4ff', 0.7, 0.12, 0.21, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.9 }));
  } else if (p.k === 'microwave') {
    box(1.0, 0.6, 0.65, c, 0, 0.3, 0); box(0.62, 0.42, 0.02, '#1d2030', -0.13, 0.3, 0.33); box(0.5, 0.3, 0.02, '#ffd27a', -0.13, 0.3, 0.34, M('#ffd27a', { emissive: '#ffb31a', emissiveIntensity: 0.3 })); box(0.2, 0.42, 0.02, '#c7cede', 0.36, 0.3, 0.33); box(0.12, 0.05, 0.02, '#2fc4ff', 0.36, 0.45, 0.345, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.9 }));
  } else if (p.k === 'oven') {
    box(1.3, 1.3, 1.0, c, 0, 0.65, 0); box(1.0, 0.7, 0.02, '#1d2030', 0, 0.55, 0.51); box(0.8, 0.5, 0.02, '#ff9a4d', 0, 0.55, 0.52, M('#ff9a4d', { emissive: '#ff7a1a', emissiveIntensity: 0.25 })); box(0.9, 0.05, 0.08, '#8f96a8', 0, 0.98, 0.55); for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), M('#2b2f48')); k.rotation.x = Math.PI / 2; k.position.set(-0.45 + i * 0.3, 1.17, 0.52); g.add(k); }
  } else if (p.k === 'blender') {
    box(0.44, 0.34, 0.44, c, 0, 0.17, 0); const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.6, 16), M('#bff0ff', { transparent: true, opacity: 0.55 })); jar.position.set(0, 0.64, 0); g.add(jar); const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.3, 16), M('#ff4f7a')); juice.position.set(0, 0.5, 0); g.add(juice); box(0.42, 0.06, 0.42, '#2b2f48', 0, 0.97, 0);
  } else if (p.k === 'console') {
    box(0.26, 0.86, 0.7, c, 0, 0.45, 0); box(0.28, 0.86, 0.05, '#1d2030', 0, 0.45, 0); box(0.02, 0.7, 0.02, '#2fc4ff', 0.14, 0.45, 0.2, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 1 })); box(0.4, 0.04, 0.5, '#1d2030', 0, 0.02, 0);
  } else if (p.k === 'controller') {
    box(0.42, 0.08, 0.22, c, 0, 0.06, 0); for (const s of [-1, 1]) box(0.14, 0.08, 0.2, c, s * 0.2, 0.05, 0.08); for (const [x, col] of [[0.13, '#ff2d55'], [0.17, '#7cf04a'], [0.21, '#2fc4ff']]) box(0.03, 0.02, 0.03, col, x, 0.11, -0.02); box(0.06, 0.03, 0.06, '#1d2030', -0.14, 0.11, 0); box(0.06, 0.03, 0.06, '#1d2030', -0.06, 0.11, 0.05);
  } else if (p.k === 'headset') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20, Math.PI), M(c)); band.position.y = 0.3; g.add(band); for (const s of [-1, 1]) { box(0.08, 0.2, 0.18, c, s * 0.23, 0.26, 0); box(0.02, 0.12, 0.12, '#2fc4ff', s * 0.275, 0.26, 0, M('#2fc4ff', { emissive: '#2fc4ff', emissiveIntensity: 0.9 })); } box(0.3, 0.04, 0.2, '#ffffff', 0, 0.02, 0);
  } else if (p.k === 'charger') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 24), M(c)); pad.position.y = 0.02; g.add(pad); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 6, 24), M('#8be000', { emissive: '#8be000', emissiveIntensity: 1 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.045; g.add(ring);
    const ph = box(0.18, 0.012, 0.34, '#2b2f37', 0, 0.05, 0); ph.rotation.y = 0.3; box(0.5, 0.02, 0.02, '#ffffff', 0.32, 0.01, 0.05);
  } else if (p.k === 'speaker') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 20), M(c)); b.rotation.z = Math.PI / 2; b.position.y = 0.14; g.add(b); for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20), M('#2b2f37')); e.rotation.z = Math.PI / 2; e.position.set(sx * 0.22, 0.14, 0); g.add(e); }
    box(0.3, 0.16, 0.01, '#1d2030', 0, 0.14, 0.13); box(0.2, 0.02, 0.012, '#8be000', 0, 0.24, 0.125, M('#8be000', { emissive: '#8be000', emissiveIntensity: 0.9 }));
  } else if (p.k === 'watch') {
    box(0.08, 0.02, 0.5, c, 0, 0.01, 0); box(0.2, 0.06, 0.24, '#1d2030', 0, 0.05, 0); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshBasicMaterial({ map: TX.phone, toneMapped: false })); sc.rotation.x = -Math.PI / 2; sc.position.y = 0.081; g.add(sc); box(0.03, 0.04, 0.04, '#8f96a8', 0.11, 0.05, 0.03);
  } else if (p.k === 'case') {
    box(0.42, 0.06, 0.3, '#ffffff', 0, 0.03, 0); const cs = box(0.24, 0.46, 0.035, c, 0, 0.32, 0); cs.rotation.x = -0.15; const ch = box(0.08, 0.1, 0.02, '#1d2030', -0.06, 0.48, -0.03); ch.rotation.x = -0.15; box(0.05, 0.05, 0.02, '#ffd23f', 0.05, 0.25, 0.012).rotation.x = -0.15;
  } else if (p.k === 'powerbank') {
    box(0.22, 0.06, 0.38, c, 0, 0.03, 0); for (let i = 0; i < 4; i++) box(0.025, 0.012, 0.025, '#8be000', -0.05 + i * 0.035, 0.065, 0.14, M('#8be000', { emissive: '#8be000', emissiveIntensity: 1 })); box(0.08, 0.02, 0.012, '#8f96a8', 0, 0.03, -0.19);
  } else if (p.k === 'chair') {
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const leg = box(0.5, 0.06, 0.08, '#1d2030', Math.cos(a) * 0.25, 0.1, Math.sin(a) * 0.25); leg.rotation.y = -a; box(0.08, 0.08, 0.08, '#2b2f37', Math.cos(a) * 0.48, 0.04, Math.sin(a) * 0.48); }
    box(0.1, 0.5, 0.1, '#8f96a8', 0, 0.38, 0); box(0.75, 0.14, 0.7, '#1d2030', 0, 0.68, 0); box(0.6, 0.05, 0.55, c, 0, 0.76, 0.02);
    const back = new THREE.Group(); back.position.set(0, 0.75, -0.32); back.rotation.x = -0.15; g.add(back);
    for (const [w, h, y, z, col] of [[0.7, 1.15, 0.58, 0, '#1d2030'], [0.3, 0.95, 0.55, 0.06, c], [0.5, 0.16, 0.95, 0.08, '#2b2f37'], [0.36, 0.14, 0.25, 0.08, '#2b2f37']]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), M(col)); m.position.set(0, y, z); m.castShadow = true; back.add(m); }
    for (const sx of [-1, 1]) { box(0.08, 0.28, 0.08, '#2b2f37', sx * 0.38, 0.85, 0); box(0.12, 0.05, 0.4, '#1d2030', sx * 0.38, 1.0, 0.02); }
  }
  return g;
}
function drawShowcase(tex, t) {
  const c = tex.image, g = c.getContext('2d'), w = c.width, h = c.height; if (!g) return;
  const k = Math.floor(t * 6); if (tex.__k === k) return; tex.__k = k;
  const gr = g.createLinearGradient(0, 0, w, h); const hue = (t * 30) % 360; gr.addColorStop(0, `hsl(${hue},80%,55%)`); gr.addColorStop(1, `hsl(${(hue + 80) % 360},80%,55%)`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) { const x = ((t * 40 + i * 50) % (w + 40)) - 20; g.fillRect(x, 20 + (i % 3) * 30, 16, 16); }
  g.font = '900 26px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.direction = 'rtl'; g.fillText('أحدث الشاشات في بي تك', w / 2, h - 18);
}
function nameTag(t) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(40,10,100,.75)'; rr(g, 4, 6, 248, 52, 24); g.fill(); g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#fff'; g.fillText(t, 128, 33);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(1.6, 0.4, 1); s.renderOrder = 5; return s;
}
function bubbleSprite(t) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; rr(g, 4, 4, 504, 100, 30); g.fill(); g.beginPath(); g.moveTo(236, 100); g.lineTo(256, 124); g.lineTo(276, 100); g.fill(); g.lineWidth = 5; g.strokeStyle = '#a46cf5'; rr(g, 4, 4, 504, 100, 30); g.stroke();
  g.font = '900 30px Cairo, Tajawal, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = '#4a2386'; g.fillText(t, 256, 54, 480);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, toneMapped: false })); s.scale.set(3.4, 0.85, 1); s.renderOrder = 6; return s;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, t); }
