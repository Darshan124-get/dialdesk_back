import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';

dotenv.config();

async function createTestTeacher() {
  try {
    await connectToDatabase();
    
    // Check if test teacher already exists
    const existing = await Teacher.findOne({ email: 'teacher@test.com' });
    if (existing) {
      console.log('Test teacher already exists:', existing.email);
      console.log('Phone:', existing.phone);
      console.log('Password: test123');
      process.exit(0);
    }
    
    // Create test teacher
    const password_hash = await bcrypt.hash('test123', 10);
    const teacher = await Teacher.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      phone: '6364594854',
      password_hash,
      status: 'active'
    });
    
    console.log('✅ Test teacher created successfully!');
    console.log('Email: teacher@test.com');
    console.log('Phone: 6364594854');
    console.log('Password: test123');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error creating test teacher:', e);
    process.exit(1);
  }
}

createTestTeacher();
