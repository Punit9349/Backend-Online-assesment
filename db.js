const mongoose = require('mongoose')

const url = `mongodb+srv://punit11069:7txgsYJBeSOFPoN6@cluster0.2jrlioy.mongodb.net/`;

const connectionParams={
   
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
})