import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';
import { Task } from '../models/Task.js';
import { Excel } from '../models/Excel.js';

dotenv.config();

async function cleanAllTestData() {
  try {
    await connectToDatabase();
    
    console.log('🧹 Cleaning up ALL test data...\n');
    
    // Remove all test-related data
    const testTeachers = await Teacher.find({ 
      $or: [
        { email: /test/i },
        { name: /test/i }
      ]
    });
    
    console.log(`🗑️  Found ${testTeachers.length} test teachers to remove`);
    
    for (const teacher of testTeachers) {
      console.log(`  - Removing teacher: ${teacher.name} (${teacher.email})`);
      
      // Get tasks assigned to this teacher
      const tasks = await Task.find({ assigned_teacher_id: teacher.teacher_id });
      console.log(`    - Found ${tasks.length} tasks to remove`);
      
      for (const task of tasks) {
        // Remove Excel files for this task
        const excelFiles = await Excel.find({ taskId: task.task_id });
        console.log(`    - Removing ${excelFiles.length} Excel files for task: ${task.task_name}`);
        await Excel.deleteMany({ taskId: task.task_id });
      }
      
      // Remove tasks
      await Task.deleteMany({ assigned_teacher_id: teacher.teacher_id });
    }
    
    // Remove test teachers
    await Teacher.deleteMany({ 
      $or: [
        { email: /test/i },
        { name: /test/i }
      ]
    });
    
    // Remove any remaining test tasks
    const remainingTestTasks = await Task.find({ task_name: /test/i });
    console.log(`🗑️  Removing ${remainingTestTasks.length} remaining test tasks`);
    
    for (const task of remainingTestTasks) {
      await Excel.deleteMany({ taskId: task.task_id });
    }
    await Task.deleteMany({ task_name: /test/i });
    
    // Remove any remaining test Excel files
    const remainingTestExcel = await Excel.find({ 
      $or: [
        { fileName: /test/i },
        { originalFileName: /test/i }
      ]
    });
    console.log(`🗑️  Removing ${remainingTestExcel.length} remaining test Excel files`);
    await Excel.deleteMany({ 
      $or: [
        { fileName: /test/i },
        { originalFileName: /test/i }
      ]
    });
    
    // Final count
    console.log('\n📊 Final data count:');
    console.log(`  - Teachers: ${await Teacher.countDocuments()}`);
    console.log(`  - Tasks: ${await Task.countDocuments()}`);
    console.log(`  - Excel files: ${await Excel.countDocuments()}`);
    
    console.log('\n✅ All test data cleanup completed!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error cleaning test data:', e);
    process.exit(1);
  }
}

cleanAllTestData();
