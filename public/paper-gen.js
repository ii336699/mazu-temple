/* 天后宮日報 — writes one day's newspaper from that day's numbers and events.
   Used by the server (src/worker.js builds yesterday's paper once a day) and by the single-player test page (demo data).
   Pure function, no network. Every story kind has several wordings; a seeded random pick per date plus a list of recently
   used wordings keeps it from repeating. Weather and the two "incidents" (a granny's heatstroke on a hot day, the fortune
   teller's stall blown away on a windy day) use the same formulas as the game (keep in sync with public/index.html). */

export const wxHash = n => { let t = (n * 2654435761 + 0x6D2B79F5) >>> 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const wxDay = d => { const u = wxHash(d * 7 + 3); return u < .4 ? "clear" : u < .6 ? "cloudy" : u < .75 ? "windy" : u < .9 ? "rain" : "storm"; };
/* the weather changes with the GAME day (24 real minutes, turning over at dawn), not the calendar day — keep in sync with index.html */
export const GD = 1440;
export const gDay = ms => Math.floor(ms / 1000 / GD + .08);
export const gStart = g => (g - .08) * GD * 1000;
export const wxG = g => wxDay(g * 3 + 1000003);
export const gRange = dn => { const s = dn * 864e5 - 8 * 3600e3; return [gDay(s), gDay(s + 864e5) - 1]; };
/* one word for a whole calendar day (for the paper): a stormy day if it stormed a few times, rainy if it rained a lot, else what it mostly was */
export const dayWx = dn => { const [a, b] = gRange(dn), n = {}; for (let g = a; g <= b; g++) { const k = wxG(g); n[k] = (n[k] || 0) + 1; }
  if ((n.storm || 0) >= 10) return "storm"; if ((n.rain || 0) + (n.storm || 0) >= 20) return "rain"; return Object.entries(n).sort((x, y) => y[1] - x[1])[0][0]; };
/* incidents still go by the calendar day: on a heat day one granny is off whenever it is sunny; on a stall day the stall blows away in the
   first windy spell after the afternoon hour, and stays gone till midnight */
export const evHeat = d => { const w = Math.floor((d + 4) / 7); return d === w * 7 - 4 + Math.floor(wxHash(w * 31 + 5) * 7); }; /* once a week */
export const stallHour = d => 12 + wxHash(d * 41 + 2) * 6;
export const stallG = d => { const [a, b] = gRange(d); for (let g = a; g <= b; g++) { if (((gStart(g) + 8 * 3600e3) % 864e5) / 36e5 < stallHour(d)) continue; if (wxG(g) === "windy") return g; } return null; };
export const evStall = d => { const w = Math.floor((d + 4) / 7); return d === w * 7 - 4 + Math.floor(wxHash(w * 37 + 9) * 7) && stallG(d) != null; }; /* once a week */
export const buskStayG = g => (wxG(g) === "rain" || wxG(g) === "storm") && wxHash(g * 41 + 7) < .28;
export const evBuskRain = d => { if (wxHash(d * 43 + 1) >= .4) return false; const [a, b] = gRange(d); for (let g = a; g <= b; g++) if (buskStayG(g)) return true; return false; };
export const dayNum = dateStr => Math.floor(Date.parse(dateStr + "T00:00:00Z") / 864e5);
const WXN = { clear: "晴", cloudy: "陰", windy: "風大", rain: "雨", storm: "雷雨" }, WXI = { clear: "☀️", cloudy: "☁️", windy: "🍃", rain: "🌧️", storm: "⛈️" };
const LB_NAME = { wenchang: "文昌帝君挑戰", tudi: "土地公挑戰", guanyin: "觀音菩薩挑戰", zhusheng: "註生娘娘挑戰", doumu: "斗姥元君挑戰", jiutian: "九天玄女挑戰", dizang: "地藏王挑戰" };
const NM_NAME = { qq: ["地瓜球攤", "最多讚", "下"], bbq: ["烤肉攤", "最快烤完", "秒"], fish: ["撈金魚攤", "撈金魚最高分", "幣"], pachinko: ["彈珠台", "最多彈珠", "顆"], boba: ["珍奶攤", "最快做完三杯", "秒"], balloon: ["射氣球攤", "最快全破", "秒"] };

/* wordings: {id, t: title, b: body}; {n} name, {v} number, {x} extra */
const T = {
  heat: [
    { id: "h1", t: "天后宮驚傳廟方人員中暑！", b: "昨日艷陽高照，金爐旁的收驚阿嬤之一疑似中暑，下午提早回家休息，只剩一位阿嬤撐場。廟方呼籲：大家記得多喝水，收驚也要排隊喝水。" },
    { id: "h2", t: "太陽太大 收驚阿嬤熱到請假", b: "據目擊香客表示，阿嬤一邊搧扇子一邊說「今天太熱了，阿嬤先回去吹電風扇」。收驚隊伍昨天一度排到金爐後面。" },
    { id: "h3", t: "熱浪來襲！金爐旁少了一位阿嬤", b: "昨天的太陽比金爐還燙，一位收驚阿嬤不敵高溫回家休息。另一位阿嬤表示：「她沒事啦，睡一覺就好，明天繼續收。」" },
  ],
  stall: [
    { id: "s1", t: "強風來襲 鐵口直斷攤位被吹走！", b: "昨日下午約 {x} 點，一陣怪風把鐵口直斷的攤位整個捲上天，老師傅只來得及抱住籤筒。目前攤位下落不明，老師傅摸著鬍子說：「我早就算到會有這麼一天。」今天只能休息一天了。" },
    { id: "s2", t: "算命攤飛了 老師傅：這也在我算中", b: "風大的一天，{x} 點左右鐵口直斷的攤子被風吹走，香客目擊攤位越過廟埕往天上飛。老師傅站在原地摸鬍子，淡淡地說：「我早就算到會有這麼一天。」只好休息一天。" },
    { id: "s3", t: "「我的攤子呢？」鐵口直斷攤位遭強風吹走", b: "昨天 {x} 點，廟埕刮起強風，鐵口直斷的整個攤子連同招牌飛走。老師傅事後只說了一句：「我早就算到會有這麼一天。」據悉他事前曾算出「今日不宜擺攤」，但自己沒有聽。" },
  ],
  storm: [
    { id: "w1", t: "雷雨夜！廟埕水花四濺", b: "昨天雷雨交加，貓咪全躲起來，收驚阿嬤和鐵口直斷也收攤回家。仍有 {v} 位香客撐著傘來拜拜，誠心可嘉。" },
    { id: "w2", t: "轟隆隆！天后宮雷雨一整天", b: "閃電照亮了正殿屋脊，雷聲大到連媽祖前的香都抖了一下。廟方提醒：雷雨天記得撐傘，不要站在旗桿旁邊。" },
  ],
  rain: [
    { id: "r1", t: "下雨天的天后宮", b: "昨天細雨綿綿，廟埕一片濕亮的倒影，香客撐著五顏六色的傘進廟。貓咪們全部躲雨去了，據說都擠在後殿屋簷下。" },
    { id: "r2", t: "雨中參拜 傘花朵朵開", b: "雨下了一整天，收驚阿嬤和鐵口直斷都回家躲雨，但香客熱情不減，共有 {v} 位冒雨前來。" },
  ],
  windy: [
    { id: "f1", t: "風大！櫻花瓣滿天飛", b: "昨天風很大，園區外的櫻花瓣一路飄進廟埕，還有香客看到報紙從天上飛過去。（不是本報。）" },
  ],
  record: [
    { id: "k1", t: "{n} 刷新{x}紀錄！", b: "{n} 昨天在{x}拿下第一名，成績 {v}，把原本的紀錄保持者擠了下來。本報記者趕到時，{n} 只淡淡地說：「運氣好啦。」" },
    { id: "k2", t: "新紀錄誕生：{x}由 {n} 稱王", b: "{x}排行榜昨天換人了！{n} 以 {v} 的成績登上榜首，現場香客掌聲不斷。下一個挑戰者是你嗎？" },
    { id: "k3", t: "{n} 一戰成名", b: "昨天{x}出現驚人成績：{v}！{n} 創下新紀錄，據說連土地公都探出頭來看。" },
  ],
  pkBroke: [
    { id: "p1", t: "彈珠台老闆差點破產！", b: "昨天香客們在彈珠台一共換走 {v} 平安幣，老闆一邊數錢一邊擦汗：「再這樣下去我要去跟財神爺借錢了。」{x}" },
    { id: "p2", t: "彈珠台大失血 老闆：今天先休息", b: "彈珠台昨天被香客打到吐出 {v} 平安幣，老闆表示珠子太會跑、倍率太好心，「明天要把釘子調一調」。{x}" },
  ],
  buskRain: [
    { id: "r1", t: "街頭藝人雨中深情開唱", b: "昨天大雨，廟口攤販早早收攤，只有玖玖沒走。他站在雨裡一首接一首地唱，墨鏡上全是水。知情人士透露：玖玖最近失戀了，「有些歌，只能在下雨天唱。」唱到〈{x}〉時，好幾位香客偷偷擦眼睛。" },
    { id: "r2", t: "雨再大也不收攤 玖玖淋雨唱到最後一首", b: "雨下了一整天，玖玖的吉他卻沒停過。他說：「她說過最喜歡雨天的我。」據說那是一段剛結束的感情。撐傘停下來聽的香客，最後都陪他唱完〈{x}〉。" },
    { id: "r3", t: "失戀的人不怕雨？玖玖雨中獨唱", b: "昨天廟口一片雨聲，玖玖沒穿雨衣、沒撐傘，對著空蕩蕩的廣場唱情歌。路過的阿嬤搖頭說：「少年仔一定是被甩了。」玖玖唱完〈{x}〉，只回了一句：「雨停就好了。」" },
  ],
  buskTop: [
    { id: "k1", t: "玖玖點播榜出爐 〈{x}〉奪冠！", b: "街頭藝人玖玖昨天的歌，以〈{x}〉最受歡迎，香客們一共聽了 {v} 次。{y}玖玖戴著墨鏡淡淡地說：「謝謝大家，今天也會繼續唱。」" },
    { id: "k2", t: "廣場最紅的歌 〈{x}〉聽了 {v} 次", b: "廟口的吉他聲又圈粉了！昨天被聽最多次的是〈{x}〉，共 {v} 次。{y}有香客說聽完就忘不了，一路哼回家。" },
    { id: "k3", t: "玖玖本日冠軍曲：〈{x}〉", b: "根據本報統計，〈{x}〉昨天被聽了 {v} 次，穩坐第一。{y}玖玖表示：「下一首，獻給還在排隊收驚的朋友。」" },
  ],
  buskTip: [
    { id: "m1", t: "玖玖昨天收到 {v} 平安幣打賞", b: "街頭藝人玖玖的吉他盒昨天進帳 {v} 平安幣。{x}玖玖一一喊名字道謝：「謝謝你！愛你！」" },
    { id: "m2", t: "打賞不手軟 玖玖笑到墨鏡都歪了", b: "昨天香客們一共打賞玖玖 {v} 平安幣。{x}據說玖玖收攤時多唱了一首當作回禮。" },
  ],
  buskCheer: [
    { id: "n1", t: "玖玖應援團成軍！{v} 人次到場跳舞", b: "昨天有 {v} 人次跑到玖玖身邊跳舞應援，{n} 最熱情。跳完的人都說：幸福感 UP！" },
  ],
  pkWin: [
    { id: "q1", t: "彈珠台老闆笑呵呵", b: "昨天香客們買了 {v} 顆彈珠，換回的平安幣不到一半，老闆心情大好，還請隔壁攤吃地瓜球。" },
  ],
  tudi: [
    { id: "t1", t: "{n} 在土地公那裡挖到 500 平安幣！", b: "福德正神顯靈！{n} 昨天在土地公旁挖寶，一鏟下去挖出一大袋平安幣。旁邊挖到臭襪子的香客表示羨慕。" },
    { id: "t2", t: "土地公發大財 {n} 中頭獎", b: "只有 5% 機會的大袋平安幣昨天被 {n} 挖到了！{n} 表示：「我只是隨便挖挖。」" },
  ],
  pious: [
    { id: "v1", t: "最虔誠香客：{n} 一天拜了 {v} 次", b: "{n} 昨天一共參拜 {v} 次，是全廟最勤快的香客。廟方特別感謝，並提醒拜完記得插香。" },
    { id: "v2", t: "{n} 拜好拜滿 {v} 次", b: "據本報統計，{n} 昨天參拜了 {v} 次，膝蓋應該很需要休息。" },
  ],
  jiao: [
    { id: "j1", t: "{n} 昨天擲筊 {v} 次", b: "擲筊冠軍是 {n}，一天擲了 {v} 次。媽祖到底答應了沒，只有 {n} 自己知道。" },
  ],
  online: [
    { id: "o1", t: "最長待在廟裡：{n}", b: "{n} 昨天在天后宮待了 {v} 分鐘，幾乎把廟當家。廟方表示：歡迎，但記得回家吃飯。" },
  ],
  zen: [
    { id: "z1", t: "禪院最靜的人：{n}", b: "{n} 昨天在靜思禪院坐了 {v} 分鐘，心如止水。據說連禪院外的樹都不太敢搖。" },
  ],
  sleep: [
    { id: "e1", t: "禪房通鋪大爆滿", b: "昨天一共有 {v} 人次在禪房通鋪鋪床睡覺，櫃台阿姨洗床單洗到手軟。最愛睡的是 {n}。" },
  ],
  wishes: [
    { id: "x1", t: "昨天許願卡 {v} 張", b: "許願樹上又多了 {v} 張卡。本報摘錄一則：「{x}」" },
    { id: "x2", t: "許願樹又重了一點", b: "昨天有 {v} 位香客掛上許願卡，其中一張寫著：「{x}」。願媽祖保佑大家心想事成。" },
  ],
  calm: [
    { id: "c1", t: "平靜的一天", b: "昨天天后宮風平浪靜，香客 {v} 位，香火裊裊。本報記者在廟埕晃了一整天，只看到貓咪在跳舞。" },
    { id: "c2", t: "廟裡一切安好", b: "昨天沒有大新聞，就是最好的新聞。共有 {v} 位香客來參拜，祝大家平安。" },
  ],
};
/* copy for the ten engraving-style ad pictures (ads/b01–b10.webp, in this order) */
const BADS = [["跪太久？痠痛貼布", "拜拜擲筊一整天，腰酸背痛貼一片。媽祖前跪得久，回家睡得好。"], ["廟後良田出售", "背山面水，香火加持，風水師看過都說好。意者洽廟口阿伯。"],
  ["廟口新公寓招租", "下樓就是廟埕，早上聞香、晚上看煙火，生活機能一級棒。"], ["涼風牌電風扇", "金爐旁也不怕熱，連收驚阿嬤都說讚。三段風速，靜音好眠。"],
  ["桃花乳霜", "月老前擦一擦，桃花朵朵開。限量供應，售完為止。"], ["平安騎士機車行", "新車交車免費過爐，平安符貼好貼滿，騎得穩心也穩。"],
  ["小幽靈電視台", "禪房套房獨家播出，小幽靈天天陪你看星星、吃糰子。"], ["一針一線縫平安", "平安符袋、香包、廟會旗，手工縫製，接受訂做。"],
  ["廟口透天老屋", "一樓可開香舖、二樓可住人，祖傳好地段，誠可議。"], ["十全大補湯", "斬完小人補元氣，熬夜看煙火也不怕。老店傳承三代。"]];
const ADS = [
  { t: "禪房開幕！", b: "一樓日式溫泉・榻榻米通鋪，二樓套房可鎖門。櫃台阿姨親切服務。" },
  { t: "夜市攤位招商中", b: "地瓜球、烤肉、撈金魚、彈珠台⋯⋯請洽主委。" },
  { t: "土地公挖寶", b: "每天三次，5% 機會挖到大袋平安幣！臭襪子不退換。" },
  { t: "靜思禪院", b: "五十個蒲團，自選音樂，雙指滑動就能看更廣。" },
  { t: "鐵口直斷", b: "老師傅坐鎮金爐旁，不準不收錢（其實本來就不收錢）。" },
  { t: "收驚服務", b: "金爐旁兩位阿嬤，排隊就有，雨天公休。" },
  { t: "許願樹", b: "寫下心願掛上樹，讓大家一起祝福你。" },
  { t: "彈珠台", b: "一顆一塊，打到賺到。每天最多換 1000 幣。" },
];

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fill = (s, o) => s.replace(/\{(\w)\}/g, (_, k) => o[k] != null ? String(o[k]) : "");

/* data: { d:"YYYY-MM-DD", st:{c,mx,p}, ev:[{k,n,v,g,at}], wishes:[{name,text}], used:[ids], no } */
export function buildPaper(data) {
  const d = data.d, dn = dayNum(d), R = rng(dn * 9973 + 17 + (data.seed || 0)), F = new Set(data.force || []), /* force: test-only story kinds (heat, stall, storm, rain) */ used = new Set(data.used || []), st = data.st || { c: {}, mx: {}, p: {} }, c = st.c || {}, mx = st.mx || {}, P = st.p || {}, ev = data.ev || [];
  const pickT = kind => { const L = T[kind], fresh = L.filter(x => !used.has(x.id)), pool = fresh.length ? fresh : L, x = pool[Math.floor(R() * pool.length)]; used.add(x.id); return x; };
  const stories = []; const add = (kind, pri, o, tag, art) => { const w = pickT(kind); stories.push({ pri: pri + R() * 5, tag, art, t: fill(w.t, o), b: fill(w.b, o), id: w.id, kind, who: o.n || "" }); };
  /* people: the paper uses what players saw on screen (real players plus the temple's regulars), so the numbers match what everyone remembers;
     visits ≈ the hourly peaks added up (people stay a while), never fewer than the real visitors, and capped so a busy day cannot run away */
  let shownSum = 0; for (let h = 0; h < 24; h++) shownSum += mx["s" + String(h).padStart(2, "0")] || 0;
  const wx = dayWx(dn), visitors = Math.max(c.visitors || 0, Math.min(Math.round(shownSum * 1.3), (c.visitors || 0) * 3 + 400)), peakShown = Math.max(mx.sp || 0, mx.peak || 0);
  const top = key => { let best = null; for (const [id, e] of Object.entries(P)) { const v = e.c && e.c[key] || 0; if (v > 0 && (!best || v > best.v)) best = { id, n: e.n || "香客", v }; } return best; };
  /* incidents and weather */
  const heat = evHeat(dn) || F.has("heat"), stall = evStall(dn) || F.has("stall"), wxF = F.has("storm") ? "storm" : F.has("rain") ? "rain" : F.has("clear") ? "clear" : wx;
  if (heat) add("heat", 95, {}, "社會", "🥵");
  if (stall) { const sg = stallG(dn); add("stall", 96, { x: sg != null ? Math.floor(((gStart(sg) + 8 * 3600e3) % 864e5) / 36e5) : Math.floor(stallHour(dn)) }, "社會", "🌪️"); }
  if (wxF === "storm") add("storm", 60, { v: visitors }, "天氣", "⛈️"); else if (wxF === "rain") add("rain", 45, { v: visitors }, "天氣", "🌧️"); else if (wxF === "windy" && !stall) add("windy", 35, {}, "天氣", "🍃");
  /* records */
  const recs = ev.filter(e => e.k === "lb" || e.k === "nm"); const seenRec = new Set();
  for (const e of recs.slice().reverse()) { const key = e.k + e.g; if (seenRec.has(key)) continue; seenRec.add(key);
    const x = e.k === "lb" ? LB_NAME[e.g] || "小遊戲" : (NM_NAME[e.g] ? NM_NAME[e.g][0] + "「" + NM_NAME[e.g][1] + "」" : "夜市");
    const v = e.k === "lb" ? (e.g === "wenchang" ? e.v + " 分" : (e.v / 1000).toFixed(1) + " 秒") : e.v + " " + (NM_NAME[e.g] ? NM_NAME[e.g][2] : "");
    add("record", 80, { n: e.n, x, v }, "遊戲", "🏆"); }
  /* night market: the pachinko owner's day */
  const pkCash = c.pkCash || 0, pkBuy = c.pkBuy || 0;
  if (pkCash >= 300 && pkCash > pkBuy * .85) { const w = top("pkCash"); add("pkBroke", 82, { v: pkCash, x: w ? `其中 ${w.n} 一個人就換走 ${w.v} 幣。` : "" }, "夜市", "⚪"); }
  else if (pkBuy >= 300 && pkCash < pkBuy * .5) add("pkWin", 40, { v: pkBuy }, "夜市", "⚪");
  if (evBuskRain(dn) || F.has("buskrain")) { const BN0 = ["記得我忘記", "慢慢欣賞", "妳沒有說", "撲火", "晚安以前", "那個我", "城市停電了"]; add("buskRain", 88, { x: BN0[Math.floor(R() * BN0.length)] }, "娛樂", "🎸"); }
  /* 玖玖: the most-heard song, tips, the cheering crowd */
  { const BN = ["記得我忘記", "慢慢欣賞", "可鹽可甜", "妳沒有說", "龜毛先生", "詩情難忘", "一個人的旅程", "禁止正常", "撲火", "晚安以前", "那個我", "城市停電了"];
    const L = BN.map((n, i) => [n, c["bk" + String(i + 1).padStart(2, "0")] || 0]).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
    if (L.length && L[0][1] >= 3) add("buskTop", 58, { x: L[0][0], v: L[0][1], y: L[1] ? `第二名是〈${L[1][0]}〉（${L[1][1]} 次）${L[2] ? `，第三名〈${L[2][0]}〉` : ""}。` : "" }, "娛樂", "🎸");
    const tc = c.buskTipC || 0; if (tc >= 100) { const w = top("buskTipC"); add("buskTip", 50, { v: tc, x: w ? `最大方的是 ${w.n}，一個人就打賞了 ${w.v} 幣。` : "" }, "娛樂", "🎸"); }
    const ch = c.buskCheer || 0; if (ch >= 3) { const w = top("buskCheer"); add("buskCheer", 40, { v: ch, n: w ? w.n : "神秘香客" }, "娛樂", "💗"); } }
  /* lucky diggers */
  const big = ev.filter(e => e.k === "tudi500"); if (big.length) add("tudi", 70, { n: big[big.length - 1].n }, "福氣", "💰");
  /* people */
  const pb = top("b_bowBtn"); if (pb && pb.v >= 5) add("pious", 52, pb, "人物", "🙏");
  const pj = top("b_jiaoBtn"); if (pj && pj.v >= 5) add("jiao", 46, pj, "人物", "🌙");
  const po = top("minOnline"); if (po && po.v >= 30) add("online", 44, po, "人物", "⏰");
  const pz = top("minZen"); if (pz && pz.v >= 5) add("zen", 42, pz, "人物", "🧘");
  if ((c.sit_futon || 0) >= 3) { const s = top("sit_futon"); add("sleep", 38, { v: c.sit_futon, n: s ? s.n : "神秘人" }, "生活", "🛏️"); }
  const ws = data.wishes || []; if (ws.length) { const w = ws[Math.floor(R() * ws.length)]; add("wishes", 36, { v: ws.length, x: w.text }, "許願", "🎋"); }
  if (stories.length < 2) add("calm", 20, { v: visitors }, "廟務", "🏮");
  stories.sort((a, b) => b.pri - a.pri);
  const head = stories[0], items = stories.slice(1, 6);
  /* ads: one illustrated poster (ads/pNN.webp, the chair's) and one old-style engraving with our own copy (ads/bNN.webp), plus a small text ad */
  const pi = 1 + Math.floor(R() * 10), bi = Math.floor(R() * BADS.length), ti = Math.floor(R() * ADS.length);
  const ads = [{ img: `ads/p${String(pi).padStart(2, "0")}.webp`, poster: 1 }, { img: `ads/b${String(bi + 1).padStart(2, "0")}.webp`, t: BADS[bi][0], b: BADS[bi][1] }, ADS[ti]];
  const hrs = []; for (let h = 0; h < 24; h++) { const k = String(h).padStart(2, "0"); hrs.push(Math.max(mx["s" + k] || 0, mx["h" + k] || 0)); } const hm = Math.max(...hrs);
  /* the temple's regulars (the people on screen who are not real players) pray too: their share is estimated from how many of them were
     shown each hour, so a busy-looking day never reports only a handful of bows */
  let regH = 0; for (let h = 0; h < 24; h++) { const k = String(h).padStart(2, "0"); regH += Math.max(0, (mx["s" + k] || 0) - (mx["h" + k] || 0)); }
  const reg = rate => Math.round(regH * rate * (.85 + R() * .3));
  const box = [["香客人次", visitors], ["最高同時在線", peakShown], ["參拜", (c.b_bowBtn || 0) + reg(2.4)], ["擲筊", (c.b_jiaoBtn || 0) + reg(1.1)], ["求籤", (c.b_lotBtn || 0) + reg(.5)], ["許願", (c.wish || ws.length || 0) + reg(.08)]];
  const today = dn + 1, fc = dayWx(today);
  return { v: 1, d, no: data.no || 1, wx, wxn: WXN[wx], wxi: WXI[wx], fc, fcn: WXN[fc], fci: WXI[fc], busyHour: hm > 0 ? hrs.indexOf(hm) : -1,
    head: { t: head.t, b: head.b, tag: head.tag, art: head.art, kind: head.kind, who: head.who }, items: items.map(s => ({ t: s.t, b: s.b, tag: s.tag, art: s.art, kind: s.kind, who: s.who })),
    box, ads, used: [...used].slice(-80) };
}
