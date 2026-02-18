export function sortByVerse(a, b) {
  const getFirstVerse = (str) => {
    if (!str) return 0;
    const match = str.match(/:(\d+)/); // first verse number after colon
    return match ? parseInt(match[1], 10) : 0;
  };

  const verseA = getFirstVerse(a.scripture);
  const verseB = getFirstVerse(b.scripture);

  return verseA - verseB;
}

// Helper function to normalize book names
export function normalizeBookName(name) {
  return name.toLowerCase()
    .replace(/^(\d+)\s*/, '$1 ') // Ensure space after numbers like "1 Corinthians"
    .replace(/\s+/g, ' ')       // Normalize multiple spaces
    .trim();
};

// Parse secondary scripture references
export function parseSecondaryScripture(secondaryScripture, currentBook, currentChapter) {
  if (!secondaryScripture) return true;
  
  //console.log(`\n--- Parsing secondary scripture ---`);
  //console.log(`Input: "${secondaryScripture}"`);
  //console.log(`Looking for: ${currentBook} chapter ${currentChapter}`);
  
  // Split by semicolons first, then by commas
  const mainReferences = secondaryScripture.split(';').map(ref => ref.trim());
  
  for (let mainRef of mainReferences) {
    //console.log(`  Checking main reference: "${mainRef}"`);
    
    // Split by commas for sub-references
    const subReferences = mainRef.split(',').map(ref => ref.trim());
    
    for (let ref of subReferences) {
      //console.log(`    Checking sub-reference: "${ref}"`);
      
      // Special case for "Job (varied chapters)"
      if (ref.includes('(varied chapters)')) {
        const bookMatch = ref.match(/^([A-Za-z0-9\s]+)\s*\(/);
        if (bookMatch) {
          const bookName = bookMatch[1].trim();
          //console.log(`      Special case - Book: "${bookName}"`);
          if (normalizeBookName(bookName) === normalizeBookName(currentBook)) {
            //console.log(`      ✓ Match found (varied chapters)!`);
            return true;
          }
        }
        continue;
      }
      
      // Regular parsing for specific references
      const match = ref.match(/^(\d*\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+)(?:[–-](\d+))?)?(?:[–-](\d+)(?::(\d+))?)?/);
      
      if (match) {
        const [, bookName, startChapter, , , endChapter] = match;
        const cleanBook = bookName.trim();
        
        //console.log(`      Parsed: Book="${cleanBook}", Chapter=${startChapter}`);
        
        // Check if book matches
        if (normalizeBookName(cleanBook) === normalizeBookName(currentBook)) {
          //console.log(`      Book matches!`);
          
          const chapterStart = parseInt(startChapter);
          let chapterEnd = chapterStart;
          
          // Check if there's a chapter range
          if (endChapter) {
            chapterEnd = parseInt(endChapter);
          }
          
          //console.log(`      Chapter range: ${chapterStart} to ${chapterEnd}`);
          //console.log(`      Current chapter ${currentChapter} in range? ${currentChapter >= chapterStart && currentChapter <= chapterEnd}`);
          
          if (currentChapter >= chapterStart && currentChapter <= chapterEnd) {
            //console.log(`      ✓ Match found!`);
            return true;
          }
        }
      } else {
        //console.log(`      No regex match for: "${ref}"`);
      }
    }
  }
  
  //console.log(`    No matches found for any references`);
  return false;
};
