import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/auth.js';
import { Message } from '../models/Message.js';
import { CallLog } from '../models/CallLog.js';
import { Contact } from '../models/Contact.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Admin sends message
router.post(
  '/message',
  requireAdmin,
  body('receiver_teacher_id').isString(), // 'ALL' or teacher_id
  body('message_text').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { receiver_teacher_id, message_text } = req.body;
    const msg = await Message.create({
      sender_admin_id: req.admin.admin_id,
      receiver_teacher_id,
      message_text
    });
    res.status(201).json({ message_id: msg.message_id });
  })
);

// Teacher fetch messages
router.get(
  '/teacher/messages',
  asyncHandler(async (req, res) => {
    const teacherId = req.query.teacher_id;
    const messages = await Message.find(
      { $or: [{ receiver_teacher_id: 'ALL' }, { receiver_teacher_id: teacherId }] },
      { _id: 0, __v: 0 }
    ).sort({ created_at: -1 });
    res.json({ messages });
  })
);

// Admin reports
router.get(
  '/reports',
  requireAdmin,
  query('teacher_id').optional().isString(),
  query('date').optional().isISO8601(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { teacher_id, date } = req.query;
    const filter = {};
    if (teacher_id) filter.teacher_id = teacher_id;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.submitted_date = { $gte: dayStart, $lt: dayEnd };
    }
    const logs = await CallLog.find(filter, { _id: 0, __v: 0 });
    res.json({ logs });
  })
);

export default router;


