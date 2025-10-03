import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';
import { Task } from '../models/Task.js';
import { Excel } from '../models/Excel.js';

dotenv.config();

async function cleanTestData() {
  try {
    await connectToDatabase();
    
    console.log('🧹 Cleaning up test data...\n');
    
    // Find and remove test teacher
    const testTeacher = await Teacher.findOne({ email: 'teacher@test.com' });
    if (testTeacher) {
      console.log(`🗑️  Removing test teacher: ${testTeacher.name} (${testTeacher.teacher_id})`);
      
      // Remove tasks assigned to this teacher
      const tasksToRemove = await Task.find({ assigned_teacher_id: testTeacher.teacher_id });
      console.log(`🗑️  Removing ${tasksToRemove.length} tasks assigned to test teacher`);
      
      for (const task of tasksToRemove) {
        // Remove Excel files linked to these tasks
        const excelFilesToRemove = await Excel.find({ taskId: task.task_id });
        console.log(`🗑️  Removing ${excelFilesToRemove.length} Excel files for task: ${task.task_name}`);
        
        await Excel.deleteMany({ taskId: task.task_id });
      }
      
      // Remove the tasks
      await Task.deleteMany({ assigned_teacher_id: testTeacher.teacher_id });
      
      // Remove the teacher
      await Teacher.deleteOne({ _id: testTeacher._id });
      
      console.log('✅ Test teacher and associated data removed');
    } else {
      console.log('ℹ️  No test teacher found');
    }
    
    // Check for any remaining test data
    const remainingTeachers = await Teacher.find({ email: /test/i });
    const remainingTasks = await Task.find({ task_name: /test/i });
    const remainingExcel = await Excel.find({ fileName: /test/i });
    
    console.log('\n📊 Remaining data:');
    console.log(`  - Teachers: ${await Teacher.countDocuments()}`);
    console.log(`  - Tasks: ${await Task.countDocuments()}`);
    console.log(`  - Excel files: ${await Excel.countDocuments()}`);
    
    if (remainingTeachers.length > 0) {
      console.log(`  - Test teachers remaining: ${remainingTeachers.length}`);
    }
    if (remainingTasks.length > 0) {
      console.log(`  - Test tasks remaining: ${remainingTasks.length}`);
    }
    if (remainingExcel.length > 0) {
      console.log(`  - Test Excel files remaining: ${remainingExcel.length}`);
    }
    
    console.log('\n✅ Test data cleanup completed!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error cleaning test data:', e);
    process.exit(1);
  }
}

cleanTestData();
