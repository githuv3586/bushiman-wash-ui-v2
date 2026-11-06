'use client'

/* 布仕曼洗护 H5 · 数据层：localStorage 持久化 + 演示种子数据（与小程序 utils/mock.js 同构） */

export type Service = {
  id: string
  category: 'clean' | 'repair' | 'care'
  name: string
  price: number
  unit: string
  duration: string
  tags: string[]
  hot: boolean
  desc: string
}

export type Article = {
  id: string
  title: string
  date: number
  summary: string
  serviceId?: string
  content: string[]
}

export type GearRecord = { date: string; type: string; orderNo: string }

export type Gear = {
  id: string
  type: string
  brand: string
  model: string
  boughtAt: string
  usage: string
  note: string
  records: GearRecord[]
}

export type Pkg = {
  id: string
  name: string
  total: number
  used: number
  price: number
  scope: string
  expire: string
  status: string
  serviceIds: string[]
}

export type OrderItem = { serviceId: string; name: string; price: number; qty: number }

export type Order = {
  orderNo: string
  status: number // 1待支付 2已接单 3清洗中 4质检中 5配送/待取 6已完成
  createdAt: number
  items: OrderItem[]
  shipFee: number
  total: number
  pickupType: 'store' | 'door'
  date: string
  timeSlot: string
  contact: string
  phone: string
  address: string
  remark: string
  gearIds: string[]
  payBy?: 'wx' | 'card'
  cardId?: string
  timeline: { time: number; text: string }[]
  beforePhotos: string[]
  afterPhotos: string[]
}

export const STATUS: Record<number, string> = {
  1: '待支付',
  2: '已接单',
  3: '清洗中',
  4: '质检中',
  5: '配送/待取',
  6: '已完成',
}

export const CATEGORY_NAME: Record<Service['category'], string> = {
  clean: '装备清洗',
  repair: '专业修复',
  care: '防水保养',
}

const SEED_SERVICES: Service[] = [
  { id: 's1', category: 'clean', name: '冲锋衣深度清洗+防水复理', price: 128, unit: '件', duration: '3-5天', tags: ['机洗保护', 'DWR复配'], hot: true, desc: '中性洗涤剂低温清洗，恢复面料透气与防水性能；清洗后按需喷涂 DWR 防水复配剂并低温烘干激活。' },
  { id: 's2', category: 'clean', name: '羽绒服整洗+蓬松恢复', price: 98, unit: '件', duration: '3-4天', tags: ['低温烘干', '防钻绒'], hot: true, desc: '羽绒服专洗程序，彻底漂洗避免白色渍痕，低温慢烘并手工拍打恢复蓬松度。' },
  { id: 's3', category: 'clean', name: '帐篷整体清洗+防霉处理', price: 268, unit: '顶', duration: '5-7天', tags: ['接缝检查', '防霉收纳'], hot: false, desc: '拆分内外帐清洗，检查涂层与接缝压胶，防霉处理后提供收纳建议。' },
  { id: 's4', category: 'clean', name: '登山鞋深度清洁+除菌除臭', price: 68, unit: '双', duration: '2-3天', tags: ['手工刷洗', '除菌'], hot: true, desc: '鞋面鞋底手工拆洗，中底除菌除臭，网面与皮革分类护理，恢复鞋型。' },
  { id: 's5', category: 'repair', name: '冲锋衣压胶条修复', price: 60, unit: '处', duration: '3-5天', tags: ['热压复胶'], hot: false, desc: '接缝压胶开裂、起泡处热压复胶，恢复防水性；按实际破损处计费，洗前评估确认。' },
  { id: 's6', category: 'repair', name: '拉链/扣件更换', price: 45, unit: '起', duration: '2-4天', tags: ['原厂件优先'], hot: false, desc: '主拉链、口袋拉链、按扣、织带扣件更换，优先选用同规格原厂件。' },
  { id: 's7', category: 'care', name: '睡袋/羽绒收纳前保养', price: 88, unit: '件', duration: '3-4天', tags: ['季末保养'], hot: false, desc: '季末收纳前清洁烘干，防霉防潮处理，附收纳袋与收纳建议。' },
  { id: 's8', category: 'care', name: '装备防水喷雾复配（寄洗包邮）', price: 79, unit: '件', duration: '4-6天', tags: ['异地可寄'], hot: false, desc: '软壳、背包、帐篷外帐的 DWR 喷涂复配；支持快递寄洗，来回运费规则见下单页。' },
]

const SEED_ARTICLES: Article[] = [
  {
    id: 'a1', title: '冲锋衣怎么洗才不伤防水膜？', date: 1730000000000,
    summary: '中性洗涤剂、温和机洗、拒绝柔顺剂……记住这几条，防水膜多用两年。', serviceId: 's1',
    content: [
      '1. 先看洗标：大多数冲锋衣可以机洗，但要用中性洗涤剂，水温不超过 40 度。',
      '2. 一定要拉好拉链、粘好魔术贴，避免刮伤面料；漂洗两遍，洗涤剂残留会影响透气。',
      '3. 柔顺剂会在面料表面成膜，堵住防水膜的微孔，千万别用。',
      '4. 洗完悬挂晾干即可；如果想恢复拨水性能，可以低温烘干或垫布低温熨烫，激活 DWR 涂层。',
      '5. 穿着一季防水明显下降时，别急着扔——喷涂 DWR 复配剂就能恢复，交给专业洗护更省心。',
    ],
  },
  {
    id: 'a2', title: '羽绒服收纳前，这一步别省', date: 1729000000000,
    summary: '洗完不彻底烘干，来年拿出来就是一摊结块的羽绒。', serviceId: 's2',
    content: [
      '1. 羽绒服建议季末清洗后再收纳，汗渍与皮脂会吸引虫蛀并加速羽绒老化。',
      '2. 局部脏污先去渍，整体清洗用羽绒服专用程序，彻底漂洗避免水渍印。',
      '3. 烘干是关键：低温慢烘，加入两三个烘干球拍打散羽绒，直到完全蓬松。',
      '4. 收纳时用透气袋，不要抽真空，羽绒需要弹性空间。',
      '5. 怕麻烦？我们提供羽绒服整洗+蓬松恢复一条龙服务。',
    ],
  },
  {
    id: 'a3', title: '帐篷发霉了还能救吗？', date: 1728000000000,
    summary: '轻度霉斑可以处理，重点是防霉收纳的正确姿势。', serviceId: 's3',
    content: [
      '1. 收帐篷前务必完全晾干，潮气是涂层脱皮和发霉的元凶。',
      '2. 轻度霉斑用专用清洁剂软化后擦除，切勿硬刷，会破坏涂层。',
      '3. 长期不用时，松卷收纳而不是压紧折叠，减少折痕处涂层疲劳。',
      '4. 已经大面积脱涂层的帐篷，建议来店评估，我们提供涂层修复与接缝补胶服务。',
    ],
  },
]

const SEED_PACKAGES: Pkg[] = [
  { id: 'p1', name: '季前焕新次卡', total: 4, used: 0, price: 399, scope: '冲锋衣/羽绒服清洗 任选4次', expire: '2027-04-30', status: 'active', serviceIds: ['s1', 's2'] },
  { id: 'p2', name: '鞋靴双次卡', total: 2, used: 1, price: 118, scope: '登山鞋深度清洁 除菌除臭 2次', expire: '2027-12-31', status: 'active', serviceIds: ['s4'] },
]

const SEED_GEARS = (): Gear[] => [
  { id: 'g1', type: '冲锋衣', brand: '始祖鸟', model: 'Beta LT', boughtAt: '2023-10', usage: '高频（每周徒步）', note: '袖口有轻微磨损', records: [] },
  { id: 'g2', type: '登山鞋', brand: 'La Sportiva', model: 'TX4', boughtAt: '2022-05', usage: '中频', note: '', records: [] },
]

/* 预置两笔演示订单，让验收一进来就有内容 */
const SEED_ORDERS = (): Order[] => {
  const now = Date.now()
  const day = 86400000
  return [
    {
      orderNo: 'BSM2026110309321524', status: 3, createdAt: now - 2 * day,
      items: [{ serviceId: 's1', name: '冲锋衣深度清洗+防水复理', price: 128, qty: 1 }],
      shipFee: 0, total: 128, pickupType: 'store', date: '2026-11-04', timeSlot: '09:00-12:00',
      contact: '王小户', phone: '13800001234', address: '', remark: '袖口压胶轻微开裂，麻烦看看',
      gearIds: ['g1'], payBy: 'wx',
      timeline: [
        { time: now - 2 * day, text: '订单已创建' },
        { time: now - 2 * day + 3600000, text: '已接单' },
        { time: now - day, text: '清洗中' },
      ],
      beforePhotos: [], afterPhotos: [],
    },
    {
      orderNo: 'BSM2026102815124490', status: 6, createdAt: now - 9 * day,
      items: [{ serviceId: 's2', name: '羽绒服整洗+蓬松恢复', price: 98, qty: 1 }],
      shipFee: 0, total: 98, pickupType: 'door', date: '2026-10-29', timeSlot: '12:00-15:00',
      contact: '王小户', phone: '13800001234', address: '示例路 88 号 2 栋 101', remark: '',
      gearIds: [], payBy: 'wx',
      timeline: [
        { time: now - 9 * day, text: '订单已创建' },
        { time: now - 9 * day + 3600000, text: '已接单' },
        { time: now - 8 * day, text: '清洗中' },
        { time: now - 7 * day, text: '质检中' },
        { time: now - 6 * day, text: '配送/待取' },
        { time: now - 6 * day + 7200000, text: '已完成' },
      ],
      beforePhotos: [], afterPhotos: [],
    },
  ]
}

/* ---------- 存储 ---------- */
const KEY = 'bsm_h5_state_v1'

export type State = {
  services: Service[]
  articles: Article[]
  orders: Order[]
  gears: Gear[]
  packages: Pkg[]
  contact: { name: string; phone: string; address: string }
}

const freshState = (): State => ({
  services: SEED_SERVICES,
  articles: SEED_ARTICLES,
  orders: SEED_ORDERS(),
  gears: SEED_GEARS(),
  packages: SEED_PACKAGES,
  contact: { name: '王小户', phone: '13800001234', address: '' },
})

function load(): State {
  if (typeof window === 'undefined') return freshState()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      const s = freshState()
      window.localStorage.setItem(KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw) as State
  } catch {
    return freshState()
  }
}

function save(state: State) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

/* 极简 pub/sub，供 React 订阅 */
let current: State | null = null
const listeners = new Set<() => void>()

export const store = {
  get(): State {
    if (!current) current = load()
    return current
  },
  set(next: State) {
    current = next
    save(next)
    listeners.forEach((fn) => fn())
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
  reset() {
    current = freshState()
    save(current)
    listeners.forEach((fn) => fn())
  },
}

export const fmtDate = (t: number, withTime = true) => {
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  const base = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  return withTime ? `${base} ${p(d.getHours())}:${p(d.getMinutes())}` : base
}

export const genOrderNo = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  return `BSM${stamp}${Math.floor(1000 + Math.random() * 9000)}`
}

/* ---------- 业务操作（接口形状与小程序 mock.js 一致） ---------- */
export const api = {
  createOrder(payload: {
    items: OrderItem[]
    pickupType: 'store' | 'door'
    date: string
    timeSlot: string
    contact: string
    phone: string
    address?: string
    remark?: string
    gearIds: string[]
    payBy?: 'wx' | 'card'
    cardId?: string
  }): Order {
    const s = store.get()
    const shipFee = payload.pickupType === 'door' ? 12 : 0
    const order: Order = {
      orderNo: genOrderNo(),
      status: 1,
      createdAt: Date.now(),
      items: payload.items,
      shipFee,
      total: payload.items.reduce((sum, it) => sum + it.price * it.qty, 0) + shipFee,
      pickupType: payload.pickupType,
      date: payload.date,
      timeSlot: payload.timeSlot,
      contact: payload.contact,
      phone: payload.phone,
      address: payload.address || '',
      remark: payload.remark || '',
      gearIds: payload.gearIds,
      payBy: payload.payBy ?? 'wx',
      cardId: payload.cardId,
      timeline: [{ time: Date.now(), text: '订单已创建' }],
      beforePhotos: [],
      afterPhotos: [],
    }
    s.orders.unshift(order)
    s.contact = { name: payload.contact, phone: payload.phone, address: payload.address || s.contact.address }
    store.set({ ...s })
    return order
  },

  payOrder(orderNo: string, by: 'wx' | 'card', cardId?: string): Order | undefined {
    const s = store.get()
    const o = s.orders.find((x) => x.orderNo === orderNo)
    if (!o || o.status !== 1) return o
    o.status = 2
    o.payBy = by
    o.cardId = cardId
    o.timeline.push({ time: Date.now(), text: STATUS[2] })
    if (by === 'card' && cardId) {
      const p = s.packages.find((x) => x.id === cardId)
      if (p && p.used < p.total) p.used += 1
    }
    store.set({ ...s })
    return o
  },

  advanceOrder(orderNo: string): Order | undefined {
    const s = store.get()
    const o = s.orders.find((x) => x.orderNo === orderNo)
    if (!o || o.status >= 6) return o
    o.status += 1
    o.timeline.push({ time: Date.now(), text: STATUS[o.status] })
    if (o.status === 6) {
      o.gearIds.forEach((gid) => {
        const g = s.gears.find((x) => x.id === gid)
        if (g) g.records.unshift({ date: fmtDate(Date.now(), false), type: '洗护保养', orderNo: o.orderNo })
      })
    }
    store.set({ ...s })
    return o
  },

  cancelOrder(orderNo: string) {
    const s = store.get()
    s.orders = s.orders.filter((x) => x.orderNo !== orderNo)
    store.set({ ...s })
  },

  saveGear(gear: Omit<Gear, 'id' | 'records'> & { id?: string }): Gear {
    const s = store.get()
    if (gear.id) {
      const i = s.gears.findIndex((x) => x.id === gear.id)
      if (i > -1) s.gears[i] = { ...s.gears[i], ...gear } as Gear
    } else {
      s.gears.unshift({ ...gear, id: 'g' + Date.now(), records: [] } as Gear)
    }
    store.set({ ...s })
    return gear as Gear
  },

  deleteGear(id: string) {
    const s = store.get()
    s.gears = s.gears.filter((g) => g.id !== id)
    store.set({ ...s })
  },

  buyPackage(seedId: string): Pkg | null {
    const s = store.get()
    const seed = SEED_PACKAGES.find((x) => x.id === seedId)
    if (!seed) return null
    const bought: Pkg = { ...seed, id: 'p' + Date.now(), used: 0, status: 'active' }
    s.packages.unshift(bought)
    store.set({ ...s })
    return bought
  },

  eligibleCards(serviceId: string): Pkg[] {
    return store.get().packages.filter((p) => p.status === 'active' && p.used < p.total && p.serviceIds.includes(serviceId))
  },
}

export const shipFeeOf = (pickupType: 'store' | 'door') => (pickupType === 'door' ? 12 : 0)

export const slotOptions = ['09:00-12:00', '12:00-15:00', '15:00-18:00']

export const dateOptions = (): string[] => {
  const out: string[] = []
  const base = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(base.getTime() + i * 86400000)
    const p = (n: number) => String(n).padStart(2, '0')
    out.push(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`)
  }
  return out
}
