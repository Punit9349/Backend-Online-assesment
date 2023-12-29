// models/AssessmentSubmission.js
const mongoose = require('mongoose');

const assessmentSubmissionSchema = new mongoose.Schema({
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Assuming you have a Student model
    required: true,
  },
  answers: {
    type: Object, // You can adjust this based on your answer structure
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const AssessmentSubmission = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);

module.exports = AssessmentSubmission;
