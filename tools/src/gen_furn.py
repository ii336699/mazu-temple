import json
C=json.load(open('/home/claude/mazu-temple/public/room/f/catalog.json'))
N={
"bed":"泡麵床 馬桶床 棺材床 蝦壽司床 香蕉床 柴犬床 元寶床 街機床 原木單人床 花漾白床 藤編床 黑鐵木床 中式紅木床 青苔石床 星月床 貓咪床",
"chair":"原木椅 圓木椅 白漆雕花椅 溫莎椅 鑄鐵咖啡椅 藤編扶手椅 綠格紋軟墊椅 小花椅 松木椅 藍格坐墊白椅 樹枝椅 黑鐵藤編椅 白墊藤椅 粉紅皮椅 宮廷椅 和風座椅 直背木椅 深色溫莎椅 奶油雕花椅 紅格坐墊木椅 課桌椅 白色殼椅 墨綠絨布椅 美式餐廳椅",
"table":"原木方桌 粉紅桌巾圓桌 樹樁桌 玫瑰雕花桌 白色矮桌 愛心花邊桌 蘑菇桌 厚實工作桌 竹編桌 雲朵桌 貝殼珊瑚桌 工業風木桌 檸檬桌 大理石宮廷桌 石雕圓桌 美式餐廳桌 黑大理石金腳桌 粉紅玻璃圓桌 白色豆豆桌 中式方桌 愛心公主桌 鐵架推車桌 六角金架桌 炫彩果凍桌",
"cabinet":"綠藤白衣櫃 和風格子櫃 星夜窗簾櫃 森林精靈櫃 古典雕花衣櫃 鐵皮置物櫃 中式紅漆櫃 草莓蛋糕櫃 城堡木門櫃 白色鏡面衣櫃 海洋貝殼櫃 竹屋櫃 工業風展示櫃 紫色棺材櫃 廟會攤車櫃 彩虹雲朵櫃 原木衣櫃 奶油花卉衣櫃 中式紅木櫃 橘貓衣櫃 櫻花矮櫃 灰色鐵櫃 星月衣櫃 百葉矮櫃",
"appl":"貓掌咖啡機 貓咪電子鍋 氣炸鍋 飲水機 復古電暖器 香氛水氧機 貓咪掃地機器人 掌上遊戲機 映像管電視 液晶電視櫃 大型街機 冰箱 洗衣機 冷氣機 電風扇 微波爐",
"misc":"報紙床 紙箱桌 垃圾袋沙發 塑膠籃置物架 水桶椅 輪胎桌 塑膠袋燈 舊布門簾",
"plant":"繡球花 紅玫瑰 百合 向日葵 櫻花盆景 紫藤花架 牡丹 荷花缽 楓葉盆景 仙人掌 蝴蝶蘭 開運竹 紫藤盆景 多肉玻璃屋 苔球蕨 燈籠果",
"deco":"水母水晶球 藍水晶 寶箱 麥克風獎座 場記板獎座 遊戲手把獎座 泡麵擺飾 摩天輪 小盆栽 書本書擋 布罩檯燈 手提唱片機 茶壺組 蘑菇玻璃罩 香氛蠟燭 小花瓶 玫瑰蠟燭 骷髏書擋 暗色提燈 黑盆黃金葛 紫水晶 紫沙漏 星象儀 小香爐 金環雕塑 擴香瓶 黑金地球儀 相框與盆栽 威士忌酒組 相機與書 翻頁鐘 飛機模型 留聲機 雪屋水晶球 達摩不倒翁 鳥籠 禮物盒 青瓷香爐 生態瓶 月兔燈 櫻花小盆景 招財貓 古董地球儀 木沙漏 金魚缸 信件盒 和紙燈籠 書上睡貓",
"curtain":"碎花蕾絲窗簾 星月深藍窗簾 中式紅金窗簾 龜背葉窗簾 紫藤窗簾 北歐馴鹿窗簾 黑金絲絨窗簾 粉格雲朵窗簾 紅絲絨窗簾 玫瑰蕾絲窗簾 夜空窗簾 竹葉米色窗簾 貓掌粉格窗簾 紫櫻和風窗簾 扶桑花窗簾 深灰素面窗簾 米白蝴蝶結窗簾 皇冠紅絨窗簾 粉格荷葉邊窗簾 小花綠結窗簾 淺灰素面窗簾 編織流蘇窗簾 紫色星月窗簾 海洋貝殼窗簾",
"wall":"彩繪玻璃蝴蝶 閃電霓虹燈 太陽臉掛飾 咕咕鐘 編織掛毯 嘉年華面具 編織圓盤 水晶壁燈 古董掛鐘 青花瓷盤 農家斗笠籃 獅頭門環 金框鏡子 鑰匙掛架 鹿頭骨掛飾 壁掛小書架 衣帽掛架 紙燈籠壁燈 編織吊盆 咖啡店招牌 紅色信箱 民族風掛毯 鯉魚木雕 星球風鈴",
"pic":"冒險電影海報 星夜 神奈川沖浪裏 黑白電影海報 太空電影海報 普普風肖像 古地圖 台北風景畫"}
N={k:v.split() for k,v in N.items()}
HIDE={"pic01","pic04","pic05","pic06","cabinet04"}
PR={"bed":(2500,4500),"chair":(600,1500),"table":(800,2000),"cabinet":(2500,5000),"appl":(800,4000),"misc":(500,500),"plant":(600,1200),"deco":(400,900),"curtain":(1200,2000),"wall":(800,1800),"pic":(1500,1500)}
APPL_H=[.42,.3,.36,1.05,.5,.32,.12,.24,.62,1.05,1.7,1.7,.9,.32,1.0,.34]
MISC=[("L",1.9),("L",1.0),("L",1.1),("h",1.5),("h",.8),("L",.85),("h",.45),("h",1.7)]
def size(cat,i,d):
    dx,dy,dz=d
    if cat=="bed": k=(2.1 if i<8 else 2.0)/max(dx,dz)
    elif cat=="chair": k=(.55 if i==15 else .9)/dy
    elif cat=="table": k=1.1/max(dx,dz)
    elif cat=="cabinet": k=(1.0 if i in(20,23) else 1.9)/dy
    elif cat=="appl": k=APPL_H[i]/dy
    elif cat=="misc": a,v=MISC[i]; k=v/(dy if a=="h" else max(dx,dz))
    elif cat=="plant": k=(.9 if i in(5,12) else .7)/dy
    elif cat=="deco": k=.34/max(d)
    elif cat=="curtain": k=1.7/dx
    elif cat=="wall": k=(.8 if i in(4,15,21) else .7)/max(dx,dy)
    elif cat=="pic": k=.8/max(dx,dy)
    return [round(v*k,2) for v in d]
def src(cat,i):
    n=i+1
    if cat=="bed": return "f" if n<=8 else "b"
    if cat=="chair": return "g" if n in(8,24) else "b"
    if cat=="table": return "g" if n in(7,13,24) else "b"
    if cat=="cabinet": return "b"
    if cat=="appl": return "c" if n<=8 else "b"
    if cat=="misc": return "c"
    if cat=="plant": return "b" if n<=8 else "q"
    if cat=="deco": return "c" if n<=8 or 33<=n<=40 else ("q" if 17<=n<=24 or n>=41 else "b")
    if cat=="curtain": return "q" if 9<=n<=16 else "b"
    if cat=="wall": return "q" if n<=8 else "b"
    if cat=="pic": return "g"
out=[]; cnt={}
for it in C["items"]:
    cat=it["cat"]; i=int(it["id"][len(cat):])-1; w,h,d=size(cat,i,it["dims"]); lo,hi=PR[cat]; fr=((i*37+11)%17)/16; p=int(round((lo+(hi-lo)*fr)/100)*100); s=src(cat,i)
    fl=""
    if cat in("curtain","wall","pic") or it["id"]=="appl14": fl+="w"
    if cat in("deco","plant") or it["id"] in("appl01","appl02","appl03","appl05","appl06","appl08","appl09","appl16","misc07"): fl+="s"
    sup=0
    if "s" not in fl and "w" not in fl and h<=1.3 and (cat in("table","cabinet") or it["id"] in("appl13","misc02","misc06")): sup=h
    if it["id"] in HIDE: fl+="x"
    out.append("|".join([it["id"],N[cat][i],str(w),str(h),str(d),str(p),s,fl,str(sup)])); cnt[s]=cnt.get(s,0)+(0 if "x" in fl else 1)
open('furn_data.txt','w').write(";".join(out)); print(len(out),cnt,len(";".join(out)))
print(out[0],out[40],out[100])
