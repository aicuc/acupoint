# Contributing to GuanXue (观穴)

欢迎参与 **观穴 (GuanXue)** 开源项目的贡献！无论是完善三维穴位空间坐标、扩充传统主治关联文献、优化 GLSL 着色器表现，还是改进跨端 UI/UX，都非常感谢你的参与。

---

## 🛠️ 本地开发环境 · Local Setup

本项目坚持 **零构建、零外部运行依赖**（Pure Vanilla ES Modules + Three.js r170）：

```bash
git clone https://github.com/aicuc/3d-acupoint-atlas.git
cd 3d-acupoint-atlas

# 方式一：使用项目自带 Node 开发服务器（默认 http://127.0.0.1:4173）
npm start

# 方式二：任意静态 HTTP 服务器（例如 Python 3）
python3 -m http.server 4173 --bind 127.0.0.1
```

提交代码前，请运行完整性与数据测试：

```bash
npm run check   # 校验 index.html 资源引用、相对 ESM 导入与 JS 语法
npm test        # 运行 node:test 数据集与三维投影单元测试
```

---

## 📁 模块分工 · Codebase Guide

| 目录 / 文件 | 职责说明 |
| --- | --- |
| `index.html` | 根入口页面、importmap 映射与整体语义化 DOM 布局 |
| `src/main.js` | Three.js 舞台、GLSL 着色器材质、子午流注罗盘、经络光路与交互主控 |
| `src/scene/effects.js` | 149 组循经主治流光弧线、自定义流光着色器与靶区脉冲光环 |
| `src/scene/human-model.js` | CC0 人体三维网格数据解码与体表最近点投射 (`nearestSurface`) |
| `src/data/catalog.js` | 十四经脉元信息与 361 正经穴完整标准编号目录 |
| `src/data/points.js` | 152 个三维空间穴位坐标、体表标志描述与特写视角 |
| `src/styles/main.css` | 东方墨青鎏金主题样式、SVG 引线与多端响应式适配 |
| `tests/atlas.test.mjs` | 基于 `node:test` 的经穴目录、坐标边界与网格投射单元测试 |

---

## 📌 提交规范 · Pull Request Guidelines

1. 遵循 `.editorconfig`（2 空格缩进、UTF-8、LF）。
2. 新增或修改穴位坐标 / 主治关联时，请注明参考来源，并保证 `npm run check` 与 `npm test` 全部通过。
3. 本项目仅用于传统文化科普与可视化研究，不用于临床医疗指导，请在描述中避免绝对化临床疗效表述。
