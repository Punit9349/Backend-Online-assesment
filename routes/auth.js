const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Student=require('../models/student')
const router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var fetchuser=require('../middlewares/authMiddleware');
const JWT_SECRET = 'Punitisagoo$b$oy';
const { registerStudent } = require('../middlewares/authStudent');

router.post('/signup',[ 
  body('name','Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password','Password must be of atleast 5 characters').isLength({ min: 5 }),
 ], async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ success,errors: errors.array() });
   }
   try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    const data={
      newUser:{
        id: newUser.id
      }
    }

    const authToken= jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success,authToken});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', [ 
  body('email', 'Enter a valid email').isEmail(),
  body('password','Password can not be blank').exists(),
  ], 
  
  async (req, res) => {

    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        success=false;
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const data={
        user:{
          id: user.id
        }
      }

      const authToken= jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authToken});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  router.post('/getuser', fetchuser,  async (req,res)=>{ 
    try {
      userId= req.user.id;
      const user= await User.findById(userId).select("-password");
      res.send(user);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  
  })

  router.post('/register', registerStudent);

  router.get('/check-registration/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      // Check if the user with the provided email exists
      const user = await Student.findOne({ email });
  
      // If the user exists, they are registered; otherwise, they are not registered
      const isRegistered = !!user;
  
      res.json({ isRegistered });
    } catch (error) {
      console.error('Error checking registration status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.post('/studentlogin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the student exists
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Check if the password is correct
      if (password !== student.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: student._id, email: student.email }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
