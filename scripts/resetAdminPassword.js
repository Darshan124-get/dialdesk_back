import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

dotenv.config();

async function main() {
  try {
    await connectToDatabase();
    
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const newPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    
    console.log('Resetting password for admin:', email);
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      console.log('Admin not found. Creating new admin...');
      const password_hash = await bcrypt.hash(newPassword, 10);
      const newAdmin = await Admin.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email: email.toLowerCase().trim(),
        password_hash
      });
      console.log('✅ Admin created:', newAdmin.email);
      console.log('Email:', newAdmin.email);
      console.log('Password:', newPassword);
    } else {
      console.log('Admin found. Resetting password...');
      const password_hash = await bcrypt.hash(newPassword, 10);
      admin.password_hash = password_hash;
      await admin.save();
      console.log('✅ Password reset successful');
      console.log('Email:', admin.email);
      console.log('New Password:', newPassword);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

main();

