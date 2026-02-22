import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Reformed Chapter | Bible Resources by Chapter',
  description: 'Explore Reformed sermons, commentaries, and articles organized by Bible chapter.',
  openGraph: {
    type: 'website',
    siteName: 'Reformed Chapter',
    title: 'Reformed Chapter | Bible Resources by Chapter',
    description: 'Explore Reformed sermons, commentaries, and articles organized by Bible chapter.',
    url: 'https://www.reformedchapter.com',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'Reformed Chapter',
      }
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-E8B7GY44QG"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E8B7GY44QG');
          `}
        </Script>

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}