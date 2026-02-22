import { bibleBooks, bookToUrl } from '@/lib/Constants'

export default function sitemap() {
  const baseUrl = 'https://www.reformedchapter.com'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/submitresource`, lastModified: new Date(), priority: 0.5 },
  ]

  // Dynamic chapter pages
  const chapterPages = bibleBooks.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, i) => ({
      url: `${baseUrl}/${bookToUrl(book.name)}/${i + 1}`,
      lastModified: new Date(),
      priority: 0.7,
    }))
  )

  return [...staticPages, ...chapterPages]
}