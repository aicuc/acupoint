<div align="center">

# 观穴 · 3D 东方人体经络穴位图谱
### GuanXue — Interactive 3D Oriental Human Acupoint & Meridian Atlas

[![Live Demo](https://img.shields.io/badge/🌐_在线交互预览-Live_Demo-2dd4bf?style=for-the-badge)](https://aicuc.github.io/3d-acupoint-atlas/)
[![Three.js](https://img.shields.io/badge/Three.js-r170_WebGL-f5cc7e?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/aicuc/3d-acupoint-atlas/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/aicuc/3d-acupoint-atlas/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-38bdf8?style=for-the-badge)](LICENSE)

**融合传统中医《内景图》《天圣针灸铜人》美学与现代 WebGL 三维数字解剖的可视化开源图谱**  
*A modular, zero-build, zero-runtime-dependency 3D interactive atlas of Traditional Chinese Medicine (TCM) meridians and acupoints, built with Vanilla ES Modules & Three.js r170.*

[**👉 点击进入在线 3D 交互图谱 (Live Demo)**](https://aicuc.github.io/3d-acupoint-atlas/) · [**🌟 觉得有用请点右上角 Star 支持！**](https://github.com/aicuc/3d-acupoint-atlas)

</div>

---

## 📸 预览截图 · Preview

![观穴 3D 东方人体经络穴位图谱预览](assets/preview.png)

---

## ✨ 核心特性 · Features

- 🏺 **四维博物级 3D 着色器材质一键切换（4 Custom GLSL Sculptural Shaders）**
  - **琉璃青玉（Celadon Jade）**：球面渐变摄影棚光影 + 东方青玉质感 + 次表面菲涅尔边缘微光，令穴位与经脉流光通透浮现。
  - **天圣铜人（Imperial Bronze）**：致敬北宋《天圣针灸铜人》，古铜金属光泽配青铜绿包浆高光。
  - **玄冥透影（X-Ray Meridian）**：半透明深空透视质感，凸显人体内部经络立体拓扑。
  - **汉白素雕（Ivory Sculpture）**：温润素雕材质与体表经纬等高线，适合清晰研习体表解剖标志。
- 🧭 **十二地支子午流注罗盘底座（Ziwu Liuzhu Celestial Compass）**
  - 足底十二地支 × 十二正经双环动态罗盘，顶部状态胶囊根据当前系统时间**自动计算并高亮当令时辰与值班经脉**（点击直达当令经脉）。
- 🌟 **曲面贴合经脉、以光代针与动态关联流光（Surface-Hugging Meridians & Qi Flow）**
  - **152 个三维空间穴位点** + **十四经脉 361 穴完整标准目录索引**（含国际标准编码、汉语拼音、五行属性、特定穴印章与同经循行链）。
  - 选中穴位自动沿体表法线立起**发光金针与双层呼吸准星**，并通过 SVG 折线引线智能避让排版左右双栏标注。
  - **149 组传统主治区域三维流光弧线**：支持合谷、内关、足三里、风池、中脘、委中、列缺、太冲等穴位至对应靶区的自定义 GLSL 金青脉冲光束演示。
- 🎥 **流畅镜头运镜与快捷操作（Cinematic Camera & Keyboard Shortcuts）**
  - 预设 **正面 / 侧面 / 背面 / 头颈 / 手腕 / 足踝** 六大解剖特写机位，支持 `/` 快速搜索（拼音/穴名/编码如 `LI4`、`ST36`、`hegu`）、`←` / `→` 沿同经上下循行、`Escape` 重置视角，以及 `⛶ 沉浸探索` 全屏模式。
- ⚡ **标准模块化代码库 & 零构建运行（Standard ESM Architecture, Zero Build）**
  - 纯原生 ES Modules 组织于 `src/data/`、`src/scene/`、`src/styles/`、`src/vendor/`，配有独立开发服务器脚本（`scripts/dev-server.mjs`）、引用与语法检查脚本（`scripts/check-integrity.mjs`）和基于 `node:test` 的单元测试套件（`tests/atlas.test.mjs`），**零第三方 npm 运行依赖**。

---

## 🚀 本地快速运行与测试 · Quick Start

无需 `npm install` 或任何构建打包工具：

```bash
# 1. 克隆仓库
git clone https://github.com/aicuc/3d-acupoint-atlas.git
cd 3d-acupoint-atlas

# 2. 启动内置零依赖开发服务器（Node.js >= 20，默认 http://127.0.0.1:4173）
npm start
# 或使用 Python 3 直接从仓库根目录托管：
# python3 -m http.server 4173 --bind 127.0.0.1

# 3. 运行工程完整性校验与单元测试
npm run check
npm test
```

---

## 🗂️ 仓库结构 · Repository Structure

```text
3d-acupoint-atlas/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug 反馈与功能建议模板
│   └── workflows/ci.yml         # GitHub Actions 自动化模块校验与单元测试工作流
├── assets/
│   └── preview.png              # 项目主预览图
├── licenses/
│   ├── HUMAN-MODEL-LICENSE.txt  # MakeHuman hm08 基础网格 CC0 1.0 说明
│   └── THREE-LICENSE.txt        # Three.js r170 MIT 许可
├── scripts/
│   ├── check-integrity.mjs      # index.html 资产引用、相对 ESM 导入与语法检查脚本
│   └── dev-server.mjs           # 零依赖 Node 静态开发预览服务器
├── src/
│   ├── main.js                  # 主应用入口：Three.js 场景、GLSL 着色器材质、罗盘与交互控制器
│   ├── data/
│   │   ├── catalog.js           # 十四经脉元信息与 361 正经穴完整标准编号目录
│   │   └── points.js            # 152 个三维空间穴位坐标、体表解剖标志与特写视角参数
│   ├── scene/
│   │   ├── effects.js           # 149 组穴位—部位传统主治关联与 GLSL 流光弧线渲染引擎
│   │   └── human-model.js       # 13,524 顶点三维人体基础网格与体表最近点投射算法 (CC0)
│   ├── styles/
│   │   └── main.css             # 东方墨青鎏金学术视觉系统、HUD、SVG 引线与响应式布局
│   └── vendor/
│       ├── OrbitControls.js     # Three.js r170 轨道相机控制器
│       └── three.module.js      # Three.js r170 核心模块
├── tests/
│   └── atlas.test.mjs           # node:test 自动化测试（经穴目录、三维坐标范围、流光数据与网格投射）
├── .editorconfig                # 跨编辑器代码格式规范
├── .gitignore                   # Git 忽略清单
├── .nojekyll                    # 禁用 GitHub Pages Jekyll 解析，原生直出 ES Modules
├── CHANGELOG.md                 # 版本更新日志
├── CONTRIBUTING.md              # 开源贡献与开发指南
├── index.html                   # 应用根入口（支持 GitHub Pages Root / 直接部署）
├── LICENSE                      # 仓库根目录 MIT License
└── package.json                 # 标准项目清单与 npm start / test 脚本（零外部依赖）
```

---

## 🌐 一键 Fork 部署 · Deploy on GitHub Pages

1. 点击右上角 **🌟 Star** 与 **🍴 Fork** 按钮。
2. 打开你 Fork 后仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中：
   - **Source** 选择 `Deploy from a branch`
   - **Branch** 选择 `main`，目录选择 `/ (root)`，点击 **Save**。
4. 等待约 30 秒，即可通过 `https://<你的用户名>.github.io/<仓库名>/` 公开访问！

---

## ⚠️ 免责声明 · Disclaimer

本项目中的三维人体模型、穴位空间坐标、体表同经连线以及部位关联流光均为**传统文化科普与数字化可视化学习示意**，不代表真实解剖神经/血管通路或确定临床疗效，**不可用于临床针刺定位、医疗诊断或疾病治疗**。具体医学与针灸诊疗请务必咨询专业执业中医师。

- 本项目代码以 [MIT License](LICENSE) 开源。
- 三维人体基础网格改编自 MakeHuman `hm08`（CC0 1.0 许可，详见 [licenses/HUMAN-MODEL-LICENSE.txt](licenses/HUMAN-MODEL-LICENSE.txt)）。
- 内置 Three.js r170 遵循 MIT 许可（详见 [licenses/THREE-LICENSE.txt](licenses/THREE-LICENSE.txt)）。
