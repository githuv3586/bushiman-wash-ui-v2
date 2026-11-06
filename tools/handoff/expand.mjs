/**
 * expand.mjs —— 从压缩清单展开完整源码
 *
 * GitHub 中转仓库的批量写入端点不稳定，因此源码以 gzip+base64 分片形式落地。
 * 拉取仓库后运行一次即可展开全部 93 个源码 / 文档文件：
 *
 *   node tools/handoff/expand.mjs
 *   node tools/handoff/restore-assets.mjs   // 还原 8 个 tabBar PNG
 *
 * 展开后请运行 npm run audit 校验。
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const DIR = path.join(ROOT, 'tools/handoff')

const parts = fs.readdirSync(DIR)
  .filter((f) => /^payload\.\d+$/.test(f))
  .sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]))

if (!parts.length) throw new Error('未找到 payload 分片，请确认仓库完整')

const b64 = parts.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8').trim()).join('')
const manifest = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'))

let n = 0
for (const [rel, content] of Object.entries(manifest)) {
  const dst = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.writeFileSync(dst, Buffer.from(content, 'base64'))
  n++
}
console.log(`✓ 已展开 ${n} 个源码 / 文档文件`)
