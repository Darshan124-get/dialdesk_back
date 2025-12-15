import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { Contact } from '../models/Contact.js';
import { Task } from '../models/Task.js';
import { CallLog } from '../models/CallLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Fetch contacts for a task assigned to the teacher
router.get(
  '/tasks/:id',
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { id } = req.params; // task_id
    const task = await Task.findOne({ task_id: id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const contacts = await Contact.find({ task_id: id }, { _id: 0, __v: 0 });
    res.json({ contacts });
  })
);

// Submit a call log
router.post(
  '/call-log',
  body('teacher_id').isString(),
  body('contact_id').isString(),
  body('call_status').isIn(['Received','Not Received','Busy','Wrong Number','Call Later']),
  body('review_notes').optional().isString(),
  body('call_time').optional().isISO8601(),
  body('duration').optional().isNumeric(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const log = await CallLog.create({ ...req.body });
    if (req.body.call_status === 'Received') {
      await Contact.updateOne({ contact_id: req.body.contact_id }, { status: 'completed' });
    }
    res.status(201).json({ call_id: log.call_id });
  })
);

// End-of-day submission (mark task completed if all contacts completed)
router.post(
  '/submit-report',
  body('task_id').isString(),
  body('teacher_id').isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { task_id } = req.body;
    const total = await Contact.countDocuments({ task_id });
    const completed = await Contact.countDocuments({ task_id, status: 'completed' });
    if (total > 0 && total === completed) {
      await Task.updateOne({ task_id }, { status: 'completed', completed_at: new Date() });
    }
    res.json({ ok: true, stats: { total, completed, pending: total - completed } });
  })
);

export default router;


