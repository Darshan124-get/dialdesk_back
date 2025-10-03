import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TaskSchema = new mongoose.Schema({
  task_id: { type: String, default: uuidv4, index: true, unique: true },
  task_name: { type: String },
  assigned_teacher_id: { type: String, index: true },
  excel_file_url: { type: String },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  completed_at: { type: Date }
});

export const Task = mongoose.model('Task', TaskSchema);


