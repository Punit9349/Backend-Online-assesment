// Mongoose schema for assessments

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [optionSchema],
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0 && value < this.options.length;
      },
      message: 'Correct answer index is out of bounds',
    },
  },
});

const assessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  questions: [questionSchema],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
