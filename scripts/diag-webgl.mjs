import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  defaultViewport: { width: 1200, height: 800 },
})
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 300)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 800)))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 4000))

const diag = await page.evaluate(() => ({
  errorCardHidden: document.getElementById('webgl-error')?.hidden,
  canvasExists: !!document.querySelector('#scene-container canvas'),
  hook: typeof window.__chrono,
  viteErrorOverlay: !!document.querySelector('vite-error-overlay'),
}))
console.log(JSON.stringify(diag, null, 2))
await browser.close()
