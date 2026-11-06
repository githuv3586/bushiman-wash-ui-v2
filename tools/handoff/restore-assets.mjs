/**
 * restore-assets.mjs —— 从 tabbar-assets.json 还原 tabBar 图标
 *
 * GitHub 中转仓库的文本写入接口不支持二进制，因此 8 个 tabBar PNG
 * 以 base64 文本形式随源码一同搬运。拉取仓库后运行一次即可还原：
 *
 *   node tools/handoff/restore-assets.mjs
 *
 * 其余二进制（previews/ 截图、reports/ 报告）属于交付证据而非运行必需，
 * CNB 仓库 main 分支已有，无需搬移。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = path.join(ROOT, 'tools/handoff/tabbar-assets.json')

const assets = JSON.parse(fs.readFileSync(SRC, 'utf8'))
let n = 0
for (const [rel, b64] of Object.entries(assets)) {
  const dst = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  const buf = Buffer.from(b64, 'base64')
  // PNG 签名校验，避免把损坏数据写进仓库
  if (buf.slice(0, 4).toString('hex') !== '89504e47') {
    throw new Error('invalid PNG: ' + rel)
  }
  fs.writeFileSync(dst, buf)
  n++
}
console.log(`✓ 已还原 ${n} 个 tabBar 图标`)
