# 雲端天后宮：交接說明（2026-11-04）

給接手的帳號：**先讀 `START-HERE.md`（11/06 最新懶人包）**，再讀完這份，再動程式。

## 1. 主委（使用者）的規則

- 一律用**繁體中文**、白話回覆。
- **每個修改先做進「單機測試版」**給主委試，主委說「部署／佈署」才推上正式版。
- **不要重新設計主委自己給的美術和模型**（可以減面、上色，不能改造型）。
- 主委很在意「畫面有沒有變」：任何優化都要先給**改前改後同角度對照圖**，動作類要錄影；不可以說「差不多」卻沒驗證。
- 主委密碼存在 Cloudflare Secrets Store（`ADMIN_KEY` / `mazu_admin_key`），**任何地方都不要寫出密碼本身**。

## 2. 程式在哪

| 項目 | 內容 |
|---|---|
| 倉庫 | GitHub `ii336699/mazu-temple` |
| 開發分支 | `audio-fix`（所有新修改） |
| 正式版 | `main`，目前 `09aa703`（11/04 12:30）：d940dcb 再加上主委挑選的部分更新——飛行、移動速度、財神爺與撒紅包、贊助牆 28 塊（WebP、無探照燈）。其他測試版內容都還沒上。 |
| 備份分支 | `backup-live-20261103`（正式版）、`backup-test-20261103` |
| 遊戲本體 | `public/index.html`（單一檔案，three.js r128 + GLTFLoader + meshopt） |
| 伺服器 | `src/worker.js`（Cloudflare Worker，Durable Objects：Hall／Lobby；/layout、/hongbao、/wish 等） |
| 部署設定 | `wrangler.jsonc`，只發佈 `public/` |
| 工具 | `tools/test`（測試版建置與自動測試）、`tools/models`（模型切割、上色、減面） |
| 主委建築配置 | 已寫進 index.html 的 `BUILD_DEFAULT`；原始碼存 `tools/layout_u1.json` |

**部署方式**（只在主委說「部署」時）。注意：`main` 的 09aa703 是另外從舊版移植的分支，已用 `merge -s ours` 記錄進 audio-fix，所以 audio-fix 仍然包含 main，下面的指令照樣可用：
`git fetch origin main && git merge-base --is-ancestor origin/main audio-fix && git push origin audio-fix:main`，再看 GitHub 的檢查結果（Cloudflare 會自動部署）。

## 3. 測試版怎麼做

1. `MZ_WORK=~/mz-work python3 tools/test/build_test.py` → 產生 `~/mz-work/test/index.html`（給 claude.ai 發佈成 artifact）和 `~/mz-work/hook/index.html`（本機測試用，多了 `__me/__mz/__scene/__lp/__build…` 等除錯掛鉤）。
2. 測試頁不能讀 .glb，每個模型要另外有 `名稱-model.js`：`python3 tools/test/make_model_js.py ~/mz-work/test`；贊助看板 `thanks*.webp`、`nm/` 圖片也要一起發佈。
3. 本機自動測試：`cd ~/mz-work/hook && python3 -m http.server 8765`，再跑 `tools/test/*.py <工作資料夾>`（Playwright + Chrome swiftshader，很慢，等待時間要長）。`act_test.py` 裡的 `LOCAL` 需要本機的 three.js r128 檔案。
   - `err2.py`：頁面錯誤；`cam2.py`：固定鏡頭截圖；`bench.py`：效能基準（五個場景、夜晚）；`calls.py`：繪製次數分類；`zscan2.py`：找會閃爍的重疊面；`rear6.py`：自動走路路線。
4. 測試版（舊帳號的 artifact）是私人的；新帳號要自己重新發佈一個測試頁。

## 4. 一定要知道的坑

- **單行註解**：index.html 很多地方一行很長，行中插 `//` 會把後半行註解掉（已經害過三次，其中一次整個畫面更新停住）。一律用 `/* */`，改完用 `node -e` 把最大的 `<script>` 丟進 `new Function()` 檢查語法。
- **模型減面**：gltfpack `-cc -si 0.085`（比例要寫 0.085 不要寫 .085）。有貼圖的模型（屋頂）**不要加 `-sa`**，貼圖會糊；只有頂點色、沒貼圖的（石獅、花窗、圍牆）可以加。
- **Color.set(1,1,1)** 在 r128 會被當成色碼 0x000001，要用 `setRGB`。
- **Material 預設就有 onBeforeCompile 函式**，判斷「是否已被改過 shader」要跟 `T.Material.prototype.onBeforeCompile` 比。
- **閃爍**：兩個面距離不到 1 公分，手機上就會閃。地面用 `floorLayers()` 依高度自動加 polygonOffset；新貼片請離牆 2 公分以上。
- **建築模式的物件編號**（如 `g-M-27` = 玄天上帝）是依區域自動編號的，增減同一區的物件組會讓編號位移，主委的配置會套錯，改完要跑檢查。
- 燈光：主委很在意「燈忽明忽暗」，換燈一定要淡出淡入、保留目前的燈。

## 5. 目前狀態（11/04 13:50）

正式版 `main` = 舊版 + 主委挑選的部分更新（飛行、移動速度、財神爺與撒紅包［50/100/500：88%/10%/2%］、立即前往財神爺、飛行時腳不動、贊助牆 28 塊 WebP）。這些是另外從舊版移植（分支 live-partial / live-csgo），已用 `merge -s ours` 記錄進 audio-fix。

audio-fix（測試版）另外完成、**尚未部署**：
- 建築與外觀：主委配置、後殿群、偏殿與文昌殿／福德祠相連、石獅、石欄圍牆、八角花窗（自動挖牆）、外牆紅磚、櫻花許願樹等。
- 角色存伺服器：`/me`（伺服器設的 `mzu` cookie，400 天）、取回碼 `/me/claim`（7 碼，每 IP 每天 20 次）、首次存檔後跳「請截圖保存」卡；造型頁可輸入取回碼。
- 主委送禮：`/gift`（要密碼）→ 存在對方的 `G:<uid>`，透過大殿 `/giftping` 通知 → 對方 `/gifts` 領取並跳禮物字卡。主委工具「送禮」或直接點玩家。對方要先存過檔（進場約 3 秒後自動存）。
- 效能：燈光池（17→6、7 盞）、動態解析度、效能面板、人物合成蒙皮網格（每人約 16→7 塊；廟埕繪製 1338→850、正殿 935→560）、神像遠近分級（先載輕量版，15 公尺內換完整版）、Service Worker 把模型／圖片／音樂存在手機（一天檢查一次更新）＋設定裡「預先下載全部」。
- 伺服器新端點已用 Node 模擬測過；Service Worker 與跨殿功能只能部署後在真手機驗證。

仍待主委決定：屋頂小投射燈要不要拿掉；石獅／花窗／圍牆顏色。

## 11/04 下午補充
- 新增：主委送禮（金幣／道具／飾品，對方跳中央字卡）、角色存伺服器＋7 碼取回碼。飾品也寫進取回碼。
- 修正：bakeAvatar 人物合併時兩腿兩手綁到同一骨頭（geometry.clone() 共用 userData），已改成每份複製品給新的 userData。
- 已單獨上正式版：飛行、速度倍率、財神紅包 50/100/500、贊助卡、立即前往、飛行腳不動。其他都還在 audio-fix 等「部署」。
- 對話與修改紀錄（Claude Docs）：https://claude.ai/artifact/6PytU1SUH36BCESuYpLhzC（私人，要分享給新帳號才看得到）

## 11/04 晚上（新帳號接手）第 1 批
- 參拜插香順序改成 13 站（CENSER_ORDER）：天公爐、媽祖、玄天上帝、武財神、文昌帝君、關聖帝君、月老、土地公、觀音菩薩、註生娘娘、斗姥元君、九天玄女、地藏王；清香一份 13 支。
- 匾額：龍門／虎門、斗姥殿→太歲殿；偏殿往文昌殿／福德祠的門，兩面各寫通往的殿名。
- 偏殿三道門（八卦門、往花園、往後埕）都改成同一個圓拱門（MOON 常數），位置沒動。
- 後埕橫跨的那串燈籠拿掉，只留兩串直的。
- 團名紅布：歌仔戲台、布袋戲台都可以由主委打團名（8 字內），用紅布蓋住模型上原本的團名；空白就顯示原樣。/stage、/puppet 多了 name 欄位。
- 跳舞貓咪：主委工具「收起貓咪／放出貓咪」，狀態存在 /stage 的 cats 欄位（預設放出）。
- 後殿音樂：走進後埕（z < RY0-1）原本的廟音樂淡出、rearsong.mp3 淡入，走回去再換回（rearZone、zoneFade）。
- 測試版：mock.js 模擬角色伺服器（/me、/me/claim、/gift、/gifts），測試徽章可以「換手機」；頁面用 window.MZ_SIM 判斷。
- 本機自動測試注意：mock 的 /stage、/puppet 狀態會被定時抓回來覆蓋，測戲台要先 POST 到 mock；swiftshader 載入戲台模型要 30 秒以上。
- 下載排隊與第一次進廟的下載畫面（11/04 晚）：loadRaw 改成排隊，最多同時 3 個；順序是建築（roof/shishi/weiqiang/huachuang/decor、天公爐/金爐/媽祖輕量版）→ 神像輕量版 → 神像完整版 → 戲台和夜市攤位（等建築和神像都到了才開始，測試頁的 bdx／攤位預載也一樣，whenEssential）。#dlPack 下載畫面：超過 1.2 秒還沒載完才出現，顯示件數百分比，進度條上是遊戲裡的財神爺（dlRunner：獨立小畫布，用 Avatar＋csDress 原地走路）。下載中不能進廟（沒有跳過鍵）；每個模型最多等 30 秒就算過，300 秒是最後保險。財神爺小一點、跳得比較高。

## 11/04 晚 第 2 批
- 新模型（public/）：doumu（斗姥元君，換掉舊的，不再上金漆）、longquan（龍泉水，取代後埕牆邊泉水；舊的程式泉水保留但隱藏，避免建築編號位移）、ylantern（黃燈籠，decor 的 lantern 全部換成它，發光：litLantern）、huashu（花束，bouquet()：每張神桌左右各一束；建築清單也能加）。龍泉水、花束加進 BUILD_MODELS。
- 神像亮度統一：DEITY 名單的模型載入後一律 deityLook（自身貼圖當發光，.3／低配 .42）。
- 偏殿：拿掉兩顆燈籠，改 3×3 天花板崁燈＋一盞較亮的點光。
- 地板：室內 floorTex 改成無接縫拋光石（沒有磁磚線）；花園路的石板路和草地隱藏，全園區戶外用同一種地磚；文昌殿／福德祠連接段地板補滿（原本有一條縫）。
- 花圃 flowerBed()：花園路兩側（文昌殿／福德祠到廟埕那段）、櫻花許願樹的石座上。
- 遠看亮燈：HALL_GLOW 暖色光暈放在每座殿內（夜裡較亮），大殿三個正門內各一團光。
- 已確認建築模式編號（g-S-R-1、g-M-27/28、g-G-*-3、rdec*、roof-*）都還指到同一個東西。

## 11/04 晚 第 3 批：神明小遊戲共用基礎
- 飾品多一格「嘴邊」：eq 變成 [頭, 手, 嘴]（舊手機只送兩格也能讀）；ACC_MOUTH[id](g) 畫嘴邊飾品、ACC_BUILD_HAND[id](g) 畫新的手持飾品（掛在頭的 (0,-.08,.25)、右手）。背包飾品分頁多「嘴邊」。
- 扭蛋幣 bag.gacha：背包上方顯示（標示扭蛋機尚未開放），寫進造型代碼／取回碼（最後 8 bit，舊代碼讀成 0）。
- gameReward(g,accId)：第一次過關給飾品並戴上；之後每天每個遊戲給 1 枚扭蛋幣（bag.gd[g]=台灣日期）。主委「重置今日」會清 bag.gd。
- godGameWin(g,ms,accId)：過關畫面（時間、獎勵、排行榜）。伺服器 /lb：每個遊戲每人最快時間，前 20 名（GET ?g= / POST {g,t,name,id}），測試版 mock 也有。
- 遊戲代號：wenchang、tudi、guanyin、zhusheng、doumu、jiutian、dizang（GOD_GAMES）。

## 11/04 晚 修正
- 測試頁媽祖一直沒出現：模型 js 的變數名是 GLB_MAZU / GLB_MAZU_LITE，頁面卻找 MAZU_LITE_B64，已統一。媽祖下載順序最先（lqPri -1），輕量版到了立刻接著下載完整版。
- 偏殿後門移到路線上（x=SHXC），跟往文昌殿／福德祠的圓門、文昌殿／福德祠通往廟埕的門（也改成圓拱門 MOON）三道對齊；後門旁的窗戶拿掉。路徑 doorPts、walkable、camOK 一起改。
- 室內地板反光：floorsPlain 對 floorTex 地板用 Phong 高光（shininess 45、specular #b0906a），沒有多加燈或貼圖。
- 後殿加深 4.5 m（RH.z1 -43.5 → -48，RH_WALK）。主委存的後殿屋頂位置（z > -39.5 的舊配置）套用時自動往後移、拉長。
- 後殿格局比照前殿：觀音在中間神龕；註生娘娘、九天玄女改成兩側獨立神龕（±7.9，像玄天上帝／關聖帝君）；神龕兩側的空位留給之後的神尊。
- 土地公・尋寶（GOD_START.tudi=thStart）：園區戶外隨機可走的點（C/B/K/P 區，離玩家 12 m 以上）立金色光束，計時開始；走近點光束（station "treasure"）→ 鏟子挖三下、泥土飛、寶箱跳出打開。內容：平安幣 42%（30~120）、臭襪子 24%、魚骨頭 24%、扭蛋幣 10%（每天最多一次，bag.gd.tudiG）。排行榜時間＝開始到開挖。神明面板有「開始遊戲」「排行榜」鍵（GOD_PLAY / GOD_START）。
- 註生娘娘・哄睡（GOD_START.zhusheng=playLullaby）：按住搖得用力、放開變輕，金色指標要停在會移動的粉紅區；在區內累積睡意，區外累積「快醒了」，滿了寶寶哭醒（扣睡意）。睡意滿＝過關。獎勵飾品 pacifier（奶嘴，嘴邊，冒粉紅愛心）。測試用 window.__zs() 讀狀態。
- 後殿觀音放大：神龕柱子 PH 4.4→5.2，中間加紅金台座，觀音 3.9（神龕內單位，約 3.3 m），是後殿最大尊。
- 文昌殿／福德祠：GH.H 4.8→5.6（跟偏殿一樣高），神龕在建築配置裡最大 1.1 倍（buildApplyOne 限制 g-G-*-3），燈籠換成崁燈 downlight()，連接段天花板和外牆補滿。
- 室內地板改成約 2 m 的大塊石板（有淡淡接縫和石紋），反光調弱（shininess 28）。
- 九天玄女・八卦迷宮（GOD_START.jiutian=playBagua）：每次隨機生成 9×9 八角形迷宮（從中心深度優先挖），起點＝離中心最遠的格，5 個坑放在不在正解路上的死路。手機傾斜（deviceorientation，iOS 在按開始時要權限）或手指拖曳控制彈珠；掉坑回起點。獎勵 peachsword（桃木七星劍，手持，身邊兩條仙女飄帶 av.ribbon）。測試用 window.__jt() / __jtPush()。
- 觀音菩薩・接福水（GOD_START.guanyin=playFushui）：5×6 木水道，每次先隨機鋪一條從寶瓶（左上，從左邊進）到雙手（右下，往右出）至少 12 格的路，其餘格隨機，全部隨機轉向；點格子轉 90°，水即時流過接通的格子。獎勵 bamboo（受祝福的竹葉，嘴邊，全身閃亮粒子）。測試用 window.__gy() / __gyTap(i,j)。
- 地藏王・記憶碎片（GOD_START.dizang=playMemory）：public/ghost1~14.webp（主委給的 14 張小幽靈圖），5×5 有凹凸的拼圖，可雙指或＋／－縮放、拖空白處平移；放到正確位置附近會吸住。bag.dz.done 記錄拼過哪幾張，滿 10 張不同的給「小幽靈」（第 4 個飾品格 pet，飄在肩膀旁發光，buildGhostPet）。每次過關照共用規則給扭蛋幣（每天一次）。
- 飾品格現在是 [頭, 手, 嘴, 夥伴]。嘴邊飾品位置往下移到嘴巴；竹葉改成一片長葉子咬在嘴角（像 RO 的草葉）。
- 仙女披帛改成兩條細絲巾掛在肩膀、繞過頸後往上，尾巴往後飄，粉紅到紫色漸層（vertexColors）。
- 龍泉水：龍嘴噴出流動的水柱落進水池，有水花和漣漪。

## 11/04 晚：八卦迷宮重做、披帛、竹葉
- 九天玄女 `playBagua` 重做：真正的八角形同心環迷宮（每環每邊格數 PS=[0,1,2,2,4]，往外加倍，環與環的門口才不會被牆端擋住），獨立 WebGL 畫 3D 木盤（八卦金爻、太極、坑、彈珠、會跟著傾斜的盤面）。
  - r128 的 hex 顏色當線性讀，盤內顏色都過 `LC()`（convertSRGBToLinear），不然整片泛白。
  - 彈珠半徑 MR=.2（再大會卡門口）；`__jt()` 回傳 way（格心＋門口中點）與 segs，機器人 t_jt4.py 約 50 秒走完。
  - 「📱 用手機傾斜」按鈕：點了才要求 iOS 權限；1.5 秒沒收到訊號就提示改用手指拖曳（claude.ai 測試頁的 iframe 可能收不到）。
- 仙女披帛：肩後拉寬，繞頭一圈像光環（`half()` 弧線，n=72 段）。
- 受祝福的竹葉：改成一般大小的葉子、往下垂。

## 11/05 凌晨：文昌寫字、斗姥眾星歸位
- 竹葉再往嘴裡塞 1/3（葉子各部位 x 往內 .05）。
- 文昌帝君 `playWenchang`：每局從 WC_POOL 抽 3 字，米字格宣紙上描紅，限時 60 秒。判定用 72×72 遮罩：字被墨蓋到 ≥62%、墨跑出字外 ≤30% 就過，蓋紅圈 ✓「100分」。逾時跳「再寫一次」。測試鉤子 `__wc()`、`__wcAuto()`。
  - 獎勵 `wenbi` 文昌筆（ACC 末端新增）：毛筆＋紅緞帶兩條尾巴飄、身邊浮出紅色 ✓／100分（`WB_TEX`）。
- 斗姥元君 `playDoumu`：60 秒 8 顆星。第一段把星圖需要的形狀（愛心／星星／方塊／三角／圓圈，`DM_KIND`）拖進左下籃子；流星會撞掉手上的、雲飄過遮住、打雷讓你掉。第二段北斗七星＋北極星的洞，拖進對的形狀就點亮。全亮：天空變亮、光芒、「眾星歸位・斗姥元君 賜福」4 秒後結算。測試鉤子 `__dm()`、`__dmAuto(n)`。
  - 獎勵 `starwand` 星星法杖：頂端旋轉發光星星，5 顆小星繞身轉（`av.orbit`，換掉法杖會移除）。
- ACC 目前 11 個（上限 15）。

## 11/05 凌晨（二）：地板凹凸、評分變嚴、特效、哄睡美術
- 室內地板加 `floorBump`（bumpMap，scale .045，只套在亮面石地板）：接縫下凹有倒角、石板微傾、小坑與細刮痕，反光會被打散。
- 文昌寫字評分改嚴：墨線遮罩寬 M*.075；整個字蓋到 ≥80%、字切 4×4 區每一區（≥12 像素的）都要 ≥60%、跑出去 ≤25%。限時改 90 秒。`__wcAuto(frac)` 可只描上半部測試（應該不過）。
- 文昌筆特效改成紅色圈圈粒子（`RING_TEX`），不再浮 ✓／100分。
- 星星法杖：拿掉光暈，改 7 顆大小不一的實心亮星繞身（`STAR_CRISP` 五角／四角）＋一路灑下小星星粒子。
- 註生娘娘哄睡換主委給的美術：public/zs-*.webp（竹架、搖籃、吊環、ZZZ、懷錶、雲朵指標、直條、紫／紅橫條），白底去背（cut.py：從邊緣洪水填充＋白色轉透明，封閉白洞另外判斷）。橫條、直條用三段切片拉長，兩端花紋不變形。測試頁要把 zs-*.webp 一起發佈。
- 神明對話點（stations 的 approach）改成每 1.5 秒依香爐實際世界座標重算：`fixGodStations()`，香爐前方 1.2 m（玄天、關公 .86），面向神桌。原本建造模式移動神桌後對話點留在原地（財神偏 2.6 m、月老 2.1 m）。媽祖、天公、虎爺不動。
- 地板磁磚統一大小：`floorUV()` 依每塊地板的實際尺寸重算 UV（不動共用貼圖的 repeat），室內石板每 4 m 一循環（2 m 一塊）、戶外地磚每 4.4 m 一循環（55 cm 一塊）。clone 幾何時保留 parameters（建造模式會讀）。
- 戶外地磚加 `yardBump`（8×8 接縫下凹、每塊微傾、小坑），Phong shininess 14、specular #2e2820、bumpScale .06。

## 11/05 早上：省電第一批、音樂、隱藏人群、面板不跳頂
- 音樂重寫：每首歌（main/rear/cat/fw）各一個 audio、各自 gain（`TRK`/`TRG`/`MIX`），換區 2 秒交叉淡入淡出、不重新載入、不跳段；進出後殿要停留 2.5 秒才換（`rearDwell`）；`trkPrime()` 在下一次點擊時先把快要用到的歌靜音啟動（手機規定要在點擊裡 play）；`musicTick` 內有卡住偵測（3 秒不動就推一下、7 秒重新載入接續）。music/rearsong/fwsong 轉成 96kbps（約省 25%）。
- 贊助牆燈點批次化：`bulbBatch()`（每面牆燈泡一個 InstancedMesh＋光暈一個 Points）、`speckCloud()`（火花、金粉）；點的大小要乘 `PT_FOV()` 才跟原本 sprite 一樣大；遠離贊助牆（>45 m）不更新。實測看贊助牆 1300～1430 次繪製 → 150～220 次。燈泡球面 10×8 → 7×5。
- 遠處人群變色：`crowdMat()` 在別人身上的材質加一段 shader，8 m 內原色、24 m 外變深紫人群色（`FARCROWD`），每 2 秒補新來的人；不多畫任何東西。
- 隱藏其他玩家現在連示範跪拜的人一起隱藏（主委要求）。
- `openSheet` 重畫同一個面板時保留捲動位置，不再跳回頂部。
- 功能整理：設定頁改成「畫質 → 流暢度 → 下載到手機（預先下載＋加到桌面）」，效能面板和綠點測試只有主委（me.sp）看得到；預先下載清單補上 rearsong、ghost1-14、zs-*。
- 訊息合併：右上「公告」改成「公告與訊息」面板＝公告＋主委的回信（未讀回信也讓公告鈕亮）＋寫留言給作者（聯絡作者表單有「← 公告與訊息」返回）。左上的「聯絡作者」「主委回信了」兩顆浮動按鈕藏起來（元素還在、display:none，舊程式不會報錯）。
- 清舊程式：贊助牆已拿掉的探照燈殘留、臭香腸沒用的台詞、殿別面板標題統一。

## 11/05 中午：搖桿、文昌評分、盆栽、龍泉水、燈下光圈、小幽靈模型
- 小遊戲關閉時 `inputReset()`（搖桿、按鍵、畫面拖曳/雙指、pointer capture 全清，0.3 s、1.2 s 再清一次）；搖桿收到新手指時先放掉舊的。
- 文昌寫字改判定：字切 5×5，每格都要有墨（粗筆刷 M*.12 判定，不用回頭塗滿）＝寫完；寫完立刻給分＝墨落在紅字內（含 1 格容差）的比例 0–100。三字平均分在結算時顯示。
- 後殿前盆栽 x 改 ±7.1/±9.0/±18.5，不擋龍門虎門與太歲殿／地藏殿門。
- 龍泉水：水柱改不透明、口細下粗（半徑 .10→.22），一路延伸進池水面下，蓋住模型原本雕的石水柱。
- 燈下光圈 `lanternPools()`：改米黃色、範圍大（半徑 4.2–11 m）、鐘形淡出；用往下射線找燈下真正的地面高度（只算大面）；黃燈籠模型（`lanternBody`）也算；模型載入後 1.5/6/20/60 秒重算。夜晚亮度隨 `_dn.night`。
- 小幽靈寵物換主委的模型：原檔 64 MB／約 200 萬面 → gltfpack 縮成 public/ghostpet.glb（35 KB、約 3 千面）與 -lite；`lqPri` ghostpet=0。
- 待確認：重疊的窗戶（14 個八角花窗拍過沒看到重疊，等主委截圖）。
- 小幽靈：自發光加強（emissive .75、不受色調壓暗）、光暈放大，身邊持續飄出白／淡藍／淡紫小光點。
- 燈下光圈太亮（手機上一串燈籠疊成白光）：3.5 m 內的燈籠合成一個光圈，亮度降到夜間 .22。
- 舊的紅色格子窗全部拿掉：正殿兩側牆改成實牆（WIN 不再開洞、陽光光束取消），偏殿 `win()` 改成把開口補成牆。八角花窗保留。
- `wallBricks()` 改寫：所有紅色、牆的形狀（厚 <.75 m、寬高都 ≥2.4 m）一律換紅磚，室內也貼（不再室內純色）。
- 金色壁磚：`goldCarvedTex` 改成方塊金磚（凸邊框、回紋角、福字圓章、四葉），加 `GOLD_BUMP` 立體刻紋。
- 斗姥眾星歸位 v2：一開始就有星圖（每局隨機 10 洞，最短連線組成星座），落下的形狀星星直接抓到同形狀的洞；雲在最上層擋視線；流星撞掉、偶爾打雷；背景傍晚紫→橘＋遠山。

## 2026-11-05 batch (games)
- 哄寶寶: removed the painted eye dots and tears (kept 「哇——」); the meter's cloud picture is replaced by a drawn gold/red arrow; zs-cloud.webp no longer loaded.
- 接福水 (playFushui) rebuilt: 6×8 board on portrait, 8×6 on landscape; start = top-right cell (from above), end = bottom-right cell (down into the hands).
  Pipes are drawn in code (tileArt) with symmetric stroke layers so every edge joins seamlessly; wood board is one cached canvas (boardArt).
  Assets: gy-bg.webp (panel removed), gy-vase.webp (stream animated via STREAM centre line), gy-hands.webp. Hooks: __gy, __gyTap(i,j), __gySolve().
- 眾星歸位: every game is 3 stages in a row (DM_LV: 8 holes 45 s sp1 → 10 holes 55 s sp1.3 → 12 holes 65 s sp1.55 bigger chart); score = total time, a failed stage restarts with its limit added.
- 拼圖: 7×4 = 28 near-square pieces; each piece cached as a sprite with a raised bevel; picture chosen + downloaded when 地藏王's panel opens (dzPrep / DZ_PRE); clock starts when the picture is ready.
- Joystick stuck after games: the god-table approach points of 玄天上帝/關公/註生娘娘/九天玄女 sit on unwalkable ground; the stick now lets you walk off a blocked spot.
- 文昌寫字: a character is scored only when strokes ≥ its hand-written stroke count (WC_STROKES) AND every part has ink; 「✔ 寫好了」 button allows one stroke short (joined strokes). Time limit 120 s. Board for wenchang ranks by total = avg×10 + 2×(seconds left of 120) — worker key `lb:wenchang:c` (old time board untouched); mock.js updated. Needs a deploy for the live worker.
- 接福水 scramble: whole board regenerated (≤30 tries, ≤0.9 s) until min-conflicts finds one where no two channels touch, no water enters, every path tile is turned wrong and ≥10 taps are needed; paths that run straight beside themselves are rejected (sideOK).
- Layout v2: BUILD_DEFAULT now carries v:2 (user's layout + 福德祠 g-G-L-1 mirrored to z 4.5 + mirrored bouquet pair). A saved layout with lower v (server or local) is replaced by the default; buildCollect saves v; worker keeps v.
- 文昌殿／福德祠: main-hall outer wall inside them gets a brick panel; their roof-clip box now spans from the main hall wall to the front wall (roof models no longer show inside).
- Indoor fill: in any room except 正殿 and outdoors, hemisphere +.42 and ambient up to .48 (eased), no extra lights.
- Download screen: background dl-bg.webp (preloaded); the 3D avatar above the bar is replaced by a 2D white butterfly with glitter dust (dlRunner, no WebGL).
- 花束: every built-in bouquet (main altar, 天公 table, every side shrine) uses bouquetStd — the size/turn of the chair's 文昌帝君 pair (2.561×2.8×1.8, left +.468 rad, right −.055). The added huashu items were removed from BUILD_DEFAULT (now v:3) since the shrine's own pair is placed there.
- Fireworks: FW_SHOWS — 0 經典 (218 s, fwsong.mp3), 1 春櫻 97 s (fw1.mp3), 2 龍騰 126 s (fw2.mp3), 3 眾神 186 s (fw3.mp3); fwProgramN(sh,seed). New pieces: wheel events (吊車 hang / 風火輪 rise), giant, tail (sk 4 coloured trails), strobe (sk 5), god (fw-gods.json, 13 line-art gods traced to points; random god per show, fired alone after the climax). Chair picks a show + closing words (≤24 chars, FW.txt → #fwEnd vertical text). Server starts shows 10 s ahead (el<0) so phones fetch the song (countdown banner .fw-count). Worker /fireworks body {sh,txt}; hall stores {seed,at,sh,txt,len}.
- 巨型菩薩像: statue.glb (5k tris, 512 px, from the user's bodhisattva model), 42 m at (0,0,-65) behind the 後殿, MeshBasic (always bright, no fog) + soft additive halo; loads last (lqPri 3).
- Statue lighting: floodlight baked once into vertex colours (3 ground lamps in front, falloff with distance, faint moon fill), unlit MeshBasic + vertexColors; 3 faint additive beam cones + lamp boxes. Halo removed.
- Moon: MOON_S (canvas sprite + soft glow) low over the rear of the temple, opacity follows _dn.night.
- Fireworks look: stars drawn as instanced streak quads (fwStreak; points no longer drawn). Per-star streak amount fwTr/FW_TR (FW_TRK per shell type: chrysanthemum/willow/kamuro/tail/palm long lines, peony/ring/heart/smile/strobe/twinkle/god round). Softer individual fades (life ±20 %, smooth alpha). New types: smile, bees (亂飛), kamuro (銀柳), cloud (七彩祥雲), twinkle, huge (超巨大). Wheels spray 360° outward, colour per turn. God: palette per show (FW_GOD_PAL), sk 9 slow twinkle-out, always the last shot; closing words 5.2 s after it (fwGodEnd).
- Layout: fwLayout moves high shells behind the temple (z −16…−28), centred ones above the statue, god at (0,60,−80); fountains/mines/fans/wheels/low shells on side pads (x ±26…, z −5). Show sky: night .38.
- Music: show song not looped; STALL watchdog leaves the fw track alone; resync only if >1.2 s off, every ≥6 s.
- 湖畔賞煙火 (LAKE): lake at z 66–114 in front of the temple, cherry trees (blossom points), stone lanterns; camera fixed at (−6,3.6,118). Still-scenery reflection rendered once (lakeReflect, 512² RT, projective texMat); fireworks mirrored live by a flipped copy of fwStreak masked with stencil. Foreground out-of-focus blossom cards + petals. Button 🚃 搭車去看煙火／搭車回廟裡 (trainTo: black overlay, 搭車中…, synth train 3 s). Available from countdown on.
- 觀音殿: sheer gold tied-back curtains (custom geometry + small glitter shader) replace the middle-bay swags.
- 2026-11-05 evening: shells larger/higher/brighter (fwLayout y+8, s×1.3; star size ×1.3; streak colour ×1.75); louder (fwSound k floor .5, thumps up). Silk mode: fwTr>1.5 draws a fixed-length thread behind the star (willow 5, kamuro 6.5, palm 3, silkfall 9). New "silkfall" (sk 10, 30–48 wandering stars that fall ~4 s with gold glitter). Twinkle brighter (sk 6 size+alpha pulse). God shell has no caption. Lake reflection of fireworks: wider, faint, rippling (mirror shader). Travel overlay 移動中… ~2 s, whoosh; button 前往湖畔看煙火／回到廟裡, available during countdown. Fly: flyClamp ±140, sky follows camera, far 520 when flying.
- goldCurtain(): 媽祖、千里眼、順風耳 bays and the three 觀音 bays. wallBricks also tiles 1.2–2.4 m pieces (the walled-in window strip in the 偏殿 front walls).
- 山門 at z 53.7 (under the chair's roof3): brick walls, arch passage, lanterns, uplights, plaque, stone lions. Sponsor wall unchanged.
- Bag: acc-icons.webp (starwand, ghost, wenbi, peachsword ribbon, bamboo leaf, pacifier) via ACC_IC2 in bic().
- Correction: the 山門 I built is removed. The brown building outside (hallSil at z 54 under the chair's roof3) is now litHall(): brick walls, arch passage with gold trim, plaques, pillars, lanterns, uplights, pool lights, stone lions outside.
- しだれ柳: sk 3/8/10 stars lay down segments along their path (20/s, life 3–4 s, velocity×.2 so each segment is a short streak) → curved hanging lines. "silkfall" is now a huge gold weeping willow (40–70 stars). Willow 70 stars, kamuro every 3rd. Straight silk threads removed (FW_TRK willow/kamuro/silkfall 0, palm/meteor 1). Smiley shells removed from the shows.
- Demo people: leave/arrive at walkable spots by the courtyard balustrade (botExit) and shrink away / grow in over .55 s (botVanish, growT) instead of popping; log-offs also shrink. Lantern floor pools warmer yellow (#ffc95a).
- Pretend players log off instantly again (no walking off); arrivals use placeBot. Warmer floors: hemisphere ground #5a3a14, ambient #6e4c22 (.26 base), pools #ffb53a opacity .12–.32. 偏殿 bagua window lowered to y 3.82 (1.05 m). Roof clip boxes for 偏殿／文昌福德 now reach 0.6 m above the ceiling. Build mode: rotation step choice (BUILD.rstep .5/1/5/15/45°). Peach-sword icon drawn (acc-icons slot 3).
- Fireworks: low show (fountains, mines, fans, wheels, low shells) launches from the temple roofs (fwRoofY raycast, cached per 2 m); big shells ×1.6 and kept out of the statue column (|x|≥17) or high above it (超巨大 at y 92); god at y 74; bigFan (17-tube fans ×2) several per show; colour more saturated; kamuro thinner; 七彩祥雲 removed; finale no longer moves the camera. Lake: one viewpoint per show (LAKE_VIEWS), longer lens (fov 47 portrait / 34 landscape).
- Restored: main-hall lattice windows (WIN openings, gold-framed) and the sunset shafts through them; the middle-door board is red wood again (wallBricks back to ≥2.4 m pieces, plus userData.brickMe for the 偏殿 walled-in window pieces only).
- Fireworks: 🙈 隱藏介面 button (body.fwclean hides all UI and name labels; faint 👁 top-right brings it back; auto-off when the show ends). Weeping willows: 60–110 stars, life 7.5 s, longer slower trail segments (life 4.5–6 s), FWN 36k (16k low); silk() fires 5–6 willows in a row at once.
- Camera can tilt up (camPitch down to −0.9: camera stays, rotateX up); lake view tilt up to .6. During a show the normal view widens to fwFov (≤96°). Blinking stars (twinkle/strobe) smaller, no over-bright/size pulse so they stay sharp.
- Statue rebuilt at ~27k tris, 1024 px texture (statue.glb ~385 KB). Show view/lake: drag direction no longer mirrored. While a show is on, rendering goes to full device resolution in any view (DRES.fw); star size ×1.3, round heads narrower.
- Chair tools: 📷 記錄視角 (copies MZVIEW camera code) and 🌫️ 除霧 toggle (local only, survives lake trips).
- 天燈 restyled: palette SL_PAL (cream/amber/rose/lavender/pink), unlit paper lit from the flame (bright bottom), soft halo, size variety, cached textures; mass release 70 lanterns + SLFAR (one Points cloud of 220–520 distant lantern lights rising for ~110 s).
- Fireworks viewpoints: FW_SPOTS numbered (1 廟頂上空 = chair's MZVIEW, 2 湖畔 = per-show lake view); 🎥 切換視角 cycles 自由→1→2→自由 with the 移動中 overlay. 🔭 廣角/標準 toggle (FW_WIDE) for every view. Spark streak width capped in screen space (no smears from roof-mounted fans near the camera); sharper edges. Main-hall windows: wall pieces between windows bricked (brickMe); the brick panel that covered the windows from the 文昌/福德 side removed. Sky lanterns: no lid. Chair speed also speeds fly up/down (and new 8× step).
- Fireworks round: whistle sound removed; ring = 3 nested rings + pistil; dring → fourcolor (quarters in 4 colours); sk 11 colour-cycling stars (35% of peony/chrys/twotone/crossette/multi/glitter, plus giantcc); every 巨型 randomly giant/giantcc/giantduo/giantwillow in contrasting colours; megaSenrin (8 big 千輪 at once over the whole sky); sweep (roof cake sweeping L↔R with colour change); wheels merged into symmetric rows of four, fixed at y 17, longer sprays. Spark width ∝ 1/dist^0.75 (far bigger, near finer), uGain dims in wide views. Viewpoints: no free option (🎥 看煙火視角 → 1 → 2 → 1…); ✕ leaves the viewpoint and ends the sparkler; after the closing words you're taken back automatically. Courtyard yard plane 50 % larger (78 × 1.5 length).
- trainTo busy flag is now a timestamp (free after 2.1 s even when timers lag) so ✕ and auto-return always leave the viewpoint.
- 11/06 batch: 虎爺 is the 14th censer (清香 pack = CENSER_ORDER.length). ⚡ 一鍵參拜 (#autoBtn, autoWorship): buys what's missing at the shop, then walks every censer in order — bow, plant, 平安符過爐 (3.6 s) — clears offerings, burns 金紙; tap again or joystick to stop (arrivedCheck sets AUTO.arrived instead of opening sheets). 月老紅線 is now accessory `redthread` (own `wrist` slot, threadOn(); floating hearts in accTick; icon cell 7 of acc-icons.webp). Ten modelled hats (hats.glb named nodes, HAT_FIT sizes, hat-icons.webp rendered from the model); save codes carry accessories past 15 in a 6-bit extension after 扭蛋幣. Giant statue = user's new model (statue.glb 30k tris / lite 22k). Boundary: drawn white stone balustrade (instanced) on both sides, the back and the front either side of an 17 m gate; weiqiangfar model no longer used. Courtyard tiles warm terracotta; hemisphere/ambient back to live values; yard tile repeat 17.5×10.5. Mass lantern release: far cloud forms a diagonal Milky-Way band, near lanterns drift back over the temple. Wheels: one row at a time ≥28 s apart, 6.5 s, every nozzle its own changing colour; ring/dring shells mapped to fourcolor/twotone; 55 % colour-cycling; streak width cap .0052, colour ×1.6 (less white blow-out); one soft additive halo sprite per burst (pool of 28). 偏殿 bagua window .86 m at y 3.72. 註生娘娘 art preloads once you are behind the main hall. Build mode: 櫻花樹 (makeSakura, seeded by the item id so every tree differs).
- Chair (me.sp) always owns every accessory in ACC, so anything new shows up in the chair's bag automatically (accState + renderChairBtn).
- 11/06 later: hats sit on the head (HAT_FIT y lowered; the head top is ~.06 above the head origin), 月老紅線 = red cord + glowing pulsing heart charm (makeRedThread; floating hearts removed), sparks drawn as round sharp dots with a fading tail (fragment uses distance to the trail segment; width .001–.0036), halos fainter, giant's strobe crown fewer/coloured (no more white disc), 🔭 button gone — pinch / wheel zoom (FW_ZOOM 1–2.8) while a show or viewpoint is on, giant statue rebuilt at 132k / 66k tris.
- 11/06 afternoon: fireworks — uMinW floor on spark size scaled by fov + brighter core for tiny sparks (uGain back to 1); lake reflection fixed (mirror material was missing uGain); show sky night .6; random pitch/length per bang (fwThump); 彩千輪 sub-bursts bigger/contrasting/longer; 銀柳 (kamuro) twice the strands and more of them; "giant" = four-colour chrysanthemum (no white strobe crown), giant/huge star counts down; gerbs bottom/top opposite colours cycling; new `fanjet` (9-nozzle continuous fan on the roof); god climbs in 1.9 s and goes up earlier (春櫻 82.6, 龍騰 106.8); 眾神 ends with godRows(163.5): all 13 gods in rows of 4/4/5 (gs .5, keep:1 events skip fwLayout), decoration at the sides and low; 🚪 退出看煙火 button while in a viewpoint. ⏰ 定時活動: Lobby `/schedule` (chair key) + DO alarm runs fw / mkOpen / mkClose (daily repeats); runFw/runMarket shared with the chair buttons; test page keeps the timetable in localStorage. Accessories: threadOn no longer needs bag.redThread (chair can wear it), bigger glowing heart; star wand held upright a quarter up the staff; ghost circles its owner; bag details/actions open inline under the tapped item's row.
- 11/06 evening: shells also go up in the middle of the sky (40 %: x ±10, y 52–62, z −30…−38), a gap filler adds centre shells wherever 3 s pass with <2 shells, nothing high bursts from 4 s before the closing god until it fades; one god at the end (gs 1.35, y 80); 春櫻 pink 銀柳 fills (willowFill, e.pink; pink trails), 眾神 ends with silver 銀柳 fills low then one god at 171.2 (all done by ~185 s); giants bigger and start slightly opened (no white-hot first instant); shader colour ×1.3, white core .1, alpha cap .82, halo no longer whitened. Gift to 全伺服器: /gift to:"all" stores GA (last 20, 14 days), /gifts returns them, page remembers taken ones in bag.gaSeen; hall giftping {all:1}. Gift ids now keep underscores (hat_*).
- 送給全伺服器 now has two modes: 🌐 所有玩家 (stored 14 days, GA) and 🟢 只有現在在線上的人 (/gift to:"all", online:true → hall giftping {all,gift} → clients get {t:"giftnow",g} and apply once; nothing stored).

## 11/07 凌晨（本帳號）
- 土地公尋寶：每天 3 次（bag.gd.tudiN，主委不限）；TH_LOOT 加「big」500 幣 5%。
- 日夜循環：todPhase 一天 24 分鐘（TOD_LEN=1440）：白天→黃昏→夜→清晨；天空 shader 白天加白雲；測試可設 window.MZ_TOD=0~1。
- 畫面濾鏡：設定「畫面濾鏡」關閉／柔和（預設，低配預設關）／電影感；CSS filter + #vig 暗角（FLT、fltApply、mz.flt）。
- 靜思禪院（ZEN，常數在 RS 後面，模組在 cushions 後面）：後埕左牆 z=-27.6 開門（牆分兩段），石欄杆留缺口，紅色拱橋（groundH 讓人走上拱橋、禪堂地板 .55）、小溪、石燈籠、竹籬（X -76…-26.2, Z -50…-6）。禪堂四面無牆只有柱子、上方紙窗、欄杆；「靜心」卷軸掛西側中間；50 個坐墊（SEATS 後 50 個，.zen/.face，盤坐姿勢在 Avatar.update 的 zenK）。鏡面地板：只在人進禪堂時把 ZEN.g（layer 3）鏡射畫進 RT（zenMirror）。樹：instanced 葉片卡（ZEN.leaves），晚上 zGlow 發光；在庭園內時燈光偏暖紅、殿內變暗（zenTick 在 dayNight 之後調）。庭園只有鏡頭靠近才畫。原本 g-X 圓球樹在 x<-26,z<9 的在 mergeStatic 前隱藏（zenHideTrees）。zone "Z"、ZLINK B↔Z、doorPts 走門→橋→石板路。音樂：x<-23.5 也算後殿音樂。遠端玩家 x 範圍放寬到 -78。
- 🎼 煙火編排器（FWED，主委工具「煙火編排器」）：選歌→進看煙火視角；播放時點天空＝那一拍在那裡炸（火箭提前發射）；26 種（FWED_TYPES，圖示會動、▶試放）、大小 4 級、隨機／配色、左右對稱、復原、刪除、拖動、時間軸、✔檢查（主委四條規則 fwedCheck）、💾存檔。節目 {id,name,song,len,n,ev:[{t,ty,x,y,s,c}]}；fwedEngine 轉成引擎事件（keep:1）。伺服器 Lobby /fwc（GET 清單／?id=、POST 存或 {del}，要密碼，最多 20 場、900 發）；/fireworks 與 /schedule 多收 cu（自訂節目 id），Hall 廣播 {t:"fw",…,cu}，手機 fwStart(…,cu) 會先抓節目。測試頁存在 localStorage mz.fwc。已用 Node 模擬測過伺服器；跨手機要部署後測。
- 新帳號的測試頁：https://claude.ai/artifact/RBTUGkpRZg1i8AWxyUH4bt（.glb 不能放，模型用 -model.js；一次最多 64MB，分兩次發佈：先輕量版和其他檔，再完整版 -model.js）。
- 11/07 01:00 後：禪院樹色不規則（鄰色、少量綠、內深外淺）＋每棵 2–4 根樹枝；拱橋改木頭；禪堂地板深咖啡（鏡面帶咖啡色）。編排器加「低空扇形噴射」fanjet、「風火輪」wheel（掛在 z=-6）、「沖天線」skyline、「螺旋升空」spiral（引擎新 kind "spiral"：繞圈上升拖尾後開花，R=0 就是直線）；金色瀑布線條加倍；巨型變色更久更亮；星閃變亮會閃。編排器不用瀏覽器 confirm/prompt（測試頁框架會擋，之前「離開」沒反應），改頁內 fwedAsk。禪堂音樂：玩家可選（ZEN_SONGS，按鈕 #zenMusicBtn，track "zen"，存 mz.zenSong，預設後殿音樂）。搖桿卡住防護：整頁 pointerup/touchend 都會放開搖桿，切到背景也會。
- 11/07 02:30：禪院木橋和禪堂地板原本被 floorsPlain（地板統一換材質＋白色自發光）變灰，加 userData.keepMat 排除；樹往外移（禪堂外圍留 2.6 m 空帶），樹變高（樹幹 1.6–2.4、樹冠拉高）讓窗景仍然滿。
- 11/07 02:40：禪堂掛軸換成主委的圖 public/zen-scroll.webp（含掛繩，雙面，掛在西側橫樑），測試頁要一起發佈這個檔。
- 11/07 03:10：天氣（WX，wxTick 在 dayNight 之後）：晴／陰／風大／雨／雷雨，依時間每 6 分鐘自動換（wxAuto，全服一樣不用伺服器），主委工具「🌦️ 天氣」可指定 20 分鐘（Lobby /weather，Hall /wx 廣播 {t:"wx"}，手機每 2 分鐘輪詢）。雨：相機周圍 LineSegments（室內不下）、戶外地板變濕變亮並用一次性 CubeCamera 反射（WX.wetMats）；雨天戶外假人回家、新假人在室內（botSpot）。雷雨：閃電（天空 flash uniform＋燈光）＋合成雷聲（wxThunder）。風大：花瓣樹葉 Points、偶爾報紙／塑膠袋／鋁罐飛過（wxTrash）。聲音全部用一段雜訊 buffer＋濾波器（雨、風有陣風）。測試：window.MZ_WX="storm"。
- 欄杆外：地面改草皮（outsideGround），種櫻花（SAKURA：近處 87 棵細緻、外圍 230 棵大葉片，共約 9000 片，兩個 instanced draw），g-X 圓球樹與外面的深色錐形樹都拿掉。
- 禪堂音樂按鈕（#zenMusicBtn）要直接 onclick：data-act 只在 sheet 裡面才會被處理。
- 11/07 03:40：影子（shadowTick：人物圓影依太陽方向拉長、櫻花樹草地上的影子、sunLight 跟著轉；陰天變淡；夜晚還原圓影）。人數自動模式改成：真人 >60 只顯示真人，≤60 加約 20 位假人（autoCrowd2）。禪堂屋頂加瓦片貼圖（每面依方向算 UV）。雨天：戶外假人「走回家」（leave，不再縮小消失）、戶外的人都撐傘（umbTick，共用幾何、8 色）、貓咪躲雨（CATS.rainHide）。風：葉片／櫻花用 swayPatch（vertex shader 依高度搖晃，SWAY.w 跟風力）。櫻花樹改成野生感：大小高低、樹冠扁長、歪斜、成叢分布。
- 11/07 03:50：天氣改成「一天一種」：每天台灣時間 06:00–11:00 之間隨機一個時刻換（wxAuto/wxDay/wxHash，全服一致）。雨天：鐵口直斷攤（FTB.g）和兩位收驚阿嬤收起來（WX.shut；點了會提示躲雨），排收驚的假人也會離開；戶外假人 45% 機率陸續走回家。傘：八片傘面、傘骨線、舉傘的手（Avatar.update 裡 umbArm）。
- 11/07 04:30：
  - 禪房（INN，模組在 floorsPlain 之後；右側後埕外 x 31–55、z -40…-15）：外觀簡約公寓，前方坡道＋玻璃欄杆走廊上 2F。1F 櫃台阿姨（station innDesk：領床具、飯店說話）、榻榻米通鋪 20 個床位（要領床具，躺下才出現棉被）、日式溫泉（進水自動頭頂毛巾）。2F 4 間套房：大床可躺、床頭櫃、電視播小幽靈輪播、廁所／浴缸可坐、蓮蓬頭點了會噴水；門可鎖（#innLockBtn，離開房間或下線自動解鎖）。
  - **建築模式陷阱**：buildUnits() 把場景最上層的群組依序編號 g-區-N，新加的最上層群組會讓編號位移，主委存的配置就會去藏錯東西（禪房一開始整棟看不到就是這原因）。新加的最上層東西一律設 userData.noBuild=1（skipTop 會跳過），舊編號才不會亂。禪院、禪房、櫻花、雨、影子片都已加。
  - 欄杆外的磁磚刪除：前庭 yard 原本 78 寬、往前多出 25 m，現在只鋪到欄杆內（x ±25.6、到 HZ+YX+24），外面全是草皮。
  - 禪堂音樂／廣角按鈕修好：頁面主程式不是全域，HTML 的 onclick="…" 看不到 ensureAudio/HANDLERS/ZEN，之前按了會報錯沒反應。改成在 JS 裡設 .onclick。以後新按鈕不要用 inline onclick 呼叫遊戲函式。
  - 建築影子（shdBuild/shdPlace）：正殿、側殿、後殿、金爐、許願樹一片柔和影子，跟太陽方向走；欄杆外的東西不加。
  - 雨天：假人直接下線；只有收驚阿嬤、鐵口直斷走路回家。第一次下雨卡頓：改成 9 秒時先預編譯，反射用 64px 立方圖每幀只畫一面。傘改成 8 片小斜面＋細骨線。
  - 每日統計：頁面 statInc(k) 累積（選單 a_、按鈕 b_、地點 st_、座位 sit_、各區在線分鐘、訪客／進場），每 5 分鐘和切走時送 POST /stat（每 id 20 秒最多一次、每次 40 項、每天 300 種）。伺服器自己算的：許願、點燈、留言、紅包等 POST，和每小時最高同時在線（/set）。存 Lobby "st:YYYY-MM-DD"（台灣日期，保留 60 天，記憶體累積每分鐘最多寫一次）。主委工具「📊 每日統計」看今天、熱鬧時段、今天的許願、近 14 天。之後 NPC 互動用這份資料。
- 11/07 12:40：
  - 禪房太亮：原因是 3 顆「窗戶夜光」加亮光球放在一樓室內、白天也亮，鏡頭一靠近整片變白橘。現在只在晚上亮，在禪房裡面時關掉；溫泉蒸氣淡一半。
  - 櫃台後補牆（x=41.05，通往通鋪、溫泉各一道門，門上掛「通 鋪」「♨ 溫 泉」牌），通鋪和溫泉之間也有牆。
  - 模擬市民切開視角（INN.cut / innCutTick）：一樓時整個二樓＋屋頂消失；二樓時屋頂消失。靠鏡頭那面（或擋在鏡頭和人中間的）外牆降成 0.5 m，室內牆 1.1 m，遠的外牆保持完整。鏡頭在禪房裡不受房間限制（camOK/camRoom 看 INN.cutMode），俯角至少 .66、距離至少 6.5。
  - 通鋪：床位改成 49 格鋪滿整片榻榻米；有床具時，在通鋪出現「🛏️ 睡在這裡」→ 找最近的空位鋪棉被躺下。
  - 泡湯：進水自動換黑色短袖短褲（innSwim，style 9 顏色 0、拿掉裝備），出水換回；遠端玩家換裝訊息在泡湯時只記下不套用。
  - 鏡頭：① 焦點高度跟著腳下地面（之前固定 1 m，上二樓、上拱橋鏡頭就掉到下面）② 只剩一個 FOV 控制：之前禪院程式和主鏡頭一個要 62°一個要 55°，每幀互搶 → 抖動，已移除禪院那段 ③ 鏡頭被牆擠近時改成慢慢變廣角（camTight，最多 +24°）④ 後埕左右兩道門鏡頭可以穿過（拱門不再卡）⑤ 禪院裡雙指縮放／滾輪改成調廣角（ZEN.fovX 0–34°），拿掉廣角按鈕。
- 11/07 13:20：
  - 禪房整棟往外移 6 m（INN.DX=6）：模組裡的座標都是「房子自己的座標」，房子群組 root.position.x=DX；給外面用的 innIn/innSuiteAt/innPool/innWalkable/innRoute 是世界座標包裝（內部版本叫 …L）。建造時登記的 SEATS、蓮蓬頭、阿姨、櫃台、電視點擊都已加 DX。
  - 上樓改成樓梯：在門口步道北邊（z -30.4 起步 → -40.2），上到北側平台（LZ0 -42.4）再接前面二樓空橋；不再壓在大門口上方。樓梯兩側、平台、空橋都有欄杆（白柱＋木扶手＋玻璃），可走範圍都在欄杆內。
  - 二樓地板高度修正：INN.F2 4.6→4.96（之前人站在地板裡 0.36 m、躺床時身體埋進床墊）。躺下姿勢改成身體置中、頭在枕頭上（parts z +.55），套房床位 z 改 s0+1.2。
- 11/07 13:40 報紙第一批（天后宮日報）：
  - public/paper-gen.js：產生報紙的純函式（buildPaper），伺服器和單機測試頁共用。各種新聞有多種寫法，用日期當亂數，並記住最近 80 個用過的寫法，避免重複。天氣和兩個「事件」（晴天收驚阿嬤中暑、風大鐵口直斷攤子被吹走）的公式跟遊戲裡 incHeat/incStall 一樣，兩邊要同步。
  - 伺服器：/stat 會帶名字，記每位玩家的數字（st.p，每天最多 400 人）；/nev 記有名字的事件（tudi500、pkBig）；/lb、/nmrec 有人拿到第一名就自動記一筆；GET /paper 回傳昨天的報紙（當天第一次有人要時才產生，存 paper:日期，保留 30 天），?live=1 是主委預覽今天到目前為止的版本。
  - 遊戲：進遊戲時，若今天還沒看過報紙（新玩家第一次除外）→ 黑畫面 →（瀏覽器規定要先點一下才能出聲）點一下 → 叮叮兩聲＋阿嬤聲音「報紙到囉！」→ 報紙轉著放大成全螢幕；公告裡有「📰 天后宮日報」可以再打開。彈珠台買珠子與換錢會記 pkBuy/pkCash，大額換錢記 pkBig；土地公挖到 500 記 tudi500。
  - 照片（3D 現場照）是第二批；目前照片位置用大圖示代替。
- 11/07 14:30：
  - 影子：所有戶外物件（建築模式的物件群組：石燈、石獅、香爐、旗杆、樹…）在合併場景時收集（shdCollect），每個一片柔和影子，用同一個 instanced draw；長度上限 SHD_MAXL=1.5 倍高度，人物也用同一個上限與方向；影子高度 SHD_Y=.065（之前 .024 被廟埕磁磚蓋住看不到）。
  - 雨天：合併後的地板若有 1/3 以上在戶外就會變濕（偏殿旁磁磚）；草皮淋濕變暗、變光滑，反射天空。
  - 禪房：溫泉改橢圓池＋石頭沿池邊、黑色亮面地板、L 形落地窗＋窗外彩色樹（用禪院樹葉材質）、水面第一次靠近時拍一張反射圖（CubeCamera 128）；大廳與套房地板木紋（innWood：木板貼圖兼凹凸、略亮）；大廳沙發角（可坐）、10 幅畫（inn-art.webp 圖集）、暖色紙燈＋光暈（不加真的燈）；套房開窗；每間套房屋頂分開，在房內只掀自己房間的屋頂，鏡頭只停在自己房間上方，隔間牆保持全高（看不到隔壁）。
  - 收費：通鋪床具一次 50（睡一覺就收回），套房房卡一次 100（離開房間就退房；沒房卡進套房會被請出來）；主委免費。
  - 禪房靜態物件合併成每種外觀一個 mesh（innMerge，約 340 個合成，剩約 575 個 → 之前 830）。
  - 入口：踏石路改兩排大石；牆門通行寬一點；鏡頭可以從後埕兩側牆上方越過。
  - 靜思禪院改成一直顯示（之前要靠近才出現）；禪院木橋改木紋。
  - 電腦滑鼠：在地上要點兩下才會走過去（點一下物件照常）。
  - 廟門：門扇改用主委的兩張門神圖（door-god-l/r.webp），不再等裝飾模型。
  - 報紙：黑白；頭條和第一則新聞各一張照片（開報紙時用遊戲畫面在對應地點拍）；人數改用玩家畫面上看到的數字（真人＋假人，/stat 帶 m:{sp,sHH}）；拜拜／擲筊／求籤／許願加上「常客」估計值（每小時假人數 × 次數），所以熱鬧的日子不會只寫幾次。
- 11/07 14:40：主委選單重新分組（訊息／報紙與統計／表演與活動／環境／線上人數／主委自己／測試工具）。新增「📰 報紙測試」：播放開場、昨天的報紙、預覽今天（伺服器 ?live=1）、換一份範例、範例情境（阿嬤中暑、攤子被吹走、雷雨、下雨、彈珠台破產、平靜的一天；paper-gen 的 force 參數只在測試用）、讓下次進遊戲再出現一次。
- 11/07 14:55：新增 public/about.html（遊戲介紹＋香油錢贊助頁，給金流公司審核）：部署後網址是 /about.html。黃底是待填（營運者名稱、統編、地址、客服信箱電話、服務時間、贊助金額、發票／收據方式、退款天數）。「前往付款」按鈕目前停用，金流開通後把 #payBtn 的 href 換成金流付款連結並拿掉 aria-disabled。
- 11/07 15:30（進行中，尚未截圖驗證）：
  - 報紙：照片自動調亮（auto levels）、第二張照片改成新聞旁的小圖、廣告改用主委的 10 張彩色海報（public/ads/p01–p10.webp）＋10 張版畫插圖配我寫的廣告詞（b01–b10，文字在 paper-gen.js 的 BADS）；「換一份範例」每次換日期、人名、數字、新聞組合。
  - 禪房：一樓挑高 H1 5.6（F2 5.96），一樓不再切開（只有套房內才掀屋頂）；畫改掛在空牆（大廳大張橫幅、通鋪牆、床頭上方高一點），不再蓋住門牌；溫泉內牆黑色；電視無字幕；拿掉空橋上飄的黑條；二樓陽台加屋簷；203 門口的木條移開；櫃台降低、阿姨放大 1.2 倍；套房窗邊一桌兩椅（可坐）；陽台加墊高花圃種彩色樹。
  - 坐下／躺下：鏡頭對準身體，坐定後自動轉到角色背後。
  - 每日統計：拜拜／擲筊／求籤／收驚（sjDone）／算命（ftDone）／點燈／許願＋各有幾位不同玩家（伺服器 uniq）；其他項目全部中文，沒有中文名的併成「其他操作」。
- 11/07 16:30：禪房二樓改成八間套房：201–204 在西側（門開在外面空橋），205–208 在東側（門開在室內走廊 x 42–43.6）；走廊從北側陽台進去（陽台沿北牆從樓梯平台延伸到 x 43.6，有欄杆）。INN.suites 每間有 e（東側）、xa（門那面牆）、xb（窗那面牆）、ox（東側家具位移 12.6）。innSuiteAtL 回傳 0–7，innCorr 是走廊，路線多了 b（陽台）和 k（走廊）兩區。東側房間窗外地上有 2.6 m 高的花台，樹長到窗戶高度；西側房間在門旁開小窗＋浴室霧面窗。屋頂每間一塊＋走廊一塊（suiteRoof 8），在走廊時只掀走廊屋頂。已用程式模擬走到 202 和 206，一路高度正確。
- 11/07 16:40：只部署網站：main 加了 public/about.html 與 public/about/*.jpg（5206a04），遊戲本身沒動；audio-fix 已合併這個 main，之後照常「部署」即可。
- 11/07 17:50：碰撞（COL）：場景建好時（mergeStatic）和 8/20/45 秒後各掃一次，把地面上每個實心物件（底部低於 1 m、高於 0.3 m、不是地板、不是整棟建築那麼大）的外框蓋進 25 cm 格子；座位、拜墊、床、各攤位站的位置、收驚排隊位、溫泉池保持可走。walkable() 先查格子（禪房二樓不查）。點地走路時 planPath 會在穿過物件的那一段用 A* 繞路（planPath0 是原本的分區路線）。搖桿本來就會沿著擋住的東西滑。

## 2026-11-07 晚 — 禪房／廟區一批修正（測試版 v17）
- 拱門（石獅外面那座 g-X-17）：zenHideTrees 只藏「樹」，有廟紅色的物件不藏。
- 碰撞格 colBuild 改成「三角形切 0.3–1.0 m 高度帶」：月門／拱門／門框的開口不再被外框盒子堵死（搖桿卡側殿入口、正殿側門）。長條細物件也走三角形。
- 影子 shdCollect：最薄邊 < .35 的不投影（贊助牆下的怪條紋）。側殿門口兩支投射燈拿掉。
- 下雨：磁磚反射 .32→.2；濕草地不再變平滑鏡面（roughness→.66、metalness 0、env .28）。
- 後殿／側殿後方到後欄杆鋪滿磁磚。
- 路人／跪拜假人：約一半隨機戴夜市小遊戲獎品（地瓜球／珍奶／爆炸頭／香腸／烤肉串）。
- 算命先生：臉上咖啡色魚尾紋／法令紋／斑點拿掉。
- 禪房：
  - 二樓中間走廊 1.6→2.4 m（SX1 41.6、KX1 44.0，中心仍是 42.8）。
  - 內牆（走廊側、浴室牆）平常全高，擋在鏡頭和人之間才降一半（e.drop，key 含 ib）。
  - 套房門預設關，有人走近才滑開（上鎖不開）。
  - 西側（面廟）浴室窗加窗簾，點一下開／關（innCurt:i，只在自己畫面）。
  - 樓梯平台、外走廊、北陽台加屋頂（INN.eaveM，人在下面且鏡頭比屋頂高時變半透明）；wxOutdoor 把這區當室內（不撐傘）。
  - 外牆清水模（每片外牆加子物件 skin，跟著剖面一起降）。
  - 櫃台阿姨面向大門（每幀固定 root.rotation.y=-π/2，原本被別處改成 π），身後木板掛畫。
  - 大廳灰色玻璃→三幅大畫；溫泉窗上方與轉角補黑牆；窗外的樹往外移不穿模。
- 禪房東側一樓的高花圃（連同裡面的樹）整個拿掉。
- 真實玩家名字前加「．」，只有主委（me.sp）看得到（av.real=1；me.sp 變了會重畫名牌）。
- 測試版注意：artifact 不收 .m4a，發布測試版時把 busk/*.m4a 複製成 .mp4、index.html 裡 .m4a 全換 .mp4（正式站不用）。
- 玖玖：聽得到的範圍減半（約 16 m 內，28 m 外不載入）；頭髮全黑；麥克風降到嘴的高度；原本根本沒人呼叫他的 update（不會動、方向也錯），現在 buskTick 裡固定位置＋update，彈唱時左右搖擺、點頭、靠近麥克風、腳打拍子。
- 路人跳舞：planBusk(n)——同時約 2–3 個路人走到玖玖前方隨機空位，面向他跳 25–55 秒（buskD／buskSpot）。

## 2026-11-07 晚（v19）
- 玖玖 12 首（第 12 首〈城市停電了〉新加）全部從原檔重轉，loudnorm I=-15（實測 -13.3～-14.5 LUFS，彼此一致）。BUSK.names 歌名、BUSK.order 播放順序 1,11,10,9,12,8,7,6,5,4,3,2（buskNow/buskNext）。
- 點玖玖（addHit "buskTip"）：打賞 50／100（主委免費）→ 他說「玩家名謝謝你！愛你！」；應援 → 走到他身邊空位、跳一支 loop 舞 12 秒 → 幸福感 UP（愛心飄＋音效）。走開就沒有。stat：buskTip / buskCheer。
- 禪堂音樂：先選分類（廟裡音樂／煙火／街頭藝人玖玖），進去可選單曲、單曲循環／循環播放／隨機播放（ZM，存 mz.zenMode；TRK.zen ended → zenNext）。
- 禪房：外牆壁燈（樓上樓下，晚上亮＋光暈 INN.scM/scG）；二樓窗戶晚上透出暖光（INN.glass2）；溫泉門口「湯」暖簾、通鋪門口「ZZ」暖簾；溫泉煙霧變多變明顯一點。
- 坐下／躺下：鏡頭對準身體（torso 世界座標），不再往前上方看（camSeatK）。
- 禪院：溪水做反射（靠近時拍一次 cube map）；廳內光束改成從南、西兩側開口斜照進來落在地板，不再從天上直直下來（花園裡的光束不變）。
- 修：在玖玖旁邊跳舞的路人，每輪跳完改成「幸福感 UP」，不再跑出貓咪那邊的「股市飆漲」（n.danceBusk）。

## 2026-11-07 晚（v21）
- 報紙加玖玖新聞：點播榜（bk01–bk12：在他旁邊或禪院裡聽同一首滿 60 秒算 1 次）、打賞總額（buskTipC，worker KEEP 也加了）、應援人次；下雨天他留下來唱 → 隔天頭條「街頭藝人雨中深情開唱」（失戀梗）。
- 下雨／雷雨：玖玖通常收攤（人、麥克風架、音箱都收、音樂停、路人不去跳）；約 28% 的雨天留下來淋雨唱（evBuskRain，paper-gen.js 與 index.html buskRainStay 同公式）。報紙測試加「🎸 玖玖雨中開唱」。
- 禪房小徑：兩側櫻花樹、4 支路燈（晚上亮）；戶外只能走石板小徑和樓梯口，不能繞到房子兩側和後面。
- 禪院：白色灰塵粒子只留在斜照進來的光束裡，變少變淡、原地飄。
- 坐椅子起身：恢復坐下前的鏡頭角度，起身 1.6 秒內鏡頭不往上爬（之前會跳到高空）。
- 東側套房窗邊兩張椅子改成面向大窗，坐下鏡頭在背後低角度，看得到人看窗外。
- 天氣：機率 晴 40%／陰 20%／風大 15%／雨 15%／雷雨 10%，每天早上 6–11 點之間換一次；正式站 main 還沒部署過天氣系統。
- 天氣改成跟「遊戲裡的一天」走（24 分鐘，遊戲天亮時換）：gDay/gStart/wxG（index.html 與 paper-gen.js 同公式），機率不變（晴 40／陰 20／風 15／雨 15／雷雨 10）。
  - 玖玖雨天留下來：每個遊戲日各自決定（wxHash(g*41+7)<.28）。
  - 事件仍以日曆日決定：中暑日只在晴天的遊戲日少一位阿嬤；攤子被吹走＝當天下午第一個風大的遊戲日吹走、到半夜都不在（incStallG / stallG）。
  - 報紙的天氣用 dayWx：一天裡雷雨 ≥10 次記雷雨、雨+雷雨 ≥20 次記雨天，否則取最多的那種；預報同理。
- 修：玖玖雨天收攤時，他站的位置不能再點（從 pickables 拿掉），不會再對著空地說「收攤了」。
- 算命攤被吹走時：老師傅改成站著（ftTick 跳過坐姿），點他只說「我早就算到會有這麼一天，今天只能休息一天了」，不開算命；報紙三篇內文的老師傅台詞也改成這句。
- 報紙照片：攤子新聞改從老師傅正前方拍（舊角度被旁邊的燈柱擋住），左右晃動幅度縮小；玖玖的四種新聞也有自己的拍照位置。
- 阿嬤中暑改成一週一次（每週隨機挑一天，那天只要遊戲裡是晴天就少一位）。
- 算命攤被吹走也改成一週一次（每週隨機挑一天，當天下午第一次颳大風時吹走）。
- 禪堂裡鏡頭不會跑出禪堂（camLimit 加 inZen：限制在 ZEN.hall 內、高度 FY+3.2 以下），廣角最遠就到牆邊。
- 卡頓：禪院溪水、溫泉的反射照片改成每幀拍一面（6 幀拍完，96 解析度），不再走進去瞬間卡一下；禪堂地板倒影改成隔幀更新（低配每 3 幀），每幀掃整個場景找燈的動作改成約 2 秒一次。
- 報紙：paper-gen.js 加版本號避免手機讀到舊檔；玖玖雨中開唱頭條降到大約一週一次。
- 名字、對話泡泡、主委彩字改由第二個小畫布（#lblc，最高 2 倍解析度）畫在最上層：3D 畫面為了順暢降解析度時，字不會跟著糊（LBL / lblReg / lblRender，原標籤放 layer 7 主鏡頭不畫）。在別的殿裡的人（camRoom 不同且不是戶外）名字不顯示，免得穿牆。
- 所有聲音最後經過一個輕限幅器（audioOut），音量疊加時不再爆音；背景音樂、玖玖的音量只有真的變化時才調（之前每幀重設，部分手機會有電流聲）。
- 走過禪院／禪房的拱門時，鏡頭直接穿過去，不再自動調角度。
- 溫泉煙霧減為 9 團、縮小（大片半透明圖蓋滿螢幕會拖慢手機）。
- 「睡在這裡」「鎖門／開門」按鈕移到畫面下方中間（跟看煙火按鈕同位置、同樣式，class act-mid）。
- 修：拿掉上一版的限幅器（壓縮器讓音樂聽起來快破音），改成單純總音量 0.85。
- 修：畫面忽然跳一下——自動調解析度時會呼叫 resize()，把鏡頭焦距硬設回 62/52 度；現在調解析度只改清晰度，resize 也只有第一次設焦距。鏡頭位置要大幅移動時（撞牆、拱門、廣角）改成較慢地滑過去。
- 「🎵 禪堂音樂」按鈕也移到畫面下方中間。
- 新動作（ACTS 10–13，加在最後）：🐢 趴下、🧘 坐下、😭 哭泣（雙手摀臉、肩膀抖、噴眼淚）、🩰 芭蕾轉圈（踮腳單腳、雙手舉高一直轉）。都是持續型，走動就停；路人也會隨機做。
- 修：做完動作走路腳歪——停止動作時腳、身體、頭的角度全部歸零（坐下、芭蕾、廣場舞都會留下側傾）。
- 修：凌晨轉早上畫面突然變亮——太陽位置在一天交界時從傍晚低角度瞬間跳到中午高角度；現在天亮那段（p .86→1）太陽平滑爬回去，交界前後光線數值連續。

## 2026-11-07 23:20 — 禪堂閃退修正（未部署）
- 原因推測：手機（尤其 iPhone）圖形記憶體不足。v27 起名字/對話泡泡用了「第二個 3D 繪圖面」(LBL WebGLRenderer)，加上禪堂鏡面地板、河面反射，進禪堂時記憶體與著色器編譯尖峰一起來，瀏覽器就把頁面殺掉。
- 修正：
  - 名字/泡泡改用 2D 畫布疊在上層（canvas #lblc，getContext("2d")），不再開第二個 WebGL；字一樣清楚，房間遮擋判斷不變。
  - 禪堂鏡面地板不再用 clippingPlanes（會讓每個材質多編一份著色器），改成「斜近平面」投影切掉地板下。
  - 手機 (Q.phone)：鏡面 256、每 3 幀更新；禪堂/溫泉反射 cube 64。
  - webglcontextlost：記下 mz.crash、提示後自動重新整理；20 分鐘內「自動」畫質會以低配跑。

## 2026-11-08 00:45 — 玖玖下雨走路離開、拔掉方形雕花窗（未部署）
- 玖玖下雨：先說「下雨了，今天先收攤囉！」，1.4 秒後收麥克風架和音箱，再走到 x=-22.5 才消失（跟收驚阿嬤一樣）；雨停從那裡走回來，到位才擺回架子、開唱。音符與音樂在收攤那一刻就清掉。一進遊戲就在下雨則直接不在。BUSK.ex / B.wk（pack/out/gone/back）。
- 後殿的方形雕花窗 decor "win"（正面牆兩個疊在八角花窗後面、兩側牆各一個）拿掉；用 ++dn 保留 rdec 編號，存好的配置 id 不會錯位。
- 若主委在擺設模式自己新增過「雕花窗」(decor:win)，那些不受影響，要在擺設模式刪。

## 2026-11-08 01:50 — 真人多時假人全消失（未部署）
- 原因：botWant 的名額 = 繪製上限(BOT.cap) − 真人數。真人 45 位，加上人多變慢時 BOT.cap 自動往下調，名額變 0，假人一個都不生，但人數顯示仍是 89。
- 修正：名額至少保留 floor（一般 20、低配 12、省電 6），真人再多也有假人在場；仍不超過該殿應有的假人數。

## 2026-11-08 01:45 — 部署
- main = 3b905f1（Workers Build success）。包含：天亮平滑、禪堂閃退修正（2D 名字圖層／斜近平面鏡面／手機減量／context lost 自動重整）、玖玖下雨走路離開、拔方形雕花窗、真人多時保留假人。

## 2026-11-08 01:55 — 沒名字的跪拜假人不戴小遊戲飾品（未部署）
- 只有有名字的假人（makeBot）隨機戴夜市獎品；蒲團上沒名字的跪拜假人拿掉飾品。

## 2026-11-08 02:20 — 溫泉微光（未部署）
- 不加真的燈（加燈會讓所有材質重編，手機會卡），改用：黑石地板與岩石加一點暖色自發光、水面青色自發光略增、石燈籠窗格亮起＋光暈、水底兩團青光、牆邊六團低矮暖光（additive sprites）。
- d316a07 已部署成功（main 的建置 128480278453 success；128480183785 是卡住的舊一筆）。

## 2026-11-08 04:20 — 三十個新頭飾（未部署）
- 模型：主委給的三個 glb（每個一張 5×2 頭飾）依連通塊中心切成 30 頂 → `public/hats2.glb`（貼圖 768，gltfpack -cc -kn）、`hats2-lite.glb`（貼圖 512，-si 0.6）。工作檔在 ~/hats30（split.py / merge.py / icons.py）。
- 圖示：主委給的三張圖去白底裁切 → `public/hat2-icons.webp`（一排 30 格，順序同 HAT2）。bic() 先查 HAT2。
- 程式：HAT2 陣列（id、名稱、特效說明）加進 ACC 與 HAT_FIT（m:"hats2"，w .74 y -.15；髮箍類較小）；HAT2_LIFT 名字高度。順序是存檔代碼的一部分，新的只能加在最後。
- 特效：HFX 表 + hfxTick（accTick 內呼叫，25 m 內才噴、parts>420 停）。種類：粒子（文字、愛心、花瓣、水滴、米粒、硬幣、貓掌、像素、彩紙…）、煙、地上金色光圈、固定光暈（天使光環、鮟鱇燈泡、南瓜燈）、繞頭轉（鬼火、小鮭魚、粉紅螢火蟲）。
- 戴模型頭飾時：隱藏造型自帶的帽子（hat-*）與頭頂翹起的頭髮（hair-* 內 min.y>.12 或 max.y>.4 的網格）；已烘焙的真人會重建造型（_bakeTop）。
- 取得方式：跟前十頂一樣，目前只有主委（自動擁有全部）和主委送禮。測試頁另外上傳 hats2-model.js / hats2-lite-model.js / hat2-icons.webp。

## 2026-11-08 10:58 — 部署
- main = 74d7678（Workers Build success）：三十個新頭飾（只有主委有，主委可送禮）。

## 2026-11-08 12:40 — 頭飾特效第二輪（未部署）
- 殭屍官帽：走路變殭屍跳（update 內 hop），新增動作 ACTS[14]「殭屍跳」。
- 蘋果帽臉頰紅暈發光；天使光環：模型上的光環切掉（merge.py 對 h_angel 去掉上方 34%），改成遊戲畫的發光光環（兩圈 torus + 光暈）。
- 鯊鯊帽紅色血汗、飯糰帽冒煙、電視螢幕彩條發光（加法混色平面）、扶桑花一隻蝴蝶、蒸汽龐克齒輪繞飛、壽司小魚改平面魚（頭朝前進方向）且變大、海盜金幣更多更亮、櫻花花環三隻蝴蝶、貓掌帽走路粉紅腳印、荷葉雨滴更明顯。
- 尺寸：綿羊、小惡魔加大；荷葉抬高加大；小籠包 rx .2 rz -.45 擺正；啤酒杯 w .95 蓋住後腦。HAT_FIT 新增 rz。
- 刪除鮟鱇魚帽、兇兇鯊魚帽：ACC.gone=1（保留條目，存檔代碼順序不變），各清單過濾，setAcc 視為沒戴。
- 舊頭飾特效：金鳳冠閃光、瓜皮帽紅包環繞、竹斗笠噴汗、桃花髮箍小花旋轉、鈴鐺貓耳黑腳印、虎頭帽大腳印、月亮巫師帽掛月亮、茉莉花環粉紅香氣、福氣帽紅「福」、狐狸面具長尾巴（foxTail，掛在 hips）。
- 腳印：FOOT 清單 + footTick（主迴圈），4 秒淡出，最多 160 個。
- 假人（npcs）也跑 accTick，戴的飾品有特效。

## 2026-11-08 13:20 — 報紙擴充、贊助登報、頭飾定位工具、頭飾第三輪（未部署）
- 報紙：每個夜市攤位都會上報（nmP_*/nmW_* 計數，nmStart/nmEnd），夜市人氣榜、收驚 sjDone、算命 ftDone、溫泉 sit_tub；內頁最多 7 則。worker KEEP 加 nmP_*。
- 贊助登報（主委工具 → 報紙與統計）：/sponsor（checkKey）。「今天」= 重新出刊昨天那份（paperOld:day 保留期數，rev+1）；「明天」= 寫進今天的 nw。單人模板 sponsor1、多人模板 sponsorN（條列）。頭版 white-space:pre-line。測試頁存在 mz.spTest。
- 報紙打開不卡：先打開，照片之後一張一張拍再換上（paperPhotos 非同步）。paper-gen import 版號 20261108a。
- 頭飾定位（主委工具 → 頭飾）：選帽子 + 拉桿（大小/上下/前後/左右/前後傾/左右歪/轉向/前後厚度/特效上下前後左右），用換裝的臉部鏡頭；存 /hatfit（checkKey），所有人載入時套用（hatFitLoad）。測試頁存 mz.hatfit。
- hats2 預設改用帽子下緣（rim）定位：HAT2_RIM 表（離線量），w 依下緣寬度、ox/oz 下緣置中、zs 前後拉深包住頭。
- 物品說明不再描述特效（新舊頭飾、神明飾品都拿掉特效描述）。
- 青蛙帽：多一顆「🐸 跳」按鈕（ACTS[15] 青蛙跳，hide 不出現在動作選單）。墨鏡：閃光在鏡片左下角。小籠包戴正（rx .1）。電視光往前。西瓜籽從嘴巴噴。乳牛帽：每約 10 秒合成牛叫聲（mooSound）。蝴蝶改 3D 側飛拍翅。貓腳印 ×1.5。月亮移到帽子右上。茉莉花小白花往外飄。福氣帽「吸福」：福字從四周吸進來（一半倒福）。狐狸尾巴短胖捲。殭屍跳更高。蘋果紅暈下移、拿掉平安字。

## 2026-11-08 13:40 — 帽子不再前後拉長、乳牛帽噴牛奶（未部署）
- 拿掉 hats2 的前後拉深（zs），帽子恢復原本形狀；下緣置中與寬度仍用 HAT2_RIM。頭飾定位工具的「前後厚度」仍可手動調。
- 乳牛帽：牛叫聲改成每約 2.6 秒從嘴巴噴一陣白色牛奶滴。

- 頭飾定位加「左右厚度」(xs) 拉桿。

## 2026-11-08 15:10 — 報紙大量新聞、照片預拍、贊助留言改主委（未部署）
- 贊助留言是「主委說：「…」」（單人）／「主委：「…」」（多人條列）；表單提示改「主委想說的話」。
- 照片預拍：paperPrepare 在報紙打開前先拍好（第一次彈出前 1.5 s 先拍，已看過的 9 s 後背景拍），存 mz.paperPh（key=日期#rev#種類），打開直接用。重新出刊（rev）會再彈一次。
- 新增：煙火新聞（runFw 時 newsAdd k:"fw"，寫哪一場、HH:MM、主委結尾的話）、fun 趣聞 90 則、tale 神蹟／網路社團 32 則，每天 2~4 則；中暑、算命攤、玖玖雨中各多 1~2 種寫法；online/zen/sleep/calm 多寫法。
- pickT 的 used 改成「種類:id」（舊的 id 有跨種類重複），保留最近 260 筆。模擬 30 天不重複。
- 昨日數字拿掉「最高同時在線」，最熱鬧顯示 20:00 格式。
- 乳牛帽：嘴巴牛奶噴泉一直噴。

## 2026-11-08 15:40 — 彈珠閃退：記憶體洩漏修正（未部署）
- 根因：Avatar.dispose 只從場景移除，烘焙的身體幾何、名牌、對話泡泡貼圖都沒釋放；泡泡到期也只移除不 dispose。假人來來去去、一直講話，記憶體只增不減，玩久了（彈珠一玩很久）手機就關掉頁面。
- 修正：relSprite（貼圖+材質+canvas 歸零）用在名牌、泡泡；dispose 釋放 skinBake 幾何與頭飾特效；小遊戲關閉時 canvas 歸零（iPhone 才會真的放掉）；報紙照片 canvas 歸零；tone 每 0.25 秒最多 24 個。
- 驗證：模擬 20 個假人建立/移除 5 輪，舊版每輪多 ~20 貼圖、~17 幾何；新版每輪 ~1~2。

## 2026-11-08 16:00 — 玖玖歌聲可以自己關（未部署）
- 聲音面板多一條「街頭藝人」音量（VOL.b，bVol()）；0 = 完全不播、背景音樂也不再為他壓低。點玖玖多一個「我不想聽他唱歌／我想聽他唱歌」切換。只影響自己。

- 乳牛帽改成像後埕龍泉的牛奶噴泉：從嘴巴拉出一條會流動的牛奶水柱（MILK_TEX 捲動、左右輕擺、粗細抖動），落點有水花和濺起的奶滴。

## 2026-11-08 18:40 — 報紙自己送到（未部署）
- 當天第一次：等「正在點燈」讀取畫面消失後 1.2 秒、照片預拍好，直接播「報紙到囉！」（不用點），1.7 秒後自動打開。
- 福氣帽：頭後面多一個金色光圈（光盤＋兩圈光環＋慢慢轉的光芒），吸福特效保留。

## 2026-11-08 19:05 — 主委的帽子定位寫進遊戲
- HAT_FIT_CHAIR：主委在測試頁調好的 35 頂（設定碼），在 HAT_FIT0 快照之前套用，成為內建預設（重設也回到這裡）。之後在正式站調再存到 /hatfit 會疊在上面。

## 2026-11-08 19:30 — 榮譽功德榜（未部署）
- 觀音後面那面牆：36 塊感謝看板拿掉，改成左右兩塊黑色花崗岩（刻所有贊助人＋金額，500 以上金字、其餘白字，依金額排序），上方各一塊「榮譽功德榜」紅底金字匾，整面牆外圈和石板、匾額都有彩虹跑馬霓虹（InstancedMesh，靠近才更新）。
- 資料：THANKS（早期 28 位，從文字解析名字/金額）＋伺服器 /honor（贊助登報新增時自動加入，刪除登報那筆也一起刪）。點石板開清單，早期贊助人可看感謝圖（openThanks）。
- 測試頁存在 mz.honor。

## 2026-11-08 20:30 — 招財貓扭蛋機＋功德榜累計（未部署）
- 功德榜：同名（不分大小寫、去空白）金額自動累計成一筆；清單拿掉感謝圖按鈕。
- 扭蛋機：主委上傳的招財貓模型（gacha.glb 750KB / gacha-lite.glb 405KB，gltfpack -si），放在廟埕三隻小貓旁 (9.6, 35.2)，約 4.1m 高，面向 -x。點它或走近 station 開面板。
- 10 枚扭蛋幣轉一次，獎池 = HAT_FIT_CHAIR 的 35 頂（排除 ACC.gone），只抽沒有的 → 35 次抽滿不重複。主委全都有 → 示範轉（不扣幣不改擁有）。
- 防洗：GACHA.busy 鎖、轉之前重讀 localStorage 的 mz.bag（取幣較少、擁有合併，防多分頁）、先扣幣+寫入擁有+saveBag+profSave 再播動畫。
- 開蛋特效：DOM 覆蓋層（光芒、蛋掉下、搖、裂開、帽子圖示、火花），按鈕 馬上戴上／再轉一次／關閉。
- 贈送新增「扭蛋幣」（1/5/10/20/50 或自填，上限 255；存檔碼 bag.gacha 是 8 bits）。worker gift kind gacha。

## 2026-11-08 19:50 — 扭蛋圖鑑先黑影（未部署）
- 扭蛋機面板下方圖鑑：沒拿到的是全黑剪影、名字顯示「？？？」，拿到才出現正確的圖。主委全都有，所以主委看的圖鑑以「這次進遊戲轉到的」為準（GACHA.demo），示範轉會先轉沒轉過的。

## 2026-11-08 20:50 — 贊助登報刪除後不能新增（修正，未部署）
- 主委回報：刪除一位後，後面都新增不了。本機用假 storage 跑 worker（scratchpad/wk/run.mjs）新增/刪除/再新增都正常，推測是正式站「報紙重新出刊」那段出錯或和玩家同時開報紙撞在一起（舊寫法先刪掉報紙再重做，中間有空檔；出錯整個請求就 503）。
- 改法：重新出刊改成先做好新報紙再整份換掉（不再刪除、不再用 paperOld），失敗也不影響贊助存檔，只回 paperErr 讓主委看到原因；報紙多存 usedIn（出刊前的已用題目），重新出刊時故事不會被換掉。
- 前端：伺服器 503/非 JSON 不再當成密碼錯而清掉密碼（之前會清掉，之後每次都失敗）；顯示真正的錯誤（伺服器忙／密碼錯太多次／重新出刊失敗原因）。測試頁刪除也會從功德榜拿掉。

## 2026-11-08 21:10 — 功德榜編輯器、換報紙內容、彈珠台新聞降溫（未部署）
- 主委工具「🪨 榮譽功德榜」（主委點牆上石板也會開）：新增／修改／刪除每一筆。第一次打開會把早期 28 位（THANKS）複製進伺服器（honorSeeded），之後牆上只用伺服器名單，全部都能改。同名自動加總。
- 贊助登報新增時自動加一筆到功德榜；刪除登報那筆不會動功德榜（主委說兩邊各管各的）。
- 主委工具「🔄 換報紙內容」：POST /paper（主委）把今天大家看的報紙用不同 seed、避開剛剛的題目重寫，贊助仍在頭版。報紙多存 seed/usedIn/recentIn，之後贊助重新出刊會沿用同一份內容。
- 「彈珠台大失血」每天都上：那是照真實數據寫的（每天都有人大贏）。paper-gen 加 recent：前三天出現過的數據型新聞優先度 -50（贊助、煙火、紀錄、天氣、趣聞等不受影響）。paperMeta.recent 存最近三天的 kinds。paper-gen ?v=20261108d。

## 2026-11-08 21:55 — 主委查取回碼（未部署）
- 主委工具「玩家 → 🔑 查取回碼」：打名字（部分也行）或取回碼，伺服器 GET /lookup?q=（主委）掃 P:* 存檔，從存檔碼解出名字和平安幣（worker snapInfo()，跟頁面 lookCode() 同格式），列出名字、最後存檔時間、平安幣、取回碼＋複製。玩家到「設定 → 取回碼」輸入就拿回角色。
- 只找得到有存過檔的角色（存檔碼裡的名字）；主委自己的存檔名字是空的。

## 2026-11-08 22:10 — 閃退紀錄（未部署）
- 玩家反映「跳遊戲」越來越多，但沒有任何回報資料。加 CRB：每 4 秒把「在做什麼（面板/站/小遊戲）、位置、玩幾分、畫質、DRES、繪製數/幾何/貼圖、JS heap、人物數、最近錯誤」存 mz.alive；離開（pagehide/切到背景）標 bye。下次打開時若上次沒 bye 且 15 分鐘內 → 上次是在畫面上被殺掉（閃退），POST /crash（kill；1 分鐘內有 webglcontextlost → ctx）。window error / unhandledrejection 也回報（每個訊息一次、每次最多 5 種）。
- 伺服器 /crash：同 IP 20 秒一筆，存最近 400 筆；GET 要主委密碼。
- 主委工具 → 測試工具「💥 閃退紀錄」：近 24 小時依種類／當時在哪／手機＋App／畫質統計，加最近 60 筆明細。
- 本機模擬記憶體 3 分鐘沒有明顯增長；貼圖總量和上次穩定版差不多（扭蛋機 1024 貼圖）。原因要等真實回報。

## 2026-11-08 22:35 — 閃退對策：人物減量、轉向、報紙照片（未部署）
- CUT（mz.cut）：上次在畫面上被關掉（mz.alive 沒 bye）→ 這次人物減半（假人 botWant 一半、跪拜假人 6 位、真人只畫一半，主委一定畫）；3 天內再被關 → 全部關掉（botLimit 0、跪拜 0、真人 0）。進遊戲讀取畫面結束後先跳說明卡（維持原本／好），3 天沒再閃退自動退一級。設定新增「畫面上的人物：全部／減少一半／全部關掉」（手動選的不會自動變，選全部後 6 小時內不再自動降）。真人沒畫的仍算進人數（PEERS.n）。
- 閃退紀錄多記天氣/濕地板/開過哪些反射、同場人數。
- 手機轉向：resize 等 220ms 穩定且尺寸真的變了才重設畫布（以前轉一次觸發好幾次，全螢幕畫布連續重配，可能撐爆記憶體）；小遊戲畫布同樣處理。
- 報紙照片：人物減量或低配時不拍；手機上已看過的報紙不再背景預拍（每張照片會把遠處區域的貼圖載進記憶體）。
- 發現：手機預設假人上限 96（botLimit），加上真人、與「至少 20 位假人」的下限，人多時同場人物很多，懷疑是主因，待閃退紀錄確認。

## 2026-11-08 23:20 — 報紙照片改成預先拍好（未部署）
- public/paperph/<地點>-<n>.webp：用模擬器在遊戲裡拍好的 59 張（前庭、大殿、玖玖、收驚阿嬤、算命攤、土地公、香爐、許願樹、貓、功德榜、溫泉、夜市各攤、彈珠台、夜晚前庭/玖玖），640×400 webp。拍照腳本：scratchpad t_ph2.py＋ph_plan.py（壞掉的鏡頭刪掉）。
- paperLib(p)：依新聞種類（PH_LOC）和日期挑照片，大家看到同一張；PH_IDX 記每個地點有哪幾張。手機不再畫 3D 拍照（paperShoot/paperSpot/mz.paperPh 全拿掉，舊快取清掉），paperPrepare 只是預先下載兩張圖。
- 雨天/風/禪/住宿暫時借用大殿、玖玖、貓、溫泉的照片（雨天拍不出雨，禪院、禪房角度不好）。

## 2026-11-08 23:40 — 閃退紀錄分析＋手機人物上限（未部署）
- 主委貼回 82 筆：幾乎全是 iPhone（iOS 15/17/18/26，Safari 和 LINE），發生在哪都有（走動、面板、剛進遊戲 0.1～1.5 分鐘）。共同點：同場真人 47～58 位＋假人 22～36 位，約 80 個人物；幾何 3000～9800、貼圖 400～960（模擬器同位置約 950／180）。每個人物有自己的臉、頭髮、衣服貼圖（512），80 個就是幾百 MB。LINE 的 iPhone 一進遊戲就 ctx（記憶體不足）連續好幾次。
- 改法：手機上真人只畫最近的 20 位（人物減量一半時 10、關掉時 0；主委一定畫；已畫的人排到第 26 名之後才拿掉，避免邊緣閃爍），新的人物每次最多做 4 個（不再一進來就做 50 個）；假人在手機上和真人加起來最多 32（減半 16），假人下限 6；跪拜假人手機 6 位。人數顯示照算全部。
- 接福水：贏的時候 k3 可能是負數 → ellipse 負半徑報錯，加 Math.max(0,…)。

## 2026-11-09 00:20 — 養貓系統（未部署）
- 模型 public/cat.glb / cat-lite.glb（主委給的 Tripo 貓，去掉法線貼圖，gltfpack -cc -noq；不能量化，花色 shader 用模型座標）。花色全靠 shader（CAT_GLSL，10 種：橘/灰/棕虎斑、三花、玳瑁、賓士、橘白、暹羅、銀虎斑、豹紋），每隻 seed 不同。臉的位置：臉中心 x=-0.09，眼睛 (±0.097, .622)，鼻 (-.09,.567)。原型在 tools/cat/。
- 流浪貓 3 隻（bag.cat.s）：在廟埕走、坐、舔毛、睡（側躺＋Zz），好感 40 以上會靠近你。點牠走過去開面板：摸摸（每天 3 次 +5）、餵罐頭（每天 1 次 +20），滿 100 可領養（一次一隻），隔天補一隻新的。
- 愛心媽媽（15.2, 28.6，station catMom）：罐頭 10 平安幣一罐（1/5/10）；牠旁邊有貓窩、貓砂盆、碗。土地公尋寶多「🥫 貓罐頭」12%。背包有罐頭格。
- 自己的貓（bag.cat.pet）：跟著你（站久會睡），或「回貓窩」。每天餵一罐、清貓砂（要走到貓砂盆，髒了會有便便）、摸摸；心情公式 catMood。4 天沒吃 → 跑去愛心媽媽那裡，餵一罐帶回。訓練 7 個動作（坐下2、握手3、轉圈3、翻滾4、跳高4、招財貓招手5、後空翻7，後空翻要先會 3 個），每個動作每天一次、一天最多 3 次、要吃飽且心情 40+。學會的可以表演。改名。
- 存檔碼後面加：罐頭數、貓（花色、seed、名字、各動作進度）。其他人目前看不到你的貓（還沒同步）。

## 2026-11-09 00:40 — 貓咪換成主委的 11 隻模型＋動作、挖寶、躲雨、生病、肉泥（未部署）
- 主委給 11 個 GLB：網格/UV/骨架相同（頂點順序不同但 (pos,uv) 一樣），只差貼圖 → public/cat.glb（139538b5 那隻，去掉貼圖，gltfpack -cc -noq -kn -kv，-kv 一定要，不然 UV 會被刪）＋ public/catcoat/cat-0..10.webp（512，共 250KB，用到才載）。花色名：三花、灰白、白貓、銀虎斑、紅虎斑、玳瑁、橘虎斑、橘白、賓士、豹紋、暹羅。原本的 shader 花色拿掉。
- 動作全用程式轉骨頭（tools/cat/catrig.js 原型）：身體在模型裡斜 35°（CAT_FWD），外層轉正、頭轉回來。骨頭：Spine_0、Head_1(頭)、0_Left/Right_Limb_0-1(前腳)、bone_15-16(左後)、bone_18-19(右後)、bone_21-22(尾)。動作：idle、sit、walk、run、loaf(趴睡)、side(側躺，上面的腳往下靠：fla/bla 側擺)、dig(前腳挖)、flip(後空翻)。坐著時頭會轉向你。
- 你的貓會挖寶：吃飽且心情 50+ 時，每天最多 2 次，跑去旁邊用前腳挖，帶回 平安幣 50/100/500/1000 或 扭蛋幣 1/5/10（機率 40/24/7/2/18/7/2%）。
- 下雨（WX.r>.45）流浪貓和在家的貓沿 planPath 躲進大殿。
- 生病：每天擲一次，4%（心情<50 時 12%），頭上 🤒、趴著；面板「帶去看獸醫」500～1000 平安幣，住院 1～3 天（期間不在廟裡），回來時提示。
- 訓練一次要一條肉泥（bag.items.treat，愛心媽媽 5 平安幣一條），一天 3 次。存檔碼加肉泥數。背包罐頭/肉泥用主委給的道具圖（catitem-can/treat.webp）。
- 注意：我自己的 catSpot 曾和跳舞貓的 catSpot 同名（後面蓋掉前面），已改名 catPlace。
- 主委工具 → 測試工具「🐈 貓咪測試」：選花色直接領養（換掉現在的）、給 10 罐頭＋10 肉泥、馬上挖寶、讓牠生病、住院馬上回來、全部動作學會、今天次數重來、跑去愛心媽媽、不養了、換一批好感 90 的流浪貓、下雨/放晴（只有自己畫面）。

## 2026-11-09 01:10 — 貓咪換主委的新模型（未部署）
- 新模型（tripo，120 萬點、沒有 UV、沒有骨架、臉是平滑的）→ tools/cat/transfer.py：gltfpack -si 0.006 減到 6.3k 點；用 ICP 對齊舊模型（頭部再單獨對一次），每個點找舊模型最近的三角形拿 UV 和骨架權重（跨 UV 島的三角形拆開各自取，避免接縫糊掉）；舊模型的眼睛/鼻子/嘴/鬍鬚小島不取（會變碎片）。writeglb.py 用舊骨架＋反綁定矩陣寫出 → public/cat.glb（345KB）、cat-lite.glb（-si 0.5，249KB）。11 張花色貼圖、全部動作照用。
- 臉改成 shader 畫（catFaceMat / CAT_FACE_GLSL，模型座標，跟著頭動）：圓眼＋反光、粉紅鼻、ω 嘴、左右各 3 條鬍鬚；CAT_FACES 每種花色的眼睛/鼻子/鬍鬚顏色（白貓異色瞳、賓士白鬍鬚、暹羅深色鼻）。
- 又踩到同名函式：catFace 已經是跳舞貓的，改成 catFaceMat。新增函式前先 grep。

## 2026-11-09 09:30 — 睡覺閉眼、玖玖聲音範圍、手機記憶體回收（未部署）
- 貓睡覺閉眼：CAT_FACE_GLSL 加 uSleep（0 張眼、1 閉眼畫兩條 ‿），catTick 依狀態漸變（睡覺 1、生病 .55、表演/挖東西 0）。material.userData.u 存 shader uniforms。
- 街頭藝人玖玖：聲音只在身邊約 10 格廟埕磁磚（一格 .56 m → 約 5.6 m）內聽得到，2 m 內最大聲。
- 閃退（11/9 早上主委貼的 150 筆）：人數上限上線後，仍有 iPhone 在 geo 4500–6400、tex 700–900 被系統關掉；遊玩分鐘數不長。模擬 iPhone 走遍全區：只有世界本身就累積到 geo ~3000 / tex ~400，走過的地方永遠不還。
  → gpuTrim()（貓咪模組前）：只在手機，每 12 秒把離鏡頭 50 m 以外的形狀與只有它們用的圖片的顯示卡副本釋放（資料留著，走回去自動再上傳）。不碰骨架人物、sprite、影片、反射用的 render target；共用 buffer 只要有一個近就不放。r128 的 Texture 沒有 userData，用 GPUT.off(WeakSet) 記。
- 貓坐著/走路看起來斜：CAT_AX 原本用模型原始 35° 斜的軸，但 rest 的父骨世界旋轉（getWorldQuaternion 會往上更新到 yaw）已經包含拉正，所以軸要用拉正後的 x/z。改成 L=(1,0,0)、F=(0,0,1)，正面看坐姿、走路都對稱了（~/cats11/front.py、side.py）。
- 後空翻／翻滾結束會快速轉回去：表演結束時 rx/rz 還留著一整圈（-2π、1.42+2π），之後的動作慢慢 lerp 回 0 就像倒轉一圈。現在結束時把整圈去掉，catRigPose 混合 rx/rz/ry 時也走最短方向。
- 貓咪面板按鈕「表演」改名「動一動」（含測試工具提示與面板標題）。
- 掛網挖寶：3 分鐘沒點畫面/按鍵（CAT.inT）就算掛網，掛網時每小時挖一次（從最後一次操作或上次掛網挖寶算起，p.ak），不佔每天玩的時候那 2 次。仍要今天有餵、心情 ≥50。
- 流浪貓認定主人：被你餵過就 s.own=1（認定你），之後有別人（其他玩家、走動的假玩家；跪拜和掛網的不算）靠近 2.2 m 就跑開。每多一隻認定你的，就多一隻流浪貓，最多 5 隻（want=min(5,3+認定數)）。認定後連續兩天沒摸/餵（d-s.lv>2）就忘記你、好感歸零。流浪貓還是每個玩家各自一組（各自的畫面），沒有跨玩家同步。
- 鐵口直斷下雨：攤子收起來，老師傅走進正殿左側門邊（ftRainSpot）站著，一樣點他就能算命（hit 和 station 跟著移）；天晴走回攤位坐下。openStation 下雨時只擋 cats，不再擋 fortune。
- （更正）主委的意思是「裝飾/道具有什麼特效」不要寫；遊戲規則要寫。貓咪規則說明已全部恢復，愛心媽媽的說明再補上認定主人、最多 5 隻、兩天忘記、挖寶一天兩次、掛網每小時一次。
- 打雷音效只留低沉轟鳴：拿掉近雷的高頻「啪」聲，滾動雷聲的低通從 1400/600 Hz 降到 320/220 Hz → 70 Hz（不再有沙沙聲），音量稍補。
- 反光調整：草皮下雨不再反光（只稍微變暗）；禪院地板鏡面 op .62→.36；禪院外溪水 envMapIntensity 1.5→.7、metalness .85→.55、roughness .04→.1。
- 主委：認定主人、最多 5 隻、兩天忘記、挖寶次數這些不寫進說明（愛心媽媽與流浪貓的 note 都拿掉）；第一次餵的提示改「牠有點喜歡你」。玩的時候挖寶改成一天一次（p.dg.n>=1），掛網每小時一次不變。
- 遊戲天：catGDay()=floor(秒/TOD_LEN)，遊戲一天 24 分鐘（和白天黑夜同一個）。只有「住院 1～3 天」（p.vet.g=1，舊存檔照現實天）和「玩的時候挖寶一天一次」（p.dg.g）用遊戲天；吃飯、貓砂、摸摸、訓練、跑走、忘記主人都還是現實一天。

## 2026-11-09 18:30 — 閃退紀錄第二批（150 筆，04:21–18:08，全部是還沒部署 gpuTrim 的線上版）
- kill 78（多數 iPhone 15/16 系列，geo 3000–6700，玩 5–15 分鐘）、ctx 62（多數 iPhone 12–14 尺寸 1170/1179，28 筆在剛開遊戲幾秒內，而且同一台會一分鐘一次連續重來：ctx → 重新整理 → 又 ctx）、err 10。
- ctx 改法：webglcontextlost 不再馬上重新整理。preventDefault 後等手機還畫面（three.js 會自己重新上傳）；在背景時一直等，回到前景 9 秒還沒恢復才照舊重新整理＋省電模式。恢復後重畫一次性的反射（WX/ZEN/INN cube、LAKE）。恢復時回報 k="ctxok"（msg「恢復 x 秒・在背景時中斷」），worker 收 ctxok，閃退紀錄顯示「畫面中斷後恢復」。模擬器用 WEBGL_lose_context 測過：沒有重新整理，畫面正常。
- err 修：土地公尋寶結束時正在走過去 → arrivedCheck 找不到 stations.treasure（加判斷）；Android 某些鍵盤 keydown 沒有 e.key → toLowerCase 錯（加判斷）。其餘是 IG 內建瀏覽器自己的錯、音效裝置啟動失敗、網路，不用管。
- 禪院地板反射改柔霧版：13 點兩圈模糊（不再有低解析度馬賽克感）、靠地板邊緣 2.2 m 內淡出、離視點 4→14 m 漸淡到 35%，op .42。手機版截圖確認（~/mz-sim/shots/zen_new1/2.png）。
- 禪院地板改近黑漆木 #1b1411（roughness .62，倒影色改中性、op .34）；蒲團改亮一點的藍/紫/綠（#56689a/#7c5a80/#4d7c66），方墊 #6a2a1c。
- 名字/對話氣泡：之前改成 2D 圖層後沒有距離限制，整張地圖的名字都畫成小糊字。現在只畫 16 m 內（最後 3 m 淡出，個別可用 userData.far 放寬），太小（< 9 px）不畫；textSprite / bubbleSprite 畫布改 2 倍解析度（LBL_RES），近看也清楚。
- 坐墊顏色改回原本（主委）。愛心媽媽移到招財貓扭蛋機北側 (9.7,37.7)，貓窩/貓砂 (7.6,38.4)；原位置 (15.2,28.6) 跟夜市攤位 (x 15.5, z 24.6 起每 3.1 m) 重疊。南側不行：跳舞貓在 (9.6,30.6)。
- 名字說明（主委確認）：要的是「畫質調降時字不要跟著糊」——這就是 2D 名字圖層在做的事（不跟 3D 解析度走），保留；只是加了 16 m 距離。

## 2026-11-10 — 報紙日期與贊助
- 主委反映：昨天打的贊助今天報紙沒有，反而在「昨天的報紙」。原因：報紙標頭印的是「內容那天」（11/10 看到的報紙寫 11/9），加上「登上今天的報紙」是補進當天正在看的那份；主委的直覺是今天登記、明天見報。截圖是單機測試版（第 1 期＝paperDemo），測試版的報紙一律用 SPT.now。
- 改：報紙標頭改印出刊日（內容日 +1，星期也跟著）；贊助面板「📅 登上明天的報紙」放第一個，「🧧 今天的報紙馬上補登」第二；面板多一區「上一份報紙（已經換新了）」＝前天的 nw（pday），每位有「搬到今天的報紙」（worker act:"move"，搬到 yday 後重新出刊，不動榮譽榜）。/sponsor GET/POST 多回 prev。
- 主委說他按的是「登上明天的報紙」。線上那條路是對的（今天的真報紙就是 nw:昨天，會有）。截圖其實是單機測試版（第 1 期、天后宮主委包辦所有新聞），測試版以前完全不管日期：「明天」那欄永遠不會上報。現在測試版每筆記下登記日期（spTDay），隔天自動移到「今天」那欄、再隔天下架，跟線上一樣。報紙測試的按鈕「昨天的報紙」改名「今天的報紙」、「預覽今天的報紙」改「預覽明天的報紙」。
