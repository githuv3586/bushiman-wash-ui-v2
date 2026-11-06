'use client'

/* 布仕曼洗护 H5 · 主应用（哈希路由 + 全部页面视图 + Toast/确认弹层）
 * 视觉与小程序端同源：同一套设计令牌、同一套页面结构。
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import './h5.css'
import {
  api,
  store,
  fmtDate,
  shipFeeOf,
  slotOptions,
  dateOptions,
  STATUS,
  type Order,
  type Pkg,
  type Service,
  type State,
} from './store'
import {
  TAB_HOME,
  TAB_ORDER,
  TAB_GEAR,
  TAB_PROFILE,
  ICO_CHEV_R,
  ICO_CHEV_L,
  ICO_CHECK,
  ICO_PLUS,
  ICO_MINUS,
  ICO_PHONE,
  ICO_CLOCK,
  ICO_SHIELD,
  ICO_STAR,
  ICO_BOX,
  ICO_RECEIPT,
  ICO_USER,
  ICO_BOOK,
  ICO_TUNE,
  ILLO_ORDER,
  ILLO_GEAR,
  ILLO_ARTICLE,
} from './icons'

type Route = { name: string; param?: string; param2?: string }

const doParseHash = (h: string): Route => {
  const seg = (h || '#/').replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean)
  if (seg.length === 0) return { name: 'home' }
  return { name: seg[0], param: seg[1], param2: seg[2] }
}

/* getSnapshot 必须返回缓存值（useSyncExternalStore 要求引用稳定） */
let lastHash: string | null = null
let cachedRoute: Route = { name: 'home' }
const parseHash = (): Route => {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  if (h !== lastHash) {
    lastHash = h
    cachedRoute = doParseHash(h)
  }
  return cachedRoute
}

const TAB_VIEWS = ['home', 'orders', 'gear', 'profile']
/* 沉浸式页面自带深色头部，不叠加白色导航条 */
const IMMERSIVE = ['home', 'service', 'profile']

const NAV_TITLE: Record<string, string> = {
  home: '布仕曼洗护',
  services: '服务项目',
  service: '服务详情',
  booking: '确认预约',
  orders: '我的订单',
  order: '订单详情',
  gear: '装备档案',
  gearEdit: '装备信息',
  articles: '养护知识',
  article: '养护知识',
  member: '会员次卡',
  profile: '我的',
}

const GEARTYPES = ['冲锋衣', '羽绒服', '帐篷', '登山鞋', '睡袋', '背包', '其他']
const USAGES = ['低频（每月一次）', '中频', '高频（每周徒步）', '专业高强度']

const CAT_META: Record<string, { no: string; tex: string; label: string }> = {
  clean: { no: '01', tex: 'tex-bead', label: '装备清洗' },
  repair: { no: '02', tex: 'tex-stitch', label: '专业修复' },
  care: { no: '03', tex: 'tex-rain', label: '防水保养' },
}

const STATUS_META: Record<number, { cls: string; hint: string }> = {
  1: { cls: 'pay', hint: '请在 30 分钟内完成支付' },
  2: { cls: 'accepted', hint: '门店已接单，等待收件' },
  3: { cls: 'washing', hint: '正在洗护，预计 2-3 天完成' },
  4: { cls: 'qc', hint: '质检中，完成后安排寄回' },
  5: { cls: 'deliver', hint: '已寄出，注意查收' },
  6: { cls: 'done', hint: '服务已完成' },
}

const PHASES = [
  { name: '收件', range: [1, 2] },
  { name: '洗护', range: [3, 4] },
  { name: '交付', range: [5, 6] },
]

const FLOW = [
  { no: '01', name: '在线预约', desc: '选定服务与取送方式，支付后生成订单' },
  { no: '02', name: '收件建档', desc: '到店或上门取件，逐件拍照并登记破损情况' },
  { no: '03', name: '洗前确认', desc: '评估面料与污渍，确需补差价时电话确认后再施工' },
  { no: '04', name: '专业洗护', desc: '按面料分类处理，恒温中性洗护，必要时复配 DWR' },
  { no: '05', name: '质检寄回', desc: '质检签章，出具养护记录并寄回或到店取件' },
]

const HOME_STEPS = [
  { no: '01', name: '在线预约', desc: '选择服务、取送方式与期望时间' },
  { no: '02', name: '洗前确认', desc: '到店或上门取件，拍照留档并评估报价' },
  { no: '03', name: '专业洗护', desc: '中性洗剂恒温处理，按面料分类施工' },
  { no: '04', name: '质检寄回', desc: '质检签章后寄回，养护记录同步档案' },
]

const FAQS = [
  { q: '清洗会不会损伤防水膜？', a: '不会。全程使用中性洗涤剂与恒温程序，不使用柔顺剂与漂白剂；洗后按需低温烘干激活 DWR 涂层，恢复拨水性能。' },
  { q: '工期从哪天开始算？', a: '从收件建档当日次日起算，不含快递在途时间。超出承诺工期按规则赔付，无需申诉。' },
  { q: '洗坏了怎么办？', a: '每件装备洗前拍照留档，破损与责任可追溯。属于工艺范围内的损伤，按保价或规则赔付。' },
  { q: '可以只做局部处理吗？', a: '可以。压胶、拉链、破洞等局部修复单独计费，详情请咨询门店。' },
]

const BRAND = {
  address: '【门店地址】',
  phone: '4000000000',
  hours: '09:00 - 19:00',
}

const emptySubscribe = () => () => {}
const HOME_ROUTE: Route = { name: 'home' }
const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

const callStore = () => {
  window.location.href = 'tel:' + BRAND.phone
}

export default function H5App() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const route: Route = useSyncExternalStore(subscribeHash, parseHash, () => HOME_ROUTE)
  const [toast, setToast] = useState('')
  const [dialog, setDialog] = useState<{ title: string; text?: string; okText?: string; onOk?: () => void } | null>(null)
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const state: State = useSyncExternalStore(store.subscribe, store.get, store.get)

  useEffect(() => {
    document.body.classList.add('h5-body')
    return () => document.body.classList.remove('h5-body')
  }, [])

  const nav = useCallback((path: string) => {
    window.location.hash = path
  }, [])

  const back = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else window.location.hash = '#/'
  }, [])

  const showToast = useCallback(
    (msg: string) => {
      setToast(msg)
      if (toastTimer) clearTimeout(toastTimer)
      const t = setTimeout(() => setToast(''), 1800)
      setToastTimer(t)
    },
    [toastTimer],
  )

  const confirm = (title: string, text: string, onOk: () => void, okText = '确定') =>
    setDialog({ title, text, onOk, okText })

  const go = (r: Route) => {
    const segs = [r.name, r.param, r.param2].filter(Boolean)
    nav('/' + segs.join('/'))
  }

  useEffect(() => {
    if (mounted) {
      window.scrollTo(0, 0)
      document.title = `布仕曼洗护 · ${NAV_TITLE[route.name] ?? ''}`
    }
  }, [route, mounted])

  if (!mounted) {
    return <div className="h5-app" style={{ minHeight: '100vh' }} />
  }

  const isTab = TAB_VIEWS.includes(route.name)
  const immersive = IMMERSIVE.includes(route.name)
  const title = NAV_TITLE[route.name] ?? ''

  const view = (() => {
    switch (route.name) {
      case 'home':
        return <HomeView state={state} nav={go} />
      case 'services':
        return <ServicesView state={state} nav={go} />
      case 'service':
        return <ServiceDetailView state={state} nav={go} id={route.param} />
      case 'booking':
        return <BookingView state={state} nav={go} id={route.param} qty={parseInt(route.param2 ?? '1', 10) || 1} toast={showToast} />
      case 'orders':
        return <OrdersView state={state} nav={go} />
      case 'order':
        return <OrderDetailView state={state} nav={go} no={route.param} toast={showToast} confirm={confirm} />
      case 'gear':
        return <GearView state={state} nav={go} confirm={confirm} toast={showToast} />
      case 'gearEdit':
        return <GearEditView state={state} nav={go} id={route.param} toast={showToast} />
      case 'articles':
        return <ArticlesView state={state} nav={go} />
      case 'article':
        return <ArticleDetailView state={state} nav={go} id={route.param} />
      case 'member':
        return <MemberView state={state} toast={showToast} confirm={confirm} />
      case 'profile':
        return <ProfileView state={state} nav={go} toast={showToast} confirm={confirm} />
      default:
        return <HomeView state={state} nav={go} />
    }
  })()

  return (
    <div className="h5-app">
      {!immersive && (
        <div className="h5-nav">
          <button className="h5-nav__back" onClick={back} aria-label="返回" dangerouslySetInnerHTML={{ __html: ICO_CHEV_L }} />
          {title}
        </div>
      )}
      <main className={`h5-main fade-up${isTab ? ' h5-main--tab' : ''}`} key={route.name + (route.param ?? '')}>
        {view}
      </main>

      {isTab && <TabBar current={route.name} nav={go} />}

      {toast && <div className="h5-toast">{toast}</div>}
      {dialog && (
        <div className="h5-mask" onClick={() => setDialog(null)}>
          <div className="h5-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="h5-dialog-title">{dialog.title}</div>
            {dialog.text && <div className="h5-dialog-text">{dialog.text}</div>}
            <div className="h5-dialog-btns">
              <button className="btn btn--plain" style={{ flex: 1 }} onClick={() => setDialog(null)}>
                取消
              </button>
              <button
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => {
                  dialog.onOk?.()
                  setDialog(null)
                }}
              >
                {dialog.okText ?? '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= tabBar ================= */
function TabBar({ current, nav }: { current: string; nav: (r: Route) => void }) {
  const tabs = [
    { key: 'home', text: '首页', icon: TAB_HOME },
    { key: 'orders', text: '订单', icon: TAB_ORDER },
    { key: 'gear', text: '装备档案', icon: TAB_GEAR },
    { key: 'profile', text: '我的', icon: TAB_PROFILE },
  ]
  return (
    <div className="h5-tabbar">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`h5-tb${current === t.key ? ' on' : ''}`}
          onClick={() => nav({ name: t.key })}
          role="tab"
          aria-selected={current === t.key}
        >
          <span dangerouslySetInnerHTML={{ __html: t.icon }} />
          <span>{t.text}</span>
        </button>
      ))}
    </div>
  )
}

/* ================= 01 首页 ================= */
function HomeView({ state, nav }: { state: State; nav: (r: Route) => void }) {
  const swatches = [
    { no: '01', tex: 'tex-bead', icon: ICO_BOX, name: '装备清洗', desc: '冲锋衣 / 羽绒服 / 帐篷 / 登山靴', from: 68, cat: 'clean' },
    { no: '02', tex: 'tex-stitch', icon: ICO_TUNE, name: '专业修复', desc: '压胶复贴 / 拉链更换 / 破洞织补', from: 45, cat: 'repair' },
    { no: '03', tex: 'tex-rain', icon: ICO_SHIELD, name: '防水保养', desc: 'DWR 复配 / 防霉收纳 / 季末养护', from: 79, cat: 'care' },
    { no: '04', tex: 'tex-grid', icon: ICO_RECEIPT, name: '全部服务', desc: '完整价目表与工期一览', from: 45, cat: 'all' },
  ]
  const stats = [
    { num: '12,400', label: '件装备已养护' },
    { num: '3.5', label: '平均交付天数' },
    { num: '68', label: '复洗率 %' },
  ]
  const guarantees = [
    { icon: ICO_SHIELD, name: '明码标价', desc: '价目公开，补差价先确认' },
    { icon: ICO_CLOCK, name: '超时赔付', desc: '超工期按规则赔付' },
    { icon: ICO_CHECK, name: '洗前留档', desc: '每件洗前拍照留证' },
  ]

  return (
    <>
      <div className="hero tex-ripstop">
        <div className="hero__bar">
          <div className="hero__brand">
            <div className="hero__logo">布</div>
            <div>
              <div className="hero__name">布仕曼洗护</div>
              <div className="hero__en">BUSHIMAN GEAR CARE</div>
            </div>
          </div>
          <button className="hero__call" onClick={callStore} aria-label="联系门店" dangerouslySetInnerHTML={{ __html: ICO_PHONE }} />
        </div>

        <div className="hero__body">
          <div className="hero__eyebrow">
            <span className="rule-brass" />
            <span>EST. 2019 · 户外装备洗护工坊</span>
          </div>
          <div className="hero__title">
            让每件装备
            <br />
            回到出厂状态
          </div>
          <div className="hero__cats">
            冲锋衣<i>·</i>羽绒服<i>·</i>帐篷<i>·</i>登山靴
          </div>
        </div>

        <div className="hero__stats">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat__num num">{s.num}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">服务项目</span>
            <span className="section__sub">SERVICES</span>
          </div>
          <button className="section__more" onClick={() => nav({ name: 'services' })}>
            全部
            <span dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
          </button>
        </div>

        <div className="swatch-grid">
          {swatches.map((s) => (
            <button key={s.no} className="swatch" onClick={() => nav({ name: 'services', param: s.cat })}>
              <div className={`swatch__panel ${s.tex}`}>
                <span className="swatch__no">{s.no}</span>
                <span className="swatch__edge" />
              </div>
              <div className="swatch__name">
                <span dangerouslySetInnerHTML={{ __html: s.icon }} />
                {s.name}
              </div>
              <div className="swatch__desc">{s.desc}</div>
              <div className="swatch__price">
                ¥{s.from} <small>起</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">服务工序</span>
            <span className="section__sub">PROCESS</span>
          </div>
        </div>
        <div className="process card card--flat">
          {HOME_STEPS.map((s, i) => (
            <div key={s.no} className="process__item">
              <div className="process__rail">
                <div className="process__no num">{s.no}</div>
                {i < HOME_STEPS.length - 1 && <div className="process__line" />}
              </div>
              <div className="process__body">
                <div className="process__name">{s.name}</div>
                <div className="process__desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <button className="promo tex-ripstop" onClick={() => nav({ name: 'member' })}>
          <div className="promo__hd">
            <span className="promo__kicker">MEMBERSHIP</span>
            <span className="promo__badge">季前焕新</span>
          </div>
          <div className="promo__title">洗 4 次立省 113 元</div>
          <div className="promo__desc">次卡限本人使用 · 有效期明示 · 未启用支持退款</div>
          <div className="promo__ft">
            <div className="price price--md" style={{ color: '#fff' }}>
              <span className="cur">¥</span>399<span className="unit">起</span>
            </div>
            <span className="promo__cta">
              查看次卡
              <span dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
            </span>
          </div>
        </button>
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">我们的承诺</span>
            <span className="section__sub">GUARANTEE</span>
          </div>
        </div>
        <div className="guarantee">
          {guarantees.map((g) => (
            <div key={g.name} className="guarantee__item">
              <span dangerouslySetInnerHTML={{ __html: g.icon }} />
              <div className="guarantee__name">{g.name}</div>
              <div className="guarantee__desc">{g.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">养护知识</span>
            <span className="section__sub">KNOWLEDGE</span>
          </div>
          <button className="section__more" onClick={() => nav({ name: 'articles' })}>
            更多
            <span dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
          </button>
        </div>
        <div className="card-stack">
          {state.articles.slice(0, 3).map((a, i) => (
            <button key={a.id} className="know" onClick={() => nav({ name: 'article', param: a.id })}>
              <span className="know__idx num">0{i + 1}</span>
              <div className="know__body">
                <div className="know__title">{a.title}</div>
                <div className="know__sum clamp-2">{a.summary}</div>
              </div>
              <span className="know__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="store card">
          <div className="store__hd">
            <div>
              <div className="store__name">户外装备洗护工坊</div>
              <div className="store__en">BUSHIMAN ATELIER</div>
            </div>
            <div className="stamp">
              <span>QC</span>
              <span>PASS</span>
            </div>
          </div>
          <div className="store__meta">
            <div className="kv">
              <span className="kv__k">门店地址</span>
              <span className="kv__v">{BRAND.address}</span>
            </div>
            <div className="kv">
              <span className="kv__k">营业时间</span>
              <span className="kv__v">{BRAND.hours} · 周一至周日</span>
            </div>
          </div>
          <div className="store__ops">
            <button className="btn btn--sm btn--plain" onClick={callStore}>
              拨打电话
            </button>
            <button className="btn btn--sm btn--primary" onClick={() => nav({ name: 'services' })}>
              预约到店
            </button>
          </div>
        </div>
      </div>

      <div className="pad-tabbar" />
    </>
  )
}

/* ================= 02 服务项目 ================= */
function ServicesView({ state, nav }: { state: State; nav: (r: Route) => void }) {
  const [cat, setCat] = useState<string>('all')
  const tabs = [
    { key: 'all', text: '全部' },
    { key: 'clean', text: '装备清洗' },
    { key: 'repair', text: '专业修复' },
    { key: 'care', text: '防水保养' },
  ]
  const list = state.services.filter((s) => cat === 'all' || s.category === cat)

  return (
    <>
      <div className="filter">
        <div className="filter__row">
          {tabs.map((t) => (
            <button key={t.key} className={`chip ${cat === t.key ? 'chip--on' : 'chip--line'}`} onClick={() => setCat(t.key)}>
              {t.text}
            </button>
          ))}
        </div>
      </div>

      <div className="count">
        <span className="count__num num">{list.length}</span>
        <span className="count__unit">项服务</span>
        <span className="count__hint">价目公开 · 洗前评估 · 超时赔付</span>
      </div>

      <div className="card-stack">
        {list.map((s, i) => {
          const meta = CAT_META[s.category]
          return (
            <button
              key={s.id}
              className="svc fade-up"
              style={{ animationDelay: `${i * 45}ms` }}
              onClick={() => nav({ name: 'service', param: s.id })}
            >
              <div className={`svc__thumb ${meta.tex}`}>
                <span className="svc__no">{meta.no}</span>
              </div>
              <div className="svc__main">
                <div className="svc__hd">
                  <span className="svc__name">{s.name}</span>
                  {s.hot && <span className="badge-hot">热门</span>}
                </div>
                <div className="svc__desc clamp-2">{s.desc}</div>
                <div className="svc__ft">
                  <div className="price price--sm">
                    <span className="cur">¥</span>
                    {s.price}
                    <span className="unit">/{s.unit}</span>
                  </div>
                  <span className="svc__dur">
                    <span dangerouslySetInnerHTML={{ __html: ICO_CLOCK }} />
                    {s.duration}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {list.length === 0 && (
        <div className="empty">
          <span dangerouslySetInnerHTML={{ __html: ILLO_ARTICLE }} />
          <div className="empty__title">该分类暂无服务</div>
          <div className="empty__desc">试试其他分类，或直接联系门店定制</div>
        </div>
      )}

      <div className="pad-bottom" />
    </>
  )
}

/* ================= 03 服务详情 ================= */
function ServiceDetailView({ state, nav, id }: { state: State; nav: (r: Route) => void; id?: string }) {
  const [qty, setQty] = useState(1)
  const [openFaq, setOpenFaq] = useState(-1)
  const svc = state.services.find((s) => s.id === id) ?? state.services[0]
  const meta = CAT_META[svc.category]

  return (
    <>
      <div className={`detail-hero ${meta.tex}`}>
        <div className="detail-hero__nav">
          <button className="detail-hero__back" onClick={() => nav({ name: 'services' })} aria-label="返回" dangerouslySetInnerHTML={{ __html: ICO_CHEV_L }} />
          <span className="detail-hero__navtitle">服务详情</span>
          <span className="detail-hero__navspacer" />
        </div>
        <div className="detail-hero__body">
          <div className="detail-hero__kicker">
            <span className="detail-hero__no num">{meta.no}</span>
            <span className="detail-hero__rule" />
            <span className="detail-hero__cat">{meta.label}</span>
          </div>
          <div className="detail-hero__name">{svc.name}</div>
          <div className="detail-hero__tags">
            {svc.tags.map((t) => (
              <span key={t} className="detail-hero__tag">
                {t}
              </span>
            ))}
            <span className="detail-hero__tag detail-hero__tag--line">工期 {svc.duration}</span>
          </div>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__price">
          <div className="price price--lg">
            <span className="cur">¥</span>
            {svc.price}
            <span className="unit">/{svc.unit}</span>
          </div>
          <span className="sheet__note">
            <span dangerouslySetInnerHTML={{ __html: ICO_SHIELD }} />
            洗前评估 · 超时赔付
          </span>
        </div>

        <div className="block">
          <div className="block__hd">
            <span className="block__title">服务说明</span>
            <span className="block__en">DETAIL</span>
          </div>
          <div className="block__text">{svc.desc}</div>
        </div>

        <div className="block">
          <div className="block__hd">
            <span className="block__title">服务流程</span>
            <span className="block__en">PROCESS</span>
          </div>
          {FLOW.map((f, i) => (
            <div key={f.no} className="flow__item">
              <div className="flow__rail">
                <div className="flow__no num">{f.no}</div>
                {i < FLOW.length - 1 && <div className="flow__line" />}
              </div>
              <div className="flow__body">
                <div className="flow__name">{f.name}</div>
                <div className="flow__desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="block">
          <div className="block__hd">
            <span className="block__title">保障说明</span>
            <span className="block__en">GUARANTEE</span>
          </div>
          {['洗前逐件拍照评估，确需补差价先电话确认', '贵重装备可保价，赔付规则见下单页', '超出承诺工期按规则赔付，无需申诉'].map((t) => (
            <div key={t} className="guard__item">
              <span dangerouslySetInnerHTML={{ __html: ICO_CHECK }} />
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div className="block">
          <div className="block__hd">
            <span className="block__title">常见问题</span>
            <span className="block__en">FAQ</span>
          </div>
          {FAQS.map((f, i) => (
            <div key={f.q} className="faq__item">
              <button className="faq__q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq__sign">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="faq__a">{f.a}</div>}
            </div>
          ))}
        </div>

        <div className="pad-fixed" />
      </div>

      <div className="bar-fixed">
        <div className="stepper">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="减少数量" dangerouslySetInnerHTML={{ __html: ICO_MINUS }} />
          <span className="stepper__num num">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="增加数量" dangerouslySetInnerHTML={{ __html: ICO_PLUS }} />
        </div>
        <button className="btn btn--primary btn--block" onClick={() => nav({ name: 'booking', param: svc.id, param2: String(qty) })}>
          立即预约 · ¥{svc.price * qty}
        </button>
      </div>
    </>
  )
}

/* ================= 04 确认预约 ================= */
function BookingView({
  state,
  nav,
  id,
  qty,
  toast,
}: {
  state: State
  nav: (r: Route) => void
  id?: string
  qty: number
  toast: (m: string) => void
}) {
  const svc = state.services.find((s) => s.id === id) ?? state.services[0]
  const dates = dateOptions()
  const meta = CAT_META[svc.category]

  const [pickup, setPickup] = useState<'store' | 'door'>('store')
  const [date, setDate] = useState(dates[0])
  const [slot, setSlot] = useState(slotOptions[0])
  const [contact, setContact] = useState(state.contact.name)
  const [phone, setPhone] = useState(state.contact.phone)
  const [address, setAddress] = useState(state.contact.address)
  const [remark, setRemark] = useState('')
  const [gearIds, setGearIds] = useState<string[]>([])
  const [agree, setAgree] = useState(false)
  const cards = api.eligibleCards(svc.id)
  const [payBy, setPayBy] = useState<'wx' | 'card'>(cards.length ? 'card' : 'wx')
  const [cardId, setCardId] = useState(cards[0]?.id ?? '')

  const ship = shipFeeOf(pickup)
  const goods = svc.price * qty
  const total = goods + ship

  const submit = () => {
    if (!contact.trim()) return toast('请填写联系人姓名')
    if (!/^1\d{10}$/.test(phone.trim())) return toast('请填写 11 位手机号')
    if (pickup === 'door' && !address.trim()) return toast('上门取送请填写取件地址')
    if (!agree) return toast('请先阅读并同意服务与赔付规则')
    const order = api.createOrder({
      items: [{ serviceId: svc.id, name: svc.name, price: svc.price, qty }],
      pickupType: pickup,
      date,
      timeSlot: slot,
      contact: contact.trim(),
      phone: phone.trim(),
      address: pickup === 'door' ? address.trim() : '',
      remark: remark.trim(),
      gearIds,
      payBy,
      cardId: payBy === 'card' ? cardId : undefined,
    })
    toast('预约提交成功')
    setTimeout(() => nav({ name: 'order', param: order.orderNo }), 650)
  }

  return (
    <>
      <div className="steps">
        {[
          { no: '01', name: '选服务', state: 'is-done' },
          { no: '02', name: '填信息', state: 'is-current' },
          { no: '03', name: '支付', state: '' },
        ].map((s, i) => (
          <div key={s.no} className={`steps__item ${s.state}`}>
            <div className="steps__dot num">{s.no}</div>
            <span className="steps__name">{s.name}</span>
            {i < 2 && <span className="steps__line" />}
          </div>
        ))}
      </div>

      <div className="card-stack" style={{ marginTop: 8 }}>
        <div className="card sum">
          <div className={`sum__thumb ${meta.tex}`}>
            <span className="sum__no">{meta.no}</span>
          </div>
          <div className="sum__main">
            <div className="sum__name">{svc.name}</div>
            <div className="sum__meta">
              <span>¥{svc.price} / {svc.unit}</span>
              <span>·</span>
              <span>工期 {svc.duration}</span>
            </div>
          </div>
          <span className="sum__qty num">×{qty}</span>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">取送方式</span>
          </div>
          <div className="seg">
            <button className={`seg__item ${pickup === 'store' ? 'is-on' : ''}`} onClick={() => setPickup('store')}>
              <span className="seg__name">到店自送</span>
              <span className="seg__desc">门店当面验收，现场拍照建档</span>
            </button>
            <button className={`seg__item ${pickup === 'door' ? 'is-on' : ''}`} onClick={() => setPickup('door')}>
              <span className="seg__name">上门取送</span>
              <span className="seg__desc">往返运费 ¥12，取送上门</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">期望时间</span>
            <span className="card__hint">收件后次日起算工期</span>
          </div>
          <div className="days">
            {dates.map((d, i) => (
              <button key={d} className={`day ${date === d ? 'is-on' : ''}`} onClick={() => setDate(d)}>
                <span className="day__label">{['明天', '后天', '第3天', '第4天', '第5天', '第6天', '第7天'][i]}</span>
                <span className="day__date num">{d.slice(5)}</span>
              </button>
            ))}
          </div>
          <div className="slots">
            {slotOptions.map((s) => (
              <button key={s} className={`slot ${slot === s ? 'is-on' : ''}`} onClick={() => setSlot(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">联系方式</span>
          </div>
          <div className="field">
            <span className="field__label">联系人</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="您的称呼" />
          </div>
          <div className="field">
            <span className="field__label">手机号</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="用于取送联络" inputMode="numeric" maxLength={11} />
          </div>
          {pickup === 'door' && (
            <div className="field">
              <span className="field__label">取件地址</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="省市区 + 详细地址" />
            </div>
          )}
          <div className="field field--col">
            <span className="field__label">备注</span>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="选填：如袖口压胶开裂、拉链卡顿等" maxLength={200} />
          </div>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">关联装备档案</span>
            <span className="card__hint">完成后自动记录养护历史</span>
          </div>
          {state.gears.length === 0 ? (
            <div className="t-sm" style={{ color: 'var(--ink-400)' }}>
              还没有装备档案，可先到「装备档案」添加
            </div>
          ) : (
            <div className="gear-list">
              {state.gears.map((g) => {
                const on = gearIds.includes(g.id)
                return (
                  <button
                    key={g.id}
                    className={`gear-chip ${on ? 'is-on' : ''}`}
                    onClick={() => setGearIds((ids) => (on ? ids.filter((x) => x !== g.id) : [...ids, g.id]))}
                  >
                    <span className="gear-chip__type">{g.type}</span>
                    <span className="gear-chip__brand">
                      {g.brand} {g.model}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">支付方式</span>
          </div>
          <div className="seg">
            <button className={`seg__item ${payBy === 'wx' ? 'is-on' : ''}`} onClick={() => setPayBy('wx')}>
              <span className="seg__name">微信支付</span>
              <span className="seg__desc">演示环境直接模拟成功</span>
            </button>
            <button
              className={`seg__item ${payBy === 'card' ? 'is-on' : ''}`}
              disabled={!cards.length}
              onClick={() => setPayBy('card')}
            >
              <span className="seg__name">次卡抵扣</span>
              <span className="seg__desc">{cards.length ? `可用 ${cards.length} 张` : '本服务无可用次卡'}</span>
            </button>
          </div>
          {payBy === 'card' && cards.length > 0 && (
            <div className="gear-list" style={{ marginTop: 8 }}>
              {cards.map((c) => (
                <button key={c.id} className={`gear-chip ${cardId === c.id ? 'is-on' : ''}`} onClick={() => setCardId(c.id)}>
                  <span className="gear-chip__type">{c.name}</span>
                  <span className="gear-chip__brand">剩 {c.total - c.used} 次</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">费用明细</span>
          </div>
          <div className="fee">
            <span className="fee__k">
              服务费（{svc.name} × {qty}）
            </span>
            <span className="fee__v num">¥{goods}</span>
          </div>
          <div className="fee">
            <span className="fee__k">取送费</span>
            <span className="fee__v num">{ship ? `¥${ship}` : '¥0'}</span>
          </div>
          <div className="fee fee--total">
            <span className="fee__k">应付合计</span>
            <span className="price price--sm fee__total">
              <span className="cur">¥</span>
              {total}
            </span>
          </div>
        </div>

        <button className="agree" onClick={() => setAgree(!agree)}>
          <span className={`agree__box ${agree ? 'is-on' : ''}`}>
            {agree && <span dangerouslySetInnerHTML={{ __html: ICO_CHECK }} />}
          </span>
          <span className="agree__text">
            我已阅读并同意<b>《洗护服务与赔付规则》</b>，洗前评估确需补差价的，将先与我电话确认。
          </span>
        </button>
      </div>

      <div className="pad-fixed" />

      <div className="bar-fixed">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span className="t-cap">应付</span>
          <span className="price price--md">
            <span className="cur">¥</span>
            {total}
          </span>
        </div>
        <button className="btn btn--brass btn--block" onClick={submit}>
          提交订单
        </button>
      </div>
    </>
  )
}

/* ================= 05 我的订单 ================= */
function OrdersView({ state, nav }: { state: State; nav: (r: Route) => void }) {
  const [f, setF] = useState<'all' | 'doing' | 'done'>('all')
  const counts = {
    all: state.orders.length,
    doing: state.orders.filter((o) => o.status >= 2 && o.status <= 5).length,
    done: state.orders.filter((o) => o.status === 6).length,
  }
  const list = state.orders.filter((o) => (f === 'all' ? true : f === 'doing' ? o.status >= 2 && o.status <= 5 : o.status === 6))
  const texs = ['tex-bead', 'tex-stitch', 'tex-rain', 'tex-grid']

  return (
    <>
      <div className="tabs">
        {[
          { k: 'all', t: '全部' },
          { k: 'doing', t: '进行中' },
          { k: 'done', t: '已完成' },
        ].map((x) => (
          <button key={x.k} className={`tabs__item ${f === x.k ? 'is-on' : ''}`} onClick={() => setF(x.k as typeof f)}>
            <span className="tabs__name">{x.t}</span>
            {counts[x.k as keyof typeof counts] > 0 && <span className="tabs__count num">{counts[x.k as keyof typeof counts]}</span>}
          </button>
        ))}
      </div>

      <div className="card-stack" style={{ marginTop: 10 }}>
        {list.map((o, i) => {
          const meta = STATUS_META[o.status] ?? STATUS_META[1]
          return (
            <button
              key={o.orderNo}
              className="order fade-up"
              style={{ animationDelay: `${i * 45}ms` }}
              onClick={() => nav({ name: 'order', param: o.orderNo })}
            >
              <div className="order__hd">
                <span className="order__no num">{o.orderNo}</span>
                <span className={`status status--${meta.cls}`}>
                  <span className="dot" />
                  {STATUS[o.status]}
                </span>
              </div>
              <div className="order__items">
                {o.items.map((it, i) => (
                  <div key={it.serviceId + i} className="order__item">
                    <span className={`order__thumb ${texs[i % texs.length]}`} />
                    <div className="order__info">
                      <div className="order__name">{it.name}</div>
                      <div className="order__spec">
                        件 × {it.qty}
                      </div>
                    </div>
                    <span className="order__price num">¥{it.price * it.qty}</span>
                  </div>
                ))}
              </div>
              <div className={`order__hint${o.status === 1 ? ' order__hint--warn' : ''}`}>{meta.hint}</div>
              <div className="order__ft">
                <span className="order__time">
                  <span dangerouslySetInnerHTML={{ __html: ICO_CLOCK }} />
                  {o.date} {o.timeSlot}
                </span>
                <span className="order__total">
                  合计
                  <span className="price price--sm">
                    <span className="cur">¥</span>
                    {o.total}
                  </span>
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {list.length === 0 && (
        <div className="empty">
          <span dangerouslySetInnerHTML={{ __html: ILLO_ORDER }} />
          <div className="empty__title">还没有订单</div>
          <div className="empty__desc">把装备交给专业的人，它值得一次彻底的清洁</div>
          <div className="empty__btn">
            <button className="btn btn--primary btn--sm" onClick={() => nav({ name: 'services' })}>
              去预约服务
            </button>
          </div>
        </div>
      )}

      <div className="pad-tabbar" />
    </>
  )
}

/* ================= 06 订单详情 ================= */
function OrderDetailView({
  state,
  nav,
  no,
  toast,
  confirm,
}: {
  state: State
  nav: (r: Route) => void
  no?: string
  toast: (m: string) => void
  confirm: (t: string, x: string, ok: () => void, okText?: string) => void
}) {
  const o = state.orders.find((x) => x.orderNo === no)
  if (!o) {
    return (
      <div className="empty">
        <span dangerouslySetInnerHTML={{ __html: ILLO_ORDER }} />
        <div className="empty__title">订单不存在或已取消</div>
      </div>
    )
  }
  const meta = STATUS_META[o.status] ?? STATUS_META[1]
  const goods = o.items.reduce((s, it) => s + it.price * it.qty, 0)

  return (
    <>
      <div className="status-card">
        <div className="status-card__hd">
          <div>
            <div className="status-card__kicker">ORDER STATUS</div>
            <div className="status-card__name">{STATUS[o.status]}</div>
          </div>
          <div className="status-card__step">
            <b className="num">{o.status}</b>
            <span>/ 6</span>
          </div>
        </div>
        <div className="status-card__hint">{meta.hint}</div>
        <div className="prog">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <span key={s} className={`prog__seg${s <= o.status ? ' is-filled' : ''}${s === o.status ? ' is-current' : ''}`} />
          ))}
        </div>
        <div className="prog__phases">
          {PHASES.map((p) => (
            <span
              key={p.name}
              className={`prog__phase${o.status >= p.range[0] && o.status <= p.range[1] ? ' is-active' : o.status > p.range[1] ? ' is-done' : ''}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="card-stack" style={{ marginTop: 10 }}>
        <div className="card">
          <div className="card__hd">
            <span className="card__title">洗前 / 洗后</span>
            <span className="card__en">BEFORE · AFTER</span>
          </div>
          <div className="compare">
            <div className="compare__col">
              <div className="compare__frame tex-rain">
                <span className="compare__tag">洗前</span>
              </div>
              <div className="compare__cap">收件时实拍留档</div>
            </div>
            <div className="compare__col">
              <div className="compare__frame tex-bead">
                <span className="compare__tag">洗后</span>
              </div>
              <div className="compare__cap">质检后实拍对比</div>
            </div>
          </div>
          <div className="compare__note">
            <span dangerouslySetInnerHTML={{ __html: ICO_SHIELD }} />
            <span>清洗完成后，工坊将在此上传洗前洗后对比图，作为质量凭证</span>
          </div>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">订单信息</span>
          </div>
          <div className="kv">
            <span className="kv__k">订单编号</span>
            <span className="kv__v num">
              {o.orderNo}
              <span className="copy" onClick={() => toast('单号已复制')}>
                复制
              </span>
            </span>
          </div>
          <div className="kv">
            <span className="kv__k">下单时间</span>
            <span className="kv__v num">{fmtDate(o.createdAt)}</span>
          </div>
          <div className="kv">
            <span className="kv__k">取送方式</span>
            <span className="kv__v">{o.pickupType === 'store' ? '到店自送' : '上门取送'}</span>
          </div>
          <div className="kv">
            <span className="kv__k">期望时间</span>
            <span className="kv__v">
              {o.date} {o.timeSlot}
            </span>
          </div>
          <div className="kv">
            <span className="kv__k">联系人</span>
            <span className="kv__v">
              {o.contact} · {o.phone}
            </span>
          </div>
          {o.address && (
            <div className="kv">
              <span className="kv__k">地址</span>
              <span className="kv__v">{o.address}</span>
            </div>
          )}
          {o.remark && (
            <div className="kv">
              <span className="kv__k">备注</span>
              <span className="kv__v">{o.remark}</span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">费用明细</span>
          </div>
          {o.items.map((it, i) => (
            <div key={it.serviceId + i} className="fee">
              <span className="fee__k">
                {it.name} × {it.qty}
              </span>
              <span className="fee__v num">¥{it.price * it.qty}</span>
            </div>
          ))}
          {o.shipFee > 0 && (
            <div className="fee">
              <span className="fee__k">上门取送运费</span>
              <span className="fee__v num">¥{o.shipFee}</span>
            </div>
          )}
          <div className="fee fee--total">
            <span className="fee__k">合计</span>
            <span className="price price--sm fee__total">
              <span className="cur">¥</span>
              {o.total}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">进度留痕</span>
            <span className="card__en">TIMELINE</span>
          </div>
          {o.timeline.map((t, i) => (
            <div key={i} className="tl__item">
              <div className="tl__rail">
                <div className="tl__dot" />
                {i < o.timeline.length - 1 && <div className="tl__line" />}
              </div>
              <div className="tl__body">
                <div className="tl__text">{t.text}</div>
                <div className="tl__time num">{fmtDate(t.time)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card__hd">
            <span className="card__title">服务门店</span>
          </div>
          <div className="store-row">
            <div className="store-row__main">
              <div className="store-row__name">户外装备洗护工坊</div>
              <div className="store-row__meta">{BRAND.address}</div>
            </div>
            <button className="store-row__call" onClick={callStore} aria-label="拨打电话" dangerouslySetInnerHTML={{ __html: ICO_PHONE }} />
          </div>
        </div>

        {o.status === 1 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn--danger btn--sm"
              style={{ flex: 1 }}
              onClick={() =>
                confirm('取消订单', '确定取消这笔待支付订单吗？', () => {
                  api.cancelOrder(o.orderNo)
                  toast('订单已取消')
                  setTimeout(() => nav({ name: 'orders' }), 500)
                }, '取消订单')
              }
            >
              取消订单
            </button>
            <button
              className="btn btn--brass btn--sm"
              style={{ flex: 2 }}
              onClick={() => {
                const firstItem = o.items[0]?.serviceId ?? ''
                if (o.payBy === 'card') {
                  const card = o.cardId
                    ? state.packages.find((p) => p.id === o.cardId && p.used < p.total && p.serviceIds.includes(firstItem))
                    : undefined
                  if (card) {
                    api.payOrder(o.orderNo, 'card', card.id)
                    toast(`已用「${card.name}」核销 1 次（演示）`)
                  } else {
                    api.payOrder(o.orderNo, 'wx')
                    toast('次卡不可用，已切换为模拟微信支付')
                  }
                } else {
                  api.payOrder(o.orderNo, 'wx')
                  toast('微信支付成功（演示）')
                }
              }}
            >
              立即支付（演示）
            </button>
          </div>
        )}

        {o.status >= 2 && o.status < 6 && (
          <button
            className="demo-tip"
            onClick={() => {
              api.advanceOrder(o.orderNo)
              toast('订单状态已推进（演示）')
            }}
          >
            演示模式 · 点此推进订单状态
          </button>
        )}
      </div>

      <div className="pad-fixed" />

      <div className="bar-fixed">
        <button className="btn btn--plain btn--sm" onClick={callStore}>
          联系门店
        </button>
        <button className="btn btn--primary btn--block" onClick={() => nav({ name: 'services' })}>
          再来一单
        </button>
      </div>
    </>
  )
}

/* ================= 07 装备档案 ================= */
const GEAR_META: Record<string, { tex: string; en: string }> = {
  冲锋衣: { tex: 'tex-bead', en: 'SHELL' },
  羽绒服: { tex: 'tex-rain', en: 'DOWN' },
  帐篷: { tex: 'tex-grid', en: 'TENT' },
  登山鞋: { tex: 'tex-stitch', en: 'BOOTS' },
  睡袋: { tex: 'tex-rain', en: 'SLEEP' },
  背包: { tex: 'tex-grid', en: 'PACK' },
  其他: { tex: 'tex-bead', en: 'GEAR' },
}

function GearView({
  state,
  nav,
  confirm,
  toast,
}: {
  state: State
  nav: (r: Route) => void
  confirm: (t: string, x: string, ok: () => void, okText?: string) => void
  toast: (m: string) => void
}) {
  const careCount = state.gears.reduce((n, g) => n + g.records.length, 0)
  return (
    <>
      <div className="ledger">
        <div className="ledger__hd">
          <div>
            <div className="ledger__kicker">MY GEAR ARCHIVE</div>
            <div className="ledger__title">装备档案</div>
          </div>
          <button className="ledger__add" onClick={() => nav({ name: 'gearEdit' })} aria-label="添加装备" dangerouslySetInnerHTML={{ __html: ICO_PLUS }} />
        </div>
        <div className="ledger__stats">
          <div className="ledger__stat">
            <span className="ledger__num num">{state.gears.length}</span>
            <span className="ledger__label">件装备在册</span>
          </div>
          <div className="ledger__stat">
            <span className="ledger__num num">{careCount}</span>
            <span className="ledger__label">次养护记录</span>
          </div>
        </div>
        <div className="ledger__tip">为每件装备建立档案，养护记录自动沉淀，季末提醒不错过</div>
      </div>

      {state.gears.length > 0 ? (
        <div className="card-stack" style={{ marginTop: 10 }}>
          {state.gears.map((g) => {
            const meta = GEAR_META[g.type] ?? GEAR_META['其他']
            return (
              <div key={g.id} className="gear">
                <button className="gear__hd" onClick={() => nav({ name: 'gearEdit', param: g.id })}>
                  <div className={`gear__thumb ${meta.tex}`}>
                    <span className="gear__en">{meta.en}</span>
                  </div>
                  <div className="gear__main">
                    <div className="gear__title">
                      <span className="gear__type">{g.type}</span>
                      <span className="gear__brand">{g.brand}</span>
                    </div>
                    {g.model && <div className="gear__model">{g.model}</div>}
                    <div className="gear__meta">
                      购于 {g.boughtAt} · {g.usage}
                    </div>
                  </div>
                  <span className="gear__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
                </button>

                {g.note && <div className="gear__note">备注：{g.note}</div>}

                <div className="gear__records">
                  <div className="gear__records-hd">
                    <span className="gear__records-title">养护记录</span>
                    <span className="gear__records-count num">{g.records.length}</span>
                  </div>
                  {g.records.length === 0 ? (
                    <div className="gear__records-empty">完成首次服务后自动生成</div>
                  ) : (
                    g.records.map((r, i) => (
                      <div key={i} className="rec">
                        <span className="rec__dot" />
                        <span className="rec__date num">{r.date}</span>
                        <span className="rec__type">{r.type}</span>
                        <span className="rec__no num">{r.orderNo}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="gear__ops">
                  <button className="gear__op" onClick={() => nav({ name: 'gearEdit', param: g.id })}>
                    编辑
                  </button>
                  <button
                    className="gear__op gear__op--danger"
                    onClick={() =>
                      confirm('删除装备', `确定删除「${g.brand} ${g.model}」的档案吗？`, () => {
                        api.deleteGear(g.id)
                        toast('档案已删除')
                      }, '删除')
                    }
                  >
                    删除
                  </button>
                </div>
              </div>
            )
          })}
          <button className="add-more" onClick={() => nav({ name: 'gearEdit' })}>
            <span dangerouslySetInnerHTML={{ __html: ICO_PLUS }} />
            添加装备
          </button>
        </div>
      ) : (
        <div className="empty">
          <span dangerouslySetInnerHTML={{ __html: ILLO_GEAR }} />
          <div className="empty__title">还没有装备档案</div>
          <div className="empty__desc">建一次档，之后每次洗护都会自动记进它的履历</div>
          <div className="empty__btn">
            <button className="btn btn--primary btn--sm" onClick={() => nav({ name: 'gearEdit' })}>
              添加第一件装备
            </button>
          </div>
        </div>
      )}

      <div className="pad-tabbar" />
    </>
  )
}

/* ================= 07b 装备编辑 ================= */
function GearEditView({
  state,
  nav,
  id,
  toast,
}: {
  state: State
  nav: (r: Route) => void
  id?: string
  toast: (m: string) => void
}) {
  const editing = state.gears.find((g) => g.id === id)
  const [type, setType] = useState(editing?.type ?? GEARTYPES[0])
  const [brand, setBrand] = useState(editing?.brand ?? '')
  const [model, setModel] = useState(editing?.model ?? '')
  const [boughtAt, setBoughtAt] = useState(editing?.boughtAt ?? '')
  const [usage, setUsage] = useState(editing?.usage ?? USAGES[1])
  const [note, setNote] = useState(editing?.note ?? '')

  const save = () => {
    if (!brand.trim()) return toast('请填写品牌')
    api.saveGear({ id: editing?.id, type, brand: brand.trim(), model: model.trim(), boughtAt: boughtAt.trim(), usage, note: note.trim() })
    toast('已保存')
    setTimeout(() => nav({ name: 'gear' }), 500)
  }

  return (
    <>
      <div className="card-stack" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card__hd">
            <span className="card__title">基础信息</span>
            <span className="card__en">{editing ? 'EDIT' : 'NEW'}</span>
          </div>
          <div className="field field--col">
            <span className="field__label">装备类型</span>
            <div className="slots">
              {GEARTYPES.map((t) => (
                <button key={t} className={`slot ${type === t ? 'is-on' : ''}`} onClick={() => setType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="field__label">品牌</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="如：始祖鸟 / 探路者" />
          </div>
          <div className="field">
            <span className="field__label">型号</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="选填" />
          </div>
          <div className="field">
            <span className="field__label">购买时间</span>
            <input value={boughtAt} onChange={(e) => setBoughtAt(e.target.value)} placeholder="YYYY-MM，如 2023-10" />
          </div>
          <div className="field field--col">
            <span className="field__label">使用强度</span>
            <div className="slots">
              {USAGES.map((u) => (
                <button key={u} className={`slot ${usage === u ? 'is-on' : ''}`} onClick={() => setUsage(u)}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="field field--col">
            <span className="field__label">备注</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="选填：已知的破损、补胶情况等" maxLength={200} />
          </div>
        </div>

        {editing && editing.records.length > 0 && (
          <div className="card">
            <div className="card__hd">
              <span className="card__title">养护记录</span>
              <span className="card__en">{editing.records.length} RECORDS</span>
            </div>
            {editing.records.map((r, i) => (
              <div key={i} className="rec">
                <span className="rec__dot" />
                <span className="rec__date num">{r.date}</span>
                <span className="rec__type">{r.type}</span>
                <span className="rec__no num">{r.orderNo}</span>
              </div>
            ))}
          </div>
        )}

        <div className="t-micro" style={{ padding: '0 4px' }}>
          建档后，每次洗护完成都会自动写入养护记录，季末提醒也会据此推送。
        </div>
      </div>

      <div className="pad-fixed" />

      <div className="bar-fixed">
        <button className="btn btn--primary btn--block" onClick={save}>
          保存档案
        </button>
      </div>
    </>
  )
}

/* ================= 文章列表 / 详情 ================= */
function ArticlesView({ state, nav }: { state: State; nav: (r: Route) => void }) {
  const texs = ['tex-bead', 'tex-rain', 'tex-grid', 'tex-stitch']
  const featured = state.articles[0]
  const rest = state.articles.slice(1)
  const readMin = (n: number) => Math.max(3, Math.round(n * 1.2))

  return (
    <>
      <div className="intro">
        <div className="intro__title">养护手册</div>
        <div className="intro__desc">洗护前花三分钟，装备能多穿三年</div>
      </div>

      {featured && (
        <button className="featured" onClick={() => nav({ name: 'article', param: featured.id })}>
          <div className={`featured__cover ${texs[0]}`}>
            <span className="featured__no num">01</span>
            <span className="featured__badge">编辑推荐</span>
          </div>
          <div className="featured__body">
            <div className="featured__title">{featured.title}</div>
            <div className="featured__sum clamp-2">{featured.summary}</div>
            <div className="featured__meta">
              <span>阅读约 {readMin(featured.content.length)} 分钟</span>
              <span className="featured__more">
                阅读
                <span dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
              </span>
            </div>
          </div>
        </button>
      )}

      <div className="card-stack" style={{ marginTop: 10 }}>
        {rest.map((a, i) => (
          <button key={a.id} className="item" onClick={() => nav({ name: 'article', param: a.id })}>
            <div className={`item__thumb ${texs[(i + 1) % texs.length]}`}>
              <span className="item__no num">0{i + 2}</span>
            </div>
            <div className="item__body">
              <div className="item__title clamp-2">{a.title}</div>
              <div className="item__meta">阅读约 {readMin(a.content.length)} 分钟</div>
            </div>
            <span className="item__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
          </button>
        ))}
      </div>

      {state.articles.length === 0 && (
        <div className="empty">
          <span dangerouslySetInnerHTML={{ __html: ILLO_ARTICLE }} />
          <div className="empty__title">暂无内容</div>
          <div className="empty__desc">工坊正在整理养护手册，稍后再来看看</div>
        </div>
      )}

      <div className="pad-bottom" />
    </>
  )
}

function ArticleDetailView({ state, nav, id }: { state: State; nav: (r: Route) => void; id?: string }) {
  const a = state.articles.find((x) => x.id === id)
  if (!a) {
    return (
      <div className="empty">
        <span dangerouslySetInnerHTML={{ __html: ILLO_ARTICLE }} />
        <div className="empty__title">文章不存在</div>
      </div>
    )
  }
  const svc = state.services.find((s) => s.id === a.serviceId)
  const paras = a.content.map((raw, i) => ({
    no: i < 9 ? '0' + (i + 1) : String(i + 1),
    // 正文自带「1. 2.」序号时剥掉，避免与左侧编号列重复
    text: String(raw).replace(/^\s*\d+\s*[.、)）]\s*/, ''),
  }))

  return (
    <>
      <div className="article">
        <div className="article__kicker">
          <span className="rule-brass" />
          <span>GEAR CARE NOTES</span>
        </div>
        <div className="article__title">{a.title}</div>
        <div className="article__meta">{a.summary}</div>
        <div className="article__hr" />
        {paras.map((p) => (
          <div key={p.no} className="para">
            <span className="para__idx num">{p.no}</span>
            <span className="para__text">{p.text}</span>
          </div>
        ))}
        <div className="article__end">
          <span className="rule-brass" />
          <span>END</span>
          <span className="rule-brass" />
        </div>
      </div>

      {svc && (
        <button className="cta" onClick={() => nav({ name: 'service', param: svc.id })}>
          <div className="cta__main">
            <div className="cta__kicker">RELATED SERVICE</div>
            <div className="cta__name">{svc.name}</div>
            <div className="cta__meta">
              ¥{svc.price}/{svc.unit} · 工期 {svc.duration}
            </div>
          </div>
          <span className="cta__btn">
            去预约
            <span dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
          </span>
        </button>
      )}

      <div className="pad-bottom" />
    </>
  )
}

/* ================= 08 会员次卡 ================= */
function MemberView({
  state,
  toast,
  confirm,
}: {
  state: State
  toast: (m: string) => void
  confirm: (t: string, x: string, ok: () => void, okText?: string) => void
}) {
  const seedPkgs: Pkg[] = [
    { id: 'p1', name: '季前焕新次卡', total: 4, used: 0, price: 399, scope: '冲锋衣/羽绒服清洗 任选4次', expire: '2027-04-30', status: 'active', serviceIds: ['s1', 's2'] },
    { id: 'p2', name: '鞋靴双次卡', total: 2, used: 1, price: 118, scope: '登山鞋深度清洁 除菌除臭 2次', expire: '2027-12-31', status: 'active', serviceIds: ['s4'] },
  ]
  const benefits = [
    { icon: ICO_TUNE, name: '按次核销', desc: '预约自动抵扣' },
    { icon: ICO_SHIELD, name: '未启用可退', desc: '有效期明示' },
    { icon: ICO_CLOCK, name: '季前提醒', desc: '换季提前提醒' },
  ]

  return (
    <>
      <div className="member">
        <div className="member__hd">
          <div>
            <div className="member__kicker">MEMBERSHIP CARD</div>
            <div className="member__title">洗护次卡</div>
          </div>
          <div className="member__seal">
            <span>季前</span>
            <span>焕新</span>
          </div>
        </div>
        <div className="member__desc">按次购买的洗护套餐，用多少扣多少，不用不消耗</div>
      </div>

      <div className="benefits">
        {benefits.map((b) => (
          <div key={b.name} className="benefit">
            <span dangerouslySetInnerHTML={{ __html: b.icon }} />
            <div className="benefit__name">{b.name}</div>
            <div className="benefit__desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">我的次卡</span>
            <span className="section__sub">MY CARDS</span>
          </div>
        </div>
        <div className="card-stack">
          {state.packages.map((p) => (
            <div key={p.id} className="pkg">
              <div className="pkg__hd">
                <span className="pkg__name">{p.name}</span>
                <span className="price price--sm">
                  <span className="cur">¥</span>
                  {p.price}
                </span>
              </div>
              <div className="pkg__scope">{p.scope}</div>
              <div className="pkg__bar">
                <span className="pkg__track">
                  <span className="pkg__fill" style={{ width: `${(p.used / p.total) * 100}%` }} />
                </span>
                <span className="pkg__bar-text num">
                  已用 {p.used}/{p.total}
                </span>
              </div>
              <div className="pkg__ft">
                <span className="pkg__expire">
                  <span dangerouslySetInnerHTML={{ __html: ICO_CLOCK }} />
                  有效期至 {p.expire}
                </span>
                <span className="pkg__ops">
                  {p.total - p.used > 0 && (
                    <button className="btn btn--sm btn--plain" onClick={() => toast('到店出示核销码即可使用（演示）')}>
                      核销一次
                    </button>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__hd">
          <div className="row">
            <span className="section__title">可购次卡</span>
            <span className="section__sub">BUY</span>
          </div>
        </div>
        <div className="card-stack">
          {seedPkgs.map((p) => (
            <div key={'seed' + p.id} className="pkg">
              <div className="pkg__hd">
                <span className="pkg__name">{p.name}</span>
                <span className="price price--sm">
                  <span className="cur">¥</span>
                  {p.price}
                </span>
              </div>
              <div className="pkg__scope">{p.scope}</div>
              <div className="pkg__ft">
                <span className="pkg__expire">购买后 {p.expire} 前有效</span>
                <span className="pkg__ops">
                  <button
                    className="btn btn--sm btn--primary"
                    onClick={() =>
                      confirm('购买次卡', `确认以 ¥${p.price} 购买「${p.name}」吗？演示模式将模拟支付成功。`, () => {
                        api.buyPackage(p.id)
                        toast('购买成功（演示支付）')
                      }, '模拟支付')
                    }
                  >
                    立即购买
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="card card--brass" style={{ margin: '0 var(--gutter)' }}>
          <div className="rules__title">次卡规则</div>
          {[
            '次卡为服务套餐商品，非储值卡，不可提现、不可转让。',
            '限本人使用，预约时选择对应服务自动核销，无需额外支付。',
            '有效期自购买之日起计算并在卡面明示，未启用支持退款。',
            '如遇门店价目调整，已购次卡按购买时权益执行。',
          ].map((t) => (
            <div key={t} className="rules__item">
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="pad-bottom" />
    </>
  )
}

/* ================= 09 我的 ================= */
function ProfileView({
  state,
  nav,
  toast,
  confirm,
}: {
  state: State
  nav: (r: Route) => void
  toast: (m: string) => void
  confirm: (t: string, x: string, ok: () => void, okText?: string) => void
}) {
  const counts = {
    orders: state.orders.length,
    gears: state.gears.length,
    cards: state.packages.filter((p) => p.total > p.used).length,
  }
  const menus = [
    { icon: ICO_RECEIPT, name: '我的订单', route: 'orders', badge: counts.orders },
    { icon: ICO_BOX, name: '装备档案', route: 'gear', badge: 0 },
    { icon: ICO_STAR, name: '会员次卡', route: 'member', badge: 0 },
    { icon: ICO_BOOK, name: '养护知识', route: 'articles', badge: 0 },
  ]

  return (
    <>
      <div className="phead">
        <div className="phead__bar">我的</div>
        <div className="phead__body">
          <div className="phead__avatar">布</div>
          <div className="phead__info">
            <div className="phead__name">户外装备的主人</div>
            <div className="phead__tag">
              <span dangerouslySetInnerHTML={{ __html: ICO_STAR }} />
              次卡会员
            </div>
          </div>
        </div>
        <div className="phead__stats">
          <button className="phead__stat" onClick={() => nav({ name: 'orders' })}>
            <span className="phead__num num">{counts.orders}</span>
            <span className="phead__label">订单</span>
          </button>
          <button className="phead__stat" onClick={() => nav({ name: 'gear' })}>
            <span className="phead__num num">{counts.gears}</span>
            <span className="phead__label">装备</span>
          </button>
          <button className="phead__stat" onClick={() => nav({ name: 'member' })}>
            <span className="phead__num num">{counts.cards}</span>
            <span className="phead__label">可用次卡</span>
          </button>
        </div>
      </div>

      <div className="card-stack" style={{ marginTop: 12 }}>
        <div className="card menu">
          {menus.map((m) => (
            <button key={m.name} className="cell" onClick={() => nav({ name: m.route })}>
              <span className="cell__label">
                <span className="menu__ico" dangerouslySetInnerHTML={{ __html: m.icon }} />
                {m.name}
              </span>
              <span className="cell__value">
                {m.badge > 0 && <span className="menu__count num">{m.badge}</span>}
                <span className="cell__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
              </span>
            </button>
          ))}
        </div>

        <div className="card menu">
          <button className="cell" onClick={callStore}>
            <span className="cell__label">
              <span className="menu__ico" dangerouslySetInnerHTML={{ __html: ICO_PHONE }} />
              联系门店
            </span>
            <span className="cell__value">
              {BRAND.hours}
              <span className="cell__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
            </span>
          </button>
          <button className="cell" onClick={() => toast('演示版：接入微信客服后可用')}>
            <span className="cell__label">
              <span className="menu__ico" dangerouslySetInnerHTML={{ __html: ICO_USER }} />
              在线客服
            </span>
            <span className="cell__value">
              <span className="cell__arrow" dangerouslySetInnerHTML={{ __html: ICO_CHEV_R }} />
            </span>
          </button>
        </div>

        <div className="store-card">
          <div className="store-card__hd">
            <div className="store-card__name">户外装备洗护工坊</div>
            <div className="stamp">
              <span>QC</span>
              <span>PASS</span>
            </div>
          </div>
          <div className="store-card__meta">{BRAND.address}</div>
          <div className="store-card__meta">营业时间 {BRAND.hours} · 周一至周日</div>
        </div>
      </div>

      <div className="footer">
        <div className="footer__ver">布仕曼洗护 v2.0 · 户外装备洗护</div>
        <div
          className="footer__reset"
          onClick={() =>
            confirm('重置演示数据', '将清空本机保存的订单、装备、次卡并恢复演示初始数据，确定吗？', () => {
              store.reset()
              toast('已重置为演示数据')
            })
          }
        >
          清除演示数据
        </div>
      </div>

      <div className="pad-tabbar" />
    </>
  )
}
