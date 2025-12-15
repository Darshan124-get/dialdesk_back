import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';

dotenv.config();

async function main() {
  try {
    await connectToDatabase();
    
    const teachers = [
      {
        name: 'John Smith',
        email: 'john.smith@dialdesk.com',
        phone: '+1-555-0101',
        password: 'teacher123',
        status: 'active'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@dialdesk.com',
        phone: '+1-555-0102',
        password: 'teacher123',
        status: 'active'
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@dialdesk.com',
        phone: '+1-555-0103',
        password: 'teacher123',
        status: 'active'
      },
      {
        name: 'Emily Wilson',
        email: 'emily.wilson@dialdesk.com',
        phone: '+1-555-0104',
        password: 'teacher123',
        status: 'active'
      }
    ];

    for (const teacherData of teachers) {
      const existing = await Teacher.findOne({ email: teacherData.email });
      if (existing) {
        console.log('Teacher already exists:', teacherData.email);
        continue;
      }
      
      const password_hash = await bcrypt.hash(teacherData.password, 10);
      await Teacher.create({
        name: teacherData.name,
        email: teacherData.email,
        phone: teacherData.phone,
        password_hash,
        status: teacherData.status
      });
      console.log('Seeded teacher:', teacherData.email);
    }
    
    console.log('✅ All teachers seeded successfully!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error seeding teachers:', e);
    process.exit(1);
  }
}

main();
