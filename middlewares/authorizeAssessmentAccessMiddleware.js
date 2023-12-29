const Assessment = require('../models/assesment');

const fetchstudent = async (req, res, next) => {
    const id =req.params.id;
    const email=req.params.email;
  
    try {
      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }
  
      if (assessment.allowedEmails.includes(email)) {
        next(); // User is authorized, proceed to the next middleware or route handler
      } else {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
    } catch (error) {
      console.error('Error checking assessment access:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  module.exports=fetchstudent;
  