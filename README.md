# 艾米老师 · 英语口语私教（网页语音版）

一个让孩子**用麦克风开口说、老师用英语念出来**的练口语网页。完全在您自己电脑上运行，语音识别/朗读免费（浏览器自带），只需接一个便宜的 AI 模型 Key。

## 怎么用（三步）

### 1. 启动网页
双击 `start.bat`（会弹出一个黑窗口，别关）。
然后用 **Chrome 或 Edge** 浏览器打开： http://localhost:8787

### 2. 填一次 API Key（老师的大脑）
第一次打开会提示填 Key。推荐 **DeepSeek**（很便宜，几分钱能聊很久）：
- 打开 https://platform.deepseek.com 注册
- 充值几块钱（首次一般有赠送）
- 在「API Keys」里创建一个 Key，复制那一串 `sk-...`
- 粘到网页右上角 ⚙️ 设置里的 API Key 框，点保存
- 之后就记住了，不用再填

### 3. 让孩子开口
- 点中间的大 **🎤 麦克风**按钮，孩子对着说话（说完再点一下停）
- 老师会用**英语回答，并大声念出来**
- 说错了老师会先用中文讲、再给正确英语、接着聊，不会打击孩子
- 上方可切换「识别语言：中文 / 英语」（孩子弱就先用中文，慢慢切英语）

## 小提示
- 必须联网，且用 Chrome / Edge（语音识别只在这俩浏览器好用）。
- 麦克风第一次用会弹"允许使用麦克风"，点允许。
- 想换模型/Key，随时点右上角 ⚙️。
- 黑窗口（服务）关掉，网页就停了；再双击 start.bat 即可。

## 文件说明（不用改）
- `index.html` — 网页界面（麦克风 + 朗读）
- `server.js` — 本地小服务，负责把话传给 AI 老师
- `tutor-prompt.txt` — 艾米老师的教学人设
- `config.json` — 保存 Key 和模型（自动生成/更新，**本地用，已 gitignore，绝不部署**）
- `start.bat` — 一键启动
- `functions/` — Cloudflare Pages 用的无服务器后端（部署版才用）

---

## 部署到 Cloudflare Pages（免费、可分享链接、孩子无需填 Key）

部署后，AI 老师由 Cloudflare 后台驱动（Workers AI），**孩子打开网页就能直接聊，不用填任何 Key**。

### 准备工作（一次性）
1. 有 Cloudflare 账号（免费注册）。
2. 拿到两个值（你 `config.json` 里已经有了，但部署时**不要**把 config.json 传上去）：
   - **Account ID**：Cloudflare 右下角「账户 ID」，或 Workers AI 页面「Use REST API」里能看到。
   - **API Token**：Workers AI 页面 → Use REST API → 创建「Workers AI API Token」（权限含 Workers AI 读写）。

### 方式 A：命令行部署（推荐，最安全）
1. 装 wrangler：`npm install -g wrangler`（或 `npx wrangler`）。
2. 登录：`wrangler login`。
3. 在本项目目录执行：
   ```
   wrangler pages deploy .
   ```
   （`config.json` 已被 `.gitignore` 排除，不会被传上去。）
4. 部署完成后，到 Cloudflare 控制台 → 你的 Pages 项目 → **Settings → Environment variables（Variables）**，添加两个**变量/密钥**：
   - `CLOUDFLARE_ACCOUNT_ID` = 你的 Account ID
   - `CLOUDFLARE_API_TOKEN` = 你的 Worker AI Token
   （建议设为「Encrypt」/密钥类型，避免明文显示。）
5. 重新部署一次（改了变量要触发一次构建），打开给你的 `*.pages.dev` 链接即可。

### 方式 B：连 Git 部署（也不错）
1. 把这个目录推到 GitHub/GitLab 仓库（`.gitignore` 已排除 `config.json`）。
2. Cloudflare 控制台 → Workers & Pages → Create → **Connect to Git**，选仓库。
3. Build command 留空，Build output directory 填 `.`（点号）。
4. 同样去 Settings → Environment variables 添加上面两个变量，重新部署。

### ⚠️ 重要安全提醒
- **千万不要**用 Cloudflare 后台的「拖拽上传整个文件夹」来部署根目录——那样会把 `config.json`（里面有你的真实 Token）一起公开，`/config.json` 谁都能下载，Token 就泄露了。请用上面的命令行或 Git 方式（它们会遵守 `.gitignore`）。
- 如果你怀疑 Token 已经泄露，去 Cloudflare「My Profile → API Tokens」把它删掉重建一个。
- 默认模型是 `@cf/meta/llama-4-scout-17b-16e-instruct`（当前可用、回复亲切）。想换：编辑 `functions/api/chat.js` 里的 `model` 字段，例如换成 `@cf/mistralai/mistral-small-3.1-24b-instruct` 等其他 Workers AI 模型。
- ⚠️ Workers AI 的模型会不定期下线（比如旧的 `llama-3.1-8b-instruct` 已于 2026-05-30 停用，会报 410）。若遇到 410/400 报错，去 Cloudflare 模型目录换一个在线的即可。

### 部署后体验
- 孩子打开链接 → 老师自动打招呼 → 点麦克风开口说 → 老师用英语回答并念出来。
- 界面右上角的 ⚙️ 设置会自动隐藏（部署版不用填 Key）。
- 语音识别和朗读仍是浏览器免费自带，与本地版完全一致。
