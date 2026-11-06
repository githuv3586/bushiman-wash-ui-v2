/* 布仕曼洗护 H5 · 图标库
 *
 * 与小程序 miniprogram/utils/icons.js 同一套几何（24 网格 / 1.7 描边 / 圆角端点）。
 * 这里直接用字符串导出，供 dangerouslySetInnerHTML 内联，避免额外请求。
 * 颜色统一用 currentColor，由外层 CSS 控制，不再为每种颜色单独烘焙一份。
 */

const svg = (body: string, opts: { size?: number; fill?: boolean; stroke?: number } = {}) => {
  const { size = 24, fill = false, stroke = 1.7 } = opts
  if (fill) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${body}</svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

/* ---------- 线性图标 ---------- */
export const ICO_CHEV_R = svg('<path d="M9 5l7 7-7 7"/>', { stroke: 2 })
export const ICO_CHEV_L = svg('<path d="M15 5l-7 7 7 7"/>', { stroke: 2 })
export const ICO_PLUS = svg('<path d="M12 5v14M5 12h14"/>')
export const ICO_MINUS = svg('<path d="M5 12h14"/>')
export const ICO_CHECK = svg('<path d="M4.5 12.5l4.8 4.8L19.5 7"/>', { stroke: 2.2 })
export const ICO_CLOSE = svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>')
export const ICO_PHONE = svg(
  '<path d="M7 3.6h3.1l1.5 4.1-2.1 1.5a11.4 11.4 0 005.3 5.3l1.5-2.1 4.1 1.5v3.1c0 1-.8 1.9-1.9 1.8C10.1 18.4 5.6 13.9 5.2 5.5c-.1-1 .8-1.9 1.8-1.9z"/>',
)
export const ICO_LOCATION = svg(
  '<path d="M12 21.2s6.4-6.2 6.4-11a6.4 6.4 0 10-12.8 0c0 4.8 6.4 11 6.4 11z"/><circle cx="12" cy="10.1" r="2.4"/>',
)
export const ICO_CLOCK = svg('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.1 2"/>')
export const ICO_SHIELD = svg(
  '<path d="M12 3.6l7 2.7v5.2c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6.3z"/><path d="M8.9 12l2.1 2.1 4.1-4.1"/>',
)
export const ICO_STAR = svg('<path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8z"/>')
export const ICO_BOX = svg('<path d="M4 8.4L12 4l8 4.4v7.2L12 20l-8-4.4z"/><path d="M4 8.4l8 4.4 8-4.4M12 12.8V20"/>')
export const ICO_RECEIPT = svg('<path d="M6 3.6h12v16.8l-3-2-3 2-3-2-3 2z"/><path d="M9 8.4h6M9 12.2h6"/>')
export const ICO_HOME = svg('<path d="M3.8 10.6L12 4l8.2 6.6V20H3.8z"/><path d="M9.4 20v-5.6h5.2V20"/>')
export const ICO_USER = svg('<circle cx="12" cy="8.2" r="3.6"/><path d="M4.6 20c0-3.6 3.3-6 7.4-6s7.4 2.4 7.4 6"/>')
export const ICO_BOOK = svg(
  '<path d="M4.4 4.4h6.2a2.6 2.6 0 012.6 2.6v13.4a2.2 2.2 0 00-2.2-2.2H4.4z"/><path d="M19.6 4.4h-6.2a2.6 2.6 0 00-2.6 2.6v13.4a2.2 2.2 0 012.2-2.2h6.6z"/>',
)
export const ICO_TUNE = svg(
  '<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>',
)
export const ICO_EDIT = svg('<path d="M4 20l4.6-1.1L18.8 8.7l-3.5-3.5L5.1 15.4z"/><path d="M14.4 6.1l3.5 3.5"/>')

/* ---------- 实心图标（tabBar 选中态） ---------- */
export const TAB_HOME = svg('<path d="M12 3.4L3.2 10.5V20.6h6.2v-6.1h5.2v6.1h6.2V10.5z"/>', { fill: true, size: 22 })
export const TAB_ORDER = svg(
  '<path d="M5.4 3h13.2v18.2l-3.3-2.1-3.3 2.1-3.3-2.1-3.3 2.1zM9 8.2h6v1.9H9zM9 12.4h6v1.9H9z"/>',
  { fill: true, size: 22 },
)
export const TAB_GEAR = svg('<path d="M11.1 3.4L3.4 7.6v8.8l7.7 4.2 7.7-4.2V7.6zM12 11.9L4.6 8L12 4.1 19.4 8z"/>', {
  fill: true,
  size: 22,
})
export const TAB_PROFILE = svg('<circle cx="12" cy="8" r="4.1"/><path d="M4.2 20.6c0-4 3.5-6.6 7.8-6.6s7.8 2.6 7.8 6.6z"/>', {
  fill: true,
  size: 22,
})

/* ---------- 空态插画 ---------- */
const illo = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 120 120"><g stroke="#C3D6CD" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="18" width="84" height="84" rx="14" stroke-dasharray="5 7"/>${inner}</g></svg>`

export const ILLO_ORDER = illo(
  '<path d="M60 40a5 5 0 115 5c-2.8 0-5 2.2-5 5"/><path d="M60 50L34 68h52z"/><path d="M44 84h32"/>',
)
export const ILLO_GEAR = illo('<path d="M38 44h44l-5 40H43z"/><path d="M38 44l-4 10M82 44l4 10"/><path d="M50 32l4 12M70 32l-4 12"/>')
export const ILLO_ARTICLE = illo('<rect x="36" y="36" width="48" height="48" rx="6"/><path d="M46 52h28M46 62h28M46 72h18"/>')

/* ---------- 兼容历史命名 ---------- */
export const TAB_VIEWS = [TAB_HOME, TAB_ORDER, TAB_GEAR, TAB_PROFILE]
export const BACK = ICO_CHEV_L
export const CHEV_R = ICO_CHEV_R
export const ICO_WASH = ICO_BOX
export const ICO_REPAIR = ICO_TUNE
export const ICO_WATER = ICO_SHIELD
export const ICO_ALL = ICO_RECEIPT
export const ICO_EMPTY = ILLO_ORDER
export const ICO_KEFU = ICO_USER
