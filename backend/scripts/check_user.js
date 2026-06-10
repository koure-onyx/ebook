import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
  google_id: String
});

const User = mongoose.model('User', UserSchema);

async function check() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const email = 'admin@studyvault.pk';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log('User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User not found: ' + email);
      const allUsers = await User.find({}).limit(5);
      console.log('Recent users:', JSON.stringify(allUsers, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
