const mongoose = require('mongoose');
require('dotenv').config();

const OLD = 'http://localhost:3001';
const NEW = 'https://diann-pentahydroxy-overdiversely.ngrok-free.dev';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  const c = await db.collection('courses').updateMany(
    { imageUrl: { $regex: OLD } },
    [{ $set: { imageUrl: { $replaceAll: { input: '$imageUrl', find: OLD, replacement: NEW } } } }]
  );

  const l = await db.collection('leaders').updateMany(
    { imageUrl: { $regex: OLD } },
    [{ $set: { imageUrl: { $replaceAll: { input: '$imageUrl', find: OLD, replacement: NEW } } } }]
  );

  console.log('Kurslar yangilandi:', c.modifiedCount);
  console.log('Rahbarlar yangilandi:', l.modifiedCount);
  mongoose.disconnect();
  console.log('Tayyor!');
}).catch(err => {
  console.error('Xato:', err);
  process.exit(1);
});