// ChapterMobile.js
'use client'
import React, { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import Header from '@/components/Header/Header';
import LoadingScreen from '@/components/LoadingScreen';
import SortFilter from '@/lib/SortFilter';
import { supabase } from '@/lib/SupaBaseInfo';
import Intro from '@/components/Intro';
import {
  typeLabels,
  bibleBooks,
  resourceTypes,
  urlToBook,
  bookToUrl,
} from "@/lib/Constants";
import { parseSecondaryScripture } from "@/lib/Logic";
import { useRouter } from 'next/navigation';



function ChapterMobile({ book, chapter }) {
  const bookName = urlToBook(book);
  const chapterNum = parseInt(chapter);
  const router = useRouter();
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

  // -----------------------
  // Fetch All Authors (on component mount)
  // -----------------------
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

  const fetchResources = async () => {
    if (!bookName || !chapterNum) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.from("resources").select("*").limit(10000);
      if (error) throw error;

      // Extract unique authors from all data and update availableAuthors
      const uniqueAuthors = new Set();
      data.forEach(resource => {
        if (resource.author && resource.author.trim() !== '') {
          uniqueAuthors.add(resource.author.trim());
        }
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

      // Group by type
      const groupResources = (items) => ({
        sermons: items.filter((r) => normalize(r.type) === "sermon"),
        commentaries: items.filter((r) => normalize(r.type) === "commentary"),
        devotionals: items.filter((r) => normalize(r.type) === "devotional"),
        books: items.filter((r) => normalize(r.type) === "book"),
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
}, [book, chapter]); // Watch the props directly

  // Fetch all authors on component mount
  useEffect(() => {
    fetchAllAuthors();
  }, []);

  // Update selected states when URL changes
  useEffect(() => {
    if (bookName) setSelectedBook(bookName);
    if (chapterNum && !isNaN(chapterNum)) setSelectedChapter(chapterNum);
  }, [bookName, chapterNum]);

  // -----------------------
  // Filtering & Sorting
  // -----------------------
  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || items.length === 0) return [];

      let filtered = items.filter((item) => {
        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, "");
        const getFilterType = (dbType) =>
          normalize(dbType) === "commentary"
            ? "commentaries"
            : normalize(dbType) + "s";

        const typeMatch = filters.types.has(getFilterType(item.type));
        
        // Author filter - improved to handle actual database authors
        const authorMatch = filters.authors.size === 0 || 
          (item.author && filters.authors.has(item.author.trim()));

        let priceMatch = true;
        if (filters.price.size > 0) {
          const itemPrice =
            !item.price || item.price === "0" || item.price.toLowerCase() === "free"
              ? "free"
              : "paid";
          priceMatch = filters.price.has(itemPrice);
        }

        return typeMatch && authorMatch && priceMatch;
      });

      switch (sortBy) {
        case "alphabetical":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "newest":
          filtered.sort(
            (a, b) =>
              (parseInt(b.published_year) || 0) -
              (parseInt(a.published_year) || 0)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) =>
              (parseInt(a.published_year) || 0) -
              (parseInt(b.published_year) || 0)
          );
          break;
        case "scripture":
          filtered.sort((a, b) => {
            const aC = parseInt(a.chapter) || 0;
            const bC = parseInt(b.chapter) || 0;
            if (aC !== bC) return aC - bC;
            return (parseInt(a.verse_start) || 0) - (parseInt(b.verse_start) || 0);
          });
          break;
        default:
          break;
      }

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

  if (!bookName) return <div>Book not found</div>;

  // -----------------------
  // Resource Card
  // -----------------------
  const ResourceCard = ({ resource }) => {
    const { title, author, url, image } = resource;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "0.75rem",
          margin: "0.5rem 0",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Image */}
        <img
          src={image || "/placeholder.png"}
          alt={title}
          style={{
            width: "70px",
            height: "70px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />

        {/* Text */}
        <div style={{ flex: 1, textAlign: "left" }}>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1e88e5",
                textDecoration: "none",
              }}
            >
              {title}
            </a>
          ) : (
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#333", }}>
              {title}
            </h4>
          )}
          
          {/* Author */}
          {author && (
            <p style={{ margin: "0.2rem 0", fontSize: "0.85rem", color: "#555" }}>
              {author}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
        backgroundColor: "#fff",
        minHeight: "100vh",
        color: "#333",
      }}
    >
      <Header />
      
      {/* Reduced spacing between header and intro */}
      <div style={{ marginTop: "2.75rem", marginBottom: "1rem" }}>
        <Intro />
      </div>

      {loading && selectedBook && selectedChapter && (
        <LoadingScreen 
          selectedBook={selectedBook} 
          selectedChapter={selectedChapter} 
          faviconUrl="/favicon.ico" 
        />
      )}
      
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "0.8rem",
          borderRadius: "4px",
          margin: "1rem 0",
        }}>
          {error}
        </div>
      )}

      {/* Book & Chapter Selectors */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <select
          value={selectedBook}
            onChange={(e) => {
              const newBook = e.target.value;
              setSelectedBook(newBook);
              setSelectedChapter(1); // Reset to chapter 1
              const bookUrl = bookToUrl(newBook);
              router.push(`/${bookUrl}/1`);
            }}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            backgroundColor: "#fff",
            color: "#333",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        >
          <option value="">📖 Choose a book...</option>
          {bibleBooks.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => {
            const newChapter = e.target.value;
            setSelectedChapter(newChapter);
            const bookUrl = bookToUrl(selectedBook);
            router.push(`/${bookUrl}/${newChapter}`);
          }}
          disabled={!selectedBook}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            backgroundColor: !selectedBook ? "#f5f5f5" : "#fff",
            color: "#333",
            WebkitAppearance: "none",
            appearance: "none",
          }}
        >
          <option value=""># Choose a chapter...</option>
          {Array.from({ length: chaptersCount }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Sort & Filter - now with availableAuthors */}
      <SortFilter
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        setFilters={setFilters}
        toggleFilter={toggleFilter}
        availableAuthors={availableAuthors}
      />

      {/* Resource Display */}
      {selectedBook && selectedChapter ? (
        Object.keys(typeLabels).map(
          (key) =>
            filters.types.has(key) &&
            primaryResources[key] && (
              <div key={key} style={{ backgroundColor: "#fff" }}>
                <h3 style={{ textAlign: "left", color: "#333", backgroundColor: "#fff" }}>
                  {typeLabels[key]} ({filterAndSortResources(primaryResources[key]).length})
                </h3>
                {filterAndSortResources(primaryResources[key]).map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            )
        )
      ) : (
        <p style={{ fontStyle: "italic", color: "#666", padding: "1rem", backgroundColor: "#fff" }}>
          Please select a book and chapter to view resources.
        </p>
      )}
    </div>
  );
}

export default ChapterMobile;