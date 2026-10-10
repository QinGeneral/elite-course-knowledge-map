# 精英日课知识地图

22个领域、785个概念，与616篇课程文章对应。网站提供概念搜索、领域筛选、课程全文弹窗、领域脑图、原图核对和 Markdown 下载。

## 网站文件

静态网站位于 `docs/`，无后端或构建依赖。全部链接采用相对路径，可部署到 GitHub Pages 的项目子目录。

- `docs/articles/`：616篇文章的 HTML 和 Markdown 副本。
- `docs/corrected/`：22份修订后的领域 Markdown。
- `docs/original-markdown/`：22份原始领域转录。
- `docs/photos/`：23张地图照片。
- `docs/evidence/`：核对用照片局部。
- `docs/data.json`：概念、文章及核对数据。
- `docs/ui/fonts/`：手写字体及 OFL 许可。

课程配图使用原有 CDN 链接，需要联网加载。地图照片和字体随网站保存。

## 本地预览

```sh
python3 -m http.server 8878 --directory docs
```

打开 http://localhost:8878/ 。

## 发布

GitHub Pages 的发布来源选择 `main` 分支的 `/docs` 目录。`docs/.nojekyll` 保证 HTML、Markdown 和其他静态文件按原样发布。

## 数据说明

字号根据原照片估算，手写字形对照照片确认；字号不作为官方重要性评分。核对范围和待核条目见 `docs/核对报告.md`。

课程文章和照片的权利归原权利人。本仓库不为这些素材授予新的许可证。字体的许可见 `docs/ui/fonts/OFL.txt`。
