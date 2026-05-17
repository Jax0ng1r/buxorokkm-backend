// ─────────────────────────────────────────────────────────────────
//  server.js  —  Node.js + Express + MongoDB + Rasm yuklash
//  npm install express mongoose cors dotenv multer
// ─────────────────────────────────────────────────────────────────
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kkm_db";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Uploads papkasini yaratish ────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Statik fayllarni serve qilish ─────────────────────────────────
app.use("/uploads", express.static(UPLOADS_DIR));

// ── Multer — rasm saqlash ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Faqat rasm fayllari qabul qilinadi!"));
  },
});

// ── MongoDB ulanish ───────────────────────────────────────────────
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
})
  .then(async () => {
    console.log("✅ MongoDB ulandi");
    await seedData();
  })
  .catch(err => console.error("❌ MongoDB xato:", err));

// ── SCHEMALAR ─────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  telegram_id: { type: Number, required: true, unique: true },
  first_name:  String,
  last_name:   String,
  username:    String,
  phone:       String,
  joined_at:   { type: Date, default: Date.now },
  status:      { type: String, default: "active" },
});

const MurojaatSchema = new mongoose.Schema({
  telegram_id: Number,
  name:        String,
  phone:       String,
  date:        { type: Date, default: Date.now },
  checked:     { type: Boolean, default: false },
});

const CourseSchema = new mongoose.Schema({
  emoji:    String,
  imageUrl: String,
  name:     { type: String, required: true },
  meta:     String,
  type:     { type: String, enum: ["free", "paid"], default: "free" },
  students: { type: Number, default: 0 },
  price:    { type: Number, default: 0 },
});

// ── imageUrl qo'shildi ──
const LeaderSchema = new mongoose.Schema({
  name:     String,
  role:     String,
  emoji:    String,
  imageUrl: String,        // ← yangi
  avatarBg: String,
  schedule: String,
  location: String,
  phone:    String,
});

const SettingsSchema = new mongoose.Schema({
  siteName:  String,
  phone1:    String,
  phone2:    String,
  address:   String,
  telegram:  String,
  website:   String,
  workHours: String,
});

const User     = mongoose.model("User",     UserSchema);
const Murojaat = mongoose.model("Murojaat", MurojaatSchema);
const Course   = mongoose.model("Course",   CourseSchema);
const Leader   = mongoose.model("Leader",   LeaderSchema);
const Settings = mongoose.model("Settings", SettingsSchema);

// ── SEED ─────────────────────────────────────────────────────────
async function seedData() {
  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    await Course.insertMany([
      { emoji:"⚡",  name:"Elektromontyor",       meta:"3 oy • Amaliy",         type:"free", students:142 },
      { emoji:"🏗️", name:"Kran mashinisti",       meta:"4 oy • Amaliy",         type:"free", students:98  },
      { emoji:"💻",  name:"Komputer grafikasi",   meta:"3 oy • O'rta malakali", type:"free", students:210 },
      { emoji:"📊",  name:"Buxgalteriya",         meta:"4 oy • O'rta malakali", type:"free", students:175 },
      { emoji:"✂️",  name:"Erkaklar sartaroshi",  meta:"2 oy • Amaliy",         type:"free", students:88  },
      { emoji:"💆",  name:"Massajchi",            meta:"2 oy • Amaliy",         type:"free", students:64  },
      { emoji:"💇",  name:"Ayollar sartaroshi",   meta:"2 oy • Amaliy",         type:"free", students:119 },
      { emoji:"🌡️", name:"Konditsiyalash tizimi",meta:"3 oy • Amaliy",         type:"free", students:54  },
      { emoji:"🚗",  name:"Avtomobil ta'mirlovchi",meta:"4 oy • Amaliy",        type:"free", students:89  },
      { emoji:"🔩",  name:"Payvandlovchi",         meta:"3 oy • Amaliy",        type:"free", students:67  },
      { emoji:"🖥️", name:"Komputer savodxonligi", meta:"2 oy",                 type:"paid", students:53  },
      { emoji:"📈",  name:"1C Buxgalteriya op.",  meta:"3 oy",                  type:"paid", students:47  },
      { emoji:"🛗",  name:"Lift mexanik",         meta:"3 oy",                  type:"paid", students:31  },
    ]);
    console.log("✅ Kurslar seed qilindi");
  }

  const leaderCount = await Leader.countDocuments();
  if (leaderCount === 0) {
    await Leader.insertMany([
      { name:"Umarov Alixan Axmadovich",           role:"Direktor",                                     emoji:"👨‍💼", avatarBg:"#27ae60", schedule:"Du: 14:00–16:00 | Sha: 10:00–12:00", location:"Markaz, 1-qavat", phone:"+998 91 404 47 98" },
      { name:"Muxammadiyeva Ruxsora Abboskulovna", role:"O'quv ishlari bo'yicha direktor o'rinbosari", emoji:"👩‍💼", avatarBg:"#8e44ad", schedule:"Cho: 10:00–12:00 | Ju: 14:00–16:00",  location:"Markaz, 1-qavat", phone:"+998 90 299 05 60" },
      { name:"Qandov Faxriddin Xojiyevich",        role:"Kasaba uyushma qo'mitasi raisi",              emoji:"👨‍💼", avatarBg:"#e67e22", schedule:"Se: 10:00–12:00 | Pay: 14:00–16:00", location:"Markaz, 1-qavat", phone:"+998 99 566 98 01" },
    ]);
    console.log("✅ Rahbarlar seed qilindi");
  }

  const settingsExist = await Settings.findOne();
  if (!settingsExist) {
    await Settings.create({
      siteName:"Kasbiy Ko'nikmalar Markazi",
      phone1:"+998 65 226 24 64", phone2:"+998 95 176 60 06",
      address:"Buxoro shahar, Pirdastgir ko'chasi 13",
      telegram:"@buxoromarkaz_6006", website:"kasbiy.markazi.uz",
      workHours:"09:00 – 18:00, Dushanba–Juma",
    });
    console.log("✅ Sozlamalar seed qilindi");
  }
}

// ════════════════════════════════════════════════════════════════
//  RASM YUKLASH ENDPOINT (umumiy)
// ════════════════════════════════════════════════════════════════
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Rasm yuklanmadi" });
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// ── Eski rasmni o'chirish helper ──
function deleteOldImage(imageUrl) {
  if (!imageUrl) return;
  try {
    const filename = imageUrl.split("/uploads/")[1];
    if (filename) {
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch {}
}

// ════════════════════════════════════════════════════════════════
//  FOYDALANUVCHILAR
// ════════════════════════════════════════════════════════════════
app.post("/api/users/register", async (req, res) => {
  try {
    const { telegram_id, first_name, last_name, username, phone, source } = req.body;
    
    // Web orqali kirgan — telegram_id yo'q
    if (!telegram_id) {
      const user = await User.create({
        telegram_id: Date.now(), // vaqtinchalik unique id
        first_name, last_name, username: username||'', phone,
        source: source||'web',
      });
      return res.json({ success: true, user });
    }
    
    const user = await User.findOneAndUpdate(
      { telegram_id },
      { first_name, last_name, username, phone, source: source||'telegram' },
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/users", async (req, res) => {
  try { res.json(await User.find().sort({ joined_at: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/users/:id/status", async (req, res) => {
  try { res.json(await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  MUROJAATLAR
// ════════════════════════════════════════════════════════════════
app.post("/api/murojaatlar", async (req, res) => {
  try {
    const { telegram_id, name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "name va phone kerak" });
    res.json({ success: true, murojaat: await Murojaat.create({ telegram_id, name, phone }) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/murojaatlar", async (req, res) => {
  try { res.json(await Murojaat.find().sort({ date: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/murojaatlar/:id/check", async (req, res) => {
  try { res.json(await Murojaat.findByIdAndUpdate(req.params.id, { checked: req.body.checked }, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/murojaatlar/:id", async (req, res) => {
  try { await Murojaat.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  KURSLAR
// ════════════════════════════════════════════════════════════════
app.get("/api/courses", async (req, res) => {
  try { res.json(await Course.find()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/courses", async (req, res) => {
  try { res.json(await Course.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    // Eski rasm o'chirilsa, diskdan ham o'chirish
    if (req.body.imageUrl === "" || req.body.imageUrl === null) {
      const old = await Course.findById(req.params.id);
      if (old?.imageUrl) deleteOldImage(old.imageUrl);
    }
    res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course?.imageUrl) deleteOldImage(course.imageUrl);
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  RAHBARIYAT
// ════════════════════════════════════════════════════════════════
app.get("/api/leaders", async (req, res) => {
  try { res.json(await Leader.find()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/leaders", async (req, res) => {
  try { res.json(await Leader.create(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/leaders/:id", async (req, res) => {
  try {
    if (req.body.imageUrl === "" || req.body.imageUrl === null) {
      const old = await Leader.findById(req.params.id);
      if (old?.imageUrl) deleteOldImage(old.imageUrl);
    }
    res.json(await Leader.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/leaders/:id", async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (leader?.imageUrl) deleteOldImage(leader.imageUrl);
    await Leader.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  SOZLAMALAR
// ════════════════════════════════════════════════════════════════
app.get("/api/settings", async (req, res) => {
  try { res.json(await Settings.findOne() || {}); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/settings", async (req, res) => {
  try { res.json(await Settings.findOneAndUpdate({}, req.body, { upsert: true, new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ── ADMIN AUTH ────────────────────────────────────────────────────
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Login yoki parol noto'g'ri!" });
  }
});

app.post("/api/admin/change-password", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Ma'lumotlar kerak!" });
  process.env.ADMIN_USERNAME = username;
  process.env.ADMIN_PASSWORD = password;
  res.json({ success: true });
});

// ── HEALTH ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// ── START ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server ishlamoqda: http://localhost:${PORT}`);
  console.log(`📁 Rasmlar: http://localhost:${PORT}/uploads/`);
});

// ── OTP — 4 marta xato bo'lganda Telegram ga kod yuborish ─────────
let currentOTP = null;
let otpExpiry  = null;

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;
    const BOT_TOKEN         = process.env.BOT_TOKEN;
    if (!ADMIN_TELEGRAM_ID || !BOT_TOKEN)
      return res.status(500).json({ error: "ADMIN_TELEGRAM_ID yoki BOT_TOKEN .env da yo'q!" });

    currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpExpiry  = Date.now() + 5 * 60 * 1000;

    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_TELEGRAM_ID,
        text: `🔐 *Admin Panel — Kirish kodi*\n\nKod: \`${currentOTP}\`\n\n⏰ 5 daqiqa ichida foydalaning.\n\n⚠️ Bu kodni hech kimga bermang!`,
        parse_mode: "Markdown",
      }),
    });
    if (!resp.ok) throw new Error("Telegram ga yuborishda xato");
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { otp } = req.body;
  if (!currentOTP || !otpExpiry)
    return res.status(400).json({ error: "Avval kod so'rang!" });
  if (Date.now() > otpExpiry) {
    currentOTP = null; otpExpiry = null;
    return res.status(400).json({ error: "Kod muddati tugagan!" });
  }
  if (otp !== currentOTP)
    return res.status(400).json({ error: "Kod noto'g'ri!" });
  currentOTP = null; otpExpiry = null;
  res.json({ success: true });
});