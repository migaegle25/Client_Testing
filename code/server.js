const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const e = require('express');
const app = express();

// const bcrypt = require('bcrypt');

const port = 3000;

// Define the path to the storage folder and data.json file
const filePath = path.join(__dirname, '..', 'storage', 'data.json');

// Serve static files from the 'body' directory
app.use(express.static(path.join(__dirname, '..', 'body')));

app.use(cors());
app.use(express.json());

app.post('/check', (req, res) => {
    const { name, surname, phone, email } = req.body;

    // Remove spaces from the phone number
    const cleanedPhone = phone.replace(/\s+/g, '');
    const cleanedName = name.toLowerCase();
    const cleanedSurname = surname.toLowerCase();
    const cleanedEmail = email.toLowerCase();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading file', err);
            res.status(500).json({ error: 'Error reading file' });
            return;
        }

        const entries = data ? JSON.parse(data) : [];
        const exists = entries.some(entry =>
            entry.name === cleanedName &&
            entry.surname === cleanedSurname &&
            entry.phone.replace(/\s+/g, '') === cleanedPhone &&
            entry.email === cleanedEmail
        );

        res.json({ exists });
    });
});

app.post('/submit', (req, res) => {
    const { name, surname, phone, email } = req.body;

    // Remove spaces from the phone number
    const cleanedPhone = phone.replace(/\s+/g, '');
    const cleanedName = name.toLowerCase();
    const cleanedSurname = surname.toLowerCase();
    const cleanedEmail = email.toLowerCase();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading file', err);
            res.status(500).json({ error: 'Error reading file' });
            return;
        }

        const entries = data ? JSON.parse(data) : [];
        const exists = entries.some(entry =>
            entry.name === cleanedName &&
            entry.surname === cleanedSurname &&
            entry.phone.replace(/\s+/g, '') === cleanedPhone &&
            entry.email === cleanedEmail
        );

        if (exists) {
            res.status(400).json({ error: 'Client information already exists' });
            return;
        }

        const entryNumber = entries.length + 1;

        // Generate unique code
        const firstLetterName = cleanedName.charAt(0).toUpperCase();
        const lastLetterSurname = cleanedSurname.charAt(surname.length - 1).toUpperCase();
        const lastLetterName = cleanedName.charAt(name.length - 1).toUpperCase();
        const firstLetterSurname = cleanedSurname.charAt(0).toUpperCase();
        const randomNumbers = cleanedPhone.slice(0, 4);
        const uniqueCode = `${firstLetterName}${lastLetterSurname}${randomNumbers}${lastLetterName}${firstLetterSurname}`;



        entries.push({ entryNumber, name: cleanedName, surname: cleanedSurname, phone: cleanedPhone, email: cleanedEmail, uniqueCode });

        fs.writeFile(filePath, JSON.stringify(entries, null | undefined, 2), (err) => {
            if (err) {
                console.error('Error writing to file', err);
                res.status(500).json({ error: 'Error writing to file' });
            } else {
                res.json({ message: 'Data saved successfully', uniqueCode });
                console.log("Data Saved1234");
            }
        });
    });
});

app.post('/clear', (req, res) => {
    fs.writeFile(filePath, '[]', (err) => {
        if (err) {
            console.error('Error clearing file', err);
            res.status(500).send('Error clearing file');
        } else {
            res.send('File cleared successfully');
        }
    });
});

app.post('/deleteLastEntry', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file', err);
            res.status(500).send('Error reading file');
            return;
        }

        const entries = JSON.parse(data);
        if (entries.length > 0) {
            entries.pop(); // Remove the last entry

            fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file', err);
                    res.status(500).send('Error writing to file');
                } else {
                    res.send('Last entry deleted successfully');
                }
            });
        } else {
            res.send('No entries to delete');
        }
    });
});

app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file', err);
            res.status(500).send('Error reading file');
            return;
        }

        const entries = JSON.parse(data);
        const results = entries.filter(entry =>
            entry.name.toLowerCase().includes(query) ||
            entry.surname.toLowerCase().includes(query) ||
            entry.phone.toLowerCase().includes(query) ||
            entry.email.toLowerCase().includes(query) ||
            entry.uniqueCode.toLowerCase().includes(query)

        );

        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
