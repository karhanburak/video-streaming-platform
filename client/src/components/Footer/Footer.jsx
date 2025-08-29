import React from "react";
import "./Footer.css"; // CSS dosyasını import ediyoruz

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">🎬 VideoMini</div>

        <nav className="footer-links">
          <a href="/">Home</a>
          <a href="/admin">Admin</a>
          <a href="https://github.com/karhanburak" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>

        <div className="footer-copy">
          © {new Date().getFullYear()} VideoMini. All rights reserved.
        </div>
      </div>
      <div className="name-field">
        This streaming platform was developed by <span className="full-name"> Ahmet Burak Karhan </span> as a unique way to share his motivation video with the Lely hiring team.
      </div>
    </footer>
  );
}
