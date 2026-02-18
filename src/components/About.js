'use client'
import React from "react";
import Footer from "./Footer/Footer";


// Mobile detection hook
function useIsMobile(breakpoint = 768) {
  const getIsMobile = () =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false;
  const [isMobile, setIsMobile] = React.useState(getIsMobile);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function AboutUs() {
  const isMobile = useIsMobile(768);

  const Section = ({ title, children }) => (
    <section
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: isMobile ? "0.9rem" : "1.5rem",
        marginBottom: "1.25rem",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.5rem",
          color: "#000",
          fontSize: isMobile ? "1rem" : "1.5rem",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: "#111",
          lineHeight: 1.6,
          fontSize: isMobile ? "0.9rem" : "1rem",
        }}
      >
        {children}
      </div>
    </section>
  );

  const buttonStyle = {
  padding: isMobile ? "0.5rem 0.8rem" : "0.7rem 1.2rem",
  borderRadius: "6px",
  border: "1.5px solid #004080",   // blue border
  backgroundColor: "#004080",      // blue background
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
  width: isMobile ? "100%" : "auto",
  fontSize: isMobile ? "0.9rem" : "1rem",
};

  const buttonHover = (e) => (e.currentTarget.style.backgroundColor = "#0059b3");
  const buttonOut = (e) => (e.currentTarget.style.backgroundColor = "#004080");

  return (
    <div
      style={{
        padding: isMobile ? "1.5rem 1rem" : "4rem 2rem 2rem",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        boxSizing: "border-box",

      }}
    >
      {/* Hero Section */}
      <h1
        style={{
          fontSize: isMobile ? "1.5rem" : "2.5rem",
          fontWeight: "bold",
          marginBottom: ".75rem",
          color: "#000",
          marginTop: "3rem",
        }}
      >
        About Reformed Chapter
      </h1>
      <p
        style={{
          fontSize: isMobile ? "0.95rem" : "1.2rem",
          marginBottom: isMobile ? "1.25rem" : "2rem",
          color: "#555",
        }}
      >
        Biblical Depth. Reformed Clarity. Chapter by Chapter.
      </p>

      {/* Content Container */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "left",
          padding: isMobile ? "0 0.25rem" : "0",
          boxSizing: "border-box",
        }}
      >
        <Section title="Our Mission">
          Reformed Chapter exists to help believers access trusted, Christ-centered
          resources on every chapter of Scripture to further their relationships with God.
        </Section>

        <Section title="What We Offer">
          <ul style={{ paddingLeft: isMobile ? "1rem" : "1.25rem", margin: 0 }}>
            <li>Hand-picked sermons, books, devotionals, and commentaries</li>
            <li>Reformed theology–aligned content</li>
            <li>Organized by book and chapter of the Bible</li>
            <li>Clean, distraction-free design</li>
          </ul>
        </Section>

        <Section title="Why Reformed?">
          We are rooted in historic, Reformed Christian doctrine — emphasizing God's
          sovereignty, Scripture's authority, and salvation by grace alone through
          faith alone.
        </Section>

        <Section title="Who We Are">
          Reformed Chapter was created by a small team of believers who wanted a
          simpler way to study Scripture one chapter at a time. It was founded by
          William Webb, a student passionate about making sound theology more
          accessible.
        </Section>

        <Section title="Our Logo">
          <p style={{ marginBottom: "0.75rem" }}>
            The mustard seed is a powerful symbol for Reformed Chapter. It represents faith and
            growth from small beginnings, reflecting how studying even a single chapter of Scripture
            can lead to deep, transformative spiritual growth.
          </p>
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <img
              src={'/MustardSeed.png'}
              alt="Mustard Seed Logo"
              style={{ maxWidth: isMobile ? "70px" : "100px", height: "auto" }}
            />
          </div>
        </Section>

        <Section title="Join Us">
          <p style={{ marginBottom: "1rem" }}>
            We’re always looking to improve. Have a resource to recommend? Reach out and help us grow this collection. Our email address is reformedchapter@gmail.com
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "0.75rem",
            }}
          >
            <button
              onClick={() => (window.location.href = "/submit")}
              style={buttonStyle}
              onMouseOver={buttonHover}
              onMouseOut={buttonOut}
            >
              Submit Resource
            </button>

            <button
              onClick={() => (window.location.href = "mailto:reformedchapter@gmail.com")}
              style={buttonStyle}
              onMouseOver={buttonHover}
              onMouseOut={buttonOut}
            >
              Contact Us
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
