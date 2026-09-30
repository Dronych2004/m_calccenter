/**
 * Пререндеринг всех маршрутов через Puppeteer.
 * Запускает headless Chrome, рендерит каждый маршрут и сохраняет
 * статический HTML-файл. Поисковики получают готовый контент.
 *
 * Примечание: renderAfterDocumentEvent не работает в новых версиях
 * Puppeteer — evaluateOnNewDocument выполняется в изолированном мире,
 * который не видит window.__PRERENDER_STATUS из page.evaluate.
 * Вместо этого используем pageHandler + page.exposeFunction для
 * надёжного отслеживания готовности страницы.
 */
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync, copyFileSync } from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(__dirname, '../dist')

// Все маршруты приложения (дублирует App.tsx)
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

console.log(`Total routes to prerender: ${routes.length}`)

async function prerender() {
  const Prerenderer = (await import('@prerenderer/prerenderer')).default
  const PuppeteerRenderer = (await import('@prerenderer/renderer-puppeteer')).default

  const prerenderer = new Prerenderer({
    staticDir: distDir,
    renderer: new PuppeteerRenderer({
      // renderAfterDocumentEvent отключён — слушаем событие в pageHandler
      maxConcurrentRoutes: 4,
      headless: true,
      skipThirdPartyRequests: true,
      timeout: 60000,
      pageHandler: async (page, route) => {
        // Ждём custom-render-trigger из SeoHead:
        // 1. Expose функцию чтобы страница могла вызвать её из main world
        // 2. Регистрируем document listener через page.evaluate (main world!)
        // 3. Ждём пока событие придёт (или timeout)
        await page.exposeFunction('__onRenderReady', () => {})

        await page.evaluate(() => {
          return new Promise((resolve) => {
            const timeout = setTimeout(resolve, 15000)
            document.addEventListener('custom-render-trigger', () => {
              clearTimeout(timeout)
              resolve()
            }, { once: true })
          })
        })
      },
    }),
  })

  try {
    console.log('Starting prerender...')
    await prerenderer.initialize()
    console.log('Prerenderer initialized, rendering routes...')

    const renderedRoutes = await prerenderer.renderRoutes(routes)

    for (const rendered of renderedRoutes) {
      const route = rendered.route
      if (route === '/') {
        const outputPath = resolve(distDir, 'index.html')
        writeFileSync(outputPath, rendered.html)
        console.log(`  Written: /index.html (root)`)
        continue
      }
      const dirPath = resolve(distDir, `.${route}`)
      const outputPath = resolve(dirPath, 'index.html')
      mkdirSync(dirPath, { recursive: true })
      writeFileSync(outputPath, rendered.html)
      console.log(`  Written: ${route}/index.html`)
    }

    // Копируем конфиги сервера в dist
    const filesToCopy = [
      { src: '../public/.htaccess', dest: '.htaccess', name: '.htaccess' },
      { src: '../public/index.php', dest: 'index.php', name: 'index.php' },
      { src: '../nginx.conf', dest: 'nginx.conf', name: 'nginx.conf' },
    ]
    for (const { src, dest, name } of filesToCopy) {
      try {
        copyFileSync(resolve(__dirname, src), resolve(distDir, dest))
        console.log(`Copied ${name} to dist/`)
      } catch {
        console.log(`No ${name} to copy`)
      }
    }

    console.log(`\nSuccessfully prerendered ${renderedRoutes.length} routes`)

    await prerenderer.destroy()
    console.log('Prerender complete!')
  } catch (error) {
    console.error('Prerender failed:', error)
    await prerenderer.destroy()
    process.exit(1)
  }
}

prerender()
