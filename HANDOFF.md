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
- 贊助登報加勾選「只登報紙，不加進榮譽功德榜（金額已經加過了）」：client 送 noHonor:true，worker 跳過 honor 累加；測試版同樣不呼叫 honorLocal。
- 主委：贊助登報裡「還留著昨天的」，按「登上明天的報紙」沒反應。推測：那筆是過了半夜才登，所以在「明天的報紙」清單；按登報時新增欄是空的 → 只跳「請先填名字」提示。改：明天清單每筆加「改登今天的報紙」（worker act:"move", from:"next"：nw:today → nw:yday 後重新出刊，不動榮譽榜；測試版同樣搬）；空白時提示改成「先填名字和金額；清單上的用旁邊的按鈕改登或刪除」；toast z-index 6→9 確保在面板上面。
- 一鍵參拜中斷後再按：已完成的爐（插好香、平安符過過爐 flow().fu、媽祖供品已擺）直接跳過，提示「從第 n 爐 ○○ 繼續」；供品已收（flow().cleared）就不再回供桌。flow().fu 在燒金紙重置時一起清掉。模擬器確認從第 4 爐財神爺接著走（模擬器的時間跑很快，120 秒逾時在模擬器裡會先到，真機沒問題）。
- 主委：補登今天後清單留著，想再登明天只能刪掉重打。加「今天大家看的報紙」每筆的「也登明天的報紙」（worker act:"copy"：nw:yday 那筆複製到 nw:today，不動榮譽榜；測試版同樣）；面板上方加一句說明清單的用途。

## 2026-11-10 15:00 — 手機貼圖記憶體瘦身（未部署、未給主委看）＋換帳號
- 主委：閃退沒改善、更快閃退，「根本沒找到問題」。11/10 資料：kill 76（≈前一天 78），但 kill 時 geo 中間值 4482→2362、玩的分鐘 8.4→3.6，23 次剛載入就 kill；ctx 重整 62→1，ctxok 70。
- 模擬 iPhone 量貼圖：scene 內 378 MB。重複上傳：清水模 cv.clone() ×57（40 MB）、texRep 磚 ×28（38 MB，unifyBricks 之後全部 repeat=1）、inn-art clone ×18（98 MB）；臉 512×256 ×108、頭髮 512×512 ×數十。
- 改：cvsLo（手機半尺寸）用在 faceTexture、hairMap；texRep 快取（TEXREP）；innWood 快取（innWood.c，避開 TDZ）；清水模 UV 帶重複、共用 skinMat；unifyBricks 共用 unifyBricks.t；inn 掛畫共用 artMat、UV 選區塊。→ 163 MB；GPU 程序 800→540 MB。磚牆截圖正常；臉、掛畫、清水模還沒截圖。
- START-HERE.md 全面改寫成 11/10 版本（換帳號）。
- 主委擔心糊：cvsLo 關閉（CVS_LO=false），臉／頭髮維持原尺寸；只保留畫面完全相同的「共用貼圖」部分。
- 11/10 night: joystick through doorways — when the way ahead is blocked the stick now tries up to ~70° left/right (stickSteer: picks the side that opens up ahead, then falls back to the old wall slide), and the collision padding round solid things is .15 m (was .2). Grid model of every gap in the temple (tools idea: dump walkable() at .25 m, push through each doorway from 5 offsets × 5 angles): success on passable doorways 82.5 % → 94.7 %. Not deployed.

## 11/11 凌晨：禪房旁商店街（測試版，未部署）
- 全部寫在 public/index.html 裡（`/*<<SHOPS*/ … /*SHOPS>>*/` 這段，加上 STYLEX 九套新衣服）。原始分段檔在 scratchpad（shops1–6.js + inject.sh），改完要重新注入。
- 位置：禪房北側草地。從禪房前石板路、沿禪房西牆走一條步道（世界 x 34.45–36.65）到廣場（x 25.5–57.5, z -13.95…-8.7）。三間店門口朝南：便利商店 x≈30.5、夾娃娃機 x≈38.6、服飾店 x≈47。路線：innArea 多一個 "p" 區，shopLeg() 經過 (35.55,-12.7) 轉角。
- 精力 bag.en（0–100）：背包按鈕旁顯示 ⚡。打工一班 25。恢復：套房床 0.5/秒、通鋪 0.32、溫泉 0.24、禪堂靜坐 0.18；零食 +10～+40。
- 便利商店：點門口選「購物／打工」。購物＝櫃台畫面，店員隨機長相，泡泡字＋嘰嘰聲。打工 100 秒：客人拿貨→排隊→收銀（找零），貨架會變空，倉庫推車拿箱子補貨。薪水（11/11 改為十倍）：每位 30（12 秒內 +20）、補貨（剩一半以下）+10、找錯 −10、全勤零失誤 +80。
- 夾娃娃機：一次 15 幣，搖桿 20 秒＋下爪，右上側面小畫面。獎品：招財貓娃娃（+30 幣）、扭蛋殼（+2 扭蛋幣）、禮物盒（沒有的頭飾，抽完改 +60 幣）、紅茶、泡麵。機台是暫代模型，等主委給真模型。
- 服飾店：試衣間 3D 轉台，9 套（STYLES 18–26）：宮廷漢服 880、夏日浴衣 650、海軍水手服 600、星空魔法袍 780、醒獅舞衣 720、西部牛仔 640、太空人裝 980、紳士燕尾服 820、偶像打歌服 900。固定配色。主委全部擁有。換裝裡未購買顯示 🔒。
- 存檔碼：貓之後加 1 bit 旗標 + 衣服 16 bit + 精力 7 bit + 6 種零食各 6 bit（舊碼讀成沒有）。

## 11/11 傍晚：禪房外變馬路、商店移到同一條街、夾娃娃機改版、店面立體化（測試版，未部署）
- 禪房前（廟牆 x22.75 到禪房 x37）改成馬路：柏油 x24.6–31.4、雙黃線、白邊線、斑馬線在大門↔禪房門口（z=INN.G）、停止線、菱形預告標線；兩側人行道（磚）＋路緣石＋導盲磚。舊踏石路、路邊 5 棵櫻花移除，路燈移到人行道邊。
- 商店改在禪房北邊、門面跟禪房正面齊（x=37 朝西）：便利商店 z -14.7…-4.3、夾娃娃 -3.7…1.3、服飾店 2…11.2。商店用一個轉了 90° 的群組（local→world: (45.6+z, 21−x)）。可走範圍：innWalkableL 外面 x 23.9–36.88、z −51…12.4；R 區延到 z<13；那一塊不長樹。
- 店面立體：牆 30cm 厚、圖片內縮到牆後，前面有真的窗框（金屬條）和玻璃反光；超商圖 public/shop/cvs-front.webp，服飾店 cloth-front.webp。服飾店雨棚改成從牆上往外斜下＋波浪邊，條紋 50cm 寬。展示人偶拿掉（圖裡已有）。
- 夾娃娃：主委給的模型 public/claw.glb（+ claw-lite.glb，gltfpack -si .5），三台並排；正面是模型的 +z。玩法：▲▼◀▶ 按住移動（不用搖桿），下爪時先鎖定爪子下方最高的那個獎品、爪子停在它一半高度；成功率 grip×(0.5+0.5×對準)×0.85–1，比之前容易；搬運時滑落機率降低；取物口加大。
- 11/11 18:10：衣服改價 8000–15000（水手 8000、牛仔 8500、浴衣 9000、醒獅 10000、魔法 11000、燕尾 12000、漢服 13500、偶像 14000、太空人 15000）。打工每天最多 5 班（bag.wk/wkDay），夾娃娃每天最多夾中 5 次（bag.clw/clwDay，滿了不能投幣）。便利商店可買扭蛋幣 1000 幣一枚。存檔碼平安幣超過 65535 的部分存在商店擴充段（24 bit），舊碼不受影響。超商換新圖（海報、招財貓版）。
- 11/11 19:40：商店改兩層樓台式街屋（二丁掛磁磚、鋁窗＋鐵窗、冷氣室外機、女兒牆、服飾店頂樓水塔）、每間掛直式招牌（晚上會亮），三間牆貼牆（夾娃娃亭 w5.9、服飾店 w9.6）。
- 過禪房卡一下：原因是第一次看到禪房和商店街時，才把大量圖片、形狀、著色器送進顯示晶片。現在在載入時（建好街道、圖片/娃娃機模型載完時）用 1×1 像素從高空畫一次整區（warmUp），走過去就不會卡。代價：一開始就多佔一些顯示記憶體（模擬器幾何數 1.1k→2.9k）。
- 11/11 20:30：二樓晚上只亮窗戶（emissiveMap 只有窗），拿掉鐵窗，直式招牌統一在左側（面對店），店面圖片改退後 1.2m（騎樓式：地磚、天花板崁燈、兩側牆），不再加前面的金屬框。
- 11/11 20:45：店面改成「兩層」：玻璃層（窗框、門框、海報、貼紙；玻璃部分挖空）在牆面，室內層（同一張圖、框和海報塗掉）退後 1.6m，放大 k 倍讓人行道上看起來對齊；中間有地板、天花板、側牆。圖片：public/shop/{cvs,cloth,claw}-{glass,room}.webp（由主委的圖用 scratchpad/split.py 切出來）。
- 夾娃娃店改用主委給的門面圖，店裡三台模型拿掉（claw.glb 刪除；遊玩畫面仍用程式畫的機台），霓虹星星、圓環、兔子、機台燈條加閃爍 LED 光點。
- 三間店加長兩倍（各兩個店面開間）：超商 local cx 25.3 w 20.8、娃娃 cx 9 w 11.8、服飾 cx −6.5 w 19.2；街道、人行道、可走範圍延到 z 38.4，R 區 z<39，不長樹範圍也延長；路燈多兩支。
- 11/11 20:55：「加長兩倍」是指深度：寬度改回原本（超商 10.4、娃娃 5.9、服飾 9.6，街道回到 z 12.6），每間深度 4.2→8.4m（不長樹範圍 x 延到 47）。店內閃爍＝室內圖跟牆面、側牆跟柱子同一平面（z-fighting），已錯開。店內地板改成圖裡地板的顏色和樣式（超商、娃娃店亮面大磁磚，服飾店木地板）。
- 11/11 21:15：玻璃和室內圖中間的空間打亮（地板、側牆自發光，天花板有燈板）；室內圖放大倍率變小（DP 1.2、以 8m 外對齊）所以左右不再被切掉；夾娃娃店的閃爍光點拿掉，改成從圖裡最亮的細長霓虹/燈條做的發光層（shop/claw-neon.webp），慢慢呼吸。斑馬線往南（z<G−1.6）暫停通行：紅白水馬＋「前方施工 暫停通行」牌，樓梯口留空。
- 11/11 21:30：招牌換成主委的圖：直式 shop/{cvs,claw,cloth}-vsign.webp、橫式 claw-sign / cloth-sign.webp。店名跟著圖改：M超商、夾鬼夾怪、衣漾服飾（選單標題、站名）。服飾店一律顯示價格，主委那裡標「主委免費」。
- 11/11 21:40：夾娃娃機遊戲換成主委給的音樂 public/clawsong.mp3（音樂軌 claw，進夾娃娃畫面時淡入、離開淡回廟裡音樂；走近店門口會先預載）。
- 11/11 21:50：精力：每天回到 100；打工一班 33、每天最多 3 班；每天最多恢復 66（休息＋吃東西合計，bag.enRec/enDay）。恢復速度：套房 1.1/秒、一次最多 66；通鋪 .55/秒、一次 33；溫泉 .15/秒；禪堂 .1/秒。零食（立即）改價：餅乾 15/+5、紅茶 20/+6、麵包 30/+10、啤酒 35/+10、泡麵 45/+15、提神飲料 99/+33。
- 夜市預設每天 17:00 開、00:00 收（伺服器 Lobby.schedSeed 第一次被呼叫時加進定時活動並依現在時間開/關；測試頁存在這支手機），主委可在「定時活動」改或刪。
- 夜市攤位（地瓜球、香腸、烤肉、珍奶、射氣球）拿過飾品後，每攤每天過關給 1 枚扭蛋幣（bag.gd["nm_"+攤]）。撈金魚、彈珠台不算。彈珠台換滿 1000 幣後，每 2000 顆換 1 枚扭蛋幣。
- worker.js 有改（schedSeed）：部署時一起上。
- 11/11 22:30：夾娃娃一次 50 幣；扭蛋殼改給 1 枚扭蛋幣。

## 11/11 23:00 — 留人系統第一批：今日功課（測試版，未部署）
主委說人數一直掉、留不住人，要我自己規劃並製作。全部是底部面板的 HTML，不畫 3D、不跑每幀，手機零負擔。程式在 index.html 的 `/*<<DAILY*/ … /*DAILY>>*/`（`DQ`，在商店區塊後面；`var DQ=null` 宣告在 `var SHOPX` 旁）。
- **「📅 今日」按鈕**（一鍵參拜旁，有東西可領會亮紅點；每天進來 9 秒後沒在忙會自己打開一次）。
- **每日簽到**：七天一輪 100/150/200/100＋提神飲料/300/400/500＋扭蛋幣；漏一天不會退回第一天；連續來每天多 20 幣（最多 +200）。`bag.sg={n,st,last}`。
- **每日功課**：每天三件（參拜類／生活類／停留類各一件，依日期固定，大家一樣），每件 100～150 幣；三件都領了開寶箱（200 幣＋扭蛋幣 1）；另有夜市加碼一件。進度從 `statInc` 的鉤子（`DQ.stat`）和幾個直接呼叫（`DQ.ev("lot"|"jiao"|"bai"|"chat"|"cat")`）來。`bag.dq={d,p,c}`，台灣時間 00:00 換日。
- **回鍋禮**：離開 3 天以上回來，300＋每天 100（最多 7 天）幣＋扭蛋幣 1＋提神飲料 2。靠載入時把舊的 `bag.day` 存成 `bag.pday` 判斷，所以**部署當天回來的老玩家就領得到**。
- **功德簿**：13 項長期目標，每階領一次（100～5000 幣，第 3 階起加扭蛋幣）。累計值在 `bag.lt`，已領階數在 `bag.ach`。
- **香火位階**：累計簽到 3/7/14/30/60/100/200/365 天＝善信/信眾/虔信/居士/護持/護法/大護法/長老，顯示在名字前面（別人也看得到：presence 多一欄 `tl`；可在功德簿關掉）。
- 取回碼多一段（簽到、今天領過的、功德簿），舊碼照讀。每日統計多了 `dqSign`、`dqChest`、`dqBack`、`b_dayBtn`，主委可以看每天幾人簽到。
- 主委在面板最下面有測試鈕：跳到明天、跳過 4 天、今天功課全部做完（只改這次開啟的日期，重新整理就還原）。
- 模擬器測過：簽到、三件功課、寶箱、夜市加碼、功德簿、位階升級與名字、取回碼來回、回鍋禮，沒有錯誤。**沒在真手機上測；兩個真人互相看位階也還沒測（單機測試版只有自己）。**
- 還沒做的規劃（第二批以後）：每週活動（週末雙倍、限定頭飾）、好友／一起拜拜加成、每日排行、推播提醒（PWA）。

## 11/11 23:40 — 初一十五與節慶（測試版，未部署）
- 在今日功課的 `DQ` 區塊裡。農曆用瀏覽器內建的 `Intl`（`en-u-ca-chinese`，台北時區），不用維護對照表；讀不到農曆的瀏覽器就當作沒有節日。
- **初一、十五**與 13 個節日（春節、天公生、元宵、土地公生、觀音誕、媽祖誕辰、端午、關聖帝君誕、七夕、中元、中秋、重陽、除夕；閏月不算節日）：當天簽到、每日功課、寶箱的平安幣**加倍**；完成一次參拜可領**節日紅包**（初一十五 300 幣＋扭蛋幣 1；節日 888＋2；媽祖誕辰 2323＋3）。`bag.dq.c` 第 6 個 bit。
- 當天「📅 今日」按鈕變成「🏮 十五」這樣；進遊戲會提示；面板上方顯示今天農曆幾號、下一個初一十五和下一個節日還有幾天。
- **節慶煙火**（主委在今日功課面板最下面打開）：把 30 天內的初一十五和節日晚上 8 點煙火排進「定時活動」（id `fs`+日數，伺服器一次最多 30 項、31 天內，所以主委每次進遊戲 25 秒後自動補排；`mz.festFw`）。沒有改 worker。
- 主委測試鈕：把今天當十五／當媽祖誕辰／還原。
- 模擬器測過：農曆日期（11/11＝十月初三、11/23＝十五、2027/2/6＝除夕）、加倍、紅包、排煙火，沒有錯誤。**iPhone Safari 的農曆沒實機驗證**。報紙頭條、節日夜市加開、限定頭飾還沒做。
- 主委的想法：個人房間（主委問了要提供什麼：GLB 每件 2000 面內／平面圖片 512～1024）、遶境（路太短，先擱著）、種花（每人看自己的花圃）。

## 11/12 02:50 — 我的房間（裝潢小屋系統，測試版，未部署）
- 程式在 index.html 的 `/*<<ROOM*/ … /*ROOM>>*/`（`ROOMX`，接在 DAILY 後面；`var ROOMX=null` 宣告在 `var DQ` 旁）。借用商店的畫面層（`SHOPX.enter/leave`，shops6 最後多匯出這兩個），自己一個小場景，在房間裡時不畫廟。
- **入口**：禪房櫃台阿姨的選單「🏠 我的房間」，還有「📅 今日」面板裡的按鈕。
- **地板 10 種、壁紙 10 種**：全部用程式畫（512 畫布，會重複），各有「主色／配色」兩個顏色，24 色色盤，換色免費。每種前 2 個免費，其他 1500～2500 幣。
- **地毯 17 張**：主委給的圖，切好去背放在 `public/room/rug01～17.webp`（進房間、選到才載）。可拖動、轉 90 度、三種大小。1500～6000 幣。
- **家具 12 種**（單人床、雙人床、書桌、椅子、沙發、茶几、衣櫃、書櫃、床頭櫃、立燈、盆栽、電視櫃）：**現在是方塊拼的替身**，等主委給模型再換（`FURN` 每一項的 `mk` 換成模型即可，系統不用動）。買一件算一件（同種最多 7 件），可擺出、拖動（吸附 5 公分）、轉 90 度、收起來；房間最多擺 24 件。新玩家送一張單人床和一盆盆栽。
- 沒買的地板／壁紙／地毯可以先試鋪，離開就換回。主委全部免費。點地板角色會走過去；左右拖可以轉視角。
- 存在 `bag.room`；取回碼多一段（舊碼照讀）。統計多 `roomOpen`、`roomBuy`。
- 模擬器測過：換地板壁紙顏色、買、試鋪不存、地毯、家具買擺轉收、取回碼來回，沒有錯誤。**沒在真手機上測（拖動手感要實機看）。**
- 還沒做：別人來參觀、家具互動（坐沙發、躺床）、家具不能重疊的判定、牆上掛的東西（海報、時鐘）、主委的家具模型。
- 主委給家具模型的方式：一個 GLB 裡放很多件可以，我來切；每件之間留空隙、多零件的先合併或放同一群組、照真實比例。

## 11/12 08:50 — 家具模型整理（232 件，還沒接進遊戲）
- 主委給了 29 個 Tripo GLB（每個約 58 MB、190 萬面、一個檔 8 件家具）。切成 **232 件**，放在 `public/room/f/`：`<類別><編號>.glb`、同名 `.webp` 縮圖（128px 去背）、`catalog.json`（類別、長寬高比例、面數、檔案大小）。
- 類別：床 16、椅子 24、桌子 24、櫃子 24、家電 16、克難家具 8、盆栽 16、擺飾 48、窗簾 24、壁掛 24、掛畫 8。
- 做法（`tools/models/furn/proc.py`）：3D 相連塊分件 → 減面到每件 3000 面（盆栽 5000、窗簾 3500、掛畫 1200）→ 硬邊保留 → xatlas 重新展 UV → 從原模型把顏色烘到每件自己的 512 貼圖（擺飾 256）→ gltfpack 壓縮（meshopt＋量化，WebP 貼圖）。只留顏色貼圖，法線／金屬貼圖丟掉。
- 結果：原始 1.7 GB → 18 MB，平均一件 77 KB。落地家具原點在底部正中；窗簾、壁掛、掛畫原點在背面正中。尺寸還是原檔比例（一張圖寬約 1），接進遊戲時要依類別給真實大小。
- **還沒做**：接進「我的房間」（名字、價錢、真實尺寸、牆上掛的東西要新的擺放方式）。
- **要主委決定**：掛畫 pic01/04/05/06 是電影海報和名人肖像，cabinet04 是龍貓造型，幾件擺飾和 chair03 上有動物森友會的葉子標誌，公開上線有侵權風險。

## 11/12 10:20 — 家具接進「我的房間」（測試版，未部署）
- 12 件方塊替身換成主委的 **232 件模型**。資料在 ROOM 區塊的 `FD` 字串（`id|名字|寬|高|深|價錢|取得方式|旗標|檯面高度`），由 scratch 的 `gen_furn.py` 產生。**只能往後加**：玩家擁有的家具是用清單位置存的。
- 名字、價錢、真實尺寸都是我訂的（椅子高 0.9、床長 2.0、櫃子高 1.9、窗簾寬 1.7…），主委說價錢先這樣。
- **不全用買的**：買 138 件；夾娃娃機禮物盒 32 件（六成機率出家具，其餘出頭飾）；每日功課寶箱 40 件（每天一件）；節日紅包 8 件（造型床）；簽到第 7 天 9 件（掛畫和幾件特別的桌椅）；回鍋禮也送一件。`ROOMX.grant(src)` 先給還沒有的。
- **掛牆**：窗簾、壁掛、掛畫、冷氣掛在牆上，可在牆上拖動、拖到另一面牆。存成 `[種類, 沿牆位置, 高度, 哪面牆]`。
- **小東西會站上桌面**：擺飾、盆栽、小家電拖到桌子、矮櫃、洗衣機上會自己放上去（桌子移走它不會跟著走）。
- 家具分頁有類別切換（我有的＋11 類）和縮圖。同一種最多 3 件、房間最多擺 24 件。點家具本體就能選（用模型判定）。
- 模型進房間擺出來才載、離開就釋放。新玩家送原木單人床、原木方桌、原木椅、繡球花。舊的測試資料（`bag.room.v!==2`）家具會重設。
- **先藏起來的 5 件**（`x` 旗標）：pic01/04/05/06、cabinet04，等主委決定。有動森葉子標誌的幾件沒藏。
- 模擬器測過：載模型、買、擺、掛牆、站桌面、取回碼（255 字）、四種贈送，沒有錯誤。**真手機沒測**。
- 還沒做：別人來參觀、坐／躺互動、家具不重疊判定、桌子移動時上面的東西跟著走。
- 家具縮圖改成每類一張拼圖（`public/room/f/thumb-<類別>.webp`，8 欄、每格 96px），不再一件一張。測試版因為 artifact 一版最多 511 個檔、也不收 .glb，所以測試版把每類的模型包成一個 `pack-<類別>.wasm`（建置時把 `if(window.MZ_FPACK)` 換成 `if(1)`）；正式版仍是一件一個 .glb。重新發佈測試版時記得照這個做（指令在 11/12 的對話裡：先 build_test，再 sed，再產生 pack）。

## 11/12 10:50 — 房間：隨機擺放、進門、窗景、陽光、地板光澤、清單滑動（測試版，未部署）
- **清單不能滑的原因**：整頁的 `touchmove` 會擋掉所有橫向滑動（只放行 input/textarea）。現在也放行 `.rm-list`、`.rm-pal`、`.rm-chips`。以後做橫向滑動的清單要記得加進這個名單（搜尋 `closest("input,textarea`）。
- **隨機擺放**（家具分頁的「🎲 隨機擺放」）：`shuffleRoom()` 把擁有的家具重新擺一次——大件靠牆（高的只放後半）、桌子放中間、椅子靠桌邊面向桌子、小東西上桌面或櫃頂、掛飾找空牆、窗簾掛窗戶；不重疊、門口留空。上一個擺法存在 `bag.room.prev`，可按「回到上一個擺法」。
- **進門**：門改成有鉸鏈的門板，進房間時門打開、角色從門口走到房間中間、門關上，鏡頭從門口拉遠（`tIn` 計時，約 3 秒）。
- **窗景與陽光**：窗外是畫出來的風景（天空、山、廟頂、樹），依台灣時間分白天／黃昏／夜晚；窗光在地上投出四格光斑，加兩片淡淡的光束；多一盞從窗戶方向來的光。全是幾個平面和一張小畫布，沒有即時陰影。
- **地板光澤**：地板用環境反射＋凹凸（拿花紋當凹凸圖），每種地板亮度不同（大理石最亮、榻榻米不亮）。
- 模擬器測過沒有錯誤。**清單滑動是觸控才有的問題，模擬器驗不到，要主委在手機上確認。**
- 11/12 11:00：房間地板光澤改成跟著花紋走（`relief()`：同一個花紋用白色再畫一次找出縫，縫不反光且略低，磚／木板才反光；紅＝高度、綠＝粗糙度），整體調暗（環境反射 .22、窗光與光斑減半）。

## 11/12 15:00 — 天后小鎮地基（測試版，未部署）
主委要整個「天后小鎮」，選了開放地圖（走過去不切換畫面）。這一步只做地基：位置、街道、能走、切塊載入、每個地方先用方塊蓋出來。
- 程式在 index.html 的 `/*<<TOWN*/ … /*TOWN>>*/`（`TOWNX`，接在 ROOM 後面）。**各區塊的原始檔現在存在 `tools/src/`**（shops1-6.js、daily1.js、room1.js、town1.js、inject.sh、injectd.sh、gen_furn.py）：改完用那兩個 inject 腳本塞回 index.html（腳本裡的路徑是當時的暫存資料夾，換機器要改 `S=`）。
- **位置**：禪房斑馬線往南那段路的水馬撤掉（程式留著、`if(0)` 關掉），路走到底 z=−52 接小鎮主街（x 24.6–31.4，往 −z）。**主街以西、z −50…−84 是 42 公尺的媽祖大神像（x 0, z −65），不能蓋東西**，所以老街只往東。
  - z −52…−73 鎮口：牌樓、公告欄（開今日功課）、公車站（回廟埕／禪房門口）
  - z −73…−81 老街（x 33–88）：北側 家具行、花店、釣具行、早餐店、飲料店、書店；南側六間裝飾用店面
  - z −90…−100 小吃廣場（主街東側）：四個攤子、桌椅
  - z −105…−111 住宅巷（x −8…66）：十六戶，主街西側北排第一戶是「我的家」（進我的房間）
  - z −117…−131 河堤公園：西邊涼亭，東邊六塊社區花圃；主街盡頭是釣魚碼頭；河對岸是「天后車站（興建中）」，還走不到
- **切塊**：`CH` 十個區（gate、oldE1、oldE2、mid、plaza、laneW、laneE、pier、parkW、parkE），每區有中心和半徑。離區邊 75 公尺內才蓋、超過 105 公尺就拆掉（幾何和招牌貼圖都釋放）；每 0.4 秒檢查一次、一次只蓋一區。蓋好後同一種漆的東西合併成一個大網格（`bake`），整個小鎮在場時約 130～230 次繪製。**之後主委的模型來了，只要改各區的 `build`。**
- **接進原本系統的地方**（都以 z<−50.5 判斷是小鎮）：`walkable()` 最前面、`zoneOf()` 回傳 "T"、`ZRECT.T`、`planPath0()` 交給 `TOWNX.route`（鎮內直線或一公尺格子 A*；進出廟經過路口 (28,−50)）、`openStation()` 先問 `TOWNX.station`、主迴圈呼叫 `TOWNX.tick`、禪房外可走範圍多了往南的馬路、櫻花樹不種在小鎮範圍。
- **深入小鎮時**（z<−58）廟的合併大網格若整個在霧外就不畫（`fogCull`），回來再開。
- 互動點（`tw:` 開頭）：公告欄、公車站、我的家、家具行（導回房間的家具分頁）能用；花店、釣具行、花圃、釣魚碼頭、其他住戶、早餐店、飲料店、書店目前只跳「準備中」。
- 模擬器測過：走進去、各區載入、路徑（鎮內、鎮↔廟）、沒有錯誤。**真手機沒測；記憶體和順暢度要主委實機看。**
- 下一步（主委選的）：種花、釣魚、參觀別人的家。現有的 M超商／夾娃娃／服飾店留在禪房旁原地。

## 11/12 16:00 — 溪谷步道＋望海沙灘（測試版，未部署）
主委：「做一個溪流跟海岸，畫風都是療癒風格的」，位置選「小鎮另外開新區」。
- 原始檔 `tools/src/nature1.js`，內嵌在 `tools/src/town1.js` 的 `/*<<NATURE*/…/*NATURE>>*/` 之間（改 nature1.js 後要重新塞進 town1.js，再把 town1.js 塞回 index.html 的 TOWN 區塊）。兩個新區塊 `brook`、`coast` 接在 `CH` 後面，跟其他區一樣靠近才蓋、走遠就拆。
- **位置**：老街東端（x 88）往東。溪谷 x 86.5–135、z −52…−104；沙灘 x 135–約 158、z −62…−127，海在 x>160。`ZR` 東邊界改到 182；`TW.walk` 在 x>86 交給 `NT.walk`。
- **溪谷**：小溪從北邊崖壁的瀑布（110,−54）往南再轉東流進海（`BROOK` 曲線，越下游越寬）。步道 `TRAIL` 沿西岸上到瀑布觀景處；`TRAIL2` 過拱形小木橋（x 101–107, z −76.4）、穿過花草地到沙灘。圓石、繡球花、蘆葦、荷葉、圓圓的粉色／綠色樹、石燈籠（晚上亮）、木長椅、螢火蟲（只有晚上出現）。
- **海岸**：淺綠到藍的海、來回的浪花和泡沫線、陽傘和躺椅、沙堡、貝殼海星、漂流木、北邊岬角的燈塔（晚上亮）和觀景木棧台、三隻海鷗、溪口的木板步道。
- **做法**：地形是頂點上色的網格（溪床往下挖、可走的地方是平的、周圍是小丘）；水是四個小 shader（溪、瀑布、水潭漣漪、海），共用 `NT.U`（時間、夜晚）。廟的大草地（300 m 平面，y −0.02）在這一塊會蓋住溪床，所以 `lawnHole()` 讓它在 x>86.5、−140<z<−50 不畫。全部程式畫，沒有新增圖檔或模型。
- **聲音**：靠近溪／瀑布有流水聲，靠近海有一陣一陣的浪聲（用下雨那個雜訊 buffer 加濾波，`sound()`）；聲音我沒辦法在模擬器聽，要主委實機確認。
- 還沒做的：角色不會跟著地形高低（可走的地方都是平的）；不能下水、不能坐長椅和躺椅；撿貝殼、溪邊釣魚等互動都還沒有。
- 模擬手機測過：走得到、路徑（老街→沙灘）、白天黑夜截圖、無錯誤；全鎮在場約 214 次繪製。**真手機沒測。**
- 測試頁重新發佈的做法（這次照做了）：`build_test.py` → 把 `public/` 所有非 .glb 檔複製過去（.m4a 改名 .mp4）→ `make_model_js.py` → index.html `sed 's/\.m4a/.mp4/g; s/if(window\.MZ_FPACK)/if(1)/'` → 每類家具包成 `room/f/pack-<類別>.wasm`（4 位元組長度＋JSON 索引 {id:[位移,長度]}＋各 glb 接在一起）。

## 11/12 17:40 — 三間店單獨上線的準備（還沒部署）
主委問：「能單獨先上架夾娃娃機、超商跟服裝店嗎」。
- 做法：開分支 `shops-only` 指在 d4ee59c（11/11 22:30「夾娃娃一次 50 幣」），不另外改程式。那版的商店程式跟 audio-fix 現在幾乎一樣（只差：施工水馬、夾到禮物盒可能給家具、借用商店畫面給房間——都是後來的功能）。
- 這版一起上的（主委都選保留）：11/10 貼圖共用（臉頭髮不縮）、搖桿過門、禪房前馬路＋往南施工水馬、精力系統、夜市每天 17:00–24:00 自動開收（worker schedSeed）、夜市攤位給扭蛋幣、彈珠台換扭蛋幣。
- 不會上的：每日簽到／任務、初一十五節慶、我的房間、家具、天后小鎮、溪谷沙灘。
- 單獨測試頁：https://claude.ai/artifact/FwCukqPNabndCtwNJAVJZV（模擬手機載入無錯誤，商店街白天截圖正常）。
- 主委說「部署」時：`git fetch origin main && git merge-base --is-ancestor origin/main shops-only && git push origin shops-only:main`（worker.js 有改，會一起上）。之後 main 仍是 audio-fix 的祖先，全部上線時照舊推 audio-fix:main。

## 11/12 18:40 — 夾娃娃變順、超商換成主委的六樣商品（shops-only 和 audio-fix 都有，未部署）
主委：「夾娃娃為什麼慢慢卡卡的　商店裡商品改放這些」（附六張圖：柳橙汁、汽水、礦泉水、糖果、餅乾、洋芋片）。
- **卡的原因**（模擬手機量的）：夾娃娃畫面的主畫面一格約 230 ms，幾乎都花在像素上：每個材質都在算廟裡的環境反射（scene.environment），加上四片會打光的透明玻璃。主程式邏輯只佔約 3%。手機慢到每秒不到 14 格時，遊戲的時間步會被上限卡住（dt ≤ .07），爪子就變成慢動作。
- **改**：夾娃娃場景不用環境反射（燈光加強補亮度：半球光 .75→1.0、平行光 .6→.8，地板顏色調深一點）；玻璃和取物口壓克力改成不打光的半透明；側面小畫面的位置只量一次（以前每格都量）。結果一格 230→84 ms（約快 2.7 倍）。爪子速度也加快：移動 .22→.3、下降 .42→.6、上升 .33→.45、送回 .26→.38（m/秒）。前後截圖：機台外觀幾乎一樣，金屬滑軌和爪子顏色稍微淺一點。
- **商品**：主委的圖去背、裁切後存成 public/shop/sn-*.webp（256×256）。原本的 6 個代號不變（存檔碼才讀得到舊數量）：drink 草莓汽水 35 幣 +10、energy 柳橙汁 99 幣 +33、beer 礦泉水 20 幣 +6、cookie 奶油餅乾 15 幣 +5、noodle 洋芋片 45 幣 +15、bread 水果糖 30 幣 +10（價格級距沿用原本六種，只是重新分配給新商品）。舊存檔裡的紅茶會變成汽水、泡麵變洋芋片，以此類推。
- 貨架上的商品改成主委的圖片（面向超商固定鏡頭的立牌，sRGB、不受色調映射影響），放在層板最前緣才不會被上一層擋住。冰箱前面原本是實心的（以前飲料其實看不到），改成前面空的，透過玻璃看得到。冰箱上方海報改成「冰涼一夏／鮮榨果汁／清涼解渴」。夾娃娃機的罐子改成汽水配色、杯麵改成洋芋片包（獎品名稱跟著改）。
- tools/src/shops1–6.js 已從 index.html 的 SHOPS 區塊重新切出來（之前那幾個檔案落後 index.html：施工水馬那段）。**以 index.html 為準。**
- 兩個測試頁都重新發佈：三間店測試頁（FwCukqPNabndCtwNJAVJZV）和完整測試頁。

## 11/12 20:20 — 小地圖、精力、夾娃娃扭蛋球、紅包扭蛋幣、貓咪跟上樓與救援、別人看得到你的貓（shops-only 和 audio-fix 都有，未部署）
主委 11/12 晚上一連串要求，全部做了：
- **超商**：曝光 1.05→.7（太亮）；櫃台 .98→.69 m 高，看得到店員；商品圖改成會跟著曝光變暗（之前不受色調映射）。選單和購物畫面的說明拿掉。
- **精力**：打工每天最多 5 班（100＋恢復 66 剛好 5 班）；睡床／通鋪暫時不回精力（REGEN 0）；溫泉每現實 1 分鐘 +1；禪堂靜坐沒改（每秒 .1，主委還沒回要不要一起改）。
- **左上角**：殿別／人數按鈕藏起來（CSS `.top .hall-btn{display:none}`），改放在「設定」最上面「伺服器與人數」，點了開原本的換殿畫面。原位置放 **小地圖**（92px，以自己為中心）＋**精力條**。點小地圖開大地圖：分神明／參拜／遊戲／商店，點地點或下面按鈕就 goStation() 走過去。地圖底圖＝walkable() 每 .5 m 取樣一次（載入 4 秒後，分批做）。小鎮、溪谷、沙灘還沒開放，不畫（MM_TOWN=false，開放時改 true）。大地圖右上有「🆘 貓咪救援」。程式在 SHOPS 區塊最後的 `const MMAP`。
- **夾娃娃**：機台裡全部是扭蛋球。金色（25%）＝扭蛋幣 +1；其他顏色：55% 100 幣、12% 500 幣、3% 1000 幣、30% 隨機禮物（完整版有家具／沒有的頭飾／零食）。
- **彈珠台**：每 2000 顆換 1 枚扭蛋幣，每天最多 3 枚（bag.nm.pTok）。
- **財神爺紅包**：一次撒 10 包（worker n=10）；每包 10% 機率是 1–3 枚扭蛋幣（60/30/10%），由 worker 決定（hb.tok），/hbclaim 回 tok。worker.js 有改，部署時一起上。
- **土地公尋寶**：畫面上方訊息（toast）和倒數橫幅重疊 → 橫幅出現時訊息往下移（body.th-on）。
- **名字顯示距離**：LBL_FAR 16→30 m（相機距離）。
- **貓咪跟隨**：改成沿著玩家走過的腳印（trail）走，高度用 groundAt()（跟人一樣的樓梯判斷），所以會跟著上禪房樓梯、進套房。走不動 4 秒或差太遠就直接出現在身邊（catBeside）。模擬器測過：跟著從一樓爬到二樓（高度 0→5.5）。
- **貓咪救援**：貓咪面板和大地圖都有「🆘 貓咪救援」。兩個路人從附近走過來、把貓抬在中間，放到你身邊後離開（CAT.resc）。
- **別人的貓**：presence 多一個 `pc`（跟著你的貓的毛色 +1，沒有＝0）。別人那邊每位有貓的玩家身後會有同毛色的貓跟著（RCAT，最多 8 隻，「畫面上的人物：全部關掉」時不畫）。
- 測試頁兩個都重新發佈。真手機都還沒測。

## 11/12 20:50 — 馬路退到石欄杆外、精力回復調整；三間店版部署
- 主委：「側殿旁邊欄杆內都要是瓷磚，馬路不會超過欄杆，重新畫馬路」。廟東側的石欄杆在 x 25.6，舊馬路從 x 24.6 開始（欄杆站在柏油上，欄杆內是人行道磚）。改：ROAD x 26.2–32、廟側人行道只剩欄杆外 25.75–26.2 一條＋路緣石、對面人行道 32–37；欄杆內（22.75–25.75）鋪廟埕的磚（yardTex）。路燈（禪房群組座標 25.75→26.35）跟著移。可走範圍：街上要 x>25.9（欄杆只有斑馬線那個缺口能進出）；從廟走到禪房／商店的路線先走到 x 26.4 再轉彎（planPath0 的 innRoute 起點 24.3→26.4），不會穿過欄杆。完整版小鎮主街（x 22.8–33.2）和舊路的接頭寬度不一樣，之後要對齊。
- 精力：溫泉每分鐘 +2、禪堂靜坐每分鐘 +1、睡覺不回、零食不變。
- 主委說「改好就部屬」→ 推 shops-only 到 main。

## 11/12 21:20 — 假人去後殿拜拜（未部署）
- 主委：「假人為什麼沒有走到後殿去拜拜」。查：參拜指引的假人其實會照順序走到後殿／側殿（路線正常、沒有走不到），但一趟 16 站要好幾分鐘，加上只有 3 成假人是參拜角色，所以平均 22 個假人裡只有 1.2 個在後面（快轉模擬 800 秒量的）。
- 改：參拜角色有一半直接從觀音那站開始（後殿、側殿的神明→虎爺→金爐）；新進場的參拜假人可以從整條路線任何一站開始；掛網的假人 35% 站在後殿或側殿（rearSpot）。→ 平均 3.3 個在後面。
- 名字顯示距離：假人（lodUpdate 的 n.label）和真人（LBL_FAR）都是 100 m（主委 11/12 22:34；從相機量）。

## 11/12 22:10 — 六款新頭飾（未部署）
主委給一個 glb（六頂排成 3×2）。`tools/hats3/mk.py`：先 gltfpack -si 0.025（200 萬面→5 萬）、依連通塊中心切成六頂、貼圖 1024（lite 512）→ gltfpack -cc -kn → `public/hats3.glb`、`hats3-lite.glb`；圖示 `public/hat3-icons.webp`（一排 6 格）。
- HAT3（存檔代碼順序接在最後）：h_claw 夾娃娃夾子、h_astro 太空人頭盔、h_geisha 藝妓髮飾、h_ramen 拉麵碗帽、h_crane 仙鶴頭冠、h_cake 草莓蛋糕帽。HAT3_FIT 是初步位置，主委可用「頭飾定位」微調。ACC_IDS 現在 58 個（存檔代碼上限 78）。
- 取得：夾子只從夾娃娃機（隨機禮物時 40% 先給夾子，沒拿過才會）；其他五款加進扭蛋機（HAT_FIT_CHAIR 補空項目）。太空人頭盔主委沒說怎麼拿，先放扭蛋機。
- 特效：夾子＝人浮在半空約 0.3 m，以頭頂為支點像鐘擺，起步、停下、轉彎會晃（clawFloat，用 parts 的旋轉／位移；坐下、動作、躺床時不套用）。太空人頭盔＋太空人裝＝走路一步一大跳（月球漫步）、移動速度 ×1.5（Avatar.update 的 speed）。藝妓＋夏日浴衣＝身後三圈紅色發光圈（keep rings，HFX.need 判斷衣服）。拉麵＝大團白煙＋「～」。仙鶴＝身後紅色夕陽光環（back）。蛋糕＝四顆發光草莓繞著頭（FXT "berry"，orbit glow）。
- 模擬器截圖看過六頂的位置和特效。真手機沒測。
- 下雨：靜思禪院的落葉地和草地不再變濕反光（wxWetInit 跳過 x<-22.6 整塊在禪院裡的地面）。
- 11/12 22:15 追加：夾子掛著時腳不走路（clawFloat 把 legs 固定、只跟著擺動微晃）；仙鶴改成整片紅色夕陽圓盤＋外圈細放射線（keep sun，SUNRAY_TEX 線從圓盤邊緣才開始）；藝妓不論衣服都有櫻花瓣繞頭轉＋飄落，紅色光圈仍要配浴衣（HFX.needKeep 只管 keep）。
- 別人移動一段一段：走路時 presence 每 0.8 秒才送一次（10/31 為了省 Cloudflare 額度從 0.14 秒改的），送的是 0.5 m 前的目標點，別人那邊走 0.5 m 就停下等。改：用搖桿或鍵盤走時，送「沿著前進方向約 3 m 前」的點（presenceGoal，會避開走不過去的地方），別人那邊就一路連續走；停下時送真正位置。送的次數沒有增加。
- 11/12 22:30：夾子掛著時手也不擺（只跟著晃一點點，拿香時不動手）。主委用頭飾定位調好的值寫進程式預設（HAT_FIT_CHAIR：h_astro、h_geisha、h_ramen、h_cake）。主委無限平安幣與扭蛋幣：me.sp 時每 0.4 秒補回 999999 幣、200 枚扭蛋幣（SHOPS 區塊最後）。

## 11/12 22:36 — 部署
- main = 3d2725f（shops-only）：六款新頭飾、假人去後殿、名字 100 m、禪院下雨不反光、走路同步變順、夾子手腳不動、主委無限錢與扭蛋幣、仙鶴夕陽、藝妓櫻花。audio-fix 用 merge -s ours 記下（內容早已移植）。

## 11/12 23:50 — 我的房間變溫馨、窗外真的風景、歌仔戲音量（房間只在 audio-fix；音量兩邊都有，未部署）
- 房間：背景改暖色深棕（原本冷色紫黑）；左牆一盞暖色壁燈（PointLight #ffb46b，白天 .35／黃昏 .75／晚上 1.15，加燈罩、光暈、地上一圈暖光）；牆腳、地板沿牆、後面兩個牆角加淡淡的陰影漸層（假 AO），房間有層次；半球光改暖色、晚上調暗讓壁燈當主角。
- 窗外：不再用畫的圖。roomView() 做一個小 3D 風景（天空漸層、太陽／月亮、星星、三層遠山、山下的廟、門前斜坡、小路、樹、花），自己一個 scene；房間畫完後，窗玻璃那塊先寫 stencil，再用一台「站在窗邊往外看」的相機把風景畫進窗框的範圍（只畫在 stencil 內，視角跟著房間旋轉稍微轉）。白天／黃昏／晚上換顏色（roomViewTint，顏色要 convertSRGBToLinear）。測試用：ROOMX.tint(0|1|2) 切時段、ROOMX.dbg() 拿場景。
- 歌仔戲・布袋戲：音量面板多一條「歌仔戲・布袋戲」（VOL.o，預設 50%），歌聲和配樂都只跟這條走（原本跟音效、音樂）。

## 11/12 23:59 — 小鎮在測試版打開、主街對齊、兩首新音樂（音樂兩邊都有；小鎮只在 audio-fix；未部署）
- 小地圖畫出小鎮、溪谷、沙灘（audio-fix 的 MM_TOWN=true；shops-only 沒有小鎮）。
- 小鎮主街的柏油跟 11/12 移到欄杆外的舊路對齊：street() 多兩個參數 a0/a1（柏油範圍），主街三段用 ROAD_A0=26.2、ROAD_A1=32，中線 29.1 和舊路連起來；兩邊人行道寬度不同（西 3.4 m、東 1.2 m）。
- 音樂：主委給兩首 m4a → `public/outsong.mp3`（欄杆外的世界：禪房那邊、商店街、小鎮；禪院除外）、`public/roomsong.mp3`（我的房間，Shopping Day）。128 kbps；比 music.mp3 大聲約 3.5 dB，所以 TRK_TOP 是 .25／.26。切換在 want=… 那行（out：|x|>25.6 或 z<-50.6 或 z 超過前面欄杆）。
- 11/13 00:05 修正：新音樂沒聲音——MIX 表沒有 out／room（變成 NaN），已補上；靠近欄杆時預先載入 out（trkPrime，手機才放得出來）。
- 11/13 00:10 夾娃娃：對準（爪子離扭蛋中心不到半顆）就一定夾起來，之後上升／移動時還是可能掉；判定改用爪頭實際位置（會擺盪），不是滑軌位置。
- 11/13 00:20 夾娃娃：爪子停在扭蛋中間的高度（stopY＝底＋一半高＋.15），夾起來的球掛在爪子裡，不是頂在爪子上面。SX.clawDbg() 測試用。
- 主委工具「重置今日」：除了原本的（神明遊戲、夜市、算命、收驚、紅線、插香…），再把每天限定的都歸零：打工班數、夾娃娃夾中次數、精力補滿＋今天恢復量歸零、貓咪挖寶次數、每日任務、簽到（保留連續天數）。

## 11/13 01:30 — 我的房間能「住」了；磁磚全廟統一；欄杆外音樂（未部署）
- 音樂：在禪房那側（欄杆外、但 z 已經比後殿還後面）有時放後殿的歌——後殿的判斷排在欄杆外前面。改成先判斷欄杆外（isOut），欄杆外永遠是外面的歌（禪院仍是禪院的歌）。兩個分支都改。
- 磁磚（主委：「整個廟裡外部的磁磚統一，要對紋，不要拼接感」）：廟埕、後埕、側殿旁、殿內地板原本每塊各自從自己的角落開始排磚，接縫處會錯開。floorUV 改成：每塊平放的地板用「它在世界中的位置 ÷ 磚的週期」當貼圖座標（廟埕磚 4.4 m 一個週期＝55 cm 磚，殿內 4 m），貼圖不再各自 repeat（floorsPlain 換成 texRep(…,1,1)）→ 全廟同一張格線，從一塊走到另一塊磚縫是連續的。側殿旁欄杆內那條（商店那次加的）也用同一格線、同樣的光澤和凹凸（之前是另一種材質、磚比較大）。兩個分支都改。模擬器俯視截圖看過接縫。
- 我的房間（只在 audio-fix）：
  - 面板多一個「生活」分頁（進房間預設）：點家具就用它。床＝走到床邊、躺上去、閉眼（臉換成閉目眼）、蓋被子、頭上飄 💤、房間燈光稍暗、鏡頭拉近；按「起床」或點別的地方會掀被起來。椅子＝走到椅子前坐下（腳會輕輕晃）。衣櫃＝走過去、閃光，面板換成「衣櫃」（款式只列有的、衣服顏色、配色、頭飾、配件、髮型），每換一次人轉一圈。燈（布罩檯燈、提燈、月兔燈、和紙燈籠、塑膠袋燈、蠟燭、水晶壁燈、紙燈籠壁燈、閃電霓虹燈）＝點一下開／關，真的會照亮（場景裡預留 3 盞點光源，切換不會卡）；左牆的壁燈也能點（或用按鈕）開關。其他擺飾點了會跳一下、冒小圖案（音樂盒冒音符＋小旋律、咕咕鐘叫、時鐘顯示時間、招財貓冒金幣…）。
  - 被子：照床架顏色（從床模型的床頭板、沒有床頭板就從側邊取貼圖顏色，調成柔和的同色系），用射線量床墊高度、哪頭是床頭、床墊寬度、有沒有床尾板；再用射線量躺著的人身體上緣，被子貼著身體（胸、手、腿、腳尖的起伏）再抹平一點，兩側垂下床緣、沒有床尾板就床尾也垂下，上緣有一條反折的淺色布邊。會呼吸起伏，蓋上去／掀開有拉被子的動畫。
  - 走路會繞過家具（10 cm 格子找路），走不到會說「有東西擋住」。
  - 家具分頁選到一件時：「角度」滑桿 -45°～45°（地上的是轉、壁掛是傾斜，按「擺正」歸零）；擺飾・盆栽・壁掛・掛畫有「大小」50%～250%；窗簾有「寬度」60%～160%。
  - 不能重疊：地上兩件的範圍和高度交疊就不行（小東西放在桌面上可以），同一面牆上的兩件掛飾不能疊，掛飾也不能跟貼牆的家具同高度疊在一起（窗簾只算 12 cm 厚，床可以放在窗簾下）。拖動時撞到會只沿一個方向滑、或停住並閃紅；轉 90 度、調大小、調角度撞到會退回。新擺出的家具會自己找空位。已經存檔的舊擺法如果本來就疊在一起不會自動改，移動時才會擋。
  - 存檔：每件家具多 t[4] 大小、t[5] 角度、t[6] 燈開著；取回碼在房間資料最後多一段（舊的碼讀起來就是沒有，不受影響）。燈的開關沒放進取回碼。
  - 模擬器測過：睡覺（被子顏色取到橘色木床、腳尖不穿出）、坐椅子（面向正確）、衣櫃（轉身面向鏡頭）、檯燈開燈、重疊規則。真手機沒測。測試用：ROOMX.use(n)、ROOMX.act()、ROOMX.blk(t)。

## 11/13 02:15–03:30 — 天后小鎮大擴建（主委睡前交代：「不用問我，直接做到額度用完」）（只在 audio-fix／完整版測試頁，未部署）
- 規劃文件「天后宮大地圖與玩法總規劃」補完：大地圖（每區位置與狀態）、種植、收集與圖鑑、鎮民好感度與活動、經濟數值、施工順序。
- 房子組件（town1.js 的 kbld）：用種子挑零件拼房子：粉彩牆或紅磚、騎樓（柱子＋機車停在裡面）、陽台欄杆＋盆栽＋晾衣、鐵窗、冷氣、花台、圓窗、水塔、頂樓加蓋、斜屋頂／四坡頂／瓦屋頂＋屋脊、煙囪、店面玻璃、條紋遮陽棚、橫招牌＋直立招牌；1–4 層樓高度不同。窗戶晚上會亮（兩種材質，一半亮一半暗）。
- 小鎮重新排（TOWNB：每條街一排一排算出來，大家都一樣）：老街兩側店和住家錯落、中間空一段變噴水池小廣場（土地公小廟）；老街電線桿＋電線、橫跨街道的紅燈籠串、自動販賣機。主街西側兩段建築；新的「西側巷弄」（理髮廳、美容院、燈籠、土地公廟）；住宅巷每棟不同（我的家位置不變）。店面分散：家具行、雜貨店（老街北）、釣具行、中藥行、早餐店、照相館（老街南）、書店、飲料店、花店（主街西）。小地圖多「小鎮」分類（鄰居家、準備中的店不列）。
- 南岸（過河的木拱橋 x 61.5）：森林（松樹、圓樹、蘑菇、倒木、燈籠、螢火蟲），三座泉池（34,-157）（100,-158.5）和女神泉（104,-183）；天后山（中心 66,-212、高 34 m、半徑 42 m），螺旋步道（約 1/10 坡度，欄杆、三張休息長椅），山頂露營區（營火會閃、點光源、兩頂帳篷、木頭椅、野餐桌、燈籠、望遠鏡、招牌）。groundAt 在 z<-143.6 走 TOWNX.ground（山的高度）。
- 望海沙灘：海邊咖啡（木屋、遮陽棚、三張陽傘桌）、四張躺椅＋陽傘。
- 釣魚（life1.js，新模組 LIFE）：站在任何有水的地方（大河、溪谷、泉池、女神泉、海）旁邊，會出現「🎣 釣魚」。拋竿 → 魚影靠近 → 輕咬 1–3 下（這時拉會嚇跑）→「咕咚」0.75–0.95 秒內拉 → 拉力條（按住收線、放開放線，白線留在綠色區讓進度滿；拉太緊 0.6 秒斷線、太鬆 2.2 秒脫鉤）。33 種魚（淡水 18：大河、溪谷、泉池、女神泉；海水 15），稀有度 4 級，有的只在某時段（遊戲裡的清晨／白天／黃昏／夜晚）、下雨、或流星夜出現。魚先用程式畫（每種顏色、花紋、形狀不同），之後主委給模型填 FISHGLB 就好。釣竿在釣具行（竹釣竿 300、好釣竿 1800：綠區寬、稀有魚多）；魚在釣具行／雜貨店賣（價錢依大小）。背包最多 40 條。
- 圖鑑（魚）：淡水／海水分頁，沒釣過的是黑影，點進去看出沒地點、時段、條件、最大尺寸、數量。背包裡有「圖鑑」。
- 湖之女神：女神泉丟 100 幣（一天一次）→ 女神從泉裡升起（程式做的：長袍、光環、光暈）問金的、銀的還是普通的；說「普通的」拿回 100＋500 幣＋1 扭蛋幣，說謊就沒了。
- 營火：烤棉花糖（一天 3 次，金黃色時拿起來精力 +5）。海邊咖啡：椰子汁 60（+15）、芒果冰 90（+25）、冰咖啡 45（+10）。躺椅：點了躺著聽海浪（只有文字）。
- 10 位鎮民：阿土伯（駝背、拐杖、白髮鬍子，噴水池）、林阿姨（胖、圍裙，雜貨店前）、小胖（矮胖小孩，小吃廣場）、阿翔（高瘦登山客，山頂）、美玲（高挑、旗袍，海邊咖啡）、老王（壯、斗笠、鬍子，碼頭）、阿嬤（矮小，住宅巷）、阿凱（高壯，老街東）、小雨（小女孩，公園）、博士（高瘦、眼鏡、白袍，森林泉池）。在家附近散步，走近出現「💬 跟○○說話」。好感：每天聊天 +1、每天送一次禮物 +3（喜歡的 +5），好感 10／30／60 回贈（300 幣／扭蛋幣＋家具／1000 幣＋2 扭蛋幣＋家具）；30 以上可以「打聽消息」（稀有魚條件、流星時間地點、女神泉、花圃、美容院）。玩家 55 m 內才產生身體，離開 75 m 就收掉。
- 理髮廳：10 款精緻髮型（男：韓系逗號瀏海、紳士油頭、狼尾、蓬鬆捲毛、武士丸子頭；女：公主捲、空氣瀏海鮑伯、緞帶雙丸子、蝴蝶結高馬尾、花冠編髮），1600–3000 幣，可先「試試看」。美容院：眼睛 10、鼻子 10（新的臉部欄位 look[13]）、嘴巴 10，600–1500 幣。買過的在一般「換裝」也能選，沒買的有 🔒。存檔代碼最後多一段（頭髮第 6 位元、鼻子），舊代碼讀起來沒有。LOOK_RANGE 的嘴巴改成 MOUTHS.length，多一格鼻子。
- 小吃廣場：擠冰淇淋（出口左右移動，按下去擠一圈，對準才疊得上去，7 層完美）、中藥對對碰（16 張翻牌，60 秒）。一次 30 幣，每天前 10 次（合計）有獎勵（最多 90 幣、表現好精力 +3）。
- 流星：大約三個遊戲晚上一次（遊戲日編號算出來，每個人看到的時間地點都一樣），從天上劃下來落在 10 個地點之一，留下發光碎片和光柱到天亮。走近按「🌠 撿起流星碎片」：伺服器 /meteor 記第一個人（新增在 worker.js 的 Lobby；測試頁用 mock）；第一個：流星石＋3 扭蛋幣＋1000 幣；其他人：星砂＋200 幣。流星夜女神泉和海裡會出現兩種傳說魚。NPC 會預告時間地點。測試：LIFE.meteorTest()。
- 我的花圃：河濱公園的花圃入口（原本六塊花圃換成拱門）進去是自己的場景（跟我的房間一樣）。12 塊田；種子在花店（向日葵、鬱金香、番茄、草莓、高麗菜、玫瑰、南瓜，20–120 分鐘），長三階段、每階段要澆一次水才會長（忘了不會死）；收成可賣花店／雜貨店，或送 NPC。
- 視角卡進屋頂：小鎮裡相機原本沒有碰撞（還會套到廟後面的判斷，常被拉到很近）。現在 camOK 在小鎮走 TOWNX.camOK：不進任何房子的盒子（含屋頂高度）、不進山和溪谷的坡。廟裡面的屋頂沒有改（不確定主委卡在哪裡）。
- 模擬器都跑過：釣魚整個流程、圖鑑、背包、NPC 外型和對話、理髮廳（頭髮）、美容院（眼睛鼻子）、兩個小遊戲、流星、花圃、森林／山／泉／女神泉／咖啡廳畫面。真手機都沒測；效能（森林＋山的地形、10 個 NPC）沒在手機量過。

## 11/13 07:45 — 小鎮生活也進存檔（主委：「為什麼會不見 為什麼不能存」）
- 原因：之前只是還沒把新東西寫進存檔代碼（取回碼＝伺服器存的那份），不是不能存。
- 現在代碼最後多一段 LIFE.pack：釣竿、買過的髮型和五官、魚圖鑑（每種釣過幾條、最大尺寸）、背包裡的魚（每種幾條；尺寸回來時用該種的中間值）、10 位鎮民的好感和回贈紀錄、花圃（種子、收成、12 塊田各種什麼、長到哪、有沒有澆水）、流星石和星砂。舊代碼讀起來就是沒有這段。
- 長度：房間擺滿 24 件家具時整個代碼 467 字，伺服器上限 900，還有空間。
- 順序規則：FISH、NPCS、SEEDS 之後只能往最後面加，不能插中間或刪，不然舊代碼會讀錯。
- 順手修：鎮民回贈禮物的紀錄用錯位元（10/30/60 直接當位元會重疊，30 那份永遠不會給），改成 1/2/4。
- 模擬器測過：存進去再讀出來，全部一致。

## 11/13 11:40 — 主委的十隻魚模型＋釣魚改成看浮標（未部署，只在完整版）
- 主委給一個 glb（十隻魚排成 2 欄 × 5 列，194 萬面）。`tools/fish/mk.py`：先 gltfpack -si 0.03（→ 5.8 萬面，每隻 3–8 千）、依連通塊切成十隻、每隻置中並縮成長度 1（頭朝 −x）、貼圖 768 → gltfpack -cc -kn -noq → `public/fish.glb`（1.1 MB；不量化，因為遊戲裡的扭動是在魚自己的座標彎的）。圖示 `public/fish/<id>.webp` 和黑影 `<id>-d.webp`（從原始模型側面畫出來）。
- 十隻對應：左欄上到下 鱸魚 bass、鯉魚 carp、吳郭魚 tilapia、鯰魚 catfish、龍魚 arowana；右欄 虹鱒 trout、金魚 goldfish、孔雀魚 guppy、溪哥 zacco、錦鯉 koi。其中鱸魚、龍魚、虹鱒、金魚是新加的魚種（加在 FISH 最後；共 37 種）；原本的「大肚魚」改名孔雀魚。其餘 27 種還是程式畫的。
- 釣起來：魚從水裡跳出來到玩家身旁、頭朝上掛著扭動（頂點著色器：一道波從頭傳到尾、越靠尾巴越大），鏡頭轉到正面看人和魚，約 2.7 秒後出卡片。魚的長度照釣到的公分數。
- 釣魚玩法（主委：「切換浮標，讓玩家決定拉竿時間」）：拿掉拉力條。現在是直立的浮標（紅頭白身）：魚影靠近 → 浮標小小點幾下（這時拉會嚇跑；少見以上的魚偶爾會有比較深的假動作）→ 整支沉下去 → 在時間內按「拉竿！」就釣到（常見 0.95 秒、少見 0.8、稀有 0.62、傳說 0.5；好釣竿 +0.18 秒）。釣魚時鏡頭移到側上方，浮標看得清楚。
- 存檔代碼的小鎮段改版本 2（先寫有幾種魚），版本 1（33 種）也讀得到。
- 測試頁：fish-model.js、fish/*.webp 要跟著發布。

## 11/13 13:10 — 人物合併（效能）、釣魚拉扯回來＋12 支釣竿＋20 種餌＋成功音樂（未部署）
- 效能第一步（兩個分支都有）：廟裡每格約 660 次繪製，其中約 4 成是人（每個人平均 75 片：每一撮頭髮、每顆扣子各一片）。`avMerge`：`_setLook` 結束後把每個人的 hair-*、hat-*、outfit-* 群組裡「同一個材質」的小片就地合成一片（位置、法線、貼圖座標照搬，鏡像的片翻轉三角形方向）。每個人 75 → 52 片；廟裡同一個位置 660 → 545 次（−18%）。不合併的：逐點上色的頭髮（雙色髮）、配件 gear（有會動的肩上寵物、項鍊）、手腳。合出來的幾何在下次換裝時釋放（`this._mg`）。測試開關 `window.NO_AVMERGE=1`。同一頁先不合併拍一張、再合併拍一張比對：外觀一樣（差異只有腳下影子和鏡頭 1 像素的晃動）。
- 還沒做：靜態建築再合併（237 片、129 種材質，最多再省約 100 次）、看不到的殿內不畫。遠處不會換成簡化模型（主委不要）。
- 釣魚（主委：「拉扯小遊戲為什麼不見了；越稀有越難拉；可以換釣竿、釣餌」）：流程現在是 浮標（自己決定拉竿時機）→ 拉中了進入拉扯（按住收線、放開放線，白線留在綠色區讓進度條滿）。越稀有：綠色區越窄（常見 34%、少見 27%、稀有 20%、傳說 16%）、魚衝得越兇、進度越慢、掉得越快。拉竿時機抓得準（0.25 秒內）進度條起跳 25%（否則 12%）。
- 釣竿 12 支（RODS）：溪釣 5（竹製手竿 300、玻纖溪流竿 1500、碳纖長竿 4000、路亞竿 9000、和竿 22000）＋隱藏「女神的金釣竿」（女神泉誠實回答滿 3 次送）；海釣 5（岸拋入門竿 500、磯釣竿 2500、遠投竿 6000、船釣竿 14000、石鯛竿 30000）＋隱藏「星辰釣竿」（有 1 顆流星石或 8 份星砂時，釣具行的「？？？」會出現「打造」）。能力：ctl（綠色區加寬 0～15%、容許拉過頭）、pow（收線 ×1～1.75）、luck（稀有以上機率 ×1～2.6）、win（浮標沉下去可拉的時間 +0～0.25 秒）。溪釣竿用在大河／溪谷／泉池，海釣竿用在海邊；沒有對應的竿不能釣。可在釣具行換使用中的竿。店裡用星星顯示 操控／力量／魚運。
- 釣餌 20 種（BAITS，一包 10 份 40～280 幣，魚咬一次用一份）：溪 10（練餌、蚯蚓、紅蟲、地瓜玉米餌、溪蝦肉、川蟲、毛鉤、雞肝、活餌小魚、路亞假餌）、海 10（南極蝦、青蟲、活蝦、誘餌粉、魷魚條、魚肉塊、木蝦、小螃蟹、活餌鯖魚、鐵板）。每種餌有愛吃它的魚（依真實釣法：鯉魚吃地瓜玉米、鯰魚吃雞肝、鱒魚吃川蟲毛鉤、透抽咬木蝦、鬼頭刀追活餌和鐵板…）：那些魚出現機率 ×4；用餌時魚來得快（等待 ×0.6）；餌對了：可拉時間 +0.1 秒、綠色區 +2%、進度 ×1.15。釣魚畫面左下可以換餌。圖鑑釣過的魚會寫「愛吃」。
- 釣到的音樂：約 2 秒的小號角（上行、三個亮音、長和弦；稀有以上多兩個高音）。用 tone() 合成，沒有音檔。
- 存檔代碼小鎮段版本 3：多釣竿（12 位元）、使用中的竿、女神誠實次數、20 種餌數量、使用中的餌。舊的 rod 1／2 會換成新的竿。
- 注意：主委規則「物品效果不寫在描述裡」——釣竿用星星、餌寫的是「什麼魚愛吃」的釣魚知識，沒有寫倍率數字。若主委覺得這也算寫效果，再拿掉。


## 11/13 15:10 介面改淺色・有光澤（測試頁，未部署）
- 主委：「介面改成淺色系 做有光澤的感覺」。做法：不動原本的樣式，在第一個 <style> 最後加一段覆蓋樣式（標記 /*<<THEME*/ … /*THEME>>*/），原始檔 tools/src/theme1.css，注入用 `python3 tools/src/theme_inj.py public/index.html`。要還原只要把標記中間清空。
- 內容：面板、圓鈕、標籤改珍珠白＋金邊＋上緣高光；主要按鈕維持漆紅、加玻璃高光；面板裡的字改深咖啡；直接壓在 3D 畫面上的字（名字、按鈕下的小字）維持淺色加深色描邊。
- 故意保留深色的：煙火編輯、載入頁、小地圖、禮物卡、收銀機、列車過場（在 theme1.css 最後一段用區域變數保留舊的米色字）。
- 模擬器看過：主畫面、背包（含物品說明）、釣具行、圖鑑、鎮民對話、換造型、我的房間（生活／家具）、釣魚中。沒看過：設定、聊天、公告、求籤、抽籤結果、店鋪經營畫面、花園、提示條（toast）、真機。這些可能還有零星深底或字看不清的地方，主委看到請截圖。
- 同一批補記：頭髮合併後戴頭飾的問題（4c72049）——合併時把「戴帽要藏的髮片」和「要留的髮片」分開合，並記在 userData.hatHide；360 個角色 × 6 種頭飾和沒合併的版本比對，差異 0。


## 11/13 18:40 — 部署：只修「靜坐、泡溫泉不回精力」（main = hotfix-en，從 3d2725f 只加這一筆）
- 原因（模擬器重現）：恢復量是用「每格畫面的時間」算的，而每格最多只算 0.07 秒。手機畫面慢（廟裡每秒不到 14 格）時，坐一分鐘只算到幾秒，幾乎不回。改成用真實時間（performance.now，單次最多補 5 秒）。規則沒變：靜坐每分鐘 +1、溫泉每分鐘 +2、每天最多回 66。
- 另外：已滿 100 或今天已回滿 66 時坐下，以前完全沒訊息，現在會說明。
- 模擬器：靜坐 30 秒 +0.49、溫泉 30 秒 +1.00、到上限 +0 並出現說明。真機未驗證。
- 已合併回 shops-only 和 audio-fix（之後部署仍可直接推）。其他東西（淺色介面、小鎮等）都沒有上線。


## 11/13 20:45 — 閃退後自動省電（hotfix-en，未部署；部署時把 hotfix-en 推到 main 即可，只比線上多這一筆）
- 主委貼的閃退紀錄（18:23–20:13，150 筆）：kill 65（iPhone／iPad 61），位置分散（走動 35、面板 11、剛開 10），同場真人中位數 23；ctxok 79 都自己恢復。剛開就 kill 的 10 筆 rem=0、tex≈60，代表載入本身就把手機撐爆，而原本只會減人物、不會降畫質 → 一直重來直到 Safari 顯示「重複發生問題」。
- KQ（mz.kq）：只在手機。上次在畫面上被關（mz.alive 沒 bye、不是 ctx）且「玩不到 1.5 分」或「10 分鐘內第二次」→ lv+1（1＝省電 Q.low，2＝低配 Q.lite＋省電）。玩家手動選「高」時 lv2 不強制低配。三天沒再被關 lv−1。手動換畫質或卡片按「維持原本」→ lv0，6 小時內不再自動升。卡片取代人物減量卡（兩件事一起說）。
- 模擬器（iPhone UA）：剛開被關→lv1 省電＋卡片；再被關→lv2 低配（抗鋸齒關、解析度 0.6）；維持原本→回到 auto；三天後 lv1→0。沒有錯誤。真機未驗證。


## 11/14 00:50 — 介面改回黑透，只有物品欄、圖鑑是白色（測試頁，未部署）
- 主委：「介面改回黑透色 只有物品欄 圖鑑改白色」。theme1.css 全部改寫成只作用在 #sheet.lt；openSheet() 在 kind 為 bag／lfDex／lfDexOne 時加上 class "lt"。其他面板、按鈕、提示條全部回到原本的深色。


## 11/14 01:50 — 禪房合併（hotfix-en，未部署；部署時把 hotfix-en 推到 main）
- 主委：從廟去禪房會卡。量到：側門外／馬路上一次要畫 800～1100 件，禪房的牆、屋頂、地板是最大宗（cut-away 用到的 ~600 片沒被 innMerge 合併；面群組 groups>1 的 BoxGeometry 也被排除了，其實單一材質不影響）。
- 做法：innCutMerge 把 INN.cut 的牆／屋頂／清水模皮（513 片→22 件）和地板（116→2）依材質合併。沒有 cut-away 時畫合併版（原件 visible=false＋userData.mergedOff）；走進樓上房間（cutMode "2"）時換回原件。地板原件隱藏但照樣可以點（raycast 不看 visible，跟側殿的隱藏地板一樣）。測試開關 INN.mgTest(true) 顯示原件。NO_INNMERGE=1 整段關掉。
- 驗證（模擬器，同一個畫面、同一台相機切換比對）：13 個位置差 0～3 個像素；畫的數量：馬路 625→366、商店街 932→550、禪房北側 498→319、門口 386→270、大廳 339→225；樓上兩間房 cut-away 正常。真機未驗證。
- 「從外面不畫禪房裡面」試過：一樓的東西從窗戶和門看得到（像素比對有差），樓上看不到的只有 3 件，不值得做，沒有放進去。


## 11/14 02:40 — 元氣早餐店：疊漢堡（只在 audio-fix／完整版，測試頁，未部署）
- 主委給的圖：14 種漢堡料、元氣早餐店背景、驚訝的小鳥／飛碟／媽祖／千里眼／順風耳。tools/burger/cut.py 切成 public/burger/*.webp（料 240 寬、角色 300 寬，驚嘆號跟角色在同一張）。
- 程式在 tools/src/burger1.js，也貼進 life1.js（L.more4 的 "tw:bfast"）；town1.js 兩處 "tw:soon:早餐店" 改成 "tw:bfast"。
- 規則照擠冰淇淋：一次 30 幣，料在上面左右晃，點一下落下；偏離下層超過 36%（47px/130px）滑掉→結束；差 5px 內算「完美」並對齊。晃動速度 1.6→3.8 rad/s（越高越快），晃動中心每層隨機偏一點。最下層、最上層是麵包（收工或滑掉時自動蓋上）。
- 獎勵（主委定的 50／100 層＋我補的中間層，可以改）：10 層 100、20 層 250、30 層 450、40 層 700、50 層 1000＋1 扭蛋幣、100 層 2000＋2 扭蛋幣；10 層以下每層 8 幣。每天前 10 次有獎勵；50、100 層大獎每天各一次。1000 層隱藏獎勵：星砂 10 顆（d.dust，跟流星的星砂同一種），一輩子一次，說明裡不寫。
- 畫面（世界高度 px，一層約 14px）：店 0–420、雲和小鳥 470–800、太空與飛碟 840、銀河和行星 960–1100、天堂 1180 起，媽祖等三位在 1300–1370（約 90 層），漢堡靠近時會跳。開遊戲時 window.MZ_NO3D=1，主畫面暫停 3D 繪圖省電。
- 存檔碼：LIFE 版本 4，多存最高紀錄（10 bit）和 1000 層獎勵（1 bit）；舊碼照讀。round-trip 驗證過。
- 模擬器：自動玩 8 層、跳到 20／30／60／85 層截圖、滑掉結算都正常。真機手感、難度沒驗證。


## 11/14 03:20 — 雜貨店→元氣早餐店、招牌不閃、鎮民真的身材（完整版測試頁，未部署）
- 老街北排 x46 原本的「雜貨店」改成「元氣早餐店」(tw:bfast，疊漢堡)；南排 x64 原本的「早餐店」改成「雜貨店」(tw:grocer，收魚和收成)，兩個功能都還在。
- 招牌閃：模擬器的 3 種檢查（相機微移比對、同平面三角形搜尋、街景）都沒抓到看得見的閃爍，只找到牆裡看不到的重疊。可能是手機深度精度比較差。保險做法：ksign 招牌離牆／門多 2.5 公分並加 polygonOffset；在小鎮裡（相機 z<−50.5）相機 near 0.15→0.4，深度精度約 2.7 倍。真機未驗證，主委若還看到閃，請截圖告訴我是哪一間。
- 鎮民身材：不再用 root.scale 整個拉。bodyShape(av,sh)：腿長（身體跟著抬高 lift 群組）、軀幹寬／厚／高、手臂長、粗細、頭的大小各自調；鞋子、手、扣子這種小東西只移位置不變形。10 位各自的 sh 在 NPCS 裡。林阿姨的圍裙從一塊板子改成包在身前的弧形。L.npcLine(x,z,old) 是測試用的排隊。


## 11/14 05:00 — 第一批：拜筊籤香可收、路口、禪房卡住、美容院合併（測試頁，未部署）
- 拜／筊／籤／香：右邊多一顆 ▾ 收起，收起後畫面下方中間只剩「🙏 參拜」可以叫回來；記在 localStorage mz.actFold。兩個分支都有。
- 小鎮馬路：路面是一塊塊平面（柏油、人行道）＋黃色中線小方塊，烘焙時同材質會合併成一塊，所以效能幾乎沒差；問題是「主街的人行道直接橫過側街路口、中線穿過路口」。現在 XSTREETS 記側街位置，主街在路口那段的人行道換成柏油、中線在路口不畫。
- 禪房卡住：量到小鎮的區塊在你走到禪房附近（75 m 內）時才蓋、才第一次編譯它們的著色程式（禪房附近會多 21 個），手機上這一段很可能就是卡住的那幾秒。改成載入時（whenEssential，保險 8 秒）就先蓋 gate／oldE1／oldE2／mid 四個區塊，讓暖機在載入畫面時編譯。另加「卡住紀錄」：畫面停超過 2 秒會送一筆 kind="slow" 到閃退紀錄（含位置、新貼圖數、新著色程式數），一個人最多 6 筆、每分鐘最多 1 筆。兩個分支都有卡住紀錄。真機效果未驗證。
- 理髮廳和美容院合併成「💇 美容院」（髮型、五官兩個分頁，設計師：「您好，請問有預約、有指定設計師嗎？」）。原本理髮廳那棟改成「文具店」（準備中）。
- 小鎮區塊載入時間記在 TOWNX.loadLog（模擬器每塊 10–60 ms）。


## 11/14 06:00 — 第二批：小鎮街景（完整版測試頁，未部署）
- 外牆磁磚：5 張灰階磁磚圖（二丁掛、馬賽克、10 cm 方磚、直條磚、油漆）＋每棟一個顏色（TILE_C），牆用 KW() 建，貼圖座標以公尺計，所以磁磚每面大小一樣、同磁磚同色的房子共用一個材質（烘焙照樣合併）。舊的磚線拿掉。
- 屋頂：隨機只出平頂、平頂＋大鐵皮加蓋（tin：藍／綠／橘／白／灰的鐵皮，波浪紋）；斜屋頂只給 1～2 樓的老磚房（tile）或指定的（我的家 gable）。原本隨機的 hip／gable 拿掉。
- 招牌：橫招在一樓接二樓的牆面上（騎樓：二樓下緣 FH+.42；非騎樓：雨棚上方 3.3），比牆凸出 .14～.16；直招離牆 .72。店面的二樓不放陽台、冷氣、花台；有直招的店整棟不放陽台。
- 電線桿、燈籠柱、路燈：BND 算出每排房子之間的空隙，gapNear() 挑最近、沒被用過的空隙（同一區重蓋時答案一樣，GAPM）。電線桿移到北側路緣 −74.3，燈籠線兩端都在空隙上，老街南側與巷子的路燈也是。
- 模擬器：老街、巷子改前改後截圖，沒有錯誤。真機未看。


## 11/14 07:00 — 第三批：店家老闆開場（完整版測試頁，未部署）
- tools/src/keepers1.js（也貼進 life1.js）：KEEP 每家店的人（外觀、身材、聲音 KV、動作 mode、台詞）。KS 是站在店門口的老闆（38 m 內才生出來、70 m 外收掉），店門前有一個小櫃台。點店：LIFE.keeper(k,open) 先演一段（台詞一句接一句，泡泡＋babble 聲音，男女老少音高不同，「？」尾音上揚、「！」比較大聲），再打開店的面板或遊戲；3 分鐘內再點只說一句短的；演到一半再點就直接開店。
- 動作：釣具行阿財伯哼歌晃頭玩竿（同時開窗）；家具行美雲姐打瞌睡 zzZ→驚醒跳一下→「我沒有在睡喔」；早餐店阿龍和秀琴吵架（8 組隨機），兩人面對面比手畫腳，最後一起喊「你！要不要來幫忙！？」；中藥行陳伯瞇眼張望；書店文雄被書卡住舉手；冰淇淋奶奶招手；一粥七天阿秀姨慌張張望（叫玩家名字）；花店雅琪老師優雅；飲料店小安、阿哲一起跳著喊；美容院 Kevin 擺 pose。
- 店名重新對應：中藥行 tw:herb（小吃廣場的中藥攤拿掉）、書店 tw:book、飲料店 tw:drink、照相館 tw:photo、南排 x64 改成「一粥七天」tw:congee、雜貨店搬到主街西側 tw:grocer。還沒做好的遊戲先顯示「準備中」（SOON）。
- 招牌規格統一：橫招 5.4×0.72 m、直招 0.62×2.5 m（有二樓的店都有直招，一層樓的飲料店沒有）。TOWNX.signs 列出每家的尺寸。主委給圖後：放 public/signs/<id>-h.webp、<id>-v.webp，在 town1.js 的 SIGN_IMG 加一行就會換上。


## 11/14 08:30 — 第四批：店家遊戲＋每日排名（完整版測試頁，未部署；伺服器要部署才有真排名）
- tools/src/games1.js（也貼進 life1.js）。L.games[key] 讓 more4 直接開遊戲；SOON 只剩照相館。
- 排名：worker 新增 /rank（GET 今日前 20、POST 交分數，每人每天留最好的一次，最多 400 人）和 /rankclaim（問昨天的名次，一人一次）。遊戲：burger、ice、drink、congee、herb、book、flower。mock.js 也有。
- 🧋 飲料店：20 種台灣飲料（DRK），一班 3 杯，按住出料放開停，每層倒到線上（誤差 1.5%／4%／8% 分三級），可能中途加冰水位 +7%，滿出來就結束那杯。每天前 5 班有薪水（分數×1.2）。
- 🥣 一粥七天：看 10 秒→點回來，3 桌（3／5／7 樣小菜，第 2、3 桌加飲料和湯，鹹粥要記芹菜）。三桌全對送 3 碗鹹粥（d.cg）；吃了今天幸運 +10（最多 50，d.lk），釣魚稀有魚權重 ×(1+幸運/50)。每天前 5 次有獎。
- 🌿 中藥行：主委的 14 種藥材圖（public/herbs/*.webp，tools/burger/cut_herbs.py），20 樣、45 秒、錯 3 次內、對 17 樣以上成功。成功：大還丹（d.dhtI，背包吃→d.dht +1，精力上限 enMax()=100+dht，最多 200）；吃滿 100 顆後改給錢或藥材包（d.pk）。index.html 所有 100 的精力上限改成 enMax()（存檔碼裡的精力還是 7 bit、最多存 100，因為每天會補滿）。
- 📚 書店：6×6 推積木（bkMake 隨機擺、bkSolve 用 BFS 確認最少 7 步以上），紅色「老闆」從右邊出去。分數＝100＋最少步數×5－多走的步×4－秒數/4。獎品：元氣百科（精力+20）、疾走之書（永久走路 +1%，最多 15%，d.spd，lfSpeed()）、食譜（d.rcp）、夾錢的書。
- 💐 花店：隨機 3 種花材，拖進花瓶；評分＝主枝高度（花瓶 1.5–2 倍）、天地人 1：¾：½、不對稱、主花單數、2–3 色、重心、不擁擠、用完花材。60 分以上 1 扭蛋幣（每天前 3 次）、90 分以上「這盆花太美了」5 扭蛋幣（每天一次）。原本的買種子在「買種子」按鈕。
- 🍦 超巨大冰淇淋：3D（另一個小 WebGL 畫布，關掉就釋放），主委的冰淇淋機圖在上面，手指按住出冰、左右滑轉杯子；轉速比太慢堆歪（重心偏過頭會倒）、太快超過 0.35 秒會斷；每轉一圈算一圈。排名第二天打開時結算：前 5 名 2 扭蛋幣、6–10 名 500、其他 300。一次 30 幣。手感數值（rAt、v、門檻）沒有真機調過。
- 疊漢堡結算也上排名。
- 修正：GAME_DAY 原本用 d.gd，會蓋掉花圃資料（存檔時出錯），改 d.gday。


## 11/14 09:30 — 第五批：照相館「爺爺奶奶的相簿」（完整版測試頁，未部署；伺服器部署後才有共用的委託地點）
- tools/src/photo1.js（貼進 life1.js）。阿光（照相館老闆）第一次會講 6 句故事，送「爺爺的相機」：右下多一顆 📷（camBtn）。
- 相機：取景框、快門（閃光＋喀嚓）、相簿、離開；主委多一顆「📌 設為委託地點」。拍照＝renderer 畫一張縮成 360 寬 JPEG。站在委託地點 5 m 內、鏡頭方向差 40° 內就算拍回來：照片存在這台手機（localStorage mz.ph.<i>），送 100 幣，每 10 張多 1 扭蛋幣。
- 相簿：最多 50 格，還沒拍回來的顯示主委那張照片的「受潮版」（泛黃、模糊、水痕），點開看地點提示；拍回來的並排顯示。
- 主委設地點：在畫面中間偏下（螢幕 y −0.3 那條視線碰到地面的地方）放爺爺（紳士帽、眼鏡、西裝）和奶奶（旗袍）兩個人、藏起自己，拍下來，再填名字與地點提示存檔。主委也能刪地點。
- 伺服器：GET /photospots（地點清單）、GET /photospot?i=（那張照片）、POST /photospot（要主委密碼；新增／覆蓋／del 刪除；照片 ≤120KB）。mock 也有。
- 存檔碼小鎮段 v5：相機、50 格拍回來沒、大還丹已吃／未吃、疾走之書 %。


## 11/14 10:00 — 第六批：營業時間、鎮民散步、好感度八卦（完整版測試頁，未部署）
- tools/src/hours1.js（貼進 life1.js）。HOURS（台灣時間）：早餐 6–13、一粥七天 18–02、飲料 10–22、冰淇淋 11–21、中藥 9–20、書店 10–21、花店 9–19、美容院 10–20、照相館 10–19、釣具 5–20、家具 10–21。營業時間外點店只會顯示「不在店裡（營業時間…）」，店裡的人沿著店前的街散步（櫃台收起來）；主委不受限制。
- 好感度 d.ka[key]：每天第一次進店 +1（最多 100）。10／30／60 解鎖三段八卦（GOSSIP），進店時 45% 機率說一段（泡泡＋提示條）。第三段多是隱藏任務的開頭（還沒做任務本體）。

## 11/14 12:40 第 7 批（主委 12:11 的回饋）
- 店家：點門 → 切到「店內畫面」（貨架、櫃台、老闆站櫃台後，上方對話框打字＋說話聲），不再站在門外擺攤。`life1.js` ivBuild/ivOpen/ivLine/ivClose，index.html 加 `window.MZ_VIEW` 繪圖分支。
- 中藥行改「對對碰」翻牌（16 張 8 對、60 秒）：`herbPairs`。舊 herbSort 留著沒用到。
- 冰淇淋改成 softserve 玩法：尖餅乾杯在下、手指在下方圓盤轉動/移動杯子，冰從上面一直掉，堆歪會倒；不用冰淇淋機圖片。
- 釣竿：主委兩張圖切成 12 個圖示 `public/rods/r0-11.webp`（第二張=溪釣 0-5，第一張=海釣 6-11）；手上 3D 釣竿依圖做外型（`rodModel`/`ROD_LOOK`：握把、配色環、導線環、捲線器、和竿櫻花、石鯛竿石紋、星辰銀河、金竿翅膀寶石）。釣具行面板改白底（openSheet lt 加 lfTackle）。
- HUD：參拜指引／一鍵參拜／拜筊籤香只在廟裡（body.out-temple）；收起鈕修好（!important）；左右轉鈕拿掉；精力條變細。shops-only 分支同步。
- 未部署。worker 的 /rank、/photospot 仍待部署。

## 11/14 13:20 第 8 批
- 測試頁左上「🏮 去小鎮」（mock.js → window.MZ_GOTOWN，在 town1.js）；鎮口 z −50.5…−51.6 走不過去的縫補起來（WALK 主街改到 −50.3）。
- 店內：改用 body.inshop（原本 hideui 連 .sheet 都藏，所以進店後沒有購買/遊戲畫面）；店內不畫名字標籤（lblClear）；面板開著時藏「離開」；兩人店鏡頭退後。早餐店問「要不要幫忙」時兩人一起轉向玩家。
- NPC 說話聲 babble 音量 .13→.5、濾波 Q 6→3（原本幾乎聽不到）。手機上仍待主委確認。
- 陳伯 → 許伯（全部）。
- 禪房出來卡：在禪房裡登入/重整時，外面的東西都是隱藏狀態，warmUp 的 compile 只編可見物件，走出去一次編 ~60 個 shader。warmUp 現在暫時打開隱藏物件（燈光除外）一起編。
- 參拜按鈕只在廟裡：原本的獨立 <script> 拿不到 meAv，一直沒作用；搬進 town1.js。shops-only 分支的同一段也還是壞的（那邊沒小鎮）。

## 11/14 14:30 第 9 批（主委 13:28 的 13 項）
- **規則：每次改版都在「主委工具 → 🧪 測試模式」(life1.js `L.testPanel`) 加一段這次的測試按鈕。** 測試模式：TM.on 時店家不管營業時間、小遊戲沒每日上限；TM.hour 調店家時鐘；不存檔。主委平常也要遵守營業時間。
- NPC 鼻子：npcLook() 把 5 號（豬鼻）、8 號（兩點）換成 1 號。
- 一粥七天：玲姊＋君君兩位老闆；照分數給錢（分數×0.8，最高 360），三桌全對再送三碗鹹粥。阿秀姨→玲姊。店面一閃：櫥窗和門重疊 3 cm → 櫥窗改成到門前為止（寬 w−1.55）；店門口有一根燈籠柱插在店面中間 → gapNear 不再選在房子前面（inB）。
- 家具只在家具行買（ROOMX.furnShop，白底）；家裡「家具」分頁只能擺，沒買的顯示「到家具行買」。地板／壁紙／地毯還是在家裡試鋪後買。
- 主委打字不過濾（chatCheck → me.sp 直接過；別人的訊息用 chatCheck0）；主委的話在別人畫面也不過濾（av.sp）。主委許的願存到伺服器後，別人重新讀取時還是會過濾（伺服器沒有 sp 標記）。
- 撒紅包：hbFakes 每次 5–10 個假人跑來搶（只在本機畫面，不會向伺服器領）。測試模式有「撒紅包＋假人」。
- 許伯：agedFace() 畫皺紋、眼袋、法令紋、白眉，頭髮純白。
- 屋頂「奇怪木條」＝瓦屋頂的屋脊條方向跟屋頂相反，橫著插出來。已轉正。
- 冰淇淋：杯子跟著手指轉（順時針就順時針），以前冰落點是鏡像的；冰量 ×14（之前幾乎長不高）；冰柱一直往下流；杯身加紙套（有紅色記號看得出轉動）；深藍背景。
- 飲料店：3D 透明杯；水面兩個晃動模式＋漣漪；放開後還會再流 0.22 秒、等 0.9 秒才判定；冰塊落下會推高水位、浮在線附近；每杯限時（5＋層數×3.2 秒）。沒用外部物理引擎。
- 中藥：14 張圖重新去背（人參裡混的當歸片、當歸上的鬚、陳皮的碎片拿掉，邊緣收 1px）；開局前先把 8 種圖讀完並解碼，進中藥行就先讀 14 張。
- 按鈕不重疊：測試版標籤和「去小鎮」移到上方正中；背包下只留幣數（精力已在上方）；店內藏測試標籤。手機 390×844、電腦 1366×768 都截圖看過。

## 11/14 15:20 第 10 批
- 飲料店：開始倒加冰的那一層後，先提示「3 秒後加 N 顆冰塊」，杯上一圈閃爍藍線＝加冰後會到的水位（跟著目前水位移動），3 秒後才掉。測試模式「飲料：一定會加冰」。
- 屋頂：低樓層瓦屋頂機率再降（磚房 45%、其他 5%），約 1/8。中藥行本來就指定瓦屋頂。

## 11/14 15:40 第 11 批
- **NPC 沒聲音的真正原因**：說話聲 babble() 寫在商店街模組（SHOPX 的 IIFE）裡，小鎮店家（LIFE 模組）叫不到，錯誤被 try/catch 吃掉，所以一直沒聲音（前兩次調音量都沒用）。現在商店街模組掛 window.MZ_BABBLE，LIFE 用它。模擬器確認進店後有產生聲音。
- 一粥七天閃：遮雨棚紅白條原本左右互相重疊 1 cm、又跟前面那條橫條擠在一起 → 改成不重疊、白條稍微高一點、橫條往前。是否就是主委看到的閃，待手機確認。

## 11/14 16:20 第 12 批
- 冰淇淋照主委的錄影（softserve 那款）重做：噴嘴固定，冰是一條有紋路的粗冰條，彎下來落在甜筒上；手指在下方圓盤的位置＝甜筒的位置，畫圈就一圈圈疊上去；上半截偏離下半截會搖晃、傾斜，太歪就「失去平衡了」；鏡頭會跟著拉遠。甜筒口先有一球冰。冰條不能疊在剛擠出的自己身上（延遲 9 點才算支撐），停著不動會攤成一坨不會長高。模擬：每秒約 0.9 cm。
- 釣魚：誘餌粉→白蝦仁（同一格存檔位置）；沒有餌不能拋竿（自動選這種水域第一種有的餌），釣到一半用完會收竿；左下角「換竿・換餌」打開小面板，可換釣竿（立刻換手上模型）和釣餌，魚上鉤時不能換。
- 海釣竿換成主委 15:30 的新圖（r6–r11 圖示重切），3D 外型加捲線器（紡車式／鼓式，線的顏色照圖）。
- 測試模式加：新冰淇淋、釣餌全給、清空釣餌。

## 11/14 17:00 第 13 批（冰淇淋第三版）
- 冰條截面是真的六角星（three 的 TubeGeometry 每圈推成 6 角，慢慢扭轉），不是貼圖；正在擠的那段每格重畫（不再一段一段冒出來）；噴嘴下來的冰條也是星形，會流動。
- 一開始不再懸空：甜筒不動時不擠新冰（冰條直接落進甜筒口那球），開始移動才疊；同一點的重複點不加（會讓曲線壞掉看不見）。甜筒不動時頂多一個小突起，要一直畫圈才疊得高。
- 甜筒和第一球不會歪，只有上面的冰會晃、會倒；冰落點下面沒東西 → 懸空一下（最多 5 點）就整坨倒（「冰滴到地上，整坨倒了！」），懸空的部分不能撐住後面的冰。倒的時候只有冰掉下去，甜筒不動。

## 11/14 17:20 第 14 批
- 主委的 10 張店面圖（public/shopimg/<店>.webp，1600 寬）：小鎮一樓櫥窗貼這張圖（填滿、置中裁切，town1.js shopPic），進店後當背牆（ivBuild，蓋掉原本的假貨架）。對應：釣具行、早餐店、家具行（古董收藏那張，待主委確認）、雜貨店、美容院、花店、書店、照相館、飲料店、中藥行。一粥七天、文具店沒有圖。
- 20 個釣餌圖示（public/baits/b0–b19.webp，順序跟 BAITS 一樣）：釣具行清單、釣魚時的換餌面板。
- 一粥七天門口的木製餐車（congeeCart，照主委照片：木頭車身、玻璃櫃、鍋子、斜屋頂、「一粥七天」布簾、燈泡串、長椅），只在營業時間擺出來，點了一樣進店。遮雨棚改紫白條。
- 低面數風格第一步：自然物件改成切面（石頭帶青苔、樹冠多面體、六角樹幹）、溪谷和森林撒草叢與星形花；女神泉拿掉名牌，加上升起的亮粉和斜射光束。溪谷／海邊／小鎮的整體改造還沒完成。

## 11/14 18:40 第 15 批
- 店面櫥窗：一片平面＋shader 看進 1.1 m 深的小房間（背牆＝主委的圖，地板／天花板／側牆延伸圖的邊緣顏色，三盞崁燈，玻璃反光條），外加實體窗框（顏色取自圖上的框）。圖已先裁掉畫上的外框。town1.js shopPic。
- SHOP_PIC 改成 key→檔名；家具行不再用收藏圖；「文具店」改「收藏家小屋」(tw:soon:收藏家小屋，點了顯示準備中)。一粥七天加櫥窗（店內那張）。
- 主委的 12 扇門（public/doors/d0–d11）按 SHOP_DOOR 對應每家店。
- 招牌：主委的橫招（zip）、直招（10 張＋一粥七天橫直）放 public/signs/<id>-h|v.webp；每塊招牌後面加 8–10 cm 厚的底板（直招圖本身有支架，去背）。
- 拿掉所有指示牌、公告欄（含今日功課那塊與 tw:board 站點）。
- 中藥對對碰：木桌底、青花碗蓋著，藥材換主委新的去背圖（修掉黃紅毛邊、人參混到的碎片）。
- 流星碎片：金色發光五角星＋金色光點往上飄＋金色光柱。
- 海魚 +10（虱目魚、秋刀魚、烏魚、白鯧、赤鯮、紅魽、章魚、小丑魚、黑鮪魚、旗魚），接在 FISH 最後（存檔順序不變），已加進對應釣餌。圖示目前是程式畫的，沒有模型圖。

## 11/14 19:05 第 16 批
- 一粥七天一直閃的真正原因：街上自動產生的一棟房子（x 64.0–72.9）跟一粥七天（x 64–71）蓋在同一個位置，兩面牆在同一個平面上互相搶（雨遮、二樓磁磚都在跳）。TOWNB 現在會刪掉跟有名字的店重疊的自動房子（另外也多了 TW.B 方便查）。
- 櫥窗裡的側牆、天花板、地板改成整片同色（SHOP_ROOM，從每張圖挑出牆色和地板色，例如釣具行藍色），不再拉長圖的邊；進店畫面的牆和地板也換成同色。

## 11/14 19:10 第 17 批
- 冰淇淋：前幾層（約 3 cm 內）黏著甜筒不晃；冰落點下面沒東西 → 第 2 點就判失敗「冰沒接到，掉到地上了！」；光線變柔（半球光加強＋環境光、主光變弱、冰加一點自發光）。
- 直招沒出來：直招是單面平面，從另一側看不到 → 加一片背面，兩面都看得到。

## 11/14 19:50 第 18 批
- 直招：拿掉背後底板（從一側看是黑板子）；一粥七天橫招放大到最高 1.45 m。
- 每個遊戲加音效（life1.js GSN：倒飲料咕嚕、擠冰淇淋、掀碗、配錯、上菜、推書、剪花、漢堡落下）。
- 海邊：出海口的木棧改成橫跨溪流的小拱橋（MOUTHB 改窄）；拿掉沙灘上那片木板平台；躺椅靠背方向修正、枕頭移到頭那邊；躺椅變成座位（TW.lounge，kind "lounge" 半躺），點了直接躺上去，起身鈕起來。
- 走到海邊霧會散開（near 160／far 420），離開恢復；海面加陽光反光（太陽方向的亮帶＋閃光點），海上空加太陽。
- 草地↔沙灘、老街出口↔溪谷 的顏色漸層。
- 車站旁的河：大草皮蓋在水面上方 10 cm，近看就穿出來 → 草皮在河的範圍挖空，加河床。
- 晚上路燈：燈泡隨夜晚變亮、光暈、地上暖色光圈。
- 花圃改成溫室（白框玻璃屋、裡面三排菜），花圃畫面裡也有溫室骨架和玻璃牆。BLOCK 加溫室範圍。
- 區塊載入加 try（TW.loadErr 記錯誤）。
- 測試模式加：海邊、溫室、河邊、晚上／白天。
- 還沒做：走不過去的地方加欄杆／樹叢、中藥行木桌圖（等主委說是哪張）。

## 11/14 20:10 第 19 批
- 招牌：signPic 改成有厚度的盒子（橫招 14 cm、直招 16 cm，側邊用招牌邊色），直招兩面都貼同一張圖；拿掉 ksign 裡直招的背板（造成兩邊不一樣長）。盒子要 polygonOffset=false。
- 魚模型：主委 7 張魚表（tripo glb，~200 萬面／張，每隻魚是一塊獨立網格）→ tools/fish/mk2.py 拆成 36 隻新魚，存 public/fish2.glb（2.5 MB，6 張 640 貼圖，法線 int8、UV uint16，KHR_mesh_quantization）＋ public/fish/<id>.webp、<id>-d.webp 圖示。
  - 沒有 gltfpack（沒網路），用 numpy 減面：每隻魚切 32 格，同一格同一塊 UV 島的點合併；位置／法線按格子共用，接縫不會裂。每隻約 800–4800 面。
  - 用 1e324bca、c6a3ce1c、be06afbf、9eb00065、fda1cdd3、33c41eb9；c2169c8e 是重複的（翻車魚、鯊魚、皇帶魚）沒用。蘇眉（1e32 第 8 隻）不在魚表沒用。be06 的錦鯉、鱸魚、紅龍、虹鱒，fda1 的吳郭魚、鯉魚、孔雀魚、溪哥、鯰魚、像泥鰍那隻 → 已經有了沒用。
  - 9eb0 的錦鯉當「泉之錦鯉」、金色龍魚當「金鱗仙魚」——待主委確認。龍王鯛還沒有模型。
  - life1.js：FMODEL 加 36 種；fishLoad 同時載 fish、fish2；wagMat 改成每個材質一份（以前全部共用第一隻的貼圖）；L.hold 等到那隻魚的模型到了再拿，換魚時拿掉上一隻。
  - 測試模式加「下一隻新魚模型」「圖鑑全部點亮」。
  - 測試頁檔案上限 512 個（已用 479）→ 新魚圖示打包成一個 fish-pack.js（window.FISH_PACK，fishIcon 本來就會先看它），發布前在測試頁 index.html 的 </head> 前加 `<script src="fish-pack.js" async>`；fish2-model.js 用 make_model_js 的方式產生。正式站直接讀 public/fish/*.webp 和 fish2.glb，不用這兩個。

## 11/14 21:10 第 20 批
- 得意屋家具：主委的櫥窗（shopimg/furn.webp，裁到框內）和招牌（signs/furn-h、furn-v，從去背圖裁）；SHOP_PIC/FRAME/ROOM 加 furn。
- 沒開的店：招牌不發光、變暗，櫥窗變暗（shopPic 加 lit uniform；TW.SL 登記每家店的櫥窗與招牌，TW.tick 每秒用 LIFE.openNow 檢查——用 performance.now 計時，因為小鎮很重時 dt 被夾住）。LIFE.openNow 不看測試模式「全開」，只看時鐘（測試模式可撥時鐘）。
- 心語花店改成「花束打工」（bqGame，取代舊插花）：工讀生照客人訂單包花束。38 種花材、6 種包裝紙（後層畫在花後面、下半段再畫在花前面蓋住花莖）、5 種緞帶；後／中／前排；從花架往上拉進花束、或點一下直接放；拉出花束就拿掉；限時 100 秒。評分 100：指定花材 35、顏色 25、數量與禁止 20、包裝 10、時間 10；缺指定花材最多兩星。打工費 ★★★500／★★300／★200（直接加平安幣，畫面沒有任何價格）。12 種訂單（BQO）。圖：public/flw/（tools/flower/cut.py 從主委的花材圖切）。雅琪老師→雅琪店長。⚠️ 主委規格沒寫每天上限，所以沒設上限。
- 溫室：三間、不透明（霧面白膜），第二、三間門上交叉木條，點了說準備中（SOON tw:gh2/gh3）。花圃畫面拿掉溫室骨架、小屋、樹、圍籬，只剩草地＋12 塊田；田面是主委的土壤圖，作物是主委的生長圖（public/garden/<作物>-<0..3>.webp，tools/garden/cut.py 去背），用 Sprite 立著。西瓜、哈密瓜、白蘿蔔、康乃馨、牡丹的圖也切好了，但存檔碼裡田的種子只有 3 bit（最多 7 種），要加新作物得改存檔格式，先沒加。
- 中藥對對碰背景：主委的古老木桌圖（herbs/table.webp）。
- 測試頁檔案上限 512：新圖打包成 img-pack.js（window.IMG_PACK），程式用 MZIMG()／IMG_PACK 先找包裡的，正式站直接讀檔。
- 測試模式「11/14 晚上 4」：花束打工、得意屋家具、時鐘撥 3 點／恢復、三間溫室、花圃全作物階段、小鎮讀取狀態（主委說小鎮少一塊、中藥行那條不見，模擬器裡看得到，還沒重現）。

## 11/14 21:40 第 21 批：一粥七天・深夜出餐大挑戰
- 取代舊的「記菜單」（congeeGame → czGame）。照主委規格：120 秒、三桌（1/2/3 號桌）、點桌看單、從 7 類 44 道料理點進托盤（最多 8 份，同一道顯示 ×n，點托盤上的拿掉一份）、清空托盤、送餐；每桌托盤各自保留。完全正確才算；錯了「送錯餐啦！」扣 10 秒、失誤 +1、訂單保留。完成後 1.2 秒補新單。難度：0–3 張 2 道各 1 份（常見料理 CZ_EASY）；4–7 張 2–3 道、可能 ×2，加湯品／小菜／炸物；8 張以上 3–4 道、全部料理。
- 結算：8+ ★★★ 鹹粥 ×3、5–7 ★★ ×2、3–4 ★ ×1，結算當下直接放進背包一次（重開結算視窗不會再給）；不給平安幣。排行改成「張」。
- 鹹粥（既有的 d.cg 道具）：吃一碗精力 +min(100, 上限−目前)，滿了不吃、說「精力已經是滿的了」；不受每天 66 恢復上限限制（主委規格沒寫）。說明不寫效果。存檔碼 LIFE 版本 6 加鹹粥數量（8 bit），讀舊碼相容。
- 修了一個舊錯：life1 裡呼叫 enMax() 但它在商店模組裡，叫不到（大還丹說明、吃大還丹、energy()）→ SHOPX 匯出 SX.enMax，life1 自己包一個 enMax。
- 料理圖：public/congee/d00–d43.webp（主委 44 張，裁邊縮到 180）。分類是我照名稱分的，CZD 陣列。注意：炸紅燒肉（肥）（瘦）同一張圖、鹹蜆仔和蒜泥鮮蚵同一張圖（主委素材說明也提到），只能看名字分。
- ⚠️ 規格要求伺服器驗證獎勵；目前遊戲的背包、精力都在前端存檔＋存檔碼，沒有伺服器發獎流程，所以是前端發放（每局只發一次）。
- 測試模式「11/14 晚上 5」：直接開始、直接結算 8 張、精力設 40。

## 11/14 23:00 第 22 批
- 中藥對對碰：碗整體往下（margin-top 20vh）、上方計時列加深色底；音效：開始、翻碗、配對成功（good+serve）、配錯（miss）、蓋回去（thud）、最後 10 秒滴答、贏／輸。
- 一粥七天料理圖重新去背（tools/congee_cut.py）：歐氏距離侵蝕 12px 找出主菜（旁邊菜的細邊會消失）→ 擴回 12.5px，再去掉盤外零碎、開運算去掉盤緣殘渣。
- 花束打工改版：店裡背景（主委的花店圖裁出工作台那張，flw/shop-bg.webp）；一開始就有淡淡的包裝紙＋虛線圈標出花要放的地方，放到圈外會被退回；改成三步驟 ① 挑花 → ② 包裝紙 → ③ 緞帶（可上一步）；花可以「↔ 翻轉」（點一下選花，沒選就翻最後一枝），「↩ 拿掉」也是對選中的那枝；包裝紙遮罩：紙口以下只畫在紙的範圍內（FC/MC 兩張離屏 canvas，destination-in），花莖不會跑出紙外。
- 釣魚時不能移動：fishTick 設 window.MZ_HOLD（釣魚中＝true），走路（搖桿／鍵盤）和點地走路（walkTo）都看它；開始釣時把目標拉回原地。

## 11/14 23:20 第 23 批
- 西側巷弄（美容院、收藏家小屋那條）：燈籠柱原本每 5.5 m 一根，剛好站在兩家店門口 → 改用 gapNear 放在房子之間的空隙。
- 美容院：Kevin 講完話、開髮型／五官面板時，離開店內畫面，鏡頭轉到自己的臉（同「頭飾定位」的 customizing＋pvMode face），試試看馬上看得到；關面板恢復。salonOpen 裡的 salonView()；closeSheet 對 lfSalon 結束 customizing。

## 11/14 23:59 第 24 批
- 擠冰淇淋搬進新店「美琪冰店」（oS 列，釣具行與中藥行之間，a=43 w=6.4），用主委的櫥窗（shopimg/ice）、橫招（signs/ice-h）、直招（signs/ice-v）；門用 4 號。原本廣場上的冰淇淋攤（STALLS 第一個）和 tw:ice 站點拿掉，冰淇淋奶奶改站店門口（拿掉 spot）。
- 新選項 awnUp：雨棚往上（美琪 .42），橫招、直招跟著往上。
- 60風飲料店改 2 樓，才有直招（只有 2 樓以上的店有直招）。
- 花圃：地面換成主委新的土壤圖（garden/ground.webp，平鋪），拿掉草叢；作物圖對準田的中間（Sprite center .5,.3）。

## 11/15 04:20 第 25 批：美容院大改＋造型定位
- 髮型：主委的灰模（tripo_convert_9bf3cad7，21 款：男 10、女 11）→ tools/hair/mk.py → public/hair2.glb（h00…h20，int16 位置，載入時 hair2Load 轉回 float；r128 的 getX 不會自動除 32767，要自己乘 .8/32767）。look[1] 25–45；用玩家選的髮色上色。舊的 10 款付費髮型（25–34）被取代。用 loadRaw0 直接載（排隊會被擋住）。
- 眼睛 48 款、嘴巴 64 款：主委的圖 → tools/face/cut.py → public/face/eyes.webp（8 欄，192×96）、mouths.webp（8 欄，144×96）；faceTexture 用 faceEyes／faceMouth 貼圖。前 15 款眼睛、前 12 款嘴巴免費（順序盡量對上舊款），其餘在美容院買。
- 鼻子改立體（buildNose，10 款），不再畫在臉上。
- 美容院四個分頁：髮型（含免費髮色）／眼睛／鼻子／嘴巴，列表有縮圖。擁有紀錄改用一般數字的位元（超過 32 個），存檔碼 LIFE 版本 7；舊碼的嘴巴擁有紀錄歸零（編號變了）。look[7]、look[9] 各多 1 bit；修了 lookCode 把 >31 的值夾成 31 的舊錯（髮型 ≥32 會壞）。
- 換造型分頁：臉／眼睛／鼻子／嘴巴／髮型／服裝；頭飾分頁拿掉（創角也沒有），玩家的 look[6] 歸 0（NPC 還是有頭飾）。
- 造型定位（主委工具，頭飾定位旁邊）：FIT2 —— 每款新髮型（hr25…hr45：大小、上下、前後、左右、前後傾）、眼睛 f_eyes（大小、間距、上下、傾斜角度）、鼻子 f_nose（大小、上下、前後）、嘴巴 f_mouth（大小、上下）。眼鼻口是所有款式共用一組。跟頭飾定位存同一個地方（/hatfit，測試頁存手機）。worker 的筆數上限 80→200（⚠️ 要部署 worker 才生效；沒部署前超過 80 筆會被截掉）。
- 測試頁：face/*.webp 進 img-pack.js；hair2-model.js 另外產生。
- 還沒做：新髮型戴帽子（扭蛋頭飾）時不會把頭頂壓扁；眉毛會壓在新眼睛上緣。

## 11/15 04:50 第 26 批（修正第 25 批）
- 主委：舊的眼睛嘴巴沒說要刪；新增的全部是美容院花錢買的。→ 舊的畫的眼睛（0–24，前 15 免費）和嘴巴（0–13，前 4 免費）原樣留著；主委的圖接在後面：眼睛 25–72（EYE_PIC=25）、嘴巴 14–77（MOUTH_PIC=14），全部要在美容院買。舊嘴巴擁有紀錄不再歸零。
- 擁有紀錄：每 30 個一個數字（h、e、e1、m、m1、m2…；ownKey／ownHas），存檔碼 v7 每樣一個 bit（OWN_N：h21、e58、m74、n10）。look[7]、look[9] 各多 2 bit。
- 髮型太粗：GRID 34→60（每款約 2 萬面），改成每款一個檔 public/hair2-00…20.glb（各約 240 KB），有人戴才抓那一款（hair2Load(n)）。public/hair2.glb 刪除。
- 測試頁：21 個 hair2-NN-model.js（GLB_HAIR2_NN），hair2-model.js 拿掉。

## 11/15 13:40 第 27 批：造型定位改成「每一款各自調」（這個帳號接手）
主委：髮型要能調左右／上下／前後厚度；新鼻子裝上時舊的要拔掉（不然兩個鼻子）；造型定位裡點「眼睛」下面要列出全部眼睛、每一款都能微調，鼻子嘴巴也是；以前點眼睛下面還是頭髮選項；頭髮另外一個項目。
- **造型定位面板**（`HANDLERS.faceFitOpen`）：上面四個種類 👁 眼睛／👃 鼻子／👄 嘴巴／💇 髮型（`FF_CAT`），下面列出那一類的每一款（眼睛、嘴巴是主委圖的有縮圖），點哪一款就戴到自己身上、拉桿只調那一款。最後選的那款各類別分開記（`HFIT.last_e` 等）。
- **每一款各自的設定**：id 是 `e<編號>`（0–72）、`m<編號>`（0–77）、`n<編號>`（1–10）、`hr<編號>`（25–45）。原本共用的 `f_eyes/f_nose/f_mouth` 還在、照樣套用（大小、間距相乘；位置、角度相加，`fit2C`），面板不再顯示。畫的舊眼睛／舊嘴巴也能調（faceTexture 裡用畫布 transform 包起來）。
- **髮型厚度**：`ex` 左右厚度、`ey` 上下厚度、`ez` 前後厚度（乘在大小 w 上）。伺服器本來就收 ex/ey/ez 這三個字母。
- **兩個鼻子**：主委的嘴巴圖裡 豬鼻(65)、狗狗嘴(66)、貓鬍鬚(67)、小丑鼻嘴(71) 自己畫了鼻子 → 戴這幾款嘴巴時不長立體鼻子（`MOUTH_NOSE`）。造型定位調鼻子時，若嘴巴是這幾款，預覽先換成一般嘴巴。
- **要不要設定碼**：正式站按「儲存給大家」直接存到伺服器（/hatfit），不用碼；測試頁只存在那支手機，才要按「📋 複製設定碼」貼給工程師寫進預設值。面板上兩種說明都寫了。
- worker：/hatfit 一次收的筆數 200→400（每款各自存以後筆數會變多）。⚠️ 要部署 worker 才生效。
- 模擬器測過：四個分頁、選款、拉桿（眼睛大小／間距、鼻子大小、髮型左右厚度）、輸出 `{"hr30":{"ex":1.5},"e30":{"w":1.5,"xs":1.4},"n3":{"w":2.2}}`、狗狗嘴不長鼻子，無錯誤。**真手機沒測。**
- 測試頁發佈工具：新增 `tools/test/publish_prep.py`（一次做完 build_test、模型轉 -model.js、家具 pack、fish-pack、img-pack，並列出要放進 artifact 的檔案清單 test-files.txt，418 個檔、163 MB，要分 4 次發佈）。img-pack 現在也包 paperph、ads、catcoat、doors；測試頁另外把 `Image().src` 導向 IMG_PACK。這個帳號的測試頁：https://claude.ai/artifact/AoijZsXok572bn8GTe32K6

## 11/15 13:30 第 28 批：拿掉鼻子造型
- 主委：「把造型的鼻子刪除，不要鼻子造型了」。
- 所有人（玩家、NPC）都不再長立體鼻子（`_setLook0` 不呼叫 buildNose）。look[13] 和存檔碼裡的鼻子欄位留著不動（舊碼照讀），只是不畫；美容院買過的鼻子紀錄也留著。
- 換造型拿掉「鼻子」分頁；美容院拿掉「👃 鼻子」分頁；造型定位拿掉鼻子種類；測試模式拿掉「美容院：立體鼻子」鈕；NPC 對話「眼睛、鼻子跟嘴巴」改成「眼睛跟嘴巴」。buildNose、NOSES、FIT2 的 n1–n10 還在程式裡（沒有用到），要恢復只要把 `_setLook0` 那行加回去。
- 主委問「進商店後 NPC 頭上黑黑的、像沒字的對話框」：模擬器裡 M超商、飲料店都沒重現（店內對話框是白的 DOM），已請主委截圖，還沒修。

## 第 29 批（11/15 15:00）髮型變平滑、狐狸面具不再光頭、帽子黑點、一粥七天大改
- **新髮型（hr25–45）變平滑**：載入時做 hair2Smooth()：先把每個三角形翻成跟原本法線同方向（之前有些面朝反了→深色斑塊），再 Taubin 平滑 10 輪（HAIR2_SMOOTH，平滑但不縮水），最後重算法線。疙瘩跟上色不均大多消失，剩少數小碎片。
- **戴頭飾（HAT_FIT，例如狐狸面具）變光頭**：setAcc 會把「頭頂突出的頭髮」藏起來，新髮型是整顆頭一整塊，所以整個被藏。buildHair2 設 userData.hatHide=0（mergeGroup 也看這個旗子）。
- **帽子上的黑點**：棒球帽/進香帽（hat 3、4）前面的 CircleGeometry 平面 logo 從多數角度看是黑的 → 改成順著帽子前面斜度的小凸起徽章（cap-logo2）。
- **一粥七天 NPC**：玲姊戴鴨舌帽（look[6]=4）、法令紋（agedFace 新選項 fold:1，只畫法令紋）、後面綁包頭（P.bun，帽子會蓋掉髮型自己的丸子，所以另外加一顆在帽子後面＋紅髮圈）。君君開店時站在外面攤車的後側角（junTick，在 npcTick 裡，TOWNX.cart 看得到才出現）；店裡只剩玲姊，台詞改成「我們能給你一點工資讓你打包鹹粥帶走！」。
- **一粥七天遊戲重做（czGame）**：一次一張單（單上寫桌號 1–10），放好菜按送餐 → 跳出 10 桌平面圖選桌。菜對＋桌對才算完成；錯了托盤保留可以改、連擊歸零、畫面晃一下。無時間限制，按「離開」結算。
  - 薪水：第 10 張馬上給 500 平安幣＋鹹粥 1 碗；之後每張 +20，每滿 10 張（20、30…）先發一次，遊戲不中斷；離開時補發沒發的：未滿 10 張 → 5–9 張 300、1–4 張 200；超過 10 張 → 每張沒發的 ×20。（czOwe / czPay）
  - 爽感：單完成的金幣星星爆開、連擊（3/5/10 連擊不同字樣＋音階往上）、快手提示、每行菜對了變綠打勾＋小閃光、發薪全畫面金色＋金幣雨＋音效、進度條「再 N 張發薪」。
  - 排名照舊用完成張數（rankPost("congee",done)）。
- **測試頁**：paperph/ads 不再打包進 img-pack（報紙用 <img src> 讀，route 抓不到 → 照片破圖），改成一般檔案（共 497+1 檔，上限 511）。
- 已知：sim 裡狐狸面具模型要排在載入佇列後面（LQ），所以截圖裡看不到面具，不是程式錯。

## 第 30 批（11/15 16:10）一粥七天手機修正
- 主委：手機上小菜分類列不能往右滑（點不到清涼飲料）、右上「離開」按了沒反應。
- 分類列：整個遊戲畫面 touch-action:none，分類列沒開橫向滑 → 加 touch-action:pan-x；直式手機改成分類按鈕自動換行，全部都看得到。
- 離開：遊戲面板往上蓋到「離開」按鈕（B.style.top 比其他遊戲高），手機點到的是面板 → 按鈕 z-index 拉高。模擬器用真的點擊（pg.click，被蓋住會失敗）測過可以按。
- 結算等排名最多 3.5 秒，連不上也會開結算畫面。
- 主委補充「最多只能賺 3000」：解讀成**每天**最多 3000 平安幣（每局上限的話重開就能一直刷）。存在 bag.lf.czD（哪一天）/ czE（今天賺了多少），CZ_CAP=3000。鹹粥照給。開場會寫「今天還能賺 N」，領滿時發薪畫面跟結算會說「今天的工資已經領滿 3000 了」，遊戲照樣能玩、衝排名。模擬器測過（先設今天已賺 2900 → 第 10 張只給 100）。

## 第 31 批（11/15 19:40）刪眼睛、眼睛定位預設值、找問題工具
- 主委：「閃亮大眼、睫毛圓眼、貓眼這一批加入的眼睛都刪除」→ 眼睛 15–24（💄 閃亮大眼…驚喜圓眼，主委眼睛圖之前那 10 款畫的）不再出現：換造型（picRow／chipRow）、美容院（從 EYE_PIC 開始列）、造型定位（FF_CAT）都拿掉；sanitizeLook 和 faceTexture 把 15–24 換成 0（圓眼），所以戴著的人（含 NPC）變圓眼。EYES 陣列沒刪（索引不能動，存檔碼照讀）。`function EYE_DROP(e)` 用 function 宣告（sanitizeLook 在前面就會呼叫）。
- 主委貼了 HATFIT 眼睛定位碼（e25–e72）→ 寫成 FIT2 預設值（MOUTH_NOSE 上面那段 D）。伺服器／手機存的值照樣會蓋過去。
- 黑點（主委：不是帽子，沒帽子的 NPC 也有，點商店走過去的路上出現）：模擬器重現不了（釣具行走過去、對話框清單都正常）。截圖放大看是深棕色膠囊＋金邊，像對話框 bubbleSprite 的底色但沒有字，也可能是 3D 物件。加了測試模式最上面「🔎 點東西看它是什麼」：按了以後點畫面上的東西，列出那個位置的頁面元素、名字／對話框圖（LBL.last，sprite.userData.txt 記文字）、3D 物件（含上層名稱、顏色、座標）。
- 建築不見（主委截圖在 29,-97 一帶，一粥七天那邊也沒了）：模擬器和本機測試頁都看得到，載入沒有錯誤。「🔎 小鎮讀取狀態」移到測試模式最上面，並多顯示讀取紀錄、畫面物件數、記憶體、GL 有沒有掉、霧、省電。等主委按了截圖。

## 第 32 批（11/15 21:30）戴帽子時把穿出帽子的新髮型切掉
- 主委：帽子戴上後，帽子以上的頭髮要切掉隱形；帽子底部不是水平的，要切乾淨；高度讓主委在頭飾定位調。
- 做法（hatDirMap / hairCutOn / hairCutApply，在 Avatar.prototype.setAcc 前面）：帽子模型載入後，從頭的中心往每個方向量「最近的帽子在多遠」，記在 512×256 的經緯度小圖（一個 byte，0–1.2 頭單位）。新髮型（userData.h2）換成自己的材質複本，shader 裡算每個頭髮點的方向和距離，比帽子遠的（穿出帽子、在帽子上面）就不畫；在帽子裡面、寬帽簷下面的保留。不靠水平面，所以斜的帽簷、斗笠、鴨舌帽都照帽子形狀切。
- 頭飾定位多一條「頭髮切線」（HAT_FIT 的 hc，預設 0）：＋ 往內多切、− 少切；拉到最右（≥.59）＝不切（面具、皇冠這類用）。帽子模型晚到時 accHead.userData.onReady 會再算一次。
- 舊髮型照舊用「藏起頭頂突出的部分」。NPC 如果被合併（autoBake）不會切。
- worker /hatfit 收的欄位加 "hc"（⚠️ 要部署 worker，正式站才存得進伺服器；測試頁存手機）。
- 模擬器看過：巫師帽、斗笠、老虎帽、皇冠，各「不切」「切」「背面」。斗笠帽簷下的瀏海保留；老虎帽背面看得到帽子後面開口裡的頭皮（可以把切線往 − 調）；皇冠、狐狸面具建議設不切。

## 第 33 批（11/16 00:20）主委的頭飾＋髮型定位碼、貓腳印閃爍
- 主委貼了 HATFIT（43 頂帽子＋hr25–45 髮型＋e25–72 眼睛）→ 帽子併進 HAT_FIT_CHAIR（含每頂的 hc 頭髮切線：大多設 .6 不切；官帽 −.15、斗笠 −.125、巫師帽 −.085、太空帽 −.115、藝伎 −.11），髮型／眼睛併進 FIT2 預設值那段 D。
- 貓掌帽腳印在柏油上一直閃：腳印放在地面 +.012，跟小鎮柏油（.012）同高 → 改 +.034（高過人行道 .02 和黃色中線頂 .028）。
- 主委問小鎮柏油為什麼有黃線：那是 street() 畫的道路中線虛線（每 4 m 一段，路口不畫）。已問主委要不要拿掉，還沒動。

## 第 34 批（11/16 01:40）釣竿釣餌有感、美食廣場四攤、小鎮馬路同款、地圖補齊與圍牆
- 主委：徹查遊戲獎勵（做成 Docs「雲端天后宮・遊戲獎勵與精力總表」https://claude.ai/artifact/5Qa6uZMnYwd5xKt1sjtm4K）。
- 釣竿／釣餌：fishW/odds/rodFx/rodFxTxt。釣餌對應的魚機率 ×6（原 ×4）、那幾種魚上鉤等待 ×0.4（其他餌 ×0.7）；釣竿：綠色區 +ctl×2、收線 pow^1.8、魚掙扎 /(.5+pow×.5)、魚變大（kz）。釣具行每支竿寫實際加成（綠色區 +X%、收線快 X%、稀有魚 ×、釣到大隻 +X%、上鉤反應 +秒）；每種餌寫「引來：魚名（沒釣過＝？？？）」；釣魚時換竿換餌面板多「這裡現在可能釣到」前 6 種＋機率條，換餌立刻看到變化。
- 美食廣場（小吃廣場 plaza）四個攤位恢復，招牌都改「籌備中」。
- 小鎮馬路：TX.asphalt／pave 改用跟廟前馬路同一張柏油／人行磚（twAsphaltTex/twPaverTex，SHOPX 也露出 asphaltTex/paverTex）；主街（along z）中線改雙黃實線＋白邊線（路口斷開），側街（along x）也加雙黃線和白邊線。
- 地圖：WORLD_BOX={x0:-105,x1:155,z0:-262,z1:95}；整片底草（淺綠，跟山谷/山的草地同色，ShapeGeometry 挖掉河、山谷、海灘、森林、天后山的洞）、東邊沙灘延長、西北南三面白牆紅瓦＋柱子；sea() 拉長到整條東邊；flyClamp 改用 WORLD_BOX（原 ±140 飛到天后山、海邊會卡住）。山谷 valleyH 南北兩端坡下來、瀑布崖往北延到 −43.5 斜下去（原本 z −50 是一面切掉的半座山）。TW.loadAll() 一次載入全部（測試用）。
- 還沒做：地圖內「不能走的空地」用圍牆圍（walkable 是分區的，空地本來就不能走；這次只做了世界邊界牆）。

## 第 35 批（11/16 02:10）經濟調整（主委 11/16 01:19）
- 精力：每天恢復上限 EN_REC_MAX 66→100（等於吃東西、泡湯一天最多 200）。LIFE 新增 enPay(n)（主委 sp 不扣）、EN_SHOP=5：一粥七天、飲料店、早餐店、花店、中藥行、書店、冰店開始一次 −5。
- 漢堡：每天最多 2000（D.e 累計）。
- 一粥七天：CZ_CAP 2000；第 10 張發薪時另外送 2 道店裡的菜（隨機，CZD 除鹹粥），進 LF().gi（"cz:dNN"），可以送 NPC；結算也寫出來。
- 送禮物品通用：GI()/giAdd/GINFO/giInfo/giIc（之後昆蟲 bug:、挖到的 dig: 都放這）。NPC 送禮清單會列出 gi；lfNpcGive 的 id 可以含冒號。
- 花店：FW() 每天 3 班、每班 3 束（lfFlwNext 接下一張）、★70/★★120/★★★170，每天最多 1500；第 4 班擋住。
- 照相館：每張 200＋扭蛋幣 1。
- 釣魚：每次拋竿 −2 精力；每天 30 條（fishDay/fishLeft，sp 不限）；售價 priceK：淡水 ×1.5、海 ×0.7、女神泉 ×1（平均一條約 160～180，30 條約 5000）。
- 種植：澆水一格 −10 精力；種子／售價改（向日葵 60→450 20 分、鬱金香 80→600、番茄 70→190×3、草莓 100→280×3、高麗菜 150→1000 60 分、玫瑰 200→1400 90 分、南瓜 300→2000 120 分）。
- 冰淇淋排行本來就是每天一榜（worker rank 用 TW() 日期），沒改。

## 第 36 批（11/16 02:40）NPC 個性、店員下班、好感打折、家具取得
- NPC_P：10 位鎮民＋各店員（id k_<店>_<i>，例 k_tackle_0）喜歡／討厭的標籤和反應台詞。禮物標籤 giftTags：魚 id＋"fish"＋"rare"、作物 id＋"flowers"/"veg"（草莓 "sweet"）、gi 物品 id＋cat（dish/bug/fossil/junk/old…）。喜歡 +5、普通 +3、討厭 −2（例：小胖收到魚「喔……好喔……這……是……魚嗎……我……不是貓……」、雅琪店長喜歡昆蟲）。L.onGift 留給之後任務用。
- 店員下班：keeperNpcs() 由 KEEP 自動產生，店沒開（!L.isOpen）時在店門口（TW.stOf＝站點）附近走動；點了是聊天／送禮（npcSheet），不是商店。開店就收起來。
- 進店（L.keeper）每天 +1 好感（kpVisit）。好感打折 shopDisc/dPrice：10 −5%、30 −10%、60 −15%、100 −20%；套用在釣具行竿和餌、花店種子、家具行（fPrice）。
- 美雲姐（k_furn_0）好感 30：房間「家具」分頁可以直接「📞 跟美雲姐訂一件」（只限買得到的家具）。
- 家具來源（FD 第 7 欄）：b 91 件（40%）；其他 q 功課寶箱 40、c 夾娃娃 32、n 鎮民好感 14（GIFTS 10/30/60 改給 n）、w 第一次釣到稀有魚 14、d 挖寶 13（第 60 項做）、g 簽到 9、f 節日紅包 8、m 星空 6（流星 30% 機率、或找博士用 8 顆星砂換：lfDust）。SRCN/SRCS 加上說明。

## 第 37 批（11/16 凌晨，主委睡前清單）昆蟲、挖裂縫、女神泉任務、天后新村、廚房、背包分類、NPC 委託、UI
- 昆蟲（aeef98d）：BUGS 20 種（id,名,emoji,色,稀有 1–4,區域,時段,會飛,價,台詞），BUG_AREA 區域框，NETS 三種網（威利賣 300 / 2 稀有 / 1 傳說+2 稀有；20/30/40 次），NET_RATE 命中率；稀有 r≥3 第一次揮空會飛走、第二次就消失。抓到進 GI "bug:<id>"，卡片 .bug-card 動畫。博士「🔬 賣昆蟲・化石」收購。L.tick7=bugTick。
- 挖裂縫：L.tick8=digTick。小鎮可走的地方每 1.5–2.5 分鐘冒一條發光裂縫（最多 3 條，鎮口以北不冒）。鏟子 SHOVEL()=LF().sh {u}：威利 400 幣 15 次（shovelShop / HANDLERS.digBuy）。挖一次 3 精力、一天最多 DIG_DAY=15 次（LF().dgD/dgN）。DIGS 30 種（垃圾 7、老東西 8、化石 6、送禮小物 5、特別 4：平安幣 50–300、扭蛋幣、家具 ROOMX.grant("d")、頭飾 gachaLeft() 隨機一頂，沒有就給 2 枚扭蛋幣），平均一次約 127 幣。進 GI "dig:<id>"；化石・老東西博士收、垃圾威利回收（digSellRows / HANDLERS.digSell）。動作：鏟子掛在手上戳三下＋身體彈跳＋土塊粒子＋震動，東西轉著彈出來，再出卡片。圖先用 emoji。
- 女神泉任務：LF().gq {s,d}。goddess() 在 s<4 而且沒有金竿（rods&32）時開 godQuest()：第 1 天一條魚、第 2 天一隻蟲或花草（tag flowers）、第 3 天流星石或 3 星砂、第 4 天交出和竿（rods bit 16）→ 女神升起、得到「女神竿」（RODS[5] 改名，原「女神的金釣竿」）。一天一步（sp 不限）。之前「誠實三次送金竿」拿掉了。泉水沒開時 g 水域不能釣（godOpen）。
- 星空竿（RODS[11] 改名，原星辰釣竿）：要阿財伯（k_tackle_0）好感 100＋流星石 3 顆（lfForge）。釣具行的「？？？」那一列依好感講三段提示。
- 天后新村（TOWN）：VIL / LOT_SZ / LOTS（40 間，4 條巷子 z −160/−185/−210/−235，大道 x −26…−20，入口接住宅巷西端，紅色牌樓在 z −140）。LOTS 進 TOWNB（row "vil<巷><n|s>"，key "tw:lot:<i>"），站點、門、名稱「天后新村 N 號」自動有。ZR 西界改 −100（尋路格子變大），WALK 加了巷子；TW.walk 在 x<−17 只認 WALK；inVil 讓 ground/camOK 不走南山的高度。CH 加 vilA1/vilA2/vil0–3；villageLane 畫草地、路、燈、樹、每戶門口的牌子（TW.lotSign，LIFE.lotTxt 決定字：售＋價格／我的房子／我的家，TW.lotRefresh 換字）。
- 房子（LIFE）：LF().hm {own:[], cur}（-1＝住宅巷的小家）。L.lot(i) 買／進去／搬家；價格 dPrice("tw:furn")（美雲好感打折）。小 S 6×5、中 M 7.5×6、大 L 9×7：ROOMX.size(w,d)（ROOM 的 RW/RD 改 let，換尺寸就重建，家具 clampIt 拉回房內）。住宅巷的 tw:home 進去固定 6×5。金色「我的家」標記 HMK 浮在現住的房子上，在鎮上越遠畫越大（L.tick9）。
- 廚房：房間右上「🍳 廚房」（ROOMX.cookBtn → kitchen()）。COOK 10 道（書店的 RECIPES 名稱），食材 ING 16 種在威利（L.seasonShop，調味料一瓶 5 次，LF().ing），藥材包 d.pk、番茄 crop、鹹粥要一條魚。煮一次 5 精力，翻炒指針小遊戲三下：普通／好吃／絕品（絕品多一份）。成品 GI "ck:<i>"，吃了走 SHOPX.enAdd（算進每天恢復上限 100），也能送人。房間裡開 sheet：body.sheet-top 讓 sheet 疊在房間上（離開房間拿掉）。
- 背包：分頁改成 綜合／道具／頭飾／飾品／任務物品（BAG_CAT 依 id 分；bagEntries0 是原本的產生器）。LIFE 背包加：GI 物品（lf:gi_<id，冒號換 ~>）、食材、網子、鏟子、流星石、星砂；料理可直接「吃掉」。
- NPC 委託：NQ（10 位鎮民＋阿財伯＋花店，各 3 個，好感 15/40/70 開），NQ_REW 500+1 扭蛋 / 1200+家具 n / 3000+家具+3 扭蛋，好感 +8。nqItems(tag) 用 giftTags 找身上符合的魚、作物、GI。npcSheet 下方顯示（L.nqBox）。LF().nq。
- UI：說話／釣魚／抓蟲／挖裂縫的按鈕收進同一欄 #actStack（不再疊在一起）；禪院的判斷（音樂鈕、禪院鏡頭、zen 音樂）原本只看 x<−23.5，在新村會誤觸，改成還要 z>−50。拿掉玩家看到的「之後會…」預告句和 NPC 畫面底下的說明。
- 企劃文件：「雲端天后宮・11/16 夜間更新與企劃」https://claude.ai/artifact/QSMWSu9kfuUfH1Ke4mWVPH（經濟數字、委託表、美術清單、特殊任務提案、待確認）。

## 第 38 批（11/16 早上，主委 09:27）房子一戶一主＋參觀、挖寶圖 98 種、女神竿要古釣具、昆蟲圖鑑
- 天后新村改：只剩小屋（S，14,000 起，6×5）和兩層樓（M，30,000 起，7.5×6），30 間小屋＋10 間兩層樓，價格砍半，間距加大。
- 一戶一主（要部署 worker 才生效）：worker 新增 /houses（GET 清單：l, n, pub, mine）與 /house（GET ?l= 拿屋主公開的房間；POST op=buy/sell/set/room），放在 PROFILE_PATHS（用 mzu cookie 當 uid）；Lobby 存 "HS"（lot→{u,n,pub,at}）和 "HR:<lot>"（房間 JSON，≤24000 字）。一人只能一間；賣掉退一半錢。profile() 轉送時補上 url.search。已用 wrangler dev 在本機測過買、搶、一人一間、不公開、賣掉。
- 用戶端（LIFE）：HSV（伺服器清單，45 秒更新；單機測試頁沒有伺服器就照舊存在本機）。門牌：售＋價格／「XX的家」＋🔓 歡迎參觀／🔒 不公開／我的家。點自己家：進去、開放參觀切換、賣掉。點別人家：開放的話「進去參觀」（GET /house?l= 拿房間），顯示屋裡幾個人、主人在不在。
- 參觀與同房（不用改 worker，presence 原本就是整包轉發）：presencePayload 多了 hm（在第幾號房子裡，-1 不在）、hx/hz/hr（房間裡的位置），在房子裡時 u=0（小鎮上看不到你）。syncPeers 先把 hm≥0 的人收進 ROOM_PEERS。房間（ROOMX）：RM.lot＝現在這間的號碼；RM.open(vis) 參觀模式用屋主的房間（ST() 回傳 RM.visit.room，不碰自己的 bag.room；RM.pack/RM.grant/RM.restore 參觀時一律用自己的），面板只剩說明，不能改家具；peerTick 把同一間房子的人畫成 Avatar 放進房間場景，每 0.35 秒送一次 presence。屋主離開房間時把房間（RM.snap，不含 inv）POST 上去。已在本機 wrangler dev 開兩個瀏覽器測過：屋主在家、訪客進來，兩邊都看到對方。
- 挖寶：主委給的 7 張圖切成 98 件（public/dig/<id>.webp，256px），DIGS 改成 98 件＋4 種特別（錢、扭蛋幣、家具、頭飾）。新分類 gem（寶石礦石）、treasure（寶物）、tackle（古老的釣具：古銅魚鉤、玉魚墜、古木魚餌、魚紋玉扳指、魚紋銅印、魚圖古卷＋釣魚秘法）。權重：垃圾 14、送禮 5、其他 300/價格（0.3–4）、釣具 2.5、秘法 4；平均一次約 135 幣。博士收化石、古物、寶石、寶物；阿財伯收古釣具（每件 250，秘法不收）；威利收垃圾。鏟子改 30 次（還是 400 幣，一天最多挖 15 次）。
- 女神泉改成 5 步：魚 → 蟲或花草 → 流星石（或 3 星砂）→ 三件不一樣的古老釣具 → 《釣魚秘法》＋和竿 → 女神竿（GQ_STEP / GQ_TK / GQ_N）。
- 昆蟲圖鑑：圖鑑多一頁「昆蟲」（bugDex / lfBugOne），沒抓過的是黑影，點進去看稀有度、出沒地點、時段、價錢。
- 測試頁的檔案上限是 511 個：dig/ 的 98 張圖改放進 img-pack.js（publish_prep 的 PACK_DIRS 加了 "dig"），程式用 MZIMG() 拿圖。之後新的一批圖（昆蟲、料理、食材）也要這樣進 pack，不能一張一張放。

## 第 39 批（11/16 10:30）料理・食材・道具圖、古老釣具改任務道具、昆蟲 40 種
- 主委給的 4 張圖切成 35 件 → public/cook/：ck0–ck9（10 道料理，順序同 COOK）、in_<食材 id>（16 種食材和調味料）、stone、dust、pk_duck/pk_siwu/pk_lu/pk_beef、dht（大還丹）、rcp（食譜）、spd（疾走之書）。都走 MZIMG（publish_prep PACK_DIRS 加了 "cook"）。廚房、雜貨店食材格、背包、煮好的畫面都換成圖。捕蟲網和鏟子還是 emoji（沒圖）。
- 六種古老釣具改成任務道具：賣價 0（哪裡都不能賣），背包放在「任務物品」，說明寫明女神泉要湊三種＋《釣魚秘法》。阿財伯的收購欄拿掉。
- 昆蟲加 20 種（BUGS 共 40）：螞蟻、蝸牛、蚱蜢、黃蝶、水黽、豆娘、毛毛蟲（常見）；螳螂、青斑蝶、天牛、螽斯、熊蜂、招潮蟹（少見）；枯葉蝶、蘭花螳螂、金龜子、長吻白蠟蟬（稀有）；金蟬、天后鳳蝶、月光蛾（傳說）。圖鑑自動跟著多。
- （10:45）捕蟲網三種＋鏟子的圖：public/cook/net1–3.webp、shovel.webp；雜貨店和背包都換成圖（背包的網子會跟著你現在用的那種）。

## 第 40 批（11/16 中午）昆蟲圖＋動態、走路全開、手機記憶體、文字
- 昆蟲 40 張圖（主委給的已去背，只切割）：public/bugs/<id>.webp（publish_prep PACK_DIRS 加 "bugs"）。圖鑑、抓到的卡片、背包都用圖。
- 昆蟲在場景裡改成有光影的小卡片（MeshStandard＋一點自發光；不是 Sprite），六種動法（BUGK）：fly 蝴蝶蛾類摺翅拍動＋偶爾滑翔、hover 蜜蜂蜻蜓螢火蟲懸停小震動再衝到別處（螢火蟲晚上發光）、wall 甲蟲螞蟻等爬在住家牆面或樹幹上（TOWNX.TREES 記錄每棵 tree() 的位置；牆只用 kind==="house" 的正面），一陣一陣爬、轉向、停、有步態抖動、perch 白蠟蟬金蟬側面停在樹幹牆上、walk 蝸牛滑行／毛毛蟲一伸一縮／螃蟹橫著小跑／螽斯偶爾跳、flat 蚱蜢跳、海洋寶石蟹橫走、水黽滑。朝移動方向轉面（BUG_R＝頭朝右的圖）。進小鎮時先載入全部 40 張貼圖。
- 逃跑文字依種類（bugRunWord）：螃蟹「橫著跑走了」、蝸牛「縮進殼裡」、蚱蜢類「跳走了」、爬的「溜走了」、會飛的「飛走了」。
- 走路全面開放：TW.walk 在圍牆內都可以走，除了房子（TOWNB 算出的 BFOOT）、攤位、河（橋和碼頭照走）、溪、泉、海水線外、石頭和樹幹。溪谷（NT.walkOpen）、森林和山（SW.walkOpen）也都開放；溪谷的地形高度現在跟著 valleyH 走（TW.ground、groundAt）。
- 手機：一次載入的小鎮區塊變少（45／70 m），每次建好後檢查顯示記憶體，不夠就丟遠的區塊重建（TW.oom，測試模式「小鎮讀取狀態」看得到）。這是推測的原因，主委手機上還沒確認。
- 古老釣具和《釣魚秘法》的說明不再提女神泉（讓玩家自己探索）。

## 第 41 批（11/16 下午）路和店不見的真正原因、廟和小鎮分區、城外景色重做
- 路／店不見的真正原因（主委 12:57 截圖）：小鎮區塊 unload() 遇到「一個物件用好幾種材質（陣列）」的招牌時 `o.material.map.dispose` 會丟錯，這個錯讓 TW.tick 整個中斷，之後再也不會載入任何區塊（走開再走回來就只剩草地）。手機的收起距離比較短（70 m），所以特別常發生。unload 改成逐一處理材質、整段包 try；load 的 bake 也包 try。
- 分區（主委要求「出禪堂的門就讀小鎮、把廟裡先忘掉」）：模擬器量到廟＋商店街在顯示卡上約 330 MB 貼圖（夾娃娃機等 2048 寬的店圖、GLB 1024² 貼圖、壁畫）。現在走出禪房門往北過 z −58，畫面淡一下，把 z > −53 那一側所有東西隱藏並把幾何／貼圖從顯示卡釋放（JS 端留著，不用重下載）；回到 z > −55 再淡一下恢復。TOWNX.zone（off、n=[物件數, 幾何, 貼圖]）、zoneForget/zoneBack/zoneVeil；fogCull 在分區時不動作；colBuild 把 zoneOff 當成看得到；remerge 前會先 zoneBack（ZN.re 讓它回小鎮後不再淡一次）。要等 LQ.ready 才會分區，建築模式時不分區。測試模式「小鎮讀取狀態」多一行「分區」。
- 城外景色：地形用畫的草地／沙地細節貼圖（世界座標 UV）；溪谷、森林、山上撒會隨風擺的草叢＋四色小花（InstancedMesh，手機 0.55 倍，離你 20–30 m 就縮進地面，手機 16–24 m）；草花貼圖用 cutTex（透明處填平均色、DataTexture 自己翻轉），遠處不再變黑方塊。小石頭改成畫的鵝卵石平貼地面，大石頭用岩石紋理；舊的 tuft 拿掉。
- 海邊咖啡改地中海風：白牆、藍圓頂、藍框拱窗＋百葉、藍白磁磚吧台、九重葛、陶盆橄欖樹、串燈；桌椅藍白、陽傘（含躺椅那支和海邊那支）全改藍白；躺椅藍白交錯。
- 燈塔重做（lighthouse()）：石座、往上收窄的白塔身兩道藍環、小窗和藍門、迴廊欄杆、玻璃燈室、藍圓頂；黃昏到晚上有慢慢轉的光束（NT.tick 用 LIVE.coast.beam）。
- 廟前廣場遠處冒草皮：底層草地只鋪到 z −50 以北的小鎮那側，並加 polygonOffset。

## 第 42 批（11/16 14:30）讀取畫面、廟口外觀保留、地形斷層、挖到家具顯示圖
- 分區改用遊戲開始的讀取畫面（#zonePack，同 dlpack 樣式，dlRunner(host) 可指定位置），顯示 5 秒（每幀最多算 50 ms，手機忙的時候也看得滿 5 秒）。走出廟門（z < −52）就讀取，走回 z > −49.5 再讀取一次。zoneVeil 的 callback 用 try/finally，ZN.busy 不會卡住。
- 分區不再整座廟藏起來（主委：「還是要顯示廟那邊的東西，只留廟口基本外觀，人物模型不用讀取」）：只收起 z > −53、高度 6.5 m 以下、貼圖 ≥ 700² 的東西（神像、壁畫、燈牆、客棧畫、商店街櫥窗和店內圖）；牆、屋頂、廟門照常顯示。廟那邊的玩家和 NPC 在小鎮時不畫（botTick 每幀的 npcs/remotes 可見度迴圈加條件）。合併後隱藏的原始網格（mergedOff）一律釋放 GPU 幾何。
- 地形斷層：beachH 的兩端沙丘和陸側隆起在海灘邊緣降到 0（不再切一半的沙坡）；TW.ground 現在包含整個溪谷（到 z −43.5）和海灘（TW.beachH），走在沙丘和山坡上不會穿進模型。底層草地的洞內縮 0.7 m、沙帶延伸到 x 200 並與海灘重疊，沒有黑縫。底層草地與沙帶改成和溪谷／海灘同一種畫的貼圖與 Lambert 光（window.BASEG / BASESAND，在 NATURE 區設定）。
- 挖到家具：ROOMX.grant 記下 ROOMX.lastF；ROOMX.pic(f,cb) 從 room/f/thumb-<c>.webp 切出那一格；digReward → digPop 用那張圖（彈出和卡片都是）。

## 第 43 批（11/16 15:00）沙丘拿掉、草沙交界、雞蛋石頭、草色、邊界提示、禪房門口閃爍
- 海灘不再有兩端沙丘（beachH 只剩往海裡的斜坡），不會再穿進沙丘。
- 草地→沙灘：beachC 在西側 8 m 內從沙 → 沙丘草色 → 草地（LAWN_S，邊緣不規則），溪谷東緣改成同樣的 LAWN。南北兩條沙帶在 NATURE 區重建成和海灘同一套顏色與紋理（x 134.5 起，延伸到海下），整條東岸一致。
- 「像雞蛋」的東西：小石頭（pebble 貼片）全部不畫（rock() 尺寸 < 0.7 回傳 null），溪邊的淺色睡蓮葉也拿掉。
- 草叢改 MeshLambert（和地形一樣的光），草色調亮（hsl 96–112、亮度 52–68%）。
- 地圖邊界：在小鎮靠近西／南圍牆 3.2 m 內（或東邊非海灘段），人物說「那邊還沒開發，先別過去好了」並往回走（每 6 秒最多一次，TW.edgeT）。
- 禪房門口磚塊閃：廟外整片草地 outsideGround 從 y −0.02 降到 −0.1，和人行道磚拉開 13 cm（手機深度精度不夠會互相穿插）。

## 第 44 批（11/16 傍晚）地圖大改：海搬到廟前、東邊變河谷、紅磚牆、觀音噴泉搬後埕，加上一批地形修正
- **廟前（FRONT 常數，WORLD_BOX.z1=122）**：layout 裡的「廟前拱門」（litHall）當正門；白石欄杆整圈換成紅磚牆＋八卦窗（huachuang 模型），前牆在 z 53.5 接到拱門兩側（FRONT.gateX 8.1）。出門：人行道 z 57.2–58.4、馬路 58.4–62.8（黃線）、人行道到 63.8、白欄杆，欄杆中間缺口（|x|<2.3）有階梯下到沙灘（y −1.2，FRONT.h）。海灘＋海＋燈塔＋海邊咖啡＋躺椅＋陽傘＋沙堡＋貝殼＋海鷗＝原本東邊 coast/cafe 兩區的程式**原封不動**，用 FRONTG(C) 包一個轉 −90°、位移 (−90, −1.2, −60) 的群組蓋在廟前（舊座標 (x,z) → 新 (−z−90, x−60)）。sea() shader 改用自身座標算海岸線、世界座標算反光。FRONT.shore 就是轉過來的同一條海岸線。frontGround() 畫路、欄杆、海堤、階梯、路燈、沙灘地形。
- 走路：walkable 對 z>45.2 交給 frontWalk（繞過榮譽功德榜牆、前院、拱門、馬路、階梯、沙灘到水邊，FBLOCK 擋咖啡店／沙堡／燈塔石頭）；zoneOf 新增 "F"，planPath0 用 frontPath 走「功德榜牆側 → 拱門 → 階梯」。groundAt 對 z>63.8 用 FRONT.h。釣魚：廟前的海是 "o"（大海），fishTick 在沙灘也能出釣魚鈕。presence 座標上限放寬到整張地圖。
- **東邊**：拿掉海與沙帶，改成 east/east2 兩區河谷：eastH/eastC 地形（x 134.5–232），一條自然彎曲的河（eRC/eHW，兩端往東彎出地圖），小溪流進河，對岸丘陵森林；WORLD_BOX.x1=158；河是 "r"（大河）可以釣魚；走路擋水不擋岸。底層草地東緣改到 x 135.2。
- **觀音噴泉 → 後埕取代龍泉**：FT 搬到 RFT（龍泉水池），龍頭與水柱隱藏、不載 longquan 模型，觀音站在池中石座上；站位和點擊區跟著搬。前院原本噴泉的位置變成可以走。
- 其他：河（車站前）兩岸自然、草皮全部同一材質（lawnMat：世界座標貼圖＋防重複）、女神泉不規則＋倒影＋周圍樹林、瀑布有真正的岩壁、坡度 > 0.62 不能走（TW.maxSlope）、拿掉圍牆改成邊界說話往回走（「先別過去不認識的地方吧！等等迷路了！」）、主委降落在當下位置。

## 第 45 批（11/16 晚上）廟裡全部鋪磚、廚房小遊戲、貓咪在家、山頂帳篷／望遠鏡／跳傘
- 廟裡草皮：outsideGround 在紅磚牆內（|x|<25.9、z −51…53.9）和正門前小廣場（|x|<14.2、z 53…57.4）直接不畫（lawnHole）；整個牆內鋪一層磚（yardTex，y −0.02，polygonOffset 讓其他地板蓋在上面），門外小廣場也鋪磚。
- 廚房小遊戲 cookGame(i)：全螢幕三關（切菜五刀／按住加火保持綠區 6 秒／翻炒三次），滿分 20，≥15 絕品、≥9 好吃，結果交給 ckDone（絕品多一份）。房間裡點電子鍋、氣炸鍋、冰箱、微波爐（appl02/03/12/16）就開廚房。
- 貓咪在家 homeCat（ROOMX）：有養貓（不在愛心媽媽／醫院、不是參觀別人家）就會出現在房間，地上走、跟著你、跳上床／桌／櫃／椅坐著或趴著，再跳下來。
- 山頂：tw:tent / tw:tent2（帳篷內部場景 tentOpen：睡袋、提燈、背包；「鑽進睡袋睡一覺」一天一次精力 +40）、tw:scope（望遠鏡：主委給的全景圖 view/telescope.webp，左右滑；遊戲時間 golden hour 之後「天色暗了，看不到東西」）、tw:chute（跳傘台：固定路線 32 秒從山頂飄到進小鎮的大路 (30,−110.5)，chuteTick 在 LIFE.tick 每幀設位置，MZ_HOLD 期間不能走）。

## 第 46 批（11/16 18:40）滑翔傘視角、主委白天黑夜、山頂看得到整個村莊
- 跳傘改滑翔傘：藍白弧形傘翼＋十條傘繩，路線 42 秒；飛行時用 window.MZ_VIEW 換成跟拍鏡頭（人物後上方 7.5 m、稍微左右擺），看得到人物、傘和整片風景；落地後還原。飛行中不顯示抓蟲按鈕。
- 主委工具「白天黑夜」：自動 → 白天 → 黃昏 → 夜晚（設 window.MZ_TOD，只在這台裝置）。
- 山頂（離山頂中心 16 m 內）和滑翔途中 TOWNX.high：載入半徑放大到 300 m、一次載三區，霧拉到 420 m、鏡頭 far 520，整個村莊和廟都看得到。

## 第 47 批（11/16 19:40）碼頭木板、瀑布改池塘、沙灘鏡頭、按鈕不重疊
- 老王掉水裡：TW.ground 在河的範圍一律回傳河床高度，碼頭和森林步道橋上的人就沉下去了；碼頭（x 26–30、z −130.4…−137.8）回傳 0.06、步道橋回傳拱高。
- 碼頭改成一片片木板（14 片、有縫）、底下兩根橫樑、兩側欄杆；點地用的透明平面保留。
- 瀑布整區刪掉（valleyH 不再有岩壁、不畫瀑布、不放岩石），溪改從山谷裡一個不規則小池塘（BHEAD，springPool）流出來，池塘不能走進去。
- 沙灘視角很窄：camOK 的廟埕規則只到 z 50，沙灘上鏡頭找不到能站的位置就貼到人身上。z > 45.2 改用新規則（高於地面 0.35、避開紅磚牆與正門）。
- 「點我：…」(nearChip) 也放進動作按鈕那一欄，和「跟…說話」等按鈕上下排，不再疊在一起。

## 第 48 批（11/16 21:20）帳篷/滑翔傘/樹的模型、釣魚大改、瀑布搬到天后山腳、河流到底、NPC 到處走與拜拜、音樂分區
- 模型：public/tent.glb（主委 chibi_tent）、glider.glb（chibi_paraglider_seat）、cedar.glb、palm.glb（主委 ac_cedar_spring / ac_palm，用 gltf-transform 減面＋貼圖縮到 256：針葉 1.5k 面、椰子 3.3k 面）。
  - 山頂兩頂帳篷換成模型（第二頂染藍），門朝營火。loadShared 共用；district unload 會略過 userData.shared 的網格（不釋放共用幾何）。
  - 滑翔傘：模型掛在人物位置（GLIDE_S 1.15、座墊高 .24），meAv.custPose=glidePose（腿前伸、雙手上舉握煞車）。到山頂就預先下載 glider。
  - 樹：pine() 不再自己畫錐體，改記到 C.cedar；palmAt() 記到 C.palm；load() 之後 treesFlush(C) 每種樹每個材質一個 InstancedMesh，每棵高度、胖瘦、轉向不同（椰子有傾斜）。針葉材質加自發光 .34，背光面不再全黑。
  - 椰子樹：front 區沙灘 34 棵（FRONT.palms，避開咖啡/躺椅/正門階梯），樹幹加進 FBLOCK 不能穿過。
- 精力：主委 enPay 一律不扣（設計如此）；主委工具新增「⚡ 精力不扣／照扣」（window.MZ_ENTEST，存 localStorage mzEnTest）。
- 釣魚（LIFE）：
  - 按住 🎣 釣魚蓄力（chargeStart/chargeTick/chargeEnd，1.4 秒滿），放開拋竿；距離 = 最近水邊 + 0.3 + 力道×7.5 m，沿同一條線找同一種水。
  - 等待：魚影旁 4–9 秒，空水 11–24 秒（對的餌 ×0.75）。
  - 魚點：水面切 6 m 格（spotKey），每格 2–4 條（spotCap 雜湊），釣到或嚇跑（咬了沒拉到、斷線、掙脫）扣一條，6 分鐘回一條；格子空了會等 14–18 秒後說「這裡好像沒有魚了」。存在 LF().spots。
  - 魚影 FSH：小鎮/廟前水裡最多 7 個魚形影子（fishShapeGeo）慢慢游、遇岸轉彎，只出現在還有魚的格子；拋竿落點 2.8 m 內有魚影 → 那條游過來咬（fshTake）。浮標下的魚影也改成魚形。
  - 釣上來特效 catchFx：水花粒子、三圈水波、魚身邊星光（顏色看稀有度）、白光閃一下、「釣到了！／大豐收！」＋魚名星等、彩帶落下、震動。
  - 測試用 LIFE.dbg2（startFish、F、FSH、LF、spotLeft、chargeStart/End、fx）。
- 音樂分區 musicTick：禪堂歌只在 zenIn()（禪院本身），後殿歌只在 z<RY0 且在牆內；牆外、廟前沙灘（z>FRONT.wallZ）、小鎮（TOWNX.on）都是小鎮歌。禪堂音樂按鈕也只在禪院內出現。
- 望遠鏡：圖放在鏡頭圓圈裡（高 145%），上下左右都能拖。
- 原本瀑布山谷（x 86.5–134.5、z −120…−52）變成走不進去的密林：brook 區重建（330 棵樹、苔石、草），NT.walkOpen 在那一塊一律 false。
- 瀑布＋小溪搬到天后山東邊山腳（主委「移到有滑翔翼的山下，重建那邊地形」）：WF=(138.2,−190)，eastH 加 wfKnoll 岩肩（6.5 m、東面陡壁）、BHEAD 池塘、BROOK 往東流進大河；waterfallAt() 瀑布＋水花圈；MOUTHB 木板橋；岩壁不能爬（坡度）；east2 區負責畫。
- 河流到底：riverH 不再在 x −17 / 73 收尾，往西流出地圖（x −150），往東接上大河（eRC）。天后新村大道在 x −26.3…−19.7 跨河是橋（石欄杆），村門移到 z −145.2。新區 riverW、riverE。
- 鏡面水：mirrorMat()/mirrorPlane()（沒有花紋，只有天空反射＋深水色，越斜看越亮）；鎮河、東邊大河都換成鏡面；泉水去掉環紋和花邊。
- NPC（鎮民）：每 8–28 秒決定一次：在家附近走、走到 26 m 內別處（planPath 找路），10% 去廟裡拜拜（4 分鐘最多一次）。走到廟口（tvGate，算出來是 (28,−52)）就消失，n.tv 記著；你在廟裡時（tvTick）他會從廟口走進來、跪在空的拜墊上拜三下再走回去。你在廟裡時每 22–42 秒也可能有一位鎮民來拜。

## 第 49 批（11/16 22:10）霧裡的燈籠方塊、巨像也起霧、功德牆中間開門
- 起霧時燈籠旁的白色方塊：加法混色（AdditiveBlending）的光暈貼圖，四角是黑色（加上去等於沒有），但霧會把黑色角落染成霧色，加上去就變成一塊方塊。T.SpriteMaterial／MeshBasicMaterial／PointsMaterial 的包裝現在對加法材質加上 ADD_FOG define，fog_fragment 改成「加法材質在霧裡直接變淡」，其他材質照舊混霧色。
- 媽祖巨像原本用 MeshBasicMaterial({fog:false})，永遠清楚；改成會吃霧。
- 榮譽功德榜牆中間開一個 3.6 m 寬的門洞（上面紅色門楣、兩側金色門柱），frontWalk 在 z 45.2–47.2 允許 |x|<1.45 通過；planPath0 廟埕↔廟前如果走門洞比繞牆尾短就走門洞；clampSpot 拿掉舊的觀音噴泉前限制。

## 第 50 批（11/16 23:30，主委 22:35）馬路同款、新社區轉角、流星與小地圖、天后山旁的高山瀑布、女神泉搬家、海邊路燈、新樹幹模型
- ⚠️ 注意：tools/src/*.js 已經跟 public/index.html 對不上（另一個帳號直接改 index.html），**請直接改 public/index.html**，不要用舊的 inject 腳本覆蓋。
- 小鎮馬路（street()）照禪堂外的路：中線雙黃、白邊線改成「貼地的漆」（rline，polygonOffset −4，以前用細盒子被柏油蓋掉看不到）、人行道邊加花崗岩路緣（kerb），支路口斷開。選項 o.end0/end1：路的盡頭補一段人行道。
  - 新村轉角：大道（x −26…−20）北端 z −105 是盡頭（end1），西側人行道不再被切開；XSTREETS 的 [-26,-8,…] 改 [-20,-8,…]（只有東側開口接支路）。大道南端、四條巷子西端、老街東端、東巷東端都補了盡頭人行道。
  - 廟前海邊那條路也換成同款（雙黃線、白邊線、路緣）；路燈從海側移到靠廟這側（F.road0−.6）。
- 新的山＋瀑布：WM（x124,z−218，橢圓 12.5×21，60 m 高、平頂），北面是峭壁（WFACE −200.4），瀑布從約 27 m 高往北落進潭（WF=(124,−197.4)），小溪往東接回原本路線進大河；整座山不能走（walkable：wfMount>1 一律 false＋坡度）。舊的岩肩 wfKnoll 拿掉。
  - 遠景：farMtTick() 在小鎮區建一份只有山和瀑布的輕量模型（east2 沒載入時顯示），從小鎮、河邊、天后山都看得到。
- 女神泉搬到森林西南角最深處（22.6,−171），走自己的小徑 GPATH（從第一個泉水岔出去）；FPATH 拿掉原本通往舊女神泉那段；pathD() 同時算兩條路。站點 tw:goddess 跟著搬。
- 流星降落點 MSPOT 換新地圖（廟前沙灘、瀑布潭邊、女神泉小徑、燈塔附近、天后新村、新村南巷…，每個點都測過可以走到）。
- 小地圖：範圍改成整張地圖（WORLD_BOX），水（海、河、泉）畫藍色。
- 新樹幹（主委 lowpoly_tree_1024.glb，612 頂點、自帶樹皮顏色）：直接寫進程式（LPT，int16 壓縮 base64）。LPT.build(list) → 樹幹一個 InstancedMesh、樹葉十字卡片一個 InstancedMesh（葉子貼圖＋每張卡片自己的顏色、會隨風擺，做法同廟外櫻花樹），葉子長在七個枝端和三個分岔。
  - 廟外櫻花樹：樹幹換成這個模型，花卡片集中在枝端。
  - 小鎮 tree()、森林 softTree() 全部改成這種樹（C.lpt，treesFlush 時一起畫）；針葉樹（cedar）和椰子樹（palm）是主委的模型，沒動。
- 「接手紀錄」上傳到 claude.ai 專案：這個工作階段沒有能寫專案檔案的工具，沒上傳（HANDOFF.md 已推到 GitHub）。

## 第 51 批（11/17 凌晨，主委 00:24–01:27）樹冠、馬路標線根治、新村搬到廟後、女神谷、瀑布峽谷、水面、石柱燈、3D 洗碗、定位工具…
- 樹（LPT）：每棵樹自己的高度（±30%）、微傾斜、樹冠是 LPT.crown()：4–8 團隨機大小的葉團（枝端＋頂上＋偶爾側邊低一團），卡片在團內偏外層，不再只有 11 個枝端。樹幹一律等比例縮放（不再橫向放大，櫻花樹不會變粗短）。小鎮/森林預設每棵 52 張卡（低配 ×0.55、卡片大 1.25 倍）。綠葉調暗一點，新增 deep（深綠）給森林。
  - 櫻花：k=r/2.5（等比例），花卡 50+44k²（遠的 14+11k²），卡片小（主委「花太大了」），花瓣貼圖更細更多。
  - 許願樹的花維持原樣（主委 07:15 更正）；反過來，外面櫻花的花瓣貼圖 blossomTex 改成許願樹那種五瓣小花（粉紅、深粉花心），卡片淡粉色調、最大 1.25 m（花和許願樹一樣大）。
  - 杉木 pine() → 改成 LPT 深綠樹；椰子樹 palmAt() 不畫了（主委「刪除椰子樹跟杉木」）。treesFlush 會丟掉落在水裡或水邊 0.8 m 的樹。
- 馬路標線閃爍（主委說很久了）：漆從 4 mm 抬到 4 cm（rline y .04、禪堂外 flat(...,.04)），比所有鋪面都高，不會再跟柏油/人行道互相搶。小條路（柏油寬 < 4.5 m）只畫白邊線。
  - 人行道貼圖（paverTex/twPaverTex）改成素色方形石板（不再紅灰磚）。建築物下面：rowBuild 每棟往後、往兩側鋪 pave（y .01），原本幾塊草皮改成 pave。
  - 主街人行道左右對稱：ROAD_A0/A1 = 25.1/30.9（兩邊各 2.3 m），鎮口 z −56…−52 用 skewZ() 斜接到禪堂外的 26.2–32。gquad() 畫任意四邊形地面。
- 天后新村搬到廟後（x −97…−26、z −54…−114）：VIL.lanes=[−64,−84,−104]，三條巷子各兩排、一排最多 7 間、最多 2 間兩層樓。LOTS 的編號、大小、價格、顏色跟以前完全一樣（同順序同亂數），只有位置換了。大道 vilA1 從廟後 z −54 一路到河邊 −131 接舊石橋；村門移到大道北端。vilA2 和舊的 4 個 vil 區刪除。WALK/XSTREETS/inVil 跟著改。
- 女神谷（舊新村的位置，x −104…−12、z −258…−143.6）：GPATH 從大道石橋往西南彎進峽谷，gvOpen/gvH 是兩旁 11–20 m 的山、谷底越往裡越寬，盡頭是女神泉（NT.springs[2]=(−66,−221) 半徑 7），旁邊神木 GVTREE（LPT k=5.4、420 張葉卡、紅布條）。谷裡 240 棵深綠樹、苔石、石柱燈、光束。BASEG 挖洞、southH 加 gvH、TW.walk 加坡度限制。站點 tw:goddess 換位置。森林裡原本那條 GPATH 和舊女神泉都拿掉。
- 瀑布山改成圓潤大山（WM x130 z−235、20×33、42 m，smoothstep 山形），北面切一個 V 形峽谷（GX=127、峽谷頭 WFACE −228），瀑布在峽谷盡頭落下約 45 m；BROOK 從潭往北出峽谷再接原來往東的溪。陡的地方才是岩石，其他是綠坡。
- 釣魚碼頭 → 木橋過河（z −130.6…−144.1），主街柏油一路鋪到橋頭（不再有磁磚廣場）；對岸那棟建築刪除；tw:fish 站點拿掉；走路允許 x 26.3–29.7 過河。
- 水面 WSURF：mirrorMat（河、大河）和泉水 shader 裡加幾個移動的正弦波算法線 → 反射天空（越斜越多）＋太陽/月亮的亮點；不用第二台相機。
- 森林：樹 2.2–2.5 倍高（冠層蓋住小路）、forestShafts() 白天斜光束、pathLamps() 沿 FPATH 每 8.5 m 一座石柱燈（晚上地上有光圈）。路邊圓柱木頭刪除。
- 📍 座標定位（主委工具 → 測試工具、🧪 測試模式）：POSF，開著時點畫面不走路，顯示座標＋最近的東西（建築、站點、樹、流星點），「這是要移的東西」「移到這裡」「複製給 Claude」。
- 🫧 洗碗泡泡大戰（一粥七天，dwGame）：真 3D 碗（LatheGeometry，碗內 UV 在左半、碗外在右半，刷內側不會清到外側）、清潔遮罩 1024×512 與泡泡 512×256 兩個 render target（GPU 上畫圓形筆刷，不上傳貼圖）、CPU 48×48 格算覆蓋率（只算有髒污的格子；要拖動才算）。①刷碗內 86% → 「翻面」→ ②刷碗外 86% → ③上下拖曳翻轉傾斜（碗也會自己慢慢轉）讓水柱沖泡泡（沖掉 60% 後其餘自動流掉）→ 下一個碗。60 秒；5/10/15 個 = 1/2/3 碗鹹粥（d.cg）。精力 EN_SHOP。掉幀會降解析度，離開全部釋放。window.__DW 給測試用。
- 其他：假人不再戴舊頭飾，新髮型配新眼睛嘴巴、舊髮型配舊臉；家裡晚上的燈光改暖色（以前藍紫光把衣服和皮膚照藍）；棉被遇到一根細細凸起（香、旗子）會被壓平；流浪貓不進殿（下雨也待在廟埕）；克難系列刪掉報紙床、紙箱桌、塑膠籃置物架（hide "x"，編號保留）；離開房間從那間房子的門口出來；所有 NPC 下雨撐傘（AV_ALL）；太陽變小變亮、月亮變亮。
- 天后新村範圍內不再種廟外櫻花（free() 排除 x<−12、z −46…−120）。森林樹 1.75–1.95 倍、大樹葉卡數 ×k/1.2。
- 還沒處理：主委說「屋頂每次進來越來越低、洞越來越大」— 找不到會自己往下移的程式，要問是哪一個屋頂、有沒有在建築模式調過。

## 第 52 批（11/17 上午，主委 10:22–10:38）照主委畫的地圖重排南岸、河道挖深、水面 v2、石燈籠、神社、標線/路緣、彩虹…
- 主委畫的小地圖（黑＝山、藍＝水、紫＝路）：
  - 西山：WMA 圓山（−80,−211）、WMB 長稜（(−11,−256)→(−36,−212) 膠囊），westMtn()；不能爬（walk 擋）。溪流 SPATH 從南邊界 (9,−264) 往西北流進主河 (−66,−139)，河道挖 1.6 m、水面 RIVER_Y；streamMesh() 畫水；FOOTB 是側路跨溪的木橋（onFootB 時 ground=.1）。
  - 小路：WP1 從新村大道石橋往南、再沿天后山南麓往東一路到女神泉；WP2 跨溪、WP3/WP4 分兩岔進兩座山之間。全部石燈籠。westH() = 山 ×（離路 8 m 內壓平）＋小起伏，河道 carve。區塊 westN / westS。WWT 是那裡的樹（深綠為主）。
  - 女神泉搬到右上角山腳：瀑布山 WM (117,−243) 19×17、44 m，西面切峽谷（GZ −246、WFACE x=110），瀑布朝西落進女神泉（NT.springs[2]=BHEAD，(105.5,−246) 半徑 5）。waterfallAt 轉 −90°。泉水往北從天后山與瀑布山之間流出，接回原本往東的溪（BROOK 前段改、尾段沒動）。gH()= x>111.5 用 eastH，否則 southH（southH 也加了 wfMount、溪 carve）。
  - 神木 GTREE (93,−255.5)：LPT kind "gold"（金黃葉）、k 6.6、560 張卡、紅布條。主委的神社模型 shrine.glb 在 GSHRINE (101.5,−254.8) 面向泉水（loadRaw("shrine")）。區塊 gspring。
  - 森林：泉水 0→(29,−167)、1→(97,−164)；FPATH 從主街木橋進森林往東、FPATH2 往西北、FPATH3 接舊東橋。
  - 女神谷（舊）整個拿掉。
- 河流挖深：riverH 床 −1.9、水面 RIVER_Y=−.55（主河、東河、溪）；TW.water/TW.ground 跟著。新村大道石橋補上橋面（之前縮短大道時橋面不見，看起來沉到水裡）。
- 水面 v2：RIPTEX（256² 無縫波紋法線＋高度），WSURF 兩層不同大小、互轉、不同方向漂移地取樣，加細碎反光點；NT.U.uRip。
- 石燈籠 lantern(C,x,z,y)：六角座、圓柱、托台、四柱燈室、六角屋頂、寶珠，砂岩兩色。
- 小鎮主街：路不再彎（ROAD 26.2–32 直通），改把西側整排（建築、草地、路燈、巷口、公園）往東移 2.2 m，兩邊人行道都 1.2 m；牌樓柱與招牌置中 29.1。skewZ 不用了。
- 路緣（人行道白邊）忽隱忽現：高 9 cm、polygonOffset −6（比人行道 −2 更前）。禪堂外的路緣同樣。
- 櫻花變藍：卡片顏色亮度超過 1 → r128 的 Color.getHex 不夾值，紅色溢位變青色。現在夾到 1。
- 樹幹/樹葉深淺：LPT 每棵樹樹幹 instanceColor ±14%、葉子亮度 ±5%；櫻花樹幹也是。
- 新村拱門拿掉。雨傘傘柄加長到傘頂。跳傘時天空球跟著跳傘相機（MZ_VIEW）。彩虹 RB：下過雨後放晴、白天，太陽對面出現 4 分鐘。
- （12:57–13:00 追加）洗碗變簡單：海綿半徑 .6、沖水半徑 .6、往下溢流寬 .5；沖水時碗自己轉、自己上下翻（可拖曳幫忙），水龍頭在碗正上方。模擬玩家一分鐘可洗 3 個（模擬器滑動慢，真人會更快）。
- 瀑布破圖：瀑布山原本 44 m 高卻只有 19 m 寬，地面被拉成一根根尖片；又剛好跨在三個區塊的地形接縫上。現在 WM (124,−245) 22×20、34 m 圓頂，西側一道弧形峭壁圍著女神泉，瀑布處崖頂有缺口；整座山＋女神泉由 gspring 區塊單獨建地形（GB 範圍），旁邊區塊的地形在那裡下沉 .5 m（GBsink）。遠景假山 farMtTick 停用。女神泉加大到半徑 8（中心 101.5,−246），神木、神社、站點、小路終點往西移；瀑布前視線上不種樹。

## 第 53 批（11/17 下午）🗺️ 地圖編輯（主委：「增加一個讓我放樹佈置石頭移動石頭 造山 造河的功能 地表貼圖噴漆…」「建築不用 我只要地形這些」）
- 主委工具 → 🗺️ 地圖編輯（只有主委 me.sp）。程式在 TOWNX 尾端（MD / ED），用自己的相機（MZ_VIEW），拖曳平移、兩指或滾輪縮放、兩指左右轉向；畫面其他 UI 隱藏（body.mapedit）。
- 資料（MD）＝疊在程式地圖上的修改：
  - 高度：1 m 格點、16×16 一塊（MD.ch，Int16 公分）；terrain() 每個點加 mdH()，顏色再套 mdPC()（噴漆）；TW.ground 也加。刷的時候 mdPatch 直接改地形網格，停手 0.7 秒後 mdRebuild 重建附近區塊（樹石跟著新地面、清除的東西消失）。
  - 挖到水面（RIVER_Y）以下 → mdWaterBuild 鋪水面，TW.water／TW.walk 認得。
  - 噴漆：草地、深草、泥土、小路、沙地、石頭、苔蘚（MDPAL）。
  - 擺放物件 MD.objs：樹（綠/深綠/楓/櫻/金）、樹叢、石頭、苔石、花、蘆葦、石燈籠、長椅、路燈、神社；可移動（拖曳）、轉向、大小、高低、複製、刪除；會擋路（MDBLK）。
  - 清除 MD.er：圓形範圍內程式自己生的樹（treesFlush 過濾）、石頭/花/蘆葦/燈籠/長椅/路燈（mdWrap 包住 mossRock、starFlower、reeds、lantern、nbench、lamp、bench，生成後馬上拿掉，亂數順序不變）。
  - 選取程式原本的樹／石頭等：點它 → 在原處清除一個小圓、放一個可編輯的同類物件。
  - 復原 30 步（整份快照）。
- 存檔：💾 固定 → POST /mapedit（主委密碼，伺服器驗證格式，最多約 1.8 MB，存 Lobby DO storage "mapedit"，通知所有 hall → 客戶端 {t:"mapedit"} 重新抓）；單機版存 localStorage "mz.mapedit"。📋 配置碼 → "MZMAP:"+JSON，可寫進 MD.baked（伺服器沒資料時用）。**worker.js 有改，部署後伺服器存檔才會生效。**
- 不包含：建築、街道、廟區平地（那些不是 terrain() 地形，筆刷刷不動）。

## 11/17 16:10 玩家回報「精力沒有恢復」（正式站 = main fe7af9c，11/13）
- 原因 1（主要，財神爺「今天已經玩過」也是同一個）：每天一次的東西用的「今天」是頁面打開那一刻的 UTC 日期（const today），台灣要到早上 8 點才算新的一天，而且頁面開著不重新整理就永遠不會補。修：enToday() 每次都算台灣日期，並每分鐘檢查一次。audio-fix 已改；正式站修正在分支 hotfix-energy（c38f83d，只改這一處，從 main 開出來），主委說部署才推：`git push origin hotfix-energy:main`。
- 原因 2（設計，待主委決定）：11/12 改成「睡覺不給精力」（REGEN bed:0, futon:0），但禪房通鋪 50、套房 100 照收錢，提示也還寫「精力恢復中」—— 玩家付了錢睡覺卻沒回精力。
- 修法擴大：全域 today 改成 let、台灣日期、每 30 秒更新（精力、財神爺 fcDay、月老 rxDay、每日平安幣 bag.day、卡住 stuck 都跟著對）。hotfix-energy 最新 commit 見 git log。
- 11/17 16:08 已部署 hotfix-energy → main（44b5038），Workers Builds success。正式網址這個環境連不到，沒能用 curl 抓頁面確認。audio-fix 不含 main 的這兩個 hotfix commit，但同樣的修改已在 audio-fix，下次部署 audio-fix:main 前要先 merge origin/main（不是祖先關係）。

## 第 54 批（11/17 晚）💧 水面 v3、瀑布、地圖編輯補強、彩虹、洗碗
- 「一片黑／高低差裂縫」：地圖編輯「挖河」鋪的水是 1.5 m 方塊放在 1 m 格上，互相重疊（重疊處變兩倍深），雨天幾乎黑。現在 mdWaterBuild = 一張無縫 1 m 網格＋外圍一圈，每個角算水深。
- 水面 v3（TOWNX 內，wmat 後面）：一個共用 ShaderMaterial（waterMat），所有河、溪、泉、池、挖的水都用它。每個頂點帶 aW=(流向x, 流向z, 水深)；水深在區塊 build 完由 wFix(C) 用該區地形（ter.hf+mdH）算一次。深→深藍綠、淺→透明淺色、岸邊淡色水紋、到岸自己淡出（不用深度貼圖）。兩層 RIPTEX 法線、Fresnel 假天空、柔和陽光高光；8 格漣漪池 TW.ripple(x,z,s)（走在水邊、拋竿落水、咬鉤、瀑布腳）；高品質才有雨滴圈和閃光。品質 高/中/低（自動：手機中）WQ define。
- 參數：WCFG（localStorage mz.water，只在該裝置）＋測試模式「💧 水面調整」滑桿、📋 複製數值（MZWATER:{...}）→ 要變成大家的預設就改 WCFG_DEF。
- mirrorPlane 改成 1.5 m 細分格；springPool 改成比池子大一圈的 1.1 m 網格（舊的扇形長三角形會出現淡色楔形）；brookMesh／streamMesh 改 wMesh。海（sea）沒有改，還是原本的海浪 shader。
- 瀑布 v3：fallProfile(z) 從山頂（WFACE→WM.x 最高點）沿地面往下取樣，網格沿坡面法線往外 .32 m、兩側地面較高就抬高，所以不會穿進石頭；上窄下寬。fallMat = 同一套顏色參數，兩層拉長的波紋往下流。fallFoot：泡沫圓盤（兩層貼圖）＋90 顆 GPU 水花（Points，頂點著色器算拋物線，不吃 CPU）＋水霧。gH 在瀑布腳挖了一個小深潭。inFallZone：程式生的石頭/花/蘆葦不擺在瀑布路徑上，樹也不擺。
- 山坡鋪樹叢：slopeCover(C)（treesFlush 裡），每個區塊地形上坡度 .3–1.5 的地方每 1.6 m 一叢矮樹冠（LPT 第 10 欄 = 高度壓扁倍數），避開水、清除區、挖過的地、瀑布。
- 地圖編輯：轉視角按鈕＋WASD/方向鍵、QE 轉、RF 俯仰、ZX 縮放、右鍵拖曳轉；兩指上下＝俯仰；右上角固定「✕ 離開編輯」；「完成」後面板又冒出來的 bug（edSelect 重畫 panel）已修。擺放「🎲 隨機大小」（樹：大小＋寬窄 o.w，存在 pack 第 8 欄，worker 也收）。點不到放的樹 → edPickNear 用地面點找最近的物件。神木紅布條跟著神木（清除時不留下、擺放的金葉神木也有布條）。原本的神社也能選（C.gen 加 shrine）。邊界外也能升降挖噴（MD.out：g0 為 null 的地方以 0 為底，mdOutBuild 每 16 m 一片新地形）；測試模式「🚶 主委穿越邊界」= window.MZ_FREE。
- 神社 shrineStone()：保留主委的模型，只改材質成灰石＋朝上/低處長青苔（shader）。
- 彩虹：不再用加法混色（藍天上紅紫都不見、其他變青色），改七色帶一般透明疊上。
- 洗碗：搓洗 rUV .6→.3（減半）；沖水時碗不再自己轉（玩家自己轉）；沖水 .6→.78、溢流也加寬。
- 過橋那頭的磁磚帶（pier 區 ground pave −14..72 × −150..−143.5）刪了。
- 沒驗到：手機實機手感、編輯器挖的水在模擬器沒拍到（森林樹冠擋住、山谷那次被讀取畫面蓋住）、邊界外編輯和穿越邊界只確認語法。

## 第 55 批（11/17 深夜）
- 後殿兩側：內層側牆（RS.x1+.2 的磚牆、壓頂、門楣）拆掉；禪院／禪房的木門框、小屋頂、匾額移到外層紅磚牆開口（x=±25.6，ZEN.GZ）；後埕鋪面鋪到外牆；walkable 多開 |x| 22.5–25.15 那條（RH.z0..SHZ0）；內牆上的八角花窗 hc-yard 拿掉。
- 黑點：goStation() 一律 toast(STATION_HINT[k])，小鎮的點沒有「走向…」就跳出空的 toast（黑色小膠囊）。現在沒有字就不跳，toast() 也擋空字串。
- 石燈：光暈貼圖改成長尾漸層、地面光圈 1.55 倍並移到燈下、空中再加一層淡光（KM.lampAir）。
- 水兩色：挖的水原本一律 RIVER_Y（−0.55），旁邊泉水是 −0.22 → 低一層、顏色深。WSHEET 記錄每片天然水面的範圍和高度，mdLevel：在天然水面範圍內 → 不另鋪（天然水面自己會顯示，深度隨挖的地重算）；5 m 內 → 用那片的高度；水邊夜晚亮度 .42→.6。
- 濾鏡：renderer.toneMapping=CustomToneMapping（ACES×.92 曝光 + 輕 S 曲線 + 中間調飽和 + 暗部冷/亮部暖），不加後製 pass；測試模式可開關（localStorage mz.grade）。
- 柏油路：拿掉貼圖裡的深色橢圓斑塊；asphalt/pave/plaza 材質加 bumpMap（立體）與較低 roughness（反光）。
- NPC：PAVED（ground/gquad 的 asphalt、pave、plaza 範圍）＋ TW.paved；鎮民散步只選鋪面上的點，且整條路（每 40 cm）都要是鋪面（離家前 2.5 m 例外）且 TW.walk，否則換一點或原地等。
- 山坡：slopeCover 改成坡度 ≥ .22 全部鋪（含山壁），陡坡沿下坡方向多放幾層；避開泥土路（pathD、SPI2、wpD、TRAIL）、水、清除/挖過的地、瀑布。
- 遠景底地 backdrop()：全世界一張 4 m 網格低模地面（真實地形取 3×3 最低再降 .45，一定在已載入的地形下面），地圖外起伏成山丘，外圍 700 棵簡單樹冠；兩個 draw。
- 女神泉：gBowl 深碗（邊淺、中間約 2 m）；支流水面 brookY(k) 從泉水高度（−0.22）漸降到 −0.55，河床跟著水面低 .75；泉水面在離池邊 R+1.3 外淡出、支流在 R+.5 內淡出（wclip），交界不重疊。瀑布底部往外推（off .36→1.16）。
- 西山溪流和大河交會的「綠色橫條」：BASEG 草地的兩個洞（大河、西山）之間留了一條草，蓋在溪口水面上。改成一個 L 形洞。
- 北邊打開（主委「開到小地圖的邊框」）：WORLD_BOX z0 −262→−300、ZR −258→−298；新增 north0..3 四個區塊（NORTH：各自接上隔壁地形的高度，14 m 內漸變成草地小丘、最北邊緩升成山），TW.ground 對 z<−255 先問 northH；BASEG 加北邊洞；presence z 夾 −300。
- 沒驗到：手機實際速度（山坡樹叢變多、遠景）、NPC 實際走路、北邊新地的樹/坡。
- 11/18 00:20 紫色方塊：質感調色的「暗部偏冷」連純黑也加了一點藍紫，所有用「黑底＋加法混色」畫的光暈（燈籠、石燈）都變成紫色方塊。現在純黑保持純黑（色調只加在 l .02–.45）。設定 → 畫面濾鏡 底下加「質感調色：開／關」（HANDLERS.grade，localStorage mz.grade）。
- 11/18 00:40（主委「這條河為什麼是白色、兩條河銜接還是沒修順、變好卡」）：
  - 白色：淺水顏色 #62c4bd 太淺、透明度下限 .5、淺水整片都有岸邊水紋。改成淺色 #48a8a3、深淺變化更快（×1.6）、透明度下限 .72、水紋只在 D<.22。
  - 銜接：大河的水面（mirrorPlane）往兩岸多畫 4 m（東河往西 4 m），地面高的地方自己淡出；主委在河邊挖的地就直接是大河的水（mdLevel in → 不另鋪）。挖的水外圈不再蓋進天然水面範圍。西山溪流在 z>−146.4 淡出，交給大河。
  - 卡：最吃的是山坡樹叢（slopeCover）—— 上一版每 1.45 m 一叢、陡坡再疊 6 層，每叢 8 張葉片，山區一個區塊上萬張半透明葉片。改成每 1.95 m（省電畫質 2.4 m）、陡坡最多 3 層、每叢 7 張但稍大；河岸、溪邊、木橋旁不鋪。

## 交接（11/18 00:55，主委換帳號接手）
- 目前狀態：audio-fix 最新 commit 就是本段之前那一個以及這份 HANDOFF；測試頁 artifact 版本 146 = audio-fix。正式站 main 還是 44b5038（精力 hotfix），第 53–55 批全部「還沒部署」。部署前：git fetch、確認 origin/main 是 audio-fix 的祖先、`git push origin audio-fix:main`，等 Workers Builds 成功。worker.js 有改（/mapedit、物件第 8 欄寬窄），部署後地圖編輯「💾 固定」才會存到伺服器。
- 待主委決定：
  1. 美食廣場旁空地（主委站在 76.4, −107.1；大約 x 66–86、z −117…−89）要蓋 4 間還是 6 間一樓小屋。建議：laneE 小巷（z −111…−105）往東延伸到 x≈86，兩側各 2 間 S 小屋。伺服器 /houses 的 buy 限制 l<40 要改成新的總數，LOTS 要加新的地段（位置不在 VIL 內，lotBoard、房間大小 LOT_SZ.S 照舊）。整塊地＋美食廣場（plaza 區 ground "plaza"）鋪同一種有 bump 的磁磚。
  2. 掛在門口的閒置玩家要不要變淡／收起（之前提過，沒回覆）。
  3. 睡覺精力：主委說先不動。
- 已知沒驗到：手機實機效能（山坡樹叢已減半；若還卡可只在遠處鋪或省電畫質不鋪）、主委自己挖過的河（存在主委手機 localStorage mz.mapedit，模擬器重現不了）、NPC 只走鋪面的實際行為、北邊新地形走一圈。
- 模擬器注意：瞬移到小鎮後常會跳「正在前往天后小鎮」讀取畫面（LQ.ready 之後 zoneForget），截圖前要等 #zonePack hidden；整體大約 1 fps，GO/等待要給足時間。

## 第 56 批（11/18 凌晨，主委 00:59–01:05）河同一個顏色、拔掉山壁樹叢、草地材質 v2、沙灘材質
- 河的顏色：水面 shader 的深淺不再看實際深度——每一處水都當作 1.2 m 深算顏色（dk 固定），只有岸邊最後 35 cm 淡出。所有河、溪、泉、挖的水同一個顏色、同一個透明度。
- 山壁樹叢：treesFlush 不再呼叫 slopeCover（第 54/55 批加的山坡樹叢全部拔掉；函式還在）。
- 草地材質 v2（public/tex/grass/：color 1024、normal 512、noise 256、glint 512，webp）：
  - grassPatch(m,force,sand) 套在 terrain()、lawnMat()（outsideGround、BASEG、GMAT.grass）、backdrop（強制 LOW）。世界座標貼圖（GCFG.scale 4.6 m），所以所有地面接在一起沒有接縫。
  - 顏色：草地權重 gW＝地形頂點色「綠的程度」（g−max(r,b)），所以路、沙、岩、主委噴漆的地方維持舊樣子；保留頂點色的明暗（lu/gLum）。noise 兩個尺度（57 m、19 m）±10% 深淺；HIGH 再讀一次轉 36°、放大 1.31 倍的貼圖用 noise 混合（防重複）；70–190 m 外慢慢收成平均色避免閃爍；整體 tint .66、降 20% 飽和（新貼圖本身很亮很黃）。
  - MEDIUM/HIGH 改用 MeshPhongMaterial（逐像素光，specular 黑）：法線 .08（世界座標切線空間、Linear 讀取）、反光＝太陽方向的半向量高光×glint 遮罩×.035，38 m 外消失；吃太陽顏色，所以黃昏夜晚自然變弱。專案沒有陰影貼圖，所以樹蔭裡仍會有一點點反光（強度很小）。LOW＝Lambert 只換顏色。原版＝完全不套。
  - 設定 → 畫面濾鏡 →「草地・沙灘」原版／新版・低／中／高（localStorage mz.grass；自動＝手機中、電腦高），切換後重新載入。window.MZ_GRASS、window.MZ_GU（共用 uniforms，可現場調 GS、gNS、gVar、gGS、gTint）。
- 沙灘材質（public/tex/sand/，主委 4 張圖，已做成可無縫平鋪）：同一個 grassPatch 加 SANDM（frontGround 廟前沙灘、BASESAND、beachC 地形）。沙的權重＝頂點色在 VC.sand→VC.wet 線段附近；濕沙比例 sT 直接用原本依海岸線（FRONT.shore）算好的濕沙顏色，所以濕沙位置是真的海岸線、過渡是原本的柔和漸層。乾沙：法線 .04、變化 8%、反光 .015、寬鬆高光；濕沙：顏色 ×(.70,.66,.62)、反光 .06、高光較集中。共用草地的 noise 和畫質設定（SCFG）。
- 接觸陰影：aoFlush(C) 在每棵樹（LPT 非樹叢、針葉、椰子）、每顆 mossRock、每座石燈底下放一個柔和的深色圓（每區 1 個 InstancedMesh、不加光源）。
- 驗證（模擬器）：HIGH/MED/LOW/原版都沒有 shader 錯誤；俯視 5×5、10×10 格看不出重複；草地區 draw calls 原版與 HIGH 一樣（243/287/303），貼圖多 12 張（約 17 MB 顯示記憶體）。沒驗：手機實際 FPS、GPU 時間（模擬器 1 fps 量不準）。

## 第 57 批（11/18 凌晨，主委 01:55–02:01）遠景刪除、斷層、河口、女神泉小溪、河流到盡頭、草地 V2、水面需求、磁磚反光
- 遠景底地 backdrop() 不再呼叫（主委：海被草皮蓋住）。函式還在。
- (19.8, −193.3) 斷層：WWD 區塊跨 −176 時只鋪到 x 14，山區從 x 21 開始 → x 14–21、z −176…−200 是空的（之前被遠景用另一種顏色補）。WWD 改成跨 −176 時分兩塊鋪（−176 以北到 14、以南到 21）。BASEG 的山區洞＋女神泉旁長條＋x 14–21 合成一個 L 形洞（之前 x 111–134.5、z<−176 沒有洞，平的草皮蓋在小溪河床上，所以小溪中段「斷掉」）。
- 小溪 brookMesh(C,i0,i1)：女神泉那一區畫前半段（到 x 125，BSPLIT），東河 east2 畫後半段，各自跟著自己的區塊載入。
- 河口 (−63, −144)：mirrorPlane 往兩岸多畫 9 m（原本 4 m，剛好停在西山溪流河口）。
- 東河往北延伸到 z −300：northH 在 x≥148、z<−262 直接用 eastH，north3 區用 eastC 並加水面。
- 草地 V2（主委第二版需求＋5 張新圖）：tex/grass/color（v2）、noise（R＝macro、G＝mid，兩張合成一張省檔案數）、normal（v2）、glint（v2，正規化）。拿掉所有週期函數；三層：細節（貼圖，對比 gDet .7）、中尺度（17 m，±2.5%，MED 起）、大尺度（96 m，±6%，暗綠↔黃綠，所有等級）。HIGH 才有反光（只有遮罩挑到的少數草絲，40 m 外消失）和第二次取樣防重複（混合遮罩是 41 m 的 noise，不是週期）。gW 改寬（偏綠就算草），森林地面不再一塊新草一塊舊草；拿掉跟著頂點色變明暗。
- 沙灘：反光只在 HIGH，噪聲用合成的 noise。
- 水面（主委水面需求）：現有 v3 已是 ShaderMaterial、世界座標兩層波紋、Fresnel、8 格漣漪池、WQ 高中低、測試模式💧面板。這次：WCFG_DEF 淺水 #5db7a6、深水 #2f7fa3、amp .75、spd .7、fres .85、spec .6、foamK .7、alpha 1；顏色用岸邊遮罩 dk=smoothstep(.02,.32,D)（中間都一樣）；太陽高光改柔（pow 220×.55＋pow 36×.07）；透明度下限 .9。注意：如果主委手機存過 mz.water（💧面板），會蓋過新預設，要在面板按「重設」。
- 磁磚：gmat 的 pave/plaza 改 tileLike()＝廟埕磁磚同款（Phong shininess 14、specular #2e2820、bump、.16 自發光）。
- 山坡樹叢 slopeCover 不再鋪（主委：拔掉）。
- 接觸陰影在斜坡上不放（平的圓片在斜坡上會切出一條直線）。

## 第 58 批（11/18 03:10，主委 02:57：會走進建築、樹石沒碰撞、沒看到反光、路變鋸齒、幾秒就閃退）
- 碰撞：SOLS[區塊 id]＝實心圓（aoFlush 時登記：LPT 樹幹 .34×大小＋.22、針葉 .1×高×胖＋.22、椰子 .5、mossRock s≥.5 → .8s＋.2、石燈 .6），4 m 格子 solGrid；TW.walk 第一行 solHit()；unload 時移除。load() 的 C 帶 id。建築 bfoot 邊距 .25 往內 → .35 往外。
- 路的鋸齒：草地權重 gW 漸層從 (−.02,.06) 放寬到 (−.14,.16)。
- 閃退：手機預設草地改「新版・低」（Lambert、只有顏色＋大尺度變化、兩張貼圖）。主委若還閃退，請切「原版」比較。
- 反光：照草地需求單只在「高」；手機預設低所以看不到。

## 第 59 批（11/18 11:30，主委 10:50＋11:04：水還有斷層像顏料、草沙沒反光、路鋸齒、女神泉樹不見、森林道具包、手機近小鎮全黑）
- 水：顏色不再看深度，dk 固定 .55（整條同色）；透明度 alpha .74（泡沫和 Fresnel 邊仍較不透明）；mirrorPlane 預設往岸外延伸 9 m。
- 草沙反光：高畫質加「逆光邊緣光」（rim .3），反光遮罩改放在 normal 圖的 alpha（刪 grass/sand glint.webp，省兩個檔案名額）。
- 路：不再用頂點顏色畫，改 pathRibbons()（0.6 m 取樣、軟邊泥土貼圖 pathTex、polygonOffset）；forest/mount/WWD 用。
- 森林道具包：public/props.glb（$S/props/build.py 從主委 16 個 GLB 拆＋降面），propsScatter() 在 forest/mount/WWD/gspring/north 隨機放石頭、蘑菇、花、倒木（石頭、倒木有碰撞）。狐狸石像不撒，放進建築模式（MDKINDS fox）。
- 女神泉楓樹／神木：是主委在另一個測試頁的地圖編輯（localStorage），等主委貼 📋 配置碼寫進 MD.baked。
- 手機近小鎮全黑（WebGL 記憶體）：實測小鎮約 400 MB 貼圖（店內房間、招牌 2048 圖）。手機上 MAX_TEXTURE_SIZE 回報 1024（閃退後 20 分鐘 512），three.js 自動縮圖 → 約 240 MB；手機同時載入區塊 45/70 m → 38/60 m（閃退後 30/48）；道具手機減半、閃退後不撒；閃退後 20 分鐘草地用原版；草沙貼圖手機縮 512。

## 第 60 批（11/18 11:50，主委 11:31「還是沒有反光」、11:34「出禪堂還是一樣黑畫面」＋截圖「畫面恢復了」）
- 反光真正原因：主委給的 glint 圖幾乎全黑（99% 小於 .07），所以遮罩等於沒有。normal.webp 的 alpha 拉開（草 (a−.012)/.10、沙 (a−.152)/.03，^.8）；shader 草 gGS×(3＋100a²)、沙 6＋160a；光照加 .3 常數項（任何角度都看得到被挑中的草絲）、高光帶暖黃 (1,1,.72)。模擬器開關對照看得到。
- 黑畫面：iPhone 掉 3D 後恢復，但畫面一直黑（禪房門口收起的貼圖、縮過的圖送不回去）。現在畫面在前景時掉 3D → 記 mz.crash、直接重新整理進省電模式（不再停在黑畫面）。省電模式 Q.safe 從 20 分鐘延長到 2 小時。
- 模擬器（iPhone UA、實際 GL 貼圖記帳）：廟 163 MB → 出禪堂 148 → 小鎮 86–131 MB。

## 第 61 批（11/18 12:40，主委「出禪堂為什麼這麼高 那只有一個建築三個遊戲」）
- 實測（iPhone UA、只算已送進顯示卡的貼圖）：廟 176 MB → 禪堂門口 200 MB（尖峰）→ 換區後 130 → 小鎮 86–135。禪堂門口的量不是那棟遊戲屋，而是整座廟還在記憶體（神像 GLB 1024 貼圖、壁畫、招牌、商店街、27 位 NPC 的臉和頭髮、各種字卡）；走到門口時廟正面的招牌、神像第一次被看到才送進顯示卡（+15 MB）。換區讀取畫面時才收起廟。
- 手機：小鎮區塊改成每 0.4 秒最多建一區，換區（ZN.busy）期間不建，避免「廟還沒收、小鎮同時蓋 8 區」的尖峰。

## 第 62 批（11/18 14:30，主委 13:12–13:29：分三區、電腦也一樣、含天后山；不要缺圖、破圖、突然冒出東西）
- 三區（ZM / zoneOf / zoneHas / zoneWant / zoneGo，在 zoneVeil 前）：t＝廟＋海邊＋禪堂（front、cafe）；v＝禪堂外＋小鎮（gate…brook）；f＝森林＋天后山＋女神泉＋西邊樹林＋東岸＋北邊（c.z<−140 或 c.x>141）；riverW/riverE 兩區共用。天后山頂／滑翔中（TW.high）＝vf 兩區都載。
- 邊界：t↔v 在 z −52／−49.5（原本換區的地方）；v↔f 在 z −141.5／−138.5、x 146／140（過河）。
- 換區：讀取畫面蓋住 → 收舊區（zoneForget/zoneBack＋unload，舊區用過、現在沒人用的貼圖 dispose）→ 新區所有區塊每幀蓋一區 → 電腦再把整區畫一次（frustumCulled 關掉，把貼圖全送進顯示卡；手機不做，省 ~100 MB）→ 才拿開讀取畫面（進度條停在 96% 等）。區內不再依距離載入／收起（舊的 LR 迴圈 if(0) 停用）。
- window.MZ_VEILD 可縮短讀取時間（測試用）。TW.zoneNow() 回傳目前區。
- 模擬器（iPhone UA）：t 182 MB → v 261 → f 220 → v 272 → t 284（整區看過後）。各區截圖正常、無錯誤。

## 第 63 批（11/18 20:30，主委 19:46「一樣出去就掛了 根本也還沒跳讀取畫面啊」）
- 掛掉的地方在換區之前（禪院一帶，仍是 t 區），模擬器重現不了。加「閃退紀錄」：mz.alive 每秒存（新增 區域 zn、載入區塊 live、三角形 tri、著色程式 prog、最後新增的著色 pg ← CRB.pg 追 renderer.info.programs）。單機測試頁（!USE_CF）下次開啟時，頁面上直接跳「📋 上次掛掉前的狀態」框，請主委截圖。
- 注意：USE_CF 在那一行之後才宣告，直接 typeof 會 TDZ 整頁掛掉 → 改在 setTimeout 裡 try。
- 手機不再開禪院溪水、溫泉的 CubeCamera（每次多畫整個場景 6 次）。
- 模擬器量到廟裡每幀約 100 萬三角形、1000 次繪製（手機很重，之後可減）。

## 第 64 批（11/18 23:20，主委 23:06 閃退紀錄截圖）
- 截圖：位置 (14,−7)（廟裡，不是出門）、天后宮區、玩 2.1 分、畫面先中斷、三角形 99.9 萬、繪製 781、貼圖 88（中斷後的數字）。
- 紀錄改：3D 被收走後不再覆蓋數字（保留收走前那一秒），另記「3D 被收走後幾秒頁面才關」；加畫質細節 md（省電中／lite／low／一般、像素比、草地模式）。
- 模擬器同位置：每幀 70–100 萬三角形，最大是廟的合併網格（7 萬 Lambert #363637、屋瓦 instanced 13938 個 5.6 萬、廟柱等 3–6.5 萬）、3 尊 2.6 萬的神像 GLB；人物只佔 2.5–5 萬。
- 遊戲本來就有「剛剛遊戲被手機關掉了（廟裡人多的時候比較容易發生）…把其他人物減少一半」（KQ），表示廟裡閃退在這幾批之前就有。請主委用正式站（main 11/13）在同一支手機對照。

## 第 65 批（11/18 23:55，主委 iPhone 17 Pro；「廟走出去沒有先跳讀取畫面，直接卡死黑畫面」）
- iPhone 17 Pro 記憶體 12 GB，照理不是單純記憶體不夠。掛的位置 (14,−7) 是走出正殿到院子，離換區（外牆 z −52）還很遠，所以讀取畫面還沒出現。
- 設定 → 畫面濾鏡 → 「相容測試」（mz.compat / Q.compat）：一次關掉 11/18 的新東西——手機圖片縮 1024（getParameter 攔截）、新草地（強制原版）、外面磁磚 tileLike、森林小道具、樹下接觸陰影。閃退紀錄 md 會寫「相容測試」。請主委開著走一次對照。

## 第 66 批（11/19 01:50，主委：相容測試開著「正常了」）
- 相容測試改成可以一項一項切：mz.compat 存 1（全關）或 "cap,grass,tile,props,ao"；Q.cx（Set）、Q.off(k)。設定 → 畫面濾鏡 → 相容測試：「全部新效果」「全部關掉」＋五顆 ✓/✕（手機圖片縮小、新草地、磁磚反光、森林道具、樹下陰影，HANDLERS.compatOne）。
- 閃退從第 56 批（新草地）之後開始，縮圖是第 59 批才加 → 先請主委只打開「新草地」測。

## 第 67 批（11/20，主委 11/19 23:17「草地跟地板反光都會」掛）
- 兩個會掛的共同點：大面積用 MeshPhongMaterial（草地中／高的 gMat、磁磚 tileLike）。手機（Q.phone）不再用 Phong：gMat 一律 Lambert；磁磚保留原本 MeshStandard，只把 roughness .36、bumpScale .035。
- 手機草地・沙灘反光改在 Lambert 裡算（LGLINT，envmap_fragment 之後）：太陽方向 gSunD／顏色 gSunC（每幀從 sunLight 更新）、遮罩 smoothstep(.12,.45,normal.a)（沙 sGli）、(.35＋.65·pow(N·H,8))·N·L、亮處才有（directDiffuse 亮度）、14–45 m 淡出、顏色偏草色。強度 gGS×32。
- 找到一個大 bug：three.js 只幫 Phong／Standard／Shader 材質填 cameraPosition，Lambert（原版、新版・低、現在的手機）收到 0 → 草地以為鏡頭在地圖中心：近處不反光、整片都被「遠處淡化」成平均色。草地 shader 裡 cameraPosition 全換成自己的 gCam（每幀 = camera.position）。
- 手機的 normal 圖不再縮 512（alpha 是反光遮罩，縮了就沒了），各向異性手機最多 2。
- 請主委把「相容測試」切回「全部新效果」再走一次。

## 第 68 批（11/20 09:00，主委 08:47「草皮我還是沒看到反光」「一路出去森林又回來城鎮又當了」「先把草皮恢復到以前好了」）
- 草地・沙灘預設改回原版（old），所有人。設定存在新 key mz.grass2（舊的 mz.grass 不再讀，之前選的不帶過來）；新版還在 設定 → 畫面濾鏡 → 草地・沙灘。
- 主委閃退紀錄：(28,−136) 從森林過河回小鎮，換區當下掛（13 分鐘、小鎮 17 區、58 萬三角形）。手機換區改成：舊區收掉後等 0.7 秒再開始蓋，之後每 0.3 秒一區（ZM.nx；一開始在廟裡的那次不等，ZM.fast）。
- 模擬器（iPhone UA）廟 → 小鎮 → 森林 → 小鎮正常、無錯誤，草地 old。

## 第 69 批（11/20 10:30，主委 09:04 閃退紀錄：森林 (28,−144) 省電模式也掛、每幀 100 萬三角形；主委同意試做「滾筒世界」）
- 找到三角形暴增的原因：分區之後整區一次載入，而每區的樹、葉片、草叢、小花是整區一個 InstancedMesh、frustumCulled=false → 整個森林（13 區）每幀全部畫，連背後的都畫。舊的依距離載入只載附近，所以以前沒這麼多。
- 修法（TOWNX 內 FCL / fcSplit / fcScan / TW.fcCull）：每區的 instanced（≥40 個）切成 16 m 一格的 InstancedMesh（每片 ≤400 三角形的才切；草叢小花 ≤8 三角形且 ≥400 個；切出來的草叢不投影），每格算包住全部的球，每幀用畫面視錐＋霧的最遠距離決定畫不畫（只是不畫，不刪）。換區每蓋一區後 fcScan，平時每 4 次 tick 掃一次（樹模型晚到）。
- zoneFar：森林區時廟那邊全部不畫；手機在小鎮時廟的上千片零件（屋瓦、磚，instanced >1000）和廟裡的貓不畫，牆、屋頂、門照樣看得到。
- 模擬器（iPhone UA）：小鎮 60 萬 → 43 萬、森林 97 萬 → 65–67 萬三角形（含影子那一次）。
- 滾筒世界（試驗，設定 → 畫面濾鏡，localStorage mz.curve）：CURVE / MZC_GLSL；project_vertex chunk 改成在世界座標往下彎 K·d²（K .0042 前方、.0016 側向，深度材質不彎）、sprite（名牌）、水和溪（mzCurveVS）一起彎；camera.far 90（山頂全景區 200），天空球縮 .56、地平線下改成霧色。點地面走路在遠處可能有偏差（射線沒彎）。

## 第 70 批（11/20 10:50，主委 10:33 閃退紀錄：小鎮 (60,−138)、21.5 萬三角形、85 次繪製、貼圖 61——已經很輕還是掛）
- 最近四次掛的位置：(28,−136)、(28,−144)、(60,−138)，都在河邊 v/f 交界（原本 −138.5／−141.5，只差 3 m）。沿河岸走會在兩區之間來回切，每次整區收掉再蓋 → 懷疑是這個。交界拉開成 11 m：進森林 z<−144 或 x>149，回小鎮 z>−133 且 x<137。
- 閃退紀錄加「換區（次數/幾秒前/讀取中）」（TW.zoneStat、crInfo.zs），下次可以看出掛的時候是不是剛換區。

## 第 71 批（11/20 11:20，主委 10:51 閃退紀錄：小鎮 (61,−133)、換區 4 次、10 秒前換完、不在讀取；64.9 萬三角形、802 次繪製、模型 1904、貼圖 168、省電模式）
- 不是剛換區當下掛。模擬器來回 小鎮↔森林 3 趟：renderer 的模型數會到 ~1600 後持平，不是一直漏；但換區時順便把舊區用過、場景沒人用的 geometry 也 dispose（含 ShaderMaterial uniforms 裡的貼圖）。
- 手機預設改回主委 11/19 01:36 測過「正常了」那一組：相容測試五項（手機縮圖、新草地、磁磚反光、森林道具、樹下陰影）全關。key 換成 mz.compat2（舊選擇不帶過來）；電腦預設全開。分區、畫面外不畫、交界 11 m 保留。

## 第 72 批（11/20 11:50，主委「給我歷代版本 我沿路試回去 看哪一個開始的」）
- 測試頁 設定 → 畫面濾鏡 → 🕰 歷代版本：12 個版本（接手前 3e59b1c、第 56–62 批、67、68、69、最新）。選了存 localStorage mz.ver，重新載入。
- 做法：index.html <head> 最前面的小程式看到 mz.ver 就載入 vers.js、用 <plaintext> 把本頁其餘部分吞掉，vers.js（MZ_VBOOT）把那版的 index.html 組回來（第一版全文＋之後每版的逐行差異，gzip＋base64，約 3 MB）再 document.write，頂端加「🕰 第 N 批｜換版本」。沒有 vers.js（正式站）時會清掉 mz.ver 重新整理。
- vers.js 不在 repo：$S/vers/（mk.sh 用各 commit 的 publish_prep 產生 html、pack.py 打包、boot.js）。測試頁檔案剛好 511（上限）。
- 舊版用的是現在的素材：第 56–58 批的 grass/sand glint.webp 已刪，那幾版反光遮罩會缺。

## 第 73 批（11/20 12:20，主委「你能不能找出最有可能的原因？廟都沒事 也有地板反光 小鎮跟森林到底是什麼卡了」）
- 整理：(1) 11/19 主委測出「新草地」「磁磚反光」各自會掛——兩者都是大面積 Phong，已拿掉（手機）。(2) 之後小鎮／森林的閃退紀錄全部在河邊（(28,−136)、(28,−144)、(60,−138)、(61,−133)），而且「最後新增的著色」都有 Shader（ShaderMaterial）——小鎮／森林會新編譯的 ShaderMaterial 就是水（河、溪、泉、瀑布，W_FS / wmat / fallMat）。廟這區沒有這些水，所以廟沒事。
- 相容測試加第 6 項「水面特效」（water）：關掉時 waterMat / wmat / fallMat 全部換成 SIMPLEW（MeshLambert 半透明、雙面，瀑布偏白）。手機預設（mz.compat2 沒設時）六項全關。

## 第 74 批（11/20 13:30，主委 12:46：六項全關（含水）還是掛在小鎮 (59,−129)，換區 8 秒後）
- 最近幾次都是「森林 → 小鎮」換區後 8–10 秒掛，閃退紀錄「最後新增的著色」一直在換。模擬器記錄每次換區後新編譯的 shader：回到小鎮會重新編譯 44 個（第一次進小鎮才 4 個）。
- 原因兩個：(1) 天后山營火是放在 mount 區塊裡的 PointLight，進／出森林場景的燈數就變，three.js 會把所有材質重新編譯；改成 CAMPFL()：一開始就放一盞在場景裡，離開森林只把亮度設 0。(2) unload 時 own 材質 m.dispose() 會把編好的 shader 一起丟掉，回來又要重編；改成只丟貼圖、不 dispose 材質（shader 留著，數量有上限）。
- 結果（模擬器）：第二次回小鎮 44 → 0–6 個；第一次進森林仍會編約 25 個（本來就有）。renderer.compile 試過：r128 會連隱藏的東西一起編（75 個），拿掉。

## 第 75 批（11/20 17:20，主委 16:58「出去森林再回城 一開始正常 轉角度開始卡的然後斷線」）
- 回到小鎮後，小鎮的貼圖（離開時釋放）要等第一次出現在畫面上才送進顯示卡，一轉鏡頭幾十張同時上傳。模擬器：回城後轉一圈多傳 78 張。
- 手機換區時，讀取畫面拿開前先把場景裡看得到（含畫面外被 fcCull 藏起來的）物件的貼圖用 renderer.initTexture 一幀 3 張送完（ZM.tq）。結果：回城轉一圈 0 張新貼圖、2 個新 shader。

## 第 76 批（11/20 17:45，主委「一定要讀取完畢都可以跑了才切到遊戲畫面」「讀取時有沒有確保另一個地圖記憶體真的放掉了」）
- 換區讀取畫面拿開的條件（ready）：區塊全部蓋好 → （手機）貼圖全部送進顯示卡 → 站在原地往 8 個方向各畫一次（cc＝相機繞玩家轉，fcCull 跟著換，shader 全編好、貼圖全上傳）→ 連續 20 幀都在 70 ms 內（最多再等 25 秒）。模擬器回城轉一圈：新貼圖 1 張、新 shader 0 個。
- 閃退紀錄加「上次換區釋放（前→後）」：收舊區前後 renderer.info.memory 的貼圖數、模型數（ZM.mem、TW.zoneMem）。

## 第 77 批（11/20 19:10，主委 18:36 閃退紀錄：廟 → 小鎮 換區只放掉 貼圖 296→274・模型 2944→2902，8 秒後掛）
- 模擬器（iPhone UA＋省電）重現：廟 2889 模型；換到小鎮只少 82 個，小鎮變 3118。zoneForget 只收神像／壁畫這類大圖，廟的其他東西全部留在顯示卡。（省電模式 Q.low 下廟沒有合併，所以模型數特別多。）
- 手機在小鎮／森林（zoneFar v/f）：廟那一側（z>−53，非區塊、非人物、非天空）的 mesh、sprite、points 全部不畫，而且把它們的 geometry、InstancedMesh 緩衝、貼圖從顯示卡釋放（場景裡仍看得到的東西用到的不放）；回廟時自動重新上傳（讀取畫面的 tq＋8 方向預畫）。結果：廟→小鎮 模型 1862→588、貼圖 199→95。代價：手機在小鎮看不到廟（那一塊是空地＋霧）；電腦照舊。
- 試過只留沒貼圖的外殼：看起來像骨架，改成整個不畫。

## 第 78 批（11/20 19:35，主委 19:29「沒卡住了 到山頂有整個小鎮風景才卡」）
- 第 77 批（手機在小鎮／森林把廟整個放掉）後小鎮、森林不卡了 → 確定是記憶體（廟沒放掉）。
- 山頂（TW.high → vf，小鎮＋森林全部載入）在手機上還是太多：手機不再進 vf，山頂只有森林區；滑翔飛進小鎮範圍時照一般換區。
- 下一步（主委要看得到廟、山頂要有小鎮風景）：做「看板」——換區時趁讀取畫面拍下廟／小鎮的照片，立在原處當遠景，手機只畫一片板子＋一張圖。

## 第 79 批（11/20 21:45，主委 21:31 閃退紀錄：走到後殿 (6,−24) 掛，掛前最後編的著色有 MeshPhong）
- 廟的地板（floorsPlain 轉成的 MeshPhong，含門口欄杆外那片）一直是大面積 Phong——跟手機會掛的磁磚反光、新草地同一種。手機改用 MeshStandard（亮面 roughness .3／中庭 .5／其他 .85，保留 bump、自發光貼圖）；手機上雨天濕地（wxWetInit 只認 Phong）因此不作用。模擬器：手機廟裡 0 個 Phong。
- 主委問夾娃娃頭飾為什麼大家一直中（未改，只回覆）：夾子對準（aim>.5）時抓起機率 100%，往上提時掉落很少；夾到「神秘禮物盒」40% 給沒有的頭飾、非金色扭蛋球約 6%＋第一次 30%×40% 給夾子頭飾。每天最多夾中 5 次。

## 第 80 批（11/20 22:00，主委「夾起機率改70 頭飾只有3% 現在還沒有家具」）
- 夾娃娃：抓起機率上限 .7（對準也是 70%）。神秘禮物盒：頭飾 3%，其餘一半 60 平安幣、一半零食；不再給家具。非金色扭蛋球：平安幣 70% 不變，剩下 30% 裡 1/10 給頭飾（沒有夾娃娃夾子就先給它，等於全部的 3%），其餘零食；不再給家具。金色扭蛋球照舊扭蛋幣。

## 第 81 批（11/20 22:10，主委 21:46 閃退紀錄：廟 → 小鎮 換區後 7 秒，「整個頁面被手機關掉」（不是 3D 被收走））
- 換區釋放有效：貼圖 292→115、模型 2767→671。但小鎮蓋好後整個頁面被殺（程序記憶體，不只顯示卡）：小鎮 204 貼圖、1090 模型、77 著色程式。
- 測試頁的特性：所有模型是 *-model.js（base64 文字，共 70 MB）、圖片在 img-pack.js（8.3 MB），解碼後會比正式站多佔記憶體；而且是在 Claude App 的內嵌瀏覽器裡跑。模型解碼後本來就把 window.GLB_x 設 null，這批再把 <script> 元素移除。
- 請主委用 Safari（不是 Claude App 內）開測試頁對照。

## 第 82 批（11/21 01:20，主委 iPhone 17 Pro 是 iOS 27.3；正式站（11/13 沒動）也開始掛；「沒有其他辦法嗎」）
- Safari 27.3 beta（11/16）說明有「Fixed a WebGL regression with texture uploads that specify a format and type」——WebGL 2 的上傳路徑最近在改。主委的閃退從 11/17 起、正式站也掛，最可能是 iOS 27.x 的 WebKit。
- WebGL 1 相容模式（Q.gl1，localStorage mz.gl1）：UA 有「OS 27_」預設開，自己建 canvas.getContext("webgl") 傳給 THREE.WebGLRenderer（context）。設定 → 畫面濾鏡 → 「WebGL 1 相容模式」開／關。閃退紀錄畫質欄加 GL1／GL2。
- 模擬器（iOS 27_3 UA）：WebGL 1 下廟、小鎮、森林都正常、沒有錯誤；只有非 2 的次方的貼圖被 three 縮成 2 的次方（console 警告，招牌略糊）。

## 第 83 批（11/21 01:45，主委：WebGL 1 開了「不會卡了」；其他手機都不會掛、iPhone 13 只會頓一下 → iPhone 17 Pro＋iOS 27.3 的 WebGL 2 問題。「把之前問題放回來看看 地板反光 開放世界 溪水都還原到最後版本 但用 webgl1 開」）
- 開放世界回來（預設）：ZONES＝localStorage mz.zones==1 才分三區。沒分區時跑舊的依距離載入（LR0、手機每 0.4 秒一區）＋舊的禪房門口換區（z −52 收廟裡重的東西、5 秒讀取畫面、−49.5 回來）。設定 → 畫面濾鏡 → 「地圖載入方式」開放世界／分三區。
- 手機的保守做法全部收起來（Q.tame，mz.tame=1 才開）：廟地板回到 Phong 反光、外面磁磚 tileLike 反光、禪院溪水／溫泉倒影（CubeCamera）、山頂全景（vf）、相容測試預設全開（新水面、樹下陰影、森林道具、手機縮圖）。草地仍是原版（mz.grass2 預設 old）。
- 保留：WebGL 1（iOS 27 預設）、畫面外不畫（fcSplit/fcCull）、營火燈常駐、材質不 dispose、換區讀取完才進（分區模式時）、閃退紀錄。
- 模擬器（iOS 27_3 UA）：GL1、開放世界，小鎮／森林／廟正常，無錯誤。

## 第 84 批（11/21 01:40，主委 01:32「有好很多 但還是會」，閃退紀錄畫質寫 GL2）
- WebGL 1 根本沒開：新版 iOS 的 user agent 不再寫真正的系統版本（凍結），/OS 27_/ 對不到。改成所有 iPhone / iPad（含 iPadOS 的 Mac UA＋觸控）預設 WebGL 1；手動選過的（mz.gl1）照舊。

## 第 85 批（11/21 01:55，主委 01:41：GL1 了，玩 7.4 分鐘到山頂還是掛；18 區、93 萬三角形、模型 328、貼圖 53）
- 手機（開放世界）在山頂／滑翔（TW.high）：(1) 全景範圍從 300 m 縮到 150 m（LR [150,180]），小鎮和森林都在、最遠的西邊／東邊不載；(2) 廟（250 m 外）整個不畫並從顯示卡釋放（zoneFar("f")，TW.farHi），離開山頂再放回來。
- 模擬器（iPhone UA）：山頂 模型 2055→693、貼圖 259→143。

## 第 86 批（11/21 02:45，主委「我就是要整座廟…原本的模型…裡面的磁磚、牆壁貼圖、神明都不用…看起來跟原本的廟外型一樣」）
- 空殼（融化模型 shellBuild）拿掉。zoneFar 在手機上改成：用 exteriorSet() 在手機上算一次「從廟外面看得到的東西」——每個廟的 mesh 換成獨一無二的純色（MeshBasic、layer 5、暫時拿掉 instanceColor），從 34 個外面的位置（廟四周兩圈 16 個方向的眼睛高度和 16 m 高、山頂、小鎮）畫 160×160、readRenderTargetPixels 收 id；看得到的保留原模型原貼圖，看不到的才藏起來並釋放。結果（ZEXT 快取一次）。
- 再加上原本禪房門口 zoneForget 已經收掉的廟裡重東西（神像、壁畫、商店街店內），廟從外面看完全是原樣。模擬器山頂：模型 1409、貼圖 210（全藏時 693／143）、86.5 萬三角形。

## 第 87 批（11/21，主委「把樹改成動物森友會那種」）
- 新增原創「圓圓的樹」RTREE（在 LPT 後面）：短短的錐形樹幹＋五顆圓球合成的蓬鬆樹冠（上亮下暗），每棵一個顏色：綠、粉紅、楓橘、金黃；松樹（deep）改成三層圓錐、寬度 .78。MeshLambert、instanced：樹幹一次＋每種顏色一次。位置大小跟原本一樣。
- 預設開（localStorage `mz.tree`="round"）；LPT.build 包一層，出錯就退回原本葉片樹。設定 → 畫面濾鏡 → 樹的樣式（圓圓可愛／原本的葉片樹），切換會重新載入。
- 沒改：雪松、椰子樹（GLB 模型）、櫻花林 SAKURA、禪房 ZEN 的樹（另外的程式）。

## 第 88 批（11/21 13:50，主委兩張閃退紀錄）
- 兩次都在下雨（水・鏡面 rain/濕）：一次在廟裡 (5,21) 開遊戲 6 秒（剛好是 wxWetInit 9 秒那時），一次在 (−23,−104) 玩了 3 分鐘。下雨時「濕地板」會拍一張四周的反光圖（整個場景再畫 6 次）並讓每塊濕地板換新著色程式——跟之前會掛的大面積 Phong 同一類。手機（非 tame）不拍反光圖、不加 envMap；地板照樣變暗變亮。
- 閃退紀錄全 0：pagehide 時 3D 已掉，crBye 用掉之後的數字蓋掉。改成 3D 掉了就保留掉之前的數字。
- 圓圓的樹不是原因：模擬器同位置 round/card 三角形差不多（新村 48 萬 vs 55 萬）。

## 第 89 批（11/21 14:10，主委閃退紀錄：晴天、(28,−31)、0.7 分、溫泉）
- 三次閃退都有「反光圖」（CubeCamera：整個場景再畫 6 次）：第一次濕地板、第二次溪水＋溫泉、這次溫泉。手機上三個 CubeCamera（WX 濕地板、ZEN 溪水、INN 溫泉）全部不做（`!Q.phone`）；溪水、溫泉照樣有水面效果，只是不映出四周。禪院的平面鏡面 ZEN.refl 沒動。
- 閃退紀錄全 0 的真正原因：3D 恢復時 three.js 重建 info（數字歸零），之後 CTXL.lost 清掉，又被存成 0。加 CTXL.gone（掉過就一直記著），之後不再覆蓋；恢復後送出的紀錄也用掉之前存的。

## 第 90 批（11/21 14:20，主委閃退紀錄：小鎮 (28,−102) 走動、3.1 分）
- 紀錄這次有數字了：貼圖 329、模型 2572、三角形 155 萬、繪製 1728、著色 156——開放世界在小鎮時整座廟還在記憶體裡（之前只有山頂才收）。手機開放世界：出禪房門往小鎮走到 z<−62 就用第 86 批的「只留從外面看得到的廟」（zoneFar("f")，exteriorSet），回到 z>−56 放回來（TW.farTown，有緩衝避免來回切）。
- 模擬器（iPhone UA）：小鎮 (28,−102) 模型 1339、貼圖 131、37.7 萬三角形；從小鎮看廟外型完整（屋頂、牆、門）。

## 第 91 批（11/21 14:40，主委閃退紀錄：(29,−64) 走動、0.9 分）
- 掛在剛過 z −62 那一刻＝第 90 批開始修廟的地方：exteriorSet 在同一幀畫 34 個角度（每個角度整座廟上千次繪製＋讀回像素）太重。改成手機開放世界在廟裡就先慢慢算（exteriorJob：載入 25 秒後或走到 z<−40，每 6 幀算一個角度，約 3–4 秒算完），算好才會在小鎮修廟；算的時候還不存在／看不到的東西（ZEXT.seen 沒有）一律保留。
- 重要：模擬器的 LQ.ready 永遠是 false（缺檔 404），所以禪房門口的 zoneForget 和小鎮修廟在模擬器裡根本沒跑——第 90 批寫的模擬器數字（1339/131）不是修廟的效果。測試要先 `LQ.ready=true`。強制後：小鎮 (28,−102) 收起 1198 件、模型 548、貼圖 110；回廟正常。
- 除錯：window.MZ_ZEXT()（[ZN.off, farTown, farHi, busy, 收起數, 外面看得到, 算過的, 沒算過保留的…]）、MZ_ZEXTRUN()（一次算完）。

## 第 92 批（11/21 16:20，主委「我記得我有跟你說要讀完 確認可以才會開放進圖 那怎麼會有進圖還在讀」）
- 開放世界的禪房門口讀取畫面原本只跑固定 5 秒（「讀完才放行」只做在分三區模式）。新增 owVeil(toTown)：
  - 往小鎮：收廟裡 → （手機）算完「外面看得到的」（每幀一個角度）→ 修廟 → 蓋好站的位置 LR0 範圍內所有小鎮區塊（手機每 0.3 秒一區）→ 圖片送顯示卡（每幀 3 張）→ 連續 20 幀順暢才拿開（最多 30 秒）。
  - 回廟：放回修掉的廟 → 放回廟裡 → 圖片送顯示卡 → 20 幀順暢。
  - TW.farTown 只由讀取畫面設定（不再在街上看 z 切換）。
- 模擬器（先跑完 MZ_ZEXTRUN，LQ.ready=true）：往小鎮 收起 1248 件、蓋 9 區、讀取畫面最後才拿開；回廟正常。除錯 MZ_ZN()。
- 小鎮↔森林之間開放世界本來就是邊走邊蓋（手機每 0.4 秒一區），沒有讀取畫面。

## 第 93 批（11/21 17:50，主委「從自身附近的先讀 依距離分批讀完越來越遠的 不要一次要他讀完全部」）
- 開放世界區塊載入（TW.tick）：手機一律一次一區、最近的先蓋；近圈（LR0[0] 內）每 0.4 秒一區，遠的（山頂全景）每 0.9 秒一區，而且只在順暢時（TW.fdt 平均幀時間 ≤ 1/24 秒）才蓋。之前手機在山頂一幀蓋 3 區、不等。
- 禪房門口讀取畫面（owVeil）只等身邊 22 m 內的區塊，其他出來後照距離一區一區蓋。
- 分三區模式（zoneGo）的佇列也改成最近的先蓋。

## 第 94 批（11/21 18:10，主委閃退紀錄：廟埕 (29,−29) 走動、0.4 分、一般畫質）
- 掛的時間正好是 exteriorJob 在跑（載入 25 秒後開始），最後新增的著色又有 MeshBasic（跟 14:29 那次一樣）。手機不再畫任何東西來算外型：改成在電腦上算好「只在廟裡面的零件」清單（ZHIDE，約 1160 件、22 KB，寫在 index.html），手機比對形狀（頂點數、數量）、位置（0.2 m）、大小；對得上才收，對不上一律保留。手機上 ZEXT 一開始就是清單模式，exteriorJob 不會跑。
- 重算清單：模擬器 iPhone UA、LQ.ready=true、在廟裡跑 MZ_ZEXTRUN() 再 MZ_ZEXTDUMP()，把結果換進 `const ZHIDE=(()=>{ const t="…"`。廟的建築有改動時要重算（不重算也不會缺東西，只是少收）。
- 模擬器：往小鎮收起 1159 件、廟外型完整、沒有新的 MeshBasic 著色。

## 第 95 批（11/21 18:30，主委清單）
- 洗碗泡泡大戰（dwGame）：碗不再自己轉，拖曳碗旁邊空白處自己轉（左右轉、上下傾，ST.spin/ST.tilt；pointerdown 時點在要刷的那一面才是刷）。污漬 100% 刷完才能翻面、才能沖水（DW_CLEAN=1）；刷乾淨的那一面把淡淡的邊也清掉（uDone）；剩一點時污漬閃黃、碗上出現黃圈（hintSync/cellPos，最多 8 個），提示「還剩 N 處」。刷的筆刷改硬邊（stampH），算到的跟看到的一致。沖乾淨後整個碗發亮（uShine）＋16 顆閃光星星＋「乾乾淨淨」停 0.9 秒再滑走。測試掛鉤 __DW.stamp / rinseAll。
- 一粥七天：出菜遊戲不再出現（czGame 程式留著），店裡只剩洗碗。洗碗獎勵不變（只有鹹粥，沒有平安幣）——已列在審核表請主委決定。
- 昆蟲真實比例：BUG_CM（公分）×6，最小 6 公分；拿掉稀有放大和樹幹縮小。竹節蟲一定在樹幹或牆上（附近 30 m 找不到就這次不出）；森林、山上、softTree 的樹也登記給昆蟲爬（twTree），圓圓樹的樹幹半徑 .25×s。
- 魚：拿在手上是真實長度（size/100 m，最小 8 cm），鯊魚 1.5–3 m；鏡頭依魚長往後拉。L.hold(id,len) 可測。
- 審核文件（Claude Docs）「雲端天后宮・任務獎勵與取得方式審核表」https://claude.ai/artifact/V8NB8izKFFkMxHt8bdJbyj ：每日系統、任務、打工、採集、家具 232 件來源、飾品 44+12、未完成、太好賺/太難賺（附主委決定下拉選單）。發現：夾娃娃 29 件家具現在拿不到；扭蛋 10% 頭飾＞主委要的 3%。

## 第 96 批（11/21 20:15，主委）
- 夾娃娃：扭蛋的頭飾 10% → 3%（禮物盒本來就 3%）。
- 賣魚只在釣具行（雜貨店不收魚了）：每天最多選 10 條賣（LF().fsD），點魚選；賣出後沒選的魚阿財伯說「我們要保護生態，其他的就讓牠們回家吧！」並從背包拿掉（d.inv=[]）。舊的 sell()/全部賣掉停用。
- 第一次獎勵改在說話時：每次打開釣具行（fishFirst），背包裡第一次出現的稀有魚 500 幣＋家具（釣魚來源）、傳說 2000 幣＋家具＋扭蛋幣 2（LF().ff）。釣到當下不再送家具。
- 新 NPC 收藏家小潘（id pan，家 37,−149，森林口、博士旁邊）：收昆蟲（每天 10 隻，同樣選了賣、其他放生拿掉，LF().bsD）、化石・古物・寶石・寶物（不限）。每次打開小潘的收購（bugFirst）：第一次的稀有蟲 500＋扭蛋幣 1、傳說 2000＋扭蛋幣 3（LF().fb）。博士不再收昆蟲化石（星砂換家具留著）。
- 洗碗：2 分鐘；一個碗 50 幣（跟一粥七天共用每天 2000 上限 CZ_CAP，LF().dwP）；洗 1～19 個鹹粥 1 碗、20 個以上 2 碗；星星 10/20/30 只是好看。
- NPC 說話音效：babble 每次新的一句先把上一句的聲音 40 ms 淡掉並停止（BABL），不再疊在一起。
- 帳篷：拿掉一天一次 +40；待在帳篷裡每滿 1 分鐘 +3 精力（算在每天恢復上限 100 內），睡袋按鈕只切換躺下/起來。
- 主委 20:13：廚房遊戲不用改。

## 第 97 批（11/21 21:15，主委）
- 賣魚／賣蟲：選好按賣出會先問「賣了之後其餘的魚（昆蟲）都會馬上放生喔，確定要賣嗎？」（lfFsellGo/bugSellGo 帶 "ok" 才真的賣）。
- 小潘改成「收藏家小屋」（西側巷弄 tw:soon:收藏家小屋）的店員：點小屋＝打開小潘的收購（station 特別處理），小潘站在門口 (11.7,−86.8)。
- 洗碗加班：結束畫面玲姊說「如果你體力太旺盛…鹹粥不夠給你囉！」＋「繼續洗（一個碗 1 精力・10 元）」；加班不計時，每洗好一個扣 1 精力、+10 幣，沒鹹粥；右下「收工」或精力用完結算（ST.ot/otEnd）。
- 鎮民委託獎勵加鏟子次數 10／15／30（NQ_REW.sh）。
- 森林的路不見：pathRibbons 往東走的路三角形朝下被背面剔除（第 59 批起往東的路都看不到）→ 每個三角形翻成朝上。
- (132.6,−198.1) 河上綠條：底草的洞只開到 x 133.8，底草到 135.2，那 1.4 m 蓋在東邊小溪上 → 洞開到 135.15。
- 水：所有水同一個流動（fl 固定），顏色岸邊淺、中間深（dk 依 D 0.05→1.1 從 .12 到 .9）。
- 帳篷睡袋換主委的 MidPoly_Mummy_SleepingBag（public/sleepbag.glb，縮到 1.9 m），鑽進睡袋才每分鐘 +3。測試頁檔案已滿 511 → publish_prep 的 RIDE 讓 sleepbag 跟著 tent-model.js 一起（帳篷裡先載 tent）。
- 回覆主委：兩層樓現在只有外觀是兩層、房間比較大（7.5×6 vs 6×5），裡面沒有樓上。

## 第 98 批（11/21 21:45，主委）
- 我的家標記：改成從屋頂往上 22 m 的金色光束（漸淡、輕微呼吸），頂上一個小的🏠圖示（1.3 m，遠了最多放大到 2.2 倍）；拿掉「我的家」大字牌。
- (0.1, 53.6) 正門門廳底下還是草皮：門廳下 x ±10.8、z 53.65–57.2 鋪 pave（frontGround）。
- 釣魚：等魚上鉤時（wait/nibble/bite）鏡頭移到浮標後面 3.3 m 特寫（fishCam close），提示字移到上方、加半透明底；右下方加大的紅色「✖ 取消釣魚」。
- 今日按鈕：改成右上功能欄的圖示（📅 今日，紅點照舊），收起功能欄時一起收起。
- 照相館先不開：KEEP["tw:photo"].soon=1 → 阿光不出現、點店家／照相館說「照相館還在準備中」。

## 第 99 批（11/21 22:40，主委）
- 閃退紀錄 (26,−51) 禪房門口：廟整座（貼圖 354、模型 2688）＋門外小鎮區塊同時在記憶體。手機開放世界在廟裡（!ZN.off）不蓋 z<−50 的小鎮區塊，回廟時把它們收掉；小鎮由禪房門口的讀取畫面蓋。
- (15.6,−262.6) 水蓋在草上：西山小溪 SPATH 原本在 z −264 開始，北邊草原把它的河床拉成一條沒有水的凹槽、水面在 −265.7 直直切斷 → SPATH 往北延伸到 −302（地圖邊），northH 在 x<22 跟著挖河道；小溪自己的水面只在 −265.35 以北（以南已經有西山整片水面，兩層會變不同顏色）；底草洞的北緣 −261.3 → −262.56，不再有一條草橫在溪上。
- 博士先拿掉（NPCS 的 doc 加 off:1，不生成、不去廟裡；資料留著，存檔順序不變）。小潘移到 NPCS 最後面（NPCS 順序是存檔碼的一部分！上一批插在 doc 前面是錯的）。
- 爬山貼牆往上衝：stickSteer 側移的那一步若比現在高出 0.3×步長就不走（只限轉向／滑牆，直走照舊）。
- 爬山時預先載山頂風景：離山頂 46→16 m 之間，載入範圍從 38 m 逐步放大到 150 m（電腦 300 m），一樣一次一區、順暢才載。
- 森林沒陰影：樹下接觸陰影原本在斜坡上一律不畫（森林地面起伏，幾乎全被拿掉）→ 依地面坡度傾斜貼在地上，只有懸崖（坡度＞0.8）才不畫。
- 巨神像碰撞：walkable 先擋巨神像底座（半徑取模型寬度的 0.32，最少 1.5 m）。模擬器沒有載到巨神像模型，未實測。
- 水顏色岸邊不要太淺：dk 最小 .3。

## 第 100 批（11/22 01:40，主委）
- 兩層樓不做二樓：房間改 10×8（小屋 6×5）。房間鏡頭依房間對角線拉遠（need 用 hypot(RW,RD)/2）。
- 音樂：森林 forestsong.mp3（主委 Moonlit Spring Magic）、女神泉 springsong.mp3（Floating Fairy Sanctuary），由 m4a 轉 mp3 112k。musicTick：女神泉 (104,−183) 24 m 內（離開到 30 m 才換回）→ spring；小鎮開著、z<−144（回到 −140 才換回）、x>−20 → forest；其他照舊。換歌沿用原本約 2 秒的淡入淡出。
- 測試頁檔案上限：hats-lite.glb、weiqiangfar-lite.glb 跟完整版一模一樣 → publish_prep 不再產生它們的 -model.js，頁面 LITE_SAME 直接載完整版；空出 2 個位子給兩首歌。

## 第 101 批（11/22 02:20，主委）
- 女神泉再大一倍：BHEAD 改成 (99,−245.5) 半徑 11.5（面積約 2 倍，東邊仍到瀑布底，神社留在岸上）。小徑 WP1 終點、站點 tw:goddess (85.4,−250.2)、瞬移點、兩盞燈、岸邊石頭（改繞泉心）、可釣範圍 x>84、走路判斷 x>84 都跟著改；底草的洞在 x 94–110.8 往北開到 −261.5（泉的北邊越過 −256.3）。
- 舊 bug：goddessRise 一直在 (104,−183)（11/16 的舊泉位）升起；音樂的女神泉中心也錯 → 都改成新泉。
- 女神升起：GD_AT() 在站點往泉心 7 m 處、面向玩家；新模型（長裙＋薄紗、長髮、星冠、光環、手捧蓮花）；特效：光柱、水面光圈、擴散的漣漪、螺旋上升的光點、點光源。任務完成 slow：7.5 秒緩緩升起，GODCAM 鏡頭轉到玩家身後看女神；GOD_LINES 三句話（每句有 babble 聲）→ godGift 女神竿 →「收下」沉回水裡。每日丟硬幣照舊（2.4 秒）。
- 廚房：主委素材（public/cook/kg/：bg 廚房背景、board 砧板、knife 持刀手、carrot/cabbage/onion 與切片、stove 爐子、stew 燉鍋、flame、pan 平底鍋、egg 荷包蛋）。切菜：刀子對到任何一條沒切的線就算（不用照順序），沒對到算失誤（扣分）；切到會掉一片蔬菜切片。火候：爐子＋燉鍋＋蒸氣。翻炒：平底鍋＋蛋翻起來。#ckg z-index 95（原本 60 被房間介面蓋住，要離開房間才看得到）。L.cookTest(i) 測試用。
- 西山小溪沒水（主委「水咧???」）：第 99 批把 streamMesh 的 wclip 寫成 qz>−265.35，整條溪的水都被裁掉 → 改回 qz>−146.4（只裁河口）。
- 西山小路刪掉（主委要自己畫）：WWD 的 pathRibbons 不畫 WPS，山區不畫 WP1，WP1 路燈拿掉。地形沿路的平整還在。
- 照相館任務重做：
  - 24 張（PS_MAX；worker 與 mock 上限 50→24，存 pitch）。
  - 開頭有趣：阿光抱相簿跌出來、爺爺帽子入鏡、爺爺偷吃奶奶冰棒……（STORY 8 句）；每拍回一張阿光說一句（PH_YAY）。
  - 相簿：拍回的照片右上角小綠勾（PH_TICK）；點舊照片可「📷 帶著這張去拍」（P.sel）。
  - 相機：左上角顯示目標照片（25 m 內最近的，不然是選的那張）；判斷 5 m 內、方向差 35° 內、上下角度差 0.4 內（有存 pitch 的才比）；提示改顯示在相機畫面上（原本 toast 在 hideui 時被藏起來 → 主委「按了沒反應」）。
  - 走到未拍的點 7 m 內：「📷 這裡……好像是……照片裡的地方？」＋相機按鈕跳動（離開 14 m 才會再提示）。
  - 主委設點：測試版不用密碼（MZ_SIM），存在這台裝置；滿 24 張會說。
  - 全部拍完回照相館：阿光翻相簿 →「……謝謝你，沒想到你竟然真的收集完成了……」→ phEnding：畫面慢慢變黑、字幕（PH_END）像片尾名單往上滑、玩家拍的照片一張張淡入當背景、最後出現主委的結局圖 public/photo/ending.webp；音樂 MUS_OV="journey"（journey.mp3，等主委給檔案）。相簿有「🎞️ 再看一次」。
  - 照相館仍 soon（一般玩家說準備中），主委可以進去。
- 待做：狗狗神社 (−69.3,−238.4) 點了出現「…. 這個是狗狗?」，主委說之後再補任務。
- 女神泉特效 goddessFx(C,S)（gspring 區塊）：黃色落葉從 9 m 高處旋轉飄落到水面（Points＋葉形 shader）、金色光點在空中漂（晚上更亮）、晚上泉水從裡面發光（additive 平面，形狀照 springD，中間最亮、岸邊淡出，依 uNight）。手機數量較少。
- 女神程式在小鎮模組，讀不到 BHEAD → 自然模組設 window.MZ_GSP=BHEAD，女神用 GSP()。
- 帳篷裡人物變藍：遠處路人變暗的 crowd shader 用「玩家在外面的位置」量距離，帳篷場景裡的人在原點附近 → 被當成遠處的人染成藍紫色。帳篷 render 時把 FARCROWD.eye 暫時設成帳篷裡人物的位置（window.MZ_FARCROWD）。
- 照相館 📌 沒反應的真正原因之二：重寫時漏掉 snap()（拍照函式）→ 按快門／設點會丟錯但看不到。補回；設點失敗會在相機畫面顯示原因。
- 溫室：GD2 加 hv（收成格數，每收成一格 +1）、beds2、beds3。收成到 120 格跳「已取得第二間溫室使用資格！」、600 格「第三間」。tw:gh2／tw:gh3 不夠格數時說門鎖著（顯示目前格數），主委可直接進。gardenOpen(gi) 用 GH_KEY 選田。存檔碼 v8：版本 3 bits 用完 → 寫 0 再接 5 bits 真版本；最後加 hv(11 bits)＋beds2/beds3（同 beds 格式）。
- 一粥七天玲姊：「來不及了！你能不能來支援洗碗呢，我們能給你薪水跟鹹粥打包回去吃！」
- 晚上招牌發亮：TW.SL 的招牌材質依 uNight 調 emissive（白光、用招牌圖當 emissiveMap），沒開的店照舊不亮。
- 飲料店薪水加倍（score×2.4）；加冰塊前畫面中間大字 3-2-1 倒數（#dkCd）。
- 主委工具「任務重置」：⛲ 女神泉任務（gq、女神竿、今日已丟）、📷 照相館相簿（相機、拍過的照片，委託地點保留）、🌱 溫室收成格數。
- 昆蟲大小照人物比例：人物約 1.3 m，昆蟲用真實尺寸 ×1.3（圖的留白），最小 3.5 cm（原本 ×6，蝴蝶 66 cm）。魚拿在手上本來就是真實長度。
- 照相館片尾音樂：玖玖〈一個人的旅程〉就是街頭藝人的 busk/b07.m4a（測試頁自動變 .mp4）→ TRK_SRC.journey 指向它。

## 第 102 批（11/22 03:10，主委）
- 「拱門不見了 也看不到城鎮 變成一片草地、路上的人不能講話」：第 99 批手機在廟裡不蓋 z<−50 小鎮區塊，條件是 !ZN.off（廟還沒收起）；廟沒有被收起的時候（例如沒跑到換區）小鎮就永遠不蓋。改成只有人在廟牆內（pz>−49）才擋。
- 照相館：阿光講完受潮後多一句「……你能不能幫我去把他們去過的地方，再拍一張照片回來給我呢？」（按鈕「好啊，交給我！」），下一句才給相機。
- 主委工具「任務完成測試」：⛲ 女神泉完成（傳送到泉邊、4 秒後完成最後一步，看女神升起）、📷 照相館完成（直接阿光最後對話＋片尾）。
- 設委託地點後畫面放大、只剩搖桿能按：iPhone 點到字小於 16px 的輸入框會自動放大畫面且不縮回 → 名稱/地點輸入框 16px，viewport 加 maximum-scale=1（全遊戲的輸入框都不會再自動放大）。

## 第 103 批（11/22 03:35，主委）
- 森林、西山小路全部不畫（FPATH 三條、WPS），路燈也拿掉；地形上原本小路的平整走道還在（不然穿不過山）。天后山的螺旋山路保留。
- 上山的路：PROPOK 在天后山範圍內離螺旋路 2.8 m 內不撒道具；山坡花草離路 2.3 m（原 1.7）。
- 泉之錦鯉：售價 1800→6000，一天只能釣一隻（釣到記 LF().koiD，當天 roll 權重 0）。
- 電腦也會卡：電腦版小鎮區塊改成每 0.25 秒最多蓋一區（原本每幀一區），山頂全景照舊。
- MD.baked 寫入主委 03:30 的 MZMAP（狗狗神社一帶石頭、粉樹、燈籠、狐狸；女神泉 18 棵金色樹）。03:32 更正版取代（拿掉兩棵水裡的金色樹、加一顆石頭）。
- 更正（主委 03:34「不要把我路燈拔掉啊！」「錦鯉不用提高價格」）：森林、西山、女神谷的路燈全部恢復（只拿掉路面）；泉之錦鯉售價回 1800，仍一天一隻。

## 第 104 批（11/22 03:50，主委）
- 鎮上走動的 NPC 不能講話：NPCS 陣列結尾「小潘」那行註解後多一個逗號 → 陣列有空洞，npcTick 的 for…of 拿到 undefined 每幀丟錯（console.warn 吞掉）→ 說話按鈕從沒建立、鎮民也沒生成。拿掉逗號（第 96/99 批引入）。forEach 會跳過空洞，所以存檔碼沒壞。
- 小地圖畫主委用地圖編輯畫的路（MD.ch 的塗色格，獨立一層，3 秒檢查有沒有變）＋天后山螺旋路；舊的森林小路線不畫。window.MZ_MD、MZ_TRAILS。
- 神社燈：shrineLights(o) 在 shrineStone 之後加——前面兩座石燈籠火袋（模型 x ±1.12、y .99、z 1.28）發光方塊＋光暈、神社裡一盞小燈＋光暈；晚上更亮（sprite onBeforeRender 讀 uNight），不用真的燈（避免重編著色）。地圖編輯放的神社也有。
- MD.baked 換成主委 03:46 版（自己畫的路、神社移到女神泉中、沿路燈籠 70–81）。

## 第 105 批（11/22 04:05，主委）
- 照相館故事：對阿光來說是「爸爸媽媽的相簿」——照相館段落、阿光閒聊、書店／其他人提到的「阿光爺爺」全部改成爸爸／媽媽（相機＝爸爸的相機）。阿光閒聊的「五十張」改二十四張。
- 主委設委託地點：按 📌 先選 👫 兩人面向鏡頭／🔙 兩人背對鏡頭／👵 只剩她一個人，再拍。
- 相簿（主委）多「📤 匯出委託地點」（每個地點連舊照片，存成「委託地點-日期.txt」並複製文字）和「📥 匯入委託地點」（選檔案或貼文字，照原號碼寫回，正式站要主委密碼）。一個地點約 80 KB 文字。

## 第 106 批（11/22 04:30，主委）
- 設點姿勢多兩種：👵🔙 她一個人背對、🪑🔙 她坐著背對（臨時在 SEATS 加一個 inn sofa 座位 lift 0，更新 40 次讓她坐好，拍完拿掉）。
- 片尾背景照片改用主委設定的委託照片（有那對老夫妻的），不是玩家拍的。
- 禪房櫃台拿掉「🏠 我的房間」選項（今日功課那邊的按鈕還在）。
- 夾娃娃神秘禮物盒恢復給家具（主委 04:38「可以夾娃娃拿家具了 一樣3%」）：頭飾 3%，沒中再 3% 給一件「夾娃娃」來源的家具（ROOMX.grant("c")，29 件），其餘照舊一半 60 平安幣、一半零食。
- 8 顆星砂換星空家具改到收藏家小潘（收購單最下面「✨ 星砂」，HANDLERS.lfDustP）；家具來源說明 m 改成「流星掉下來的，或拿 8 顆星砂找收藏家小潘換」。
- 收藏家小屋改成跟其他店一樣：KEEP["tw:soon:收藏家小屋"]（小潘在店裡，櫥窗圖 collect），點小屋 → 進店、小潘說話 → 再開收購單（TW.station 原本的 lfBugCol 保留，由 keeper 流程呼叫）。NPCS 的 pan 加 off:1（門口不再站一個小潘；陣列位置不動）。

## 第 107 批（11/22 04:55，主委）
- 照相館片尾重做：字幕一段一段在中間淡入淡出（不捲動）；背景是主委設定的委託照片，每張淡入、慢慢放大、淡入下一張；每張照片只出現一次，字幕的時間依長短分配到跟照片同一段時間（總長＝max(字幕自然長度, 照片數×7 秒)），兩者都結束才出現結局合照。點一下直接跳到合照，再點回小鎮。
- 玩家走路速度 +50%（3.31→4.97；主委加速、疾走之書都以新速度為底）。
- 公車站刪掉（模型、站點、地圖清單）。

## 第 108 批（11/22 05:10，主委）
- 阿光後續對話：拿到相機後再進照相館，阿光先說「你都拍完了嗎？還沒啊？再繼續加油喔！」（看相簿／好，我會加油！）；看完片尾（P.end）後再進去說「謝謝你的幫忙，下次需要幫忙再跟你說！」（看相簿／不客氣！）。全部拍完但還沒看片尾時照舊進 phFinal。
- 照相館任務獎勵（查的結果，沒改）：每拍回一張 200 平安幣＋1 枚扭蛋幣（24 張共 4800 平安幣＋24 扭蛋幣）；全部完成、看完片尾沒有另外的獎勵。
- 片尾照片銜接跳黑：① 照片還沒解碼就開始淡入 → 先全部載入解碼再開始；② 照片本身只開到 .55 透明度、上一張在新的一張完全蓋上前就開始淡出 → 兩張疊在一起時亮度掉一截像閃黑。現在照片 opacity 1、變暗用固定一層 .dim（.45 黑）＋原本的暗角；新照片在上面完全淡入（2.6 s）後才把舊的瞬間拿掉；最後合照淡入 4 s 後才收照片。
