import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const MessageSchema = new mongoose.Schema({
  message_id: { type: String, default: uuidv4, index: true, unique: true },
  sender_admin_id: { type: String, index: true },
  receiver_teacher_id: { type: String, index: true }, // 'ALL' or teacher_id
  message_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', MessageSchema);


