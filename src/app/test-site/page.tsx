"use client";

import React from "react";

export default function TestSite() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{ backgroundColor: "#000000", minHeight: "100vh", fontFamily: "'Poppins', ui-sans-serif, sans-serif" }}>
        {/* Navigation */}
        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#ffffff", fontSize: "24px", fontWeight: "600" }}>
            RealtyOnCall Clone
          </div>
          <div>
            <button style={btnPrimaryStyle}>Get Started</button>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ padding: "100px 48px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "60px", 
            fontWeight: 500, 
            lineHeight: "60px", 
            color: "#ffffff",
            marginBottom: "32px"
          }}>
            The Future of Real Estate
          </h1>
          
          <p style={{
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#ffffff",
            maxWidth: "700px",
            margin: "0 auto 48px auto",
            opacity: 0.9
          }}>
            Manage your properties, connect with clients, and grow your portfolio using the most advanced AI-powered platform on the market.
          </p>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <button style={btnPrimaryStyle}>Start Free Trial</button>
            <button style={btnGhostStyle}>View Pricing</button>
          </div>
        </main>

        {/* Feature Cards Section */}
        <section style={{ padding: "80px 48px", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={cardStyle}>
              <h3 style={{
                fontSize: "36px",
                fontWeight: 500,
                color: "#333333",
                marginBottom: "20px",
                lineHeight: "40px"
              }}>
                Feature {i}
              </h3>
              <p style={{
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: "28px",
                color: "#333333", // Modified to dark for visibility on light card
                opacity: 0.8
              }}>
                Seamlessly integrated property management solutions designed to save you time and maximize returns.
              </p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

const btnPrimaryStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#000000",
  borderRadius: "6px",
  padding: "12px 24px", // Scaled up slightly for hero visibility, originally 4px 8px
  fontSize: "16px",
  fontWeight: 500, // Using 500 to match Poppins weight
  border: "0px solid rgb(0, 0, 0)",
  cursor: "pointer",
  transition: "all 0.2s"
};

const btnGhostStyle: React.CSSProperties = {
  background: "#000000",
  color: "#f9fbfc",
  borderRadius: "8px",
  padding: "12px 24px", // Matched with primary button height
  fontSize: "16px",
  fontWeight: 500,
  border: "1px solid #333333", // Added slight border for visibility against black bg
  cursor: "pointer",
  transition: "all 0.2s"
};

const cardStyle: React.CSSProperties = {
  background: "#f9fbfc", // Using color 5 from palette for contrast against black background
  padding: "48px",
  borderRadius: "12px",
  boxShadow: "rgba(0, 0, 0, 0.15) 0px 0px 10px 0px"
};
