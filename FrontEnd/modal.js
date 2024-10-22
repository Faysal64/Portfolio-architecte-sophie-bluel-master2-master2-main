// Fonction affichage photo
function displayGallery(works) {
    const galleryContainer = document.querySelector('.gallery');
    galleryContainer.innerHTML = ''; 

    works.forEach(work => {
        const photo = document.createElement('div');
        photo.classList.add('photo');
        photo.dataset.id = work.id;

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        photo.appendChild(img);
        galleryContainer.appendChild(photo);
    });
}

// Affichage mode édition
function displayEdition() {
    const token = localStorage.getItem('token');
    const header = document.querySelector('header');
    const filtersContainer = document.querySelector('.displayFiltres');
    const galleryContainer = document.querySelector('.gallery');

    if (token) {
        fetch('http://localhost:5678/api/works', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                document.querySelector('.edit').classList.remove('hide-edit');
                header.classList.remove('no-margin-top');
                header.classList.add('header-margin');
                filtersContainer.style.display = 'none';

                // Récupération des données
                return response.json();
            } else {
                console.log('Utilisateur non connecté ou token invalide');
                localStorage.removeItem('token');
                document.querySelector('.edit').classList.add('hide-edit');
                filtersContainer.style.display = 'flex';
                header.classList.remove('header-margin');
                header.classList.add('no-margin-top');
                throw new Error('Token non valide');
            }
        })
        .then(data => {
            works = data;  
            displayGallery(works);  
            // Bouton Modifier
            const modifyIcon = document.createElement('i');
            modifyIcon.classList.add('fa-regular', 'fa-pen-to-square');
            modifyIcon.style.cursor = 'pointer';
            const modifyText = document.createElement('span');
            modifyText.textContent = 'Modifier';
            modifyText.style.marginLeft = '10px';
            modifyText.style.cursor = 'pointer';

            const modifyContainer = document.createElement('div');
            modifyContainer.classList.add('modifier');
            modifyContainer.style.display = 'flex';
            modifyContainer.style.alignItems = 'center';
            modifyContainer.appendChild(modifyIcon);
            modifyContainer.appendChild(modifyText);

            galleryContainer.parentElement.insertBefore(modifyContainer, galleryContainer);

            // Ouverture 1ère modale sur modifier
            modifyContainer.addEventListener('click', function() {
                openModal();
            });
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            document.querySelector('.edit').classList.add('hide-edit');
            filtersContainer.style.display = 'flex';
            header.classList.remove('header-margin');
            header.classList.add('no-margin-top');
        });
    } else {
        document.querySelector('.edit').classList.add('hide-edit');
        filtersContainer.style.display = 'flex';
        header.classList.remove('header-margin');
        header.classList.add('no-margin-top');
    }
}

// Ouverture première modale
function openModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const ouverture = document.getElementById('modifyContainer')

    if (modal && overlay) {
        modal.classList.add('show');
        overlay.style.display = 'block';

        // Ajout photos à la galerie de la modale
        const modalGallery = document.querySelector('.modal-gallery');
        if (modalGallery) {
            modalGallery.innerHTML = ''; 

            works.forEach(work => {
                const photoContainer = document.createElement('div');
                photoContainer.classList.add('photo-container');
                photoContainer.dataset.id = work.id; // Stocker l'ID de la photo

                const img = document.createElement('img');
                img.src = work.imageUrl;
                img.alt = work.title;

                const trashIcon = document.createElement('span');
                trashIcon.classList.add('trash-icon');
                trashIcon.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

                trashIcon.addEventListener('click', function (event) {
                    event.preventDefault();
                    deletePhoto(work.id, photoContainer, event);
                });

                // Ajouter l'image et l'icône de suppression au conteneur
                photoContainer.appendChild(img);
                photoContainer.appendChild(trashIcon);
                modalGallery.appendChild(photoContainer);
            });
        }
    }
}




// Fermeture 1ère modale
function closeModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');

    if (modal && overlay) {
        modal.classList.remove('show');
        overlay.style.display = 'none';
    }
}


function closeModalOverlay(event) {
    const overlay = document.getElementById('modal-overlay');

    // Vérifie que le clic sur l'overlay
    if (event.target === overlay) {
        closeModal();
    }
}

// Ouverture 2ème modale 
function openAddPhotoModal() {
    closeModal(); 

    const addPhotoModal = document.getElementById('modal-add-photo');
    const overlay = document.getElementById('modal-overlay');

    if (addPhotoModal && overlay) {
        addPhotoModal.classList.add('show');
        overlay.style.display = 'block';
    }
}

// Fermeture 2ème modale
function closeAddPhotoModal() {
    const addPhotoModal = document.getElementById('modal-add-photo');
    const overlay = document.getElementById('modal-overlay');

    if (addPhotoModal && overlay) {
        addPhotoModal.classList.remove('show');
        overlay.style.display = 'none';
    }
}


function closePhotoModalOverlay(event) {
    const overlay = document.getElementById('modal-overlay');

    if (event.target === overlay) {
        closeAddPhotoModal();
    }
}


function deletePhoto(photoId, photoContainer, event) {
    event.preventDefault();

    if (!photoContainer) {
        console.error('photoContainer est undefined');
        return; 
    }

    fetch(`http://localhost:5678/api/works/${photoId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Photo supprimée avec succès');

            photoContainer.remove();
            
            works = works.filter(work => work.id !== photoId); 

            const photoInGallery = document.querySelector(`.gallery .photo[data-id='${photoId}']`);
            if (photoInGallery) {
                photoInGallery.remove();
            }

            getData();

        } else {
            console.error('Erreur lors de la suppression de la photo');
            return response.text().then(errorText => {
                console.error('Détails de l\'erreur:', errorText);
            });
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression de la photo:', error);
    });
}






// Gestion des événements après le chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    // appel fct pour charger les donées
    getData();
    getCategories();
    displayEdition(); 

    // Gestion des événements pour la première modale
    const modalTrigger = document.querySelector('.js-modal-trigger');
    const modalClose = document.querySelector('.js-modal-close');
    const addPhotoTrigger = document.getElementById('open-add-photo-modal');
    const modalAddClose = document.querySelector('.js-modal-close-add');
    

    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    } else {
        console.error('Bouton pour fermer la première modale introuvable');
    }

    // Gestion des événements pour la deuxième modale (Ajouter une photo)
    if (addPhotoTrigger) {
        addPhotoTrigger.addEventListener('click', openAddPhotoModal);
    } else {
        console.error('Bouton pour ouvrir la modale d\'ajout de photo introuvable');
    }

    if (modalAddClose) {
        modalAddClose.addEventListener('click', closeAddPhotoModal);
    } else {
        console.error('Bouton pour fermer la modale d\'ajout de photo introuvable');
    }

    // Mettre à jour le lien d'authentification (login/logout)
    lienAutorisation();
});


// Retour 1ere modale
function backToGallery() {
    closeAddPhotoModal();
    openModal(); 
}

// Gestion des événements
document.getElementById('open-add-photo-modal').addEventListener('click', openAddPhotoModal);
document.querySelector('.js-modal-close').addEventListener('click', closeModal);
document.querySelector('.js-modal-close-add').addEventListener('click', closeAddPhotoModal);
document.querySelector('.js-modal-back').addEventListener('click', backToGallery);




document.getElementById('photo-upload').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Récupère fichier 
    const reader = new FileReader(); // lire fichier
  
    reader.onload = function(e) {
        const imgPreview = document.createElement('img');
        imgPreview.src = e.target.result;
        imgPreview.style.width = '126px'; 
        imgPreview.style.height = 'auto';

        
  
        // Insère l'image dans la modale
        const previewContainer = document.querySelector('.flexCentre');
        previewContainer.appendChild(imgPreview);
        
        // Masquer
        document.querySelector('.iconeColor').style.display = 'none'; 
        document.querySelector('label[for="photo-upload"]').style.display = 'none'; 
        document.querySelector('.size').style.display = 'none'; 
        document.querySelector('.backgroundModale').style.padding = '0';

        const modalBackground = document.querySelector('.backgroundModale');
        modalBackground.style.height = '170px'; 


           const submitButton = document.querySelector('.bordureFiltres2');
           submitButton.style.backgroundColor = '#1D6154';
           submitButton.style.border = '1px solid #1D6154';
    }
  
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        reader.readAsDataURL(file); // Lis l'image comme URL de données
    } else {
        alert('Veuillez sélectionner un fichier image valide (JPEG ou PNG)');
    }
});


// Ajouter l'événement au chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('modal-overlay');

    if (overlay) {
        overlay.addEventListener('click', closeModalOverlay);
    }
});


// Gestionnaire de clic pour fermer la deuxième modale en cliquant sur l'overlay
function closePhotoModalOverlay(event) {
    const addPhotoModal = document.getElementById('modal-add-photo');
    const overlay = document.getElementById('modal-overlay');

    
    if (event.target === overlay) {
        closeAddPhotoModal();
    }
}

// Ajouter l'événement pour la deuxième modale également
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('modal-overlay');

    if (overlay) {
        overlay.addEventListener('click', closePhotoModalOverlay);
    }
});


// Gestion des événements après le chargement de la page
document.addEventListener('DOMContentLoaded', function () {

    
    // Ajouter un gestionnaire d'événement pour le formulaire d'ajout de photo
    document.getElementById('add-photo-form').addEventListener('submit', function(event) {
        const title = document.getElementById('photo-title').value.trim(); 
        const category = document.getElementById('photo-category').value; 

        if (!title || category === "") {
            event.preventDefault(); 
            alert("Veuillez remplir tous les champs obligatoires : titre et catégorie."); 
        }
    });
});


function ajoutProjet() {
    const form = document.getElementById('add-photo-form');
    console.log('Form trouvé:', form);

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();  

            const titleInput = document.getElementById('photo-title');
            const categoryInput = document.getElementById('photo-category');
            const imageInput = document.getElementById('photo-upload');

            if (!titleInput || !categoryInput || !imageInput) {
                alert("Erreur interne : Un des champs du formulaire n'a pas été trouvé.");
                return;
            }

            const title = titleInput.value.trim();
            const category = parseInt(categoryInput.value, 10);
            const imageFile = imageInput.files ? imageInput.files[0] : null;

            if (!title || isNaN(category) || !imageFile) {
                alert("Veuillez remplir tous les champs et sélectionner une image.");
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('image', imageFile);

            fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Projet ajouté avec succès :', data);
                getData();  // Rechargement des projets après ajout

                form.reset();

                const previewImage = document.querySelector('.flexCentre img');
                if (previewImage) {
                    previewImage.remove();  
                }

                // Réafficher les autres éléments cachés
                const iconColor = document.querySelector('.iconeColor');
                const labelPhotoUpload = document.querySelector('label[for="photo-upload"]');
                const sizeText = document.querySelector('.size');
                const modalBackground = document.querySelector('.backgroundModale');

                if (iconColor) {
                    iconColor.style.display = 'block';
                }
                if (labelPhotoUpload) {
                    labelPhotoUpload.style.display = 'block';
                }
                if (sizeText) {
                    sizeText.style.display = 'block';
                }
                if (modalBackground) {
                    modalBackground.style.padding = '20px';
                    modalBackground.style.height = '170px';
                }

                const submitButton = document.querySelector('.bordureFiltres2');
                if (submitButton) {
                    submitButton.style.backgroundColor = '';
                    submitButton.style.border = '';
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout du projet :', error);
                alert('Erreur lors de l\'ajout du projet.');
            });
        });
    } else {
        console.error('Formulaire introuvable.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    ajoutProjet();
});
