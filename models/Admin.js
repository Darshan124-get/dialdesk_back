import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AdminSchema = new mongoose.Schema({
  admin_id: { type: String, default: uuidv4, index: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  profile_image_url: { type: String, default: null },
  additional_info: {
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    bio: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

export const Admin = mongoose.model('Admin', AdminSchema);


