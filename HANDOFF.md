# 雲端天后宮：交接說明（2026-11-04）

給接手的帳號：先讀完這份，再動程式。

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

## 5. 目前狀態（測試版第 92 版，都還沒部署）

最近完成：主委配置寫入、櫻花許願樹、石獅／石欄圍牆／八角花窗（花窗會自動把後面的牆挖洞）、外牆一律紅磚（朝室內維持素面）、一爐一支香、側殿一進後埕就亮燈、贊助看板改 WebP、主委移動速度倍率、效能面板。

效能優化（主委給的完整需求清單在對話中，重點如下）：

- ✅ 效能基準與效能面板（設定 → 流暢度 → 效能面板）
- ✅ 畫質分級＋動態解析度（`DRES`、`dprLadder()`、`dresTick()`；先降解析度，到底才減假香客）
- ✅ 燈光池：所有固定點光源變成「虛擬燈」（`plight()` → `VLIGHTS`），真正發光的只有 `poolSize()` 盞（標準 4／高 6／省電 3／低配 2），依重要度＋30% 保留優勢挑選，換燈淡出淡入。夜晚廟埕燈光 17 → 6 盞；模擬器同畫面繪製時間約少三成。
- ⬜ **下一步：人物合批**。繪製次數約 77% 來自人物（廟埕約 1300 次中 1043 次）。每個人已用 `bakeAvatar()` 依骨頭合成約 10 塊；計畫把這 10 塊合成 1 個 SkinnedMesh，用原本的 hips/torso/head/legs/arms 物件當骨頭，動作完全不變。預估人物繪製從約 1000 次降到 100～200 次。要先給主委看數字＋走路錄影。
- ⬜ 鏡頭外的人停止動作計算、遠處降頻（動作降頻和位置平滑要分開）。
- ⬜ 神像遠近分級（媽祖完整版 22 萬面、千里眼順風耳各 5.8 萬…）；手機預設用輕量版。
- ⬜ 載入排程與預熱、長時間記憶體檢查。
- 不適用：陰影、雨、濕地、地面倒影、後製（遊戲沒有這些，不要自己加）。

其他待主委決定：屋頂那幾盞小投射燈要不要拿掉；三個新模型的顏色是否滿意；預下載（讓模型存在手機）是否要做（第一次進廟約 26 MB）。
