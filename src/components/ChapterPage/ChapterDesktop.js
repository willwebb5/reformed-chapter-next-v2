// ChapterDesktop.js
'use client'
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import LoadingScreen from '@/components/LoadingScreen';
import { typeLabels, bibleBooks, resourceTypes, urlToBook, bookToUrl } from '@/lib/Constants';
import SortFilter from '@/lib/SortFilter';
import Intro from "@/components/Intro";
import { supabase } from '@/lib/SupaBaseInfo';
import { parseSecondaryScripture } from '@/lib/Logic';
import Footer from "@/components/Footer/DesktopFooter";
import Link from 'next/link';



function ChapterDesktop({ book, chapter }) {
  const bookName = urlToBook(book);
  const chapterNum = parseInt(chapter);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({
    types: new Set(resourceTypes.map((t) => t.toLowerCase())),
    authors: new Set(),
    price: new Set(),
  });
  const [availableAuthors, setAvailableAuthors] = useState(new Set());
  const [primaryResources, setPrimaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    videos: [],
  });
  const [secondaryResources, setSecondaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    videos: [],
  });

  // Add selected book/chapter state for the dropdowns
  const [selectedBook, setSelectedBook] = useState(bookName);
  const [selectedChapter, setSelectedChapter] = useState(chapterNum);

  const bookInfo = bibleBooks.find((b) => b.name === bookName);
  const totalChapters = bookInfo?.chapters || 1;
  const chaptersCount = bibleBooks.find((book) => book.name === selectedBook)?.chapters || 0;

  const normalize = (str) => str.toLowerCase().trim().replace(/s$/, "");

  const fetchResources = async () => {
    if (!bookName || !chapterNum) return;

    setLoading(true);
    setError("");

    try {
      const BATCH_SIZE = 1000;
      let allData = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .range(from, from + BATCH_SIZE - 1);
        
        if (error) throw error;
        
        if (data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...data];
          from += BATCH_SIZE;
          
          if (data.length < BATCH_SIZE) {
            hasMore = false;
          }
        }
      }

      console.log("Total rows fetched:", allData.length);
      console.log("Sample IDs:", allData.slice(0, 5).map(r => r.id));
      console.log("Last IDs:", allData.slice(-6).map(r => r.id));
      
      // Use allData instead of data from here on
      const data = allData;

      // Extract authors
      const uniqueAuthors = new Set();
      data.forEach((r) => {
        if (r.author?.trim()) uniqueAuthors.add(r.author.trim());
      });
      setAvailableAuthors(uniqueAuthors);

      // Helper to map resource fields
      const processResource = (r) => ({
        ...r,
        formattedReference: r.reference || "",
        secondary_scripture: r.secondary_scripture || "",
      });

      // Filter primary resources for this chapter
      const primaryData = data
        .filter((r) => {
          if (r.book !== bookName) return false;
          if (!r.chapter) return true;
          const start = parseInt(r.chapter);
          const end = r.chapter_end ? parseInt(r.chapter_end) : start;
          return chapterNum >= start && chapterNum <= end;
        })
        .map(processResource);

      // Filter secondary resources
      const secondaryData = data
        .filter(
          (r) =>
            r.secondary_scripture &&
            parseSecondaryScripture(r.secondary_scripture, bookName, chapterNum)
        )
        .map(processResource);

      // Group by type (removed books)
      const groupResources = (items) => ({
        sermons: items.filter((r) => normalize(r.type) === "sermon"),
        commentaries: items.filter((r) => normalize(r.type) === "commentary"),
        devotionals: items.filter((r) => normalize(r.type) === "devotional"),
        videos: items.filter((r) => normalize(r.type) === "video"),
      });

      setPrimaryResources(groupResources(primaryData));
      setSecondaryResources(groupResources(secondaryData));
    } catch (err) {
      setError(`Error fetching resources: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [bookName, chapterNum]);

  // Update selected states when URL changes
  useEffect(() => {
    if (bookName) setSelectedBook(bookName);
    if (chapterNum && !isNaN(chapterNum)) setSelectedChapter(chapterNum);
  }, [bookName, chapterNum]);

  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || !items.length) return [];

      let filtered = items.filter((item) => {
        const filterType = item.type.toLowerCase().replace(/s$/, "");
        const typeMatch = filters.types.has(
          filterType === "commentary" ? "commentaries" : filterType + "s"
        );

        const authorMatch =
          !filters.authors.size || filters.authors.has(item.author?.trim());
        const priceMatch =
          !filters.price.size ||
          filters.price.has(
            !item.price || item.price.toLowerCase() === "free" ? "free" : "paid"
          );

        return typeMatch && authorMatch && priceMatch;
      });

      if (sortBy === "alphabetical") filtered.sort((a, b) => a.title.localeCompare(b.title));
      if (sortBy === "newest")
        filtered.sort(
          (a, b) => (parseInt(b.published_year) || 0) - (parseInt(a.published_year) || 0)
        );

      return filtered;
    };
  }, [filters, sortBy]);

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[category]);
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
      return { ...prev, [category]: newSet };
    });
  };

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < totalChapters ? chapterNum + 1 : null;

  if (!bookName) return <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>Book not found</div>;

  const bubbleStyle = {
    backgroundColor: "#f5f5f5",
    padding: "0.3rem 0.6rem",
    borderRadius: "16px",
    fontSize: "0.65rem",
    fontWeight: "500",
    color: "#555",
    border: "1px solid #e0e0e0",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem"
  };

  const ResourceCard = ({ resource, isSecondary }) => {
    const {
      title,
      author,
      url,
      price,
      book,
      chapter,
      chapter_end,
      verse_start,
      verse_end,
      secondary_scripture,
      description,
      image,
      published_year
    } = resource;

    const formattedReference = book
      ? chapter
        ? chapter_end && chapter_end !== chapter
          ? `${book} ${chapter}` +
            (verse_start ? `:${verse_start}` : '') +
            `–${chapter_end}` +
            (verse_end ? `:${verse_end}` : '')
          : `${book} ${chapter}` +
            (verse_start ? `:${verse_start}` : '') +
            (verse_end && verse_end !== verse_start ? `–${verse_end}` : '')
        : `${book}` // For whole-book resources, just show the book
      : null;

    return (
      <div
        style={{
          display: "flex",
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "1.25rem",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          cursor: "pointer",
          maxWidth: "700px",
          marginBottom: "1.5rem",
          minHeight: description ? "auto" : "90px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <img
          src={image || '/MustardSeed.png'}
          alt={title}
          onError={(e) => { e.target.src = '/MustardSeed.png'; }}
          style={{
            width: "auto",
            height: "100px",
            objectFit: "scale-down",
            borderRadius: "8px",
            marginRight: "1rem",
          }}
        />

        <div style={{ flex: 1, display: "flex", gap: "1rem" }}>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            minWidth: 0
          }}>
            <div style={{ flex: "1" }}>
              <h4
                style={{
                  margin: "0",
                  color: "#000000",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  lineHeight: "1.3",
                  marginBottom: description ? "0.8rem" : "0.6rem"
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none",
                    borderBottom: "2px solid transparent",
                    transition: "border-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.borderBottomColor = "#2563eb"}
                  onMouseLeave={(e) => e.target.style.borderBottomColor = "transparent"}
                >
                  {title}
                </a>
              </h4>
              
              <p
                style={{
                  margin: "0",
                  color: "#666666",
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  lineHeight: "1.4"
                }}
              >
                {description && description.trim() !== ""
                  ? description
                  : "No description available."}
              </p>
            </div>

            <div style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              gap: "0.6rem", 
              marginTop: description ? "1.2rem" : "auto",
              alignItems: "center",
              overflow: "hidden"
            }}>
              {author && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>👤</span>
                  {author}
                </span>
              )}

              {formattedReference && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>📖</span>
                  {formattedReference}
                </span>
              )}

              {price && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>💲</span>
                  {price.toLowerCase() === "free" ? "Free" : price}
                </span>
              )}

              {published_year && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>📅</span>
                  {published_year}
                </span>
              )}
            </div>
          </div>

          {secondary_scripture && (
            <div style={{
              flexShrink: 0,
              width: "180px",
              paddingLeft: "1rem",
              paddingTop: "0.5rem",
              borderLeft: "2px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              fontSize: "0.8rem",
              fontStyle: "italic",
              color: "#666666",
              textAlign: "left"
            }}>
              <strong style={{ 
                fontStyle: "normal", 
                color: "#374151",
                fontWeight: "600",
                marginBottom: "0.3rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Secondary Scripture
              </strong>
              <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>
                {secondary_scripture}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResourceGrid = ({ title, primaryItems, secondaryItems }) => {
    const filteredPrimary = filterAndSortResources(primaryItems);
    const filteredSecondary = filterAndSortResources(secondaryItems);
    const totalItems = filteredPrimary.length + filteredSecondary.length;

    return (
      <section
        style={{
        width: "100%",
        border: "1px solid #cccccc",
        borderRadius: "8px",
        padding: "0.5rem 1rem 1.5rem",  // less top, more bottom
        marginBottom: "1.5rem",
        backgroundColor: "#f9f9f9",
        flexDirection: "column"
      }}
      >
        <h2 style={{ marginTop: 0, color: "#000000", fontFamily: "Georgia, serif", marginBottom: 10 }}>
          {title} ({totalItems})
        </h2>
        {loading ? (
          <p style={{ fontStyle: "italic", color: "#666666" }}>Loading...</p>
        ) : totalItems === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666666" }}>
            No resources available
          </p>
        ) : (
          <div>
            {filteredPrimary.map((resource) => (
              <ResourceCard key={`primary-${resource.id}`} resource={resource} />
            ))}
            {filteredSecondary.map((resource) => (
              <ResourceCard key={`secondary-${resource.id}`} resource={resource} isSecondary={true} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div style={{ 
      padding: "0rem 2rem 2rem", 
      textAlign: "center", 
      backgroundColor: "#ffffff",
      color: "#000000",
      minHeight: "100vh"
    }}>
      <Header />
      
      {/* Intro positioned above everything else */}
      <div style={{ paddingTop: "80px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Intro />
        </div>
      </div>
      
      {loading && (
        <LoadingScreen 
          selectedBook={bookName} 
          selectedChapter={chapter} 
          faviconUrl="/favicon.ico" 
        />
      )}
      
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "1rem",
          borderRadius: "4px",
          margin: "1rem 0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          {error}
        </div>
      )}

      <div style={{ paddingTop: "20px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Navigation controls: Book and Chapter selects with Prev/Next buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            {/* Book select */}
            <div>
              <label htmlFor="book-select" style={{ fontWeight: "bold", color: "#000000" }}>
                Choose a book:
              </label>
              <br />
              <select
                id="book-select"
                value={selectedBook}
                onChange={(e) => {
                  const newBook = e.target.value;
                  setSelectedBook(newBook);
                  
                  if (newBook) {
                    // Get the number of chapters for the newly selected book
                    const newBookInfo = bibleBooks.find(book => book.name === newBook);
                    const newBookChapters = newBookInfo?.chapters || 1;
                    
                    // Reset chapter to 1 (or keep current if it's valid for the new book)
                    const newChapter = selectedChapter <= newBookChapters ? selectedChapter : 1;
                    setSelectedChapter(newChapter);
                    
                    // Navigate to the new book/chapter
                    window.location.href = `/${bookToUrl(newBook)}/${newChapter}`;
                  } else {
                    // If no book selected, reset chapter
                    setSelectedChapter("");
                  }
                }}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid #000000",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
              >
                <option value="">-- Book --</option>
                {bibleBooks.map((book) => (
                  <option key={book.name} value={book.name}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter select */}
            <div>
              <label htmlFor="chapter-select" style={{ fontWeight: "bold", color: "#000000" }}>
                Choose a chapter:
              </label>
              <br />
              <select
                id="chapter-select"
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(parseInt(e.target.value));
                  // Navigate to new book/chapter if both are selected
                  if (selectedBook && e.target.value) {
                    window.location.href = `/${bookToUrl(selectedBook)}/${e.target.value}`;
                  }
                }}
                disabled={!selectedBook}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid #000000",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
              >
                <option value="">##</option>
                {Array.from({ length: chaptersCount }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Previous/Next Navigation */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              {prevChapter && (
                <Link 
                  href={`/${bookToUrl(bookName)}/${prevChapter}`}
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none", 
                    padding: "0.6rem 1rem", 
                    border: "1.5px solid #000000",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff",
                    display: "inline-block",
                    textAlign: "center",
                    minWidth: "70px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                >
                  ← Prev
                </Link>
              )}

              {nextChapter && (
                <Link 
                  href={`/${bookToUrl(bookName)}/${nextChapter}`}
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none", 
                    padding: "0.6rem 1rem", 
                    border: "1.5px solid #000000",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff",
                    display: "inline-block",
                    textAlign: "center",
                    minWidth: "70px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                >
                  Next →
                </Link>
              )}
            </div>
          </div>

          {/* Resources header */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: ".5rem",
            marginBottom: ".5rem"
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(217, 196, 140, 0.15) 0%, rgba(142, 119, 39, 0.1) 100%)",
              padding: "1.25rem 2.5rem",
              borderRadius: "16px",
              border: "2px solid #d9c48c",
              boxShadow: "0 4px 6px rgba(142, 119, 39, 0.1)"
            }}>
              <h1 style={{ 
                fontWeight: "700", 
                fontFamily:"times New Roman",
                color: "#000000",
                fontSize: "2rem",
                textAlign: "center",
                margin: "0",
                textShadow: "none",
              }}>
                Resources for {bookName} {chapterNum}
              </h1>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div style={{
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
          marginTop: "2rem"
        }}>
          <SortFilter 
            sortBy={sortBy} 
            setSortBy={setSortBy} 
            filters={filters} 
            setFilters={setFilters} 
            toggleFilter={toggleFilter} 
            availableAuthors={availableAuthors} 
          />

          {Object.keys(typeLabels).map((typeKey) => {
            // Skip books section
            if (typeKey === "books") return null;
            if (!filters.types.has(typeKey)) return null;

            return (
              <ResourceGrid
                key={typeKey}
                title={typeLabels[typeKey]}
                primaryItems={primaryResources[typeKey] || []}
                secondaryItems={secondaryResources[typeKey] || []}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ChapterDesktop;