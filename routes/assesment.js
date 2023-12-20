// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const Assessment = require('../models/assesment');
var fetchuser= require('../middlewares/authMiddleware');

// Create a new assessment
router.post('/assessments', fetchuser , async (req, res) => {
  try {
    const { name, date, time, questions } = req.body;
    const createdBy = req.user.id;
    // Save the assessment to the database
    const assessment = new Assessment({ name, date, time, questions, createdBy });
    await assessment.save();

    res.status(201).json({ message: 'Assessment created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all assessments
router.get('/assessments', fetchuser , async (req, res) => {
  try {
    const assessments = await Assessment.find({createdBy: req.user.id});
    res.json(assessments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a specific assessment by ID
router.get('/assessments/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a specific assessment by ID
router.delete('/assessments/:id', fetchuser, async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!deletedAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/assessments/:id', fetchuser, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAssessment = req.body; // Updated assessment data from the request body

    // Validate the existence of the assessment
    const existingAssessment = await Assessment.findById(id);
    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Update the assessment
    await Assessment.findByIdAndUpdate(id, updatedAssessment);

    res.json({ message: 'Assessment updated successfully' });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
