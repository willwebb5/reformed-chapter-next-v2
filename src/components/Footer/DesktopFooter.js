'use client'
import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100vw", // Full viewport width
        backgroundColor: "black",
        color: "#ddd",
        padding: "2rem 1rem",
        boxShadow: "0 -1px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
        boxSizing: "border-box", // Include padding in width calculation
        overflowX: "hidden", // Hide any horizontal overflow
        margin: "0", // Remove any default margins
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <div
        style={{
          maxWidth: "min(800px, 90vw)", // Responsive max width
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Site Title + Navigation */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <div
            style={{
              marginBottom: "0.5rem",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "#fff",
              fontFamily: "Times New Roman"
            }}
          >
            Reformed Chapter
          </div>
          <div
            style={{
              marginBottom: ".25rem",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "1rem",
              fontSize: "0.95rem",
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "times new roman"
            }}
          >
            <a href="/" style={linkStyle}>Home</a>
            <a href="/about" style={linkStyle}>About</a>
            <a href="/submitresource" style={linkStyle}>Submit</a>
            <a href="mailto:reformedchapter@gmail.com" style={linkStyle}>Contact</a>
            <a href="/donate" style={linkStyle}>Donate</a>
            {/* Instagram link */}
            <a
              href="https://www.instagram.com/reformed.chapter/"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Support Section with double border */}
        <div
          style={{
            border: "4px solid #8e7727", // Mustard outer border
            borderRadius: "10px",
            padding: "4px",              // Space between outer and inner border
            backgroundColor: "black",
            display: "block", // Changed from inline-block
            width: "100%",
            maxWidth: "min(800px, 90vw)", // Responsive max width
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#d9c48c",      // Inner background
              border: "4px solid white",     // Inner white border
              borderRadius: "8px",
              padding: "1rem",
              width: "100%",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <h3
              style={{
                color: "black",
                marginTop: 0,
                marginBottom: "0.25rem",
                fontSize: "1.25rem",
                fontFamily: "times new roman"
              }}
            >
              Support Us
            </h3>
            <p
              style={{
                color: "black",
                lineHeight: "1.4",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                wordWrap: "break-word", // Ensure text wraps properly
                fontFamily: "times new roman"
              }}
            >
              Your support helps us keep Reformed Chapter running and expand our collection of Christ-centered resources.
            </p>
            <button
              onClick={() => window.location.href = "/donate"}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#004080",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "background-color 0.3s",
                maxWidth: "150px", // Prevent button from being too wide
                width: "auto",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0059b3"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#004080"}
            >
              Donate
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          fontSize: "0.8rem", 
          color: "#aaa",
          width: "100%",
          boxSizing: "border-box",
          wordWrap: "break-word"
        }}>
          © {new Date().getFullYear()} Reformed Chapter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const linkStyle = {
  color: "#ddd",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.2s",
  cursor: "pointer",
  whiteSpace: "nowrap", // Prevent individual links from wrapping
};