'use client'
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const resourceTypes = ["Sermon", "Commentary", "Devotional", "Video", "Book"];

const supabaseUrl = 'https://bnprkjidihxgcubkounq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHJramlkaWh4Z2N1YmtvdW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODA2MDQsImV4cCI6MjA2ODI1NjYwNH0.NbgwVGFPo6qDOOxIdXZQ_uaxkV7qYpo8kkH7ICFp0kQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Improved function to parse scripture references
function parseScripture(scripture) {
  if (!scripture || !scripture.trim()) {
    return { book: "", chapter: null, chapter_end: null, verse_start: null, verse_end: null };
  }

  console.log(`Parsing scripture: "${scripture}"`);

  // Updated regex to properly capture book names (including numbered books like "1 Corinthians")
  const regex = /^(\d*\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+)(?:[–-](\d+))?)?(?:[–-](\d+)(?::(\d+))?)?$/;
  const match = scripture.trim().match(regex);

  if (!match) {
    console.log("No regex match found");
    return { book: "", chapter: null, chapter_end: null, verse_start: null, verse_end: null };
  }

  const [fullMatch, bookName, startChapter, startVerse, endVerse, endChapter, endChapterVerse] = match;
  
  console.log("Regex matches:", {
    fullMatch,
    bookName,
    startChapter,
    startVerse,
    endVerse,
    endChapter,
    endChapterVerse
  });

  const book = bookName.trim();
  const chapter = Number(startChapter);
  const chapter_end = endChapter ? Number(endChapter) : chapter;
  const verse_start = startVerse ? Number(startVerse) : null;
  
  // Handle verse end logic
  let verse_end = null;
  if (endChapterVerse) {
    // Case: John 1:5-2:8 (verse in end chapter)
    verse_end = Number(endChapterVerse);
  } else if (endVerse) {
    // Case: John 1:5-8 (verse range in same chapter)
    verse_end = Number(endVerse);
  } else if (verse_start) {
    // Case: John 1:5 (single verse)
    verse_end = verse_start;
  }

  const result = { book, chapter, chapter_end, verse_start, verse_end };
  console.log("Parsed result:", result);
  
  return result;
}

export default function SubmitResource() {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    author: "",
    book: "",
    scripture: "",
    url: "",
    image: "",
    description: "",
    price: "",
    published_year: "",
    secondary_scripture: ""
  });

  const [parsePreview, setParsePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Show preview when scripture changes
    if (name === "scripture") {
      if (value.trim()) {
        const parsed = parseScripture(value);
        setParsePreview(parsed);
      } else {
        setParsePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse scripture into database fields
    const { book, chapter, chapter_end, verse_start, verse_end } = parseScripture(formData.scripture);

    // Validate that we got a book name
    if (!book) {
      alert("Please enter a valid scripture reference (e.g., 'John 3:16' or '1 Corinthians 13:4-7')");
      return;
    }

    const payload = {
      title: formData.title,
      type: formData.type,
      author: formData.author || null,
      book: book,
      chapter: chapter,
      chapter_end: chapter_end,
      verse_start: verse_start,
      verse_end: verse_end,
      url: formData.url,
      image: formData.image || null,
      description: formData.description || null,
      price: formData.price || null,
      published_year: formData.published_year ? Number(formData.published_year) : null,
      secondary_scripture: formData.secondary_scripture || null
    };

    console.log("Submitting payload:", payload);

    const { data, error } = await supabase.from("pending_resources").insert([payload]);

    if (error) {
      console.error("Supabase error:", error);
      alert(`Error submitting resource: ${error.message}`);
      return;
    }

    alert("Resource submitted for review!");
    setFormData({
      title: "",
      type: "",
      author: "",
      book: "",
      scripture: "",
      url: "",
      image: "",
      description: "",
      price: "",
      published_year: "",
      secondary_scripture: ""
    });
    setParsePreview(null);
  };

  return (
    <div style={{ padding: "4rem 2rem 2rem", textAlign: "center", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
   
      <h2 style={{ color: "#000", marginBottom: "1rem", marginTop: "1rem" }}>Submit a New Resource</h2>
      
      <div style={{
        maxWidth: "600px",
        margin: "0 auto 2rem",
        padding: "1rem 1.5rem",
        backgroundColor: "#e8f4f8",
        border: "1px solid #b3d9ff",
        borderRadius: "8px",
        color: "#004080",
        lineHeight: "1.6"
      }}>
        <p style={{ margin: 0 }}>
          Want to help build our library of resources? Submit sermons, commentaries, devotionals and more below!
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          textAlign: "left",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <label style={{ color: "#111", fontWeight: 500 }}>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Type:
          <select name="type" value={formData.type} onChange={handleChange} required style={inputStyle}>
            <option value="">-- Select --</option>
            {resourceTypes.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Author:
          <input type="text" name="author" value={formData.author} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Scripture Reference:
          <input 
            type="text" 
            name="scripture" 
            value={formData.scripture} 
            onChange={handleChange} 
            placeholder="e.g., 1 Corinthians 13:4-7" 
            required 
            style={inputStyle} 
          />
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
            Examples: "John 3:16", "1 Corinthians 13:4-7", "Romans 8:28-9:5", "Matthew 5"
          </div>
        </label>

        {/* Scripture Parse Preview */}
        {parsePreview && (
          <div style={{
            backgroundColor: "#f0f8ff",
            border: "1px solid #b3d9ff",
            borderRadius: "6px",
            padding: "0.75rem",
            fontSize: "0.9rem"
          }}>
            <strong>Scripture:</strong>
            <div style={{ marginTop: "0.5rem", fontFamily: "monospace" }}>
              Book: "{parsePreview.book}"<br/>
              Chapter: {parsePreview.chapter}<br/>
              Chapter End: {parsePreview.chapter_end}<br/>
              Verse Start: {parsePreview.verse_start || "null"}<br/>
              Verse End: {parsePreview.verse_end || "null"}
            </div>
          </div>
        )}

        <label style={{ color: "#111", fontWeight: 500 }}>
          Secondary Scripture (optional):
          <input 
            type="text" 
            name="secondary_scripture" 
            value={formData.secondary_scripture} 
            onChange={handleChange} 
            placeholder="e.g., Romans 3:23; Ephesians 2:8-9" 
            style={inputStyle} 
          />
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
            Additional scripture references this resource covers (separate multiple with semicolons)
          </div>
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          URL:
          <input type="url" name="url" value={formData.url} onChange={handleChange} required style={inputStyle} />
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Image URL (optional):
          <input type="url" name="image" value={formData.image} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={{ color: "#111", fontWeight: 500, display: "block", marginTop: 12 }}>
          Price (optional):
        </label>
        <div style={{ display: "flex", gap: "16px", marginTop: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="price"
              value="Free"
              checked={formData.price === "Free"}
              onChange={handleChange}
            />
            Free
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="price"
              value="Paid"
              checked={formData.price === "Paid"}
              onChange={handleChange}
            />
            Paid
          </label>
        </div>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Published Year:
          <input 
            type="number" 
            name="published_year" 
            value={formData.published_year} 
            onChange={handleChange} 
            placeholder="e.g., 2023" 
            min="1400" 
            max="2200"
            style={inputStyle} 
          />
        </label>

        <label style={{ color: "#111", fontWeight: 500 }}>
          Description:
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3} 
            style={{ ...inputStyle, resize: "vertical" }} 
            placeholder="Brief description of the resource..."
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#004080",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0059b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#004080")}
        >
          Submit Resource
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  marginTop: "0.25rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "1rem",
  outline: "none",
  color: "#111",
  backgroundColor: "#fff",
};