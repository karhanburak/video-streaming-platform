import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Footer from "../../components/Footer/Footer";

export function HomePage({ API }) {
  const [videos, setVideos] = useState([]);
  useEffect(() => { fetchVideos(); }, []);

  async function fetchVideos() {
    const res = await fetch(`${API}/videos`);
    setVideos(await res.json());
  }

  return (
    <>
      <div className="home-container">
        <h1>Video Mini</h1>
        <Link className="admin-link" to="/admin">Admin Panel</Link>
        {
          videos.length === 0
            ? <div className="no-video-card">There is no any videos to be shown &#9888;</div>
            : videos.map(v => (
              <div className="video-card" key={v.id}>
                <h3>{v.originalname}</h3>
                <video controls width="720">
                  <source src={`${API}${v.url}`} type="video/mp4" />
                </video>
              </div>
            ))
        }
      </div>
      <Footer />
    </>
  );
}
