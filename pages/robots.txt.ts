import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain')
  const base = process.env.SITE_URL || 'http://localhost:3000'
  res.write(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`)
  res.end()
  return { props: {} }
}

export default function RobotsTxt() {
  return null
}
