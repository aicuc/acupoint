# 观穴 · 3D 人体穴位图谱

交互式三维穴位学习网页，使用原生 HTML、CSS、JavaScript 和 Three.js。

## 功能

- 152 个三维示意穴位与十四经 361 穴名称索引
- 25 个重点穴位金色大圆点
- 三维旋转、缩放、经脉和部位筛选、拼音搜索
- 合谷、内关、足三里、迎香的动态部位关联线

## 本地运行

安装 Python 3 后在项目目录执行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Windows 可将 `python3` 换成 `py`。浏览器打开 http://127.0.0.1:8000 。不要直接双击 HTML 文件，ES 模块需要 HTTP 服务。

无需 npm 安装或编译，依赖随项目提供。

## GitHub Pages

在 Settings → Pages 中，Source 选择 Deploy from a branch，Branch 选择 main，目录选择 /docs，点击 Save。

发布成功后的预期地址：https://aicuc.github.io/acupoint/ （开启 Pages 并完成构建后才能访问）。

## 目录

`docs/index.html` 为页面，`app.js` 为交互与三维人体，`points.js` 为三维点位，`catalog.js` 为名称索引，`effects.js` 为动态关联线及来源，`style.css` 为样式。

## 说明

模型、穴位坐标和连线均为学习示意，不用于针刺定位或诊疗，也不代表真实生理通路或确定疗效。资料来源见网页及 effects.js。Three.js 许可见 docs/THREE-LICENSE.txt。
