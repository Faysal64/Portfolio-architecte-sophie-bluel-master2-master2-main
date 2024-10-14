   // Fonction  connexion
function login(event) {
    event.preventDefault(); 
    const email = document.querySelector('#email').value.trim(); 
    const password = document.querySelector('#motdepasse').value.trim(); 

    
    if (email === '' || password === '') {
        alert('Veuillez remplir tous les champs.');
        return; 
    }

    const url = 'http://localhost:5678/api/users/login'; 
    const data = {
        email: email,
        password: password,
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        return response.json().then(data => {
            return { status: response.status, body: data };
        });
    })
    .then(result => {
        if (result.status === 200 && result.body.token) {
            // Stocker le token dans le localStorage
            localStorage.setItem('token', result.body.token);

            window.location.href = 'index.html';
        } else {
            alert('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
            localStorage.removeItem('token');
        }
    })
    .catch(error => {
        console.error('Erreur de requête:', error);
        alert('Erreur de connexion. Veuillez vérifier vos identifiants.');
        localStorage.removeItem('token');
    });
}


function logout() {
    localStorage.removeItem('token'); 
    window.location.href = 'index.html'; 
}

// Attacher la fonction login à l'événement de soumission du formulaire
document.querySelector('#loginForm').addEventListener('submit', login);


