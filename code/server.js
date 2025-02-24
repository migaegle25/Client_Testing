const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

const app = express();
const port = 3000;
let isStopping = false

// Create HTTP server
const server = http.createServer(app);

// Set up socket.io
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../body'))); // Serve static files from the Body folder

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Client_Information')
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Define a schema and model for user details
const userSchema = new mongoose.Schema({
    name: String,
    surname: String,
    phone: String,
    email: String,
    UserID: String,
});

const User = mongoose.model('user_details', userSchema);

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const { name, surname, phone, email } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ name, surname, phone, email });
        if (existingUser) {
            return res.status(400).json({ message: 'User information already exists' });
        }

        // Generate unique code
        const UserID = uuidv4();

        // Create new user
        const newUser = new User({
            name,
            surname,
            phone,
            email,
            UserID,
        });

        // Save new user
        await newUser.save();
        res.status(201).json({ message: 'User information saved successfully', UserID });

        // Emit reload event to clients
        io.emit('reload');
    } catch (error) {
        console.error('Error saving user information:', error);
        res.status(500).json({ message: 'Error saving user information', error });
    }
});

//function to delete latest entry
app.delete('/delete-latest-entry', async (req, res) => {
    try {
        const latestUser = await User.findOne().sort({ _id: -1 });
        if (latestUser) {
            await User.deleteOne({ _id: latestUser._id });
            res.status(200).json({ message: 'latest entry deleted succesfully. ' });
        } else {
            res.status(404).json({ message: 'No entries Found. ' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/delete-all-entries', async (req, res) => {
    try {
        const result = await User.deleteMany({});
        res.status(200).json({ message: `${result.deletedCount} entries deleted successfully. ` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/search-user', async (req, res) => {
    const query = req.query.query;
    console.log('Search query:', query);  // Log the search query
    try {
        const users = await User.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { surname: new RegExp(query, 'i') },
                { phone: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') },
            ]
        });
        console.log('Search results:', users);  // Log the search results
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/update-user/:id', async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json({ message: 'User information updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A client connected');
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

// Set up CLI to listen for commands
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    if (input.trim() === 'reload') {
        io.emit('reload');
        console.log('Reload command issued');
    } else if (input.trim() === 'stop') {
        console.log('Stopping server...');
        isStopping = true;
        server.close(() => {
            console.log('server stopped');
            process.exit(0);
        });
    } else if (input.trim() === 'restart') {
        console.log('Restarting server...');
        fs.utimesSync(__filename, new Date(), new Date());
    }
});

//Serve home.html when the root url is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../body/home.html'));
});


// Start the server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
