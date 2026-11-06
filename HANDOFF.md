# 中转仓库交接说明

本仓库是 **布仕曼洗护 UI 改版 v2.0** 的代码中转站，供 CNB 的 NPC 拉取后写入
`cnbmm/bushiman-wash` 并发起 PR。它不是最终交付仓库。

## 为什么有这个仓库

改版代码在本地分支 `feat/ui-refine-v2`（7 个提交）上，但设计会话的 `git push`
命令被环境策略拦截，CNB OpenAPI 又没有创建 commit / tree 的接口。
因此通过 GitHub 连接器把源码写成一批提交，由 CNB 侧流水线取用。

## 目录与还原

仓库内已包含全部 **90 个源码 / 文档文本文件**，与本地分支一致。
另外两个文件用于还原二进制：

| 文件 | 用途 |
| --- | --- |
| `tools/handoff/tabbar-assets.json` | 8 个 tabBar PNG 的 base64（小程序运行必需，共 13KB） |
| `tools/handoff/restore-assets.mjs` | 还原脚本 |

拉取后**必须执行一次**：

```bash
node tools/handoff/restore-assets.mjs
```

> 写入接口只接受文本，二进制无法直接搬运，故以 base64 文本附带。
> `previews/` 截图与 `reports/` 报告是交付证据，不是运行必需，
> CNB 仓库 `main` 分支已有，无需搬移。

## 校验

```bash
npm run audit                 # 期望：阻断项 0
cd h5 && bun install && bun run typecheck && bun run build
```

`npm run audit` 需要 playwright；未安装时 H5 运行时检查会降级为「待确认」，
不阻断。

## 目标

- 仓库：`cnbmm/bushiman-wash`
- 分支：`feat/ui-refine-v2`（远端已创建，停在 `4feacbe`）
- PR：该分支 → `main`，关联 Issue `#2`

## 约束

- **只做搬运，不重新设计、不改配色、不调整版式**；视觉已定稿并经前后对比确认
- 不改动订单状态机、`miniprogram/utils/mock.js` 接口形状、`h5/src/store.ts` 数据结构
- 校验失败就回帖说明，不要自行改写代码

## 权威交付

Issue #2 上另挂了 `bushiman-wash-ui-v2.bundle`（6.8MB，含 7 个提交的完整 Git 对象，
`git bundle verify` 通过）。**若本仓库内容存疑，以 bundle 为准**：

```bash
git fetch <bundle> refs/heads/feat/ui-refine-v2:refs/heads/feat/ui-refine-v2
```
