document.addEventListener('DOMContentLoaded', () => {
    shuffleCollaborations();  // Call the shuffle function when the page loads
    filterCollaborations();   // Apply any filtering
});

function filterCollaborations() {
    const searchInput = document.getElementById('searchBar').value.toLowerCase();
    const collabItems = document.querySelectorAll('.collab-item');

    collabItems.forEach(item => {
        const collabTitle = item.querySelector('h1').textContent.toLowerCase();
        const itemStatus = item.getAttribute('data-status');
        const itemPriority = item.getAttribute('data-priority');  // New priority check
        const itemGenre = item.getAttribute('data-genre');

        const statusMatch = (currentStatusFilter === 'all' || itemStatus === currentStatusFilter || itemPriority === 'true');
        const genreMatch = (currentGenreFilter === 'all' || itemGenre === currentGenreFilter);

        if (collabTitle.includes(searchInput) && statusMatch && genreMatch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterByTag(tag, type) {
    if (type === 'status') {
        currentStatusFilter = tag;
    } else if (type === 'genre') {
        currentGenreFilter = tag;
    }

    filterCollaborations();
    updateActiveFilters();
}

function updateActiveFilters() {
    const statusFilters = document.getElementById('status-filters');
    const genreFilters = document.getElementById('genre-filters');

    statusFilters.textContent = currentStatusFilter === 'all' ? 'None' : capitalizeFirstLetter(currentStatusFilter);
    genreFilters.textContent = currentGenreFilter === 'all' ? 'None' : capitalizeFirstLetter(currentGenreFilter);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Shuffle function to randomize the order of collaboration items
function shuffleCollaborations() {
    const collabList = document.querySelector('.collab-list');
    const collabItems = Array.from(collabList.children);  // Convert the NodeList to an array

    // Shuffle array using Fisher-Yates algorithm
    for (let i = collabItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [collabItems[i], collabItems[j]] = [collabItems[j], collabItems[i]];
    }

    // Clear the current order and append shuffled items
    collabList.innerHTML = '';
    collabItems.forEach(item => collabList.appendChild(item));
}
