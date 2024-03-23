// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mentorship_db', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schemas
const mentorSchema = new mongoose.Schema({
    name: String,
    expertise: String,
    email: String
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
    }
});

// Define models
const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

// Middleware for parsing JSON
app.use(bodyParser.json());

// API to create a mentor
app.post('/mentors', async (req, res) => {
    try {
        const mentor = new Mentor(req.body);
        await mentor.save();
        res.status(201).json(mentor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to create a student
app.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to assign a student to a mentor
app.put('/students/:studentId/assign/:mentorId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        const mentor = await Mentor.findById(req.params.mentorId);
        student.mentor = mentor;
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to assign or change mentor for a student
app.put('/students/:studentId/change-mentor/:mentorId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        const mentor = await Mentor.findById(req.params.mentorId);
        student.mentor = mentor;
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to show all students for a particular mentor
app.get('/mentor/:mentorId/students', async (req, res) => {
    try {
        const students = await Student.find({ mentor: req.params.mentorId });
        res.json(students);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to show previously assigned mentor for a particular student
app.get('/student/:studentId/previous-mentor', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('mentor');
        if (!student.mentor) {
            res.status(404).json({ error: 'No previous mentor found' });
            return;
        }
        res.json(student.mentor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
