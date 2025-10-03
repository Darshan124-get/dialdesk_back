import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

dotenv.config();

async function main() {
  try {
    await connectToDatabase();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const name = process.env.SEED_ADMIN_NAME || 'Admin';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }
    const password_hash = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password_hash });
    console.log('Seeded admin:', email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();


