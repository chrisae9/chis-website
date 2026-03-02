import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SITE_URL = 'https://chis.dev'
const postsDir = path.join(process.cwd(), 'content/posts')
const outDir = path.join(process.cwd(), 'public')

const filenames = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))

const posts = filenames
  .map((filename) => {
    const slug = filename.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(postsDir, filename), 'utf8')
    const { data } = matter(content)
    return { slug, frontmatter: data }
  })
  .filter((post) => !post.frontmatter.draft && !post.frontmatter.hidden)

const today = new Date().toISOString().split('T')[0]

const urls = [
  `  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ...posts.map(
    (post) => `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)
console.log(`Generated sitemap.xml with ${urls.length} URLs`)
