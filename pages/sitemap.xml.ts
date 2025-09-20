import type { GetServerSideProps } from 'next'

// Static sitemap for promotional single-page style site
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'application/xml')
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
  const now = new Date().toISOString()
  const staticUrls = [
    '',
    '#features',
    '#showcase',
    '#about',
    '#contact'
  ]
    .map(path => `<url><loc>${baseUrl}/${path}</loc><lastmod>${now}</lastmod></url>`)
    .join('\n  ')
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${staticUrls}\n</urlset>`)
  res.end()
  return { props: {} }
}

export default function SiteMap() { return null }
