const serverUrl = 'http://migaelpc:3000'; // Replace with your desktop PC's IP address

function submitForm(event) {
    if (event) event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phone = document.getElementById('phone').value.trim().replace(/\s+/g, ''); // Remove spaces
    const email = document.getElementById('email').value.trim();


    if (name && surname && phone && email) {
        const data = { name, surname, phone, email };
        fetch(`${serverUrl}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.exists) {
                    document.getElementById('errorMessage').innerText = 'Error: User data already exists';
                } else {
                    fetch(`${serverUrl}/submit`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(result => {
                            alert(`Data saved successfully. Your unique code is: ${result.uniqueCode}`);
                            document.getElementById('indemnityForm').reset(); // Clear the input boxes
                            document.getElementById('errorMessage').innerText = ''; // Clear the error message
                        })
                        .catch(error => console.error('Error:', error));
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        document.getElementById("errorMessage").innerText = 'Error: All the fields are required';
    }
}

function clearFile() {
    fetch(`${serverUrl}/clear`, {
        method: 'POST'
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}

function deleteLastEntry() {
    fetch(`${serverUrl}/deleteLastEntry`, {
        method: 'POST'
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}

function searchEntry() {
    let query = document.getElementById('search').value.trim(); // Trim the input value

    fetch(`${serverUrl}/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
            const searchResultsDiv = document.getElementById('searchResults');
            searchResultsDiv.innerHTML = '';

            if (results.length > 0) {
                results.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.innerHTML = `
                    <p>Entry Number: ${entry.entryNumber}</p>
                    <p>Name: ${entry.name}</p>
                    <p>Surname: ${entry.surname}</p>
                    <p>Cellphone Number: ${entry.phone}</p>
                    <p>Email: ${entry.email}</p>
                    <p>UniqueCode: ${entry.uniqueCode}</p>
                    <hr>
                `;
                    searchResultsDiv.appendChild(entryDiv);
                });
            } else {
                searchResultsDiv.innerHTML = '<p>No entries found.</p>';
            }
        })
        .catch(error => console.error('Error:', error));
}

function clearForm() {
    document.getElementById('indemnityForm').reset(); // Clear the input boxes
    document.getElementById('errorMessage').innerText = '';
    document.getElementById('searchResults').innerText = '';
    document.getElementById('search').clear;
} 