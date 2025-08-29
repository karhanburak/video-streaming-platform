import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css"

export function AdminPage({ API }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (token) fetchVideos(); }, [token]);

  async function login(e) {
    e.preventDefault();
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.error);
    }
  }

  async function fetchVideos() {
    const res = await fetch(`${API}/videos`);
    setVideos(await res.json());
  }

  // Upload
  async function uploadVideo(e) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append("video", file);
    const res = await fetch(`${API}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    setIsUploading(false);

    if (res.ok) {
      fetchVideos();
    } else {
      alert("Upload failed");
    }
  }


  // Delete
  async function deleteVideo(id) {
    const res = await fetch(`${API}/video/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      fetchVideos(); // silindikten sonra videoları tekrar çek
    } else {
      alert("Delete failed");
    }
  }

  // Logout
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/")
  }


  // Login ekranı
  if (!token) {
    return (
      <div className="admin-container">
        <h2>Admin Login</h2>
        <form className="admin-form" onSubmit={login}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <button className="back-btn" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <button className="logout-btn" onClick={logout}>Logout</button>

      <form className="admin-form" onSubmit={uploadVideo}>
        <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</button>
      </form>

      {videos.map(v => (
        <div className="video-card" key={v.id}>
          <h3>{v.originalname}</h3>
          <video controls width="720" style={{ maxWidth: "100%" }}>
            <source src={`${API}${v.url}`} type="video/mp4" />
          </video>
          <button onClick={() => deleteVideo(v.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}