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
        <div className="title">
          <div className="left-part"></div>
          <h1>Motivation Video</h1>
          <img src="/logo-lely-original.svg" alt="img not found" />
        </div>
        <div className="details-wrapper">
          <h3>Application Details</h3>
          <ul className="interview-details">
            <li><span>Interviewee:</span> Ahmet Burak Karhan</li>
            <li><span>Position:</span> Junior Manuel Test Engineer</li>
            <li><span>Date:</span> 29th August, 2025</li>
          </ul>
        </div>
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
