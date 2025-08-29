const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("crypto"); // node 18+ için: use crypto.randomUUID() alternatively

const app = express();
const PORT = process.env.PORT;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(__dirname, "videos.json");
const jwt = require("jsonwebtoken");

// Basit admin bilgileri (gerçekte env kullan)
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: JWT doğrulama
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ensure upload dir & db exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

app.use(cors());
app.use(express.json());

// simple DB helpers
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8") || "[]");
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${id}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit (isteğe göre değiştir)
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/ogg"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Admin login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// get video list
app.get("/videos", (req, res) => {
  const videos = readDB();
  res.json(videos);
});

// upload (admin)
app.post("/upload", authMiddleware, upload.single("video"), (req, res) => {
  try {
    const videos = readDB();

    // limit: max 3
    if (videos.length >= 3) {
      // delete uploaded file to avoid storing extra
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Max 3 video allowed." });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded or invalid mime type." });

    const vid = {
      id: uuidv4 ? uuidv4() : (Date.now() + "-" + Math.random().toString(36).slice(2,8)),
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/video/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };
    videos.push(vid);
    writeDB(videos);
    res.json(vid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed." });
  }
});

// serve metadata / static uploads if needed
app.get("/video/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    stream.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// optional: delete video (admin)
app.delete("/video/:id", authMiddleware, (req, res) => {
  let videos = readDB();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = videos.splice(idx, 1);
  const filePath = path.join(UPLOAD_DIR, removed.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  writeDB(videos);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
