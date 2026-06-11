import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'studyvault'
  });
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (let col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count}`);
  }
  await mongoose.disconnect();
}

run().catch(console.error);
