//DesktopHome.js
'use client'
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import LoadingScreen from '@/components/LoadingScreen';
import { typeLabels, bibleBooks, resourceTypes, bookToUrl } from '@/lib/Constants';
import SortFilter from '@/lib/SortFilter';
import Intro from "../Intro";
import { supabase } from '@/lib/SupaBaseInfo';
import { parseSecondaryScripture } from '@/lib/Logic';
import Footer from "../Footer/DesktopFooter";


function App() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fixed filter state initialization
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({
    types: new Set(resourceTypes.map((t) => t.toLowerCase())),
    authors: new Set(),
    price: new Set()
  });

  // Add state to track available authors from database
  const [availableAuthors, setAvailableAuthors] = useState(new Set());

  // Separate state for primary and secondary scripture resources
  const [primaryResources, setPrimaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    books: [],
    videos: [],
  });

  const [secondaryResources, setSecondaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    books: [],
    videos: [],
  });

  // New state for author-only resources
  const [authorOnlyResources, setAuthorOnlyResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    books: [],
    videos: [],
  });

  const chaptersCount =
    bibleBooks.find((book) => book.name === selectedBook)?.chapters || 0;

  // Check if we're in author-only mode
  const isAuthorOnlyMode = useMemo(() => {
    return filters.authors.size > 0 && (!selectedBook || !selectedChapter);
  }, [filters.authors, selectedBook, selectedChapter]);

  // Add navigation effect when both book and chapter are selected
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const urlBook = bookToUrl(selectedBook);
      router.push(`/${urlBook}/${selectedChapter}`);
    }
  }, [selectedBook, selectedChapter, router]);

  const fetchResources = async () => {
    // If neither book/chapter nor author is selected, don't fetch
    if (!selectedBook && filters.authors.size === 0) {
      setPrimaryResources({
        sermons: [], commentaries: [], devotionals: [], books: [], videos: []
      });
      setSecondaryResources({
        sermons: [], commentaries: [], devotionals: [], books: [], videos: []
      });
      setAuthorOnlyResources({
        sermons: [], commentaries: [], devotionals: [], books: [], videos: []
      });
      return;
    }

    // If we have a book but no chapter, don't fetch scripture-based resources
    if (selectedBook && !selectedChapter && filters.authors.size === 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch all resources
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .limit(10000);

      if (error) throw error;

      console.log("Data from Supabase:", data);
      
      // Extract unique authors from all data and update availableAuthors
      const uniqueAuthors = new Set();
      data.forEach(resource => {
        if (resource.author && resource.author.trim() !== '') {
          uniqueAuthors.add(resource.author.trim());
        }
      });
      setAvailableAuthors(uniqueAuthors);

      // Handle author-only mode
      if (isAuthorOnlyMode) {
        console.log("Author-only mode activated");
        const selectedAuthors = Array.from(filters.authors);
        
        const authorData = data.filter(resource => {
          return resource.author && selectedAuthors.includes(resource.author.trim());
        });

        console.log("Author-only resources found:", authorData);

        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, '');

        // Group author resources by type
        const groupedAuthorResources = {
          sermons: authorData.filter(r => normalize(r.type) === 'sermon'),
          books: authorData.filter(r => normalize(r.type) === 'book'),
          commentaries: authorData.filter(r => normalize(r.type) === 'commentary'),
          devotionals: authorData.filter(r => normalize(r.type) === 'devotional'),
          videos: authorData.filter(r => normalize(r.type) === 'video'),
        };

        setAuthorOnlyResources(groupedAuthorResources);
        
        // Clear scripture-based resources in author-only mode
        setPrimaryResources({
          sermons: [], commentaries: [], devotionals: [], books: [], videos: []
        });
        setSecondaryResources({
          sermons: [], commentaries: [], devotionals: [], books: [], videos: []
        });
        
        setLoading(false);
        return;
      }

      // Original scripture-based logic
      if (selectedBook && selectedChapter) {
        const selectedChapterNum = parseInt(selectedChapter);
        
        const primaryData = data.filter(resource => {
          if (resource.book !== selectedBook) return false;

          // If no chapter specified, treat as whole book
          if (!resource.chapter) return true;

          const start = parseInt(resource.chapter);
          const end = resource.chapter_end ? parseInt(resource.chapter_end) : start;
          return selectedChapterNum >= start && selectedChapterNum <= end;
        });

        const secondaryData = data.filter(resource => {
          if (!resource.secondary_scripture) return false;
          
          console.log(`\nChecking resource: "${resource.title}"`);
          console.log(`  Secondary scripture: "${resource.secondary_scripture}"`);
          
          const secondaryMatch = parseSecondaryScripture(resource.secondary_scripture, selectedBook, selectedChapterNum);
          console.log(`  Match result: ${secondaryMatch}`);
          
          return secondaryMatch;
        });

        console.log("Primary Resources:", primaryData);
        console.log("Secondary Resources:", secondaryData);

        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, '');

        // Group primary resources by type
        const groupedPrimaryResources = {
          sermons: primaryData.filter(r => normalize(r.type) === 'sermon'),
          books: primaryData.filter(r => normalize(r.type) === 'book'),
          commentaries: primaryData.filter(r => normalize(r.type) === 'commentary'),
          devotionals: primaryData.filter(r => normalize(r.type) === 'devotional'),
          videos: primaryData.filter(r => normalize(r.type) === 'video'),
        };

        // Group secondary resources by type
        const groupedSecondaryResources = {
          sermons: secondaryData.filter(r => normalize(r.type) === 'sermon'),
          books: secondaryData.filter(r => normalize(r.type) === 'book'),
          commentaries: secondaryData.filter(r => normalize(r.type) === 'commentary'),
          devotionals: secondaryData.filter(r => normalize(r.type) === 'devotional'),
          videos: secondaryData.filter(r => normalize(r.type) === 'video'),
        };

        setPrimaryResources(groupedPrimaryResources);
        setSecondaryResources(groupedSecondaryResources);
        
        // Clear author-only resources when in scripture mode
        setAuthorOnlyResources({
          sermons: [], commentaries: [], devotionals: [], books: [], videos: []
        });
      }
    } catch (err) {
      setError(`Error fetching resources: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Fetch all authors on component mount for immediate availability
  const fetchAllAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('author')
        .not('author', 'is', null)
        .not('author', 'eq', '');

      if (error) throw error;

      const uniqueAuthors = new Set();
      data.forEach(resource => {
        if (resource.author && resource.author.trim() !== '') {
          uniqueAuthors.add(resource.author.trim());
        }
      });
      setAvailableAuthors(uniqueAuthors);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedBook, selectedChapter, filters.authors, isAuthorOnlyMode]);

  // Fetch all authors on component mount
  useEffect(() => {
    fetchAllAuthors();
  }, []);

  // Improved filtering and sorting function
  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || items.length === 0) return [];

      let filtered = items.filter(item => {
        // Type filter
        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, '');
        const getFilterType = (databaseType) => {
          const normalized = normalize(databaseType);
          if (normalized === 'commentary') return 'commentaries';
          return normalized + 's';
        };
        
        const filterType = getFilterType(item.type);
        const typeMatch = filters.types.has(filterType);
        
        // Author filter - in author-only mode, this is already handled by fetchResources
        // For scripture mode, apply author filter if any authors are selected
        let authorMatch = true;
        if (!isAuthorOnlyMode && filters.authors.size > 0) {
          authorMatch = item.author && filters.authors.has(item.author.trim());
        }
        
        // Price filter
        let priceMatch = true;
        if (filters.price.size > 0) {
          const itemPrice = !item.price || item.price === "0" || item.price.toLowerCase() === "free" ? "free" : "paid";
          priceMatch = filters.price.has(itemPrice);
        }

        return typeMatch && authorMatch && priceMatch;
      });

      // Apply sorting
      switch (sortBy) {
        case 'alphabetical':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'date':
        case 'newest':
          filtered.sort((a, b) => {
            const yearA = parseInt(a.published_year) || 0;
            const yearB = parseInt(b.published_year) || 0;
            return yearB - yearA; // newest first
          });
          break;
        case 'oldest':
          filtered.sort((a, b) => {
            const yearA = parseInt(a.published_year) || 0;
            const yearB = parseInt(b.published_year) || 0;
            return yearA - yearB; // oldest first
          });
          break;
        case 'scripture':
          // Only sort by scripture if we're not in author-only mode
          if (!isAuthorOnlyMode) {
            filtered.sort((a, b) => {
              const aChapter = parseInt(a.chapter) || 0;
              const bChapter = parseInt(b.chapter) || 0;

              if (aChapter !== bChapter) return aChapter - bChapter;

              const aVerse = parseInt(a.verse_start) || 0;
              const bVerse = parseInt(b.verse_start) || 0;

              return aVerse - bVerse;
            });
          }
          break;
        default:
          // Default order - no sorting
          break;
      }

      return filtered;
    };
  }, [filters, sortBy, isAuthorOnlyMode]);

  const addResource = async (resourceData) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          book: resourceData.book,
          chapter: resourceData.chapter,
          chapter_end: resourceData.chapter_end,
          verse_start: resourceData.verse_start,
          verse_end: resourceData.verse_end,
          secondary_scripture: resourceData.secondary_scripture,
          type: resourceData.type,
          title: resourceData.title,
          author: resourceData.author,
          url: resourceData.url,
          description: resourceData.description,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      fetchResources();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding resource:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[category]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [category]: newSet };
    });
  };

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

  const ResourceCard = ({ resource, isSecondary = false }) => {
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
          backgroundColor: "white",
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
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "auto",
              height: "100px",
              objectFit: "scale-down",
              borderRadius: "8px",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          />
        )}

        <div style={{ flex: 1, display: "flex", gap: "1rem" }}>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            minWidth: 0 // Allows flex item to shrink below its content size
          }}>
            <div style={{ flex: "1" }}>
              <h4
                style={{
                  margin: "0",
                  color: "#000",
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
              
              {description && (
                <p style={{ 
                  margin: "0", 
                  color: "#666", 
                  fontSize: "0.95rem", 
                  fontStyle: "italic",
                  lineHeight: "1.4"
                }}>
                  {description}
                </p>
              )}
            </div>

            <div style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              gap: "0.6rem", 
              marginTop: description ? "1.2rem" : "auto",
              alignItems: "center",
              overflow: "hidden" // Prevents bubbles from overflowing
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
              width: "180px", // Fixed width instead of percentage
              paddingLeft: "1rem",
              paddingTop: "0.5rem",
              borderLeft: "2px solid #e5e7eb", // Visual separator
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              fontSize: "0.8rem",
              fontStyle: "italic",
              color: "#666",
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

  const ResourceGrid = ({ title, primaryItems, secondaryItems, authorOnlyItems }) => {
    const filteredPrimaryItems = filterAndSortResources(primaryItems);
    const filteredSecondaryItems = filterAndSortResources(secondaryItems);
    const filteredAuthorOnlyItems = filterAndSortResources(authorOnlyItems || []);
    
    const totalItems = filteredPrimaryItems.length + filteredSecondaryItems.length + filteredAuthorOnlyItems.length;

    return (
      <section
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#f9f9f9",
          flexDirection: "column"
        }}
      >
        <h2 style={{ marginTop: 0, color: "black", fontFamily:"Georgia" }}>
          {title} ({totalItems})
        </h2>
        {loading ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>Loading...</p>
        ) : totalItems === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            No resources available
          </p>
        ) : (
          <div>
            {/* Author-only resources first when in author-only mode */}
            {filteredAuthorOnlyItems.map((resource) => (
              <ResourceCard key={`author-only-${resource.id}`} resource={resource} />
            ))}
            
            {/* Primary scripture resources */}
            {filteredPrimaryItems.map((resource) => (
              <ResourceCard key={`primary-${resource.id}`} resource={resource} />
            ))}
            
            {/* Secondary scripture resources */}
            {filteredSecondaryItems.map((resource) => (
              <ResourceCard key={`secondary-${resource.id}`} resource={resource} isSecondary={true} />
            ))}
          </div>
        )}
      </section>
    );
  };

  // Determine what message to show when no resources are displayed
  const getNoResourcesMessage = () => {
    if (isAuthorOnlyMode) {
      const selectedAuthorsArray = Array.from(filters.authors);
      return `Showing all resources by ${selectedAuthorsArray.join(', ')}`;
    }
    
    if (!selectedBook && !selectedChapter && filters.authors.size === 0) {
      return "Please select a book and chapter to view resources, or filter by author to see all resources by that author.";
    }
    
    if (selectedBook && !selectedChapter) {
      return "Please select a chapter to view resources.";
    }
    
    return "Please select a book and chapter to view resources.";
  };

  // Determine if we should show resources
  const shouldShowResources = selectedBook && selectedChapter || isAuthorOnlyMode;

  return (
    <div style={{ padding: "0rem 2rem 2rem", textAlign: "center" }}>
      {loading && (selectedBook && selectedChapter || isAuthorOnlyMode) && (
        <LoadingScreen 
          selectedBook={isAuthorOnlyMode ? "Author Resources" : selectedBook} 
          selectedChapter={isAuthorOnlyMode ? Array.from(filters.authors).join(', ') : selectedChapter}
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

      <div style={{ paddingTop: "80px", textAlign: "center" }}>
        {/* Wrapper for Intro + selects */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px", // very small vertical gap
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Intro bubble */}
          <Intro />

          {/* Book and Chapter selects */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem", // horizontal spacing between selects
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Book select */}
            <div>
              <label htmlFor="book-select" style={{ fontWeight: "bold", color:"black" }}>
                Choose a book:
              </label>
              <br />
              <select
                id="book-select"
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter("");
                }}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid black",
                  backgroundColor: "white",
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
              <label htmlFor="chapter-select" style={{ fontWeight: "bold" }}>
                Choose a chapter:
              </label>
              <br />
              <select
                id="chapter-select"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                disabled={!selectedBook}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid black",
                  backgroundColor: "white",
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
          </div>
        </div>
      </div>
      
      <div
        style={{
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "2rem",
          textAlign: "left",
        }}
      >
        {/* Use the SortFilter component - now with availableAuthors */}
        <SortFilter 
          sortBy={sortBy}
          setSortBy={setSortBy}
          filters={filters}
          setFilters={setFilters}
          toggleFilter={toggleFilter}
          availableAuthors={availableAuthors}
        />
        
        {shouldShowResources && (
          <>
            {/* Show status message for author-only mode */}
            {isAuthorOnlyMode && (
              <div style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "1rem",
                borderRadius: "8px",
                margin: "1rem 0",
                textAlign: "center",
                fontWeight: "500"
              }}>
                {getNoResourcesMessage()}
              </div>
            )}
            
            {Object.keys(typeLabels).map((typeKey) => {
              if (!filters.types.has(typeKey)) return null;

              return (
                <ResourceGrid
                  key={typeKey}
                  title={typeLabels[typeKey]}
                  primaryItems={primaryResources[typeKey] || []}
                  secondaryItems={secondaryResources[typeKey] || []}
                  authorOnlyItems={authorOnlyResources[typeKey] || []}
                />
              );
            })}
          </>
        )}
        
        {!shouldShowResources && (
          <p style={{ 
            textAlign: "center", 
            color: "#666", 
            fontStyle: "italic",
            padding: "2rem"
          }}>
            {getNoResourcesMessage()}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;