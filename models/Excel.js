import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ExcelSchema = new mongoose.Schema({
  excelId: { 
    type: String, 
    default: uuidv4, 
    index: true, 
    unique: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalFileName: { 
    type: String, 
    required: true 
  },
  s3Url: { 
    type: String, 
    required: true 
  },
  s3Key: { 
    type: String, 
    required: true 
  },
  assignedTo: { 
    type: String, 
    index: true,
    default: null 
  },
  uploadedBy: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number 
  },
  mimeType: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'processed', 'error'], 
    default: 'uploaded' 
  },
  contactsCount: { 
    type: Number, 
    default: 0 
  },
  taskId: { 
    type: String, 
    index: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  processedAt: { 
    type: Date 
  }
});

// Index for efficient queries
ExcelSchema.index({ uploadedBy: 1, uploadedAt: -1 });
ExcelSchema.index({ assignedTo: 1, status: 1 });
ExcelSchema.index({ status: 1, uploadedAt: -1 });

export const Excel = mongoose.model('Excel', ExcelSchema);
