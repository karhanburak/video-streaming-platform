import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminPage } from "./pages/adminPage/AdminPage";
import { HomePage } from "./pages/homePage/HomePage";

const API = "https://video-streaming-platform-pecb.onrender.com";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage API={API}/>}/>
      <Route path="/admin" element={<AdminPage API={API}/>}/>
    </Routes>
  );
}
