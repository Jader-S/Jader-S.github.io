# Optional：GitHub 注册 · 提交 · 上线（按需）

**仅在用户明确需要时执行。** 本地 `npm run dev` 能预览即可结束主流程；上线是加分项。

若用户说「先不部署 / 只要本地」，跳过本文件全部步骤。

---

## 0) 再确认一次

问清：

1. 是否要注册 / 使用 GitHub？
2. 是否要把代码推到**自己的仓库**？
3. 是否要免费上线？默认推荐 **GitHub Pages**（本模板已带 Actions）；也可选 Vercel。

没有 Git / 账号时，用通俗语言带做，一步一步等用户确认。

---

## 1) 注册 GitHub（没有账号时）

1. 打开 <https://github.com/signup>
2. 用邮箱注册，完成验证
3. 记住用户名，例如 `your-name`（后面仓库地址会用到）

可选：安装 [GitHub Desktop](https://desktop.github.com/)（图形界面），或继续用命令行 Git。

本机检查：

```bash
git --version
gh --version   # 可选：GitHub CLI
```

未安装 Git：macOS 可装 Xcode Command Line Tools / 用 Homebrew；Windows 用 [Git for Windows](https://git-scm.com/download/win)。

---

## 2) 创建自己的空仓库

1. 登录后点 **New repository**
2. Repository name 建议：`portfolio`（或任意名；影响 Pages 路径）
3. **不要**勾选 Add README（本地已有项目）
4. 创建后复制仓库地址，例如：
   - `https://github.com/your-name/portfolio.git`
   - 或 `git@github.com:your-name/portfolio.git`

---

## 3) 把本地项目绑到自己的远程

在项目根目录（已按 Skill 改过风格与内容之后）：

```bash
# 若还指向模板作者远程，改为自己的仓库
git remote -v
git remote remove origin    # 若 origin 仍是 Luzhaotian/portfolio
git remote add origin https://github.com/your-name/portfolio.git

git status
git add .
git commit -m "feat: 基于模板初始化个人作品集"
git branch -M main
git push -u origin main
```

说明：

- 首次 `push` 可能要求登录（浏览器 / PAT / SSH）
- 提交信息可用中文：`feat: …` / `docs: …`
- **不要**把用户的私钥、token 写进仓库或聊天记录长期保存

若用户坚持保留模板 `origin`，可增加：

```bash
git remote rename origin upstream
git remote add origin https://github.com/your-name/portfolio.git
```

---

## 4) 部署到 GitHub Pages（推荐，与模板一致）

模板已含 `.github/workflows/deploy.yml`：推送 `main` 即构建静态站。

### 4.1 打开 Pages

1. 仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 推送 `main` 或手动跑 **Actions → Deploy to GitHub Pages → Run workflow**

### 4.2 访问地址

默认类似：

`https://your-name.github.io/portfolio/`

（仓库名不是 `portfolio` 时，路径段换成仓库名。）

构建使用 `GITHUB_PAGES=true`，`basePath` 为 `/<仓库名>`。若改了仓库名，确认 `lib/site.ts` / 文档与实际仓库名一致（本模板通常按 repo 名推导）。

### 4.3 常见问题

| 现象         | 处理                                                          |
| ------------ | ------------------------------------------------------------- |
| Actions 失败 | 打开 Actions 日志；本地先 `GITHUB_PAGES=true npm run build`   |
| 页面 404     | 等 1～2 分钟；确认 Source 为 GitHub Actions；路径是否带仓库名 |
| 静态资源 404 | 确认 Pages 构建带了 `GITHUB_PAGES=true`                       |
| 博客抓取失败 | `fetch:blogs` 在 CI 里 `continue-on-error`，不阻断部署        |

本地模拟 Pages 构建：

```bash
npm run preview
```

---

## 5) 备选：Vercel（可选）

适合想要自定义域名、或不用 `basePath` 的用户：

1. 注册 <https://vercel.com>，用 GitHub 登录
2. Import 自己的 `portfolio` 仓库
3. Framework Preset：Next.js；**不要**设 `GITHUB_PAGES=true`（用完整 Next 运行时或按 Vercel 默认）
4. Deploy 后获得 `*.vercel.app` 链接

若同时保留 GitHub Pages 与 Vercel，向用户说明两套 URL，避免搞混。

---

## 6) 上线后建议改的内容

- `site-content.yaml` / i18n 里的 GitHub、博客链接改成用户自己的
- 仓库 **About** 填主页 URL
- README 可改成用户自己的简介（可选）

---

## Agent 执行清单（仅当用户需要上线）

- [ ] 确认用户要 GitHub + 推送 + 部署
- [ ] 协助注册 / 安装 Git（若需要）
- [ ] 创建用户空仓库并设置 `origin`
- [ ] 提交并 `push` 到 `main`
- [ ] 指导 Settings → Pages → GitHub Actions
- [ ] 告知线上 URL，并协助排查首次部署问题
- [ ] 未要求上线则**不要**强迫完成以上步骤
