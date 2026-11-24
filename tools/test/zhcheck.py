#!/usr/bin/env python3
"""主委規定：遊戲裡不能有簡體字或對岸用語。
用法: python3 tools/test/zhcheck.py [public/index.html]
需要: pip install opencc-python-reimplemented
聊天過濾的禁字表（FUZZY / BLOCK）刻意含簡體，會跳過。"""
import re,sys
from opencc import OpenCC
cc=OpenCC('s2t')
# 台灣正常用字，OpenCC 會誤判的
OK=set("后吃台斗丑床游凶秘里群伙干虱托范温杰赖洒于咨栗唇痴划岩")
WORDS="""視頻 音頻 質量 信息 軟件 硬件 屏幕 默認 登陸 用戶 網絡 點擊 激活 博客 數據 鏈接 帖子 反饋 加載 緩存 服務器 鼠標 公交 地鐵 短信 二維碼 掃碼 硬盤 內存 充值 點贊 博主 給力 靠譜 小夥伴 小伙伴 老鐵 西紅柿 酸奶 菠蘿 獼猴桃 牛油果 三文魚 金槍魚 奶酪 芝士 薯片 盒飯 快餐 方便面 圓珠筆 塑料 出租車 的士 自行車 打印 文件夾 搜索 窗口 存儲 截屏 卸載 賬號 注冊 兼容 交互 字符 寬帶 網吧 顏值 高大上 接地氣 正能量 硬核 內卷 吃貨 學霸 土豪 心塞 立馬 鬧心 閨蜜 在線 早上好 外賣 冰激凌 搞定 咋 咱 甭 唄""".split()
p=sys.argv[1] if len(sys.argv)>1 else "public/index.html"
bad=0; skip=False
for i,l in enumerate(open(p,encoding='utf8'),1):
    if 'const FUZZY=' in l or 'const BLOCK=' in l: skip=True
    if skip:
        if l.startswith('const ALLOW='): skip=False
        continue
    for ch in set(re.findall(r'[一-鿿]',l)):
        if ch not in OK and cc.convert(ch)!=ch:
            print(f"{i}: 簡體字「{ch}」"); bad+=1
    for w in WORDS:
        if (w!="在線" and w in l) or (w=="在線" and re.search("在線(?!上)",l)): print(f"{i}: 對岸用語「{w}」"); bad+=1
print("OK，沒有簡體字或對岸用語" if not bad else f"共 {bad} 處要改"); sys.exit(1 if bad else 0)
