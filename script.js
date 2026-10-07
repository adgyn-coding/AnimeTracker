document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const animeForm = document.getElementById('add-anime-form');
    const statusSelect = document.getElementById('status');
    const watchingDetailsDiv = document.getElementById('watching-details');
    const finishedDetailsDiv = document.getElementById('finished-details');

    const toWatchListUl = document.getElementById('to-watch-list');
    const watchingListUl = document.getElementById('watching-list');
    const finishedListUl = document.getElementById('finished-list');

    // --- Application State ---
    let animes = []; // This array will hold all our anime objects
    const STORAGE_KEY = 'animeTrackerList'; // Key for localStorage

    // --- Functions ---

    /**
     * Loads animes from localStorage.
     */
    function loadAnimes() {
        const storedAnimes = localStorage.getItem(STORAGE_KEY);
        if (storedAnimes) {
            animes = JSON.parse(storedAnimes);
        } else {
            animes = []; // Initialize with an empty array if nothing is stored
        }
    }

    /**
     * Saves the current animes array to localStorage.
     */
    function saveAnimes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(animes));
    }

    /**
     * Shows or hides specific form fields based on the selected status.
     */
    function toggleDetailFields() {
        const selectedStatus = statusSelect.value;

        if (selectedStatus === 'watching') {
            watchingDetailsDiv.style.display = 'block';
            finishedDetailsDiv.style.display = 'none';
        } else if (selectedStatus === 'finished') {
            watchingDetailsDiv.style.display = 'none';
            finishedDetailsDiv.style.display = 'block';
        } else { // 'to-watch' or any other case
            watchingDetailsDiv.style.display = 'none';
            finishedDetailsDiv.style.display = 'none';
        }
    }

    /**
     * Handles the deletion of an anime.
     */
    function handleDeleteAnime(event) {
        const animeId = parseInt(event.target.closest('li').getAttribute('data-id'));
        animes = animes.filter(anime => anime.id !== animeId);
        saveAnimes();
        renderAnimes();
    }

    /**
     * Renders the animes to their respective lists in the DOM.
     */
    function renderAnimes() {
        // Clear existing lists
        toWatchListUl.innerHTML = '';
        watchingListUl.innerHTML = '';
        finishedListUl.innerHTML = '';

        if (animes.length === 0) {
            // Optionnel: Afficher un message si les listes sont vides
            // toWatchListUl.innerHTML = "<li>Aucun anime à regarder pour le moment.</li>";
            // watchingListUl.innerHTML = "<li>Aucun anime en cours.</li>";
            // finishedListUl.innerHTML = "<li>Aucun anime terminé.</li>";
        }

        animes.forEach(anime => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', anime.id); 
            
            listItem.innerHTML = `
                <h3>${anime.title}</h3>
                <p>Statut: ${getReadableStatus(anime.status)}</p>
                ${anime.status === 'watching' && anime.currentEpisode ? `<p>Progression: ${anime.currentEpisode}${anime.currentMinute ? ` (${anime.currentMinute})` : ''}</p>` : ''}
                ${anime.status === 'finished' && anime.watchedSeasons ? `<p>Saisons vues: ${anime.watchedSeasons}</p>` : ''}
                ${anime.status === 'finished' && anime.rating !== null && anime.rating !== undefined ? `<p>Note: ${anime.rating}/10</p>` : ''}
                <div class="actions">,j
                    <button class="delete-btn">Supprimer</button>
                </div>
            `;

            // Ajouter les écouteurs d'événements
            listItem.querySelector('.delete-btn').addEventListener('click', handleDeleteAnime);

            if (anime.status === 'to-watch') {
                toWatchListUl.appendChild(listItem);
            } else if (anime.status === 'watching') {
                watchingListUl.appendChild(listItem);
            } else if (anime.status === 'finished') {
                finishedListUl.appendChild(listItem);
            }
        });
    }
    
    /**
     * Helper function to get a more readable status string.
     */
    function getReadableStatus(statusValue) {
        switch(statusValue) {
            case 'to-watch': return 'À Regarder';
            case 'watching': return 'En Cours';
            case 'finished': return 'Terminé';
            default: return 'Inconnu';
        }
    }

    /**
     * Handles the submission of the add anime form.
     */
    function handleAddAnime(event) {
        event.preventDefault(); 

        const title = document.getElementById('title').value.trim();
        const status = statusSelect.value;
        
        if (!title) {
            alert("Le titre de l'anime est requis !");
            return;
        }

        const newAnime = {
            id: Date.now(), 
            title: title,
            status: status,
        };

        if (status === 'watching') {
            newAnime.currentEpisode = document.getElementById('current-episode').value.trim() || "";
            newAnime.currentMinute = document.getElementById('current-minute').value.trim() || "";
        } else if (status === 'finished') {
            newAnime.watchedSeasons = document.getElementById('watched-seasons').value.trim() || "";
            const ratingInput = document.getElementById('rating').value;
            newAnime.rating = ratingInput ? parseInt(ratingInput) : null;
        }
        
        animes.push(newAnime); 
        saveAnimes();
        renderAnimes(); 

        animeForm.reset(); 
        toggleDetailFields(); 
    }

    // --- Event Listeners ---
    statusSelect.addEventListener('change', toggleDetailFields);
    animeForm.addEventListener('submit', handleAddAnime);

    // --- Initial Setup ---
    loadAnimes();
    toggleDetailFields();
    renderAnimes();
});