// Establish a WebSocket connection to the server
const socket = io('http://localhost:3000');

// Listen for the 'reload' event from the server
socket.on('reload', () => {
    location.reload();
});

const serverUrl = 'http://localhost:3000';

// Function to handle form submission
function submitForm(event) {
    if (event) event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phone = document.getElementById('phone').value.trim().replace(/\s+/g, ''); // Remove spaces
    const email = document.getElementById('email').value.trim();

    // Validate required fields
    if (!name || !surname || !phone) {
        document.getElementById("errorMessage").innerText = 'Error: Name, Surname, and phone Number are required';
        return;
    }

    // Validate email format if email is provided
    if (email && !validateEmail(email)) {
        document.getElementById("errorMessage").innerText = 'Error: Please enter a valid email address';
        return;
    }

    const data = { name, surname, phone, email };

    fetch(`${serverUrl}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.message === 'User information saved successfully') {
                alert(`Data saved successfully. Your unique code is: ${result.UserID}`);
                document.getElementById('clientForm').reset(); // Clear the input boxes
                document.getElementById('errorMessage').innerText = ''; // Clear the error message
            } else {
                document.getElementById('errorMessage').innerText = `Error: ${result.message}`;
            }
        })
        .catch(error => console.error('Error:', error));
}

function deleteLastEntry() {
    fetch(`${serverUrl}/delete-latest-entry`, {
        method: 'DELETE',
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}

// Function to validate email format
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function clearFile() {
    fetch(`${serverUrl}/delete-all-entries`, {
        method: 'DELETE',
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}
function clearForm() {
    document.getElementById('indemnityForm').reset(); // Clear the input boxes
    document.getElementById('errorMessage').innerText = '';
    document.getElementById('searchResults').innerText = '';
    document.getElementById('search').clear;
}

function searchUser() {
    const query = document.getElementById('searchQuery').value;
    fetch(`${serverUrl}/search-user?query=${encodeURIComponent(query)}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(result => {
            console.log('Search result:', result);  // Log the search result
            if (result.length > 0) {
                displaySearchResults(result);
            } else {
                alert('No matching user found.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function displaySearchResults(users) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';  // Clear any previous results

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Surname:</strong> ${user.surname}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <button onclick="editUser('${user._id}', '${user.name}', '${user.surname}', '${user.phone}', '${user.email}')">Edit Info</button>
            <hr>
        `;
        resultsDiv.appendChild(userDiv);
    });
}

function editUser(id, name, surname, phone, email) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editSurname').value = surname;
    document.getElementById('editPhone').value = phone;
    document.getElementById('editEmail').value = email;
    document.getElementById('editForm').style.display = 'block';
}

function updateUser() {
    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editName').value;
    const surname = document.getElementById('editSurname').value;
    const phone = document.getElementById('editPhone').value;
    const email = document.getElementById('editEmail').value;

    const data = {
        name: name,
        surname: surname,
        phone: phone,
        email: email
    };

    fetch(`${serverUrl}/update-user/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            document.getElementById('editForm').style.display = 'none';  // Hide edit form after updating
            searchUser();  // Refresh the search results
        })
        .catch(error => console.error('Error:', error));
}
