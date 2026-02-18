'use client'
import React from "react";

export default function MobileFooter() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#000",
        color: "#ddd",
        padding: "1.5rem 1rem",
        textAlign: "center",
        overflowX: "hidden", // prevent horizontal scroll
        boxSizing: "border-box", // ensure padding/border doesn't overflow
      }}
    >
      <div
        style={{
          maxWidth: "360px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        {/* Site Title + Navigation */}
        <div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#fff",
              marginBottom: "0.6rem",
              fontFamily: "times new roman"
            }}
          >
            Reformed Chapter
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.8rem",
              fontSize: ".8rem",
              flexWrap: "wrap",
              justifyContent: "center",
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

        {/* Support Section */}
        <div
          style={{
            width: "100%",
            maxWidth: "280px",
            border: "2px solid #8e7727",
            borderRadius: "12px",
            padding: "0.2rem",
            backgroundColor: "#000",
          }}
        >
          <div
            style={{
              backgroundColor: "#d9c48c",
              border: "2px solid #fff",
              borderRadius: "10px",
              padding: "0.6rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                color: "#000",
                marginTop: 0,
                marginBottom: "0.3rem",
                fontSize: "1.05rem",
                fontFamily: "times new roman"
              }}
            >
              Support Us
            </h3>
            <p
              style={{
                color: "#000",
                lineHeight: "1.4",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontFamily: "times new roman"
              }}
            >
              Your support helps us keep Reformed Chapter running and expand our collection of Christ-centered resources.
            </p>
            <button
              onClick={() => window.location.href = "/donate"}
              style={buttonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0059b3"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#004080"}
            >
              Donate
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
          © {new Date().getFullYear()} Reformed Chapter. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const linkStyle = {
  color: "#ddd",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 0.2s",
  cursor: "pointer",
};

const buttonStyle = {
  padding: "0.5rem 0.9rem",
  backgroundColor: "#004080",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "0.9rem",
  width: "100%",
  transition: "background-color 0.3s",
};
