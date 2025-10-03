import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { body, param, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Contact } from '../models/Contact.js';
import { Excel } from '../models/Excel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToS3, generateS3Key, deleteFromS3, generatePresignedUrl } from '../config/s3.js';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload Excel, create Task and Contacts
router.post(
  '/task/upload',
  requireAdmin,
  upload.single('file'),
  body('assigned_teacher_id').optional().isString(),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    
    const assigned_teacher_id = req.body.assigned_teacher_id || null;
    const uploadedBy = req.admin.admin_id; // Get admin ID from auth middleware
    const taskName = req.file.originalname.replace(/\.[^/.]+$/, ''); // Remove file extension

    try {
      // Create task first to get task_id
      const task = await Task.create({
        task_name: taskName,
        assigned_teacher_id,
        excel_file_url: '', // Will be updated with S3 URL
        status: 'pending'
      });

      // Generate S3 key and upload file
      const s3Key = generateS3Key(req.file.originalname, task.task_id);
      
      console.log('Uploading file to S3:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer ? req.file.buffer.length : 'no buffer',
        s3Key: s3Key
      });
      
      const uploadResult = await uploadToS3(req.file, s3Key);

      if (!uploadResult.success) {
        // If S3 upload fails, clean up the task
        await Task.deleteOne({ task_id: task.task_id });
        return res.status(500).json({ 
          message: 'Failed to upload file to S3', 
          error: uploadResult.error 
        });
      }

      // Update task with S3 URL
      await Task.findOneAndUpdate(
        { task_id: task.task_id },
        { excel_file_url: uploadResult.location }
      );

      // Create Excel metadata record
      const excelRecord = await Excel.create({
        fileName: taskName,
        originalFileName: req.file.originalname,
        s3Url: uploadResult.location,
        s3Key: s3Key,
        assignedTo: assigned_teacher_id,
        uploadedBy: uploadedBy,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        taskId: task.task_id,
        status: 'uploaded'
      });

      // Process Excel file to extract contacts
      const wb = xlsx.readFile(req.file.path);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });

      const contactsToInsert = [];
      for (const row of rows) {
        const name = String(row['Student Name'] || row['Name'] || '').trim();
        const phone_number = String(row['Phone'] || row['Phone Number'] || row['Mobile'] || '').trim();
        if (!name || !phone_number) continue;
        contactsToInsert.push({
          task_id: task.task_id,
          assigned_teacher_id,
          name,
          phone_number
        });
      }

      if (contactsToInsert.length) {
        await Contact.insertMany(contactsToInsert);
        
        // Update Excel record with contacts count and status
        await Excel.findOneAndUpdate(
          { excelId: excelRecord.excelId },
          { 
            contactsCount: contactsToInsert.length,
            status: 'processed',
            processedAt: new Date()
          }
        );
      }

      // Clean up local file
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);

      res.status(201).json({ 
        task_id: task.task_id, 
        excel_id: excelRecord.excelId,
        contacts_created: contactsToInsert.length,
        s3_url: uploadResult.location
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up task if it was created
      if (task && task.task_id) {
        await Task.deleteOne({ task_id: task.task_id });
      }
      
      // Clean up local file
      const fs = await import('fs');
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up local file:', unlinkError);
        }
      }

      res.status(500).json({ 
        message: 'Upload failed', 
        error: error.message 
      });
    }
  })
);

// Assign task to a specific teacher
router.post(
  '/task/assign/:teacher_id',
  requireAdmin,
  param('teacher_id').isString(),
  body('task_id').isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { teacher_id } = req.params;
    const { task_id } = req.body;

    const task = await Task.findOneAndUpdate(
      { task_id },
      { assigned_teacher_id: teacher_id, status: 'in-progress' },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await Contact.updateMany({ task_id }, { assigned_teacher_id: teacher_id });
    res.json({ ok: true });
  })
);

// List tasks
router.get(
  '/tasks',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const tasks = await Task.find({}, { _id: 0, __v: 0 });
    res.json({ tasks });
  })
);

// Get a single task and its contacts summary
router.get(
  '/task/:id',
  requireAdmin,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findOne({ task_id: id }, { _id: 0, __v: 0 });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const total = await Contact.countDocuments({ task_id: id });
    const completed = await Contact.countDocuments({ task_id: id, status: 'completed' });
    res.json({ task, stats: { total, completed, pending: total - completed } });
  })
);

// Update task
router.put(
  '/task/:id',
  requireAdmin,
  param('id').isString(),
  body('task_name').optional().isString(),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('assigned_teacher_id').optional().isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { id } = req.params;
    const update = { ...req.body };
    if (update.assigned_teacher_id === '') update.assigned_teacher_id = null;
    
    const task = await Task.findOneAndUpdate({ task_id: id }, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Update contacts if teacher assignment changed
    if (req.body.assigned_teacher_id !== undefined) {
      await Contact.updateMany({ task_id: id }, { assigned_teacher_id: update.assigned_teacher_id });
    }
    
    res.json({ task });
  })
);

// Delete task
router.delete(
  '/task/:id',
  requireAdmin,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      // Find Excel record to get S3 key
      const excelRecord = await Excel.findOne({ taskId: id });
      
      // Delete associated contacts first
      await Contact.deleteMany({ task_id: id });
      
      // Delete from S3 if Excel record exists
      if (excelRecord && excelRecord.s3Key) {
        const deleteResult = await deleteFromS3(excelRecord.s3Key);
        if (!deleteResult.success) {
          console.error('Failed to delete from S3:', deleteResult.error);
        }
        
        // Delete Excel metadata
        await Excel.deleteOne({ excelId: excelRecord.excelId });
      }
      
      // Delete task
      const result = await Task.deleteOne({ task_id: id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Task not found' });
      
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
  })
);

// Get all Excel files with metadata
router.get(
  '/excel-files',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, assignedTo } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const excelFiles = await Excel.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-_id -__v');
    
    const total = await Excel.countDocuments(query);
    
    res.json({
      excelFiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  })
);

// Get single Excel file details
router.get(
  '/excel-file/:id',
  requireAdmin,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const excelFile = await Excel.findOne({ excelId: id }).select('-_id -__v');
    if (!excelFile) return res.status(404).json({ message: 'Excel file not found' });
    
    res.json({ excelFile });
  })
);

// Generate pre-signed URL for Excel file download
router.get(
  '/excel-file/:id/download',
  requireAdmin,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const excelFile = await Excel.findOne({ excelId: id });
    if (!excelFile) return res.status(404).json({ message: 'Excel file not found' });
    
    const presignedResult = await generatePresignedUrl(excelFile.s3Key, 3600); // 1 hour expiry
    
    if (!presignedResult.success) {
      return res.status(500).json({ 
        message: 'Failed to generate download URL', 
        error: presignedResult.error 
      });
    }
    
    res.json({ 
      downloadUrl: presignedResult.url,
      fileName: excelFile.originalFileName,
      expiresIn: 3600
    });
  })
);

// Delete Excel file (standalone)
router.delete(
  '/excel-file/:id',
  requireAdmin,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const excelFile = await Excel.findOne({ excelId: id });
      if (!excelFile) return res.status(404).json({ message: 'Excel file not found' });
      
      // Delete from S3
      const deleteResult = await deleteFromS3(excelFile.s3Key);
      if (!deleteResult.success) {
        console.error('Failed to delete from S3:', deleteResult.error);
        return res.status(500).json({ 
          message: 'Failed to delete file from S3', 
          error: deleteResult.error 
        });
      }
      
      // Delete associated contacts if task exists
      if (excelFile.taskId) {
        await Contact.deleteMany({ task_id: excelFile.taskId });
        await Task.deleteOne({ task_id: excelFile.taskId });
      }
      
      // Delete Excel metadata
      await Excel.deleteOne({ excelId: id });
      
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete Excel file error:', error);
      res.status(500).json({ message: 'Failed to delete Excel file', error: error.message });
    }
  })
);

export default router;


