import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function HomePage() {
  const [videos, setVideos] = useState([]);
  useEffect(() => { fetchVideos(); }, []);

  async function fetchVideos(){
    const res = await fetch(`${API}/videos`);
    setVideos(await res.json());
  }

  return (
    <div style={{maxWidth:800, margin:"20px auto"}}>
      <h1>Video Mini — Anasayfa</h1>
      <Link to="/admin">Admin Panel</Link>
      {videos.map(v => (
        <div key={v.id} style={{margin:"20px 0"}}>
          <h3>{v.originalname}</h3>
          <video controls width="720" style={{maxWidth:"100%"}}>
            <source src={`${API}${v.url}`} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
}

function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
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

  async function fetchVideos(){
    const res = await fetch(`${API}/videos`);
    setVideos(await res.json());
  }

  async function uploadVideo(e) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("video", file);
    const res = await fetch(`${API}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (res.ok) fetchVideos();
    else alert("Upload failed");
  }

  async function deleteVideo(id) {
    await fetch(`${API}/video/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchVideos();
  }

  if (!token) {
    return (
      <div style={{maxWidth:400, margin:"20px auto"}}>
        <h2>Admin Login</h2>
        <form onSubmit={login}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <button onClick={()=>navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:800, margin:"20px auto"}}>
      <h2>Admin Panel</h2>
      <button onClick={()=>{localStorage.removeItem("token"); setToken(null)}}>Logout</button>
      <form onSubmit={uploadVideo}>
        <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])}/>
        <button type="submit">Upload</button>
      </form>
      {videos.map(v => (
        <div key={v.id}>
          <h3>{v.originalname}</h3>
          <video controls width="720" style={{maxWidth:"100%"}}>
            <source src={`${API}${v.url}`} type="video/mp4" />
          </video>
          <button onClick={()=>deleteVideo(v.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/admin" element={<AdminPage/>}/>
    </Routes>
  );
}
