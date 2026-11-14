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
