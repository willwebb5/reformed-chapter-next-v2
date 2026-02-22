import Home from '@/components/Home/Home'

export const revalidate = 86400

export const metadata = {
  title: 'Reformed Chapter - Bible Study Resources',
  description: 'Comprehensive Bible study resources organized by chapter',
}

export default function HomePage() {
  return <Home />
}