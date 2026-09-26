# iMOBI Lab website

Intelligent MOBIle Systems Laboratory, Department of Electrical and Computer Engineering, The University of Texas at Tyler.

## 改什么内容，找哪个文件

| 要修改的内容 | 文件 | 格式 |
| --- | --- | --- |
| 简介、照片、链接、奖项、服务、课程、招生卡片 | `content/people.md` | Markdown |
| 招生信息 | `content/join.md` | Markdown |
| 论文列表、首页精选论文 | `content/publications.bib` | BibTeX |
| 首页文字 | `index.html` | HTML |
| 研究方向 | `research.html` | HTML |
| 专利、论文筛选按钮 | `publications.html` | HTML |
| 导航、邮箱、办公室、地址 | `assets/site.js` | 文件内有注释 |
| 颜色、字体、排版 | `assets/style.css` | CSS |
| 照片、研究配图 | 放入 `images/` | |
| 简历 PDF | 放入 `files/`（例如 `files/cv.pdf`） | |

`assets/content.js`、`assets/publications.js`、`assets/vendor/` 负责读取和显示内容，一般不需要修改。

## Markdown 文件怎么写（content/*.md）

- 文件顶部两条 `---` 之间是固定信息，格式为 `名称: 内容`，例如 `scholar: https://scholar.google.com/...`
- 每个 `## 标题` 是页面上的一个区块。People 页的区块标题请不要改动；Join Us 页可以增删卡片。
- 列表用 `- ` 开头；加粗用 `**文字**`；链接用 `[文字](网址)`。

## 新增论文（content/publications.bib）

1. 从 Google Scholar、IEEE Xplore 或 ACM DL 复制论文的 BibTeX，粘贴到文件中；
2. 加上 `keywords = {net, ai}` 标明研究方向（net / edge / ai / cps）；
3. 如需在首页显示，加上 `featured = {1}`（数字为排序）；
4. 可选：`doi`、`url`、`pdf`、`code`、`note`。

## 新增页面（例如 Projects）

1. 复制 `join.html` 改名为 `projects.html`，再新建 `content/projects.md`；
2. 修改 `<title>`、`<body data-page="projects">` 和 `<main data-content="content/projects.md">`；
3. 在 `assets/site.js` 的 `NAV` 列表里加一行 `["projects.html","Projects","projects"]`。

## 预览

- **推荐：** 直接在 GitHub 网页上修改文件，保存后约 1 分钟刷新网站即可看到效果。
- **本地预览：** 浏览器不允许直接双击打开的网页读取 `.md` 和 `.bib` 文件，所以 People、Join Us、Publications 和首页精选论文会显示提示信息。在网站文件夹中运行 `python -m http.server`，再打开 `http://localhost:8000` 即可正常预览。
