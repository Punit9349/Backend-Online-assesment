const express = require('express');
const router = express.Router();
const Assessment = require('../models/assesment');
const Student = require('../models/student');
var fetchuser= require('../middlewares/authMiddleware');
var fetchstudent=require('../middlewares/authorizeAssessmentAccessMiddleware');
const AssessmentSubmission = require('../models/submissions');
const mongoose=require('mongoose');

// Create a new assessment
router.post('/assessments', fetchuser, async (req, res) => {
  try {
    const { name, date, time, questions, allowedEmails } = req.body;
    const createdBy = req.user.id;

    // Save the assessment to the database
    const assessment = new Assessment({ name, date, time, questions, allowedEmails, createdBy });
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

// Get a specific assessment by ID and for a particular student
router.get('/assessments/:id/:email', fetchstudent, async (req, res) => {
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

// Get all the assessment that are assigned to a particular student
router.get('/assessments/:email',  async (req, res) => {
  try {
    const { email } = req.params;
    const assessments = await Assessment.find();
    
    const studentAssessments = assessments.filter(assessment => 
      assessment.allowedEmails.includes(email)
    );

    res.json(studentAssessments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})


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


// Update a specific assessment by ID
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


const calculateScore = (correctAnswers, userAnswers) => {
  let score = 0;

  // Log correct and user answers for debugging
  // console.log('Correct Answers:', correctAnswers);
  // console.log('User Answers:', userAnswers);

  // Iterate over user answers and compare with correct answers
  Object.keys(userAnswers).forEach(questionId => {
    const userAnswer = userAnswers[questionId];
    const correctAnswer = correctAnswers[questionId];

    // Log the current question and answers for debugging
    // console.log('Question:', questionId);
    // console.log('User Answer:', userAnswer);
    // console.log('Correct Answer:', correctAnswer);

    // If the user answer is correct, increment the score
    if (userAnswer === correctAnswer) {
      score += 1;
    }
  });

  // Log the final score for debugging
  // console.log('Final Score:', score);

  return score;
};


router.post('/assessments/submit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const answers = req.body.answers;
    console.log(answers);
    const userEmail = req.body.email; 

    // Fetch user ID based on email
    const user = await Student.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch correct answers from the assessment with the given id
    const assessment = await Assessment.findById(id);
     // Create an object with question IDs and correct option indices
     const correctAnswers = {};
     assessment.questions.forEach(question => {
       correctAnswers[question._id] = question.correctAnswer;
     });
 
     // Calculate the score
     const score = calculateScore(correctAnswers, answers);

    // Save the assessment submission to the database
    const submission = new AssessmentSubmission({
      assessment: id,
      student: user._id,
      answers,
      score,
    });
    await submission.save();

    res.json({ message: 'Assessment submitted successfully', score });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/evaluate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.query.email;

    // Fetch student ID based on email
    const user = await Student.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all submissions for the user and the assessment
    const submissions = await AssessmentSubmission.find({ student: user._id, assessment: id });

    // Calculate overall score, total correct answers, and total questions
    let overallScore = 0;
    let totalCorrectAnswers = 0;
    let totalQuestions = 0;

    submissions.forEach(submission => {
      overallScore += submission.score;
      totalCorrectAnswers += submission.score; // Assuming each correct answer is worth 1 point
      totalQuestions += Object.keys(submission.answers).length;
    });

    // Calculate average score if there are multiple submissions
    // if (submissions.length > 0) {
    //   overallScore /= submissions.length;
    // }

    res.json({
      overallScore,
      totalCorrectAnswers,
      totalQuestions,
    });
  } catch (error) {
    console.error('Error evaluating assessment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Route to evaluate assessment
// router.get('/assessments/evaluate/:id', async (req, res) => {
//   try {
//     const assessmentId = req.params.id;

//     // Fetch the assessment by ID
//     const assessment = await Assessment.findById(assessmentId);

//     // Evaluate the assessment (customize this based on your evaluation logic)
//     const totalQuestions = assessment.questions.length;
//     const correctAnswers = assessment.submissions.reduce((total, submission) => {
//       return (
//         total +
//         assessment.questions.reduce((acc, question, index) => {
//           return submission.answers[index] === question.correctAnswer ? acc + 1 : acc;
//         }, 0)
//       );
//     }, 0);

//     // Calculate the score based on your criteria
//     const score = (correctAnswers / (totalQuestions * assessment.submissions.length)) * 100;

//     // You can customize the response structure based on your needs
//     const results = {
//       totalQuestions,
//       correctAnswers,
//       score,
//     };

//     res.json(results);
//   } catch (error) {
//     console.error('Error evaluating assessment:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;
