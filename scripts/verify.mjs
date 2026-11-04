/**
 * ChronoAtlas 无头验证脚本（puppeteer-core + 系统 Chrome）
 * 用法：node scripts/verify.mjs [--out <dir>]
 * 产出：截图 + 控制台错误报告 + 交互状态断言
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const outDir = resolve(process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'verify-shots')
mkdirSync(outDir, { recursive: true })

const errors = []
const envWarnings = []
const logs = []

// 沙箱代理对 CDN 的拦截属环境抖动（应用已设计降级），与应用错误区分开
const ENV_NET_RE = /ERR_TUNNEL_CONNECTION_FAILED|ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|ERR_PROXY/

// 服务器自愈：dev server 不在时自动拉起（脱离进程组，不随脚本退出）
async function ensureServer(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (res.ok) return
  } catch {
    /* fallthrough */
  }
  console.log('   dev server 不在，自动拉起…')
  const child = spawn('npm', ['run', 'dev'], {
    cwd: resolve(import.meta.dirname, '..'),
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        console.log('   dev server 就绪')
        return
      }
    } catch {
      /* retry */
    }
  }
  throw new Error('dev server 启动失败')
}
await ensureServer('http://127.0.0.1:5173/')

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--window-size=1440,900',
  ],
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
page.on('console', (msg) => {
  const entry = `[${msg.type()}] ${msg.text()}`
  logs.push(entry)
  if (msg.type() === 'error') {
    if (ENV_NET_RE.test(msg.text())) envWarnings.push(entry)
    else errors.push(entry)
  }
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

console.log('1. 打开页面…')
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 })

// 等应用钩子就位（最多 30 秒）
const bootStart = Date.now()
await page.waitForFunction(() => typeof window.__chrono !== 'undefined', { timeout: 30000 })
const initMs = Date.now() - bootStart
console.log('   应用已启动')

// 等入场飞行动画结束
await new Promise((r) => setTimeout(r, 4000))

const shot = async (name) => {
  const file = resolve(outDir, `${name}.png`)
  await page.screenshot({ path: file })
  console.log(`   📸 ${name}.png`)
  return file
}

// 2. 初始视图（全球）
await shot('01-initial-world')

// 3. 拖动时间轴到 1776（美国独立）
await page.evaluate(() => {
  const store = window.__chrono.store
  store.getState().setYear(1776)
  store.getState().setWindowSize(10)
})
await new Promise((r) => setTimeout(r, 1500))
const count1776 = await page.evaluate(() => document.getElementById('active-count')?.textContent)
console.log('   1776 活跃事件:', count1776)
await shot('02-year-1776')

// 4. 选中事件：穆罕默德·阿里改革（原视频同款）
await page.evaluate(() => {
  const store = window.__chrono.store
  store.getState().setYear(1826)
  store.getState().select('muhammad-ali-reforms')
})
await new Promise((r) => setTimeout(r, 2200))
const cardVisible = await page.evaluate(() => {
  const card = document.getElementById('event-card')
  const compass = card.querySelector('.ec-compass')
  return {
    hidden: card.hidden,
    show: card.classList.contains('show'),
    title: card.querySelector('.ec-title')?.textContent ?? null,
    compass: !compass?.hidden,
    angle: compass?.style.getPropertyValue('--ec-angle') ?? null,
  }
})
console.log('   事件卡:', JSON.stringify(cardVisible))
if (!cardVisible.compass) throw new Error('卡片罗盘未显示（棱柱屏幕锚定失效）')
await shot('03-event-card')

// 5. 搜索"鸦片"
await page.click('#search-input')
await page.type('#search-input', '鸦片')
await new Promise((r) => setTimeout(r, 600))
const searchCount = await page.evaluate(() => document.querySelectorAll('#search-results .search-item').length)
console.log('   搜索"鸦片"结果数:', searchCount)
await shot('04-search')
await page.keyboard.press('Enter')
await new Promise((r) => setTimeout(r, 2200))
await shot('05-search-goto')

// 6. 大洲定位：欧洲
await page.evaluate(() => {
  document.querySelector('#continent-nav button[data-continent="europe"]').click()
})
await new Promise((r) => setTimeout(r, 2000))
await shot('06-continent-europe')

// 7. 自动播放 3 秒
await page.click('#play-btn')
await new Promise((r) => setTimeout(r, 3000))
await page.click('#play-btn')
const playYear = await page.evaluate(() => window.__chrono.store.getState().year)
console.log('   播放后年份:', playYear)
await shot('07-after-play')

// 8. 随机发现
await page.click('#random-btn')
await new Promise((r) => setTimeout(r, 2000))
await shot('08-random')

// 9. 世界快照面板（年份/时代/类型筛选/大洲概览/事件列表）
await page.click('#slice-toggle')
await new Promise((r) => setTimeout(r, 600))
const sliceInfo = await page.evaluate(() => ({
  open: !document.getElementById('slice-panel')?.hidden,
  rows: document.querySelectorAll('#slice-list .slice-row').length,
  first: document.querySelector('#slice-list .slice-row')?.getAttribute('data-id') ?? null,
  count: document.getElementById('active-count')?.textContent,
  era: document.getElementById('snapshot-era')?.textContent ?? '',
  typeChips: document.querySelectorAll('#snapshot-types .snap-chip').length,
  contChips: [...document.querySelectorAll('#snapshot-continents .snap-chip:not(:disabled)')].length,
  densityBars: document.querySelectorAll('#timeline-density rect').length,
}))
console.log('   快照面板:', JSON.stringify(sliceInfo))
if (sliceInfo.era.length === 0) throw new Error('快照时代标签为空')
if (sliceInfo.typeChips < 8) throw new Error(`类型 chips 异常: ${sliceInfo.typeChips}`)
if (sliceInfo.densityBars < 160) throw new Error(`密度条柱数异常: ${sliceInfo.densityBars}`)
await shot('09-slice-panel')
// 类型筛选：点击"战争"，全部行应为战争色
await page.click('#snapshot-types [data-type="war"]')
await new Promise((r) => setTimeout(r, 400))
const warFilter = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#slice-list .slice-row')]
  return { rows: rows.length, allWar: rows.every((r) => r.style.getPropertyValue('--type-color') === '#ef4444') }
})
console.log('   类型筛选(战争):', JSON.stringify(warFilter), warFilter.allWar && warFilter.rows > 0 ? '✓' : '✗')
await shot('09b-snapshot-filter')
await page.click('#snapshot-types [data-type="all"]')
// 大洲筛选：点击"亚洲"，行应只剩亚洲事件，且全局筛选写入 store（联动地球）
await page.click('#snapshot-continents [data-continent="asia"]')
await new Promise((r) => setTimeout(r, 400))
const contInfo = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#slice-list .slice-row')]
  const ids = rows.map((r) => r.getAttribute('data-id'))
  const events = window.__chrono.events
  const st = window.__chrono.store.getState()
  return {
    rows: rows.length,
    allAsia: ids.every((id) => events.find((e) => e.id === id)?.continent === 'asia'),
    storeFilter: st.continentFilter,
  }
})
console.log('   大洲筛选(亚洲):', JSON.stringify(contInfo), contInfo.allAsia && contInfo.storeFilter === 'asia' ? '✓' : '✗')
await shot('09c-snapshot-continent')
// 排序切换：按时间排序后首行应为最早开始的活跃事件
await page.click('#snapshot-sort [data-sort="time"]')
await new Promise((r) => setTimeout(r, 300))
const sortInfo = await page.evaluate(() => {
  const ids = [...document.querySelectorAll('#slice-list .slice-row')].map((r) => r.getAttribute('data-id'))
  const st = window.__chrono.store.getState()
  const events = window.__chrono.events
  const active = events
    .filter((e) => e.start - st.windowSize <= st.year && st.year <= e.end + st.windowSize && e.continent === st.continentFilter)
    .sort((a, b) => a.start - b.start)
  return { first: ids[0], expect: active[0]?.id ?? null }
})
console.log('   排序(时间):', JSON.stringify(sortInfo), sortInfo.first === sortInfo.expect ? '✓' : '✗')
await page.click('#snapshot-sort [data-sort="importance"]')
// 复点取消筛选，行点击定位
await page.click('#snapshot-continents [data-continent="asia"]')
await new Promise((r) => setTimeout(r, 300))
if (sliceInfo.rows > 0) {
  await page.click('#slice-list .slice-row')
  await new Promise((r) => setTimeout(r, 1800))
  const sel = await page.evaluate(() => window.__chrono.store.getState().selectedId)
  console.log('   面板选中:', sel, sel === sliceInfo.first ? '✓' : '✗ 与首行不一致')
}
// 播放速度：选择 5× 写入 store
await page.select('#speed-select', '5')
await new Promise((r) => setTimeout(r, 200))
const speedVal = await page.evaluate(() => window.__chrono.store.getState().playSpeed)
console.log('   播放速度:', speedVal, speedVal === 5 ? '✓' : '✗')
await page.select('#speed-select', '1')
// 同时代视图：按大洲分节并置代表事件
await page.click('#snapshot-view [data-view="sync"]')
await new Promise((r) => setTimeout(r, 400))
const syncInfo = await page.evaluate(() => {
  const sections = [...document.querySelectorAll('#slice-list .sync-section')].length
  const rows = document.querySelectorAll('#slice-list .slice-row').length
  const heads = [...document.querySelectorAll('#slice-list .sync-cont')].map((b) => b.textContent?.trim().split(/\s/)[0])
  return { sections, rows, heads }
})
console.log('   同时代视图:', JSON.stringify(syncInfo), syncInfo.sections >= 3 && syncInfo.rows >= 3 ? '✓' : '✗')
await shot('09d-snapshot-sync')
// 大洲标题 → 回列表视图并写入该洲筛选
await page.click('#slice-list .sync-cont')
await new Promise((r) => setTimeout(r, 400))
const syncJump = await page.evaluate(() => ({
  view: document.querySelector('#snapshot-view .snap-sort-btn.is-active')?.getAttribute('data-view'),
  filter: window.__chrono.store.getState().continentFilter,
}))
console.log('   同时代跳列表:', JSON.stringify(syncJump), syncJump.view === 'list' && syncJump.filter ? '✓' : '✗')
// 还原：清筛选回列表
await page.evaluate(() => {
  window.__chrono.store.getState().setContinentFilter(null)
  document.querySelector('#snapshot-view [data-view="list"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
await new Promise((r) => setTimeout(r, 300))
// 关闭面板
await page.click('#slice-toggle')
await new Promise((r) => setTimeout(r, 400))

// 10. 事件关联线（因果 chips + 地球弧线）— 用完整跳转让相机飞到事件旁
await page.evaluate(() => {
  window.__chrono.goTo('first-opium-war')
})
await new Promise((r) => setTimeout(r, 2400))
const linksInfo = await page.evaluate(() => ({
  causes: [...document.querySelectorAll('.ec-chip--cause')].map((b) => b.textContent?.trim()),
  effects: [...document.querySelectorAll('.ec-chip--effect')].map((b) => b.getAttribute('data-goto')),
  arcs: window.__chrono.arcsCount(),
}))
console.log('   关联线:', JSON.stringify(linksInfo))
if (linksInfo.arcs < 3) throw new Error(`弧线数异常: ${linksInfo.arcs}（期望 ≥3 的多跳长河）`)
await shot('11-link-arcs')
// 弧线跳数切换：一跳数应等于直接邻居数
const hasDepthBtn = await page.evaluate(() => !!document.querySelector('.ec-depth-btn'))
const hop1 = { hasDepthBtn }
if (hasDepthBtn) {
  await page.click('.ec-depth-btn[data-depth="1"]')
  await new Promise((r) => setTimeout(r, 700))
  hop1.count = await page.evaluate(() => window.__chrono.arcsCount())
  hop1.expect = await page.evaluate(() => {
    const st = window.__chrono.store.getState()
    return window.__chrono.links.filter((l) => l.from === st.selectedId || l.to === st.selectedId).length
  })
  console.log('   一跳弧线:', JSON.stringify(hop1), hop1.count === hop1.expect ? '✓' : '✗')
  await page.click('.ec-depth-btn[data-depth="3"]')
  await new Promise((r) => setTimeout(r, 700))
  const back = await page.evaluate(() => window.__chrono.arcsCount())
  console.log('   恢复三跳:', back, back >= linksInfo.arcs ? '✓' : '✗')
}
const firstEffect = linksInfo.effects[0]
if (firstEffect) {
  await page.click(`[data-goto="${firstEffect}"]`)
  await new Promise((r) => setTimeout(r, 1600))
  const chainSel = await page.evaluate(() => window.__chrono.store.getState().selectedId)
  const chainYear = await page.evaluate(() => window.__chrono.store.getState().year)
  console.log(
    `   链式跳转: ${firstEffect} sel=${chainSel} year=${chainYear}`,
    chainSel === firstEffect ? '✓' : '✗',
  )
  await shot('12-chain-jump')
}

// 11. 人物档案卡：事件卡 chips → 人物卡（时间线跳事件）+ 人物搜索直达人物卡
await page.evaluate(() => {
  window.__chrono.goTo('watt-steam-engine')
})
await new Promise((r) => setTimeout(r, 2000))
const peopleInfo = await page.evaluate(() => ({
  chips: [...document.querySelectorAll('.ec-chip--person')].map((b) => b.textContent?.trim()),
}))
console.log('   人物chips:', JSON.stringify(peopleInfo))
await page.click('[data-person="watt"]')
await new Promise((r) => setTimeout(r, 700))
const personDetail = await page.evaluate(() => ({
  open: !document.getElementById('person-card')?.hidden,
  name: document.querySelector('.pc-name')?.textContent?.trim(),
  life: document.querySelector('.pc-life')?.textContent?.trim(),
  tlRows: document.querySelectorAll('.pc-tl-row').length,
}))
console.log('   人物卡:', JSON.stringify(personDetail))
if (!personDetail.open || personDetail.tlRows === 0) throw new Error(`人物卡异常: ${JSON.stringify(personDetail)}`)
await shot('14-person-detail')
// 时间线行点击 → 跳转事件并收起人物卡
await page.click('#person-card .pc-tl-row')
await new Promise((r) => setTimeout(r, 1800))
const tlJump = await page.evaluate(() => ({
  sel: window.__chrono.store.getState().selectedId,
  personOpen: !document.getElementById('person-card')?.hidden,
}))
console.log('   时间线跳转:', JSON.stringify(tlJump), tlJump.sel && !tlJump.personOpen ? '✓' : '✗')
await shot('14b-person-jump')

// 人物搜索：输入"李鸿章"出现人物徽章行，回车直达人物档案卡
await page.click('#search-input')
await page.type('#search-input', '李鸿章')
await new Promise((r) => setTimeout(r, 600))
const personSearch = await page.evaluate(() => ({
  badge: !!document.querySelector('#search-results .search-badge'),
  rows: document.querySelectorAll('#search-results .search-item').length,
}))
console.log('   人物搜索:', JSON.stringify(personSearch))
await page.keyboard.press('Enter')
await new Promise((r) => setTimeout(r, 800))
const personCardOpen = await page.evaluate(() => ({
  open: !document.getElementById('person-card')?.hidden,
  pid: window.__chrono.store.getState().selectedPersonId,
  name: document.querySelector('.pc-name')?.textContent?.trim(),
  compass: !document.querySelector('#person-card .ec-compass')?.hidden,
}))
console.log(
  '   搜索直达人物卡:',
  JSON.stringify(personCardOpen),
  personCardOpen.open && personCardOpen.pid === 'li-hongzhang' && personCardOpen.compass ? '✓' : '✗',
)
await shot('15-person-search')
// 同事件人物：卡内 chips 切换到另一人物
const peersInfo = await page.evaluate(() => {
  const chips = [...document.querySelectorAll('#person-card .pc-chip')]
  return { count: chips.length, first: chips[0]?.getAttribute('data-peer') ?? null }
})
console.log('   同事件人物:', JSON.stringify(peersInfo))
if (peersInfo.count > 0 && peersInfo.first) {
  await page.click(`#person-card [data-peer="${peersInfo.first}"]`)
  await new Promise((r) => setTimeout(r, 600))
  const switched = await page.evaluate(() => window.__chrono.store.getState().selectedPersonId)
  console.log('   卡内切换:', switched, switched === peersInfo.first ? '✓' : '✗')
}
await page.click('#person-card [data-close]')
await new Promise((r) => setTimeout(r, 500))

// 12. URL 状态还原（分享链接回环）
const hashBefore = await page.evaluate(() => window.location.hash)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => typeof window.__chrono !== 'undefined', { timeout: 30000 })
await new Promise((r) => setTimeout(r, 1500))
const restored = await page.evaluate(() => {
  const s = window.__chrono.store.getState()
  return { year: s.year, selected: s.selectedId, hash: window.location.hash }
})
const hashOk =
  restored.hash === hashBefore &&
  (hashBefore.includes('y=') || hashBefore === '')
console.log(`   URL 回环: before=${hashBefore} after=${restored.hash} year=${restored.year} ${hashOk ? '✓' : '✗'}`)
await shot('16-url-restored')

// 12.5 历史热区模式：开关 → 光晕簇出现/消失
await page.setViewport({ width: 1440, height: 900 })
// 贴图冷缓存时加载层最长 12s+ 才收起，必须等它移除后再做真实点击
await page.waitForFunction(() => document.body.classList.contains('ready'), { timeout: 40000 })
await page.waitForFunction(() => !document.getElementById('loading'), { timeout: 10000 }).catch(() => {})
await new Promise((r) => setTimeout(r, 600))
const before = await page.evaluate(() => window.__chrono.hotspotsCount())
await page.click('#hotspot-toggle')
await new Promise((r) => setTimeout(r, 900))
const on = await page.evaluate(() => ({
  pressed: document.getElementById('hotspot-toggle')?.getAttribute('aria-pressed'),
  zones: window.__chrono.hotspotsCount(),
}))
await page.evaluate(() => window.__chrono.store.getState().setYear(1870))
await new Promise((r) => setTimeout(r, 900))
await shot('18-hotspots')
await page.click('#hotspot-toggle')
await new Promise((r) => setTimeout(r, 600))
const after = await page.evaluate(() => window.__chrono.hotspotsCount())
console.log('   热区模式:', JSON.stringify({ before, on, after }), on.pressed === 'true' && on.zones > 0 && after === 0 ? '✓' : '✗')

// 12.7 二维因果网络：打开 → 节点/连线数 → 点击节点选中同步 → 关闭
await page.waitForFunction(() => document.body.classList.contains('ready'), { timeout: 40000 })
await page.click('#network-toggle')
await new Promise((r) => setTimeout(r, 700))
const netInfo = await page.evaluate(() => {
  const net = window.__chronoNetwork
  return { open: net.open(), nodes: net.nodes(), links: net.links(), visible: !document.getElementById('network-overlay').hidden }
})
console.log('   因果网络:', JSON.stringify(netInfo))
if (!netInfo.open || netInfo.nodes !== 119 || netInfo.links !== 32)
  throw new Error(`因果网络异常: ${JSON.stringify(netInfo)}`)
await shot('19-network')
// 点击"洋务运动"节点（坐标由布局暴露），选中应同步 store
await page.evaluate(() => {
  const p = window.__chronoNetwork.nodePos('self-strengthening-movement')
  const el = document.getElementById('network-canvas')
  const opts = { bubbles: true, clientX: p.x, clientY: p.y }
  el.dispatchEvent(new PointerEvent('pointerdown', opts))
  el.dispatchEvent(new PointerEvent('pointerup', opts))
})
await new Promise((r) => setTimeout(r, 500))
const netSel = await page.evaluate(() => window.__chrono.store.getState().selectedId)
console.log('   网络选中:', netSel, netSel === 'self-strengthening-movement' ? '✓' : '✗')
await shot('19b-network-select')
// 点击连线（中点）→ 关系详情弹层
await page.evaluate(() => {
  const p1 = window.__chronoNetwork.nodePos('watt-steam-engine')
  const p2 = window.__chronoNetwork.nodePos('stockton-darlington')
  const el = document.getElementById('network-canvas')
  const mid = { clientX: (p1.x + p2.x) / 2, clientY: (p1.y + p2.y) / 2 }
  const opts = { bubbles: true, ...mid }
  el.dispatchEvent(new PointerEvent('pointerdown', opts))
  el.dispatchEvent(new PointerEvent('pointerup', opts))
})
await new Promise((r) => setTimeout(r, 400))
const linkInfo = await page.evaluate(() => {
  const el = document.getElementById('network-link-info')
  return { open: !el.hidden, kind: el.querySelector('.nl-kind')?.textContent?.trim() ?? null }
})
console.log('   连线详情:', JSON.stringify(linkInfo), linkInfo.open && linkInfo.kind?.includes('直接因果') ? '✓' : '✗')
await shot('19c-network-link')
await page.click('#network-close')
await new Promise((r) => setTimeout(r, 400))
const netClosed = await page.evaluate(() => !document.getElementById('network-overlay').hidden)
console.log('   网络关闭:', netClosed ? '✗ 仍打开' : '✓')

// 12.8 键盘快捷键：H 热区 / N 网络 / R 随机（输入框外生效）
await page.keyboard.press('h')
await new Promise((r) => setTimeout(r, 700))
const kbH = await page.evaluate(() => ({
  on: window.__chrono.store.getState().hotspotsOn,
  zones: window.__chrono.hotspotsCount(),
}))
await page.keyboard.press('h')
await new Promise((r) => setTimeout(r, 400))
await page.keyboard.press('n')
await new Promise((r) => setTimeout(r, 600))
const kbN1 = await page.evaluate(() => window.__chronoNetwork.open())
await page.keyboard.press('n')
await new Promise((r) => setTimeout(r, 400))
const kbN2 = await page.evaluate(() => window.__chronoNetwork.open())
await page.keyboard.press('r')
await new Promise((r) => setTimeout(r, 1600))
const kbR = await page.evaluate(() => window.__chrono.store.getState().selectedId)
// P 键切快照面板
await page.keyboard.press('p')
await new Promise((r) => setTimeout(r, 500))
const kbP1 = await page.evaluate(() => !document.getElementById('slice-panel')?.hidden)
await page.keyboard.press('p')
await new Promise((r) => setTimeout(r, 400))
const kbP2 = await page.evaluate(() => !document.getElementById('slice-panel')?.hidden)
// ←→ 年份步进
const yearBefore = await page.evaluate(() => window.__chrono.store.getState().year)
await page.keyboard.press('ArrowRight')
await new Promise((r) => setTimeout(r, 150))
const yearAfter = await page.evaluate(() => window.__chrono.store.getState().year)
const kbOk =
  kbH.on && kbH.zones > 0 && kbN1 && !kbN2 && !!kbR && kbP1 && !kbP2 && yearAfter === yearBefore + 1
console.log(
  '   快捷键 N/H/R/P/←→:',
  JSON.stringify({ h: kbH.on, n: kbN1 && !kbN2, r: !!kbR, p: kbP1 && !kbP2, arrow: yearAfter === yearBefore + 1 }),
  kbOk ? '✓' : '✗',
)

// 12.9 音效开关：点击 → store.soundOn + aria；再点关
await page.click('#sound-toggle')
await new Promise((r) => setTimeout(r, 300))
const sndOn = await page.evaluate(() => ({
  on: window.__chrono.store.getState().soundOn,
  pressed: document.getElementById('sound-toggle')?.getAttribute('aria-pressed'),
}))
await page.click('#sound-toggle')
await new Promise((r) => setTimeout(r, 300))
const sndOff = await page.evaluate(() => window.__chrono.store.getState().soundOn)
console.log('   音效开关:', JSON.stringify({ sndOn, sndOff }), sndOn.on && sndOn.pressed === 'true' && !sndOff ? '✓' : '✗')

// 12.10 Esc 关闭路径 + 事件卡关闭按钮 + 无效 hash 容错
// 快照面板 Esc
await page.click('#slice-toggle')
await new Promise((r) => setTimeout(r, 400))
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 300))
const escSlice = await page.evaluate(() => document.getElementById('slice-panel')?.hidden)
// 人物卡 Esc
await page.evaluate(() => window.__chrono.store.getState().selectPerson('watt'))
await new Promise((r) => setTimeout(r, 600))
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 500))
const escPerson = await page.evaluate(() => document.getElementById('person-card')?.hidden)
// 事件卡 close 按钮
await page.evaluate(() => window.__chrono.store.getState().select('watt-steam-engine'))
await new Promise((r) => setTimeout(r, 600))
await page.click('#event-card [data-close]')
await new Promise((r) => setTimeout(r, 600))
const closeEvent = await page.evaluate(() => {
  const card = document.getElementById('event-card')
  return card.hidden || !card.classList.contains('show')
})
console.log(
  '   Esc/close 关闭路径:',
  JSON.stringify({ escSlice, escPerson, closeEvent }),
  escSlice && escPerson && closeEvent ? '✓' : '✗',
)
// 无效 hash 容错：reload 后不崩溃、无选中、hash 被写回清理
await page.evaluate(() => {
  window.location.hash = '#y=1850&ev=nonexistent-id'
})
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => typeof window.__chrono !== 'undefined', { timeout: 30000 })
await new Promise((r) => setTimeout(r, 1200))
const badHash = await page.evaluate(() => ({
  selected: window.__chrono.store.getState().selectedId,
  hash: window.location.hash,
}))
console.log(
  '   无效hash容错:',
  JSON.stringify(badHash),
  badHash.selected === null && badHash.hash === '#y=1850' ? '✓' : '✗',
)

// 13. 移动端视口 + 罗盘移动端行为
await page.setViewport({ width: 390, height: 844 })
await new Promise((r) => setTimeout(r, 1200))
// 选中一个事件，检查罗盘元素在移动端存在且行为合理（显示或出屏隐藏皆合法）
await page.evaluate(() => {
  window.__chrono.store.getState().setYear(1839)
  window.__chrono.goTo('first-opium-war')
})
await new Promise((r) => setTimeout(r, 2200))
const mobileCompass = await page.evaluate(() => {
  const compass = document.querySelector('#event-card .ec-compass')
  if (!compass) return { exists: false }
  return {
    exists: true,
    visible: !compass.hidden,
    angle: compass.style.getPropertyValue('--ec-angle') || null,
  }
})
console.log('   移动端罗盘:', JSON.stringify(mobileCompass), mobileCompass.exists ? '✓' : '✗')
await shot('17-mobile')

// 汇总（含性能基线：__chrono.perf() 在初始视图 + 各交互后采样一次）
const perf = await page.evaluate(() => window.__chrono.perf()).catch(() => null)
console.log('性能基线:', JSON.stringify(perf), '· init:', `${initMs}ms`)
// 合批回归门槛：棱柱/地块已 InstancedMesh 化（V0.16 基线 20），超过 150 视为合批失效
if (perf && perf.drawCalls > 150) {
  errors.push(`drawCalls=${perf.drawCalls} 超过合批门槛 150（棱柱 InstancedMesh 可能失效）`)
}
const report = { errors, envWarnings, perf, initMs, logsCount: logs.length, logsTail: logs.slice(-12) }
writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log('\n=== 验证报告 ===')
console.log('控制台错误数:', errors.length, '· 环境网络警告:', envWarnings.length)
for (const e of errors.slice(0, 10)) console.log('  ', e)

await browser.close()
console.log('完成。截图目录:', outDir)
