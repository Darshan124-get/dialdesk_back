import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AdminSchema = new mongoose.Schema({
  admin_id: { type: String, default: uuidv4, index: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Admin = mongoose.model('Admin', AdminSchema);


