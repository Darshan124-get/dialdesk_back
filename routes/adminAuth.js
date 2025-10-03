import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { role: 'admin', admin_id: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, admin: { admin_id: admin.admin_id, name: admin.name, email: admin.email } });
  })
);

export default router;


