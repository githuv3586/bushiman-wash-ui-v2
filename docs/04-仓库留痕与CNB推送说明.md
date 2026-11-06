# 仓库留痕与 CNB 推送说明

## 一、留痕设计

本仓库以 Git 历史完整记录交付过程，提交序列：

```
chore: 初始化仓库（README、.gitignore、目录规划）
docs(reports): 归档案例分析报告（Word + PDF）
feat(miniprogram): 微信小程序版 v1.0（12 页面 · 订单六态 · Mock 数据流）
feat(h5): H5 版 v1.0（哈希路由 SPA · 全 SVG · 生产构建单文件）
docs(previews): 小程序高保真样式截图（9 页 + 九宫格总览）
docs: 交付验收清单与双版本使用/部署/推送指南
chore(tools): 新增 CNB 一键建仓推送脚本
release: v1.0 双版本交付基线          ← 标签 v1.0
```

提交作者为占位身份 `bushiman <bushiman@local>`，改写方法见 README「提交身份说明」。

## 二、推送到 CNB（cnb.cool）

### 准备：创建访问令牌

1. 登录 https://cnb.cool → 个人设置 → **访问令牌**（直达 https://cnb.cool/profile/token ）
2. 「添加访问令牌」：勾选**代码仓库读写**权限，创建后复制 Token（只显示一次）

> 认证规则：git 用户名固定 `cnb`，密码为访问令牌；OpenAPI 使用 `Authorization: Bearer <令牌>`。

### 方式 A：一键脚本（推荐，自动建仓 + 推送）

```bash
cd 仓库根目录
export CNB_TOKEN="你的访问令牌"
export CNB_REPO="cnbmm/bushiman-wash"        # 组织/仓库，按需修改
export CNB_VISIBILITY="private"              # private / public
bash tools/push_to_cnb.sh
```

脚本行为：调用 OpenAPI 在 `cnbmm` 组织下建仓（已存在则跳过）→ 推送 `main` 分支与 `v1.0` 标签 → 打印仓库地址。令牌仅通过环境变量读取，不会打印或落盘。

### 方式 B：手动命令

先在 https://cnb.cool 网页端建好仓库（如 `cnbmm/bushiman-wash`），然后：

```bash
cd 仓库根目录
git remote add origin https://cnb.cool/cnbmm/bushiman-wash.git
git push -u origin main
git push origin v1.0
# 提示输入凭据时：用户名 cnb，密码填访问令牌
```

## 三、离线迁移包用法

交付包内提供两种离线形态，无需令牌即可在其他机器恢复完整历史：

```bash
# 形态 1：git bundle（可直接克隆，含全部分支与标签）
git clone 布仕曼洗护-产品仓库-v1.0.bundle bushiman-wash
cd bushiman-wash && git log --oneline

# 形态 2：含 .git 的 zip（解压即得完整仓库）
unzip 布仕曼洗护-产品仓库-v1.0-含历史.zip -d bushiman-wash
```

恢复后按「方式 B」添加 remote 推送即可。
