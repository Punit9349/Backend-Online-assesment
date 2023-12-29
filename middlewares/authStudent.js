const Student = require('../models/student');

// Register a new student
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, collegeName } = req.body;

    // Check if the student with the given email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Create a new student
    const student = new Student({ name, email, password, rollNo, collegeName });
    await student.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { registerStudent };
