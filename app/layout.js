import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Reformed Chapter',
  description: 'Bible study resources organized by chapter',
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