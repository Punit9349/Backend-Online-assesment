const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var cors= require('cors')
const bodyParser = require('body-parser');
const authenticateUser = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
const url = 'mongodb+srv://punit11069:7txgsYJBeS0FPoN6@cluster0.2jrlioy.mongodb.net/';
const connectionParams={   
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
})
      
      
app.use(cors())
app.use(bodyParser.json());

// Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/assesment', require('./routes/assesment'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
