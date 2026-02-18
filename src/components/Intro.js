'use client'
import React from "react";

export default function Intro() {
  return (
    <div
      style={{
        maxWidth: "700px",
        marginLeft: "auto",
        marginRight: "auto",
        padding: ".75rem .75rem",
        background: "#d9c48c", // white background
        color: "#111",
        border: "2px solid white", // main black border
        borderRadius: "12px",
        position: "relative",
        fontWeight: "bolder",
        textAlign: "center",
        fontSize: ".9rem",
        lineHeight: "1.5",
        boxShadow: "0 0 0 4px #8e7727", // mustard accent border
        fontFamily: "Times New Roman"
      }}
    >
      Explore 10,000+ Reformed sermons, commentaries, and books by chapter.  
      Use the book and chapter selector below to get started.
    </div>
  );
}
