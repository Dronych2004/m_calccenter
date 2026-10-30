/** Render all public routes to flat HTML files (no physical route folders). */
import { resolve, extname, sep } from 'node:path'
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import puppeteer from 'puppeteer'

const distDir = resolve('dist')
const routes = [
  '/',
  '/classic',
  '/engineering',
  '/mortgage',
  '/credit',
  '/auto-credit',
  '/fuel',
  '/bmi',
  '/wallpaper',
  '/days',
  '/discount',
  '/password',
  '/osago',
  '/vacation',
  '/penalty',
  '/ndfl',
  '/nds',
  '/interest',
  '/util-fee',
  '/customs',
  '/country-codes',
  '/region-codes',
  '/unit-converter',
]

const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.html': 'text/html; charset=utf-8' }
// Snapshot the unrendered entry before replacing the root page.
const template = readFileSync(resolve(distDir, 'index.html'))
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  const file = resolve(distDir, '.' + path)
  if (path !== '/' && file.startsWith(distDir + sep) && existsSync(file) && extname(file)) {
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
    res.end(readFileSync(file))
  } else {
    res.setHeader('Content-Type', types['.html'])
    res.end(template)
  }
})
let browser
try {
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done) })
  const origin = 'http://127.0.0.1:' + server.address().port
  browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PRERENDER_BROWSER_PATH || undefined,
    userDataDir: process.env.PRERENDER_PROFILE_PATH || undefined,
    args: process.env.PRERENDER_NO_SANDBOX === '1' ? ['--no-sandbox', '--disable-gpu'] : [],
  })
  const page = await browser.newPage()
  await page.setBypassServiceWorker(true)
  await page.setRequestInterception(true)
  page.on('request', request => request.url().startsWith(origin) || request.url().startsWith('data:') ? request.continue() : request.abort())
  for (const route of routes) {
    await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.waitForFunction(expected => document.querySelector('link[rel="canonical"]')?.href === expected && document.querySelector('h1') && !document.querySelector('main')?.textContent.includes('Загрузка...'), { timeout: 30000 }, 'https://calccenter.ru' + route)
    const html = await page.content()
    const output = route === '/' ? 'index.html' : route.slice(1) + '.html'
    writeFileSync(resolve(distDir, output), html)
    console.log('Rendered: ' + output)
  }
  for (const [source, target] of [['public/.htaccess', '.htaccess'], ['public/index.php', 'index.php'], ['nginx.conf', 'nginx.conf']]) {
    copyFileSync(source, resolve(distDir, target))
  }
  console.log('Successfully prerendered ' + routes.length + ' routes')
} finally {
  if (browser) await browser.close()
  await new Promise(done => server.close(done))
}
