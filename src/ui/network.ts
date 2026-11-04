import { appStore, type AppState } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { LINKS } from '../data/links'
import { KIND_COLOR } from '../scene/LinkArcs'

interface NetNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  start: number
  end: number
  importance: number
}

interface NetLink {
  from: number
  to: number
  kind: keyof typeof KIND_COLOR
  zh: string
}

const KIND_ZH: Record<string, { zh: string; en: string }> = {
  'direct-cause': { zh: '直接因果', en: 'Direct cause' },
  'indirect-influence': { zh: '间接影响', en: 'Indirect influence' },
  background: { zh: '背景条件', en: 'Background' },
  related: { zh: '历史关联', en: 'Related' },
  reaction: { zh: '回应反应', en: 'Reaction' },
  continuation: { zh: '延续发展', en: 'Continuation' },
}

/**
 * 二维因果网络视图（V1.0-M4，总任务书 §7.3）：
 * 节点=事件（半径=重要度、颜色=类型），连线=关系（颜色=kind 六类）。
 * 与 3D 地球共享同一套数据与 store（selectedId 双向同步），不维护第二套关系数据。
 * 力导向布局只计算一次（数据集静态）；支持平移/缩放/节点拖拽/悬停/选中。
 */
export function initNetwork(): void {
  const toggle = document.getElementById('network-toggle') as HTMLButtonElement
  const overlay = document.getElementById('network-overlay') as HTMLElement
  const canvas = document.getElementById('network-canvas') as HTMLCanvasElement
  const closeBtn = document.getElementById('network-close') as HTMLButtonElement
  const openBtn = document.getElementById('network-open-globe') as HTMLButtonElement

  const ctx = canvas.getContext('2d')!
  let open = false
  let viewX = 0
  let viewY = 0
  let scale = 1
  let hoveredId: string | null = null
  let dragNodeId: number | null = null
  let panLast: { x: number; y: number } | null = null
  let dirty = true

  // ---- 布局：力导向预计算一次（119 节点 / 32 边，O(n²)×300 可忽略） ----
  const nodes: NetNode[] = EVENTS.map((ev) => ({
    id: ev.id,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 4 + ev.importance * 2.2,
    color: EVENT_TYPES[ev.type].color,
    start: ev.start,
    end: ev.end,
    importance: ev.importance,
  }))
  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const links: NetLink[] = []
  for (const l of LINKS) {
    const a = nodeById.get(l.from)
    const b = nodeById.get(l.to)
    if (!a || !b) continue
    links.push({ from: nodes.indexOf(a), to: nodes.indexOf(b), kind: l.kind, zh: l.zh })
  }

  const computeLayout = (): void => {
    // 初始：按年代排布的环形网格，避免中心挤压
    const w = 1400
    const h = 900
    nodes.forEach((n, i) => {
      const col = i % 16
      const row = Math.floor(i / 16)
      n.x = (col + 0.5) * (w / 16) + (Math.random() - 0.5) * 20
      n.y = (row + 0.5) * (h / Math.ceil(nodes.length / 16)) + (Math.random() - 0.5) * 20
    })
    const repul = 2600
    const spring = 0.02
    for (let iter = 0; iter < 300; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let d2 = dx * dx + dy * dy
          if (d2 < 1) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
            d2 = 1
          }
          const f = repul / d2
          const d = Math.sqrt(d2)
          const fx = (dx / d) * f
          const fy = (dy / d) * f
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }
      }
      for (const l of links) {
        const a = nodes[l.from]
        const b = nodes[l.to]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const rest = 130
        const f = (d - rest) * spring
        a.vx += (dx / d) * f
        a.vy += (dy / d) * f
        b.vx -= (dx / d) * f
        b.vy -= (dy / d) * f
      }
      for (const n of nodes) {
        // 轻微向心 + 阻尼
        n.vx += (w / 2 - n.x) * 0.0015
        n.vy += (h / 2 - n.y) * 0.0015
        n.vx *= 0.85
        n.vy *= 0.85
        n.x += Math.max(-14, Math.min(14, n.vx))
        n.y += Math.max(-14, Math.min(14, n.vy))
      }
    }
  }
  computeLayout()

  // ---- 画布尺寸 ----
  const resize = (): void => {
    const rect = canvas.parentElement!.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    dirty = true
  }
  window.addEventListener('resize', resize)

  // ---- 渲染 ----
  const draw = (): void => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const selectedId = appStore.getState().selectedId
    const neighbors = new Set<string>()
    if (selectedId) {
      for (const l of LINKS) {
        if (l.from === selectedId) neighbors.add(l.to)
        if (l.to === selectedId) neighbors.add(l.from)
      }
    }

    ctx.save()
    ctx.translate(viewX, viewY)
    ctx.scale(scale, scale)

    // 连线
    for (const l of links) {
      const a = nodes[l.from]
      const b = nodes[l.to]
      const dim =
        selectedId && a.id !== selectedId && b.id !== selectedId && !neighbors.has(a.id) && !neighbors.has(b.id)
      ctx.strokeStyle = KIND_COLOR[l.kind]
      ctx.globalAlpha = dim ? 0.1 : 0.75
      ctx.lineWidth = l.kind === 'direct-cause' ? 1.8 : 1.1
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // 节点 + 标签（放大或选中/悬停时显示）
    const showLabels = scale > 1.35
    for (const n of nodes) {
      const isSel = n.id === selectedId
      const isNb = selectedId !== null && neighbors.has(n.id)
      const dim = selectedId !== null && !isSel && !isNb
      ctx.globalAlpha = dim ? 0.25 : 1
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = n.color
      ctx.fill()
      if (isSel || n.id === hoveredId) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (isNb) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      if (showLabels || isSel || n.id === hoveredId) {
        const ev = EVENTS.find((e) => e.id === n.id)
        if (ev) {
          ctx.font = `${isSel ? 600 : 400} 11px -apple-system, 'PingFang SC', sans-serif`
          ctx.fillStyle = isSel ? '#e8eefc' : 'rgba(232,238,252,0.75)'
          ctx.textAlign = 'center'
          ctx.fillText(ev.title.zh, n.x, n.y - n.r - 5)
        }
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  const requestFrame = (): void => {
    if (!open) return
    if (dirty) {
      dirty = false
      draw()
    }
    requestAnimationFrame(requestFrame)
  }

  // ---- 交互 ----
  const toWorld = (clientX: number, clientY: number): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect()
    return { x: (clientX - rect.left - viewX) / scale, y: (clientY - rect.top - viewY) / scale }
  }

  const nodeAt = (wx: number, wy: number): number | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = wx - n.x
      const dy = wy - n.y
      if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) return i
    }
    return null
  }

  canvas.addEventListener('pointerdown', (e) => {
    const { x, y } = toWorld(e.clientX, e.clientY)
    dragNodeId = nodeAt(x, y)
    panLast = { x: e.clientX, y: e.clientY }
    // 合成/注入式指针（自动化测试）没有活跃指针 id，捕获失败可安全忽略
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  })

  canvas.addEventListener('pointermove', (e) => {
    const { x, y } = toWorld(e.clientX, e.clientY)
    if (dragNodeId !== null) {
      const n = nodes[dragNodeId]
      n.x = x
      n.y = y
      dirty = true
      return
    }
    if (panLast && (e.buttons & 1) !== 0) {
      viewX += e.clientX - panLast.x
      viewY += e.clientY - panLast.y
      panLast = { x: e.clientX, y: e.clientY }
      dirty = true
      return
    }
    const idx = nodeAt(x, y)
    const id = idx !== null ? nodes[idx].id : null
    if (id !== hoveredId) {
      hoveredId = id
      dirty = true
    }
    canvas.style.cursor = idx !== null ? 'pointer' : 'grab'
  })

  canvas.addEventListener('pointerup', (e) => {
    const { x, y } = toWorld(e.clientX, e.clientY)
    const idx = nodeAt(x, y)
    if (idx !== null && panLast) {
      // 位移极小视为点击 → 选中（共享 store）
      const moved = Math.hypot(e.clientX - panLast.x, e.clientY - panLast.y)
      if (moved <= 4) appStore.getState().select(nodes[idx].id)
    }
    dragNodeId = null
    panLast = null
  })

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = Math.exp(-e.deltaY * 0.0012)
      const next = Math.min(4, Math.max(0.3, scale * factor))
      viewX = mx - ((mx - viewX) / scale) * next
      viewY = my - ((my - viewY) / scale) * next
      scale = next
      dirty = true
    },
    { passive: false },
  )

  const setOpen = (v: boolean): void => {
    open = v
    overlay.hidden = !v
    toggle.setAttribute('aria-pressed', String(v))
    toggle.classList.toggle('is-open', v)
    if (v) {
      resize()
      dirty = true
      requestFrame()
    }
  }

  toggle.addEventListener('click', () => setOpen(!open))
  closeBtn.addEventListener('click', () => setOpen(false))
  openBtn.addEventListener('click', () => {
    setOpen(false) // 关闭后地球侧选中/事件卡/飞行由 goToEvent 流程接管
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false)
  })

  // store → 高亮联动（选中变化重绘）
  appStore.subscribe((s: AppState) => {
    if (open) dirty = true
    void s
  })

  // "在地球上打开"按钮显示当前选中
  const syncOpenBtn = (s: AppState): void => {
    openBtn.hidden = !s.selectedId
  }
  appStore.subscribe(syncOpenBtn)
  syncOpenBtn(appStore.getState())

  // 供自动化断言
  ;(window as unknown as Record<string, unknown>).__chronoNetwork = {
    open: () => open,
    nodes: () => nodes.length,
    links: () => links.length,
    nodePos: (id: string) => {
      const n = nodeById.get(id)
      if (!n) return null
      const rect = canvas.getBoundingClientRect()
      return { x: rect.left + viewX + n.x * scale, y: rect.top + viewY + n.y * scale }
    },
  }
}
