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
const logs = []

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
  if (msg.type() === 'error') errors.push(entry)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

console.log('1. 打开页面…')
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 })

// 等应用钩子就位（最多 30 秒）
await page.waitForFunction(() => typeof window.__chrono !== 'undefined', { timeout: 30000 })
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
  return { hidden: card.hidden, show: card.classList.contains('show'), title: card.querySelector('.ec-title')?.textContent ?? null }
})
console.log('   事件卡:', JSON.stringify(cardVisible))
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
// 大洲筛选：点击"亚洲"，行应只剩亚洲事件（并用 data 属性校验飞行回调在 main 中装配）
await page.click('#snapshot-continents [data-continent="asia"]')
await new Promise((r) => setTimeout(r, 400))
const contInfo = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#slice-list .slice-row')]
  const ids = rows.map((r) => r.getAttribute('data-id'))
  const events = window.__chrono.events
  return { rows: rows.length, allAsia: ids.every((id) => events.find((e) => e.id === id)?.continent === 'asia') }
})
console.log('   大洲筛选(亚洲):', JSON.stringify(contInfo), contInfo.allAsia && contInfo.rows > 0 ? '✓' : '✗')
await shot('09c-snapshot-continent')
// 复点取消筛选，行点击定位
await page.click('#snapshot-continents [data-continent="asia"]')
await new Promise((r) => setTimeout(r, 300))
if (sliceInfo.rows > 0) {
  await page.click('#slice-list .slice-row')
  await new Promise((r) => setTimeout(r, 1800))
  const sel = await page.evaluate(() => window.__chrono.store.getState().selectedId)
  console.log('   面板选中:', sel, sel === sliceInfo.first ? '✓' : '✗ 与首行不一致')
}
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

// 11. 人物层：事件卡相关人物 chips + 展开详情 + 人物搜索
await page.evaluate(() => {
  window.__chrono.goTo('watt-steam-engine')
})
await new Promise((r) => setTimeout(r, 2000))
const peopleInfo = await page.evaluate(() => ({
  chips: [...document.querySelectorAll('.ec-chip--person')].map((b) => b.textContent?.trim()),
}))
console.log('   人物chips:', JSON.stringify(peopleInfo))
// 展开 瓦特 详情
await page.click('[data-person="watt"]')
await new Promise((r) => setTimeout(r, 500))
const personDetail = await page.evaluate(() => ({
  open: !!document.querySelector('.ec-person'),
  name: document.querySelector('.ec-person-name')?.textContent?.trim(),
  bio: document.querySelector('.ec-person-bio')?.textContent?.slice(0, 20),
}))
console.log('   人物详情:', JSON.stringify(personDetail))
await shot('14-person-detail')

// 人物搜索：输入"李鸿章"应出现"人物"徽章行，点击跳转其主事件
await page.click('#search-input')
await page.type('#search-input', '李鸿章')
await new Promise((r) => setTimeout(r, 600))
const personSearch = await page.evaluate(() => ({
  badge: !!document.querySelector('#search-results .search-badge'),
  rows: document.querySelectorAll('#search-results .search-item').length,
}))
console.log('   人物搜索:', JSON.stringify(personSearch))
await page.keyboard.press('Enter')
await new Promise((r) => setTimeout(r, 2000))
const personJump = await page.evaluate(() => window.__chrono.store.getState().selectedId)
console.log('   人物跳转:', personJump, personJump === 'self-strengthening-movement' ? '✓' : '✗')
await shot('15-person-search')

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

// 13. 移动端视口
await page.setViewport({ width: 390, height: 844 })
await new Promise((r) => setTimeout(r, 1200))
await shot('17-mobile')

// 汇总
const report = { errors, logsCount: logs.length, logsTail: logs.slice(-12) }
writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log('\n=== 验证报告 ===')
console.log('控制台错误数:', errors.length)
for (const e of errors.slice(0, 10)) console.log('  ', e)

await browser.close()
console.log('完成。截图目录:', outDir)
