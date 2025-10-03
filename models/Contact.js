import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ContactSchema = new mongoose.Schema({
  contact_id: { type: String, default: uuidv4, index: true, unique: true },
  task_id: { type: String, index: true },
  assigned_teacher_id: { type: String, index: true },
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

export const Contact = mongoose.model('Contact', ContactSchema);


