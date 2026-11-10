# Songzhijie Space

干净的可运行源码交付。以在线第59版为基础，纳入后续33张高清替换版本；另已加入本次JOC倒数第二张插图，以及CG／美术指导模块首位的「MLBB-26y 朋友节-CG美术指导」（4张原图、1段1440p视频），中文原文保留。

## 内容

- `src/`：实际入口所需的代码，无旧Phaser场景、开发测试或生成历史。
- `public/`：当前使用的掌机、星空、小狗、字体和联系二维码。
- `media/`：当前作品原图、网页预览、缩略图、视频和完整简历PDF。后续提供高清原件的图片直接保留最新JPG/PNG，不再使用早期低清图作原图。
- `media-manifest.json`：交付媒体的SHA-256校验表。

不包含Git历史、原平台托管配置和项目ID、凭据、node_modules、dist、缓存、日志、截图、旧版素材和原Word文档。

## 本地运行

使用Node.js 22。

```sh
npm ci
npm run dev
```

本地开发直接从`/media/`读取完整素材。`npm run build`构建；未配置媒体域名时会同时复制全部素材到dist/media，因此可离线预览，但该完整目录含大视频，不能直接上传Cloudflare Pages。

## 自行上传GitHub

**不要直接网页拖拽上传整个包**：新增视频约349MB，超过Git普通文件100MiB限制；GitHub网页单文件也仅支持25MiB。

仓库已配置`.gitattributes`，整个media目录使用Git LFS。先安装Git LFS（GitHub Desktop自带LFS，但仍需在新仓库执行一次`git lfs install`）。在本文件夹内运行：

```sh
git init -b main
git lfs install
git add .
git commit -m "Initial portfolio source and HD media"
```

随后用GitHub Desktop添加本地仓库并Publish，或按GitHub新建仓库给出的命令设置origin并push。不要把ZIP文件本身作为网站源码上传。LFS使用受你账号额度与计费规则约束。

官方说明：https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github

## 部署Cloudflare Pages＋R2

1. 把`media/`里面的`assets/`文件夹上传到R2桶根目录，保持目录结构；不要额外套一层media目录。原图和视频可以直接存放，不受Pages的25MiB限制。349MB视频使用S3兼容工具分段上传，不要使用有315MB限制的Wrangler单文件上传命令。
2. 给R2绑定公开素材域名，例如`https://media.example.com`。只公开用于网站的该素材目录。
3. 在Pages设置环境变量`VITE_MEDIA_BASE_URL=https://media.example.com`，末尾无需斜线。
4. 构建命令`npm run build`，输出目录`dist`，Node版本22。

配置媒体域名后，构建结果只包含网页与轻量UI资源，作品图片、视频及PDF从R2读取。不要将LFS指针文件当作媒体上传到R2；本交付包中的media文件均是完整二进制文件。

迁移时网页的作品布局、像素界面、探索状态、低音量淡入和手机适配沿用完成版。没有创建GitHub仓库、上传R2或修改线上站点。
