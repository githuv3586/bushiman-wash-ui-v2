# H5 构建说明

## 产物

`dist/布仕曼洗护-H5版.html`（约 236KB）：CSS + React 生产运行时 + 全量内联 SVG 图标的单文件成品，双击即用、托管即部署。

## 复现构建

依赖 [Bun](https://bun.sh) ≥ 1.1 与 Python 3：

```bash
cd h5
bun install                            # 首次：安装 react / react-dom（见 h5/package.json）
bun run typecheck                      # 类型检查（tsc --noEmit）
bun run build                          # 等价于下面两步
# bun build src/offline-h5-entry.tsx --target=browser --production --outdir /tmp/offline-h5
# python3 scripts/build_offline_h5.py  # 读取 /tmp/offline-h5 产物，输出到 h5/dist/
```

## 图标

`src/icons.ts` 自包含，不依赖仓库外的模块：与小程序 `miniprogram/utils/icons.js`
同一套几何（24 网格 / 1.7 描边 / 圆角端点），颜色统一走 `currentColor` 由 CSS 控制。

`scripts/build_offline_h5.py` 做三件事：内联 JS 与 CSS、转义 `</script` 与 `<!--` 防止提前闭合标签、写入 `dist/`。

## 关键经验（避坑）

- 必须用 `--production`：它同时设置 `NODE_ENV=production` 并把 JSX 运行时切换为生产版
- 仅用 `--define "process.env.NODE_ENV='production'"` 会保留 dev JSX 运行时且打坏其内部逻辑，报 `jsxDEV is not a function`
- 仅设 shell 环境变量 `NODE_ENV=production` 对 Bun 的 JSX 运行时选择无效
- 产物体积参考：dev 运行时约 442KB，生产运行时约 220KB
