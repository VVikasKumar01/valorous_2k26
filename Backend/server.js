// server.js — Valorous 2K26 Backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'valorous2k26_secret_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valorous2k26';

// ─── MIDDLEWARE ───
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ─── DATABASE CONNECTION ───
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── SCHEMAS ───
const EventSchema = new mongoose.Schema({
  eventName:        { type: String, required: true },
  department:       { type: String, required: true, enum: ['CSE','IT','CSD','CSM','CSC','ECE','EEE','MECH','CIVIL'] },
  shortDescription: { type: String, required: true },
  fullDescription:  { type: String },
  rules:            [String],
  date:             { type: String },
  venue:            { type: String },
  image:            { type: String, default: '' },
  emoji:            { type: String, default: '⚡' },
  coordinator:      { type: String },
  contact:          { type: String },
  prize:            { type: String },
}, { timestamps: true });

const RegistrationSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true },
  phone:      { type: String, required: true },
  college:    { type: String, required: true },
  department: { type: String, required: true },
  year:       { type: String, required: true },
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventName:  { type: String },
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Event = mongoose.model('Event', EventSchema);
const Registration = mongoose.model('Registration', RegistrationSchema);
const Admin = mongoose.model('Admin', AdminSchema);

// ─── FILE UPLOAD ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── AUTH MIDDLEWARE ───
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// ─── ROUTES: EVENTS ───

// GET all events (with optional department filter)
app.get('/api/events', async (req, res) => {
  try {
    const filter = {};
    if (req.query.dept) filter.department = req.query.dept;
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create event (Admin only)
app.post('/api/events', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const eventData = { ...req.body };
    if (req.body.rules && typeof req.body.rules === 'string') {
      eventData.rules = req.body.rules.split('\n').filter(r => r.trim());
    }
    if (req.file) eventData.image = `/uploads/${req.file.filename}`;
    const event = new Event(eventData);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update event (Admin only)
app.put('/api/events/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.rules && typeof req.body.rules === 'string') {
      updateData.rules = req.body.rules.split('\n').filter(r => r.trim());
    }
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE event (Admin only)
app.delete('/api/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ROUTES: REGISTRATIONS ───

// POST register for an event
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, college, department, year, eventId } = req.body;
    if (!name || !email || !phone || !college || !department || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({ email, eventId });
    if (existing) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }

    // Get event name for reference
    let eventName = '';
    if (eventId) {
      const ev = await Event.findById(eventId);
      if (ev) eventName = ev.eventName;
    }

    const reg = new Registration({ name, email, phone, college, department, year, eventId, eventName });
    await reg.save();
    res.status(201).json({ success: true, message: 'Registration successful!', data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all registrations (Admin only)
app.get('/api/registrations', authMiddleware, async (req, res) => {
  try {
    const regs = await Registration.find().sort({ createdAt: -1 }).populate('eventId', 'eventName department');
    res.json({ success: true, data: regs, total: regs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET registrations by event
app.get('/api/registrations/event/:eventId', authMiddleware, async (req, res) => {
  try {
    const regs = await Registration.find({ eventId: req.params.eventId });
    res.json({ success: true, data: regs, total: regs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ROUTES: ADMIN ───

// POST admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Default admin check (change in production!)
    if (username === 'admin' && password === 'valorous2k26') {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, token, message: 'Login successful' });
    }

    // DB admin check
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET analytics
app.get('/api/admin/analytics', authMiddleware, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const depts = ['CSE','IT','CSD','CSM','CSC','ECE','EEE','MECH','CIVIL'];
    const regsByDept = await Promise.all(
      depts.map(async d => ({ dept: d, count: await Registration.countDocuments({ department: d }) }))
    );
    const uniqueColleges = await Registration.distinct('college');
    res.json({ success: true, data: { totalEvents, totalRegistrations, regsByDept, uniqueColleges: uniqueColleges.length } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── SERVE FRONTEND ───
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── START ───
app.listen(PORT, () => {
  console.log(`🚀 Valorous 2K26 server running on http://localhost:${PORT}`);
});
