const serverURL = 'http://migaelpc:3000';


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('indemnityForm');
    form.addEventListener('submit', submitForm);
});

function submitForm(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('name').value.trim().toLowerCase();
    const surname = document.getElementById('surname').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value.trim().toLowerCase().replace(/\s+/g, '');
    const email = document.getElementById('email').value.trim().toLowerCase();

    const data = { name, surname, phone, email };

    fetch(`${serverURL}/check`, {
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
                fetch(`${serverURL}/submit`, {
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
}

function clearFile() {
    fetch(`${serverURL}/clear`, {
        method: 'POST'
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}

function deleteLastEntry() {
    fetch(`${serverURL}/deleteLastEntry`, {
        method: 'POST'
    })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error:', error));
}

function searchEntry() {
    let query = document.getElementById('search').value.trim(); // Trim the input value

    fetch(`${serverURL}/search?query=${encodeURIComponent(query)}`)
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
                    <p>Unique Code: ${entry.uniqueCode}</p>
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
