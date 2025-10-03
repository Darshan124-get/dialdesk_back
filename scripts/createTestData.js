import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';
import { Task } from '../models/Task.js';
import { Excel } from '../models/Excel.js';

dotenv.config();

async function createTestData() {
  try {
    await connectToDatabase();
    
    // Find the test teacher
    const teacher = await Teacher.findOne({ email: 'teacher@test.com' });
    if (!teacher) {
      console.log('❌ Test teacher not found. Please run createTestTeacher.js first.');
      process.exit(1);
    }
    
    console.log('Found test teacher:', teacher.teacher_id);
    
    // Create a test task
    const task = await Task.create({
      task_name: 'Test Call Task',
      assigned_teacher_id: teacher.teacher_id,
      excel_file_url: 'https://bialdesk.s3.eu-north-1.amazonaws.com/test.xlsx',
      status: 'pending'
    });
    
    console.log('✅ Test task created:', task.task_id);
    
    // Create a test Excel file
    const excelFile = await Excel.create({
      fileName: 'testcall',
      originalFileName: 'testcall.xlsx',
      s3Url: 'https://bialdesk.s3.eu-north-1.amazonaws.com/uploads/excel-files/2025/10/test.xlsx',
      s3Key: 'uploads/excel-files/2025/10/test.xlsx',
      assignedTo: teacher.teacher_id,
      uploadedBy: 'admin',
      fileSize: 9236,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      status: 'uploaded',
      contactsCount: 0,
      taskId: task.task_id
    });
    
    console.log('✅ Test Excel file created:', excelFile.excelId);
    console.log('Task ID:', task.task_id);
    console.log('Teacher ID:', teacher.teacher_id);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error creating test data:', e);
    process.exit(1);
  }
}

createTestData();
