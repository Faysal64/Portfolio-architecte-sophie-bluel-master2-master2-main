let works = []; 
let activeFilter = null;

// Récupération travaux
async function getData() {
  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    works = await response.json(); 
    console.log(works);
    displayAllWorks();
  } catch (error) {
    console.error(error.message);
  }
}

// Affichage travaux
function displayAllWorks() {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ''; 
  works.forEach(work => displayProject(work));
}

// Création projet
function displayProject(data) {
  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = data.imageUrl;
  img.alt = data.title;

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = data.title;

  figure.appendChild(img);
  figure.appendChild(figcaption);

  document.querySelector(".gallery").appendChild(figure);
}

/* Filtres */

// Récupération catégorie
 async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const categories = await response.json();
    console.log(categories);
    displayCategories(categories);
  } catch (error) {
    console.error(error.message);
  }
}

// Affichage filtres
function displayCategories(categories) {
  const container = document.querySelector(".displayFiltres");

  const allDiv = document.createElement("div");
  allDiv.textContent = "Tous";
  allDiv.classList.add("bordureFiltres");
  container.appendChild(allDiv);

  allDiv.addEventListener('click', function() {
    displayAllWorks(); 
    filtreActif(allDiv);
  });

  // Autres catégories
  categories.forEach(category => {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.classList.add("bordureFiltres");
    container.appendChild(div);

    div.addEventListener('click', function() {
      const tableauxFiltres = works.filter(work => work.categoryId === category.id);//vérifie si catégorie d'un des travaux works est = à la catégorie d'un des travaux cliqué
      const gallery = document.querySelector(".gallery");
      gallery.innerHTML = ''; 
      tableauxFiltres.forEach(work => displayProject(work)); // Affichage travaux
      filtreActif(div); // Mettre à jour le filtre actif
    });
  });


  filtreActif(allDiv);
}

// Fonction pour gérer le changement de filtre actif
function filtreActif(filterElement) {
  if (activeFilter) {
    activeFilter.classList.remove("active-filter");
    activeFilter.style.backgroundColor = "";
    activeFilter.style.color = ""; 
  }

  filterElement.classList.add("active-filter");
  filterElement.style.backgroundColor = "#1D6154";
  filterElement.style.color = "#ffffff";
  activeFilter = filterElement;
}

  
// Fonction pour mettre à jour le lien d'authentification
function lienAutorisation() {
  const authLink = document.querySelector('#authLink');
  const token = localStorage.getItem('token');

  if (authLink) {
      if (token) {
          authLink.textContent = 'logout';
          authLink.removeAttribute('href');
          authLink.addEventListener('click', function () {
              localStorage.removeItem('token');
              window.location.href = 'index.html';
          });
      } else {
          authLink.textContent = 'login';
          authLink.setAttribute('href', 'authentification.html');
      } 
  } else {
      console.error('Lien d\'authentification introuvable');
  }
}



