import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import { Teacher } from '../models/Teacher.js';
import { Task } from '../models/Task.js';
import { Excel } from '../models/Excel.js';

dotenv.config();

async function checkRealData() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Checking real data in database...\n');
    
    // Check teachers
    const teachers = await Teacher.find({}).select('teacher_id name email phone status');
    console.log(`📚 Teachers (${teachers.length}):`);
    teachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.name}`);
      console.log(`     Email: ${teacher.email}`);
      console.log(`     Phone: ${teacher.phone}`);
      console.log(`     Status: ${teacher.status}`);
      console.log(`     ID: ${teacher.teacher_id}`);
      console.log('');
    });
    
    // Check tasks
    const tasks = await Task.find({}).select('task_id task_name assigned_teacher_id status created_at');
    console.log(`📋 Tasks (${tasks.length}):`);
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.task_name}`);
      console.log(`     Status: ${task.status}`);
      console.log(`     Assigned to: ${task.assigned_teacher_id}`);
      console.log(`     Created: ${task.created_at}`);
      console.log(`     ID: ${task.task_id}`);
      console.log('');
    });
    
    // Check Excel files
    const excelFiles = await Excel.find({}).select('excelId fileName originalFileName taskId assignedTo status uploadedAt');
    console.log(`📊 Excel Files (${excelFiles.length}):`);
    excelFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalFileName}`);
      console.log(`     Status: ${file.status}`);
      console.log(`     Task ID: ${file.taskId}`);
      console.log(`     Assigned to: ${file.assignedTo}`);
      console.log(`     Uploaded: ${file.uploadedAt}`);
      console.log(`     ID: ${file.excelId}`);
      console.log('');
    });
    
    // Check relationships
    console.log('🔗 Data Relationships:');
    const teachersWithTasks = await Teacher.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'teacher_id',
          foreignField: 'assigned_teacher_id',
          as: 'tasks'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          taskCount: { $size: '$tasks' }
        }
      }
    ]);
    
    teachersWithTasks.forEach(teacher => {
      console.log(`  - ${teacher.name} (${teacher.email}): ${teacher.taskCount} tasks`);
    });
    
    const tasksWithExcel = await Task.aggregate([
      {
        $lookup: {
          from: 'excels',
          localField: 'task_id',
          foreignField: 'taskId',
          as: 'excelFiles'
        }
      },
      {
        $project: {
          task_name: 1,
          excelCount: { $size: '$excelFiles' }
        }
      }
    ]);
    
    tasksWithExcel.forEach(task => {
      console.log(`  - ${task.task_name}: ${task.excelCount} Excel files`);
    });
    
    console.log('\n✅ Data check completed!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error checking data:', e);
    process.exit(1);
  }
}

checkRealData();
