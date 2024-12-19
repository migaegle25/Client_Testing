const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const e = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'body' directory
app.use(express.static(path.join(__dirname, '..', 'body')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../body/home.html'));
});

//Middleware
app.use(bodyParser.json());

//MongoDB connection
mongoose.connect('mongodb://sniffels:27017/Client_Information');

//Define a schema and model for user details
const userSchema = new mongoose.Schema({
    name: String,
    surname: String,
    phone: String,
    email: String,
    uniquecode: String,
});

const User = mongoose.model('user_details', userSchema);


//Route to handle From submission
app.post('/submit', async (req, res) => {
    const { name, surname, phone, email } = req.body;
    const uniquecode = uuidv4();

    const newUser = new User({
        name,
        surname,
        phone,
        email,
        uniquecode,
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User Information Saved Succesfully', uniquecode });
    } catch (error) {
        console.error('Error saving user information:', error);
        res.status(500).json({ message: 'Error saving user Information', error });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
