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
