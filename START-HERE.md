# 雲端天后宮：換帳號懶人包（2026-11-06 16:10）

> 給新帳號的 Claude：**先把這份讀完**，再讀 `HANDOFF.md`（完整技術細節與每批修改紀錄）。
> 讀完後回覆主委時，先用三五句話說你掌握到的進度，再開始做事。

---

## 一、主委（使用者）的規則：每一條都要遵守

1. **繁體中文、白話**回覆。進度說明、摘要也都用中文。
2. **所有修改先放「單機測試版」**給主委看；主委說「**部署**」才推上正式版（`main`）。
3. **不要重新設計主委給的美術和模型**（可以減面、上色、調位置，不能改造型）。
4. 改到畫面的東西，要附**改前／改後截圖**；燈光**不可以閃爍**。
5. **不要寫出任何密碼**。主委密碼在 Cloudflare Secrets Store（`ADMIN_KEY`／`mazu_admin_key`）。
6. 隱藏服裝代碼不能用明碼出現在任何地方。
7. **不可以花到主委的錢**（只用 Cloudflare 免費額度）。
8. 每一批改完都要：**commit + push 到 `audio-fix`**、在 `HANDOFF.md` 最後加一條紀錄、重新發佈測試頁、用中文逐項回報。
9. 主委每次新增飾品，**主委自己要自動擁有一份**（已做成程式：`me.sp` 時 `accState()` 擁有全部 `ACC`）。

## 二、程式在哪

| 項目 | 內容 |
|---|---|
| 倉庫 | GitHub `ii336699/mazu-temple` |
| 開發分支 | **`audio-fix`**，最新 commit `3779115`（11/06 16:10，含這份懶人包） |
| 正式版 | `main`（目前是 `01a4d5a`，**很多天沒部署**，audio-fix 領先很多） |
| 遊戲本體 | `public/index.html`（單一檔案，three.js r128） |
| 伺服器 | `src/worker.js`（Cloudflare Worker + Durable Objects：Hall／Lobby） |
| 正式網址 | `mazu-temple.harper88888.workers.dev` |

**部署（只有主委說「部署」時）**：
`git fetch origin main && git merge-base --is-ancestor origin/main audio-fix && git push origin audio-fix:main`
→ Cloudflare 會自動部署。這次部署會包含 worker 的新功能（定時活動用的 Durable Object alarm），部署後要確認 `/schedule` 正常。

## 三、測試頁

- 舊帳號的測試頁（artifact）是私人的，**新帳號要自己重新發佈一個**。
- 建置與發佈：
  1. `MZ_WORK=~/mz-work python3 tools/test/build_test.py` → 產生 `~/mz-work/test/index.html`
  2. 把下列檔案從 `public/` 複製到 `~/mz-work/test/`：`zs-*.webp gy-*.webp dl-bg.webp acc-icons.webp hat-icons.webp music.mp3 rearsong.mp3 fwsong.mp3 fw1.mp3 fw2.mp3 fw3.mp3 fw-gods.json statue.glb statue-lite.glb hats.glb hats-lite.glb`
  3. `python3 tools/test/make_model_js.py ~/mz-work/test`（測試頁不能讀 .glb，要轉成 `名稱-model.js`）
  4. 用 Artifact 發佈 `~/mz-work/test/index.html`，`root` 設成 `~/mz-work/test`；**新增的檔案要放進 `files`**（.m4a 不能用，所以歌都轉成 mp3）。
- **本機自動測試（新）**：`tools/test/sim/`
  - `python3 tools/test/sim/mkrun.py` → 在 `~/mz-sim/` 建一份可離線跑的遊戲（含 three.js 函式庫、假伺服器 mock.js）
  - `python3 tools/test/sim/run.py tools/test/sim/examples/t_s3.py 40 n` → 無頭瀏覽器跑腳本、截圖存在 `~/mz-sim/shots/`
  - 想做改前改後：先 `git stash`，`mkrun.py before.html`，`git stash pop`，再 `mkrun.py`，然後 `run.py 腳本 40 參數 before.html`
  - 無頭瀏覽器約 1 fps、計時器會延遲；煙火測試要手動推進 `fwUpdate`（看 `examples/t_s3.py`）。模型載入很慢，可用 `loadRaw0("hats",false,m=>{SHARED.hats={m,q:[]}},()=>{})` 直接載。
- 模型工具：`tools/test/sim/models/`（`repack.py`：gltfpack 後把貼圖縮小重包成 glb；`split.py`：把一個 glb 依連通塊切成多個命名節點；`render.html`：模型去背截圖做道具圖示）。gltfpack 的 `-tl` 不能用（沒有 basisu），所以用 `repack.py` 縮貼圖。

## 四、11/04～11/06 做了什麼（都在 audio-fix、測試頁 Version 55，**都還沒部署**）

**參拜**
- 參拜指引第 14 爐加上**虎爺**（地藏王之後）；清香一份 14 支。
- **⚡ 一鍵參拜**：自動請香、走完 14 爐（參拜、插香、平安符過爐）、收供品、燒金紙；再按一次或推搖桿可停止。

**飾品**
- **月老紅線**變成飾品（手腕欄位，可和手持物一起戴）：手腕紅繩 + 一顆會發光、會呼吸的愛心。
- **十個頭飾**（主委給的模型拆成十頂，`hats.glb`；圖示 `hat-icons.webp`）：金鳳冠、瓜皮帽、竹斗笠、桃花髮箍、鈴鐺貓耳、虎頭帽、月亮巫師帽、茉莉花環、福氣帽、狐狸面具。位置已調到戴在頭上。存檔代碼支援超過 15 個飾品。
- 星星法杖改成直立握在下段；小幽靈繞著主人飛；背包點道具，說明和穿脫按鈕直接在那排下面展開。
- **待主委決定**：十個頭飾要怎麼讓玩家取得（目前只有主委送禮能給）。

**場景**
- 媽祖巨像換成主委的新模型（一般 13 萬面／省電 6.6 萬面）。
- 地圖邊界改成程式畫的白色石欄杆（兩側、後方、前方大門兩側）。
- 廟埕磁磚改回正式版那種暖橘陶土色。
- 天燈集體施放時排成一條斜斜的「銀河」光帶。
- 偏殿八卦窗縮小下移；哄寶寶遊戲走到正殿後面就預先下載圖。
- 建築模式新增**櫻花樹**，每棵依編號隨機長得不一樣。

**煙火（大改很多次，主委最在意）**
- 火花改成「圓點 + 漸淡尾巴」的畫法（不再是方塊），遠處有最小尺寸、小火花中心更亮，避免糊和過曝。
- 看煙火用**兩指縮放**（取代廣角／標準按鈕）；看煙火視角有「🚪 退出看煙火」。
- 種類：四色變色、彩千輪（大、對比色、持久）、銀柳（加倍）、巨型四種（含變色、雙層、垂柳；中間白圈款已移除）、超巨大八連彩千輪、掃射扇、**噴射扇形**（持續噴、上下不同色）、風火輪（一排四個、對稱、不連續）、湖面倒影已修好。
- 圓圈煙火、笑臉、七彩煙霧都刪了。音效每聲音高不同。天空放煙火時更暗。
- 神明煙火升空加快、提早出場；**眾神場最後 13 位神明分三批排成一列**，旁邊與下方有點綴不擋神明。

**定時活動（新功能，要部署才會在正式版自動執行）**
- 主委工具「⏰ 定時活動」：設定時間（可每天）自動放某一場煙火、夜市開張／收攤。
- 伺服器：Lobby 的 `/schedule`（要主委密碼）+ Durable Object `alarm()`。

## 五、還沒做／等主委回覆

- 部署（等主委說「部署」）。
- 十個頭飾的取得方式。
- 宣傳影片重錄（之前中斷，主委還沒再提）。
- 主委在問接案報價（別人想請他做宮廟）：我給過的建議是套版約 8～15 萬、客製 25～60 萬、全功能 60 萬以上，另收月費 3,000～15,000，金流另計；授權不賣斷、分期付款、寫明修改次數。

## 六、常踩的坑（詳見 HANDOFF.md 第 4 節）

- index.html 很多行很長，**不要用 `//` 行尾註解**，一律 `/* */`；改完用 node 檢查語法（`mkrun` 後用 `new Function` 逐段檢查 script）。
- 用 Python `str.replace` 改程式時先確認目標字串只出現一次。
- `const` 宣告的順序：上面的程式在載入時就用到下面才宣告的常數會整頁掛掉（例如 `HAT_IC` 那次）。
- 測試頁發佈：舊檔名不會自動更新，**改過的模型 js 也要放進 `files`**。
