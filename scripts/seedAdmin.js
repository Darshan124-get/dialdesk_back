import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

dotenv.config();

async function main() {
  try {
    await connectToDatabase();
    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const name = process.env.SEED_ADMIN_NAME || 'Admin';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    
    console.log('Checking for admin with email:', email);
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      console.log('To reset password, run: npm run reset:admin');
      process.exit(0);
    }
    
    console.log('Creating new admin...');
    const password_hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password_hash });
    console.log('✅ Seeded admin successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  }
}

main();


