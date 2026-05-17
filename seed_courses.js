// seed_courses.js — Qolgan kurslarni MongoDB ga qo'shish
// Ishlatish: node seed_courses.js
// Backend papkasida ishga tushiring

const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kkm_db";

const CourseSchema = new mongoose.Schema({
  emoji:    String,
  name:     String,
  meta:     String,
  type:     { type: String, enum: ["free", "paid"], default: "free" },
  students: { type: Number, default: 0 },
});

const Course = mongoose.model("Course", CourseSchema);

const NEW_COURSES = [
  { emoji: "💇", name: "Ayollar sartaroshi",              meta: "2 oy • Amaliy", type: "free", students: 119 },
  { emoji: "💄", name: "Vizajist (Stilist-Kosmetolog)",   meta: "3 oy • Amaliy", type: "free", students: 76  },
  { emoji: "🌡️", name: "Konditsiyalash tizimi",          meta: "3 oy • Amaliy", type: "free", students: 54  },
  { emoji: "🚗", name: "Avtomobil ta'mirlovchi chilangar",meta: "4 oy • Amaliy", type: "free", students: 89  },
  { emoji: "🔩", name: "Payvandlovchi",                   meta: "3 oy • Amaliy", type: "free", students: 67  },
  { emoji: "🧑‍🍳",name: "Ofitsant",                       meta: "2 oy • Amaliy", type: "free", students: 43  },
  { emoji: "🪡", name: "Tikuvchi (Karving san'ati ustasi)",meta: "3 oy • Amaliy", type: "free", students: 58  },
  { emoji: "🔧", name: "Chilangar-santexnik",             meta: "3 oy • Amaliy", type: "free", students: 72  },
  { emoji: "🪟", name: "Zamonaviy pardalar tikish",       meta: "2 oy • Amaliy", type: "free", students: 38  },
  { emoji: "🛒", name: "Qozonxona ishchisi",              meta: "2 oy • Amaliy", type: "free", students: 29  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB ulandi");

  let added = 0;
  for (const course of NEW_COURSES) {
    const exists = await Course.findOne({ name: course.name });
    if (!exists) {
      await Course.create(course);
      console.log(`➕ Qo'shildi: ${course.emoji} ${course.name}`);
      added++;
    } else {
      console.log(`⏭️  Allaqachon bor: ${course.name}`);
    }
  }

  const total = await Course.countDocuments();
  console.log(`\n✅ Tayyor! Jami kurslar: ${total} ta`);
  await mongoose.disconnect();
}

seed().catch(console.error);