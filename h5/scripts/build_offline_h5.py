#!/usr/bin/env python3
"""组装布仕曼洗护 H5 单文件成品（读取 bun 产物 → 内联转义 → 输出 dist/）

用法：
  bun build src/offline-h5-entry.tsx --target=browser --production --outdir /tmp/offline-h5
  python3 scripts/build_offline_h5.py
"""
import pathlib

REPO_H5 = pathlib.Path(__file__).resolve().parent.parent   # h5/
BUNDLE_DIR = pathlib.Path('/tmp/offline-h5')

JS = (BUNDLE_DIR / 'offline-h5-entry.js').read_text(encoding='utf-8')
CSS = (BUNDLE_DIR / 'offline-h5-entry.css').read_text(encoding='utf-8')

# 内联安全转义：防止提前闭合 script/style 标签
JS = JS.replace('</script', '<\\/script').replace('<!--', '<\\!--')
CSS = CSS.replace('</style', '<\\/style').replace('<!--', '<\\!--')

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1F4A3C">
<title>布仕曼洗护 · 户外装备洗护（H5）</title>
<style>{CSS}</style>
</head>
<body>
<div id="root"></div>
<noscript>本页面需要启用 JavaScript 才能使用。</noscript>
<script>{JS}</script>
</body>
</html>"""

out = REPO_H5 / 'dist/布仕曼洗护-H5版.html'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'✓ 输出 {out} ({out.stat().st_size // 1024}K)')
