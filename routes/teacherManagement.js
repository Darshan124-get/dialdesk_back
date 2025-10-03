import express from 'express';
import bcrypt from 'bcryptjs';
import { body, param, validationResult } from 'express-validator';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create Teacher
router.post(
  '/teacher/create',
  requireAdmin,
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('phone').isString().notEmpty(),
  body('password').isString().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, password } = req.body;
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ name, email, phone, password_hash });
    res.status(201).json({
      teacher: {
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status
      }
    });
  })
);

// List Teachers
router.get(
  '/teachers',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const teachers = await Teacher.find({}, { _id: 0, __v: 0 });
    res.json({ teachers });
  })
);

// Update Teacher
router.put(
  '/teacher/:id',
  requireAdmin,
  param('id').isString().notEmpty(),
  body('name').optional().isString().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString().notEmpty(),
  body('status').optional().isIn(['active', 'inactive']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const update = { ...req.body };
    delete update.password;
    delete update.password_hash;
    const teacher = await Teacher.findOneAndUpdate({ teacher_id: id }, update, { new: true });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({
      teacher: {
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status
      }
    });
  })
);

// Delete Teacher
router.delete(
  '/teacher/:id',
  requireAdmin,
  param('id').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await Teacher.deleteOne({ teacher_id: id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ ok: true });
  })
);

// Reset Teacher Password (admin sets new password)
router.post(
  '/teacher/:id/reset-password',
  requireAdmin,
  param('id').isString().notEmpty(),
  body('new_password').isString().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { new_password } = req.body;
    const password_hash = await bcrypt.hash(new_password, 10);
    const teacher = await Teacher.findOneAndUpdate(
      { teacher_id: id },
      { password_hash },
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ ok: true });
  })
);

export default router;


