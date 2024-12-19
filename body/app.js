function submitForm(event) {
    if (event) event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phone = document.getElementById('phone').value.trim().replace(/\s+/g, ''); // Remove spaces
    const email = document.getElementById('email').value.trim();

    // Validate required fields
    if (!name || !surname || !phone) {
        document.getElementById("errorMessage").innerText = 'Error: Name, Surname, and Cellphone Number are required';
        return;
    }

    // Validate email format if email is provided
    if (email && !validateEmail(email)) {
        document.getElementById("errorMessage").innerText = 'Error: Please enter a valid email address';
        return;
    }

    const data = { name, surname, phone, email };

    fetch('http://localhost:3000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.message === 'User Information Saved Succesfully') {
                alert(`Data saved successfully. Your unique code is: ${result.uniquecode}`);
                document.getElementById('indemnityForm').reset(); // Clear the input boxes
                document.getElementById('errorMessage').innerText = ''; // Clear the error message
            } else {
                document.getElementById('errorMessage').innerText = `Alert: ${result.message}`;
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to validate email format
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
