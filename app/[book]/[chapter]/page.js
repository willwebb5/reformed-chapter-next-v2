import ChapterPage from '@/components/ChapterPage/ChapterPage'
import { urlToBook } from '@/lib/Constants'

export const revalidate = 86400 // 24 hours in seconds

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const bookName = urlToBook(resolvedParams.book)
  
  return {
    title: `${bookName} ${resolvedParams.chapter} - Reformed Chapter`,
    description: `Bible study resources for ${bookName} chapter ${resolvedParams.chapter}`,
    openGraph: {
      title: `${bookName} ${resolvedParams.chapter} - Reformed Chapter`,
      description: `Bible study resources for ${bookName} chapter ${resolvedParams.chapter}`,
    }
  }
}

export default async function BookChapterPage({ params }) {
  const resolvedParams = await params;
  return <ChapterPage params={resolvedParams} />
}