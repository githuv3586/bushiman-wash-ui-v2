# 布仕曼洗护 · 户外装备洗护双版本产品

冲锋衣 / 羽绒服 / 帐篷 / 登山鞋的清洗、修复与防水保养服务产品，一套设计、双端交付：

| 版本 | 形态 | 位置 | 运行方式 |
| --- | --- | --- | --- |
| **H5 版** | 移动端网页应用（哈希路由 SPA，全 SVG 图标） | `h5/` | 双击 `h5/dist/布仕曼洗护-H5版.html`，或托管到任意静态服务器 |
| **微信小程序版** | 微信原生小程序（WXML/WXSS/JS） | `miniprogram/` | 微信开发者工具 → 导入 `miniprogram/` 目录 |

两端页面一一对应（首页 / 服务项目 / 服务详情 / 确认预约 / 我的订单 / 订单详情 / 装备档案 / 会员次卡 / 我的，小程序版额外含养护知识与文章详情页）。

## 目录结构

```
├── README.md                 本文件
├── docs/                     交付文档
│   ├── 01-交付与验收清单.md
│   ├── 02-H5版使用与部署指南.md
│   ├── 03-微信小程序使用与发布指南.md
│   ├── 04-仓库留痕与CNB推送说明.md
│   └── 05-视觉改版说明.md      v2.0 设计系统、诊断与审查记录
├── miniprogram/              微信小程序完整源码（12 页面，导入即运行）
├── h5/
│   ├── src/                  H5 源码（App.tsx / store.ts / icons.ts / h5.css / 打包入口）
│   ├── scripts/              单文件构建脚本
│   ├── dist/                 生产构建成品（单文件 HTML 约 236KB，零外部依赖）
│   └── BUILD.md              构建说明
├── previews/                 小程序真实渲染截图（12 页 + 九宫格总览）
├── reports/                  案例分析报告（Word + PDF）
└── tools/
    ├── preview/              渲染快照 + 设计与实现审查（snapshot.js / audit.js）
    ├── icons/build.js        图标资产构建（SVG 源码 → icons.js + tabBar PNG）
    └── push_to_cnb.sh        CNB 建仓 + 推送一键脚本
```

## 设计系统与审查

v2.0 重做了小程序端全部 12 个页面的视觉与细节，设计令牌、页面改动清单与对抗式审查记录见
[`docs/05-视觉改版说明.md`](docs/05-视觉改版说明.md)。

```bash
npm run preview   # 用真实页面代码 + 真实 WXSS 渲染 12 页截图到 previews/
npm run audit     # 设计令牌 / 对比度 / 字号 / 图片尺寸 / 绑定残值审查
npm run report    # 生成「改版前后对比」单文件 HTML，双击即可评审
```

## 演示模式（Mock）

两端默认运行在演示模式，不依赖任何后端：

- **小程序版**：`miniprogram/config/index.js` 中 `USE_MOCK: true`，数据来自 `utils/mock.js`
- **H5 版**：数据保存在内存 store（`h5/src/store.ts`），刷新页面即重置

演示模式覆盖完整业务流：浏览服务 → 预约下单（订单号 BSM+时间戳）→ 订单六态推进（待支付→已接单→清洗中→质检中→配送/待取→已完成）→ 装备档案增改 → 会员次卡购买。

## 上线前必改（占位符清单）

| 位置 | 内容 | 说明 |
| --- | --- | --- |
| `miniprogram/config/index.js` | `【门店地址】` `【门店电话】` | 替换为真实门店信息 |
| `miniprogram/config/index.js` | `USE_MOCK` / `BASE_URL` | 对接后端时置 `false` 并填接口域名（须 HTTPS + ICP 备案） |
| `miniprogram/project.config.json` | `appid` | 替换为已注册的小程序 AppID |
| `miniprogram/pages/index/index.js` | `stats` 三项经营指标（12,400 / 3.5 / 68） | **必须替换为真实数据**，否则属虚假宣传 |
| `h5/src/App.tsx` | `BRAND.address` / `BRAND.phone` 与首页指标 | 同上，两端需保持一致 |
| 微信公众平台 | 服务类目 / 资质 | 按「生活服务-洗护」类目提交 |

## 提交身份说明

本仓库提交作者为占位身份 `bushiman <bushiman@local>`；推送前如需改为真实身份，可在仓库内执行
`git config user.name "你的名字" && git config user.email "你的邮箱"`，
随后用 `git commit --amend --reset-author` 逐条改写或使用 `git filter-repo` 批量改写。

## 版本

- **v2.0**（2026-11-06）：视觉改版。重建设计系统，小程序 12 页与 H5 11 个视图全部重做，
  补齐骨架屏/空态/吸底/状态可视化；新增渲染快照与设计审查工具；修复 H5 源码无法构建的问题；
  详见 `docs/05-视觉改版说明.md`
- **v1.0**（2026-11-06）：首个交付基线。H5 版 + 微信小程序版双端齐备，详见 `docs/01-交付与验收清单.md`
