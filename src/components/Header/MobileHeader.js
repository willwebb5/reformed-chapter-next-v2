// MobileHeader.js
'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function MobileHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const menuItems = [
    { label: "Submit Resources", path: "/submitresource" },
    { label: "About Us", path: "/about" },
    { label: "Donate", path: "/donate" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const showDropdown = mounted && menuOpen;

  return (
    <header
    suppressHydrationWarning
      style={{
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "black",
        color: "white",
        padding: "0.8rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 1000,
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={() => router.push("/")}
      >
        <img
          src="/mustardseedlogo.png"
          alt="Logo"
          style={{ height: "32px", marginRight: "0.75rem" }}
        />
        <h1 style={{ margin: 0, fontSize: "18px", fontFamily: "georgia" }}>
          Reformed Chapter
        </h1>
      </div>

      {/* Hamburger */}
      <button
        onClick={toggleMenu}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Dropdown menu - only renders after client mount */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            width: "200px",
            backgroundColor: "black",
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem",
            gap: "0.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(item.path);
                setMenuOpen(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "white",
                color: "black",
                border: "2px solid white",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}