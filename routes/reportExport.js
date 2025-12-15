import express from 'express';
import { query, validationResult } from 'express-validator';
import xlsx from 'xlsx';
import { requireAdmin } from '../middleware/auth.js';
import { CallLog } from '../models/CallLog.js';
import { Contact } from '../models/Contact.js';
import { Task } from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/report/export',
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
    const logs = await CallLog.find(filter).lean();

    // Join with contacts and tasks to get names and task ids
    const contactIds = logs.map(l => l.contact_id);
    const contacts = await Contact.find({ contact_id: { $in: contactIds } }).lean();
    const contactMap = new Map(contacts.map(c => [c.contact_id, c]));

    const data = logs.map(l => {
      const c = contactMap.get(l.contact_id) || {};
      return {
        'Student Name': c.name || '',
        'Phone': c.phone_number || '',
        'Status': l.call_status,
        'Notes': l.review_notes || '',
        'Call Time': l.call_time ? new Date(l.call_time).toISOString() : '',
        'Duration (sec)': l.duration ?? '',
        'Teacher ID': l.teacher_id,
        'Task ID': c.task_id || ''
      };
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Report');
    const buf = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
    res.send(buf);
  })
);

export default router;


