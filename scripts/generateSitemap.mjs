/**
 * Генерация sitemap.xml для calccenter.ru
 * Запускается при каждой сборке (npm run build).
 */
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const hostname = 'https://calccenter.ru'
const today = new Date().toISOString().split('T')[0]

// Маршруты с приоритетами
const pages = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/classic', priority: 0.8, changefreq: 'monthly' },
  { path: '/engineering', priority: 0.8, changefreq: 'monthly' },
  { path: '/mortgage', priority: 0.9, changefreq: 'monthly' },
  { path: '/credit', priority: 0.8, changefreq: 'monthly' },
  { path: '/auto-credit', priority: 0.7, changefreq: 'monthly' },
  { path: '/fuel', priority: 0.7, changefreq: 'monthly' },
  { path: '/bmi', priority: 0.7, changefreq: 'monthly' },
  { path: '/wallpaper', priority: 0.6, changefreq: 'monthly' },
  { path: '/days', priority: 0.7, changefreq: 'monthly' },
  { path: '/discount', priority: 0.6, changefreq: 'monthly' },
  { path: '/password', priority: 0.6, changefreq: 'monthly' },
  { path: '/osago', priority: 0.8, changefreq: 'monthly' },
  { path: '/vacation', priority: 0.7, changefreq: 'monthly' },
  { path: '/penalty', priority: 0.7, changefreq: 'monthly' },
  { path: '/ndfl', priority: 0.8, changefreq: 'monthly' },
  { path: '/nds', priority: 0.8, changefreq: 'monthly' },
  { path: '/interest', priority: 0.7, changefreq: 'monthly' },
  { path: '/util-fee', priority: 0.7, changefreq: 'monthly' },
  { path: '/customs', priority: 0.7, changefreq: 'monthly' },
  { path: '/country-codes', priority: 0.5, changefreq: 'monthly' },
  { path: '/region-codes', priority: 0.5, changefreq: 'monthly' },
  { path: '/unit-converter', priority: 0.6, changefreq: 'monthly' },
]

function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

const entries = pages.map(p => urlEntry(`${hostname}${p.path}`, p.changefreq, p.priority))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

const outputPath = resolve(__dirname, '../dist/sitemap.xml')
writeFileSync(outputPath, sitemap)
console.log(`Sitemap generated: ${entries.length} URLs`)
