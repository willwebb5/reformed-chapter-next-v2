'use client'
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import ChapterDesktop from './ChapterDesktop';
import ChapterMobile from './ChapterMobile';
import { bibleBooks, urlToBook } from '@/lib/Constants';
import Link from 'next/link';

// 404 Page Component
function NotFoundPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link 
        href="/" 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007cba', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px',
          display: 'inline-block'
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

function ChapterPage({ params }) {
  const book = params?.book;
  const chapter = params?.chapter;
  
  // Use react-responsive for hydration-safe mobile detection
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Validate book exists
  const bookName = urlToBook(book);
  if (!bookName) {
    return <NotFoundPage />;
  }
  
  const bookInfo = bibleBooks.find(b => b.name === bookName);
  if (!bookInfo) {
    return <NotFoundPage />;
  }
  
  const chapterNum = parseInt(chapter);
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookInfo.chapters) {
    return <NotFoundPage />;
  }

  return (
    <div suppressHydrationWarning>
      {isMobile ? (
        <ChapterMobile book={book} chapter={chapter} />
      ) : (
        <ChapterDesktop book={book} chapter={chapter} />
      )}
    </div>
  );
}  // ← This closing brace is CRITICAL!

export default ChapterPage;