import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/auth.js';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post(
  '/change-password',
  requireAdmin,
  body('current_password').optional().isString().isLength({ min: 6 }),
  body('new_password').isString().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { admin_id } = req.admin;
    const { current_password, new_password } = req.body;
    const admin = await Admin.findOne({ admin_id });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (current_password) {
      const ok = await bcrypt.compare(current_password, admin.password_hash);
      if (!ok) return res.status(401).json({ message: 'Current password incorrect' });
    }
    admin.password_hash = await bcrypt.hash(new_password, 10);
    await admin.save();
    res.json({ ok: true });
  })
);

export default router;


